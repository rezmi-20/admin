"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, Award, User, X, Wrench, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";

interface WorkerData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  skills: string[] | null;
  district: string | null;
  experienceYears: number | null;
  verificationStatus?: string | null;
  isVerified: boolean;
  isSuspended?: boolean | null;
  identityComplete?: boolean | null;
  hasDocument: boolean;
  createdAt: string;
}

interface Props {
  initialWorkers: WorkerData[];
  verificationCapabilities: {
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

export function WorkersManagementClient({ initialWorkers, verificationCapabilities }: Props) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending">("all");

  const displayStatus = (worker: WorkerData) =>
    toWorkerDisplayStatus(
      worker.verificationStatus,
      worker.isVerified,
      worker.isSuspended,
      worker.identityComplete !== false
    );

  const counts = useMemo(() => {
    return {
      all: initialWorkers.length,
      approved: initialWorkers.filter((w) => displayStatus(w) === "approved").length,
      pending: initialWorkers.filter((w) => displayStatus(w) !== "approved").length,
    };
  }, [initialWorkers]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return initialWorkers.filter((w) => {
      const status = displayStatus(w);
      const matchesSearch =
        !query ||
        w.fullName.toLowerCase().includes(query) ||
        w.email.toLowerCase().includes(query) ||
        (w.phone && w.phone.includes(query)) ||
        (w.district && w.district.toLowerCase().includes(query)) ||
        (w.skills && w.skills.some((s) => s.toLowerCase().includes(query)));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && status === "approved") ||
        (statusFilter === "pending" && status !== "approved");

      return matchesSearch && matchesStatus;
    });
  }, [initialWorkers, search, statusFilter]);

  const actionLabel = (worker: WorkerData) => {
    const status = displayStatus(worker);
    if (!verificationCapabilities.canReview || status === "approved" || status === "revoked") {
      return t("admin.verification.viewDetails" as any) || "View";
    }
    return t("admin.action.review" as any) || "Review";
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Directory & Roster
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.workers.title" as any) || "Workers Management"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.workers.desc" as any) || "Overview of all registered tradespeople, skills catalog, and Fayda verifications."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Total Workers: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{initialWorkers.length}</span>
          </div>
          {counts.pending > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {counts.pending} Pending Review
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
              placeholder={t("admin.workers.searchPlaceholder" as any) || "Search by worker name, trade skill, email, district, or phone..."}
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

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All", count: counts.all, icon: null },
              { id: "approved", label: "Verified", count: counts.approved, icon: CheckCircle2 },
              { id: "pending", label: "Pending Review", count: counts.pending, icon: Clock },
            ].map((item) => {
              const isSelected = statusFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id as typeof statusFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon && <item.icon className="h-3 w-3" />}
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
                <th className="py-3 px-4">{t("admin.workers.table.name" as any) || "Worker"}</th>
                <th className="py-3 px-4">{t("admin.workers.table.skills" as any) || "Trade Skills"}</th>
                <th className="py-3 px-4">{t("admin.workers.table.district" as any) || "District / Woreda"}</th>
                <th className="py-3 px-4 hidden md:table-cell">{t("admin.workers.table.experience" as any) || "Experience"}</th>
                <th className="py-3 px-4">{t("admin.workers.table.verification" as any) || "Status"}</th>
                <th className="py-3 px-4 text-right">{t("admin.workers.table.actions" as any) || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {filtered.map((w) => {
                const status = displayStatus(w);
                const isApproved = status === "approved";
                return (
                  <tr
                    key={w.userId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Worker Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/10">
                          {w.fullName?.charAt(0) || <User size={13} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {w.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{w.email}</p>
                          {w.phone && (
                            <p className="text-[10px] text-slate-400 font-mono">+251 {w.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Trade Skills */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {w.skills && w.skills.length > 0 ? (
                          w.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No skills listed</span>
                        )}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {w.district || "Dire Dawa"}
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <Award className="w-3.5 h-3.5 text-blue-500" />
                        <span>
                          {w.experienceYears ?? 0} {t("admin.workers.table.years" as any) || "years"}
                        </span>
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50"
                            : status === "suspended" || status === "revoked"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isApproved ? "bg-emerald-500" : status === "suspended" ? "bg-rose-500" : "bg-amber-500"
                          }`}
                        />
                        <span className="capitalize">
                          {isApproved ? t("verification.status.approved" as any) || "Approved" : status}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {w.hasDocument ? (
                        <Link
                          href={`/admin/verify/${w.userId}`}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                        >
                          <span>{actionLabel(w)}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No document</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Wrench className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No tradespeople found matching your query.
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
