import React from 'react';
import {
  LayoutDashboard,
  Bird,
  Egg,
  Package,
  ShoppingCart,
  Wheat,
  UtensilsCrossed,
  Receipt,
  Skull,
  Pill,
  Users,
  Truck,
  Wallet,
  TrendingUp,
  FileText,
  Settings,
  AlertCircle,
  X,
  LogOut,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

export type NavTab =
  | 'dashboard'
  | 'lots'
  | 'production'
  | 'egg_stock'
  | 'sales'
  | 'feed'
  | 'feed_consumption'
  | 'expenses'
  | 'mortality'
  | 'health'
  | 'clients'
  | 'suppliers'
  | 'cashflow'
  | 'profitability'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  section?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { totalEggStockTrays, totalFeedStockBags, alerts, currentUser, logout } = useFarm();

  const isEmployee = currentUser.role === 'Employé' || currentUser.role === 'employee';

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, section: 'Principal' },
    { id: 'lots', label: 'Poules & Lots', icon: Bird, section: 'Élevage' },
    { id: 'production', label: 'Production d’œufs', icon: Egg, section: 'Élevage' },
    {
      id: 'egg_stock',
      label: 'Stock Œufs',
      icon: Package,
      badge: `${totalEggStockTrays} pl.`,
      badgeColor: totalEggStockTrays < 15 ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-700 text-slate-300',
      section: 'Élevage',
    },
    { id: 'sales', label: 'Ventes & Factures', icon: ShoppingCart, section: 'Commercial' },
    { id: 'clients', label: 'Clients', icon: Users, section: 'Commercial' },
    {
      id: 'feed',
      label: 'Stock Aliments',
      icon: Wheat,
      badge: `${totalFeedStockBags} sacs`,
      section: 'Nutrition & Santé',
    },
    { id: 'feed_consumption', label: 'Consommation', icon: UtensilsCrossed, section: 'Nutrition & Santé' },
    { id: 'health', label: 'Santé & Vaccins', icon: Pill, section: 'Nutrition & Santé' },
    { id: 'mortality', label: 'Mortalités', icon: Skull, section: 'Nutrition & Santé' },
    { id: 'expenses', label: 'Dépenses', icon: Receipt, section: 'Finance' },
    { id: 'cashflow', label: 'Caisse & Trésorerie', icon: Wallet, section: 'Finance' },
    { id: 'suppliers', label: 'Fournisseurs', icon: Truck, section: 'Finance' },
    { id: 'profitability', label: 'Rentabilité & KPIs', icon: TrendingUp, section: 'Analyses' },
    { id: 'reports', label: 'Rapports & Exports', icon: FileText, section: 'Analyses' },
    { id: 'settings', label: 'Paramètres & Rôles', icon: Settings, section: 'Système' },
  ];

  const employeeNavItems: NavItem[] = [
    { id: 'production', label: 'Ramassage d’Œufs (Ponte)', icon: Egg, section: 'Espace Saisie Terrain' },
    { id: 'mortality', label: 'Déclaration Mortalité (Pertes)', icon: Skull, section: 'Espace Saisie Terrain' },
  ];

  const navItems = isEmployee ? employeeNavItems : allNavItems;

  // Group items by section
  const sections = isEmployee
    ? ['Espace Saisie Terrain']
    : ['Principal', 'Élevage', 'Commercial', 'Nutrition & Santé', 'Finance', 'Analyses', 'Système'];

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#E2E2D6] border-r border-[#D1D1C4] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#D1D1C4] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white shadow-xs text-lg">
              🐔
            </div>
            <div>
              <span className="font-serif font-bold text-[#434333] text-lg tracking-tight block">
                AviGest <span className="text-xs font-sans font-semibold text-[#8A8A6F]">Pro</span>
              </span>
              <span className="text-[10px] text-[#8A8A6F] font-bold tracking-wider uppercase block">
                {isEmployee ? 'Mode Opérateur' : 'Pondeuses Manager'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#5A5A40] hover:text-[#2D2D2D] hover:bg-[#D9D9C8] lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Employee Role Notice Banner */}
        {isEmployee && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Accès Employé</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Accès réservé exclusivement au ramassage et aux déclarations de mortalité.
            </p>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => {
            const sectionItems = navItems.filter((item) => item.section === section);
            if (sectionItems.length === 0) return null;

            return (
              <div key={section} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8A8A6F]">
                  {section}
                </div>
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-[#5A5A40] text-white font-semibold shadow-md'
                          : 'text-[#5A5A40] hover:bg-[#D9D9C8] hover:text-[#2D2D2D] font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-[#5A5A40]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-[#D1D1C4] text-[#434333]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User profile & Logout footer */}
        <div className="p-3 border-t border-[#D1D1C4] bg-[#E2E2D6]/80 shrink-0 space-y-2">
          <div className="p-2.5 rounded-xl bg-white/70 border border-[#D1D1C4] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#5A5A40] flex items-center justify-center font-bold text-white text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#2D2D2D] truncate">{currentUser.name}</div>
                <div className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-wider">
                  {currentUser.role}
                </div>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Session active" />
          </div>

          <button
            type="button"
            id="btn-sidebar-logout"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 hover:text-rose-700 text-[#5A5A40] text-xs font-bold border border-[#D1D1C4] transition-all shadow-2xs active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Changer d'utilisateur / Quitter</span>
          </button>
        </div>
      </aside>
    </>
  );
};

