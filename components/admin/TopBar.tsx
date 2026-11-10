"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Plus, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import type { AdminRole } from "@/lib/admin-authorization";

interface TopBarProps {
  adminName: string;
  adminRole: AdminRole;
}

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "am", label: "አማ" },
  { code: "om", label: "OM" },
];

export function TopBar({ adminName, adminRole }: TopBarProps) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [activeRange, setActiveRange] = useState("This month");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const r = url.searchParams.get("range");
      if (r) setActiveRange(r);
    }
    setCurrentTime(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  const handleRangeSelect = (range: string) => {
    setActiveRange(range);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("range", range);
      window.history.replaceState({}, "", url.toString());
      window.dispatchEvent(new CustomEvent("admin-range-change", { detail: range }));
    }
  };

  const getTitle = () => {
    if (!pathname) return "Overview";
    if (pathname === "/admin/dashboard" || pathname === "/admin") return "Overview";
    if (pathname.includes("/admin/workers")) return "Workers";
    if (pathname.includes("/admin/clients")) return "Clients";
    if (pathname.includes("/admin/verify")) return "Verification";
    if (pathname.includes("/admin/worker-avatar-requests")) return "Photo Requests";
    if (pathname.includes("/admin/jobs")) return "Jobs";
    if (pathname.includes("/admin/contracts")) return "Contracts";
    if (pathname.includes("/admin/payments")) return "Payments";
    if (pathname.includes("/admin/disputes")) return "Disputes";
    if (pathname.includes("/admin/community") || pathname.includes("/admin/content")) return "Community";
    if (pathname.includes("/admin/support")) return "Support";
    if (pathname.includes("/admin/appeals")) return "Appeals";
    if (pathname.includes("/admin/audit")) return "Audit Logs";
    if (pathname.includes("/admin/misconduct")) return "Admin Conduct";
    if (pathname.includes("/admin/reports")) return "Reports";
    if (pathname.includes("/admin/court-evidence")) return "Court Evidence";
    if (pathname.includes("/admin/settings")) return "Settings";
    if (pathname.includes("/admin/users")) return "Staff Users";
    if (pathname.includes("/admin/profile")) return "Profile";
    return "Overview";
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-white dark:bg-[#111827] border-b border-[#F1F2F4] dark:border-slate-800/60 px-4 md:px-5 flex items-center justify-between gap-4 shrink-0 transition-colors duration-200">
      {/* ── Left: Dynamic Page Title + Segmented Time Control ── */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
          {getTitle()}
        </h1>

        <div className="hidden md:flex items-center bg-[#F3F4F6] dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400">
          {["This month", "Last month", "Custom"].map((range) => (
            <button
              key={range}
              onClick={() => handleRangeSelect(range)}
              className={`px-3 py-1 rounded-md transition-all duration-150 ${
                activeRange === range
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Date Badge, Language Selector, + New Report, Verification ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {mounted && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>
        )}

        {/* Language Switcher Segmented Control */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all duration-150 ${
                language === code
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* + New Report Button */}
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-2xs transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500" />
          <span>New Report</span>
        </Link>

        {/* Verification Action Button */}
        <Link
          href="/admin/verify"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#090D14] dark:bg-white text-white dark:text-[#090D14] hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verification</span>
        </Link>
      </div>
    </header>
  );
}
