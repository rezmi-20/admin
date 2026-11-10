"use client";

import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Scale,
  Coins,
  MessageSquare,
  Paperclip,
  StickyNote,
  History,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";

type DisputeTab = "case" | "actions" | "financial" | "responses" | "evidence" | "notes" | "timeline";

type FormAction = (formData: FormData) => void | Promise<void>;

type Props = {
  dispute: any;
  financialCase: any | null;
  events: any[];
  evidence: any[];
  responses: any[];
  notes: any[];
  disputeId: string;
  actionError?: string | null;
  isConflicted: boolean;
  isAssignedToCurrentAdmin: boolean;
  hasAssignedAdmin: boolean;
  isTerminal: boolean;
  canClaim: boolean;
  canDeclareConflict: boolean;
  canOperate: boolean;
  canRequest: boolean;
  canResolve: boolean;
  claim: FormAction;
  conflict: FormAction;
  requestInfo: FormAction;
  addNote: FormAction;
  resolve: FormAction;
  holdPayment: FormAction;
  proposeFinancial: FormAction;
  approveFinancial: FormAction;
  rejectFinancial: FormAction;
  executeRelease: FormAction;
};

function formatDate(value: string | Date | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-200 p-3.5 font-mono text-xs leading-5">
      {JSON.stringify(value || {}, null, 2)}
    </pre>
  );
}

