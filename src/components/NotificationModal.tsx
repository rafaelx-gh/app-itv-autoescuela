import React, { useState, useEffect } from 'react';
import {
  getNotificationStatus,
  requestNotificationPermission,
  toggleNotifications,
  sendTestNotification,
  checkAndNotifyExpiringVehicles,
  NotificationStatus
} from '../services/notifications';
import { Vehicle } from '../types/vehicle';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  X,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Send
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fleet: Vehicle[];
}

export const NotificationModal: React.FC<Props> = ({ isOpen, onClose, fleet }) => {
  const [status, setStatus] = useState<NotificationStatus>(() => getNotificationStatus());
  const [testSent, setTestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(getNotificationStatus());
      setTestSent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequest = async () => {
    setIsLoading(true);
    const granted = await requestNotificationPermission();
    setStatus(getNotificationStatus());
    setIsLoading(false);
    if (granted) {
      // Send test notification right away
      sendTestNotification();
      setTestSent(true);
    }
  };

  const handleToggle = () => {
    const nextState = !status.isEnabled;
    toggleNotifications(nextState);
    setStatus(getNotificationStatus());
  };

  const handleSendTest = async () => {
    const ok = await sendTestNotification();
    if (ok) {
      setTestSent(true);
    } else {
      alert('Por favor autoriza las notificaciones en la barra de tu navegador.');
    }
  };

  const handleCheckNow = async () => {
    const count = await checkAndNotifyExpiringVehicles(fleet, true);
    if (count > 0) {
      setTestSent(true);
    } else {
      sendTestNotification();
      setTestSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alertas y Notificaciones ITV</h3>
              <p className="text-xs text-slate-400">Avisos automáticos de vencimiento a 30 días</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="rounded-xl p-3.5 border bg-slate-800/60 border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Estado de los avisos del sistema:
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                status.isEnabled
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {status.isEnabled ? '✅ Activas' : 'Inactivas'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Cuando están activadas, la aplicación enviará una notificación a tu pantalla cuando algún coche o moto de la autoescuela entre en el plazo de los <strong>30 días previos</strong> a la caducidad o tenga la <strong>ITV ya vencida</strong>.
          </p>

          {/* Toggle / Activate Button */}
          {status.permission !== 'granted' ? (
            <button
              onClick={handleRequest}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              <Bell className="w-4 h-4" />
              <span>Activar Notificaciones en este Dispositivo</span>
            </button>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 font-medium">
                Recibir alertas en este móvil o PC:
              </span>
              <button
                type="button"
                onClick={handleToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  status.isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    status.isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* How it works details */}
        <div className="space-y-2 text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
            ¿Cómo te avisará la app?
          </span>
          <ul className="space-y-1.5 list-disc pl-4 text-[11px]">
            <li>
              <strong>Aviso de 30 días:</strong> Notificación cuando se abre el plazo oficial de la DGT para pedir cita previa.
            </li>
            <li>
              <strong>Aviso crítico (Caducada):</strong> Alerta roja urgente si un vehículo supera la fecha sin haber pasado la inspección.
            </li>
            <li>
              <strong>En iPhone / iPad:</strong> Requiere instalar la PWA en la pantalla de inicio (iOS 16.4+) para recibir notificaciones del sistema.
            </li>
          </ul>
        </div>

        {/* Test Notification Button */}
        {status.permission === 'granted' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendTest}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition"
              >
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span>Enviar Notificación de Prueba</span>
              </button>

              <button
                onClick={handleCheckNow}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 text-xs font-medium transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Comprobar Flota Ahora</span>
              </button>
            </div>

            {testSent && (
              <p className="text-[11px] text-emerald-400 text-center flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Notificación emitida en tu sistema.
              </p>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
