import React, { useState, useEffect } from 'react';
import { ImageInputWithUpload } from '@/components/common/ImageInputWithUpload';
import Toggle from '@/components/common/Toggle';
import StarIcon from '@/assets/icons/StarIcon';
import type { Review, ReviewPayload } from '@/hooks/useReviews';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: Review | null;
  onSave: (payload: ReviewPayload) => Promise<void>;
  isSaving?: boolean;
}

const COMMON_ACTIVITIES = [
  'Axe Throwing',
  'Augmented Darts',
  'Beer Pong',
  'American Pool',
  'Shuffleboard',
  'Karaoke',
  'Crazier Golf',
  'Arcade',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  review,
  onSave,
  isSaving = false,
}) => {
  const isEdit = !!review;

  const [customerName, setCustomerName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [activity, setActivity] = useState('');
  const [lane, setLane] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (review) {
      setCustomerName(review.customerName || '');
      setAvatarUrl(review.avatarUrl || '');
      setRating(review.rating ?? 5);
      setActivity(review.activity || '');
      setLane(review.lane || '');
      setReviewText(review.review || '');
      
      // format date to YYYY-MM-DD for date input
      if (review.reviewDate) {
        try {
          const d = new Date(review.reviewDate);
          if (!isNaN(d.getTime())) {
            setReviewDate(d.toISOString().split('T')[0]);
          } else {
            setReviewDate(review.reviewDate);
          }
        } catch {
          setReviewDate(review.reviewDate);
        }
      } else {
        setReviewDate(new Date().toISOString().split('T')[0]);
      }

      setIsFeatured(review.isFeatured ?? false);
      setIsActive(review.isActive ?? true);
    } else {
      setCustomerName('');
      setAvatarUrl('');
      setRating(5);
      setActivity('');
      setLane('');
      setReviewText('');
      setReviewDate(new Date().toISOString().split('T')[0]);
      setIsFeatured(false);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [review, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Customer name is required');
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg('Review text is required');
      return;
    }

    try {
      setErrorMsg(null);
      await onSave({
        customerName: customerName.trim(),
        avatarUrl: avatarUrl.trim(),
        rating: Number(rating) || 5,
        activity: activity.trim(),
        lane: lane.trim(),
        review: reviewText.trim(),
        reviewDate: reviewDate || new Date().toISOString().split('T')[0],
        isFeatured,
        isActive,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save review:', err);
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to save review');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="bg-[#1A1A1A] border border-[#3A3530] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <div>
            <h2 className="text-xl font-bold font-poppins text-white">
              {isEdit ? 'Edit Review' : 'Create New Review'}
            </h2>
            <p className="text-xs text-gray-400 font-montserrat mt-0.5">
              Fill in the customer review details below.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-[#2A2A2A] transition"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {/* Customer Name & Review Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 font-poppins mb-1.5">
                Customer Name <span className="text-[#E1017D]">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Smith"
                required
                className="w-full bg-[#262626] border border-[#3A3530] focus:border-[#E1017D] text-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 font-poppins mb-1.5">
                Review Date
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full bg-[#262626] border border-[#3A3530] focus:border-[#E1017D] text-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Avatar Upload / URL */}
          <div>
            <ImageInputWithUpload
              label="Avatar Image"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="/uploads/customer.jpg or image URL"
              hint="Upload avatar or paste URL"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 font-poppins mb-1.5">
              Rating (1.0 - 5.0) <span className="text-[#E1017D]">*</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-[#262626] border border-[#3A3530] px-3 py-2 rounded-lg">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <StarIcon color={starVal <= rating ? '#BFB00D' : '#555555'} />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value) || 1)}
                  className="w-20 bg-[#262626] border border-[#3A3530] focus:border-[#E1017D] text-white rounded-lg px-3 py-2 text-sm text-center outline-none font-bold"
                />
                <span className="text-gray-400 text-xs">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Activity & Lane */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 font-poppins mb-1.5">
                Activity / Game
              </label>
              <input
                type="text"
                list="activity-suggestions"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="e.g. Axe Throwing"
                className="w-full bg-[#262626] border border-[#3A3530] focus:border-[#E1017D] text-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition"
              />
              <datalist id="activity-suggestions">
                {COMMON_ACTIVITIES.map((act) => (
                  <option key={act} value={act} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 font-poppins mb-1.5">
                Lane / Area
              </label>
              <input
                type="text"
                value={lane}
                onChange={(e) => setLane(e.target.value)}
                placeholder="e.g. Lane 2"
                className="w-full bg-[#262626] border border-[#3A3530] focus:border-[#E1017D] text-white rounded-lg px-3.5 py-2.5 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Review Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 font-poppins mb-1.5">
              Review Content <span className="text-[#E1017D]">*</span>
            </label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write the customer's experience here..."
              required
              className="w-full bg-[#262626] border border-[#3A3530] focus:border-[#E1017D] text-white rounded-lg p-3 text-sm outline-none resize-none transition"
            />
          </div>

          {/* Toggles: isFeatured & isActive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#222222] border border-[#333] rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium font-poppins text-white block">Featured Review</span>
                <span className="text-xs text-gray-400">Display prominently on the website</span>
              </div>
              <Toggle checked={isFeatured} onChange={setIsFeatured} />
            </div>

            <div className="flex items-center justify-between sm:border-l sm:border-[#333] sm:pl-4">
              <div>
                <span className="text-sm font-medium font-poppins text-white block">Active Status</span>
                <span className="text-xs text-gray-400">Visible to customers</span>
              </div>
              <Toggle checked={isActive} onChange={setIsActive} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#333]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#2A2A2A] hover:bg-[#333] text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#E1017D] hover:bg-[#B71778] text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E1017D]/20 disabled:opacity-50"
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
              )}
              {isSaving ? 'Saving...' : isEdit ? 'Update Review' : 'Create Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
