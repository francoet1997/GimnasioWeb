const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const { ejerciciosMaestros, plantillasMaestras } = require('./ejercicios_maestros');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

const dbPath = path.resolve(__dirname, process.env.DATABASE_NAME || 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error:', err.message);
  else {
    console.log('Base de datos conectada.');
    initDb();
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, genero TEXT, email TEXT, notas TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS ejercicios (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, grupo_muscular TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS rutinas (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER, nombre_rutina TEXT, fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS ejercicios_rutina (id INTEGER PRIMARY KEY AUTOINCREMENT, rutina_id INTEGER, ejercicio_id INTEGER, dia INTEGER, orden INTEGER, series TEXT, repeticiones TEXT, peso TEXT, notas TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS plantillas (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, genero TEXT, dias INTEGER)`);
    db.run(`CREATE TABLE IF NOT EXISTS ejercicios_plantilla (id INTEGER PRIMARY KEY AUTOINCREMENT, plantilla_id INTEGER, ejercicio_id INTEGER, dia INTEGER, orden INTEGER, series TEXT, repeticiones TEXT)`);

    db.all(`PRAGMA table_info(clientes)`, (err, rows) => {
      if (rows && !rows.some(r => r.name === 'email')) db.run(`ALTER TABLE clientes ADD COLUMN email TEXT`);
    });

    db.get("SELECT COUNT(*) as count FROM ejercicios", (err, row) => {
      if (row && row.count === 0) {
        const stmt = db.prepare("INSERT INTO ejercicios (nombre, grupo_muscular) VALUES (?, ?)");
        ejerciciosMaestros.forEach(x => stmt.run(x));
        stmt.finalize();
        plantillasMaestras.forEach(p => db.run("INSERT INTO plantillas (nombre, genero, dias) VALUES (?, ?, ?)", p));
      }
    });
  });
}

app.get('/api/clientes', (req, res) => db.all("SELECT * FROM clientes ORDER BY nombre", (err, rows) => res.json(rows || [])));
app.post('/api/clientes', (req, res) => {
  const { nombre, genero, email, notas } = req.body;
  db.run("INSERT INTO clientes (nombre, genero, email, notas) VALUES (?, ?, ?, ?)", [nombre, genero, email, notas], function() { res.json({ id: this.lastID }); });
});
app.delete('/api/clientes/:id', (req, res) => db.run("DELETE FROM clientes WHERE id = ?", [req.params.id], () => res.json({ success: true })));
app.get('/api/ejercicios', (req, res) => db.all("SELECT * FROM ejercicios ORDER BY grupo_muscular, nombre", (err, rows) => res.json(rows || [])));
app.post('/api/ejercicios', (req, res) => db.run("INSERT INTO ejercicios (nombre, grupo_muscular) VALUES (?, ?)", [req.body.nombre, req.body.grupo_muscular], function() { res.json({ id: this.lastID }); }));
app.get('/api/clientes/:id/rutinas', (req, res) => db.all("SELECT * FROM rutinas WHERE cliente_id = ? ORDER BY fecha_creacion DESC", [req.params.id], (err, rows) => res.json(rows || [])));
app.post('/api/clientes/:id/rutinas', (req, res) => db.run("INSERT INTO rutinas (cliente_id, nombre_rutina) VALUES (?, ?)", [req.params.id, req.body.nombre_rutina], function() { res.json({ id: this.lastID }); }));
app.delete('/api/rutinas/:id', (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM ejercicios_rutina WHERE rutina_id = ?", [req.params.id]);
    db.run("DELETE FROM rutinas WHERE id = ?", [req.params.id], () => res.json({ success: true }));
  });
});
app.get('/api/rutinas/:id/ejercicios', (req, res) => db.all("SELECT er.*, e.nombre as nombre_ejercicio, e.grupo_muscular FROM ejercicios_rutina er JOIN ejercicios e ON er.ejercicio_id = e.id WHERE er.rutina_id = ? ORDER BY er.dia, er.orden", [req.params.id], (err, rows) => res.json(rows || [])));
app.put('/api/rutinas/:id/ejercicios', (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM ejercicios_rutina WHERE rutina_id = ?", [req.params.id]);
    const stmt = db.prepare("INSERT INTO ejercicios_rutina (rutina_id, ejercicio_id, dia, orden, series, repeticiones, peso, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    req.body.ejercicios.forEach(ej => stmt.run([req.params.id, ej.ejercicio_id, ej.dia, ej.orden || 0, ej.series, ej.repeticiones, ej.peso, ej.notas]));
    stmt.finalize(() => res.json({ success: true }));
  });
});
app.get('/api/plantillas', (req, res) => db.all("SELECT * FROM plantillas ORDER BY genero, dias, nombre", (err, rows) => res.json(rows || [])));
app.post('/api/plantillas', (req, res) => {
  const { nombre, genero, dias } = req.body;
  db.run("INSERT INTO plantillas (nombre, genero, dias) VALUES (?, ?, ?)", [nombre, genero, dias], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
app.delete('/api/plantillas/:id', (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM ejercicios_plantilla WHERE plantilla_id = ?", [req.params.id]);
    db.run("DELETE FROM plantillas WHERE id = ?", [req.params.id], () => res.json({ success: true }));
  });
});
app.get('/api/plantillas/:id/ejercicios', (req, res) => db.all("SELECT ep.*, e.nombre as nombre_ejercicio, e.grupo_muscular FROM ejercicios_plantilla ep JOIN ejercicios e ON ep.ejercicio_id = e.id WHERE ep.plantilla_id = ? ORDER BY ep.dia, ep.orden", [req.params.id], (err, rows) => res.json(rows || [])));
app.put('/api/plantillas/:id/ejercicios', (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM ejercicios_plantilla WHERE plantilla_id = ?", [req.params.id]);
    const stmt = db.prepare("INSERT INTO ejercicios_plantilla (plantilla_id, ejercicio_id, dia, orden, series, repeticiones) VALUES (?, ?, ?, ?, ?, ?)");
    req.body.ejercicios.forEach(ej => stmt.run([req.params.id, ej.ejercicio_id, ej.dia, ej.orden || 0, ej.series, ej.repeticiones]));
    stmt.finalize(() => res.json({ success: true }));
  });
});

app.post('/api/rutinas/:id/enviar-mail', (req, res) => {
  const rutinaId = req.params.id;
  db.get("SELECT r.*, c.nombre as cliente_nombre, c.email as cliente_email FROM rutinas r JOIN clientes c ON r.cliente_id = c.id WHERE r.id = ?", [rutinaId], (err, rutina) => {
    if (!rutina || !rutina.cliente_email) return res.status(400).json({ error: 'Cliente sin email' });
    db.all("SELECT er.*, e.nombre as nombre_ejercicio, e.grupo_muscular FROM ejercicios_rutina er JOIN ejercicios e ON er.ejercicio_id = e.id WHERE er.rutina_id = ? ORDER BY er.dia, er.orden", [rutinaId], (err, ejs) => {
      
      const getDayColor = (dia) => {
        const colors = ['#f6c343', '#fef08a', '#bbf7d0', '#38bdf8', '#71717a', '#c084fc'];
        return colors[dia - 1] || '#f3f4f6';
      };

      const dias = [...new Set(ejs.map(e => e.dia))].sort();
      let html = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #000; background: #fff;">
          <div style="border-bottom: 4px solid #000; padding: 20px 0; margin-bottom: 20px;">
            <h1 style="text-transform: uppercase; font-size: 32px; font-weight: 900; margin: 0; line-height: 1;">${rutina.cliente_nombre}</h1>
            <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center;">
              <span style="background: #000; color: #fff; padding: 4px 12px; font-size: 14px; font-weight: 900; text-transform: uppercase;">${rutina.nombre_rutina}</span>
              <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #666;">FECHA: ${new Date().toLocaleDateString()}</span>
            </div>
          </div>
      `;

      dias.forEach(dia => {
        const ejsDia = ejs.filter(e => e.dia === dia);
        const grupos = [...new Set(ejsDia.map(e => e.grupo_muscular))];
        const dayColor = getDayColor(dia);
        const textColor = dia === 5 ? '#fff' : '#000';

        html += `
          <div style="margin-bottom: 40px;">
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
              <div style="width: 35px; height: 35px; background: ${dayColor}; color: ${textColor}; border: 3px solid #000; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; margin-right: 15px;">${dia}</div>
              <h2 style="font-size: 24px; font-weight: 900; text-transform: uppercase; font-style: italic; margin: 0;">DÍA ${dia}</h2>
              <div style="flex-grow: 1; border-bottom: 2px dashed #ccc; margin-left: 15px;"></div>
            </div>
        `;

        grupos.forEach(grupo => {
          const ejsG = ejsDia.filter(e => e.grupo_muscular === grupo);
          html += `
            <div style="border: 3px solid #000; margin-bottom: 20px; overflow: hidden;">
              <div style="background: #1e293b; color: #fff; padding: 6px 15px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">${grupo}</div>
              <table style="width: 100%; border-collapse: collapse; background: #fff;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1px solid #000;">
                    <th style="padding: 10px 15px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; width: 40%;">Movimiento</th>
                    <th style="padding: 10px 5px; text-align: center; font-size: 10px; font-weight: 900; text-transform: uppercase; width: 10%;">S</th>
                    <th style="padding: 10px 5px; text-align: center; font-size: 10px; font-weight: 900; text-transform: uppercase; width: 10%;">R</th>
                    <th style="padding: 10px 15px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; width: 15%;">Peso</th>
                    <th style="padding: 10px 15px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase;">Notas</th>
                  </tr>
                </thead>
                <tbody>
          `;

          ejsG.forEach(e => {
            html += `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px 15px; font-size: 13px; font-weight: 900; text-transform: uppercase; color: #000;">${e.nombre_ejercicio}</td>
                <td style="padding: 12px 5px; text-align: center; font-size: 16px; font-weight: 900; color: #000;">${e.series}</td>
                <td style="padding: 12px 5px; text-align: center; font-size: 16px; font-weight: 900; color: #000;">${e.repeticiones}</td>
                <td style="padding: 12px 15px; font-size: 14px; font-weight: 900; font-style: italic; color: #4f46e5;">${e.peso || '____'}</td>
                <td style="padding: 12px 15px; font-size: 10px; font-weight: 700; font-style: italic; color: #64748b; text-transform: uppercase;">${e.notas || ''}</td>
              </tr>
            `;
          });

          html += `</tbody></table></div>`;
        });
        html += `</div>`;
      });

      html += `
          <div style="margin-top: 50px; padding: 20px; border-top: 1px solid #eee; text-align: center; color: #94a3b8; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            Enviado desde GimnasioWeb Professional
          </div>
        </div>
      `;
      
      const mailOptions = { 
        from: `"Gimnasio" <${process.env.EMAIL_USER}>`, 
        to: rutina.cliente_email, 
        subject: `Tu Rutina: ${rutina.nombre_rutina}`, 
        html: html 
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('ERROR DETALLADO DE MAIL:', error);
          return res.status(500).json({ error: error.message });
        }
        res.json({ success: true });
      });
    });
  });
});

app.listen(PORT, () => console.log(`Servidor API corriendo en http://localhost:${PORT}`));
