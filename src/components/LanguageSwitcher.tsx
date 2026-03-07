import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const languages = [
    { code: 'es', name: 'Español' },
    { code: 'ca', name: 'Català' },
    { code: 'gl', name: 'Galego' },
    { code: 'eu', name: 'Euskara' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
];

const LanguageSwitcher: React.FC<{ variant?: 'minimal' | 'full' }> = ({ variant = 'full' }) => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    if (variant === 'minimal') {
        return (
            <div className="relative group">
                <button className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    <FiGlobe size={20} />
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${i18n.language === lang.code ? 'text-blue-600 font-bold' : 'text-gray-700 dark:text-gray-200'
                                }`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2 p-2">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${i18n.language === lang.code
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
