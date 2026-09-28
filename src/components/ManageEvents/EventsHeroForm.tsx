import React, { useState, useEffect } from 'react';
import type { EventsHeroData } from '@/types/events';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import { MAX_VIDEO_SIZE_MB } from '@/constants/upload';

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
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.title?.trim()) {
      setValidationError('Hero title is required.');
      return;
    }

    setValidationError(null);
    onSave({
      ...formData,
      bgMediaType: formData.videoUrl ? 'video' : 'image',
    });
  };

  const hasVideo = Boolean(formData.videoUrl?.trim());

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Hero & Landing Banner</h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure the main banner title, background photo, and optional video for the {pageLabel} page.
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

        {/* Media Inputs (Image + Optional Video) */}
        <div className="space-y-4 pt-2">
          {/* Background Image (Photo / Fallback Poster) */}
          <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-5">
            <ImageInputWithUpload
              label="Hero Background Photo (Initial / Fallback Poster)"
              hint="16:9 • Rec: 1920×1080 or 2560×1440 px • WebP/JPG/PNG"
              value={formData.bgMediaUrl || ''}
              onChange={(url) => setFormData({ ...formData, bgMediaUrl: url })}
              placeholder="Paste photo URL or click upload"
              accept="image/*"
              aspectRatio="16:9"
              previewWidth="w-full max-w-xl"
              inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              Displays immediately as the initial poster while the video loads, and serves as the fallback on mobile low-power mode or slow connections.
            </p>
          </div>

          {/* Background Video (Optional) */}
          <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300 font-medium">Hero Background Video (Optional)</span>
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
              previewWidth="w-full max-w-xl"
              buttonText="Upload Video"
              inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              Autoplays in a loop behind the hero section with the background photo as poster fallback. Leave empty to use only the background photo.
            </p>
          </div>
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
