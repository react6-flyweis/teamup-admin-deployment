import React, { useState, useEffect } from 'react';
import type { CorporatePrivateHireData } from './types';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface CorporatePrivateHireFormProps {
  initialData: CorporatePrivateHireData;
  onSave: (data: CorporatePrivateHireData) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

const CorporatePrivateHireForm: React.FC<CorporatePrivateHireFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
  errorMessage,
}) => {
  const [formData, setFormData] = useState<CorporatePrivateHireData>(initialData);

  useEffect(() => {
    setFormData(initialData || {
      title: 'PRIVATE HIRE',
      body: '',
      imageUrl: '',
      buttonText: 'CONTACT US',
      buttonLink: '',
    });
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Private Hire Section</h2>
          <p className="text-gray-400 text-sm mt-1">
            Highlight full and partial arena venue buyouts and custom private hire options.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Section Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. PRIVATE HIRE"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Body Text
          </label>
          <textarea
            rows={3}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Looking for something truly exclusive? Our venue is available for full or partial private hire..."
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Section Image
          </label>
          <ImageInputWithUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            label=""
            hint="Landscape feature image (16:9 or 4:3)"
            placeholder="Paste image URL or upload image"
            previewHeight="h-36"
            previewWidth="w-full max-w-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Button Text
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              placeholder="e.g. CONTACT US"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Button Link (Contact / Form URL)
            </label>
            <input
              type="url"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              placeholder="https://www.teamuparena.com/contact-us"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          {isSaving ? 'Saving...' : 'Save Private Hire Section'}
        </button>
      </div>
    </form>
  );
};

export default CorporatePrivateHireForm;
