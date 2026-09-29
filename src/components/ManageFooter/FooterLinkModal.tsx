import React, { useState } from 'react';
import { CloseIcon } from '@/assets/icons';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import TipTapEditor from '@/components/common/TipTapEditor';
import { MAX_VIDEO_SIZE_MB } from '@/constants/upload';

export interface FooterLinkModalSaveData {
  label: string;
  url: string;
  content: string;
  tagline: string;
  heroBgImage: string;
  heroVideo: string;
}

interface FooterLinkModalProps {
  initialLabel: string;
  initialUrl?: string;
  initialContent?: string;
  initialTagline?: string;
  initialHeroBgImage?: string;
  initialHeroVideo?: string;
  isAdding: boolean;
  onSave: (data: FooterLinkModalSaveData) => Promise<void>;
  onClose: () => void;
}

const FooterLinkModal: React.FC<FooterLinkModalProps> = ({ 
  initialLabel, 
  initialUrl = '', 
  initialContent = '', 
  initialTagline = '',
  initialHeroBgImage = '',
  initialHeroVideo = '',
  isAdding, 
  onSave, 
  onClose 
}) => {
  const [label, setLabel] = useState(initialLabel);
  const [url, setUrl] = useState(initialUrl);
  const [tagline, setTagline] = useState(initialTagline);
  const [heroBgImage, setHeroBgImage] = useState(initialHeroBgImage);
  const [heroVideo, setHeroVideo] = useState(initialHeroVideo);
  const [content, setContent] = useState(initialContent);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) {
      setErrorMsg('Page title / label is required');
      return;
    }

    const computedSlug = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const resolvedUrl = url.trim() || `/${computedSlug}`;

    setErrorMsg(null);
    setIsSaving(true);
    try {
      await onSave({
        label: label.trim(),
        url: resolvedUrl,
        content,
        tagline: tagline.trim(),
        heroBgImage: heroBgImage.trim(),
        heroVideo: heroVideo.trim(),
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message || error?.message || 'Failed to save. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#1C1C1C] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-[#3A3530] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#3A3530] bg-[#181818] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isAdding ? 'Add Footer Link / Page' : `Edit Page: ${initialLabel}`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Configure page details, hero visual media, and rich content.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer p-1.5 rounded-lg hover:bg-white/5"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[#161616]">
          {/* General Information */}
          <div className="bg-[#202020] border border-[#3A3530] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
              General Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1.5">
                  Page Title / Label <span className="text-[#E1017D]">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  disabled={isSaving}
                  className="w-full h-10 px-4 rounded-lg bg-[#141414] border border-[#3A3530] text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] disabled:opacity-50"
                  placeholder="e.g. ABOUT US"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1.5">
                  URL Slug / Path <span className="text-xs text-gray-500 font-normal">(auto-generated if empty)</span>
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isSaving}
                  className="w-full h-10 px-4 rounded-lg bg-[#141414] border border-[#3A3530] text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] disabled:opacity-50 text-sm font-mono"
                  placeholder={label ? `/${label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}` : '/page-slug'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 font-medium mb-1.5">
                Tagline / Subtitle <span className="text-xs text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                disabled={isSaving}
                className="w-full h-10 px-4 rounded-lg bg-[#141414] border border-[#3A3530] text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] disabled:opacity-50 text-sm"
                placeholder="e.g. Discover our story and passion for group entertainment"
              />
            </div>
          </div>

          {/* Hero Banner Media */}
          <div className="bg-[#202020] border border-[#3A3530] rounded-xl p-5 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                Hero Banner Media
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Configure the hero background photo and optional looping hero video for this page banner.
              </p>
            </div>

            {/* Hero Background Image */}
            <div className="bg-[#141414] border border-[#3A3530] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-200">
                  Hero Background Image
                </span>
                {heroBgImage && (
                  <button
                    type="button"
                    onClick={() => setHeroBgImage('')}
                    disabled={isSaving}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
              </div>
              <ImageInputWithUpload
                hint="16:9 • Rec: 1920×1080 px • WebP/JPG/PNG"
                value={heroBgImage}
                onChange={setHeroBgImage}
                placeholder="Paste background photo URL or click upload"
                accept="image/*"
                aspectRatio="16:9"
                previewWidth="w-full max-w-md"
                inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Displays as the main hero visual and poster fallback when video is loading or on mobile devices.
              </p>
            </div>

            {/* Hero Video */}
            <div className="bg-[#141414] border border-[#3A3530] rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-200">
                  Hero Video (Optional)
                </span>
                {heroVideo && (
                  <button
                    type="button"
                    onClick={() => setHeroVideo('')}
                    disabled={isSaving}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors cursor-pointer"
                  >
                    Remove Video
                  </button>
                )}
              </div>
              <ImageInputWithUpload
                hint={`16:9 • MP4/WebM • Max ${MAX_VIDEO_SIZE_MB}MB`}
                value={heroVideo}
                onChange={setHeroVideo}
                placeholder="Paste background video URL or click upload"
                accept="video/*"
                aspectRatio="16:9"
                previewWidth="w-full max-w-md"
                buttonText="Upload Video"
                inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Autoplays in an ambient background loop behind the hero title. Leave empty to use only the background photo.
              </p>
            </div>
          </div>

          {/* Page Content */}
          <div className="bg-[#202020] border border-[#3A3530] rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                Page Content
              </h3>
              <span className="text-[11px] text-gray-400">
                Click any image to align, resize, or delete
              </span>
            </div>

            {/* TipTap Editor without internal scrollbar */}
            <TipTapEditor
              content={content}
              onChange={setContent}
              editable={!isSaving}
              minHeight="350px"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#3A3530] flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 bg-[#181818] shrink-0">
          {errorMsg ? (
            <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
              {errorMsg}
            </div>
          ) : (
            <div />
          )}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg font-medium text-white border border-gray-600 hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-7 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer text-sm shadow-md"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Saving...
                </>
              ) : (
                'Save Content'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterLinkModal;
