import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Activo, Baja, DashboardStats, UserRole } from './types';
import { api } from './services/api';
import { LoginScreen } from './components/LoginScreen';
import { TopNav } from './components/TopNav';
import { DashboardStats as DashboardStatsComponent } from './components/DashboardStats';
import { ActivosTable } from './components/ActivosTable';
import { ActivoFormModal } from './components/ActivoFormModal';
import { BajaModal } from './components/BajaModal';
import { HistorialBajasView } from './components/HistorialBajasView';
import { AdminUsuariosView } from './components/AdminUsuariosView';
import { ActaPreviewModal } from './components/ActaPreviewModal';
import { MantenimientoAlarmaBanner } from './components/MantenimientoAlarmaBanner';
import { RegistrarMantenimientoModal } from './components/RegistrarMantenimientoModal';
import { getMaintenanceStatus } from './utils/maintenance';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Active view tab: 'activos' | 'bajas' | 'usuarios'
  const [activeTab, setActiveTab] = useState<'activos' | 'bajas' | 'usuarios'>('activos');

  // Data states
  const [activos, setActivos] = useState<Activo[]>([]);
  const [bajas, setBajas] = useState<Baja[]>([]);
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingActivo, setEditingActivo] = useState<Activo | null>(null);
  const [isBajaOpen, setIsBajaOpen] = useState<boolean>(false);
  const [activoParaBaja, setActivoParaBaja] = useState<Activo | null>(null);
  const [isPreviewActaOpen, setIsPreviewActaOpen] = useState<boolean>(false);
  const [actaParaPreview, setActaParaPreview] = useState<Baja | null>(null);

  // Quick maintenance registration modal
  const [isRegistrarMantOpen, setIsRegistrarMantOpen] = useState<boolean>(false);
  const [activoParaMantenimiento, setActivoParaMantenimiento] = useState<Activo | null>(null);

  // Check existing session on launch
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getMe()
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          api.clearToken();
          setCurrentUser(null);
        })
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, []);

  // Load all system data
  const loadSystemData = useCallback(async () => {
    if (!currentUser) return;
    setDataLoading(true);
    try {
      const [activosData, bajasData, deptsData, statsData] = await Promise.all([
        api.getActivos(),
        api.getBajas(),
        api.getDepartamentos(),
        api.getStats(),
      ]);

      setActivos(activosData);
      setBajas(bajasData);
      setDepartamentos(deptsData);
      setStats(statsData);

      // If user is admin, also fetch user accounts
      if (currentUser.rol === 'admin') {
        const usersData = await api.getUsuarios();
        setUsuarios(usersData);
      }
    } catch (err) {
      console.error('Error al cargar datos del sistema:', err);
    } finally {
      setDataLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadSystemData();
    }
  }, [currentUser, loadSystemData]);

  // Compute assets currently in alarm state (due today or overdue)
  const activosEnAlarma = useMemo(() => {
    return activos.filter((a) => {
      if (a.mantenimiento === 'No' || !a.proximo_mant || a.proximo_mant === 'N/A') return false;
      const status = getMaintenanceStatus(a.proximo_mant);
      return status.esAlarma;
    });
  }, [activos]);

  // Handle Login
  const handleLogin = async (u: string, p: string) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.login(u, p);
      setCurrentUser(res.user);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setActiveTab('activos');
  };

  // Activo Actions
  const handleOpenNuevoActivo = () => {
    setEditingActivo(null);
    setIsFormOpen(true);
  };

  const handleEditarActivo = (activo: Activo) => {
    setEditingActivo(activo);
    setIsFormOpen(true);
  };

  const handleSaveActivo = async (data: Partial<Activo>) => {
    if (editingActivo) {
      await api.updateActivo(editingActivo.id, data);
    } else {
      await api.createActivo(data);
    }
    await loadSystemData();
  };

  const handleOpenDarDeBaja = (activo: Activo) => {
    setActivoParaBaja(activo);
    setIsBajaOpen(true);
  };

  const handleConfirmBaja = async (id: number, motivo: string, responsable?: string): Promise<Baja> => {
    const res = await api.darDeBaja(id, motivo, responsable);
    await loadSystemData();
    return res.baja;
  };

  const handleEliminarActivo = async (id: number) => {
    await api.deleteActivo(id);
    await loadSystemData();
  };

  const handleVerActa = (baja: Baja) => {
    setActaParaPreview(baja);
    setIsPreviewActaOpen(true);
  };

  // Quick maintenance registration
  const handleOpenRegistrarMantenimiento = (activo: Activo) => {
    setActivoParaMantenimiento(activo);
    setIsRegistrarMantOpen(true);
  };

  const handleGuardarMantenimiento = async (activoId: number, data: Partial<Activo>) => {
    await api.updateActivo(activoId, data);
    await loadSystemData();
  };

  // Admin User & Role actions
  const handleCrearUsuario = async (userData: {
    username: string;
    password: string;
    nombre_completo: string;
    rol: UserRole;
    departamento: string;
  }) => {
    await api.createUsuario(userData);
    await loadSystemData();
  };

  const handleActualizarRol = async (userId: number, nuevoRol: UserRole) => {
    await api.updateUsuarioRol(userId, nuevoRol);
    await loadSystemData();
  };

  const handleToggleEstadoUsuario = async (userId: number, activoActual: boolean) => {
    await api.updateUsuario(userId, { activo: activoActual ? 0 : 1 });
    await loadSystemData();
  };

  const handleEliminarUsuario = async (userId: number) => {
    await api.deleteUsuario(userId);
    await loadSystemData();
  };

  // Loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#003366] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-amber-300/30 border-t-[#F4B41A] rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-amber-200">Iniciando base de datos local SQLite...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        loading={loginLoading}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar with UNELLEZ Ribbon, wordmark, tabs, alarms bell, profile, and logout */}
      <TopNav
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenNuevoActivo={handleOpenNuevoActivo}
        activosEnAlarma={activosEnAlarma}
        onSeleccionarActivoAlarma={handleOpenRegistrarMantenimiento}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Daily Maintenance Alarm Banner (Triggers chime & notification) */}
        <MantenimientoAlarmaBanner
          activos={activos}
          userRole={currentUser.rol}
          onRegistrarMantenimiento={handleOpenRegistrarMantenimiento}
        />

        {/* Institutional notice bar on strict roles */}
        <div className="mb-4 bg-sky-50/80 border-l-4 border-l-[#003366] border border-sky-200 rounded-r-lg p-3 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0" />
            <span>
              <strong>Sistema Local Activo:</strong> Base de datos SQLite local conectada. Los roles de
              usuario son <strong>estrictos e inmutables</strong> por los operadores; únicamente el
              Administrador puede crear cuentas y asignar roles.
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#003366] shrink-0 font-semibold bg-white/80 px-2 py-0.5 rounded border border-sky-200">
            Sesión: <span>{currentUser.username}</span> ({currentUser.rol})
          </div>
        </div>

        {/* Dashboard Stats (Con código cromático Verde, Azul, Naranja, Rojo) */}
        <DashboardStatsComponent stats={stats} />

        {/* Tab Content */}
        {activeTab === 'activos' && (
          <ActivosTable
            activos={activos}
            departamentos={departamentos}
            userRole={currentUser.rol}
            onEditar={handleEditarActivo}
            onDarDeBaja={handleOpenDarDeBaja}
            onEliminar={handleEliminarActivo}
            onNuevoActivo={handleOpenNuevoActivo}
            onRegistrarMantenimiento={handleOpenRegistrarMantenimiento}
          />
        )}

        {activeTab === 'bajas' && (
          <HistorialBajasView
            bajas={bajas}
            onVerActa={handleVerActa}
          />
        )}

        {activeTab === 'usuarios' && (
          <AdminUsuariosView
            currentUser={currentUser}
            usuarios={usuarios}
            onCrearUsuario={handleCrearUsuario}
            onActualizarRol={handleActualizarRol}
            onToggleEstado={handleToggleEstadoUsuario}
            onEliminarUsuario={handleEliminarUsuario}
            onRefresh={loadSystemData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-[#003366]">SIGART UNELLEZ</strong> · Sistema de Gestión de Activos y Reportes Tecnológicos
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Base Local: sigar_local.sqlite · Dirección General de Bienes y Suministros
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ActivoFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveActivo}
        initialData={editingActivo}
        departamentos={departamentos}
        userRole={currentUser.rol}
      />

      <BajaModal
        isOpen={isBajaOpen}
        onClose={() => setIsBajaOpen(false)}
        activo={activoParaBaja}
        onConfirmBaja={handleConfirmBaja}
        onVerActa={handleVerActa}
        userRole={currentUser.rol}
        currentUserName={currentUser.nombre_completo || currentUser.username}
      />

      <ActaPreviewModal
        isOpen={isPreviewActaOpen}
        onClose={() => setIsPreviewActaOpen(false)}
        baja={actaParaPreview}
      />

      {/* Quick Maintenance Registration Modal (Clears Daily Alarm) */}
      <RegistrarMantenimientoModal
        isOpen={isRegistrarMantOpen}
        onClose={() => setIsRegistrarMantOpen(false)}
        activo={activoParaMantenimiento}
        onGuardar={handleGuardarMantenimiento}
      />
    </div>
  );
}
