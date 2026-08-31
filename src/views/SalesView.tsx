import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Printer,
  Trash2,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Building,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Sale, PaymentMethod, ProductSaleType } from '../types';
import { Modal } from '../components/common/Modal';
import { InvoiceReceiptModal } from '../components/sales/InvoiceReceiptModal';
import { formatMoney, formatNumber, formatDate, getTodayDateString } from '../utils/formatters';

export const SalesView: React.FC<{ isOpenNewDefault?: boolean; onCloseNew?: () => void }> = ({
  isOpenNewDefault = false,
  onCloseNew,
}) => {
  const {
    sales,
    clients,
    lots,
    totalEggStock,
    totalEggStockTrays,
    settings,
    currentUser,
    addSale,
    deleteSale,
    addClient,
  } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(isOpenNewDefault);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form states
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientType, setNewClientType] = useState<any>('Particulier');

  const [formProductType, setFormProductType] = useState<ProductSaleType>('Plateaux');
  const [formQuantity, setFormQuantity] = useState<number>(10);
  const [formUnit, setFormUnit] = useState<'plateau' | 'œuf' | 'sujet' | 'sac'>('plateau');
  const [formUnitPrice, setFormUnitPrice] = useState<number>(2200);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [formAmountPaid, setFormAmountPaid] = useState<number>(22000);
  const [formLotId, setFormLotId] = useState<string>(lots[0]?.id || '');
  const [formNotes, setFormNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eggsPerTray = settings.eggsPerTray || 30;

  // Auto total
  const formTotalAmount = formQuantity * formUnitPrice;
  const formRemainingDue = Math.max(0, formTotalAmount - formAmountPaid);

  // Quick auto price adjustment based on product
  const handleProductChange = (prod: ProductSaleType) => {
    setFormProductType(prod);
    if (prod === 'Plateaux') {
      setFormUnit('plateau');
      setFormUnitPrice(2200);
      setFormAmountPaid(formQuantity * 2200);
    } else if (prod === 'Œufs (Unité)') {
      setFormUnit('œuf');
      setFormUnitPrice(80);
      setFormAmountPaid(formQuantity * 80);
    } else if (prod === 'Poules réformées') {
      setFormUnit('sujet');
      setFormUnitPrice(3500);
      setFormAmountPaid(formQuantity * 3500);
    } else if (prod === 'Fientes / Engrais') {
      setFormUnit('sac');
      setFormUnitPrice(1500);
      setFormAmountPaid(formQuantity * 1500);
    }
  };

  const handleOpenModal = () => {
    setFormDate(getTodayDateString());
    setFormClientId(clients[0]?.id || '');
    setIsNewClientMode(false);
    setFormProductType('Plateaux');
    setFormQuantity(10);
    setFormUnit('plateau');
    setFormUnitPrice(2200);
    setFormPaymentMethod('Espèces');
    setFormAmountPaid(22000);
    setFormNotes('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseNew) onCloseNew();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let finalClientId = formClientId;
    let finalClientName = '';
    let finalClientPhone = '';

    if (isNewClientMode) {
      if (!newClientName.trim()) {
        setErrorMessage('Veuillez saisir le nom du nouveau client');
        return;
      }
      const newId = `cli-${Date.now()}`;
      addClient({
        name: newClientName,
        phone: newClientPhone,
        address: newClientAddress,
        type: newClientType,
        notes: 'Client créé lors d’une vente',
      });
      finalClientId = newId;
      finalClientName = newClientName;
      finalClientPhone = newClientPhone;
    } else {
      const existingClient = clients.find((c) => c.id === formClientId);
      finalClientName = existingClient?.name || 'Client comptoir';
      finalClientPhone = existingClient?.phone || '';
    }

    const result = addSale({
      date: formDate,
      clientId: finalClientId,
      clientName: finalClientName,
      clientPhone: finalClientPhone,
      productType: formProductType,
      quantity: formQuantity,
      unit: formUnit,
      unitPrice: formUnitPrice,
      paymentMethod: formPaymentMethod,
      amountPaid: formAmountPaid,
      sellerName: currentUser.name,
      lotId: formProductType === 'Poules réformées' ? formLotId : undefined,
      notes: formNotes,
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Erreur lors de la vente');
      return;
    }

    handleCloseModal();
    if (result.sale) {
      setSelectedSaleForInvoice(result.sale);
    }
  };

  // Filtered sales
  const filteredSales = sales.filter((s) => {
    const matchStatus = statusFilter === 'ALL' || s.paymentStatus === statusFilter;
    const matchSearch =
      !searchTerm ||
      s.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.date.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalReceivedCash = sales.reduce((sum, s) => sum + s.amountPaid, 0);
  const totalUnpaidCredit = sales.reduce((sum, s) => sum + s.remainingDue, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Ventes & Facturation
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Facturation des œufs et dérivés, encaissements et gestion des crédits clients
          </p>
        </div>

        <button
          type="button"
          id="btn-add-sale"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Vente</span>
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#8A8A6F] uppercase tracking-widest block">
            Chiffre d’Affaires Total
          </span>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D]">
            {formatMoney(totalSalesRevenue, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">{sales.length} factures générées</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Total Encaissé
          </span>
          <div className="text-2xl font-serif font-bold text-emerald-800">
            {formatMoney(totalReceivedCash, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            {totalSalesRevenue > 0 ? ((totalReceivedCash / totalSalesRevenue) * 100).toFixed(1) : 0}% de recouvrement
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">
            Créances / Reste à Recouvrer
          </span>
          <div className="text-2xl font-serif font-bold text-rose-700">
            {formatMoney(totalUnpaidCredit, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">À percevoir auprès des clients</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#8A8A6F]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F5F5F0] border border-[#D1D1C4] text-[#2D2D2D] text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="Payé">Payé à 100%</option>
              <option value="Partiel">Paiement Partiel</option>
              <option value="Impayé">Non Payé (Crédit)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8A8A6F] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="N° facture, nom du client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#D1D1C4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D2D] placeholder-[#8A8A6F] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E5E5DE]">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#F5F5F0] border-b border-[#E5E5DE]">
              <tr>
                <th className="p-3">N° Vente</th>
                <th className="p-3">Date</th>
                <th className="p-3">Client</th>
                <th className="p-3">Produit & Qté</th>
                <th className="p-3">Prix Unit.</th>
                <th className="p-3">Total Vente</th>
                <th className="p-3">Payé</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Mode</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-[#F9F9F6] transition-colors">
                  <td className="p-3 font-bold text-[#5A5A40] font-mono">{sale.saleNumber}</td>
                  <td className="p-3 text-[#8A8A6F] font-mono">{formatDate(sale.date)}</td>
                  <td className="p-3 font-semibold text-[#2D2D2D]">
                    <div>{sale.clientName}</div>
                    {sale.clientPhone && (
                      <span className="text-[10px] text-[#8A8A6F] font-mono">{sale.clientPhone}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-[#2D2D2D] font-mono">{sale.quantity}</span>{' '}
                    <span className="text-[#8A8A6F]">{sale.unit}(s)</span>
                  </td>
                  <td className="p-3 text-[#2D2D2D] font-mono">
                    {formatMoney(sale.unitPrice, settings.currency)}
                  </td>
                  <td className="p-3 font-serif font-bold text-[#2D2D2D]">
                    {formatMoney(sale.totalAmount, settings.currency)}
                  </td>
                  <td className="p-3 font-bold text-emerald-800 font-mono">
                    {formatMoney(sale.amountPaid, settings.currency)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sale.paymentStatus === 'Payé'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : sale.paymentStatus === 'Partiel'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-[#8A8A6F] text-[11px]">{sale.paymentMethod}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSaleForInvoice(sale)}
                        className="p-1.5 rounded-xl text-[#8A8A6F] hover:text-[#5A5A40] hover:bg-[#E2E2D6]"
                        title="Imprimer / Voir Facture"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Annuler la vente ${sale.saleNumber} et restituer les œufs en stock ?`)) {
                            deleteSale(sale.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-[#8A8A6F] hover:text-rose-600 hover:bg-rose-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Enregistrer une Nouvelle Vente"
        subtitle={`Stock actuel : ${totalEggStockTrays} plateaux (${totalEggStock} œufs)`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date de Vente *</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#434333] font-semibold">Client *</label>
                <button
                  type="button"
                  onClick={() => setIsNewClientMode(!isNewClientMode)}
                  className="text-[10px] text-[#5A5A40] font-bold hover:underline"
                >
                  {isNewClientMode ? 'Choisir existant' : '+ Nouveau client'}
                </button>
              </div>

              {!isNewClientMode ? (
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.type}) {c.debt > 0 ? `[Dette: ${formatMoney(c.debt, settings.currency)}]` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Nom complet ou Boutique..."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      placeholder="Téléphone..."
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-1.5 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    />
                    <select
                      value={newClientType}
                      onChange={(e) => setNewClientType(e.target.value)}
                      className="w-full bg-white border border-[#D1D1C4] rounded-xl px-2 py-1.5 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    >
                      <option value="Particulier">Particulier</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Boutique">Boutique</option>
                      <option value="Grossiste">Grossiste</option>
                      <option value="Revendeur">Revendeur</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product type tabs */}
          <div>
            <label className="block text-[#434333] font-semibold mb-1">Produit Vendu *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Plateaux', 'Œufs (Unité)', 'Poules réformées', 'Fientes / Engrais'] as ProductSaleType[]).map(
                (prod) => (
                  <button
                    key={prod}
                    type="button"
                    onClick={() => handleProductChange(prod)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-medium border transition-colors ${
                      formProductType === prod
                        ? 'bg-[#5A5A40] text-white border-[#434333] shadow-xs'
                        : 'bg-[#F5F5F0] text-[#434333] border-[#D1D1C4] hover:bg-[#E2E2D6]'
                    }`}
                  >
                    {prod}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Quantité ({formUnit}s) *</label>
              <input
                type="number"
                min="1"
                required
                value={formQuantity}
                onChange={(e) => {
                  const q = Number(e.target.value);
                  setFormQuantity(q);
                  setFormAmountPaid(q * formUnitPrice);
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Prix Unitaire ({settings.currency}) *</label>
              <input
                type="number"
                min="1"
                required
                value={formUnitPrice}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setFormUnitPrice(p);
                  setFormAmountPaid(formQuantity * p);
                }}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Mode de Paiement *</label>
              <select
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Espèces">Espèces</option>
                <option value="Mobile Money">Mobile Money (Wave/OM)</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Crédit">À Crédit (0 payé)</option>
              </select>
            </div>
          </div>

          {/* Amount Paid & Remaining Calculation */}
          <div className="p-4 rounded-2xl bg-[#E2E2D6] border border-[#D1D1C4] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#434333]">
              <span>Montant Total de la Vente :</span>
              <span className="text-base text-[#5A5A40] font-serif font-bold">
                {formatMoney(formTotalAmount, settings.currency)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#D1D1C4]">
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Montant Payé ce jour</label>
                <input
                  type="number"
                  min="0"
                  max={formTotalAmount}
                  value={formAmountPaid}
                  onChange={(e) => setFormAmountPaid(Number(e.target.value))}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-1.5 text-emerald-800 text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-[#8A8A6F] font-semibold mb-1">Reste à Payer (Dette)</span>
                <div className="px-3 py-1.5 rounded-xl bg-white border border-[#D1D1C4] text-rose-700 font-mono font-bold text-xs">
                  {formatMoney(formRemainingDue, settings.currency)}
                </div>
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
              placeholder="Livraison spéciale, remise accordée, etc."
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] text-xs font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white text-xs font-medium shadow-xs"
            >
              Valider la Vente & Déduire le Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice / Printable Receipt Modal */}
      {selectedSaleForInvoice && (
        <InvoiceReceiptModal
          sale={selectedSaleForInvoice}
          settings={settings}
          onClose={() => setSelectedSaleForInvoice(null)}
        />
      )}
    </div>
  );
};
