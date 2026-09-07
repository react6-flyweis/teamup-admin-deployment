import React, { useState, useEffect, useRef } from 'react';
import { CloseIcon, UploadIcon } from '@/assets/icons';
import { createMenuItem, updateMenuItem } from '@/hooks/useHeaderSubItems';
import type { HeaderSubItem } from './types';
import { uploadFile } from '@/utils/fileUpload';
import { useQueryClient } from '@tanstack/react-query';

interface SimpleLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName?: string;
  initialData?: HeaderSubItem | null;
  onSaveSuccess?: (subItem: HeaderSubItem) => void;
}

const SimpleLinkModal: React.FC<SimpleLinkModalProps> = ({
  isOpen,
  onClose,
  categoryId,
  categoryName = 'Category',
  initialData,
  onSaveSuccess,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(false);
  const iconFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPath(initialData.path || initialData.slug || '');
      setIcon(initialData.icon || '');
    } else {
      setName('');
      setPath('');
      setIcon('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setIcon(url);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const linkUrl = path.trim();
    const subItemName = name.trim();

    try {
      if (initialData?.id && initialData.id !== 'new') {
        await updateMenuItem(initialData.id, {
          title: subItemName,
          name: subItemName,
          section: categoryId,
          sectionLabel: categoryName,
          linkUrl: linkUrl,
          path: linkUrl,
          icon: icon,
          iconUrl: icon,
          type: 'simple-link',
          isActive: initialData.isActive ?? true,
        });
      } else {
        await createMenuItem({
          title: subItemName,
          name: subItemName,
          section: categoryId,
          sectionLabel: categoryName,
          linkUrl: linkUrl,
          path: linkUrl,
          icon: icon,
          iconUrl: icon,
          type: 'simple-link',
          order: 1,
          isActive: true,
        });
      }
    } catch (err) {
      console.error('Error saving simple link sub-item:', err);
    }

    const savedSubItem: HeaderSubItem = {
      id: initialData?.id || Date.now().toString(),
      name: subItemName,
      path: linkUrl,
      slug: linkUrl,
      icon: icon,
      type: 'simple-link',
      pageType: 'simple-link',
      isHidden: false,
      isActive: true,
    };

    if (onSaveSuccess) {
      onSaveSuccess(savedSubItem);
    }

    await queryClient.invalidateQueries({ queryKey: ['header-categories'] });
    setLoading(false);
    onClose();
  };

  const inputCls =
    'w-full bg-[#2A2A2A] border border-[#3A3530] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#E1017D] transition-colors';
  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1C1C1C] rounded-2xl w-full max-w-md flex flex-col border border-[#3A3530] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#3A3530] bg-[#252525]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {initialData ? 'Edit Simple Link' : 'Add Simple Link'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Add a quick link sub-item without full page details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#3A3530] rounded-lg transition-all"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelCls}>Item Name (Display Title)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Special Deals"
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>URL Path / Link</label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="e.g. /deals or https://..."
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Nav Icon (Optional) <span className="text-xs text-gray-400 font-normal ml-1.5">(1:1 Square • Rec: 160×160 px • SVG/PNG)</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {icon ? (
                  <div className="w-14 h-14 rounded-xl bg-[#2A2A2A] border border-[#3A3530] overflow-hidden flex items-center justify-center group relative">
                    <img
                      src={icon}
                      alt="icon"
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setIcon('')}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => iconFileRef.current?.click()}
                    className="w-14 h-14 rounded-xl bg-[#2A2A2A] border border-dashed border-[#3A3530] hover:border-[#E1017D] flex flex-col items-center justify-center text-gray-500 hover:text-[#E1017D] transition-colors"
                  >
                    <UploadIcon />
                    <span className="text-[9px] mt-0.5">Icon</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={iconFileRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Or paste icon URL"
                className={`${inputCls} flex-1 text-sm`}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm bg-[#E1017D] hover:bg-pink-700 text-white rounded-lg transition-colors font-semibold shadow-md flex items-center gap-2"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {initialData ? 'Update Link' : 'Add Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleLinkModal;
