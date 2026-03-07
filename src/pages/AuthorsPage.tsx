import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiGlobe } from 'react-icons/fi';
import { authorsApi } from '../api/authorsApi';
import AuthorForm from '../components/AuthorForm';

const AuthorsPage: React.FC = () => {
    const { t } = useTranslation();
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
        <div className="px-4 py-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        {t('authors.title', 'Catálogo de Autores')}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        {t('authors.subtitle', 'Gestiona el maestro global de autores compartidos')}
                    </p>
                </div>
                <button className="btn-primary py-4 px-6 shadow-2xl shadow-blue-500/30" onClick={handleAdd}>
                    <FiPlus size={20} className="mr-2" />
                    {t('authors.add_author', 'Añadir Autor')}
                </button>
            </div>

            <div className="card overflow-hidden border-none dark:bg-[#121217] shadow-xl">
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative group max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                            placeholder={t('authors.search_placeholder', 'Buscar autores por nombre o nacionalidad...')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/10 dark:bg-gray-900/10 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5">{t('common.authors', 'Autor')}</th>
                                <th className="px-8 py-5">Nacionalidad</th>
                                <th className="px-8 py-5">Bio</th>
                                <th className="px-8 py-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                            <span className="text-sm font-bold text-gray-400">{t('authors.loading', 'Cargando autores...')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAuthors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-300 dark:text-gray-700">
                                            <FiGlobe size={40} className="mb-2 opacity-20" />
                                            <span className="text-lg font-black">{t('authors.no_authors', 'No se encontraron autores.')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAuthors.map((author) => (
                                    <tr key={author.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                    {author.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{author.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {author.nationality ? (
                                                <div className="flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 w-fit px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                                                    <FiGlobe size={12} className="mr-2 text-blue-500" />
                                                    {author.nationality}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 dark:text-gray-700 text-xs font-bold uppercase tracking-widest">—</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                                                {author.bio || t('authors.no_bio', 'Sin biografía')}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => handleEdit(author)}
                                                    title={t('common.edit', 'Editar')}
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    className="w-10 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    onClick={() => setDeleteId(author.id)}
                                                    title={t('common.delete', 'Eliminar')}
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
                <div className="modal-backdrop backdrop-blur-sm z-[100]">
                    <div className="modal-content p-10 border-none rounded-[2rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                            {t('authors.delete_confirm_title', 'Eliminar autor')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-base mb-10 leading-relaxed font-medium">
                            {t('authors.delete_confirm_desc', 'Esta acción eliminará permanentemente al autor. Asegúrate de que no tenga libros vinculados si tienes restricciones en la base de datos.')}
                        </p>
                        <div className="flex gap-4">
                            <button className="flex-1 btn-secondary py-4 font-bold" onClick={() => setDeleteId(null)}>
                                {t('common.cancel', 'Cancelar')}
                            </button>
                            <button
                                className="flex-1 bg-red-600 text-white rounded-2xl font-bold py-4 hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 active:scale-[0.98]"
                                onClick={() => deleteMutation.mutate(deleteId)}
                            >
                                {t('common.delete', 'Eliminar')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorsPage;
