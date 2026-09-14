import React, { useState, useEffect } from 'react';
import type { CorporateBookOnlineData } from './types';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface CorporateBookOnlineFormProps {
  initialData: CorporateBookOnlineData;
  onSave: (data: CorporateBookOnlineData) => void;
  isSaving?: boolean;
}

const CorporateBookOnlineForm: React.FC<CorporateBookOnlineFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<CorporateBookOnlineData>(initialData);

  useEffect(() => {
    setFormData(initialData || {
      title: 'BOOK ONLINE',
      body: '',
      imageUrl: '',
      buttonText: 'BOOK NOW',
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
          <h2 className="text-xl font-semibold text-white">Book Online Section</h2>
          <p className="text-gray-400 text-sm mt-1">
            Prompt corporate groups to book their slots and battleground online.
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
            placeholder="e.g. BOOK ONLINE"
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
            placeholder="Ready to secure your corporate battleground? Our online booking system is quick..."
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
              placeholder="e.g. BOOK NOW"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Button Link (Booking URL)
            </label>
            <input
              type="url"
              value={formData.buttonLink}
              onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
              placeholder="https://ecom.roller.app/..."
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>
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
          Save Book Online Section
        </button>
      </div>
    </form>
  );
};

export default CorporateBookOnlineForm;
