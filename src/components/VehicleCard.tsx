import React, { useState } from 'react';
import { Vehicle, getITVStatus, formatFecha } from '../types/vehicle';
import { SpanishLicensePlate } from './SpanishLicensePlate';
import { ITVSticker } from './ITVSticker';
import {
  Car,
  Bike,
  Calendar,
  Clock,
  CheckCircle,
  AlertOctagon,
  Edit2,
  Trash2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MapPin
} from 'lucide-react';

interface Props {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
  onRenew: (id: string) => void;
  onViewPredictive: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<Props> = ({
  vehicle,
  onEdit,
  onDelete,
  onRenew,
  onViewPredictive
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statusInfo = getITVStatus(vehicle.fechaCaducidadITV);

  return (
    <div
      className={`relative rounded-2xl border bg-slate-900/90 backdrop-blur-sm p-4 transition-all duration-200 hover:border-slate-600 ${statusInfo.colorClass.border} ${statusInfo.colorClass.glow}`}
    >
      {/* Top row: License plate + ITV Sticker */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <SpanishLicensePlate
              matricula={vehicle.matricula}
              tipo={vehicle.tipo}
              size="md"
            />
            {/* Vehicle Type Icon / Badge */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {vehicle.tipo === 'coche' ? (
                <>
                  <Car className="w-3.5 h-3.5 text-blue-400" />
                  <span>Turismo B</span>
                </>
              ) : (
                <>
                  <Bike className="w-3.5 h-3.5 text-amber-400" />
                  <span>Moto A/A2</span>
                </>
              )}
            </span>
          </div>

          {/* Internal Fleet ID */}
          {vehicle.numeroInterno && (
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>{vehicle.numeroInterno}</span>
            </p>
          )}
        </div>

        {/* Official V-19 ITV Windshield Sticker */}
        <ITVSticker fechaCaducidad={vehicle.fechaCaducidadITV} statusInfo={statusInfo} />
      </div>

      {/* Model Name and Attributes */}
      <div className="mt-3">
        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
          {vehicle.marca} {vehicle.modelo}
        </h3>

        {/* Driving School Spec Badges */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          {vehicle.dobleMando && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30 font-medium">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              Doble Mando Homologado
            </span>
          )}

          {vehicle.combustible && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
              {vehicle.combustible}
            </span>
          )}

          {vehicle.kilometraje && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 font-mono">
              {vehicle.kilometraje.toLocaleString('es-ES')} km
            </span>
          )}

          {vehicle.frecuenciaMeses && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
              Ciclo {vehicle.frecuenciaMeses}m
            </span>
          )}
        </div>
      </div>

      {/* ITV Expiration & Status Box */}
      <div className={`mt-3.5 rounded-xl p-3 border ${statusInfo.colorClass.border} ${statusInfo.colorClass.lightBg}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${statusInfo.colorClass.text}`} />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Caducidad ITV
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {formatFecha(vehicle.fechaCaducidadITV, 'larga')}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${statusInfo.colorClass.badge}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Cita Previa registered badge if any */}
        {vehicle.citaPrevia?.solicitada && (
          <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-blue-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Cita: {formatFecha(vehicle.citaPrevia.fecha)} {vehicle.citaPrevia.hora && `a las ${vehicle.citaPrevia.hora}`}
            </span>
            {vehicle.citaPrevia.estacion && (
              <span className="text-[11px] text-slate-400 truncate max-w-[140px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                {vehicle.citaPrevia.estacion}
              </span>
            )}
          </div>
        )}

        {/* Warning reason on critical */}
        {statusInfo.status !== 'al_dia' && (
          <div className="mt-2 pt-2 border-t border-slate-700/40 flex items-start gap-1.5">
            <AlertOctagon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${statusInfo.colorClass.text}`} />
            <p className="text-[11px] text-slate-300 leading-tight">
              {statusInfo.mensajeAlerta}
            </p>
          </div>
        )}
      </div>

      {/* Notes if present */}
      {vehicle.notas && (
        <p className="mt-2.5 text-xs text-slate-400 line-clamp-1 italic px-1">
          "{vehicle.notas}"
        </p>
      )}

      {/* Action Buttons Toolbar */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Left: Quick Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onRenew(vehicle.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition active:scale-95"
            title="Marcar inspección pasada favorablemente hoy (+ renovación automática de fecha)"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pasar ITV hoy</span>
          </button>

          <button
            onClick={() => onViewPredictive(vehicle)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750 text-xs font-medium transition active:scale-95"
            title="Ver recomendaciones predictivas de cita previa"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Previsión</span>
          </button>
        </div>

        {/* Right: Edit & Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(vehicle)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Editar vehículo"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 rounded-lg p-0.5">
              <button
                onClick={() => {
                  onDelete(vehicle.id);
                  setConfirmDelete(false);
                }}
                className="px-2 py-0.5 text-[11px] font-bold bg-red-600 text-white rounded hover:bg-red-500"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-0.5 text-[11px] text-slate-300 hover:text-white"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Eliminar de la flota"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
