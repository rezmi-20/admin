import Link from "next/link";
import { getAuditLogEntries } from "@/lib/actions/governance";
import {
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActorBadge(role: string = "") {
  switch (role) {
    case "super_admin":
      return "border-purple-200/50 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
    case "dispute_payment_admin":
      return "border-blue-200/50 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    case "content_verification_admin":
      return "border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "user_support_admin":
      return "border-amber-200/50 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "system":
      return "border-slate-200/50 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "border-slate-200/50 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  }
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const result = await getAuditLogEntries({
    q: params.q,
    action: params.action,
    module: params.module,
    targetType: params.targetType,
    adminRole: params.adminRole,
    highRiskOnly: params.highRisk === "1",
    page: Number(params.page || 1),
    from: params.from,
    to: params.to,
  });

  const entries = result.entries || [];
  const hasActiveFilters = Boolean(
    params.q ||
      params.module ||
      params.targetType ||
      params.from ||
      params.to ||
      params.highRisk === "1"
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Security & Compliance Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed timeline of all administrative operations, dispute adjudications, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Log Entries: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{result.total || entries.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Unified Ledger Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        {/* Integrated Filter Toolbar */}
        <form
          method="GET"
          className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] space-y-3 bg-white dark:bg-[#141E30]"
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6 items-end">
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="Search action, target ID, admin name..."
                  className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Module</label>
              <select
                name="module"
                defaultValue={params.module || ""}
                className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">All Modules</option>
                <option value="verification">Verification</option>
                <option value="disputes">Disputes</option>
                <option value="governance">Governance</option>
                <option value="support">Support</option>
                <option value="admin_accounts">Admin Accounts</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From Date</label>
              <input
                type="date"
                name="from"
                defaultValue={params.from || ""}
                className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To Date</label>
              <input
                type="date"
                name="to"
                defaultValue={params.to || ""}
                className="w-full rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 py-1.5 text-xs font-semibold text-white transition shadow-sm"
              >
                Filter
              </button>
              {hasActiveFilters && (
                <Link
                  href="/admin/audit"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Reset filters"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </form>

        {/* Data Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/30">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / Principal</th>
                <th className="px-4 py-3">Action & Module</th>
                <th className="px-4 py-3">Target Reference</th>
                <th className="px-4 py-3">Attribution & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No audit records found</p>
                    <p className="text-xs mt-0.5 text-slate-400">Try resetting or broadening your search parameters.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => {
                  const roleBadge = getActorBadge(entry.actor_role);
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {formatDate(entry.created_at)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {entry.actor_name || entry.actor_employee_id || entry.actor_type || "System"}
                          </p>
                          <span
                            className={`inline-block rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${roleBadge}`}
                          >
                            {String(entry.actor_role || entry.actor_type || "system").replaceAll("_", " ")}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight text-[11px]">
                            {String(entry.action).replaceAll("_", " ")}
                          </p>
                          <span className="font-mono text-[10px] text-slate-400 uppercase">
                            {entry.module || "General"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {entry.target_id ? `#${String(entry.target_id).slice(0, 8)}` : "—"}
                          </span>
                          {entry.target_type && (
                            <p className="text-[10px] text-slate-400 capitalize">{entry.target_type}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="space-y-0.5">
                          {entry.reason && (
                            <p className="text-slate-700 dark:text-slate-300 italic truncate max-w-xs">
                              "{entry.reason}"
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            IP: {entry.ip_address || "Internal"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {result.totalPages > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-black/[0.04] dark:border-white/[0.05] text-xs">
            <span className="text-slate-400">
              Page {result.page} of {result.totalPages}
            </span>
            <div className="flex items-center gap-1">
              {result.page > 1 && (
                <Link
                  href={`/admin/audit?page=${result.page - 1}`}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Previous
                </Link>
              )}
              {result.page < result.totalPages && (
                <Link
                  href={`/admin/audit?page=${result.page + 1}`}
                  className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
