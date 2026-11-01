"use client";

import { useState, useTransition } from "react";
import { Edit2, Globe, Plus, Search, Trash2, AlertTriangle, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Author } from "@/types";
import { deleteCatalogBook, updateCatalogBook } from "@/lib/actions/admin";
import type { CatalogBookRow } from "@/lib/data";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormValues {
  title: string;
  author_id: string;
  isbn: string;
  language: string;
  cover_url: string;
}

export function AdminCatalogClient({
  catalog,
  authors,
}: {
  catalog: CatalogBookRow[];
  authors: Author[];
}) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogBookRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogBookRow | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = catalog.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn ?? "").includes(search),
  );

  return (
    <div className="px-4 py-2 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t("books_title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t("books_subtitle")}
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-2xl shadow-blue-500/30"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          {t("add_book_master")}
        </Button>
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
              placeholder={t("books_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5">{t("title")}</th>
                <th className="px-8 py-5">{t("author_col")}</th>
                <th className="px-8 py-5">ISBN</th>
                <th className="px-8 py-5">{t("owners_col")}</th>
                <th className="px-8 py-5">{t("comments_col")}</th>
                <th className="px-8 py-5 text-right">{t("actions_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">
                    <span className="text-lg font-black">{t("no_catalog")}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                          {row.cover_url ? (
                            <img src={row.cover_url} className="w-full h-full object-cover" alt="" />
                          ) : null}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block truncate max-w-[200px]">
                            {row.title}
                          </span>
                          {row.language && (
                            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                              {row.language}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400">
                        <Globe size={12} className="mr-2 text-blue-500" />
                        {row.author?.name ?? "—"}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-xs text-gray-500">
                      {row.isbn ?? "—"}
                    </td>
                    <td className="px-8 py-6 font-black text-sm">{row.owners_count}</td>
                    <td className="px-8 py-6 font-black text-sm">{row.commented_count}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          onClick={() => {
                            setEditing(row);
                            setFormOpen(true);
                          }}
                          aria-label="edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                          onClick={() => setDeleteTarget(row)}
                          aria-label="delete"
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

      <CatalogBookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editing}
        authors={authors}
        onSaved={(error) => {
          setResult(error);
          if (!error) setFormOpen(false);
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("delete_catalog_title")}
        description={t("delete_catalog_desc")}
        confirmLabel={t("delete_catalog_confirm")}
        cancelLabel={t("cancel")}
        onConfirm={() => {
          if (!deleteTarget) return;
          startTransition(async () => {
            const res = await deleteCatalogBook(deleteTarget.id);
            if (res.error) setResult(res.error);
          });
        }}
      />

      {result && (
        <div className="auth-error mt-6">
          <AlertTriangle size={16} />
          <span>{result}</span>
        </div>
      )}
    </div>
  );
}

function CatalogBookFormDialog({
  open,
  onOpenChange,
  book,
  authors,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: CatalogBookRow | null;
  authors: Author[];
  onSaved: (error: string | null) => void;
}) {
  const t = useTranslations("forms");
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      title: book?.title ?? "",
      author_id: book?.author?.id ?? "",
      isbn: book?.isbn ?? "",
      language: book?.language ?? "",
      cover_url: book?.cover_url ?? "",
    },
  });
  const [pending, startTransition] = useTransition();

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", book?.id ?? "");
      fd.set("title", data.title);
      fd.set("author_id", data.author_id);
      fd.set("isbn", data.isbn ?? "");
      fd.set("language", data.language ?? "");
      fd.set("cover_url", data.cover_url ?? "");
      const res = await updateCatalogBook(fd);
      onSaved(res.error);
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle>
            {book ? t("edit_book") : t("add_book")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="p-8 md:p-10 space-y-6">
          <div>
            <Label htmlFor="title">{t("title")}</Label>
            <Input id="title" className="py-3" {...register("title", { required: true })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="author_id">{t("author")}</Label>
              <select
                id="author_id"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                {...register("author_id", { required: true })}
              >
                <option value="">—</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input id="isbn" className="py-3" placeholder="978-..." {...register("isbn")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="language">{t("language")}</Label>
              <Input id="language" className="py-3" {...register("language")} />
            </div>

            <div>
              <Label htmlFor="cover_url">{t("cover_url")}</Label>
              <Input
                id="cover_url"
                className="py-3"
                placeholder={t("cover_placeholder")}
                {...register("cover_url")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending} className="shadow-xl shadow-blue-500/20">
              <Save size={18} className="mr-2" />
              {book ? t("update") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
