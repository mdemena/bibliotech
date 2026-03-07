import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FiArrowLeft, FiMapPin, FiUser,
    FiGlobe, FiHash, FiCalendar, FiMessageSquare, FiSend, FiX, FiBookOpen
} from 'react-icons/fi';
import { booksApi } from '../api/booksApi';
import StarRating from '../components/StarRating';
import '../styles/components.css';

const BookDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState('');

    const { data: book, isLoading } = useQuery({
        queryKey: ['book', id],
        queryFn: () => booksApi.getById(id!),
        enabled: !!id,
    });

    const commentMutation = useMutation({
        mutationFn: (text: string) => booksApi.addComment(id!, text),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['book', id] });
            setCommentText('');
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => booksApi.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['book', id] });
        },
    });

    if (isLoading) return <div className="p-10 text-center text-gray-500 animate-pulse">Cargando detalles...</div>;
    if (!book) return <div className="p-10 text-center text-red-500">Libro no encontrado</div>;

    return (
        <div className="container mx-auto max-w-5xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
            >
                <FiArrowLeft className="mr-2" /> Volver
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Cover & Basic Stats */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-8">
                        <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-gray-300 dark:text-gray-600 flex flex-col items-center">
                                    <FiBookOpen size={64} className="mb-4 opacity-20" />
                                    <span className="text-sm font-bold uppercase tracking-widest text-center px-4">{book.title}</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col items-center text-center">
                                <StarRating rating={book.rating || 0} readonly size={24} />
                                <span className="text-xs text-gray-500 mt-2 font-medium">VALORACIÓN PERSONAL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Info & Comments */}
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                            {book.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                            <span className="flex items-center">
                                <FiUser className="mr-2 text-blue-600" />
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{book.author?.name || 'Autor Desconocido'}</span>
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span className="flex items-center">
                                <FiGlobe className="mr-2 text-blue-600" />
                                {book.language || 'Sin idioma'}
                            </span>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="card p-6">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Detalles</h3>
                        <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">ISBN</p>
                                <p className="flex items-center font-mono text-sm dark:text-white">
                                    <FiHash size={14} className="mr-2 text-gray-400" />
                                    {book.isbn || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                                <div className="flex items-start dark:text-white">
                                    <FiMapPin size={14} className="mr-2 mt-1 text-blue-600" />
                                    <div>
                                        <p className="font-semibold text-sm">{book.location?.name || 'No asignada'}</p>
                                        {book.location?.full_path && (
                                            <p className="text-[10px] text-gray-500 mt-0.5">{book.location.full_path}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Añadido el</p>
                                <p className="flex items-center text-sm dark:text-white">
                                    <FiCalendar size={14} className="mr-2 text-gray-400" />
                                    {new Date(book.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white flex items-center">
                                <FiMessageSquare className="mr-3 text-blue-600" />
                                Comentarios
                            </h3>
                            <span className="badge-blue px-3 py-1">{book.comments?.length || 0}</span>
                        </div>

                        <div className="card p-4">
                            <form
                                onSubmit={(e) => { e.preventDefault(); if (commentText.trim()) commentMutation.mutate(commentText); }}
                                className="relative"
                            >
                                <textarea
                                    className="input min-h-[100px] py-3 pr-12 resize-none"
                                    placeholder="Escribe tus impresiones sobre el libro..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || commentMutation.isPending}
                                    className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                                >
                                    <FiSend size={18} />
                                </button>
                            </form>

                            {/* Comments List */}
                            <div className="mt-8 space-y-4">
                                {book.comments?.length === 0 ? (
                                    <p className="text-center py-6 text-gray-400 text-sm italic">Sin comentarios todavía.</p>
                                ) : (
                                    book.comments?.map((comment) => (
                                        <div key={comment.id} className="group flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                                <FiUser size={14} className="text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold dark:text-white">Tu comentario</span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                    {comment.comment}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteCommentMutation.mutate(comment.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
                                                title="Eliminar comentario"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailPage;
