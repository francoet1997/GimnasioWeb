const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Corregir en la tabla de grupos
  db.run("UPDATE grupos_musculares SET nombre = 'BICEPS' WHERE nombre = 'BÍCEPS'");
  db.run("UPDATE grupos_musculares SET nombre = 'TRICEPS' WHERE nombre = 'TRÍCEPS'");

  // 2. Corregir en la tabla de ejercicios (por si acaso)
  db.run("UPDATE ejercicios SET grupo_muscular = 'BICEPS' WHERE grupo_muscular = 'BÍCEPS'");
  db.run("UPDATE ejercicios SET grupo_muscular = 'TRICEPS' WHERE grupo_muscular = 'TRÍCEPS'");

  // 3. Eliminar duplicados si quedaron (BICEPS y BÍCEPS a la vez)
  db.run(`DELETE FROM grupos_musculares 
          WHERE id NOT IN (SELECT MIN(id) FROM grupos_musculares GROUP BY nombre)`);

  console.log("Base de datos limpiada: Se eliminaron tildes y duplicados en BICEPS y TRICEPS.");
  db.close();
});
