import React, { useState, useEffect } from 'react';
import type { NewsletterSection } from './types';
import Toggle from '@/components/common/Toggle';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface NewsletterSectionFormProps {
  initialData: NewsletterSection;
  onSave?: (data: NewsletterSection) => void;
  isSaving?: boolean;
}

const NewsletterSectionForm: React.FC<NewsletterSectionFormProps> = ({
  initialData,
  onSave,
  isSaving,
}) => {
  const [data, setData] = useState<NewsletterSection>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      {/* Header with Visibility Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-[#3A3530] pb-5">
        <div>
          <h2 className="text-xl font-semibold text-white">Sign Up / Newsletter Section</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage heading, body text, background image, and signup prompt for the newsletter banner.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle
            activeText="ON"
            inactiveText="OFF"
            checked={data.isActive}
            onChange={(checked) => setData({ ...data, isActive: checked })}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Background Image */}
        <div>
          <ImageInputWithUpload
            label="Background Image"
            value={data.backgroundImageUrl}
            onChange={(url) => setData({ ...data, backgroundImageUrl: url })}
            placeholder="Paste background image URL or upload"
            accept="image/*"
            previewHeight="h-28"
            previewWidth="w-48"
            inputClassName="w-full h-10 px-3 rounded bg-[#2A2A2A] border border-[#3A3530] text-white text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended size: 1920x800px or larger party/event background image.</p>
        </div>

        {/* Heading */}
        <div>
          <label className="block text-sm text-gray-300 mb-2 font-medium">Heading / Title</label>
          <input
            type="text"
            value={data.heading}
            onChange={(e) => setData({ ...data, heading: e.target.value })}
            placeholder="e.g. SIGN UP OR SHUFF UP"
            className="w-full h-11 px-4 rounded-lg bg-[#2A2A2A] border border-[#3A3530] text-white focus:outline-none focus:border-[#E1017D] transition-colors"
          />
        </div>

        {/* Subheading / Body Text */}
        <div>
          <label className="block text-sm text-gray-300 mb-2 font-medium">Body / Description</label>
          <textarea
            value={data.subheading}
            onChange={(e) => setData({ ...data, subheading: e.target.value })}
            placeholder="e.g. NO FOMO NEEDED. BE THE FIRST TO RECEIVE NEWS AND UPDATES..."
            rows={3}
            className="w-full p-3 rounded-lg bg-[#2A2A2A] border border-[#3A3530] text-white focus:outline-none focus:border-[#E1017D] transition-colors resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Form Inputs & Button Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">Input Placeholder Text</label>
            <input
              type="text"
              value={data.inputPlaceholder}
              onChange={(e) => setData({ ...data, inputPlaceholder: e.target.value })}
              placeholder="e.g. Your email address*"
              className="w-full h-10 px-4 rounded-lg bg-[#2A2A2A] border border-[#3A3530] text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">Button Text</label>
            <input
              type="text"
              value={data.buttonText}
              onChange={(e) => setData({ ...data, buttonText: e.target.value })}
              placeholder="e.g. SIGN UP"
              className="w-full h-10 px-4 rounded-lg bg-[#2A2A2A] border border-[#3A3530] text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Disclaimer / Footer Note */}
        <div>
          <label className="block text-sm text-gray-300 mb-2 font-medium">
            Disclaimer / Legal Notice
          </label>
          <textarea
            value={data.disclaimerText}
            onChange={(e) => setData({ ...data, disclaimerText: e.target.value })}
            placeholder="e.g. By signing up you will be added to our mailing list..."
            rows={3}
            className="w-full p-3 rounded-lg bg-[#2A2A2A] border border-[#3A3530] text-white focus:outline-none focus:border-[#E1017D] transition-colors resize-none text-sm leading-relaxed"
          />
          <p className="text-xs text-gray-500 mt-1">
            "Privacy Policy" in this text will automatically be formatted as a link on the live website.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => onSave && onSave(data)}
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

export default NewsletterSectionForm;
