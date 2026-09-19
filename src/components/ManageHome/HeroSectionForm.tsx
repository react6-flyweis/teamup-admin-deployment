import React, { useState, useEffect } from 'react';
import type { HeroSection } from './types';
import Toggle from '@/components/common/Toggle';
import TeamUpLogo from '@/assets/TeamUp.png';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import { useHeaderCategoriesQuery } from '@/hooks/useHeaderCategories';
import { useLocationsQuery } from '@/hooks/useLocations';

interface HeroSectionFormProps {
  initialData: HeroSection;
  onSave?: (data: HeroSection) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

const HeroSectionForm: React.FC<HeroSectionFormProps> = ({
  initialData,
  onSave,
  isSaving,
  errorMessage,
}) => {
  const [data, setData] = useState<HeroSection>(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'video' | 'image'>('video');
  const { data: categoriesData } = useHeaderCategoriesQuery();
  const { data: locationsData } = useLocationsQuery();
  const categories = categoriesData?.categories || [];
  const locations = locationsData?.locations?.map(loc => loc.name) || [];

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Hero Section & Top Banner</h2>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#3A3530]"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {showPreview && (
        <div className="mb-8 border border-[#3A3530] rounded-xl overflow-hidden shadow-2xl relative">

          {/* Header Preview */}
          <div className="bg-black relative" style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #050505 100%)' }}>
            <div className="flex items-center justify-between px-6 py-4">
              {/* Logo */}
              <div className="shrink-0">
                <img src={TeamUpLogo} alt="Team Up" className="h-10 object-contain" />
              </div>

              <div className="flex items-center gap-8 text-sm">
                {/* Location */}
                <div className="relative group flex items-center gap-2 border border-gray-600 rounded px-3 py-1.5 cursor-pointer hover:bg-gray-800 transition-colors">
                  <span className="font-medium text-[13px] text-white">{locations[0]}</span>
                  <span className="text-gray-400 text-[10px]">▼</span>

                  {locations.length > 1 && (
                    <div className="absolute top-full left-0 mt-1 min-w-[120%] bg-[#111111] border border-[#3A3530] rounded shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 text-left">
                      {locations.slice(1).map((loc, i) => (
                        <div key={i} className="px-3 py-2 hover:bg-[#E1017D] hover:text-white text-gray-300 text-[13px] transition-colors border-b border-[#3A3530] last:border-0 whitespace-nowrap">
                          {loc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nav items */}
                <div className="hidden lg:flex items-center gap-6 font-medium tracking-wide text-[13px] text-white">
                  {categories.filter(c => !c.isHidden).slice(0, 4).map(cat => (
                    <div key={cat.id} className="relative group cursor-pointer">
                      <div className="flex items-center gap-1 hover:text-[#E1017D] transition-colors py-2">
                        {cat.name}
                        {cat.subItems.length > 0 && <span className="text-[9px] opacity-70">▼</span>}
                      </div>
                      {/* Dropdown Menu */}
                      {cat.subItems.length > 0 && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-[#111111] border border-[#3A3530] rounded shadow-2xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-50 text-left">
                          <div className="py-2">
                            {cat.subItems.map(sub => (
                              <div key={sub.id} className="px-4 py-2 hover:bg-[#E1017D] hover:text-white text-gray-300 text-sm transition-colors">
                                {sub.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 font-bold text-[11px] uppercase tracking-wider text-center">
                <button className="bg-[#E1017D] hover:bg-pink-700 text-white px-5 py-2 rounded shadow-lg transition-transform hover:scale-105 leading-tight">
                  BOOK <br />GAMES
                </button>
                <button className="bg-[#00B4D8] hover:bg-cyan-600 text-white px-5 py-2 rounded shadow-lg transition-transform hover:scale-105 leading-tight">
                  BOOK <br />EVENTS
                </button>
              </div>
            </div>
          </div>

          {/* Top Banner Preview if active */}
          {data.isTopBannerActive && (
            <div className="bg-[#E1017D] w-full py-2.5 text-center text-white font-black uppercase text-sm tracking-widest shadow-md">
              {data.topBannerText || 'ENTER BANNER TEXT'}
            </div>
          )}
          {/* Hero Section Preview */}
          <div className="w-full h-[350px] relative flex flex-col justify-center items-center text-center">
            {/* Toggle Preview mode if video is available */}
            {data.videoUrl && (
              <div className="absolute top-4 right-4 z-20 flex items-center bg-black/80 backdrop-blur-md p-1 rounded-lg border border-[#3A3530] text-xs shadow-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode('video')}
                  className={`px-3 py-1 rounded transition-colors ${previewMode === 'video' ? 'bg-[#E1017D] text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                >
                  ▶ Video View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('image')}
                  className={`px-3 py-1 rounded transition-colors ${previewMode === 'image' ? 'bg-[#E1017D] text-white font-medium' : 'text-gray-400 hover:text-white'}`}
                >
                  🖼 Poster View
                </button>
              </div>
            )}

            {data.videoUrl && previewMode === 'video' ? (
              <video
                src={data.videoUrl}
                poster={data.backgroundMediaUrl || undefined}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            ) : data.backgroundMediaUrl ? (
              <img
                src={data.backgroundMediaUrl}
                alt="Background Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            ) : (
              <div className="absolute inset-0 bg-gray-900 bg-opacity-80" />
            )}
            <div className="relative z-10 px-4">
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider mb-2">{data.title || 'HERO TITLE'}</h1>
              <p className="text-lg md:text-xl text-white font-medium mb-8">{data.subtitle || 'Subtitle / Location'}</p>
              <div className="flex items-center gap-4 justify-center">
                {data.buttons.primaryText && (
                  <button className="bg-[#E1017D] hover:bg-pink-700 text-white px-8 py-3 rounded font-bold uppercase tracking-wider text-sm shadow-lg transition-transform hover:scale-105">
                    {data.buttons.primaryText}
                  </button>
                )}
                {data.buttons.secondaryText && (
                  <button className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-8 py-3 rounded font-bold uppercase tracking-wider text-sm transition-colors shadow-lg">
                    {data.buttons.secondaryText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Settings */}
      <div className="mb-8 border-b border-[#3A3530] pb-6">
        <h3 className="text-lg font-medium text-white mb-4">Top Banner</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={data.topBannerText}
            onChange={(e) => setData({ ...data, topBannerText: e.target.value })}
            className="flex-1 h-12 px-4 rounded-lg bg-[#E1017D] border border-gray-300 text-white font-bold"
            placeholder="e.g. TIPSY THRILLS - SIPS & THRILLS FRI 15TH AUG"
          />
          <Toggle
            activeText="ON"
            inactiveText="OFF"
            checked={data.isTopBannerActive}
            onChange={(checked) => setData({ ...data, isTopBannerActive: checked })}
          />
        </div>
      </div>

      {/* Hero Banner Settings */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Hero Banner</h3>

        <div className="space-y-6">
          {/* Background Image (Photo / Fallback Poster) */}
          <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-5">
            <ImageInputWithUpload
              label="Hero Background Photo (Initial / Fallback Poster)"
              hint="16:9 • Rec: 1920×1080 or 2560×1440 px • WebP/JPG/PNG"
              value={data.backgroundMediaUrl}
              onChange={(url) => setData({ ...data, backgroundMediaUrl: url })}
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
              <span className="text-xs text-gray-400 font-medium">Hero Background Video (Optional)</span>
              {data.videoUrl && (
                <button
                  type="button"
                  onClick={() => setData({ ...data, videoUrl: '' })}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors"
                >
                  Remove Video
                </button>
              )}
            </div>
            <ImageInputWithUpload
              hint="16:9 • MP4/WebM"
              value={data.videoUrl || ''}
              onChange={(url) => setData({ ...data, videoUrl: url })}
              placeholder="Paste video URL or click upload"
              accept="video/*"
              aspectRatio="16:9"
              previewWidth="w-full max-w-xl"
              buttonText="Upload Video"
              inputClassName="w-full h-10 px-3 rounded bg-[#1C1C1C] border border-[#3A3530] text-white text-sm focus:border-[#E1017D] focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              Autoplays in a loop behind the hero section. Leave empty to use only the background photo.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Hero Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
              />
            </div>

            {/* Subtitle / Location */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Subtitle / Location</label>
              <input
                type="text"
                value={data.subtitle}
                onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                className="w-full h-10 px-4 rounded bg-[#2A2A2A] border border-[#3A3530] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Primary Button */}
            <div className="p-4 border border-[#3A3530] rounded-lg">
              <h4 className="text-white mb-3 font-medium">Primary Button</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Text</label>
                  <input
                    type="text"
                    value={data.buttons.primaryText}
                    onChange={(e) => setData({ ...data, buttons: { ...data.buttons, primaryText: e.target.value } })}
                    className="w-full h-9 px-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link</label>
                  <input
                    type="text"
                    value={data.buttons.primaryLink}
                    onChange={(e) => setData({ ...data, buttons: { ...data.buttons, primaryLink: e.target.value } })}
                    className="w-full h-9 px-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Button */}
            <div className="p-4 border border-[#3A3530] rounded-lg">
              <h4 className="text-white mb-3 font-medium">Secondary Button</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Text</label>
                  <input
                    type="text"
                    value={data.buttons.secondaryText}
                    onChange={(e) => setData({ ...data, buttons: { ...data.buttons, secondaryText: e.target.value } })}
                    className="w-full h-9 px-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Link</label>
                  <input
                    type="text"
                    value={data.buttons.secondaryLink}
                    onChange={(e) => setData({ ...data, buttons: { ...data.buttons, secondaryLink: e.target.value } })}
                    className="w-full h-9 px-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-6 py-2 rounded-lg font-medium transition-colors border border-[#3A3530] cursor-pointer"
          >
            {showPreview ? 'Hide Preview' : 'Preview Live'}
          </button>
          <button
            type="button"
            onClick={() => onSave && onSave(data)}
            disabled={isSaving}
            className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {isSaving && (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionForm;
