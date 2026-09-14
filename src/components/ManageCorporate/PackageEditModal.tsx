import React, { useState, useEffect } from 'react';
import type { CorporatePackageItem } from './types';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import { CloseIcon, TrashIcon } from '@/assets/icons';

interface PackageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: CorporatePackageItem) => void;
  initialData?: CorporatePackageItem | null;
}

const defaultPackage: CorporatePackageItem = {
  title: '',
  price: '',
  iconUrl: '',
  details: [''],
  buttonText: 'BOOK NOW',
  buttonLink: '',
};

const PackageEditModal: React.FC<PackageEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CorporatePackageItem>(defaultPackage);
  const [detailInput, setDetailInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        details: initialData.details && initialData.details.length > 0 ? initialData.details : [''],
      });
    } else {
      setFormData(defaultPackage);
    }
    setDetailInput('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddDetail = () => {
    if (!detailInput.trim()) return;
    setFormData({
      ...formData,
      details: [...formData.details.filter(d => d.trim().length > 0), detailInput.trim()],
    });
    setDetailInput('');
  };

  const handleRemoveDetail = (index: number) => {
    const updated = formData.details.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      details: updated.length > 0 ? updated : [''],
    });
  };

  const handleDetailChange = (index: number, val: string) => {
    const updated = [...formData.details];
    updated[index] = val;
    setFormData({ ...formData, details: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanDetails = formData.details
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    onSave({
      ...formData,
      details: cleanDetails,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3A3530] flex justify-between items-center bg-[#181818] shrink-0">
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Corporate Package' : 'Add Corporate Package'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Package Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. PINTS & PAYOFFS"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Price Tag <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. $45 or $72.50"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Icon / Badge Image
            </label>
            <ImageInputWithUpload
              value={formData.iconUrl}
              onChange={(url) => setFormData({ ...formData, iconUrl: url })}
              label=""
              hint="Square icon or badge image (1:1)"
              placeholder="Paste icon URL or upload package icon"
              previewHeight="h-20"
              previewWidth="w-20"
            />
          </div>

          {/* Package Details / Inclusions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Included Features & Details
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Bullet points included with this package (e.g. 2 HOURS OF GAMES, 2 BEVVIES PER PERSON).
            </p>

            <div className="space-y-2 mb-3">
              {formData.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono w-5 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={detail}
                    onChange={(e) => handleDetailChange(idx, e.target.value)}
                    placeholder="e.g. 2 HOURS OF GAMES"
                    className="flex-1 bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(idx)}
                    className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors"
                    title="Remove item"
                  >
                    <TrashIcon size={16} color="currentColor" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add fast row */}
            <div className="flex gap-2">
              <input
                type="text"
                value={detailInput}
                onChange={(e) => setDetailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDetail();
                  }
                }}
                placeholder="Type a feature and press Enter or click Add"
                className="flex-1 bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
              />
              <button
                type="button"
                onClick={handleAddDetail}
                className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded-lg text-sm font-medium border border-[#3A3530] transition-colors"
              >
                + Add
              </button>
            </div>
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
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
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
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#3A3530] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-[#2A2A2A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {initialData ? 'Save Changes' : 'Add Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageEditModal;
