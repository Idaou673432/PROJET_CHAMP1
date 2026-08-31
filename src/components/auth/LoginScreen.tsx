import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  Shield,
  KeyRound,
  AlertCircle,
  Egg,
  ArrowRight,
  Users,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { AppUser } from '../../types';

export const LoginScreen: React.FC = () => {
  const { settings, users, loginAsAdmin, loginWithUserPin } = useFarm();

  const [activeMode, setActiveMode] = useState<'team' | 'admin'>('team');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // PIN / Password states
  const [pinCode, setPinCode] = useState('');
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showUserPin, setShowUserPin] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Active collaborators
  const activeUsers = users.filter((u) => u.active !== false);

  const handleSelectUser = (user: AppUser) => {
    setSelectedUser(user);
    setPinCode('');
    setErrorMessage(null);
  };

  const handleUserPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginWithUserPin(selectedUser.id, pinCode);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Code PIN incorrect.');
      }
    }, 150);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = loginAsAdmin(adminUsername, adminPassword);
      setLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Identifiant ou mot de passe Administrateur incorrect.');
      }
    }, 150);
  };

  const appendPinDigit = (digit: string) => {
    if (pinCode.length < 10) {
      setPinCode((prev) => prev + digit);
      setErrorMessage(null);
    }
  };

  const clearPin = () => {
    setPinCode('');
    setErrorMessage(null);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrateur':
      case 'admin':
        return { label: 'Administrateur', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'Gérant':
      case 'manager':
        return { label: 'Gérant d’Élevage', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'Vendeur':
      case 'seller':
        return { label: 'Ventes & Caisse', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Agent Ramassage', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] via-[#EAEAE0] to-[#E2E2D6] flex flex-col items-center justify-center p-4 sm:p-6 text-[#2D2D2D]">
      <div className="w-full max-w-md">
        {/* Farm Branding */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[#5A5A40] text-white shadow-md text-3xl mb-2.5 transform hover:scale-105 transition-transform">
            🐔
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#434333] tracking-tight">
            {settings.farmName || 'Gestion Poulailler Pondeuses'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8A6F] mt-1 font-medium flex items-center justify-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Synchronisation Cloud multi-appareils en direct</span>
          </p>
        </div>

        {/* Auth Mode Card */}
        <div className="bg-white rounded-3xl border border-[#D1D1C4] shadow-xl overflow-hidden">
          {/* Tabs Selector */}
          <div className="grid grid-cols-2 p-1.5 bg-[#EAEAE0] border-b border-[#D1D1C4] m-3 rounded-2xl gap-1">
            <button
              type="button"
              id="btn-tab-team"
              onClick={() => {
                setActiveMode('team');
                setSelectedUser(null);
                setPinCode('');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'team'
                  ? 'bg-white text-[#434333] shadow-sm'
                  : 'text-[#8A8A6F] hover:text-[#434333]'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Équipe & Terrain</span>
            </button>

            <button
              type="button"
              id="btn-tab-admin"
              onClick={() => {
                setActiveMode('admin');
                setSelectedUser(null);
                setPinCode('');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeMode === 'admin'
                  ? 'bg-[#5A5A40] text-white shadow-sm'
                  : 'text-[#8A8A6F] hover:text-[#434333]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Direction / Admin</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mx-6 mt-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Main Card Content */}
          <div className="p-6">
            {activeMode === 'team' ? (
              !selectedUser ? (
                /* 1. TEAM COLLABORATORS LIST */
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#434333]">
                        Qui utilise l'appareil actuellement ?
                      </h3>
                      <p className="text-[11px] text-[#8A8A6F]">
                        Sélectionnez votre profil pour enregistrer vos opérations
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAEAE0] text-[#5A5A40]">
                      {activeUsers.length} actifs
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {activeUsers.map((user) => {
                      const badge = getRoleBadge(user.role);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          id={`btn-select-user-${user.id}`}
                          onClick={() => handleSelectUser(user)}
                          className="w-full p-3 rounded-2xl border border-[#D1D1C4] hover:border-[#5A5A40] bg-[#FDFDFB] hover:bg-[#F5F5F0] transition-all flex items-center justify-between text-left group shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-[#5A5A40] flex items-center justify-center font-bold text-sm">
                              {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#434333] group-hover:text-[#2D2D2D]">
                                {user.name}
                              </div>
                              <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-md border mt-0.5 ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#8A8A6F] group-hover:text-[#5A5A40] group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* 2. USER PIN INPUT WITH TOUCH NUMPAD */
                <form onSubmit={handleUserPinSubmit} className="space-y-4">
                  {/* Selected user bar */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#EAEAE0] border border-[#D1D1C4]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                        {selectedUser.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#434333]">
                          {selectedUser.name}
                        </div>
                        <div className="text-[10px] text-[#8A8A6F]">
                          {getRoleBadge(selectedUser.role).label}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-xs font-semibold text-[#5A5A40] hover:text-[#434333] flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 hover:bg-white border border-[#D1D1C4]"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Changer</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#434333] mb-1.5 text-center">
                      Entrez votre code PIN secret
                    </label>
                    <div className="relative max-w-[220px] mx-auto">
                      <input
                        type={showUserPin ? 'text' : 'password'}
                        value={pinCode}
                        onChange={(e) => {
                          setPinCode(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="••••"
                        className="w-full py-2.5 pl-4 pr-10 rounded-2xl border border-[#D1D1C4] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-base bg-[#F9F9F6] font-mono tracking-widest text-center font-bold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowUserPin(!showUserPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A8A6F] hover:text-[#434333]"
                        title={showUserPin ? 'Masquer' : 'Afficher'}
                      >
                        {showUserPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick numeric keypad for field use */}
                  <div className="pt-1">
                    <div className="grid grid-cols-3 gap-2">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => appendPinDigit(num)}
                          className="py-2.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] active:scale-95 text-[#434333] font-mono font-bold text-base transition-all border border-[#D1D1C4] shadow-2xs"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={clearPin}
                        className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold text-xs transition-all border border-rose-200"
                      >
                        Effacer
                      </button>
                      <button
                        type="button"
                        onClick={() => appendPinDigit('0')}
                        className="py-2.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E2E2D6] active:scale-95 text-[#434333] font-mono font-bold text-base transition-all border border-[#D1D1C4] shadow-2xs"
                      >
                        0
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !pinCode}
                        className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center disabled:opacity-50"
                      >
                        Valider
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !pinCode}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-1"
                  >
                    <span>{loading ? 'Connexion...' : 'Accéder à mon espace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )
            ) : (
              /* 3. ADMIN AUTH FORM */
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-[#EAEAE0] border border-[#D1D1C4] text-[#434333] text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#5A5A40]" />
                    <span>Accès Direction / Administrateur</span>
                  </div>
                  <p className="text-[11px] mt-1 text-[#5A5A40]">
                    Supervision complète de l'exploitation, gestion des utilisateurs, finances et rapports.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434333] mb-1.5">
                    Identifiant Administrateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8A6F]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={adminUsername}
                      onChange={(e) => {
                        setAdminUsername(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="admin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D1D1C4] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm bg-[#F9F9F6]"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#434333] mb-1.5">
                    Mot de passe Administrateur
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8A8A6F]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[#D1D1C4] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm bg-[#F9F9F6]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A8A6F] hover:text-[#434333]"
                      title={showAdminPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !adminUsername || !adminPassword}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#5A5A40] hover:bg-[#434333] active:scale-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                >
                  <span>{loading ? 'Vérification...' : 'Ouvrir Espace Administrateur'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Security and Cloud live sync badge */}
        <div className="text-center mt-5 text-xs text-[#8A8A6F] flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>Données sécurisées • Multi-utilisateurs en temps réel</span>
        </div>
      </div>
    </div>
  );
};
