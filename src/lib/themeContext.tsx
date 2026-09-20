'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface UIColors {
  bgColor: string;
  textColor: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  customColors: UIColors;
  setCustomColors: (colors: UIColors) => void;
  resetToDefaults: () => void;
  isCustomized: boolean;
}

const DEFAULT_LIGHT_COLORS: UIColors = {
  bgColor: '#F4F4F5', // Light clean studio background
  textColor: '#18181B', // Dark crisp text
};

const DEFAULT_DARK_COLORS: UIColors = {
  bgColor: '#0A0A0A',
  textColor: '#FAFAFA',
};

const STORAGE_KEY = 'arkipelago_theme_prefs';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [customColors, setCustomColorsState] = useState<UIColors>(DEFAULT_LIGHT_COLORS);
  const [isCustomized, setIsCustomized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.themeMode) setThemeModeState(parsed.themeMode);
        if (parsed.customColors) {
          setCustomColorsState(parsed.customColors);
          setIsCustomized(Boolean(parsed.isCustomized));
        }
      }
    } catch (e) {
      console.error('Failed to load theme preferences:', e);
    }
  }, []);

  // Update root element data attributes & CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeMode);
    
    if (themeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    if (isCustomized) {
      root.style.setProperty('--custom-bg', customColors.bgColor);
      root.style.setProperty('--custom-text', customColors.textColor);
    } else {
      root.style.removeProperty('--custom-bg');
      root.style.removeProperty('--custom-text');
    }
  }, [themeMode, customColors, isCustomized]);

  const savePrefs = (mode: ThemeMode, colors: UIColors, customized: boolean) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ themeMode: mode, customColors: colors, isCustomized: customized })
      );
    } catch (e) {
      console.error('Failed to save theme preferences:', e);
    }
  };

  const toggleThemeMode = () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    const nextColors = nextMode === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
    setThemeModeState(nextMode);
    if (!isCustomized) {
      setCustomColorsState(nextColors);
    }
    savePrefs(nextMode, isCustomized ? customColors : nextColors, isCustomized);
  };

  const setThemeMode = (mode: ThemeMode) => {
    const nextColors = mode === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
    setThemeModeState(mode);
    if (!isCustomized) {
      setCustomColorsState(nextColors);
    }
    savePrefs(mode, isCustomized ? customColors : nextColors, isCustomized);
  };

  const setCustomColors = (colors: UIColors) => {
    setCustomColorsState(colors);
    setIsCustomized(true);
    savePrefs(themeMode, colors, true);
  };

  const resetToDefaults = () => {
    const defaultColors = themeMode === 'light' ? DEFAULT_LIGHT_COLORS : DEFAULT_DARK_COLORS;
    setCustomColorsState(defaultColors);
    setIsCustomized(false);
    savePrefs(themeMode, defaultColors, false);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleThemeMode,
        setThemeMode,
        customColors,
        setCustomColors,
        resetToDefaults,
        isCustomized,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
