import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiSave, FiInfo } from 'react-icons/fi';
import { locationsApi } from '../api/locationsApi';
import type { LocationNodeFormData } from '../types/database.types';

interface LocationFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingNode?: any;
    parentNode?: any;
}

const LocationForm: React.FC<LocationFormProps> = ({ isOpen, onClose, editingNode, parentNode }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LocationNodeFormData>();

    useEffect(() => {
        if (editingNode) {
            reset({
                name: editingNode.name,
                level_name: editingNode.level_name,
                parent_id: editingNode.parent_id || null,
            });
        } else {
            reset({
                name: '',
                level_name: parentNode ? '' : 'Lugar', // Default level name for root
                parent_id: parentNode?.id || null,
            });
        }
    }, [editingNode, parentNode, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: LocationNodeFormData) =>
            editingNode ? locationsApi.update(editingNode.id, data) : locationsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            onClose();
        },
    });

    const onSubmit = (data: LocationNodeFormData) => {
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">
                            {editingNode ? 'Editar Ubicación' : 'Nueva Ubicación'}
                        </h2>
                        {parentNode && (
                            <p className="text-xs text-gray-500 mt-0.5">Dentro de: <span className="font-semibold text-blue-600">{parentNode.name}</span></p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 border border-blue-100 dark:border-blue-900/30">
                        <FiInfo className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                            Las ubicaciones son jerárquicas. Ejemplo: Lugar (Casa) → Habitación (Salón) → Mueble (Librería) → Estante (Balda 1).
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nivel / Tipo</label>
                            <input
                                className={`input ${errors.level_name ? 'border-red-500' : ''}`}
                                placeholder="Ej: Habitación, Estante..."
                                {...register('level_name', { required: 'El tipo de nivel es obligatorio' })}
                            />
                            {errors.level_name && <p className="mt-1 text-xs text-red-500">{errors.level_name.message}</p>}
                        </div>

                        <div>
                            <label className="label">Nombre</label>
                            <input
                                className={`input ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Ej: Mi Despacho, Balda A..."
                                {...register('name', { required: 'El nombre es obligatorio' })}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" className="btn-secondary w-full sm:w-auto" onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary w-full sm:w-auto"
                            disabled={isSubmitting || mutation.isPending}
                        >
                            <FiSave size={18} className="mr-2" />
                            {editingNode ? 'Actualizar' : 'Crear Ubicación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationForm;
