import React, { useState, useEffect } from 'react';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface CorporateHeroFormProps {
  initialData: {
    pageUrl: string;
    heroTitle: string;
    heroImageUrl: string;
  };
  onSave: (data: { pageUrl: string; heroTitle: string; heroImageUrl: string }) => void;
  isSaving?: boolean;
}

const toPathOrSlug = (val: string): string => {
  if (!val) return '';
  if (val.startsWith('http://') || val.startsWith('https://')) {
    try {
      return new URL(val).pathname;
    } catch {
      return val;
    }
  }
  return val;
};

const CorporateHeroForm: React.FC<CorporateHeroFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    ...initialData,
    pageUrl: toPathOrSlug(initialData.pageUrl),
  });

  useEffect(() => {
    setFormData({
      ...initialData,
      pageUrl: toPathOrSlug(initialData.pageUrl),
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave({
      ...formData,
      pageUrl: toPathOrSlug(formData.pageUrl),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Hero & Page Setup</h2>
          <p className="text-gray-400 text-sm mt-1">
            Configure the main landing banner and page slug/path for the Corporate events page.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Page Slug / Path
          </label>
          <input
            type="text"
            value={formData.pageUrl}
            onChange={(e) => setFormData({ ...formData, pageUrl: toPathOrSlug(e.target.value.trim()) })}
            placeholder="e.g. /corporates"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">
            The route slug or relative path for this page (e.g. <span className="font-mono text-gray-400">/corporates</span>).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.heroTitle}
            onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
            placeholder="e.g. The Ultimate Team Building Experience"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hero Background Image
          </label>
          <ImageInputWithUpload
            value={formData.heroImageUrl}
            onChange={(url) => setFormData({ ...formData, heroImageUrl: url })}
            label=""
            hint="Recommended: 1920x800, high resolution landscape image"
            placeholder="Paste image URL or upload corporate hero banner"
            previewHeight="h-44"
            previewWidth="w-full max-w-lg"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#3A3530] flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          Save Hero Settings
        </button>
      </div>
    </form>
  );
};

export default CorporateHeroForm;
