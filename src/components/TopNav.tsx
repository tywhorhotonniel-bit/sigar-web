import React, { useState } from 'react';
import { User, Activo } from '../types';
import { getMaintenanceStatus } from '../utils/maintenance';
import { ShieldCheck, Wrench, Eye, LogOut, Database, Users, Archive, Package, PlusCircle, Bell, BellRing, Clock, AlertTriangle } from 'lucide-react';
import { UnellezLogo, SigartLogo } from './logos';

interface TopNavProps {
  user: User;
  activeTab: 'activos' | 'bajas' | 'usuarios';
  setActiveTab: (tab: 'activos' | 'bajas' | 'usuarios') => void;
  onLogout: () => void;
  onOpenNuevoActivo?: () => void;
  activosEnAlarma?: Activo[];
  onSeleccionarActivoAlarma?: (activo: Activo) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenNuevoActivo,
  activosEnAlarma = [],
  onSeleccionarActivoAlarma,
}) => {
  const [showBellDropdown, setShowBellDropdown] = useState<boolean>(false);

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Administrador (Control Total)
          </span>
        );
      case 'operador':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003366] bg-sky-100 border border-sky-300 px-2.5 py-0.5 rounded-full">
            <Wrench className="w-3.5 h-3.5 text-[#003366]" />
            Técnico / Operador
          </span>
        );
      case 'consultor':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-200 border border-slate-300 px-2.5 py-0.5 rounded-full">
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            Consultor / Auditor (Lectura)
          </span>
        );
    }
  };

  const totalAlarmas = activosEnAlarma.length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top UNELLEZ institutional ribbon: Navy #003366 + Golden Yellow #F4B41A */}
      <div className="bg-[#003366] text-white text-xs px-4 sm:px-8 py-2 flex items-center justify-between border-b-2 border-[#F4B41A]">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-xs">
            <UnellezLogo size={18} />
          </div>
          <span className="font-bold tracking-wide text-white">UNELLEZ</span>
          <span className="text-amber-300/60 hidden sm:inline">|</span>
          <span className="text-slate-100 hidden sm:inline font-medium">
            Universidad Nacional Experimental de los Llanos Occidentales “Ezequiel Zamora”
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-amber-200">
          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-full text-slate-100">
            <Database className="w-3 h-3 text-[#F4B41A]" />
            <span>SQLite Local</span>
          </span>
          <span className="hidden md:inline text-amber-400">·</span>
          <span className="hidden md:inline text-amber-100">Roles Fijos Inmutables</span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shadow-xs shrink-0">
            <SigartLogo size={36} showText={false} />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold tracking-tight text-[#003366] leading-tight">
              SIGART
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              Sistema de Gestión de Activos y Reportes Tecnológicos
            </div>
          </div>
        </div>

        {/* Center Zone: Navigation tabs with friendly styling */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('activos')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'activos'
                ? 'bg-[#003366] text-[#F4B41A] shadow-xs'
                : 'text-slate-600 hover:text-[#003366] hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario de Activos</span>
          </button>

          <button
            onClick={() => setActiveTab('bajas')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'bajas'
                ? 'bg-[#003366] text-[#F4B41A] shadow-xs'
                : 'text-slate-600 hover:text-[#003366] hover:bg-slate-100'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Actas de Baja</span>
          </button>

          {/* User management tab: Only Admin can access */}
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'usuarios'
                ? 'bg-[#003366] text-[#F4B41A] shadow-xs'
                : user.rol === 'admin'
                ? 'text-slate-600 hover:text-[#003366] hover:bg-slate-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestión de Roles</span>
            {user.rol === 'admin' && (
              <span className="w-2 h-2 rounded-full bg-[#F4B41A] ml-0.5" title="Panel Exclusivo de Administrador"></span>
            )}
          </button>
        </nav>

        {/* Right Zone: User Profile and Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Alarms Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowBellDropdown(!showBellDropdown)}
              title={
                totalAlarmas > 0
                  ? `🚨 Hay ${totalAlarmas} equipo(s) con mantenimiento hoy o pendiente`
                  : 'Sin mantenimientos vencidos hoy'
              }
              className={`p-2 rounded-lg transition-all relative ${
                totalAlarmas > 0
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 animate-pulse'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {totalAlarmas > 0 ? (
                <BellRing className="w-5 h-5 text-red-600" />
              ) : (
                <Bell className="w-5 h-5 text-slate-500" />
              )}
              {totalAlarmas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
                  {totalAlarmas}
                </span>
              )}
            </button>

            {/* Dropdown list of alarms */}
            {showBellDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-300 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="bg-[#003366] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#F4B41A]">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Alarmas de Mantenimiento ({totalAlarmas})
                  </span>
                  <button
                    onClick={() => setShowBellDropdown(false)}
                    className="text-white/80 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1">
                  {totalAlarmas === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      ✓ No hay equipos que requieran mantenimiento el día de hoy.
                    </div>
                  ) : (
                    activosEnAlarma.map((activo) => {
                      const mant = getMaintenanceStatus(activo.proximo_mant);
                      return (
                        <div
                          key={activo.id}
                          onClick={() => {
                            setShowBellDropdown(false);
                            onSeleccionarActivoAlarma?.(activo);
                          }}
                          className="p-2.5 hover:bg-amber-50/70 transition-colors cursor-pointer rounded-lg text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                              {activo.nombre}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-[#003366]">
                              #{activo.id}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {mant.status === 'hoy' ? (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                Pautado para hoy
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {mant.label}
                              </span>
                            )}
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-1 truncate">
                            Asignado: {activo.asignado_a}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {totalAlarmas > 0 && (
                  <div className="p-2 bg-slate-50 text-[10px] text-slate-500 text-center border-t border-slate-200">
                    Alarma diaria activa hasta registrar el trabajo
                  </div>
                )}
              </div>
            )}
          </div>

          {user.rol !== 'consultor' && onOpenNuevoActivo && (
            <button
              onClick={onOpenNuevoActivo}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-900" />
              <span>Registrar Activo</span>
            </button>
          )}

          <div className="hidden md:flex flex-col items-end text-right border-l border-slate-200 pl-3">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
              {user.nombre_completo || user.username}
            </span>
            <div className="mt-0.5">{getRoleBadge(user.rol)}</div>
          </div>

          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};
