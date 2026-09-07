import React, { useState, useMemo } from 'react';
import {
  useAdminUsersQuery,
  useUpdateAdminUserMutation,
} from '@/hooks/useAdminUsers';
import { useAuthStore } from '@/store/authStore';
import { ROLES, type AdminUser } from '@/types';
import Toggle from '@/components/common/Toggle';
import {
  SearchIcon,
  UserIcon,
  EditIcon,
  TrashIcon,
  MailIcon,
  PhoneIcon,
  CloseIcon,
  SecurityIcon,
} from '@/assets/icons';
import {
  CreateAdminUserModal,
  EditAdminUserModal,
  DeleteAdminUserModal,
} from '@/components/AdminUsers/modals';

const AdminUsers: React.FC = () => {
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Filter states
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Notification feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useAdminUsersQuery();
  const updateMutation = useUpdateAdminUserMutation();

  const allUsers = useMemo(() => data?.users || [], [data?.users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      // Status filter
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;

      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Search filter
      if (searchInput.trim()) {
        const query = searchInput.toLowerCase().trim();
        const matchesName = u.name?.toLowerCase().includes(query);
        const matchesEmail = u.email?.toLowerCase().includes(query);
        const matchesPhone = u.phone?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [allUsers, statusFilter, roleFilter, searchInput]);

  // Metric stats
  const stats = useMemo(() => {
    const total = allUsers.length;
    const active = allUsers.filter((u) => u.isActive).length;
    const inactive = total - active;
    const superAdmins = allUsers.filter((u) => u.role === ROLES.SUPER_ADMIN).length;
    return { total, active, inactive, superAdmins };
  }, [allUsers]);

  // Quick toggle active/inactive status
  const handleToggleActive = async (user: AdminUser) => {
    setTogglingUserId(user.id);
    setFeedback(null);
    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        payload: {
          isActive: !user.isActive,
        },
      });
      setFeedback({
        type: 'success',
        message: `${user.name} is now ${!user.isActive ? 'Active' : 'Inactive'}.`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update user status.';
      setFeedback({ type: 'error', message });
    } finally {
      setTogglingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Super Admin
          </span>
        );
      case ROLES.ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E1017D]/20 text-[#E1017D] border border-[#E1017D]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E1017D]" />
            Admin
          </span>
        );
      case ROLES.MANAGER:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Manager
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
            {role.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="text-white space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A3530] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#E1017D]/10 text-[#E1017D]">
              <UserIcon size={26} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-raleway tracking-wide">
              Admin Users
            </h1>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
              Super Admin Only
            </span>
          </div>
          <p className="text-neutral-400 text-sm max-w-2xl">
            View, manage, edit roles, create new administrator accounts, and toggle operational statuses across TeamUp.
          </p>
        </div>

        {/* Create New Admin Button */}
        <div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E1017D] hover:bg-[#B71778] text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-[#E1017D]/20 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Admin User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#1E1A18] border border-[#3A3530] flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Total Administrators</span>
          <span className="text-2xl font-bold font-raleway mt-2 text-white">{stats.total}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1E1A18] border border-[#3A3530] flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Active Accounts</span>
          <span className="text-2xl font-bold font-raleway mt-2 text-emerald-400">{stats.active}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1E1A18] border border-[#3A3530] flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Inactive Accounts</span>
          <span className="text-2xl font-bold font-raleway mt-2 text-red-400">{stats.inactive}</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1E1A18] border border-[#3A3530] flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-medium">Super Admins</span>
          <span className="text-2xl font-bold font-raleway mt-2 text-purple-300">{stats.superAdmins}</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/40 border-red-500/30 text-red-300'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#1E1A18] p-4 rounded-2xl border border-[#3A3530]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E1017D] transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white cursor-pointer"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#14100E] p-1 rounded-xl border border-[#3A3530]">
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#E1017D] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter by role"
            className="bg-[#14100E] border border-[#3A3530] rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-300 focus:outline-none focus:border-[#E1017D] cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
            <option value={ROLES.ADMIN}>Admin</option>
            <option value={ROLES.MANAGER}>Manager</option>
            <option value={ROLES.USER}>User</option>
          </select>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-[#1E1A18] border border-[#3A3530] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-t-[#E1017D] border-r-transparent border-b-[#E1017D] border-l-transparent rounded-full animate-spin" />
            <span className="text-neutral-400 text-sm font-medium">Loading admin accounts...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
              <SecurityIcon size={28} />
            </div>
            <p className="text-white font-bold mb-1">Failed to Load Admin Users</p>
            <p className="text-neutral-400 text-xs mb-4">Unable to fetch administrator records from the server.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#E1017D] hover:bg-[#B71778] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2">
              <UserIcon size={24} />
            </div>
            <p className="text-white font-semibold mb-1">No admin users found</p>
            <p className="text-neutral-400 text-xs">
              {searchInput || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'No administrative users currently registered.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#3A3530] bg-[#161210] text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E2824] text-sm">
                {filteredUsers.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  const isToggling = togglingUserId === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#251F1C] transition-colors"
                    >
                      {/* User Avatar + Name */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-[#4A3F38] flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{user.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400 font-mono">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-neutral-300">
                            <MailIcon size={14} className="text-neutral-500" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-neutral-400">
                              <PhoneIcon size={14} className="text-neutral-500" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Status & Toggle */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Toggle
                            checked={user.isActive}
                            onChange={() => handleToggleActive(user)}
                            activeColor="#10A200"
                            inactiveColor="#EC221F"
                          />
                          <span
                            className={`text-xs font-medium ${
                              user.isActive ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isToggling ? 'Updating...' : user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-neutral-400">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 rounded-lg bg-neutral-800/80 hover:bg-[#E1017D] text-neutral-300 hover:text-white transition-all cursor-pointer"
                            title="Edit user"
                          >
                            <EditIcon size={15} />
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            disabled={isCurrent}
                            className={`p-2 rounded-lg transition-all ${
                              isCurrent
                                ? 'bg-neutral-800/40 text-neutral-600 cursor-not-allowed'
                                : 'bg-neutral-800/80 hover:bg-red-600 text-neutral-300 hover:text-white cursor-pointer'
                            }`}
                            title={isCurrent ? 'You cannot delete yourself' : 'Delete user'}
                          >
                            <TrashIcon size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extracted Modals */}
      <CreateAdminUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(name) =>
          setFeedback({
            type: 'success',
            message: `Administrator "${name}" created successfully.`,
          })
        }
        onError={(message) => setFeedback({ type: 'error', message })}
      />

      <EditAdminUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={(name) =>
          setFeedback({
            type: 'success',
            message: `Admin user "${name}" successfully updated.`,
          })
        }
        onError={(message) => setFeedback({ type: 'error', message })}
      />

      <DeleteAdminUserModal
        isOpen={!!deletingUser}
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onSuccess={(name) =>
          setFeedback({
            type: 'success',
            message: `Admin user "${name}" deleted successfully.`,
          })
        }
        onError={(message) => setFeedback({ type: 'error', message })}
      />
    </div>
  );
};

export default AdminUsers;
