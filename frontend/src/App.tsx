import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, User, Dumbbell, ArrowLeft, Save, Trash2, Printer, FileText, Mail } from 'lucide-react';
import type { Cliente, Ejercicio, Rutina, Plantilla, EjercicioRutina, View } from './types';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';

const API_URL = `http://${window.location.hostname}:3001/api`;

function App() {
  // --- ESTADOS ---
  const [view, setView] = useState<View>('list');
  const [menuMobileOpen, setMenuMobileOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedRutina, setSelectedRutina] = useState<Rutina | null>(null);
  const [selectedPlantilla, setSelectedPlantilla] = useState<Plantilla | null>(null);
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [ejerciciosBase, setEjerciciosBase] = useState<Ejercicio[]>([]);
  const [ejerciciosRutina, setEjerciciosRutina] = useState<EjercicioRutina[]>([]);
  const [ejerciciosPlantilla, setEjerciciosPlantilla] = useState<EjercicioRutina[]>([]);
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Modales
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [mostrarModalPlantillas, setMostrarModalPlantillas] = useState(false);
  const [mostrarModalNuevaPlantilla, setMostrarModalNuevaPlantilla] = useState(false);
  
  // Formularios nuevos
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', genero: 'Varón' as const, email: '', notas: '' });
  const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: '', grupo_muscular: 'PECHO' });
  const [nuevaPlantilla, setNuevaPlantilla] = useState({ nombre: '', genero: 'Varón' as const, dias: 3 });

  // --- EFECTOS ---
  useEffect(() => {
    fetchClientes();
    fetchEjerciciosBase();
    fetchPlantillas();
  }, []);

  useEffect(() => {
    setMenuMobileOpen(false);
  }, [view]);

  // --- FETCHERS ---
  const fetchClientes = async () => {
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchEjerciciosBase = async () => {
    try {
      const res = await axios.get(`${API_URL}/ejercicios`);
      setEjerciciosBase(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchPlantillas = async () => {
    try {
      const res = await axios.get(`${API_URL}/plantillas`);
      setPlantillas(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchRutinas = async (clienteId: number) => {
    const res = await axios.get(`${API_URL}/clientes/${clienteId}/rutinas`);
    setRutinas(res.data);
  };

  // --- HANDLERS CLIENTES ---
  const handleSelectCliente = async (cliente: Cliente) => {
    setSelectedCliente(cliente);
    await fetchRutinas(cliente.id);
    setView('cliente');
  };

  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/clientes`, nuevoCliente);
      setMostrarModalCliente(false);
      setNuevoCliente({ nombre: '', genero: 'Varón', email: '', notas: '' });
      await fetchClientes();
      alert('Cliente guardado con éxito');
    } catch (error: any) { 
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar: ' + (error.response?.data?.error || error.message)); 
    }
  };

  const handleDeleteCliente = async (id: number) => {
    if (!confirm('¿Seguro quieres eliminar este cliente?')) return;
    await axios.delete(`${API_URL}/clientes/${id}`);
    fetchClientes();
    setView('list');
  };

  // --- HANDLERS RUTINAS ---
  const handleCrearRutina = async () => {
    if (!selectedCliente) return;
    const nombre = prompt('Nombre de la rutina:');
    if (!nombre) return;
    const res = await axios.post(`${API_URL}/clientes/${selectedCliente.id}/rutinas`, { nombre_rutina: nombre });
    setSelectedRutina({ id: res.data.id, cliente_id: selectedCliente.id, nombre_rutina: nombre, fecha_creacion: new Date().toISOString() });
    setEjerciciosRutina([]);
    setView('editor');
    setMostrarModalPlantillas(true);
  };

  const handleEditRutina = async (rutina: Rutina) => {
    setSelectedRutina(rutina);
    const res = await axios.get(`${API_URL}/rutinas/${rutina.id}/ejercicios`);
    setEjerciciosRutina(res.data);
    setView('editor');
  };

  const handleDeleteRutina = async (id: number) => {
    if (!confirm('¿Eliminar esta rutina?')) return;
    await axios.delete(`${API_URL}/rutinas/${id}`);
    if (selectedCliente) fetchRutinas(selectedCliente.id);
  };

  const handleSaveRutina = async () => {
    if (!selectedRutina) return;
    try {
      await axios.put(`${API_URL}/rutinas/${selectedRutina.id}/ejercicios`, { ejercicios: ejerciciosRutina });
      alert('Rutina guardada!');
      setView('cliente');
    } catch (error: any) {
      console.error('Error al guardar rutina:', error);
      alert('Error al guardar rutina: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEnviarMail = async () => {
    if (!selectedRutina || !selectedCliente?.email) {
      alert('El cliente debe tener un email registrado.');
      return;
    }
    try {
      await axios.post(`${API_URL}/rutinas/${selectedRutina.id}/enviar-mail`);
      alert('Mail enviado!');
    } catch (e) {
      alert('Error al enviar mail. Revisa las credenciales en el backend.');
    }
  };

  // --- HANDLERS EJERCICIOS ---
  const handleAddEjercicio = (dia: number) => {
    const nuevo: EjercicioRutina = { 
      ejercicio_id: ejerciciosBase[0]?.id || 0, 
      dia, 
      orden: ejerciciosRutina.length, 
      series: '3', 
      repeticiones: '10', 
      peso: '', 
      notas: '' 
    };
    setEjerciciosRutina([...ejerciciosRutina, nuevo]);
  };

  const updateEjercicio = (ejOriginal: EjercicioRutina, campo: keyof EjercicioRutina, valor: any) => {
    setEjerciciosRutina(prev => prev.map(item => item === ejOriginal ? { ...item, [campo]: valor } : item));
  };

  const handleAddEjercicioBase = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API_URL}/ejercicios`, nuevoEjercicio);
    setNuevoEjercicio({ nombre: '', grupo_muscular: 'PECHO' });
    fetchEjerciciosBase();
  };

  // --- HANDLERS PLANTILLAS ---
  const handleCrearPlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post(`${API_URL}/plantillas`, nuevaPlantilla);
    setMostrarModalNuevaPlantilla(false);
    fetchPlantillas();
  };

  const handleApplyPlantilla = async (pid: number) => {
    const res = await axios.get(`${API_URL}/plantillas/${pid}/ejercicios`);
    setEjerciciosRutina(res.data.map((e:any) => ({ ...e, peso: '', notas: '' })));
    setMostrarModalPlantillas(false);
  };

  const handleEditPlantilla = async (p: Plantilla) => {
    setSelectedPlantilla(p);
    const res = await axios.get(`${API_URL}/plantillas/${p.id}/ejercicios`);
    setEjerciciosPlantilla(res.data);
    setView('plantillaEditor');
  };

  const handleSavePlantilla = async () => {
    if (!selectedPlantilla) return;
    try {
      await axios.put(`${API_URL}/plantillas/${selectedPlantilla.id}/ejercicios`, { ejercicios: ejerciciosPlantilla });
      alert('Stock actualizado!');
      setView('plantillas');
    } catch (error: any) {
      console.error('Error al guardar plantilla:', error);
      alert('Error al guardar stock: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeletePlantilla = async (id: number) => {
    if (!confirm('¿Eliminar del stock?')) return;
    await axios.delete(`${API_URL}/plantillas/${id}`);
    fetchPlantillas();
  };

  const updateEjercicioPlantilla = (ejOriginal: EjercicioRutina, campo: keyof EjercicioRutina, valor: any) => {
    setEjerciciosPlantilla(prev => prev.map(item => item === ejOriginal ? { ...item, [campo]: valor } : item));
  };

  // --- HELPERS ---
  const getDayColor = (dia: number) => {
    const colors = ['bg-[#f6c343]', 'bg-[#fef08a]', 'bg-[#bbf7d0]', 'bg-[#38bdf8]', 'bg-[#71717a] text-white', 'bg-[#c084fc]'];
    return colors[dia - 1] || 'bg-gray-100';
  };

  // --- RENDERIZADO DE VISTAS ---

  const renderListView = () => (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title="Clientes" setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Alumnos <span className="text-orange-600">Power</span></h2>
          <button onClick={() => setMostrarModalCliente(true)} className="w-full md:w-auto power-gradient text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 font-black shadow-lg shadow-orange-900/20 uppercase italic tracking-wider transition-transform hover:scale-105 active:scale-95">
            <Plus size={24} /> NUEVO ALUMNO
          </button>
        </header>
        <div className="relative mb-10 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input type="text" placeholder="BUSCAR ALUMNO..." className="w-full pl-12 pr-4 py-5 rounded-3xl border-none shadow-xl focus:ring-2 focus:ring-orange-500 bg-slate-800/50 backdrop-blur-sm font-bold uppercase placeholder:text-slate-500 text-white" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase())).map(c => (
            <div key={c.id} onClick={() => handleSelectCliente(c)} className="power-card p-8 rounded-[2.5rem] shadow-sm border border-white/5 cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-1.5 transition-all group-hover:h-3 ${c.genero === 'Varón' ? 'bg-blue-600' : 'bg-pink-600'}`}></div>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${c.genero === 'Varón' ? 'bg-blue-900/30 text-blue-400' : 'bg-pink-900/30 text-pink-400'}`}><User size={32} /></div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-white uppercase italic truncate leading-tight">{c.nombre}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 truncate">{c.email || 'SIN EMAIL'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {mostrarModalCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 w-full max-w-md shadow-2xl relative overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 w-full h-3 power-gradient"></div>
            <h2 className="text-3xl font-black mb-8 text-white uppercase italic">Ficha Alumno</h2>
            <form onSubmit={handleGuardarCliente}>
              <div className="space-y-4">
                <input required placeholder="NOMBRE COMPLETO" className="w-full p-5 bg-slate-800 rounded-2xl font-bold uppercase text-white placeholder:text-slate-500" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} />
                <input type="email" placeholder="CORREO ELECTRÓNICO" className="w-full p-5 bg-slate-800 rounded-2xl font-bold uppercase text-white placeholder:text-slate-500" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setNuevoCliente({...nuevoCliente, genero: 'Varón'})} className={`py-4 rounded-2xl font-black uppercase italic tracking-wider border-4 transition-all ${nuevoCliente.genero === 'Varón' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-800 text-slate-500 hover:border-blue-900'}`}>Varón</button>
                  <button type="button" onClick={() => setNuevoCliente({...nuevoCliente, genero: 'Dama'})} className={`py-4 rounded-2xl font-black uppercase italic tracking-wider border-4 transition-all ${nuevoCliente.genero === 'Dama' ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'border-slate-800 text-slate-500 hover:border-pink-900'}`}>Dama</button>
                </div>
              </div>
              <div className="flex gap-4 mt-10">
                <button type="button" onClick={() => setMostrarModalCliente(false)} className="flex-1 font-black text-slate-500 uppercase italic text-sm">CANCELAR</button>
                <button type="submit" className="flex-[2] py-5 power-gradient text-white rounded-2xl font-black uppercase italic tracking-widest shadow-xl">GUARDAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfigView = () => (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title="Catálogo" setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-10"><h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Catálogo de <span className="text-orange-600">Ejercicios</span></h2></header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleAddEjercicioBase} className="power-card p-8 rounded-[2.5rem] shadow-xl h-fit space-y-5 border border-white/10">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Ejercicio</label>
              <input required placeholder="EJ: PRESS DE BANCA" className="w-full p-5 bg-slate-800 rounded-2xl font-bold uppercase focus:ring-2 focus:ring-orange-500 border-none transition-all text-white placeholder:text-slate-500" value={nuevoEjercicio.nombre} onChange={e => setNuevoEjercicio({...nuevoEjercicio, nombre: e.target.value.toUpperCase()})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grupo Muscular</label>
              <select className="w-full p-5 bg-slate-800 rounded-2xl font-black uppercase appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500 border-none transition-all text-white" value={nuevoEjercicio.grupo_muscular} onChange={e => setNuevoEjercicio({...nuevoEjercicio, grupo_muscular: e.target.value})}>
                {['PECHO', 'ESPALDA', 'ZONA MEDIA', 'TREN INFERIOR', 'HOMBROS', 'TRICEPS', 'BICEPS'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full power-gradient text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-xl transition-transform hover:scale-[1.02] active:scale-95">AÑADIR AL CATÁLOGO</button>
          </form>
          <div className="lg:col-span-2 power-card p-6 md:p-10 rounded-[3rem] shadow-xl max-h-[75vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 border border-white/10">
            {[...ejerciciosBase].sort((a,b)=>a.grupo_muscular.localeCompare(b.grupo_muscular)).map(eb => (
              <div key={eb.id} className="p-5 bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-white/5 hover:bg-slate-800 transition-colors">
                <span className="text-[10px] font-black power-gradient text-white px-3 py-1 rounded-lg uppercase tracking-wider">{eb.grupo_muscular}</span>
                <span className="font-black text-white text-sm uppercase italic">{eb.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  const renderClienteView = () => (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title={selectedCliente?.nombre || 'Cliente'} setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className={`p-6 rounded-[2rem] ${selectedCliente?.genero === 'Varón' ? 'bg-blue-600' : 'bg-pink-600'} text-white shadow-2xl relative overflow-hidden`}>
               <User size={40} />
               <div className="absolute inset-0 bg-white/10"></div>
            </div>
            <div className="min-w-0">
              <button onClick={() => setView('list')} className="text-orange-600 font-black text-xs uppercase mb-2 flex items-center gap-2 tracking-widest italic"><ArrowLeft size={16} /> VOLVER AL LISTADO</button>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic leading-none truncate tracking-tighter">{selectedCliente?.nombre}</h1>
              <p className="text-slate-400 font-black uppercase text-xs mt-2 tracking-[0.3em]">{selectedCliente?.email || 'SIN CORREO REGISTRADO'}</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => selectedCliente && handleDeleteCliente(selectedCliente.id)} className="flex-1 md:flex-none bg-slate-800 text-red-500 border-2 border-slate-700 p-5 rounded-2xl flex justify-center items-center hover:bg-red-500 hover:text-white transition-colors shadow-lg"><Trash2 size={28} /></button>
            <button onClick={handleCrearRutina} className="flex-[3] md:flex-none power-gradient text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-4 shadow-2xl uppercase italic tracking-widest transition-transform hover:scale-105 active:scale-95"><Plus size={28} /> NUEVA RUTINA</button>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {rutinas.map(r => (
            <div key={r.id} onClick={() => handleEditRutina(r)} className="power-card p-8 rounded-[2.5rem] shadow-md border-4 border-transparent hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-800 p-4 rounded-2xl group-hover:power-gradient group-hover:text-white transition-all shadow-inner"><FileText size={32} /></div>
                <button onClick={e => { e.stopPropagation(); handleDeleteRutina(r.id); }} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={24} /></button>
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic group-hover:text-orange-600 transition-colors">{r.nombre_rutina}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(r.fecha_creacion).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const renderEditorView = () => {
    const dias = [1, 2, 3, 4, 5, 6];
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
        <MobileHeader title="Editor de Rutina" setMenuMobileOpen={setMenuMobileOpen} />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 print:ml-0 print:p-0">
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 print:hidden power-card p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
            <div className="flex items-center gap-5">
              <button onClick={() => setView('cliente')} className="bg-slate-800 p-4 rounded-2xl hover:power-gradient hover:text-white transition-all shadow-inner"><ArrowLeft size={24} /></button>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic leading-none truncate tracking-tighter">{selectedRutina?.nombre_rutina}</h1>
                <p className="text-[10px] md:text-xs font-black text-orange-600 mt-2 uppercase tracking-[0.4em] italic truncate">{selectedCliente?.nombre}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full xl:w-auto">
              <button onClick={() => setMostrarModalPlantillas(true)} className="flex-1 xl:flex-none bg-slate-800 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 text-xs md:text-sm uppercase italic tracking-widest hover:bg-black transition-all shadow-lg"><FileText size={20} /> STOCK</button>
              <button onClick={() => window.print()} className="flex-1 xl:flex-none bg-slate-800 text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 border-2 border-slate-700 hover:bg-white hover:text-black transition-all text-xs md:text-sm uppercase italic tracking-widest shadow-lg"><Printer size={20} /> IMPRIMIR</button>
              <button onClick={handleEnviarMail} className="flex-1 xl:flex-none bg-blue-900/30 text-blue-400 px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all text-xs md:text-sm uppercase italic tracking-widest shadow-lg shadow-blue-900/20"><Mail size={20} /> MAIL</button>
              <button onClick={handleSaveRutina} className="w-full xl:w-auto power-gradient text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl uppercase italic tracking-widest hover:scale-105 transition-transform text-xs md:text-sm"><Save size={20} /> GUARDAR</button>
            </div>
          </header>

          <div className="hidden print:flex items-center justify-between mb-8 border-b-4 border-black pb-4 px-6">
            <div className="flex-1">
              <h1 className="text-4xl font-black uppercase leading-none italic tracking-tighter text-white print:text-black">{selectedCliente?.nombre}</h1>
              <div className="flex items-center gap-6 mt-2">
                <span className="text-lg font-black bg-black text-white px-4 py-1 uppercase italic print:bg-white print:text-black print:border-2 print:border-black">{selectedRutina?.nombre_rutina}</span>
                <span className="text-xs font-black uppercase tracking-widest text-white print:text-black">FECHA: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <img src="/power.png" alt="Power Logo" className="w-24 h-24 object-contain ml-8" />
          </div>

          <div className="max-w-7xl mx-auto space-y-12 print:space-y-4">
            {dias.map(dia => {
              const ejsDia = ejerciciosRutina.filter(e => e.dia === dia);
              const maxDiaConEjercicios = ejerciciosRutina.length > 0 ? Math.max(...ejerciciosRutina.map(e => e.dia)) : 0;
              if (ejsDia.length === 0 && dia > 3 && dia > maxDiaConEjercicios + 1) return null;

              return (
                <section key={dia} className="print:break-inside-avoid">
                  <div className="flex items-center gap-5 mb-6 print:mb-2 print:px-6">
                    <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl md:text-3xl font-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] print:w-8 print:h-8 print:text-base print:border-2 print:shadow-none ${getDayColor(dia)}`}>{dia}</div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter print:text-lg text-white print:text-black">DÍA {dia}</h3>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full print:h-0.5 print:bg-black"></div>
                    <button onClick={() => handleAddEjercicio(dia)} className="power-gradient text-white text-[10px] md:text-xs px-5 md:px-6 py-2.5 md:py-3 rounded-full font-black uppercase italic tracking-widest shadow-lg print:hidden"><Plus size={16} /> AÑADIR</button>
                  </div>
                  <div className="space-y-6 print:space-y-2 print:px-6">
                    {[...new Set(ejsDia.map(e => ejerciciosBase.find(eb => eb.id === e.ejercicio_id)?.grupo_muscular || 'OTROS'))].map(g => {
                      const ejsG = ejsDia.filter(e => (ejerciciosBase.find(eb => eb.id === e.ejercicio_id)?.grupo_muscular || 'OTROS') === g);
                      return (
                        <div key={g} className="power-card rounded-[2rem] shadow-xl border border-white/10 overflow-hidden print:border-4 print:border-black print:rounded-none print:shadow-none">
                          <div className="bg-slate-900 text-white px-6 md:px-8 py-2.5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] italic print:bg-black print:text-white print:px-4 print:py-1">{g}</div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px] md:min-w-0">
                              <thead className="bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 border-b border-white/5 print:bg-slate-100 print:text-black print:border-black">
                                <tr>
                                  <th className="px-6 md:px-8 py-4 w-1/3 print:px-3 print:py-1">MOVIMIENTO</th>
                                  <th className="px-2 py-4 text-center w-16 print:px-1">S</th>
                                  <th className="px-2 py-4 text-center w-16 print:px-1">R</th>
                                  <th className="px-6 md:px-8 py-4 w-28 print:px-3">PESO</th>
                                  <th className="px-6 md:px-8 py-4 print:px-3">NOTAS</th>
                                  <th className="px-4 py-4 w-12 print:hidden"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5 print:divide-y print:divide-black">
                                {ejsG.map((ej, idx) => {
                                  const baseInfo = ejerciciosBase.find(eb => eb.id === ej.ejercicio_id);
                                  return (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors print:divide-x print:divide-black">
                                      <td className="px-6 md:px-8 py-5 print:px-3 print:py-2">
                                        <select className="w-full bg-transparent border-none focus:ring-0 font-black text-white print:text-black uppercase appearance-none print:hidden cursor-pointer text-sm md:text-base italic leading-tight" value={ej.ejercicio_id} onChange={e => updateEjercicio(ej, 'ejercicio_id', parseInt(e.target.value))}>
                                          {[...ejerciciosBase].sort((a,b)=>a.grupo_muscular.localeCompare(b.grupo_muscular)).map(eb => <option key={eb.id} value={eb.id} className="bg-slate-900">{eb.grupo_muscular}: {eb.nombre}</option>)}
                                        </select>
                                        <span className="hidden print:block text-base font-black uppercase italic leading-none">{baseInfo?.nombre}</span>
                                      </td>
                                      <td className="px-2 py-5 text-center print:px-1 print:py-2"><input className="w-full text-center border-none focus:ring-0 font-black print:hidden text-lg bg-transparent text-white" value={ej.series} onChange={e => updateEjercicio(ej, 'series', e.target.value)} /><span className="hidden print:block text-xl font-black">{ej.series}</span></td>
                                      <td className="px-2 py-5 text-center print:px-1 print:py-2"><input className="w-full text-center border-none focus:ring-0 font-black print:hidden text-lg bg-transparent text-white" value={ej.repeticiones} onChange={e => updateEjercicio(ej, 'repeticiones', e.target.value)} /><span className="hidden print:block text-xl font-black">{ej.repeticiones}</span></td>
                                      <td className="px-6 md:px-8 py-5 print:px-3 print:py-2"><input className="w-full border-none focus:ring-0 font-black text-orange-500 italic print:hidden text-lg bg-transparent placeholder:text-slate-700 text-white" value={ej.peso} placeholder="0 KG" onChange={e => updateEjercicio(ej, 'peso', e.target.value)} /><span className="hidden print:block text-xl font-black italic">{ej.peso || '____'}</span></td>
                                      <td className="px-6 md:px-8 py-5 print:px-3 print:py-2"><input className="w-full border-none focus:ring-0 text-[11px] font-bold text-slate-500 italic print:hidden bg-transparent placeholder:text-slate-700 text-white" value={ej.notas} placeholder="Observaciones..." onChange={e => updateEjercicio(ej, 'notas', e.target.value)} /><span className="hidden print:block text-[10px] font-bold uppercase italic text-slate-700">{ej.notas}</span></td>
                                      <td className="px-4 py-5 text-center print:hidden"><button onClick={()=>setEjerciciosRutina(ejerciciosRutina.filter(x=>x!==ej))} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={24} /></button></td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </main>
        {mostrarModalPlantillas && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border-4 border-orange-500">
              <h2 className="text-3xl font-black mb-8 uppercase italic tracking-tighter text-white">Stock de Rutinas <span className="text-orange-600">Power</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-y-auto mb-8 pr-4 custom-scrollbar">
                {plantillas.filter(p => p.genero === selectedCliente?.genero).map(p => (
                  <div key={p.id} onClick={() => handleApplyPlantilla(p.id)} className="bg-slate-800 p-6 rounded-[2rem] border-4 border-transparent hover:border-orange-500 hover:bg-slate-700 transition-all cursor-pointer group shadow-inner">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-900 p-3 rounded-2xl text-orange-600 shadow-sm group-hover:scale-110 transition-transform"><FileText size={28} /></div>
                      <span className="text-[10px] font-black power-gradient text-white px-3 py-1 rounded-full uppercase tracking-widest">{p.dias} DÍAS</span>
                    </div>
                    <h3 className="font-black text-white leading-tight text-xl uppercase italic group-hover:text-orange-500 transition-colors">{p.nombre}</h3>
                  </div>
                ))}
              </div>
              <button onClick={() => setMostrarModalPlantillas(false)} className="w-full py-5 text-slate-500 font-black border-4 border-slate-800 rounded-2xl uppercase italic tracking-[0.3em] hover:bg-slate-800 transition-colors">CERRAR STOCK</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlantillasView = () => (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title="Stock" setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Stock de <span className="text-orange-600">Rutinas</span></h2>
            <p className="text-slate-500 font-black uppercase text-xs mt-3 tracking-[0.4em] italic">Modelos Maestros Power</p>
          </div>
          <button onClick={() => setMostrarModalNuevaPlantilla(true)} className="w-full md:w-auto power-gradient text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-orange-900/20 flex items-center justify-center gap-4 uppercase italic tracking-widest transition-transform hover:scale-105 active:scale-95"><Plus size={28} /> NUEVO MODELO</button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {plantillas.map(p => (
            <div key={p.id} onClick={() => handleEditPlantilla(p)} className="power-card p-8 rounded-[3rem] shadow-lg border border-white/10 hover:shadow-2xl hover:scale-[1.03] transition-all group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 transition-all group-hover:h-4 ${p.genero === 'Varón' ? 'bg-blue-600' : 'bg-pink-600'}`}></div>
              <div className="flex justify-between items-start mb-8">
                <div className="bg-slate-800 p-5 rounded-[1.5rem] group-hover:power-gradient group-hover:text-white transition-all shadow-inner"><FileText size={40} /></div>
                <button onClick={e => { e.stopPropagation(); handleDeletePlantilla(p.id); }} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={28} /></button>
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-orange-600 transition-colors uppercase italic leading-tight truncate">{p.nombre}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2 italic">{p.genero} • {p.dias} DÍAS</p>
            </div>
          ))}
        </div>
      </main>
      {mostrarModalNuevaPlantilla && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 w-full max-w-md shadow-2xl relative overflow-hidden border-4 border-orange-600">
            <h2 className="text-3xl font-black mb-10 text-white uppercase italic tracking-tighter">Nuevo Modelo</h2>
            <form onSubmit={handleCrearPlantilla}>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Modelo</label>
                  <input required placeholder="EJ: RUTINA FUERZA A" className="w-full p-5 bg-slate-800 rounded-2xl font-bold uppercase text-white placeholder:text-slate-600" value={nuevaPlantilla.nombre} onChange={e => setNuevaPlantilla({...nuevaPlantilla, nombre: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Género</label>
                    <select className="w-full p-5 bg-slate-800 rounded-2xl font-black text-sm uppercase appearance-none cursor-pointer text-white" value={nuevaPlantilla.genero} onChange={e => setNuevaPlantilla({...nuevaPlantilla, genero: e.target.value as any})}><option value="Varón" className="bg-slate-900">Varón</option><option value="Dama" className="bg-slate-900">Dama</option></select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Días</label>
                    <select className="w-full p-5 bg-slate-800 rounded-2xl font-black text-sm uppercase appearance-none cursor-pointer text-white" value={nuevaPlantilla.dias} onChange={e => setNuevaPlantilla({...nuevaPlantilla, dias: parseInt(e.target.value)})}>{[1,2,3,4,5,6].map(d => <option key={d} value={d} className="bg-slate-900">{d} Días</option>)}</select>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 mt-12">
                <button type="button" onClick={() => setMostrarModalNuevaPlantilla(false)} className="flex-1 font-black text-slate-500 uppercase italic tracking-widest text-xs">CANCELAR</button>
                <button type="submit" className="flex-[2] py-5 power-gradient text-white rounded-2xl font-black shadow-xl uppercase italic tracking-[0.2em] transition-transform hover:scale-105">CREAR MODELO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlantillaEditorView = () => {
    const dias = Array.from({length: selectedPlantilla?.dias || 0}, (_, i) => i + 1);
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
        <MobileHeader title="Editor Stock" setMenuMobileOpen={setMenuMobileOpen} />
        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 power-card p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
            <div className="flex items-center gap-5">
              <button onClick={() => setView('plantillas')} className="bg-slate-800 p-4 rounded-2xl hover:power-gradient hover:text-white transition-all shadow-inner"><ArrowLeft size={24} /></button>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-white uppercase italic leading-none truncate tracking-tighter">{selectedPlantilla?.nombre}</h1>
                <p className="text-[10px] md:text-xs font-black text-orange-600 mt-2 uppercase tracking-[0.4em] italic truncate">EDITOR DE STOCK • {selectedPlantilla?.genero}</p>
              </div>
            </div>
            <button onClick={handleSavePlantilla} className="w-full md:w-auto power-gradient text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl uppercase italic tracking-widest hover:scale-105 transition-transform"><Save size={24} /> GUARDAR MODELO</button>
          </header>
          <div className="space-y-16">
            {dias.map(dia => {
              const ejsD = ejerciciosPlantilla.filter(e => e.dia === dia);
              return (
                <section key={dia}>
                  <div className="flex items-center gap-5 mb-8">
                    <div className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-2xl md:text-4xl font-black border-4 md:border-8 border-slate-900 shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] ${getDayColor(dia)}`}>{dia}</div>
                    <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">DÍA {dia}</h3>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full"></div>
                    <button onClick={() => setEjerciciosPlantilla([...ejerciciosPlantilla, { ejercicio_id: ejerciciosBase[0]?.id || 0, dia, orden: 0, series: '3', repeticiones: '10', peso: '', notas: '' }])} className="bg-slate-900 text-white text-[10px] md:text-xs px-6 py-3 rounded-full font-black hover:bg-black transition-all flex items-center gap-2 uppercase italic tracking-widest shadow-lg shadow-slate-900/20"><Plus size={18} /> AÑADIR</button>
                  </div>
                  <div className="power-card rounded-[3rem] shadow-xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                        <thead className="bg-slate-900 text-white text-[10px] font-black uppercase italic tracking-[0.3em]">
                          <tr><th className="px-8 py-5 w-1/2">MOVIMIENTO</th><th className="px-4 py-5 text-center w-28">SERIES</th><th className="px-4 py-5 text-center w-36">REPS</th><th className="px-4 py-5 w-16"></th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {ejsD.map((ej, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-all">
                              <td className="px-8 py-6">
                                <select className="w-full bg-transparent border-none focus:ring-0 font-black text-white uppercase appearance-none cursor-pointer text-sm md:text-base italic leading-tight" value={ej.ejercicio_id} onChange={e => updateEjercicioPlantilla(ej, 'ejercicio_id', parseInt(e.target.value))}>
                                  {[...ejerciciosBase].sort((a,b)=>a.grupo_muscular.localeCompare(b.grupo_muscular)).map(eb => <option key={eb.id} value={eb.id} className="bg-slate-900">{eb.grupo_muscular}: {eb.nombre}</option>)}
                                </select>
                              </td>
                              <td className="px-4 py-6"><input className="w-full text-center border-2 border-slate-800 bg-slate-900 text-white rounded-2xl font-black py-3 text-sm md:text-base shadow-sm focus:border-orange-500 transition-all" value={ej.series} onChange={e => updateEjercicioPlantilla(ej, 'series', e.target.value)} /></td>
                              <td className="px-4 py-6"><input className="w-full text-center border-2 border-slate-800 bg-slate-900 text-white rounded-2xl font-black py-3 text-sm md:text-base shadow-sm focus:border-orange-500 transition-all" value={ej.repeticiones} onChange={e => updateEjercicioPlantilla(ej, 'repeticiones', e.target.value)} /></td>
                              <td className="px-4 py-6 text-center"><button onClick={()=>setEjerciciosPlantilla(ejerciciosPlantilla.filter(x=>x!==ej))} className="text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={24} /></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  // --- RENDER PRINCIPAL ---
  switch (view) {
    case 'list': return renderListView();
    case 'config': return renderConfigView();
    case 'cliente': return renderClienteView();
    case 'editor': return renderEditorView();
    case 'plantillas': return renderPlantillasView();
    case 'plantillaEditor': return renderPlantillaEditorView();
    default: return renderListView();
  }
}

export default App;
