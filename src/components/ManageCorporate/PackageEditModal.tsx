import React, { useState, useEffect } from 'react';
import type { CorporatePackageItem } from './types';
import { CloseIcon } from '@/assets/icons';

interface PackageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pkg: CorporatePackageItem) => void;
  initialData?: CorporatePackageItem | null;
}

const defaultPackage: CorporatePackageItem = {
  title: '',
  games: '',
  welcomeBevvy: '',
  bevvies: '',
  scran: '',
  somethingFun: '',
  price: '',
};

const PackageEditModal: React.FC<PackageEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<CorporatePackageItem>(defaultPackage);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        games: initialData.games || '',
        welcomeBevvy: initialData.welcomeBevvy || '',
        bevvies: initialData.bevvies || '',
        scran: initialData.scran || '',
        somethingFun: initialData.somethingFun || '',
        price: initialData.price || '',
      });
    } else {
      setFormData(defaultPackage);
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
                Package Title / Column Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. JINGLE & MINGLE or BUILD YOUR OWN"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Price (£ PP / Per Person) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. £35 PP or BUILT AROUND YOUR BUDGET"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
              />
            </div>
          </div>

          {/* Structured Matrix Rows */}
          <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#E1017D] tracking-wider uppercase">
              Package Inclusions (Matrix Rows)
            </h4>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Games Time / Games <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.games}
                onChange={(e) => setFormData({ ...formData, games: e.target.value })}
                placeholder="e.g. 2 HOURS OF GAMES or CHOOSE YOUR GAME TIME"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Welcome Bevvy (Drinks on arrival)
              </label>
              <textarea
                rows={2}
                value={formData.welcomeBevvy}
                onChange={(e) => setFormData({ ...formData, welcomeBevvy: e.target.value })}
                placeholder="e.g. PROSECCO, WINE OR BOTTLED BEER/CIDER/0% ON ARRIVAL"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Bevvies (Drinks Package)
              </label>
              <textarea
                rows={2}
                value={formData.bevvies}
                onChange={(e) => setFormData({ ...formData, bevvies: e.target.value })}
                placeholder="e.g. 2 HOUSE BEVVIES (COCKTAIL UPGRADE AVAILABLE)"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Scran (Food Package)
              </label>
              <input
                type="text"
                value={formData.scran}
                onChange={(e) => setFormData({ ...formData, scran: e.target.value })}
                placeholder="e.g. BOOM BITES - STREET FOOD BUFFET or N/A"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Something Fun (Extra Perk / Treat)
              </label>
              <textarea
                rows={2}
                value={formData.somethingFun}
                onChange={(e) => setFormData({ ...formData, somethingFun: e.target.value })}
                placeholder="e.g. FESTIVE GROUP SHOT (SWITCH TO JOE & SEPHS POPCORN TO TAKE HOME) or N/A"
                className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#E1017D] transition-colors"
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
              className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
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
