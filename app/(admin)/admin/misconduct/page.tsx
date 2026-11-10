import { getMisconductReviews, getMisuseIndicators } from "@/lib/actions/governance";
import MisconductReviewManager from "@/components/governance/MisconductReviewManager";

export const dynamic = "force-dynamic";

export default async function MisconductReviewsPage() {
  const [reviews, indicators] = await Promise.all([
    getMisconductReviews(),
    getMisuseIndicators(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Staff Governance & Ethics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Conduct Inquiries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Super Admin oversight panel for auditing staff actions, reviewing misuse indicators, and investigating protocol violations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#141E30] border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs">
            <span className="text-slate-400">Indicators Flagged: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{indicators.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Review Manager Surface */}
      <MisconductReviewManager
        indicators={indicators as any[]}
        reviews={reviews as any[]}
      />
    </div>
  );
}
