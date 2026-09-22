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
  bgColor: '#EAEAEA', // Matching reference screenshot studio light gray
  textColor: '#18181B', // Dark crisp text
};

const DEFAULT_DARK_COLORS: UIColors = {
  bgColor: '#0A0A0A',
  textColor: '#FAFAFA',
};

const STORAGE_KEY = 'arkipelago_theme_prefs';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialThemePrefs() {
  if (typeof window === 'undefined') {
    return { themeMode: 'light' as ThemeMode, customColors: DEFAULT_LIGHT_COLORS, isCustomized: false };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        themeMode: (parsed.themeMode || 'light') as ThemeMode,
        customColors: parsed.customColors || DEFAULT_LIGHT_COLORS,
        isCustomized: Boolean(parsed.isCustomized),
      };
    }
  } catch (e) {
    console.error('Failed to load theme preferences:', e);
  }
  return { themeMode: 'light' as ThemeMode, customColors: DEFAULT_LIGHT_COLORS, isCustomized: false };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [initialPrefs] = useState(getInitialThemePrefs);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialPrefs.themeMode);
  const [customColors, setCustomColorsState] = useState<UIColors>(initialPrefs.customColors);
  const [isCustomized, setIsCustomized] = useState(initialPrefs.isCustomized);

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
