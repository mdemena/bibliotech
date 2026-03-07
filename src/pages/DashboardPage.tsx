import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBook, FiUsers, FiMapPin, FiStar, FiChevronRight, FiClock, FiPlus, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '../api/booksApi';
import { authorsApi } from '../api/authorsApi';
import { locationsApi } from '../api/locationsApi';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: books = [], isLoading: booksLoading } = useQuery({
        queryKey: ['books'], queryFn: booksApi.getAll,
    });
    const { data: authors = [], isLoading: authorsLoading } = useQuery({
        queryKey: ['authors'], queryFn: authorsApi.getAll,
    });
    const { data: locations = [] } = useQuery({
        queryKey: ['locations-flat'], queryFn: locationsApi.getAll,
    });

    if (booksLoading || authorsLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const avgRating = books.filter(b => b.rating && b.rating > 0).length > 0
        ? (books.filter(b => b.rating && b.rating > 0).reduce((acc, b) => acc + (b.rating ?? 0), 0) / books.filter(b => b.rating && b.rating > 0).length).toFixed(1)
        : '—';

    const recentBooks = [...books].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    const topBooks = [...books].filter(b => b.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || t('dashboard.user', 'Usuario');

    const stats = [
        { label: t('common.total_books', 'Total Libros'), value: books.length, icon: FiBook, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: t('common.authors', 'Autores'), value: authors.length, icon: FiUsers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: t('common.locations', 'Ubicaciones'), value: locations.length, icon: FiMapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: t('dashboard.avg_rating', 'Media'), value: avgRating, icon: FiStar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="px-4 py-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {t('dashboard.welcome', 'Bienvenido')}, <span className="text-blue-600">{displayName}</span> 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Aquí tienes un resumen de tu actividad literaria</p>
                </div>
                <button className="btn-primary py-4 px-6 shadow-2xl shadow-blue-500/30" onClick={() => navigate('/books')}>
                    <FiPlus size={20} className="mr-2" />
                    {t('dashboard.add_book', 'Añadir Libro')}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-8 border-none dark:bg-[#121217] group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
                                <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                <stat.icon size={26} />
                            </div>
                        </div>
                        <div className="mt-6 flex items-center text-emerald-500 text-xs font-bold">
                            <FiTrendingUp className="mr-1" />
                            <span>+12% este mes</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Reading Progress Mockup - Inspired by Mockup */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-8 border-none dark:bg-[#121217]">
                        <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center">
                            <FiActivity className="mr-3 text-blue-600" />
                            Lectura Actual
                        </h2>
                        <div className="space-y-6">
                            {books.length > 0 ? (
                                <div className="group cursor-pointer">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                            {books[0].cover_url && <img src={books[0].cover_url} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{books[0].title}</h4>
                                            <p className="text-xs text-gray-500 mb-4">{books[0].author?.name}</p>
                                            <div className="flex justify-between items-end text-xs font-bold mb-2 uppercase tracking-tighter">
                                                <span className="text-blue-600">Progreso</span>
                                                <span className="dark:text-white">65%</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No tienes lecturas en curso</p>
                            )}
                        </div>
                    </div>

                    <div className="card p-8 border-none dark:bg-[#121217]">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Objetivo 2026</h3>
                        <div className="flex items-center justify-center p-4">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.44)} className="text-blue-600" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-2xl font-black dark:text-white">12</span>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">libros</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs font-medium text-gray-500 mt-4">Vas por el <span className="text-blue-600 font-bold">44%</span> de tu meta anual</p>
                    </div>
                </div>

                {/* Main Activities */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Books */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold dark:text-white flex items-center">
                                <FiClock className="mr-3 text-blue-600" />
                                {t('dashboard.recent_additions', 'Añadidos recientemente')}
                            </h2>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center transition-colors px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl" onClick={() => navigate('/books')}>
                                {t('common.view_all', 'Ver todos')} <FiChevronRight className="ml-1" />
                            </button>
                        </div>

                        <div className="card overflow-hidden border-none dark:bg-[#121217] divide-y divide-gray-100 dark:divide-gray-800">
                            {recentBooks.length === 0 ? (
                                <div className="p-20 text-center text-gray-500 italic text-sm">Tu biblioteca está vacía.</div>
                            ) : (
                                recentBooks.map(book => (
                                    <div
                                        key={book.id}
                                        className="p-5 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all group"
                                        onClick={() => navigate(`/books/${book.id}`)}
                                    >
                                        <div className="w-12 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 group-hover:shadow-lg transition-all">
                                            {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm md:text-base text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">{book.title}</h4>
                                            <p className="text-xs text-gray-500 truncate mt-1">{book.author?.name}</p>
                                        </div>
                                        <div className="hidden sm:block px-4 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 dark:border-gray-800">
                                            {book.location?.name || 'S/U'}
                                        </div>
                                        <FiChevronRight className="text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-blue-600 transition-colors" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Rated */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold dark:text-white flex items-center">
                                <FiStar className="mr-3 text-amber-500" />
                                {t('dashboard.top_rated', 'Mejor valorados')}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {topBooks.length === 0 ? (
                                <div className="card lg:col-span-2 p-12 text-center text-gray-500 italic text-sm border-none dark:bg-[#121217]">No hay valoraciones todavía.</div>
                            ) : (
                                topBooks.slice(0, 4).map(book => (
                                    <div
                                        key={book.id}
                                        className="card p-4 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-none dark:bg-[#121217] group"
                                        onClick={() => navigate(`/books/${book.id}`)}
                                    >
                                        <div className="w-14 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700 group-hover:shadow-lg">
                                            {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-2">{book.title}</h4>
                                            <StarRating rating={book.rating || 0} readonly size={14} />
                                        </div>
                                        <FiChevronRight className="text-gray-300  shrink-0" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
