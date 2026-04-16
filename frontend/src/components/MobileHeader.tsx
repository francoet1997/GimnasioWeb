import React from 'react';
import { Menu, Dumbbell } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  setMenuMobileOpen: (open: boolean) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, setMenuMobileOpen }) => (
  <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 print:hidden">
    <div className="flex items-center gap-3">
      <div className="bg-indigo-500 p-1.5 rounded-lg text-white"><Dumbbell size={18} /></div>
      <h1 className="font-bold text-slate-800 truncate">{title}</h1>
    </div>
    <button onClick={() => setMenuMobileOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
      <Menu size={24} />
    </button>
  </div>
);
