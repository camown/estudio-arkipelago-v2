'use client';

import React, { useState } from 'react';
import { Search, HardHat, Wrench, Truck, Briefcase, Plus, X, Phone, Mail as MailIcon, MapPin } from 'lucide-react';

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
    { id: 'Engineers', name: 'Engineers', icon: HardHat },
    { id: 'Suppliers', name: 'Suppliers', icon: Truck },
    { id: 'Contractors', name: 'Contractors', icon: Wrench },
    { id: 'Allied Services', name: 'Allied Services', icon: Briefcase },
  ];

  const handleAddEntry = () => {
    if (!name.trim()) {
      alert('Company / supplier name is required.');
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
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-main pb-4 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main flex items-center gap-3">
            Specialty Directory
          </h1>
          <p className="text-xs text-muted-main mt-1">
            Find and manage engineering consultants, material suppliers, and specialized contractors.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-semibold text-xs tracking-wide flex items-center gap-2 rounded-lg shadow-sm hover:opacity-90 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Directory</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-main" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company name, contact, or specialty..."
          className="w-full bg-surface-main border border-border-main rounded-xl py-3 pl-11 pr-4 font-mono text-xs text-text-main focus:outline-none focus:border-text-main shadow-xs transition-colors placeholder:text-muted-main/60"
        />
      </div>

      {/* Categories Tab Bar */}
      <div className="flex border-b border-border-main overflow-x-auto pb-1 gap-2 sm:gap-6">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeCategory === 'ALL'
              ? 'border-text-main text-text-main font-bold'
              : 'border-transparent text-muted-main hover:text-text-main'
          }`}
        >
          All Categories ({entries.length})
        </button>
        {categories.map((cat) => {
          const count = entries.filter((e) => e.category === cat.id).length;
          const isSelected = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'border-text-main text-text-main font-bold'
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-hover border border-border-main text-muted-main">
                    {entry.category}
                  </span>
                  <h3 className="font-bold text-sm text-text-main mt-1.5">
                    {entry.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-main border-t border-border-main/40 pt-3">
                {entry.contactPerson && (
                  <div className="font-semibold text-text-main">
                    Contact: {entry.contactPerson}
                  </div>
                )}
                {entry.phone && (
                  <a
                    href={`tel:${entry.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-2 hover:text-accent-cyan transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{entry.phone}</span>
                  </a>
                )}
                {entry.email && (
                  <a
                    href={`mailto:${entry.email}`}
                    className="flex items-center gap-2 hover:text-accent-cyan transition-colors"
                  >
                    <MailIcon className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>{entry.email}</span>
                  </a>
                )}
                {entry.location && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(entry.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 hover:text-accent-cyan transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{entry.location}</span>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-border-main rounded-xl">
            <p className="text-xs text-muted-main italic">
              No directory entries found for selected category.
            </p>
          </div>
        )}
      </div>

      {/* Add Directory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 font-mono">
          <div className="bg-surface-main border border-border-main w-full max-w-lg rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 text-text-main">
            <div className="flex items-center justify-between border-b border-border-main pb-3">
              <h3 className="text-sm font-bold text-text-main">
                Add Partner or Supplier to Directory
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-muted-main hover:text-text-main cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-muted-main mb-1">
                  Company / Consultant Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Glass and Metal Specialists"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-main mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-hover border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:outline-none focus:border-text-main"
                >
                  <option value="Engineers">Engineers</option>
                  <option value="Suppliers">Suppliers</option>
                  <option value="Contractors">Contractors</option>
                  <option value="Allied Services">Allied Services</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-main mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Juan Perez"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-main mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+63 917 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-main mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="contact@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-main mb-1">
                    Location / Office Address
                  </label>
                  <input
                    type="text"
                    placeholder="Makati City"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-surface-hover border border-border-main rounded-xl px-3.5 py-2.5 text-xs font-mono text-text-main focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-main">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border-main text-xs font-semibold hover:bg-surface-hover transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-5 py-2 bg-black text-white dark:bg-white dark:text-black rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
