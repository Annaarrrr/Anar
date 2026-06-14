import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, Theme } from '../types';
import { StringSet, strings } from '../i18n/strings';
import { Colors, lightColors, darkColors } from '../theme/colors';

interface AppContextValue {
  language:    Language;
  theme:       Theme;
  colors:      Colors;
  t:           StringSet;
  isRTL:       boolean;
  setLanguage: (lang: Language) => Promise<void>;
  setTheme:    (theme: Theme)   => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [theme,    setThemeState]    = useState<Theme>('light');
  const [loaded,   setLoaded]        = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [savedLang, savedTheme] = await Promise.all([
          AsyncStorage.getItem('anar_language'),
          AsyncStorage.getItem('anar_theme'),
        ]);
        if (savedLang === 'ar' || savedLang === 'en') setLanguageState(savedLang);
        if (savedTheme === 'light' || savedTheme === 'dark') setThemeState(savedTheme);
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('anar_language', lang);
  }, []);

  const setTheme = useCallback(async (th: Theme) => {
    setThemeState(th);
    await AsyncStorage.setItem('anar_theme', th);
  }, []);

  const colors = useMemo(
    () => (theme === 'dark' ? darkColors : lightColors),
    [theme]
  );

  const t = useMemo(() => strings[language], [language]);

  const value = useMemo<AppContextValue>(
    () => ({ language, theme, colors, t, isRTL: language === 'ar', setLanguage, setTheme }),
    [language, theme, colors, t, setLanguage, setTheme]
  );

  // Don't render until preferences are loaded so there's no flash
  if (!loaded) return null;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppSettings(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppProvider');
  return ctx;
}
