import React, { useState, useEffect } from 'react';
import type { CorporateOtherGameItem, CorporateOtherGamesData } from './types';
import GameEditModal from './GameEditModal';
import { EditIcon, TrashIcon } from '@/assets/icons';

interface CorporateOtherGamesFormProps {
  initialData: CorporateOtherGamesData;
  onSave: (data: CorporateOtherGamesData) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

const CorporateOtherGamesForm: React.FC<CorporateOtherGamesFormProps> = ({
  initialData,
  onSave,
  isSaving = false,
  errorMessage,
}) => {
  const [title, setTitle] = useState(initialData?.title || 'OTHER GAMES');
  const [items, setItems] = useState<CorporateOtherGameItem[]>(initialData?.items || []);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const initialItemsStr = JSON.stringify(initialData?.items);

  useEffect(() => {
    setTitle(initialData?.title || 'OTHER GAMES');
    setItems(initialData?.items || []);
  }, [initialData?.title, initialItemsStr, initialData?.items]);

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleDeleteItem = (index: number) => {
    if (window.confirm(`Delete game "${items[index].title || 'Untitled'}"?`)) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSaveModal = (game: CorporateOtherGameItem) => {
    if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = game;
      setItems(updated);
    } else {
      setItems([...items, game]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSave({
      title,
      items,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Other Games Section</h2>
          <p className="text-gray-400 text-sm mt-1">
            Display other game attractions and activities available for corporate parties.
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. OTHER GAMES"
            className="w-full bg-[#121212] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#E1017D] transition-colors text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Featured Games ({items.length})</h3>
              <p className="text-xs text-gray-400">Attractions showcased on the corporate page</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="bg-[#E1017D] hover:bg-[#c2016c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              + Add Game
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#3A3530] rounded-xl bg-[#141414]">
              <p className="text-gray-400 text-sm mb-3">No other games added yet.</p>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="bg-[#2A2A2A] hover:bg-[#3A3530] text-white px-4 py-2 rounded-lg text-sm border border-[#3A3530] transition-colors"
              >
                Add Your First Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((game, idx) => (
                <div
                  key={idx}
                  className="bg-[#141414] border border-[#3A3530] hover:border-[#4A4540] rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div className="h-32 bg-[#222] relative overflow-hidden">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base leading-snug">
                        {game.title || 'Untitled Game'}
                      </h4>
                      <div className="mt-2 space-y-1 text-xs text-gray-400">
                        {game.bookNowLink && (
                          <div className="truncate">
                            <span className="text-gray-500">Book:</span> {game.bookNowLink}
                          </div>
                        )}
                        {game.learnMoreLink && (
                          <div className="truncate">
                            <span className="text-gray-500">Learn:</span> {game.learnMoreLink}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#2A2A2A] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(idx)}
                        className="flex-1 py-1.5 px-3 bg-[#E1017D]/10 hover:bg-[#E1017D] text-[#E1017D] hover:text-white border border-[#E1017D]/30 hover:border-[#E1017D] rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      >
                        <EditIcon size={14} color="currentColor" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#2A2A2A] rounded-lg transition-colors border border-transparent hover:border-[#3A3530]"
                        title="Delete game"
                      >
                        <TrashIcon size={16} color="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          {isSaving ? 'Saving...' : 'Save Other Games'}
        </button>
      </div>

      </form>

      <GameEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingIndex !== null ? items[editingIndex] : null}
      />
    </>
  );
};

export default CorporateOtherGamesForm;
