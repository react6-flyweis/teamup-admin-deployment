import React, { useState, useRef } from 'react';
import { UploadIcon } from '../../../assets/icons';
import { uploadFile } from '@/utils/fileUpload';

interface CardFormData {
  headline: string;
  description: string;
  image: string;
}

interface CardModalProps {
  title: string;
  initialData?: CardFormData;
  onClose: () => void;
  onSubmit: (data: CardFormData) => void;
  submitLabel: string;
}

const CardModal: React.FC<CardModalProps> = ({
  title,
  initialData = { headline: '', description: '', image: '' },
  onClose,
  onSubmit,
  submitLabel
}) => {
  const [formData, setFormData] = useState<CardFormData>(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setFormData((prev) => ({ ...prev, image: url }));
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#F9D2EA] rounded-2xl  w-[683px] max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center  p-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 bg-white rounded-full flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <div className="border-t border-black p-6">
          {/* Form */}
          <form onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}>
            {/* Headline */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Enter Headline here
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white"
                placeholder="Enter headline..."
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-32 px-4 py-2 rounded-lg border border-gray-300 bg-white resize-none"
                placeholder="Enter description..."
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Image <span className="text-xs text-gray-500 font-normal ml-1">(1:1 Square • Rec: 800×800 px)</span>
              </label>
              <div className="border border-dashed border-black rounded-lg p-4 relative bg-white flex flex-col items-center justify-center min-h-[220px]">
                {formData.image ? (
                  <div className="relative w-48 aspect-square max-w-full">
                    <img
                      src={formData.image}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full pointer-events-none">
                      1:1
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[#E1017D] border border-[#E1017D] px-3 py-1 text-xs rounded-lg font-semibold shadow-xs hover:bg-white"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 h-full">
                    <p className=" font-medium">Upload your photo here</p>
                    <UploadIcon />
                    <p className="text-sm text-gray-500">Supported file format PNG, JPEG, JPG</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 text-[#E1017D] border border-[#E1017D] px-5 py-2 rounded-lg font-semibold"
                    >
                      Select Photo
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-[#7E0B0B] text-[#7E0B0B] rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#E1017D] text-white rounded-lg font-semibold"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
