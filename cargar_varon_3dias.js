const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const rutina = {
  plantilla_id: 2, // VARON 3 DIAS
  ejercicios: [
    // DÍA 1
    { nombre: 'PLANO HAMMER', grupo: 'PECHO', dia: 1, series: '4', reps: '8' },
    { nombre: 'INCLINADO EN MAQUINA', grupo: 'PECHO', dia: 1, series: '4', reps: '10' },
    { nombre: 'APERTURAS EN PECK DECK', grupo: 'PECHO', dia: 1, series: '4', reps: '12' },
    { nombre: 'VUELOS LATERALES CON MANCUERNAS', grupo: 'HOMBROS', dia: 1, series: '4', reps: '12' },
    { nombre: 'EXTENSIONES CON BARRA', grupo: 'TRICEPS', dia: 1, series: '4', reps: '12' },
    { nombre: 'TRASNUCA EN POLEA', grupo: 'TRICEPS', dia: 1, series: '4', reps: '12' },
    { nombre: 'OBLICUOS con disco', grupo: 'ZONA MEDIA', dia: 1, series: '3', reps: '12' },
    { nombre: 'ELEVACION DE PIERNAS EN PARALELAS', grupo: 'ZONA MEDIA', dia: 1, series: '3', reps: '10' },
    { nombre: 'PLANCHAS FRONTALES', grupo: 'ZONA MEDIA', dia: 1, series: '3', reps: '1 MINUTO' },

    // DÍA 2
    { nombre: 'REMO EN T', grupo: 'ESPALDA', dia: 2, series: '4', reps: '8' },
    { nombre: 'JALON AL PECHO PRONO', grupo: 'ESPALDA', dia: 2, series: '4', reps: '10' },
    { nombre: 'REMO DORIAN', grupo: 'ESPALDA', dia: 2, series: '4', reps: '10' },
    { nombre: 'POSTERIOR EN PECK DECK', grupo: 'HOMBROS', dia: 2, series: '4', reps: '12' },
    { nombre: 'CURL ALTERNADO MANCUERNAS', grupo: 'BICEPS', dia: 2, series: '4', reps: '10' },
    { nombre: 'CURL BAYESIAN', grupo: 'BICEPS', dia: 2, series: '4', reps: '12' },
    { nombre: 'CRUNCH', grupo: 'ZONA MEDIA', dia: 2, series: '3', reps: '12' },
    { nombre: 'PRESS PALLOF', grupo: 'ZONA MEDIA', dia: 2, series: '3', reps: '12' },
    { nombre: 'ELEVACION DE PIERNAS EN PISO', grupo: 'ZONA MEDIA', dia: 2, series: '3', reps: '10' },

    // DÍA 3
    { nombre: 'SENTADILLA HACK', grupo: 'TREN INFERIOR', dia: 3, series: '3', reps: '10' },
    { nombre: 'PRENSA 45', grupo: 'TREN INFERIOR', dia: 3, series: '3', reps: '12' },
    { nombre: 'EXTENSION DE CUADRICEPS', grupo: 'TREN INFERIOR', dia: 3, series: '3', reps: '10' },
    { nombre: 'CAMILLA DE ISQUIOS', grupo: 'TREN INFERIOR', dia: 3, series: '3', reps: '10' },
    { nombre: 'GEMELOS EN MAQUINA', grupo: 'TREN INFERIOR', dia: 3, series: '3', reps: '10' }
  ]
};

db.serialize(async () => {
  // 1. Primero asegurar que todos los ejercicios existan en el catálogo maestro
  const stmtCat = db.prepare("INSERT OR IGNORE INTO ejercicios (nombre, grupo_muscular) VALUES (?, ?)");
  for (const ej of rutina.ejercicios) {
    stmtCat.run([ej.nombre.toUpperCase(), ej.grupo.toUpperCase()]);
  }
  stmtCat.finalize();

  // 2. Limpiar la rutina previa de Varón 3 Días
  db.run("DELETE FROM ejercicios_plantilla WHERE plantilla_id = ?", [rutina.plantilla_id]);

  // 3. Insertar la nueva estructura
  const stmtPlantilla = db.prepare(`
    INSERT INTO ejercicios_plantilla (plantilla_id, ejercicio_id, dia, orden, series, repeticiones) 
    VALUES (?, (SELECT id FROM ejercicios WHERE nombre = ? AND grupo_muscular = ? LIMIT 1), ?, ?, ?, ?)
  `);

  rutina.ejercicios.forEach((ej, index) => {
    stmtPlantilla.run([rutina.plantilla_id, ej.nombre.toUpperCase(), ej.grupo.toUpperCase(), ej.dia, index, ej.series, ej.reps]);
  });

  stmtPlantilla.finalize(() => {
    console.log("Rutina VARON 3 DIAS cargada correctamente.");
    db.close();
  });
});
