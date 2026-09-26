import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, UserPlus, ShieldAlert, CheckCircle2, UserX, Lock, KeyRound, Wrench, Eye, RefreshCw } from 'lucide-react';

interface AdminUsuariosViewProps {
  currentUser: User;
  usuarios: User[];
  onCrearUsuario: (data: {
    username: string;
    password: string;
    nombre_completo: string;
    rol: UserRole;
    departamento: string;
  }) => Promise<void>;
  onActualizarRol: (userId: number, nuevoRol: UserRole) => Promise<void>;
  onToggleEstado: (userId: number, activoActual: boolean) => Promise<void>;
  onEliminarUsuario: (userId: number) => Promise<void>;
  onRefresh: () => void;
}

export const AdminUsuariosView: React.FC<AdminUsuariosViewProps> = ({
  currentUser,
  usuarios,
  onCrearUsuario,
  onActualizarRol,
  onToggleEstado,
  onEliminarUsuario,
  onRefresh,
}) => {
  // If not admin, show locked state explaining the strict rule
  if (currentUser.rol !== 'admin') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center max-w-xl mx-auto shadow-xs my-8">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-2">
          Acceso Restringido: Panel Exclusivo del Administrador
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          De acuerdo con las políticas de seguridad del sistema SIGART,{' '}
          <strong>los roles de usuario son estrictos y no son intercambiables</strong>.
          Únicamente el usuario con rol de <strong>Administrador</strong> está autorizado para crear
          cuentas de usuario y asignar o modificar roles.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-left">
          <div className="text-slate-500 font-semibold mb-1">Información de su sesión actual:</div>
          <div className="font-mono text-slate-800">Usuario: {currentUser.username}</div>
          <div className="font-mono text-slate-800">
            Rol Asignado:{' '}
            <span className="font-bold text-[#003366]">
              {currentUser.rol === 'operador' ? 'Técnico / Operador' : 'Consultor / Auditor'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Si requiere privilegios administrativos adicionales, solicítelos al Administrador Central.
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  const [showModalCrear, setShowModalCrear] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newNombre, setNewNombre] = useState<string>('');
  const [newRol, setNewRol] = useState<UserRole>('operador');
  const [newDept, setNewDept] = useState<string>('Coordinación de Sistemas y Tecnología');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Role edit modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRol, setSelectedRol] = useState<UserRole>('operador');

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newUsername.trim() || !newPassword.trim() || !newNombre.trim()) {
      setErrorMsg('Por favor complete todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await onCrearUsuario({
        username: newUsername.trim(),
        password: newPassword.trim(),
        nombre_completo: newNombre.trim(),
        rol: newRol,
        departamento: newDept.trim(),
      });
      setSuccessMsg(`Usuario "${newUsername}" creado exitosamente con rol asignado: ${newRol}.`);
      setShowModalCrear(false);
      setNewUsername('');
      setNewPassword('');
      setNewNombre('');
      setNewRol('operador');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarCambioRol = async () => {
    if (!editingUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await onActualizarRol(editingUser.id, selectedRol);
      setSuccessMsg(`El rol de "${editingUser.username}" ha sido actualizado a "${selectedRol}" por el Administrador.`);
      setEditingUser(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al cambiar rol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner about Non-interchangeable Roles */}
      <div className="bg-[#003366] text-white p-5 rounded-xl shadow-xs border-b-2 border-[#F4B41A] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/10 rounded-lg shrink-0 border border-white/20">
            <ShieldCheck className="w-6 h-6 text-[#F4B41A]" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">
              Control de Usuarios y Asignación Exclusiva de Roles
            </h2>
            <p className="text-xs text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
              <strong>Regla de seguridad estricta:</strong> Los roles en SIGART no son intercambiables
              por los usuarios. Únicamente el <strong>Administrador</strong> tiene el privilegio de crear
              cuentas y asignar o revocar los roles dentro de la base de datos local SQLite.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            title="Refrescar lista"
            className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setErrorMsg('');
              setSuccessMsg('');
              setShowModalCrear(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md transition-colors shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-900" />
            <span>Crear Usuario y Asignar Rol</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Cuentas Registradas en Base de Datos Local ({usuarios.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Tabla: usuarios (SQLite)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#003366] text-white text-[11px] uppercase font-bold tracking-wider border-b-2 border-[#F4B41A]">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3 min-w-[180px]">Nombre Completo</th>
                <th className="px-4 py-3">Rol Asignado</th>
                <th className="px-4 py-3">Dependencia</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones de Administrador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usuarios.map((u) => {
                const isSelf = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">#{u.id}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {u.username}
                      {isSelf && (
                        <span className="ml-1.5 text-[10px] text-slate-400 font-sans">(Tú)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{u.nombre_completo}</td>
                    <td className="px-4 py-3">
                      {u.rol === 'admin' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Administrador
                        </span>
                      ) : u.rol === 'operador' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                          <Wrench className="w-3 h-3 text-sky-600" />
                          Técnico / Operador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                          <Eye className="w-3 h-3 text-slate-500" />
                          Consultor / Auditor
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.departamento}</td>
                    <td className="px-4 py-3 text-center">
                      {u.activo !== 0 ? (
                        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          Activo
                        </span>
                      ) : (
                        <span className="text-[11px] text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Cambiar rol */}
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setSelectedRol(u.rol);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#0b3c5d] bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors font-medium"
                          title="Cambiar rol (Solo Administrador)"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Asignar Rol</span>
                        </button>

                        {/* Toggle active */}
                        {!isSelf && (
                          <button
                            onClick={() => onToggleEstado(u.id, u.activo !== 0)}
                            className={`px-2 py-1 text-xs rounded transition-colors font-medium ${
                              u.activo !== 0
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={u.activo !== 0 ? 'Desactivar cuenta' : 'Activar cuenta'}
                          >
                            {u.activo !== 0 ? 'Desactivar' : 'Activar'}
                          </button>
                        )}

                        {/* Eliminar usuario */}
                        {!isSelf && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Está seguro de eliminar definitivamente al usuario "${u.username}"?`
                                )
                              ) {
                                onEliminarUsuario(u.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-700 rounded transition-colors"
                            title="Eliminar usuario"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear Usuario y Asignar Rol */}
      {showModalCrear && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#003366] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#F4B41A]">
              <h3 className="text-sm font-bold">Crear Cuenta y Asignar Rol</h3>
              <button
                onClick={() => setShowModalCrear(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre de Usuario (Login) *</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ej. r_perez"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contraseña Inicial *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre y Apellido *</label>
                <input
                  type="text"
                  required
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej. Ing. Roberto Pérez"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dependencia / Departamento</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="Ej. Coordinación de Sistemas"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              {/* Strict Role Assignment by Admin */}
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-md">
                <label className="block font-bold text-[#003366] mb-1.5">
                  Asignar Rol Institucional (Estricto / No Intercambiable) *
                </label>
                <select
                  value={newRol}
                  onChange={(e) => setNewRol(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-md font-medium text-slate-800"
                >
                  <option value="admin">Administrador (Control total, usuarios, bienes y actas)</option>
                  <option value="operador">Técnico / Operador (Gestión de bienes y mantenimientos)</option>
                  <option value="consultor">Consultor / Auditor (Solo lectura, consultas y actas)</option>
                </select>
                <span className="text-[10px] text-amber-900 mt-1 block">
                  El usuario no podrá cambiar este rol por su cuenta.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModalCrear(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creando...' : 'Crear y Asignar Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modificar Rol de Usuario */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 overflow-hidden">
            <div className="bg-[#003366] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#F4B41A]">
              <h3 className="text-sm font-bold">Modificar Rol de Usuario</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Usuario:</span>{' '}
                  <span className="font-bold text-slate-900 font-mono">{editingUser.username}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Nombre:</span>{' '}
                  <span className="font-semibold text-slate-800">{editingUser.nombre_completo}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Rol Actual:</span>{' '}
                  <span className="font-bold text-[#0b3c5d]">{editingUser.rol}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nuevo Rol a Asignar por el Administrador:
                </label>
                <select
                  value={selectedRol}
                  onChange={(e) => setSelectedRol(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366]"
                >
                  <option value="admin">Administrador (Control Total)</option>
                  <option value="operador">Técnico / Operador (Gestión de Bienes)</option>
                  <option value="consultor">Consultor / Auditor (Solo Lectura)</option>
                </select>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-normal">
                Esta modificación se registrará de inmediato en la base de datos local SQLite.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGuardarCambioRol}
                  className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Guardando...' : 'Confirmar Nuevo Rol'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
