import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGlobe } from 'react-icons/fi';
import { authorsApi } from '../api/authorsApi';
import AuthorForm from '../components/AuthorForm';

const AuthorsPage: React.FC = () => {
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const { data: authors = [], isLoading } = useQuery({
        queryKey: ['authors'],
        queryFn: authorsApi.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: authorsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authors'] });
            setDeleteId(null);
        },
    });

    const filteredAuthors = authors.filter((a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.nationality ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (author: any) => {
        setEditingAuthor(author);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingAuthor(null);
        setIsFormOpen(true);
    };

    return (
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="section-title mb-1">Catálogo de Autores</h1>
                    <p className="text-gray-500 text-sm">Gestiona el maestro global de autores compartidos</p>
                </div>
                <button className="btn-primary w-full sm:w-auto" onClick={handleAdd}>
                    <FiPlus size={20} className="mr-2" />
                    Añadir Autor
                </button>
            </div>

            <div className="card mb-8">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="input pl-10"
                            placeholder="Buscar autores por nombre o nacionalidad..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Autor</th>
                                <th className="px-6 py-4">Nacionalidad</th>
                                <th className="px-6 py-4">Bio</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando autores...</td>
                                </tr>
                            ) : filteredAuthors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No se encontraron autores.</td>
                                </tr>
                            ) : (
                                filteredAuthors.map((author) => (
                                    <tr key={author.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{author.name}</td>
                                        <td className="px-6 py-4">
                                            {author.nationality ? (
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <FiGlobe size={14} className="mr-2" />
                                                    {author.nationality}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {author.bio || 'Sin biografía'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    onClick={() => handleEdit(author)}
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    onClick={() => setDeleteId(author.id)}
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <AuthorForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    author={editingAuthor}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="modal-backdrop">
                    <div className="modal-content p-6 border-t-4 border-red-500 mx-4">
                        <h3 className="text-lg font-bold mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            Esta acción eliminará permanentemente al autor. Asegúrate de que no tenga libros vinculados si tienes restricciones en la base de datos.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button className="btn-secondary w-full sm:w-auto" onClick={() => setDeleteId(null)}>Cancelar</button>
                            <button
                                className="btn-danger w-full sm:w-auto"
                                onClick={() => deleteMutation.mutate(deleteId)}
                            >
                                Eliminar Autor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorsPage;
