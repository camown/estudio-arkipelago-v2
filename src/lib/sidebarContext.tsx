'use client';

import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (collapsed: boolean) => void;
}

const defaultSidebarContext: SidebarContextType = {
  isCollapsed: false,
  toggleSidebar: () => {},
  setIsCollapsed: () => {},
};

const SidebarContext = createContext<SidebarContextType>(defaultSidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('arkipelago_sidebar_collapsed');
        return saved === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('arkipelago_sidebar_collapsed', String(next));
      } catch {
        // Ignore localStorage error
      }
      return next;
    });
  };

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('arkipelago_sidebar_collapsed', String(collapsed));
    } catch {
      // Ignore localStorage error
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setIsCollapsed: handleSetCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
