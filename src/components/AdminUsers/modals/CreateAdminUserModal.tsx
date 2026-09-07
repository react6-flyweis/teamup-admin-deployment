import React, { useState } from 'react';
import { useCreateAdminUserMutation } from '@/hooks/useAdminUsers';
import { ROLES, type Role } from '@/types';
import Toggle from '@/components/common/Toggle';
import {
  UserIcon,
  CloseIcon,
} from '@/assets/icons';

const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.MANAGER, label: 'Manager' },
  { value: ROLES.USER, label: 'User' },
];

interface CreateAdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
  onError: (message: string) => void;
}

export const CreateAdminUserModal: React.FC<CreateAdminUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const createMutation = useCreateAdminUserMutation();

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    role: Role;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    phone: '',
    role: ROLES.ADMIN,
    isActive: true,
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: ROLES.ADMIN,
      isActive: true,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        role: formData.role,
        isActive: formData.isActive,
      });

      onSuccess(formData.name.trim());
      handleClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create admin user.';
      onError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1E1A18] border border-[#3A3530] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A3530]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#E1017D]/10 text-[#E1017D]">
              <UserIcon size={18} />
            </div>
            <h3 className="font-bold text-lg text-white">Create New Administrator</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin@teamuparena.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
            />
            <p className="mt-1.5 text-xs text-neutral-400 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#E1017D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Login credentials and temporary password will be sent to this email.</span>
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. +1 555 010 0001"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Assigned Role <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value as Role }))
              }
              className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors cursor-pointer"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between pt-2 pb-1 border-t border-[#2D2622]">
            <div>
              <span className="text-sm font-semibold text-white block">Active Immediately</span>
              <span className="text-xs text-neutral-400">
                {formData.isActive
                  ? 'Account will be active upon creation.'
                  : 'Account will be disabled until activated.'}
              </span>
            </div>
            <Toggle
              checked={formData.isActive}
              onChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
              activeColor="#10A200"
              inactiveColor="#EC221F"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-[#E1017D] hover:bg-[#B71778] text-white text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminUserModal;
