import React, { useState } from 'react';
import {
  Bird,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  User,
  Phone,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Lot, FarmSettings, Client, PaymentMethod } from '../../types';
import { Modal } from '../common/Modal';
import { formatMoney, formatNumber, formatDate, getTodayDateString } from '../../utils/formatters';

interface LotReformModalProps {
  lot: Lot;
  clients: Client[];
  settings: FarmSettings;
  currentUser: { name: string };
  onClose: () => void;
  onSaleReformHens: (saleData: {
    clientId: string;
    clientName: string;
    clientPhone?: string;
    productType: 'Poules réformées';
    quantity: number;
    unit: 'poule';
    unitPrice: number;
    paymentMethod: PaymentMethod;
    amountPaid: number;
    date: string;
    lotId: string;
    notes?: string;
  }) => { success: boolean; error?: string };
  onCloseLot: (lotId: string, notes?: string) => void;
}

export const LotReformModal: React.FC<LotReformModalProps> = ({
  lot,
  clients,
  settings,
  currentUser,
  onClose,
  onSaleReformHens,
  onCloseLot,
}) => {
  const [activeTab, setActiveTab] = useState<'sale' | 'closure'>('sale');

  // Sale form states
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [clientName, setClientName] = useState(clients[0]?.name || 'Grossiste Volaille');
  const [clientPhone, setClientPhone] = useState(clients[0]?.phone || '');
  const [quantity, setQuantity] = useState<number>(Math.min(100, lot.currentCount));
  const [unitPrice, setUnitPrice] = useState<number>(2500); // 2500 FCFA default per reform hen
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [amountPaid, setAmountPaid] = useState<number>(quantity * 2500);
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState(`Vente de ${quantity} poules de réforme - Lot ${lot.name}`);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Closure notes
  const [closureNotes, setClosureNotes] = useState(`Fin de cycle de ponte à l'âge de ${lot.currentAgeWeeks} semaines. Réforme complète.`);

  const totalAmount = quantity * unitPrice;
  const currency = settings.currency || 'FCFA';

  const handleClientChange = (id: string) => {
    setSelectedClientId(id);
    const c = clients.find((item) => item.id === id);
    if (c) {
      setClientName(c.name);
      setClientPhone(c.phone || '');
    }
  };

  const handleQuantityChange = (val: number) => {
    const clamped = Math.max(1, Math.min(lot.currentCount, val));
    setQuantity(clamped);
    setAmountPaid(clamped * unitPrice);
  };

  const handleUnitPriceChange = (val: number) => {
    setUnitPrice(val);
    setAmountPaid(quantity * val);
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (quantity <= 0 || quantity > lot.currentCount) {
      setErrorMessage(`La quantité doit être comprise entre 1 et ${lot.currentCount} poules disponibles.`);
      return;
    }

    const res = onSaleReformHens({
      clientId: selectedClientId,
      clientName,
      clientPhone,
      productType: 'Poules réformées',
      quantity,
      unit: 'poule',
      unitPrice,
      paymentMethod,
      amountPaid,
      date,
      lotId: lot.id,
      notes,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Erreur lors de la vente de réforme');
      return;
    }

    setSuccessMessage(`Vente de ${quantity} poules de réforme enregistrée avec succès !`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleClosureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm(`Confirmez-vous la clôture définitive du ${lot.name} ? Le statut passera à 'Réformé'.`)) {
      onCloseLot(lot.id, closureNotes);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Module Réforme : ${lot.name}`}
      subtitle={`Effectif vivant : ${formatNumber(lot.currentCount)} poules • Âge : ${lot.currentAgeWeeks} semaines`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Sub Navigation */}
        <div className="flex border-b border-[#E5E5DE] pb-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sale')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'sale'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'bg-[#F5F5F0] text-[#434333] hover:bg-[#E2E2D6]'
            }`}
          >
            <Bird className="w-3.5 h-3.5" />
            <span>Vente de Poules de Réforme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('closure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'closure'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'bg-[#F5F5F0] text-[#434333] hover:bg-[#E2E2D6]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Clôturer le Lot (Bilan Final)</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {activeTab === 'sale' ? (
          /* REFORM SALE FORM */
          <form onSubmit={handleSaleSubmit} className="space-y-4">
            {/* Live Stock Summary */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wide block">Disponibilité dans ce lot :</span>
                <strong className="text-sm font-serif">{formatNumber(lot.currentCount)} poules disponibles à la vente</strong>
              </div>
              <button
                type="button"
                onClick={() => handleQuantityChange(lot.currentCount)}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-bold transition-all"
              >
                Vendre la totalité ({lot.currentCount})
              </button>
            </div>

            {/* Client selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Sélectionner le Client / Acheteur *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#434333] font-semibold mb-1">Date de la Vente *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Nombre de Poules à Vendre *</label>
                <input
                  type="number"
                  min="1"
                  max={lot.currentCount}
                  required
                  value={quantity}
                  onChange={(e) => handleQuantityChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
                <span className="text-[10px] text-[#8A8A6F]">Max: {lot.currentCount} têtes</span>
              </div>

              <div>
                <label className="block text-[#434333] font-semibold mb-1">Prix Unitaire / Poule ({currency}) *</label>
                <input
                  type="number"
                  min="500"
                  step="50"
                  required
                  value={unitPrice}
                  onChange={(e) => handleUnitPriceChange(Number(e.target.value))}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
                <span className="text-[10px] text-[#8A8A6F]">Moyenne marché: 2 000 - 3 000 {currency}</span>
              </div>

              <div>
                <label className="block text-[#434333] font-semibold mb-1">Montant Total Brut</label>
                <div className="w-full bg-[#F5F5F0] border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-serif font-bold text-emerald-800">
                  {formatMoney(totalAmount, currency)}
                </div>
              </div>
            </div>

            {/* Payment terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Mode de Paiement *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  <option value="Espèces">Espèces (Caisse)</option>
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="MTN MoMo">MTN MoMo</option>
                  <option value="Moov Money">Moov Money</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>

              <div>
                <label className="block text-[#434333] font-semibold mb-1">Montant Encaissé Immédiatement ({currency})</label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Number(e.target.value))}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
                <div className="flex justify-between text-[10px] mt-0.5">
                  <button
                    type="button"
                    onClick={() => setAmountPaid(totalAmount)}
                    className="text-[#5A5A40] underline font-bold"
                  >
                    Payé en totalité (Comptant)
                  </button>
                  {totalAmount - amountPaid > 0 && (
                    <span className="text-rose-600 font-bold">
                      Reste à crédit : {formatMoney(totalAmount - amountPaid, currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#434333] font-semibold mb-1">Remarques / Référence bon d'enlèvement</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="ex: Camionnette acheteur immatriculée ..."
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={lot.currentCount === 0}
                className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Bird className="w-3.5 h-3.5" />
                <span>Enregistrer la Vente & Déduire l'Effectif</span>
              </button>
            </div>
          </form>
        ) : (
          /* LOT CLOSURE & REFORM SUMMARY */
          <form onSubmit={handleClosureSubmit} className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-[#E5E5DE]">
                <span className="font-bold text-[#434333]">Bilan d'exploitation de la bande :</span>
                <span className="font-mono text-xs text-[#5A5A40] font-bold">{lot.code} - {lot.name}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8A8A6F] block">Poussins / Poulettes</span>
                  <strong className="text-sm font-serif text-[#2D2D2D]">{formatNumber(lot.initialCount)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8A8A6F] block">Pertes Mortalité</span>
                  <strong className="text-sm font-serif text-rose-700">{formatNumber(lot.deadCount)} ({((lot.deadCount / lot.initialCount) * 100).toFixed(1)}%)</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8A8A6F] block">Poules Réformées</span>
                  <strong className="text-sm font-serif text-sky-700">{formatNumber(lot.soldCount)}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8A8A6F] block">Restantes au poulailler</span>
                  <strong className="text-sm font-serif text-emerald-800">{formatNumber(lot.currentCount)}</strong>
                </div>
              </div>

              {lot.currentCount > 0 && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Attention : Il reste encore <strong>{lot.currentCount} poules vivantes</strong> dans ce lot. Vous pouvez soit les vendre d'abord dans l'onglet Vente de Réforme, soit clôturer le lot définitivement.
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[#434333] font-semibold mb-1">Rapport & Motif de Clôture / Réforme *</label>
              <textarea
                rows={3}
                required
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="ex: Bilan de fin de ponte à 72 semaines. Bâtiment vidé pour vide sanitaire et désinfection."
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white font-medium shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmer la Clôture & Archiver le Lot</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
