"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  Search,
  UserRound,
  Filter,
  User,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

type WorkerRow = {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  isVerified: boolean;
  isSuspended: boolean;
  maskedFin: string | null;
  hasDocument: boolean;
  attemptNumber: number | null;
  createdAt: string;
  decidedAt: string | null;
  reviewerName: string | null;
};

type ClientRow = {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  isVerified: boolean;
  isSuspended: boolean;
  maskedFin: string | null;
  hasDocument: boolean;
  attemptNumber: number | null;
  createdAt: string;
  decidedAt: string | null;
  reviewerName: string | null;
};

type Props = {
  workers: WorkerRow[];
  clients: ClientRow[];
  canOpenDetails: boolean;
  canReview: boolean;
};

export function VerificationReviewTabs({ workers, clients, canOpenDetails, canReview }: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"workers" | "clients">("workers");
  const [queue, setQueue] = useState<"pending" | "approved" | "rejected" | "revoked" | "suspended" | "resubmitted" | "all">("pending");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [resubmittedOnly, setResubmittedOnly] = useState(false);
  const [reviewerFilter, setReviewerFilter] = useState("");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedReviewer = reviewerFilter.trim().toLowerCase();

  const ageLabel = (createdAt: string) => {
    const ms = Date.now() - new Date(createdAt).getTime();
    const days = Math.max(0, Math.floor(ms / 86_400_000));
    if (days <= 0) return t("common.today" as any) || "Today";
    if (days === 1) return `1 ${t("common.day" as any) || "day"}`;
    return `${days} ${t("common.days" as any) || "days"}`;
  };

  const statusLabel = (status: string) =>
    status === "not_started"
      ? t("admin.clients.notVerified" as any) || "Not Verified"
      : t(`verification.status.${status}` as any) || status;

  const matchesQueue = (status: string) => {
    if (queue === "all") return true;
    if (queue === "pending") return status === "pending";
    if (queue === "approved") return status === "approved";
    if (queue === "rejected") return status === "rejected";
    if (queue === "revoked") return status === "revoked";
    if (queue === "suspended") return status === "suspended";
    if (queue === "resubmitted") return true;
    return false;
  };

  const matchesFilters = (row: { status: string; attemptNumber: number | null; createdAt: string; reviewerName: string | null }) => {
    if (!matchesQueue(row.status)) return false;
    if (queue === "resubmitted" && !(row.status === "resubmission_requested" || Number(row.attemptNumber || 1) > 1)) return false;
    if (dateFrom && new Date(row.createdAt) < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo && new Date(row.createdAt) > new Date(`${dateTo}T23:59:59`)) return false;
    if (normalizedReviewer && !String(row.reviewerName || "").toLowerCase().includes(normalizedReviewer)) return false;
    return true;
  };

  const filteredWorkers = useMemo(
    () =>
      workers.filter((worker) =>
        matchesFilters(worker) &&
        (!resubmittedOnly || worker.status === "resubmission_requested" || Number(worker.attemptNumber || 1) > 1) &&
        [worker.fullName, worker.email, worker.phone, worker.status, worker.maskedFin, worker.reviewerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [workers, normalizedQuery, queue, dateFrom, dateTo, resubmittedOnly, normalizedReviewer],
  );

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        matchesFilters(client) &&
        (!resubmittedOnly || client.status === "resubmission_requested" || Number(client.attemptNumber || 1) > 1) &&
        [client.fullName, client.email, client.phone, client.status, client.maskedFin, client.reviewerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [clients, normalizedQuery, queue, dateFrom, dateTo, resubmittedOnly, normalizedReviewer],
  );

  const currentCount = tab === "workers" ? filteredWorkers.length : filteredClients.length;
  const pendingWorkerCount = useMemo(() => workers.filter((w) => w.status === "pending").length, [workers]);
  const pendingClientCount = useMemo(() => clients.filter((c) => c.status === "pending").length, [clients]);

  const hasActiveAdvanced = Boolean(dateFrom || dateTo || reviewerFilter || resubmittedOnly);

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("admin.verification.panel" as any) || "Identity Operations"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.verification.queueTitle" as any) || "Identity Verification Queue"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.verification.queueDesc" as any) || "Review Fayda national identity credentials and certificates for workers and clients."}
          </p>
        </div>

        {/* Tab Switcher in Header (Flush) */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#141E30] p-1 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab("workers")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === "workers"
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>{t("admin.verification.tab.workers" as any) || "Workers"}</span>
            <span className="rounded-full bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
              {workers.length}
            </span>
            {pendingWorkerCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title={`${pendingWorkerCount} pending review`} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("clients")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === "clients"
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserRound className="h-3.5 w-3.5" />
            <span>{t("admin.verification.tab.clients" as any) || "Clients"}</span>
            <span className="rounded-full bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
              {clients.length}
            </span>
            {pendingClientCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title={`${pendingClientCount} pending review`} />
            )}
          </button>
        </div>
      </div>

      {/* 2. Unified Table Surface Card (Toolbar + Table inside ONE cohesive surface) */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        {/* Integrated Top Toolbar */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("admin.verification.search" as any) || "Search by name, email, phone, or Fayda FIN..."}
                className="w-full bg-slate-50 dark:bg-slate-900/60 pl-9 pr-8 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:border-blue-500 transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Queue Filter Segmented Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: "pending", label: "Pending", icon: Clock },
                { id: "approved", label: "Approved", icon: CheckCircle2 },
                { id: "rejected", label: "Rejected", icon: ShieldAlert },
                { id: "all", label: "All Records", icon: null },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setQueue(item.id as typeof queue)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                    queue === item.id
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.icon && <item.icon className="h-3 w-3" />}
                  <span>{item.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`p-1.5 rounded-lg border text-xs font-semibold shrink-0 transition flex items-center gap-1 ${
                  hasActiveAdvanced || showAdvancedFilters
                    ? "border-blue-500/50 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title="Toggle advanced filters"
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[11px]">Filters</span>
                {hasActiveAdvanced && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.05] text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reviewer Name</label>
                <input
                  value={reviewerFilter}
                  onChange={(event) => setReviewerFilter(event.target.value)}
                  placeholder="Filter by admin..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>

              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={resubmittedOnly}
                    onChange={(event) => setResubmittedOnly(event.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="truncate text-xs font-medium">Resubmissions only</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        {tab === "workers" ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3 px-4">{t("admin.verification.col.worker" as any) || "Worker"}</th>
                  <th className="py-3 px-4">{t("admin.common.status" as any) || "Status"}</th>
                  <th className="py-3 px-4">{t("admin.verification.col.finDoc" as any) || "Fayda FIN & Doc"}</th>
                  <th className="py-3 px-4">{t("admin.verification.col.reviewerAge" as any) || "Reviewer & Age"}</th>
                  <th className="py-3 px-4 text-right">{t("admin.verification.col.action" as any) || "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {filteredWorkers.map((worker) => {
                  const isApproved = worker.status === "approved";
                  return (
                    <tr
                      key={worker.userId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/10">
                            {worker.fullName?.charAt(0) || <User size={13} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {worker.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{worker.email}</p>
                            {worker.phone && (
                              <p className="text-[10px] text-slate-400 font-mono">+251 {worker.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50"
                              : worker.isSuspended || worker.status === "rejected" || worker.status === "revoked"
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-emerald-500" : worker.isSuspended ? "bg-rose-500" : "bg-amber-500"
                            }`}
                          />
                          {statusLabel(worker.isSuspended ? "suspended" : worker.status)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {worker.maskedFin || (t("admin.verification.finMissing" as any) || "No FIN")}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {worker.hasDocument
                            ? t("admin.verification.documentSubmitted" as any) || "Document on file"
                            : t("admin.verification.documentMissing" as any) || "No document"}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {worker.reviewerName || (t("admin.verification.unassigned" as any) || "Unassigned")}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Attempt #{worker.attemptNumber || 1} · {ageLabel(worker.createdAt)}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {canOpenDetails && (
                          <Link
                            href={`/admin/verify/${worker.userId}`}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                          >
                            <span>{canReview ? "Review" : "View"}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400">
                      {t("admin.verification.noWorkers" as any) || "No worker submissions found matching filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3 px-4">{t("admin.verification.col.client" as any) || "Client"}</th>
                  <th className="py-3 px-4">{t("admin.common.status" as any) || "Status"}</th>
                  <th className="py-3 px-4">{t("admin.verification.col.finDoc" as any) || "Fayda FIN & Doc"}</th>
                  <th className="py-3 px-4">{t("admin.verification.col.reviewerAge" as any) || "Reviewer & Age"}</th>
                  <th className="py-3 px-4 text-right">{t("admin.verification.col.action" as any) || "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {filteredClients.map((client) => {
                  const isApproved = client.status === "approved";
                  return (
                    <tr
                      key={client.userId}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                            {client.fullName?.charAt(0) || <User size={13} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {client.fullName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{client.email}</p>
                            {client.phone && (
                              <p className="text-[10px] text-slate-400 font-mono">+251 {client.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50"
                              : client.isSuspended || client.status === "rejected" || client.status === "revoked"
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50"
                              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-emerald-500" : client.isSuspended ? "bg-rose-500" : "bg-amber-500"
                            }`}
                          />
                          {statusLabel(client.isSuspended ? "suspended" : client.status)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {client.maskedFin || (t("admin.verification.finMissing" as any) || "No FIN")}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {client.hasDocument
                            ? t("admin.verification.documentSubmitted" as any) || "Document on file"
                            : t("admin.verification.documentMissing" as any) || "No document"}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {client.reviewerName || (t("admin.verification.unassigned" as any) || "Unassigned")}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Attempt #{client.attemptNumber || 1} · {ageLabel(client.createdAt)}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {canOpenDetails && (
                          <Link
                            href={`/admin/clients/${client.userId}/verify`}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                          >
                            <span>{canReview ? "Review" : "View"}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-slate-400">
                      {t("admin.verification.noClients" as any) || "No client submissions found matching filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FadeContent>
  );
}
