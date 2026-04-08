import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const AuthCallbackPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [statusText, setStatusText] = useState('Verificando credenciales...');

    useEffect(() => {
        console.log('AuthCallbackPage state:', { user: !!user, loading });

        if (!loading) {
            if (user) {
                console.log('AuthCallbackPage: User detected, redirecting to dashboard');
                setStatusText('Sesión iniciada con éxito. Redirigiendo...');
                const timer = setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 500);
                return () => clearTimeout(timer);
            } else {
                console.warn('AuthCallbackPage: Loading finished but no user found. Potential session failure.');
                setStatusText('No se pudo verificar la sesión. Regresando al login...');
                const timer = setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center">
            {/* Background elements to match the theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center space-y-6 max-w-sm px-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/40 animate-pulse mb-2">
                    <FiBook size={40} className="text-white" />
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {statusText}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Esto solo tomará unos segundos. Por favor no cierres esta ventana.
                    </p>
                </div>

                <div className="flex justify-center pt-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthCallbackPage;
