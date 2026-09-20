'use client';

import React from 'react';
import { Search, HardHat, Wrench, Truck, Briefcase, BookUser } from 'lucide-react';

export default function DirectoryPage() {
  const categories = [
    { name: 'Engineers', icon: HardHat, desc: 'Structural, MEP, Civil partners' },
    { name: 'Suppliers', icon: Truck, desc: 'Materials, finishes, fixtures' },
    { name: 'Contractors', icon: Wrench, desc: 'General & specialized trades' },
    { name: 'Allied Services', icon: Briefcase, desc: 'Consultants, legal, permits' },
  ];

  return (
    <div className="space-y-6 font-mono pb-12">
      <div className="border-b border-border-main pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-text-main flex items-center gap-3">
          <BookUser className="w-6 h-6 text-accent-cyan" />
          SPECIALTY DIRECTORY
        </h1>
        <p className="text-xs text-muted-main uppercase tracking-widest mt-1">
          FIND CONSULTANTS, ENGINEERS, SUPPLIERS, AND SITE BUILDERS
        </p>
      </div>

      <div className="relative mb-6 max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-main" />
        <input 
          type="text" 
          placeholder="SEARCH DIRECTORY..." 
          className="w-full bg-surface-main border border-border-main rounded-xl py-3 pl-11 pr-4 font-mono text-xs uppercase text-text-main focus:outline-none focus:border-accent-cyan shadow-sm transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, i) => (
          <div key={i} className="bg-surface-main border border-border-main rounded-xl p-6 hover:border-text-main transition-all cursor-pointer flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center border border-border-main">
              <cat.icon className="w-7 h-7 text-accent-cyan" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-main">{cat.name}</h3>
              <p className="text-xs font-sans text-muted-main">{cat.desc}</p>
            </div>
            <div className="pt-4 mt-auto border-t border-border-main w-full">
              <span className="text-xs font-bold font-mono text-muted-main uppercase">0 ENTRIES</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
