import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Stethoscope,
  Trash2,
  Syringe,
  Pill,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { VaccineTreatment } from '../types';
import { Modal } from '../components/common/Modal';
import { formatMoney, formatDate, getTodayDateString } from '../utils/formatters';

export const HealthView: React.FC = () => {
  const { lots, vaccines, settings, currentUser, addVaccine, updateVaccine, deleteVaccine } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('ALL');

  // Form states
  const [formName, setFormName] = useState('Newcastle + Bronchite (Rappel)');
  const [formType, setFormType] = useState<'Vaccin' | 'Traitement' | 'Vitamine' | 'Vermifuge'>('Vaccin');
  const [formLotId, setFormLotId] = useState(lots[0]?.id || '');
  const [formScheduledDate, setFormScheduledDate] = useState(getTodayDateString());
  const [formTargetAgeWeeks, setFormTargetAgeWeeks] = useState<number>(24);
  const [formAdministrationRoute, setFormAdministrationRoute] = useState('Eau de boisson');
  const [formVeterinarian, setFormVeterinarian] = useState('Dr Vétérinaire Kouassi');
  const [formCost, setFormCost] = useState<number>(15000);
  const [formNotes, setFormNotes] = useState('');

  const handleOpenModal = () => {
    setFormName('Rappel Vitamines Minéraux');
    setFormType('Vitamine');
    setFormLotId(lots[0]?.id || '');
    setFormScheduledDate(getTodayDateString());
    setFormTargetAgeWeeks(22);
    setFormAdministrationRoute('Eau de boisson');
    setFormVeterinarian('Responsable sanitaire');
    setFormCost(12000);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentLot = lots.find((l) => l.id === formLotId);
    addVaccine({
      name: formName,
      type: formType,
      lotId: formLotId,
      lotName: currentLot?.name || 'Lot',
      scheduledDate: formScheduledDate,
      targetAgeWeeks: formTargetAgeWeeks,
      administrationRoute: formAdministrationRoute,
      veterinarian: formVeterinarian,
      cost: formCost,
      status: 'Programmé',
      notes: formNotes,
    });
    setIsModalOpen(false);
  };

  const handleToggleStatus = (vac: VaccineTreatment) => {
    const newStatus = vac.status === 'Fait' ? 'Programmé' : 'Fait';
    updateVaccine(vac.id, {
      status: newStatus,
      administeredDate: newStatus === 'Fait' ? getTodayDateString() : undefined,
    });
  };

  const vaccinesList = vaccines || [];

  // Filtered
  const filteredVaccines = vaccinesList.filter((v) => {
    return selectedLotFilter === 'ALL' || v.lotId === selectedLotFilter;
  });

  const doneCount = vaccinesList.filter((v) => v.status === 'Fait').length;
  const pendingCount = vaccinesList.filter((v) => v.status === 'Programmé').length;
  const totalCost = vaccinesList.reduce((sum, v) => sum + v.cost, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
            Plan de Prophylaxie & Santé Animale
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Calendrier vaccinal, vermifugation, cures de vitamines et carnet de soins vétérinaires
          </p>
        </div>

        <button
          type="button"
          id="btn-add-vaccine"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Programmer un Traitement</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Soins & Vaccins Réalisés
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-800">
            {doneCount} administrés
          </div>
          <span className="text-xs text-[#8A8A6F] block">Protection sanitaire à jour</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block">
            Traitements à Venir
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#5A5A40]">
            {pendingCount} programmés
          </div>
          <span className="text-xs text-[#8A8A6F] block">Rappels et cures planifiées</span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#434333] uppercase tracking-widest block">
            Budget Santé & Vaccins
          </span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2D2D]">
            {formatMoney(totalCost, settings.currency)}
          </div>
          <span className="text-xs text-[#8A8A6F] block">Investissement préventif</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-[#434333] flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#5A5A40]" />
            <span>Calendrier de Prophylaxie du Troupeau</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#8A8A6F] bg-[#F5F5F0]">
              <tr>
                <th className="p-3 rounded-l-xl">Statut</th>
                <th className="p-3">Date Prévue</th>
                <th className="p-3">Désignation Traitement</th>
                <th className="p-3">Type</th>
                <th className="p-3">Lot concerné</th>
                <th className="p-3">Âge Cible</th>
                <th className="p-3">Mode d'Admin.</th>
                <th className="p-3">Vétérinaire / Resp.</th>
                <th className="p-3">Coût</th>
                <th className="p-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredVaccines.map((vac) => (
                <tr key={vac.id} className="hover:bg-[#F5F5F0]/60 transition-colors">
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(vac)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                        vac.status === 'Fait'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4] hover:bg-[#D1D1C4]'
                      }`}
                    >
                      {vac.status === 'Fait' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Fait</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Programmé (Cliquer si fait)</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 font-semibold text-[#2D2D2D] font-mono">{formatDate(vac.scheduledDate)}</td>
                  <td className="p-3 font-bold text-[#2D2D2D]">{vac.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-lg bg-[#E2E2D6] text-[#434333] border border-[#D1D1C4] text-[10px]">
                      {vac.type}
                    </span>
                  </td>
                  <td className="p-3 text-[#434333] font-medium">{vac.lotName}</td>
                  <td className="p-3 text-[#5A5A40] font-mono font-bold">{vac.targetAgeWeeks} sem.</td>
                  <td className="p-3 text-[#8A8A6F]">{vac.administrationRoute}</td>
                  <td className="p-3 text-[#434333]">{vac.veterinarian}</td>
                  <td className="p-3 font-bold text-[#2D2D2D] font-mono">
                    {formatMoney(vac.cost, settings.currency)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer ce traitement ${vac.name} ?`)) {
                          deleteVaccine(vac.id);
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

      {/* Modal New Vaccine */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Planifier un Traitement ou Vaccin"
        subtitle="Ajout au carnet de santé de l’élevage"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Nom du Vaccin / Traitement *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="ex: Newcastle + Bronchite (Hitchner B1)"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Type *</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                <option value="Vaccin">Vaccin</option>
                <option value="Traitement">Traitement antibiotique / curatif</option>
                <option value="Vitamine">Vitamines & Minéraux (Antistress)</option>
                <option value="Vermifuge">Vermifuge</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Lot ciblé *</label>
              <select
                value={formLotId}
                onChange={(e) => setFormLotId(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date d'Administration *</label>
              <input
                type="date"
                required
                value={formScheduledDate}
                onChange={(e) => setFormScheduledDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Âge Cible (semaines)</label>
              <input
                type="number"
                min="1"
                value={formTargetAgeWeeks}
                onChange={(e) => setFormTargetAgeWeeks(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Voie d’Administration</label>
              <input
                type="text"
                value={formAdministrationRoute}
                onChange={(e) => setFormAdministrationRoute(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="Eau de boisson, Injection, Nébulisation..."
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Vétérinaire / Applicateur</label>
              <input
                type="text"
                value={formVeterinarian}
                onChange={(e) => setFormVeterinarian(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                placeholder="Nom du praticien"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Coût Estimé ({settings.currency})</label>
              <input
                type="number"
                min="0"
                value={formCost}
                onChange={(e) => setFormCost(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Instructions / Posologie</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Dosage : 1 sachet pour 100 litres d'eau pendant 3 jours consécutifs."
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
              Enregistrer le Traitement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
