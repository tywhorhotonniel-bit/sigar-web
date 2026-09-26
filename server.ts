import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, saveDb, hashPassword, queryAll, queryOne } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Extend express Request to hold user
interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    nombre_completo: string;
    rol: 'admin' | 'operador' | 'consultor';
    departamento: string;
  };
}

// Simple signed token generator without external dependency
// In local SQLite system, token is base64 of json + signature
const TOKEN_SECRET = 'SIGAR_LOCAL_SECRET_KEY_UNELLEZ_2026';

function generateToken(user: { id: number; username: string; rol: string }): string {
  const payload = JSON.stringify({ ...user, iat: Date.now() });
  const b64 = Buffer.from(payload).toString('base64');
  return `${b64}.${hashPassword(b64 + TOKEN_SECRET)}`;
}

async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'No autorizado: Se requiere token de sesión' });
  }

  const token = authHeader.substring(7);
  const parts = token.split('.');
  if (parts.length !== 2) {
    return res.status(401).json({ detail: 'Token inválido' });
  }

  const [b64, signature] = parts;
  if (signature !== hashPassword(b64 + TOKEN_SECRET)) {
    return res.status(401).json({ detail: 'Firma de autenticación inválida' });
  }

  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
    const db = await getDb();
    const user = queryOne<{
      id: number;
      username: string;
      nombre_completo: string;
      rol: 'admin' | 'operador' | 'consultor';
      departamento: string;
      activo: number;
    }>(db, 'SELECT id, username, nombre_completo, rol, departamento, activo FROM usuarios WHERE id = ?', [payload.id]);

    if (!user || user.activo === 0) {
      return res.status(401).json({ detail: 'Usuario inactivo o no encontrado' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: 'Error al verificar sesión' });
  }
}

// Role restriction middleware: only admin can execute
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({
      detail: 'Acceso Denegado: Solo el Administrador del Sistema puede realizar esta acción y gestionar roles.'
    });
  }
  next();
}

// Role restriction: admin or operator (read/write), consultant is read-only
function requireOperatorOrAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'operador')) {
    return res.status(403).json({
      detail: 'Acceso Denegado: Su rol es de solo lectura (Consultor / Auditor). No tiene permisos de modificación.'
    });
  }
  next();
}

// ======================== API ROUTES ========================

// 1. Health check & Ping
app.get('/ping', (_req, res) => {
  res.json({ status: 'ok', local: true, timestamp: new Date().toISOString() });
});

// 2. Authentication Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ detail: 'Usuario y contraseña requeridos' });
  }

  const passHash = hashPassword(password);
  const db = await getDb();
  const user = queryOne<{
    id: number;
    username: string;
    nombre_completo: string;
    rol: 'admin' | 'operador' | 'consultor';
    departamento: string;
    activo: number;
  }>(db, 'SELECT id, username, nombre_completo, rol, departamento, activo FROM usuarios WHERE username = ? AND password_hash = ?', [username, passHash]);

  if (!user) {
    return res.status(401).json({ detail: 'Usuario o contraseña incorrectos' });
  }

  if (user.activo === 0) {
    return res.status(403).json({ detail: 'Esta cuenta ha sido desactivada por el administrador.' });
  }

  const token = generateToken({ id: user.id, username: user.username, rol: user.rol });

  res.json({
    ok: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      nombre_completo: user.nombre_completo,
      rol: user.rol,
      departamento: user.departamento
    }
  });
});

// 3. Current User Info
app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// 4. USERS MANAGEMENT (STRICT ADMIN ONLY)
// "los roles que no sean intercambiables en los usuario que solo el administrador pueda crear y asisgnar los roles."
app.get('/api/usuarios', authMiddleware, requireAdmin, async (_req: AuthRequest, res: Response) => {
  const db = await getDb();
  const users = queryAll(db, 'SELECT id, username, nombre_completo, rol, departamento, creado_en, activo FROM usuarios ORDER BY id ASC');
  res.json(users);
});

