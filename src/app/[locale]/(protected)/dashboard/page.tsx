import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Clock, Star, ChevronRight } from "lucide-react";
import StarRating from "@/components/app/StarRating";
import { fetchAuthors, fetchBooks, fetchLocations } from "@/lib/data";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const [books, authors, locations] = await Promise.all([
    fetchBooks(),
    fetchAuthors(),
    fetchLocations(),
  ]);

  const ratedBooks = books.filter((b) => (b.rating ?? 0) > 0);
  const avgRating =
    ratedBooks.length > 0
      ? (ratedBooks.reduce((acc, b) => acc + (b.rating ?? 0), 0) / ratedBooks.length).toFixed(1)
      : "—";

  const topBooks = [...books]
    .filter((b) => b.rating)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

  const stats = [
    { label: t("total_books"), value: books.length },
    { label: t("authors_count"), value: authors.length },
    { label: t("locations_count"), value: locations.length },
    { label: t("avg_rating"), value: avgRating },
  ];

  return (
    <div className="px-4 py-6 md:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {t("welcome")} <span className="text-blue-600">{t("user")}</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6 border-none dark:bg-[#121217]">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
              {stat.label}
            </p>
            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold dark:text-white flex items-center mb-6">
          <Clock className="mr-3 text-blue-600" size={20} />
          {t("recent_additions")}
        </h2>
        <div className="card overflow-hidden border-none dark:bg-[#121217] divide-y divide-gray-100 dark:divide-gray-800">
          {books.slice(0, 5).map((book) => (
            <a
              key={book.id}
              href={`/books/${book.id}`}
              className="p-5 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
            >
              <div className="w-12 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                {book.cover_url && (
                  <img src={book.cover_url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h4>
                <p className="text-xs text-gray-500 truncate mt-1">{book.author?.name}</p>
              </div>
              <div className="hidden sm:block px-4 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-gray-800">
                {book.location?.name || "—"}
              </div>
              <ChevronRight className="text-gray-300 dark:text-gray-600 shrink-0" size={18} />
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold dark:text-white flex items-center mb-6">
          <Star className="mr-3 text-amber-500" size={20} />
          {t("top_rated")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topBooks.map((book) => (
            <a
              key={book.id}
              href={`/books/${book.id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all border-none dark:bg-[#121217] group"
            >
              <div className="w-14 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-2">{book.title}</h4>
                <StarRating rating={book.rating || 0} readonly size={14} />
              </div>
              <ChevronRight className="text-gray-300 flex-shrink-0" size={18} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
