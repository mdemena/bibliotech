import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiBookOpen, FiStar, FiUser, FiFilter, FiChevronRight } from 'react-icons/fi';
import { booksApi } from '../api/booksApi';
import { authorsApi } from '../api/authorsApi';
import BookForm from '../components/BookForm';

const BooksPage: React.FC = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: books = [], isLoading } = useQuery({
        queryKey: ['books'],
        queryFn: booksApi.getAll,
    });

    const { data: authors = [] } = useQuery({
        queryKey: ['authors'],
        queryFn: authorsApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: booksApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            setDeleteId(null);
        },
    });

    const filteredBooks = books.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
            (book.isbn ?? '').includes(search);
        const matchesAuthor = authorFilter === '' || book.author_id === authorFilter;
        const matchesRating = ratingFilter === null || book.rating === ratingFilter;
        return matchesSearch && matchesAuthor && matchesRating;
    });

    const handleEdit = (book: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingBook(book);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteId(id);
    };

    return (
        <div className="px-4 py-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {t('books.title', 'Tu Biblioteca')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        {t('books.subtitle', 'Gestiona y explora tu colección personal de libros')}
                    </p>
                </div>
                <button className="btn-primary py-4 px-6 shadow-2xl shadow-blue-500/30" onClick={() => { setEditingBook(null); setIsFormOpen(true); }}>
                    <FiPlus size={20} className="mr-2" />
                    {t('dashboard.add_book', 'Añadir Libro')}
                </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 p-2 bg-gray-50 dark:bg-[#121217] rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="sm:col-span-2 relative group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                        placeholder={t('books.search_placeholder', 'Buscar por título o ISBN...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                    >
                        <option value="">{t('books.all_authors', 'Todos los autores')}</option>
                        {authors.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                        value={ratingFilter || ''}
                        onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                    >
                        <option value="">{t('books.any_rating', 'Cualquier valoración')}</option>
                        {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} {t('books.stars', 'estrellas')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Books Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="rounded-3xl h-80 animate-pulse bg-gray-50 dark:bg-gray-800/50 shadow-inner"></div>
                    ))}
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50/50 dark:bg-gray-800/10 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl mb-6 text-gray-300 dark:text-gray-600">
                        <FiBookOpen size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-400 dark:text-gray-500 tracking-tight">
                        {t('books.no_books', 'No se encontraron libros')}
                    </h3>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                        {t('books.no_books_desc', 'Prueba a cambiar los filtros o añade un nuevo libro.')}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            className="group cursor-pointer perspective-1000"
                            onClick={() => navigate(`/books/${book.id}`)}
                        >
                            <div className="relative aspect-[2/3] bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-1 border border-gray-100 dark:border-gray-700/50">
                                {book.cover_url ? (
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                        <FiBookOpen size={40} className="mb-4 opacity-10" />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{book.title}</span>
                                    </div>
                                )}

                                {/* Hover Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300" />

                                {/* Hover Actions */}
                                <div className="absolute inset-x-0 bottom-0 p-4 flex justify-between items-center translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="flex gap-2">
                                        <button
                                            className="w-9 h-9 flex items-center justify-center bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-blue-600 rounded-xl transition-all"
                                            onClick={(e) => handleEdit(book, e)}
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            className="w-9 h-9 flex items-center justify-center bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 rounded-xl transition-all"
                                            onClick={(e) => handleDelete(book.id, e)}
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="bg-blue-600 p-2 rounded-xl">
                                        <FiChevronRight className="text-white" />
                                    </div>
                                </div>

                                {book.rating && (
                                    <div className="absolute top-4 left-4 px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl flex items-center gap-1.5 shadow-lg">
                                        <FiStar className="text-amber-500 fill-amber-500" size={12} />
                                        <span className="text-gray-900 dark:text-white text-xs font-black">{book.rating}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 px-1">
                                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors" title={book.title}>
                                    {book.title}
                                </h3>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate max-w-[70%]">
                                        {book.author?.name || 'Desconocido'}
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

            {isFormOpen && (
                <BookForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    book={editingBook}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="modal-backdrop backdrop-blur-sm z-[100]">
                    <div className="modal-content p-10 border-none rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                            {t('books.delete_confirm_title', 'Eliminar libro')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-10 leading-relaxed font-medium">
                            {t('books.delete_confirm_desc', '¿Estás seguro de que quieres eliminar este libro de tu colección? Esta acción no se puede deshacer.')}
                        </p>
                        <div className="flex gap-4">
                            <button className="flex-1 btn-secondary py-4 font-bold" onClick={() => setDeleteId(null)}>
                                {t('common.cancel', 'Cancelar')}
                            </button>
                            <button
                                className="flex-1 bg-red-600 text-white rounded-2xl font-bold py-4 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-[0.98]"
                                onClick={() => deleteMutation.mutate(deleteId)}
                            >
                                {t('common.delete', 'Eliminar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksPage;
