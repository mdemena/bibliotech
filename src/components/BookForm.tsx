import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiX, FiSave, FiImage } from 'react-icons/fi';
import { booksApi } from '../api/booksApi';
import { authorsApi } from '../api/authorsApi';
import { locationsApi } from '../api/locationsApi';
import type { BookFormData } from '../types/database.types';
import StarRating from './StarRating';

interface BookFormProps {
    isOpen: boolean;
    onClose: () => void;
    book?: any;
}

const BookForm: React.FC<BookFormProps> = ({ isOpen, onClose, book }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<BookFormData>();
    const rating = watch('rating') || 0;

    const { data: authors = [] } = useQuery({
        queryKey: ['authors'],
        queryFn: authorsApi.getAll,
    });

    const { data: locations = [] } = useQuery({
        queryKey: ['locations-flat'],
        queryFn: locationsApi.getAll,
    });

    useEffect(() => {
        if (book) {
            reset({
                title: book.title,
                author_id: book.author_id,
                isbn: book.isbn || '',
                cover_url: book.cover_url || '',
                language: book.language || 'Español',
                rating: book.rating || 0,
                location_node_id: book.location_node_id || '',
            });
        } else {
            reset({
                title: '',
                author_id: '',
                isbn: '',
                cover_url: '',
                language: 'Español',
                rating: 0,
                location_node_id: '',
            });
        }
    }, [book, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: BookFormData) =>
            book ? booksApi.update(book.id, data) : booksApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books'] });
            onClose();
        },
    });

    const onSubmit = (data: BookFormData) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">
                        {book ? 'Editar Libro' : 'Añadir Nuevo Libro'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-5 md:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Cover Preview */}
                        <div className="md:col-span-1">
                            <label className="label">Portada (URL)</label>
                            <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4 flex items-center justify-center">
                                {watch('cover_url') ? (
                                    <img src={watch('cover_url')} alt="Vista previa" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <FiImage size={32} className="mx-auto text-gray-400 mb-2" />
                                        <span className="text-[10px] text-gray-500">Pega una URL abajo</span>
                                    </div>
                                )}
                            </div>
                            <input
                                className="input text-xs"
                                placeholder="https://ejemplo.com/portada.jpg"
                                {...register('cover_url')}
                            />
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="label">Título</label>
                                <input
                                    className={`input ${errors.title ? 'border-red-500' : ''}`}
                                    placeholder="Título del libro"
                                    {...register('title', { required: 'El título es obligatorio' })}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Autor</label>
                                    <select
                                        className={`input ${errors.author_id ? 'border-red-500' : ''}`}
                                        {...register('author_id', { required: 'Debes seleccionar un autor' })}
                                    >
                                        <option value="">Seleccionar autor...</option>
                                        {authors.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                    {errors.author_id && <p className="mt-1 text-xs text-red-500">{errors.author_id.message}</p>}
                                </div>

                                <div>
                                    <label className="label">ISBN</label>
                                    <input className="input" placeholder="978-..." {...register('isbn')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Idioma</label>
                                    <select className="input" {...register('language')}>
                                        <option value="Español">Español</option>
                                        <option value="Inglés">Inglés</option>
                                        <option value="Francés">Francés</option>
                                        <option value="Alemán">Alemán</option>
                                        <option value="Otros">Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Ubicación</label>
                                    <select className="input" {...register('location_node_id')}>
                                        <option value="">Sin ubicación</option>
                                        {locations.map(loc => (
                                            <option key={loc.id} value={loc.id}>{loc.full_path || loc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Valoración</label>
                                <div className="mt-2">
                                    <StarRating
                                        rating={rating}
                                        onRatingChange={(r) => setValue('rating', r)}
                                        size={28}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary w-full sm:w-auto px-8"
                            disabled={isSubmitting || mutation.isPending}
                        >
                            <FiSave size={18} className="mr-2" />
                            {book ? 'Actualizar' : 'Guardar Libro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookForm;
