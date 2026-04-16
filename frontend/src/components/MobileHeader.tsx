import React from 'react';
import { Menu, Dumbbell } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  setMenuMobileOpen: (open: boolean) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, setMenuMobileOpen }) => (
  <div className="lg:hidden bg-black border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30 print:hidden">
    <div className="flex items-center gap-3">
      <img src="/power.png" alt="Logo" className="w-8 h-8 object-contain" />
      <h1 className="font-bold text-white truncate uppercase tracking-tighter italic">{title}</h1>
    </div>
    <button onClick={() => setMenuMobileOpen(true)} className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
      <Menu size={24} />
    </button>
  </div>
);
