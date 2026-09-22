'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/themeContext';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 120 }: LogoProps) {
  const [mounted, setMounted] = useState(false);
  let themeMode = 'light';

  try {
    const themeCtx = useTheme();
    themeMode = themeCtx.themeMode;
  } catch {
    // Fallback if rendered outside ThemeProvider
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use black logo for Light Mode (maximum contrast on light backgrounds), white logo for Dark Mode
  const isDark = mounted && (themeMode === 'dark' || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')));
  const logoSrc = isDark ? '/logo-white.png' : '/logo-black.png';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="Estudio Arkipelago Logo"
        style={{ width: size, height: 'auto' }}
        className="object-contain transition-all hover:opacity-90"
      />
    </div>
  );
}

export default Logo;
