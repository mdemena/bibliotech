import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    FiPlus, FiEdit2, FiTrash2, FiChevronDown,
    FiLayers, FiAlertTriangle
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
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    const levelColors = [
        'badge-blue', 'badge-green', 'badge-orange', 'badge-gray'
    ];
    const levelClass = levelColors[level % levelColors.length];

    return (
        <div className={level > 0 ? 'tree-node' : ''}>
            <div className="tree-node-content group relative pr-12 sm:pr-0">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1 mr-1 text-gray-400 hover:text-gray-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'} ${!hasChildren ? 'invisible' : ''}`}
                >
                    <FiChevronDown size={14} />
                </button>

                <div className="flex items-center flex-1 min-w-0">
                    <span className={`${levelClass} mr-2 whitespace-nowrap text-[10px] scale-90 origin-left`}>
                        {node.level_name}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                        {node.name}
                    </span>
                </div>

                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex sm:static sm:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-0.5 ml-2">
                    <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                        title="Añadir sub-ubicación"
                        onClick={() => onAddChild(node)}
                    >
                        <FiPlus size={14} />
                    </button>
                    <button
                        className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md"
                        title="Editar"
                        onClick={() => onEdit(node)}
                    >
                        <FiEdit2 size={14} />
                    </button>
                    <button
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                        title="Eliminar"
                        onClick={() => onDelete(node.id)}
                    >
                        <FiTrash2 size={14} />
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="mt-0.5">
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
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-title mb-1">Ubicaciones Físicas</h1>
                    <p className="text-gray-500 text-sm">Organiza tu biblioteca con una estructura jerárquica personalizada</p>
                </div>
                <button className="btn-primary w-full sm:w-auto" onClick={handleAddRoot}>
                    <FiPlus size={20} className="mr-2" />
                    Nueva Ubicación Raíz
                </button>
            </div>

            <div className="card p-4 sm:p-6 min-h-[300px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        Cargando estructura...
                    </div>
                ) : tree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
                        <FiLayers size={48} className="mb-4 text-gray-300" />
                        <p className="font-semibold text-lg">No hay ubicaciones definidas</p>
                        <p className="text-sm max-w-xs mx-auto mt-2">Crea una ubicación raíz como "Casa" o "Oficina" para empezar.</p>
                        <button className="btn-primary mt-6" onClick={handleAddRoot}>Empieza aquí</button>
                    </div>
                ) : (
                    <div className="space-y-1">
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
                <div className="modal-backdrop">
                    <div className="modal-content p-6 border-t-4 border-red-500 mx-4">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <FiAlertTriangle size={24} />
                            <h3 className="text-lg font-bold">¿Eliminar ubicación?</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            Esta acción eliminará esta ubicación y **todas sus sub-ubicaciones**. Los libros vinculados a estas ubicaciones podrían quedar huérfanos.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button className="btn-secondary w-full sm:w-auto" onClick={() => setDeleteId(null)}>Cancelar</button>
                            <button
                                className="btn-danger w-full sm:w-auto"
                                onClick={() => deleteMutation.mutate(deleteId)}
                            >
                                Eliminar todo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsPage;
