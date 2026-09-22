'use client';

import React, { useState } from 'react';
import { Search, HardHat, Wrench, Truck, Briefcase, BookUser, Plus, X, Phone, Mail as MailIcon, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface DirectoryEntry {
  id: string;
  name: string;
  category: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  location?: string;
}

export default function DirectoryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Custom entries state
  const [entries, setEntries] = useState<DirectoryEntry[]>([
    {
      id: '1',
      name: 'AMJ Structural Engineering',
      category: 'Engineers',
      contactPerson: 'Engr. Aris Mendoza',
      phone: '+63 917 555 0192',
      email: 'contact@amjstructural.com',
      location: 'Makati City',
    },
    {
      id: '2',
      name: 'Pacific Glass & Aluminum Tech',
      category: 'Suppliers',
      contactPerson: 'Luis Tan',
      phone: '+63 918 222 4910',
      email: 'sales@pacificglass.ph',
      location: 'Pasig City',
    },
    {
      id: '3',
      name: 'BuildCore General Contractors',
      category: 'Contractors',
      contactPerson: 'Engr. Ramon Santos',
      phone: '+63 920 888 1234',
      email: 'info@buildcore.com.ph',
      location: 'Taguig City',
    },
    {
      id: '4',
      name: 'Metro Environmental Legal & Permits',
      category: 'Allied Services',
      contactPerson: 'Atty. Clara Reyes',
      phone: '+63 917 111 8899',
      email: 'legal@metropermits.ph',
      location: 'Quezon City',
    },
  ]);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Engineers');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  const categories = [
    { id: 'Engineers', name: 'ENGINEERS', icon: HardHat },
    { id: 'Suppliers', name: 'SUPPLIERS', icon: Truck },
    { id: 'Contractors', name: 'CONTRACTORS', icon: Wrench },
    { id: 'Allied Services', name: 'ALLIED SERVICES', icon: Briefcase },
  ];

  const handleAddEntry = () => {
    if (!name.trim()) {
      alert('COMPANY / SUPPLIER NAME IS REQUIRED.');
      return;
    }
    const newEntry: DirectoryEntry = {
      id: 'dir-' + Date.now(),
      name: name.trim(),
      category,
      contactPerson,
      phone,
      email,
      location,
    };
    setEntries([newEntry, ...entries]);
    setIsAddModalOpen(false);

    // Reset Form
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setLocation('');
  };

  const filteredEntries = entries.filter((item) => {
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.contactPerson && item.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 font-mono pb-12">
      {/* Header Bar matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-text-main flex items-center gap-3">
            DIRECTORY LIST
          </h1>
          <p className="text-xs text-muted-main uppercase tracking-widest mt-1">
            COMPREHENSIVE SERVICE DATABASE
          </p>
        </div>

        {/* Action Button: + ADD TO DIRECTORY (Matching Screenshot 2) */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black font-extrabold text-xs uppercase tracking-widest flex items-center gap-2 rounded-lg shadow-sm hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD TO DIRECTORY</span>
        </button>
      </div>

      {/* Search Input Bar (Matching Screenshot 2) */}
      <div className="relative max-w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-main" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or category..."
          className="w-full bg-surface-main border border-border-main rounded-xl py-3.5 pl-11 pr-4 font-mono text-xs text-text-main focus:outline-none focus:border-text-main shadow-xs transition-colors"
        />
      </div>

      {/* Categories Tab Bar matching Screenshot 2 */}
      <div className="flex border-b border-border-main overflow-x-auto pb-1 gap-2 sm:gap-6">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeCategory === 'ALL'
              ? 'border-text-main text-text-main'
              : 'border-transparent text-muted-main hover:text-text-main'
          }`}
        >
          ALL CATEGORIES ({entries.length})
        </button>
        {categories.map((cat) => {
          const count = entries.filter((e) => e.category === cat.id).length;
          const isSelected = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'border-text-main text-text-main'
                  : 'border-transparent text-muted-main hover:text-text-main'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Directory Entries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface-main border border-border-main rounded-xl p-5 hover:border-text-main transition-all space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-surface-hover border border-border-main text-muted-main">
                    {entry.category}
                  </span>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-text-main mt-1.5">
                    {entry.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-main border-t border-border-main/40 pt-3">
                {entry.contactPerson && (
                  <div className="font-bold text-text-main uppercase">
                    CONTACT: {entry.contactPerson}
                  </div>
                )}
                {entry.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{entry.phone}</span>
                  </div>
                )}
                {entry.email && (
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-3.5 h-3.5" />
                    <span>{entry.email}</span>
                  </div>
                )}
                {entry.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{entry.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-border-main rounded-xl">
            <p className="text-xs text-muted-main uppercase tracking-wider italic">
              NO DIRECTORY ENTRIES FOUND FOR SELECTED CATEGORY.
            </p>
          </div>
        )}
      </div>

      {/* Add Directory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-[#262626] border border-[#3F3F46] w-full max-w-lg rounded-2xl shadow-2xl p-7 space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#3F3F46] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#E4E4E7]">
                ADD TO DIRECTORY
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  NAME / COMPANY *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.G. STRUCTURAL SOLUTIONS INC."
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase"
                >
                  <option value="Engineers">ENGINEERS</option>
                  <option value="Suppliers">SUPPLIERS</option>
                  <option value="Contractors">CONTRACTORS</option>
                  <option value="Allied Services">ALLIED SERVICES</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                  CONTACT PERSON
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="E.G. ENGR. JUAN DELA CRUZ"
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">PHONE</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 900 000 0000"
                    className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none placeholder-[#52525B]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@domain.com"
                    className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none placeholder-[#52525B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider block mb-1">LOCATION</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.G. MAKATI CITY"
                  className="w-full bg-[#18181B] border border-[#3F3F46] focus:border-[#0284C7] p-3 text-xs font-mono text-[#FAFAFA] rounded-xl focus:outline-none uppercase placeholder-[#52525B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddEntry}
                className="py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-md"
              >
                SAVE ENTRY
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="py-3 bg-[#3F3F46]/60 border border-[#52525B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-[#3F3F46] transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
