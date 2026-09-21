import React, { useState, useEffect } from 'react';
import type { InfoCardsSectionData, InfoCardItem } from '@/types/events';
import { EditIcon, TrashIcon } from '@/assets/icons';
import InfoCardEditModal from './InfoCardEditModal';

interface InfoCardsSectionProps {
  initialData: InfoCardsSectionData;
  onSave: (data: InfoCardsSectionData) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
  pageLabel: string;
}

export const InfoCardsSection: React.FC<InfoCardsSectionProps> = ({
  initialData,
  onSave,
  isSaving = false,
  errorMessage,
  pageLabel,
}) => {
  const [sectionData, setSectionData] = useState<InfoCardsSectionData>(initialData);
  const [editingCard, setEditingCard] = useState<InfoCardItem | null>(null);
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

  const handleSaveCard = (savedCard: InfoCardItem) => {
    let updated: InfoCardItem[];
    const exists = sectionData.cards.some((c) => c.id === savedCard.id);

    if (exists) {
      updated = sectionData.cards.map((c) => (c.id === savedCard.id ? savedCard : c));
    } else {
      updated = [...sectionData.cards, { ...savedCard, order: sectionData.cards.length + 1 }];
    }

    setSectionData((prev) => ({ ...prev, cards: updated }));
  };

  const isVideoUrl = (url: string, type?: string) => {
    return (
      type === 'video' ||
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)
    );
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
          <h2 className="text-xl font-semibold text-white">Experience Info Cards</h2>
          <p className="text-gray-400 text-sm mt-1">
            Highlight amenities, perks, and features for {pageLabel} using images or video clips.
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
          <span>Add Info Card</span>
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
            placeholder="e.g. Why Celebrate At Team Up?"
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
            placeholder="e.g. Everything you need to know about our venue experience"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Cards List */}
      {sectionData.cards.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-[#3A3530] rounded-xl bg-[#141414]">
          <p className="text-gray-400 text-sm mb-3">No info cards added yet.</p>
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
            const hasVideo = isVideoUrl(card.mediaUrl, card.mediaType);

            return (
              <div
                key={card.id}
                className="bg-[#141414] border border-[#33302B] hover:border-[#4A4540] rounded-xl overflow-hidden flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Media Banner */}
                  <div className="relative h-44 bg-black flex items-center justify-center overflow-hidden border-b border-[#2C2825]">
                    {card.mediaUrl ? (
                      hasVideo ? (
                        <video
                          src={card.mediaUrl}
                          controls
                          muted
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={card.mediaUrl}
                          alt={card.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )
                    ) : (
                      <div className="text-gray-600 text-xs flex flex-col items-center gap-1">
                        <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>No media provided</span>
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-md border border-white/10">
                        {hasVideo ? 'Video' : 'Image'}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/70 text-gray-300 backdrop-blur-md">
                        #{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-3 border-t border-[#262626] flex items-center justify-between text-xs bg-[#111]">
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
          {isSaving ? 'Saving...' : 'Save Info Cards'}
        </button>
      </div>

      {/* Edit / Add Modal */}
      <InfoCardEditModal
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

export default InfoCardsSection;
