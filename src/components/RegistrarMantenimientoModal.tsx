import React, { useState, useEffect } from 'react';
import { Activo, TipoMantenimiento } from '../types';
import { calcularFechaHabil3Meses, getTodayFormatted } from '../utils/maintenance';
import { Wrench, X, CheckCircle2, Calendar, ShieldAlert } from 'lucide-react';

interface RegistrarMantenimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: Activo | null;
  onGuardar: (activoId: number, data: Partial<Activo>) => Promise<void>;
}

export const RegistrarMantenimientoModal: React.FC<RegistrarMantenimientoModalProps> = ({
  isOpen,
  onClose,
  activo,
  onGuardar,
}) => {
  const [fechaRealizado, setFechaRealizado] = useState<string>(getTodayFormatted());
  const [tipoMant, setTipoMant] = useState<TipoMantenimiento>('Sí (Preventivo)');
  const [detalle, setDetalle] = useState<string>('');
  const [proximaFecha, setProximaFecha] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (activo) {
      setFechaRealizado(getTodayFormatted());
      setTipoMant(activo.mantenimiento !== 'No' ? activo.mantenimiento : 'Sí (Preventivo)');
      setDetalle(`Mantenimiento ejecutado exitosamente en fecha ${getTodayFormatted()}. Equipo verificado y operativo.`);
      setProximaFecha(calcularFechaHabil3Meses(getTodayFormatted()));
      setError('');
    }
  }, [activo, isOpen]);

  useEffect(() => {
    const prox = calcularFechaHabil3Meses(fechaRealizado);
    setProximaFecha(prox);
  }, [fechaRealizado]);

  if (!isOpen || !activo) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalle.trim()) {
      setError('Por favor detalle los trabajos o revisiones efectuadas al equipo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onGuardar(activo.id, {
        ...activo,
        mantenimiento: tipoMant,
        fecha_mant: fechaRealizado,
        proximo_mant: proximaFecha,
        desc_mant: detalle.trim(),
        estado: 'Operativo', // Al registrar mantenimiento realizado, el equipo queda operativo
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F4B41A]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#F4B41A] text-slate-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Mantenimiento Realizado</h3>
              <p className="text-xs text-amber-200">Desactiva la alarma diaria y reprograma el ciclo (+3M)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Resumen del equipo */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Equipo:</span>
              <span className="font-bold text-slate-900 text-right">{activo.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Código Activo:</span>
              <span className="font-mono font-bold text-[#003366]">ID #{activo.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Ubicación / Dependencia:</span>
              <span className="text-slate-700">{activo.asignado_a}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Fecha Pautada Previa:</span>
              <span className="font-mono text-orange-700 font-semibold">{activo.proximo_mant}</span>
            </div>
          </div>

          {/* Fecha en que se realizó */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#003366] mb-1">
                Fecha de Ejecución (DD/MM/AAAA) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fechaRealizado}
                  onChange={(e) => setFechaRealizado(e.target.value)}
                  placeholder="DD/MM/AAAA"
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366]"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#003366] mb-1">
                Tipo de Mantenimiento *
              </label>
              <select
                value={tipoMant}
                onChange={(e) => setTipoMant(e.target.value as TipoMantenimiento)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366]"
              >
                <option value="Sí (Preventivo)">Sí (Preventivo)</option>
                <option value="Sí (Correctivo)">Sí (Correctivo)</option>
              </select>
            </div>
          </div>

          {/* Nueva fecha calculada */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Nueva Próxima Fecha Pautada (+3M Hábiles):</span>
              <span className="font-mono font-bold text-emerald-800 text-sm bg-white px-2 py-0.5 rounded border border-emerald-300">
                {proximaFecha}
              </span>
            </div>
            <p className="text-[10.5px] text-emerald-700 mt-1">
              ✓ Se reprogramará automáticamente evitando fines de semana y la alarma diaria quedará cancelada.
            </p>
          </div>

          {/* Detalle o informe técnico */}
          <div>
            <label className="block text-xs font-bold text-[#003366] mb-1">
              Detalle / Observación Técnica del Mantenimiento Efectuado *
            </label>
            <textarea
              required
              rows={3}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Describa el trabajo realizado (limpieza física, reemplazo de partes, lubricación, pruebas de carga, etc.)..."
              className="w-full text-xs p-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-slate-900" />
              <span>{loading ? 'Guardando...' : 'Confirmar Mantenimiento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
