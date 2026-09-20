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
        {/* Outer loop */}
        <path
          d="M50 12 C68 12, 85 45, 82 72 C79 90, 30 88, 20 75 C10 60, 32 12, 50 12 Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Middle loop */}
        <path
          d="M52 28 C64 28, 76 50, 72 70 C68 82, 38 80, 30 70 C22 58, 40 28, 52 28 Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner loop */}
        <path
          d="M53 45 C60 45, 68 56, 64 68 C60 75, 43 74, 38 68 C33 60, 46 45, 53 45 Z"
          stroke="currentColor"
          strokeWidth="2.5"
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
