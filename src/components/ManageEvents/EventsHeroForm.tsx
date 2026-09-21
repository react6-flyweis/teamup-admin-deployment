import React, { useState, useEffect, useRef } from 'react';
import type { EventsHeroData } from '@/types/events';
import { UploadIcon } from '@/assets/icons';
import { uploadFile } from '@/utils/fileUpload';

interface EventsHeroFormProps {
  initialData: EventsHeroData;
  onSave: (data: EventsHeroData) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
  pageLabel: string;
}

export const EventsHeroForm: React.FC<EventsHeroFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
  errorMessage,
  pageLabel,
}) => {
  const [formData, setFormData] = useState<EventsHeroData>(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

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
        bgMediaUrl: uploadedUrl,
        bgMediaType: isVideo ? 'video' : 'image',
      }));
    } catch (err: unknown) {
      console.error('File upload failed:', err);
      const apiErr = err as { message?: string };
      setUploadError(apiErr?.message || 'Failed to upload background file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isVideo =
    formData.bgMediaType === 'video' ||
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(formData.bgMediaUrl || '');

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.title?.trim()) {
      setValidationError('Hero title is required.');
      return;
    }

    setValidationError(null);
    onSave(formData);
  };

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Hero & Landing Banner</h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure the main banner title and background for the {pageLabel} page.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded bg-[#E1017D]/10 text-[#E1017D] border border-[#E1017D]/30 font-medium">
          Hero Section
        </span>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (validationError) setValidationError(null);
            }}
            placeholder="e.g. Unforgettable Social Celebrations"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors"
          />
          {validationError && (
            <p className="text-xs text-red-400 mt-1">{validationError}</p>
          )}
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Subtitle / Tagline <span className="text-xs text-gray-500">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g. The premier arena destination for groups, birthdays, and parties."
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>

        {/* Background Media */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Hero Background Media (Image or Video)
            </label>
            <div className="flex items-center gap-2 bg-[#121212] p-1 rounded-lg border border-[#33302B]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, bgMediaType: 'image' })}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  !isVideo
                    ? 'bg-[#E1017D] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Image
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, bgMediaType: 'video' })}
                className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  isVideo
                    ? 'bg-[#E1017D] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Video
              </button>
            </div>
          </div>

          {/* Dimension Hint */}
          <p className="text-xs text-gray-400 mb-2.5">
            {isVideo
              ? '16:9 • MP4/WebM'
              : '16:9 • Rec: 1920×1080 or 2560×1440 px • WebP/JPG/PNG'}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={formData.bgMediaUrl || ''}
              onChange={(e) => setFormData({ ...formData, bgMediaUrl: e.target.value })}
              placeholder={
                isVideo
                  ? 'Paste video URL or upload background video'
                  : 'Paste image URL or upload background image'
              }
              className="flex-1 bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept={isVideo ? 'video/*' : 'image/*'}
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
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg mt-2">
              {uploadError}
            </p>
          )}

          {/* Clean Media Preview Box (No Title / Subtitle Text Overlay) */}
          {formData.bgMediaUrl && (
            <div className="mt-3 relative rounded-xl overflow-hidden border border-[#3A3530] bg-black h-48 sm:h-64 flex items-center justify-center">
              {isVideo ? (
                <video
                  src={formData.bgMediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={formData.bgMediaUrl}
                  alt="Hero Background Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-black/70 text-white backdrop-blur-md border border-white/10">
                  {isVideo ? 'Video Preview' : 'Photo Preview'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          {isSaving ? 'Saving...' : 'Save Hero Settings'}
        </button>
      </div>
    </div>
  );
};

export default EventsHeroForm;
