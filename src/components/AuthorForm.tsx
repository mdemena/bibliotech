import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiSave } from 'react-icons/fi';
import { authorsApi } from '../api/authorsApi';
import type { AuthorFormData } from '../types/database.types';
import '../styles/components.css';

interface AuthorFormProps {
    isOpen: boolean;
    onClose: () => void;
    author?: any;
}

const AuthorForm: React.FC<AuthorFormProps> = ({ isOpen, onClose, author }) => {
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
        <div className="modal-backdrop">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">
                        {author ? 'Editar Autor' : 'Añadir Nuevo Autor'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div>
                        <label className="label">Nombre completo</label>
                        <input
                            className={`input ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="Ej: Gabriel García Márquez"
                            {...register('name', { required: 'El nombre es obligatorio' })}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="label">Nacionalidad</label>
                        <input
                            className="input"
                            placeholder="Ej: Colombiano"
                            {...register('nationality')}
                        />
                    </div>

                    <div>
                        <label className="label">Biografía corta</label>
                        <textarea
                            className="input min-h-[100px] py-3"
                            placeholder="Breve reseña sobre el autor..."
                            {...register('bio')}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={isSubmitting || mutation.isPending}
                        >
                            <FiSave size={18} className="mr-2" />
                            {author ? 'Actualizar' : 'Guardar Autor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthorForm;
