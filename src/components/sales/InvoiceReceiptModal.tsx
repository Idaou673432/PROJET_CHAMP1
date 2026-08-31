import React, { useState } from 'react';
import {
  Printer,
  Receipt,
  FileText,
  Share2,
  Check,
  Building,
  User,
  Phone,
  Calendar,
  DollarSign,
  Copy,
  Download,
  X,
} from 'lucide-react';
import { Sale, FarmSettings } from '../../types';
import { Modal } from '../common/Modal';
import { formatMoney, formatDate } from '../../utils/formatters';

interface InvoiceReceiptModalProps {
  sale: Sale;
  settings: FarmSettings;
  onClose: () => void;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  sale,
  settings,
  onClose,
}) => {
  const [printFormat, setPrintFormat] = useState<'ticket' | 'a4'>('ticket');
  const [copiedText, setCopiedText] = useState(false);

  const currency = settings.currency || 'FCFA';

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppMessage = () => {
    const lines = [
      `*${settings.farmName.toUpperCase()}* - REÇU DE VENTE`,
      `Reçu N° : ${sale.saleNumber}`,
      `Date : ${formatDate(sale.date)}`,
      `Client : ${sale.clientName}`,
      `-----------------------------`,
      `Article : ${sale.quantity} ${sale.unit}(s) de ${sale.productType}`,
      `Prix unitaire : ${formatMoney(sale.unitPrice, currency)}`,
      `*Total : ${formatMoney(sale.totalAmount, currency)}*`,
      `Payé (${sale.paymentMethod}) : ${formatMoney(sale.amountPaid, currency)}`,
      sale.remainingDue > 0 ? `*Reste à payer : ${formatMoney(sale.remainingDue, currency)}*` : `Statut : PAYÉ EN TOTALITÉ`,
      `-----------------------------`,
      `Merci pour votre confiance !`,
      `Contact : ${settings.phone}`,
    ];
    return encodeURIComponent(lines.join('\n'));
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${getWhatsAppMessage()}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const rawText = decodeURIComponent(getWhatsAppMessage()).replace(/\*/g, '');
    navigator.clipboard.writeText(rawText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Reçu / Facture N° ${sale.saleNumber}`}
      subtitle={`Client : ${sale.clientName} • ${formatDate(sale.date)}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Format Selector and Action bar (no-print) */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] no-print">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPrintFormat('ticket')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                printFormat === 'ticket'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-white text-[#434333] hover:bg-[#E2E2D6]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Format Ticket Thermique (58/80mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintFormat('a4')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                printFormat === 'a4'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-white text-[#434333] hover:bg-[#E2E2D6]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Format Facture A4</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all"
              title="Envoyer le reçu par WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#E2E2D6] text-[#434333] font-semibold border border-[#D1D1C4] transition-all"
              title="Copier le texte du reçu"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D2D2D] hover:bg-black text-white font-bold shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE CONTAINER */}
        <div className="flex justify-center bg-[#E5E5DE]/40 p-4 sm:p-6 rounded-2xl overflow-x-auto">
          {printFormat === 'ticket' ? (
            /* TICKET THERMIQUE (58/80mm) */
            <div className="w-[300px] sm:w-[320px] bg-white text-black p-5 rounded-lg shadow-md border border-neutral-300 font-mono text-[11px] leading-relaxed print-ticket">
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-neutral-400 space-y-1">
                <div className="font-bold text-sm tracking-wide uppercase font-sans">
                  {settings.farmName || 'FERME AVICOLE'}
                </div>
                <div className="text-[10px] text-neutral-600">{settings.location}</div>
                <div className="text-[10px] text-neutral-600">Tél: {settings.phone}</div>
                <div className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest pt-1">
                  *** TICKET DE CAISSE ***
                </div>
              </div>

              {/* Meta */}
              <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Reçu N° :</span>
                  <span className="font-bold">{sale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Heure :</span>
                  <span>{formatDate(sale.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client :</span>
                  <span className="font-bold">{sale.clientName}</span>
                </div>
                {sale.clientPhone && (
                  <div className="flex justify-between">
                    <span>Contact :</span>
                    <span>{sale.clientPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Vendeur :</span>
                  <span>{sale.sellerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 border-b border-dashed border-neutral-400 space-y-2">
                <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-neutral-200">
                  <span>ARTICLE</span>
                  <span>TOTAL</span>
                </div>
                <div>
                  <div className="font-bold text-neutral-900">{sale.productType}</div>
                  <div className="flex justify-between text-neutral-600">
                    <span>
                      {sale.quantity} {sale.unit}(s) x {formatMoney(sale.unitPrice, currency)}
                    </span>
                    <span className="font-bold text-neutral-900">
                      {formatMoney(sale.totalAmount, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>TOTAL À PAYER :</span>
                  <span>{formatMoney(sale.totalAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Montant Reçu ({sale.paymentMethod}) :</span>
                  <span className="font-bold text-emerald-800">{formatMoney(sale.amountPaid, currency)}</span>
                </div>
                {sale.remainingDue > 0 ? (
                  <div className="flex justify-between text-[11px] font-bold text-rose-700 pt-0.5 border-t border-dotted border-neutral-300">
                    <span>RESTE DÛ (CRÉDIT) :</span>
                    <span>{formatMoney(sale.remainingDue, currency)}</span>
                  </div>
                ) : (
                  <div className="text-center font-bold text-[10px] text-emerald-700 pt-1">
                    SOLDE ENTIÈREMENT RÉGLÉ
                  </div>
                )}
              </div>

              {/* Barcode simulation & Footer note */}
              <div className="pt-4 text-center space-y-2">
                {/* SVG Barcode mock */}
                <div className="flex justify-center items-center py-1 opacity-70">
                  <div className="font-mono text-[9px] tracking-widest bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300">
                    ||| | |||| || ||| || |||| |
                  </div>
                </div>
                <div className="text-[10px] text-neutral-700 italic">
                  Œufs garantis ultra-frais du jour.<br />
                  Merci pour votre confiance & à bientôt !
                </div>
              </div>
            </div>
          ) : (
            /* FACTURE COMMERCIALE A4 */
            <div className="w-full max-w-2xl bg-white text-[#2D2D2D] p-8 rounded-xl shadow-md border border-[#E5E5DE] space-y-6 font-sans print-a4">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4 border-[#E5E5DE]">
                <div>
                  <div className="text-xl font-serif font-bold text-[#434333]">
                    {settings.farmName || 'Ferme Avicole Professionnelle'}
                  </div>
                  <p className="text-xs text-[#8A8A6F] mt-0.5">{settings.location}</p>
                  <p className="text-xs text-[#8A8A6F]">Tél : {settings.phone}</p>
                  {settings.ownerName && <p className="text-xs text-[#8A8A6F]">Gérant : {settings.ownerName}</p>}
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#5A5A40] text-white font-bold text-xs uppercase tracking-wider">
                    FACTURE COMMERCIALE
                  </span>
                  <div className="font-mono font-bold text-sm text-[#2D2D2D] mt-1">
                    N° {sale.saleNumber}
                  </div>
                  <div className="text-xs text-[#8A8A6F]">Date : {formatDate(sale.date)}</div>
                </div>
              </div>

              {/* Client & Seller Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8A8A6F] block">Client / Destinataire :</span>
                  <div className="text-sm font-serif font-bold text-[#2D2D2D] mt-0.5">{sale.clientName}</div>
                  {sale.clientPhone && <div className="text-[#5A5A40] font-mono mt-0.5">{sale.clientPhone}</div>}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#8A8A6F] block">Émis par :</span>
                  <div className="font-semibold text-[#2D2D2D] mt-0.5">{sale.sellerName}</div>
                  <div className="text-[11px] text-[#8A8A6F]">Mode de règlement : {sale.paymentMethod}</div>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-[#E5E5DE] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F5F0] text-[#5A5A40] font-bold border-b border-[#E5E5DE]">
                    <tr>
                      <th className="p-3">Désignation des Produits</th>
                      <th className="p-3 text-center">Quantité</th>
                      <th className="p-3 text-right">Prix Unitaire</th>
                      <th className="p-3 text-right">Montant Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5DE]">
                    <tr>
                      <td className="p-3 font-medium text-[#2D2D2D]">
                        <div>{sale.productType}</div>
                        {sale.notes && <div className="text-[10px] text-[#8A8A6F] italic">{sale.notes}</div>}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        {sale.quantity} {sale.unit}(s)
                      </td>
                      <td className="p-3 text-right font-mono">
                        {formatMoney(sale.unitPrice, currency)}
                      </td>
                      <td className="p-3 text-right font-serif font-bold text-[#2D2D2D]">
                        {formatMoney(sale.totalAmount, currency)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals & Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                    <span className="text-[#8A8A6F] font-semibold">Total Hors Taxes / TTC :</span>
                    <strong className="text-[#2D2D2D] font-serif text-sm">
                      {formatMoney(sale.totalAmount, currency)}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 text-emerald-800">
                    <span>Montant Réglé ({sale.paymentMethod}) :</span>
                    <strong className="font-mono">
                      {formatMoney(sale.amountPaid, currency)}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 text-rose-700 font-bold border-t-2 border-[#E5E5DE]">
                    <span>Reste à Payer :</span>
                    <strong className="font-mono text-sm">
                      {formatMoney(sale.remainingDue, currency)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp Zone */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#E5E5DE] text-xs">
                <div className="text-center p-3 border border-dashed border-[#D1D1C4] rounded-xl h-24 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#8A8A6F]">Signature du Client</span>
                </div>
                <div className="text-center p-3 border border-dashed border-[#D1D1C4] rounded-xl h-24 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#8A8A6F]">Cachet & Signature de la Direction</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-[#8A8A6F] pt-2">
                Document certifié conforme • Ferme avicole agréée • Merci pour votre confiance
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
