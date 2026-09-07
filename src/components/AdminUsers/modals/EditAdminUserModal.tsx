import React, { useState, useEffect } from 'react';
import { useUpdateAdminUserMutation } from '@/hooks/useAdminUsers';
import { ROLES, type AdminUser, type Role } from '@/types';
import Toggle from '@/components/common/Toggle';
import { EditIcon, CloseIcon } from '@/assets/icons';

const ROLE_OPTIONS = [
  { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.MANAGER, label: 'Manager' },
  { value: ROLES.USER, label: 'User' },
];

interface EditAdminUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: (name: string) => void;
  onError: (message: string) => void;
}

export const EditAdminUserModal: React.FC<EditAdminUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  onError,
}) => {
  const updateMutation = useUpdateAdminUserMutation();

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    role: Role;
    isActive: boolean;
  }>({
    name: '',
    phone: '',
    role: 'admin',
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        role: (user.role as Role) || 'admin',
        isActive: user.isActive,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        payload: {
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          isActive: formData.isActive,
        },
      });

      onSuccess(formData.name.trim());
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update admin user.';
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
              <EditIcon size={18} />
            </div>
            <h3 className="font-bold text-lg text-white">Edit Administrator</h3>
          </div>
          <button
            onClick={onClose}
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
            />
          </div>

          {/* Email (Read-Only) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full bg-[#14100E]/50 border border-[#2D2622] rounded-xl px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Email address cannot be modified directly.
            </span>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="+1 555 010 0001"
              className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E1017D] transition-colors"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Assigned Role
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
              <span className="text-sm font-semibold text-white block">Account Status</span>
              <span className="text-xs text-neutral-400">
                {formData.isActive ? 'Account is currently active and can sign in.' : 'Account is disabled.'}
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

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3A3530]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-[#E1017D] hover:bg-[#B71778] text-white text-sm font-semibold transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdminUserModal;
