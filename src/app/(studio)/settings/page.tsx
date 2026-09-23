'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTheme } from '@/lib/themeContext';
import { User, Phone, Mail, Camera, RefreshCw, Save, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const {
    themeMode,
    customColors,
    setCustomColors,
    resetToDefaults,
  } = useTheme();

  const [displayName, setDisplayName] = useState(() => user?.name || 'TESTING3');
  const [phoneNumber, setPhoneNumber] = useState('09173333333');
  const emailAddress = user?.email ? user.email.toUpperCase() : 'TESTING3@ESTUDIOARKIPELAGO.COM';
  const [bgColor, setBgColor] = useState(() => customColors.bgColor);
  const [textColor, setTextColor] = useState(() => customColors.textColor);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    // Update stored user profile in localStorage
    if (user) {
      const updatedUser = { ...user, name: displayName };
      localStorage.setItem('arkipelago_user', JSON.stringify(updatedUser));
    }
    
    // Apply UI customization colors
    setCustomColors({ bgColor, textColor });
    
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-mono">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">PROFILE SETTINGS</h1>
        <p className="text-xs text-muted-main uppercase tracking-widest mt-1">
          MANAGE YOUR PERSONAL STUDIO IDENTITY
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Picture */}
        <div className="bg-surface-main p-6 sm:p-8 rounded-xl border border-border-main space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-surface-hover border-2 border-border-strong flex items-center justify-center text-muted-main relative overflow-hidden group cursor-pointer"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-main">
                PROFILE PICTURE
              </h3>
              <p className="text-[11px] text-muted-main uppercase max-w-sm">
                UPLOAD A PERSONAL PHOTO OR STUDIO AVATAR. ACCEPTED FORMATS: PNG, JPEG. MAX SIZE: 1MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-bold uppercase border-2 border-border-strong hover:border-text-main transition-colors bg-surface-main"
              >
                CHANGE IMAGE
              </button>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="bg-surface-main p-6 sm:p-8 rounded-xl border border-border-main space-y-6 shadow-sm">
          {/* Display Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-main flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-surface-hover border-2 border-border-main px-4 py-3 text-sm uppercase font-mono focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-main flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              PHONE NUMBER
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-surface-hover border-2 border-border-main px-4 py-3 text-sm font-mono focus:border-accent-cyan focus:outline-none transition-colors"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-main flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" />
              EMAIL ADDRESS (READ ONLY)
            </label>
            <input
              type="text"
              value={emailAddress}
              readOnly
              className="w-full bg-surface-hover/60 border-2 border-border-main px-4 py-3 text-sm uppercase font-mono opacity-80 cursor-not-allowed"
            />
          </div>
        </div>

        {/* UI Customization Container (Darker Container matching Image 1) */}
        <div className="bg-slate-700/40 dark:bg-slate-800/60 p-6 sm:p-8 rounded-xl border-2 border-slate-600/50 space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              UI CUSTOMIZATION
            </h3>
            <p className="text-[11px] text-slate-300 uppercase mt-1">
              CHANGE BACKGROUND (ORIGINALLY WHITE) AND TEXT & ELEMENTS (ORIGINALLY BLACK) TO CUSTOM COLORS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Background Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                BACKGROUND COLOR (WHITE)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-2 border-white bg-transparent p-0"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-surface-hover border-2 border-slate-500 px-4 py-2.5 text-sm font-mono uppercase text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Text & Elements Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                TEXT & ELEMENTS COLOR (BLACK)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-2 border-white bg-transparent p-0"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full bg-surface-hover border-2 border-slate-500 px-4 py-2.5 text-sm font-mono uppercase text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleResetColors}
              className="text-xs font-bold uppercase text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              RESET COLORS TO STUDIO DEFAULTS
            </button>
          </div>
        </div>

        {/* Save Button & Feedback */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-600 bg-emerald-500/10 px-4 py-3 border border-emerald-500/30 rounded">
              <Check className="w-4 h-4" />
              PROFILE & UI PREFERENCES SAVED SUCCESSFULLY!
            </div>
          ) : <div />}

          <button
            type="submit"
            className="px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 ml-auto shadow-md"
          >
            <Save className="w-4 h-4" />
            SAVE PROFILE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
}
