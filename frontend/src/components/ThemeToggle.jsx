import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 active:scale-90 flex items-center justify-center group"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5 overflow-hidden">
                <div className={`absolute inset-0 transition-transform duration-500 transform ${theme === 'light' ? 'translate-y-0' : '-translate-y-8'}`}>
                    <Sun size={20} className="text-amber-500" />
                </div>
                <div className={`absolute inset-0 transition-transform duration-500 transform ${theme === 'dark' ? 'translate-y-0' : 'translate-y-8'}`}>
                    <Moon size={20} className="text-blue-400 fill-blue-400" />
                </div>
            </div>
        </button>
    );
};

export default ThemeToggle;
