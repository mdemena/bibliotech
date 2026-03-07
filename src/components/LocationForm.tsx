import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FiX, FiSave, FiInfo, FiLayers, FiMapPin } from 'react-icons/fi';
import { locationsApi } from '../api/locationsApi';
import type { LocationNodeFormData } from '../types/database.types';

interface LocationFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingNode?: any;
    parentNode?: any;
}

const LocationForm: React.FC<LocationFormProps> = ({ isOpen, onClose, editingNode, parentNode }) => {
    const { t } = useTranslation();
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
        <div className="modal-backdrop backdrop-blur-sm z-[100]">
            <div className="modal-content max-w-xl mx-4 rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingNode ? t('forms.edit_location', 'Editar Ubicación') : t('forms.add_location', 'Nueva Ubicación')}
                        </h2>
                        {parentNode && (
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">{t('forms.inside_of', 'Dentro de')}: <span className="text-gray-900 dark:text-white">{parentNode.name}</span></p>
                        )}
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-gray-800 rounded-2xl transition-all shadow-sm">
                        <FiX size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8">
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-3xl flex gap-4 border border-blue-100/50 dark:border-blue-900/20">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                            <FiInfo size={20} />
                        </div>
                        <p className="text-[11px] font-medium text-blue-700/80 dark:text-blue-300 leading-relaxed">
                            {t('forms.location_help', 'Las ubicaciones son jerárquicas. Ejemplo: Casa → Salón → Librería → Balda 1.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                                {t('forms.level_name', 'Nivel / Tipo')}
                            </label>
                            <div className="relative group">
                                <FiLayers className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.level_name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-100 dark:border-gray-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all dark:text-white`}
                                    placeholder={t('forms.level_name_placeholder', 'Ej: Habitación, Estante...')}
                                    {...register('level_name', { required: t('forms.required_level', 'El nombre del nivel es obligatorio') })}
                                />
                            </div>
                            {errors.level_name && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.level_name.message}</p>}
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block px-1">
                                {t('forms.name', 'Nombre')}
                            </label>
                            <div className="relative group">
                                <FiMapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-100 dark:border-gray-800 focus:ring-blue-500/20 focus:border-blue-500'} rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none transition-all dark:text-white`}
                                    placeholder={t('forms.name_placeholder', 'Ej: Mi Despacho, Balda A...')}
                                    {...register('name', { required: t('forms.required_name', 'El nombre es obligatorio') })}
                                />
                            </div>
                            {errors.name && <p className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.name.message}</p>}
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
                            {editingNode ? t('forms.update', 'Actualizar') : t('forms.save', 'Guardar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationForm;
