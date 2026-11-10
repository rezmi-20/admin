"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAdminPassword } from "@/lib/actions/admin-account";
import { useLanguage } from "@/context/LanguageContext";
import { User, ShieldCheck, Mail, Building, KeyRound, Calendar, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import FadeContent from "@/components/ui/fade-content";

type Profile = {
  email: string;
  admin_employee_id: string;
  work_email: string;
  full_name: string;
  department: string;
  phone?: string | null;
  admin_role: string;
  admin_status: string;
  activation_completed_at?: string | null;
};

export function AdminProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const submitPassword = (formData: FormData) => {
    setPasswordMessage(null);
    startPasswordTransition(async () => {
      const result = await updateAdminPassword(formData);
      setIsSuccess(!!result.success);
      setPasswordMessage(result.success ? (result.message || (t("admin.profile.passwordUpdated" as any) || "Password updated successfully")) : (result.error || (t("admin.profile.passwordFailed" as any) || "Failed to update password")));
      if (result.success && result.redirectTo) router.replace(result.redirectTo);
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-4 max-w-5xl mx-auto">
      {/* Vento Profile Header Card */}
      <div className="rounded-[16px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Picture with Status Badge */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white dark:border-slate-800">
              {getInitials(profile.full_name)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white" title="Active Verified Staff">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {profile.full_name || (t("admin.profile.fallbackName" as any) || "System Administrator")}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.work_email}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 sm:mt-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {profile.admin_role?.replaceAll("_", " ").toUpperCase()}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50">
                  {profile.admin_status || "Active"}
                </span>
              </div>
            </div>

            {/* Chips bar */}
            <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">ID:</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  {profile.admin_employee_id}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.department || "Operations & Administration"}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Activated: {profile.activation_completed_at ? new Date(profile.activation_completed_at).toLocaleDateString() : "Pending"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Info Card */}
        <div className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
            <User className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Employee Credentials & Information
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.common.employeeId" as any) || "Employee ID"}</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{profile.admin_employee_id}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.common.workEmail" as any) || "Work Email"}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.work_email}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.common.department" as any) || "Department"}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.department}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.common.role" as any) || "Assigned Role"}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.admin_role?.replaceAll("_", " ")}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-black/[0.03] dark:border-white/[0.03]">
              <span className="text-slate-500 dark:text-slate-400">Security Clearance</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Staff Verified
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400">{t("admin.common.activationDate" as any) || "Activated On"}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile.activation_completed_at ? new Date(profile.activation_completed_at).toLocaleDateString() : (t("admin.common.pending" as any) || "Pending")}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <form action={submitPassword} className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.05] mb-3">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("admin.profile.changePassword" as any) || "Security & Password"}
              </h2>
            </div>

            {passwordMessage && (
              <div className={`p-3 rounded-lg text-xs font-semibold mb-3 flex items-center gap-2 ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50"
              }`}>
                {isSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{passwordMessage}</span>
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder={t("admin.profile.placeholder.currentPassword" as any) || "Enter current password"}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  New Password (min 10 characters)
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  placeholder={t("admin.profile.placeholder.newPassword" as any) || "Enter new secure password"}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 block">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  placeholder={t("admin.profile.placeholder.confirmPassword" as any) || "Re-enter new password"}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPasswordPending}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 transition disabled:opacity-60 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isPasswordPending ? (t("admin.common.saving" as any) || "Updating...") : (t("admin.common.savePassword" as any) || "Update Password")}</span>
            </button>
          </div>
        </form>
      </div>
    </FadeContent>
  );
}
