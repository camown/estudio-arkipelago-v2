'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { PRESET_ACCOUNTS } from '@/lib/constants';
import { Shield, Users, User as UserIcon, Wrench } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  partner: Shield,
  senior_architect: Users,
  junior_architect: UserIcon,
  contractor: Wrench,
};

const ROLE_BORDER_COLORS: Record<string, string> = {
  partner: 'border-l-accent-cyan',
  senior_architect: 'border-l-amber-500',
  junior_architect: 'border-l-text-main',
  contractor: 'border-l-accent-red',
};

const BADGE_COLORS: Record<string, string> = {
  ADMIN: 'bg-accent-cyan text-black font-bold',
  LEAD: 'bg-amber-500 text-black font-bold',
  STAFF: 'bg-surface-hover text-text-main font-bold border border-border-main',
  EXTERNAL: 'bg-accent-red text-white font-bold',
};

function formatRole(role: string): string {
  return role.replace(/_/g, ' ').toUpperCase();
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = async (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('admin');
    setError('');
    setLoading(true);

    try {
      const result = await login(presetEmail, 'admin');
      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-surface-main border border-border-main p-6 sm:p-10 font-mono text-text-main rounded-2xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <Logo size={48} className="text-text-main" />
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.2em] text-text-main uppercase">
          ESTUDIO ARKIPELAGO
        </h1>
        <p className="text-xs text-muted-main tracking-[0.25em] uppercase font-bold">
          OPERATIONS SYSTEM ACCESS
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-border-main my-4 w-full" />

      {/* Preset Accounts Section */}
      <div>
        <h2 className="text-xs font-bold tracking-wider text-muted-main uppercase mb-3">
          SELECT ACCESS LEVEL (1-CLICK DEMO LOGIN)
        </h2>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_ACCOUNTS.map((account) => {
            const Icon = ROLE_ICONS[account.role] || UserIcon;
            const borderClass = ROLE_BORDER_COLORS[account.role] || 'border-l-text-main';
            const badgeClass = BADGE_COLORS[account.accessLevel] || 'bg-surface-hover text-text-main';

            return (
              <button
                key={account.email}
                type="button"
                onClick={() => handlePresetClick(account.email)}
                disabled={loading}
                className={`group text-left p-4 bg-surface-hover/50 border border-border-main border-l-4 ${borderClass} hover:border-text-main hover:bg-surface-hover transition-all rounded-xl cursor-pointer flex flex-col justify-between disabled:opacity-50 disabled:cursor-not-allowed shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0 text-text-main" />
                      <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                        {formatRole(account.role)}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 uppercase tracking-wider rounded ${badgeClass}`}>
                      {account.accessLevel}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-text-main mb-1">
                    {account.name}
                  </div>

                  <p className="text-[11px] text-muted-main leading-relaxed">
                    {account.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border-main/50 flex items-center justify-between text-[10px]">
                  <span className="text-muted-main truncate max-w-[160px]">
                    {account.email}
                  </span>
                  <span className="text-accent-cyan uppercase tracking-wider font-bold group-hover:translate-x-0.5 transition-transform">
                    LOGIN &rarr;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-main" />
        </div>
        <div className="relative bg-surface-main px-4 text-xs font-bold tracking-wider text-muted-main uppercase">
          OR SIGN IN MANUALLY
        </div>
      </div>

      {/* Manual Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block uppercase text-xs tracking-wider text-muted-main font-bold mb-1.5 select-none"
          >
            Email Identifier
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@arkipelago.studio"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            required
            disabled={loading}
            autoComplete="email"
            className="bg-surface-hover border border-border-main text-text-main font-mono px-4 py-3 w-full rounded-xl focus:border-accent-cyan focus:outline-none placeholder:text-muted-main text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block uppercase text-xs tracking-wider text-muted-main font-bold mb-1.5 select-none"
          >
            Password / Access Key
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            required
            disabled={loading}
            autoComplete="current-password"
            className="bg-surface-hover border border-border-main text-text-main font-mono px-4 py-3 w-full rounded-xl focus:border-accent-cyan focus:outline-none placeholder:text-muted-main text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="border border-accent-red bg-accent-red/10 p-3 rounded-lg text-xs text-accent-red tracking-wider uppercase font-bold flex items-center gap-2"
          >
            <span className="shrink-0">[ERROR]</span>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white dark:bg-white dark:text-black font-extrabold uppercase text-xs tracking-widest py-3.5 rounded-xl hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md"
        >
          {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
        </button>

        <p className="text-center text-xs text-muted-main tracking-wider pt-1">
          Password for all accounts:{' '}
          <span className="text-accent-cyan font-bold">admin</span>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
