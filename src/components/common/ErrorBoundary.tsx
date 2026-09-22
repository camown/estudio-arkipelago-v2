'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Studio OS Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 font-mono text-text-main">
          <div className="max-w-md w-full bg-surface-main border border-border-main rounded-2xl p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-accent-red/10 border border-accent-red/30 text-accent-red flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wider text-text-main">
                Studio Component Exception
              </h2>
              <p className="text-xs text-muted-main">
                Something encountered an unexpected state in this workspace section.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-surface-hover/80 border border-border-main rounded-xl text-[11px] text-accent-red font-mono text-left overflow-x-auto break-all">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Studio
              </button>
              <Link
                href="/dashboard"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="py-2.5 px-4 border border-border-main text-muted-main hover:text-text-main font-bold text-xs uppercase rounded-xl hover:bg-surface-hover transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
