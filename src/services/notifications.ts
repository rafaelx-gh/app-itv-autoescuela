import { Vehicle, getITVStatus, formatFecha } from '../types/vehicle';

const NOTIFICATIONS_ENABLED_KEY = 'autoescuela_itv_notifications_enabled';
const LAST_CHECK_KEY = 'autoescuela_itv_notifications_last_check';

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isEnabled: boolean;
}

export function getNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      isSupported: false,
      permission: 'unsupported',
      isEnabled: false
    };
  }

  const enabled = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true';
  return {
    isSupported: true,
    permission: Notification.permission,
    isEnabled: enabled && Notification.permission === 'granted'
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      return true;
    } else {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      return false;
    }
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return false;
  }
}

export function toggleNotifications(enable: boolean): void {
  localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enable ? 'true' : 'false');
}

/**
 * Sends a native notification using ServiceWorker if available, or Notification API
 */
export async function sendSystemNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions: any = {
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag: 'itv-reminder',
    vibrate: [200, 100, 200],
    ...options
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, defaultOptions);
        return true;
      }
    }

    new Notification(title, defaultOptions);
    return true;
  } catch (err) {
    console.error('Error sending system notification:', err);
    try {
      new Notification(title, defaultOptions);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Checks fleet for vehicles expiring in <= 30 days or already expired
 * and triggers notifications if enabled.
 */
export async function checkAndNotifyExpiringVehicles(fleet: Vehicle[], force: boolean = false): Promise<number> {
  const status = getNotificationStatus();
  if (!status.isEnabled && !force) {
    return 0;
  }

  // Prevent spamming notifications multiple times in the same hour unless forced
  const lastCheckStr = localStorage.getItem(LAST_CHECK_KEY);
  const now = Date.now();
  if (!force && lastCheckStr) {
    const lastCheck = parseInt(lastCheckStr, 10);
    // 3 hours debounce
    if (now - lastCheck < 3 * 60 * 60 * 1000) {
      return 0;
    }
  }

  const urgentVehicles: { vehicle: Vehicle; dias: number; caducada: boolean }[] = [];

  for (const v of fleet) {
    const itv = getITVStatus(v.fechaCaducidadITV);
    if (itv.status === 'caducada') {
      urgentVehicles.push({ vehicle: v, dias: itv.diasRestantes, caducada: true });
    } else if (itv.status === 'urgente') {
      urgentVehicles.push({ vehicle: v, dias: itv.diasRestantes, caducada: false });
    }
  }

  if (urgentVehicles.length === 0) {
    localStorage.setItem(LAST_CHECK_KEY, now.toString());
    return 0;
  }

  // Find most urgent vehicle or summarize
  const expiredCount = urgentVehicles.filter(u => u.caducada).length;
  const expiringSoonCount = urgentVehicles.length - expiredCount;

  let title = '';
  let body = '';

  if (expiredCount > 0) {
    title = `🚨 ¡Alerta ITV Autoescuela: ${expiredCount} ${expiredCount === 1 ? 'vehículo caducado' : 'vehículos caducados'}!`;
    const firstExpired = urgentVehicles.find(u => u.caducada)!;
    body = `${firstExpired.vehicle.matricula} (${firstExpired.vehicle.modelo}) tiene la ITV caducada. Inmovilizado para exámenes de conducir.`;
  } else {
    const firstSoon = urgentVehicles[0];
    title = `⚠️ ITV Próxima a Vencer (${firstSoon.dias} días)`;
    body = `${firstSoon.vehicle.matricula} (${firstSoon.vehicle.modelo}) vence el ${formatFecha(firstSoon.vehicle.fechaCaducidadITV)}. Solicita cita previa DGT.`;
  }

  await sendSystemNotification(title, {
    body,
    requireInteraction: true,
    data: { url: '/' }
  });

  localStorage.setItem(LAST_CHECK_KEY, now.toString());
  return urgentVehicles.length;
}

/**
 * Triggers a test notification right now so the user can verify browser/phone setup
 */
export async function sendTestNotification(): Promise<boolean> {
  const success = await sendSystemNotification('🔔 Autoescuela ITV - Notificación de Prueba', {
    body: 'El sistema de avisos de vencimiento a 30 días está configurado y funcionando correctamente.',
    icon: '/pwa-192x192.png'
  });
  return success;
}
