import React from 'react';
import { formatMatricula, VehicleType } from '../types/vehicle';

interface Props {
  matricula: string;
  tipo?: VehicleType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SpanishLicensePlate: React.FC<Props> = ({
  matricula,
  tipo = 'coche',
  size = 'md',
  className = ''
}) => {
  const formatted = formatMatricula(matricula);

  // Split plate if modern (e.g. "4582 LKP")
  const parts = formatted.split(' ');
  const numbers = parts[0] || formatted;
  const letters = parts.slice(1).join(' ');

  if (tipo === 'moto' && size === 'sm') {
    // Compact moto plate
    return (
      <div
        className={`inline-flex items-center bg-white text-slate-900 border border-slate-300 rounded shadow-sm px-2 py-0.5 font-mono font-black tracking-wider text-xs select-none ${className}`}
      >
        <span className="text-[9px] bg-blue-700 text-white px-1 py-0.2 rounded-xs font-bold mr-1.5 flex items-center">
          E
        </span>
        <span>{formatted}</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'h-7 text-xs px-1.5 gap-1.5 rounded min-w-[100px]',
    md: 'h-9 text-sm px-2 gap-2 rounded-md min-w-[130px]',
    lg: 'h-12 text-lg px-2.5 gap-2.5 rounded-lg min-w-[170px]',
  };

  const eurobandClasses = {
    sm: 'w-4 h-full text-[8px] py-0.5',
    md: 'w-5 h-full text-[9px] py-0.5',
    lg: 'w-7 h-full text-[11px] py-1',
  };

  return (
    <div
      className={`relative inline-flex items-center bg-white text-slate-900 border-2 border-slate-400 font-mono font-black shadow-sm select-none overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: '"DIN Alternate", "Euro Plate", "Courier New", monospace',
        letterSpacing: '0.08em',
      }}
    >
      {/* Blue Euroband on left */}
      <div
        className={`absolute left-0 top-0 bottom-0 bg-[#003399] text-white flex flex-col items-center justify-between font-sans ${eurobandClasses[size]}`}
      >
        {/* EU Stars circle representation */}
        <div className="flex items-center justify-center text-[#ffcc00] leading-none text-[6px]">
          ★
        </div>
        {/* Country code 'E' */}
        <span className="font-extrabold tracking-normal">E</span>
      </div>

      {/* Plate Numbers and Letters with authentic spacing */}
      <div className="pl-5 md:pl-6 flex items-baseline justify-center w-full text-slate-950">
        <span className="tracking-widest">{numbers}</span>
        {letters && <span className="ml-1.5 tracking-wider">{letters}</span>}
      </div>

      {/* Subtle bolt screw marks on sides for realism */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-slate-400/40" />
    </div>
  );
};
