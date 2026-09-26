import React, { useState, useEffect } from 'react';
import { Activo, TipoMantenimiento, EstadoActivo, UserRole } from '../types';
import { calcularFechaHabil3Meses, getTodayFormatted } from '../utils/maintenance';
import { X, Calendar, Wrench, ShieldAlert } from 'lucide-react';

interface ActivoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Activo>) => Promise<void>;
  initialData?: Activo | null;
  departamentos: string[];
  userRole: UserRole;
}

export const ActivoFormModal: React.FC<ActivoFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  departamentos,
  userRole,
}) => {
  const isEditing = !!initialData;

  const [id, setId] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('Equipos de Computación');
  const [asignadoA, setAsignadoA] = useState<string>('Almacén / Stock General');
  const [nuevoDept, setNuevoDept] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [estado, setEstado] = useState<EstadoActivo>('Operativo');
  const [mantenimiento, setMantenimiento] = useState<TipoMantenimiento>('No');
  const [fechaMant, setFechaMant] = useState<string>(getTodayFormatted());
  const [proximoMant, setProximoMant] = useState<string>('');
  const [descMant, setDescMant] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setId(String(initialData.id));
      setNombre(initialData.nombre || '');
      setCategoria(initialData.categoria || 'Equipos de Computación');
      setAsignadoA(initialData.asignado_a || 'Almacén / Stock General');
      setUbicacion(initialData.ubicacion || '');
      setEstado(initialData.estado || 'Operativo');
      setMantenimiento(initialData.mantenimiento || 'No');
      setFechaMant(initialData.fecha_mant !== 'N/A' ? initialData.fecha_mant : getTodayFormatted());
      setProximoMant(initialData.proximo_mant !== 'N/A' ? initialData.proximo_mant : '');
      setDescMant(initialData.desc_mant || '');
    } else {
      limpiarCampos();
    }
  }, [initialData, isOpen]);

  // Recalculate +3 business months whenever fechaMant or mantenimiento changes
  useEffect(() => {
    if (mantenimiento !== 'No') {
      const prox = calcularFechaHabil3Meses(fechaMant);
      setProximoMant(prox);
    } else {
      setProximoMant('N/A');
    }
  }, [fechaMant, mantenimiento]);

  const limpiarCampos = () => {
    setId('');
    setNombre('');
    setCategoria('Equipos de Computación');
    setAsignadoA(departamentos[0] || 'Almacén / Stock General');
    setNuevoDept('');
    setUbicacion('');
    setEstado('Operativo');
    setMantenimiento('No');
    setFechaMant(getTodayFormatted());
    setProximoMant('N/A');
    setDescMant('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userRole === 'consultor') {
      setError('Su rol de Consultor / Auditor tiene acceso de solo lectura.');
      return;
    }

    if (!id.trim() || !nombre.trim()) {
      setError('Por favor complete el ID único y la Descripción / Nombre del activo.');
      return;
    }

    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      setError('El ID único debe ser un número entero positivo.');
      return;
    }

    const finalAsignado = nuevoDept.trim() ? nuevoDept.trim() : asignadoA;
    if (!finalAsignado) {
      setError('Debe seleccionar o indicar a qué dependencia está asignado el bien.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: idNum,
        nombre: nombre.trim(),
        categoria,
        asignado_a: finalAsignado,
        ubicacion: ubicacion.trim() || 'No especificada',
        estado,
        mantenimiento,
        fecha_mant: mantenimiento !== 'No' ? fechaMant : 'N/A',
        proximo_mant: mantenimiento !== 'No' ? proximoMant : 'N/A',
        desc_mant: mantenimiento !== 'No' ? descMant.trim() : '',
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el activo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#F4B41A]">
          <div>
            <h3 className="text-base font-bold tracking-tight text-white">
              {isEditing ? `Modificar Activo (ID #${initialData?.id})` : 'Registrar Nuevo Activo Institucional'}
            </h3>
            <p className="text-xs text-amber-200 mt-0.5">
              Sistema de Gestión de Activos y Reportes Tecnológicos (UNELLEZ)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ID Único */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID Único (Numérico) *
              </label>
              <input
                type="number"
                disabled={isEditing}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Ej. 1008"
                className="w-full text-sm font-mono px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d] focus:border-[#0b3c5d] disabled:opacity-60"
                required
              />
              <span className="text-[11px] text-slate-400">Código de bien nacional</span>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoría del Bien
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d]"
              >
                <option value="Equipos de Computación">Equipos de Computación</option>
                <option value="Servidores y Redes">Servidores y Redes</option>
                <option value="Instrumental de Laboratorio">Instrumental de Laboratorio</option>
                <option value="Equipos de Oficina">Equipos de Oficina</option>
                <option value="Equipos Audiovisuales">Equipos Audiovisuales</option>
                <option value="Mobiliario y Enseres">Mobiliario y Enseres</option>
                <option value="Maquinaria y Transporte">Maquinaria y Transporte</option>
                <option value="Otros Bienes">Otros Bienes</option>
              </select>
            </div>

            {/* Estado Operativo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Condición / Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoActivo)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d]"
              >
                <option value="Operativo">Operativo</option>
                <option value="En Mantenimiento">En Mantenimiento</option>
                <option value="Dañado / En Revisión">Dañado / En Revisión</option>
              </select>
            </div>
          </div>

          {/* Nombre / Descripción */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre / Descripción / Detalles del Bien *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Servidor Rack Dell PowerEdge R740 o Laptop ThinkPad T14"
              className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d]"
              required
            />
          </div>

          {/* Asignación y Ubicación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asignado a (Dependencia / Unidad) *
              </label>
              <select
                value={asignadoA}
                onChange={(e) => setAsignadoA(e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d] mb-1.5"
              >
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={nuevoDept}
                onChange={(e) => setNuevoDept(e.target.value)}
                placeholder="O escribe una nueva unidad personalizada..."
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ubicación Física Específica
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej. Edificio Central - Piso 2 - Sala 4"
                className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d]"
              />
            </div>
          </div>

          {/* Bloque Mantenimiento */}
          <div className="border border-slate-200 bg-slate-50/80 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b3c5d]">
              <Wrench className="w-4 h-4 text-[#328cc1]" />
              <span>Control de Mantenimiento Preventivo / Correctivo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ¿Aplica Mantenimiento?
                </label>
                <select
                  value={mantenimiento}
                  onChange={(e) => setMantenimiento(e.target.value as TipoMantenimiento)}
                  className="w-full text-sm px-3 py-2 bg-white border border-slate-300 rounded-md"
                >
                  <option value="No">No</option>
                  <option value="Sí (Preventivo)">Sí (Preventivo)</option>
                  <option value="Sí (Correctivo)">Sí (Correctivo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fecha (DD/MM/AAAA)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={mantenimiento === 'No'}
                    value={fechaMant}
                    onChange={(e) => setFechaMant(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full text-sm font-mono px-3 py-2 bg-white border border-slate-300 rounded-md disabled:bg-slate-100 disabled:text-slate-400"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Próximo (Hábil +3 Meses)
                </label>
                <input
                  type="text"
                  readOnly
                  value={proximoMant}
                  className="w-full text-sm font-mono font-bold px-3 py-2 bg-slate-200/80 border border-slate-300 rounded-md text-slate-800"
                />
                <span className="text-[10px] text-slate-500">Omite sábados y domingos</span>
              </div>
            </div>

            {mantenimiento !== 'No' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo / Observaciones / Descripción Técnica
                </label>
                <textarea
                  rows={2}
                  value={descMant}
                  onChange={(e) => setDescMant(e.target.value)}
                  placeholder="Detalles del trabajo realizado o planificado (limpieza, piezas cambiadas, calibración...)"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0b3c5d]"
                />
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={limpiarCampos}
              className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
            >
              Limpiar Formulario
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || userRole === 'consultor'}
                className="px-5 py-2 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Activo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
