"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Send, X, User } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BookComment } from "@/types";
import { addComment, deleteComment } from "@/lib/actions/books";

export function CommentsForm({
  bookId,
  comments,
}: {
  bookId: string;
  comments: BookComment[];
}) {
  const t = useTranslations("book_detail");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<BookComment[]>(comments);
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const submit = () => {
    if (!text.trim()) return;
    startTransition(async () => {
      const result = await addComment(bookId, text);
      if (result.error) {
        setError(result.error);
        return;
      }
      setText("");
      setList((prev) => [
        {
          id: crypto.randomUUID(),
          book_id: bookId,
          user_id: "",
          comment: text,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    });
  };

  const remove = (commentId: string) => {
    setDeletingId(commentId);
    startTransition(async () => {
      await deleteComment(commentId);
      setList((prev) => prev.filter((c) => c.id !== commentId));
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold dark:text-white flex items-center">
          <MessageSquare className="mr-3 text-blue-600" size={20} />
          {t("comments")}
        </h3>
        <span className="badge-blue px-3 py-1">{list.length}</span>
      </div>

      <div className="card p-4">
        {error && <div className="auth-error mb-4"><span>{error}</span></div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="relative"
        >
          <textarea
            className="input min-h-[100px] py-3 pr-12 resize-none"
            placeholder={t("comment_placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!text.trim() || pending}
            className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="mt-8 space-y-4">
          {list.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm italic">
              {t("no_comments")}
            </p>
          ) : (
            list.map((comment) => (
              <div
                key={comment.id}
                className={
                  deletingId === comment.id
                    ? "group flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 opacity-40 pointer-events-none transition-all"
                    : "group flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                }
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <User size={14} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold dark:text-white">{t("your_comment")}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all self-start"
                  aria-label={t("delete_comment")}
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
