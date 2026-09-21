import React, { useState, useEffect, useRef } from 'react';
import type { InfoCardItem } from '@/types/events';
import { CloseIcon, UploadIcon } from '@/assets/icons';
import { uploadFile } from '@/utils/fileUpload';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        ...defaultCard,
        id: `info-card-${Date.now()}`,
        order: totalCardsCount + 1,
      });
    }
    setUploadError(null);
  }, [initialData, isOpen, totalCardsCount]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const isVideo = file.type.startsWith('video/');
      const uploadedUrl = await uploadFile(file);
      setFormData((prev) => ({
        ...prev,
        mediaUrl: uploadedUrl,
        mediaType: isVideo ? 'video' : 'image',
      }));
    } catch (err: unknown) {
      console.error('File upload failed:', err);
      const apiErr = err as { message?: string };
      setUploadError(apiErr?.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.title.trim()) return;
    onSave(formData);
    onClose();
  };

  const isVideoUrl = (url: string) => {
    return (
      formData.mediaType === 'video' ||
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)
    );
  };

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

          {/* Media Setup */}
          <div className="pt-2 border-t border-[#33302B] space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                Media (Image or Video)
              </label>
              <div className="flex items-center gap-2 bg-[#121212] p-1 rounded-lg border border-[#33302B]">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mediaType: 'image' })}
                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    formData.mediaType === 'image'
                      ? 'bg-[#E1017D] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mediaType: 'video' })}
                  className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    formData.mediaType === 'video'
                      ? 'bg-[#E1017D] text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                placeholder={
                  formData.mediaType === 'video'
                    ? 'Paste video URL or upload MP4/WebM'
                    : 'Paste image URL or upload JPEG/PNG/WebP'
                }
                className="flex-1 bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept={formData.mediaType === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#2A2A2A] hover:bg-[#333333] text-white px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#3A3530] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isUploading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                ) : (
                  <UploadIcon size={16} />
                )}
                <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>

            {uploadError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
                {uploadError}
              </p>
            )}

            {/* Media Preview */}
            {formData.mediaUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-[#3A3530] bg-black max-h-48 flex items-center justify-center">
                {isVideoUrl(formData.mediaUrl) ? (
                  <video
                    src={formData.mediaUrl}
                    controls
                    muted
                    className="max-h-48 w-full object-cover"
                  />
                ) : (
                  <img
                    src={formData.mediaUrl}
                    alt={formData.title || 'Preview'}
                    className="max-h-48 w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}
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
