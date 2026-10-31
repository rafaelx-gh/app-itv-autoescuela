import React from 'react';
import { Vehicle, getITVStatus, formatFecha } from '../types/vehicle';
import { SpanishLicensePlate } from './SpanishLicensePlate';
import { ITVSticker } from './ITVSticker';
import { Car, Bike, CheckCircle, Edit2, Trash2, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  fleet: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRenew: (id: string) => void;
  onViewPredictive: (vehicle: Vehicle) => void;
}

export const VehicleTableView: React.FC<Props> = ({
  fleet,
  onEdit,
  onDelete,
  onRenew,
  onViewPredictive
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3.5 px-4 font-bold">Matrícula</th>
            <th className="py-3.5 px-3 font-bold">Tipo</th>
            <th className="py-3.5 px-4 font-bold">Modelo y Autoescuela</th>
            <th className="py-3.5 px-4 font-bold">Caducidad ITV</th>
            <th className="py-3.5 px-3 font-bold">Estado</th>
            <th className="py-3.5 px-3 font-bold text-center">Pegatina</th>
            <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {fleet.map((vehicle) => {
            const statusInfo = getITVStatus(vehicle.fechaCaducidadITV);

            return (
              <tr
                key={vehicle.id}
                className="hover:bg-slate-850/60 transition-colors"
              >
                {/* Plate */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <SpanishLicensePlate
                    matricula={vehicle.matricula}
                    tipo={vehicle.tipo}
                    size="sm"
                  />
                </td>

                {/* Type */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {vehicle.tipo === 'coche' ? (
                      <>
                        <Car className="w-3 h-3 text-blue-400" />
                        <span>Turismo</span>
                      </>
                    ) : (
                      <>
                        <Bike className="w-3 h-3 text-amber-400" />
                        <span>Moto</span>
                      </>
                    )}
                  </span>
                </td>

                {/* Model & Extra info */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white text-sm">
                    {vehicle.marca} {vehicle.modelo}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    {vehicle.numeroInterno && <span>{vehicle.numeroInterno}</span>}
                    {vehicle.dobleMando && (
                      <span className="text-blue-400 flex items-center gap-0.5 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Doble mando
                      </span>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="font-mono font-bold text-white text-xs">
                    {formatFecha(vehicle.fechaCaducidadITV, 'larga')}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {statusInfo.label}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${statusInfo.colorClass.badge}`}
                  >
                    {statusInfo.status === 'caducada' ? '🔴 Caducada' : statusInfo.status === 'urgente' ? '🟠 Próxima' : '🟢 En regla'}
                  </span>
                </td>

                {/* Visual ITV Sticker */}
                <td className="py-3.5 px-3 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <ITVSticker fechaCaducidad={vehicle.fechaCaducidadITV} statusInfo={statusInfo} size="sm" />
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onRenew(vehicle.id)}
                      className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
                      title="Marcar ITV favorable hoy"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewPredictive(vehicle)}
                      className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/20 transition"
                      title="Ver predicción de cita"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(vehicle)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Editar vehículo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(vehicle.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                      title="Eliminar de la flota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
