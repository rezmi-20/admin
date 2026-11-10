import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminDisputeCaseTabs from "@/components/admin/AdminDisputeCaseTabs";
import {
  addInternalDisputeNote,
  claimDispute,
  declareDisputeConflict,
  getAdminDisputeDetails,
  requestDisputeResponse,
  resolveDispute,
} from "@/lib/actions/disputes";
import {
  approveFinancialAction,
  executeApprovedRelease,
  getDisputeFinancialCase,
  placePaymentHold,
  proposeFinancialAction,
  rejectFinancialAction,
} from "@/lib/actions/dispute-financial-actions";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { ArrowLeft, UserRound, Wrench, AlertTriangle, ShieldCheck, Scale, BadgeAlert } from "lucide-react";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  if (status === "resolved") {
    return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (status === "escalated") {
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (status === "dismissed") {
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
  }
  return "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
}

export default async function AdminDisputeCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminPermission("disputes.read");
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const actionError = typeof query.disputeActionError === "string" ? query.disputeActionError : null;
  const data = await getAdminDisputeDetails(id);
  if (!data) notFound();

  const financialCase = await getDisputeFinancialCase(id);
  const { dispute, events, evidence, responses, notes } = data;
  const conflictAdminIds = Array.isArray(dispute.conflict_admin_ids) ? dispute.conflict_admin_ids.map(String) : [];
  const isConflicted = conflictAdminIds.includes(admin.id);
  const isDisputePaymentAdmin = admin.role === "dispute_payment_admin";
  const isAssignedToCurrentAdmin = dispute.assigned_admin_id === admin.id;
  const isTerminal = ["resolved", "dismissed"].includes(String(dispute.status || ""));
  const canClaim =
    hasAdminPermission(admin, "disputes.review") &&
    isDisputePaymentAdmin &&
    !isConflicted &&
    !isTerminal &&
    !isAssignedToCurrentAdmin;
  const canDeclareConflict =
    hasAdminPermission(admin, "disputes.review") &&
    isDisputePaymentAdmin &&
    !isConflicted &&
    isAssignedToCurrentAdmin &&
    !isTerminal;
  const canOperate =
    hasAdminPermission(admin, "disputes.review") &&
    isDisputePaymentAdmin &&
    !isConflicted &&
    isAssignedToCurrentAdmin &&
    !isTerminal;
  const canRequest = canOperate && hasAdminPermission(admin, "disputes.request_evidence");
  const canResolve = canOperate && hasAdminPermission(admin, "disputes.resolve");

  async function claim(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    const result = await claimDispute(id, reason);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function requestInfo(formData: FormData) {
    "use server";
    const target = String(formData.get("target") || "") as "client" | "worker";
    const instruction = String(formData.get("instruction") || "");
    const dueAt = String(formData.get("dueAt") || "") || null;
    const result = await requestDisputeResponse(id, target, instruction, dueAt);
    if (!result.success) {
      redirect(
        `/admin/disputes/${id}?disputeActionError=${encodeURIComponent(result.error || "Unable to request information.")}`
      );
    }
    redirect(`/admin/disputes/${id}`);
  }

  async function addNote(formData: FormData) {
    "use server";
    const note = String(formData.get("note") || "");
    const result = await addInternalDisputeNote(id, note);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function conflict(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    const result = await declareDisputeConflict(id, reason);
    if (!result.success) throw new Error(result.error);
    redirect("/admin/disputes");
  }

  async function resolve(formData: FormData) {
    "use server";
    const decision = String(formData.get("decision") || "") as any;
    const reason = String(formData.get("reason") || "");
    const operationalOutcome = String(formData.get("operationalOutcome") || "") || null;
    const result = await resolveDispute(id, decision, reason, operationalOutcome);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function holdPayment(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    const result = await placePaymentHold(id, reason);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function proposeFinancial(formData: FormData) {
    "use server";
    const action = String(formData.get("action") || "") as any;
    const amount = Number(formData.get("amount") || 0) || null;
    const reason = String(formData.get("reason") || "");
    const result = await proposeFinancialAction(id, action, reason, amount);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function approveFinancial(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const result = await approveFinancialAction(id, actionId);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function rejectFinancial(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const reason = String(formData.get("reason") || "");
    const result = await rejectFinancialAction(id, actionId, reason);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function executeRelease(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const result = await executeApprovedRelease(id, actionId);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-2">
          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dispute Cases Queue</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-2xs">
              <Scale className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {dispute.title || dispute.job_title}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusBadge(
                    dispute.status
                  )}`}
                >
                  {String(dispute.status).replaceAll("_", " ")}
                </span>
                <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  #{String(dispute.id).slice(0, 8)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <UserRound className="h-3 w-3 text-blue-500" />
                  Client: <strong className="text-slate-700 dark:text-slate-300">{dispute.client_name || "Client"}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Wrench className="h-3 w-3 text-emerald-500" />
                  Worker: <strong className="text-slate-700 dark:text-slate-300">{dispute.worker_name || "Worker"}</strong>
                </span>
                <span>•</span>
                <span className="capitalize">{dispute.category ? dispute.category.replaceAll("_", " ") : "Breach"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Badges / Context */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Mediator: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {dispute.assigned_admin_name || "Unassigned"}
            </span>
          </div>
          {!isDisputePaymentAdmin && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              Read-Only Oversight
            </div>
          )}
        </div>
      </div>

      {/* Info notices */}
      {isTerminal && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            This dispute is in a terminal resolved state. Operational dispute decisions are finalized and archived for audit.
          </span>
        </div>
      )}

      {/* 2. Unified Case Tabs Component */}
      <AdminDisputeCaseTabs
        dispute={dispute}
        financialCase={financialCase}
        events={events}
        evidence={evidence}
        responses={responses}
        notes={notes}
        disputeId={id}
        actionError={actionError}
        isConflicted={isConflicted}
        isAssignedToCurrentAdmin={isAssignedToCurrentAdmin}
        hasAssignedAdmin={Boolean(dispute.assigned_admin_id)}
        isTerminal={isTerminal}
        canClaim={canClaim}
        canDeclareConflict={canDeclareConflict}
        canOperate={canOperate}
        canRequest={canRequest}
        canResolve={canResolve}
        claim={claim}
        conflict={conflict}
        requestInfo={requestInfo}
        addNote={addNote}
        resolve={resolve}
        holdPayment={holdPayment}
        proposeFinancial={proposeFinancial}
        approveFinancial={approveFinancial}
        rejectFinancial={rejectFinancial}
        executeRelease={executeRelease}
      />
    </div>
  );
}
