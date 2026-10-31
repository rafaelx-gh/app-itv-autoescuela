import React, { useState } from 'react';
import { Vehicle, formatFecha } from '../types/vehicle';
import { SpanishLicensePlate } from './SpanishLicensePlate';
import { CheckCircle2, X, Calendar, Building2, Check, AlertCircle } from 'lucide-react';

interface Props {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (vehicleId: string, estacion: string, resultado: 'favorable' | 'favorable_con_leves') => void;
}

export const RenewModal: React.FC<Props> = ({
  vehicle,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !vehicle) return null;

  const [estacion, setEstacion] = useState('Estación ITV Oficial (TÜV SÜD)');
  const [resultado, setResultado] = useState<'favorable' | 'favorable_con_leves'>('favorable');

  const months = vehicle.frecuenciaMeses || (vehicle.tipo === 'coche' ? 6 : 12);
  const hoy = new Date();
  const nextDate = new Date(hoy.getFullYear(), hoy.getMonth() + months, hoy.getDate());
  const nextDateStr = nextDate.toISOString().split('T')[0];

  const handleConfirm = () => {
    onConfirm(vehicle.id, estacion, resultado);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Renovar ITV Favorable</h3>
              <p className="text-xs text-slate-400">Marcar inspección superada hoy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vehicle Badge */}
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              {vehicle.marca} {vehicle.modelo}
            </span>
            <span className="text-[11px] text-slate-400">
              {vehicle.numeroInterno || 'Flota Autoescuela'}
            </span>
          </div>
          <SpanishLicensePlate
            matricula={vehicle.matricula}
            tipo={vehicle.tipo}
            size="sm"
          />
        </div>

        {/* Calculation summary */}
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-medium">Ciclo reglamentario autoescuela:</span>
            <span className="font-bold text-white">+{months} meses</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-medium">Nueva fecha límite ITV:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formatFecha(nextDateStr, 'larga')}
            </span>
          </div>
        </div>

        {/* Station name and result */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Estación ITV donde se pasó la inspección
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={estacion}
                onChange={(e) => setEstacion(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Dictamen de la inspección
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setResultado('favorable')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                  resultado === 'favorable'
                    ? 'border-emerald-500 bg-emerald-600/20 text-emerald-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400'
                }`}
              >
                Favorable (Limpia)
              </button>
              <button
                type="button"
                onClick={() => setResultado('favorable_con_leves')}
                className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                  resultado === 'favorable_con_leves'
                    ? 'border-amber-500 bg-amber-600/20 text-amber-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400'
                }`}
              >
                Favorable con leves
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar y Renovar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
