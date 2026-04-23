export interface Cliente {
  id: number;
  nombre: string;
  genero: 'Varón' | 'Dama';
  email: string;
  notas: string;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  grupo_muscular: string;
}

export interface Rutina {
  id: number;
  cliente_id: number;
  nombre_rutina: string;
  fecha_creacion: string;
}

export interface Plantilla {
  id: number;
  nombre: string;
  genero: 'Varón' | 'Dama';
  dias: number;
}

export interface EjercicioRutina {
  id?: number;
  ejercicio_id: number;
  nombre_ejercicio?: string;
  grupo_muscular?: string;
  dia: number;
  orden: number;
  series: string;
  repeticiones: string;
  rir: string;
  notas: string;
}

export type View = 'list' | 'cliente' | 'editor' | 'config' | 'plantillas' | 'plantillaEditor';
