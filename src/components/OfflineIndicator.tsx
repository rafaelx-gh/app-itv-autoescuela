import React from 'react';
import { useOnlineStatus } from './usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-4 z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-amber-400/30">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
        <span>Modo sin conexión — La flota se guarda en la memoria local del dispositivo.</span>
      </div>
    </div>
  );
};
