'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Global Root Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex items-center justify-center p-6 font-mono selection:bg-accent-cyan selection:text-black">
      <div className="max-w-md w-full bg-surface-main border border-border-main rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-red/10 border border-accent-red/30 text-accent-red flex items-center justify-center mx-auto">
          <AlertOctagon className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-accent-red bg-accent-red/10 px-3 py-1 rounded-full border border-accent-red/20">
            APPLICATION_ERROR_SHIELD
          </span>
          <h1 className="text-xl font-bold uppercase tracking-wider text-text-main font-display">
            Studio Session Exception
          </h1>
          <p className="text-xs text-muted-main leading-relaxed">
            An unexpected error occurred during rendering. The application protected your session state to prevent corruption.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-surface-hover border border-border-main rounded-xl text-[11px] text-accent-red font-mono text-left max-h-28 overflow-y-auto break-all">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 bg-text-main text-bg-main font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="py-3 px-5 border border-border-main text-muted-main hover:text-text-main font-bold text-xs uppercase rounded-xl hover:bg-surface-hover transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
