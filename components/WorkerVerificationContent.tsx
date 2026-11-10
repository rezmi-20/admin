"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  History,
  Wrench,
  Fingerprint,
  FileQuestion,
  CheckCircle2,
  Ban,
  ShieldAlert,
  Clock,
  Sparkles,
  Award,
  MapPin,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Eye,
  Check,
} from "lucide-react";
import ProtectedVerificationDocumentViewer from "@/components/admin/ProtectedVerificationDocumentViewer";
import VerificationFinReveal from "@/components/admin/VerificationFinReveal";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";

interface WorkerVerificationContentProps {
  worker: {
    user_id: string;
    full_name: string;
    email: string;
    phone: string;
    masked_fin?: string | null;
    district: string;
    skills: string[];
    fayda_doc_url: string;
    avatar_url?: string | null;
    training_certificates?: Array<{ id: string; file_name: string; mime_type: string; file_size: number }>;
    is_verified: boolean;
    verification_status?: string | null;
    verification_reason?: string | null;
    verified_at?: string | Date | null;
    reviewer_email?: string | null;
    is_suspended?: boolean | null;
    identity_complete?: boolean | null;
  };
  attempt: {
    id: string;
    attemptNumber: number;
    status: string;
    submittedAt: string;
  } | null;
  history: Array<{
    id: string;
    action: string;
    oldStatus: string | null;
    newStatus: string;
    reason: string | null;
    attemptNumber: number | null;
    adminEmployeeId: string | null;
    adminName: string | null;
    adminRole: string | null;
    createdAt: string;
  }>;
  capabilities: {
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
    canRequestResubmission: boolean;
    canRevoke: boolean;
  };
  verificationDocument: { attemptId: string | null; canReveal: boolean; available: boolean; revealUsed: boolean };
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  onRevoke?: (reason: string) => void;
  onPending?: (reason: string) => void;
}

const QUICK_REASONS = [
  "Blurry or unreadable ID scan",
  "Fayda FIN mismatch with card",
  "Profile photo does not match ID",
  "Document edges cropped or obscured",
  "Expired or invalid credential",
  "Training certificate missing or illegible",
];

