import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MOCK_PROJECTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { FolderKanban, Plus } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="space-y-6 font-mono pb-12">
      <div className="flex items-center justify-between border-b border-border-main pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-text-main flex items-center gap-3">
            <FolderKanban className="w-6 h-6 text-accent-cyan" />
            PROJECTS MANAGEMENT
          </h1>
          <p className="text-xs text-muted-main uppercase tracking-widest mt-1">
            EXPLORE STUDIO FOLDERS, BLUEPRINTS, SCHEMATICS, AND MATERIAL BOARDS
          </p>
        </div>
        <Button disabled variant="outline" className="rounded-lg border border-border-strong uppercase tracking-wider font-bold text-xs">
          <Plus className="w-4 h-4 mr-1" />
          NEW PROJECT
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_PROJECTS.map((project) => (
          <div 
            key={project.id} 
            className="flex flex-col md:flex-row md:items-center justify-between bg-surface-main border border-border-main rounded-xl p-5 hover:border-text-main transition-all gap-4 shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-surface-hover border border-border-main rounded text-xs font-bold text-text-main font-mono">
                {project.code}
              </span>
              <div>
                <h3 className="text-sm font-bold uppercase text-text-main tracking-wider">{project.name}</h3>
                <p className="text-xs text-muted-main font-sans mt-0.5">{project.clientName}</p>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                "rounded font-mono uppercase text-xs px-3 py-1 font-bold border",
                project.status === 'active' ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" :
                project.status === 'on-hold' ? "border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10" :
                "border-slate-500/50 text-slate-500 bg-slate-500/10"
              )}
            >
              {project.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
