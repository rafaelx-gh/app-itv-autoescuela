import React from 'react';
import { Vehicle, getITVStatus } from '../types/vehicle';
import { AlertTriangle, CheckCircle2, XCircle, Car, Bike, ShieldAlert } from 'lucide-react';

interface Props {
  fleet: Vehicle[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsOverview: React.FC<Props> = ({ fleet, currentFilter, onFilterChange }) => {
  const stats = fleet.reduce(
    (acc, v) => {
      const info = getITVStatus(v.fechaCaducidadITV);
      if (info.status === 'caducada') acc.caducadas++;
      else if (info.status === 'urgente') acc.urgentes++;
      else acc.alDia++;

      if (v.tipo === 'coche') acc.coches++;
      if (v.tipo === 'moto') acc.motos++;
      return acc;
    },
    { caducadas: 0, urgentes: 0, alDia: 0, coches: 0, motos: 0 }
  );

  const total = fleet.length;
  const porcentajeOperativo = total > 0 ? Math.round((stats.alDia / total) * 100) : 100;

  return (
    <div className="space-y-3">
      {/* Critical Alert Banner if any vehicle is expired */}
      {stats.caducadas > 0 && (
        <div className="rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/80 via-red-900/40 to-slate-900/90 p-3.5 shadow-lg flex items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  ¡Atención: {stats.caducadas} {stats.caducadas === 1 ? 'vehículo con ITV caducada' : 'vehículos con ITV caducada'}!
                </span>
                <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Acción Urgente
                </span>
              </div>
              <p className="text-xs text-red-200/90 mt-0.5">
                Prohibido circular para clases prácticas o exámenes DGT hasta pasar la inspección reglamentaria.
              </p>
            </div>
          </div>
          <button
            onClick={() => onFilterChange('caducadas')}
            className="shrink-0 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition active:scale-95 shadow-sm"
          >
            Ver caducados
          </button>
        </div>
      )}

      {/* Warning Alert if vehicles are expiring in < 30 days and no expired */}
      {stats.caducadas === 0 && stats.urgentes > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-200">
              <strong className="text-amber-300">{stats.urgentes} {stats.urgentes === 1 ? 'vehículo caduca' : 'vehículos caducan'} en menos de 30 días.</strong> Ya puedes pasar la ITV manteniendo tu fecha de renovación.
            </p>
          </div>
          <button
            onClick={() => onFilterChange('urgentes')}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 underline shrink-0"
          >
            Revisar
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Flota */}
        <button
          onClick={() => onFilterChange('todos')}
          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
            currentFilter === 'todos'
              ? 'border-blue-500/80 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-850'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Flota</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span className="flex items-center"><Car className="w-3 h-3 mr-0.5 inline" />{stats.coches}</span>
              <span className="opacity-40">|</span>
              <span className="flex items-center"><Bike className="w-3 h-3 mr-0.5 inline" />{stats.motos}</span>
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white">{total}</span>
            <span className="text-[11px] text-slate-400">vehículos</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {porcentajeOperativo}% en regla operativa
          </div>
        </button>

        {/* 🟢 Al Día */}
        <button
          onClick={() => onFilterChange('al_dia')}
          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
            currentFilter === 'al_dia'
              ? 'border-emerald-500/80 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">En Regla</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{stats.alDia}</span>
            <span className="text-[11px] text-emerald-500/80">&gt; 30 días</span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-500/70">
            Aptos para clases y examen
          </div>
        </button>

        {/* 🟠 Próximas a vencer (<30 días) */}
        <button
          onClick={() => onFilterChange('urgentes')}
          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
            currentFilter === 'urgentes'
              ? 'border-amber-500/80 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Próximas</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-400">{stats.urgentes}</span>
            <span className="text-[11px] text-amber-400/80">≤ 30 días</span>
          </div>
          <div className="mt-1 text-[10px] text-amber-400/70">
            Pedir cita previa ya
          </div>
        </button>

        {/* 🔴 Caducadas */}
        <button
          onClick={() => onFilterChange('caducadas')}
          className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
            currentFilter === 'caducadas'
              ? 'border-red-500/80 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-red-500/50'
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          } ${stats.caducadas > 0 ? 'border-red-500/40' : ''}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-medium text-red-400 uppercase tracking-wider">Caducadas</span>
            <XCircle className={`w-4 h-4 text-red-400 ${stats.caducadas > 0 ? 'animate-pulse' : ''}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-red-400">{stats.caducadas}</span>
            <span className="text-[11px] text-red-400/80">inmovilizados</span>
          </div>
          <div className="mt-1 text-[10px] text-red-400/70">
            {stats.caducadas > 0 ? '¡Riesgo de sanción!' : 'Ninguno caducado'}
          </div>
        </button>
      </div>
    </div>
  );
};
