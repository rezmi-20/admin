"use client";

import { useState } from "react";
import { Settings, Save, CheckCircle, Database } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

interface StatsData {
  totalUsers: number;
  totalWorkers: number;
  totalClients: number;
  totalJobs: number;
  totalPayments: number;
}

interface Props {
  stats: StatsData;
}

export function PlatformSettingsClient({ stats }: Props) {
  const { t } = useLanguage();
  const [fee, setFee] = useState(5);
  const [simulation, setSimulation] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-4 max-w-4xl mx-auto w-full">
      {/* Vento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[14px] bg-white dark:bg-[#141E30] border border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              System Configuration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.settings.title" as any) || "Platform Settings"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.settings.desc" as any) || "Global platform parameters, commission fees, payment simulator, and database telemetry."}
          </p>
        </div>
      </div>

      {showSaved && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-[12px]">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{t("admin.settings.saved" as any) || "Settings saved successfully."}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Settings Form */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
              <Settings className="w-4 h-4 text-blue-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("admin.settings.section.general" as any) || "General Configuration"}
              </h2>
            </div>

            {/* Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t("admin.settings.feeLabel" as any) || "Platform Service Fee (%)"}
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition font-semibold"
              />
              <p className="text-[11px] text-slate-400">
                {t("admin.settings.feeDesc" as any) || "Applied to completed contract escrow payouts."}
              </p>
            </div>

            {/* Simulation Mode Toggle */}
            <div className="flex items-start justify-between gap-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t("admin.settings.simulationMode" as any) || "Payment Simulation Sandbox"}
                </label>
                <p className="text-[11px] text-slate-400">
                  {t("admin.settings.simulationDesc" as any) || "Simulates Chapa and CBE Birr transaction webhooks without live bank deduction."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSimulation(!simulation)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  simulation ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${
                    simulation ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition active:scale-95 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t("admin.settings.btnSave" as any) || "Save Parameters"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Database Health Panel */}
        <div className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
            <Database className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t("admin.settings.health" as any) || "System Metrics"}
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.settings.health.totalUsers" as any) || "Total Users"}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.settings.health.workerAccounts" as any) || "Workers"}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{stats.totalWorkers}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.settings.health.clientAccounts" as any) || "Clients"}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.settings.health.totalJobs" as any) || "Jobs Created"}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{stats.totalJobs}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.settings.health.transactions" as any) || "Transactions"}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{stats.totalPayments}</span>
            </div>
          </div>
        </div>
      </div>
    </FadeContent>
  );
}
