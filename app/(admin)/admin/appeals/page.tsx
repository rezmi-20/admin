import Link from "next/link";
import { getAppealsForReview } from "@/lib/actions/governance";
import { Scale, ChevronRight, Clock, CheckCircle2, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  switch (status) {
    case "appeal_requested":
      return {
        label: "Pending Review",
        classes: "border-amber-200/50 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
      };
    case "appeal_under_review":
      return {
        label: "Under Review",
        classes: "border-blue-200/50 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
      };
    case "appeal_resolved":
      return {
        label: "Resolved",
        classes: "border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
      };
    case "appeal_dismissed":
      return {
        label: "Dismissed",
        classes: "border-slate-200/50 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      };
    default:
      return {
        label: status.replaceAll("_", " "),
        classes: "border-slate-200/50 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
      };
  }
}

export default async function AdminAppealsPage() {
  const appeals = await getAppealsForReview();

  const pendingCount = appeals.filter((a: any) =>
    ["appeal_requested", "appeal_under_review"].includes(a.status)
  ).length;
  const resolvedCount = appeals.filter((a: any) =>
    ["appeal_resolved", "appeal_dismissed"].includes(a.status)
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Executive Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Governance Appeals Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Super Admin escalation pipeline for contested dispute determinations and formal procedural appeals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Total Filings: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{appeals.length}</span>
          </div>
          {pendingCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {pendingCount} Awaiting Review
            </div>
          )}
        </div>
      </div>

      {/* 2. Three Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Appeals Filed</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{appeals.length}</p>
          <p className="mt-1 text-[11px] text-slate-400">All registered appeals</p>
        </div>

        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Awaiting Determination</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono">{pendingCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">Active review docket</p>
        </div>

        <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Completed Rulings</span>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">{resolvedCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">Fully adjudicated</p>
        </div>
      </div>

      {/* 3. Appeals Docket Surface Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        <div className="border-b border-black/[0.04] dark:border-white/[0.05] px-4 py-3.5 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Appeals Docket
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Newest submissions first
          </span>
        </div>

        {appeals.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-70 mb-1" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Appeals in Queue</p>
            <p className="text-[11px] text-slate-400">
              All platform dispute and verification decisions are currently uncontested.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
            {appeals.map((appeal: any) => {
              const badge = getStatusBadge(appeal.status);
              return (
                <Link
                  key={appeal.id}
                  href={`/admin/appeals/${appeal.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {appeal.reference}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 capitalize">
                        {String(appeal.appeal_type).replaceAll("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 transition">
                      {appeal.reason ? String(appeal.reason).replaceAll("_", " ") : "Governance Appeal"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
                      <span>Appellant: <strong className="text-slate-600 dark:text-slate-300">{appeal.appellant_name}</strong></span>
                      <span>·</span>
                      <span>Original Reviewer: <strong className="text-slate-600 dark:text-slate-300">{appeal.original_employee_id || "System"}</strong></span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {new Date(appeal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 text-blue-600 dark:text-blue-400 font-semibold text-xs group-hover:translate-x-0.5 transition">
                    <span>Review Case</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
