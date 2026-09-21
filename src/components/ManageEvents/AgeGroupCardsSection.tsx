import React, { useState, useEffect } from 'react';
import type { AgeGroupsSectionData, AgeGroupCardItem } from '@/types/events';
import { EditIcon, TrashIcon } from '@/assets/icons';
import AgeGroupEditModal from './AgeGroupEditModal';

interface AgeGroupCardsSectionProps {
  initialData: AgeGroupsSectionData;
  onSave: (data: AgeGroupsSectionData) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
  pageLabel: string;
}

export const AgeGroupCardsSection: React.FC<AgeGroupCardsSectionProps> = ({
  initialData,
  onSave,
  isSaving = false,
  errorMessage,
  pageLabel,
}) => {
  const [sectionData, setSectionData] = useState<AgeGroupsSectionData>(initialData);
  const [editingCard, setEditingCard] = useState<AgeGroupCardItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setSectionData(initialData);
  }, [initialData]);

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const newCards = [...sectionData.cards];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCards.length) return;

    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    const updated = newCards.map((c, i) => ({ ...c, order: i + 1 }));
    setSectionData((prev) => ({ ...prev, cards: updated }));
  };

  const handleDeleteCard = (id: string) => {
    const filtered = sectionData.cards
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, order: i + 1 }));
    setSectionData((prev) => ({ ...prev, cards: filtered }));
  };

  const handleSaveCard = (savedCard: AgeGroupCardItem) => {
    let updated: AgeGroupCardItem[];
    const exists = sectionData.cards.some((c) => c.id === savedCard.id);

    if (exists) {
      updated = sectionData.cards.map((c) => (c.id === savedCard.id ? savedCard : c));
    } else {
      updated = [...sectionData.cards, { ...savedCard, order: sectionData.cards.length + 1 }];
    }

    setSectionData((prev) => ({ ...prev, cards: updated }));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave(sectionData);
  };

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#33302B]">
        <div>
          <h2 className="text-xl font-semibold text-white">Age Group Cards & Packages</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage packages and age tier cards for {pageLabel}. Configure booking links (A La Carte &amp; Preselect modal) or direct contact links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCard(null);
            setIsEditModalOpen(true);
          }}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Age Group Card</span>
        </button>
      </div>

      {/* Section Titles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Section Heading
          </label>
          <input
            type="text"
            value={sectionData.sectionTitle || ''}
            onChange={(e) => setSectionData({ ...sectionData, sectionTitle: e.target.value })}
            placeholder="e.g. Age Groups & Party Packages"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Section Subtitle
          </label>
          <input
            type="text"
            value={sectionData.sectionSubtitle || ''}
            onChange={(e) => setSectionData({ ...sectionData, sectionSubtitle: e.target.value })}
            placeholder="e.g. Tailored packages for every squad"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Cards List */}
      {sectionData.cards.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[#3A3530] rounded-xl bg-[#141414]">
          <p className="text-gray-400 text-sm mb-3">No age group cards added yet.</p>
          <button
            type="button"
            onClick={() => {
              setEditingCard(null);
              setIsEditModalOpen(true);
            }}
            className="bg-[#2A2A2A] hover:bg-[#333] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Add First Card</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectionData.cards.map((card, idx) => {
            const isContact = card.actionType === 'contact_us';

            return (
              <div
                key={card.id}
                className="bg-[#141414] border border-[#33302B] hover:border-[#4A4540] rounded-xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Header & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono text-gray-500">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                        isContact
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-[#E1017D]/15 text-[#E1017D] border border-[#E1017D]/30'
                      }`}>
                        {isContact ? 'Contact Us' : 'Book Now'}
                      </span>
                      {card.badge && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-200 font-semibold border border-white/20">
                          {card.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Title */}
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-3">
                    {card.description}
                  </p>

                  {/* Configured Links Display */}
                  {isContact ? (
                    <div className="space-y-1.5 p-3 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] mb-4 text-xs">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="font-semibold text-gray-300">Action:</span>
                        <span className="text-amber-400 font-medium">Direct Contact Link</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="font-semibold text-gray-300">Link:</span>
                        <span className="truncate max-w-42.5 text-gray-400 font-mono" title={card.contactLink}>
                          {card.contactLink || 'Not set'}
                        </span>
                      </div>
                      {card.contactButtonText && (
                        <div className="flex items-center justify-between text-gray-400">
                          <span className="font-semibold text-gray-300">Button Label:</span>
                          <span className="text-gray-200">{card.contactButtonText}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 p-3 rounded-lg bg-[#1a1a1a] border border-[#2c2c2c] mb-4 text-xs">
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="font-semibold text-gray-300">Action:</span>
                        <span className="text-[#E1017D] font-medium">Book Now (Menu Modal)</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="font-semibold text-gray-300">A La Carte:</span>
                        <span className="truncate max-w-42.5 text-gray-500 font-mono" title={card.aLaCarteMenuLink}>
                          {card.aLaCarteMenuLink || 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-gray-400">
                        <span className="font-semibold text-gray-300">Preselect:</span>
                        <span className="truncate max-w-42.5 text-gray-500 font-mono" title={card.preselectMenuLink}>
                          {card.preselectMenuLink || 'Not set'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-xs">
                  {/* Reordering */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveCard(idx, 'up')}
                      className="p-1.5 rounded bg-[#222] hover:bg-[#2e2e2e] text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      disabled={idx === sectionData.cards.length - 1}
                      onClick={() => handleMoveCard(idx, 'down')}
                      className="p-1.5 rounded bg-[#222] hover:bg-[#2e2e2e] text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCard(card);
                        setIsEditModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-white flex items-center gap-1 p-1 hover:bg-[#242424] rounded cursor-pointer"
                    >
                      <EditIcon size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 p-1 hover:bg-red-500/10 rounded cursor-pointer"
                    >
                      <TrashIcon size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t border-[#3A3530] flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSaving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          {isSaving ? 'Saving...' : 'Save Age Group Cards'}
        </button>
      </div>

      {/* Edit / Add Modal */}
      <AgeGroupEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        initialData={editingCard}
        totalCardsCount={sectionData.cards.length}
      />
    </div>
  );
};

export default AgeGroupCardsSection;
