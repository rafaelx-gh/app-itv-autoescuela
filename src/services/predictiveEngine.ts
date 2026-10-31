import { Vehicle, getITVStatus, formatFecha } from '../types/vehicle';

export interface PredictiveAdvice {
  vehicleId: string;
  matricula: string;
  modelo: string;
  tipo: 'coche' | 'moto';
  fechaCaducidad: string;
  diasRestantes: number;
  urgencia: 'inmediata' | 'alta' | 'media' | 'optima';
  estadoTitulo: string;
  estadoColor: string;
  fechaPedirCitaRecomendada: string;
  fechaInspeccionOptima: string;
  plazoRegla30Dias: string;
  recomendacionTexto: string;
  impactoAutoescuela: string;
  accionSugerida: string;
  citaRegistrada?: {
    fecha?: string;
    hora?: string;
    estacion?: string;
  };
}

export function generatePredictiveAdvice(vehicle: Vehicle, referenceDate: Date = new Date()): PredictiveAdvice {
  const statusInfo = getITVStatus(vehicle.fechaCaducidadITV, referenceDate);
  const caducidad = new Date(vehicle.fechaCaducidadITV + 'T00:00:00');
  
  // 30 days before expiration (Official DGT window: keeps original renewal date)
  const dgtWindowStart = new Date(caducidad);
  dgtWindowStart.setDate(dgtWindowStart.getDate() - 30);

  // 45 days before expiration: Ideal time to book appointment online
  const idealBookingStart = new Date(caducidad);
  idealBookingStart.setDate(idealBookingStart.getDate() - 45);

  // 15 days before expiration: Ideal day to actually go to the inspection station
  const idealInspectionDate = new Date(caducidad);
  idealInspectionDate.setDate(idealInspectionDate.getDate() - 15);

  const dias = statusInfo.diasRestantes;

  let urgencia: 'inmediata' | 'alta' | 'media' | 'optima' = 'optima';
  let estadoTitulo = 'Programación en regla';
  let estadoColor = 'text-emerald-400';
  let recomendacionTexto = '';
  let impactoAutoescuela = '';
  let accionSugerida = '';

  if (dias < 0) {
    urgencia = 'inmediata';
    estadoTitulo = `¡ITV CADUCADA HACE ${Math.abs(dias)} DÍAS!`;
    estadoColor = 'text-red-400';
    recomendacionTexto = 'El vehículo no puede circular legalmente por la vía pública ni realizar prácticas de conducción.';
    impactoAutoescuela = 'Los examinadores de la DGT cancelarán cualquier examen práctico programado con este vehículo. Posible sanción de 200€.';
    accionSugerida = 'Pedir cita previa urgente hoy mismo o acudir sin cita a primera hora.';
  } else if (dias <= 10) {
    urgencia = 'inmediata';
    estadoTitulo = `Vencimiento inminente (${dias} ${dias === 1 ? 'día' : 'días'})`;
    estadoColor = 'text-red-400';
    recomendacionTexto = 'Quedan muy pocos días para la caducidad. Es imprescindible pasar la inspección esta misma semana.';
    impactoAutoescuela = 'Si se detecta cualquier defecto leve que requiera taller, podrías quedarte sin margen antes de que caduque el plazo.';
    accionSugerida = 'Confirmar cita previa para los próximos 2 o 3 días.';
  } else if (dias <= 30) {
    urgencia = 'alta';
    estadoTitulo = `Ventana oficial de 30 días abierta (${dias} días restantes)`;
    estadoColor = 'text-amber-400';
    recomendacionTexto = 'Según el Real Decreto 920/2017, puedes pasar la ITV desde ahora mismo manteniendo íntegra tu fecha de caducidad para la próxima revisión.';
    impactoAutoescuela = 'Pasarla ahora garantiza que la flota sigue operativa para todos los turnos de clases prácticas sin interrupciones.';
    accionSugerida = `Acudir entre el ${formatFecha(idealInspectionDate.toISOString().split('T')[0])} y el ${formatFecha(vehicle.fechaCaducidadITV)}.`;
  } else if (dias <= 45) {
    urgencia = 'media';
    estadoTitulo = `Momento óptimo para solicitar cita previa (${dias} días)`;
    estadoColor = 'text-sky-400';
    recomendacionTexto = 'Estás a 45 días de la fecha límite. Es el mejor momento para reservar cita online y elegir el horario que mejor cuadre con las clases de los profesores.';
    impactoAutoescuela = 'Evita colas y horas punta en la estación ITV que puedan restar horas de enseñanza a los alumnos.';
    accionSugerida = 'Acceder al portal de cita previa de tu estación ITV habitual.';
  } else {
    urgencia = 'optima';
    estadoTitulo = `Vigencia holgada (${dias} días restantes)`;
    estadoColor = 'text-emerald-400';
    recomendacionTexto = `La próxima fecha recomendada para solicitar cita será a partir del ${formatFecha(idealBookingStart.toISOString().split('T')[0])}.`;
    impactoAutoescuela = 'Vehículo 100% operativo y en orden legal para el programa lectivo.';
    accionSugerida = 'Sin acción urgente requerida actualmente.';
  }

  return {
    vehicleId: vehicle.id,
    matricula: vehicle.matricula,
    modelo: vehicle.modelo,
    tipo: vehicle.tipo,
    fechaCaducidad: vehicle.fechaCaducidadITV,
    diasRestantes: dias,
    urgencia,
    estadoTitulo,
    estadoColor,
    fechaPedirCitaRecomendada: idealBookingStart.toISOString().split('T')[0],
    fechaInspeccionOptima: idealInspectionDate.toISOString().split('T')[0],
    plazoRegla30Dias: dgtWindowStart.toISOString().split('T')[0],
    recomendacionTexto,
    impactoAutoescuela,
    accionSugerida,
    citaRegistrada: vehicle.citaPrevia?.solicitada ? vehicle.citaPrevia : undefined
  };
}

