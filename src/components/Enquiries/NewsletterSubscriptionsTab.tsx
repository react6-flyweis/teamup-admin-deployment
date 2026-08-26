import React, { useState, useDeferredValue } from 'react';
import { useNewsletterQuery, type NewsletterSubscription } from '@/hooks/useNewsletter';
import Pagination from '@/utils/Pagination';
import SearchIcon from '@/assets/icons/SearchIcon';
import MailIcon from '@/assets/icons/MailIcon';

export const NewsletterSubscriptionsTab: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');

  // Defer search input to prevent rapid refetches
  const deferredSearch = useDeferredValue(searchInput);

  // Fetch newsletter subscriptions
  const { data, isLoading, isError, refetch } = useNewsletterQuery({
    page,
    limit,
    search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
  });

  const subscriptions = data?.subscriptions || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime())
        ? dateString
        : d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
    } catch {
      return dateString;
    }
  };

  const handleExportCSV = () => {
    if (!subscriptions.length) return;
    const headers = ['Name', 'Email', 'Phone', 'Source', 'Opt-In', 'Subscribed At'];
    const rows = subscriptions.map((s) => [
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.source || ''}"`,
      s.optIn !== false ? 'Yes' : 'No',
      `"${formatDate(s.createdAt)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newsletter_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-[#1C1819] border border-[#3A3530] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search subscriber by name, email, or phone..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-10 py-2.5 bg-[#241F20] border border-[#3A3530] rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E1017D] transition"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={subscriptions.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#241F20] hover:bg-[#2e2728] border border-[#3A3530] text-gray-300 hover:text-white rounded-lg text-xs font-poppins transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Export to CSV"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#221D1E] hover:bg-[#2F292A] border border-[#3A3530] text-gray-200 rounded-lg text-xs font-poppins transition cursor-pointer"
            title="Refresh subscriptions"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isLoading ? 'animate-spin' : ''}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          <div className="text-xs font-montserrat text-gray-400 pl-2">
            Total: <strong className="text-white">{pagination.total}</strong> subscribers
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-[10px] shadow-lg overflow-x-auto">
        <table className="w-full text-center border-separate" style={{ borderSpacing: 0 }}>
          <thead>
            <tr className="bg-[#F9D2EA]">
              <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat rounded-tl-lg text-left">
                Subscriber Name
              </th>
              <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-left">
                Email Address
              </th>
              <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-left">
                Phone Number
              </th>
              <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">
                Source
              </th>
              <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">
                Opt-In Status
              </th>
              <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat rounded-tr-lg">
                Subscribed Date
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500 font-montserrat bg-[#FFFBFD]">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E1017D]"></div>
                    <span className="text-black font-medium">Loading newsletter subscriptions...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-red-500 font-montserrat bg-[#FFFBFD]">
                  Failed to load newsletter subscriptions. Please check your connection and try again.
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-500 font-montserrat bg-[#FFFBFD]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <MailIcon size={36} className="text-gray-400" />
                    <p className="text-black font-semibold text-base">No newsletter subscriptions found</p>
                    <p className="text-gray-500 text-sm">
                      {searchInput ? 'Try searching with different keywords.' : 'No users have subscribed to the newsletter yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              subscriptions.map((item: NewsletterSubscription, idx: number) => {
                const name = item.name?.trim() || 'Anonymous';
                const isOptedIn = item.optIn !== false;

                return (
                  <tr
                    key={item._id}
                    className={`${
                      idx % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
                    } hover:bg-[#f3e2f6] transition-all duration-200 ease-in-out text-black`}
                  >
                    {/* Subscriber Name */}
                    <td className="py-4 px-4 font-montserrat font-semibold text-[14px] text-left">
                      <div className="text-black">{name}</div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 font-montserrat text-left text-[13px]">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${item.email}`}
                          className="font-medium text-black hover:text-[#E1017D] transition truncate max-w-56"
                          title={item.email}
                        >
                          {item.email}
                        </a>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 font-montserrat text-left text-[13px]">
                      {item.phone ? (
                        <a
                          href={`tel:${item.phone}`}
                          className="text-gray-700 hover:text-[#E1017D] transition"
                        >
                          {item.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="py-4 px-4 font-montserrat font-medium text-[13px]">
                      <span className="px-2.5 py-1 bg-white/80 rounded-md border border-[#E9A7CE] text-[#801853] font-semibold text-xs inline-block capitalize">
                        {item.source || 'Website'}
                      </span>
                    </td>

                    {/* Opt-In Status */}
                    <td className="py-4 px-4 font-montserrat">
                      {isOptedIn ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Opted In
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
                          Opted Out
                        </span>
                      )}
                    </td>

                    {/* Subscribed Date */}
                    <td className="py-4 px-4 font-montserrat font-medium text-[13px] text-gray-700 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-end items-center pt-2">
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};
