"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ExternalLink,
  Search,
  UserRound,
  UserX,
  UserCheck,
  X,
  AlertTriangle,
  User,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toClientDisplayStatus } from "@/lib/client-verification-shared";
import { sendClientVerificationReminder } from "@/lib/client-verification-reminders";
import { setSuspendedStatus } from "@/lib/actions/super-admin";
import FadeContent from "@/components/ui/fade-content";

interface ClientData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  verificationStatus: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  hasDocument: boolean;
  maskedFin: string | null;
  hasProfile: boolean;
  lastReminderAt: string | null;
  reminderCount: number;
  invalidApprovedReasons: string[];
  createdAt: string;
}

interface Props {
  initialClients: ClientData[];
  canOpenDetails: boolean;
  canReview: boolean;
  canSuspendAccount: boolean;
  canReactivateAccount: boolean;
}

export function ClientsManagementClient({
  initialClients,
  canOpenDetails,
  canReview,
  canSuspendAccount,
  canReactivateAccount,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected" | "revoked" | "suspended" | "not_started"
  >("all");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const query = search.trim().toLowerCase();

  const displayStatus = (client: ClientData) =>
    client.isSuspended ? "suspended" : toClientDisplayStatus(client.verificationStatus, client.isVerified);

  const counts = useMemo(() => {
    return {
      all: initialClients.length,
      approved: initialClients.filter((c) => displayStatus(c) === "approved").length,
      pending: initialClients.filter((c) => displayStatus(c) === "pending").length,
      not_started: initialClients.filter((c) => displayStatus(c) === "not_started").length,
      suspended: initialClients.filter((c) => c.isSuspended).length,
    };
  }, [initialClients]);

  const filtered = useMemo(
    () =>
      initialClients.filter((client) => {
        const status = displayStatus(client);
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const matchesSearch =
          !query ||
          [client.fullName, client.email, client.phone, status, client.maskedFin]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        return matchesStatus && matchesSearch;
      }),
    [initialClients, query, statusFilter],
  );

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString() : t("common.never" as any) || "Never";

  const isReminderCoolingDown = (value: string | null) =>
    value ? Date.now() - new Date(value).getTime() < 86_400_000 : false;

  const canSendReminder = (status: string) =>
    status === "not_started" || status === "rejected" || status === "revoked";

  const handleSendReminder = (clientUserId: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await sendClientVerificationReminder(clientUserId);
      setMessage(
        result.success
          ? t("admin.clients.reminderSent" as any) || "Verification reminder notification sent"
          : result.error || t("admin.clients.reminderFailed" as any) || "Failed to send reminder",
      );
    });
  };

  const handleSuspension = (clientUserId: string, suspended: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const result = await setSuspendedStatus(clientUserId, suspended);
      if (result.success) {
        setMessage(
          suspended
            ? t("admin.clients.suspended" as any) || "Client account suspended"
            : t("admin.clients.unsuspended" as any) || "Client account restored",
        );
        router.refresh();
        return;
      }
      setMessage(result.error || t("admin.clients.suspensionFailed" as any) || "Failed to update suspension status");
    });
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {t("admin.clients.badge" as any) || "Client Roster"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.clients.title" as any) || "Clients Directory"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.clients.desc" as any) || "Manage registered clients, Fayda identity reviews, and escrow contract authorization."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Total Clients: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{initialClients.length}</span>
          </div>
          {counts.pending > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {counts.pending} Pending Review
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3 text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-blue-400 hover:text-blue-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Unified Table Surface Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        {/* Integrated Top Toolbar */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, email, phone, or Fayda FIN..."
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

          {/* Status Filter Segmented Control */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All", count: counts.all },
              { id: "approved", label: "Approved", count: counts.approved },
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "not_started", label: "Not Started", count: counts.not_started },
              { id: "suspended", label: "Suspended", count: counts.suspended },
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
                <th className="py-3 px-4">{t("admin.common.name" as any) || "Client Profile"}</th>
                <th className="py-3 px-4">{t("admin.common.status" as any) || "Status"}</th>
                <th className="py-3 px-4">{t("admin.verification.col.finDoc" as any) || "Fayda FIN & Doc"}</th>
                <th className="py-3 px-4">Reminder Status</th>
                <th className="py-3 px-4 text-right">{t("admin.common.actions" as any) || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {filtered.map((client) => {
                const status = displayStatus(client);
                const isApproved = status === "approved";
                const isPending = status === "pending";
                const isSuspended = client.isSuspended;
                const coolingDown = isReminderCoolingDown(client.lastReminderAt);

                return (
                  <tr
                    key={client.userId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Client Name & Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                          {client.fullName?.charAt(0) || <User size={13} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-blue-600 transition">
                            {client.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{client.email}</p>
                          {client.phone && (
                            <p className="text-[10px] text-slate-400 font-mono">+251 {client.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isApproved
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50"
                            : isSuspended || status === "rejected" || status === "revoked"
                            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50"
                            : isPending
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isApproved
                              ? "bg-emerald-500"
                              : isSuspended
                              ? "bg-rose-500"
                              : isPending
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        <span className="capitalize">{status.replaceAll("_", " ")}</span>
                      </span>
                    </td>

                    {/* Fayda FIN & Doc */}
                    <td className="py-3 px-4 text-xs">
                      <p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {client.maskedFin || "No FIN"}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {client.hasDocument ? "Document on file" : "No document"}
                      </p>
                    </td>

                    {/* Reminder Status */}
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {client.reminderCount > 0 ? `${client.reminderCount} sent` : "No reminders"}
                      </p>
                      <p className="text-[10px] text-slate-400">Last: {formatDate(client.lastReminderAt)}</p>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canOpenDetails && (
                          <Link
                            href={`/admin/clients/${client.userId}/verify`}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                          >
                            <span>{canReview && isPending ? "Review" : "View"}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}

                        {canReview && canSendReminder(status) && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(client.userId)}
                            disabled={coolingDown || isPending}
                            title={coolingDown ? "Reminder sent recently" : "Send verification reminder"}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                          >
                            <Bell className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {canSuspendAccount && !client.isSuspended && (
                          <button
                            type="button"
                            onClick={() => handleSuspension(client.userId, true)}
                            disabled={isPending}
                            title="Suspend client"
                            className="p-1.5 rounded-lg border border-rose-200/60 dark:border-rose-900/40 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {canReactivateAccount && client.isSuspended && (
                          <button
                            type="button"
                            onClick={() => handleSuspension(client.userId, false)}
                            disabled={isPending}
                            title="Unsuspend client"
                            className="p-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <UserRound className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      No clients found matching filters.
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
