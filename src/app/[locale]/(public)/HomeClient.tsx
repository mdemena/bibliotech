"use client";

import { motion } from "motion/react";
import {
  ArrowRight, Book, MapPin, Star, Users, BookOpen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, redirect } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { Button } from "@/components/ui/button";

export function HomeClient({ authenticated }: { authenticated: boolean }) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");

  const features = [
    {
      title: t("features.org_title"),
      description: t("features.org_desc"),
      icon: Book,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: t("features.hierarchy_title"),
      description: t("features.hierarchy_desc"),
      icon: MapPin,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: t("features.authors_title"),
      description: t("features.authors_desc"),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: t("features.reviews_title"),
      description: t("features.reviews_desc"),
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  const stats = [
    { label: t("month_jan"), value: "75%", color: "bg-blue-400" },
    { label: t("month_feb"), value: "45%", color: "bg-indigo-400" },
    { label: t("month_mar"), value: "90%", color: "bg-purple-400" },
  ];

  const heroTitle = t("title");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
                <Book className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold dark:text-white">BiblioTech</span>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              <LanguageSwitcher variant="minimal" />
              <ThemeToggle />

              {authenticated ? (
                <Link href="/dashboard" className="btn-primary">
                  {t("ir_dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hidden sm:block"
                  >
                    {tCommon("login")}
                  </Link>
                  <Link href="/register" className="btn-primary">
                    {tCommon("register")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-bold mb-6 border border-blue-100 dark:border-blue-800/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span>{t("version_badge")}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                {heroTitle.split(",")[0]},
                <span className="text-blue-600">{heroTitle.split(",")[1] || ""}</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={authenticated ? "/dashboard" : "/register"}
                  className="btn-primary px-8 w-full sm:w-auto"
                >
                  {t("cta")} <ArrowRight className="ml-2" />
                </Link>
                <a href="#features" className="btn-secondary px-8 w-full sm:w-auto">
                  {t("view_features")}
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-20 relative max-w-5xl mx-auto group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[2.5rem] blur-2xl opacity-50 transition-opacity group-hover:opacity-75" />
              <div className="relative bg-white dark:bg-[#121217] rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-transform duration-500 group-hover:scale-[1.01]">
                <img
                  src="/app-mockup.png"
                  alt="BiblioTech App"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="py-24 bg-gray-50/50 dark:bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold dark:text-white mb-4 tracking-tight">
                {t("features_heading")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto text-lg">
                {t("features_subheading")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="card p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border-none dark:bg-[#121217]"
                >
                  <div
                    className={`${feature.bg} ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-inner`}
                  >
                    <feature.icon size={30} />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-blue-500/20">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" />
              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                    {t("stats_heading")}
                  </h2>
                  <p className="text-blue-100 text-lg mb-8">{t("stats_subheading")}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                      <span className="block text-white font-bold text-2xl">1.4k+</span>
                      <span className="text-blue-100 text-xs uppercase font-bold tracking-widest">
                        {t("stats_active_books")}
                      </span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                      <span className="block text-white font-bold text-2xl">98%</span>
                      <span className="text-blue-100 text-xs uppercase font-bold tracking-widest">
                        {t("stats_satisfaction")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    {stats.map((stat) => (
                      <div key={stat.label}>
                        <div className="flex justify-between text-xs text-blue-100 font-bold mb-1 uppercase tracking-tighter">
                          <span>{stat.label}</span>
                          <span>{stat.value}</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${stat.color} transition-all duration-1000`}
                            style={{ width: stat.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 mb-20 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-extrabold dark:text-white mb-6 tracking-tight">
              {t("cta_heading")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg">{t("cta_subheading")}</p>
            <Link
              href="/register"
              className="inline-flex bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-[0.98]"
            >
              {t("cta_button")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0a0c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-blue-600 p-1 rounded-lg shadow-lg shadow-blue-500/20">
              <Book className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold dark:text-white">BiblioTech</span>
          </div>
          <p className="text-sm tracking-tighter uppercase font-bold text-gray-400 dark:text-gray-600 mb-2 italic">
            Designed for real book lovers
          </p>
          <p className="text-xs">© 2026 BiblioTech — Premium Book Management System.</p>
        </div>
      </footer>
    </div>
  );
}
