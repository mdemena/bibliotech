import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Globe, Hash, MapPin, User } from "lucide-react";
import StarRating from "@/components/app/StarRating";
import { fetchBookById } from "@/lib/data";
import { getLocationPath } from "@/lib/locations";
import { fetchLocations } from "@/lib/data";
import { Link } from "@/i18n/routing";
import { CommentsForm } from "./CommentsForm";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [book, locations] = await Promise.all([fetchBookById(id), fetchLocations()]);
  if (!book) notFound();

  const t = await getTranslations("book_detail");
  const locationPath = book.location_node_id ? getLocationPath(book.location_node_id, locations) : null;

  return (
    <div className="container mx-auto max-w-5xl">
      <Link
        href="/books"
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="mr-2" size={18} />
        {t("back")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 dark:text-gray-600 text-sm font-bold uppercase tracking-widest text-center px-4">
                  {book.title}
                </span>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-col items-center text-center">
                <StarRating rating={book.rating || 0} readonly size={24} />
                <span className="text-xs text-gray-500 mt-2 font-medium">
                  {t("personal_rating")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
              {book.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <User className="mr-2 text-blue-600" size={16} />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {book.author?.name || t("unknown_author")}
                </span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <span className="flex items-center">
                <Globe className="mr-2 text-blue-600" size={16} />
                {book.language || t("no_language")}
              </span>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              {t("details")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-10">
              <div>
                <p className="text-xs text-gray-500 mb-1">ISBN</p>
                <p className="flex items-center font-mono text-sm dark:text-white">
                  <Hash size={14} className="mr-2 text-gray-400" />
                  {book.isbn || t("not_available")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">{t("location")}</p>
                <div className="flex items-start dark:text-white">
                  <MapPin size={14} className="mr-2 mt-1 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{book.location?.name || t("no_location")}</p>
                    {locationPath && (
                      <p className="text-[10px] text-gray-500 mt-0.5">{locationPath}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">{t("added_on")}</p>
                <p className="flex items-center text-sm dark:text-white">
                  <Calendar size={14} className="mr-2 text-gray-400" />
                  {new Intl.DateTimeFormat(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(book.created_at))}
                </p>
              </div>
            </div>
          </div>

          <CommentsForm bookId={book.id} comments={book.comments ?? []} />
        </div>
      </div>
    </div>
  );
}
