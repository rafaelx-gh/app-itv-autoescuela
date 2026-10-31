import { Vehicle } from '../types/vehicle';

const STORAGE_KEY = 'autoescuela_itv_fleet_v1';

export const INITIAL_FLEET: Vehicle[] = [
  {
    id: 'veh-01',
    matricula: '4582 LKP',
    tipo: 'coche',
    marca: 'SEAT',
    modelo: 'Ibiza 1.0 TSI Style (Doble Mando)',
    numeroInterno: 'Coche 01 (Permiso B)',
    fechaCaducidadITV: '2026-11-14', // In 14 days! (Urgente / Naranja)
    dobleMando: true,
    combustible: 'Gasolina',
    kilometraje: 94250,
    bastidor: 'VSSZZZ6JZLR049182',
    fechaMatriculacion: '2020-05-18',
    frecuenciaMeses: 6,
    citaPrevia: {
      solicitada: true,
      fecha: '2026-11-10',
      hora: '09:30',
      estacion: 'ITV Las Rozas (TÜV SÜD)'
    },
    notas: 'Revisar bombilla antiniebla derecha y presión de neumáticos antes de ir.',
    historial: [
      {
        id: 'h-1',
        fecha: '2026-05-12',
        resultado: 'favorable',
        estacion: 'ITV Las Rozas',
        kilometros: 81200,
        vigenciaHasta: '2026-11-14'
      }
    ]
  },
  {
    id: 'veh-02',
    matricula: '7291 LTX',
    tipo: 'coche',
    marca: 'Renault',
    modelo: 'Clio E-Tech Híbrido 140 CV Autoescuela',
    numeroInterno: 'Coche 02 (Automático B)',
    fechaCaducidadITV: '2026-10-26', // Overdue by 5 days! (Caducada / Rojo)
    dobleMando: true,
    combustible: 'Híbrido',
    kilometraje: 112400,
    bastidor: 'VF1RJA00564918204',
    fechaMatriculacion: '2019-10-15',
    frecuenciaMeses: 6,
    citaPrevia: {
      solicitada: false
    },
    notas: '¡NO ASIGNAR A CLASES! Pendiente de cita urgente en ITV Coslada.',
    historial: [
      {
        id: 'h-2',
        fecha: '2026-04-20',
        resultado: 'favorable_con_leves',
        estacion: 'ITV Coslada (Applus)',
        kilometros: 98500,
        observaciones: 'Defecto leve: Reglaje haz de luz bajo corregido en taller.',
        vigenciaHasta: '2026-10-26'
      }
    ]
  },
  {
    id: 'veh-03',
    matricula: '1944 MMR',
    tipo: 'coche',
    marca: 'Peugeot',
    modelo: '208 PureTech 100 CV Active Pack',
    numeroInterno: 'Coche 03 (Permiso B)',
    fechaCaducidadITV: '2027-03-10', // In ~4.5 months (Al día / Verde)
    dobleMando: true,
    combustible: 'Gasolina',
    kilometraje: 68100,
    bastidor: 'VR3UPHNK0MT104822',
    fechaMatriculacion: '2022-03-01',
    frecuenciaMeses: 12,
    citaPrevia: { solicitada: false },
    notas: 'Mantenimiento de 60.000km completado en taller oficial.'
  },
  {
    id: 'veh-04',
    matricula: '8390 MBC',
    tipo: 'moto',
    marca: 'Yamaha',
    modelo: 'MT-07 ABS Limitada 35 kW',
    numeroInterno: 'Moto 01 (Permiso A2)',
    fechaCaducidadITV: '2026-11-22', // In 22 days! (Urgente / Naranja)
    dobleMando: false,
    combustible: 'Gasolina',
    kilometraje: 42100,
    bastidor: 'JYARM331000049182',
    fechaMatriculacion: '2020-11-20',
    frecuenciaMeses: 12,
    citaPrevia: {
      solicitada: true,
      fecha: '2026-11-18',
      hora: '16:00',
      estacion: 'ITV Getafe (SGS)'
    },
    notas: 'Topes anticaída y barras de protección homologadas en ficha técnica.'
  },
  {
    id: 'veh-05',
    matricula: '5162 KZR',
    tipo: 'moto',
    marca: 'Honda',
    modelo: 'CB500F ABS',
    numeroInterno: 'Moto 02 (Permiso A2)',
    fechaCaducidadITV: '2027-04-18', // In ~5.5 months (Al día / Verde)
    dobleMando: false,
    combustible: 'Gasolina',
    kilometraje: 35400,
    bastidor: 'MLHPC63A0K5012481',
    fechaMatriculacion: '2021-04-15',
    frecuenciaMeses: 12,
    citaPrevia: { solicitada: false },
    notas: 'Neumático trasero nuevo Michelin Road 6.'
  },
  {
    id: 'veh-06',
    matricula: '3819 JXX',
    tipo: 'moto',
    marca: 'Piaggio',
    modelo: 'Liberty 125 i-get Corporate',
    numeroInterno: 'Scooter 01 (Permiso A1 / AM)',
    fechaCaducidadITV: '2026-10-13', // Overdue by 18 days! (Caducada / Rojo)
    dobleMando: false,
    combustible: 'Gasolina',
    kilometraje: 29800,
    bastidor: 'ZAPM8910000019284',
    fechaMatriculacion: '2018-10-10',
    frecuenciaMeses: 12,
    citaPrevia: { solicitada: false },
    notas: 'Batería descargada, parada en garaje. Solicitar grúa para ITV.'
  },
  {
    id: 'veh-07',
    matricula: '9103 MNK',
    tipo: 'coche',
    marca: 'Volkswagen',
    modelo: 'Polo 1.0 TSI Life 95 CV',
    numeroInterno: 'Coche 04 (Permiso B)',
    fechaCaducidadITV: '2027-06-25', // Al día / Verde
    dobleMando: true,
    combustible: 'Gasolina',
    kilometraje: 41200,
    bastidor: 'WVWZZZAWZNY019482',
    fechaMatriculacion: '2022-06-20',
    frecuenciaMeses: 12,
    citaPrevia: { solicitada: false },
    notas: 'Doble mando electrónico homologado por TÜV Rheinland.'
  }
];

