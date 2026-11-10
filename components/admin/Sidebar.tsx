"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import {
  LayoutDashboard, Users, ShieldCheck, Briefcase, UserRound, Camera,
  FileText, DollarSign, Scale, Megaphone,
  BarChart2, Gavel, ChevronLeft, ChevronRight, ChevronDown, LogOut, Crown,
  LifeBuoy, ClipboardList, UserCircle, AlertTriangle, FileCheck, Sun, Moon,
  Settings, FolderKanban, ShieldAlert
} from "lucide-react";
import type { AdminPermission, AdminRole } from "@/lib/admin-authorization";

interface SidebarProps {
  userEmail: string | null;
  adminName?: string;
  adminRole: AdminRole;
  permissions: AdminPermission[];
}

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
  visible: boolean;
  dotColor?: string;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: ReactNode;
  items: NavItem[];
}

export function Sidebar({ userEmail, adminName, adminRole, permissions }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isSuperAdmin = adminRole === "super_admin";

  const can = (permission: AdminPermission) => permissions.includes(permission);

  // Grouped Navigation based on platform role and functionality
  const navGroups: NavGroup[] = [
    {
      id: "overview",
      title: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
      items: [
        {
          href: "/admin/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: t("admin.dashboard" as any) || "Dashboard",
          visible: true,
          dotColor: "bg-blue-500",
        },
      ],
    },
    {
      id: "identity",
      title: "Identity & Verification",
      icon: <ShieldCheck className="w-4 h-4" />,
      items: [
        {
          href: "/admin/verify",
          icon: <ShieldCheck className="w-4 h-4" />,
          label: "Verification Queue",
          visible: can("verification.read"),
          dotColor: "bg-emerald-500",
        },
        {
          href: "/admin/worker-avatar-requests",
          icon: <Camera className="w-4 h-4" />,
          label: "Photo Requests",
          visible: can("verification.read"),
        },
        {
          href: "/admin/workers",
          icon: <Users className="w-4 h-4" />,
          label: t("admin.workers" as any) || "Workers Directory",
          visible: can("verification.read"),
        },
        {
          href: "/admin/clients",
          icon: <UserRound className="w-4 h-4" />,
          label: t("admin.clients" as any) || "Clients Directory",
          visible: can("verification.read"),
        },
      ],
    },
    {
      id: "disputes",
      title: "Disputes & Legal",
      icon: <Scale className="w-4 h-4" />,
      items: [
        {
          href: "/admin/disputes",
          icon: <Scale className="w-4 h-4" />,
          label: t("admin.disputes" as any) || "Disputes Adjudication",
          visible: can("disputes.read"),
          dotColor: "bg-rose-500",
        },
        {
          href: "/admin/court-evidence",
          icon: <FileCheck className="w-4 h-4" />,
          label: "Court Evidence",
          visible: isSuperAdmin,
          badge: "Legal",
        },
        {
          href: "/admin/appeals",
          icon: <Gavel className="w-4 h-4" />,
          label: "Appeals",
          visible: can("appeals.read") && isSuperAdmin,
        },
        {
          href: "/admin/misconduct",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "Admin Misconduct",
          visible: can("admin_misconduct.review") && isSuperAdmin,
        },
      ],
    },
    {
      id: "operations",
      title: "Operations & Marketplace",
      icon: <FolderKanban className="w-4 h-4" />,
      items: [
        {
          href: "/admin/payments",
          icon: <DollarSign className="w-4 h-4" />,
          label: t("admin.payments" as any) || "Payment Cases",
          visible: can("payment_cases.read"),
          dotColor: "bg-amber-500",
        },
        {
          href: "/admin/support",
          icon: <LifeBuoy className="w-4 h-4" />,
          label: "Support Tickets",
          visible: can("support.read"),
          dotColor: "bg-violet-500",
        },
        {
          href: "/admin/jobs",
          icon: <Briefcase className="w-4 h-4" />,
          label: t("admin.jobs" as any) || "Jobs Oversight",
          visible: can("reports.read"),
        },
        {
          href: "/admin/contracts",
          icon: <FileText className="w-4 h-4" />,
          label: t("admin.contracts" as any) || "Contracts Registry",
          visible: can("reports.read"),
        },
        {
          href: "/admin/community",
          icon: <Megaphone className="w-4 h-4" />,
          label: t("admin.community" as any) || "Community Moderation",
          visible: can("content.read"),
        },
      ],
    },
    {
      id: "system",
      title: "System & Governance",
      icon: <Crown className="w-4 h-4" />,
      items: [
        {
          href: "/admin/reports",
          icon: <BarChart2 className="w-4 h-4" />,
          label: t("admin.reports" as any) || "Platform Analytics",
          visible: can("reports.read"),
        },
        {
          href: "/admin/users",
          icon: <Crown className="w-4 h-4" />,
          label: t("admin.users" as any) || "Staff & Access Roles",
          visible: can("admin_accounts.read") && isSuperAdmin,
          badge: "Full",
        },
        {
          href: "/admin/audit",
          icon: <ClipboardList className="w-4 h-4" />,
          label: "System Audit Logs",
          visible: can("audit.read") && isSuperAdmin,
        },
        {
          href: "/admin/settings",
          icon: <Settings className="w-4 h-4" />,
          label: "Platform Settings",
          visible: isSuperAdmin,
        },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    identity: true,
    disputes: true,
    operations: false,
    system: false,
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    navGroups.forEach((group) => {
      const hasActive = group.items.some(
        (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href))
      );
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await fetch("/api/admin/sign-out", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  };

  const getInitials = (str: string | null) => {
    if (!str) return "AD";
    const cleaned = str.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    return cleaned.substring(0, 2).toUpperCase() || "AD";
  };

  const isDark = mounted ? theme === "dark" || theme === "grayscale" : false;

  return (
    <aside
      className={`relative hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out
        bg-white dark:bg-[#111827] border-r border-[#EEF0F2] dark:border-slate-800/80 select-none z-30
        ${collapsed ? "w-[64px]" : "w-[180px]"}`}
    >
      {/* ── Brand Header (Flush Top) ── */}
      <div
        className={`flex items-center h-14 px-3.5 border-b border-[#F1F2F4] dark:border-slate-800/60 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <DireSkillLogo variant="color" iconSize={26} showWordmark={!collapsed} />
        </div>
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation Links (Scrollable Dropdown Groups) ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2.5 px-2 space-y-1.5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;

          const isGroupOpen = openGroups[group.id] ?? false;
          const hasActiveItem = visibleItems.some(
            (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href))
          );

          if (collapsed) {
            return (
              <div key={group.id} className="py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                {visibleItems.map(({ href, icon, label, dotColor }) => {
                  const isActive = pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={label}
                      className={`flex items-center justify-center w-9 h-9 mx-auto rounded-lg transition-all mb-1 relative
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      {icon}
                      {dotColor && !isActive && (
                        <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          }

          if (group.id === "overview") {
            const item = visibleItems[0];
            const isActive = pathname === item.href || pathname === "/admin";
            return (
              <div key={group.id} className="px-1 mb-1">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span className={isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  <span className="truncate flex-1">{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </Link>
              </div>
            );
          }

          return (
            <div key={group.id} className="rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition-colors ${
                  hasActiveItem
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                  {group.title}
                </span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isGroupOpen ? "rotate-0 text-slate-500" : "-rotate-90 text-slate-400"
                  }`}
                />
              </button>

              {isGroupOpen && (
                <div className="mt-0.5 space-y-0.5 pl-1 pr-0.5">
                  {visibleItems.map(({ href, icon, label, dotColor, badge }) => {
                    const isActive = pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                          isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <span className={`shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                          {icon}
                        </span>
                        <span className="truncate flex-1">{label}</span>
                        {badge && (
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 uppercase">
                            {badge}
                          </span>
                        )}
                        {dotColor && isActive && !badge && (
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom Sidebar: Real Admin Profile & Segmented Theme Switcher ── */}
      <div className="p-2 border-t border-[#F1F2F4] dark:border-slate-800/60 bg-white dark:bg-[#111827] space-y-1.5">
        <div
          className={`flex items-center gap-2 p-1 rounded-lg ${
            collapsed ? "justify-center" : "bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
          }`}
        >
          <Link
            href="/admin/profile"
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
            title="Profile"
          >
            {getInitials(userEmail || adminName || "AD")}
          </Link>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <Link href="/admin/profile" className="block group">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight group-hover:text-blue-600">
                  {adminName || userEmail?.split("@")[0] || "Admin"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                  {userEmail || "admin@example.com"}
                </p>
              </Link>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              title={t("admin.exitSystem" as any) || "Sign Out"}
              className="p-1 text-slate-400 hover:text-rose-600 rounded transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Light & Dark Mode Segmented Toggle */}
        {mounted && (
          <div
            className={`flex items-center bg-[#F3F4F6] dark:bg-slate-800 rounded-lg p-0.5 ${
              collapsed ? "justify-center" : "w-full"
            }`}
          >
            {collapsed ? (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-7 h-7 flex items-center justify-center rounded text-slate-600 dark:text-slate-300"
              >
                {isDark ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-all ${
                    !isDark
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  <Sun className={`w-3 h-3 ${!isDark ? "text-amber-500" : "text-slate-400"}`} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-semibold transition-all ${
                    isDark
                      ? "bg-slate-700 text-white shadow-xs font-bold"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  <Moon className={`w-3 h-3 ${isDark ? "text-blue-400" : "text-slate-400"}`} />
                  <span>Dark</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {collapsed && (
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-4 w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 shadow-xs z-30 hover:scale-105 transition"
          title="Expand sidebar"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </aside>
  );
}
