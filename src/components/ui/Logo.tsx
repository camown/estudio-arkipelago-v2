'use client';

import React from 'react';
import { useTheme } from '@/lib/themeContext';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 120 }: LogoProps) {
  let themeMode = 'dark';

  try {
    const themeCtx = useTheme();
    themeMode = themeCtx.themeMode;
  } catch {
    // Fallback if rendered outside ThemeProvider
  }

  // Use black logo for Light Mode (maximum contrast on light backgrounds), white logo for Dark Mode
  const logoSrc = themeMode === 'light' ? '/logo-black.png' : '/logo-white.png';

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={logoSrc}
        src={logoSrc}
        alt="Estudio Arkipelago Logo"
        style={{ width: size, height: 'auto' }}
        className="object-contain transition-all hover:opacity-90"
      />
    </div>
  );
}

export default Logo;
