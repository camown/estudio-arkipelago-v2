import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-[#18181B] border border-[#27272A] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#0284C7]/10 border border-[#0284C7]/30 text-[#0284C7] flex items-center justify-center mx-auto animate-pulse">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#0284C7] bg-[#0284C7]/10 px-3 py-1 rounded-full border border-[#0284C7]/20">
            ERR_404_PAGE_NOT_FOUND
          </span>
          <h1 className="text-xl font-black uppercase tracking-wider text-[#FAFAFA]">
            Blueprint Route Missing
          </h1>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            The studio page or project view you are looking for has been moved, renamed, or does not exist in the active catalog.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-3 bg-white text-black font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Studio Home
          </Link>
        </div>
      </div>
    </div>
  );
}
