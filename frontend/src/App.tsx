import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, User, Dumbbell, ArrowLeft, Save, Trash2, Printer, FileText, Mail } from 'lucide-react';
import { Cliente, Ejercicio, Rutina, Plantilla, EjercicioRutina, View } from './types';
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
      fetchClientes();
    } catch (error) { alert('Error al guardar.'); }
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
    await axios.put(`${API_URL}/rutinas/${selectedRutina.id}/ejercicios`, { ejercicios: ejerciciosRutina });
    alert('Guardado!');
    setView('cliente');
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
    await axios.put(`${API_URL}/plantillas/${selectedPlantilla.id}/ejercicios`, { ejercicios: ejerciciosPlantilla });
    alert('Stock actualizado!');
    setView('plantillas');
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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title="Clientes" setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Clientes</h2>
          <button onClick={() => setMostrarModalCliente(true)} className="w-full md:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg">
            <Plus size={20} /> NUEVO CLIENTE
          </button>
        </header>
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 bg-white" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase())).map(c => (
            <div key={c.id} onClick={() => handleSelectCliente(c)} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${c.genero === 'Varón' ? 'bg-blue-400' : 'bg-pink-400'}`}></div>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${c.genero === 'Varón' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}><User size={24} /></div>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{c.nombre}</h3>
                  <p className="text-xs text-slate-400 font-medium truncate">{c.email || 'Sin email'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {mostrarModalCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nuevo Alumno</h2>
            <form onSubmit={handleGuardarCliente}>
              <input required placeholder="Nombre Completo" className="w-full p-4 bg-slate-50 rounded-xl mb-4" value={nuevoCliente.nombre} onChange={e => setNuevoCliente({...nuevoCliente, nombre: e.target.value})} />
              <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-xl mb-4" value={nuevoCliente.email} onChange={e => setNuevoCliente({...nuevoCliente, email: e.target.value})} />
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button type="button" onClick={() => setNuevoCliente({...nuevoCliente, genero: 'Varón'})} className={`py-3 rounded-xl font-bold border-2 ${nuevoCliente.genero === 'Varón' ? 'bg-blue-600 border-blue-600 text-white' : 'text-slate-500'}`}>Varón</button>
                <button type="button" onClick={() => setNuevoCliente({...nuevoCliente, genero: 'Dama'})} className={`py-3 rounded-xl font-bold border-2 ${nuevoCliente.genero === 'Dama' ? 'bg-pink-600 border-pink-600 text-white' : 'text-slate-500'}`}>Dama</button>
              </div>
              <div className="flex gap-4"><button type="button" onClick={() => setMostrarModalCliente(false)} className="flex-1 font-bold text-slate-400">CANCELAR</button><button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold">GUARDAR</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderConfigView = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title="Catálogo" setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-8"><h2 className="text-2xl md:text-3xl font-bold text-slate-800">Catálogo de Ejercicios</h2></header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleAddEjercicioBase} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm h-fit space-y-4">
            <input required placeholder="Nombre" className="w-full p-4 bg-slate-50 rounded-xl" value={nuevoEjercicio.nombre} onChange={e => setNuevoEjercicio({...nuevoEjercicio, nombre: e.target.value.toUpperCase()})} />
            <select className="w-full p-4 bg-slate-50 rounded-xl font-bold" value={nuevoEjercicio.grupo_muscular} onChange={e => setNuevoEjercicio({...nuevoEjercicio, grupo_muscular: e.target.value})}>
              {['PECHO', 'ESPALDA', 'ZONA MEDIA', 'TREN INFERIOR', 'HOMBROS', 'TRICEPS', 'BICEPS'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">AÑADIR</button>
          </form>
          <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-3xl shadow-sm max-h-[75vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...ejerciciosBase].sort((a,b)=>a.grupo_muscular.localeCompare(b.grupo_muscular)).map(eb => <div key={eb.id} className="p-4 bg-slate-50 rounded-xl flex items-center gap-3"><span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">{eb.grupo_muscular}</span><span className="font-bold text-slate-700 text-sm">{eb.nombre}</span></div>)}
          </div>
        </div>
      </main>
    </div>
  );

  const renderClienteView = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title={selectedCliente?.nombre || 'Cliente'} setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl ${selectedCliente?.genero === 'Varón' ? 'bg-blue-600' : 'bg-pink-600'} text-white shadow-xl`}><User size={32} /></div>
            <div className="min-w-0">
              <button onClick={() => setView('list')} className="text-indigo-600 font-bold text-xs md:text-sm uppercase mb-1 flex items-center gap-1"><ArrowLeft size={14} /> Listado</button>
              <h1 className="text-2xl md:text-4xl font-black text-slate-800 uppercase truncate">{selectedCliente?.nombre}</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] md:text-xs truncate">{selectedCliente?.email}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => selectedCliente && handleDeleteCliente(selectedCliente.id)} className="flex-1 md:flex-none bg-white text-red-500 border border-red-100 p-4 rounded-2xl flex justify-center items-center"><Trash2 size={24} /></button>
            <button onClick={handleCrearRutina} className="flex-[3] md:flex-none bg-indigo-600 text-white px-6 md:px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl"><Plus size={22} /> NUEVA RUTINA</button>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rutinas.map(r => (
            <div key={r.id} onClick={() => handleEditRutina(r)} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent hover:border-indigo-500 transition cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition"><FileText size={24} /></div>
                <button onClick={e => { e.stopPropagation(); handleDeleteRutina(r.id); }} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{r.nombre_rutina}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(r.fecha_creacion).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );

  const renderEditorView = () => {
    const dias = [1, 2, 3, 4, 5, 6];
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
        <MobileHeader title="Editor de Rutina" setMenuMobileOpen={setMenuMobileOpen} />
        <main className="flex-1 lg:ml-64 p-4 md:p-8 print:ml-0 print:p-0">
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 print:hidden bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('cliente')} className="bg-slate-100 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition"><ArrowLeft size={20} /></button>
              <div className="min-w-0"><h1 className="text-lg md:text-xl font-black text-slate-800 uppercase italic leading-none truncate">{selectedRutina?.nombre_rutina}</h1><p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">{selectedCliente?.nombre}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 w-full xl:w-auto">
              <button onClick={() => setMostrarModalPlantillas(true)} className="flex-1 xl:flex-none bg-orange-50 text-orange-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs md:text-sm"><FileText size={18} /> STOCK</button>
              <button onClick={() => window.print()} className="flex-1 xl:flex-none bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 hover:text-white transition text-xs md:text-sm"><Printer size={18} /> IMPRIMIR</button>
              <button onClick={handleEnviarMail} className="flex-1 xl:flex-none bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition text-xs md:text-sm"><Mail size={18} /> MAIL</button>
              <button onClick={handleSaveRutina} className="w-full xl:w-auto bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg text-xs md:text-sm"><Save size={18} /> GUARDAR</button>
            </div>
          </header>

          <div className="hidden print:block mb-4 border-b-2 border-black pb-2 px-4">
            <h1 className="text-3xl font-black uppercase leading-none">{selectedCliente?.nombre}</h1>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-black bg-black text-white px-2 py-0.5 uppercase">{selectedRutina?.nombre_rutina}</span>
              <span className="text-[9px] font-black uppercase">FECHA: {new Date().toLocaleDateString()} | PROFESOR: __________________</span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto space-y-8 print:space-y-2">
            {dias.map(dia => {
              const ejsDia = ejerciciosRutina.filter(e => e.dia === dia);
              const maxDiaConEjercicios = ejerciciosRutina.length > 0 ? Math.max(...ejerciciosRutina.map(e => e.dia)) : 0;
              if (ejsDia.length === 0 && dia > 3 && dia > maxDiaConEjercicios + 1) return null;

              const grupos = [...new Set(ejsDia.map(e => ejerciciosBase.find(eb => eb.id === e.ejercicio_id)?.grupo_muscular || 'OTROS'))];

              return (
                <section key={dia} className="print:break-inside-avoid">
                  <div className="flex items-center gap-3 mb-3 print:mb-1 print:px-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-xl font-black border-2 border-black print:w-6 print:h-6 print:text-sm ${getDayColor(dia)}`}>{dia}</div>
                    <h3 className="text-lg md:text-xl font-black uppercase italic print:text-sm">DÍA {dia}</h3>
                    <div className="flex-1 border-b-2 border-slate-200 border-dashed print:border-black"></div>
                    <button onClick={() => handleAddEjercicio(dia)} className="bg-indigo-600 text-white text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold print:hidden"><Plus size={14} /> AÑADIR</button>
                  </div>
                  <div className="space-y-4 print:space-y-1 print:px-4">
                    {grupos.map(g => {
                      const ejsG = ejsDia.filter(e => (ejerciciosBase.find(eb => eb.id === e.ejercicio_id)?.grupo_muscular || 'OTROS') === g);
                      return (
                        <div key={g} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden print:border-2 print:border-black print:rounded-none">
                          <div className="bg-slate-800 text-white px-4 md:px-6 py-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] print:bg-black print:px-3 print:py-0.5">{g}</div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
                              <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 border-b print:bg-gray-50 print:text-black">
                                <tr>
                                  <th className="px-4 md:px-6 py-2 w-1/3 print:px-2 print:py-0.5">MOVIMIENTO</th>
                                  <th className="px-2 py-2 text-center w-12 print:px-1">S</th>
                                  <th className="px-2 py-2 text-center w-12 print:px-1">R</th>
                                  <th className="px-4 md:px-6 py-2 w-24 print:px-2">PESO</th>
                                  <th className="px-4 md:px-6 py-2 print:px-2">NOTAS</th>
                                  <th className="px-2 py-2 w-10 print:hidden"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 print:divide-y print:divide-black">
                                {ejsG.map((ej, idx) => {
                                  const baseInfo = ejerciciosBase.find(eb => eb.id === ej.ejercicio_id);
                                  return (
                                    <tr key={idx} className="hover:bg-slate-50/50 print:divide-x print:divide-black">
                                      <td className="px-4 md:px-6 py-3 print:px-2 print:py-1">
                                        <select className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-800 uppercase appearance-none print:hidden cursor-pointer text-xs md:text-sm" value={ej.ejercicio_id} onChange={e => updateEjercicio(ej, 'ejercicio_id', parseInt(e.target.value))}>
                                          {[...ejerciciosBase].sort((a,b)=>a.grupo_muscular.localeCompare(b.grupo_muscular)).map(eb => <option key={eb.id} value={eb.id}>{eb.grupo_muscular}: {eb.nombre}</option>)}
                                        </select>
                                        <span className="hidden print:block text-sm font-black uppercase leading-tight">{baseInfo?.nombre}</span>
                                      </td>
                                      <td className="px-2 py-3 text-center print:px-1 print:py-1"><input className="w-full text-center border-none focus:ring-0 font-black print:hidden text-sm" value={ej.series} onChange={e => updateEjercicio(ej, 'series', e.target.value)} /><span className="hidden print:block text-base font-black">{ej.series}</span></td>
                                      <td className="px-2 py-3 text-center print:px-1 print:py-1"><input className="w-full text-center border-none focus:ring-0 font-black print:hidden text-sm" value={ej.repeticiones} onChange={e => updateEjercicio(ej, 'repeticiones', e.target.value)} /><span className="hidden print:block text-base font-black">{ej.repeticiones}</span></td>
                                      <td className="px-4 md:px-6 py-3 print:px-2 print:py-1"><input className="w-full border-none focus:ring-0 font-black text-indigo-600 italic print:hidden text-sm" value={ej.peso} placeholder="--" onChange={e => updateEjercicio(ej, 'peso', e.target.value)} /><span className="hidden print:block text-base font-black italic">{ej.peso || '____'}</span></td>
                                      <td className="px-4 md:px-6 py-3 print:px-2 print:py-1"><input className="w-full border-none focus:ring-0 text-[10px] md:text-xs font-bold text-slate-400 italic print:hidden" value={ej.notas} placeholder="Nota..." onChange={e => updateEjercicio(ej, 'notas', e.target.value)} /><span className="hidden print:block text-[8px] font-bold uppercase italic text-slate-600">{ej.notas}</span></td>
                                      <td className="px-2 py-3 text-center print:hidden"><button onClick={()=>setEjerciciosRutina(ejerciciosRutina.filter(x=>x!==ej))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td>
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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <h2 className="text-xl md:text-2xl font-black mb-6">Cargar del Stock</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto mb-6 pr-2">
                {plantillas.filter(p => p.genero === selectedCliente?.genero).map(p => (
                  <div key={p.id} onClick={() => handleApplyPlantilla(p.id)} className="bg-slate-50 p-4 md:p-5 rounded-2xl border-2 border-transparent hover:border-indigo-500 transition cursor-pointer">
                    <div className="flex justify-between items-start mb-2"><div className="bg-white p-2 rounded-lg text-indigo-600 shadow-sm"><FileText size={20} /></div><span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">{p.dias} DÍAS</span></div>
                    <h3 className="font-black text-slate-800 leading-tight text-sm md:text-base">{p.nombre}</h3>
                  </div>
                ))}
              </div>
              <button onClick={() => setMostrarModalPlantillas(false)} className="w-full py-4 text-slate-400 font-bold border-2 rounded-2xl uppercase text-[10px] md:text-xs">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPlantillasView = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
      <MobileHeader title="Stock" setMenuMobileOpen={setMenuMobileOpen} />
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div><h2 className="text-2xl md:text-3xl font-bold text-slate-800">Stock de Rutinas</h2><p className="text-slate-500 text-sm">Modelos maestros.</p></div>
          <button onClick={() => setMostrarModalNuevaPlantilla(true)} className="w-full md:w-auto bg-orange-500 text-white px-6 md:px-8 py-4 rounded-2xl font-bold shadow-xl shadow-orange-100 flex items-center justify-center gap-2"><Plus size={22} /> NUEVO MODELO</button>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map(p => (
            <div key={p.id} onClick={() => handleEditPlantilla(p)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${p.genero === 'Varón' ? 'bg-blue-400' : 'bg-pink-400'}`}></div>
              <div className="flex justify-between items-start mb-6"><div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition"><FileText size={32} /></div><button onClick={e => { e.stopPropagation(); handleDeletePlantilla(p.id); }} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={24} /></button></div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition truncate">{p.nombre}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{p.genero} • {p.dias} DÍAS</p>
            </div>
          ))}
        </div>
      </main>
      {mostrarModalNuevaPlantilla && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-8 text-slate-800">Nuevo Modelo</h2>
            <form onSubmit={handleCrearPlantilla}>
              <input required placeholder="Nombre" className="w-full p-4 bg-slate-50 rounded-2xl mb-6" value={nuevaPlantilla.nombre} onChange={e => setNuevaPlantilla({...nuevaPlantilla, nombre: e.target.value})} />
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">GÉNERO</label><select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" value={nuevaPlantilla.genero} onChange={e => setNuevaPlantilla({...nuevaPlantilla, genero: e.target.value as any})}><option value="Varón">Varón</option><option value="Dama">Dama</option></select></div>
                <div><label className="block text-[10px] font-black text-slate-400 uppercase mb-1">DÍAS</label><select className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-sm" value={nuevaPlantilla.dias} onChange={e => setNuevaPlantilla({...nuevaPlantilla, dias: parseInt(e.target.value)})}>{[1,2,3,4,5,6].map(d => <option key={d} value={d}>{d} Días</option>)}</select></div>
              </div>
              <div className="flex gap-4"><button type="button" onClick={() => setMostrarModalNuevaPlantilla(false)} className="flex-1 font-bold text-slate-400 uppercase text-[10px]">CANCELAR</button><button type="submit" className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-xl text-[10px]">CREAR</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderPlantillaEditorView = () => {
    const dias = Array.from({length: selectedPlantilla?.dias || 0}, (_, i) => i + 1);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        <Sidebar view={view} setView={setView} menuMobileOpen={menuMobileOpen} setMenuMobileOpen={setMenuMobileOpen} />
        <MobileHeader title="Editor Stock" setMenuMobileOpen={setMenuMobileOpen} />
        <main className="flex-1 lg:ml-64 p-4 md:p-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('plantillas')} className="bg-slate-100 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition"><ArrowLeft size={20} /></button>
              <div className="min-w-0"><h1 className="text-lg md:text-xl font-black text-slate-800 uppercase italic leading-none truncate">{selectedPlantilla?.nombre}</h1><p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">STOCK • {selectedPlantilla?.genero}</p></div>
            </div>
            <button onClick={handleSavePlantilla} className="w-full md:w-auto bg-emerald-600 text-white px-6 md:px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 text-xs md:text-sm"><Save size={20} /> GUARDAR MODELO</button>
          </header>
          <div className="space-y-10">
            {dias.map(dia => {
              const ejsD = ejerciciosPlantilla.filter(e => e.dia === dia);
              return (
                <section key={dia}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg md:text-xl font-black border-2 md:border-4 border-black ${getDayColor(dia)}`}>{dia}</div>
                    <h3 className="text-lg md:text-xl font-black uppercase text-slate-800">DÍA {dia}</h3>
                    <div className="flex-1 border-b-2 border-slate-200 border-dashed"></div>
                    <button onClick={() => setEjerciciosPlantilla([...ejerciciosPlantilla, { ejercicio_id: ejerciciosBase[0]?.id || 0, dia, orden: 0, series: '3', repeticiones: '10', peso: '', notas: '' }])} className="bg-slate-800 text-white text-[10px] md:text-xs px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold hover:bg-black flex items-center gap-1"><Plus size={14} /> AÑADIR</button>
                  </div>
                  <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[500px] md:min-w-0">
                        <thead className="bg-slate-50 text-[9px] md:text-[10px] font-black uppercase text-slate-400 border-b">
                          <tr><th className="px-4 md:px-8 py-4 w-1/2">EJERCICIO</th><th className="px-2 md:px-4 py-4 text-center w-24">SERIES</th><th className="px-2 md:px-4 py-4 text-center w-32">REPS</th><th className="px-2 md:px-4 py-4 w-16"></th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {ejsD.map((ej, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="px-4 md:px-8 py-4">
                                <select className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-800 uppercase appearance-none cursor-pointer text-xs md:text-sm" value={ej.ejercicio_id} onChange={e => updateEjercicioPlantilla(ej, 'ejercicio_id', parseInt(e.target.value))}>
                                  {[...ejerciciosBase].sort((a,b)=>a.grupo_muscular.localeCompare(b.grupo_muscular)).map(eb => <option key={eb.id} value={eb.id}>{eb.grupo_muscular}: {eb.nombre}</option>)}
                                </select>
                              </td>
                              <td className="px-2 md:px-4 py-4"><input className="w-full text-center border bg-slate-50 rounded-xl font-bold py-2 text-xs md:text-sm" value={ej.series} onChange={e => updateEjercicioPlantilla(ej, 'series', e.target.value)} /></td>
                              <td className="px-2 md:px-4 py-4"><input className="w-full text-center border bg-slate-50 rounded-xl font-bold py-2 text-xs md:text-sm" value={ej.repeticiones} onChange={e => updateEjercicioPlantilla(ej, 'repeticiones', e.target.value)} /></td>
                              <td className="px-2 md:px-4 py-4 text-center"><button onClick={()=>setEjerciciosPlantilla(ejerciciosPlantilla.filter(x=>x!==ej))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={20} /></button></td>
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
