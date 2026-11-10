"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileText, Download, CheckCircle2, Clock, X, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

interface ContractData {
  id: string;
  jobTitle: string;
  clientName: string;
  workerName: string;
  clientSignedAt: string | null;
  workerSignedAt: string | null;
  signedAt: string | null;
  pdfUrl: string | null;
}

interface Props {
  initialContracts: ContractData[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ContractsOversightClient({ initialContracts }: Props) {
  const { t } = useLanguage();
  const [contracts] = useState<ContractData[]>(initialContracts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "executed" | "pending">("all");

  const counts = useMemo(() => {
    return {
      all: contracts.length,
      executed: contracts.filter((c) => Boolean(c.signedAt)).length,
      pending: contracts.filter((c) => !c.signedAt).length,
    };
  }, [contracts]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return contracts.filter((c) => {
      const isExecuted = Boolean(c.signedAt);
      const matchesFilter =
        filter === "all" ||
        (filter === "executed" && isExecuted) ||
        (filter === "pending" && !isExecuted);

      const matchesSearch =
        !query ||
        c.jobTitle.toLowerCase().includes(query) ||
        c.clientName.toLowerCase().includes(query) ||
        c.workerName.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [contracts, search, filter]);

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Legal & Contract Registry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.contracts.title" as any) || "Contracts Oversight"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.contracts.desc" as any) || "Overview of digital job agreements, bipartite signatures, and official contract PDFs."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Total Contracts: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{contracts.length}</span>
          </div>
          {counts.executed > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              {counts.executed} Fully Executed
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
              placeholder={t("admin.contracts.searchPlaceholder" as any) || "Search contracts by job engagement, client, or worker..."}
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

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Contracts", count: counts.all, icon: null },
              { id: "executed", label: "Executed", count: counts.executed, icon: CheckCircle2 },
              { id: "pending", label: "Pending Signatures", count: counts.pending, icon: Clock },
            ].map((item) => {
              const isSelected = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id as typeof filter)}
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
                <th className="py-3 px-4">{t("admin.contracts.table.job" as any) || "Job Engagement"}</th>
                <th className="py-3 px-4">{t("admin.contracts.table.client" as any) || "Client Signature"}</th>
                <th className="py-3 px-4">{t("admin.contracts.table.worker" as any) || "Worker Signature"}</th>
                <th className="py-3 px-4">{t("admin.contracts.table.signed" as any) || "Execution State"}</th>
                <th className="py-3 px-4 text-right">{t("admin.contracts.table.pdf" as any) || "Contract PDF"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {filtered.map((c) => {
                const isFullySigned = Boolean(c.signedAt);
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Job Title */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {c.jobTitle}
                        </p>
                        <span className="font-mono text-[10px] text-slate-400">#{c.id.slice(0, 8)}</span>
                      </div>
                    </td>

                    {/* Client Signature */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{c.clientName}</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          {c.clientSignedAt ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{formatDate(c.clientSignedAt)}</span>
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending signature</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Worker Signature */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{c.workerName}</span>
                        <div className="flex items-center gap-1 text-[11px]">
                          {c.workerSignedAt ? (
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{formatDate(c.workerSignedAt)}</span>
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Pending signature</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Execution State */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isFullySigned
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50"
                            : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isFullySigned ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span>{isFullySigned ? `Executed ${formatDate(c.signedAt)}` : "Awaiting Signatures"}</span>
                      </span>
                    </td>

                    {/* PDF Action */}
                    <td className="py-3.5 px-4 text-right">
                      {c.pdfUrl ? (
                        <a
                          href={c.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>PDF</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not generated</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <FileText className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No contracts found matching your filters.
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
