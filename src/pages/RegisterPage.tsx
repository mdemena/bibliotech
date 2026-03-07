import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiBook } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden');
            return;
        }
        if (password.length < 6) {
            setErrorMsg('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        const { error } = await signUp(email, password, displayName);
        setLoading(false);

        if (error) {
            setErrorMsg(error.message);
        } else {
            navigate('/login');
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
                        Crear cuenta
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Empieza a organizar tu biblioteca
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
                            <label className="auth-label" htmlFor="displayName">Nombre</label>
                            <input
                                id="displayName"
                                type="text"
                                className="auth-input"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

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
                                    placeholder="Mínimo 6 caracteres"
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

                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="confirmPassword">Confirmar contraseña</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="auth-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