// Admin creates a user and specifies their strict role
app.post('/api/usuarios', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  const { username, password, nombre_completo, rol, departamento } = req.body;

  if (!username || !password || !nombre_completo || !rol) {
    return res.status(400).json({ detail: 'Todos los campos son obligatorios (usuario, contraseña, nombre y rol)' });
  }

  const allowedRoles = ['admin', 'operador', 'consultor'];
  if (!allowedRoles.includes(rol)) {
    return res.status(400).json({ detail: 'Rol no válido. Solo se permite: admin, operador, consultor' });
  }

  const db = await getDb();
  const existing = queryOne(db, 'SELECT id FROM usuarios WHERE username = ?', [username]);
  if (existing) {
    return res.status(400).json({ detail: `El nombre de usuario "${username}" ya está registrado` });
  }

  const passHash = hashPassword(password);
  const now = new Date().toISOString();
  const dept = departamento || 'Almacén / Stock General';

  db.run(
    `INSERT INTO usuarios (username, password_hash, nombre_completo, rol, departamento, creado_en, activo)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [username, passHash, nombre_completo, rol, dept, now]
  );
  saveDb();

  res.status(201).json({
    ok: true,
    message: `Usuario "${username}" creado exitosamente con rol asignado: ${rol}`
  });
});

// Admin explicitly changes or assigns role
app.put('/api/usuarios/:id/rol', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { rol } = req.body;

  const allowedRoles = ['admin', 'operador', 'consultor'];
  if (!allowedRoles.includes(rol)) {
    return res.status(400).json({ detail: 'Rol no válido. Solo se permite: admin, operador, consultor' });
  }

  const db = await getDb();
  const targetUser = queryOne<{ id: number; username: string; rol: string }>(db, 'SELECT id, username, rol FROM usuarios WHERE id = ?', [userId]);
  if (!targetUser) {
    return res.status(404).json({ detail: 'Usuario no encontrado' });
  }

  // Prevent admin from demoting the last admin
  if (targetUser.rol === 'admin' && rol !== 'admin') {
    const adminCount = queryOne<{ count: number }>(db, "SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin' AND activo = 1");
    if (adminCount && adminCount.count <= 1) {
      return res.status(400).json({ detail: 'No se puede cambiar el rol del único administrador activo del sistema.' });
    }
  }

  db.run('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, userId]);
  saveDb();

  res.json({
    ok: true,
    message: `Rol del usuario "${targetUser.username}" actualizado a "${rol}" por el Administrador.`
  });
});

// Admin edits user (name, department, active status, optional password)
app.put('/api/usuarios/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  const { nombre_completo, departamento, activo, password, rol } = req.body;

  const db = await getDb();
  const targetUser = queryOne<{ id: number; username: string; rol: string }>(db, 'SELECT id, username, rol FROM usuarios WHERE id = ?', [userId]);
  if (!targetUser) {
    return res.status(404).json({ detail: 'Usuario no encontrado' });
  }

  if (password && password.trim() !== '') {
    const newPassHash = hashPassword(password);
    db.run('UPDATE usuarios SET password_hash = ? WHERE id = ?', [newPassHash, userId]);
  }

  if (nombre_completo) {
    db.run('UPDATE usuarios SET nombre_completo = ? WHERE id = ?', [nombre_completo, userId]);
  }

  if (departamento) {
    db.run('UPDATE usuarios SET departamento = ? WHERE id = ?', [departamento, userId]);
  }

  if (activo !== undefined) {
    db.run('UPDATE usuarios SET activo = ? WHERE id = ?', [activo ? 1 : 0, userId]);
  }

  // Admin can also update role here
  if (rol && ['admin', 'operador', 'consultor'].includes(rol)) {
    db.run('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, userId]);
  }

  saveDb();
  res.json({ ok: true, message: 'Usuario actualizado correctamente' });
});

// Admin deletes user
app.delete('/api/usuarios/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  if (req.user?.id === userId) {
    return res.status(400).json({ detail: 'No puede eliminar su propia cuenta de administrador en sesión.' });
  }

  const db = await getDb();
  db.run('DELETE FROM usuarios WHERE id = ?', [userId]);
  saveDb();
  res.json({ ok: true, message: 'Usuario eliminado del sistema' });
});

// 5. ACTIVOS (INVENTARIO) CRUD
// List all activos (accessible to all authenticated roles)
app.get('/api/activos', authMiddleware, async (req: Request, res: Response) => {
  const db = await getDb();
  const activos = queryAll(db, 'SELECT * FROM activos ORDER BY id ASC');
  res.json(activos);
});

// Create new activo (requires admin or operador)
app.post('/api/activos', authMiddleware, requireOperatorOrAdmin, async (req: AuthRequest, res: Response) => {
  const { id, nombre, categoria, asignado_a, ubicacion, estado, mantenimiento, fecha_mant, proximo_mant, desc_mant } = req.body;

  if (!id || !nombre || !asignado_a) {
    return res.status(400).json({ detail: 'El ID numérico, Nombre y Asignado a son requeridos.' });
  }

  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) {
    return res.status(400).json({ detail: 'El ID debe ser un número entero válido.' });
  }

  const db = await getDb();
  const existing = queryOne(db, 'SELECT id FROM activos WHERE id = ?', [idNum]);
  if (existing) {
    return res.status(400).json({ detail: `El código de activo ID ${idNum} ya existe en el inventario.` });
  }

  const hoyStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  db.run(
    `INSERT INTO activos (id, nombre, categoria, asignado_a, ubicacion, estado, mantenimiento, fecha_mant, proximo_mant, desc_mant, creado_por, actualizado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      idNum,
      nombre,
      categoria || 'General',
      asignado_a,
      ubicacion || 'Sin especificar',
      estado || 'Operativo',
      mantenimiento || 'No',
      mantenimiento !== 'No' ? (fecha_mant || hoyStr) : 'N/A',
      mantenimiento !== 'No' ? (proximo_mant || 'N/A') : 'N/A',
      desc_mant || '',
      req.user?.username || 'admin',
      hoyStr
    ]
  );
  saveDb();

  res.status(201).json({ ok: true, message: `Activo ID ${idNum} registrado exitosamente en la base de datos local.` });
});

