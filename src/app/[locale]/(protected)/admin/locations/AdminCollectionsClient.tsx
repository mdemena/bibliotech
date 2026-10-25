"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Library, Search, Trash2, Pencil, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminCollectionRow } from "@/lib/data";
import type { LocationNode } from "@/types";
import { deleteAnyUserBook, updateUserBook } from "@/lib/actions/admin";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/app/StarRating";

export function AdminCollectionsClient({
  collections,
  locations,
}: {
  collections: AdminCollectionRow[];
  locations: LocationNode[];
}) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminCollectionRow | null>(null);
  const [editTarget, setEditTarget] = useState<AdminCollectionRow | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      collections.filter(
        (c) =>
          (c.user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.book_title ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.author_name ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [collections, search],
  );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteAnyUserBook(deleteTarget.id);
      if (res.error) setResult(res.error);
      setDeleteTarget(null);
    });
  };

  return (
    <div className="px-4 py-2 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Library className="text-blue-600" size={26} />
          {t("collections_title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {t("collections_subtitle")}
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
              placeholder={t("collections_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-8 py-5">{t("users_col_name")}</th>
                <th className="px-8 py-5">{t("books_col")}</th>
                <th className="px-8 py-5">{t("col_location")}</th>
                <th className="px-8 py-5">{t("col_rating")}</th>
                <th className="px-8 py-5 text-right">{t("actions_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                    <span className="text-lg font-black">{t("no_entries")}</span>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                    <td className="px-8 py-6 text-sm font-bold text-gray-700 dark:text-gray-300">
                      {c.user_name ?? "—"}
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-900 dark:text-white block truncate max-w-[220px]">
                        {c.book_title ?? "—"}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                        {c.author_name ?? ""}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 max-w-[180px] truncate">
                      {c.location_name ?? "—"}
                    </td>
                    <td className="px-8 py-6">
                      <StarRating rating={c.rating ?? 0} readonly size={14} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          onClick={() => setEditTarget(c)}
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

      {editTarget && (
        <EditCollectionDialog
          key={editTarget.id}
          entry={editTarget}
          locations={locations}
          onSaved={(error) => {
            setResult(error);
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title={t("delete_entry_title")}
          description={t("delete_entry_desc")}
          confirmLabel={t("delete_entry_confirm")}
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

      {pending && <span className="sr-only">loading</span>}
    </div>
  );
}

function EditCollectionDialog({
  entry,
  locations,
  onSaved,
}: {
  entry: AdminCollectionRow;
  locations: LocationNode[];
  onSaved: (error: string | null) => void;
}) {
  const t = useTranslations("admin");
  const [locationId, setLocationId] = useState(entry.location_node_id ?? "");
  const [rating, setRating] = useState(entry.rating ?? 0);
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const res = await updateUserBook(
        entry.id,
        locationId || null,
        rating > 0 ? rating : null,
      );
      onSaved(res.error);
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onSaved(null)}>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle>{entry.book_title ?? "—"}</DialogTitle>
        </DialogHeader>
        <div className="px-8 py-4 space-y-6">
          <p className="text-xs text-gray-500">{entry.user_name}</p>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
              {t("col_location")}
            </label>
            <select
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">—</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-3">
              {t("col_rating")}
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size={26} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" disabled={pending} onClick={() => onSaved(null)}>
            {t("cancel")}
          </Button>
          <Button disabled={pending} onClick={save} className="shadow-xl shadow-blue-500/20">
            <Save size={18} className="mr-2" />
            {t("update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
