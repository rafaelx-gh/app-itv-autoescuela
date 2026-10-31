import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share2, PlusSquare, X, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
        title="Instalar como aplicación en el móvil o escritorio"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 font-medium text-slate-200 hover:bg-slate-700 transition ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          title="Instalar en iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instalar en iPhone o iPad</h3>
                  <p className="text-xs text-slate-400">PWA Autoescuela ITV</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-blue-500/20 text-blue-400 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong>Paso 1:</strong> Pulsa el botón <strong>Compartir</strong> en la barra inferior de Safari.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-blue-500/20 text-blue-400 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong>Paso 2:</strong> Desliza hacia abajo y pulsa en <strong>Añadir a pantalla de inicio</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition active:scale-98"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
