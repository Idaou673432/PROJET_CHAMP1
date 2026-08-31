import React, { useState } from 'react';
import {
  Bird,
  Egg,
  Package,
  Wheat,
  DollarSign,
  TrendingUp,
  Skull,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Receipt,
  Plus,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useFarm } from '../context/FarmContext';
import { MetricCard } from '../components/common/MetricCard';
import { formatMoney, formatNumber, formatDate } from '../utils/formatters';
import { NavTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  onQuickAction: (action: 'production' | 'sale' | 'expense' | 'mortality' | 'feed_consumption') => void;
}

const CATEGORY_COLORS = ['#5A5A40', '#8A8A6F', '#D97706', '#E07A5F', '#4D7C0F', '#6B7280', '#A3A375'];

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onQuickAction }) => {
  const {
    lots,
    productions,
    sales,
    expenses,
    feedConsumptions,
    settings,
    totalCurrentHens,
    totalDeadHens,
    todayEggsProduced,
    todayMarketableEggs,
    todayLayingRate,
    monthEggsProduced,
    totalEggStock,
    totalEggStockTrays,
    totalFeedStockKg,
    totalFeedStockBags,
    totalRevenue,
    totalExpenses,
    netProfit,
    globalMortalityRate,
    averageFeedCostPerEgg,
    averageSalePricePerEgg,
    alerts,
  } = useFarm();

  const [chartPeriod, setChartPeriod] = useState<'7' | '14' | '30'>('14');

  // Chart data: Production over time (last N days)
  const productionChartData = React.useMemo(() => {
    const daysLimit = parseInt(chartPeriod, 10);
    // Group productions by date
    const dateMap: Record<string, { date: string; displayDate: string; totalEggs: number; marketableEggs: number; layingRate: number; count: number }> = {};

    productions.forEach((p) => {
      if (!dateMap[p.date]) {
        dateMap[p.date] = {
          date: p.date,
          displayDate: formatDate(p.date),
          totalEggs: 0,
          marketableEggs: 0,
          layingRate: 0,
          count: 0,
        };
      }
      dateMap[p.date].totalEggs += p.eggsTotal;
      dateMap[p.date].marketableEggs += p.eggsMarketable;
      dateMap[p.date].layingRate += p.layingRatePercent;
      dateMap[p.date].count += 1;
    });

    return Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-daysLimit)
      .map((d) => ({
        ...d,
        avgLayingRate: d.count > 0 ? Number((d.layingRate / d.count).toFixed(1)) : 0,
      }));
  }, [productions, chartPeriod]);

  // Chart data: Sales vs Expenses by month/day
  const financialChartData = React.useMemo(() => {
    // Generate past 7 days comparison
    const daysLimit = 7;
    const dates: string[] = [];
    for (let i = daysLimit - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }

    return dates.map((dateStr) => {
      const daySales = sales
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + s.totalAmount, 0);
      const dayExpenses = expenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        date: formatDate(dateStr),
        ventes: daySales,
        depenses: dayExpenses,
        benefice: daySales - dayExpenses,
      };
    });
  }, [sales, expenses]);

  // Expenses by category Pie Chart
  const expenseCategoryData = React.useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner / Farm Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-6 lg:p-8 border border-[#E5E5DE] shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2E2D6] border border-[#D1D1C4] text-[#5A5A40] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exploitation Avicole Pro</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[#434333] tracking-tight">
              {settings.farmName}
            </h2>
            <p className="text-xs sm:text-sm text-[#8A8A6F] max-w-xl">
              Suivi quotidien des performances, de la ponte, des stocks et de la rentabilité de votre cheptel.
            </p>
          </div>

          {/* Quick Actions Group */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onQuickAction('production')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
            >
              <Egg className="w-4 h-4" />
              <span>Ramassage du jour</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('sale')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A8A6F] hover:bg-[#5A5A40] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Enregistrer vente</span>
            </button>
            <button
              type="button"
              onClick={() => onQuickAction('expense')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F5F0] text-[#434333] font-medium text-xs sm:text-sm border border-[#D1D1C4] shadow-2xs transition-all active:scale-95"
            >
              <Receipt className="w-4 h-4 text-rose-600" />
              <span>Dépense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts Banner if any */}
      {alerts.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif font-bold text-sm text-amber-900">
                Alertes & Actions Prioritaires ({alerts.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-800">
              Surveillance proactive du poulailler
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {alerts.map((al) => (
              <div
                key={al.id}
                onClick={() => {
                  if (al.id === 'alert-weekly-debt-reminder') {
                    onNavigate('clients');
                  } else if (al.module.includes('Stock')) {
                    onNavigate('egg_stock');
                  } else if (al.module.includes('Santé')) {
                    onNavigate('health');
                  } else if (al.module.includes('Client')) {
                    onNavigate('clients');
                  } else if (al.module.includes('Ponte')) {
                    onNavigate('production');
                  }
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  al.level === 'danger'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-white border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{al.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-800">
                    {al.module}
                  </span>
                </div>
                <p className="text-[11px] mt-1 text-[#434333] leading-relaxed">
                  {al.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10 Key Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* 1. Total Hens */}
        <MetricCard
          id="kpi-hens"
          title="Poules Actives"
          value={formatNumber(totalCurrentHens)}
          subtitle={`${lots.filter((l) => l.status === 'Actif').length} lot(s) en production`}
          icon={Bird}
          colorScheme="olive"
          onClick={() => onNavigate('lots')}
        />

        {/* 2. Today Production */}
        <MetricCard
          id="kpi-prod-today"
          title="Ponte Aujourd'hui"
          value={`${formatNumber(todayEggsProduced)} œufs`}
          subtitle={`${(todayEggsProduced / settings.eggsPerTray).toFixed(1)} plateaux récoltés`}
          icon={Egg}
          colorScheme="emerald"
          trend={{
            value: `Taux : ${todayLayingRate}%`,
            isPositive: todayLayingRate >= 80,
          }}
          onClick={() => onNavigate('production')}
        />

        {/* 3. Egg Stock */}
        <MetricCard
          id="kpi-egg-stock"
          title="Stock d’Œufs Dispo"
          value={`${formatNumber(totalEggStockTrays)} pl.`}
          subtitle={`${formatNumber(totalEggStock)} œufs en alvéoles`}
          icon={Package}
          colorScheme="blue"
          badge={totalEggStockTrays < 20 ? 'Stock Bas' : undefined}
          onClick={() => onNavigate('egg_stock')}
        />

        {/* 4. Feed Stock */}
        <MetricCard
          id="kpi-feed-stock"
          title="Stock Aliments"
          value={`${formatNumber(totalFeedStockBags, 1)} sacs`}
          subtitle={`${formatNumber(totalFeedStockKg)} kg disponibles`}
          icon={Wheat}
          colorScheme="amber"
          onClick={() => onNavigate('feed')}
        />

        {/* 5. Revenue */}
        <MetricCard
          id="kpi-revenue"
          title="Chiffre d’Affaires"
          value={formatMoney(totalRevenue, settings.currency)}
          subtitle={`${sales.length} ventes enregistrées`}
          icon={DollarSign}
          colorScheme="emerald"
          onClick={() => onNavigate('sales')}
        />

        {/* 6. Total Expenses */}
        <MetricCard
          id="kpi-expenses"
          title="Total Dépenses"
          value={formatMoney(totalExpenses, settings.currency)}
          subtitle={`${expenses.length} dépenses & charges`}
          icon={Receipt}
          colorScheme="rose"
          onClick={() => onNavigate('expenses')}
        />

        {/* 7. Estimated Profit */}
        <MetricCard
          id="kpi-profit"
          title="Bénéfice Net"
          value={formatMoney(netProfit, settings.currency)}
          subtitle={`Marge : ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          colorScheme={netProfit >= 0 ? 'emerald' : 'rose'}
          trend={{
            value: netProfit >= 0 ? 'Rentable' : 'Déficit',
            isPositive: netProfit >= 0,
          }}
          onClick={() => onNavigate('profitability')}
        />

        {/* 8. Laying Rate */}
        <MetricCard
          id="kpi-laying-rate"
          title="Taux de Ponte (Jour)"
          value={`${todayLayingRate}%`}
          subtitle={`Moyenne : ${(todayEggsProduced / Math.max(1, totalCurrentHens)).toFixed(2)} œuf/poule`}
          icon={Activity}
          colorScheme="amber"
          onClick={() => onNavigate('production')}
        />

        {/* 9. Mortality */}
        <MetricCard
          id="kpi-mortality"
          title="Mortalités Cumulées"
          value={`${totalDeadHens} poules`}
          subtitle={`Taux global : ${globalMortalityRate}%`}
          icon={Skull}
          colorScheme={globalMortalityRate > 3 ? 'rose' : 'slate'}
          onClick={() => onNavigate('mortality')}
        />

        {/* 10. Month Production */}
        <MetricCard
          id="kpi-month-prod"
          title="Production du Mois"
          value={`${formatNumber(monthEggsProduced)} œufs`}
          subtitle={`${(monthEggsProduced / settings.eggsPerTray).toFixed(0)} plateaux totaux`}
          icon={Calendar}
          colorScheme="indigo"
          onClick={() => onNavigate('reports')}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-serif font-bold text-[#434333] flex items-center gap-2">
                <Egg className="w-5 h-5 text-[#5A5A40]" />
                <span>Courbe de Ponte Journalière & Taux (%)</span>
              </h3>
              <p className="text-xs text-[#8A8A6F]">
                Évolution du nombre d’œufs ramassés et du taux de ponte
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl border border-[#D1D1C4]">
              <button
                type="button"
                onClick={() => setChartPeriod('7')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  chartPeriod === '7' ? 'bg-[#5A5A40] text-white font-medium shadow-xs' : 'text-[#8A8A6F] hover:text-[#2D2D2D]'
                }`}
              >
                7j
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('14')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  chartPeriod === '14' ? 'bg-[#5A5A40] text-white font-medium shadow-xs' : 'text-[#8A8A6F] hover:text-[#2D2D2D]'
                }`}
              >
                14j
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('30')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  chartPeriod === '30' ? 'bg-[#5A5A40] text-white font-medium shadow-xs' : 'text-[#8A8A6F] hover:text-[#2D2D2D]'
                }`}
              >
                30j
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="eggColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#8A8A6F" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8A8A6F" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5DE',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    color: '#2D2D2D',
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'totalEggs') return [`${value} œufs`, 'Total Récolté'];
                    if (name === 'marketableEggs') return [`${value} œufs`, 'Commercialisables'];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalEggs"
                  name="totalEggs"
                  stroke="#5A5A40"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#eggColor)"
                />
                <Line
                  type="monotone"
                  dataKey="marketableEggs"
                  name="marketableEggs"
                  stroke="#8A8A6F"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financials & Expenses Pie Chart (1 column) */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-[#434333] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-600" />
              <span>Répartition des Dépenses</span>
            </h3>
            <p className="text-xs text-[#8A8A6F]">Par catégorie de charge</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseCategoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5DE',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    color: '#2D2D2D',
                  }}
                  formatter={(val: any) => [formatMoney(val, settings.currency), 'Montant']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5DE] text-xs">
            {expenseCategoryData.slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                />
                <span className="truncate text-[#2D2D2D]">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Ventes vs Dépenses 7j Bar Chart + Lots Overview Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Expenses 7d Bar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#434333] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <span>Ventes vs Dépenses (7 derniers jours)</span>
            </h3>
            <p className="text-xs text-[#8A8A6F]">Flux financiers journaliers</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                <XAxis dataKey="date" stroke="#8A8A6F" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8A8A6F" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E5DE',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    color: '#2D2D2D',
                  }}
                  formatter={(val: any, name: string) => [
                    formatMoney(val, settings.currency),
                    name === 'ventes' ? 'Recettes Ventes' : 'Dépenses',
                  ]}
                />
                <Bar dataKey="ventes" fill="#5A5A40" radius={[4, 4, 0, 0]} name="ventes" />
                <Bar dataKey="depenses" fill="#E07A5F" radius={[4, 4, 0, 0]} name="depenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Lots Summary Table (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-[#434333] flex items-center gap-2">
                <Bird className="w-5 h-5 text-[#5A5A40]" />
                <span>Performance des Lots en Production</span>
              </h3>
              <p className="text-xs text-[#8A8A6F]">État du cheptel et statistiques de ponte</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('lots')}
              className="text-xs font-bold text-[#5A5A40] hover:text-[#434333] flex items-center gap-1"
            >
              <span>Voir tous les lots</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5E5DE]">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#F5F5F0] border-b border-[#E5E5DE]">
                <tr>
                  <th className="p-3">Lot / Race</th>
                  <th className="p-3">Âge</th>
                  <th className="p-3">Effectif Actuel</th>
                  <th className="p-3">Mortalités</th>
                  <th className="p-3">Taux Ponte Est.</th>
                  <th className="p-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {lots.map((lot) => {
                  const mortalityRate = ((lot.deadCount / lot.initialCount) * 100).toFixed(1);

                  return (
                    <tr
                      key={lot.id}
                      onClick={() => onNavigate('lots')}
                      className="hover:bg-[#F9F9F6] cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-semibold text-[#2D2D2D]">
                        <div>{lot.name}</div>
                        <span className="text-[10px] text-[#8A8A6F]">{lot.breed} ({lot.code})</span>
                      </td>
                      <td className="p-3 text-[#2D2D2D] font-mono">
                        {lot.currentAgeWeeks} sem.
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-[#2D2D2D] font-mono">{lot.currentCount}</span>
                        <span className="text-[10px] text-[#8A8A6F] ml-1">/ {lot.initialCount}</span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${lot.deadCount > 20 ? 'text-rose-600' : 'text-[#2D2D2D]'}`}>
                          {lot.deadCount} ({mortalityRate}%)
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {lot.id === 'lot-1' ? '91.8%' : '80.2%'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lot.status === 'Actif'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-[#F5F5F0] text-[#5A5A40] border border-[#D1D1C4]'
                          }`}
                        >
                          {lot.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Key Quick Performance summary banner */}
          <div className="p-4 rounded-2xl bg-[#5A5A40] text-white shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <span className="text-white/70">Coût alimentaire moyen / œuf :</span>
              <div className="font-bold text-white font-mono text-sm">
                {averageFeedCostPerEgg} {settings.currency}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-white/70">Prix de vente moyen / œuf :</span>
              <div className="font-bold text-white font-mono text-sm">
                {averageSalePricePerEgg} {settings.currency}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-white/70">Marge brute estimée / œuf :</span>
              <div className="font-bold text-white font-mono text-sm">
                {Number((averageSalePricePerEgg - averageFeedCostPerEgg).toFixed(1))} {settings.currency}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
