import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 120 }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Light Mode Logo (Pristine Dark Black Logo on Light Gray/White Background) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-black.png"
        alt="Estudio Arkipelago Logo"
        style={{ width: size, height: 'auto' }}
        className="object-contain block dark:hidden transition-all hover:opacity-90"
      />

      {/* Dark Mode Logo (Pristine Crisp White Logo on Dark Background) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-white.png"
        alt="Estudio Arkipelago Logo"
        style={{ width: size, height: 'auto' }}
        className="object-contain hidden dark:block transition-all hover:opacity-90"
      />
    </div>
  );
}

export default Logo;
