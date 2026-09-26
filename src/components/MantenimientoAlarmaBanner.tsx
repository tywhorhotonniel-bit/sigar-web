import React, { useState, useEffect } from 'react';
import { Activo, UserRole } from '../types';
import { getMaintenanceStatus, reproducirAlarmaAudio, notificarAlarmaNavegador } from '../utils/maintenance';
import { BellRing, Volume2, VolumeX, Wrench, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface MantenimientoAlarmaBannerProps {
  activos: Activo[];
  userRole: UserRole;
  onRegistrarMantenimiento: (activo: Activo) => void;
}

export const MantenimientoAlarmaBanner: React.FC<MantenimientoAlarmaBannerProps> = ({
  activos,
  userRole,
  onRegistrarMantenimiento,
}) => {
  const [expandido, setExpandido] = useState<boolean>(true);
  const [sonidoHabilitado, setSonidoHabilitado] = useState<boolean>(true);
  const [alarmaSonada, setAlarmaSonada] = useState<boolean>(false);

  // Filter assets that are in alarm state (due today or overdue)
  const equiposEnAlarma = activos
    .filter((a) => a.mantenimiento !== 'No' && a.proximo_mant !== 'N/A')
    .map((a) => {
      const mantInfo = getMaintenanceStatus(a.proximo_mant);
      return {
        activo: a,
        mantInfo,
      };
    })
    .filter((item) => item.mantInfo.esAlarma);

  // Play audio chime and trigger browser notification on mount or when alarm count > 0
  useEffect(() => {
    if (equiposEnAlarma.length > 0 && !alarmaSonada) {
      if (sonidoHabilitado) {
        reproducirAlarmaAudio();
      }
      const nombres = equiposEnAlarma.slice(0, 3).map((e) => `#${e.activo.id} ${e.activo.nombre}`).join(', ');
      notificarAlarmaNavegador(equiposEnAlarma.length, nombres);
      setAlarmaSonada(true);
    }
  }, [equiposEnAlarma.length, alarmaSonada, sonidoHabilitado]);

  if (equiposEnAlarma.length === 0) {
    return null;
  }

  const hoyCount = equiposEnAlarma.filter((e) => e.mantInfo.status === 'hoy').length;
  const vencidosCount = equiposEnAlarma.filter((e) => e.mantInfo.status === 'vencido').length;

  const handleProbarSonido = () => {
    reproducirAlarmaAudio();
    setSonidoHabilitado(true);
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 border-2 border-red-500/70 rounded-xl shadow-md overflow-hidden transition-all">
      {/* Top Banner Alert Bar */}
      <div className="bg-red-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-white/20 rounded-full animate-bounce">
            <BellRing className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="font-black text-sm tracking-wide uppercase text-white">
              🚨 ALERTA DIARIA DE MANTENIMIENTO TÉCNICO
            </span>
            <span className="hidden sm:inline text-xs text-red-100 ml-2 font-medium">
              (Se repetirá diariamente hasta registrar su ejecución)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              if (!sonidoHabilitado) handleProbarSonido();
              else setSonidoHabilitado(false);
            }}
            title={sonidoHabilitado ? 'Silenciar alarma sonora' : 'Activar alarma sonora'}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-md transition-colors font-medium text-white"
          >
            {sonidoHabilitado ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden md:inline">Sonido Activo</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-red-200" />
                <span className="hidden md:inline">Silenciado</span>
              </>
            )}
          </button>

          {/* Toggle Expand */}
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-1 text-xs text-white/90 hover:text-white px-2 py-1 rounded bg-black/10 transition-colors"
          >
            <span>{expandido ? 'Ocultar' : 'Ver Equipos'}</span>
            {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 border-b border-red-200">
        <div className="text-xs text-slate-800">
          Hay <strong className="text-red-700 font-mono text-sm">{equiposEnAlarma.length}</strong>{' '}
          equipo(s) que requieren atención técnica urgente:{' '}
          {hoyCount > 0 && (
            <span className="text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded-full mr-1.5">
              📅 {hoyCount} pautado(s) para hoy
            </span>
          )}
          {vencidosCount > 0 && (
            <span className="text-red-800 font-semibold bg-red-100 px-2 py-0.5 rounded-full">
              ⚠️ {vencidosCount} con retraso / pendiente
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          🔔 Notificación activa en base de datos local SQLite
        </div>
      </div>

      {/* Expanded Equipment List */}
      {expandido && (
        <div className="p-4 sm:px-6 divide-y divide-slate-200/80 max-h-72 overflow-y-auto bg-slate-50/50">
          {equiposEnAlarma.map(({ activo, mantInfo }) => (
            <div
              key={activo.id}
              className="py-3 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                    ID #{activo.id}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{activo.nombre}</span>
                  {mantInfo.status === 'hoy' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded-full animate-pulse">
                      <Clock className="w-3 h-3 text-amber-800" />
                      ¡DÍA DE MANTENIMIENTO HOY!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-900 bg-red-200/90 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-red-800" />
                      {mantInfo.label}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 flex items-center gap-2">
                  <span>
                    Asignado a: <strong>{activo.asignado_a}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Régimen: {activo.mantenimiento}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Pautado: {activo.proximo_mant}</span>
                </div>
              </div>

              {/* Action Button */}
              {userRole !== 'consultor' ? (
                <button
                  onClick={() => onRegistrarMantenimiento(activo)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-900" />
                  <span>Registrar Mantenimiento Realizado</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Requiere rol técnico</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
