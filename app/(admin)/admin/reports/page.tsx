import Link from "next/link";
import { getGovernanceReport, getMisuseIndicators } from "@/lib/actions/governance";
import { requireAdminPermission } from "@/lib/admin-authorization";
import {
  BarChart3,
  Calendar,
  Users,
  Briefcase,
  CreditCard,
  Scale,
  Headphones,
  ShieldAlert,
  Filter,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Governance Reports | DireSkill Admin",
  description: "Review read-only system-wide operational, audit, appeal, and support governance metrics.",
};

function n(value: unknown) {
  return Number(value || 0).toLocaleString();
}

function MetricCard({
  title,
  icon,
  dotColor = "bg-blue-500",
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  dotColor?: string;
  rows: Array<[string, unknown]>;
}) {
  return (
    <div className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.05] mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h2 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
        </div>
        <div className="p-1 rounded-md text-slate-400">
          {icon}
        </div>
      </div>
      <div className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{typeof value === "number" ? n(value) : String(value ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  await requireAdminPermission("reports.read");
  const params = await searchParams;

  const [report, indicators] = await Promise.all([
    getGovernanceReport(params.period || "last_7_days", params.from, params.to),
    getMisuseIndicators(),
  ]);

  if ("error" in report) throw new Error(report.error);

  const activePeriod = params.period || "last_7_days";

  return (
    <div className="space-y-4 pb-16 w-full">
      {/* Vento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[14px] bg-white dark:bg-[#141E30] border border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Executive Governance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            System & Operations Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Platform throughput indicators, verified accounts, financial flows, and administrative oversight.
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <form
        method="GET"
        className="rounded-[12px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <select
              name="period"
              defaultValue={activePeriod}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="all_time">All Time</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-semibold text-slate-400">From:</span>
            <input
              name="from"
              type="date"
              defaultValue={params.from || ""}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-semibold text-slate-400">To:</span>
            <input
              name="to"
              type="date"
              defaultValue={params.to || ""}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {params.period && params.period !== "last_7_days" && (
            <Link
              href="/admin/reports"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition"
            >
              Reset
            </Link>
          )}
          <button
            type="submit"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow-sm cursor-pointer"
          >
            <Filter className="h-3 w-3" />
            <span>Apply Filter</span>
          </button>
        </div>
      </form>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="User Accounts"
          dotColor="bg-blue-500"
          icon={<Users className="h-4 w-4 text-blue-500" />}
          rows={[
            ["Total Clients", report.users.total_clients],
            ["Total Workers", report.users.total_workers],
            ["Verified Workers", report.users.verified_workers],
            ["Verified Clients", report.users.verified_clients],
            ["Pending Identity Verification", report.users.pending_verification],
          ]}
        />
        <MetricCard
          title="Job Execution"
          dotColor="bg-violet-500"
          icon={<Briefcase className="h-4 w-4 text-violet-500" />}
          rows={[
            ["Jobs Created (Period)", report.jobs.jobs_created],
            ["Active In-Progress Jobs", report.jobs.jobs_active],
            ["Completed & Paid", report.jobs.jobs_completed],
            ["Disputed Jobs", report.jobs.jobs_disputed],
          ]}
        />
        <MetricCard
          title="Escrow & Payments"
          dotColor="bg-emerald-500"
          icon={<CreditCard className="h-4 w-4 text-emerald-500" />}
          rows={[
            ["Provider Verified Payments", report.payments.verified_payments],
            ["Released to Workers", report.payments.released_payments],
            ["Financial Holds", report.payments.held_payments],
            ["Under Financial Review", report.payments.financial_review_cases],
          ]}
        />
        <MetricCard
          title="Dispute Operations"
          dotColor="bg-rose-500"
          icon={<Scale className="h-4 w-4 text-rose-500" />}
          rows={[
            ["Open Disputes", report.disputes.open_disputes],
            ["Under Evidence Review", report.disputes.under_review_disputes],
            ["Resolved Cases", report.disputes.resolved_disputes],
            ["Escalated Cases", report.disputes.escalated_disputes],
          ]}
        />
        <MetricCard
          title="User Support Tickets"
          dotColor="bg-amber-500"
          icon={<Headphones className="h-4 w-4 text-amber-500" />}
          rows={[
            ["Open Tickets", report.support.open_tickets],
            ["Resolved Tickets", report.support.resolved_tickets],
            ["Escalated Tickets", report.support.escalations],
            ["Avg Resolution Time", `${Math.round(Number(report.support.avg_resolution_hours || 0))} hrs`],
          ]}
        />
      </div>

      {/* Neutral Admin Operation Metrics */}
      <section className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="border-b border-black/[0.04] dark:border-white/[0.05] px-5 py-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Administrative Staff Operation Metrics
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">{report.note}</p>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verifications</th>
                <th className="px-4 py-3">Disputes</th>
                <th className="px-4 py-3">Support</th>
                <th className="px-4 py-3">Sensitive Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {report.adminOps.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {row.admin_employee_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.full_name}</td>
                  <td className="px-4 py-3 capitalize text-slate-500">
                    {String(row.admin_role).replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{n(row.verification_decisions)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{n(row.disputes_handled)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{n(row.support_tickets_handled)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        Number(row.sensitive_access_count) > 5
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50"
                          : "text-slate-400"
                      }`}
                    >
                      {n(row.sensitive_access_count)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Misuse Indicators */}
      <section className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="border-b border-black/[0.04] dark:border-white/[0.05] px-5 py-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Security & Misuse Indicators</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Statistical variance monitoring for audit oversight. No automated actions taken without human review.
          </p>
        </div>

        <div className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
          {indicators.map((row: any) => (
            <div
              key={row.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {row.admin_employee_id}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.full_name}</span>
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400 capitalize">
                    {String(row.admin_role).replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                    row.misuse_flag === "high_risk_review"
                      ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      : row.misuse_flag === "attention_required"
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-slate-200 bg-slate-100 text-slate-500"
                  }`}
                >
                  {row.misuse_flag.replaceAll("_", " ")}
                </span>
                <span className="text-slate-400 text-[11px]">
                  FIN: <strong className="text-slate-700 dark:text-slate-200">{n(row.fin_reveal_count)}</strong> · High-Risk:{" "}
                  <strong className="text-slate-700 dark:text-slate-200">{n(row.high_risk_count)}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
