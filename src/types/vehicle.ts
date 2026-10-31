export type VehicleType = 'coche' | 'moto';

export type ITVStatusType = 'caducada' | 'urgente' | 'al_dia';

export interface ITVHistoryEntry {
  id: string;
  fecha: string; // YYYY-MM-DD
  resultado: 'favorable' | 'favorable_con_leves' | 'desfavorable';
  estacion?: string;
  kilometros?: number;
  observaciones?: string;
  vigenciaHasta: string;
}

export interface Vehicle {
  id: string;
  matricula: string; // e.g. "4582 LKP"
  tipo: VehicleType;
  marca: string;
  modelo: string;
  fechaCaducidadITV: string; // YYYY-MM-DD
  numeroInterno?: string; // e.g. "Auto 01 - Doble Mando"
  dobleMando?: boolean; // whether dual-control pedals are installed (typical for driving school)
  combustible?: 'Gasolina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  kilometraje?: number;
  bastidor?: string;
  fechaMatriculacion?: string;
  frecuenciaMeses?: number; // 6 or 12 months
  citaPrevia?: {
    solicitada: boolean;
    fecha?: string;
    estacion?: string;
    hora?: string;
  };
  notas?: string;
  historial?: ITVHistoryEntry[];
  fechaModificacion?: string;
}

export interface ITVStatusInfo {
  status: ITVStatusType;
  diasRestantes: number;
  label: string;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    lightBg: string;
    glow: string;
    dot: string;
  };
  mensajeAlerta: string;
  urgenciaNivel: 1 | 2 | 3; // 1 = caducada (máxima), 2 = urgente (media), 3 = al día (normal)
}

/**
 * Calculates current status and remaining days for a given ITV expiration date
 */
export function getITVStatus(fechaCaducidadStr: string, referenceDate: Date = new Date()): ITVStatusInfo {
  if (!fechaCaducidadStr) {
    return {
      status: 'urgente',
      diasRestantes: 0,
      label: 'Sin fecha registrada',
      colorClass: {
        bg: 'bg-slate-800',
        text: 'text-slate-300',
        border: 'border-slate-700',
        badge: 'bg-slate-700 text-slate-300',
        lightBg: 'bg-slate-900/60',
        glow: 'shadow-none',
        dot: 'bg-slate-400'
      },
      mensajeAlerta: 'Pendiente de registrar fecha de caducidad',
      urgenciaNivel: 2,
    };
  }

  const caducidad = new Date(fechaCaducidadStr + 'T23:59:59');
  const hoy = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate(), 0, 0, 0);

  const diffTime = caducidad.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    const diasCaducada = Math.abs(diasRestantes);
    return {
      status: 'caducada',
      diasRestantes,
      label: `Caducada hace ${diasCaducada} ${diasCaducada === 1 ? 'día' : 'días'}`,
      colorClass: {
        bg: 'bg-red-950/40',
        text: 'text-red-400',
        border: 'border-red-500/40',
        badge: 'bg-red-500 text-white',
        lightBg: 'bg-red-500/10',
        glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
        dot: 'bg-red-500'
      },
      mensajeAlerta: '¡URGENTE! Vehículo inmovilizado para exámenes y clases de autoescuela. Riesgo de sanción económica.',
      urgenciaNivel: 1,
    };
  } else if (diasRestantes <= 30) {
    return {
      status: 'urgente',
      diasRestantes,
      label: diasRestantes === 0 ? 'Caduca hoy' : `Caduca en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`,
      colorClass: {
        bg: 'bg-amber-950/40',
        text: 'text-amber-400',
        border: 'border-amber-500/40',
        badge: 'bg-amber-500 text-slate-950 font-semibold',
        lightBg: 'bg-amber-500/10',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
        dot: 'bg-amber-400'
      },
      mensajeAlerta: 'Próxima a vencer. Ventana óptima para solicitar cita previa y pasar la inspección sin perder días.',
      urgenciaNivel: 2,
    };
  } else {
    return {
      status: 'al_dia',
      diasRestantes,
      label: `En regla (${diasRestantes} días)`,
      colorClass: {
        bg: 'bg-emerald-950/30',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-600 text-white',
        lightBg: 'bg-emerald-500/10',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
        dot: 'bg-emerald-400'
      },
      mensajeAlerta: 'ITV vigente y apto para clases prácticas de conducción y exámenes de la DGT.',
      urgenciaNivel: 3,
    };
  }
}

/**
 * Format date string (YYYY-MM-DD) into readable Spanish format
 */
export function formatFecha(fechaStr?: string, formato: 'corta' | 'larga' | 'mes_ano' = 'corta'): string {
  if (!fechaStr) return '—';
  try {
    const parts = fechaStr.split('-');
    if (parts.length !== 3) return fechaStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);

    if (formato === 'mes_ano') {
      return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase();
    }
    if (formato === 'larga') {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return fechaStr;
  }
}

/**
 * Spanish license plate formatter (e.g. "1234ABC" -> "1234 ABC")
 */
export function formatMatricula(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.toUpperCase().replace(/[^0-9A-Z]/g, '');
  // Modern format: 4 numbers + 3 letters
  const modernMatch = cleaned.match(/^(\d{4})([A-Z]{3})$/);
  if (modernMatch) {
    return `${modernMatch[1]} ${modernMatch[2]}`;
  }
  // Provincial format: 1-2 letters + 4 numbers + 1-2 letters (e.g. M 1234 AB)
  const provMatch = cleaned.match(/^([A-Z]{1,2})(\d{4})([A-Z]{0,2})$/);
  if (provMatch) {
    return `${provMatch[1]} ${provMatch[2]} ${provMatch[3]}`.trim();
  }
  return cleaned;
}
