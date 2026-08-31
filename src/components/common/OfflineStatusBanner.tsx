import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Smartphone, Check, X } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isOnline && (!showInstallPrompt || isDismissed)) {
    return null;
  }

  return (
    <div className="no-print w-full z-40">
      {!isOnline ? (
        <div className="bg-amber-800 text-amber-50 px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
              <span>
                <strong>Mode Hors-Ligne Actif :</strong> Vous pouvez continuer vos saisies (ramassage, ponte, mortalités). Vos données sont stockées en local et seront synchronisées au retour du réseau.
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 shrink-0">
              100% Autonome
            </span>
          </div>
        </div>
      ) : showInstallPrompt && !isDismissed ? (
        <div className="bg-[#5A5A40] text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                <strong>Installer l'application sur votre smartphone ou tablette :</strong> Accès direct plein écran et fonctionnement fluide au poulailler.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-amber-950 font-bold hover:bg-amber-300 transition-all text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Installer</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80"
                title="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
