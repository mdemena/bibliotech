import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FiX, FiSave, FiUser, FiGlobe, FiInfo } from 'react-icons/fi';
import { authorsApi } from '../api/authorsApi';
import type { AuthorFormData } from '../types/database.types';

interface AuthorFormProps {
    isOpen: boolean;
    onClose: () => void;
    author?: any;
}

const AuthorForm: React.FC<AuthorFormProps> = ({ isOpen, onClose, author }) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AuthorFormData>();

    useEffect(() => {
        if (author) {
            reset({
                name: author.name,
                nationality: author.nationality || '',
                bio: author.bio || '',
            });
        } else {
            reset({ name: '', nationality: '', bio: '' });
        }
    }, [author, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: AuthorFormData) =>
            author ? authorsApi.update(author.id, data) : authorsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authors'] });
            onClose();
        },
    });

    const onSubmit = (data: AuthorFormData) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop backdrop-blur-sm z-[100]">
            <div className="modal-content max-w-xl mx-4 rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                        {author ? t('forms.edit_author', 'Editar Autor') : t('forms.add_author', 'Añadir Nuevo Autor')}
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm">
                        <FiX size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                            {t('forms.name', 'Nombre completo')}
                        </label>
                        <div className="relative group">
                            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-100 dark:border-gray-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all dark:text-white`}
                                placeholder={t('forms.name_placeholder', 'Ej: Gabriel García Márquez')}
                                {...register('name', { required: t('forms.required_name', 'El nombre es obligatorio') })}
                            />
                        </div>
                        {errors.name && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                            {t('forms.nationality', 'Nacionalidad')}
                        </label>
                        <div className="relative group">
                            <FiGlobe className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                                placeholder={t('forms.nationality_placeholder', 'Ej: Española')}
                                {...register('nationality')}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                            {t('forms.bio', 'Biografía corta')}
                        </label>
                        <div className="relative group">
                            <FiInfo className="absolute left-5 top-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <textarea
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white min-h-[120px] leading-relaxed resize-none"
                                placeholder={t('forms.bio_placeholder', 'Breve biografía del autor...')}
                                {...register('bio')}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                        <button type="button" className="btn-secondary py-4 px-10 font-bold order-2 sm:order-1" onClick={onClose}>
                            {t('common.cancel', 'Cancelar')}
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white rounded-2xl font-bold py-4 px-12 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || mutation.isPending}
                        >
                            <FiSave size={20} className="mr-3" />
                            {author ? t('forms.update', 'Actualizar') : t('forms.save', 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthorForm;
