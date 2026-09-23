"use client";

import { useState, useTransition } from "react";
import { Globe, Hash, MapPin, Image as ImageIcon, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import type {
  Book as BookType,
  Author,
  LocationNode,
  BookFormData,
} from "@/types";
import { saveBook } from "@/lib/actions/books";

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: BookType | null;
  authors: Author[];
  locations: LocationNode[];
}

export function BookFormDialog({
  open,
  onOpenChange,
  book,
  authors,
  locations,
}: BookFormDialogProps) {
  const t = useTranslations("forms");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } =
    useForm<BookFormData>({
      defaultValues: book
        ? {
            title: book.title,
            author_id: book.author_id ?? "",
            isbn: book.isbn ?? "",
            cover_url: book.cover_url ?? "",
            language: book.language ?? "",
            rating: book.rating ?? 0,
            location_node_id: book.location_node_id ?? "",
          }
        : {
            title: "",
            author_id: "",
            isbn: "",
            cover_url: "",
            language: "",
            rating: 0,
            location_node_id: "",
          },
    });

  const coverUrl = watch("cover_url");
  const rating = watch("rating") ?? 0;

  const onSubmit = (data: BookFormData) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", book?.id ?? "");
      formData.set("title", data.title);
      formData.set("author_id", data.author_id ?? "");
      formData.set("location_node_id", data.location_node_id ?? "");
      formData.set("isbn", data.isbn ?? "");
      formData.set("language", data.language ?? "");
      formData.set("rating", String(data.rating ?? 0));
      formData.set("cover_url", data.cover_url ?? "");

      const result = await saveBook(formData);
      if (result.error) {
        setError(result.error);
        return;
      }

      reset();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle>{book ? t("edit_book") : t("add_book")}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="auth-error mx-8 mt-6">
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 md:p-10 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4 lg:col-span-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                {t("cover_url")}
              </label>
              <div className="aspect-[2/3] bg-white dark:bg-[#121217] rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 mb-6 flex items-center justify-center group relative transition-all hover:border-blue-500/50 shadow-inner">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Portada"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="text-center p-6 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300 dark:text-gray-700">
                      <ImageIcon size={32} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 max-w-[100px] leading-relaxed uppercase tracking-widest">
                      {t("cover_hint")}
                    </span>
                  </div>
                )}
              </div>
              <div className="relative group">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                  placeholder={t("cover_placeholder")}
                  {...register("cover_url")}
                />
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-9 space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                  {t("title")}
                </label>
                <input
                  className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-100/5 dark:border-gray-800 focus:ring-blue-500/20 focus:border-blue-500 rounded-2xl py-4 px-6 text-lg font-bold outline-none transition-all dark:text-white ${
                    errors.title ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
                  placeholder={t("title_placeholder")}
                  {...register("title", { required: true })}
                />
                {errors.title && <p className="mt-2 text-xs text-red-500">{t("required_title")}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t("author")}
                  </label>
                  <select
                    aria-label={t("author")}
                    className={`w-full bg-gray-50 dark:bg-gray-900 border rounded-2xl py-4 px-6 text-sm font-bold outline-none transition-all dark:text-white appearance-none cursor-pointer ${
                      errors.author_id ? "border-red-500" : "border-gray-100 dark:border-gray-800"
                    }`}
                    {...register("author_id", { required: true })}
                  >
                    <option value="">{t("author_placeholder")}</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {errors.author_id && <p className="mt-2 text-xs text-red-500">{t("required_author")}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t("isbn")}
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                      placeholder={t("isbn_placeholder")}
                      {...register("isbn")}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t("language")}
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                    <select
                      aria-label={t("language")}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white appearance-none cursor-pointer"
                      {...register("language")}
                    >
                      <option value="">—</option>
                      <option value="Español">{t("language_es")}</option>
                      <option value="Inglés">{t("language_en")}</option>
                      <option value="Francés">{t("language_fr")}</option>
                      <option value="Alemán">{t("language_de")}</option>
                      <option value="Otros">{t("language_other")}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                    {t("location")}
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                    <select
                      aria-label={t("location")}
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white appearance-none cursor-pointer"
                      {...register("location_node_id")}
                    >
                      <option value="">{t("location_none")}</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.full_path || loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block px-1">
                  {t("rating")}
                </label>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 w-fit">
                  <StarRating
                    rating={rating}
                    onRatingChange={(r) => setValue("rating", r)}
                    size={32}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-4 pt-10 mt-10 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="secondary"
              className="py-4 px-10 font-bold order-2 sm:order-1"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="py-4 px-12 order-1 sm:order-2 shadow-xl shadow-blue-500/20"
              disabled={pending}
            >
              <Save size={20} className="mr-3" />
              {book ? t("update") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
