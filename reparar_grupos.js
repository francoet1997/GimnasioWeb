const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Corregir los nombres en los ejercicios para que apunten a los grupos sin tilde
  db.run("UPDATE ejercicios SET grupo_muscular = 'BICEPS' WHERE grupo_muscular = 'BÍCEPS'");
  db.run("UPDATE ejercicios SET grupo_muscular = 'TRICEPS' WHERE grupo_muscular = 'TRÍCEPS'");

  // 2. Borrar ABSOLUTAMENTE TODO de la tabla grupos_musculares
  db.run("DELETE FROM grupos_musculares", () => {
    // 3. Insertar los 7 grupos oficiales de nuevo, limpios
    const oficiales = ['PECHO', 'ESPALDA', 'ZONA MEDIA', 'TREN INFERIOR', 'HOMBROS', 'TRICEPS', 'BICEPS'];
    const stmt = db.prepare("INSERT INTO grupos_musculares (nombre) VALUES (?)");
    oficiales.forEach(g => stmt.run(g));
    stmt.finalize();
    console.log("Limpieza total completada. Grupos restaurados a los 7 oficiales.");
    db.close();
  });
});
