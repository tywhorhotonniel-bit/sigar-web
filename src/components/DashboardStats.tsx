import React from 'react';
import { DashboardStats as StatsType } from '../types';
import { Package, CheckCircle2, Wrench, AlertTriangle, Archive, Users } from 'lucide-react';

interface DashboardStatsProps {
  stats: StatsType | null;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {/* 1. Total Activos (Gris Institucional / Base) */}
      <div className="bg-slate-50/90 border border-slate-300 border-l-4 border-l-slate-700 p-3.5 rounded-lg shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-700 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Activos</span>
          <div className="p-1 bg-slate-200/70 rounded-md">
            <Package className="w-3.5 h-3.5 text-slate-700" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
          {stats.totalActivos}
        </div>
        <div className="text-[11px] text-slate-500 font-medium mt-0.5">Bienes inventariados</div>
      </div>

      {/* 2. Operativos (VERDE) */}
      <div className="bg-emerald-50/80 border border-emerald-300 border-l-4 border-l-emerald-600 p-3.5 rounded-lg shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-emerald-900 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Operativos</span>
          <div className="p-1 bg-emerald-200/80 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          </div>
        </div>
        <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums">
          {stats.operativos}
        </div>
        <div className="text-[11px] text-emerald-700/90 font-medium mt-0.5">En servicio activo</div>
      </div>

      {/* 3. Mantenimiento Preventivo (AZUL) */}
      <div className="bg-sky-50/80 border border-sky-300 border-l-4 border-l-[#003366] p-3.5 rounded-lg shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-[#003366] mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">Preventivos</span>
          <div className="p-1 bg-sky-200/80 rounded-md">
            <Wrench className="w-3.5 h-3.5 text-[#003366]" />
          </div>
        </div>
        <div className="text-2xl font-black text-[#003366] font-mono tabular-nums">
          {stats.preventivos}
        </div>
        <div className="text-[11px] text-sky-800/90 font-medium mt-0.5">Ciclo regular programado</div>
      </div>

      {/* 4. Mantenimiento Correctivo (NARANJA) */}
      <div className="bg-orange-50/80 border border-orange-300 border-l-4 border-l-orange-500 p-3.5 rounded-lg shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-orange-950 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-900">Correctivos</span>
          <div className="p-1 bg-orange-200/80 rounded-md">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          </div>
        </div>
        <div className="text-2xl font-black text-orange-600 font-mono tabular-nums">
          {stats.correctivos}
        </div>
        <div className="text-[11px] text-orange-800/90 font-medium mt-0.5">Ajuste o reparación</div>
      </div>

      {/* 5. Actas de Baja (ROJO) */}
      <div className="bg-rose-50/80 border border-rose-300 border-l-4 border-l-rose-600 p-3.5 rounded-lg shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-rose-950 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Desincorporados</span>
          <div className="p-1 bg-rose-200/80 rounded-md">
            <Archive className="w-3.5 h-3.5 text-rose-600" />
          </div>
        </div>
        <div className="text-2xl font-black text-rose-700 font-mono tabular-nums">
          {stats.totalBajas}
        </div>
        <div className="text-[11px] text-rose-800/90 font-medium mt-0.5">Actas oficiales emitidas</div>
      </div>

      {/* 6. Usuarios del Sistema (Dorado / Seguridad) */}
      <div className="bg-amber-50/60 border border-amber-300 border-l-4 border-l-[#F4B41A] p-3.5 rounded-lg shadow-xs transition-all hover:shadow-sm">
        <div className="flex items-center justify-between text-amber-950 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Usuarios</span>
          <div className="p-1 bg-amber-200/70 rounded-md">
            <Users className="w-3.5 h-3.5 text-amber-800" />
          </div>
        </div>
        <div className="text-2xl font-black text-amber-950 font-mono tabular-nums">
          {stats.totalUsuarios}
        </div>
        <div className="text-[11px] text-amber-800/90 font-medium mt-0.5">Roles administrados</div>
      </div>
    </div>
  );
};
