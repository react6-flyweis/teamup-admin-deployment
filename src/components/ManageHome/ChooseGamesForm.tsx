import React, { useState, useEffect } from 'react';
import { useHomeQuery, useUpdateHomeMutation, type ChooseGameSectionData, type ChooseGameItem } from '@/hooks/useHome';
import { EditIcon, TrashIcon, EyeIcon, HideEyeIcon, CloseIcon } from '@/assets/icons';
import ImageInputWithUpload from '@/components/common/ImageInputWithUpload';
import { isVideoUrl, resolvePreviewUrl } from '@/utils/mediaUtils';
import { MAX_VIDEO_SIZE_MB } from '@/constants/upload';

interface ChooseGamesFormProps {
  initialData?: ChooseGameSectionData;
  onSave?: (data: ChooseGameSectionData) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
}

const ChooseGamesForm: React.FC<ChooseGamesFormProps> = ({
  initialData,
  onSave,
  isSaving,
  errorMessage,
}) => {
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
    videoUrl: '',
    buttonText: 'Book',
    buttonLink: '',
    learnMoreText: '',
    learnMoreLink: '',
    order: 1,
    isActive: true,
  });

  const handleOpenAddModal = () => {
    setEditingIndex(null);
    setFormData({
      title: '',
      imageUrl: '',
      videoUrl: '',
      buttonText: 'Book',
      buttonLink: '',
      learnMoreText: '',
      learnMoreLink: '',
      order: items.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ChooseGameItem, index: number) => {
    setEditingIndex(index);
    const videoUrl = item.videoUrl || (isVideoUrl(item.imageUrl) ? item.imageUrl : '');
    const imageUrl = isVideoUrl(item.imageUrl) ? '' : (item.imageUrl || '');
    setFormData({
      ...item,
      imageUrl,
      videoUrl,
      buttonText: item.buttonText || 'Book',
      buttonLink: item.buttonLink || '',
      learnMoreText: item.learnMoreText || '',
      learnMoreLink: item.learnMoreLink || '',
    });
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
      updatedItems = items.map((item, idx) =>
        idx === editingIndex
          ? { ...formData, order: item.order ?? idx + 1 }
          : item
      );
    } else {
      updatedItems = [...items, { ...formData, order: items.length + 1 }];
    }

    setItems(updatedItems);
    handleCloseModal();
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    const reordered = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
    setItems(reordered);
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
            <div
              className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden bg-gray-800 shrink-0"
              style={{ aspectRatio: '1 / 1' }}
            >
              {(() => {
                const hasVideo = Boolean(item.videoUrl) || isVideoUrl(item.imageUrl);
                const videoSrc = item.videoUrl || (isVideoUrl(item.imageUrl) ? item.imageUrl : '');
                const imageSrc = !isVideoUrl(item.imageUrl) ? item.imageUrl : '';

                if (hasVideo && videoSrc) {
                  return (
                    <video
                      src={resolvePreviewUrl(videoSrc)}
                      poster={imageSrc ? resolvePreviewUrl(imageSrc) : undefined}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  );
                }

                return (
                  <img
                    src={resolvePreviewUrl(imageSrc || item.imageUrl)}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                    }}
                  />
                );
              })()}
              <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                {(Boolean(item.videoUrl) || isVideoUrl(item.imageUrl)) && (
                  <span className="bg-black/70 text-[#E1017D] text-[11px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E1017D] animate-pulse"></span>
                    Video
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 right-2 z-10">
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    item.isActive
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h4 className={`text-base font-bold mb-1 ${item.isActive ? 'text-white' : 'text-gray-400'}`}>
                {item.title}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="bg-[#2A2A2A] px-2 py-1 rounded text-[#E1017D] font-medium">
                  {item.buttonText || 'Book'}
                </span>
                <span className="truncate text-gray-400 max-w-[120px]" title={item.buttonLink}>
                  {item.buttonLink}
                </span>
                {item.learnMoreText && (
                  <span className="bg-[#2A2A2A] px-2 py-1 rounded text-cyan-400 font-medium">
                    {item.learnMoreText}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#3A3530]/50">
              {/* Only Up and Down buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, 'up')}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2A2A2A] hover:bg-[#3A3530] text-gray-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer border border-[#3A3530]"
                  title="Move Up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 'down')}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2A2A2A] hover:bg-[#3A3530] text-gray-300 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer border border-[#3A3530]"
                  title="Move Down"
                >
                  ▼
                </button>
              </div>

              <div className="flex items-center gap-1">
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
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500 border border-dashed border-[#3A3530] rounded-lg">
          No games added yet. Click "Add New Game" to create one.
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4">
        {errorMessage && (
          <div className="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#E1017D] hover:bg-[#c0016a] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
        >
          {saving && (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Add / Edit Game Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-xl w-full max-w-2xl p-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
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

              {/* Media Inputs (Image + Video) */}
              <div className="space-y-4">
                {/* Game Image (Fallback Poster) */}
                <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-4">
                  <ImageInputWithUpload
                    label="Game Image (Initial / Fallback Poster)"
                    hint="1:1 Square • Rec: 800×800 px • WebP/JPG/PNG"
                    value={formData.imageUrl}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    placeholder="Paste image URL or click upload"
                    accept="image/*"
                    aspectRatio="1:1"
                    previewWidth="w-28"
                    buttonText="Upload Image"
                    inputClassName="w-full bg-[#1C1C1C] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                    labelClassName="block text-sm font-medium text-gray-300 mb-1"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Displays immediately as poster and fallback if video is loading or on low-power devices.
                  </p>
                </div>

                {/* Game Video (Optional) */}
                <div className="bg-[#242424] border border-[#3A3530] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">Game Video (Optional)</span>
                    {formData.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 transition-colors cursor-pointer"
                      >
                        Remove Video
                      </button>
                    )}
                  </div>
                  <ImageInputWithUpload
                    hint={`1:1 Square • MP4/WebM • Max ${MAX_VIDEO_SIZE_MB}MB`}
                    value={formData.videoUrl || ''}
                    onChange={(url) => setFormData({ ...formData, videoUrl: url })}
                    placeholder="Paste video URL or click upload"
                    accept="video/*"
                    aspectRatio="1:1"
                    previewWidth="w-28"
                    buttonText="Upload Video"
                    inputClassName="w-full bg-[#1C1C1C] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                    labelClassName="block text-sm font-medium text-gray-300 mb-1"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Autoplays in a loop with the image above as poster fallback. Leave empty to use only the image.
                  </p>
                </div>
              </div>

              {/* Buttons (Primary + Learn More) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Button */}
                <div className="p-3 border border-[#3A3530] rounded-lg bg-[#222222]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Primary Button (Book)</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Button Text</label>
                      <input
                        type="text"
                        required
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="Book"
                        className="w-full bg-[#1A1A1A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Button Link</label>
                      <input
                        type="text"
                        required
                        value={formData.buttonLink}
                        onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                        placeholder="/games/golf"
                        className="w-full bg-[#1A1A1A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                      />
                    </div>
                  </div>
                </div>

                {/* Learn More Button */}
                <div className="p-3 border border-[#3A3530] rounded-lg bg-[#222222]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Learn More Button</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={formData.learnMoreText || ''}
                        onChange={(e) => setFormData({ ...formData, learnMoreText: e.target.value })}
                        placeholder="e.g. Learn More"
                        className="w-full bg-[#1A1A1A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Button Link</label>
                      <input
                        type="text"
                        value={formData.learnMoreLink || ''}
                        onChange={(e) => setFormData({ ...formData, learnMoreLink: e.target.value })}
                        placeholder="e.g. /games/golf#learn-more"
                        className="w-full bg-[#1A1A1A] border border-[#3A3530] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E1017D]"
                      />
                    </div>
                  </div>
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



