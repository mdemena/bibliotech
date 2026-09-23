"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, ChevronDown, MapPin, Plus, Trash2, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { LocationNode, LocationNodeFormData } from "@/types";
import { saveLocation, deleteLocation } from "@/lib/actions/locations";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function TreeNode({
  node,
  level,
  onEdit,
  onDelete,
  onAddChild,
}: {
  node: LocationNode;
  level: number;
  onEdit: (node: LocationNode) => void;
  onDelete: (id: string) => void;
  onAddChild: (parent: LocationNode) => void;
}) {
  const t = useTranslations("locations");
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = !!node.children && node.children.length > 0;

  const levelColors = ["bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-amber-600"];
  const levelClass = levelColors[level % levelColors.length]!;

  return (
    <div className={level > 0 ? "ml-8 border-l-2 border-gray-50 dark:border-gray-800/50 pl-4 mt-2" : ""}>
      <div className="group flex items-center justify-between p-4 bg-white dark:bg-[#121217] rounded-2xl border border-gray-50 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all ${
              isExpanded ? "" : "-rotate-90"
            } ${!hasChildren ? "invisible" : ""}`}
            aria-label="Toggle"
          >
            <ChevronDown size={14} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-2 h-2 rounded-full ${levelClass} shadow-[0_0_8px_rgba(37,99,235,0.4)] shrink-0`} />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                {node.level_name}
              </span>
              <span className="font-bold text-gray-900 dark:text-white truncate">{node.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            title={t("add_sublocation")}
            onClick={() => onAddChild(node)}
          >
            <Plus size={14} />
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-900 dark:hover:bg-white dark:hover:text-gray-900 transition-all shadow-sm"
            title="Editar"
            onClick={() => onEdit(node)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
            title="Eliminar"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-2">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LocationsClient({ tree }: { tree: LocationNode[] }) {
  const t = useTranslations("locations");

  const [formOpen, setFormOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<LocationNode | null>(null);
  const [parentNode, setParentNode] = useState<LocationNode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const handleEdit = (node: LocationNode) => {
    setEditingNode(node);
    setParentNode(null);
    setFormOpen(true);
  };

  const handleAddChild = (parent: LocationNode) => {
    setEditingNode(null);
    setParentNode(parent);
    setFormOpen(true);
  };

  const handleAddRoot = () => {
    setEditingNode(null);
    setParentNode(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const deleted = await deleteLocation(deleteId);
      if (deleted.error) setResult(deleted.error);
      setDeleteId(null);
    });
  };

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{t("subtitle")}</p>
        </div>
        <Button size="lg" className="shadow-2xl shadow-blue-500/30 font-bold" onClick={handleAddRoot}>
          <Plus size={20} className="mr-2" />
          {t("add_location")}
        </Button>
      </div>

      {tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 dark:bg-gray-800/10 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 text-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-full shadow-2xl mb-8 text-gray-300 dark:text-gray-700">
            <MapPin size={64} />
          </div>
          <p className="font-black text-2xl text-gray-400 dark:text-gray-500 tracking-tight">
            {t("no_locations")}
          </p>
          <Button size="lg" className="mt-10 px-10 py-4 font-bold shadow-xl shadow-blue-500/20" onClick={handleAddRoot}>
            <Plus size={20} className="mr-2" />
            {t("add_location")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              level={0}
              onEdit={handleEdit}
              onDelete={setDeleteId}
              onAddChild={handleAddChild}
            />
          ))}
        </div>
      )}

      <LocationFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingNode={editingNode}
        parentNode={parentNode}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        onConfirm={() => void confirmDelete()}
      />

      {result && (
        <div className="auth-error mt-6">
          <AlertTriangle size={16} />
          <span>{result}</span>
        </div>
      )}

      {pending && <div className="hidden" />}
    </div>
  );
}

function LocationFormDialog({
  open,
  onOpenChange,
  editingNode,
  parentNode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNode: LocationNode | null;
  parentNode: LocationNode | null;
}) {
  const t = useTranslations("forms");
  const { register, handleSubmit } = useForm<LocationNodeFormData>({
    defaultValues: {
      name: editingNode?.name ?? "",
      level_name: editingNode?.level_name ?? (parentNode ? "" : "Lugar"),
      parent_id: parentNode?.id ?? editingNode?.parent_id ?? null,
    },
  });

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit((data) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", editingNode?.id ?? "");
      formData.set("name", data.name);
      formData.set("level_name", data.level_name);
      formData.set("parent_id", data.parent_id ?? "");

      const saved = await saveLocation(formData);
      if (saved.error) {
        setError(saved.error);
        return;
      }
      onOpenChange(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-[2.5rem]">
        <DialogHeader>
          <div>
            <DialogTitle>
              {editingNode ? t("edit_location") : t("add_location")}
            </DialogTitle>
            {parentNode && (
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">
                {t("inside_of")}:{" "}
                <span className="text-gray-900 dark:text-white">{parentNode.name}</span>
              </p>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="auth-error mx-8 mt-6">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="p-8 md:p-10 space-y-8">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl flex gap-4 border border-blue-100/50 dark:border-blue-900/20">
            <MapPin size={20} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-blue-700/80 dark:text-blue-300 leading-relaxed">
              {t("help")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                {t("level_name")}
              </label>
              <input
                className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-2xl py-4 px-6 text-sm font-bold outline-none transition-all dark:text-white ${
                  "border-gray-100 dark:border-gray-800 focus:ring-blue-500/20 focus:border-blue-500"
                }`}
                placeholder="Ej: Habitación, Estante..."
                {...register("level_name", { required: true })}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                {t("name_label")}
              </label>
              <input
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                placeholder="Ej: Mi Despacho, Balda A..."
                {...register("name", { required: true })}
              />
            </div>
          </div>

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
              {editingNode ? t("update") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
