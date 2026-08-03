import React, { useState, useRef, useEffect } from 'react';
import type { HeaderSubItem } from './types';
import { EditIcon, TrashIcon } from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import Toggle from '@/components/common/Toggle';
import { useUpdateMenuItemMutation } from '@/hooks/useHeaderCategories';
import { deleteMenuItem, deleteGroupActivity, deleteTeamParty, deleteBoomBundle, deleteQueensNight } from '@/hooks/useHeaderSubItems';
import { useQueryClient } from '@tanstack/react-query';
import SimpleLinkModal from './SimpleLinkModal';
import ConfirmDeleteModal from '@/components/common/ConfirmDeleteModal';

interface SubItemListProps {
  subItems: HeaderSubItem[];
  categoryName: string;
  availableGames: HeaderSubItem[];
  categoryId: string;
  onUpdate: (newSubItems: HeaderSubItem[]) => void;
}

const SubItemList: React.FC<SubItemListProps> = ({ subItems, categoryName, categoryId, availableGames, onUpdate }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateMenuItemMutation = useUpdateMenuItemMutation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingSubItem, setEditingSubItem] = useState<HeaderSubItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<HeaderSubItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleVisibility = (id: string) => {
    const item = subItems.find(i => i.id === id);
    const newIsActive = item ? !!item.isHidden : false;

    // Optimistically update parent state
    onUpdate(subItems.map(item => 
      item.id === id ? { ...item, isHidden: !item.isHidden, isActive: newIsActive } : item
    ));

    // Send status update API request: PATCH /api/menu-items/:menuItemId
    updateMenuItemMutation.mutate({ menuItemId: id, payload: { isActive: newIsActive } });
  };

  const confirmDeleteSubItem = async () => {
    if (!deletingItem) return;
    const item = deletingItem;
    setIsDeleting(true);

    // Optimistically update parent state
    onUpdate(subItems.filter(i => i.id !== item.id));

    try {
      await deleteMenuItem(item.id);
      const type = item.type || item.pageType;
      if (item.linkedItemId) {
        if (type === 'group-activity') await deleteGroupActivity(item.linkedItemId).catch(() => {});
        else if (type === 'team-parties') await deleteTeamParty(item.linkedItemId).catch(() => {});
        else if (type === 'boom-bundle') await deleteBoomBundle(item.linkedItemId).catch(() => {});
        else if (type === 'queens-night') await deleteQueensNight(item.linkedItemId).catch(() => {});
      }
    } catch (err) {
      console.error('Error deleting menu item or entity:', err);
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }

    queryClient.invalidateQueries({ queryKey: ['header-categories'] });
  };

  const getItemType = (item: HeaderSubItem): string => {
    const rawType = item.type || item.pageType;
    if (!rawType) return 'link';
    return rawType;
  };

  const handleEditItem = (item: HeaderSubItem) => {
    const itemType = getItemType(item);
    if (['link', 'simple-link', 'custom', 'external'].includes(itemType)) {
      setEditingSubItem(item);
      setIsLinkModalOpen(true);
    } else {
      navigate(`/manage-header/${categoryId}/${itemType}/${item.id}`);
    }
  };

  const handleSaveSimpleLink = (savedItem: HeaderSubItem) => {
    const exists = subItems.some(i => i.id === savedItem.id);
    if (exists) {
      onUpdate(subItems.map(i => i.id === savedItem.id ? { ...i, ...savedItem } : i));
    } else {
      onUpdate([...subItems, savedItem]);
    }
  };

  const getTypeBadge = (typeStr: string) => {
    switch (typeStr) {
      case 'game':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-purple-900/40 text-purple-300 border border-purple-700/50">🎮 Game</span>;
      case 'group-activity':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-pink-900/40 text-pink-300 border border-pink-700/50">🎉 Group Activity</span>;
      case 'team-parties':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50">🤝 Team Parties</span>;
      case 'boom-bundle':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-900/40 text-amber-300 border border-amber-700/50">💥 Boom Bundle</span>;
      case 'queens-night':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-rose-900/40 text-rose-300 border border-rose-700/50">👑 Queens Night</span>;
      case 'custom':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">⚙️ Custom</span>;
      case 'external':
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">🌐 External</span>;
      case 'link':
      case 'simple-link':
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-gray-800 text-gray-300 border border-gray-600/50">🔗 Link</span>;
    }
  };

  return (
    <div className="pl-8 py-2">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Sub-items</h4>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-xs bg-[#2C2C2C] hover:bg-[#3A3530] text-white px-3 py-1.5 rounded transition-colors flex items-center gap-2"
          >
            + Add Sub-item
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#252525] border border-[#3A3530] rounded-lg shadow-lg overflow-hidden z-10">
              <button onClick={() => navigate(`/manage-header/${categoryId}/game/new`)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] hover:text-white transition-colors">
                🎮 Game
              </button>
              <button onClick={() => navigate(`/manage-header/${categoryId}/group-activity/new`)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] hover:text-white transition-colors">
                🎉 Group Activity
              </button>
              <button onClick={() => navigate(`/manage-header/${categoryId}/team-parties/new`)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] hover:text-white transition-colors">
                🤝 Team Parties
              </button>
              <button onClick={() => navigate(`/manage-header/${categoryId}/boom-bundle/new`)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] hover:text-white transition-colors">
                💥 Boom Bundle
              </button>
              <button onClick={() => navigate(`/manage-header/${categoryId}/queens-night/new`)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] hover:text-white transition-colors">
                👑 Queens Night
              </button>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setEditingSubItem(null);
                  setIsLinkModalOpen(true);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#2C2C2C] hover:text-white transition-colors border-t border-[#3A3530]"
              >
                🔗 Simple Link
              </button>
            </div>
          )}
        </div>
      </div>

      {subItems.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No sub-items added yet.</p>
      ) : (
        <div className="grid gap-2">
          {subItems.map((item) => {
            return (
              <div key={item.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg border border-[#3A3530]">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 bg-[#1C1C1C] rounded flex items-center justify-center text-gray-400">
                    {item.icon ? (
                      <img src={item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:') ? item.icon : `https://ui-avatars.com/api/?name=${item.name}&background=random`} alt={item.name} className="w-full h-full object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                    ) : (
                      <span className="text-xs">{item.name.substring(0, 2)}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className={`text-sm font-medium ${item.isHidden ? 'text-gray-500 line-through' : 'text-white'}`}>
                        {item.name}
                      </h5>
                      {getTypeBadge(getItemType(item))}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.slug ? (item.slug.startsWith('/') ? item.slug : `/${item.slug}`) : (item.path ? (item.path.startsWith('/') ? item.path : `/${item.path}`) : '')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div title={item.isHidden ? "Show Item" : "Hide Item"}>
                    <Toggle 
                      checked={!item.isHidden}
                      onChange={() => toggleVisibility(item.id)}
                      activeColor="#10A200"
                      inactiveColor="#EC221F"
                    />
                  </div>
                  <button 
                    onClick={() => handleEditItem(item)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <EditIcon size={18} color="currentColor" />
                  </button>
                  <button 
                    onClick={() => setDeletingItem(item)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon size={18} color="currentColor" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simple Link Modal */}
      <SimpleLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        categoryId={categoryId}
        categoryName={categoryName}
        initialData={editingSubItem}
        onSaveSuccess={handleSaveSimpleLink}
      />

      {/* Confirm Delete Sub-item Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        title="Delete Sub-item"
        message="Are you sure you want to delete this sub-item? This action cannot be undone."
        itemName={deletingItem?.name}
        isDeleting={isDeleting}
        onConfirm={confirmDeleteSubItem}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
};

export default SubItemList;
