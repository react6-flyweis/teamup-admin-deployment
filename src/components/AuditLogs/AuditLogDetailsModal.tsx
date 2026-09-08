import React, { useState } from 'react';
import type { AuditLogItem } from '@/types';
import { CloseIcon, SecurityIcon, UserIcon } from '@/assets/icons';

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  log: AuditLogItem | null;
  onClose: () => void;
}

export const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  isOpen,
  log,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'json'>('details');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        full: d.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'medium',
        }),
        iso: dateStr,
      };
    } catch {
      return { full: dateStr, iso: dateStr };
    }
  };

  const getActionBadge = (action: string) => {
    const formatted = action.replace(/_/g, ' ');
    if (action.includes('created')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {formatted}
        </span>
      );
    }
    if (action.includes('deleted')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          {formatted}
        </span>
      );
    }
    if (action.includes('rbac') || action.includes('permission')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          {formatted}
        </span>
      );
    }
    if (action.includes('role')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {formatted}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {formatted}
      </span>
    );
  };

  const dates = formatTimestamp(log.timestamp);
  const changes = (log.changes || {}) as Record<string, unknown>;

  // Helper to render human-friendly Changes section
  const renderFormattedChanges = () => {
    // 1. RBAC Permission Update
    if (
      log.action === 'rbac_permission_update' &&
      changes.before &&
      changes.after &&
      typeof changes.before === 'object' &&
      typeof changes.after === 'object'
    ) {
      const beforeRecord = changes.before as Record<string, boolean>;
      const afterRecord = changes.after as Record<string, boolean>;

      const allKeys = Array.from(
        new Set([...Object.keys(beforeRecord), ...Object.keys(afterRecord)])
      );

      const modifiedKeys = allKeys.filter(
        (key) => beforeRecord[key] !== afterRecord[key]
      );
      const unchangedKeys = allKeys.filter(
        (key) => beforeRecord[key] === afterRecord[key]
      );

      return (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#14100E] border border-[#3A3530]">
            <div className="flex items-center justify-between mb-3 border-b border-[#3A3530] pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Modified Permissions ({modifiedKeys.length})
              </span>
              <span className="text-[11px] text-neutral-400">
                Role: <strong className="text-white capitalize">{log.entity?.id}</strong>
              </span>
            </div>

            {modifiedKeys.length === 0 ? (
              <p className="text-xs text-neutral-400">No permissions were changed.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {modifiedKeys.map((key) => {
                  const wasEnabled = Boolean(beforeRecord[key]);
                  const isEnabled = Boolean(afterRecord[key]);

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#1E1A18] border border-[#3A3530]"
                    >
                      <span className="text-xs font-medium text-neutral-200 capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            wasEnabled
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950/60 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {wasEnabled ? 'Allowed' : 'Denied'}
                        </span>
                        <span className="text-neutral-500 text-xs">→</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isEnabled
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {isEnabled ? 'Allowed' : 'Denied'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {unchangedKeys.length > 0 && (
            <details className="p-3 rounded-xl bg-[#14100E] border border-[#3A3530] text-xs">
              <summary className="font-semibold text-neutral-400 cursor-pointer hover:text-white transition-colors">
                View Unchanged Permissions ({unchangedKeys.length})
              </summary>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#3A3530]">
                {unchangedKeys.map((key) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded bg-[#1E1A18]">
                    <span className="text-neutral-300 capitalize text-[11px] truncate mr-1">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        afterRecord[key]
                          ? 'text-emerald-400 bg-emerald-950/40'
                          : 'text-neutral-500 bg-neutral-900'
                      }`}
                    >
                      {afterRecord[key] ? 'On' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      );
    }

    // 2. User Role Changed
    if (log.action === 'user_role_changed') {
      const beforeRole = String(changes.before || 'unknown');
      const afterRole = String(changes.after || 'unknown');
      const userName = String(changes.userName || '');
      const userEmail = String(changes.userEmail || '');
      const userId = String(changes.userId || log.entity?.id || '');

      return (
        <div className="p-4 rounded-xl bg-[#14100E] border border-[#3A3530] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#1E1A18] border border-[#3A3530]">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold block">
                Target User
              </span>
              <div className="font-semibold text-white text-sm">
                {userName || `User #${userId}`}
              </div>
              <div className="text-xs text-neutral-400 font-mono">
                {userEmail || '—'}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                  Previous
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-800 text-neutral-300 border border-neutral-700">
                  {beforeRole.replace(/_/g, ' ')}
                </span>
              </div>

              <span className="text-neutral-500 text-lg font-bold">→</span>

              <div className="text-center">
                <span className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                  New Role
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E1017D]/20 text-[#E1017D] border border-[#E1017D]/40">
                  {afterRole.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. User Created
    if (log.action === 'user_created' && changes.created && typeof changes.created === 'object') {
      const created = changes.created as Record<string, string>;
      return (
        <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span>New Account Created</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#14100E] border border-[#3A3530]">
              <span className="text-[11px] text-neutral-400 block mb-1">Name</span>
              <span className="font-semibold text-white text-sm">{created.name || '—'}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#14100E] border border-[#3A3530]">
              <span className="text-[11px] text-neutral-400 block mb-1">Email</span>
              <span className="font-mono text-xs text-neutral-200">{created.email || '—'}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#14100E] border border-[#3A3530]">
              <span className="text-[11px] text-neutral-400 block mb-1">Assigned Role</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {created.role?.replace(/_/g, ' ') || 'User'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 4. User Deleted
    if (log.action === 'user_deleted' && changes.deletedUser && typeof changes.deletedUser === 'object') {
      const deleted = changes.deletedUser as Record<string, string>;
      return (
        <div className="p-4 rounded-xl bg-red-950/15 border border-red-500/20 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
            <span>Removed Account Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-[#14100E] border border-[#3A3530]">
              <span className="text-[11px] text-neutral-400 block mb-1">Name</span>
              <span className="font-semibold text-white text-sm">{deleted.name || '—'}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#14100E] border border-[#3A3530]">
              <span className="text-[11px] text-neutral-400 block mb-1">Email</span>
              <span className="font-mono text-xs text-neutral-200">{deleted.email || '—'}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#14100E] border border-[#3A3530]">
              <span className="text-[11px] text-neutral-400 block mb-1">Previous Role</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                {deleted.role?.replace(/_/g, ' ') || 'User'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // 5. Generic Object Diff (Before vs After)
    if (changes.before !== undefined || changes.after !== undefined) {
      const beforeObj =
        typeof changes.before === 'object' && changes.before !== null
          ? (changes.before as Record<string, unknown>)
          : { value: changes.before };
      const afterObj =
        typeof changes.after === 'object' && changes.after !== null
          ? (changes.after as Record<string, unknown>)
          : { value: changes.after };

      const diffKeys = Array.from(
        new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)])
      );

      return (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-[#3A3530] bg-[#14100E]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E1A18] text-neutral-400 uppercase font-bold text-[10px] tracking-wider border-b border-[#3A3530]">
                <tr>
                  <th className="p-3">Field</th>
                  <th className="p-3 text-red-400">Previous Value</th>
                  <th className="p-3 text-emerald-400">New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A3530]/50">
                {diffKeys.map((key) => {
                  const valBefore = JSON.stringify(beforeObj[key]);
                  const valAfter = JSON.stringify(afterObj[key]);
                  return (
                    <tr key={key} className="hover:bg-[#1E1A18]/50">
                      <td className="p-3 font-semibold text-white capitalize">
                        {key.replace(/_/g, ' ')}
                      </td>
                      <td className="p-3 font-mono text-red-300">
                        {valBefore ?? '—'}
                      </td>
                      <td className="p-3 font-mono text-emerald-300 font-semibold">
                        {valAfter ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // 6. Generic Fallback Key-Value list
    return (
      <div className="p-4 rounded-xl bg-[#14100E] border border-[#3A3530] space-y-2">
        {Object.entries(changes).map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 py-1.5 border-b border-[#3A3530]/50 last:border-none text-xs">
            <span className="font-semibold text-neutral-300 capitalize">{k.replace(/_/g, ' ')}</span>
            <span className="font-mono text-neutral-100 text-right">
              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#1E1A18] border border-[#3A3530] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3A3530] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E1017D]/10 text-[#E1017D]">
              <SecurityIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-lg text-white">Log #{log.id}</h3>
                {getActionBadge(log.action)}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{dates.full}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#2A2421]"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#3A3530] px-6 shrink-0 bg-[#161311]">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#E1017D] text-[#E1017D]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Formatted Summary & Diffs
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'border-[#E1017D] text-[#E1017D]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Raw JSON
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'details' ? (
            <>
              {/* Actor & Entity Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Performed By (Actor) */}
                <div className="p-4 rounded-xl bg-[#14100E] border border-[#3A3530]">
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon size={16} className="text-[#A3EBFF]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Performed By
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-white text-base">
                      {log.user?.name || 'System Admin'}
                    </div>
                    <div className="text-xs text-neutral-400">{log.user?.email || '—'}</div>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {log.user?.role?.replace(/_/g, ' ') || 'Unknown Role'}
                      </span>
                      <span className="text-[11px] text-neutral-500">ID: {log.user?.id}</span>
                    </div>
                  </div>
                </div>

                {/* Target Entity */}
                <div className="p-4 rounded-xl bg-[#14100E] border border-[#3A3530]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#E1017D]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Target Entity
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="font-semibold text-white capitalize text-base">
                      {log.entity?.type?.replace(/_/g, ' ') || 'Entity'}
                    </div>
                    <div className="text-xs text-neutral-400">
                      Entity ID:{' '}
                      <span className="font-mono text-neutral-300 bg-[#1E1A18] px-2 py-0.5 rounded border border-[#3A3530]">
                        {log.entity?.id || '—'}
                      </span>
                    </div>
                    <div className="pt-2 text-[11px] text-neutral-500">
                      Action:{' '}
                      <span className="font-mono text-neutral-300">{log.action}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changes Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Recorded Changes & Comparisons
                </h4>
                {renderFormattedChanges()}
              </div>

              {/* Client Metadata Section */}
              <div className="p-4 rounded-xl bg-[#14100E] border border-[#3A3530] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Client & Request Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-xs text-neutral-500 block">IP Address</span>
                    <span className="font-mono text-xs text-neutral-200">
                      {log.metadata?.ipAddress || 'Not recorded'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 block">User Agent</span>
                    <span className="font-mono text-xs text-neutral-300 break-all">
                      {log.metadata?.userAgent || 'Not recorded'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Full Audit Log Payload
                </span>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-[#2A2421] hover:bg-[#3A3530] text-white transition-colors cursor-pointer"
                >
                  {isCopied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>
              <div className="bg-[#14100E] p-4 rounded-xl border border-[#3A3530] font-mono text-xs text-emerald-300 overflow-x-auto max-h-112.5">
                <pre>{JSON.stringify(log, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#3A3530] flex items-center justify-between shrink-0 bg-[#14100E]">
          <span className="text-xs text-neutral-500 font-mono">ISO: {dates.iso}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2A2421] hover:bg-[#3A3530] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
