import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiEye, FiEyeOff, FiBook, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMsg(t('auth.passwords_no_match'));
            return;
        }
        if (password.length < 6) {
            setErrorMsg(t('auth.password_min_length'));
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

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setErrorMsg(null);
        try {
            await signInWithGoogle();
        } catch {
            setErrorMsg('Error al iniciar sesión con Google');
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            {/* Navbar */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-[#0a0a0c]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/30">
                                <FiBook className="text-white" size={20} />
                            </div>
                            <span className="text-xl font-bold dark:text-white">BiblioTech</span>
                        </Link>
                        <LanguageSwitcher variant="minimal" />
                    </div>
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 flex items-center justify-center pt-16 px-4 py-12">
                {/* Decorative background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Logo + tagline */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/40 mb-5">
                            <FiBook size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
                            BiblioTech
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {t('auth.register_tagline')}
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-[#121217] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8">
                        {errorMsg && (
                            <div className="auth-error mb-5">
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Google Sign Up Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading || loading}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                            </svg>
                            {googleLoading ? t('auth.signing_in') : t('auth.sign_up_google')}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                                {t('auth.or_continue')}
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Email/Password form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label" htmlFor="displayName">
                                    {t('auth.name')}
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        id="displayName"
                                        type="text"
                                        className="input pl-10"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder={t('auth.name_placeholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label" htmlFor="email">
                                    {t('auth.email')}
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        id="email"
                                        type="email"
                                        className="input pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('auth.email_placeholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label" htmlFor="password">
                                    {t('auth.password')}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input pl-10 pr-12"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('auth.password_min_hint')}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label" htmlFor="confirmPassword">
                                    {t('auth.confirm_password')}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        className="input pl-10"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={t('auth.confirm_password_placeholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full py-3 text-base"
                                disabled={loading || googleLoading}
                            >
                                {loading ? t('auth.creating_account') : t('auth.create_account')}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        {t('auth.have_account')}{' '}
                        <Link to="/login" className="auth-link">
                            {t('auth.sign_in')}
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default RegisterPage;
