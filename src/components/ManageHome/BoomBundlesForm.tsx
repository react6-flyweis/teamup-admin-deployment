import React, { useState, useEffect } from 'react';
import type { BoomBundle } from './types';
import { EditIcon, TrashIcon, EyeIcon, HideEyeIcon } from '@/assets/icons';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';

interface BoomBundlesFormProps {
  initialData: BoomBundle[];
  onSave?: (data: BoomBundle[]) => void;
  isSaving?: boolean;
}

const BoomBundlesForm: React.FC<BoomBundlesFormProps> = ({ initialData, onSave, isSaving }) => {
  const [bundles, setBundles] = useState<BoomBundle[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BoomBundle | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
  });

  useEffect(() => {
    setBundles(initialData);
  }, [initialData]);

  const handleOpenAddModal = () => {
    setEditingBundle(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      buttonText: '',
      buttonLink: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (bundle: BoomBundle) => {
    setEditingBundle(bundle);
    setFormData({
      title: bundle.title,
      description: bundle.description,
      imageUrl: bundle.imageUrl,
      buttonText: bundle.buttonText,
      buttonLink: bundle.buttonLink,
      isActive: bundle.isActive,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBundle(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedBundles: BoomBundle[];

    if (editingBundle) {
      updatedBundles = bundles.map(b =>
        b.id === editingBundle.id
          ? { ...b, ...formData }
          : b
      );
    } else {
      const newBundle: BoomBundle = {
        id: String(Date.now()),
        ...formData,
      };
      updatedBundles = [...bundles, newBundle];
    }

    setBundles(updatedBundles);
    if (onSave) {
      onSave(updatedBundles);
    }
    handleCloseModal();
  };

  const toggleVisibility = (id: string) => {
    const updated = bundles.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    setBundles(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bundle?')) {
      const updated = bundles.filter(b => b.id !== id);
      setBundles(updated);
    }
  };

  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 border border-[#3A3530]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Boom Bundles</h2>
        <button
          onClick={handleOpenAddModal}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add New Bundle
        </button>
      </div>

      <div className="space-y-4">
        {bundles.map((bundle) => (
          <div key={bundle.id} className={`p-4 rounded-lg border ${bundle.isActive ? 'border-[#3A3530] bg-[#222222]' : 'border-gray-800 bg-[#1A1A1A] opacity-75'}`}>
            <div className="flex gap-4">
              <img src={bundle.imageUrl} alt={bundle.title} className="w-36 aspect-[3/2] object-cover rounded bg-gray-800" />
              <div className="flex-1">
                <h4 className={`text-lg font-medium mb-1 ${bundle.isActive ? 'text-white' : 'text-gray-500'}`}>{bundle.title}</h4>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{bundle.description}</p>
                <div className="text-xs text-[#E1017D]">{bundle.buttonText} → {bundle.buttonLink}</div>
              </div>
              <div className="flex items-start gap-2">
                <button 
                  onClick={() => toggleVisibility(bundle.id)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={bundle.isActive ? "Hide" : "Show"}
                >
                  {bundle.isActive ? <EyeIcon size={20} color="currentColor" /> : <HideEyeIcon size={20} color="currentColor" />}
                </button>
                <button 
                  onClick={() => handleOpenEditModal(bundle)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit"
                >
                  <EditIcon size={20} color="currentColor" />
                </button>
                <button onClick={() => handleDelete(bundle.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors" title="Delete">
                  <TrashIcon size={20} color="currentColor" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={() => onSave && onSave(bundles)}
          disabled={isSaving}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Add / Edit Bundle Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-xl w-full max-w-lg p-6 shadow-2xl relative text-white">
            <h3 className="text-xl font-bold mb-4">
              {editingBundle ? 'Edit Boom Bundle' : 'Add New Boom Bundle'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. BOOM BUNDLES"
                  className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter bundle description..."
                  className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                />
              </div>

              <ImageInputWithUpload
                label="Bundle Image"
                hint="3:2 • Rec: 1200×800 px"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="/uploads/boom-bundles.jpg or https://..."
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
                    placeholder="BOOK MY BUNDLE"
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
                    placeholder="/bundles"
                    className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#2A2A2A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {editingBundle ? 'Save Changes' : 'Add Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoomBundlesForm;

