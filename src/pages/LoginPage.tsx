import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiBook } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="auth-container">
            <div className="w-full max-w-md">
                <div className="auth-logo-container">
                    <div className="auth-logo-box">
                        <FiBook size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        BiblioTech
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Tu biblioteca personal, organizada
                    </p>
                </div>

                <div className="auth-card">
                    <form onSubmit={handleSubmit}>
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm text-center">
                                {errorMsg}
                            </div>
                        )}

                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="password">Contraseña</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input pr-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    ¿No tienes cuenta? <Link to="/register" className="auth-link">Regístrate</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
