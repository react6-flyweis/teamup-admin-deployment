import React from 'react';

export interface ComboItem {
  id?: string | number;
  _id?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  pizza: string;
  bevvies: string;
  burger: string;
  welcomeBevvy: string;
  shots: string;
  isActive?: boolean;
  order?: number;
}

interface ComboCardProps {
  combo: ComboItem;
  onEdit: (id: string | number) => void;
  onToggleActive?: (id: string | number, currentStatus: boolean) => void;
  onDelete?: (id: string | number) => void;
}

const ComboCard: React.FC<ComboCardProps> = ({ combo, onEdit, onToggleActive, onDelete }) => {
  const comboId = combo._id || combo.id;
  const isCurrentlyActive = combo.isActive !== false;

  return (
    <div className={`bg-[#F9D2EA] rounded-2xl p-6 w-[380px] flex flex-col justify-between transition-opacity ${!isCurrentlyActive ? 'opacity-60' : ''}`}>
      <div className="flex flex-col gap-2">
        {/* Action Header */}
        <div className="flex justify-between items-center mb-2">
          {/* Active Status Badge / Toggle */}
          <div className="flex items-center gap-2">
            {onToggleActive && comboId !== undefined && (
              <button
                type="button"
                onClick={() => onToggleActive(comboId, isCurrentlyActive)}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                  isCurrentlyActive
                    ? 'bg-green-800 text-green-100 hover:bg-green-900'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-800'
                }`}
                title="Click to toggle status"
              >
                {isCurrentlyActive ? 'Active' : 'Inactive'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Button */}
            <button
              onClick={() => comboId !== undefined && onEdit(comboId)}
              className="bg-[#003240] text-white px-3 py-1 rounded-lg font-semibold text-xs hover:bg-[#00242e] transition-colors"
            >
              Edit
            </button>
            {/* Delete Button */}
            {onDelete && comboId !== undefined && (
              <button
                onClick={() => onDelete(comboId)}
                className="bg-red-600 text-white px-3 py-1 rounded-lg font-semibold text-xs hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Combo Title & Subtitle */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-black">{combo.title || combo.name || `Combo ${combo.id}`}</h3>
          <p className="text-sm font-semibold text-black/80">{combo.subtitle || "here's what's included"}</p>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-black">Pizza</span>
            <span className="text-sm font-semibold text-black text-right">{combo.pizza}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-black">Bevvies</span>
            <span className="text-sm font-semibold text-black text-right">{combo.bevvies}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-black">Burger</span>
            <span className="text-sm font-semibold text-black text-right">{combo.burger}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-black">Welcome BEVY!</span>
            <span className="text-sm font-semibold text-black text-right">{combo.welcomeBevvy}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-black">Shots!!!</span>
            <span className="text-sm font-semibold text-black text-right">{combo.shots}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComboCard;

