import React from 'react';
import { User, FileText, Settings, X, Power } from 'lucide-react';
import type { View } from '../types';
import axios from 'axios';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  menuMobileOpen: boolean;
  setMenuMobileOpen: (open: boolean) => void;
}

const API_URL = `http://${window.location.hostname}:3001/api`;

export const Sidebar: React.FC<SidebarProps> = ({ view, setView, menuMobileOpen, setMenuMobileOpen }) => {
  const handleShutdown = async () => {
    if (confirm('¿Seguro que quieres apagar el sistema y salir?')) {
      try {
        await axios.post(`${API_URL}/shutdown`);
        setTimeout(() => {
          window.close();
          // Fallback por si window.close() es bloqueado por el navegador
          document.body.innerHTML = '<div style="background:#000;color:#fff;height:100vh;display:flex;align-items:center;justify-center;font-family:sans-serif;"><h1>SISTEMA APAGADO. PUEDES CERRAR ESTA VENTANA.</h1></div>';
        }, 500);
      } catch (e) {
        alert('Error al apagar el sistema.');
      }
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {menuMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMenuMobileOpen(false)}
        />
      )}
      
      <aside className={`w-64 sidebar-gradient text-white min-h-screen fixed left-0 top-0 flex flex-col p-6 z-50 transition-transform duration-300 lg:translate-x-0 ${menuMobileOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden shadow-2xl`}>
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-between w-full mb-6 lg:hidden">
            <h1 className="text-xl font-bold tracking-tight">Power <span className="text-orange-400">Rutinas</span></h1>
            <button onClick={() => setMenuMobileOpen(false)} className="text-slate-400">
              <X size={24} />
            </button>
          </div>
          <img src="/power.png" alt="Power Logo" className="w-32 h-32 object-contain mb-4 hidden lg:block" />
          <h1 className="text-2xl font-black tracking-tighter text-center hidden lg:block uppercase italic leading-tight">Power <span className="text-orange-500 block">Rutinas</span></h1>
        </div>
        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setView('list')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold uppercase italic text-sm ${view === 'list' || view === 'cliente' || view === 'editor' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <User size={20} /> Clientes
          </button>
          <button 
            onClick={() => setView('plantillas')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold uppercase italic text-sm ${view === 'plantillas' || view === 'plantillaEditor' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <FileText size={20} /> Stock Rutinas
          </button>
          <button 
            onClick={() => setView('config')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold uppercase italic text-sm ${view === 'config' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <Settings size={20} /> Ejercicios
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={handleShutdown}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-bold uppercase italic text-sm text-red-400 hover:bg-red-500/10"
          >
            <Power size={20} /> Salir del Sistema
          </button>
        </div>
      </aside>
    </>
  );
};