// Update activo (requires admin or operador)
app.put('/api/activos/:id', authMiddleware, requireOperatorOrAdmin, async (req: AuthRequest, res: Response) => {
  const idBien = parseInt(req.params.id, 10);
  const db = await getDb();
  const existing = queryOne<{
    id: number;
    nombre: string;
    categoria: string;
    asignado_a: string;
    ubicacion: string;
    estado: string;
    mantenimiento: string;
    fecha_mant: string;
    proximo_mant: string;
    desc_mant: string;
  }>(db, 'SELECT * FROM activos WHERE id = ?', [idBien]);

  if (!existing) {
    return res.status(404).json({ detail: 'Activo no encontrado' });
  }

  const { nombre, categoria, asignado_a, ubicacion, estado, mantenimiento, fecha_mant, proximo_mant, desc_mant } = req.body;

  const finalNombre = nombre !== undefined && String(nombre).trim() !== '' ? String(nombre).trim() : existing.nombre;
  const finalAsignado = asignado_a !== undefined && String(asignado_a).trim() !== '' ? String(asignado_a).trim() : existing.asignado_a;

  if (!finalNombre || !finalAsignado) {
    return res.status(400).json({ detail: 'Nombre y Asignado a son requeridos.' });
  }

  const finalCategoria = categoria !== undefined ? categoria : existing.categoria;
  const finalUbicacion = ubicacion !== undefined ? ubicacion : existing.ubicacion;
  const finalEstado = estado !== undefined ? estado : existing.estado;
  const finalMantenimiento = mantenimiento !== undefined ? mantenimiento : existing.mantenimiento;
  const finalFechaMant = fecha_mant !== undefined ? fecha_mant : existing.fecha_mant;
  const finalProximoMant = proximo_mant !== undefined ? proximo_mant : existing.proximo_mant;
  const finalDescMant = desc_mant !== undefined ? desc_mant : existing.desc_mant;

  const hoyStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

  db.run(
    `UPDATE activos SET 
      nombre = ?, 
      categoria = ?, 
      asignado_a = ?, 
      ubicacion = ?, 
      estado = ?, 
      mantenimiento = ?, 
      fecha_mant = ?, 
      proximo_mant = ?, 
      desc_mant = ?, 
      actualizado_en = ?
     WHERE id = ?`,
    [
      finalNombre,
      finalCategoria || 'General',
      finalAsignado,
      finalUbicacion || 'Sin especificar',
      finalEstado || 'Operativo',
      finalMantenimiento || 'No',
      finalMantenimiento !== 'No' ? (finalFechaMant || 'N/A') : 'N/A',
      finalMantenimiento !== 'No' ? (finalProximoMant || 'N/A') : 'N/A',
      finalDescMant || '',
      hoyStr,
      idBien
    ]
  );
  saveDb();

  res.json({ ok: true, message: `Activo ID ${idBien} modificado exitosamente.` });
});

