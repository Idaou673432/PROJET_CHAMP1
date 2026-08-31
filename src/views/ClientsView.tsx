import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  DollarSign,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BellRing,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Client, ClientType, PaymentMethod } from '../types';
import { Modal } from '../components/common/Modal';
import { WeeklyDebtReminderModal } from '../components/clients/WeeklyDebtReminderModal';
import { formatMoney, formatDate, getTodayDateString } from '../utils/formatters';

export const ClientsView: React.FC = () => {
  const {
    clients,
    sales,
    settings,
    currentUser,
    clientsNeedingWeeklyReminder,
    addClient,
    updateClient,
    deleteClient,
    addCashMovement,
  } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedReminderClientId, setSelectedReminderClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [repayingClient, setRepayingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Client form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formType, setFormType] = useState<ClientType>('Boutique');
  const [formNotes, setFormNotes] = useState('');

  // Repayment form states
  const [repayAmount, setRepayAmount] = useState<number>(10000);
  const [repayMethod, setRepayMethod] = useState<PaymentMethod>('Espèces');
  const [repayDate, setRepayDate] = useState(getTodayDateString());

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormType('Boutique');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient(client);
    setFormName(client.name);
    setFormPhone(client.phone || '');
    setFormAddress(client.address || '');
    setFormType(client.type);
    setFormNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient(editingClient.id, {
        name: formName,
        phone: formPhone,
        address: formAddress,
        type: formType,
        notes: formNotes,
      });
    } else {
      addClient({
        name: formName,
        phone: formPhone,
        address: formAddress,
        type: formType,
        debt: 0,
        totalPurchases: 0,
        notes: formNotes,
      });
    }
    setIsModalOpen(false);
  };

  const handleRepaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingClient) return;

    const actualRepayment = Math.min(repayAmount, repayClientDebt(repayingClient.debt));
    const newDebt = Math.max(0, repayingClient.debt - repayAmount);

    updateClient(repayingClient.id, {
      debt: newDebt,
    });

    // Record inflow in cash journal
    addCashMovement({
      date: repayDate,
      type: 'ENTREE',
      category: 'Règlement Créance Client',
      amount: repayAmount,
      paymentMethod: repayMethod,
      description: `Règlement de dette par le client ${repayingClient.name}`,
      recordedBy: currentUser.name,
    });

    setRepayingClient(null);
  };

  const repayClientDebt = (debt: number) => debt;

  // Filtered clients
  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm)) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalClientsDebt = clients.reduce((sum, c) => sum + c.debt, 0);
  const totalClientsPurchases = clients.reduce((sum, c) => sum + c.totalPurchases, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Répertoire Clients & Suivi des Dettes
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Fichier clientèle, historique des achats et encaissement des créances avec relance hebdomadaire
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setSelectedReminderClientId(null);
              setIsReminderModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95 relative"
          >
            <BellRing className="w-4 h-4" />
            <span>Relances Hebdomadaires</span>
            {clientsNeedingWeeklyReminder.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white text-amber-800 text-[10px] font-extrabold font-mono shadow-xs">
                {clientsNeedingWeeklyReminder.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="btn-add-client"
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Client</span>
          </button>
        </div>
      </div>

      {/* Weekly Reminder Notice Banner */}
      {clientsNeedingWeeklyReminder.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm font-serif">
                Relance Hebdomadaire des Créances Due ({clientsNeedingWeeklyReminder.length} client{clientsNeedingWeeklyReminder.length > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-amber-800">
                Certains clients ont des créances impayées depuis 1 semaine ou plus. Envoyez-leur un message WhatsApp/SMS courtois pour réclamer le règlement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedReminderClientId(null);
              setIsReminderModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shrink-0 shadow-xs active:scale-95"
          >
            Ouvrir l'Assistant de Relance
          </button>
        </div>
      )}

      {/* Debt Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
            Dettes Clients Totales
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-800 font-mono">
            {formatMoney(totalClientsDebt, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            {clients.filter((c) => c.debt > 0).length} clients débiteurs
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Cumul Ventes Facturées
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2D2D] font-mono">
            {formatMoney(totalClientsPurchases, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">Toutes commandes confondues</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider block">
            Base Clients Active
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#434333] font-mono">
            {clients.length} contacts
          </div>
          <span className="text-xs text-[#8A8A6F] block">Boutiques, restaurants & grossistes</span>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A8A6F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher client, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#D1D1C4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D2D] placeholder-[#8A8A6F] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const hasDebt = client.debt > 0;
            const clientSales = sales.filter((s) => s.clientId === client.id);

            return (
              <div
                key={client.id}
                className="p-5 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] flex flex-col justify-between space-y-4 hover:border-[#D1D1C4] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4]">
                        {client.type}
                      </span>
                      <h3 className="text-base font-bold text-[#2D2D2D] font-serif mt-1">
                        {client.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(client)}
                        className="p-1 text-[#8A8A6F] hover:text-[#2D2D2D]"
                        title="Modifier"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer le client ${client.name} ?`)) {
                            deleteClient(client.id);
                          }
                        }}
                        className="p-1 text-[#8A8A6F] hover:text-rose-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs text-[#434333]">
                      <Phone className="w-3.5 h-3.5 text-[#8A8A6F]" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                  )}

                  {client.address && (
                    <div className="flex items-center gap-2 text-xs text-[#8A8A6F]">
                      <MapPin className="w-3.5 h-3.5 text-[#8A8A6F]" />
                      <span>{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Financial status */}
                <div className="p-3 rounded-xl bg-white border border-[#E5E5DE] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8A8A6F]">Total Achats :</span>
                    <span className="font-bold text-[#2D2D2D] font-mono">
                      {formatMoney(client.totalPurchases, settings.currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E5E5DE]">
                    <span className="text-[#8A8A6F]">Dette En Cours :</span>
                    <span
                      className={`font-bold font-mono ${
                        hasDebt ? 'text-rose-800' : 'text-emerald-800'
                      }`}
                    >
                      {hasDebt ? formatMoney(client.debt, settings.currency) : '0 FCFA (À jour)'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#D1D1C4] space-y-2">
                  {hasDebt ? (
                    <>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#8A8A6F] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Dernière relance :</span>
                        </span>
                        <strong className="text-[#5A5A40] font-mono">
                          {client.lastDebtReminderDate ? formatDate(client.lastDebtReminderDate) : 'Aucun envoi'}
                        </strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReminderClientId(client.id);
                            setIsReminderModalOpen(true);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                          title="Envoyer un message de rappel par WhatsApp ou SMS"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Relancer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRepayingClient(client);
                            setRepayAmount(client.debt);
                          }}
                          className="py-2 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Encaisser</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-2 flex items-center justify-center text-[11px] text-emerald-800 gap-1.5 font-semibold bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compte soldé (0 dette)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add / Edit Client */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Modifier le Client' : 'Ajouter un Nouveau Client'}
        subtitle="Coordonnées et type d’activité commerciale"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#434333] font-semibold mb-1">Nom / Enseigne Commerciale *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Restaurant Le Palmier, Épicerie Centrale..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Type de Client *</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as ClientType)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Particulier">Particulier</option>
                <option value="Boutique">Boutique / Épicerie</option>
                <option value="Restaurant">Restaurant / Maquis</option>
                <option value="Grossiste">Grossiste</option>
                <option value="Revendeur">Revendeur ambulant</option>
              </select>
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Téléphone / WhatsApp</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="+225 07..."
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
              placeholder="Quartier, Marché, Rue..."
            />
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Notes / Conditions commerciales</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Plafond de crédit autorisé, fréquence de livraison..."
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
              {editingClient ? 'Enregistrer les Modifications' : 'Créer le Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Repayment */}
      {repayingClient && (
        <Modal
          isOpen={true}
          onClose={() => setRepayingClient(null)}
          title={`Encaisser Règlement Dette : ${repayingClient.name}`}
          subtitle={`Dette totale actuelle : ${formatMoney(repayingClient.debt, settings.currency)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRepaySubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Date d'Encaissement *</label>
                <input
                  type="date"
                  required
                  value={repayDate}
                  onChange={(e) => setRepayDate(e.target.value)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#434333] font-semibold mb-1">Mode de Règlement *</label>
                <select
                  value={repayMethod}
                  onChange={(e) => setRepayMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                >
                  <option value="Espèces">Espèces (Caisse)</option>
                  <option value="Mobile Money">Mobile Money (Wave/OM)</option>
                  <option value="Virement">Virement Bancaire</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-emerald-800 font-semibold mb-1">Montant Versé ce jour ({settings.currency}) *</label>
              <input
                type="number"
                min="1"
                max={repayingClient.debt}
                required
                value={repayAmount}
                onChange={(e) => setRepayAmount(Number(e.target.value))}
                className="w-full bg-white border border-emerald-600 rounded-xl px-3 py-2 text-emerald-800 font-mono text-base font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#D1D1C4] flex justify-between">
              <span className="text-[#8A8A6F]">Dette restante après règlement :</span>
              <strong className="text-[#2D2D2D] font-mono">
                {formatMoney(Math.max(0, repayingClient.debt - repayAmount), settings.currency)}
              </strong>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5DE]">
              <button
                type="button"
                onClick={() => setRepayingClient(null)}
                className="px-4 py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] text-[#434333] font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
              >
                Valider l'Encaissement & Créditer la Caisse
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Weekly Debt Reminder Assistant Modal */}
      <WeeklyDebtReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        selectedClientId={selectedReminderClientId}
        onOpenRepaymentModal={(client) => {
          setIsReminderModalOpen(false);
          setRepayingClient(client);
          setRepayAmount(client.debt);
        }}
      />
    </div>
  );
};
