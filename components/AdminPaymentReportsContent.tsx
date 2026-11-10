"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, ArrowUpRight, DollarSign } from "lucide-react";
import type { AdminPaymentReport } from "@/lib/actions/admin-payments";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

function VentoPaymentTile({
  label,
  value,
  detail,
  dotColor,
}: {
  label: string;
  value: string;
  detail: string;
  dotColor: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
          {label}
        </span>
      </div>
      <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white my-1 font-mono">
        {value}
      </div>
      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
        {detail}
      </div>
    </div>
  );
}

export default function AdminPaymentReportsContent({ report }: { report: AdminPaymentReport }) {
  const { t } = useLanguage();
  const hasChartData = report.monthly.length > 0;

  function formatDate(value: string | null) {
    if (!value) return t("admin.report.notRecorded" as any) || "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.report.notRecorded" as any) || "—";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function statusClass(status: string) {
    if (status === "released") {
      return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50";
    }
    if (status === "refunded") {
      return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50";
    }
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/50";
  }

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Escrow & Revenue Management
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.report.revenue" as any) || "Payments & Payouts"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.report.desc" as any) || "Direct tracking of Chapa transaction flows, platform fees, and escrow payouts in ETB."}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50">
            Live Escrow Active
          </span>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <VentoPaymentTile
          label={t("admin.report.released" as any) || "Released Payouts"}
          value={formatMoney(report.totals.releasedVolume)}
          detail={`${report.totals.releasedCount} successful payouts`}
          dotColor="bg-emerald-500"
        />
        <VentoPaymentTile
          label={t("admin.report.commission" as any) || "Commission Revenue"}
          value={formatMoney(report.totals.commissionRevenue)}
          detail="Platform fee earnings"
          dotColor="bg-blue-500"
        />
        <VentoPaymentTile
          label={t("admin.report.disputed" as any) || "Disputed Escrow"}
          value={formatMoney(report.totals.disputedVolume)}
          detail={`${report.totals.disputedCount} escrow holds`}
          dotColor="bg-rose-500"
        />
        <VentoPaymentTile
          label={t("admin.report.totalEscrow" as any) || "Active In Escrow"}
          value={formatMoney(report.totals.totalVolume)}
          detail={`${report.totals.totalCount} registered transactions`}
          dotColor="bg-amber-500"
        />
      </section>

      {/* 3. Monthly Escrow Distribution Chart Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Transaction Distribution</h2>
            <p className="text-xs text-slate-400 mt-0.5">Escrow volume vs net commission in ETB</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              <span>Total Volume</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Commission</span>
            </span>
          </div>
        </div>

        {hasChartData ? (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.1)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-3 text-xs">
                        <p className="font-semibold text-slate-400 mb-1">{label}</p>
                        {payload.map((p: any, i: number) => (
                          <p key={i} className="font-bold" style={{ color: p.color }}>
                            {p.name}: {formatMoney(Number(p.value))}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="totalVolume" name="Total Volume" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="commissionRevenue" name="Commission Revenue" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No monthly financial history recorded yet.
          </div>
        )}
      </div>

      {/* 4. Settlements Table Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        <div className="px-4 py-3.5 border-b border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t("admin.report.recent" as any) || "Recent Settlements & Payouts"}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {report.recentSettlements.length} transactions
          </span>
        </div>

        {report.recentSettlements.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-400">
            No completed settlements recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-3 px-4">Contract / Job</th>
                  <th className="py-3 px-4">Worker Recipient</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {report.recentSettlements.map((s) => (
                  <tr key={s.paymentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{s.jobTitle}</p>
                      <p className="text-[10px] text-slate-400">Client: {s.clientName}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {s.workerName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(s.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(s.workerAmount)}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {formatMoney(s.commissionAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${statusClass(s.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        <span className="capitalize">{s.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {formatDate(s.settledAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FadeContent>
  );
}
