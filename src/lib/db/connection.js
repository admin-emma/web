// src/lib/db/connection.js
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

// Variables para Docker o local
const DB_DIR = process.env.DATABASE_DIR || '/data';
const DB_FILE = process.env.DATABASE_FILE || 'app.db';
const DB_PATH = path.join(DB_DIR, DB_FILE);

// Asegura que el directorio exista (útil en contenedor y local)
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Conexión a SQLite
export const db = new Database(DB_PATH); // mismo comportamiento que antes
export default db;
