import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiUsers, FiMapPin, FiStar, FiChevronRight, FiClock, FiPlus } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '../api/booksApi';
import { authorsApi } from '../api/authorsApi';
import { locationsApi } from '../api/locationsApi';
import { useAuth } from '../contexts/AuthContext';
import StarRating from '../components/StarRating';

const DashboardPage: React.FC = () => {
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const avgRating = books.filter(b => b.rating && b.rating > 0).length > 0
        ? (books.filter(b => b.rating && b.rating > 0).reduce((acc, b) => acc + (b.rating ?? 0), 0) / books.filter(b => b.rating && b.rating > 0).length).toFixed(1)
        : '—';

    const recentBooks = [...books].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
    const topBooks = [...books].filter(b => b.rating).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 5);
    const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario';

    const stats = [
        { label: 'Total Libros', value: books.length, icon: FiBook, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Autores', value: authors.length, icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Ubicaciones', value: locations.length, icon: FiMapPin, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { label: 'Media', value: avgRating, icon: FiStar, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    ];

    return (
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white text-center sm:text-left">
                        ¡Hola, {displayName}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1 text-center sm:text-left">Aquí tienes un resumen de tu biblioteca</p>
                </div>
                <button className="btn-primary w-full sm:w-auto" onClick={() => navigate('/books')}>
                    <FiPlus size={20} className="mr-2" />
                    Añadir Libro
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Books */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold dark:text-white flex items-center">
                            <FiClock className="mr-3 text-blue-600" />
                            Recientes
                        </h2>
                        <button className="text-blue-600 hover:underline text-sm font-semibold flex items-center" onClick={() => navigate('/books')}>
                            Ver todos <FiChevronRight />
                        </button>
                    </div>

                    <div className="card divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                        {recentBooks.length === 0 ? (
                            <div className="p-10 text-center text-gray-500 italic text-sm">Tu biblioteca está vacía.</div>
                        ) : (
                            recentBooks.map(book => (
                                <div
                                    key={book.id}
                                    className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/books/${book.id}`)}
                                >
                                    <div className="w-10 h-14 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                                        {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate">{book.title}</h4>
                                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{book.author?.name}</p>
                                    </div>
                                    <FiChevronRight className="text-gray-300 shrink-0" />
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
                            Mejor valorados
                        </h2>
                    </div>

                    <div className="card divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                        {topBooks.length === 0 ? (
                            <div className="p-10 text-center text-gray-500 italic text-sm">No has valorado ninguna lectura todavía.</div>
                        ) : (
                            topBooks.map(book => (
                                <div
                                    key={book.id}
                                    className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/books/${book.id}`)}
                                >
                                    <div className="w-10 h-14 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden shrink-0 border border-gray-200 dark:border-gray-600">
                                        {book.cover_url && <img src={book.cover_url} className="w-full h-full object-cover" alt="" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate">{book.title}</h4>
                                        <StarRating rating={book.rating || 0} readonly size={12} />
                                    </div>
                                    <FiChevronRight className="text-gray-300 shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