/**
 * Creates Google Calendar URL for an ITV appointment reminder
 */
export function getGoogleCalendarUrl(vehicle: Vehicle): string {
  const title = encodeURIComponent(`🚨 ITV Autoescuela - ${vehicle.matricula} (${vehicle.modelo})`);
  const details = encodeURIComponent(
    `Recordatorio de ITV para vehículo de autoescuela.\n` +
    `Matrícula: ${vehicle.matricula}\n` +
    `Modelo: ${vehicle.modelo}\n` +
    `Fecha límite oficial: ${formatFecha(vehicle.fechaCaducidadITV)}\n` +
    `Nota: En España se puede pasar la ITV hasta 30 días antes manteniendo la fecha de validez.`
  );
  
  // Suggest appointment date 7 days before expiration
  const cad = new Date(vehicle.fechaCaducidadITV + 'T09:00:00');
  const targetDate = new Date(cad);
  targetDate.setDate(targetDate.getDate() - 7);
  
  const startIso = targetDate.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';
  const endTarget = new Date(targetDate.getTime() + 60 * 60 * 1000);
  const endIso = endTarget.toISOString().replace(/-|:|\.\d\d\d/g, '').substring(0, 15) + 'Z';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startIso}/${endIso}`;
}

/**
 * Official ITV appointment links in Spain
 */
export const ITV_CENTERS = [
  { name: 'Applus+ Iteuve', url: 'https://www.applusiteuve.com/es-es/cita-previa', logo: 'Applus+' },
  { name: 'TÜV SÜD ITV', url: 'https://www.tuvsud.com/es-es/servicios/itv/cita-previa', logo: 'TÜV SÜD' },
  { name: 'SGS ITV', url: 'https://serviciositv.es/cita-previa-itv', logo: 'SGS' },
  { name: 'Itevelesa', url: 'https://www.itevelesa.com/cita-previa/', logo: 'Itevelesa' },
  { name: 'Certio ITV', url: 'https://www.certio.com/cita-previa/', logo: 'Certio' }
];
