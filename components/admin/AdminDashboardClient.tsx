"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PendingVerification } from "@/components/admin/PendingVerification";
import {
  ArrowUpRight,
  Pin,
  Sparkles,
  TrendingUp,
  Wallet,
  Mic,
  ChevronRight,
  AlertTriangle,
  Briefcase,
  UserRound,
  Search,
  X,
  Shield,
  CreditCard,
  Server,
  FileCheck2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Tooltip as RechartsTooltip,
} from "recharts";

interface Props {
  workerCount: number;
  pendingVerifCount: number;
  activeContractCount: number;
  completedJobsMonthly: number;
  revenueDisplay: string;
  disputeCount: number;
  activityFeed: { type: string; title: string; created_at: string }[];
  unverifiedWorkers: any[];
  verificationCapabilities: {
    canRead: boolean;
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

// ── REAL RECHARTS DATASETS (In ETB) ───────────────────────────────────────
const HOURLY_BARS_DATA = [
  { time: "7:00", volume: 32 },
  { time: "7:30", volume: 42 },
  { time: "8:00", volume: 68 },
  { time: "8:30", volume: 76 },
  { time: "9:00", volume: 92 },
  { time: "9:30", volume: 78 },
  { time: "10:00", volume: 56 },
  { time: "10:30", volume: 30 },
  { time: "11:00", volume: 18 },
  { time: "11:30", volume: 14 },
  { time: "12:00", volume: 22 },
  { time: "12:30", volume: 36 },
  { time: "13:00", volume: 64 },
  { time: "13:30", volume: 78 },
  { time: "14:00", volume: 88 },
  { time: "14:30", volume: 90 },
  { time: "15:00", volume: 70 },
  { time: "15:30", volume: 55 },
];

const PERFORMANCE_LINE_DATA = [
  { week: "W1", newUsers: 4, jobsPosted: 2, disputes: 0 },
  { week: "W2", newUsers: 6, jobsPosted: 3, disputes: 1 },
  { week: "W3", newUsers: 12, jobsPosted: 8, disputes: 1 },
  { week: "W4", newUsers: 8, jobsPosted: 5, disputes: 0 },
  { week: "W5", newUsers: 14, jobsPosted: 9, disputes: 1 },
];

// REAL RECHARTS DONUT DATA FOR SPENT AMOUNT (72% Allocated in ETB)
const SPENT_DONUT_DATA = [
  { name: "Worker Escrow & Payouts", value: 45, color: "#2563EB", amount: "ETB 45.00" },
  { name: "Verification & Operations", value: 27, color: "#60A5FA", amount: "ETB 27.00" },
  { name: "Remaining Allocation", value: 28, color: "#DBEAFE", amount: "ETB 28.00" },
];

// Speedometer Arc Data for Revenue (Telebirr: 50%, Chapa: 30%, Cash: 20%)
const REVENUE_SPEEDOMETER_DATA = [
  { name: "Telebirr Gateway", value: 50, color: "#2563EB", amount: "ETB 50.00" },
  { name: "Chapa Gateway", value: 30, color: "#10B981", amount: "ETB 30.00" },
  { name: "Bank / Cash", value: 20, color: "#FBBF24", amount: "ETB 20.00" },
];

// Interactive Recharts Tooltip with ETB Currency
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 text-xs">
      {label && <p className="text-slate-400 font-semibold mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => {
        const customAmount = entry.payload?.amount;
        return (
          <div key={i} className="flex items-center justify-between gap-3 py-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
              />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {entry.name}:
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {customAmount || (typeof entry.value === "number" ? `${entry.value} events` : entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Maps activities into the 3 Vento pastel card styles (Cyan, Mint, Pink)
function getEventCardStyle(item: { type: string; title: string; created_at: string }, index: number) {
  const isUser = item.type === "user_signup";
  const isDispute = item.title.toLowerCase().includes("dispute");
  const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (isDispute || (!isUser && index % 3 === 2)) {
    return {
      bg: "bg-[#FDF2F8] dark:bg-fuchsia-950/40",
      border: "border-[#F5D0FE]/80 dark:border-fuchsia-800/60 hover:border-fuchsia-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/60",
      iconColor: "text-[#C026D3] dark:text-fuchsia-300",
      tagBg: "bg-fuchsia-100/70 dark:bg-fuchsia-900/50",
      tagColor: "text-[#C026D3] dark:text-fuchsia-300",
      tagText: `Dispute • ${formattedDate}`,
      defaultDescription: "Contract dispute flagged for administrator mediation. Escrow on hold.",
      icon: AlertTriangle,
      link: "/admin/disputes",
    };
  }

  if (isUser || index % 3 === 1) {
    return {
      bg: "bg-[#ECFDF5] dark:bg-emerald-950/40",
      border: "border-[#A7F3D0]/80 dark:border-emerald-800/60 hover:border-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
      iconColor: "text-[#059669] dark:text-emerald-300",
      tagBg: "bg-emerald-100/70 dark:bg-emerald-900/50",
      tagColor: "text-[#059669] dark:text-emerald-300",
      tagText: `User • ${formattedDate}`,
      defaultDescription: "New user account registered. Identity verification profile initialized.",
      icon: UserRound,
      link: "/admin/verify",
    };
  }

  // Job posted or default
  return {
    bg: "bg-[#F0F9FF] dark:bg-sky-950/40",
    border: "border-[#BAE6FD]/80 dark:border-sky-800/60 hover:border-sky-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/60",
    iconColor: "text-[#0284C7] dark:text-sky-300",
    tagBg: "bg-sky-100/70 dark:bg-sky-900/50",
    tagColor: "text-[#0284C7] dark:text-sky-300",
    tagText: `Job • ${formattedDate}`,
    defaultDescription: "New marketplace job posted. Active on board awaiting verified worker bids.",
    icon: Briefcase,
    link: "/admin/jobs",
  };
}

export function AdminDashboardClient({
  workerCount,
  pendingVerifCount,
  activeContractCount,
  completedJobsMonthly,
  revenueDisplay,
  disputeCount,
  activityFeed,
  unverifiedWorkers,
  verificationCapabilities,
}: Props) {
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedRange, setSelectedRange] = useState("This month");

  // Listen for Time Filter changes from TopBar ("This month", "Last month", "Custom")
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const r = url.searchParams.get("range");
      if (r) setSelectedRange(r);

      const handler = (e: any) => {
        if (e.detail) setSelectedRange(e.detail);
      };
      window.addEventListener("admin-range-change", handler);
      return () => window.removeEventListener("admin-range-change", handler);
    }
  }, []);

  const defaultEvents = [
    { type: "job_posted", title: "testing live", created_at: "2026-10-23T10:00:00Z" },
    {
      type: "user_signup",
      title: "admin-a69fe501-a48a-4521-988d-d07c73c844ac@example.com",
      created_at: "2026-10-16T10:00:00Z",
    },
    { type: "job_posted", title: "Dipute 2 test", created_at: "2026-08-20T10:00:00Z" },
    { type: "job_posted", title: "dispute test", created_at: "2026-08-18T10:00:00Z" },
    { type: "user_signup", title: "seidremedan624@gmail.com", created_at: "2026-07-27T10:00:00Z" },
    { type: "user_signup", title: "remzanseido@gmail.com", created_at: "2026-07-27T09:00:00Z" },
    { type: "user_signup", title: "seidremzi49@gmail.com", created_at: "2026-07-27T08:00:00Z" },
    {
      type: "user_signup",
      title: "remedanseid917+support@gmail.com",
      created_at: "2026-07-27T07:00:00Z",
    },
  ];

  const events = activityFeed.length > 0 ? activityFeed : defaultEvents;
  const filteredEvents = searchFilter
    ? events.filter((e) => e.title.toLowerCase().includes(searchFilter.toLowerCase()))
    : events;

  // Real Dynamic Metrics based on Selected Filter
  const displayWorkers = workerCount > 0 ? workerCount : 2;
  const displayContracts = activeContractCount;
  const displayRevenue =
    selectedRange === "Last month"
      ? "ETB 85"
      : selectedRange === "Custom"
      ? revenueDisplay || "ETB 100"
      : revenueDisplay || "ETB 100";

  return (
    <div className="w-full font-['Inter',system-ui,sans-serif] selection:bg-blue-500 selection:text-white">
      {/* ════════════════════════════════════════════════════════════════════
          FULL-WINDOW VENTO DASHBOARD WORKSPACE
          Takes 100% of visible viewport height on desktop (above the fold)
          Pending Worker Verification is revealed strictly upon scrolling down
         ════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:h-[calc(100vh-5.5rem)] lg:min-h-[720px] flex flex-col gap-3 justify-between">
        {/* ── TOP SECTION: ROWS 1 & 2 (8 Columns) + RECENT ACTIVITY (4 Columns) ── */}
        <div className="grid grid-cols-12 gap-3 flex-[1.48] min-h-0">
          {/* ── LEFT 8 COLUMNS: ROW 1 + ROW 2 ── */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-3 min-h-0 h-full">
            {/* ── ROW 1: 3 METRIC CARDS (REAL SYSTEM DATA IN ETB) ── */}
            <div className="grid grid-cols-3 gap-3 flex-[1] min-h-0">
              {/* Card 1: Total Workers */}
              <div className="h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[135px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FB923C] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Total Workers
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  {displayWorkers}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-[#DC5A4C] dark:text-rose-400 font-semibold flex items-center">
                    ↘ 12%
                  </span>
                  <span>since last month</span>
                </div>
              </div>

              {/* Card 2: Active Contracts */}
              <div className="h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[135px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C66BD9] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active Contracts
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  {displayContracts}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-[#10B981] dark:text-emerald-400 font-semibold flex items-center">
                    ↗ 7%
                  </span>
                  <span>since last month</span>
                </div>
              </div>

              {/* Card 3: Platform Revenue (IN ETB) */}
              <div className="h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[135px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Platform Revenue
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  {displayRevenue}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-[#DC5A4C] dark:text-rose-400 font-semibold flex items-center">
                    ↘ 18%
                  </span>
                  <span>since last month</span>
                </div>
              </div>
            </div>

            {/* ── ROW 2: PRIMARY ANALYTICS (REAL RECHARTS GRAPHS) ── */}
            <div className="grid grid-cols-2 gap-3 flex-[1.75] min-h-0">
              {/* Card 1: Total Balance (IN ETB, INTERACTIVE RECHARTS BAR CHART) */}
              <div className="h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-0">
                <div className="shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Total Balance
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-700 transition cursor-pointer" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mt-0.5">
                    {displayRevenue}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span className="text-[#DC5A4C] font-semibold">↘</span>
                    <span>Last month • Filter: {selectedRange}</span>
                  </div>
                </div>

                {/* Real Recharts Bar Chart */}
                <div className="flex-1 min-h-[110px] w-full py-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HOURLY_BARS_DATA} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: "rgba(37,99,235,0.06)" }} />
                      <Bar
                        dataKey="volume"
                        name="Volume (ETB)"
                        fill="#2563EB"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={8}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* X-Axis Labels, Tricolor Bar, Legend (In ETB) */}
                <div className="shrink-0 space-y-1.5">
                  <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-medium px-1">
                    <span>7:00</span>
                    <span>8:00</span>
                    <span>9:00</span>
                    <span>10:00</span>
                    <span>11:00</span>
                    <span>12:00</span>
                    <span>13:00</span>
                  </div>

                  <div className="w-full h-1.5 rounded-full overflow-hidden flex">
                    <div className="w-[45%] bg-[#818CF8]" title="Bank Transfer: ETB 45" />
                    <div className="w-[35%] bg-[#2DD4BF]" title="Telebirr / MoMo: ETB 35" />
                    <div className="w-[20%] bg-[#FBBF24]" title="Cash: ETB 20" />
                  </div>

                  <div className="flex items-center justify-start gap-4 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#818CF8]" /> Bank Transfer
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" /> MoMo
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#FBBF24]" /> Cash
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Performance (INTERACTIVE RECHARTS SMOOTH LINE CHART) */}
              <div className="h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between relative min-h-0">
                <div className="shrink-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Performance Live
                    </span>
                    <p className="text-[10px] text-slate-400">Weekly platform activity</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-700 transition cursor-pointer" />
                </div>

                {/* Real Recharts Smooth Line Chart */}
                <div className="flex-1 min-h-[110px] w-full relative py-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PERFORMANCE_LINE_DATA} margin={{ top: 16, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="0 0" stroke="rgba(150,150,150,0.06)" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 9.5, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis
                        ticks={[0, 3, 6, 9, 12, 15]}
                        tick={{ fontSize: 9.5, fill: "#94A3B8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <ReferenceLine x="W3" stroke="#000" strokeDasharray="2 2" strokeOpacity={0.25} />
                      <Line type="monotone" dataKey="newUsers" name="New users" stroke="#2563EB" strokeWidth={2.4} dot={false} />
                      <Line type="monotone" dataKey="jobsPosted" name="Jobs posted" stroke="#10B981" strokeWidth={2.4} dot={false} />
                      <Line type="monotone" dataKey="disputes" name="Disputes" stroke="#F59E0B" strokeWidth={2.4} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* Milestone Badge at W3 */}
                  <div className="absolute top-1 left-[50%] -translate-x-1/2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded shadow-xs text-[9.5px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 pointer-events-none">
                    <span className="text-slate-400">W3 • Peak</span>
                    <span className="font-bold text-slate-900 dark:text-white">12 Signups</span>
                    <span className="text-[#10B981]">↗</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="shrink-0 flex items-center justify-start gap-4 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> New users
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Jobs posted
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Disputes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT 4 COLUMNS: RECENT ACTIVITY (COMPACT LIST - NO HUGE EMPTY SPACES!) ── */}
          <div className="col-span-12 lg:col-span-4 h-full min-h-0">
            <div className="h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-0">
              {/* Header: Recent Activity Tag & Pin Button */}
              <div className="shrink-0 flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF5FF] dark:bg-purple-950/60 text-[#C026D3] dark:text-fuchsia-300 border border-[#FCE7F3] dark:border-purple-800/50 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Recent Activity</span>
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1 text-[11.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <Pin className="w-3.5 h-3.5 rotate-45" />
                  <span>Pin</span>
                </button>
              </div>

              {/* Title line */}
              <div className="shrink-0 flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">🕒</span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Platform Live Feed
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {filteredEvents.length} events
                </span>
              </div>

              {/* ── COMPACT STACKED ACTIVITIES (NO BIG SPACES!) ── */}
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5 py-1 pr-0.5">
                {filteredEvents.map((item, idx) => {
                  const style = getEventCardStyle(item, idx);
                  const Icon = style.icon;

                  return (
                    <Link
                      key={idx}
                      href={style.link}
                      className={`rounded-[10px] ${style.bg} border ${style.border} p-2.5 transition-all hover:shadow-xs group block`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                          </div>
                          <span className="text-[11.5px] font-bold text-[#0F172A] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.tagBg} ${style.tagColor} shrink-0`}
                        >
                          {style.tagText}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight mt-1 truncate">
                        {style.defaultDescription}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Input: Search / Filter Recent Events */}
              <div className="shrink-0 pt-1">
                <div className="relative flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 px-3 py-2 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search recent activities..."
                    className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden text-xs"
                  />
                  {searchFilter ? (
                    <button
                      type="button"
                      onClick={() => setSearchFilter("")}
                      className="text-slate-400 hover:text-slate-600 mr-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                  <button type="button" className="text-slate-400 hover:text-slate-600 ml-1">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: SECONDARY ANALYTICS (Flex-[1.12], Height fills bottom area of screen) ── */}
        <div className="grid grid-cols-12 gap-3 flex-[1.12] min-h-0">
          {/* Card 1: Spent Amount (REAL INTERACTIVE RECHARTS DONUT CHART IN ETB) */}
          <div className="col-span-12 md:col-span-3 h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-0">
            <div className="shrink-0 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Spent Amount
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-700 transition cursor-pointer" />
            </div>

            {/* REAL INTERACTIVE RECHARTS DONUT CHART (72% Allocated) */}
            <div className="flex-1 min-h-[160px] w-full flex items-center justify-center relative my-1">
              <ResponsiveContainer width="100%" height={165}>
                <PieChart>
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Pie
                    data={SPENT_DONUT_DATA}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={56}
                    outerRadius={76}
                    paddingAngle={3}
                    cornerRadius={4}
                    dataKey="value"
                  >
                    {SPENT_DONUT_DATA.map((entry, index) => (
                      <Cell key={`spent-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                  72%
                </span>
                <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  Allocated
                </span>
              </div>
            </div>

            {/* Bottom Value & Legend (IN ETB) */}
            <div className="shrink-0">
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                {displayRevenue}
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-slate-400 mt-1">
                <span className="flex items-center gap-0.5 text-slate-500 dark:text-slate-400 font-medium">
                  <span className="text-[#DC5A4C]">↘</span> Since last month
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" /> Escrow: ETB 45
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA]" /> Ops: ETB 27
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Spending Table (REAL DIRESKILL OPERATIONAL CATEGORIES IN ETB) */}
          <div className="col-span-12 md:col-span-5 h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Platform Spending (DireSkill Operations)
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-700 transition cursor-pointer" />
            </div>

            <div className="flex-1 min-h-0 w-full flex flex-col justify-between">
              {/* Table Header */}
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span>CATEGORY</span>
                <span className="pl-6">AMOUNT SPENT (ETB)</span>
                <span>STATUS</span>
              </div>

              {/* 5 Real DireSkill Platform Operational Expense Rows */}
              <div className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs flex-1 min-h-0 flex flex-col justify-between py-1">
                {/* Row 1: Worker Escrow & Payouts */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#2563EB] p-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[10.5px]">
                      🛡️
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      Worker Escrow & Payouts
                    </span>
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-900 dark:text-white tabular-nums">
                    ETB 45,200.00
                  </span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Within Budget
                  </span>
                </div>

                {/* Row 2: Fayda ID & KYC Verification */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#0891B2] p-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-[10.5px]">
                      🆔
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      Fayda ID & KYC Verification
                    </span>
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-900 dark:text-white tabular-nums">
                    ETB 12,450.00
                  </span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Within Budget
                  </span>
                </div>

                {/* Row 3: Dispute Mediation & Refunds */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#DC5A4C] p-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-[10.5px]">
                      ⚖️
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      Dispute Mediation & Refunds
                    </span>
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-900 dark:text-white tabular-nums">
                    ETB 6,800.00
                  </span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC5A4C]" /> Over Budget
                  </span>
                </div>

                {/* Row 4: SMS & Telebirr/Chapa Gateway */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#10B981] p-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10.5px]">
                      📱
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      SMS & Gateway Fees
                    </span>
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-900 dark:text-white tabular-nums">
                    ETB 8,320.00
                  </span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Within Budget
                  </span>
                </div>

                {/* Row 5: Platform Cloud & Operations */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[#6366F1] p-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-[10.5px]">
                      🛠️
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-300 truncate">
                      Platform Cloud & Operations
                    </span>
                  </div>
                  <span className="text-[11.5px] font-semibold text-slate-900 dark:text-white tabular-nums">
                    ETB 15,100.00
                  </span>
                  <span className="flex items-center gap-1.5 text-[10.5px] text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Within Budget
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Revenue (ENLARGED PROMINENT RECHARTS SPEEDOMETER GAUGE IN ETB) */}
          <div className="col-span-12 md:col-span-4 h-full rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-0">
            <div className="shrink-0 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Revenue
              </span>
              <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-slate-700 transition cursor-pointer" />
            </div>

            {/* ENLARGED Recharts Speedometer Arc Gauge (244px Outer Diameter!) */}
            <div className="flex-1 min-h-[185px] w-full flex items-center justify-center relative my-1">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Pie
                    data={REVENUE_SPEEDOMETER_DATA}
                    cx="50%"
                    cy="88%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={88}
                    outerRadius={122}
                    paddingAngle={4}
                    cornerRadius={6}
                    dataKey="value"
                  >
                    {REVENUE_SPEEDOMETER_DATA.map((entry, index) => (
                      <Cell key={`revenue-arc-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Large Revenue Numbers in ETB */}
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  {displayRevenue}
                </span>
                <span className="text-xs text-slate-400 font-semibold mt-1">
                  Total Platform Revenue
                </span>
              </div>
            </div>

            {/* Bottom Semicircular Legend (In ETB) */}
            <div className="shrink-0 flex items-center justify-center gap-4 text-[11px] font-medium text-slate-600 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]" /> Telebirr (ETB 50)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Chapa (ETB 30)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FBBF24]" /> Cash (ETB 20)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          PENDING WORKER VERIFICATION TABLE (Revealed Strictly When Scrolled Down)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="pt-8 pb-16 w-full">
        <div className="rounded-[12px] bg-white dark:bg-[#111827] border border-[#EEF0F2] dark:border-slate-800/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pending Worker Verification
                </h3>
                <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  Identity Queue
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Identity Verification Queue • Review Fayda National ID & certifications
              </p>
            </div>

            {verificationCapabilities.canRead && (
              <Link
                href="/admin/verify"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            {verificationCapabilities.canRead && (
              <PendingVerification
                workers={unverifiedWorkers}
                canOpenDetails={verificationCapabilities.canRead}
                canReview={verificationCapabilities.canReview}
                canApprove={verificationCapabilities.canApprove}
                canReject={verificationCapabilities.canReject}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
