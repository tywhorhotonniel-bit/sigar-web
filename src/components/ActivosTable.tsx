import React, { useState, useMemo } from 'react';
import { Activo, UserRole } from '../types';
import { getMaintenanceStatus } from '../utils/maintenance';
import { Search, Filter, Edit, FileMinus, Trash2, AlertCircle, Wrench, ShieldAlert, Package } from 'lucide-react';

interface ActivosTableProps {
  activos: Activo[];
  departamentos: string[];
  userRole: UserRole;
  onEditar: (activo: Activo) => void;
  onDarDeBaja: (activo: Activo) => void;
  onEliminar: (id: number) => void;
  onNuevoActivo: () => void;
  onRegistrarMantenimiento?: (activo: Activo) => void;
}

export const ActivosTable: React.FC<ActivosTableProps> = ({
  activos,
  departamentos,
  userRole,
  onEditar,
  onDarDeBaja,
  onEliminar,
  onNuevoActivo,
  onRegistrarMantenimiento,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('todos');
  const [filterMant, setFilterMant] = useState<string>('todos');

  // Filtered assets
  const filteredActivos = useMemo(() => {
    return activos.filter((item) => {
      // Search term
      const query = searchTerm.toLowerCase();
      const matchSearch =
        String(item.id).toLowerCase().includes(query) ||
        item.nombre.toLowerCase().includes(query) ||
        item.asignado_a.toLowerCase().includes(query) ||
        item.categoria.toLowerCase().includes(query) ||
        (item.desc_mant && item.desc_mant.toLowerCase().includes(query));

      if (!matchSearch) return false;

      // Department filter
      if (selectedDept !== 'todos' && item.asignado_a !== selectedDept) {
        return false;
      }

      // Maintenance filter
      if (filterMant === 'con_mant') {
        return item.mantenimiento !== 'No';
      } else if (filterMant === 'preventivo') {
        return item.mantenimiento.includes('Preventivo');
      } else if (filterMant === 'correctivo') {
        return item.mantenimiento.includes('Correctivo');
      } else if (filterMant === 'sin_mant') {
        return item.mantenimiento === 'No';
      } else if (filterMant === 'urgente') {
        const mantState = getMaintenanceStatus(item.proximo_mant);
        return mantState.status === 'vencido' || mantState.status === 'proximo';
      }

      return true;
    });
  }, [activos, searchTerm, selectedDept, filterMant]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      {/* Search and Filters Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-center">
          {/* Search box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID, nombre, unidad o detalle..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366] focus:border-[#003366]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-auto flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-semibold shrink-0">Unidad:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366] w-full sm:w-auto text-slate-800"
            >
              <option value="todos">Todas las Unidades</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* Maintenance Filter */}
          <div className="w-full sm:w-auto flex items-center gap-1.5">
            <span className="text-xs text-slate-600 font-semibold shrink-0">Mantenimiento:</span>
            <select
              value={filterMant}
              onChange={(e) => setFilterMant(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366] w-full sm:w-auto text-slate-800"
            >
              <option value="todos">Todos los regímenes</option>
              <option value="con_mant">Requiere Mantenimiento</option>
              <option value="preventivo">Solo Preventivo</option>
              <option value="correctivo">Solo Correctivo</option>
              <option value="urgente">⚠️ Próximos o Vencidos</option>
              <option value="sin_mant">Sin Mantenimiento (No)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 justify-end">
          {userRole !== 'consultor' ? (
            <button
              onClick={onNuevoActivo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              + Registrar Activo
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">Modo Consulta (Solo Lectura)</span>
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="px-4 py-1.5 bg-slate-50 text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200">
        <span>Mostrando <strong>{filteredActivos.length}</strong> de {activos.length} activos</span>
        <span className="hidden sm:inline text-slate-500">Doble clic en una fila para editar detalles del bien</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#003366] text-white text-[11px] uppercase font-bold tracking-wider border-b-2 border-[#F4B41A]">
            <tr>
              <th className="px-4 py-3 w-20">ID Activo</th>
              <th className="px-4 py-3 min-w-[240px]">Descripción / Nombre del Bien</th>
              <th className="px-4 py-3">Asignado a</th>
              <th className="px-4 py-3 text-center">Mantenimiento</th>
              <th className="px-4 py-3 text-center">Última Fecha</th>
              <th className="px-4 py-3 text-center">Próxima Fecha (Hábil)</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredActivos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-14 text-slate-400">
                  <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      Inventario en Limpio (0 Activos Registrados)
                    </p>
                    <p className="text-xs text-slate-500 mt-1 mb-4 text-center">
                      El sistema está listo como recién instalado en una PC. Comienza registrando tu primer equipo o bien tecnológico.
                    </p>
                    {userRole !== 'consultor' && (
                      <button
                        onClick={onNuevoActivo}
                        className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded-md shadow-xs transition-colors cursor-pointer"
                      >
                        + Registrar Primer Activo
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredActivos.map((bien) => {
                const mantState = getMaintenanceStatus(bien.proximo_mant);
                return (
                  <tr
                    key={bien.id}
                    onDoubleClick={() => onEditar(bien)}
                    className={`transition-colors cursor-pointer ${
                      mantState.esAlarma
                        ? 'bg-amber-50/50 hover:bg-amber-100/60 border-l-4 border-l-amber-500'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* ID */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 tabular-nums">
                      #{bien.id}
                    </td>

                    {/* Descripción y Categoría */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        <span>{bien.nombre}</span>
                        {mantState.status === 'hoy' && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded animate-pulse">
                            ¡Mantenimiento Hoy!
                          </span>
                        )}
                        {mantState.status === 'vencido' && (
                          <span className="text-[10px] font-bold text-red-900 bg-red-100 px-1.5 py-0.5 rounded">
                            ¡Pendiente!
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{bien.categoria}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">{bien.ubicacion}</span>
                        {bien.estado !== 'Operativo' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-amber-700">{bien.estado}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Asignado a */}
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {bien.asignado_a}
                    </td>

                    {/* Mantenimiento */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {bien.mantenimiento === 'No' ? (
                        <span className="text-slate-400 font-medium">No</span>
                      ) : bien.mantenimiento.includes('Preventivo') ? (
                        <span className="text-sky-700 font-medium flex items-center justify-center gap-1">
                          <Wrench className="w-3 h-3 text-sky-600" />
                          <span>Preventivo</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Correctivo</span>
                        </span>
                      )}
                    </td>

                    {/* Última Fecha */}
                    <td className="px-4 py-3 text-center font-mono tabular-nums text-slate-600">
                      {bien.fecha_mant}
                    </td>

                    {/* Próximo Mantenimiento (Hábil) */}
                    <td className="px-4 py-3 text-center font-mono tabular-nums">
                      {bien.proximo_mant === 'N/A' ? (
                        <span className="text-slate-400">N/A</span>
                      ) : (
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`font-semibold ${
                              mantState.status === 'vencido'
                                ? 'text-red-700 underline decoration-red-400'
                                : mantState.status === 'proximo'
                                ? 'text-amber-700 font-bold'
                                : 'text-slate-800'
                            }`}
                          >
                            {bien.proximo_mant}
                          </span>
                          {mantState.status !== 'al_dia' && (
                            <span
                              className={`text-[10px] ${
                                mantState.status === 'vencido' ? 'text-red-600' : 'text-amber-600'
                              }`}
                            >
                              {mantState.label}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Registrar Mantenimiento Realizado */}
                        {userRole !== 'consultor' && bien.mantenimiento !== 'No' && onRegistrarMantenimiento && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegistrarMantenimiento(bien);
                            }}
                            title="Registrar mantenimiento realizado (Desactiva alarma diaria)"
                            className={`p-1.5 rounded transition-colors ${
                              mantState.esAlarma
                                ? 'text-amber-900 bg-amber-200 hover:bg-amber-300 font-bold'
                                : 'text-sky-700 hover:text-sky-900 hover:bg-sky-50'
                            }`}
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}

                        {/* Editar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditar(bien);
                          }}
                          title={userRole === 'consultor' ? 'Ver detalles' : 'Editar activo'}
                          className="p-1.5 text-slate-600 hover:text-[#003366] hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Dar de Baja con Acta PDF */}
                        {userRole !== 'consultor' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDarDeBaja(bien);
                            }}
                            title="Dar de baja / Emitir Acta PDF"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          >
                            <FileMinus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Eliminar (Solo Admin) */}
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `¿Eliminar definitivamente el activo ID #${bien.id} (${bien.nombre})?`
                                )
                              ) {
                                onEliminar(bien.id);
                              }
                            }}
                            title="Eliminar activo (Admin)"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
