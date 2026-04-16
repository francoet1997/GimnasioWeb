import React from 'react';
import { User, FileText, Settings, Dumbbell, X } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  menuMobileOpen: boolean;
  setMenuMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, menuMobileOpen, setMenuMobileOpen }) => (
  <>
    {/* Overlay para móvil */}
    {menuMobileOpen && (
      <div 
        className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
        onClick={() => setMenuMobileOpen(false)}
      />
    )}
    
    <aside className={`w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col p-6 z-50 transition-transform duration-300 lg:translate-x-0 ${menuMobileOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden`}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg"><Dumbbell size={24} /></div>
          <h1 className="text-xl font-bold tracking-tight">Gimnasio<span className="text-indigo-400">Web</span></h1>
        </div>
        <button onClick={() => setMenuMobileOpen(false)} className="lg:hidden text-slate-400">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 space-y-2">
        <button 
          onClick={() => setView('list')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${view === 'list' || view === 'cliente' || view === 'editor' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <User size={20} /> Clientes
        </button>
        <button 
          onClick={() => setView('plantillas')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${view === 'plantillas' || view === 'plantillaEditor' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <FileText size={20} /> Stock Rutinas
        </button>
        <button 
          onClick={() => setView('config')} 
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${view === 'config' ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Settings size={20} /> Ejercicios
        </button>
      </nav>
    </aside>
  </>
);
