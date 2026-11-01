"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, MessageSquare, Search, Trash2, Pencil, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminCommentRow } from "@/lib/data";
import { deleteAnyComment, updateAnyComment } from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AdminCommentsClient({
  comments,
}: {
  comments: AdminCommentRow[];
}) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminCommentRow | null>(null);
  const [editTarget, setEditTarget] = useState<AdminCommentRow | null>(null);
  const [editText, setEditText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      comments.filter(
        (c) =>
          c.comment.toLowerCase().includes(search.toLowerCase()) ||
          (c.user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.book_title ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [comments, search],
  );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteAnyComment(deleteTarget.id);
      if (res.error) setResult(res.error);
      setDeleteTarget(null);
    });
  };

  const saveEdit = () => {
    if (!editTarget || !editText.trim()) return;
    startTransition(async () => {
      const res = await updateAnyComment(editTarget.id, editText.trim());
      if (res.error) setResult(res.error);
      setEditTarget(null);
    });
  };

  return (
    <div className="px-4 py-2 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="text-blue-600" size={26} />
          {t("comments_title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {t("comments_subtitle")}
        </p>
      </div>

      <div className="card overflow-hidden border-none dark:bg-[#121217] shadow-xl">
        <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
          <div className="relative group max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors"
              size={18}
            />
            <input
              className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              placeholder={t("comments_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5">{t("comments_col_content")}</th>
                <th className="px-8 py-5">{t("users_col_name")}</th>
                <th className="px-8 py-5">{t("books_col")}</th>
                <th className="px-8 py-5">{t("comments_col_date")}</th>
                <th className="px-8 py-5 text-right">{t("actions_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                    <span className="text-lg font-black">{t("no_comments")}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="px-8 py-6 max-w-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-2 italic">
                        {c.comment}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-700 dark:text-gray-300">
                      {c.user_name ?? "—"}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 truncate max-w-[200px]">
                      {c.book_title ?? "—"}
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          onClick={() => {
                            setEditTarget(c);
                            setEditText(c.comment);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                          onClick={() => setDeleteTarget(c)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editar comentario */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>{t("edit_comment_title")}</DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-4">
            <textarea
              className="input min-h-[120px] py-3"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
          </div>
          <DialogFooter className="px-8 pb-8">
            <Button variant="secondary" disabled={pending} onClick={() => setEditTarget(null)}>
              {t("cancel")}
            </Button>
            <Button disabled={pending || !editText.trim()} onClick={saveEdit}>
              <Save size={18} className="mr-2" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {deleteTarget && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={t("delete_comment_title")}
          description={t("delete_comment_desc")}
          confirmLabel={t("delete_comment_confirm")}
          cancelLabel={t("cancel")}
          onConfirm={confirmDelete}
        />
      )}

      {result && (
        <div className="auth-error mt-6">
          <AlertTriangle size={16} />
          <span>{result}</span>
        </div>
      )}
    </div>
  );
}
