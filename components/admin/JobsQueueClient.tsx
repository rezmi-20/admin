"use client";

import { useMemo, useState } from "react";
import { Search, Briefcase, Calendar, X, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

interface JobData {
  id: string;
  title: string;
  clientName: string;
  workerName: string | null;
  budget: number | null;
  status: string;
  createdAt: string;
}

interface Props {
  initialJobs: JobData[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50";
    case "active":
    case "in_progress":
      return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/50";
    case "pending":
      return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50";
    case "disputed":
    case "rejected":
    case "cancelled":
      return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50";
    default:
      return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/50";
  }
}

export function JobsQueueClient({ initialJobs }: Props) {
  const { t } = useLanguage();
  const [jobs] = useState<JobData[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const counts = useMemo(() => {
    return {
      all: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      in_progress: jobs.filter((j) => j.status === "in_progress" || j.status === "active").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      disputed: jobs.filter((j) => j.status === "disputed").length,
    };
  }, [jobs]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchesSearch =
        !query ||
        j.title.toLowerCase().includes(query) ||
        j.clientName.toLowerCase().includes(query) ||
        (j.workerName && j.workerName.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ||
        j.status === statusFilter ||
        (statusFilter === "in_progress" && (j.status === "active" || j.status === "in_progress"));

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const statuses = [
    { id: "all", label: "All Jobs", count: counts.all },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "in_progress", label: "In Progress", count: counts.in_progress },
    { id: "completed", label: "Completed", count: counts.completed },
    { id: "disputed", label: "Disputed", count: counts.disputed },
  ];

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Operations & Work Orders
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.jobs.title" as any) || "Jobs Queue"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.jobs.desc" as any) || "Track and monitor all published jobs and delivery milestones across Dire Dawa."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Total Jobs: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{jobs.length}</span>
          </div>
          {counts.in_progress > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
              {counts.in_progress} Active Workflows
            </div>
          )}
        </div>
      </div>

      {/* 2. Unified Table Surface Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        {/* Integrated Top Toolbar */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t("admin.jobs.searchPlaceholder" as any) || "Search jobs by title, client, or worker..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900/60 pl-9 pr-8 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:border-blue-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Status Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {statuses.map((item) => {
              const isSelected = statusFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isSelected
                        ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                        : "bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {item.count}
                  </span>
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
                <th className="py-3 px-4">{t("admin.jobs.table.title" as any) || "Job Engagement"}</th>
                <th className="py-3 px-4">{t("admin.jobs.table.client" as any) || "Client"}</th>
                <th className="py-3 px-4">{t("admin.jobs.table.worker" as any) || "Assigned Worker"}</th>
                <th className="py-3 px-4">{t("admin.jobs.table.budget" as any) || "Agreed Budget"}</th>
                <th className="py-3 px-4">{t("admin.jobs.table.status" as any) || "Status"}</th>
                <th className="py-3 px-4 text-right">{t("admin.jobs.table.date" as any) || "Created Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {filtered.map((j) => (
                <tr
                  key={j.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Job Title */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-100 text-xs group-hover:text-blue-600 transition">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate max-w-xs">
                      {j.title}
                    </p>
                    <span className="font-mono text-[10px] text-slate-400">#{j.id.slice(0, 8)}</span>
                  </td>

                  {/* Client */}
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {j.clientName}
                  </td>

                  {/* Worker */}
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {j.workerName || <span className="text-slate-400 italic">Unassigned</span>}
                  </td>

                  {/* Budget in ETB */}
                  <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                    {j.budget ? `${Number(j.budget).toLocaleString()} ETB` : "Negotiable"}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusClass(
                        j.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span className="capitalize">{j.status.replaceAll("_", " ")}</span>
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {formatDate(j.createdAt)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Briefcase className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No jobs found matching your filters.
                    </p>
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
