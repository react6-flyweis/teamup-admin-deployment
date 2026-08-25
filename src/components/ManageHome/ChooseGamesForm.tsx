import React, { useState, useEffect } from 'react';
import { useHomeQuery, useUpdateHomeMutation, type ChooseGameSectionData, type ChooseGameItem } from '@/hooks/useHome';
import { EditIcon, TrashIcon, EyeIcon, HideEyeIcon, CloseIcon } from '@/assets/icons';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface ChooseGamesFormProps {
  initialData?: ChooseGameSectionData;
  onSave?: (data: ChooseGameSectionData) => void;
  isSaving?: boolean;
}

const ChooseGamesForm: React.FC<ChooseGamesFormProps> = ({ initialData, onSave, isSaving }) => {
  const { data: homeQueryData, isLoading: isQueryLoading, error: queryError } = useHomeQuery();
  const updateHomeMutation = useUpdateHomeMutation();

  const sectionDataFromQuery = homeQueryData?.content?.data?.chooseGameSection;
  const effectiveData = initialData || sectionDataFromQuery;

  const [title, setTitle] = useState(effectiveData?.title || '');
  const [subtitle, setSubtitle] = useState(effectiveData?.subtitle || '');
  const [items, setItems] = useState<ChooseGameItem[]>(effectiveData?.items || []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || 'Choose Your Game');
      setSubtitle(initialData.subtitle || 'Manage the games shown on the homepage.');
      setItems(initialData.items || []);
    } else if (sectionDataFromQuery) {
      setTitle(sectionDataFromQuery.title || 'Choose Your Game');
      setSubtitle(sectionDataFromQuery.subtitle || 'Manage the games shown on the homepage.');
      setItems(sectionDataFromQuery.items || []);
    }
  }, [initialData, sectionDataFromQuery]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ChooseGameItem>({
    title: '',
    imageUrl: '',
    buttonText: 'Book',
    buttonLink: '',
    order: 1,
    isActive: true,
  });

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      imageUrl: '',
      buttonText: 'Book',
      buttonLink: '',
      order: items.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ChooseGameItem, index: number) => {
    setEditingIndex(index);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedItems: ChooseGameItem[];

    if (editingIndex !== null) {
      updatedItems = items.map((item, idx) => (idx === editingIndex ? formData : item));
    } else {
      updatedItems = [...items, formData];
    }

    setItems(updatedItems);
    handleCloseModal();
  };

  const toggleVisibility = (index: number) => {
    const updated = items.map((item, idx) => (idx === index ? { ...item, isActive: !item.isActive } : item));
    setItems(updated);
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this game item?')) {
      const updated = items.filter((_, idx) => idx !== index);
      setItems(updated);
    }
  };

  const handleSave = () => {
    const payload: ChooseGameSectionData = {
      title,
      subtitle,
      items,
    };
    if (onSave) {
      onSave(payload);
    } else {
      updateHomeMutation.mutate({
        data: {
          chooseGameSection: payload,
        },
      });
    }
  };

  if (!initialData && isQueryLoading) {
    return (
      <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530] flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E1017D]"></div>
      </div>
    );
  }

  if (!initialData && queryError) {
    return (
      <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
        <div className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          Failed to load Choose Game content. Please try again later.
        </div>
      </div>
    );
  }

  const saving = isSaving || updateHomeMutation.isPending;

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      {/* Header & Add button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Choose Your Game Section</h2>
          <p className="text-sm text-gray-400 mt-1">Manage the title, subtitle, and game items displayed on the homepage.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Add New Game
        </button>
      </div>

      {/* Section Title & Subtitle Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-b border-[#3A3530] pb-6">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Section Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
            placeholder="Choose Your Game"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Section Subtitle</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
            placeholder="Manage the games shown on the homepage."
          />
        </div>
      </div>

      {/* Game Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex flex-col p-4 border rounded-lg transition-all ${
              item.isActive ? 'border-[#3A3530] bg-[#222222]' : 'border-gray-800 bg-[#1A1A1A] opacity-75'
            }`}
          >
            <div className="relative h-40 w-full mb-3 rounded overflow-hidden bg-gray-800">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x250?text=No+Image';
                }}
              />
              <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-mono">
                #{item.order}
              </span>
              <span
                className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-medium ${
                  item.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}
              >
                {item.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>

            <div className="flex-1">
              <h4 className={`text-base font-bold mb-1 ${item.isActive ? 'text-white' : 'text-gray-400'}`}>
                {item.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="bg-[#2A2A2A] px-2 py-1 rounded text-[#E1017D] font-medium">
                  {item.buttonText || 'Book'}
                </span>
                <span className="truncate text-gray-400" title={item.buttonLink}>
                  {item.buttonLink}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#3A3530]/50">
              <button
                type="button"
                onClick={() => toggleVisibility(index)}
                className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title={item.isActive ? 'Hide' : 'Show'}
              >
                {item.isActive ? <EyeIcon size={18} color="currentColor" /> : <HideEyeIcon size={18} color="currentColor" />}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditModal(item, index)}
                className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                title="Edit Game"
              >
                <EditIcon size={18} color="currentColor" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="p-1.5 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                title="Delete Game"
              >
                <TrashIcon size={18} color="currentColor" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-[#3A3530] rounded-lg">
          No games added yet. Click "Add New Game" to create one.
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Add / Edit Game Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-xl w-full max-w-lg p-6 shadow-2xl relative text-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingIndex !== null ? 'Edit Game Item' : 'Add New Game Item'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. INDOOR MINI GOLF"
                  className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                />
              </div>

              <ImageInputWithUpload
                label="Game Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="/uploads/indoor-mini-golf.jpg or https://..."
                inputClassName="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                labelClassName="block text-sm font-medium text-gray-300 mb-1"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    required
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Book"
                    className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Button Link</label>
                  <input
                    type="text"
                    required
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/games/golf"
                    className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <label className="inline-flex items-center cursor-pointer gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E1017D] relative"></div>
                    <span className="text-sm font-medium text-gray-300">
                      {formData.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  {editingIndex !== null ? 'Save Changes' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChooseGamesForm;



