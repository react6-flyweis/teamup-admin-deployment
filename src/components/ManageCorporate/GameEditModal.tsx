import React, { useState, useEffect } from 'react';
import type { CorporateOtherGameItem } from './types';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import { CloseIcon } from '@/assets/icons';

interface GameEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (game: CorporateOtherGameItem) => void;
  initialData?: CorporateOtherGameItem | null;
}

const defaultGame: CorporateOtherGameItem = {
  title: '',
  imageUrl: '',
  bookNowLink: '',
  learnMoreLink: '',
};

const GameEditModal: React.FC<GameEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CorporateOtherGameItem>(defaultGame);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(defaultGame);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3A3530] flex justify-between items-center bg-[#181818] shrink-0">
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Featured Game' : 'Add Featured Game'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#2A2A2A] transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Game Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. KARAOKE DANCE or AR DARTS"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Game Image
            </label>
            <ImageInputWithUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              label=""
              hint="Landscape or 16:9 game poster"
              placeholder="Paste image URL or upload game cover"
              previewHeight="h-28"
              previewWidth="w-full max-w-xs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Book Now Link
            </label>
            <input
              type="url"
              value={formData.bookNowLink}
              onChange={(e) => setFormData({ ...formData, bookNowLink: e.target.value })}
              placeholder="https://ecom.roller.app/..."
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Learn More Link
            </label>
            <input
              type="url"
              value={formData.learnMoreLink}
              onChange={(e) => setFormData({ ...formData, learnMoreLink: e.target.value })}
              placeholder="https://www.teamuparena.com/games/..."
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
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
              {initialData ? 'Save Changes' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameEditModal;
