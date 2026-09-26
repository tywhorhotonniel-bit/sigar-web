import initSqlJs, { type Database, type SqlValue } from 'sql.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sigar_local.sqlite');

let dbInstance: Database | null = null;

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
    initSchema(dbInstance);
    seedData(dbInstance);
    saveDb();
  }

  // Ensure tables exist even if file already existed
  initSchema(dbInstance);
  saveDb();

  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initSchema(db: Database) {
  // Usuarios table
  // Roles allowed: 'admin' (Administrador), 'operador' (Técnico Mantenimiento), 'consultor' (Auditor / Lector)
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      nombre_completo TEXT NOT NULL,
      rol TEXT NOT NULL,
      departamento TEXT NOT NULL,
      creado_en TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1
    );
  `);

  // Activos table
  db.run(`
    CREATE TABLE IF NOT EXISTS activos (
      id INTEGER PRIMARY KEY,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      asignado_a TEXT NOT NULL,
      ubicacion TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'Operativo',
      mantenimiento TEXT NOT NULL DEFAULT 'No',
      fecha_mant TEXT NOT NULL DEFAULT 'N/A',
      proximo_mant TEXT NOT NULL DEFAULT 'N/A',
      desc_mant TEXT DEFAULT '',
      creado_por TEXT DEFAULT 'admin',
      actualizado_en TEXT NOT NULL
    );
  `);

  // Bajas table (Desincorporaciones con justificación)
  db.run(`
    CREATE TABLE IF NOT EXISTS bajas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activo_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      asignado_a TEXT NOT NULL,
      categoria TEXT NOT NULL,
      mantenimiento TEXT NOT NULL,
      fecha_ultimo_mant TEXT NOT NULL,
      desc_mant TEXT DEFAULT '',
      motivo_baja TEXT NOT NULL,
      responsable_baja TEXT NOT NULL,
      autorizado_por TEXT NOT NULL,
      fecha_baja TEXT NOT NULL
    );
  `);

  // Departamentos table
  db.run(`
    CREATE TABLE IF NOT EXISTS departamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT UNIQUE NOT NULL
    );
  `);

  // Auditoria table
  db.run(`
    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL,
      accion TEXT NOT NULL,
      detalles TEXT NOT NULL,
      fecha TEXT NOT NULL
    );
  `);
}

function seedData(db: Database) {
  const adminPass = hashPassword('admin123');
  const tecnicoPass = hashPassword('tecnico123');
  const auditorPass = hashPassword('auditor123');
  const fechaHoy = new Date().toISOString();

  // Usuarios base
  db.run(
    `INSERT OR IGNORE INTO usuarios (username, password_hash, nombre_completo, rol, departamento, creado_en, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['admin', adminPass, 'Administrador Central SIGAR', 'admin', 'Dirección General de Bienes y Suministros', fechaHoy, 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuarios (username, password_hash, nombre_completo, rol, departamento, creado_en, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['tecnico_sistemas', tecnicoPass, 'Ing. Carlos Mendoza (Técnico)', 'operador', 'Coordinación de Sistemas y Tecnología', fechaHoy, 1]
  );

  db.run(
    `INSERT OR IGNORE INTO usuarios (username, password_hash, nombre_completo, rol, departamento, creado_en, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['auditor_bienes', auditorPass, 'Lic. Maria Gonzalez (Auditora)', 'consultor', 'Unidad de Auditoría Interna UNELLEZ', fechaHoy, 1]
  );

  // Departamentos
  const depts = [
    'Almacén / Stock General',
    'Coordinación de Sistemas y Tecnología',
    'Dirección General de Bienes y Suministros',
    'Recursos Humanos y Nómina',
    'Despacho Rectoral',
    'Laboratorio de Biología y Recursos Naturales',
    'Auditorio Barinas I',
    'Sala de Servidores Central',
    'Dirección de Admisión y Registro'
  ];

  for (const dept of depts) {
    db.run(`INSERT OR IGNORE INTO departamentos (nombre) VALUES (?)`, [dept]);
  }

  // Sistema en limpio (Recién instalado):
  // No se pre-cargan activos ni actas de baja ficticias para permitir pruebas desde cero.
}

// Helper to query all rows as typed objects
export function queryAll<T = Record<string, unknown>>(db: Database, sql: string, params: SqlValue[] = []): T[] {
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

// Helper to query single row
export function queryOne<T = Record<string, unknown>>(db: Database, sql: string, params: SqlValue[] = []): T | null {
  const all = queryAll<T>(db, sql, params);
  return all.length > 0 ? all[0] : null;
}
