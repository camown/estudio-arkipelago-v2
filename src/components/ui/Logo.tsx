import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
}

export function Logo({ className = '', showText = false, size = 48 }: LogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-current transition-colors"
      >
        {/* Topmost organic wireframe loop */}
        <path
          d="M 50 15 C 55 25, 62 42, 67 58 C 55 64, 40 68, 32 60 C 35 45, 43 28, 50 15 Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Middle overlapping wireframe loop */}
        <path
          d="M 45 28 C 53 38, 65 52, 69 68 C 52 75, 35 77, 30 65 C 33 50, 40 38, 45 28 Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom base overlapping loop */}
        <path
          d="M 38 48 C 52 50, 68 58, 70 72 C 55 82, 38 82, 32 74 C 30 64, 34 54, 38 48 Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <div className="mt-2 text-center tracking-[0.25em] font-light uppercase">
          <div className="text-xs font-semibold">ESTUDIO</div>
          <div className="text-sm font-bold tracking-[0.3em]">ARKIPELAGO</div>
        </div>
      )}
    </div>
  );
}

export default Logo;
