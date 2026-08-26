import React, { useState, useDeferredValue } from 'react';
import { useEnquiriesQuery, type Enquiry } from '@/hooks/useEnquiries';
import { EnquiryDetailsModal } from '@/components/Enquiries/EnquiryDetailsModal';
import { NewsletterSubscriptionsTab } from '@/components/Enquiries/NewsletterSubscriptionsTab';
import Pagination from '@/utils/Pagination';
import SearchIcon from '@/assets/icons/SearchIcon';
import EyeIcon from '@/assets/icons/EyeIcon';
import EnquiriesIcon from '@/assets/icons/EnquiriesIcon';
import MailIcon from '@/assets/icons/MailIcon';

type EnquiryTab = 'contact' | 'newsletter';

const Enquiries: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EnquiryTab>('contact');

  // Contact enquiries state
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [searchInput, setSearchInput] = useState<string>('');
  const [sortBy] = useState<string>('createdAt');
  const [sortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Defer search input to prevent rapid refetches
  const deferredSearch = useDeferredValue(searchInput);

  // Fetch enquiries with search & pagination
  const { data, isLoading, isError, refetch } = useEnquiriesQuery({
    page,
    limit,
    search: deferredSearch.trim() ? deferredSearch.trim() : undefined,
    sortBy,
    sortOrder,
  });

  const enquiries = data?.enquiries || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const getStatusBadge = (s?: string) => {
    const st = (s || 'new').toLowerCase();
    if (st === 'new') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          New
        </span>
      );
    }
    if (st === 'in-progress' || st === 'in progress') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          In Progress
        </span>
      );
    }
    if (st === 'resolved' || st === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Resolved
        </span>
      );
    }
    if (st === 'archived') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
          Archived
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-800 border border-pink-200">
        {s || 'New'}
      </span>
    );
  };

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
          });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-white">
            Enquiries & Subscriptions
          </h1>
          <p className="text-sm font-montserrat text-gray-400 mt-1">
            Manage customer contact enquiries and newsletter subscriptions.
          </p>
        </div>

        {activeTab === 'contact' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-[#221D1E] hover:bg-[#2F292A] border border-[#3A3530] text-gray-200 rounded-lg text-sm font-poppins transition cursor-pointer"
              title="Refresh list"
            >
              <svg
                width="16"
                height="16"
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
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#3A3530] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-poppins font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-[#E1017D] text-white shadow-md shadow-[#E1017D]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#241F20]'
          }`}
        >
          <EnquiriesIcon size={18} className={activeTab === 'contact' ? 'text-white' : 'text-gray-400'} />
          <span>Contact Requests</span>
          {pagination.total > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'contact'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#2F292A] text-gray-400'
              }`}
            >
              {pagination.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('newsletter')}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-poppins font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'newsletter'
              ? 'bg-[#E1017D] text-white shadow-md shadow-[#E1017D]/20'
              : 'text-gray-400 hover:text-white hover:bg-[#241F20]'
          }`}
        >
          <MailIcon size={18} className={activeTab === 'newsletter' ? 'text-white' : 'text-gray-400'} />
          <span>Newsletter Subscriptions</span>
        </button>
      </div>

      {/* Tab 1: Contact Enquiries */}
      {activeTab === 'contact' && (
        <div className="space-y-6">
          {/* Search Form UI */}
          <div className="bg-[#1C1819] border border-[#3A3530] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone or message..."
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

            <div className="text-xs font-montserrat text-gray-400 self-end sm:self-center shrink-0">
              Total: <strong className="text-white">{pagination.total}</strong> enquiries
            </div>
          </div>

          {/* Enquiries Table */}
          <div className="rounded-[10px] shadow-lg overflow-x-auto">
            <table className="w-full text-center border-separate" style={{ borderSpacing: 0 }}>
              <thead>
                <tr className="bg-[#F9D2EA]">
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat rounded-tl-lg text-left">
                    Customer Name
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">
                    Enquiry Type
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-left">
                    Contact Info
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">
                    Location
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-left max-w-50">
                    Message
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">
                    Status
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">
                    Received Date
                  </th>
                  <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat rounded-tr-lg text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 font-montserrat bg-[#FFFBFD]">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E1017D]"></div>
                        <span className="text-black font-medium">Loading enquiries...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-red-500 font-montserrat bg-[#FFFBFD]">
                      Failed to load enquiries. Please check your connection and try again.
                    </td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-500 font-montserrat bg-[#FFFBFD]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <p className="text-black font-semibold text-base">No enquiries found</p>
                        <p className="text-gray-500 text-sm">
                          {searchInput ? 'Try searching with different keywords.' : 'No contact submissions yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  enquiries.map((item, idx) => {
                    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A';
                    return (
                      <tr
                        key={item._id}
                        onClick={() => setSelectedEnquiry(item)}
                        className={`${
                          idx % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
                        } hover:bg-[#f3e2f6] transition-all duration-200 ease-in-out cursor-pointer text-black`}
                      >
                        {/* Customer Name */}
                        <td className="py-4 px-4 font-montserrat font-semibold text-[14px] text-left">
                          <div>{fullName}</div>
                          {item.source && (
                            <div className="text-[11px] font-normal text-gray-500">{item.source}</div>
                          )}
                        </td>

                        {/* Enquiry Type */}
                        <td className="py-4 px-4 font-montserrat font-medium text-[13px]">
                          <span className="px-2.5 py-1 bg-white/70 rounded-md border border-[#E9A7CE] text-[#801853] font-semibold text-xs inline-block">
                            {item.enquiryType || 'General'}
                          </span>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-4 font-montserrat text-left text-[13px]">
                          <div className="font-medium text-black truncate max-w-45" title={item.email}>
                            {item.email || '-'}
                          </div>
                          <div className="text-xs text-gray-600">{item.phone || '-'}</div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-4 font-montserrat font-medium text-[13px]">
                          {item.location || '-'}
                        </td>

                        {/* Message Preview */}
                        <td className="py-4 px-4 font-montserrat text-left text-[13px] max-w-55">
                          <p className="truncate text-gray-800" title={item.message}>
                            {item.message || '-'}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 font-montserrat">{getStatusBadge(item.status)}</td>

                        {/* Received Date */}
                        <td className="py-4 px-4 font-montserrat font-medium text-[13px] text-gray-700 whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Action */}
                        <td
                          className="py-4 px-4 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEnquiry(item);
                          }}
                        >
                          <button
                            title="View Details"
                            className="w-8 h-8 rounded-md bg-white border border-[#E9A7CE] hover:border-[#E1017D] text-gray-700 hover:text-[#E1017D] inline-flex items-center justify-center transition cursor-pointer"
                          >
                            <EyeIcon size={16} />
                          </button>
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

          {/* Details & Reply Modal */}
          {selectedEnquiry && (
            <EnquiryDetailsModal
              enquiry={selectedEnquiry}
              isOpen={!!selectedEnquiry}
              onClose={() => setSelectedEnquiry(null)}
            />
          )}
        </div>
      )}

      {/* Tab 2: Newsletter Subscriptions */}
      {activeTab === 'newsletter' && <NewsletterSubscriptionsTab />}
    </div>
  );
};

export default Enquiries;
