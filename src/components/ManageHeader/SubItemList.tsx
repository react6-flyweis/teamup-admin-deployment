import React, { useState, useRef, useEffect } from 'react';
import type { HeaderSubItem } from './types';
import { EditIcon, TrashIcon } from '@/assets/icons';
import { useNavigate } from 'react-router-dom';
import Toggle from '@/components/common/Toggle';
import { useUpdateMenuItemStatusMutation } from '@/hooks/useHeaderCategories';

interface SubItemListProps {
  subItems: HeaderSubItem[];
  categoryName: string;
  availableGames: HeaderSubItem[];
  categoryId: string;
  onUpdate: (newSubItems: HeaderSubItem[]) => void;
}

const SubItemList: React.FC<SubItemListProps> = ({ subItems, categoryName, categoryId, availableGames, onUpdate }) => {
  const navigate = useNavigate();
  const updateMenuItemStatus = useUpdateMenuItemStatusMutation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      item.id === id ? { ...item, isHidden: !item.isHidden } : item
    ));

    // Send status update API request: PATCH /api/menu-items/:menuItemId
    updateMenuItemStatus.mutate({ menuItemId: id, isActive: newIsActive });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sub-item?')) {
      onUpdate(subItems.filter(item => item.id !== id));
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
            </div>
          )}
        </div>
      </div>

      {subItems.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No sub-items added yet.</p>
      ) : (
        <div className="grid gap-2">
          {subItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg border border-[#3A3530]">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-8 h-8 bg-[#1C1C1C] rounded flex items-center justify-center text-gray-400">
                  {/* Just showing text or initials if no image is available, can be updated later to show actual icons */}
                  {item.icon ? (
                    <img src={item.icon.startsWith('http') || item.icon.startsWith('/') || item.icon.startsWith('data:') ? item.icon : `https://ui-avatars.com/api/?name=${item.name}&background=random`} alt={item.name} className="w-full h-full object-cover rounded" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                  ) : (
                    <span className="text-xs">{item.name.substring(0, 2)}</span>
                  )}
                </div>
                <div>
                  <h5 className={`text-sm font-medium ${item.isHidden ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {item.name}
                  </h5>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.slug ? (item.slug.startsWith('/') ? item.slug : `/${item.slug}`) : (item.path.startsWith('/') ? item.path : `/${item.path}`)}
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
                  onClick={() => navigate(`/manage-header/${categoryId}/${item.pageType || 'game'}/${item.id}`)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <EditIcon size={18} color="currentColor" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <TrashIcon size={18} color="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default SubItemList;
