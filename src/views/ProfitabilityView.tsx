import React from 'react';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { formatMoney, formatNumber } from '../utils/formatters';

export const ProfitabilityView: React.FC = () => {
  const {
    lots,
    productions,
    sales,
    expenses,
    feedConsumptions,
    totalProfit,
    profitMarginPercent,
    settings,
  } = useFarm();

  const eggsPerTray = settings.eggsPerTray || 30;

  // Total Revenues
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const eggSalesRevenue = sales
    .filter((s) => s.productType === 'Plateaux' || s.productType === 'Œufs (Unité)')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const reformedSalesRevenue = sales
    .filter((s) => s.productType === 'Poules réformées')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const droppingsSalesRevenue = sales
    .filter((s) => s.productType === 'Fientes / Engrais')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  // Total Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const feedCostTotal = expenses
    .filter((e) => e.category === 'Aliments')
    .reduce((sum, e) => sum + e.amount, 0);
  const vetCostTotal = expenses
    .filter((e) => e.category === 'Soins vétérinaires & Vaccins')
    .reduce((sum, e) => sum + e.amount, 0);
  const laborCostTotal = expenses
    .filter((e) => e.category === 'Salaires & Main d’œuvre')
    .reduce((sum, e) => sum + e.amount, 0);
  const otherCostTotal = totalExpenses - feedCostTotal - vetCostTotal - laborCostTotal;

  // Cumulative production
  const totalEggsProduced = productions.reduce((sum, p) => sum + p.eggsMarketable, 0);
  const totalTraysProduced = Number((totalEggsProduced / eggsPerTray).toFixed(1));
  const totalHensInitial = lots.reduce((sum, l) => sum + l.initialCount, 0);
  const totalHensCurrent = lots.reduce((sum, l) => sum + l.currentCount, 0);

  // Profitability Calculations
  const grossMargin = totalRevenue - feedCostTotal; // Marge brute sur coût alimentaire
  const grossMarginPct = totalRevenue > 0 ? ((grossMargin / totalRevenue) * 100).toFixed(1) : '0';

  // Cost of production
  const costPerEgg = totalEggsProduced > 0 ? Number((totalExpenses / totalEggsProduced).toFixed(2)) : 0;
  const costPerTray = Number((costPerEgg * eggsPerTray).toFixed(0));
  const avgSalePricePerTray = settings.defaultTrayPrice || 2200;
  const netMarginPerTray = avgSalePricePerTray - costPerTray;
  const costPerHen = totalHensCurrent > 0 ? Number((totalExpenses / totalHensCurrent).toFixed(0)) : 0;
  const revenuePerHen = totalHensCurrent > 0 ? Number((totalRevenue / totalHensCurrent).toFixed(0)) : 0;
  const profitPerHen = revenuePerHen - costPerHen;

  // Feed Conversion
  const totalFeedKgConsumed = feedConsumptions.reduce((sum, c) => sum + c.quantityKg, 0);
  const feedKgPerTray =
    totalTraysProduced > 0 ? (totalFeedKgConsumed / totalTraysProduced).toFixed(2) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
          Rentabilité & Performance Économique
        </h2>
        <p className="text-xs sm:text-sm text-[#8A8A6F]">
          Analyse fine des marges, coût de revient au plateau d'œufs et rentabilité par poule
        </p>
      </div>

      {/* Main Big Profit Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${
          totalProfit >= 0
            ? 'bg-emerald-50/80 border-emerald-200/80'
            : 'bg-rose-50/80 border-rose-200/80'
        } space-y-4 shadow-xs`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5A5A40]" />
              <span>Bénéfice Net Réel d'Exploitation</span>
            </span>
            <div className="text-3xl sm:text-5xl font-serif font-bold text-[#434333] tracking-tight font-mono">
              {formatMoney(totalProfit, settings.currency)}
            </div>
            <p className="text-xs text-[#8A8A6F]">
              Résultat net calculé après déduction de toutes les dépenses opérationnelles
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 p-3.5 rounded-2xl bg-white border border-[#E5E5DE] shadow-xs">
            <span className="text-xs text-[#8A8A6F]">Taux de Marge Nette :</span>
            <span
              className={`text-2xl sm:text-3xl font-serif font-bold font-mono ${
                profitMarginPercent >= 20
                  ? 'text-emerald-800'
                  : profitMarginPercent >= 0
                  ? 'text-[#5A5A40]'
                  : 'text-rose-800'
              }`}
            >
              {profitMarginPercent}%
            </span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D1D1C4]/60 text-xs">
          <div className="p-3 rounded-xl bg-white border border-[#E5E5DE]">
            <span className="text-[#8A8A6F] block text-[10px]">Chiffre d’Affaires Total</span>
            <span className="text-lg font-bold text-emerald-800 font-mono">
              +{formatMoney(totalRevenue, settings.currency)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E5DE]">
            <span className="text-[#8A8A6F] block text-[10px]">Charges Totales Engagées</span>
            <span className="text-lg font-bold text-rose-800 font-mono">
              -{formatMoney(totalExpenses, settings.currency)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-[#E5E5DE]">
            <span className="text-[#8A8A6F] block text-[10px]">Marge Brute sur Aliment</span>
            <span className="text-lg font-bold text-[#434333] font-mono">
              {formatMoney(grossMargin, settings.currency)} ({grossMarginPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Unit Economics: Per Egg, Per Tray, Per Hen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost per Tray */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider block">
            Coût de Revient / Plateau (30 œufs)
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#434333] font-mono">
            {costPerTray} <span className="text-xs text-[#8A8A6F]">{settings.currency}</span>
          </div>
          <div className="text-xs text-[#434333] flex items-center justify-between pt-2 border-t border-[#E5E5DE]">
            <span>Prix vente moyen : {avgSalePricePerTray}</span>
            <span className="text-emerald-800 font-bold font-mono">+{netMarginPerTray} / pl.</span>
          </div>
        </div>

        {/* Cost per Egg */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#8A8A6F] uppercase tracking-wider block">
            Coût de Revient / Œuf
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#434333] font-mono">
            {costPerEgg} <span className="text-xs text-[#8A8A6F]">{settings.currency}</span>
          </div>
          <span className="text-xs text-[#8A8A6F] block pt-2 border-t border-[#E5E5DE]">
            Sur {formatNumber(totalEggsProduced)} œufs commercialisés
          </span>
        </div>

        {/* Profit per Hen */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Gain Net / Poule Vivante
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800 font-mono">
            {formatMoney(profitPerHen, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block pt-2 border-t border-[#E5E5DE]">
            Revenu : {revenuePerHen} | Coût : {costPerHen}
          </span>
        </div>

        {/* Feed to Tray Ratio */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider block">
            Indice Alimentaire
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#434333] font-mono">
            {feedKgPerTray} <span className="text-xs text-[#8A8A6F]">kg / plateau</span>
          </div>
          <span className="text-xs text-[#8A8A6F] block pt-2 border-t border-[#E5E5DE]">
            Efficacité de conversion du grain
          </span>
        </div>
      </div>

      {/* Revenue Structure & Expense Structure side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Structure */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#434333] font-serif flex items-center justify-between">
            <span>Structure du Chiffre d'Affaires</span>
            <span className="text-xs text-emerald-800 font-mono font-bold">
              {formatMoney(totalRevenue, settings.currency)}
            </span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
              <div className="flex justify-between font-semibold text-[#2D2D2D]">
                <span>1. Vente des Œufs (Plateaux & Détail)</span>
                <span className="font-mono text-emerald-800">{formatMoney(eggSalesRevenue, settings.currency)}</span>
              </div>
              <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#5A5A40] h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (eggSalesRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A6F]">
                {totalRevenue > 0 ? ((eggSalesRevenue / totalRevenue) * 100).toFixed(1) : 0}% du revenu global
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
              <div className="flex justify-between font-semibold text-[#2D2D2D]">
                <span>2. Vente des Poules de Réforme</span>
                <span className="font-mono text-emerald-800">{formatMoney(reformedSalesRevenue, settings.currency)}</span>
              </div>
              <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#8A8A6F] h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (reformedSalesRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A6F]">
                {totalRevenue > 0 ? ((reformedSalesRevenue / totalRevenue) * 100).toFixed(1) : 0}% du revenu global
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
              <div className="flex justify-between font-semibold text-[#2D2D2D]">
                <span>3. Vente de Fientes & Engrais</span>
                <span className="font-mono text-emerald-800">{formatMoney(droppingsSalesRevenue, settings.currency)}</span>
              </div>
              <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-700 h-full rounded-full"
                  style={{ width: `${totalRevenue > 0 ? (droppingsSalesRevenue / totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A6F]">
                {totalRevenue > 0 ? ((droppingsSalesRevenue / totalRevenue) * 100).toFixed(1) : 0}% du revenu global
              </div>
            </div>
          </div>
        </div>

        {/* Expense Structure */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#434333] font-serif flex items-center justify-between">
            <span>Décomposition des Coûts</span>
            <span className="text-xs text-rose-800 font-mono font-bold">
              {formatMoney(totalExpenses, settings.currency)}
            </span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
              <div className="flex justify-between font-semibold text-[#2D2D2D]">
                <span>1. Alimentation & Matières Premières</span>
                <span className="font-mono text-rose-800">{formatMoney(feedCostTotal, settings.currency)}</span>
              </div>
              <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-700 h-full rounded-full"
                  style={{ width: `${totalExpenses > 0 ? (feedCostTotal / totalExpenses) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A6F]">
                {totalExpenses > 0 ? ((feedCostTotal / totalExpenses) * 100).toFixed(1) : 0}% des dépenses
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
              <div className="flex justify-between font-semibold text-[#2D2D2D]">
                <span>2. Soins Sanitaires, Vaccins & Vétérinaire</span>
                <span className="font-mono text-rose-800">{formatMoney(vetCostTotal, settings.currency)}</span>
              </div>
              <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#5A5A40] h-full rounded-full"
                  style={{ width: `${totalExpenses > 0 ? (vetCostTotal / totalExpenses) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A6F]">
                {totalExpenses > 0 ? ((vetCostTotal / totalExpenses) * 100).toFixed(1) : 0}% des dépenses
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
              <div className="flex justify-between font-semibold text-[#2D2D2D]">
                <span>3. Salaires & Autres Charges d'Exploitation</span>
                <span className="font-mono text-rose-800">{formatMoney(laborCostTotal + otherCostTotal, settings.currency)}</span>
              </div>
              <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#8A8A6F] h-full rounded-full"
                  style={{ width: `${totalExpenses > 0 ? ((laborCostTotal + otherCostTotal) / totalExpenses) * 100 : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A6F]">
                {totalExpenses > 0 ? (((laborCostTotal + otherCostTotal) / totalExpenses) * 100).toFixed(1) : 0}% des dépenses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
