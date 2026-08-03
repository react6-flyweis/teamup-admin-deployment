import React, { useState } from 'react';
import { useCreateLocationMutation } from '@/hooks/useLocations';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const createLocation = useCreateLocationMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !state.trim() || !address.trim()) return;

    try {
      await createLocation.mutateAsync({
        name: name.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        address: address.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      setName('');
      setCity('');
      setState('');
      setAddress('');
      setPhone('');
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#1C1C1C] border border-[#3A3530] rounded-xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#3A3530] mb-4">
          <h3 className="text-lg font-semibold text-white">Add New Location</h3>
          <button
            onClick={onClose}
            disabled={createLocation.isPending}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Location Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Postman Eastvale"
              className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00B4D8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                City <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Eastvale"
                className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                State Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="e.g. CA"
                className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Address <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 123 Main Street, Eastvale, CA"
              className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00B4D8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. (555) 000-0000"
                className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. info@location.com"
                className="w-full bg-[#2A2A2A] border border-[#3A3530] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00B4D8]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={onClose}
              disabled={createLocation.isPending}
              className="px-4 py-2 rounded text-sm text-gray-300 hover:bg-[#2A2A2A] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLocation.isPending}
              className="px-4 py-2 rounded text-sm font-medium bg-[#00B4D8] hover:bg-cyan-600 text-white transition-colors flex items-center gap-2"
            >
              {createLocation.isPending ? 'Adding...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLocationModal;
