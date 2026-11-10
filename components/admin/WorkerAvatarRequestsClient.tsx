"use client";

import { useState } from "react";
import { Check, Image as ImageIcon, ShieldCheck, X, Camera } from "lucide-react";
import { reviewWorkerAvatarChange } from "@/lib/actions/worker-avatar";
import FadeContent from "@/components/ui/fade-content";

type AvatarRequest = {
  id: string;
  worker_user_id: string;
  requested_avatar_url: string;
  current_avatar_url: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string | Date;
};

export function WorkerAvatarRequestsClient({ requests: initialRequests, canReview }: { requests: AvatarRequest[]; canReview: boolean }) {
  const [requests, setRequests] = useState(initialRequests);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const review = async (request: AvatarRequest, decision: "approved" | "rejected") => {
    if (decision === "rejected" && !reasons[request.id]?.trim()) {
      setMessage("Add a reason before rejecting a photo.");
      return;
    }
    setPendingId(request.id);
    setMessage("");
    const result = await reviewWorkerAvatarChange(request.id, decision, reasons[request.id] || "");
    if (result.success) {
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } else {
      setMessage(result.error || "Could not update the request.");
    }
    setPendingId(null);
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-4 max-w-5xl mx-auto w-full">
      {/* Vento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[14px] bg-white dark:bg-[#141E30] border border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Identity & Media Review
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Worker Photo Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review and moderate profile photo replacement requests from registered workers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {requests.length} {requests.length === 1 ? "pending request" : "pending requests"}
          </span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 text-xs font-semibold">
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-12 text-center text-xs text-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No photo change requests</p>
          <p className="text-slate-400 mt-0.5">The review queue is currently clear.</p>
        </div>
      ) : requests.map((request) => (
        <article key={request.id} className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{request.full_name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{request.email || request.phone || "Worker account"} · {new Date(request.created_at).toLocaleString()}</p>
            </div>
            <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200/50">
              Needs Review
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[{ label: "Current Approved Photo", url: request.current_avatar_url }, { label: "Requested Replacement", url: request.requested_avatar_url }].map((photo) => (
              <div key={photo.label} className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{photo.label}</p>
                <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2">
                  {photo.url ? <img src={photo.url} alt={photo.label} className="max-h-72 w-full object-contain rounded-lg" /> : <ImageIcon className="h-8 w-8 text-slate-400" />}
                </div>
              </div>
            ))}
          </div>

          {canReview ? (
            <div className="space-y-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor={`reason-${request.id}`}>
                Reviewer note <span className="text-slate-400 font-normal">(required if rejecting)</span>
              </label>
              <textarea
                id={`reason-${request.id}`}
                value={reasons[request.id] || ""}
                onChange={(event) => setReasons((current) => ({ ...current, [request.id]: event.target.value }))}
                maxLength={500}
                rows={2}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                placeholder="Example: Photo is blurry or does not clearly match verified identity."
              />
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={pendingId === request.id}
                  onClick={() => void review(request, "rejected")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/60 dark:border-rose-900/40 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 px-3.5 py-1.5 text-xs font-semibold hover:bg-rose-100 transition disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  type="button"
                  disabled={pendingId === request.id}
                  onClick={() => void review(request, "approved")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve Photo</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="border-t border-black/[0.04] dark:border-white/[0.05] pt-3 text-xs text-slate-400">
              You have read-only access to view photo requests.
            </p>
          )}
        </article>
      ))}
    </FadeContent>
  );
}
