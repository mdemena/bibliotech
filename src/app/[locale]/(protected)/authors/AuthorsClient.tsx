"use client";

import { useMemo, useState, useTransition } from "react";
import { Edit2, Globe, Plus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { Author, AuthorFormData } from "@/types";
import { saveAuthor, deleteAuthor } from "@/lib/actions/authors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";

export function AuthorsClient({
  authors,
  locale,
}: {
  authors: Author[];
  locale: string;
}) {
  const t = useTranslations("authors");

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredAuthors = useMemo(
    () =>
      authors.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          (a.nationality ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [authors, search],
  );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const deleted = await deleteAuthor(deleteTarget.id);
      if (deleted.error) setResult(deleted.error);
      setDeleteTarget(null);
    });
  };

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{t("subtitle")}</p>
        </div>
        <Button
          size="lg"
          className="shadow-2xl shadow-blue-500/30"
          onClick={() => {
            setEditingAuthor(null);
            setFormOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          {t("add_author")}
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
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5">Autores</th>
                <th className="px-8 py-5">Nacionalidad</th>
                <th className="px-8 py-5">Bio</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredAuthors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400">
                    <span className="text-lg font-black">{t("no_authors")}</span>
                  </td>
                </tr>
              ) : (
                filteredAuthors.map((author) => (
                  <tr key={author.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-lg">
                          {author.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {author.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {author.nationality ? (
                        <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 w-fit px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                          <Globe size={12} className="mr-2 text-blue-500" />
                          {author.nationality}
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-700 text-xs font-bold uppercase tracking-widest">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                        {author.bio || t("description_placeholder")}
                      </p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          aria-label="Editar"
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          onClick={() => {
                            setEditingAuthor(author);
                            setFormOpen(true);
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label="Eliminar"
                          className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          onClick={() => setDeleteTarget(author)}
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

      <AuthorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        author={editingAuthor}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={confirmDelete}
      />
      {result && <div className="hidden">{locale}</div>}
    </div>
  );
}

function AuthorFormDialog({
  open,
  onOpenChange,
  author,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  author: Author | null;
}) {
  const t = useTranslations("forms");
  const {
    register,
    handleSubmit,
    reset,
    getValues,
  } = useForm<AuthorFormData>({
    defaultValues: {
      name: author?.name ?? "",
      nationality: author?.nationality ?? "",
      bio: author?.bio ?? "",
    },
  });

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", author?.id ?? "");
      formData.set("name", data.name);
      formData.set("nationality", data.nationality ?? "");
      formData.set("bio", data.bio ?? "");

      const saved = await saveAuthor(formData);
      if (saved.error) {
        setError(saved.error);
        return;
      }
      reset();
      onOpenChange(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle>{author ? t("edit_author") : t("add_author")}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="auth-error mx-8 mt-6">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-8 md:p-10 space-y-8">
          <fieldset disabled={pending} className="space-y-8 border-none p-0 m-0">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                {t("name")}
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold outline-none transition-all dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder={t("form_placeholder_author_name")}
                {...register("name", { required: true })}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                {t("nationality")}
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                placeholder="Ej: Española"
                {...register("nationality")}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                {t("bio")}
              </label>
              <textarea
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-5 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white min-h-[120px] leading-relaxed resize-none"
                placeholder={t("bio_placeholder")}
                {...register("bio")}
              />
            </div>
          </fieldset>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              className="py-4 px-10 font-bold"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="py-4 px-12 shadow-xl shadow-blue-500/20"
              disabled={pending}
            >
              {author ? t("update") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
