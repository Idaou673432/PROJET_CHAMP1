import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Filter,
  DollarSign,
  Trash2,
  PieChart as PieChartIcon,
  TrendingDown,
  Calendar,
  Layers,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { Modal } from '../components/common/Modal';
import { formatMoney, formatDate, getTodayDateString } from '../utils/formatters';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Aliments',
  'Soins vétérinaires & Vaccins',
  'Électricité & Eau',
  'Transport',
  'Salaires & Main d’œuvre',
  'Emballages / Alvéoles',
  'Entretien & Matériel',
  'Autre',
];

export const ExpensesView: React.FC<{ isOpenNewDefault?: boolean; onCloseNew?: () => void }> = ({
  isOpenNewDefault = false,
  onCloseNew,
}) => {
  const { expenses, settings, currentUser, addExpense, deleteExpense } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(isOpenNewDefault);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Form states
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Aliments');
  const [formAmount, setFormAmount] = useState<number>(25000);
  const [formBeneficiary, setFormBeneficiary] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('Espèces');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenModal = () => {
    setFormDate(getTodayDateString());
    setFormCategory('Aliments');
    setFormAmount(25000);
    setFormBeneficiary('');
    setFormPaymentMethod('Espèces');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseNew) onCloseNew();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      date: formDate,
      category: formCategory,
      amount: formAmount,
      beneficiary: formBeneficiary,
      paymentMethod: formPaymentMethod,
      recordedBy: currentUser.name,
      notes: formNotes,
    });
    handleCloseModal();
  };

  // Filtered
  const filteredExpenses = expenses.filter((exp) => {
    return selectedCategoryFilter === 'ALL' || exp.category === selectedCategoryFilter;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for analysis
  const categoryTotals: Record<string, number> = {};
  EXPENSE_CATEGORIES.forEach((cat) => {
    categoryTotals[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Gestion des Dépenses & Charges
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Suivi ventilé de tous les coûts d’exploitation, factures et salaires
          </p>
        </div>

        <button
          type="button"
          id="btn-add-expense"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer une Dépense</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block">
            Total Dépenses Enregistrées
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-800">
            {formatMoney(totalExpenseAmount, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">{expenses.length} opérations</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block">
            Dépenses Aliments (Principal)
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A5A40]">
            {formatMoney(categoryTotals['Aliments'] || 0, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            {totalExpenseAmount > 0 ? (((categoryTotals['Aliments'] || 0) / totalExpenseAmount) * 100).toFixed(1) : 0}% du total
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#434333] uppercase tracking-widest block">
            Soins Vétérinaires & Autres
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2D2D]">
            {formatMoney(
              (categoryTotals['Soins vétérinaires & Vaccins'] || 0) +
                (categoryTotals['Salaires & Main d’œuvre'] || 0),
              settings.currency
            )}
          </div>
          <span className="text-xs text-[#8A8A6F] block">Santé + Main d’œuvre</span>
        </div>
      </div>

      {/* Category Breakdown Badges Grid */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-[#434333] uppercase tracking-wider">
          Répartition par Catégorie de Charge
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXPENSE_CATEGORIES.map((cat) => {
            const sum = categoryTotals[cat] || 0;
            const pct = totalExpenseAmount > 0 ? ((sum / totalExpenseAmount) * 100).toFixed(1) : '0';
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat ? 'ALL' : cat)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#E2E2D6] border-[#5A5A40] text-[#2D2D2D]'
                    : 'bg-[#F5F5F0] border-[#D1D1C4] hover:border-[#5A5A40]'
                }`}
              >
                <div className="text-[11px] font-medium text-[#434333] truncate">{cat}</div>
                <div className="text-sm font-bold text-[#2D2D2D] font-serif mt-1">
                  {formatMoney(sum, settings.currency)}
                </div>
                <div className="text-[10px] text-[#8A8A6F]">{pct}% des charges</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Table */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8A8A6F]" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-[#F5F5F0] border border-[#D1D1C4] text-[#434333] text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="ALL">Toutes les catégories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A6F] bg-[#F5F5F0]">
              <tr>
                <th className="p-3 rounded-l-xl">Date</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Bénéficiaire / Fournisseur</th>
                <th className="p-3">Montant</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Détails / Motif</th>
                <th className="p-3">Enregistré par</th>
                <th className="p-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#F5F5F0]/60 transition-colors">
                  <td className="p-3 font-semibold text-[#2D2D2D] font-mono">{formatDate(exp.date)}</td>
                  <td className="p-3 font-medium text-[#434333]">
                    <span className="px-2 py-0.5 rounded-lg bg-[#E2E2D6] border border-[#D1D1C4] text-[10px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3 text-[#2D2D2D]">{exp.beneficiary || '-'}</td>
                  <td className="p-3 font-bold text-rose-800 font-mono text-sm">
                    {formatMoney(exp.amount, settings.currency)}
                  </td>
                  <td className="p-3 text-[#8A8A6F]">{exp.paymentMethod}</td>
                  <td className="p-3 text-[#434333]">{exp.notes}</td>
                  <td className="p-3 text-[#8A8A6F]">{exp.recordedBy}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer la dépense de ${formatMoney(exp.amount, settings.currency)} ?`)) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 text-[#8A8A6F] hover:text-rose-600 rounded-xl hover:bg-rose-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Enregistrer une Dépense"
        subtitle="Débit automatique de la caisse ou création de dette"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-[#434333] font-semibold mb-1">Catégorie *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Montant ({settings.currency}) *</label>
              <input
                type="number"
                min="1"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-rose-800 text-sm font-bold font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Mode de Règlement *</label>
              <select
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Espèces">Espèces (Caisse)</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Virement">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Crédit">À Crédit (Dette)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Bénéficiaire / Fournisseur</label>
            <input
              type="text"
              value={formBeneficiary}
              onChange={(e) => setFormBeneficiary(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Dr Vétérinaire Kouassi, CIE, Ouvrier agricole..."
            />
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Motif / Description précise</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Achat de vitamines de ponte, désinfectant litière, etc."
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
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium shadow-xs"
            >
              Valider la Dépense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
