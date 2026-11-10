"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Scale,
  UserRound,
  Wrench,
  ArrowRight,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ShieldAlert,
  FileText,
  BadgeAlert,
} from "lucide-react";
import FadeContent from "@/components/ui/fade-content";

interface DisputeRow {
  id: string;
  job_id: string;
  title: string | null;
  job_title?: string | null;
  category: string | null;
  requested_resolution: string | null;
  status: string;
  payment_status: string | null;
  client_name: string | null;
  worker_name: string | null;
  assigned_admin_name: string | null;
  created_at: string;
}

const QUEUES = [
  { id: "open", label: "Open", icon: Clock },
  { id: "under_review", label: "Under Review", icon: Scale },
  { id: "evidence_review", label: "Evidence", icon: FileText },
  { id: "escalated", label: "Escalated", icon: AlertTriangle },
  { id: "resolved", label: "Resolved", icon: CheckCircle2 },
  { id: "all", label: "All Cases", icon: null },
] as const;

function statusClass(status: string) {
  if (status === "resolved") {
    return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (status === "escalated") {
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (status === "dismissed") {
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
  if (status === "evidence_review") {
    return "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }
  return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
}

function formatAge(value: string) {
  const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDisputesContent({ initialDisputes }: { initialDisputes: DisputeRow[] }) {
  const [queue, setQueue] = useState<string>("open");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const counts = useMemo(() => {
    return {
      open: initialDisputes.filter((d) => d.status === "open").length,
      under_review: initialDisputes.filter((d) => d.status === "under_review").length,
      evidence_review: initialDisputes.filter((d) => d.status === "evidence_review").length,
      escalated: initialDisputes.filter((d) => d.status === "escalated").length,
      resolved: initialDisputes.filter((d) => d.status === "resolved").length,
      all: initialDisputes.length,
    };
  }, [initialDisputes]);

  const rows = useMemo(
    () =>
      initialDisputes.filter((row) => {
        const matchesQueue = queue === "all" || row.status === queue;
        const haystack = [
          row.id,
          row.title,
          row.job_title,
          row.category,
          row.status,
          row.client_name,
          row.worker_name,
          row.payment_status,
          row.assigned_admin_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesQueue && (!query || haystack.includes(query));
      }),
    [initialDisputes, query, queue],
  );

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Dispute & Payment Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dispute Resolution Cases
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mediate client and worker contractual disputes, inspect uploaded evidence, manage escrow payment holds, and issue final determinations.
          </p>
        </div>

        {/* Quick KPI badges */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Active Cases: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {counts.open + counts.under_review + counts.evidence_review}
            </span>
          </div>
          {counts.escalated > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5">
              <BadgeAlert className="h-3.5 w-3.5" />
              <span>{counts.escalated} Escalated</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Unified Data Surface Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        {/* Integrated Top Toolbar */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by dispute title, party name, category, or status..."
              className="w-full bg-slate-50 dark:bg-slate-900/60 pl-9 pr-8 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:border-blue-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Queue Filter Segmented Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {QUEUES.map((item) => {
              const count = counts[item.id as keyof typeof counts];
              const isSelected = queue === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQueue(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon && <item.icon className="h-3 w-3" />}
                  <span>{item.label}</span>
                  {typeof count === "number" && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isSelected
                          ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                          : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4">Case Details</th>
                <th className="py-3 px-4">Disputing Parties</th>
                <th className="py-3 px-4">Status & Category</th>
                <th className="py-3 px-4">Payment & Assignment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Case Info */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {row.title || row.job_title || "Untitled Dispute"}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-mono">#{row.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>{formatAge(String(row.created_at))}</span>
                        {row.job_title && row.title && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{row.job_title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Disputing Parties */}
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          <UserRound className="h-3 w-3" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                          {row.client_name || "Client"}
                        </span>
                        <span className="text-[10px] text-slate-400">(Client)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          <Wrench className="h-2.5 w-2.5" />
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                          {row.worker_name || "Worker"}
                        </span>
                        <span className="text-[10px] text-slate-400">(Worker)</span>
                      </div>
                    </div>
                  </td>

                  {/* Status & Category */}
                  <td className="py-3 px-4">
                    <div className="space-y-1.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusClass(
                          row.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{row.status.replaceAll("_", " ")}</span>
                      </span>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {row.category ? row.category.replaceAll("_", " ") : "General breach"}
                      </p>
                    </div>
                  </td>

                  {/* Payment & Assignment */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {row.assigned_admin_name || "Unassigned"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Payment:{" "}
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {row.payment_status || "No hold"}
                        </span>
                      </p>
                    </div>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/disputes/${row.id}`}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                    >
                      <span>Open Case</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <Scale className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No disputes found in this queue.
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-2 text-xs text-blue-500 hover:underline"
                      >
                        Clear search filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </FadeContent>
  );
}
