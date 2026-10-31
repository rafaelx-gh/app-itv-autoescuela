import React, { useState } from 'react';
import { Vehicle, formatFecha } from '../types/vehicle';
import { generatePredictiveAdvice, getGoogleCalendarUrl, ITV_CENTERS } from '../services/predictiveEngine';
import { SpanishLicensePlate } from './SpanishLicensePlate';
import {
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  CalendarPlus,
  Building2,
  Info,
  Car,
  Bike,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  ArrowRight,
  BellRing
} from 'lucide-react';

interface Props {
  fleet: Vehicle[];
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  onRenewVehicle: (id: string) => void;
  onOpenNotifications?: () => void;
}

export const PredictivePanel: React.FC<Props> = ({
  fleet,
  onUpdateVehicle,
  onRenewVehicle,
  onOpenNotifications
}) => {
  const [filter, setFilter] = useState<'todos' | 'inmediata' | 'alta' | 'media'>('todos');
  const [editingAppointmentFor, setEditingAppointmentFor] = useState<string | null>(null);
  const [citaFecha, setCitaFecha] = useState('');
  const [citaHora, setCitaHora] = useState('10:00');
  const [citaEstacion, setCitaEstacion] = useState('ITV TÜV SÜD');

  const adviceList = fleet.map((v) => generatePredictiveAdvice(v));

  // Sort by urgency: expired & soonest first
  const sortedAdvice = [...adviceList].sort((a, b) => a.diasRestantes - b.diasRestantes);

  const filteredAdvice = sortedAdvice.filter((item) => {
    if (filter === 'todos') return true;
    if (filter === 'inmediata') return item.urgencia === 'inmediata';
    if (filter === 'alta') return item.urgencia === 'alta';
    if (filter === 'media') return item.urgencia === 'media';
    return true;
  });

  const handleSaveAppointment = (vehicleId: string) => {
    if (!citaFecha) return;
    onUpdateVehicle(vehicleId, {
      citaPrevia: {
        solicitada: true,
        fecha: citaFecha,
        hora: citaHora,
        estacion: citaEstacion
      }
    });
    setEditingAppointmentFor(null);
  };

  const handleClearAppointment = (vehicleId: string) => {
    onUpdateVehicle(vehicleId, {
      citaPrevia: { solicitada: false }
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Informative Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/40 p-4 sm:p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Recordatorios Predictivos de Cita Previa</span>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
                  Normativa DGT
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Cálculo inteligente de la ventana óptima para pedir cita previa. En España puedes acudir a la ITV <strong className="text-amber-300">hasta 30 días naturales antes</strong> de su vencimiento sin perder ni un solo día de vigencia en la siguiente renovación.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Regulatory Tip Box */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            <strong>Regla de los 30 días (RD 920/2017):</strong> Recomendamos pasar la ITV entre 10 y 15 días antes de la caducidad. Si el vehículo tuviera algún defecto leve o requiriese taller, no afectará a los exámenes de los alumnos ni incurrirá en infracción por circulación indebida.
          </p>
        </div>
      </div>

      {/* Direct Push Notification Setup Banner */}
      {onOpenNotifications && (
        <div className="rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                ¿Quieres que la app te avise automáticamente con notificaciones?
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Emite notificaciones nativas en tu móvil o navegador cuando un vehículo entre en los 30 días previos o si caduca.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenNotifications}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 text-center"
          >
            Configurar Avisos
          </button>
        </div>
      )}


      {/* Official ITV Network Portals */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Portales Oficiales para Pedir Cita Previa en España
          </span>
          <span className="text-[11px] text-slate-500">Acceso directo</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {ITV_CENTERS.map((center) => (
            <a
              key={center.name}
              href={center.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white transition group"
            >
              <span>{center.name}</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400" />
            </a>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('todos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filter === 'todos'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Todos ({fleet.length})
        </button>
        <button
          onClick={() => setFilter('inmediata')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
            filter === 'inmediata'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-slate-800 text-red-400 hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Urgente / Caducados
        </button>
        <button
          onClick={() => setFilter('alta')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
            filter === 'alta'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Ventana 30 Días
        </button>
        <button
          onClick={() => setFilter('media')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            filter === 'media'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
          }`}
        >
          Planificación 45 Días
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredAdvice.length === 0 ? (
          <div className="text-center p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-400 text-xs">
            No hay vehículos en este filtro predictivo.
          </div>
        ) : (
          filteredAdvice.map((advice) => {
            const originalVehicle = fleet.find((v) => v.id === advice.vehicleId);
            const isEditingThisAppointment = editingAppointmentFor === advice.vehicleId;

            return (
              <div
                key={advice.vehicleId}
                className={`rounded-2xl border bg-slate-900/90 p-4 sm:p-5 shadow-lg transition-all ${
                  advice.urgencia === 'inmediata'
                    ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                    : advice.urgencia === 'alta'
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <SpanishLicensePlate
                      matricula={advice.matricula}
                      tipo={advice.tipo}
                      size="sm"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{advice.modelo}</span>
                        {advice.tipo === 'coche' ? (
                          <Car className="w-3.5 h-3.5 text-blue-400 inline" />
                        ) : (
                          <Bike className="w-3.5 h-3.5 text-amber-400 inline" />
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Fecha límite de caducidad: <strong className="text-white font-mono">{formatFecha(advice.fechaCaducidad, 'larga')}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        advice.urgencia === 'inmediata'
                          ? 'bg-red-500 text-white'
                          : advice.urgencia === 'alta'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {advice.estadoTitulo}
                    </span>
                  </div>
                </div>

                {/* Timeline Grid */}
                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Step 1: Booking start */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      1. Cuándo Reservar Cita
                    </span>
                    <span className="text-xs font-bold text-sky-400 font-mono mt-0.5 block">
                      A partir del {formatFecha(advice.fechaPedirCitaRecomendada)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      (45 días antes para asegurar hueco preferente)
                    </span>
                  </div>

                  {/* Step 2: DGT 30-Day Window */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      2. Ventana Legal DGT (30 Días)
                    </span>
                    <span className="text-xs font-bold text-amber-400 font-mono mt-0.5 block">
                      Desde el {formatFecha(advice.plazoRegla30Dias)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Conserva la fecha de renovación original
                    </span>
                  </div>

                  {/* Step 3: Ideal Inspection Day */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      3. Día Óptimo para Acudir
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
                      Hacia el {formatFecha(advice.fechaInspeccionOptima)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Margen técnico de 15 días ante imprevistos
                    </span>
                  </div>
                </div>

                {/* Recommendation & Driving School Impact */}
                <div className="mt-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800 space-y-1.5 text-xs">
                  <p className="text-slate-200">
                    <strong className="text-white">Recomendación:</strong> {advice.recomendacionTexto}
                  </p>
                  <p className="text-amber-200/90 text-[11px]">
                    <strong className="text-amber-300">Impacto en la autoescuela:</strong> {advice.impactoAutoescuela}
                  </p>
                </div>

                {/* Registered Appointment Box if already set */}
                {advice.citaRegistrada ? (
                  <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-500/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="font-bold text-white block">
                          Cita Previa ya concertada: {formatFecha(advice.citaRegistrada.fecha)} a las {advice.citaRegistrada.hora}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Estación: {advice.citaRegistrada.estacion || 'No especificada'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClearAppointment(advice.vehicleId)}
                      className="text-[11px] text-slate-400 hover:text-red-400 underline"
                    >
                      Modificar o anular
                    </button>
                  </div>
                ) : isEditingThisAppointment ? (
                  /* Form to register appointment */
                  <div className="mt-3 p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-white block">
                      Anotar Cita Previa Concertada
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Fecha</label>
                        <input
                          type="date"
                          value={citaFecha}
                          onChange={(e) => setCitaFecha(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Hora</label>
                        <input
                          type="time"
                          value={citaHora}
                          onChange={(e) => setCitaHora(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Estación</label>
                        <input
                          type="text"
                          value={citaEstacion}
                          onChange={(e) => setCitaEstacion(e.target.value)}
                          placeholder="Ej. ITV Coslada, TÜV SÜD"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingAppointmentFor(null)}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveAppointment(advice.vehicleId)}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                      >
                        Guardar Cita
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Action buttons */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Google Calendar export */}
                    {originalVehicle && (
                      <a
                        href={getGoogleCalendarUrl(originalVehicle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        title="Añadir evento a Google Calendar con la fecha límite y datos del vehículo"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Añadir a Google Calendar</span>
                      </a>
                    )}

                    {!advice.citaRegistrada && !isEditingThisAppointment && (
                      <button
                        onClick={() => {
                          setCitaFecha(advice.fechaInspeccionOptima);
                          setEditingAppointmentFor(advice.vehicleId);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Anotar Cita Concertada</span>
                      </button>
                    )}
                  </div>

                  {/* Renew button */}
                  <button
                    onClick={() => onRenewVehicle(advice.vehicleId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition active:scale-95 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Marcar ITV Pasada</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
