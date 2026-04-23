const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const mapeo = {
  'PECHO': ['PLANO HAMMER', 'INCLINADO EN MAQUINA', 'APERTURAS EN PECK DECK'],
  'HOMBROS': ['VUELOS LATERALES CON MANCUERNAS', 'POSTERIOR EN PECK DECK'],
  'TRICEPS': ['EXTENSIONES CON BARRA', 'TRASNUCA EN POLEA'],
  'ESPALDA': ['REMO EN T', 'JALON AL PECHO PRONO', 'REMO DORIAN'],
  'BICEPS': ['CURL ALTERNADO MANCUERNAS', 'CURL BAYESIAN'],
  'TREN INFERIOR': ['SENTADILLA HACK', 'PRENSA 45', 'EXTENSION DE CUADRICEPS', 'CAMILLA DE ISQUIOS', 'GEMELOS EN MAQUINA'],
  'ZONA MEDIA': ['OBLICUOS CON DISCO', 'ELEVACION DE PIERNAS EN PARALELAS', 'PLANCHAS FRONTALES', 'CRUNCH', 'PRESS PALLOF', 'ELEVACION DE PIERNAS EN PISO']
};

db.serialize(() => {
  for (const [grupo, ejercicios] of Object.entries(mapeo)) {
    const placeholders = ejercicios.map(() => '?').join(',');
    db.run(`UPDATE ejercicios SET grupo_muscular = ? WHERE nombre IN (${placeholders})`, [grupo, ...ejercicios]);
  }
  console.log("Maestro de ejercicios corregido.");
  db.close();
});
