import React, { useState, useEffect, useMemo } from 'react';
import {
  useRbacPermissionsQuery,
  useUpdateRolePermissionsMutation,
} from '@/hooks/useRbac';
import { ROLES } from '@/types';
import Toggle from '@/components/common/Toggle';
import {
  HomeIcon,
  HeaderIcon,
  FooterIcon,
  GameIcon,
  BiteIcon,
  SocailReviewsIcon,
  VenuesIcon,
  EnquiriesIcon,
  StaffIcon,
  BookingIcon,
  SecurityIcon,
} from '@/assets/icons';

interface TabMetadata {
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; isActive?: boolean }>;
  category: string;
}

const TAB_METADATA: Record<string, TabMetadata> = {
  manage_home: {
    label: 'Manage Home',
    description: 'Configure landing page hero, banners, featured games, blogs, and promo sections.',
    icon: HomeIcon,
    category: 'Content Management',
  },
  manage_header: {
    label: 'Manage Header',
    description: 'Manage navigation header categories, game drop-downs, packages, and party menus.',
    icon: HeaderIcon,
    category: 'Content Management',
  },
  manage_footer: {
    label: 'Manage Footer',
    description: 'Configure footer legal links, social media channels, contact info, and copyright.',
    icon: FooterIcon,
    category: 'Content Management',
  },
  game_venue: {
    label: 'Game & Venue',
    description: 'Manage arcade & sports game types, rules, lane configurations, and play zones.',
    icon: GameIcon,
    category: 'Operations',
  },
  bites_drinks: {
    label: 'Bites & Drinks',
    description: 'Manage food menu items, drink recipes, dietary categories, and pricing.',
    icon: BiteIcon,
    category: 'Operations',
  },
  social_reviews: {
    label: 'Social & Reviews',
    description: 'Review customer testimonials, Google ratings, and featured community feedback.',
    icon: SocailReviewsIcon,
    category: 'Marketing',
  },
  venues: {
    label: 'Venues',
    description: 'Manage arena physical locations, operational hours, maps, and facilities.',
    icon: VenuesIcon,
    category: 'Operations',
  },
  enquiries: {
    label: 'Enquiries',
    description: 'Track incoming customer queries, party requests, and corporate contact forms.',
    icon: EnquiriesIcon,
    category: 'Support',
  },
  users: {
    label: 'Staff & Roles',
    description: 'Manage employee profiles, shift schedules, performance, and internal staff roles.',
    icon: StaffIcon,
    category: 'Administration',
  },
  bookings: {
    label: 'Bookings',
    description: 'View customer bookings, lane reservations, game slots, and calendar schedules.',
    icon: BookingIcon,
    category: 'Operations',
  },
};

const HIDDEN_PERMISSION_TABS = ['bookings', 'users'];

const DEFAULT_TABS = [
  'manage_home',
  'manage_header',
  'manage_footer',
  'game_venue',
  'bites_drinks',
  'social_reviews',
  'venues',
  'enquiries',
];

