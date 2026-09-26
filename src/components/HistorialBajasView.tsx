import React, { useState } from 'react';
import { Baja } from '../types';
import { descargarActaBajaPDF } from '../utils/pdfGenerator';
import { Search, Download, Eye, Archive, FileText } from 'lucide-react';

interface HistorialBajasViewProps {
  bajas: Baja[];
  onVerActa: (baja: Baja) => void;
}

export const HistorialBajasView: React.FC<HistorialBajasViewProps> = ({ bajas, onVerActa }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredBajas = bajas.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      String(item.activo_id).includes(q) ||
      item.nombre.toLowerCase().includes(q) ||
      item.asignado_a.toLowerCase().includes(q) ||
      item.motivo_baja.toLowerCase().includes(q) ||
      item.fecha_baja.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
      {/* Header toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#003366] flex items-center gap-2">
            <Archive className="w-4 h-4 text-red-600" />
            <span>Historial Oficial de Desincorporaciones y Bajas (UNELLEZ)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistema de Gestión de Activos y Reportes Tecnológicos · Registro foliado con dictamen legal
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, nombre o motivo..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-[#003366]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#003366] text-white text-[11px] uppercase font-bold tracking-wider border-b-2 border-[#F4B41A]">
            <tr>
              <th className="px-4 py-3">N° Acta</th>
              <th className="px-4 py-3">Código Activo</th>
              <th className="px-4 py-3 min-w-[200px]">Bien Desincorporado</th>
              <th className="px-4 py-3">Unidad Previa</th>
              <th className="px-4 py-3 min-w-[220px]">Justificación / Motivo</th>
              <th className="px-4 py-3">Fecha y Hora</th>
              <th className="px-4 py-3 text-right">Documento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredBajas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-sm font-medium text-slate-600">No hay registros de baja</p>
                  <p className="text-xs text-slate-400">
                    Los activos desincorporados aparecerán aquí con sus actas foliadas.
                  </p>
                </td>
              </tr>
            ) : (
              filteredBajas.map((baja) => (
                <tr key={baja.id} className="hover:bg-slate-50 transition-colors">
                  {/* Folio */}
                  <td className="px-4 py-3 font-mono font-bold text-[#003366]">
                    ACTA-{String(baja.id).padStart(5, '0')}
                  </td>

                  {/* ID */}
                  <td className="px-4 py-3 font-mono text-slate-900 font-semibold">
                    #{baja.activo_id}
                  </td>

                  {/* Nombre y categoría */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{baja.nombre}</div>
                    <div className="text-[11px] text-slate-500">{baja.categoria}</div>
                  </td>

                  {/* Unidad Previa */}
                  <td className="px-4 py-3 text-slate-700">{baja.asignado_a}</td>

                  {/* Motivo */}
                  <td className="px-4 py-3">
                    <div className="line-clamp-2 text-slate-700 italic">
                      "{baja.motivo_baja}"
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Firmas y sello a mano en acta
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                    {baja.fecha_baja}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onVerActa(baja)}
                        title="Ver Documento"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#003366] bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      <button
                        onClick={() => descargarActaBajaPDF(baja)}
                        title="Descargar PDF Oficial"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
