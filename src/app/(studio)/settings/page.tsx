'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/themeContext';
import { User, Phone, Mail, Camera, RefreshCw, Save, Check, Calendar, ExternalLink, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    themeMode,
    customColors,
    setCustomColors,
    resetToDefaults,
  } = useTheme();

  const [displayName, setDisplayName] = useState(() => user?.name || 'Testing User');
  const [phoneNumber, setPhoneNumber] = useState('09173333333');
  const emailAddress = user?.email || 'partner@estudioarkipelago.com';
  const [bgColor, setBgColor] = useState(() => customColors.bgColor);
  const [textColor, setTextColor] = useState(() => customColors.textColor);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGoogleSynced, setIsGoogleSynced] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(() => user?.email || 'partner@arkipelago.com');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('arkipelago_user_avatar');
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setAvatarUrl(result);
      localStorage.setItem('arkipelago_user_avatar', result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = { ...user, name: displayName };
      localStorage.setItem('arkipelago_user', JSON.stringify(updatedUser));
    }
    
    setCustomColors({ bgColor, textColor });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSyncGoogleCalendar = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/calendar/sync');
      const data = await res.json();
      if (data.success) {
        setIsGoogleSynced(true);
        if (data.account) {
          setConnectedAccount(data.account);
        }
        setSyncNotice('✓ Gmail & Google Calendar synchronized successfully!');
        setTimeout(() => setSyncNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to sync Google Calendar:', err);
      setSyncNotice('⚠️ Could not sync with Gmail account');
      setTimeout(() => setSyncNotice(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectGmail = () => {
    router.push('/api/auth/google/login');
  };

  const handleDisconnectGmail = () => {
    setIsGoogleSynced(false);
    setSyncNotice('✓ Disconnected Gmail account');
    setTimeout(() => setSyncNotice(null), 4000);
  };

  const handleResetColors = () => {
    resetToDefaults();
    if (themeMode === 'light') {
      setBgColor('#F4F4F5');
      setTextColor('#18181B');
    } else {
      setBgColor('#0A0A0A');
      setTextColor('#FAFAFA');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Header */}
      <div className="border-b border-border-main/50 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-main font-sans">Settings</h1>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-surface-hover text-muted-main border border-border-main hidden sm:inline-block">
            Preferences
          </span>
        </div>
        <p className="text-xs text-muted-main mt-1 font-sans">
          Manage your personal profile, calendar integrations, and studio theme preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Picture */}
        <div className="bg-surface-main p-6 rounded-2xl border border-border-main space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-surface-hover border border-border-main flex items-center justify-center text-muted-main relative overflow-hidden group cursor-pointer shadow-xs"
              title="Click to change photo"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-muted-main" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-text-main">
                Profile Photo
              </h3>
              <p className="text-[11px] text-muted-main max-w-sm">
                Upload a portrait or studio avatar. PNG, JPEG, or WebP up to 2MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border-main hover:border-text-main transition-all bg-surface-main text-text-main active:scale-[0.98] cursor-pointer shadow-2xs"
              >
                Upload Photo
              </button>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-surface-main p-6 rounded-2xl border border-border-main space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-text-main pb-2 border-b border-border-main/50">
            Account Information
          </h3>

          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-main flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-surface-hover/70 border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:border-text-main focus:outline-none transition-colors"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-main flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-surface-hover/70 border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:border-text-main focus:outline-none transition-colors"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-main flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              Email Address (Read-only)
            </label>
            <input
              type="text"
              value={emailAddress}
              readOnly
              className="w-full bg-surface-hover/40 border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-muted-main cursor-not-allowed"
            />
          </div>
        </div>

        {/* Calendar & Gmail Integration */}
        <div className="bg-surface-main p-6 rounded-2xl border border-border-main space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
            <div>
              <h3 className="text-xs font-bold text-text-main flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-cyan" />
                Calendar & Gmail Integration
              </h3>
              <p className="text-[11px] text-muted-main mt-0.5">
                Sync your Gmail account and Google Calendar with studio schedules.
              </p>
            </div>
            <Link
              href="/calendar"
              className="text-xs font-semibold text-accent-cyan hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface-hover/50 border border-border-main space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('w-2.5 h-2.5 rounded-full', isGoogleSynced ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-amber-600 dark:bg-amber-500')} />
                <span className="font-bold text-xs text-text-main">Sync Your Gmail Account (Google Calendar)</span>
              </div>
              <span className={cn('text-[11px] font-mono font-semibold', isGoogleSynced ? 'text-text-main' : 'text-amber-600 dark:text-amber-400')}>
                {isGoogleSynced ? 'Connected & Active' : 'Ready to Sync'}
              </span>
            </div>

            <p className="text-[11px] text-muted-main">
              {isGoogleSynced
                ? `Synchronized with ${connectedAccount}. Client consultations, site inspections, and Google Meet invites are automatically updated.`
                : 'Connect your Gmail account to automatically synchronize studio calendar events, meetings, and consultations.'}
            </p>

            {syncNotice && (
              <div className="text-xs font-semibold text-accent-cyan bg-accent-cyan/10 px-3 py-1.5 rounded-lg border border-accent-cyan/30">
                {syncNotice}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSyncGoogleCalendar}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
              <button
                type="button"
                onClick={handleConnectGmail}
                className="px-3.5 py-1.5 rounded-lg border border-border-main hover:border-text-main bg-surface-main text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
              >
                {isGoogleSynced ? 'Change Gmail Account' : 'Connect Gmail Account'}
              </button>
              {isGoogleSynced && (
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="px-3 py-1.5 text-xs text-muted-main hover:text-rose-500 font-semibold transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* UI Customization */}
        <div className="bg-surface-main p-6 rounded-2xl border border-border-main space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border-main/50">
            <div>
              <h3 className="text-xs font-bold text-text-main">
                Theme Customization
              </h3>
              <p className="text-[11px] text-muted-main mt-0.5">
                Adjust background and element colors for your personal session.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetColors}
              className="text-xs font-semibold text-muted-main hover:text-text-main transition-colors flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Background Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-main">
                Background
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-border-main bg-transparent p-0 shrink-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-surface-hover/70 border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                />
              </div>
            </div>

            {/* Text & Elements Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-main">
                Text & Elements
              </label>
              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border border-border-main bg-transparent p-0 shrink-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full bg-surface-hover/70 border border-border-main rounded-xl px-3 py-2 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button & Feedback */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-2 border border-emerald-500/30 rounded-xl">
              <Check className="w-4 h-4" />
              <span>Preferences saved</span>
            </div>
          ) : <div />}

          <button
            type="submit"
            className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2 ml-auto shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
