"use client";

import { useMemo, useState, useTransition } from "react";
import {
  BookOpen, ChevronRight, Plus, Search, Star, Trash2, Edit2, User, Filter,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { Book, AuthorFormData } from "@/types";
import type { Author } from "@/types";
import { deleteBook } from "@/lib/actions/books";
import { BookFormDialog } from "@/components/app/BookFormDialog";
import { ConfirmDialog } from "@/components/app/ConfirmDialog";
import { Button } from "@/components/ui/button";

export function BooksClient({
  books,
  authors,
}: {
  books: Book[];
  authors: Author[];
}) {
  const t = useTranslations("books");

  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [pending, startTransition] = useTransition();

  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const matchesSearch =
          book.title.toLowerCase().includes(search.toLowerCase()) ||
          (book.isbn ?? "").includes(search);
        const matchesAuthor = authorFilter === "" || book.author_id === authorFilter;
        const matchesRating = ratingFilter === null || book.rating === ratingFilter;
        return matchesSearch && matchesAuthor && matchesRating;
      }),
    [books, search, authorFilter, ratingFilter],
  );

  const confirmDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteBook(deleteTarget.id);
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
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t("subtitle")}
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-2xl shadow-blue-500/30"
          onClick={() => {
            setEditingBook(null);
            setFormOpen(true);
          }}
        >
          <Plus size={20} className="mr-2" />
          {t("add_book")}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 p-2 bg-gray-50 dark:bg-[#121217] rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="sm:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          aria-label={t("all_authors")}
          className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-4 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
        >
          <option value="">{t("all_authors")}</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          aria-label={t("any_rating")}
          className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-4 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
          value={ratingFilter ?? ""}
          onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">{t("any_rating")}</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} ★
            </option>
          ))}
        </select>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50/50 dark:bg-gray-800/10 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl mb-6 text-gray-300 dark:text-gray-600">
            <BookOpen size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-400 dark:text-gray-500 tracking-tight">
            {t("no_books")}
          </h3>
          <p className="text-gray-500 mt-2 max-w-xs mx-auto">{t("no_books_desc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="group cursor-pointer">
              <Link href={`/books/${book.id}`}>
                <div className="relative aspect-[2/3] bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-gray-100 dark:border-gray-700/50">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                      <BookOpen size={40} className="mb-4 opacity-10" />
                      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">
                        {book.title}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-y-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300" />

                  {book.rating && (
                    <div className="absolute top-4 left-4 px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl flex items-center gap-1.5 shadow-lg">
                      <Star className="text-amber-500 fill-amber-500" size={12} />
                      <span className="text-gray-900 dark:text-white text-xs font-black">
                        {book.rating}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-center translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="edit"
                        className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-blue-600 rounded-xl transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingBook(book);
                          setFormOpen(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label="delete"
                        className="w-9 h-9 flex items-center justify-center bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 rounded-xl transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteTarget(book);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="bg-blue-600 p-2 rounded-xl">
                      <ChevronRight className="text-white" size={16} />
                    </div>
                  </div>
                </div>
              </Link>

              <div className="mt-4 px-1">
                <h3
                  className="font-extrabold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors"
                  title={book.title}
                >
                  {book.title}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[70%]">
                    {book.author?.name || t("unknown_author")}
                  </p>
                  {book.location?.name && (
                    <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest truncate">
                      {book.location.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editingBook}
        authors={authors}
        locations={
          books.length >= 0
            ? Array.from(
                new Map(
                  books
                    .flatMap((b) => (b.location ? [b.location] : []))
                    .map((l) => [l.id, l]),
                ).values(),
              )
            : []
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_desc")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
      />
    </div>
  );
}
