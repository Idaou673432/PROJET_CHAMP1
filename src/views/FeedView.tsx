import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  ShoppingCart,
  AlertTriangle,
  Package,
  Layers,
  Trash2,
  DollarSign,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { FeedItem, FeedType, PaymentMethod } from '../types';
import { Modal } from '../components/common/Modal';
import { formatMoney, formatNumber, formatDate, getTodayDateString } from '../utils/formatters';

export const FeedView: React.FC = () => {
  const {
    feedItems,
    feedPurchases,
    suppliers,
    settings,
    currentUser,
    addFeedItem,
    addFeedPurchase,
    updateFeedItem,
    deleteFeedItem,
  } = useFarm();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  // Purchase Form states
  const [purchDate, setPurchDate] = useState(getTodayDateString());
  const [purchFeedId, setPurchFeedId] = useState(feedItems[0]?.id || '');
  const [purchBags, setPurchBags] = useState<number>(20);
  const [purchBagWeight, setPurchBagWeight] = useState<number>(50);
  const [purchUnitPriceKg, setPurchUnitPriceKg] = useState<number>(380);
  const [purchSupplierId, setPurchSupplierId] = useState(suppliers[0]?.id || '');
  const [purchPaymentMethod, setPurchPaymentMethod] = useState<PaymentMethod>('Virement');
  const [purchAmountPaid, setPurchAmountPaid] = useState<number>(380000);
  const [purchNotes, setPurchNotes] = useState('');

  // Auto total
  const purchTotalKg = purchBags * purchBagWeight;
  const purchTotalCost = purchTotalKg * purchUnitPriceKg;

  // New Feed Item Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<FeedType>('Pondeuse pic de ponte');
  const [newItemInitialKg, setNewItemInitialKg] = useState<number>(1000);
  const [newItemMinThresholdKg, setNewItemMinThresholdKg] = useState<number>(500);
  const [newItemCostKg, setNewItemCostKg] = useState<number>(380);
  const [newItemBagWeight, setNewItemBagWeight] = useState<number>(50);

  const handleOpenPurchase = (item?: FeedItem) => {
    const selectedItem = item || feedItems[0];
    setPurchDate(getTodayDateString());
    setPurchFeedId(selectedItem?.id || '');
    setPurchBags(20);
    setPurchBagWeight(selectedItem?.standardBagWeightKg || 50);
    setPurchUnitPriceKg(selectedItem?.unitCostPerKg || 380);
    setPurchSupplierId(suppliers[0]?.id || '');
    setPurchPaymentMethod('Virement');
    const total = 20 * (selectedItem?.standardBagWeightKg || 50) * (selectedItem?.unitCostPerKg || 380);
    setPurchAmountPaid(total);
    setPurchNotes('');
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = feedItems.find((f) => f.id === purchFeedId);
    const sup = suppliers.find((s) => s.id === purchSupplierId);

    addFeedPurchase({
      date: purchDate,
      feedItemId: purchFeedId,
      feedItemName: item?.name || 'Aliment',
      quantityKg: purchTotalKg,
      bagsCount: purchBags,
      bagWeightKg: purchBagWeight,
      unitPricePerKg: purchUnitPriceKg,
      supplierId: purchSupplierId,
      supplierName: sup?.name || 'Fournisseur Aliments',
      paymentMethod: purchPaymentMethod,
      amountPaid: purchAmountPaid,
      recordedBy: currentUser.name,
      notes: purchNotes,
    });

    setIsPurchaseModalOpen(false);
  };

  const handleNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeedItem({
      name: newItemName,
      type: newItemType,
      currentStockKg: newItemInitialKg,
      minThresholdKg: newItemMinThresholdKg,
      unitCostPerKg: newItemCostKg,
      standardBagWeightKg: newItemBagWeight,
    });
    setIsNewItemModalOpen(false);
  };

  const totalStockKg = feedItems.reduce((sum, f) => sum + f.currentStockKg, 0);
  const totalStockBags = Number((totalStockKg / 50).toFixed(1));
  const totalStockValuation = feedItems.reduce((sum, f) => sum + f.currentStockKg * f.unitCostPerKg, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Stock des Aliments & Approvisionnement
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Gestion des matières premières, sacs d’aliment complet et alertes de rupture
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewItemModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4] text-xs font-semibold transition-all"
          >
            + Nouveau Type d'Aliment
          </button>
          <button
            type="button"
            id="btn-buy-feed"
            onClick={() => handleOpenPurchase()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Acheter de l'Aliment</span>
          </button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest block">
            Stock Total Aliments (kg)
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A5A40]">
            {formatNumber(totalStockKg)} kg
          </div>
          <span className="text-xs text-[#8A8A6F] block">Toutes formules confondues</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest block">
            Équivalent en Sacs de 50kg
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2D2D]">
            {totalStockBags} sacs
          </div>
          <span className="text-xs text-[#8A8A6F] block">Capacité d’autonomie actuelle</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Valeur Marchande du Stock
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800">
            {formatMoney(totalStockValuation, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">Actif immobilisé en magasin</span>
        </div>
      </div>

      {/* Feed Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {feedItems.map((item) => {
          const isCritical = item.currentStockKg <= item.minThresholdKg;
          const bagsCount = Number((item.currentStockKg / item.standardBagWeightKg).toFixed(1));
          const thresholdBags = Number((item.minThresholdKg / item.standardBagWeightKg).toFixed(1));

          return (
            <div
              key={item.id}
              className={`p-6 rounded-3xl bg-white border transition-all space-y-4 shadow-xs ${
                isCritical ? 'border-rose-300' : 'border-[#E5E5DE]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40]">
                    {item.type}
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#2D2D2D] mt-0.5">
                    {item.name}
                  </h3>
                </div>
                {isCritical && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Critique</span>
                  </span>
                )}
              </div>

              {/* Progress gauge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8A8A6F]">Stock disponible :</span>
                  <span className="font-bold text-[#2D2D2D] font-mono text-sm">
                    {formatNumber(item.currentStockKg)} kg ({bagsCount} sacs)
                  </span>
                </div>
                <div className="w-full bg-[#F5F5F0] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical ? 'bg-rose-500' : item.currentStockKg < item.minThresholdKg * 2 ? 'bg-[#5A5A40]' : 'bg-emerald-600'
                    }`}
                    style={{
                      width: `${Math.min(100, (item.currentStockKg / (item.minThresholdKg * 3)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#8A8A6F]">
                  <span>Seuil d'alerte : {item.minThresholdKg} kg ({thresholdBags} sacs)</span>
                  <span>{item.unitCostPerKg} {settings.currency}/kg</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => handleOpenPurchase(item)}
                  className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#434333] font-medium text-xs transition-colors flex items-center gap-1.5 border border-[#D1D1C4]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Réapprovisionner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Supprimer l'aliment ${item.name} ?`)) {
                      deleteFeedItem(item.id);
                    }
                  }}
                  className="p-1.5 text-[#8A8A6F] hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Approvisionnement en Aliment"
        subtitle="Entrée en stock et enregistrement automatique de la dépense"
        maxWidth="lg"
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date d’Achat *</label>
              <input
                type="date"
                required
                value={purchDate}
                onChange={(e) => setPurchDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Aliment concerné *</label>
              <select
                value={purchFeedId}
                onChange={(e) => {
                  setPurchFeedId(e.target.value);
                  const selected = feedItems.find((f) => f.id === e.target.value);
                  if (selected) {
                    setPurchBagWeight(selected.standardBagWeightKg);
                    setPurchUnitPriceKg(selected.unitCostPerKg);
                  }
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {feedItems.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Stock actuel: {f.currentStockKg} kg)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Nombre de Sacs *</label>
              <input
                type="number"
                min="1"
                required
                value={purchBags}
                onChange={(e) => {
                  const b = Number(e.target.value);
                  setPurchBags(b);
                  setPurchAmountPaid(b * purchBagWeight * purchUnitPriceKg);
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Poids du Sac (kg) *</label>
              <input
                type="number"
                min="1"
                required
                value={purchBagWeight}
                onChange={(e) => {
                  const bw = Number(e.target.value);
                  setPurchBagWeight(bw);
                  setPurchAmountPaid(purchBags * bw * purchUnitPriceKg);
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Prix Achat / kg ({settings.currency}) *</label>
              <input
                type="number"
                min="1"
                required
                value={purchUnitPriceKg}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setPurchUnitPriceKg(p);
                  setPurchAmountPaid(purchTotalKg * p);
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Fournisseur *</label>
              <select
                value={purchSupplierId}
                onChange={(e) => setPurchSupplierId(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Mode de Paiement *</label>
              <select
                value={purchPaymentMethod}
                onChange={(e) => setPurchPaymentMethod(e.target.value as any)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Virement">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Espèces">Espèces</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Crédit">Dette Fournisseur (0 payé)</option>
              </select>
            </div>
          </div>

          {/* Cost preview box */}
          <div className="p-4 rounded-2xl bg-[#E2E2D6] border border-[#D1D1C4] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#8A8A6F] block">Total réceptionné :</span>
              <strong className="text-[#2D2D2D] font-mono text-sm">{purchTotalKg} kg ({purchBags} sacs)</strong>
            </div>
            <div className="text-right">
              <span className="text-[#8A8A6F] block">Coût Total d'Achat :</span>
              <strong className="text-[#5A5A40] font-serif text-base font-bold">
                {formatMoney(purchTotalCost, settings.currency)}
              </strong>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium shadow-xs"
            >
              Enregistrer l'Achat (+{purchTotalKg} kg en stock)
            </button>
          </div>
        </form>
      </Modal>

      {/* New Feed Item Type Modal */}
      <Modal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        title="Ajouter un Type d'Aliment"
        subtitle="Créez une nouvelle référence d'aliment ou matière première"
        maxWidth="md"
      >
        <form onSubmit={handleNewItemSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#434333] font-semibold mb-1">Nom de l'Aliment *</label>
            <input
              type="text"
              required
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Aliment Finition Pondeuse 50kg"
            />
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Catégorie / Type *</label>
            <select
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as FeedType)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="Pondeuse pic de ponte">Pondeuse pic de ponte</option>
              <option value="Pondeuse démarrage">Pondeuse démarrage</option>
              <option value="Pondeuse finition">Pondeuse finition</option>
              <option value="Maïs concassé">Maïs concassé</option>
              <option value="Son de blé">Son de blé</option>
              <option value="Tourteau de soja">Tourteau de soja</option>
              <option value="Concentré / Prémix">Concentré / Prémix</option>
              <option value="Calcium / Coquilles">Calcium / Coquilles</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Stock Initial (kg)</label>
              <input
                type="number"
                min="0"
                value={newItemInitialKg}
                onChange={(e) => setNewItemInitialKg(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-rose-700 font-semibold mb-1">Seuil Alerte Mini (kg)</label>
              <input
                type="number"
                min="10"
                value={newItemMinThresholdKg}
                onChange={(e) => setNewItemMinThresholdKg(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Prix estimé / kg ({settings.currency})</label>
              <input
                type="number"
                min="0"
                value={newItemCostKg}
                onChange={(e) => setNewItemCostKg(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Poids standard du sac (kg)</label>
              <input
                type="number"
                min="1"
                value={newItemBagWeight}
                onChange={(e) => setNewItemBagWeight(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => setIsNewItemModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium shadow-xs"
            >
              Créer la Référence
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
