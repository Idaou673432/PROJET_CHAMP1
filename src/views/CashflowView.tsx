import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CreditCard,
  Building,
  Smartphone,
  Coins,
  ArrowRightLeft,
  Trash2,
  Receipt,
  FileSpreadsheet,
  PlusCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { CashMovement, PaymentMethod } from '../types';
import { Modal } from '../components/common/Modal';
import { formatMoney, formatDate, getTodayDateString } from '../utils/formatters';

export const CashflowView: React.FC = () => {
  const {
    cashMovementsWithBalance,
    totalCashIn,
    totalCashOut,
    netCashBalance,
    cashInHand,
    mobileMoneyBalance,
    bankBalance,
    settings,
    currentUser,
    addCashMovement,
    deleteCashMovement,
    addCashTransfer,
  } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for manual cash movement
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formType, setFormType] = useState<'ENTREE' | 'SORTIE'>('ENTREE');
  const [formCategory, setFormCategory] = useState('Apport personnel / Trésorerie');
  const [formAmount, setFormAmount] = useState<number>(50000);
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [formSource, setFormSource] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Form states for inter-account transfer
  const [trfDate, setTrfDate] = useState(getTodayDateString());
  const [trfFrom, setTrfFrom] = useState<PaymentMethod>('Mobile Money');
  const [trfTo, setTrfTo] = useState<PaymentMethod>('Espèces');
  const [trfAmount, setTrfAmount] = useState<number>(25000);
  const [trfDescription, setTrfDescription] = useState('Retrait Mobile Money vers Caisse Espèces');

  const handleOpenModal = (type: 'ENTREE' | 'SORTIE') => {
    setFormDate(getTodayDateString());
    setFormType(type);
    setFormCategory(type === 'ENTREE' ? 'Apport personnel / Trésorerie' : 'Dépense diverse directe');
    setFormAmount(50000);
    setFormPaymentMethod('Espèces');
    setFormSource('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleSubmitMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) return;
    addCashMovement({
      date: formDate,
      type: formType,
      category: formCategory,
      amount: formAmount,
      paymentMethod: formPaymentMethod,
      sourceOrBeneficiary: formSource || undefined,
      description:
        formDescription ||
        (formType === 'ENTREE' ? 'Entrée de trésorerie directe' : 'Sortie de trésorerie directe'),
      recordedBy: currentUser.name,
    });
    setIsModalOpen(false);
  };

  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (trfAmount <= 0 || trfFrom === trfTo) return;
    addCashTransfer({
      date: trfDate,
      fromMethod: trfFrom,
      toMethod: trfTo,
      amount: trfAmount,
      description: trfDescription,
    });
    setIsTransferModalOpen(false);
  };

  // Filtered movements with running balance
  const filteredMovements = useMemo(() => {
    return cashMovementsWithBalance.filter((mov) => {
      const matchType = selectedTypeFilter === 'ALL' || mov.type === selectedTypeFilter;
      const matchMethod =
        selectedMethodFilter === 'ALL' ||
        (selectedMethodFilter === 'Virement_Cheque'
          ? mov.paymentMethod === 'Virement' || mov.paymentMethod === 'Chèque'
          : mov.paymentMethod === selectedMethodFilter);
      const matchSearch =
        !searchQuery ||
        mov.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mov.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mov.sourceOrBeneficiary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mov.recordedBy || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchType && matchMethod && matchSearch;
    });
  }, [cashMovementsWithBalance, selectedTypeFilter, selectedMethodFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333] flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-[#5A5A40]" />
            <span>Caisse & Trésorerie Intégrée</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Synchronisation en temps réel avec les Ventes, Achats Aliments, Dépenses et Règlements de dettes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F5F5F0] text-[#434333] border border-[#D1D1C4] font-semibold text-xs sm:text-sm transition-all shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#5A5A40]" />
            <span>Transfert Inter-comptes</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal('SORTIE')}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold text-xs sm:text-sm transition-all shadow-xs"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-700" />
            <span>- Sortie Directe</span>
          </button>
          <button
            type="button"
            id="btn-add-cash"
            onClick={() => handleOpenModal('ENTREE')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span>+ Entrée Directe</span>
          </button>
        </div>
      </div>

      {/* Global Cash Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Solde Net */}
        <div className="p-5 rounded-3xl bg-emerald-50/90 border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Solde Net Trésorerie
            </span>
            <Wallet className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 font-mono">
            {formatMoney(netCashBalance, settings.currency)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium pt-1 border-t border-emerald-200/60">
            <span>+{formatMoney(totalCashIn, settings.currency)}</span>
            <span>-{formatMoney(totalCashOut, settings.currency)}</span>
          </div>
        </div>

        {/* Caisse Physique Espèces */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A8A6F] uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#8A8A6F]" />
              <span>Caisse Espèces</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F5F0] text-[#434333]">
              Physique
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D] font-mono">
            {formatMoney(cashInHand, settings.currency)}
          </div>
          <p className="text-[11px] text-[#8A8A6F]">Billets et pièces dans le coffre</p>
        </div>

        {/* Mobile Money (Wave / Orange Money) */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A8A6F] uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#8A8A6F]" />
              <span>Mobile Money</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Wave / OM
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D] font-mono">
            {formatMoney(mobileMoneyBalance, settings.currency)}
          </div>
          <p className="text-[11px] text-[#8A8A6F]">Comptes marchands & transferts</p>
        </div>

        {/* Banques & Virements */}
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A8A6F] uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#8A8A6F]" />
              <span>Banque & Chèques</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              Compte Pro
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D2D] font-mono">
            {formatMoney(bankBalance, settings.currency)}
          </div>
          <p className="text-[11px] text-[#8A8A6F]">Solde sur comptes bancaires</p>
        </div>
      </div>

      {/* Cash Movements Ledger */}
      <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#434333] font-serif flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#5A5A40]" />
              <span>Livre Journal des Flux de Caisse</span>
            </h3>
            <p className="text-xs text-[#8A8A6F]">
              Historique complet avec calcul automatique du solde disponible après chaque transaction
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F5F5F0] border border-[#D1D1C4] text-[#434333] text-xs rounded-xl px-3 py-1.5 font-medium placeholder-[#8A8A6F] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none w-36 sm:w-44"
            />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-white border border-[#D1D1C4] text-[#434333] text-xs rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="ALL">Tous les types</option>
              <option value="ENTREE">Entrées (+)</option>
              <option value="SORTIE">Sorties (-)</option>
            </select>
            <select
              value={selectedMethodFilter}
              onChange={(e) => setSelectedMethodFilter(e.target.value)}
              className="bg-white border border-[#D1D1C4] text-[#434333] text-xs rounded-xl px-3 py-1.5 font-medium focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="ALL">Tous les moyens</option>
              <option value="Espèces">Espèces</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Virement_Cheque">Banque / Chèque</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#434333] bg-[#F5F5F0]">
              <tr>
                <th className="p-3 rounded-l-xl">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Motif & Source / Tiers</th>
                <th className="p-3">Moyen</th>
                <th className="p-3 text-right">Montant Flux</th>
                <th className="p-3 text-right">Solde Caisse Après</th>
                <th className="p-3">Auteur</th>
                <th className="p-3 text-center rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#8A8A6F]">
                    Aucun mouvement de trésorerie trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-[#F5F5F0]/60 transition-colors">
                    <td className="p-3 font-semibold text-[#2D2D2D] font-mono whitespace-nowrap">
                      {formatDate(mov.date)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          mov.type === 'ENTREE'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {mov.type === 'ENTREE' ? (
                          <>
                            <TrendingUp className="w-3 h-3 text-emerald-700" />
                            <span>Entrée</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 text-rose-700" />
                            <span>Sortie</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-[#434333]">
                      <div className="font-semibold text-[#2D2D2D] flex items-center gap-1.5">
                        <span>{mov.category}</span>
                        {mov.sourceOrBeneficiary && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5E5DE] text-[#434333]">
                            {mov.sourceOrBeneficiary}
                          </span>
                        )}
                      </div>
                      {mov.description && (
                        <div className="text-[10px] text-[#8A8A6F] line-clamp-1">{mov.description}</div>
                      )}
                    </td>
                    <td className="p-3 text-[#434333] whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[11px] font-medium border border-[#E5E5DE]">
                        {mov.paymentMethod}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-extrabold font-mono text-sm text-right whitespace-nowrap ${
                        mov.type === 'ENTREE' ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {mov.type === 'ENTREE' ? '+' : '-'}
                      {formatMoney(mov.amount, settings.currency)}
                    </td>
                    <td className="p-3 font-bold text-[#2D2D2D] font-mono text-right whitespace-nowrap bg-[#F5F5F0]/60">
                      {formatMoney(mov.balanceAfter, settings.currency)}
                    </td>
                    <td className="p-3 text-[#8A8A6F] whitespace-nowrap text-[11px]">{mov.recordedBy}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Voulez-vous supprimer ce mouvement de trésorerie ?')) {
                            deleteCashMovement(mov.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-[#8A8A6F] hover:text-rose-700 hover:bg-rose-50 transition-colors"
                        title="Supprimer le mouvement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Cash Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={formType === 'ENTREE' ? 'Enregistrer une Entrée Directe de Caisse' : 'Enregistrer une Sortie Directe de Caisse'}
        subtitle="Mouvement direct de trésorerie"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitMovement} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date *</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Compte / Moyen *</label>
              <select
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Espèces">Espèces (Caisse physique)</option>
                <option value="Mobile Money">Mobile Money (Wave / OM)</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Montant ({settings.currency}) *</label>
            <input
              type="number"
              min="1"
              required
              value={formAmount}
              onChange={(e) => setFormAmount(Number(e.target.value))}
              className={`w-full bg-white border rounded-xl px-3 py-2 font-mono text-base font-bold focus:outline-none ${
                formType === 'ENTREE'
                  ? 'border-emerald-600 text-emerald-800 focus:ring-2 focus:ring-emerald-500'
                  : 'border-rose-600 text-rose-800 focus:ring-2 focus:ring-rose-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Catégorie / Motif *</label>
              <input
                type="text"
                required
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder={formType === 'ENTREE' ? 'Apport gérant, Subvention...' : 'Frais de transport, Petit matériel...'}
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Tiers / Bénéficiaire</label>
              <input
                type="text"
                value={formSource}
                onChange={(e) => setFormSource(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="Nom de la personne ou structure"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Description / Justification</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Détails de l’opération"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-medium shadow-xs ${
                formType === 'ENTREE'
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-rose-700 hover:bg-rose-800'
              }`}
            >
              Enregistrer le Mouvement
            </button>
          </div>
        </form>
      </Modal>

      {/* Inter-Account Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Virement Inter-comptes de Trésorerie"
        subtitle="Déplacer des fonds entre caisse physique, mobile money et banque"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitTransfer} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#434333] font-semibold mb-1">Date du virement *</label>
            <input
              type="date"
              required
              value={trfDate}
              onChange={(e) => setTrfDate(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Compte Source (Débit -) *</label>
              <select
                value={trfFrom}
                onChange={(e) => setTrfFrom(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Mobile Money">Mobile Money (Wave / OM)</option>
                <option value="Espèces">Espèces (Caisse)</option>
                <option value="Virement">Compte Bancaire</option>
              </select>
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Compte Cible (Crédit +) *</label>
              <select
                value={trfTo}
                onChange={(e) => setTrfTo(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Espèces">Espèces (Caisse)</option>
                <option value="Mobile Money">Mobile Money (Wave / OM)</option>
                <option value="Virement">Compte Bancaire</option>
              </select>
            </div>
          </div>

          {trfFrom === trfTo && (
            <p className="text-xs text-rose-600 font-medium">
              Veuillez sélectionner deux comptes distincts pour le virement.
            </p>
          )}

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Montant à transférer ({settings.currency}) *</label>
            <input
              type="number"
              min="1"
              required
              value={trfAmount}
              onChange={(e) => setTrfAmount(Number(e.target.value))}
              className="w-full bg-white border border-[#5A5A40] rounded-xl px-3 py-2 font-mono text-base font-bold text-[#434333] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Motif / Libellé</label>
            <input
              type="text"
              value={trfDescription}
              onChange={(e) => setTrfDescription(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Retrait Wave pour alimenter la caisse"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={trfFrom === trfTo}
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] disabled:opacity-50 text-white font-semibold shadow-xs"
            >
              Effectuer le Transfert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
