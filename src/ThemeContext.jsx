import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => { }
});

const ThemeProvider = (props) => {
  const children = props.children;
  const [theme, setTheme] = useState(() => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('[ThemeContext] Initial theme:', isDark ? 'dark' : 'light');
    return isDark ? 'dark' : 'light';
  });

  useEffect(() => {
    console.log('[ThemeContext] Setting data-theme to:', theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    console.log('[ThemeContext] data-theme is now:', root.getAttribute('data-theme'));

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      console.log('[ThemeContext] System theme changed to:', newTheme);
      setTheme(newTheme);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext) || { theme: 'light', setTheme: () => { } };
  return ctx;
}

export default ThemeContext;
