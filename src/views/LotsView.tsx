import React, { useState } from 'react';
import {
  Bird,
  Plus,
  Calendar,
  DollarSign,
  Skull,
  ShoppingCart,
  Activity,
  Edit2,
  Trash2,
  CheckCircle2,
  FileText,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Lot, LotStatus } from '../types';
import { Modal } from '../components/common/Modal';
import { LotReformModal } from '../components/lots/LotReformModal';
import { formatMoney, formatNumber, formatDate, getTodayDateString } from '../utils/formatters';

export const LotsView: React.FC = () => {
  const {
    lots,
    clients,
    suppliers,
    productions,
    mortalities,
    feedConsumptions,
    settings,
    currentUser,
    addLot,
    updateLot,
    deleteLot,
    addSale,
  } = useFarm();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedLotDetail, setSelectedLotDetail] = useState<Lot | null>(null);
  const [selectedLotForReform, setSelectedLotForReform] = useState<Lot | null>(null);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Actif' | 'Réformé'>('ALL');

  // Form state for new / edit lot
  const [formCode, setFormCode] = useState(`LOT-${new Date().getFullYear()}-${String.fromCharCode(65 + lots.length)}`);
  const [formName, setFormName] = useState('');
  const [formArrivalDate, setFormArrivalDate] = useState(getTodayDateString());
  const [formInitialCount, setFormInitialCount] = useState<number>(1000);
  const [formBreed, setFormBreed] = useState('Lohmann Brown');
  const [formAgeWeeks, setFormAgeWeeks] = useState<number>(18);
  const [formUnitCost, setFormUnitCost] = useState<number>(4500);
  const [formSupplierName, setFormSupplierName] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenNewModal = () => {
    setFormCode(`LOT-${new Date().getFullYear()}-${String.fromCharCode(65 + lots.length)}`);
    setFormName(`Bâtiment ${lots.length + 1} - Pondeuses`);
    setFormArrivalDate(getTodayDateString());
    setFormInitialCount(1000);
    setFormBreed('Lohmann Brown');
    setFormAgeWeeks(18);
    setFormUnitCost(4500);
    setFormSupplierName(suppliers[0]?.name || 'Couvoir Sélectionné');
    setFormNotes('');
    setEditingLot(null);
    setIsNewModalOpen(true);
  };

  const handleOpenEditModal = (lot: Lot) => {
    setEditingLot(lot);
    setFormCode(lot.code);
    setFormName(lot.name);
    setFormArrivalDate(lot.arrivalDate);
    setFormInitialCount(lot.initialCount);
    setFormBreed(lot.breed);
    setFormAgeWeeks(lot.ageWeeksAtArrival);
    setFormUnitCost(lot.unitCost);
    setFormSupplierName(lot.supplierName);
    setFormNotes(lot.notes || '');
    setIsNewModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLot) {
      updateLot(editingLot.id, {
        code: formCode,
        name: formName,
        arrivalDate: formArrivalDate,
        initialCount: formInitialCount,
        breed: formBreed,
        ageWeeksAtArrival: formAgeWeeks,
        unitCost: formUnitCost,
        supplierName: formSupplierName,
        notes: formNotes,
      });
    } else {
      addLot({
        code: formCode,
        name: formName,
        arrivalDate: formArrivalDate,
        initialCount: formInitialCount,
        breed: formBreed,
        ageWeeksAtArrival: formAgeWeeks,
        currentAgeWeeks: formAgeWeeks,
        unitCost: formUnitCost,
        supplierName: formSupplierName,
        status: 'Actif',
        notes: formNotes,
      });
    }

    setIsNewModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Gestion des Lots & Réforme des Poules
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Suivi individuel par bande : effectifs vivants, mortalités, vente des réformes et clôture de cycle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-add-lot"
            onClick={handleOpenNewModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Nouveau Lot</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DE] pb-2 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'ALL'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'bg-white text-[#434333] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Tous les Lots ({lots.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Actif')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'Actif'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'bg-white text-[#434333] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Lots Actifs ({lots.filter((l) => l.status === 'Actif').length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('Réformé')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'Réformé'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'bg-white text-[#434333] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Lots Réformés ({lots.filter((l) => l.status === 'Réformé').length})
        </button>
      </div>

      {/* Lots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots
          .filter((l) => statusFilter === 'ALL' || l.status === statusFilter)
          .map((lot) => {
          // Calculations for this lot
          const lotProds = productions.filter((p) => p.lotId === lot.id);
          const totalEggs = lotProds.reduce((sum, p) => sum + p.eggsTotal, 0);
          const lastProd = lotProds[0];
          const mortalityRate = ((lot.deadCount / lot.initialCount) * 100).toFixed(1);

          return (
            <div
              key={lot.id}
              id={`lot-card-${lot.id}`}
              className="rounded-3xl bg-white border border-[#E5E5DE] p-6 flex flex-col justify-between hover:border-[#D1D1C4] transition-all shadow-xs space-y-5"
            >
              {/* Card Top */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A6F]">
                      {lot.code}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#434333] mt-0.5">
                      {lot.name}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      lot.status === 'Actif'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-[#F5F5F0] text-[#8A8A6F] border border-[#D1D1C4]'
                    }`}
                  >
                    {lot.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8A8A6F]">
                  <Bird className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Race : <strong className="text-[#2D2D2D]">{lot.breed}</strong></span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8A8A6F]">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Arrivée le {formatDate(lot.arrivalDate)} ({lot.currentAgeWeeks} sem.)</span>
                </div>
              </div>

              {/* Automatic Effectif Calculation Display */}
              <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8A8A6F] font-medium">Effectif Actuel :</span>
                  <span className="text-lg font-serif font-bold text-emerald-800">
                    {formatNumber(lot.currentCount)} poules
                  </span>
                </div>

                {/* Formula breakdown */}
                <div className="text-[11px] text-[#8A8A6F] flex items-center justify-between pt-1 border-t border-[#E5E5DE] font-mono">
                  <span>Initial : {lot.initialCount}</span>
                  <span className="text-rose-600">- Morts : {lot.deadCount}</span>
                  <span className="text-sky-700">- Vendues : {lot.soldCount}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#E2E2D6] h-2 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#5A5A40] h-full"
                    style={{ width: `${(lot.currentCount / lot.initialCount) * 100}%` }}
                    title={`Vivantes: ${lot.currentCount}`}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(lot.deadCount / lot.initialCount) * 100}%` }}
                    title={`Mortes: ${lot.deadCount}`}
                  />
                  <div
                    className="bg-sky-500 h-full"
                    style={{ width: `${(lot.soldCount / lot.initialCount) * 100}%` }}
                    title={`Vendues: ${lot.soldCount}`}
                  />
                </div>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                  <span className="text-[#8A8A6F] block text-[10px] uppercase font-bold tracking-wider">Taux de ponte rép.</span>
                  <span className="font-serif font-bold text-[#5A5A40] text-sm">
                    {lastProd ? `${lastProd.layingRatePercent}%` : '-'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                  <span className="text-[#8A8A6F] block text-[10px] uppercase font-bold tracking-wider">Œufs cumulés</span>
                  <span className="font-serif font-bold text-[#2D2D2D] text-sm">
                    {formatNumber(totalEggs)}
                  </span>
                </div>
              </div>

              {/* Reform Action Bar */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-900">
                  <Bird className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-bold">
                    {lot.soldCount > 0 ? `${lot.soldCount} réformes vendues` : 'Réforme du lot'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLotForReform(lot)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-2xs flex items-center gap-1"
                >
                  <span>Vente Réforme</span>
                </button>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setSelectedLotDetail(lot)}
                  className="text-xs font-bold text-[#5A5A40] hover:text-[#434333] flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Fiche détaillée</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(lot)}
                    className="p-1.5 rounded-xl text-[#8A8A6F] hover:text-[#2D2D2D] hover:bg-[#E2E2D6]"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Supprimer définitivement le ${lot.name} ?`)) {
                        deleteLot(lot.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-[#8A8A6F] hover:text-rose-600 hover:bg-rose-50"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Lot */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title={editingLot ? 'Modifier le Lot' : 'Enregistrer un Nouveau Lot'}
        subtitle="Saisissez les paramètres de la bande de pondeuses"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Code du Lot *</label>
              <input
                type="text"
                required
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="ex: LOT-2024-C"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Nom / Bâtiment *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="ex: Bâtiment 3 - Isa Brown"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Race de Poules *</label>
              <input
                type="text"
                required
                value={formBreed}
                onChange={(e) => setFormBreed(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="ex: Lohmann Brown, Novogen, Isa Brown"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date d’Arrivée *</label>
              <input
                type="date"
                required
                value={formArrivalDate}
                onChange={(e) => setFormArrivalDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Effectif Initial *</label>
              <input
                type="number"
                min="1"
                required
                value={formInitialCount}
                onChange={(e) => setFormInitialCount(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Âge à l’arrivée (sem.) *</label>
              <input
                type="number"
                min="1"
                max="80"
                required
                value={formAgeWeeks}
                onChange={(e) => setFormAgeWeeks(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Prix Achat / Poulette ({settings.currency})</label>
              <input
                type="number"
                min="0"
                value={formUnitCost}
                onChange={(e) => setFormUnitCost(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Fournisseur / Couvoir</label>
            <input
              type="text"
              value={formSupplierName}
              onChange={(e) => setFormSupplierName(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Couvoir National ou Elevage Partenaire"
            />
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Observations / Notes</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Vaccinations initiales reçues, conditions de démarrage, etc."
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white text-xs font-medium shadow-xs"
            >
              {editingLot ? 'Enregistrer les modifications' : 'Créer le Lot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Lot Detail Comprehensive View */}
      {selectedLotDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLotDetail(null)}
          title={`Fiche Complète : ${selectedLotDetail.name}`}
          subtitle={`Code : ${selectedLotDetail.code} | Race : ${selectedLotDetail.breed}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                <span className="text-[#8A8A6F] block text-[10px] uppercase font-bold">Effectif Vivant</span>
                <span className="text-lg font-serif font-bold text-emerald-800">
                  {selectedLotDetail.currentCount}
                </span>
                <span className="text-[10px] text-[#8A8A6F] block">sur {selectedLotDetail.initialCount} init.</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                <span className="text-[#8A8A6F] block text-[10px] uppercase font-bold">Mortalités</span>
                <span className="text-lg font-serif font-bold text-rose-700">
                  {selectedLotDetail.deadCount}
                </span>
                <span className="text-[10px] text-[#8A8A6F] block">
                  ({((selectedLotDetail.deadCount / selectedLotDetail.initialCount) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                <span className="text-[#8A8A6F] block text-[10px] uppercase font-bold">Âge Actuel</span>
                <span className="text-lg font-serif font-bold text-[#5A5A40]">
                  {selectedLotDetail.currentAgeWeeks} sem.
                </span>
                <span className="text-[10px] text-[#8A8A6F] block">Ponte active</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                <span className="text-[#8A8A6F] block text-[10px] uppercase font-bold">Statut</span>
                <span className="text-sm font-serif font-bold text-[#2D2D2D] block mt-1">
                  {selectedLotDetail.status}
                </span>
              </div>
            </div>

            {/* General Information Details */}
            <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-2">
              <h4 className="font-serif font-bold text-[#434333] text-xs uppercase tracking-wider">
                Informations du Fournisseur & Coût
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#2D2D2D]">
                <div>Fournisseur : <strong>{selectedLotDetail.supplierName || 'Non spécifié'}</strong></div>
                <div>Date d’arrivée : <strong>{formatDate(selectedLotDetail.arrivalDate)}</strong></div>
                <div>Coût d’achat unitaire : <strong>{formatMoney(selectedLotDetail.unitCost, settings.currency)}</strong></div>
                <div>Investissement initial : <strong>{formatMoney(selectedLotDetail.unitCost * selectedLotDetail.initialCount, settings.currency)}</strong></div>
              </div>
              {selectedLotDetail.notes && (
                <div className="pt-2 text-[#8A8A6F] text-xs border-t border-[#E5E5DE]">
                  Note : {selectedLotDetail.notes}
                </div>
              )}
            </div>

            {/* Status changer buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E5E5DE]">
              <div className="flex items-center gap-2">
                <span className="text-[#8A8A6F]">Modifier statut :</span>
                {(['Actif', 'Réformé', 'En attente'] as LotStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      updateLot(selectedLotDetail.id, { status: st });
                      setSelectedLotDetail({ ...selectedLotDetail, status: st });
                    }}
                    className={`px-3 py-1 rounded-xl font-medium text-[11px] transition-colors ${
                      selectedLotDetail.status === st
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'bg-[#E2E2D6] text-[#434333] hover:bg-[#D9D9C8]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedLotDetail(null)}
                className="px-4 py-2 bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] rounded-xl font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Lot Reform & Closure Modal */}
      {selectedLotForReform && (
        <LotReformModal
          lot={selectedLotForReform}
          clients={clients}
          settings={settings}
          currentUser={currentUser}
          onClose={() => setSelectedLotForReform(null)}
          onSaleReformHens={(saleData) => addSale(saleData as any)}
          onCloseLot={(lotId, notes) => {
            updateLot(lotId, { status: 'Réformé', notes: notes ? `${notes}` : 'Lot réformé et clôturé.' });
          }}
        />
      )}
    </div>
  );
};
