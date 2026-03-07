import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    FiHome, FiBook, FiUsers, FiMapPin, FiMenu,
    FiLogOut, FiMoon, FiSun, FiChevronDown, FiPlus, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const Layout: React.FC = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        document.documentElement.classList.toggle('dark');
    };

    const navItems = [
        { name: t('common.dashboard'), path: '/dashboard', icon: FiHome },
        { name: t('common.books'), path: '/books', icon: FiBook },
        { name: t('common.authors'), path: '/authors', icon: FiUsers },
        { name: t('common.locations'), path: '/locations', icon: FiMapPin },
    ];

    const NavContent = () => (
        <div className="flex flex-col h-full p-4">
            <div className="flex items-center space-x-3 px-4 mb-10">
                <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-500/40">
                    <FiBook size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    BiblioTech
                </span>
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-link group relative ${isActive ? 'nav-link-active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <item.icon size={20} className="mr-3 transition-transform group-hover:scale-110" />
                        <span className="relative z-10">{item.name}</span>
                        {/* Mockup glow effect for active link */}
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-[.nav-link-active]:opacity-100 rounded-xl blur-md transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">{t('common.language')}</p>
                    <LanguageSwitcher />
                </div>

                <button
                    onClick={toggleDarkMode}
                    className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                >
                    {isDarkMode ? <FiSun size={20} className="mr-3" /> : <FiMoon size={20} className="mr-3" />}
                    {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                </button>
            </div>
        </div>
    );

    return (
        <div className={`main-layout ${isDarkMode ? 'dark' : ''}`}>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-on' : 'sidebar-off'}`}>
                <NavContent />
            </aside>

            {/* Main Content Area */}
            <div className="content-area">
                {/* Mobile Header */}
                <header className="header">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <FiMenu size={24} />
                        </button>
                        <span className="text-lg font-bold dark:text-white">BiblioTech</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <LanguageSwitcher variant="minimal" />
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>
                    </div>
                </header>

                {/* Top Desktop Bar */}
                <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 w-96">
                        <FiBook className="text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
                        />
                    </div>

                    <div className="flex items-center space-x-4">
                        <LanguageSwitcher variant="minimal" />

                        <div className="user-menu">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="user-button text-gray-700 dark:text-gray-200 border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                                <span className="font-semibold text-sm hidden lg:block ml-2">
                                    {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
                                </span>
                                <FiChevronDown size={16} className={`ml-2 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                    <div className="dropdown-menu mt-4">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-tighter">Cuenta</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                        <button className="dropdown-item">
                                            <FiSettings size={16} className="mr-3 text-gray-400" />
                                            Ajustes
                                        </button>
                                        <button onClick={handleLogout} className="dropdown-item text-red-600 dark:text-red-400">
                                            <FiLogOut size={16} className="mr-3" />
                                            {t('common.logout')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <main className="main-content">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Quick Add FAB */}
            <button
                onClick={() => navigate('/books')}
                className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 active:scale-95 transition-all shadow-blue-500/30"
            >
                <FiPlus size={24} />
            </button>
        </div>
    );
};

export default Layout;
