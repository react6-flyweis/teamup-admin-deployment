import React, { useState, useMemo } from 'react';
import StarIcon from '@/assets/icons/StarIcon';
import SearchIcon from '@/assets/icons/SearchIcon';
import EditIcon from '@/assets/icons/EditIcon';
import TrashIcon from '@/assets/icons/TrashIcon';
import Pagination from '@/utils/Pagination';
import Toggle from '@/components/common/Toggle';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal';
import ReviewModal from './ReviewModal';
import FeaturedReviewsRow from './FeaturedReviewsRow';
import {
  useReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  type Review,
  type ReviewPayload,
} from '@/hooks/useReviews';

const ROWS_PER_PAGE = 8;

export const ReviewsTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);

  // Notifications state
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useReviewsQuery();
  const createMutation = useCreateReviewMutation();
  const updateMutation = useUpdateReviewMutation();
  const deleteMutation = useDeleteReviewMutation();

  const reviewsList: Review[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.reviews)) return data.reviews;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data as any;
    return [];
  }, [data]);

  // Client-side filtering
  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      // Search
      if (searchInput.trim()) {
        const query = searchInput.toLowerCase().trim();
        const nameMatch = r.customerName?.toLowerCase().includes(query);
        const reviewMatch = r.review?.toLowerCase().includes(query);
        const actMatch = r.activity?.toLowerCase().includes(query);
        const laneMatch = r.lane?.toLowerCase().includes(query);
        if (!nameMatch && !reviewMatch && !actMatch && !laneMatch) return false;
      }

      // Rating filter
      if (filterRating !== 'all') {
        const targetRating = parseFloat(filterRating);
        if (Math.floor(r.rating) !== targetRating) return false;
      }

      // Featured filter
      if (filterFeatured === 'featured' && !r.isFeatured) return false;
      if (filterFeatured === 'not_featured' && r.isFeatured) return false;

      // Active filter
      if (filterActive === 'active' && !r.isActive) return false;
      if (filterActive === 'inactive' && r.isActive) return false;

      return true;
    });
  }, [reviewsList, searchInput, filterRating, filterFeatured, filterActive]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ROWS_PER_PAGE));
  const currentPageData = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredReviews.slice(start, start + ROWS_PER_PAGE);
  }, [filteredReviews, page]);

  const handleCreateOrUpdate = async (payload: ReviewPayload) => {
    try {
      if (editingReview) {
        const reviewId = (editingReview._id || editingReview.id)!;
        await updateMutation.mutateAsync({
          id: reviewId,
          payload,
        });
        setFeedback({ message: 'Review successfully updated!', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        setFeedback({ message: 'Review successfully created!', type: 'success' });
      }
      setIsModalOpen(false);
      setEditingReview(null);
    } catch (err: any) {
      console.error('Save error:', err);
      setFeedback({
        message: err?.response?.data?.message || err.message || 'Failed to save review.',
        type: 'error',
      });
      throw err;
    }
  };

  const handleToggleFeatured = async (review: Review) => {
    const id = review._id || review.id;
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { isFeatured: !review.isFeatured },
      });
      setFeedback({
        message: `Review ${!review.isFeatured ? 'marked as featured' : 'unfeatured'}!`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: 'Failed to update featured status.', type: 'error' });
    }
  };

  const handleToggleActive = async (review: Review) => {
    const id = review._id || review.id;
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { isActive: !review.isActive },
      });
      setFeedback({
        message: `Review status updated to ${!review.isActive ? 'Active' : 'Inactive'}!`,
        type: 'success',
      });
    } catch (err: any) {
      setFeedback({ message: 'Failed to update active status.', type: 'error' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReview) return;
    const id = deletingReview._id || deletingReview.id;
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      setFeedback({ message: 'Review deleted successfully!', type: 'success' });
      setDeletingReview(null);
    } catch (err: any) {
      setFeedback({
        message: err?.response?.data?.message || 'Failed to delete review.',
        type: 'error',
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="w-full space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex justify-between items-center transition-all ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-white ml-4 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Featured Reviews Cards Row */}
      <FeaturedReviewsRow
        reviews={reviewsList}
        onEdit={(review) => {
          setEditingReview(review);
          setIsModalOpen(true);
        }}
        onDelete={(review) => setDeletingReview(review)}
        onToggleFeatured={handleToggleFeatured}
      />

      {/* Top Controls: Search, Filters & Add Review */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-[#1A1A1A] border border-[#3A3530] p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer, review, activity..."
              className="w-full pl-9 pr-4 py-2 bg-[#262626] border border-[#3A3530] text-white text-sm rounded-lg outline-none focus:border-[#E1017D] transition placeholder:text-gray-500 font-montserrat"
            />
          </div>

          {/* Rating filter */}
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value);
              setPage(1);
            }}
            className="bg-[#262626] border border-[#3A3530] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#E1017D] transition cursor-pointer font-montserrat"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Featured filter */}
          <select
            value={filterFeatured}
            onChange={(e) => {
              setFilterFeatured(e.target.value);
              setPage(1);
            }}
            className="bg-[#262626] border border-[#3A3530] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#E1017D] transition cursor-pointer font-montserrat"
          >
            <option value="all">All Visibility</option>
            <option value="featured">Featured Only</option>
            <option value="not_featured">Non-Featured</option>
          </select>

          {/* Active filter */}
          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setPage(1);
            }}
            className="bg-[#262626] border border-[#3A3530] text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-[#E1017D] transition cursor-pointer font-montserrat"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 self-end lg:self-auto">
          <button
            onClick={() => refetch()}
            className="px-3.5 py-2 bg-[#262626] hover:bg-[#333] border border-[#3A3530] text-gray-300 rounded-lg text-sm font-poppins transition flex items-center gap-1.5 cursor-pointer"
            title="Refresh reviews"
          >
            <svg
              width="15"
              height="15"
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

          <button
            onClick={() => {
              setEditingReview(null);
              setIsModalOpen(true);
            }}
            className="px-5 py-2 bg-[#E1017D] hover:bg-[#B71778] text-white rounded-lg text-sm font-semibold font-poppins transition shadow-lg shadow-[#E1017D]/20 flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            Add Review
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-[10px] overflow-hidden shadow-lg border border-[#3A3530]/50 bg-[#1A1A1A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr className="bg-[#F9D2EA]">
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">Customer</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">Rating</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat min-w-[260px]">Review</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">Activity & Lane</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat">Date</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-center">Featured</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-center">Status</th>
                <th className="py-4 px-4 font-bold text-[14px] text-black font-montserrat text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="bg-[#FFFBFD]">
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-montserrat">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1017D]" />
                      <span>Loading reviews...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="bg-[#FFFBFD]">
                  <td colSpan={8} className="py-8 text-center text-red-500 font-montserrat">
                    Failed to load reviews. Check your server connection.
                  </td>
                </tr>
              ) : currentPageData.length === 0 ? (
                <tr className="bg-[#FFFBFD]">
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-montserrat">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-base font-semibold text-gray-700">No reviews found</span>
                      <span className="text-xs text-gray-400">
                        {searchInput ? 'Try adjusting your search criteria.' : 'Click "Add Review" to create one.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageData.map((row, idx) => {
                  const rowId = row._id || row.id || idx.toString();
                  return (
                    <tr
                      key={rowId}
                      className={`${
                        idx % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
                      } hover:bg-[#f3e2f6] transition-colors duration-150`}
                    >
                      {/* Customer Info */}
                      <td className="py-3.5 px-4 font-montserrat font-medium text-[14px] text-black">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                            alt={row.customerName}
                            className="w-9 h-9 rounded-full object-cover border border-[#E1017D]/20 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://randomuser.me/api/portraits/men/32.jpg';
                            }}
                          />
                          <span className="font-semibold text-gray-900">{row.customerName}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 font-montserrat font-medium text-[14px] text-black">
                        <div className="inline-flex items-center gap-1 bg-white/70 px-2.5 py-1 rounded-md border border-[#E9A7CE]/40">
                          <StarIcon color="#BFB00D" />
                          <span className="font-bold text-gray-900">{row.rating}</span>
                        </div>
                      </td>

                      {/* Review Text */}
                      <td className="py-3.5 px-4 font-montserrat text-[13.5px] text-gray-800">
                        <p className="line-clamp-2 max-w-md italic" title={row.review}>
                          &quot;{row.review}&quot;
                        </p>
                      </td>

                      {/* Activity & Lane */}
                      <td className="py-3.5 px-4 font-montserrat font-medium text-[13px] text-black">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{row.activity || '-'}</span>
                          <span className="text-xs text-gray-600 font-normal">{row.lane || '-'}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-montserrat text-[13px] text-gray-700 whitespace-nowrap">
                        {formatDate(row.reviewDate || row.createdAt)}
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(row)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                            row.isFeatured
                              ? 'bg-[#E1017D] text-white shadow-sm shadow-[#E1017D]/30 hover:bg-[#B71778]'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                          title="Click to toggle featured status"
                        >
                          {row.isFeatured ? '★ Featured' : '☆ Standard'}
                        </button>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center">
                          <Toggle
                            checked={!!row.isActive}
                            onChange={() => handleToggleActive(row)}
                          />
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingReview(row);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-gray-700 hover:text-[#E1017D] hover:bg-white rounded-lg transition cursor-pointer"
                            title="Edit Review"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingReview(row)}
                            className="p-1.5 text-gray-700 hover:text-red-600 hover:bg-white rounded-lg transition cursor-pointer"
                            title="Delete Review"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4 px-6 bg-[#1A1A1A] border-t border-[#3A3530]">
            <span className="text-xs text-gray-400 font-montserrat">
              Showing {(page - 1) * ROWS_PER_PAGE + 1} to{' '}
              {Math.min(page * ROWS_PER_PAGE, filteredReviews.length)} of {filteredReviews.length} reviews
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Review Create/Edit Modal */}
      {isModalOpen && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReview(null);
          }}
          review={editingReview}
          onSave={handleCreateOrUpdate}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingReview && (
        <ConfirmDeleteModal
          isOpen={!!deletingReview}
          title="Delete Review"
          message="Are you sure you want to delete this customer review? This action cannot be undone."
          itemName={deletingReview.customerName ? `${deletingReview.customerName}'s review` : undefined}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingReview(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </section>
  );
};

export default ReviewsTable;
