import React, { useState, useMemo } from 'react';
import {
  Egg,
  Plus,
  Calendar,
  Filter,
  Trash2,
  TrendingUp,
  AlertCircle,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Grid,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Modal } from '../components/common/Modal';
import { formatDate, formatNumber, getTodayDateString } from '../utils/formatters';

export const ProductionView: React.FC<{ isOpenNewDefault?: boolean; onCloseNew?: () => void }> = ({
  isOpenNewDefault = false,
  onCloseNew,
}) => {
  const { lots, productions, settings, currentUser, addProduction, deleteProduction } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(isOpenNewDefault);
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states - Primary unit is ALVÉOLES (trays of 30)
  const [formDate, setFormDate] = useState(getTodayDateString());
  const [formLotId, setFormLotId] = useState(lots[0]?.id || '');
  const [inputMode, setInputMode] = useState<'alveoles' | 'direct_eggs'>('alveoles');
  const [formAlveoles, setFormAlveoles] = useState<number>(35);
  const [formExtraEggs, setFormExtraEggs] = useState<number>(15);
  const [formDirectEggs, setFormDirectEggs] = useState<number>(1065);
  const [formEggsBroken, setFormEggsBroken] = useState<number>(3);
  const [formEggsDirty, setFormEggsDirty] = useState<number>(5);
  const [formRemarks, setFormRemarks] = useState('');

  const eggsPerTray = settings.eggsPerTray || 30;
  const currentLot = lots.find((l) => l.id === formLotId) || lots[0];
  const hensCount = currentLot?.currentCount || 1000;

  // Computed values for the form
  const computedTotalEggs = useMemo(() => {
    if (inputMode === 'alveoles') {
      return (Number(formAlveoles) || 0) * eggsPerTray + (Number(formExtraEggs) || 0);
    }
    return Number(formDirectEggs) || 0;
  }, [inputMode, formAlveoles, formExtraEggs, formDirectEggs, eggsPerTray]);

  const formMarketableEggs = Math.max(0, computedTotalEggs - formEggsBroken - formEggsDirty);
  const formTraysHarvested = Number((computedTotalEggs / eggsPerTray).toFixed(1));
  const formTraysMarketable = Number((formMarketableEggs / eggsPerTray).toFixed(1));
  const formLayingRate = Number(((computedTotalEggs / hensCount) * 100).toFixed(1));

  const handleOpenModal = () => {
    setFormDate(getTodayDateString());
    setFormLotId(lots[0]?.id || '');
    setInputMode('alveoles');
    setFormAlveoles(35);
    setFormExtraEggs(15);
    setFormDirectEggs(1065);
    setFormEggsBroken(2);
    setFormEggsDirty(4);
    setFormRemarks('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseNew) onCloseNew();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAlveoles = inputMode === 'alveoles' ? formAlveoles : Math.floor(computedTotalEggs / eggsPerTray);
    const finalExtra = inputMode === 'alveoles' ? formExtraEggs : computedTotalEggs % eggsPerTray;

    addProduction({
      date: formDate,
      lotId: formLotId,
      alveolesCollected: finalAlveoles,
      extraEggsCollected: finalExtra,
      eggsTotal: computedTotalEggs,
      eggsBroken: formEggsBroken,
      eggsDirty: formEggsDirty,
      eggsMarketable: formMarketableEggs,
      traysMarketable: formTraysMarketable,
      recordedBy: currentUser.name,
      remarks: formRemarks,
    });
    handleCloseModal();
  };

  // Filtered productions
  const filteredProductions = useMemo(() => {
    return productions.filter((p) => {
      const matchLot = selectedLotFilter === 'ALL' || p.lotId === selectedLotFilter;
      const matchSearch =
        !searchTerm ||
        p.date.includes(searchTerm) ||
        (p.lotName && p.lotName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.remarks && p.remarks.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchLot && matchSearch;
    });
  }, [productions, selectedLotFilter, searchTerm]);

  // Aggregate stats for filtered data
  const totalHarvestedEggs = filteredProductions.reduce((sum, p) => sum + p.eggsTotal, 0);
  const totalMarketableEggs = filteredProductions.reduce((sum, p) => sum + p.eggsMarketable, 0);
  const totalBrokenEggs = filteredProductions.reduce((sum, p) => sum + p.eggsBroken, 0);
  const totalDirtyEggs = filteredProductions.reduce((sum, p) => sum + p.eggsDirty, 0);

  const totalHarvestedAlveoles = Number((totalHarvestedEggs / eggsPerTray).toFixed(1));
  const totalMarketableAlveoles = Number((totalMarketableEggs / eggsPerTray).toFixed(1));
  const avgLayingRate =
    filteredProductions.length > 0
      ? (filteredProductions.reduce((sum, p) => sum + p.layingRatePercent, 0) / filteredProductions.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333] flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#5A5A40]" />
            <span>Ramassage & Production d'Œufs</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8A6F]">
            Comptabilisation principale par <strong>Alvéoles / Plateaux</strong> de {eggsPerTray} œufs avec tri qualité instantané
          </p>
        </div>

        <button
          type="button"
          id="btn-add-production"
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs sm:text-sm transition-all shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Ramassage (Alvéoles)</span>
        </button>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block">
            Alvéoles Récoltées
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#2D2D2D]">
            {formatNumber(totalHarvestedAlveoles, 1)} <span className="text-xs font-sans font-normal text-[#8A8A6F]">alv.</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">{formatNumber(totalHarvestedEggs)} œufs au total</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">
            Alvéoles Vendables
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-emerald-800">
            {formatNumber(totalMarketableAlveoles, 1)} <span className="text-xs font-sans font-normal text-emerald-700">alv.</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">{formatNumber(totalMarketableEggs)} œufs conformes</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest block">
            Taux de Ponte Moyen
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#5A5A40]">
            {avgLayingRate}%
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">Sur {filteredProductions.length} ramassages</span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">
            Œufs Cassés / Pertes
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-rose-700">
            {formatNumber(totalBrokenEggs)} <span className="text-xs font-sans font-normal text-rose-500">œufs</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">
            {totalHarvestedEggs > 0 ? ((totalBrokenEggs / totalHarvestedEggs) * 100).toFixed(1) : 0}% de perte
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
            Œufs Déclassés / Sales
          </span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-amber-800">
            {formatNumber(totalDirtyEggs)} <span className="text-xs font-sans font-normal text-amber-600">œufs</span>
          </div>
          <span className="text-[10px] text-[#8A8A6F] block">À nettoyer ou calibrer</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E5DE]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#8A8A6F] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filtrer par Lot :
            </span>
            <button
              type="button"
              onClick={() => setSelectedLotFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedLotFilter === 'ALL'
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-[#F5F5F0] text-[#434333] hover:bg-[#E2E2D6]'
              }`}
            >
              Tous les Lots ({productions.length})
            </button>
            {lots.map((lot) => (
              <button
                key={lot.id}
                type="button"
                onClick={() => setSelectedLotFilter(lot.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedLotFilter === lot.id
                    ? 'bg-[#5A5A40] text-white'
                    : 'bg-[#F5F5F0] text-[#434333] hover:bg-[#E2E2D6]'
                }`}
              >
                {lot.name}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#8A8A6F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher date, observations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#D1D1C4] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D2D] placeholder-[#8A8A6F] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
            />
          </div>
        </div>

        {/* Productions Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E5E5DE]">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#F5F5F0] border-b border-[#E5E5DE]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Bâtiment / Lot</th>
                <th className="p-3">Alvéoles Récoltées</th>
                <th className="p-3">Œufs Totaux</th>
                <th className="p-3">Alvéoles Vendables</th>
                <th className="p-3">Casse / Déclassés</th>
                <th className="p-3">Taux de Ponte</th>
                <th className="p-3">Enregistré par</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredProductions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#8A8A6F]">
                    Aucune saisie de ramassage trouvée pour ce filtre.
                  </td>
                </tr>
              ) : (
                filteredProductions.map((prod) => {
                  const alveoles = prod.alveolesCollected ?? Math.floor(prod.eggsTotal / eggsPerTray);
                  const extraEggs = prod.extraEggsCollected ?? (prod.eggsTotal % eggsPerTray);
                  const marketableAlveoles = prod.traysMarketable ?? Number((prod.eggsMarketable / eggsPerTray).toFixed(1));

                  return (
                    <tr key={prod.id} className="hover:bg-[#F9F9F6] transition-colors">
                      <td className="p-3 font-semibold text-[#2D2D2D] font-mono">{formatDate(prod.date)}</td>
                      <td className="p-3 font-medium text-[#2D2D2D]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#5A5A40]" />
                          <span>{prod.lotName}</span>
                        </div>
                        {prod.remarks && (
                          <span className="text-[10px] text-[#8A8A6F] italic block truncate max-w-xs">
                            {prod.remarks}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 font-bold text-[#5A5A40]">
                          <Grid className="w-3.5 h-3.5" />
                          <span>{alveoles} alv.</span>
                          {extraEggs > 0 && <span className="text-[10px] text-[#8A8A6F]">+{extraEggs} œ.</span>}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#2D2D2D] font-mono text-sm">
                        {formatNumber(prod.eggsTotal)}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-800 font-mono text-sm">
                          {marketableAlveoles} pl.
                        </span>
                        <span className="text-[10px] text-[#8A8A6F] block">({formatNumber(prod.eggsMarketable)} œ.)</span>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="space-y-0.5">
                          {prod.eggsBroken > 0 ? (
                            <span className="text-rose-700 font-semibold block">⚠️ {prod.eggsBroken} cassés</span>
                          ) : (
                            <span className="text-emerald-700 text-[10px]">0 casse</span>
                          )}
                          {prod.eggsDirty > 0 && (
                            <span className="text-amber-700 text-[10px] block">{prod.eggsDirty} sales</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.layingRatePercent >= 85
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : prod.layingRatePercent >= 70
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {prod.layingRatePercent}%
                        </span>
                      </td>
                      <td className="p-3 text-[#8A8A6F]">{prod.recordedBy}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Supprimer le ramassage du ${prod.date} (${alveoles} alvéoles) ?`)) {
                              deleteProduction(prod.id);
                            }
                          }}
                          className="p-1.5 text-[#8A8A6F] hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Entry Modal - ALVÉOLES BASED */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Enregistrer un Ramassage (Par Alvéoles)"
        subtitle="Comptabilisez votre récolte directement en alvéoles pleines et œufs en vrac"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Header row: Date & Lot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Date du Ramassage *</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Bâtiment / Lot Récolté *</label>
              <select
                required
                value={formLotId}
                onChange={(e) => setFormLotId(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.currentCount} poules)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE]">
            <span className="font-semibold text-[#434333]">Mode de comptage :</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setInputMode('alveoles')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'alveoles'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'bg-transparent text-[#8A8A6F] hover:text-[#434333]'
                }`}
              >
                🥚 En Alvéoles (Recommandé)
              </button>
              <button
                type="button"
                onClick={() => setInputMode('direct_eggs')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  inputMode === 'direct_eggs'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'bg-transparent text-[#8A8A6F] hover:text-[#434333]'
                }`}
              >
                Nombre d'œufs direct
              </button>
            </div>
          </div>

          {/* Input Section */}
          {inputMode === 'alveoles' ? (
            <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#434333] font-bold mb-1 flex items-center justify-between">
                    <span>Alvéoles pleines (30 œufs) *</span>
                    <span className="text-[10px] text-[#5A5A40] font-mono font-normal">
                      = {(Number(formAlveoles) || 0) * eggsPerTray} œufs
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={formAlveoles}
                    onChange={(e) => setFormAlveoles(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2.5 text-[#2D2D2D] font-mono text-lg font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    placeholder="Ex: 35"
                  />
                  {/* Quick increment buttons */}
                  <div className="flex gap-1.5 mt-2">
                    {[1, 5, 10, 20].map((inc) => (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => setFormAlveoles((prev) => (Number(prev) || 0) + inc)}
                        className="px-2 py-1 rounded-lg bg-white border border-[#D1D1C4] hover:bg-[#E2E2D6] text-[10px] font-bold text-[#5A5A40]"
                      >
                        +{inc} alv.
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormAlveoles(0)}
                      className="px-2 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-bold ml-auto"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#434333] font-bold mb-1">
                    Œufs restants / en vrac (0 à {eggsPerTray - 1})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={eggsPerTray - 1}
                    value={formExtraEggs}
                    onChange={(e) => setFormExtraEggs(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2.5 text-[#2D2D2D] font-mono text-lg font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                    placeholder="Ex: 15"
                  />
                  <span className="text-[10px] text-[#8A8A6F] block mt-1.5">
                    Œufs incomplets ne remplissant pas une alvéole de {eggsPerTray}.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE]">
              <label className="block text-[#434333] font-bold mb-1">Total Œufs Ramassés *</label>
              <input
                type="number"
                min="1"
                required
                value={formDirectEggs}
                onChange={(e) => setFormDirectEggs(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2.5 text-[#2D2D2D] font-mono text-lg font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          )}

          {/* Loss & Quality Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-rose-700 font-semibold mb-1">Œufs Cassés / Fêlés (hors stock)</label>
              <input
                type="number"
                min="0"
                value={formEggsBroken}
                onChange={(e) => setFormEggsBroken(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-rose-700 text-xs font-mono focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-amber-800 font-semibold mb-1">Œufs Sales / Déclassés</label>
              <input
                type="number"
                min="0"
                value={formEggsDirty}
                onChange={(e) => setFormEggsDirty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-800 text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Automatic Real-Time Calculation Preview Card */}
          <div className="p-4 rounded-2xl bg-[#E2E2D6] border border-[#D1D1C4] space-y-2">
            <div className="text-xs font-bold text-[#434333] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                Bilan du Ramassage en Temps Réel
              </span>
              <span className="font-mono text-[11px] text-[#5A5A40]">
                Cheptel : {hensCount} poules
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-[#8A8A6F] block">Total Ramassé</span>
                <span className="text-sm font-serif font-bold text-[#2D2D2D]">
                  {computedTotalEggs} œufs
                </span>
                <span className="text-[10px] text-[#8A8A6F] block">({formTraysHarvested} alv.)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-emerald-800 font-bold block">Alvéoles Vendables</span>
                <span className="text-sm font-serif font-bold text-emerald-800">
                  {formTraysMarketable} alv.
                </span>
                <span className="text-[10px] text-emerald-700 block">({formMarketableEggs} œufs)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-[#8A8A6F] block">Taux de Ponte</span>
                <span className={`text-sm font-serif font-bold ${formLayingRate >= 80 ? 'text-[#5A5A40]' : 'text-amber-800'}`}>
                  {formLayingRate}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#D1D1C4] shadow-2xs">
                <span className="text-[10px] text-rose-700 block">Taux de Perte</span>
                <span className="text-sm font-serif font-bold text-rose-700">
                  {computedTotalEggs > 0 ? ((formEggsBroken / computedTotalEggs) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[#434333] font-semibold mb-1">Observations / Remarques</label>
            <textarea
              rows={2}
              value={formRemarks}
              onChange={(e) => setFormRemarks(e.target.value)}
              className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              placeholder="Ex: Ramassage du matin, 35 alvéoles pleines + 15 œufs. Très belle coquille."
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
              className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider ({formTraysMarketable} alvéoles vendables)</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
