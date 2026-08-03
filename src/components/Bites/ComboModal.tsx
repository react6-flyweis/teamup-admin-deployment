import React from 'react';
import type { ComboItem } from './ComboCard';

interface ComboModalProps {
  combo?: ComboItem;
  onClose: () => void;
  onSave: (combo: Partial<ComboItem>) => void;
  isSaving?: boolean;
}

const ComboModal: React.FC<ComboModalProps> = ({ combo, onClose, onSave, isSaving = false }) => {
  const [values, setValues] = React.useState<Partial<ComboItem>>({
    title: combo?.title || combo?.name || (combo?.id ? `Combo ${combo.id}` : ''),
    subtitle: combo?.subtitle || "here's what's included",
    name: combo?.name || combo?.title || '',
    pizza: combo?.pizza || '',
    bevvies: combo?.bevvies || '',
    burger: combo?.burger || '',
    welcomeBevvy: combo?.welcomeBevvy || '',
    shots: combo?.shots || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  const handleChange = (field: keyof ComboItem, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#F9D2EA] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            {combo ? `Edit ${combo.title || combo.name || `Combo ${combo.id}`}` : 'Add A New Combo'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-6 h-6 bg-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M15 5L5 15M5 5L15 15" stroke="#000" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        <hr className="border-black mb-6" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Combo Title</label>
              <input
                type="text"
                value={values.title || ''}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
                placeholder="e.g. Combo 1"
                required
              />
            </div>
            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Subtitle</label>
              <input
                type="text"
                value={values.subtitle || ''}
                onChange={e => handleChange('subtitle', e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
                placeholder="e.g. included items"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Pizza */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Pizza</label>
              <input
                type="text"
                value={values.pizza}
                onChange={e => handleChange('pizza', e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
                placeholder="Enter pizza details"
              />
            </div>
            {/* Bevvies */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Bevvies</label>
              <input
                type="text"
                value={values.bevvies}
                onChange={e => handleChange('bevvies', e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
                placeholder="Enter bevvies details"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Burger */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Burger</label>
              <input
                type="text"
                value={values.burger}
                onChange={e => handleChange('burger', e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
                placeholder="Enter burger details"
              />
            </div>
            {/* Welcome Bevy */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Welcome BEVY!</label>
              <input
                type="text"
                value={values.welcomeBevvy}
                onChange={e => handleChange('welcomeBevvy', e.target.value)}
                className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
                placeholder="Enter welcome bevvy details"
              />
            </div>
          </div>

          {/* Shots */}
          <div>
            <label className="block text-sm font-medium text-black mb-1">Shots!!!</label>
            <input
              type="text"
              value={values.shots}
              onChange={e => handleChange('shots', e.target.value)}
              className="w-full p-3 border border-[#AEB4C2] rounded-lg bg-white text-black"
              placeholder="Enter shots details"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2 border border-[#7E0B0B] text-[#7E0B0B] rounded-lg disabled:opacity-50 hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#E1017D] text-white rounded-lg disabled:opacity-50 flex items-center gap-2 font-semibold hover:bg-[#c9016f]"
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              )}
              {isSaving ? 'Saving...' : (combo ? 'Save Changes' : 'Add Combo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComboModal;