// Dar de baja (desincorporación con motivo obligatorio)
app.post('/api/activos/:id/baja', authMiddleware, requireOperatorOrAdmin, async (req: AuthRequest, res: Response) => {
  const idBien = parseInt(req.params.id, 10);
  const { motivo, responsable_baja } = req.body;

  if (!motivo || motivo.trim() === '') {
    return res.status(400).json({ detail: 'Debe ingresar una justificación / motivo detallado para dar de baja el activo.' });
  }

  const db = await getDb();
  const bien = queryOne<{
    id: number;
    nombre: string;
    categoria: string;
    asignado_a: string;
    mantenimiento: string;
    fecha_mant: string;
    desc_mant: string;
  }>(db, 'SELECT * FROM activos WHERE id = ?', [idBien]);

  if (!bien) {
    return res.status(404).json({ detail: 'Activo no encontrado en inventario.' });
  }

  const now = new Date();
  const fechaBajaStr = `${now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${now.toLocaleTimeString('es-ES')}`;
  const resp = responsable_baja || req.user?.nombre_completo || req.user?.username || 'Responsable de Bienes';
  const autorizadoPor = 'Dirección General de Bienes y Suministros UNELLEZ';

  // Insert into bajas table
  db.run(
    `INSERT INTO bajas (activo_id, nombre, asignado_a, categoria, mantenimiento, fecha_ultimo_mant, desc_mant, motivo_baja, responsable_baja, autorizado_por, fecha_baja)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bien.id,
      bien.nombre,
      bien.asignado_a,
      bien.categoria || 'General',
      bien.mantenimiento,
      bien.fecha_mant,
      bien.desc_mant || '',
      motivo.trim(),
      resp,
      autorizadoPor,
      fechaBajaStr
    ]
  );

  // Remove from active activos table
  db.run('DELETE FROM activos WHERE id = ?', [idBien]);
  saveDb();

  // Retrieve the generated baja record ID
  const bajaRecord = queryOne(db, 'SELECT * FROM bajas WHERE activo_id = ? ORDER BY id DESC LIMIT 1', [idBien]);

  res.json({
    ok: true,
    message: `El activo ID ${idBien} ha sido dado de baja exitosamente.`,
    baja: bajaRecord
  });
});

// Delete activo directly (admin only, for corrections)
app.delete('/api/activos/:id', authMiddleware, requireAdmin, async (req: AuthRequest, res: Response) => {
  const idBien = parseInt(req.params.id, 10);
  const db = await getDb();
  db.run('DELETE FROM activos WHERE id = ?', [idBien]);
  saveDb();
  res.json({ ok: true, message: `Activo ID ${idBien} eliminado definitivamente.` });
});

// 6. HISTORIAL DE BAJAS
app.get('/api/bajas', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const db = await getDb();
  const bajas = queryAll(db, 'SELECT * FROM bajas ORDER BY id DESC');
  res.json(bajas);
});

// 7. DEPARTAMENTOS
app.get('/api/departamentos', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const db = await getDb();
  const depts = queryAll<{ id: number; nombre: string }>(db, 'SELECT nombre FROM departamentos ORDER BY nombre ASC');
  res.json(depts.map((d) => d.nombre));
});

app.post('/api/departamentos', authMiddleware, requireOperatorOrAdmin, async (req: AuthRequest, res: Response) => {
  const { nombre } = req.body;
  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ detail: 'Nombre de departamento inválido' });
  }

  const db = await getDb();
  db.run('INSERT OR IGNORE INTO departamentos (nombre) VALUES (?)', [nombre.trim()]);
  saveDb();
  res.json({ ok: true, message: 'Departamento agregado' });
});

// 8. DASHBOARD STATS
app.get('/api/stats', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const db = await getDb();
  const totalActivos = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM activos')?.count || 0;
  const operativos = queryOne<{ count: number }>(db, "SELECT COUNT(*) as count FROM activos WHERE estado = 'Operativo'")?.count || 0;
  const enMantenimiento = queryOne<{ count: number }>(db, "SELECT COUNT(*) as count FROM activos WHERE mantenimiento != 'No'")?.count || 0;
  const preventivos = queryOne<{ count: number }>(db, "SELECT COUNT(*) as count FROM activos WHERE mantenimiento LIKE '%Preventivo%'")?.count || 0;
  const correctivos = queryOne<{ count: number }>(db, "SELECT COUNT(*) as count FROM activos WHERE mantenimiento LIKE '%Correctivo%'")?.count || 0;
  const totalBajas = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM bajas')?.count || 0;
  const totalUsuarios = queryOne<{ count: number }>(db, 'SELECT COUNT(*) as count FROM usuarios')?.count || 0;

  res.json({
    totalActivos,
    operativos,
    enMantenimiento,
    preventivos,
    correctivos,
    totalBajas,
    totalUsuarios
  });
});

// Setup Vite or static serving
async function startServer() {
  // Ensure database is initialized at launch
  await getDb();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIGAR UNELLEZ Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
