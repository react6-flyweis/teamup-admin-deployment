import React, { useState } from 'react';
import ComboCard, { type ComboItem } from './ComboCard';
import ComboModal from './ComboModal';
import ConfirmDeleteModal from '../common/ConfirmDeleteModal';
import {
  useFoodCombosQuery,
  useCreateFoodComboMutation,
  useUpdateFoodComboMutation,
  useDeleteFoodComboMutation,
  type FoodCombo
} from '../../hooks/useBites';

const FoodComboSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showComboModal, setShowComboModal] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<ComboItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ComboItem | null>(null);

  // Queries & Mutations for Food Combos API
  const { data: foodCombos = [], isLoading } = useFoodCombosQuery(searchQuery, 'order', 'asc');
  const createComboMutation = useCreateFoodComboMutation();
  const updateComboMutation = useUpdateFoodComboMutation();
  const deleteComboMutation = useDeleteFoodComboMutation();

  // Map API response to ComboItem UI model
  const combos: ComboItem[] = foodCombos.map((item: FoodCombo, idx: number) => ({
    id: item._id || item.id || idx + 1,
    _id: item._id || item.id,
    title: item.title,
    subtitle: item.subtitle,
    name: item.title,
    pizza: item.pizza || '',
    bevvies: item.bevvies || '',
    burger: item.burger || '',
    welcomeBevvy: item.welcomeBevy || item.welcomeBevvy || '',
    shots: item.shots || '',
    isActive: item.isActive ?? true,
    order: item.order ?? idx + 1
  }));

  const handleAddClick = () => {
    setSelectedCombo(null);
    setShowComboModal(true);
  };

  const handleEditCombo = (id: string | number) => {
    const combo = combos.find(c => (c._id || c.id) === id);
    if (combo) {
      setSelectedCombo(combo);
      setShowComboModal(true);
    }
  };

  const handleToggleActive = (id: string | number, currentStatus: boolean) => {
    const stringId = String(id);
    updateComboMutation.mutate({
      id: stringId,
      payload: { isActive: !currentStatus }
    });
  };

  const handleDeleteClick = (id: string | number) => {
    const combo = combos.find(c => (c._id || c.id) === id);
    if (combo) {
      setItemToDelete(combo);
    }
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const targetId = String(itemToDelete._id || itemToDelete.id);
    deleteComboMutation.mutate(targetId, {
      onSuccess: () => {
        setItemToDelete(null);
      }
    });
  };

  const handleCloseModal = () => {
    setShowComboModal(false);
    setSelectedCombo(null);
  };

  const handleSaveCombo = (updatedCombo: Partial<ComboItem>) => {
    const payload = {
      title: updatedCombo.title || updatedCombo.name || 'Food Combo',
      subtitle: updatedCombo.subtitle || "here's what's included",
      pizza: updatedCombo.pizza || '',
      bevvies: updatedCombo.bevvies || '',
      burger: updatedCombo.burger || '',
      welcomeBevy: updatedCombo.welcomeBevvy || '',
      shots: updatedCombo.shots || ''
    };

    if (selectedCombo) {
      const targetId = String(selectedCombo._id || selectedCombo.id);
      updateComboMutation.mutate(
        { id: targetId, payload },
        {
          onSuccess: () => {
            handleCloseModal();
          }
        }
      );
    } else {
      createComboMutation.mutate(
        { ...payload, isActive: true },
        {
          onSuccess: () => {
            handleCloseModal();
          }
        }
      );
    }
  };

  const isSaving = createComboMutation.isPending || updateComboMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Our Food Combos</h2>
          <p className="text-sm text-gray-400">Manage all food combo packages</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search combos..."
              className="w-full pl-9 pr-4 py-2 bg-[#242424] border border-[#333] rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#E1017D]"
            />
            <svg
              className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={handleAddClick}
            className="bg-[#E1017D] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[#c9016f] transition-colors flex items-center gap-2 text-sm shrink-0 cursor-pointer"
          >
            <span>Add A New Combo</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E1017D]"></div>
        </div>
      ) : combos.length === 0 ? (
        <div className="text-center py-12 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A]">
          <p className="text-gray-400">No food combos found.</p>
        </div>
      ) : (
        <div className="flex gap-5 flex-wrap justify-start">
          {combos.map(combo => (
            <ComboCard
              key={combo._id || combo.id}
              combo={combo}
              onEdit={handleEditCombo}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {showComboModal && (
        <ComboModal
          combo={selectedCombo || undefined}
          onClose={handleCloseModal}
          onSave={handleSaveCombo}
          isSaving={isSaving}
        />
      )}

      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={!!itemToDelete}
          title="Delete Food Combo"
          message="Are you sure you want to delete this food combo? This action cannot be undone."
          itemName={itemToDelete.title || itemToDelete.name || `Combo ${itemToDelete.id}`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setItemToDelete(null)}
          isDeleting={deleteComboMutation.isPending}
        />
      )}
    </div>
  );
};

export default FoodComboSection;
