import React, { useState } from 'react';
import {
  Skull,
  Plus,
  Calendar,
  AlertTriangle,
  HeartPulse,
  TrendingDown,
  Trash2,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { MortalityCause } from '../types';
import { Modal } from '../components/common/Modal';
import { formatDate, formatNumber, getTodayDateString } from '../utils/formatters';

const CAUSES: MortalityCause[] = [
  'Stress thermique / Chaleur',
  'Maladie respiratoire',
  'Prolapsus / Piquage',
  'Infection bactérienne',
  'Écrasement / Panique',
  'Vieillesse / Réforme',
  'Inconnue',
  'Autre',
];

export const MortalityView: React.FC<{ isOpenNewDefault?: boolean; onCloseNew?: () => void }> = ({
  isOpenNewDefault = false,
  onCloseNew,
}) => {
  const { lots, mortalities, settings, currentUser, addMortality, deleteMortality } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(isOpenNewDefault);
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('ALL');

  // Form states
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formLotId, setFormLotId] = useState(lots[0]?.id || '');
  const [formDeadCount, setFormDeadCount] = useState<number>(2);
  const [formCause, setFormCause] = useState<MortalityCause>('Stress thermique / Chaleur');
  const [formActionsTaken, setFormActionsTaken] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const currentLot = lots.find((l) => l.id === formLotId) || lots[0];

  const handleOpenModal = () => {
    setFormDate(getTodayDateString());
    setFormLotId(lots[0]?.id || '');
    setFormDeadCount(1);
    setFormCause('Stress thermique / Chaleur');
    setFormActionsTaken('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseNew) onCloseNew();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMortality({
      date: formDate,
      lotId: formLotId,
      deadCount: formDeadCount,
      cause: formCause,
      actionsTaken: formActionsTaken,
      recordedBy: currentUser.name,
      notes: formNotes,
    });
    handleCloseModal();
  };

  // Filtered
  const filteredMortalities = mortalities.filter((m) => {
    return selectedLotFilter === 'ALL' || m.lotId === selectedLotFilter;
  });

  const totalDead = filteredMortalities.reduce((sum, m) => sum + m.deadCount, 0);
  const totalLivingHens = lots.reduce((sum, l) => sum + l.currentCount, 0);
  const totalInitialHens = lots.reduce((sum, l) => sum + l.initialCount, 0);
  const overallMortalityRate = totalInitialHens > 0 ? ((totalDead / totalInitialHens) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Registre des Mortalités & Pertes
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Déclaration des décès, diagnostic des causes et mise à jour automatique des effectifs
          </p>
        </div>

        <button
          type="button"
          id="btn-add-mortality"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Déclarer une Mortalité</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block">
            Pertes Cumulées
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-rose-800">
            {formatNumber(totalDead)} sujets
          </div>
          <span className="text-xs text-[#8A8A6F] block">Sur l'ensemble des lots enregistrés</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Cheptel Vivant Actuel
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800">
            {formatNumber(totalLivingHens)} poules
          </div>
          <span className="text-xs text-[#8A8A6F] block">Capacité de ponte en service</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block">
            Taux de Mortalité Global
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A5A40]">
            {overallMortalityRate}%
          </div>
          <span className="text-xs text-[#8A8A6F] block">
            Objectif avicole : inférieur à 0.05% / jour (&lt; 4% annuel)
          </span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#8A8A6F]" />
            <select
              value={selectedLotFilter}
              onChange={(e) => setSelectedLotFilter(e.target.value)}
              className="bg-[#F5F5F0] border border-[#D1D1C4] text-[#434333] text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            >
              <option value="ALL">Tous les Lots</option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
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
                <th className="p-3">Lot concerné</th>
                <th className="p-3">Nombre de Morts</th>
                <th className="p-3">Cause Diagnostiquée</th>
                <th className="p-3">Mesures Prises</th>
                <th className="p-3">Opérateur</th>
                <th className="p-3 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredMortalities.map((m) => (
                <tr key={m.id} className="hover:bg-[#F5F5F0]/60 transition-colors">
                  <td className="p-3 font-semibold text-[#2D2D2D] font-mono">{formatDate(m.date)}</td>
                  <td className="p-3 font-medium text-[#434333]">{m.lotName}</td>
                  <td className="p-3 font-bold text-rose-800 font-mono text-sm">
                    {m.deadCount} sujet(s)
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      {m.cause}
                    </span>
                  </td>
                  <td className="p-3 text-[#434333]">{m.actionsTaken || '-'}</td>
                  <td className="p-3 text-[#8A8A6F]">{m.recordedBy}</td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer cette déclaration de mortalité ?`)) {
                          deleteMortality(m.id);
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

      {/* Mortality Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Déclarer une Mortalité"
        subtitle="Mise à jour automatique de l’effectif vivant du lot"
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
              <label className="block text-[#434333] font-semibold mb-1">Lot concerné *</label>
              <select
                value={formLotId}
                onChange={(e) => setFormLotId(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (Vivant actuel: {l.currentCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-rose-800 font-semibold mb-1">Nombre de Poules Mortes *</label>
              <input
                type="number"
                min="1"
                required
                value={formDeadCount}
                onChange={(e) => setFormDeadCount(Number(e.target.value))}
                className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-rose-800 font-bold font-mono text-base focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Cause Suspectée *</label>
              <select
                value={formCause}
                onChange={(e) => setFormCause(e.target.value as MortalityCause)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {CAUSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Mesures Prises Immédiatement</label>
            <input
              type="text"
              value={formActionsTaken}
              onChange={(e) => setFormActionsTaken(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="ex: Isolement des sujets suspects, nébulisation antiseptique, augmentation aération..."
            />
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Observations Vétérinaires</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Symptômes constatés (crête pâle, râles, diarrhée...)"
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
              className="px-5 py-2 rounded-xl bg-rose-800 hover:bg-rose-900 text-white font-medium shadow-xs"
            >
              Enregistrer ({currentLot?.currentCount - formDeadCount} poules restantes)
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
