import React, { useState } from 'react';
import {
  Package,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/common/Modal';
import { formatDate, formatNumber } from '../utils/formatters';

export const EggStockView: React.FC = () => {
  const { totalEggStock, totalEggStockTrays, eggStockMovements, settings, adjustEggStock } = useFarm();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'ADD' | 'REMOVE'>('REMOVE');
  const [adjustQty, setAdjustQty] = useState<number>(30);
  const [adjustUnit, setAdjustUnit] = useState<'trays' | 'eggs'>('trays');
  const [adjustReason, setAdjustReason] = useState('Régularisation inventaire physique en chambre froide');

  const eggsPerTray = settings.eggsPerTray || 30;

  const totalEntries = eggStockMovements
    .filter((m) => m.quantityEggs > 0)
    .reduce((sum, m) => sum + m.quantityEggs, 0);

  const totalExits = Math.abs(
    eggStockMovements
      .filter((m) => m.quantityEggs < 0 && m.type === 'VENTE')
      .reduce((sum, m) => sum + m.quantityEggs, 0)
  );

  const totalLosses = Math.abs(
    eggStockMovements
      .filter((m) => m.quantityEggs < 0 && m.type === 'PERTE')
      .reduce((sum, m) => sum + m.quantityEggs, 0)
  );

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyInEggs = adjustUnit === 'trays' ? adjustQty * eggsPerTray : adjustQty;
    const finalQty = adjustType === 'ADD' ? qtyInEggs : -qtyInEggs;

    adjustEggStock(finalQty, adjustReason);
    setIsAdjustModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Stock des Œufs & Magasin
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Inventaire en temps réel, mouvements d’entrées (production) et sorties (ventes / pertes)
          </p>
        </div>

        <button
          type="button"
          id="btn-adjust-stock"
          onClick={() => setIsAdjustModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4] font-medium text-xs sm:text-sm transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-[#5A5A40]" />
          <span>Ajuster l'Inventaire Manuel</span>
        </button>
      </div>

      {/* Stock Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Current Stock Card */}
        <div className="p-6 rounded-3xl bg-[#5A5A40] text-white border border-[#434333] shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-[#E2E2D6] uppercase tracking-widest block">
            Stock Disponible Immédiat
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl lg:text-4xl font-serif font-bold text-white">
              {formatNumber(totalEggStockTrays, 1)}
            </span>
            <span className="text-sm font-bold text-[#D1D1C4]">Plateaux</span>
          </div>
          <p className="text-xs text-[#E2E2D6] font-mono">
            Soit <strong className="text-white">{formatNumber(totalEggStock)}</strong> œufs en réserve
          </p>
        </div>

        {/* Total Production Inflow */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest">
              Entrées Récoltées
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-800 font-mono">
            +{formatNumber(totalEntries)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            {(totalEntries / eggsPerTray).toFixed(0)} plateaux produits
          </span>
        </div>

        {/* Total Sales Outflow */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest">
              Sorties Ventes
            </span>
            <ArrowDownRight className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D] font-mono">
            -{formatNumber(totalExits)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            {(totalExits / eggsPerTray).toFixed(0)} plateaux vendus
          </span>
        </div>

        {/* Losses / Breakage */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest">
              Pertes & Casse Magasin
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-rose-700 font-mono">
            -{formatNumber(totalLosses)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            {(totalLosses / eggsPerTray).toFixed(1)} plateaux déclassés
          </span>
        </div>
      </div>

      {/* Stock Ledger Movements Table */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-[#434333] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#5A5A40]" />
              <span>Livre Journal des Mouvements de Stock</span>
            </h3>
            <p className="text-xs text-[#8A8A6F]">
              Traçabilité automatique de chaque entrée et sortie
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E5E5DE]">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#F5F5F0] border-b border-[#E5E5DE]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Type de Mouvement</th>
                <th className="p-3">Variation (Œufs)</th>
                <th className="p-3">Variation (Plateaux)</th>
                <th className="p-3">Solde Restant</th>
                <th className="p-3">Détail / Motif</th>
                <th className="p-3">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {eggStockMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-[#F9F9F6] transition-colors">
                  <td className="p-3 font-semibold text-[#2D2D2D] font-mono">{formatDate(mov.date)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mov.type === 'PRODUCTION'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : mov.type === 'VENTE'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : mov.type === 'PERTE'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-[#F5F5F0] text-[#5A5A40] border border-[#D1D1C4]'
                      }`}
                    >
                      {mov.type}
                    </span>
                  </td>
                  <td
                    className={`p-3 font-bold font-mono ${
                      mov.quantityEggs > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {mov.quantityEggs > 0 ? `+${mov.quantityEggs}` : mov.quantityEggs}
                  </td>
                  <td className="p-3 text-[#2D2D2D] font-mono">
                    {mov.quantityTrays > 0 ? `+${mov.quantityTrays}` : mov.quantityTrays} pl.
                  </td>
                  <td className="p-3 font-bold text-[#2D2D2D] font-mono bg-[#F5F5F0]/60">
                    {formatNumber(mov.balanceAfterEggs)} œufs
                  </td>
                  <td className="p-3 text-[#2D2D2D]">{mov.notes}</td>
                  <td className="p-3 text-[#8A8A6F]">{mov.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Ajustement Manuel du Stock d’Œufs"
        subtitle="Régularisation suite à un comptage physique ou déclaration de casse"
        maxWidth="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-[#434333] font-semibold">Type d’Ajustement *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('ADD')}
                className={`py-2 rounded-xl font-medium border transition-colors ${
                  adjustType === 'ADD'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-[#F5F5F0] border-[#D1D1C4] text-[#8A8A6F]'
                }`}
              >
                + Entrée / Ajout
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('REMOVE')}
                className={`py-2 rounded-xl font-medium border transition-colors ${
                  adjustType === 'REMOVE'
                    ? 'bg-rose-50 border-rose-500 text-rose-800'
                    : 'bg-[#F5F5F0] border-[#D1D1C4] text-[#8A8A6F]'
                }`}
              >
                - Déduction / Casse
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Quantité *</label>
              <input
                type="number"
                min="1"
                required
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Unité *</label>
              <select
                value={adjustUnit}
                onChange={(e) => setAdjustUnit(e.target.value as any)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="trays">Plateaux ({eggsPerTray} œufs)</option>
                <option value="eggs">Œufs individuels</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Motif de l’Ajustement *</label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Casse accidentelle de 2 plateaux lors du transfert"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium shadow-xs"
            >
              Confirmer l’Ajustement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
