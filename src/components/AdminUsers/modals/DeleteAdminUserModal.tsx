import React from 'react';
import { useDeleteAdminUserMutation } from '@/hooks/useAdminUsers';
import type { AdminUser } from '@/types';
import { TrashIcon } from '@/assets/icons';

interface DeleteAdminUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: (name: string) => void;
  onError: (message: string) => void;
}

export const DeleteAdminUserModal: React.FC<DeleteAdminUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
  onError,
}) => {
  const deleteMutation = useDeleteAdminUserMutation();

  if (!isOpen || !user) return null;

  const handleConfirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);
      onSuccess(user.name);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete user.';
      onError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#1E1A18] border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
            <TrashIcon size={28} />
          </div>
          <h3 className="text-xl font-bold text-white">Delete Administrator?</h3>
          <p className="text-neutral-400 text-sm">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">{user.name}</strong> ({user.email})? This action cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAdminUserModal;
