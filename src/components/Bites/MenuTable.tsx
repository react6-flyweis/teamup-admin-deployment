import React from 'react';
import Toggle from '../common/Toggle';
import HorizontalDotsIcon from '../../assets/icons/HorizontalDotsIcon';
import EditPencilIcon from '../../assets/icons/EditIcon';
import TrashIcon from '../../assets/icons/TrashIcon';
import Pagination from '../../utils/Pagination';
import type { MenuItem } from '@/pages/Bites';

import BloodyMaryImage from '../../assets/Bloody Mary.png';
import BurgerImage from '../../assets/Fried Chicken Burger.png';
import TaterTotsImage from '../../assets/Tater Tots.png';
import CoronaImage from '../../assets/Corona.png';

const getImageSrc = (imagePath: string, name: string) => {
  if (!imagePath) {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('mary')) return BloodyMaryImage;
    if (lowerName.includes('burger') || lowerName.includes('chicken')) return BurgerImage;
    if (lowerName.includes('tots')) return TaterTotsImage;
    if (lowerName.includes('corona')) return CoronaImage;
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
  }
  if (imagePath.startsWith('data:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${cleanBase}${imagePath}`;
};

interface MenuTableProps {
  items: MenuItem[];
  onToggleAvailability: (id: string, availability: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  isProcessing?: boolean;
}

const MenuTable: React.FC<MenuTableProps> = ({
  items,
  onToggleAvailability,
  onEdit,
  onDelete,
  isProcessing = false
}) => {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  // Click outside handler for action menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEditModal && 
          !(event.target as Element).closest('.action-menu') && 
          !(event.target as Element).closest('.menu-trigger')) {
        setShowEditModal(false);
        setSelectedItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEditModal]);

  return (
    <div className={`rounded-lg overflow-hidden relative ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}>
      {isProcessing && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E1017D]"></div>
        </div>
      )}
      {/* Table Header */}
      <div className="bg-[#F9D2EA] p-4 grid grid-cols-7 gap-4">
        <div className="font-bold text-black">Image</div>
        <div className="font-bold text-black">Item</div>
        <div className="font-bold text-black">Category</div>
        <div className="font-bold text-black">Category Detail</div>
        <div className="font-bold text-black">Availability</div>
        <div className="font-bold text-black">Description</div>
        <div className="font-bold text-black">Action</div>
      </div>

      {/* Table Body */}
      {paginatedItems.map((item, index) => (
        <div 
          key={item.id}
          className={`p-4 grid grid-cols-7 gap-4 items-center ${
            index % 2 === 0 ? 'bg-[#FDECF6]' : 'bg-[#FFFBFD]'
          }`}
        >
          <div>
            <img src={getImageSrc(item.image, item.name)} alt={item.name} className="w-8 h-8 rounded object-cover" />
          </div>
          <div className="text-black">{item.name}</div>
          <div className="text-black">{item.category}</div>
          <div className="text-black">{item.subCategory}</div>
          <div className="flex items-center">
            <Toggle
              checked={item.availability}
              onChange={(checked) => onToggleAvailability(item.id, checked)}
              activeColor="#14AE5C"
              inactiveColor="#EC221F"
              activeText="Available"
              inactiveText="Out of Stock"
            />
          </div>
          <div className="text-black">{item.description}</div>
          <div className="relative group">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (selectedItem?.id === item.id) {
                  setShowEditModal(false);
                  setSelectedItem(null);
                } else {
                  setSelectedItem(item);
                  setShowEditModal(true);
                }
              }}
              className="menu-trigger p-1 hover:bg-gray-100 rounded relative"
            >
              <div className="cursor-pointer">
                <HorizontalDotsIcon />
              </div>
            </button>
            {showEditModal && selectedItem?.id === item.id && (
              <div 
                className={`action-menu absolute w-[122px] bg-white border border-[#570B39] shadow-lg z-50 
                  ${index >= paginatedItems.length - 2 ? 'bottom-full right-0 mb-1 rounded-[12px_12px_12px_4px]' : 'top-full right-0 mt-1 rounded-[4px_12px_12px_12px]'}`}
              >
                <button 
                  className="flex items-center w-full px-6 py-3 gap-2 hover:bg-gray-50 text-black border-b border-[#898989]"
                  onClick={() => onEdit(item)}
                >
                  <EditPencilIcon size={20} color="#0A0A0A" />
                  <span className="font-bold">Edit</span>
                </button>
                <button 
                  className="flex items-center w-full px-6 py-3 gap-2 hover:bg-gray-50 text-black"
                  onClick={() => onDelete(item)}
                >
                  <TrashIcon size={20} color="#0A0A0A" />
                  <span className="font-bold">Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-end p-4">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page: number) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default MenuTable;
