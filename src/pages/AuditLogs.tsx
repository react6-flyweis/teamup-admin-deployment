import React, { useState, useMemo, useDeferredValue } from "react";
import { useAuditLogsQuery } from "@/hooks/useAuditLogs";
import type { AuditLogItem } from "@/types";
import Pagination from "@/utils/Pagination";
import {
  AuditLogIcon,
  SearchIcon,
  CloseIcon,
  SecurityIcon,
} from "@/assets/icons";
import { AuditLogDetailsModal } from "@/components/AuditLogs/AuditLogDetailsModal";

const ITEMS_PER_PAGE = 10;

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "user_created", label: "User Created" },
  { value: "user_updated", label: "User Updated" },
  { value: "user_role_changed", label: "Role Changed" },
  { value: "user_deleted", label: "User Deleted" },
  { value: "rbac_permission_update", label: "RBAC Permissions" },
];

const ENTITY_OPTIONS = [
  { value: "all", label: "All Entities" },
  { value: "user", label: "User" },
  { value: "rbac_permission", label: "RBAC Permission" },
];

export const AuditLogs: React.FC = () => {
  // State for search and filters
  const [searchInput, setSearchInput] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal inspection state
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  // Defer search input for smooth filtering
  const deferredSearch = useDeferredValue(searchInput);

  // Fetch query
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAuditLogsQuery({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      action: actionFilter !== "all" ? actionFilter : undefined,
      entityType: entityFilter !== "all" ? entityFilter : undefined,
      search: deferredSearch.trim() || undefined,
    });

  const rawLogs = useMemo(() => data?.logs || [], [data?.logs]);

  // Client-side filtering fallback in case API returns un-filtered dataset
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      // Action filter
      if (actionFilter !== "all" && log.action !== actionFilter) {
        return false;
      }

      // Entity filter
      if (entityFilter !== "all" && log.entity?.type !== entityFilter) {
        return false;
      }

      // Search filter
      if (deferredSearch.trim()) {
        const query = deferredSearch.toLowerCase().trim();
        const userName = log.user?.name?.toLowerCase() || "";
        const userEmail = log.user?.email?.toLowerCase() || "";
        const action = log.action?.toLowerCase() || "";
        const entityId = String(log.entity?.id || "").toLowerCase();
        const entityType = log.entity?.type?.toLowerCase() || "";
        const ip = log.metadata?.ipAddress?.toLowerCase() || "";

        const matches =
          userName.includes(query) ||
          userEmail.includes(query) ||
          action.includes(query) ||
          entityId.includes(query) ||
          entityType.includes(query) ||
          ip.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [rawLogs, actionFilter, entityFilter, deferredSearch]);

  // Pagination logic: if backend returned full set, slice client-side; otherwise use returned logs directly
  const totalCount = data?.total ?? filteredLogs.length;
  const isServerPaginated =
    rawLogs.length <= ITEMS_PER_PAGE && totalCount > rawLogs.length;
  const paginatedLogs = useMemo(() => {
    if (isServerPaginated) {
      return filteredLogs;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, isServerPaginated, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      (isServerPaginated ? totalCount : filteredLogs.length) / ITEMS_PER_PAGE,
    ),
  );

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return {
        date: d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: d.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
    } catch {
      return { date: dateStr, time: "" };
    }
  };

  const getActionBadge = (action: string) => {
    const formatted = action.replace(/_/g, " ");
    if (action.includes("created")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {formatted}
        </span>
      );
    }
    if (action.includes("deleted")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          {formatted}
        </span>
      );
    }
    if (action.includes("rbac") || action.includes("permission")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          {formatted}
        </span>
      );
    }
    if (action.includes("role")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {formatted}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        {formatted}
      </span>
    );
  };

  const getActorInitials = (name?: string) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderChangesSummary = (log: AuditLogItem) => {
    const changes = (log.changes || {}) as Record<string, unknown>;

    // Case 1: user_role_changed
    if (log.action === "user_role_changed") {
      const before = String(changes.before || "unknown");
      const after = String(changes.after || "unknown");
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-neutral-400">Role:</span>
          <span className="text-red-300 font-mono">{before}</span>
          <span className="text-neutral-500">→</span>
          <span className="text-emerald-300 font-bold font-mono">{after}</span>
        </div>
      );
    }

    // Case 2: user_created
    if (log.action === "user_created" && changes.created) {
      const created = changes.created as Record<string, string>;
      return (
        <div className="text-xs text-neutral-300 truncate max-w-xs">
          Created{" "}
          <span className="font-semibold text-white">{created.name}</span> (
          {created.role})
        </div>
      );
    }

    // Case 3: user_deleted
    if (log.action === "user_deleted" && changes.deletedUser) {
      const deleted = changes.deletedUser as Record<string, string>;
      return (
        <div className="text-xs text-neutral-300 truncate max-w-xs">
          Deleted{" "}
          <span className="font-semibold text-white">{deleted.name}</span> (
          {deleted.role})
        </div>
      );
    }

    // Case 4: rbac_permission_update
    if (log.action === "rbac_permission_update") {
      const modified = (changes.modified || {}) as Record<string, boolean>;
      const count = Object.keys(modified).length;
      return (
        <div className="text-xs text-neutral-300">
          Updated{" "}
          <span className="font-semibold text-purple-300">
            {count} permissions
          </span>{" "}
          for <span className="font-mono text-white">{log.entity?.id}</span>
        </div>
      );
    }

    // Case 5: user_updated with modified
    if (changes.after && typeof changes.after === "object") {
      const modifiedKeys = Object.keys(changes.after as object).join(", ");
      return (
        <div className="text-xs text-neutral-300 truncate max-w-xs">
          Updated: <span className="text-white font-mono">{modifiedKeys}</span>
        </div>
      );
    }

    return <span className="text-xs text-neutral-400">Activity logged</span>;
  };

  return (
    <div className="text-white space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A3530] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-[#E1017D]/10 text-[#E1017D]">
              <AuditLogIcon size={26} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold font-raleway tracking-wide">
              Audit Logs
            </h1>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
              Super Admin Only
            </span>
          </div>
          <p className="text-neutral-400 text-sm max-w-2xl">
            Immutable log of all administrative actions, permission overrides,
            user role modifications, and system security events.
          </p>
        </div>

        {/* Refresh button */}
        <div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E1A18] hover:bg-[#2A2421] border border-[#3A3530] text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <span
              className={`inline-block ${isFetching ? "animate-spin" : ""}`}
            >
              ↻
            </span>
            <span>{isFetching ? "Refreshing..." : "Refresh Logs"}</span>
          </button>
        </div>
      </div>

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
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by actor, email, action, entity, or IP..."
            className="w-full bg-[#14100E] border border-[#3A3530] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#E1017D] transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-500 hover:text-white cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#14100E] border border-[#3A3530] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 focus:outline-none focus:border-[#E1017D] cursor-pointer"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#1E1A18] text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Entity Filter */}
          <select
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#14100E] border border-[#3A3530] rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 focus:outline-none focus:border-[#E1017D] cursor-pointer"
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#1E1A18] text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchInput ||
            actionFilter !== "all" ||
            entityFilter !== "all") && (
            <button
              onClick={() => {
                setSearchInput("");
                setActionFilter("all");
                setEntityFilter("all");
                setCurrentPage(1);
              }}
              className="text-xs text-neutral-400 hover:text-white underline cursor-pointer px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs Table Area */}
      <div className="bg-[#1E1A18] border border-[#3A3530] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400">
            <div className="inline-block w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-3 text-[#E1017D]" />
            <p className="text-sm">Loading audit logs...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-400">
            <div className="p-3 bg-red-950/30 rounded-2xl inline-block mb-3 border border-red-500/20 text-red-400">
              <SecurityIcon size={28} />
            </div>
            <p className="font-bold text-base mb-1">
              Failed to load audit logs
            </p>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mb-4">
              {error instanceof Error
                ? error.message
                : "An error occurred while fetching logs."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-[#2A2421] hover:bg-[#3A3530] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : paginatedLogs.length === 0 ? (
          <div className="p-12 text-center text-neutral-400">
            <div className="p-3 bg-[#14100E] rounded-2xl inline-block mb-3 border border-[#3A3530] text-neutral-500">
              <AuditLogIcon size={32} />
            </div>
            <p className="font-bold text-white text-base mb-1">
              No Audit Logs Found
            </p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchInput || actionFilter !== "all" || entityFilter !== "all"
                ? "No activity logs matched your filter criteria."
                : "There are currently no recorded administrative activities in the system."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#3A3530] bg-[#161311] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Change Summary</th>
                  {/* <th className="py-3.5 px-4">Client IP</th>
                  <th className="py-3.5 px-4 text-right">Details</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A3530]/60">
                {paginatedLogs.map((log) => {
                  const dates = formatTimestamp(log.timestamp);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-[#25201D] transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-white text-xs">
                          {dates.date}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                          {dates.time}
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#2A2421] border border-[#3A3530] flex items-center justify-center text-xs font-bold text-[#A3EBFF] shrink-0">
                            {getActorInitials(log.user?.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white text-xs truncate">
                              {log.user?.name || "System"}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate max-w-37.5">
                              {log.user?.email || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Target Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-neutral-200 capitalize">
                            {log.entity?.type?.replace(/_/g, " ") || "Entity"}
                          </span>
                          <span className="text-[11px] font-mono text-neutral-400 bg-[#14100E] px-1.5 py-0.5 rounded border border-[#3A3530]">
                            #{log.entity?.id || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Change Summary */}
                      <td className="py-3.5 px-4">
                        {renderChangesSummary(log)}
                      </td>

                      {/* IP Address */}
                      {/* <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-neutral-400">
                        {log.metadata?.ipAddress || '—'}
                      </td> */}

                      {/* Actions */}
                      {/* <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-[#2A2421] hover:bg-[#E1017D]/20 text-neutral-300 hover:text-[#E1017D] transition-colors cursor-pointer"
                        >
                          <EyeIcon size={16} />
                        </button>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#3A3530] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161311]">
            <span className="text-xs text-neutral-400">
              Showing{" "}
              <span className="font-semibold text-white">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-white">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  isServerPaginated ? totalCount : filteredLogs.length,
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {isServerPaginated ? totalCount : filteredLogs.length}
              </span>{" "}
              entries
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AuditLogDetailsModal
        isOpen={Boolean(selectedLog)}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogs;