const RolesPermissions: React.FC = () => {
  const { data, isLoading, isError, refetch } = useRbacPermissionsQuery();
  const updateMutation = useUpdateRolePermissionsMutation();

  // Tabs list from API or fallback, excluding hidden tabs
  const tabsList = useMemo(() => {
    const raw = data?.tabs && data.tabs.length > 0 ? data.tabs : DEFAULT_TABS;
    return raw.filter((tab) => !HIDDEN_PERMISSION_TABS.includes(tab));
  }, [data?.tabs]);

  // Exclude super_admin from editable roles per requirement
  const editableRoles = useMemo(() => {
    const rolesFromApi = data?.roles || [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER];
    return rolesFromApi.filter((role) => role !== ROLES.SUPER_ADMIN && role !== 'super_admin');
  }, [data?.roles]);

  const [selectedRole, setSelectedRole] = useState<string>('admin');

  // Local state for permissions: role -> { tabKey: boolean }
  const [localPermissions, setLocalPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize local state when API data arrives
  useEffect(() => {
    if (data?.permissions) {
      const initial: Record<string, Record<string, boolean>> = {};
      editableRoles.forEach((role) => {
        const rolePerms = data.permissions[role] || {};
        const normalized: Record<string, boolean> = {};
        tabsList.forEach((tab) => {
          normalized[tab] = Boolean(rolePerms[tab]);
        });
        initial[role] = normalized;
      });
      setLocalPermissions(initial);
    }
  }, [data, editableRoles, tabsList]);

  // Ensure selectedRole is valid if editableRoles changes
  useEffect(() => {
    if (editableRoles.length > 0 && !editableRoles.includes(selectedRole)) {
      setSelectedRole(editableRoles[0]);
    }
  }, [editableRoles, selectedRole]);

  // Active role permissions map memoized
  const activeRolePerms = useMemo<Record<string, boolean>>(() => {
    return localPermissions[selectedRole] || {};
  }, [localPermissions, selectedRole]);

  // Check if current role has unsaved modifications
  const isDirty = useMemo(() => {
    if (!data?.permissions) return false;
    const originalRolePerms = data.permissions[selectedRole] || {};
    return tabsList.some((tab) => {
      const current = activeRolePerms[tab] ?? false;
      const original = Boolean(originalRolePerms[tab]);
      return current !== original;
    });
  }, [data?.permissions, selectedRole, activeRolePerms, tabsList]);

  const handleToggle = (tabKey: string, checked: boolean) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...(prev[selectedRole] || {}),
        [tabKey]: checked,
      },
    }));
    setFeedback(null);
  };

  const handleGrantAll = () => {
    const updated: Record<string, boolean> = {};
    tabsList.forEach((tab) => {
      updated[tab] = true;
    });
    setLocalPermissions((prev) => ({
      ...prev,
      [selectedRole]: updated,
    }));
  };

  const handleRevokeAll = () => {
    const updated: Record<string, boolean> = {};
    tabsList.forEach((tab) => {
      updated[tab] = false;
    });
    setLocalPermissions((prev) => ({
      ...prev,
      [selectedRole]: updated,
    }));
  };

  const handleReset = () => {
    if (data?.permissions && data.permissions[selectedRole]) {
      const rolePerms = data.permissions[selectedRole] || {};
      const normalized: Record<string, boolean> = {};
      tabsList.forEach((tab) => {
        normalized[tab] = Boolean(rolePerms[tab]);
      });
      setLocalPermissions((prev) => ({
        ...prev,
        [selectedRole]: normalized,
      }));
    }
    setFeedback(null);
  };

  const handleSave = async () => {
    setFeedback(null);
    try {
      const originalRolePerms = data?.permissions?.[selectedRole] || {};
      const payloadPermissions: Record<string, boolean> = {};

      // Keep hidden tabs intact as originally configured on server
      HIDDEN_PERMISSION_TABS.forEach((hiddenKey) => {
        if (hiddenKey in originalRolePerms) {
          payloadPermissions[hiddenKey] = Boolean(originalRolePerms[hiddenKey]);
        }
      });

      // Include updated permissions for active tabs
      tabsList.forEach((tabKey) => {
        payloadPermissions[tabKey] = activeRolePerms[tabKey] ?? false;
      });

      await updateMutation.mutateAsync({
        role: selectedRole,
        payload: {
          permissions: payloadPermissions,
        },
      });
      setFeedback({
        type: 'success',
        message: `Permissions for ${formatRoleName(selectedRole)} successfully updated!`,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update permissions. Please try again.';
      setFeedback({
        type: 'error',
        message,
      });
    }
  };

  const formatRoleName = (role: string) => {
    return role
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const activeTabsCount = tabsList.filter((tab) => activeRolePerms[tab] === true).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-t-[#E1017D] border-r-transparent border-b-[#E1017D] border-l-transparent rounded-full animate-spin" />
        <span className="text-[#a4a4a4] font-raleway font-medium text-lg">
          Loading roles and permissions...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
          <SecurityIcon size={32} />
        </div>
        <h3 className="text-xl font-bold text-white">Failed to Load Permissions</h3>
        <p className="text-neutral-400 max-w-md">
          Unable to retrieve the RBAC configuration from the server. Please check your connection and try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-6 py-2.5 bg-[#E1017D] hover:bg-[#B71778] text-white font-medium rounded-xl transition-all shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="text-white space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A3530] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#E1017D]/10 text-[#E1017D]">
              <SecurityIcon size={26} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-raleway tracking-wide">
              Roles & Permissions
            </h1>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
              Super Admin Only
            </span>
          </div>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Configure tab visibility and functional access permissions across organizational roles. Changes take effect immediately upon saving.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!isDirty || updateMutation.isPending}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isDirty && !updateMutation.isPending
                ? 'bg-[#E1017D] hover:bg-[#B71778] text-white cursor-pointer hover:shadow-lg hover:shadow-[#E1017D]/20'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            {updateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
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
            className="text-neutral-400 hover:text-white text-xs px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Unsaved Changes Floating Banner */}
      {isDirty && !feedback && (
        <div className="p-4 rounded-xl text-sm font-medium bg-amber-950/30 border border-amber-500/30 text-amber-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>You have unsaved changes for <strong>{formatRoleName(selectedRole)}</strong>.</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs underline hover:text-white transition-colors"
          >
            Discard Changes
          </button>
        </div>
      )}

      {/* Role Switcher Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1E1A18] p-3 rounded-2xl border border-[#3A3530]">
        <div className="flex flex-wrap items-center gap-2">
          {editableRoles.map((role) => {
            const isSelected = selectedRole === role;
            const rolePerms = localPermissions[role] || {};
            const count = tabsList.filter((t) => rolePerms[t] === true).length;

            return (
              <button
                key={role}
                onClick={() => {
                  setSelectedRole(role);
                  setFeedback(null);
                }}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#E1017D] text-white shadow-md'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>{formatRoleName(role)}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}/{tabsList.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleGrantAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
            title="Enable all permissions for this role"
          >
            Grant All
          </button>
          <button
            onClick={handleRevokeAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer border border-neutral-700"
            title="Disable all permissions for this role"
          >
            Revoke All
          </button>
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reset to saved values"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Role Summary Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-[#241D1A] to-[#1C1715] border border-[#3A3530]">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{formatRoleName(selectedRole)} Permissions</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Users assigned the &quot;{selectedRole}&quot; role will have access to {activeTabsCount} of {tabsList.length} application sections.
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Status:</span>
          <span className="font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Active Configuration
          </span>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tabsList.map((tabKey) => {
          const isEnabled = activeRolePerms[tabKey] ?? false;
          const meta = TAB_METADATA[tabKey] || {
            label: tabKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            description: `Access to ${tabKey} tab and associated operations.`,
            icon: SecurityIcon,
            category: 'General',
          };
          const IconComponent = meta.icon;

          return (
            <div
              key={tabKey}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                isEnabled
                  ? 'bg-[#1F1916] border-[#4A3F38] hover:border-[#E1017D]/40'
                  : 'bg-[#181311] border-[#2A2420] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-3 rounded-xl shrink-0 transition-colors ${
                      isEnabled
                        ? 'bg-[#E1017D]/10 text-[#E1017D]'
                        : 'bg-neutral-800/60 text-neutral-500'
                    }`}
                  >
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{meta.label}</h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                        {meta.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <Toggle
                    checked={isEnabled}
                    onChange={(checked) => handleToggle(tabKey, checked)}
                    activeColor="#10A200"
                    inactiveColor="#EC221F"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#2D2622] text-xs">
                <span className="text-neutral-500 font-mono text-[11px]">{tabKey}</span>
                <span
                  className={`font-semibold ${
                    isEnabled ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isEnabled ? 'Access Granted' : 'Access Restricted'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RolesPermissions;
