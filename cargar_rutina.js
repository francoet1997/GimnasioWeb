const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const rutina = {
  nombre: 'Dama 2 Días',
  genero: 'Dama',
  dias: 2,
  ejercicios: [
    // DÍA 1
    { nombre: 'APERTURAS EN PECK DECK', grupo: 'PECHO', dia: 1, series: '3', reps: '12' },
    { nombre: 'JALON AL PECHO SUPINO', grupo: 'ESPALDA', dia: 1, series: '3', reps: '12' },
    { nombre: 'VUELOS LAT CON MANC', grupo: 'HOMBROS', dia: 1, series: '3', reps: '12' },
    { nombre: 'EXTENSIONES CON BARRA', grupo: 'TRICEPS', dia: 1, series: '3', reps: '12' },
    { nombre: 'PRENSA 45', grupo: 'TREN INFERIOR', dia: 1, series: '3', reps: '8' },
    { nombre: 'ELEVACIONES DE CADERA', grupo: 'TREN INFERIOR', dia: 1, series: '4', reps: '10' },
    { nombre: 'ABDUCTORES EN MAQUINA', grupo: 'TREN INFERIOR', dia: 1, series: '4', reps: '12' },
    { nombre: 'CAMILLA DE ISQUIOS', grupo: 'TREN INFERIOR', dia: 1, series: '3', reps: '12' },
    { nombre: 'TOQUES DE TOBILLO', grupo: 'ZONA MEDIA', dia: 1, series: '3', reps: '12' },
    { nombre: 'OBLICUOS CON DISCO', grupo: 'ZONA MEDIA', dia: 1, series: '3', reps: '12' },
    { nombre: 'ELVACION DE PIERNAS EN PISO', grupo: 'ZONA MEDIA', dia: 1, series: '3', reps: '12' },

    // DÍA 2
    { nombre: 'SENTADILLA HACK', grupo: 'TREN INFERIOR', dia: 2, series: '4', reps: '12' },
    { nombre: 'PATADA DE GLUETEO EN POLEA', grupo: 'TREN INFERIOR', dia: 2, series: '3', reps: '12' },
    { nombre: 'EXTENSION DE CUADRICEPS', grupo: 'TREN INFERIOR', dia: 2, series: '3', reps: '15' },
    { nombre: 'ADUCTORES EN MAQUINA', grupo: 'TREN INFERIOR', dia: 2, series: '3', reps: '12' },
    { nombre: 'CRUNCH', grupo: 'ZONA MEDIA', dia: 2, series: '3', reps: '12' },
    { nombre: 'BISAGRAS', grupo: 'ZONA MEDIA', dia: 2, series: '3', reps: '10' },
    { nombre: 'TOQUES DE TOBILLO', grupo: 'ZONA MEDIA', dia: 2, series: '3', reps: '10' }
  ]
};

db.serialize(() => {
  // 1. Asegurar que la plantilla existe (o actualizarla)
  db.run("INSERT OR IGNORE INTO plantillas (nombre, genero, dias) VALUES (?, ?, ?)", [rutina.nombre, rutina.genero, rutina.dias]);
  
  db.get("SELECT id FROM plantillas WHERE nombre = ? AND genero = ?", [rutina.nombre, rutina.genero], (err, row) => {
    if (err || !row) {
      console.error("No se encontró la plantilla");
      return;
    }
    const plantillaId = row.id;

    // Limpiar ejercicios previos de esta plantilla para no duplicar
    db.run("DELETE FROM ejercicios_plantilla WHERE plantilla_id = ?", [plantillaId]);

    // 2. Insertar los ejercicios
    const stmt = db.prepare("INSERT INTO ejercicios_plantilla (plantilla_id, ejercicio_id, dia, orden, series, repeticiones) VALUES (?, (SELECT id FROM ejercicios WHERE nombre = ? LIMIT 1), ?, ?, ?, ?)");
    
    rutina.ejercicios.forEach((ej, index) => {
      stmt.run([plantillaId, ej.nombre, ej.dia, index, ej.series, ej.reps], (err) => {
        if (err) console.error(`Error al insertar ejercicio ${ej.nombre}:`, err.message);
      });
    });

    stmt.finalize(() => {
      console.log(`Rutina '${rutina.nombre}' cargada correctamente en el stock.`);
      db.close();
    });
  });
});
