import React, { useState, useEffect } from 'react';
import type { AgeGroupCardItem, AgeGroupActionType } from '@/types/events';
import { CloseIcon } from '@/assets/icons';

interface AgeGroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: AgeGroupCardItem) => void;
  initialData?: AgeGroupCardItem | null;
  totalCardsCount?: number;
}

const defaultCard: AgeGroupCardItem = {
  id: '',
  title: '',
  description: '',
  actionType: 'book_now',
  aLaCarteMenuLink: '',
  preselectMenuLink: '',
  contactLink: '',
  contactButtonText: 'Contact Us',
  badge: '',
  order: 1,
  isActive: true,
};

export const AgeGroupEditModal: React.FC<AgeGroupEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  totalCardsCount = 0,
}) => {
  const [formData, setFormData] = useState<AgeGroupCardItem>(defaultCard);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultCard,
        ...initialData,
        actionType: initialData.actionType || (initialData.contactLink && !initialData.aLaCarteMenuLink ? 'contact_us' : 'book_now'),
        contactButtonText: initialData.contactButtonText || 'Contact Us',
      });
    } else {
      setFormData({
        ...defaultCard,
        id: `age-group-${Date.now()}`,
        order: totalCardsCount + 1,
      });
    }
  }, [initialData, isOpen, totalCardsCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.title.trim()) return;
    onSave(formData);
    onClose();
  };

  const actionType: AgeGroupActionType = formData.actionType || 'book_now';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3A3530] flex items-center justify-between bg-[#171717] shrink-0">
          <h3 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Age Group Card' : 'Add Age Group Card'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Card Title / Age Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 18+ Adults Only / Kids & Junior Gamers"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Badge / Highlight Label <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.badge || ''}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              placeholder="e.g. Most Popular, Family Favorite, VIP"
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a compelling description of what this age group or package includes..."
              className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
            />
          </div>

          {/* Action Type Selector */}
          <div className="pt-2 border-t border-[#33302B] space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Booking / Action Type <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: 'book_now' })}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  actionType === 'book_now'
                    ? 'border-[#E1017D] bg-[#E1017D]/10 text-white'
                    : 'border-[#33302B] bg-[#141414] text-gray-400 hover:text-white hover:border-[#4A4540]'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <span className={`w-2 h-2 rounded-full ${actionType === 'book_now' ? 'bg-[#E1017D]' : 'bg-gray-600'}`} />
                  Book Now (2 Menu Links)
                </div>
                <p className="text-[11px] text-gray-400">
                  Shows Book Now button opening modal with A La Carte & Preselect options.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: 'contact_us' })}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  actionType === 'contact_us'
                    ? 'border-[#E1017D] bg-[#E1017D]/10 text-white'
                    : 'border-[#33302B] bg-[#141414] text-gray-400 hover:text-white hover:border-[#4A4540]'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                  <span className={`w-2 h-2 rounded-full ${actionType === 'contact_us' ? 'bg-[#E1017D]' : 'bg-gray-600'}`} />
                  Contact Us (Single Link)
                </div>
                <p className="text-[11px] text-gray-400">
                  Shows a direct contact button opening your enquiry or contact page.
                </p>
              </button>
            </div>

            {/* Book Now Fields */}
            {actionType === 'book_now' ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    A La Carte Menu Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.aLaCarteMenuLink || ''}
                    onChange={(e) => setFormData({ ...formData, aLaCarteMenuLink: e.target.value })}
                    placeholder="e.g. https://ecom.roller.app/... or /menu/a-la-carte"
                    className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for the &quot;A La Carte Menu&quot; option in the booking modal.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Preselect Your Menu Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.preselectMenuLink || ''}
                    onChange={(e) => setFormData({ ...formData, preselectMenuLink: e.target.value })}
                    placeholder="e.g. https://ecom.roller.app/... or /menu/preselect"
                    className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for the &quot;Preselect Your Menu&quot; option in the booking modal.
                  </p>
                </div>
              </div>
            ) : (
              /* Contact Us Fields */
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Contact Us Link / Page URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactLink || ''}
                    onChange={(e) => setFormData({ ...formData, contactLink: e.target.value })}
                    placeholder="e.g. https://www.teamuparena.com/contact-us or /contact-us"
                    className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Direct destination link when user clicks the contact button on this card.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Button Label <span className="text-xs text-gray-500">(defaults to &quot;Contact Us&quot;)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactButtonText || ''}
                    onChange={(e) => setFormData({ ...formData, contactButtonText: e.target.value })}
                    placeholder="e.g. Contact Us / Enquire Now"
                    className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#3A3530] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              {initialData ? 'Update Card' : 'Add Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgeGroupEditModal;
