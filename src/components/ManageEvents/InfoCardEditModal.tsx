import React, { useState, useEffect } from 'react';
import type { InfoCardItem } from '@/types/events';
import { CloseIcon } from '@/assets/icons';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import { MAX_VIDEO_SIZE_MB } from '@/constants/upload';

interface InfoCardEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: InfoCardItem) => void;
  initialData?: InfoCardItem | null;
  totalCardsCount?: number;
}

const defaultCard: InfoCardItem = {
  id: '',
  title: '',
  description: '',
  mediaUrl: '',
  videoUrl: '',
  mediaType: 'image',
  order: 1,
  isActive: true,
};

export const InfoCardEditModal: React.FC<InfoCardEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalCardsCount = 0,
}) => {
  const [formData, setFormData] = useState<InfoCardItem>(defaultCard);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        videoUrl: initialData.videoUrl || '',
      });
    } else {
      setFormData({
        ...defaultCard,
        id: `info-card-${Date.now()}`,
        order: totalCardsCount + 1,
      });
    }
  }, [initialData, isOpen, totalCardsCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      mediaType: formData.videoUrl ? 'video' : 'image',
    });
    onClose();
  };

  const hasVideo = Boolean(formData.videoUrl?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3A3530] flex items-center justify-between bg-[#171717] shrink-0">
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Info Card' : 'Add Info Card'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Info Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Immersive Battlegrounds / Full Venue Buyouts"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed explanation of this feature or highlight..."
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          {/* Media Setup (Image + Optional Video) */}
          <div className="pt-2 border-t border-[#33302B] space-y-4">
            {/* Card Image (Required / Fallback Poster) */}
            <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-4">
              <ImageInputWithUpload
                label="Card Image (Initial / Fallback Poster)"
                hint="16:9 • Rec: 800×450 or 1200×675 px • WebP/JPG/PNG"
                value={formData.mediaUrl || ''}
                onChange={(url) => setFormData({ ...formData, mediaUrl: url })}
                placeholder="Paste photo URL or click upload"
                accept="image/*"
                aspectRatio="16:9"
                previewWidth="w-full"
                inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Displays as the primary card image and serves as the poster / fallback when video is present.
              </p>
            </div>

            {/* Card Video (Optional) */}
            <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300 font-medium">Card Video (Optional)</span>
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, videoUrl: '' })}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors cursor-pointer"
                  >
                    Remove Video
                  </button>
                )}
              </div>
              <ImageInputWithUpload
                hint={`16:9 • MP4/WebM • Max ${MAX_VIDEO_SIZE_MB}MB`}
                value={formData.videoUrl || ''}
                onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                placeholder="Paste video URL or click upload"
                accept="video/*"
                aspectRatio="16:9"
                previewWidth="w-full"
                buttonText="Upload Video"
                inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-2">
                Plays inside or behind the card. Leave empty to use only the card photo.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#3A3530] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {initialData ? 'Update Card' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfoCardEditModal;
