"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Search, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateUserDisplayName, setUserRole } from "@/lib/actions/admin";
import type { AdminProfileRow } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AdminUsersClient({
  users,
}: {
  users: AdminProfileRow[];
}) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AdminProfileRow | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = users.filter((u) =>
    (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 py-2 md:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {t("users_title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {t("users_subtitle")}
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
              placeholder={t("users_search")}
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
                <th className="px-8 py-5">{t("col_role")}</th>
                <th className="px-8 py-5">{t("users_col_books")}</th>
                <th className="px-8 py-5">{t("users_col_registered")}</th>
                <th className="px-8 py-5 text-right">{t("actions_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                        {(u.display_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {u.display_name ?? "—"}
                      </span>
                      {u.role === "admin" && <span className="badge-blue">admin</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select
                      className="w-fit bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white disabled:opacity-40"
                      value={u.role}
                      disabled={pending}
                      onChange={(e) => {
                        const nextRole = e.target.value;
                        startTransition(async () => {
                          const res = await setUserRole(u.id, nextRole);
                          if (res.error) setResult(res.error);
                        });
                      }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 font-black text-sm">{u.books_count}</td>
                  <td className="px-8 py-6 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      type="button"
                      className="w-10 h-10 ml-auto flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      onClick={() => setEditing(u)}
                      aria-label="edit"
                    >
                      <UserCheck size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <DisplayNameDialog
          key={editing.id}
          user={editing}
          onSaved={(error) => {
            setResult(error);
            setEditing(null);
          }}
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

function DisplayNameDialog({
  user,
  onSaved,
}: {
  user: AdminProfileRow;
  onSaved: (error: string | null) => void;
}) {
  const t = useTranslations("forms");
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(user.display_name ?? "");

  return (
    <Dialog open onOpenChange={(open) => !open && onSaved(null)}>
      <DialogContent className="max-w-md rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle>{t("display_name_edit")}</DialogTitle>
        </DialogHeader>

        <div className="px-8 py-4">
          <Label htmlFor="admin_display_name">{t("name")}</Label>
          <input
            id="admin_display_name"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onSaved(null)}>
            {t("cancel")}
          </Button>
          <Button
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const res = await updateUserDisplayName(user.id, name.trim());
                onSaved(res.error);
              });
            }}
            className="shadow-xl shadow-blue-500/20"
          >
            {t("update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
