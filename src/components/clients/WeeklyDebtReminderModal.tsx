import React, { useState } from 'react';
import {
  BellRing,
  Send,
  MessageSquare,
  Phone,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { Client } from '../../types';
import { Modal } from '../common/Modal';
import { formatMoney, formatDate, getTodayDateString } from '../../utils/formatters';

interface WeeklyDebtReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRepaymentModal?: (client: Client) => void;
  selectedClientId?: string | null;
}

export const WeeklyDebtReminderModal: React.FC<WeeklyDebtReminderModalProps> = ({
  isOpen,
  onClose,
  onOpenRepaymentModal,
  selectedClientId,
}) => {
  const { clients, settings, recordClientDebtReminder } = useFarm();

  const [activeClientId, setActiveClientId] = useState<string | null>(selectedClientId || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messageStyle, setMessageStyle] = useState<'standard' | 'courtois' | 'urgent'>('standard');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Debtor clients
  const debtorClients = clients.filter((c) => c.debt > 0);

  // If no active client selected yet, default to first debtor
  const currentSelected = debtorClients.find((c) => c.id === activeClientId) || debtorClients[0] || null;

  // Calculate days elapsed since last reminder
  const getReminderStatus = (client: Client) => {
    if (!client.lastDebtReminderDate) {
      return {
        needsReminder: true,
        label: '⏰ Relance requise (Jamais relancé)',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        daysElapsed: null,
      };
    }
    const lastDate = new Date(client.lastDebtReminderDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays >= 7) {
      return {
        needsReminder: true,
        label: `⏰ Relance requise (+${diffDays}j depuis dernier rappel)`,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        daysElapsed: diffDays,
      };
    }

    const nextInDays = 7 - diffDays;
    return {
      needsReminder: false,
      label: `✅ Relancé il y a ${diffDays}j (Prochaine relance dans ${nextInDays}j)`,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      daysElapsed: diffDays,
    };
  };

  // Generate customized reminder message
  const buildReminderMessage = (client: Client) => {
    const formattedDebt = formatMoney(client.debt, settings.currency);
    const farmName = settings.farmName || 'Notre Ferme Avicole';
    const farmPhone = settings.phone || '';
    const ownerName = settings.ownerName || 'La Direction';

    if (messageStyle === 'courtois') {
      return `Bonjour ${client.name},\n\nNous espérons que vous allez bien et que vos activités se portent à merveille.\n\nNous vous écrivons pour faire le point hebdomadaire sur votre compte chez *${farmName}*.\n\n📊 *Solde restant dû : ${formattedDebt}*\n(Livraisons d'alvéoles d'œufs)\n\nPourriez-vous s'il vous plaît planifier le règlement de cette créance cette semaine ? Vous pouvez régler directement en espèces à la ferme ou via Mobile Money.\n\n📞 Pour tout renseignement : ${farmPhone}\n\nMerci infiniment pour votre fidélité et votre confiance.\nBien cordialement,\n*${ownerName}* - ${farmName}`;
    }

    if (messageStyle === 'urgent') {
      return `⚠️ *RAPPEL HEBDOMADAIRE DE CRÉANCE - ${farmName.toUpperCase()}*\n\nBonjour ${client.name},\n\nSauf erreur de notre système comptable, votre compte présente un solde impayé de *${formattedDebt}* pour vos commandes d'œufs.\n\nNous vous remercions de bien vouloir procéder à la régularisation de cette créance dans les plus brefs délais afin de maintenir vos approvisionnements sans interruption.\n\n💳 Modes de paiement acceptés : Espèces ou Mobile Money.\n📞 Contact comptabilité : ${farmPhone}\n\nCordialement,\n*La Direction Financière* - ${farmName}`;
    }

    // Standard default
    return `*RAPPEL HEBDOMADAIRE - COMPTE CLIENT ${farmName.toUpperCase()}*\n\nBonjour ${client.name},\n\nNous vous transmettons le récapitulatif hebdomadaire de votre solde auprès de notre ferme :\n\n• *Montant restant dû :* ${formattedDebt}\n• *Motif :* Approvisionnement d'alvéoles d'œufs\n• *Date du point :* ${formatDate(getTodayDateString())}\n\nMerci de bien vouloir effectuer le règlement par Espèces ou Mobile Money cette semaine.\n\n📞 Contact Ferme : ${farmPhone || 'Direction'}\n\nMerci de votre bonne collaboration !\n*${farmName}*`;
  };

  const handleCopyMessage = (client: Client) => {
    const msg = buildReminderMessage(client);
    navigator.clipboard.writeText(msg);
    setCopiedId(client.id);
    setActionSuccessNotice(`Message pour ${client.name} copié dans le presse-papier !`);
    setTimeout(() => {
      setCopiedId(null);
      setActionSuccessNotice(null);
    }, 3000);
  };

  const cleanPhoneNumber = (phone: string) => {
    return phone.replace(/[^\d+]/g, '');
  };

  const handleSendWhatsApp = (client: Client) => {
    if (!client.phone) {
      alert('Veuillez renseigner un numéro de téléphone pour ce client.');
      return;
    }
    const cleanPhone = cleanPhoneNumber(client.phone).replace('+', '');
    const message = encodeURIComponent(buildReminderMessage(client));
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`;
    
    // Mark as reminded today
    recordClientDebtReminder(client.id);
    setActionSuccessNotice(`Relance enregistrée pour ${client.name} !`);
    setTimeout(() => setActionSuccessNotice(null), 3000);

    window.open(url, '_blank');
  };

  const handleSendSMS = (client: Client) => {
    if (!client.phone) {
      alert('Veuillez renseigner un numéro de téléphone pour ce client.');
      return;
    }
    const cleanPhone = cleanPhoneNumber(client.phone);
    const message = encodeURIComponent(buildReminderMessage(client));
    const url = `sms:${cleanPhone}?body=${message}`;

    // Mark as reminded today
    recordClientDebtReminder(client.id);
    setActionSuccessNotice(`Relance enregistrée pour ${client.name} !`);
    setTimeout(() => setActionSuccessNotice(null), 3000);

    window.location.href = url;
  };

  const handleMarkAsReminded = (client: Client) => {
    recordClientDebtReminder(client.id);
    setActionSuccessNotice(`Relance hebdomadaire marquée comme envoyée pour ${client.name} !`);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  const totalDebts = debtorClients.reduce((sum, c) => sum + c.debt, 0);
  const clientsNeedingReminderCount = debtorClients.filter((c) => getReminderStatus(c).needsReminder).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📢 Centre de Relance Hebdomadaire des Créances Clients"
      subtitle="Génération et envoi automatique des messages de réclamation hebdomadaires (WhatsApp, SMS, Copie)"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs">
        {/* KPI Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8A8A6F] tracking-wider block">
              Total Dettes à Recouvrer
            </span>
            <div className="text-xl font-bold font-mono text-rose-800">
              {formatMoney(totalDebts, settings.currency)}
            </div>
            <span className="text-[11px] text-[#8A8A6F] block">
              {debtorClients.length} client(s) débiteur(s)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              À Relancer Cette Semaine
            </span>
            <div className="text-xl font-bold font-mono text-amber-900">
              {clientsNeedingReminderCount} client(s)
            </div>
            <span className="text-[11px] text-amber-800 block">
              Délai &gt;= 7 jours ou sans rappel
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Fréquence Automatique
            </span>
            <div className="text-xl font-bold font-serif text-emerald-900">
              Chaque 7 Jours
            </div>
            <span className="text-[11px] text-emerald-800 block">
              Cycle de relance hebdomadaire
            </span>
          </div>
        </div>

        {actionSuccessNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessNotice}</span>
          </div>
        )}

        {debtorClients.length === 0 ? (
          <div className="p-10 rounded-3xl bg-[#F5F5F0] border border-[#E5E5DE] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold">
              🎉
            </div>
            <h3 className="text-base font-bold text-[#434333] font-serif">
              Aucune créance client en attente !
            </h3>
            <p className="text-xs text-[#8A8A6F] max-w-md mx-auto">
              Tous vos clients sont à jour de paiement pour leurs achats d'alvéoles d'œufs. Les relances hebdomadaires s'activeront automatiquement dès qu'une vente à crédit ou partielle sera enregistrée.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left sidebar: Clients list */}
            <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              <span className="text-[11px] font-bold text-[#434333] uppercase tracking-wider block mb-1">
                Sélectionner un Client Débiteur ({debtorClients.length})
              </span>

              {debtorClients.map((client) => {
                const status = getReminderStatus(client);
                const isSelected = currentSelected?.id === client.id;

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => setActiveClientId(client.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-sm'
                        : 'bg-[#F5F5F0] border-[#E5E5DE] text-[#434333] hover:border-[#D1D1C4]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">
                          {client.name}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#8A8A6F]'}`}>
                          {client.phone || 'Sans numéro'} • {client.type}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`font-mono font-bold text-xs ${isSelected ? 'text-white' : 'text-rose-800'}`}>
                          {formatMoney(client.debt, settings.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? 'bg-white/20 text-white border-white/30'
                            : status.badgeClass
                        }`}
                      >
                        {status.label}
                      </span>
                      {client.debtReminderCount ? (
                        <span className={`text-[9px] ${isSelected ? 'text-white/70' : 'text-[#8A8A6F]'}`}>
                          {client.debtReminderCount} relance(s)
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right pane: Message Preview & Action Panel */}
            {currentSelected && (
              <div className="md:col-span-7 space-y-4 bg-[#F5F5F0] p-5 rounded-3xl border border-[#E5E5DE]">
                {/* Header of selected client */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5DE]">
                  <div>
                    <h4 className="text-base font-bold font-serif text-[#434333]">
                      {currentSelected.name}
                    </h4>
                    <p className="text-[11px] text-[#8A8A6F]">
                      Tél : <strong className="text-[#2D2D2D] font-mono">{currentSelected.phone || 'Non renseigné'}</strong> • Solde dû : <strong className="text-rose-800 font-mono">{formatMoney(currentSelected.debt, settings.currency)}</strong>
                    </p>
                  </div>

                  {onOpenRepaymentModal && (
                    <button
                      type="button"
                      onClick={() => onOpenRepaymentModal(currentSelected)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-2xs active:scale-95 shrink-0"
                    >
                      Encaisser la dette
                    </button>
                  )}
                </div>

                {/* Tone / Message Style Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-[#434333] mb-1.5">
                    Modèle de Message de Réclamation :
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', label: 'Standard', desc: 'Rappel neutre & clair' },
                      { id: 'courtois', label: 'Courtois', desc: 'Ton amical & commerçant' },
                      { id: 'urgent', label: 'Formel / Urgent', desc: 'Créance en retard' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setMessageStyle(style.id as any)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          messageStyle === style.id
                            ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-bold'
                            : 'bg-white border-[#D1D1C4] text-[#434333] hover:border-[#8A8A6F]'
                        }`}
                      >
                        <div className="text-xs font-semibold">{style.label}</div>
                        <div className={`text-[9px] ${messageStyle === style.id ? 'text-white/80' : 'text-[#8A8A6F]'}`}>
                          {style.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message preview box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#434333]">
                      Aperçu du Message à Transmettre :
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(currentSelected)}
                      className="text-[11px] text-[#5A5A40] hover:text-[#2D2D2D] font-bold flex items-center gap-1"
                    >
                      {copiedId === currentSelected.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier le texte</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#D1D1C4] text-[#2D2D2D] font-sans text-xs whitespace-pre-line leading-relaxed shadow-2xs">
                    {buildReminderMessage(currentSelected)}
                  </div>
                </div>

                {/* Action buttons: WhatsApp / SMS / Mark Sent */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(currentSelected)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Envoyer sur WhatsApp (1-Clic)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendSMS(currentSelected)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#434333] text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Envoyer par SMS Direct</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleMarkAsReminded(currentSelected)}
                      className="text-xs text-[#5A5A40] hover:text-[#434333] font-semibold flex items-center gap-1.5 underline decoration-dotted"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Enregistrer la relance d'aujourd'hui sans ouvrir d'app</span>
                    </button>

                    <span className="text-[10px] text-[#8A8A6F]">
                      Dernier envoi : <strong className="text-[#2D2D2D] font-mono">{currentSelected.lastDebtReminderDate ? formatDate(currentSelected.lastDebtReminderDate) : 'Aucun'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-between">
          <p className="text-[11px] text-[#8A8A6F]">
            💡 Le système recalcule automatiquement le délai de 7 jours après chaque envoi pour maintenir votre trésorerie à jour.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#E2E2D6] hover:bg-[#D1D1C4] text-[#434333] font-bold text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
