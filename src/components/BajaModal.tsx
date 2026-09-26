import React, { useState } from 'react';
import { Activo, Baja, UserRole } from '../types';
import { AlertOctagon, X, FileText, Download, CheckCircle2 } from 'lucide-react';
import { descargarActaBajaPDF } from '../utils/pdfGenerator';

interface BajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  activo: Activo | null;
  onConfirmBaja: (id: number, motivo: string, responsable?: string) => Promise<Baja>;
  onVerActa: (baja: Baja) => void;
  userRole: UserRole;
  currentUserName: string;
}

export const BajaModal: React.FC<BajaModalProps> = ({
  isOpen,
  onClose,
  activo,
  onConfirmBaja,
  onVerActa,
  userRole,
  currentUserName,
}) => {
  const [motivo, setMotivo] = useState<string>('');
  const [responsable, setResponsable] = useState<string>(currentUserName);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [bajaGenerada, setBajaGenerada] = useState<Baja | null>(null);

  if (!isOpen || !activo) return null;

  const handleProcesarBaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole === 'consultor') {
      setError('Los consultores no tienen autorización para dar de baja bienes.');
      return;
    }

    if (!motivo.trim() || motivo.trim().length < 10) {
      setError('La justificación o motivo debe tener al menos 10 caracteres explicativos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const nuevaBaja = await onConfirmBaja(activo.id, motivo.trim(), responsable.trim());
      setBajaGenerada(nuevaBaja);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar la desincorporación');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMotivo('');
    setBajaGenerada(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-200" />
            <div>
              <h3 className="text-base font-bold">Desincorporación y Baja de Activo</h3>
              <p className="text-xs text-red-100">Emisión de Acta Oficial UNELLEZ</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!bajaGenerada ? (
          <form onSubmit={handleProcesarBaja} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {error}
              </div>
            )}

            {/* Resumen del activo a desincorporar */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Código Activo:</span>
                <span className="font-mono font-bold text-slate-900">ID #{activo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Descripción:</span>
                <span className="font-semibold text-slate-900 text-right max-w-[240px] truncate">
                  {activo.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Asignado a:</span>
                <span className="text-slate-700">{activo.asignado_a}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Último Mantenimiento:</span>
                <span className="font-mono text-slate-700">{activo.fecha_mant}</span>
              </div>
            </div>

            {/* Motivo obligatorio */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Justificación Técnica / Causa de la Baja *
              </label>
              <textarea
                required
                rows={3}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Indique con claridad el motivo (obsolescencia, daño irreparable, descontinuación de repuestos, etc.)..."
                className="w-full text-xs p-3 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-red-600"
              />
              <span className="text-[11px] text-slate-500">
                Este dictamen se plasmará textualmente en el Acta Oficial foliada en PDF.
              </span>
            </div>

            {/* Responsable de la firma */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="font-bold text-[#003366] block">
                Protocolo Institucional de Firmas y Sello Húmedo:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                De acuerdo con la normativa de la UNELLEZ, <strong>las firmas, nombres y cédulas se consignarán a mano</strong> junto con el <strong>sello húmedo</strong> sobre el acta impresa, garantizando la fe pública del acto.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-md">
              ⚠️ <strong>Advertencia institucional:</strong> Esta acción trasladará el activo a la base
              de datos histórica de bajas y generará el documento legal foliado.
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors shadow-xs disabled:opacity-50"
              >
                {loading ? 'Procesando Acta...' : 'Confirmar Desincorporación'}
              </button>
            </div>
          </form>
        ) : (
          /* Estado de éxito con botones de acta */
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                ¡Acta de Baja Emitida Exitosamente!
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                El activo ID #{bajaGenerada.activo_id} ha sido desincorporado y registrado en la base
                de datos local de bajas foliadas.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-left font-mono">
              <div>Acta N°: ACTA-BAJA-{String(bajaGenerada.id).padStart(5, '0')}</div>
              <div>Fecha: {bajaGenerada.fecha_baja}</div>
              <div>Bien: {bajaGenerada.nombre}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => descargarActaBajaPDF(bajaGenerada)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF Oficial
              </button>

              <button
                onClick={() => onVerActa(bajaGenerada)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#0b3c5d] bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                Visualizar Acta
              </button>
            </div>

            <button
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-800 underline block mx-auto pt-2"
            >
              Cerrar y volver al inventario
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
