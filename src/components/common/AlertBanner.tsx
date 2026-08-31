import React, { useState } from 'react';
import { AlertTriangle, Info, XCircle, Bell, ChevronRight, X } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export const AlertBanner: React.FC<{ onNavigateToModule?: (module: string) => void }> = ({
  onNavigateToModule,
}) => {
  const { alerts } = useFarm();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);

  const alertList = alerts || [];
  if (alertList.length === 0 || isDismissed) return null;

  const topAlert = alertList[0];
  const dangerCount = alertList.filter((a) => a.level === 'danger').length;

  return (
    <>
      <div
        id="alert-top-banner"
        className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium border-b transition-colors ${
          dangerCount > 0
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="shrink-0 p-1 rounded-full bg-rose-100">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
          </div>
          <span className="font-bold shrink-0">
            {dangerCount > 0 ? `[Alerte Critique]` : `[Attention]`}
          </span>
          <span className="truncate">{topAlert.title} : {topAlert.message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOpenDrawer(true)}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#E2E2D6] text-[#434333] font-semibold text-xs flex items-center gap-1 border border-[#D1D1C4] shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-700" />
            <span>{alerts.length} alerte{alerts.length > 1 ? 's' : ''}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-black/5 rounded text-[#8A8A6F] hover:text-[#2D2D2D]"
            title="Masquer le bandeau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Drawer / Modal */}
      {isOpenDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2D]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-2xl space-y-4 text-[#2D2D2D]">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-700" />
                <h3 className="text-lg font-bold text-[#434333] font-serif">
                  Centre d’Alertes & Vigilance ({alerts.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenDrawer(false)}
                className="p-1 text-[#8A8A6F] hover:text-[#2D2D2D] rounded-xl hover:bg-[#E2E2D6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    alert.level === 'danger'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : alert.level === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-sky-50 border-sky-200 text-sky-900'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {alert.level === 'danger' && <XCircle className="w-5 h-5 text-rose-600" />}
                    {alert.level === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                    {alert.level === 'info' && <Info className="w-5 h-5 text-sky-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#2D2D2D]">{alert.title}</h4>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white text-[#5A5A40] border border-[#D1D1C4]">
                        {alert.module}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A5A40] mt-1">{alert.message}</p>
                    {onNavigateToModule && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenDrawer(false);
                          onNavigateToModule(alert.module);
                        }}
                        className="mt-2 text-xs font-bold text-[#5A5A40] hover:text-[#434333] flex items-center gap-1"
                      >
                        Consulter le module {alert.module} &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpenDrawer(false)}
                className="px-4 py-2 bg-[#5A5A40] hover:bg-[#434333] text-white text-xs font-medium rounded-xl shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
