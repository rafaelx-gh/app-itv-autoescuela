import React from 'react';
import { ITVStatusInfo } from '../types/vehicle';

interface Props {
  fechaCaducidad: string;
  statusInfo: ITVStatusInfo;
  size?: 'sm' | 'md';
}

export const ITVSticker: React.FC<Props> = ({ fechaCaducidad, statusInfo, size = 'md' }) => {
  if (!fechaCaducidad) return null;

  const parts = fechaCaducidad.split('-');
  const year = parts[0] ? parts[0].slice(-2) : '26';
  const monthInt = parts[1] ? parseInt(parts[1], 10) : 1;
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const romanMonth = romanMonths[monthInt - 1] || 'I';

  // In Spain, colors rotate: 2026 is red/maroon, 2027 is green, 2028 is yellow, etc.
  // We can color based on status or official rotation
  const isExpired = statusInfo.status === 'caducada';
  const isUrgent = statusInfo.status === 'urgente';

  const bgColor = isExpired
    ? 'bg-red-700 border-red-500 text-white'
    : isUrgent
    ? 'bg-amber-600 border-amber-400 text-slate-950'
    : 'bg-emerald-600 border-emerald-400 text-white';

  const sizeClass = size === 'sm' ? 'w-10 h-10 text-[9px]' : 'w-13 h-13 text-[11px]';

  return (
    <div
      className={`relative ${sizeClass} rounded-full border-2 flex flex-col items-center justify-center font-mono font-black shadow-md select-none shrink-0 ${bgColor}`}
      title={`Pegatina V-19 ITV: Válida hasta ${monthInt}/${parts[0]}`}
    >
      <span className="text-[7px] font-sans font-bold opacity-80 leading-tight">ITV</span>
      <span className="text-xs font-black tracking-tight leading-none">{romanMonth}</span>
      <span className="text-[9px] font-bold leading-none mt-0.5">'{year}</span>
      {isExpired && (
        <div className="absolute inset-0 bg-red-950/80 rounded-full flex items-center justify-center">
          <span className="text-[8px] font-bold text-red-300 font-sans tracking-tighter">CADUCADA</span>
        </div>
      )}
    </div>
  );
};
