import React, { useState, useMemo } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Filter,
  Sparkles,
  TrendingDown,
  Layers,
  Wheat,
  Activity,
  AlertTriangle,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/common/Modal';
import { formatMoney, formatNumber, formatDate, getTodayDateString } from '../utils/formatters';

export const FeedConsumptionView: React.FC<{ isOpenNewDefault?: boolean; onCloseNew?: () => void }> = ({
  isOpenNewDefault = false,
  onCloseNew,
}) => {
  const {
    lots,
    feedItems,
    feedConsumptions,
    settings,
    currentUser,
    addFeedConsumption,
  } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(isOpenNewDefault);
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('ALL');

  // Form states - Primary unit is SACS
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formLotId, setFormLotId] = useState(lots[0]?.id || '');
  const [formFeedId, setFormFeedId] = useState(feedItems[0]?.id || '');
  const [inputMode, setInputMode] = useState<'bags' | 'kg'>('bags');
  const [formBagsCount, setFormBagsCount] = useState<number>(2.5);
  const [formQtyKg, setFormQtyKg] = useState<number>(125);
  const [formNotes, setFormNotes] = useState('');

  const currentLot = lots.find((l) => l.id === formLotId) || lots[0];
  const hensCount = currentLot?.currentCount || 1000;
  const currentFeed = feedItems.find((f) => f.id === formFeedId) || feedItems[0];
  const unitPrice = currentFeed?.unitCostPerKg || 380;
  const bagWeight = currentFeed?.standardBagWeightKg || 50;

  // Auto calculations
  const computedKg = useMemo(() => {
    if (inputMode === 'bags') {
      return Number(((Number(formBagsCount) || 0) * bagWeight).toFixed(1));
    }
    return Number(formQtyKg) || 0;
  }, [inputMode, formBagsCount, formQtyKg, bagWeight]);

  const computedBags = useMemo(() => {
    if (inputMode === 'bags') {
      return Number(formBagsCount) || 0;
    }
    return Number((computedKg / bagWeight).toFixed(2));
  }, [inputMode, formBagsCount, computedKg, bagWeight]);

  const formGramsPerHen = hensCount > 0 ? Number(((computedKg * 1000) / hensCount).toFixed(1)) : 0;
  const formFeedCost = computedKg * unitPrice;
  const formCostPerHen = hensCount > 0 ? Number((formFeedCost / hensCount).toFixed(1)) : 0;

  const handleOpenModal = () => {
    setFormDate(getTodayDateString());
    setFormLotId(lots[0]?.id || '');
    setFormFeedId(feedItems[0]?.id || '');
    setInputMode('bags');
    const lotHens = lots[0]?.currentCount || 1000;
    const initialKg = Math.round(lotHens * 0.12); // ~120g/poule
    const initialBags = Number((initialKg / (feedItems[0]?.standardBagWeightKg || 50)).toFixed(1));
    setFormBagsCount(initialBags);
    setFormQtyKg(initialKg);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseNew) onCloseNew();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedConsumption({
      date: formDate,
      lotId: formLotId,
      lotName: currentLot?.name || 'Lot',
      feedItemId: formFeedId,
      feedItemName: currentFeed?.name || 'Aliment',
      quantityKg: computedKg,
      bagsCount: computedBags,
      hensCount,
      recordedBy: currentUser.name,
      notes: formNotes,
    });
    handleCloseModal();
  };

  // Filtered consumptions
  const filteredConsumptions = feedConsumptions.filter((c) => {
    return selectedLotFilter === 'ALL' || c.lotId === selectedLotFilter;
  });

  const totalKgDistributed = filteredConsumptions.reduce((sum, c) => sum + c.quantityKg, 0);
  const totalBagsDistributed = filteredConsumptions.reduce(
    (sum, c) => sum + (c.bagsCount ?? Number((c.quantityKg / 50).toFixed(2))),
    0
  );
  const totalCostDistributed = filteredConsumptions.reduce((sum, c) => sum + c.feedCost, 0);
  const avgGramsPerHen =
    filteredConsumptions.length > 0
      ? (filteredConsumptions.reduce((sum, c) => sum + c.consumptionPerHenGrams, 0) / filteredConsumptions.length).toFixed(1)
      : '0';

  const totalStockBags = feedItems.reduce(
    (sum, f) => sum + Number((f.currentStockKg / (f.standardBagWeightKg || 50)).toFixed(1)),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333] flex items-center gap-2.5">
            <Package className="w-6 h-6 text-[#5A5A40]" />
            <span>Consommation d'Aliment (en Sacs)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Suivi des distributions quotidiennes calculé en <strong>Sacs de {bagWeight} kg</strong> et grammage par poule
          </p>
        </div>

        <button
          type="button"
          id="btn-distribute-feed"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Distribuer un Aliment (Sacs)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block">
            Total Sacs Consommés
          </span>
          <div className="text-2xl font-serif font-bold text-[#5A5A40]">
            {formatNumber(totalBagsDistributed, 1)} <span className="text-xs font-sans font-normal text-[#8A8A6F]">sacs</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">
            Soit {formatNumber(totalKgDistributed)} kg d'aliment
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Ration Moyenne / Poule
          </span>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D]">
            {avgGramsPerHen} <span className="text-xs font-sans font-normal text-[#8A8A6F]">g/jour</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">
            Cible idéale : 115g à 125g / poule
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block">
            Coût Alimentaire Cumulé
          </span>
          <div className="text-2xl font-serif font-bold text-rose-800">
            {formatMoney(totalCostDistributed, settings.currency)}
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">Poste de dépense n°1</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest block">
            Stock Disponible Magasin
          </span>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D]">
            {formatNumber(totalStockBags, 1)} <span className="text-xs font-sans font-normal text-[#8A8A6F]">sacs</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">
            Prêts pour distribution
          </span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E5DE]">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-[#8A8A6F]" />
            <select
              value={selectedLotFilter}
              onChange={(e) => setSelectedLotFilter(e.target.value)}
              className="bg-[#F5F5F0] border border-[#D1D1C4] text-[#434333] text-xs rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="ALL">Tous les Lots</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-[#8A8A6F]">
            {filteredConsumptions.length} distribution(s) enregistrée(s)
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#E5E5DE]">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#F5F5F0] border-b border-[#E5E5DE]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Lot Récepteur</th>
                <th className="p-3">Effectif</th>
                <th className="p-3">Aliment Distribué</th>
                <th className="p-3">Quantité en Sacs</th>
                <th className="p-3">Équivalent (Kg)</th>
                <th className="p-3">Ration / Poule</th>
                <th className="p-3">Coût Total</th>
                <th className="p-3">Coût / Poule</th>
                <th className="p-3">Enregistré par</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredConsumptions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-[#8A8A6F]">
                    Aucune distribution d'aliment enregistrée.
                  </td>
                </tr>
              ) : (
                filteredConsumptions.map((cons) => {
                  const bags = cons.bagsCount ?? Number((cons.quantityKg / 50).toFixed(2));
                  return (
                    <tr key={cons.id} className="hover:bg-[#F9F9F6] transition-colors">
                      <td className="p-3 font-semibold text-[#2D2D2D] font-mono">{formatDate(cons.date)}</td>
                      <td className="p-3 font-medium text-[#434333]">
                        {cons.lotName}
                        {cons.notes && (
                          <span className="text-[10px] text-[#8A8A6F] italic block truncate max-w-xs">
                            {cons.notes}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[#2D2D2D] font-mono">{cons.hensCount}</td>
                      <td className="p-3 text-[#5A5A40] font-medium">{cons.feedItemName}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 font-bold text-[#5A5A40] font-mono text-sm">
                          <Package className="w-3.5 h-3.5" />
                          {bags} sacs
                        </span>
                      </td>
                      <td className="p-3 font-medium text-[#8A8A6F] font-mono">{cons.quantityKg} kg</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold font-mono text-[10px] ${
                            cons.consumptionPerHenGrams >= 110 && cons.consumptionPerHenGrams <= 130
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-[#E2E2D6] text-[#434333]'
                          }`}
                        >
                          {cons.consumptionPerHenGrams} g/poule
                        </span>
                      </td>
                      <td className="p-3 font-bold text-rose-800 font-mono">
                        {formatMoney(cons.feedCost, settings.currency)}
                      </td>
                      <td className="p-3 text-[#434333] font-mono">
                        {cons.feedCostPerHen} {settings.currency}
                      </td>
                      <td className="p-3 text-[#8A8A6F]">{cons.recordedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution Modal - SACS BASED */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Distribuer de l'Aliment (Par Sacs)"
        subtitle="Saisissez la ration directement en sacs de 50 kg ou demi-sacs"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date de Distribution *</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Bâtiment / Lot Destinataire *</label>
              <select
                value={formLotId}
                onChange={(e) => {
                  setFormLotId(e.target.value);
                  const selectedLot = lots.find((l) => l.id === e.target.value);
                  if (selectedLot) {
                    const kg = Math.round(selectedLot.currentCount * 0.12);
                    setFormQtyKg(kg);
                    setFormBagsCount(Number((kg / bagWeight).toFixed(1)));
                  }
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.currentCount} poules)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Aliment Prélevé *</label>
              <select
                value={formFeedId}
                onChange={(e) => setFormFeedId(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {feedItems.map((f) => {
                  const bCount = (f.currentStockKg / (f.standardBagWeightKg || 50)).toFixed(1);
                  return (
                    <option key={f.id} value={f.id}>
                      {f.name} (Stock: {bCount} sacs / {f.currentStockKg} kg)
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[#434333] font-semibold mb-1">Mode de Saisie :</label>
              <div className="flex gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => setInputMode('bags')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    inputMode === 'bags'
                      ? 'bg-[#5A5A40] text-white shadow-2xs'
                      : 'bg-[#F5F5F0] text-[#8A8A6F] hover:text-[#434333]'
                  }`}
                >
                  🌾 En Sacs ({bagWeight}kg)
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('kg')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    inputMode === 'kg'
                      ? 'bg-[#5A5A40] text-white shadow-2xs'
                      : 'bg-[#F5F5F0] text-[#8A8A6F] hover:text-[#434333]'
                  }`}
                >
                  Directement en Kg
                </button>
              </div>
            </div>
          </div>

          {/* SACS INPUT SECTION */}
          {inputMode === 'bags' ? (
            <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-3">
              <div>
                <label className="block text-[#434333] font-bold mb-1 flex items-center justify-between">
                  <span>Nombre de Sacs à distribuer *</span>
                  <span className="text-[10px] text-[#5A5A40] font-mono font-normal">
                    = {computedKg} kg d'aliment au total
                  </span>
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={formBagsCount}
                  onChange={(e) => setFormBagsCount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2.5 text-[#2D2D2D] font-mono text-lg font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  placeholder="Ex: 2.5"
                />

                {/* Quick bags selector */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormBagsCount(b)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        formBagsCount === b
                          ? 'bg-[#5A5A40] text-white'
                          : 'bg-white border border-[#D1D1C4] hover:bg-[#E2E2D6] text-[#5A5A40]'
                      }`}
                    >
                      {b} sac{b > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE]">
              <label className="block text-[#434333] font-bold mb-1 flex items-center justify-between">
                <span>Quantité en Kilogrammes (kg) *</span>
                <span className="text-[10px] text-[#5A5A40] font-mono font-normal">
                  = {(computedKg / bagWeight).toFixed(2)} sacs de {bagWeight}kg
                </span>
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={formQtyKg}
                onChange={(e) => setFormQtyKg(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2.5 text-[#2D2D2D] font-mono text-lg font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          )}

          {/* Automatic Calculation Indicator */}
          <div className="p-4 rounded-2xl bg-[#E2E2D6] border border-[#D1D1C4] space-y-2">
            <div className="text-xs font-bold text-[#434333] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                Indicateurs Nutritionnels & Coût
              </span>
              <span className="font-mono text-[11px] text-[#5A5A40]">
                Cheptel : {hensCount} poules
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-[#8A8A6F] block">Sacs Prélevés</span>
                <span className="text-sm font-bold text-[#5A5A40] font-mono">
                  {computedBags} sacs
                </span>
                <span className="text-[10px] text-[#8A8A6F] block">({computedKg} kg)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-[#8A8A6F] block">Ration / Poule</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    formGramsPerHen >= 110 && formGramsPerHen <= 130 ? 'text-emerald-800' : 'text-amber-800'
                  }`}
                >
                  {formGramsPerHen} g
                </span>
                <span className="text-[10px] text-[#8A8A6F] block">Réf : 115-125g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-rose-800 block">Coût Journalier</span>
                <span className="text-sm font-bold text-rose-800 font-mono">
                  {formatMoney(formFeedCost, settings.currency)}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-[#8A8A6F] block">Coût / Poule</span>
                <span className="text-sm font-bold text-[#2D2D2D] font-mono">
                  {formCostPerHen} {settings.currency}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Observations</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Ex: Distribution du matin, bonne appétence, abreuvoirs nettoyés."
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-bold shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider ({computedBags} sacs / -{computedKg} kg en stock)</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
