import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FiX, FiSave, FiImage, FiHash, FiGlobe, FiMapPin } from 'react-icons/fi';
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
    const { t } = useTranslation();
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
        <div className="modal-backdrop backdrop-blur-sm z-[100]">
            <div className="modal-content max-w-4xl mx-4 rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {book ? t('forms.edit_book', 'Editar Libro') : t('forms.add_book', 'Añadir Nuevo Libro')}
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm">
                        <FiX size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                        {/* Cover Preview Section */}
                        <div className="md:col-span-4 lg:col-span-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                                {t('forms.cover_url', 'Portada (URL)')}
                            </label>
                            <div className="aspect-[2/3] bg-white dark:bg-[#121217] rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 mb-6 flex items-center justify-center group relative transition-all hover:border-blue-500/50 shadow-inner">
                                {watch('cover_url') ? (
                                    <img src={watch('cover_url')} alt="Vista previa" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="text-center p-6 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300 dark:text-gray-700">
                                            <FiImage size={32} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 max-w-[100px] leading-relaxed uppercase tracking-widest">
                                            {t('forms.cover_hint', 'Pega una URL')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="relative group">
                                <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                                    placeholder={t('forms.cover_placeholder', 'https://ejemplo.com/portada.jpg')}
                                    {...register('cover_url')}
                                />
                            </div>
                        </div>

                        {/* Form Details Section */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                                    {t('forms.title', 'Título')}
                                </label>
                                <input
                                    className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.title ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-100 dark:border-gray-100/5 focus:ring-blue-500/20 focus:border-blue-500'} rounded-2xl py-4 px-6 text-lg font-bold outline-none transition-all dark:text-white`}
                                    placeholder={t('forms.title_placeholder', 'Título del libro')}
                                    {...register('title', { required: t('forms.required_title', 'El título es obligatorio') })}
                                />
                                {errors.title && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.title.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        {t('forms.author', 'Autor')}
                                    </label>
                                    <select
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.author_id ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-100 dark:border-gray-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-2xl py-4 px-6 text-sm font-bold flex-1 outline-none transition-all dark:text-white appearance-none`}
                                        {...register('author_id', { required: t('forms.required_author', 'Debes seleccionar un autor') })}
                                    >
                                        <option value="">{t('forms.author_placeholder', 'Seleccionar autor...')}</option>
                                        {authors.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                    {errors.author_id && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.author_id.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        {t('forms.isbn', 'ISBN')}
                                    </label>
                                    <div className="relative">
                                        <FiHash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                                            placeholder={t('forms.isbn_placeholder', '978-...')}
                                            {...register('isbn')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        {t('forms.language', 'Idioma')}
                                    </label>
                                    <div className="relative">
                                        <FiGlobe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white appearance-none cursor-pointer" {...register('language')}>
                                            <option value="Español">{t('forms.language_es', 'Español')}</option>
                                            <option value="Inglés">{t('forms.language_en', 'Inglés')}</option>
                                            <option value="Francés">{t('forms.language_fr', 'Francés')}</option>
                                            <option value="Alemán">{t('forms.language_de', 'Alemán')}</option>
                                            <option value="Otros">{t('forms.language_other', 'Otros')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                        {t('forms.location', 'Ubicación')}
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white appearance-none cursor-pointer" {...register('location_node_id')}>
                                            <option value="">{t('forms.location_none', 'Sin ubicación')}</option>
                                            {locations.map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.full_path || loc.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block px-1">
                                    {t('forms.rating', 'Valoración')}
                                </label>
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 w-fit">
                                    <StarRating
                                        rating={rating}
                                        onRatingChange={(r) => setValue('rating', r)}
                                        size={32}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 mt-10 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" className="btn-secondary py-4 px-10 font-bold order-2 sm:order-1" onClick={onClose}>
                            {t('common.cancel', 'Cancelar')}
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white rounded-2xl font-bold py-4 px-12 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || mutation.isPending}
                        >
                            <FiSave size={20} className="mr-3" />
                            {book ? t('forms.update', 'Actualizar') : t('forms.save', 'Guardar Libro')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookForm;
