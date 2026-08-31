import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  DollarSign,
  Package,
  Bird,
  ShieldCheck,
  CheckCircle2,
  Table,
  Upload,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { formatMoney, formatNumber, formatDate, getTodayDateString } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const {
    lots,
    productions,
    sales,
    expenses,
    feedConsumptions,
    vaccines,
    clients,
    totalProfit,
    profitMarginPercent,
    settings,
    exportAllDataJSON,
    importAllDataJSON,
    resetAllDataToSample,
  } = useFarm();

  const [period, setPeriod] = useState<'7D' | '30D' | 'MONTH' | 'ALL'>('ALL');
  const [activeReportTab, setActiveReportTab] = useState<'GLOBAL' | 'PRODUCTION' | 'SALES' | 'EXPENSES'>('GLOBAL');

  const eggsPerTray = settings.eggsPerTray || 30;

  // Filtered dataset according to period
  const filterByDate = (dateStr: string) => {
    if (period === 'ALL') return true;
    const itemDate = new Date(dateStr);
    const now = new Date();
    if (period === '7D') {
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (period === '30D') {
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    if (period === 'MONTH') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const periodProductions = productions.filter((p) => filterByDate(p.date));
  const periodSales = sales.filter((s) => filterByDate(s.date));
  const periodExpenses = expenses.filter((e) => filterByDate(e.date));

  const totalHarvested = periodProductions.reduce((sum, p) => sum + p.eggsTotal, 0);
  const totalMarketable = periodProductions.reduce((sum, p) => sum + p.eggsMarketable, 0);
  const totalTrays = Number((totalMarketable / eggsPerTray).toFixed(1));
  const totalRevenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  const periodProfit = totalRevenue - totalExpenses;

  // CSV Exporters
  const downloadCSV = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSalesCSV = () => {
    let csv = 'Numero,Date,Client,Telephone,Produit,Quantite,Unite,Prix_Unitaire,Total,Paye,Reste,Statut,Mode\n';
    periodSales.forEach((s) => {
      csv += `"${s.saleNumber}","${s.date}","${s.clientName}","${s.clientPhone || ''}","${s.productType}",${s.quantity},"${s.unit}",${s.unitPrice},${s.totalAmount},${s.amountPaid},${s.remainingDue},"${s.paymentStatus}","${s.paymentMethod}"\n`;
    });
    downloadCSV(csv, `ventes_avicmanager_${getTodayDateString()}.csv`);
  };

  const handleExportProductionCSV = () => {
    let csv = 'Date,Lot,Total_Oeufs,Oeufs_Casses,Oeufs_Sales,Commercialisables,Plateaux,Taux_Ponte_Pct,Operateur\n';
    periodProductions.forEach((p) => {
      csv += `"${p.date}","${p.lotName || ''}",${p.eggsTotal},${p.eggsBroken},${p.eggsDirty},${p.eggsMarketable},${p.traysCount},${p.layingRatePercent},"${p.recordedBy}"\n`;
    });
    downloadCSV(csv, `production_oeufs_avicmanager_${getTodayDateString()}.csv`);
  };

  const handleExportExpensesCSV = () => {
    let csv = 'Date,Categorie,Beneficiaire,Montant,Mode_Paiement,Notes,Operateur\n';
    periodExpenses.forEach((e) => {
      csv += `"${e.date}","${e.category}","${e.beneficiary || ''}",${e.amount},"${e.paymentMethod}","${e.notes || ''}","${e.recordedBy}"\n`;
    });
    downloadCSV(csv, `depenses_avicmanager_${getTodayDateString()}.csv`);
  };

  const handleJSONBackup = () => {
    const dataStr = exportAllDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `avicmanager_backup_${getTodayDateString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJSONRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        const text = event.target?.result as string;
        const res = importAllDataJSON(text);
        if (res.success) {
          alert('Données restaurées avec succès !');
        } else {
          alert(`Erreur de restauration : ${res.error}`);
        }
      };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Rapports d'Activité & Bilans d'Exploitation
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Génération des états périodiques, rapports comptables, exports Excel/CSV et sauvegardes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-white border border-[#E5E5DE] rounded-2xl p-1 text-xs font-medium text-[#434333] shadow-xs">
            <button
              type="button"
              onClick={() => setPeriod('7D')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === '7D' ? 'bg-[#5A5A40] text-white font-semibold' : 'hover:text-[#2D2D2D]'
              }`}
            >
              7 jours
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30D')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === '30D' ? 'bg-[#5A5A40] text-white font-semibold' : 'hover:text-[#2D2D2D]'
              }`}
            >
              30 jours
            </button>
            <button
              type="button"
              onClick={() => setPeriod('MONTH')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === 'MONTH' ? 'bg-[#5A5A40] text-white font-semibold' : 'hover:text-[#2D2D2D]'
              }`}
            >
              Ce Mois
            </button>
            <button
              type="button"
              onClick={() => setPeriod('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                period === 'ALL' ? 'bg-[#5A5A40] text-white font-semibold' : 'hover:text-[#2D2D2D]'
              }`}
            >
              Tout
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs shadow-xs active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Bilan (PDF)</span>
          </button>
        </div>
      </div>

      {/* CSV Export & Backup Action Ribbon */}
      <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
        <div className="flex items-center gap-2 text-[#434333] font-semibold">
          <Download className="w-4 h-4 text-[#5A5A40]" />
          <span>Exports Tableurs (Excel / CSV) :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportProductionCSV}
            className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#2D2D2D] border border-[#D1D1C4] font-semibold"
          >
            CSV Production
          </button>
          <button
            type="button"
            onClick={handleExportSalesCSV}
            className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#2D2D2D] border border-[#D1D1C4] font-semibold"
          >
            CSV Ventes & Factures
          </button>
          <button
            type="button"
            onClick={handleExportExpensesCSV}
            className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#2D2D2D] border border-[#D1D1C4] font-semibold"
          >
            CSV Dépenses
          </button>
          <button
            type="button"
            onClick={handleJSONBackup}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold"
          >
            Sauvegarder base (.JSON)
          </button>
          <label className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4] font-semibold cursor-pointer">
            Restaurer (.JSON)
            <input type="file" accept=".json" onChange={handleJSONRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs print:bg-white print:text-slate-900 print:border-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#E5E5DE] pb-6 print:border-slate-300 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center font-bold text-white font-serif text-lg">
                AM
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-[#2D2D2D] print:text-slate-950">
                  {settings.farmName}
                </h1>
                <p className="text-xs text-[#8A8A6F] print:text-slate-600">
                  {settings.location} | Tél : {settings.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4] uppercase print:bg-slate-100 print:text-slate-900">
              RAPPORT DE GESTION & BILAN
            </span>
            <p className="text-xs text-[#8A8A6F] mt-2 print:text-slate-600">
              Période : <strong>{period === 'ALL' ? 'Toute la période' : period}</strong>
            </p>
            <p className="text-[11px] text-[#8A8A6F]">Édité le {formatDate(getTodayDateString())}</p>
          </div>
        </div>

        {/* Executive Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#D1D1C4] print:bg-slate-50 print:border-slate-200">
            <span className="text-[#8A8A6F] print:text-slate-600 block text-[10px] uppercase font-bold">
              Œufs Commercialisables
            </span>
            <div className="text-xl font-serif font-bold text-[#2D2D2D] print:text-slate-950 font-mono mt-1">
              {formatNumber(totalMarketable)}
            </div>
            <span className="text-[10px] text-[#5A5A40] print:text-slate-700 block font-medium">
              {totalTrays} plateaux de {eggsPerTray}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#D1D1C4] print:bg-slate-50 print:border-slate-200">
            <span className="text-[#8A8A6F] print:text-slate-600 block text-[10px] uppercase font-bold">
              Chiffre d’Affaires
            </span>
            <div className="text-xl font-serif font-bold text-emerald-800 print:text-emerald-700 font-mono mt-1">
              {formatMoney(totalRevenue, settings.currency)}
            </div>
            <span className="text-[10px] text-[#8A8A6F] print:text-slate-600 block">
              {periodSales.length} ventes conclues
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#D1D1C4] print:bg-slate-50 print:border-slate-200">
            <span className="text-[#8A8A6F] print:text-slate-600 block text-[10px] uppercase font-bold">
              Total Dépenses & Achats
            </span>
            <div className="text-xl font-serif font-bold text-rose-800 print:text-rose-700 font-mono mt-1">
              {formatMoney(totalExpenses, settings.currency)}
            </div>
            <span className="text-[10px] text-[#8A8A6F] print:text-slate-600 block">
              {periodExpenses.length} pièces justificatives
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#D1D1C4] print:bg-slate-50 print:border-slate-200">
            <span className="text-[#8A8A6F] print:text-slate-600 block text-[10px] uppercase font-bold">
              Bénéfice Net Période
            </span>
            <div
              className={`text-xl font-serif font-bold font-mono mt-1 ${
                periodProfit >= 0
                  ? 'text-emerald-800 print:text-emerald-700'
                  : 'text-rose-800 print:text-rose-700'
              }`}
            >
              {formatMoney(periodProfit, settings.currency)}
            </div>
            <span className="text-[10px] text-[#8A8A6F] print:text-slate-600 block">
              Marge : {totalRevenue > 0 ? ((periodProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Section 1: Detailed Production Ledger in period */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#434333] uppercase tracking-wider print:text-slate-950 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#5A5A40]" />
            <span>1. Relevé de Production d'Œufs ({periodProductions.length} jours enregistrés)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E5E5DE] print:border-slate-300">
              <thead className="bg-[#F5F5F0] text-[#434333] print:bg-slate-100 print:text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Lot</th>
                  <th className="p-2.5 text-right">Récolté</th>
                  <th className="p-2.5 text-right">Cassés</th>
                  <th className="p-2.5 text-right">Commercialisables</th>
                  <th className="p-2.5 text-right">Plateaux</th>
                  <th className="p-2.5 text-right">Taux Ponte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE] print:divide-slate-200">
                {periodProductions.slice(0, 15).map((p) => (
                  <tr key={p.id}>
                    <td className="p-2.5 font-mono text-[#2D2D2D] print:text-slate-900">{formatDate(p.date)}</td>
                    <td className="p-2.5 text-[#434333] print:text-slate-700">{p.lotName}</td>
                    <td className="p-2.5 text-right font-mono text-[#2D2D2D] print:text-slate-900">{p.eggsTotal}</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 print:text-rose-700">{p.eggsBroken}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-800 print:text-emerald-700">
                      {p.eggsMarketable}
                    </td>
                    <td className="p-2.5 text-right font-mono text-[#2D2D2D] print:text-slate-900">{p.traysCount}</td>
                    <td className="p-2.5 text-right font-mono text-[#5A5A40] font-bold print:text-slate-800">
                      {p.layingRatePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Sales and Invoicing Summary */}
        <div className="space-y-3 pt-4 border-t border-[#E5E5DE] print:border-slate-300">
          <h3 className="text-xs font-bold text-[#434333] uppercase tracking-wider print:text-slate-950 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span>2. Relevé des Ventes & Créances ({periodSales.length} factures)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#E5E5DE] print:border-slate-300">
              <thead className="bg-[#F5F5F0] text-[#434333] print:bg-slate-100 print:text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">Facture</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Client</th>
                  <th className="p-2.5">Produit</th>
                  <th className="p-2.5 text-right">Qté</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-right">Payé</th>
                  <th className="p-2.5 text-right">Reste</th>
                  <th className="p-2.5">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE] print:divide-slate-200">
                {periodSales.slice(0, 15).map((s) => (
                  <tr key={s.id}>
                    <td className="p-2.5 font-mono text-[#5A5A40] print:text-slate-900 font-bold">{s.saleNumber}</td>
                    <td className="p-2.5 font-mono text-[#8A8A6F] print:text-slate-600">{formatDate(s.date)}</td>
                    <td className="p-2.5 font-semibold text-[#2D2D2D] print:text-slate-900">{s.clientName}</td>
                    <td className="p-2.5 text-[#434333] print:text-slate-700">{s.productType}</td>
                    <td className="p-2.5 text-right font-mono">{s.quantity} {s.unit}(s)</td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#2D2D2D] print:text-slate-900">
                      {formatMoney(s.totalAmount, settings.currency)}
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 print:text-emerald-700">
                      {formatMoney(s.amountPaid, settings.currency)}
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-800 print:text-rose-700 font-bold">
                      {formatMoney(s.remainingDue, settings.currency)}
                    </td>
                    <td className="p-2.5 text-[11px] font-semibold text-[#434333] print:text-slate-700">{s.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Box for Print */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#E5E5DE] print:border-slate-300 text-xs">
          <div className="space-y-12">
            <span className="font-bold text-[#8A8A6F] print:text-slate-600 uppercase text-[10px]">
              Le Responsable d’Élevage :
            </span>
            <div className="border-b border-dashed border-[#D1D1C4] print:border-slate-400 w-48" />
          </div>
          <div className="space-y-12 text-right">
            <span className="font-bold text-[#8A8A6F] print:text-slate-600 uppercase text-[10px]">
              Le Gérant / Propriétaire :
            </span>
            <div className="border-b border-dashed border-[#D1D1C4] print:border-slate-400 w-48 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
