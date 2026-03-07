import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    FiHome, FiBook, FiUsers, FiMapPin, FiMenu,
    FiLogOut, FiMoon, FiSun, FiChevronDown, FiPlus
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../styles/layout.css';

const Layout: React.FC = () => {
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
        { name: 'Dashboard', path: '/', icon: FiHome },
        { name: 'Libros', path: '/books', icon: FiBook },
        { name: 'Autores', path: '/authors', icon: FiUsers },
        { name: 'Ubicaciones', path: '/locations', icon: FiMapPin },
    ];

    const NavContent = () => (
        <div className="flex flex-col h-full p-4">
            <div className="flex items-center space-x-3 px-4 mb-10">
                <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-500/30">
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
                            `nav-link ${isActive ? 'nav-link-active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                    >
                        <item.icon size={20} className="mr-3" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                    </button>
                </header>

                {/* Top Desktop Bar */}
                <div className="hidden md:flex items-center justify-end px-8 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="user-menu">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="user-button text-gray-700 dark:text-gray-200"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-sm hidden lg:block">
                                {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
                            </span>
                            <FiChevronDown size={16} />
                        </button>

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                <div className="dropdown-menu">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <button onClick={handleLogout} className="dropdown-item text-red-600 dark:text-red-400">
                                        <FiLogOut size={16} className="mr-2" />
                                        Cerrar sesión
                                    </button>
                                </div>
                            </>
                        )}
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
                className="fixed bottom-6 right-6 md:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-blue-700 active:scale-95 transition-all shadow-blue-500/20"
            >
                <FiPlus size={24} />
            </button>
        </div>
    );
};

export default Layout;
