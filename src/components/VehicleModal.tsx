import React, { useState, useEffect } from 'react';
import { Vehicle, VehicleType, formatMatricula } from '../types/vehicle';
import { SpanishLicensePlate } from './SpanishLicensePlate';
import {
  X,
  Car,
  Bike,
  Calendar,
  ShieldCheck,
  Hash,
  FileText,
  Gauge,
  Sparkles,
  Check
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicleData: Omit<Vehicle, 'id'>, id?: string) => void;
  initialVehicle?: Vehicle | null;
}

export const VehicleModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialVehicle
}) => {
  const isEditing = !!initialVehicle;

  const [matricula, setMatricula] = useState('');
  const [tipo, setTipo] = useState<VehicleType>('coche');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroInterno, setNumeroInterno] = useState('');
  const [fechaCaducidadITV, setFechaCaducidadITV] = useState('');
  const [dobleMando, setDobleMando] = useState(true);
  const [combustible, setCombustible] = useState<'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico'>('Gasolina');
  const [kilometraje, setKilometraje] = useState<string>('');
  const [frecuenciaMeses, setFrecuenciaMeses] = useState<number>(6);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  // Suggestions for autoescuelas
  const SUGGESTIONS = {
    coche: [
      { marca: 'SEAT', modelo: 'Ibiza 1.0 TSI Style 95 CV' },
      { marca: 'Renault', modelo: 'Clio E-Tech Híbrido 140 CV' },
      { marca: 'Peugeot', modelo: '208 PureTech 100 CV' },
      { marca: 'Volkswagen', modelo: 'Polo 1.0 TSI Life' },
      { marca: 'Toyota', modelo: 'Yaris 120H Active Plus' }
    ],
    moto: [
      { marca: 'Yamaha', modelo: 'MT-07 ABS Limitada 35 kW' },
      { marca: 'Honda', modelo: 'CB500F ABS' },
      { marca: 'Kawasaki', modelo: 'Z650 A2' },
      { marca: 'Piaggio', modelo: 'Liberty 125 i-get' },
      { marca: 'KTM', modelo: '390 Duke A2' }
    ]
  };

  useEffect(() => {
    if (initialVehicle) {
      setMatricula(initialVehicle.matricula || '');
      setTipo(initialVehicle.tipo || 'coche');
      setMarca(initialVehicle.marca || '');
      setModelo(initialVehicle.modelo || '');
      setNumeroInterno(initialVehicle.numeroInterno || '');
      setFechaCaducidadITV(initialVehicle.fechaCaducidadITV || '');
      setDobleMando(initialVehicle.dobleMando ?? (initialVehicle.tipo === 'coche'));
      setCombustible(initialVehicle.combustible || 'Gasolina');
      setKilometraje(initialVehicle.kilometraje ? initialVehicle.kilometraje.toString() : '');
      setFrecuenciaMeses(initialVehicle.frecuenciaMeses || (initialVehicle.tipo === 'coche' ? 6 : 12));
      setNotas(initialVehicle.notas || '');
    } else {
      // Default new vehicle
      setMatricula('');
      setTipo('coche');
      setMarca('SEAT');
      setModelo('Ibiza 1.0 TSI Doble Mando');
      setNumeroInterno('Coche Nuevo');
      // Set default expiration 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setFechaCaducidadITV(d.toISOString().split('T')[0]);
      setDobleMando(true);
      setCombustible('Gasolina');
      setKilometraje('45000');
      setFrecuenciaMeses(6);
      setNotas('');
    }
    setError('');
  }, [initialVehicle, isOpen]);

  if (!isOpen) return null;

  const handleMatriculaChange = (val: string) => {
    const formatted = formatMatricula(val);
    setMatricula(formatted);
    if (error) setError('');
  };

  const handleApplyOffset = (months: number) => {
    const base = fechaCaducidadITV ? new Date(fechaCaducidadITV) : new Date();
    const target = new Date(base.getFullYear(), base.getMonth() + months, base.getDate());
    setFechaCaducidadITV(target.toISOString().split('T')[0]);
  };

  const handleTypeChange = (newType: VehicleType) => {
    setTipo(newType);
    if (newType === 'moto') {
      setDobleMando(false);
      setFrecuenciaMeses(12);
      if (marca === 'SEAT' || marca === 'Renault') {
        setMarca('Yamaha');
        setModelo('MT-07 Limitada 35 kW');
      }
    } else {
      setDobleMando(true);
      setFrecuenciaMeses(6);
      if (marca === 'Yamaha' || marca === 'Honda') {
        setMarca('SEAT');
        setModelo('Ibiza 1.0 TSI Doble Mando');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim()) {
      setError('Por favor indica la matrícula del vehículo.');
      return;
    }
    if (!fechaCaducidadITV) {
      setError('Debes especificar la fecha de caducidad de la ITV.');
      return;
    }

    const payload: Omit<Vehicle, 'id'> = {
      matricula: matricula.trim(),
      tipo,
      marca: marca.trim() || (tipo === 'coche' ? 'Coche' : 'Moto'),
      modelo: modelo.trim() || 'Modelo Autoescuela',
      numeroInterno: numeroInterno.trim() || undefined,
      fechaCaducidadITV,
      dobleMando: tipo === 'coche' ? dobleMando : false,
      combustible,
      kilometraje: kilometraje ? parseInt(kilometraje, 10) : undefined,
      frecuenciaMeses,
      notas: notas.trim() || undefined,
      citaPrevia: initialVehicle?.citaPrevia || { solicitada: false },
      historial: initialVehicle?.historial || []
    };

    onSave(payload, initialVehicle?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {isEditing ? (
                <>
                  <span>Editar Vehículo</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({initialVehicle.matricula})
                  </span>
                </>
              ) : (
                <>
                  <span>Añadir Vehículo a la Flota</span>
                  <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">
                    Autoescuela
                  </span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Datos técnicos y control de caducidad de ITV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Vehicle Type Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Tipo de Vehículo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('coche')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-bold transition-all ${
                  tipo === 'coche'
                    ? 'border-blue-500 bg-blue-600/20 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Car className="w-5 h-5 text-blue-400" />
                <span>Turismo (Coche B)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('moto')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-bold transition-all ${
                  tipo === 'moto'
                    ? 'border-amber-500 bg-amber-600/20 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Bike className="w-5 h-5 text-amber-400" />
                <span>Moto (AM / A1 / A2)</span>
              </button>
            </div>
          </div>

          {/* License Plate & Live Plate Preview */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Matrícula Oficial *
              </label>
              {matricula && (
                <span className="text-[11px] text-slate-400">Vista previa:</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={matricula}
                onChange={(e) => handleMatriculaChange(e.target.value)}
                placeholder="Ej. 1234 BCD o M 1234 AB"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-white tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                required
              />
              {matricula && (
                <SpanishLicensePlate
                  matricula={matricula}
                  tipo={tipo}
                  size="md"
                  className="shrink-0"
                />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Formato moderno (4 cifras y 3 letras) o provincial histórico.
            </p>
          </div>

          {/* Make and Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="SEAT, Renault, Yamaha..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Modelo / Versión
              </label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ibiza 1.0 TSI, MT-07..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Suggestions for Model */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Sugerencias habituales de autoescuela:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS[tipo].map((s) => (
                <button
                  key={s.modelo}
                  type="button"
                  onClick={() => {
                    setMarca(s.marca);
                    setModelo(s.modelo);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition"
                >
                  {s.marca} {s.modelo}
                </button>
              ))}
            </div>
          </div>

          {/* ITV Expiration Date & Smart Offsets */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Fecha Caducidad ITV *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {fechaCaducidadITV}
              </span>
            </div>

            <input
              type="date"
              value={fechaCaducidadITV}
              onChange={(e) => setFechaCaducidadITV(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Atajos rápidos:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleApplyOffset(6)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                  title="Frecuencia semestral para turismos de autoescuela con más de 5 años"
                >
                  +6 meses
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyOffset(12)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                  title="Frecuencia anual para motos y vehículos de 2 a 5 años"
                >
                  +1 año
                </button>
              </div>
            </div>
          </div>

          {/* Driving School Extras: Internal ID, Doble Mando, Kilometraje */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Identificador de Autoescuela
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={numeroInterno}
                  onChange={(e) => setNumeroInterno(e.target.value)}
                  placeholder="Ej. Coche 01, Moto A2"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kilometraje Actual
              </label>
              <div className="relative">
                <Gauge className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="number"
                  value={kilometraje}
                  onChange={(e) => setKilometraje(e.target.value)}
                  placeholder="Ej. 85000"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Doble mando toggle (for cars) */}
          {tipo === 'coche' && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg ${dobleMando ? 'bg-blue-600/30 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Doble Mando Homologado
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pedales auxiliares para el profesor de autoescuela
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDobleMando(!dobleMando)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  dobleMando ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    dobleMando ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Combustible & Ciclo legal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Combustible
              </label>
              <select
                value={combustible}
                onChange={(e) => setCombustible(e.target.value as any)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Gasolina">Gasolina</option>
                <option value="Diésel">Diésel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Eléctrico">Eléctrico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ciclo Renovación ITV
              </label>
              <select
                value={frecuenciaMeses}
                onChange={(e) => setFrecuenciaMeses(parseInt(e.target.value, 10))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={6}>Cada 6 meses (&gt;5 años autoescuela)</option>
                <option value={12}>Cada 1 año (motos o 2-5 años)</option>
                <option value={24}>Cada 2 años (vehículo nuevo)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Notas u Observaciones de la Inspección
            </label>
            <div className="relative">
              <FileText className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                placeholder="Ej. Revisar luces antiniebla, cita reservada en ITV Las Rozas..."
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit / Cancel Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Guardar Cambios' : 'Añadir a la Flota'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
