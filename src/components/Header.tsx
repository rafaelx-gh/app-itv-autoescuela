import React, { useState } from 'react';
import { Vehicle } from '../types/vehicle';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Car,
  Sparkles,
  Camera,
  Plus,
  RotateCcw,
  Download,
  Upload,
  MoreVertical,
  Check,
  ShieldCheck,
  CalendarClock,
  Bell,
  BellRing
} from 'lucide-react';

interface Props {
  activeTab: 'flota' | 'predictivo' | 'scanner';
  onTabChange: (tab: 'flota' | 'predictivo' | 'scanner') => void;
  onOpenNewVehicleModal: () => void;
  onOpenNotifications: () => void;
  notificationsEnabled: boolean;
  onResetFleet: () => void;
  onExportJson: () => void;
  onImportJson: () => void;
  urgentCount: number;
  expiredCount: number;
  totalCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onOpenNewVehicleModal,
  onOpenNotifications,
  notificationsEnabled,
  onResetFleet,
  onExportJson,
  onImportJson,
  urgentCount,
  expiredCount,
  totalCount
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Driving School "L" Badge + Shield */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30 shrink-0">
              <span className="text-white font-black text-xl tracking-tighter leading-none">
                L
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  Autoescuela ITV
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full uppercase">
                  PWA Flota
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Control de caducidades, citas y fichas técnicas
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Notification Bell Button */}
            <button
              onClick={onOpenNotifications}
              className={`relative p-2 rounded-xl transition ${
                notificationsEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
              title="Configurar avisos y notificaciones de ITV"
            >
              {notificationsEnabled ? (
                <BellRing className="w-4 h-4 text-amber-400" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              {(urgentCount > 0 || expiredCount > 0) && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-slate-900 animate-pulse">
                  {urgentCount + expiredCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton compact />

            {/* "+ Nuevo Vehículo" button */}
            <button
              onClick={onOpenNewVehicleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Vehículo</span>
              <span className="sm:hidden">Añadir</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Opciones de flota y copias de seguridad"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onExportJson();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition text-left"
                    >
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>Exportar copia JSON</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onImportJson();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition text-left"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Restaurar copia JSON</span>
                    </button>
                    <div className="my-1 border-t border-slate-800" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        if (confirm('¿Restablecer la flota con los vehículos de demostración de la autoescuela?')) {
                          onResetFleet();
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition text-left text-amber-400"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restablecer flota inicial</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Mobile-friendly sticky tab bar) */}
        <div className="mt-3 flex items-center gap-1 sm:gap-2 border-t border-slate-800/80 pt-2.5 overflow-x-auto">
          {/* Flota Tab */}
          <button
            onClick={() => onTabChange('flota')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'flota'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Flota de Vehículos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'flota' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* Recordatorios Predictivos Tab */}
          <button
            onClick={() => onTabChange('predictivo')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'predictivo'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CalendarClock className="w-4 h-4" />
            <span>Previsión y Citas</span>
            {(expiredCount > 0 || urgentCount > 0) && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-red-500 text-white animate-pulse">
                {expiredCount + urgentCount}
              </span>
            )}
          </button>

          {/* Scanner IA Tab */}
          <button
            onClick={() => onTabChange('scanner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'scanner'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Escanear Ficha con IA</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold uppercase tracking-wider">
              Nuevo
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
