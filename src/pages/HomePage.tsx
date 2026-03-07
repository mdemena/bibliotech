import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiBook, FiMapPin, FiUsers, FiStar, FiArrowRight,
    FiCheckCircle, FiShield, FiSmartphone, FiMoon, FiSun
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Sync state with DOM on mount
    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const features = [
        {
            title: 'Organización Total',
            description: 'Gestiona tu colección de libros, autores y ubicaciones de forma centralizada.',
            icon: FiBook,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Jerarquía Real',
            description: 'Define ubicaciones físicas precisas: desde tu casa hasta la balda específica.',
            icon: FiMapPin,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        },
        {
            title: 'Maestro de Autores',
            description: 'Accede a un catálogo compartido de autores con biografías y nacionalidades.',
            icon: FiUsers,
            color: 'text-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            title: 'Reseñas Personales',
            description: 'Valora tus lecturas y guarda tus impresiones con un sistema de comentarios.',
            icon: FiStar,
            color: 'text-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <FiBook className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold dark:text-white">BiblioTech</span>
                        </div>

                        <div className="flex items-center space-x-3 md:space-x-4">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                aria-label="Cambiar tema"
                            >
                                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                            </button>

                            {user ? (
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="btn-primary"
                                >
                                    Ir al Dashboard
                                </button>
                            ) : (
                                <>
                                    <Link to="/login" className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hidden sm:block">
                                        Iniciar Sesión
                                    </Link>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="btn-primary"
                                    >
                                        Registrarse
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                            Tu biblioteca, <span className="text-blue-600">perfectamente</span> organizada.
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10">
                            BiblioTech te ayuda a catalogar tus libros y saber exactamente dónde están en tu mundo físico. Desde habitaciones hasta baldas específicas.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate(user ? '/dashboard' : '/register')}
                                className="btn-primary px-8 py-4 text-lg w-full sm:w-auto"
                            >
                                Comienza Gratis <FiArrowRight className="ml-2" />
                            </button>
                            <a href="#features" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto">
                                Ver Funcionalidades
                            </a>
                        </div>

                        {/* Visual element - Mockup Image */}
                        <div className="mt-20 relative max-w-5xl mx-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 dark:opacity-40" />
                            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                                <img
                                    src="/app-mockup.png"
                                    alt="Mockup de BiblioTech App"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold dark:text-white mb-4">Potencia tu hábito de lectura</h2>
                            <p className="text-gray-600 dark:text-gray-400">Todo lo que necesitas para gestionar tu colección personal.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature) => (
                                <div key={feature.title} className="card p-8 hover:shadow-xl transition-all duration-300 group">
                                    <div className={`${feature.bg} ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon size={28} />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Responsive Info Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            <div className="lg:w-1/2">
                                <h2 className="text-3xl font-bold dark:text-white mb-6 flex items-center">
                                    <FiSmartphone className="mr-4 text-blue-600" />
                                    Diseño 100% Mobile-First
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                    Consulta tu biblioteca desde cualquier lugar. Nuestra aplicación está optimizada para que puedas buscar un libro en tus estanterías usando tu móvil, o gestionar grandes lotes desde tu escritorio.
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        'Interfaz ultra-fluida',
                                        'Acciones rápidas en móviles',
                                        'Soporte completo para modo oscuro',
                                        'Filtros inteligentes e instantáneos'
                                    ].map((text) => (
                                        <li key={text} className="flex items-center text-gray-700 dark:text-gray-300">
                                            <FiCheckCircle className="text-emerald-500 mr-3" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                                <div className="bg-blue-600 h-64 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center text-white">
                                    <div>
                                        <FiShield size={40} className="mx-auto mb-4 opacity-50" />
                                        <p className="font-bold">Seguridad con Supabase</p>
                                    </div>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 h-64 rounded-2xl shadow-inner mt-12 flex items-center justify-center">
                                    <FiSmartphone size={60} className="text-gray-300 dark:text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-blue-600 rounded-3xl py-16 shadow-2xl shadow-blue-500/20">
                        <h2 className="text-3xl font-bold text-white mb-6">¿Listo para organizar tu biblioteca?</h2>
                        <p className="text-blue-100 mb-10 text-lg">Únete a otros lectores y toma el control de tu colección hoy mismo.</p>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl active:scale-[0.98]"
                        >
                            Crea tu cuenta gratis
                        </button>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-md">
                            <FiBook className="text-gray-600 dark:text-gray-400" size={16} />
                        </div>
                        <span className="font-bold dark:text-white">BiblioTech</span>
                    </div>
                    <p className="text-gray-500 text-sm">© 2026 BiblioTech. Gestión premium de bibliotecas personales.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
