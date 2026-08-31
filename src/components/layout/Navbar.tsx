import React, { useState } from 'react';
import {
  Menu,
  Plus,
  Egg,
  ShoppingCart,
  Receipt,
  Skull,
  Wheat,
  UserCheck,
  Calendar,
  Sparkles,
  LogOut,
  Shield,
  Lock,
  Cloud,
  CloudOff,
  RefreshCw,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { NavTab } from './Sidebar';

interface NavbarProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onQuickAction: (action: 'production' | 'sale' | 'expense' | 'mortality' | 'feed_consumption') => void;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tableau de bord', subtitle: 'Aperçu global & performances du poulailler' },
  lots: { title: 'Gestion des Poules & Lots', subtitle: 'Suivi des effectifs, âges, races et réformes' },
  production: { title: 'Production d’Œufs (Ramassage)', subtitle: 'Saisie journalière de ramassage & calcul des alvéoles' },
  egg_stock: { title: 'Stock & Alvéoles', subtitle: 'Inventaire en temps réel et mouvements d’œufs' },
  sales: { title: 'Ventes & Facturation', subtitle: 'Enregistrement des ventes, paiements et créances' },
  feed: { title: 'Stock & Achats d’Aliments', subtitle: 'Approvisionnements et état des stocks' },
  feed_consumption: { title: 'Consommation d’Aliments', subtitle: 'Distribution journalière et coût par poule/œuf' },
  expenses: { title: 'Dépenses d’Exploitation', subtitle: 'Charges fixes et variables par catégorie' },
  mortality: { title: 'Déclaration des Mortalités', subtitle: 'Enregistrement des pertes, causes et observations' },
  health: { title: 'Santé, Vaccins & Traitements', subtitle: 'Calendrier prophylactique et ordonnances' },
  clients: { title: 'Répertoire Clients', subtitle: 'Historique d’achats et suivi des impayés' },
  suppliers: { title: 'Fournisseurs & Partenaires', subtitle: 'Gestion des achats et dettes fournisseurs' },
  cashflow: { title: 'Caisse & Trésorerie', subtitle: 'Journal des encaissements et décaissements' },
  profitability: { title: 'Rentabilité & Marges', subtitle: 'Coûts de revient réels et bénéfice net' },
  reports: { title: 'Rapports & Exports', subtitle: 'Bilans périodiques et fiches imprimables' },
  settings: { title: 'Paramètres & Configuration', subtitle: 'Devise, alertes, sécurité des comptes et sauvegardes' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileMenu,
  onQuickAction,
}) => {
  const {
    settings,
    totalCurrentHens,
    todayLayingRate,
    totalEggStockTrays,
    todayEggsProduced,
    currentUser,
    logout,
    syncStatus,
    isFirebaseConnected,
    lastFirebaseSync,
    syncToFirebaseNow,
  } = useFarm();

  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isEmployee = currentUser.role === 'Employé' || currentUser.role === 'employee';

  const currentInfo = tabTitles[currentTab] || {
    title: 'AviGest Pro',
    subtitle: 'Système de gestion avicole',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#F5F5F0]/95 backdrop-blur-md border-b border-[#D1D1C4] px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: mobile button + page title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-[#5A5A40] hover:text-[#2D2D2D] hover:bg-[#E2E2D6] lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#434333] font-serif tracking-tight flex items-center gap-2">
            {currentInfo.title}
          </h1>
          <p className="hidden md:block text-xs text-[#8A8A6F]">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right section: KPIs quick badges + Quick action button + User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick KPI pills (Admin full or Employee simple) */}
        {!isEmployee ? (
          <div className="hidden xl:flex items-center gap-2 bg-[#E2E2D6] px-3 py-1.5 rounded-xl border border-[#D1D1C4] text-xs text-[#434333]">
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#D1D1C4]">
              <span className="text-[#8A8A6F] font-medium">Poules :</span>
              <span className="font-bold text-[#2D2D2D] font-mono">{totalCurrentHens}</span>
            </div>
            <div className="flex items-center gap-1.5 pr-2 border-r border-[#D1D1C4]">
              <span className="text-[#8A8A6F] font-medium">Ponte j. :</span>
              <span
                className={`font-bold font-mono ${
                  todayLayingRate >= 80
                    ? 'text-emerald-700'
                    : todayLayingRate >= 65
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {todayLayingRate}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#8A8A6F] font-medium">Stock :</span>
              <span className="font-bold text-[#5A5A40] font-mono">
                {totalEggStockTrays} pl.
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <span className="text-emerald-700 font-medium">Ramassage du jour :</span>
            <span className="font-bold font-mono text-emerald-800">{todayEggsProduced} œufs</span>
          </div>
        )}

        {/* Quick Action Button Dropdown */}
        <div className="relative">
          <button
            type="button"
            id="btn-quick-action"
            onClick={() => setIsQuickOpen(!isQuickOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Saisie Rapide</span>
          </button>

          {isQuickOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsQuickOpen(false)}
            />
          )}

          {isQuickOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#D1D1C4] shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8A8A6F] border-b border-[#E5E5DE]">
                Enregistrement direct
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsQuickOpen(false);
                  onQuickAction('production');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D2D2D] hover:bg-[#E2E2D6] hover:text-[#434333] transition-colors text-left"
              >
                <Egg className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ramassage d’œufs</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsQuickOpen(false);
                  onQuickAction('mortality');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D2D2D] hover:bg-[#E2E2D6] hover:text-[#434333] transition-colors text-left"
              >
                <Skull className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Déclaration mortalité</span>
              </button>

              {!isEmployee && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickOpen(false);
                      onQuickAction('sale');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D2D2D] hover:bg-[#E2E2D6] hover:text-[#434333] transition-colors text-left"
                  >
                    <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Nouvelle vente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickOpen(false);
                      onQuickAction('feed_consumption');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D2D2D] hover:bg-[#E2E2D6] hover:text-[#434333] transition-colors text-left"
                  >
                    <Wheat className="w-4 h-4 text-[#5A5A40] shrink-0" />
                    <span>Consommation aliment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickOpen(false);
                      onQuickAction('expense');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#2D2D2D] hover:bg-[#E2E2D6] hover:text-[#434333] transition-colors text-left"
                  >
                    <Receipt className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Dépense / Achat</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Cloud Sync Status Indicator */}
        <button
          type="button"
          onClick={() => syncToFirebaseNow()}
          title={`Synchronisation Firebase Cloud temps réel : ${
            syncStatus === 'synced' ? 'À jour (cliquez pour forcer)' : syncStatus === 'syncing' ? 'Synchronisation en cours...' : 'Hors ligne'
          }`}
          className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
            syncStatus === 'synced'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : syncStatus === 'syncing'
              ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
          ) : syncStatus === 'synced' ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          )}
          <span className="hidden sm:inline text-[11px]">
            {syncStatus === 'synced' ? 'En direct' : syncStatus === 'syncing' ? 'Synchro...' : 'Hors-ligne'}
          </span>
        </button>

        {/* User Account & Logout Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-[#E2E2D6] border border-[#D1D1C4] text-xs text-[#2D2D2D] shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <span className="hidden sm:inline font-semibold">{currentUser.name}</span>
            <span
              className={`hidden sm:inline px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                isEmployee ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E2E2D6] text-[#434333]'
              }`}
            >
              {currentUser.role}
            </span>
          </button>

          {isUserMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsUserMenuOpen(false)}
            />
          )}

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#D1D1C4] shadow-xl p-2 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-2 bg-[#F9F9F6] rounded-xl border border-[#EAEAE0]">
                <div className="text-xs font-bold text-[#2D2D2D]">{currentUser.name}</div>
                <div className="text-[10px] text-[#8A8A6F] font-mono mt-0.5">{currentUser.email}</div>
                <div className="mt-1">
                  <span
                    className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isEmployee ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E2E2D6] text-[#434333]'
                    }`}
                  >
                    Rôle : {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-navbar-logout"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors text-left"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Déconnexion / Verrouiller</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

