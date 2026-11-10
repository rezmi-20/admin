import Link from "next/link";
import { getAdminSupportTickets } from "@/lib/actions/support";
import {
  LifeBuoy,
  Search,
  Filter,
  Paperclip,
  ChevronRight,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function age(value: unknown) {
  if (!value) return "unknown";
  const hours = Math.max(0, Math.floor((Date.now() - new Date(String(value)).getTime()) / 36e5));
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/50",
  assigned: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/50",
  in_progress: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50",
  awaiting_user: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200/50",
  escalated: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/50",
  resolved: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50",
  closed: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/50",
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 font-bold",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200/50",
  normal: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50",
};

export default async function AdminSupportQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status || "open";
  const searchQuery = params.q || "";
  const tickets = await getAdminSupportTickets(activeStatus, searchQuery);

  const statuses = [
    { id: "open", label: "Open" },
    { id: "assigned", label: "Assigned" },
    { id: "in_progress", label: "In Progress" },
    { id: "awaiting_user", label: "Awaiting User" },
    { id: "escalated", label: "Escalated" },
    { id: "resolved", label: "Resolved" },
    { id: "closed", label: "Closed" },
    { id: "all", label: "All Tickets" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Customer Support & Inquiries
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Support Desk Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Handle user tickets, provide contract dispute guidance, and coordinate department resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">In Queue: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Unified Data Surface Card */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] overflow-hidden shadow-2xs">
        {/* Integrated Top Toolbar */}
        <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.06] space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input Form */}
            <form className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by ticket ref, customer name, email, or subject..."
                className="w-full bg-slate-50 dark:bg-slate-900/60 pl-9 pr-8 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:border-blue-500 transition"
              />
              <input type="hidden" name="status" value={activeStatus} />
              {searchQuery && (
                <Link
                  href={`/admin/support?status=${activeStatus}`}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </Link>
              )}
            </form>

            {/* Queue Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {statuses.map((tab) => {
                const isActive = activeStatus === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={`/admin/support?status=${tab.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                <th className="py-3 px-4">Ticket & Subject</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {tickets.map((ticket: any) => {
                const statusBadgeStyle = statusColors[ticket.status] || "bg-slate-100 text-slate-600";
                const priorityBadgeStyle = priorityStyles[ticket.priority] || "bg-slate-100 text-slate-600";

                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Ticket Reference & Subject */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                            {ticket.reference}
                          </span>
                          {ticket.attachment_count ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">
                              <Paperclip className="h-2.5 w-2.5" />
                              <span>{ticket.attachment_count}</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate max-w-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {ticket.subject}
                        </p>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs truncate">
                          {ticket.customer_name || "Guest User"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{ticket.customer_email}</p>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold border ${priorityBadgeStyle}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadgeStyle}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="capitalize">{ticket.status.replaceAll("_", " ")}</span>
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {age(ticket.created_at)}
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {ticket.assigned_admin_name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-blue-600 dark:text-slate-200 font-semibold transition"
                      >
                        <span>Open</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {tickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <LifeBuoy className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No tickets found in this queue.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchQuery
                        ? `No results matching "${searchQuery}".`
                        : `No active tickets with status "${activeStatus}".`}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
