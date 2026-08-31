import React, { useState, useEffect } from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardView } from './views/DashboardView';
import { LotsView } from './views/LotsView';
import { ProductionView } from './views/ProductionView';
import { EggStockView } from './views/EggStockView';
import { SalesView } from './views/SalesView';
import { FeedView } from './views/FeedView';
import { FeedConsumptionView } from './views/FeedConsumptionView';
import { ExpensesView } from './views/ExpensesView';
import { MortalityView } from './views/MortalityView';
import { HealthView } from './views/HealthView';
import { ClientsView } from './views/ClientsView';
import { SuppliersView } from './views/SuppliersView';
import { CashflowView } from './views/CashflowView';
import { ProfitabilityView } from './views/ProfitabilityView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';
import { AlertTriangle, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { alerts, isAuthenticated, currentUser } = useFarm();
  const isEmployee = currentUser.role === 'Employé' || currentUser.role === 'employee';

  const [currentTab, setCurrentTab] = useState<NavTab>(() => (isEmployee ? 'production' : 'dashboard'));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Automatically switch tab if role is Employee and tab is not allowed
  useEffect(() => {
    if (isEmployee && currentTab !== 'production' && currentTab !== 'mortality') {
      setCurrentTab('production');
    }
  }, [isEmployee, currentTab]);

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleQuickAction = (
    action: 'production' | 'sale' | 'expense' | 'mortality' | 'feed_consumption'
  ) => {
    if (isEmployee) {
      if (action === 'production') setCurrentTab('production');
      else if (action === 'mortality') setCurrentTab('mortality');
      return;
    }

    switch (action) {
      case 'production':
        setCurrentTab('production');
        break;
      case 'sale':
        setCurrentTab('sales');
        break;
      case 'expense':
        setCurrentTab('expenses');
        break;
      case 'mortality':
        setCurrentTab('mortality');
        break;
      case 'feed_consumption':
        setCurrentTab('feed_consumption');
        break;
    }
  };

  const visibleAlerts = isEmployee ? [] : (alerts || []).filter((a) => !dismissedAlerts.includes(a.id));

  const renderView = () => {
    // Hard restrict views for employees
    if (isEmployee) {
      if (currentTab === 'mortality') {
        return <MortalityView />;
      }
      return <ProductionView />;
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab as NavTab)} onQuickAction={handleQuickAction} />;
      case 'lots':
        return <LotsView />;
      case 'production':
        return <ProductionView />;
      case 'egg_stock':
        return <EggStockView />;
      case 'sales':
        return <SalesView />;
      case 'feed':
        return <FeedView />;
      case 'feed_consumption':
        return <FeedConsumptionView />;
      case 'expenses':
        return <ExpensesView />;
      case 'mortality':
        return <MortalityView />;
      case 'health':
        return <HealthView />;
      case 'clients':
        return <ClientsView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'cashflow':
        return <CashflowView />;
      case 'profitability':
        return <ProfitabilityView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab as NavTab)} onQuickAction={handleQuickAction} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#2D2D2D] flex font-sans antialiased selection:bg-[#5A5A40] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <OfflineStatusBanner />
        <Navbar
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onQuickAction={handleQuickAction}
        />

        {/* Global Warning & Prophylactic Alerts Banner */}
        {visibleAlerts.length > 0 && (
          <div className="px-4 sm:px-6 pt-4 space-y-2 no-print">
            {visibleAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                  alert.level === 'CRITICAL'
                    ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm'
                    : 'bg-orange-50 border-orange-200 text-orange-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      alert.level === 'CRITICAL' ? 'bg-rose-600 animate-pulse' : 'bg-orange-500 animate-pulse'
                    }`}
                  />
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${
                      alert.level === 'CRITICAL' ? 'text-rose-600' : 'text-orange-600'
                    }`}
                  />
                  <div className="truncate">
                    <span className="font-bold">{alert.title} : </span>
                    <span className="opacity-90">{alert.message}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.actionTab && (
                    <button
                      type="button"
                      onClick={() => setCurrentTab(alert.actionTab as NavTab)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F5F5F0] text-[11px] font-bold text-[#434333] border border-[#D1D1C4] shadow-xs"
                    >
                      Résoudre
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                    className="p-1 rounded-lg hover:bg-[#E2E2D6] text-[#8A8A6F] hover:text-[#2D2D2D]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FarmProvider>
      <MainLayout />
    </FarmProvider>
  );
}
