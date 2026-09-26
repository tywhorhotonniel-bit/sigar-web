import React from 'react';
import { Baja } from '../types';
import { X, Download, Printer, Stamp } from 'lucide-react';
import { descargarActaBajaPDF } from '../utils/pdfGenerator';
import { UnellezLogo, SigartLogo } from './logos';

interface ActaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  baja: Baja | null;
}

export const ActaPreviewModal: React.FC<ActaPreviewModalProps> = ({ isOpen, onClose, baja }) => {
  if (!isOpen || !baja) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="bg-[#003366] text-white px-6 py-3 flex items-center justify-between shrink-0 border-b border-[#D49B16]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Vista Previa de Acta Oficial
            </span>
            <span className="text-xs text-sky-200 font-mono">
              ACTA-BAJA-{String(baja.id).padStart(5, '0')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => descargarActaBajaPDF(baja)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-[#F4B41A] hover:bg-[#e0a415] rounded transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 rounded transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview */}
        <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="bg-white border border-slate-300 shadow-md p-8 sm:p-10 max-w-2xl w-full text-slate-800 space-y-5 print:shadow-none print:border-none print:p-0">
            {/* Institution Header UNELLEZ with Logos */}
            <div className="bg-[#003366] text-white p-4 rounded-t-sm border-b-2 border-[#D49B16] flex items-center justify-between gap-3">
              {/* Left Logo: UNELLEZ */}
              <div className="w-13 h-13 rounded-full bg-white p-0.5 shadow-sm border border-orange-400 flex items-center justify-center shrink-0">
                <UnellezLogo size={46} />
              </div>

              {/* Center Institutional Text */}
              <div className="text-center flex-1">
                <p className="text-[9px] uppercase tracking-wider text-slate-300 font-medium">
                  República Bolivariana de Venezuela
                </p>
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight">
                  UNIVERSIDAD NACIONAL EXPERIMENTAL DE LOS LLANOS OCCIDENTALES
                </h1>
                <h2 className="text-xs sm:text-sm font-bold tracking-tight text-amber-300">
                  “EZEQUIEL ZAMORA” (UNELLEZ)
                </h2>
                <p className="text-[10px] text-slate-200 uppercase tracking-wider font-medium">
                  Dirección General de Bienes Nacionales y Suministros
                </p>
              </div>

              {/* Right Logo: SIGART */}
              <div className="w-13 h-13 rounded-xl bg-white p-0.5 shadow-sm border border-sky-300 flex items-center justify-center shrink-0">
                <SigartLogo size={46} showText={false} />
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center border-b-2 border-[#003366] pb-2">
              <h3 className="text-base sm:text-lg font-bold text-[#003366] tracking-wide">
                ACTA OFICIAL DE DESINCORPORACIÓN Y BAJA DE ACTIVO
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sistema de Gestión de Activos y Reportes Tecnológicos (SIGART)
              </p>
            </div>

            {/* Folio & Date */}
            <div className="grid grid-cols-2 text-xs font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="font-bold text-[#003366]">N° de Control:</span>{' '}
                <span className="font-bold text-slate-900">ACTA-BAJA-{String(baja.id).padStart(5, '0')}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#003366]">Fecha y Hora:</span>{' '}
                <span>{baja.fecha_baja}</span>
              </div>
              <div className="mt-1">
                <span className="font-bold text-[#003366]">Código Activo:</span>{' '}
                <span className="font-bold text-slate-900">ID #{baja.activo_id}</span>
              </div>
              <div className="mt-1 text-right">
                <span className="font-bold text-[#003366]">Categoría:</span>{' '}
                <span>{baja.categoria || 'Bienes Muebles y Tecnológicos'}</span>
              </div>
            </div>

            {/* Section 1: Asset Details */}
            <div className="space-y-2">
              <div className="bg-[#003366] text-white px-3 py-1 font-bold text-xs">
                1. ESPECIFICACIÓN DEL ACTIVO DESINCORPORADO
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pl-2">
                <div className="sm:col-span-1 font-semibold text-[#003366]">Descripción / Equipo:</div>
                <div className="sm:col-span-2 font-bold text-slate-900">{baja.nombre}</div>

                <div className="sm:col-span-1 font-semibold text-[#003366]">Unidad Previa:</div>
                <div className="sm:col-span-2 text-slate-800">{baja.asignado_a}</div>

                <div className="sm:col-span-1 font-semibold text-[#003366]">Régimen Mantenimiento:</div>
                <div className="sm:col-span-2 text-slate-800">{baja.mantenimiento}</div>

                <div className="sm:col-span-1 font-semibold text-[#003366]">Último Mantenimiento:</div>
                <div className="sm:col-span-2 font-mono text-slate-800">{baja.fecha_ultimo_mant || 'N/A'}</div>

                {baja.desc_mant && (
                  <>
                    <div className="sm:col-span-1 font-semibold text-[#003366]">Detalle Mantenimiento:</div>
                    <div className="sm:col-span-2 text-slate-700 italic">{baja.desc_mant}</div>
                  </>
                )}
              </div>
            </div>

            {/* Section 2: Motivo */}
            <div className="space-y-2">
              <div className="bg-[#003366] text-white px-3 py-1 font-bold text-xs">
                2. DICTAMEN TÉCNICO Y JUSTIFICACIÓN DE LA DESINCORPORACIÓN
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans pl-3 rounded">
                {baja.motivo_baja}
              </div>
            </div>

            {/* Section 3: Legal Notice */}
            <p className="text-[11px] text-slate-500 italic leading-relaxed text-justify border-t border-slate-200 pt-2">
              Certificación institucional: En concordancia con el reglamento de Bienes Públicos y normas patrimoniales
              de la UNELLEZ, se efectúa la desincorporación física del bien descrito. La firma y sello húmedo asentados a mano
              en el presente instrumento dan fe pública y validez legal al acto de retiro y resguardo administrativo.
            </p>

            {/* Section 4: Signatures WITHOUT PRE-FILLED NAMES + WET STAMP BOX */}
            <div className="space-y-2 pt-2">
              <div className="bg-[#003366] text-white px-3 py-1 font-bold text-xs">
                3. CONSIGNACIÓN, FIRMAS A MANO Y SELLO HÚMEDO
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Box 1: Custodio (Entrega) */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#003366] mb-2 uppercase">
                      Entregado por (Custodio / Responsable):
                    </div>
                    <div className="space-y-3 text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-500">Firma a mano:</span>
                        <div className="border-b border-slate-400 mt-5"></div>
                      </div>
                      <div>
                        <span className="text-slate-500">Nombre y Apellido:</span>
                        <div className="border-b border-slate-400 mt-4"></div>
                      </div>
                      <div>
                        <span className="text-slate-500">Cédula de Identidad:</span>
                        <div className="border-b border-slate-400 mt-4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Wet Stamp Area */}
                  <div className="mt-4 border-2 border-dashed border-slate-300 rounded p-3 text-center bg-white flex flex-col items-center justify-center min-h-[70px]">
                    <Stamp className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                      Espacio para Sello Húmedo
                    </span>
                  </div>
                </div>

                {/* Box 2: Bienes y Suministros (Recepción) */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#003366] mb-2 uppercase">
                      Conformado por (Bienes y Suministros):
                    </div>
                    <div className="space-y-3 text-[11px] text-slate-700">
                      <div>
                        <span className="text-slate-500">Firma Autorizada:</span>
                        <div className="border-b border-slate-400 mt-5"></div>
                      </div>
                      <div>
                        <span className="text-slate-500">Nombre y Apellido:</span>
                        <div className="border-b border-slate-400 mt-4"></div>
                      </div>
                      <div>
                        <span className="text-slate-500">Fecha de Conformidad:</span>
                        <div className="border-b border-slate-400 mt-4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Wet Stamp Area */}
                  <div className="mt-4 border-2 border-dashed border-slate-300 rounded p-3 text-center bg-white flex flex-col items-center justify-center min-h-[70px]">
                    <Stamp className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                      Espacio para Sello Húmedo UNELLEZ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-200">
              Documento oficial generado por el Sistema de Gestión de Activos y Reportes Tecnológicos (SIGART) · UNELLEZ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
