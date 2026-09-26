import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
    theme: 'system',
    effectiveTheme: 'dark',
    setTheme: () => {}
});

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem('maintenops_theme') || 'system';
    });

    const [effectiveTheme, setEffectiveTheme] = useState('dark');

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        localStorage.setItem('maintenops_theme', newTheme);
    };

    useEffect(() => {
        const root = document.documentElement;
        
        const applyTheme = () => {
            let isDark = false;
            if (theme === 'system') {
                isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            } else {
                isDark = theme === 'dark';
            }

            if (isDark) {
                root.classList.add('dark');
                root.setAttribute('data-theme', 'dark');
                setEffectiveTheme('dark');
            } else {
                root.classList.remove('dark');
                root.setAttribute('data-theme', 'light');
                setEffectiveTheme('light');
            }
        };

        applyTheme();

        // Listen for OS system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
