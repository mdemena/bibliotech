import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
    FiPlus, FiEdit2, FiTrash2, FiChevronDown,
    FiAlertTriangle, FiMapPin
} from 'react-icons/fi';
import { locationsApi } from '../api/locationsApi';
import type { LocationNode } from '../types/database.types';
import LocationForm from '../components/LocationForm';

const TreeNode: React.FC<{
    node: LocationNode;
    level: number;
    onEdit: (node: LocationNode) => void;
    onDelete: (id: string) => void;
    onAddChild: (parent: LocationNode) => void;
}> = ({ node, level, onEdit, onDelete, onAddChild }) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const levelColors = [
        'bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-amber-600'
    ];
    const levelClass = levelColors[level % levelColors.length];

    return (
        <div className={`transition-all ${level > 0 ? 'ml-8 border-l-2 border-gray-50 dark:border-gray-800/50 pl-4 mt-2' : ''}`}>
            <div className="group flex items-center justify-between p-4 bg-white dark:bg-[#121217] rounded-2xl border border-gray-50 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-blue-600 transition-all ${isExpanded ? 'rotate-0' : '-rotate-90'} ${!hasChildren ? 'invisible' : ''}`}
                    >
                        <FiChevronDown size={14} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${levelClass} shadow-[0_0_8px_rgba(37,99,235,0.4)]`} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                {node.level_name}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white truncate">
                                {node.name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title={t('locations.add_location', 'Añadir sub-ubicación')}
                        onClick={() => onAddChild(node)}
                    >
                        <FiPlus size={14} />
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-lg hover:bg-gray-900 dark:hover:bg-white dark:hover:text-gray-900 transition-all shadow-sm"
                        title={t('common.edit', 'Editar')}
                        onClick={() => onEdit(node)}
                    >
                        <FiEdit2 size={14} />
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title={t('common.delete', 'Eliminar')}
                        onClick={() => onDelete(node.id)}
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="mt-2">
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const LocationsPage: React.FC = () => {
    const { t } = useTranslation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<LocationNode | null>(null);
    const [parentNode, setParentNode] = useState<LocationNode | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const { data: tree = [], isLoading } = useQuery({
        queryKey: ['locations'],
        queryFn: () => locationsApi.getTree(),
    });

    const deleteMutation = useMutation({
        mutationFn: locationsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['locations'] });
            setDeleteId(null);
        },
    });

    const handleEdit = (node: LocationNode) => {
        setEditingNode(node);
        setParentNode(null);
        setIsFormOpen(true);
    };

    const handleAddChild = (parent: LocationNode) => {
        setEditingNode(null);
        setParentNode(parent);
        setIsFormOpen(true);
    };

    const handleAddRoot = () => {
        setEditingNode(null);
        setParentNode(null);
        setIsFormOpen(true);
    };

    return (
        <div className="px-4 py-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {t('locations.title', 'Ubicaciones Físicas')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        {t('locations.subtitle', 'Organiza tu biblioteca con una estructura jerárquica personalizada')}
                    </p>
                </div>
                <button className="btn-primary py-4 px-6 shadow-2xl shadow-blue-500/30 font-bold" onClick={handleAddRoot}>
                    <FiPlus size={20} className="mr-2" />
                    {t('locations.add_location', 'Nueva Ubicación Raíz')}
                </button>
            </div>

            <div className="min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 dark:bg-gray-800/10 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-6"></div>
                        <span className="text-lg font-black text-gray-400 uppercase tracking-widest">{t('locations.loading', 'Cargando estructura...')}</span>
                    </div>
                ) : tree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 dark:bg-gray-800/10 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 text-center">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-full shadow-2xl mb-8 text-gray-300 dark:text-gray-700">
                            <FiMapPin size={64} />
                        </div>
                        <p className="font-black text-2xl text-gray-400 dark:text-gray-500 tracking-tight">{t('locations.no_locations', 'No hay ubicaciones definidas')}</p>
                        <p className="text-gray-500 mt-3 max-w-sm mx-auto font-medium leading-relaxed">Crea una ubicación raíz como "Casa" o "Oficina" para empezar a organizar tu colección física.</p>
                        <button className="btn-primary mt-10 px-10 py-4 font-bold shadow-xl shadow-blue-500/20" onClick={handleAddRoot}>Empieza aquí</button>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {tree.map((node) => (
                            <TreeNode
                                key={node.id}
                                node={node}
                                level={0}
                                onEdit={handleEdit}
                                onDelete={setDeleteId}
                                onAddChild={handleAddChild}
                            />
                        ))}
                    </div>
                )}
            </div>

            {isFormOpen && (
                <LocationForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    editingNode={editingNode}
                    parentNode={parentNode}
                />
            )}

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="modal-backdrop backdrop-blur-sm z-[100]">
                    <div className="modal-content p-10 border-none rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="flex items-center gap-4 text-red-600 mb-6">
                            <FiAlertTriangle size={32} />
                            <h3 className="text-2xl font-black">{t('locations.delete_confirm_title', '¿Eliminar ubicación?')}</h3>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-10 leading-relaxed font-medium">
                            {t('locations.delete_confirm_desc', 'Esta acción eliminará esta ubicación y **todas sus sub-ubicaciones**. Los libros vinculados a estas ubicaciones podrían quedar huérfanos.')}
                        </p>
                        <div className="flex gap-4">
                            <button className="flex-1 btn-secondary py-4 font-bold" onClick={() => setDeleteId(null)}>
                                {t('common.cancel', 'Cancelar')}
                            </button>
                            <button
                                className="flex-1 bg-red-600 text-white rounded-2xl font-bold py-4 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-[0.98]"
                                onClick={() => deleteMutation.mutate(deleteId)}
                            >
                                {t('common.delete', 'Eliminar todo')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsPage;
