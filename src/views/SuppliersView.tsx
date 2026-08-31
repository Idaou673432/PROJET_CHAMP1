import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Supplier, PaymentMethod } from '../types';
import { Modal } from '../components/common/Modal';
import { formatMoney, formatDate, getTodayDateString } from '../utils/formatters';

export const SuppliersView: React.FC = () => {
  const { suppliers, settings, currentUser, addSupplier, updateSupplier, deleteSupplier, addCashMovement } =
    useFarm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [repayingSupplier, setRepayingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Supplier form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Aliments' | 'Poussins' | 'Médicaments' | 'Matériel' | 'Autre'>(
    'Aliments'
  );
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Repayment form
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Virement');
  const [payDate, setPayDate] = useState(getTodayDateString());

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormName('');
    setFormCategory('Aliments');
    setFormPhone('');
    setFormAddress('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormName(supplier.name);
    setFormCategory(supplier.category);
    setFormPhone(supplier.phone || '');
    setFormAddress(supplier.address || '');
    setFormNotes(supplier.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: formName,
        category: formCategory,
        phone: formPhone,
        address: formAddress,
        notes: formNotes,
      });
    } else {
      addSupplier({
        name: formName,
        category: formCategory,
        phone: formPhone,
        address: formAddress,
        balanceDue: 0,
        totalSupplied: 0,
        notes: formNotes,
      });
    }
    setIsModalOpen(false);
  };

  const handlePaySupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingSupplier) return;

    const newBalance = Math.max(0, repayingSupplier.balanceDue - payAmount);

    updateSupplier(repayingSupplier.id, {
      balanceDue: newBalance,
    });

    addCashMovement({
      date: payDate,
      type: 'SORTIE',
      category: 'Paiement Dette Fournisseur',
      amount: payAmount,
      paymentMethod: payMethod,
      description: `Règlement facture fournisseur ${repayingSupplier.name}`,
      recordedBy: currentUser.name,
    });

    setRepayingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Fournisseurs & Dettes d'Approvisionnement
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Meuneries, couvoirs, pharmacies vétérinaires et suivi des règlements factures
          </p>
        </div>

        <button
          type="button"
          id="btn-add-supplier"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un Fournisseur</span>
        </button>
      </div>

      {/* Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
            Dettes Fournisseurs En Cours
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-800 font-mono">
            {formatMoney(totalSupplierDebt, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">Factures d'aliments et poussins à payer</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider block">
            Fournisseurs Référencés
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#434333] font-mono">
            {suppliers.length} partenaires
          </div>
          <span className="text-xs text-[#8A8A6F] block">Aliments, poussins, santé</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Approvisionnement Sécurisé
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800 font-mono">
            100% opérationnel
          </div>
          <span className="text-xs text-[#8A8A6F] block">Chaîne logistique active</span>
        </div>
      </div>

      {/* Grid */}
      <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A8A6F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#D1D1C4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D2D] placeholder-[#8A8A6F] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => {
            const hasDebt = sup.balanceDue > 0;

            return (
              <div
                key={sup.id}
                className="p-5 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] flex flex-col justify-between space-y-4 hover:border-[#8A8A6F] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#5A5A40] border border-[#D1D1C4]">
                        {sup.category}
                      </span>
                      <h3 className="text-base font-bold text-[#434333] font-serif mt-1">
                        {sup.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(sup)}
                        className="p-1 text-[#8A8A6F] hover:text-[#434333]"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer le fournisseur ${sup.name} ?`)) {
                            deleteSupplier(sup.id);
                          }
                        }}
                        className="p-1 text-[#8A8A6F] hover:text-rose-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {sup.phone && (
                    <div className="flex items-center gap-2 text-xs text-[#434333]">
                      <Phone className="w-3.5 h-3.5 text-[#8A8A6F]" />
                      <span className="font-mono">{sup.phone}</span>
                    </div>
                  )}

                  {sup.address && (
                    <div className="flex items-center gap-2 text-xs text-[#8A8A6F]">
                      <MapPin className="w-3.5 h-3.5 text-[#8A8A6F]" />
                      <span>{sup.address}</span>
                    </div>
                  )}
                </div>

                {/* Balances */}
                <div className="p-3 rounded-xl bg-white border border-[#E5E5DE] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A6F]">Total Livraisons :</span>
                    <span className="font-bold text-[#2D2D2D] font-mono">
                      {formatMoney(sup.totalSupplied, settings.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E5E5DE]">
                    <span className="text-[#8A8A6F]">Notre Dette :</span>
                    <span
                      className={`font-extrabold font-mono ${
                        hasDebt ? 'text-rose-800' : 'text-emerald-800'
                      }`}
                    >
                      {hasDebt ? formatMoney(sup.balanceDue, settings.currency) : '0 FCFA (Soldé)'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#E5E5DE]">
                  {hasDebt ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRepayingSupplier(sup);
                        setPayAmount(sup.balanceDue);
                      }}
                      className="w-full py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Régler Dette Fournisseur</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-800 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aucune dette en attente</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add / Edit Supplier */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Modifier le Fournisseur' : 'Ajouter un Nouveau Fournisseur'}
        subtitle="Coordonnées et catégorie d'approvisionnement"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#434333] font-semibold mb-1">Raison Sociale / Nom *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Moulin Moderne d'Aliments, Couvoir de l'Ouest..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Catégorie *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Aliments">Aliments & Matières 1ères</option>
                <option value="Poussins">Poussins / Poulettes</option>
                <option value="Médicaments">Pharmacie & Vaccins</option>
                <option value="Matériel">Matériel & Équipements</option>
                <option value="Autre">Autre prestation</option>
              </select>
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Téléphone</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="+225..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Adresse / Localisation</label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
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
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium shadow-xs"
            >
              {editingSupplier ? 'Enregistrer les Modifications' : 'Créer le Fournisseur'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Pay Supplier Debt */}
      {repayingSupplier && (
        <Modal
          isOpen={true}
          onClose={() => setRepayingSupplier(null)}
          title={`Règlement Dette Fournisseur : ${repayingSupplier.name}`}
          subtitle={`Montant total dû : ${formatMoney(repayingSupplier.balanceDue, settings.currency)}`}
          maxWidth="md"
        >
          <form onSubmit={handlePaySupplierSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Date du Paiement *</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Mode de Paiement *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  <option value="Virement">Virement Bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Espèces">Espèces (Caisse)</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-rose-800 font-semibold mb-1">Montant Réglé ({settings.currency}) *</label>
              <input
                type="number"
                min="1"
                max={repayingSupplier.balanceDue}
                required
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full bg-white border border-rose-400 rounded-xl px-3 py-2 text-rose-800 font-mono text-base font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex justify-between">
              <span className="text-[#8A8A6F]">Solde restant dû au fournisseur :</span>
              <strong className="text-[#2D2D2D] font-mono">
                {formatMoney(Math.max(0, repayingSupplier.balanceDue - payAmount), settings.currency)}
              </strong>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
              <button
                type="button"
                onClick={() => setRepayingSupplier(null)}
                className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium shadow-xs"
              >
                Confirmer le Paiement & Débiter Caisse
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
