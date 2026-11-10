"use client";

import { useState, useTransition } from "react";
import { Search, Megaphone, Flag, ThumbsUp, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { removeCommunityPost } from "@/lib/actions/community";
import FadeContent from "@/components/ui/fade-content";

interface PostData {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  likesCount: number;
  flagsCount: number;
  isRemoved: boolean;
}

interface Props {
  initialPosts: PostData[];
  canModerate: boolean;
}

export function CommunityModerationClient({ initialPosts, canModerate }: Props) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [filterRemoved, setFilterRemoved] = useState<"all" | "active" | "hidden">("all");
  const [isPending, startTransition] = useTransition();

  const handleToggleRemove = (postId: string, currentRemoved: boolean) => {
    const nextStatus = !currentRemoved;
    const reason = window.prompt(nextStatus ? (t("admin.community.reasonHide" as any) || "Reason for hiding post:") : (t("admin.community.reasonRestore" as any) || "Reason for restoring post:"))?.trim();
    if (!reason) {
      alert(t("admin.community.reasonRequired" as any) || "Reason is required to moderate content.");
      return;
    }
    startTransition(async () => {
      const res = await removeCommunityPost(postId, nextStatus, reason);
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, isRemoved: nextStatus } : p))
        );
      } else {
        alert(res.error || (t("admin.community.updateFailed" as any) || "Failed to update post status."));
      }
    });
  };

  const filtered = posts.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query) ||
      p.authorName.toLowerCase().includes(query);

    const matchesFilter =
      filterRemoved === "all" ||
      (filterRemoved === "active" && !p.isRemoved) ||
      (filterRemoved === "hidden" && p.isRemoved);

    return matchesSearch && matchesFilter;
  });

  return (
    <FadeContent blur duration={0.3} className="space-y-4 w-full">
      {/* Vento Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-[14px] bg-white dark:bg-[#141E30] border border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Content & Community
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("admin.community.title" as any) || "Community Moderation"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("admin.community.desc" as any) || "Review discussion posts, safety flags, and moderate community conversations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          </span>
        </div>
      </div>

      {/* Vento Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141E30] p-3 rounded-[12px] border border-black/[0.05] dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative flex-grow max-w-md w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("admin.community.searchPlaceholder" as any) || "Search posts by title, body, or author..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3 py-2 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={() => setFilterRemoved("all")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filterRemoved === "all"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {t("admin.workers.filterAll" as any) || "All"}
          </button>
          <button
            onClick={() => setFilterRemoved("active")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filterRemoved === "active"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterRemoved("hidden")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
              filterRemoved === "hidden"
                ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs font-bold"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Vento Table Surface Card */}
      <div className="rounded-[14px] border border-black/[0.05] dark:border-white/[0.06] bg-white dark:bg-[#141E30] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t("admin.community.noPosts" as any) || "No community posts found."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  <th className="py-3 px-4">{t("admin.community.table.post" as any) || "Post Content"}</th>
                  <th className="py-3 px-4">{t("admin.community.table.category" as any) || "Category"}</th>
                  <th className="py-3 px-4">{t("admin.community.table.likes" as any) || "Likes"}</th>
                  <th className="py-3 px-4">{t("admin.community.table.flags" as any) || "Flags"}</th>
                  <th className="py-3 px-4 text-right">{t("admin.community.table.actions" as any) || "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-blue-600 transition">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {p.content}
                        </p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium mt-1.5">
                          By {p.authorName}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                        <span>{p.likesCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold flex items-center gap-1 ${
                          p.flagsCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-400"
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{p.flagsCount}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canModerate ? (
                        <button
                          disabled={isPending}
                          onClick={() => handleToggleRemove(p.id, p.isRemoved)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold transition disabled:opacity-50 border ${
                            p.isRemoved
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50"
                              : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/50"
                          }`}
                        >
                          {p.isRemoved ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Restore</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hide</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </FadeContent>
  );
}