function SurfaceCard({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-5 shadow-2xs space-y-4">
      {title && (
        <div className="border-b border-black/[0.04] dark:border-white/[0.05] pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default function AdminDisputeCaseTabs({
  dispute,
  financialCase,
  events,
  evidence,
  responses,
  notes,
  disputeId,
  actionError,
  isConflicted,
  isAssignedToCurrentAdmin,
  hasAssignedAdmin,
  isTerminal,
  canClaim,
  canDeclareConflict,
  canOperate,
  canRequest,
  canResolve,
  claim,
  conflict,
  requestInfo,
  addNote,
  resolve,
  holdPayment,
  proposeFinancial,
  approveFinancial,
  rejectFinancial,
  executeRelease,
}: Props) {
  const [activeTab, setActiveTab] = useState<DisputeTab>("case");

  const assignmentMessage = !hasAssignedAdmin
    ? "This dispute is currently unassigned. Claim the case to begin formal mediation."
    : !isAssignedToCurrentAdmin
    ? "This dispute is currently assigned to another mediator. You may reassign it with an audit reason."
    : null;

  const canRequestInCurrentState =
    !isTerminal &&
    canRequest &&
    ["open", "under_review", "evidence_review", "escalated"].includes(String(dispute.status || ""));

  const requireReassignReason = (event: React.FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value !== "reassign") return;

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") || "").trim();
    if (!reason) {
      event.preventDefault();
      alert("A reason is mandatory when reassigning a dispute away from another admin.");
    }
  };

  const tabs = [
    { id: "case", label: "Case Overview", icon: Scale },
    { id: "actions", label: "Mediation Actions", icon: ShieldCheck },
    { id: "financial", label: "Financial Escrow", icon: Coins },
    { id: "responses", label: `Responses (${responses.length})`, icon: MessageSquare },
    { id: "evidence", label: `Evidence (${evidence.length})`, icon: Paperclip },
    { id: "notes", label: `Notes (${notes.length})`, icon: StickyNote },
    { id: "timeline", label: `Timeline (${events.length})`, icon: History },
  ] as const;

  return (
    <div className="space-y-6">
      {/* 1. Integrated Segmented Tab Switcher */}
      <div className="flex items-center gap-1 bg-white dark:bg-[#141E30] p-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DisputeTab)}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Case Overview */}
      {activeTab === "case" && (
        <div className="space-y-5">
          {/* Top metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SurfaceCard title="Contract Transaction">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Job Title:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{dispute.job_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contract Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.current_contract_status || "Standard"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.current_payment_status || "Pending"}
                  </span>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard title="Mediation Assignment">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Admin:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.assigned_admin_name || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assignment Date:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDate(dispute.assigned_at)}
                  </span>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard title="Dispute Basis">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                    {dispute.category ? dispute.category.replaceAll("_", " ") : "Breach"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Resolution Asked:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.requested_resolution || "Unspecified"}
                  </span>
                </div>
              </div>
            </SurfaceCard>
          </div>

          {/* Dispute Statement */}
          <SurfaceCard title="Submitted Dispute Claim">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {dispute.description || "No narrative description provided with this dispute."}
            </p>
          </SurfaceCard>

          {/* Final Resolution banner (if resolved) */}
          {dispute.final_decision && (
            <SurfaceCard title="Final Mediation Determination">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Decision
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {String(dispute.final_decision).replaceAll("_", " ")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Determined By</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {dispute.resolved_by_admin_name || dispute.assigned_admin_name || "Assigned Officer"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Determination Date</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {formatDate(dispute.resolved_at)}
                  </p>
                </div>
              </div>
              {dispute.final_reason && (
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg">
                  {dispute.final_reason}
                </p>
              )}
            </SurfaceCard>
          )}

          {/* Snapshot & System Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SurfaceCard title="Job State & Evidence">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.04]">
                  <span className="text-slate-400">Job Status:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.current_job_status}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.04]">
                  <span className="text-slate-400">Contract Terms:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.terms_status || "Standard"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.04]">
                  <span className="text-slate-400">Completion Rejection Reason:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {dispute.completion_rejection_reason || "None"}
                  </span>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard title="Case Creation Snapshot">
              <JsonBlock value={dispute.creation_snapshot} />
            </SurfaceCard>
          </div>
        </div>
      )}

      {/* TAB 2: Mediation Actions */}
      {activeTab === "actions" && (
        <div className="space-y-4">
          {actionError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {actionError}
            </div>
          )}

          {isTerminal && (
            <SurfaceCard title="Case Terminal">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This dispute has reached its terminal status ({String(dispute.status).replaceAll("_", " ")}).
                Mediation controls, participant assignments, and routine financial proposals are finalized.
              </p>
            </SurfaceCard>
          )}

          {isConflicted && (
            <SurfaceCard title="Conflict Declared">
              <p className="text-xs text-rose-600 dark:text-rose-400">
                You declared a conflict of interest on this dispute. You may inspect the audit record, but cannot execute operational rulings.
              </p>
            </SurfaceCard>
          )}

          {!isTerminal && !isConflicted && (canClaim || canDeclareConflict) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {canClaim && (
                <SurfaceCard title="Claim or Reassign Case">
                  <form action={claim} onSubmit={requireReassignReason} className="space-y-3">
                    <textarea
                      name="reason"
                      rows={2}
                      placeholder="Audit reason required when reassigning another mediator's case..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        name="assignmentAction"
                        value="claim"
                        className="h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                      >
                        Claim Case
                      </button>
                      <button
                        name="assignmentAction"
                        value="reassign"
                        className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                      >
                        Reassign to Me
                      </button>
                    </div>
                  </form>
                </SurfaceCard>
              )}

              {canDeclareConflict && (
                <SurfaceCard title="Declare Conflict of Interest">
                  <form action={conflict} className="space-y-3">
                    <textarea
                      name="reason"
                      rows={2}
                      required
                      placeholder="Explain nature of the conflict (e.g. personal relationship, commercial interest)..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button className="h-10 px-4 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-semibold transition">
                      Declare Conflict & Recuse
                    </button>
                  </form>
                </SurfaceCard>
              )}
            </div>
          )}

          {canRequestInCurrentState && (
            <SurfaceCard title="Request Information from Participant">
              <form action={requestInfo} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Recipient</label>
                    <select
                      name="target"
                      className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="client">Client ({dispute.client_name || "Client"})</option>
                      <option value="worker">Worker ({dispute.worker_name || "Worker"})</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Response Deadline</label>
                    <input
                      name="dueAt"
                      type="date"
                      className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Required Detail</label>
                    <input
                      name="instruction"
                      required
                      placeholder="e.g. Please upload photo of completed pipe installation"
                      className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <button className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition">
                  Dispatch Request
                </button>
              </form>
            </SurfaceCard>
          )}

          {!isTerminal && canResolve && (
            <SurfaceCard title="Issue Final Determination">
              <form action={resolve} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Determination</label>
                    <select
                      name="decision"
                      className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="resolved_for_client">Resolved in favour of Client</option>
                      <option value="resolved_for_worker">Resolved in favour of Worker</option>
                      <option value="resolved_by_agreement">Resolved by Mutual Settlement</option>
                      <option value="dismissed">Dismiss Case as Unsubstantiated</option>
                      <option value="escalated">Escalate to Legal Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Post-Dispute Job Workflow</label>
                    <select
                      name="operationalOutcome"
                      required
                      className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                    >
                      <option value="">Select post-resolution workflow outcome</option>
                      <option value="redo_work">Redo or correct work - return job to in-progress</option>
                      <option value="continue_work">Continue work - return job to in-progress</option>
                      <option value="worker_payment_authorized">Authorize normal payment - mark job completed</option>
                      <option value="client_no_payment_cancel">Cancel job with zero payment authorization</option>
                      <option value="restore_previous_state">Restore supported previous workflow state</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Legal & Operational Rationale</label>
                  <textarea
                    name="reason"
                    rows={3}
                    required
                    placeholder="Provide full reasoning for this determination. This record is permanent."
                    className="w-full mt-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">
                    Execute Binding Determination
                  </button>
                  <span className="text-[11px] text-slate-400">
                    Determination is logged to platform immutable audit timeline.
                  </span>
                </div>
              </form>
            </SurfaceCard>
          )}
        </div>
      )}

      {/* TAB 3: Financial Escrow */}
      {activeTab === "financial" && (
        <div className="space-y-4">
          {!financialCase ? (
            <SurfaceCard title="Financial Case">
              <p className="text-xs text-slate-400">No escrow or financial record is linked to this dispute.</p>
            </SurfaceCard>
          ) : (
            <div className="space-y-4">
              {/* Financial KPI summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30]">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Contract Value</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    ETB {Number(financialCase.contract_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30]">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Payment Escrow</span>
                  <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                    ETB {Number(financialCase.payment_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30]">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Gateway Ref</span>
                  <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate">
                    {financialCase.chapa_ref_masked || "Chapa Pending"}
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30]">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Hold Standing</span>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                    {financialCase.financial_hold_status || "Standard Hold"}
                  </p>
                </div>
              </div>

              {!isTerminal && canOperate && canResolve && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SurfaceCard title="Place Escrow Hold">
                    <form action={holdPayment} className="space-y-3">
                      <textarea
                        name="reason"
                        required
                        rows={2}
                        placeholder="State financial reason for locking escrow funds..."
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                      />
                      <button className="h-9 px-4 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold transition">
                        Apply Immediate Escrow Hold
                      </button>
                    </form>
                  </SurfaceCard>

                  <SurfaceCard title="Propose Escrow Action">
                    <form action={proposeFinancial} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="action"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                        >
                          <option value="release_payment">Release Payment to Worker</option>
                          <option value="refund_review_required">Full Refund to Client</option>
                          <option value="partial_refund_review_required">Partial Refund Split</option>
                          <option value="payment_provider_investigation">Provider Investigation</option>
                        </select>
                        <input
                          name="amount"
                          type="number"
                          min="0"
                          placeholder="Amount in ETB"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                        />
                      </div>
                      <textarea
                        name="reason"
                        required
                        rows={2}
                        placeholder="Proposal rationale..."
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs"
                      />
                      <button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition">
                        Submit Financial Proposal
                      </button>
                    </form>
                  </SurfaceCard>
                </div>
              )}

              {/* Financial History */}
              <SurfaceCard title="Financial Actions Log">
                {financialCase.actions.length === 0 ? (
                  <p className="text-xs text-slate-400">No financial actions recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {financialCase.actions.map((act: any) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                            {String(act.action).replaceAll("_", " ")}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">
                            {formatDate(act.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {act.proposal_status}
                          </span>
                          {act.amount && (
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              ETB {Number(act.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {act.reason && <p className="text-slate-600 dark:text-slate-400 italic">"{act.reason}"</p>}
                      </div>
                    ))}
                  </div>
                )}
              </SurfaceCard>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Responses */}
      {activeTab === "responses" && (
        <SurfaceCard title="Party Responses">
          {responses.length === 0 ? (
            <p className="text-xs text-slate-400">No response requests dispatched.</p>
          ) : (
            <div className="space-y-3">
              {responses.map((resp: any) => (
                <div
                  key={resp.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {resp.requested_from} Response
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {resp.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{resp.instruction}</p>
                  {resp.response_text && (
                    <div className="bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 mt-2">
                      {resp.response_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      {/* TAB 5: Evidence */}
      {activeTab === "evidence" && (
        <SurfaceCard title="Uploaded Evidence Files">
          {evidence.length === 0 ? (
            <p className="text-xs text-slate-400">No evidence documents uploaded by either party.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evidence.map((item: any) => (
                <a
                  key={item.id}
                  href={`/api/disputes/${disputeId}/evidence/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-blue-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 transition text-xs group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Paperclip className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">
                      {item.file_name || "Evidence Attachment"}
                    </span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          )}
        </SurfaceCard>
      )}

      {/* TAB 6: Notes */}
      {activeTab === "notes" && (
        <div className="space-y-4">
          {!isTerminal && canOperate && (
            <SurfaceCard title="Append Internal Administrative Note">
              <form action={addNote} className="space-y-3">
                <textarea
                  name="note"
                  rows={3}
                  required
                  placeholder="Record internal findings, legal notes, or private observations (invisible to client and worker)..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
                />
                <button className="h-9 px-4 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold transition">
                  Save Note
                </button>
              </form>
            </SurfaceCard>
          )}

          <SurfaceCard title="Internal Audit Notes">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400">No internal notes on file.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {n.admin_name || n.admin_employee_id || "Officer"}
                      </span>
                      <span className="font-mono text-[10px]">{formatDate(n.created_at)}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 mt-1">{n.note}</p>
                  </div>
                ))}
              </div>
            )}
          </SurfaceCard>
        </div>
      )}

      {/* TAB 7: Timeline */}
      {activeTab === "timeline" && (
        <SurfaceCard title="Mediation Audit Timeline">
          <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pt-1">
            {events.map((ev: any) => (
              <div
                key={ev.id}
                className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 text-xs"
              >
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-indigo-500" />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    {String(ev.event_type).replaceAll("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatDate(ev.created_at)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Actor: <strong className="text-slate-600 dark:text-slate-400">{ev.actor_type}</strong>
                </p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