export default function WorkerVerificationContent({
  worker,
  attempt,
  history,
  capabilities,
  verificationDocument,
  onApprove,
  onReject,
  onRevoke,
  onPending,
}: WorkerVerificationContentProps) {
  const [activeTab, setActiveTab] = useState<"id_doc" | "face_match" | "certificates">("id_doc");
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identityComplete = worker.identity_complete !== false;
  const displayStatus = toWorkerDisplayStatus(
    worker.verification_status,
    worker.is_verified,
    worker.is_suspended,
    identityComplete
  );
  const profileReviewStatus = String(worker.verification_status || displayStatus || "pending");
  const activeReviewStatus = attempt?.status === "pending" || profileReviewStatus === "pending";
  const canRevealFin = Boolean(
    capabilities.canReview &&
      attempt?.id &&
      activeReviewStatus &&
      ["pending", "rejected", "resubmission_requested"].includes(String(worker.verification_status || "pending"))
  );

  const readOnly = !capabilities.canReview;

  const handleActionWithReason = async (
    action: (reason: string) => void,
    options?: { confirmRevocation?: boolean }
  ) => {
    const reason = rejectReason.trim();
    if (!reason) {
      alert("Please provide a reason before proceeding with this decision.");
      return;
    }
    if (
      options?.confirmRevocation &&
      !window.confirm(
        "Revoke this approved worker? The worker will immediately lose verified standing until reverified."
      )
    ) {
      return;
    }
    setIsSubmitting(true);
    try {
      await action(reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickReasonClick = (reason: string) => {
    if (!rejectReason) {
      setRejectReason(reason);
    } else if (!rejectReason.includes(reason)) {
      setRejectReason(`${rejectReason}; ${reason}`);
    }
  };

  const certificateCount = worker.training_certificates?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2">
        <div className="space-y-2">
          <Link
            href="/admin/verify"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Verification Queue</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative">
              {worker.avatar_url ? (
                <img
                  src={worker.avatar_url}
                  alt={worker.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-black/[0.08] dark:border-white/[0.1] shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-base shadow-2xs">
                  {worker.full_name?.charAt(0) || "W"}
                </div>
              )}
              {displayStatus === "approved" && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#090D16] flex items-center justify-center text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {worker.full_name}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    displayStatus === "approved"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : displayStatus === "pending"
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : displayStatus === "rejected"
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {displayStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {worker.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  +251 {worker.phone}
                </span>
                {worker.district && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {worker.district}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Top summary badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400 font-medium">Attempt: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              #{attempt ? attempt.attemptNumber : 1}
            </span>
          </div>
          {readOnly && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              Read-Only Mode
            </div>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Document & Biometrics Workspace */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Segmented Inspector View Tabs */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#141E30] p-1.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("id_doc")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "id_doc"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Fingerprint className="h-4 w-4" />
              <span>Fayda National ID</span>
              {verificationDocument.available && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("face_match")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "face_match"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Face Verification</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("certificates")}
              className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                activeTab === "certificates"
                  ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Certificates</span>
              <span className="rounded-full bg-slate-200/80 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] font-mono">
                {certificateCount}
              </span>
            </button>
          </div>

          {/* TAB 1: Fayda Document Viewer */}
          {activeTab === "id_doc" && (
            <div className="space-y-3">
              {verificationDocument.available ? (
                <ProtectedVerificationDocumentViewer
                  documentUrl={`/api/workers/${worker.user_id}/verification-document`}
                  title="Official Fayda ID Document"
                  attemptId={verificationDocument.attemptId}
                  canReveal={verificationDocument.canReveal}
                  revealUsed={verificationDocument.revealUsed}
                />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[460px] p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#141E30] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                    <FileQuestion className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    No Fayda Document Uploaded
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    This worker has not yet uploaded a digital scan of their Fayda National ID card.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Face Verification Side-by-Side */}
          {activeTab === "face_match" && (
            <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-5 space-y-5 shadow-2xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Visual Biometric & Photo Audit
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Compare the worker profile avatar with the photo depicted on their official Fayda ID document.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Profile Photo */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 flex flex-col items-center text-center space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Registered Profile Photo
                  </span>
                  <div className="w-48 h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center shadow-inner">
                    {worker.avatar_url ? (
                      <img
                        src={worker.avatar_url}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-slate-400 text-xs font-medium flex flex-col items-center gap-2">
                        <User className="h-8 w-8 opacity-40" />
                        <span>No Avatar Uploaded</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Visible to clients when booking jobs
                  </p>
                </div>

                {/* ID Reference Guidance */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      ID Document Photo Inspection
                    </span>
                    <div className="rounded-lg bg-blue-50/80 dark:bg-blue-500/10 border border-blue-500/20 p-3.5 space-y-2 text-xs text-blue-900 dark:text-blue-300">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Manual Review Protocol</span>
                      </div>
                      <p className="leading-relaxed">
                        Examine the photo in the <strong>Fayda National ID</strong> tab. Verify:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90">
                        <li>Facial geometry, eyes, and facial contours match.</li>
                        <li>No photo-manipulation, blur, or filter distortion.</li>
                        <li>Photo reflects current age and person identity.</li>
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("id_doc")}
                    className="w-full py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition text-center"
                  >
                    View Fayda ID Card Photo →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Training Certificates */}
          {activeTab === "certificates" && (
            <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Vocational & Training Certificates ({certificateCount})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Uploaded credentials validating specialized trade capabilities.
                  </p>
                </div>
              </div>

              {certificateCount > 0 ? (
                <div className="space-y-4">
                  {worker.training_certificates?.map((cert) => (
                    <div
                      key={cert.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                            {cert.file_name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {Math.ceil(cert.file_size / 1024)} KB
                        </span>
                      </div>
                      <ProtectedVerificationDocumentViewer
                        documentUrl={`/api/workers/${worker.user_id}/training-certificates/${cert.id}`}
                        title={cert.file_name}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center">
                  <Award className="h-8 w-8 text-slate-400 mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No vocational certificates uploaded for this profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Inspector & Decision Console (Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* 1. Fayda FIN & Identification Card */}
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Identity & Credentials
            </h3>

            {/* FIN Reveal Component */}
            <VerificationFinReveal
              accountType="worker"
              accountUserId={worker.user_id}
              attemptId={attempt?.id ?? null}
              maskedFin={worker.masked_fin}
              canReveal={canRevealFin}
            />

            {/* Skill Tags */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
                <Wrench className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-semibold">Trade Capabilities ({worker.skills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {worker.skills?.length ? (
                  worker.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills registered</span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Verification Decision Card */}
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verification Decision
            </h3>

            {readOnly ? (
              <div className="rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 font-medium">
                You have read-only oversight permissions. To execute approvals or rejections, verification admin clearance is required.
              </div>
            ) : (
              <div className="space-y-3">
                {!identityComplete && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-50/90 dark:bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Missing Identity Requirements</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Fayda document scan and protected FIN must both be present before this worker can be approved.
                    </p>
                  </div>
                )}

                {/* Quick reason suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Quick Reason Tags:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_REASONS.map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => handleQuickReasonClick(reason)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                      >
                        + {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason input */}
                <div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={2}
                    placeholder="Enter reason or instructions for resubmission / rejection..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  {capabilities.canApprove && onApprove && (
                    <button
                      type="button"
                      onClick={onApprove}
                      disabled={displayStatus === "approved" || !identityComplete || isSubmitting}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{displayStatus === "approved" ? "Verified & Approved" : "Approve Worker"}</span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {capabilities.canRequestResubmission && onPending && (
                      <button
                        type="button"
                        onClick={() => handleActionWithReason(onPending)}
                        disabled={displayStatus === "pending" || isSubmitting}
                        className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 disabled:opacity-40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>Resubmit</span>
                      </button>
                    )}

                    {capabilities.canReject && onReject && (
                      <button
                        type="button"
                        onClick={() => handleActionWithReason(onReject)}
                        disabled={isSubmitting}
                        className="h-9 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>

                  {capabilities.canRevoke && onRevoke && displayStatus === "approved" && (
                    <button
                      type="button"
                      onClick={() => handleActionWithReason(onRevoke, { confirmRevocation: true })}
                      disabled={isSubmitting}
                      className="w-full h-9 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Revoke Verification</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Case Timeline & History Card */}
          <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#141E30] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <History className="h-3.5 w-3.5 text-blue-500" />
                <span>Audit Timeline ({history.length})</span>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pt-1">
                {history.map((event) => (
                  <div
                    key={event.id}
                    className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                  >
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {event.action.replaceAll("_", " ")}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{event.oldStatus || "new"} → </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {event.newStatus}
                      </span>
                      {event.adminName && <span> by {event.adminName}</span>}
                    </div>
                    {event.reason && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded">
                        "{event.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No verification history recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