export function getFleet(): Vehicle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveFleet(INITIAL_FLEET);
      return INITIAL_FLEET;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FLEET;
  } catch (e) {
    console.error('Error loading fleet from localStorage:', e);
    return INITIAL_FLEET;
  }
}

export function saveFleet(fleet: Vehicle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fleet));
  } catch (e) {
    console.error('Error saving fleet to localStorage:', e);
  }
}

export function addVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
  const fleet = getFleet();
  const newVehicle: Vehicle = {
    ...vehicle,
    id: 'veh-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    fechaModificacion: new Date().toISOString()
  };
  fleet.unshift(newVehicle);
  saveFleet(fleet);
  return newVehicle;
}

export function updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
  const fleet = getFleet();
  const index = fleet.findIndex((v) => v.id === id);
  if (index === -1) return null;

  fleet[index] = {
    ...fleet[index],
    ...updates,
    fechaModificacion: new Date().toISOString()
  };
  saveFleet(fleet);
  return fleet[index];
}

export function deleteVehicle(id: string): boolean {
  const fleet = getFleet();
  const filtered = fleet.filter((v) => v.id !== id);
  if (filtered.length !== fleet.length) {
    saveFleet(filtered);
    return true;
  }
  return false;
}

export function resetFleetToDefault(): Vehicle[] {
  saveFleet(INITIAL_FLEET);
  return INITIAL_FLEET;
}

/**
 * Quick action: Mark ITV as passed today and renew validity automatically
 * based on vehicle frequency (typically 6 months for autoescuelas older than 5 years, or 12 months for motorcycles/newer cars)
 */
export function renewVehicleITV(id: string, estacionNombre: string = 'Estación ITV', resultado: 'favorable' | 'favorable_con_leves' = 'favorable'): Vehicle | null {
  const fleet = getFleet();
  const index = fleet.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const current = fleet[index];
  const months = current.frecuenciaMeses || (current.tipo === 'coche' ? 6 : 12);

  const hoy = new Date();
  const nuevaFecha = new Date(hoy.getFullYear(), hoy.getMonth() + months, hoy.getDate());
  const nuevaFechaStr = nuevaFecha.toISOString().split('T')[0];
  const hoyStr = hoy.toISOString().split('T')[0];

  const newHistoryEntry = {
    id: 'h-' + Date.now(),
    fecha: hoyStr,
    resultado,
    estacion: estacionNombre,
    kilometros: current.kilometraje,
    vigenciaHasta: nuevaFechaStr,
    observaciones: 'ITV renovada favorablemente con sello oficial.'
  };

  const updatedHistory = current.historial ? [newHistoryEntry, ...current.historial] : [newHistoryEntry];

  fleet[index] = {
    ...current,
    fechaCaducidadITV: nuevaFechaStr,
    citaPrevia: { solicitada: false },
    historial: updatedHistory,
    fechaModificacion: new Date().toISOString()
  };

  saveFleet(fleet);
  return fleet[index];
}
