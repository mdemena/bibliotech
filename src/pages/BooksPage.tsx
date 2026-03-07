import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiBookOpen, FiStar, FiUser, FiMapPin } from 'react-icons/fi';
import { booksApi } from '../api/booksApi';
import { authorsApi } from '../api/authorsApi';
import BookForm from '../components/BookForm';

const BooksPage: React.FC = () => {
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
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-title mb-1">Tu Biblioteca</h1>
                    <p className="text-gray-500 text-sm">Gestiona y explora tu colección personal de libros</p>
                </div>
                <button className="btn-primary w-full sm:w-auto" onClick={() => { setEditingBook(null); setIsFormOpen(true); }}>
                    <FiPlus size={20} className="mr-2" />
                    Añadir Libro
                </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="sm:col-span-2 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        className="input pl-10"
                        placeholder="Buscar por título o ISBN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <select
                    className="input"
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                >
                    <option value="">Todos los autores</option>
                    {authors.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>

                <select
                    className="input"
                    value={ratingFilter || ''}
                    onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                >
                    <option value="">Cualquier valoración</option>
                    {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{r} estrellas</option>
                    ))}
                </select>
            </div>

            {/* Books Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="card h-64 md:h-80 animate-pulse bg-gray-100 dark:bg-gray-800"></div>
                    ))}
                </div>
            ) : filteredBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FiBookOpen size={64} className="text-gray-200 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No se encontraron libros</h3>
                    <p className="text-gray-500 mt-2">Prueba a cambiar los filtros o añade un nuevo libro.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            className="card group cursor-pointer hover:shadow-xl sm:hover:-translate-y-1 transition-all duration-300"
                            onClick={() => navigate(`/books/${book.id}`)}
                        >
                            <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                {book.cover_url ? (
                                    <img
                                        src={book.cover_url}
                                        alt={book.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                        <FiBookOpen size={32} className="mb-2 opacity-20" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider">{book.title}</span>
                                    </div>
                                )}

                                {/* Hover Actions - Visible on mobile by default or on hover for desktop */}
                                <div className="absolute inset-x-0 bottom-0 p-2 flex justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-1.5 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-lg transition-colors"
                                        onClick={(e) => handleEdit(book, e)}
                                    >
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button
                                        className="p-1.5 bg-red-500/80 backdrop-blur-md text-white hover:bg-red-600 rounded-lg transition-colors"
                                        onClick={(e) => handleDelete(book.id, e)}
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>

                                {book.rating && (
                                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded-lg flex items-center gap-1">
                                        <FiStar className="text-amber-400 fill-amber-400" size={10} />
                                        <span className="text-white text-[10px] font-bold">{book.rating}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <h3 className="font-bold text-xs md:text-sm text-gray-900 dark:text-white truncate mb-1" title={book.title}>
                                    {book.title}
                                </h3>
                                <p className="text-[10px] md:text-xs text-gray-500 truncate mb-2 flex items-center">
                                    <FiUser className="mr-1 inline" size={10} />
                                    {book.author?.name || 'Desconocido'}
                                </p>
                                {book.location?.name && (
                                    <span className="badge-gray flex items-center w-fit text-[9px] px-1.5 py-0.5">
                                        <FiMapPin size={8} className="mr-1" />
                                        {book.location.name}
                                    </span>
                                )}
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
                <div className="modal-backdrop">
                    <div className="modal-content p-6 border-t-4 border-red-500 mx-4">
                        <h3 className="text-lg font-bold mb-2">Eliminar libro</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            ¿Estás seguro de que quieres eliminar este libro de tu colección? Esta acción no se puede deshacer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button className="btn-secondary w-full sm:w-auto" onClick={() => setDeleteId(null)}>Cancelar</button>
                            <button
                                className="btn-danger w-full sm:w-auto"
                                onClick={() => deleteMutation.mutate(deleteId)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BooksPage;
