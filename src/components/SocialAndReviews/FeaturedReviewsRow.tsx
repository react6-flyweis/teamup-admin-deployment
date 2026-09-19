import React from 'react';
import StarIcon from '@/assets/icons/StarIcon';
import EditIcon from '@/assets/icons/EditIcon';
import TrashIcon from '@/assets/icons/TrashIcon';
import type { Review } from '@/hooks/useReviews';

interface FeaturedReviewsRowProps {
  reviews: Review[];
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
  onToggleFeatured: (review: Review) => void;
}

export const FeaturedReviewsRow: React.FC<FeaturedReviewsRowProps> = ({
  reviews,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const featuredReviews = reviews.filter((r) => r.isFeatured);

  if (featuredReviews.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#E1017D] animate-pulse" />
          <h2 className="text-xl font-bold font-poppins text-white">
            Featured Reviews
          </h2>
          <span className="text-xs bg-[#E1017D]/20 text-[#E1017D] border border-[#E1017D]/30 px-2.5 py-0.5 rounded-full font-semibold">
            {featuredReviews.length} Featured
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {featuredReviews.map((review, idx) => {
          const rowId = review._id || review.id || idx.toString();
          return (
            <div
              key={rowId}
              className="flex flex-col justify-between bg-[#F9D2EA] rounded-[16px] p-5 border border-[#E9A7CE] shadow-md hover:shadow-xl transition-all duration-200 group relative"
            >
              {/* Header: Avatar, Name, Rating & Action buttons */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={review.avatarUrl || 'https://randomuser.me/api/portraits/men/32.jpg'}
                      alt={review.customerName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://randomuser.me/api/portraits/men/32.jpg';
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-poppins font-bold text-[15px] text-black leading-snug truncate">
                        {review.customerName}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: Math.min(5, Math.max(1, Math.round(review.rating))) }).map((_, i) => (
                          <StarIcon key={i} color="#BFB00D" />
                        ))}
                        <span className="text-xs font-bold text-gray-800 ml-1">
                          {review.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEdit(review)}
                      className="p-1.5 hover:bg-white/70 rounded-lg text-black transition cursor-pointer"
                      title="Edit Review"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(review)}
                      className="p-1.5 hover:bg-white/70 rounded-lg text-red-600 transition cursor-pointer"
                      title="Delete Review"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Activity & Lane Badge */}
                {(review.activity || review.lane) && (
                  <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                    {review.activity && (
                      <span className="px-2 py-0.5 bg-[#005066] text-white text-[11px] font-semibold rounded-md">
                        {review.activity}
                      </span>
                    )}
                    {review.lane && (
                      <span className="px-2 py-0.5 bg-black/10 text-gray-800 text-[11px] font-medium rounded-md">
                        {review.lane}
                      </span>
                    )}
                  </div>
                )}

                {/* Review message */}
                <p className="font-poppins text-[13.5px] text-gray-900 leading-relaxed italic line-clamp-3 mb-3">
                  &quot;{review.review}&quot;
                </p>
              </div>

              {/* Bottom Row: Date & Unfeature action */}
              <div className="flex items-center justify-between pt-3 border-t border-black/10 text-xs">
                <span className="text-gray-600 font-medium">
                  {review.reviewDate
                    ? new Date(review.reviewDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '-'}
                </span>

                <button
                  type="button"
                  onClick={() => onToggleFeatured(review)}
                  className="px-2 py-0.5 bg-white/80 hover:bg-white text-[#E1017D] hover:text-[#B71778] rounded-md font-semibold text-[11px] transition shadow-xs cursor-pointer"
                  title="Remove from featured"
                >
                  ★ Featured
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedReviewsRow;
