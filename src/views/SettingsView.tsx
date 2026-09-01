import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Building,
  DollarSign,
  UserCheck,
  Save,
  RotateCcw,
  Package,
  BellRing,
  CheckCircle2,
  Lock,
  Cloud,
  RefreshCw,
  Trash2,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  Users,
  UserPlus,
  Edit2,
  X,
  Phone,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Dices,
  Download,
  Upload,
  Database,
  HardDrive,
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { AppUser, UserRole } from '../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    users,
    currentUser,
    updateSettings,
    setCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateAuthCredentials,
    resetAllDataToSample,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    restoreFromIndexedDBBackup,
    syncStatus,
    isFirebaseConnected,
    lastFirebaseSync,
    syncToFirebaseNow,
  } = useFarm();

  const [farmName, setFarmName] = useState(settings.farmName);
  const [currency, setCurrency] = useState(settings.currency);
  const [eggsPerTray, setEggsPerTray] = useState(settings.eggsPerTray);
  const [defaultTrayPrice, setDefaultTrayPrice] = useState(settings.defaultTrayPrice);
  const [defaultEggPrice, setDefaultEggPrice] = useState(settings.defaultEggPrice);
  const [location, setLocation] = useState(settings.location);
  const [phone, setPhone] = useState(settings.phone);
  const [managerName, setManagerName] = useState(settings.managerName);
  const [feedAlertThresholdBags, setFeedAlertThresholdBags] = useState(settings.feedAlertThresholdBags);
  const [lowLayingRateThreshold, setLowLayingRateThreshold] = useState(settings.lowLayingRateThreshold);

  // Security Credentials state
  const [adminUsername, setAdminUsername] = useState(settings.auth?.adminUsername || 'admin');
  const [adminPassword, setAdminPassword] = useState(settings.auth?.adminPassword || 'admin123');
  const [employeePassword, setEmployeePassword] = useState(settings.auth?.employeePassword || '1234');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);
  const [passwordSavedNotice, setPasswordSavedNotice] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // User Management Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Employé');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPinCode, setUserPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserName('');
    setUserRole('Employé');
    setUserEmail('');
    setUserPhone('');
    setUserPinCode('1234');
    setShowPin(true);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AppUser, focusPinOnly = false) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserRole(user.role);
    setUserEmail(user.email || '');
    setUserPhone(user.phone || '');
    setUserPinCode(user.pinCode || '');
    setShowPin(focusPinOnly);
    setIsUserModalOpen(true);
  };

  const handleGenerateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setUserPinCode(pin);
    setShowPin(true);
  };

  const handleSaveUserModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    if (editingUserId) {
      updateUser(editingUserId, {
        name: userName.trim(),
        role: userRole,
        email: userEmail.trim() || undefined,
        phone: userPhone.trim() || undefined,
        pinCode: userPinCode.trim() || undefined,
      });

      // If updating admin user, also sync main admin password
      if (userRole === 'Administrateur' && userPinCode.trim()) {
        updateAuthCredentials({ adminPassword: userPinCode.trim() });
      }

      await syncToFirebaseNow();
      setActionNotice(`Compte "${userName}" et mot de passe / PIN mis à jour avec succès !`);
    } else {
      addUser({
        name: userName.trim(),
        role: userRole,
        email: userEmail.trim() || undefined,
        phone: userPhone.trim() || undefined,
        pinCode: userPinCode.trim() || '1234',
        active: true,
      });
      await syncToFirebaseNow();
      setActionNotice(`Nouveau compte utilisateur "${userName}" créé avec succès !`);
    }

    setIsUserModalOpen(false);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleDeleteUserClick = async (user: AppUser) => {
    if (users.length <= 1) {
      alert('Impossible de supprimer le seul utilisateur existant.');
      return;
    }
    if (window.confirm(`Voulez-vous vraiment supprimer définitivement le compte de ${user.name} ?`)) {
      deleteUser(user.id);
      await syncToFirebaseNow();
      setActionNotice(`Compte de ${user.name} supprimé.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleSavePasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    updateAuthCredentials({
      adminUsername,
      adminPassword,
      employeePassword,
    });

    // Sync admin in users list
    const adminUser = users.find((u) => u.role === 'Administrateur' || u.role === 'admin');
    if (adminUser) {
      updateUser(adminUser.id, { pinCode: adminPassword });
    }

    await syncToFirebaseNow();
    setPasswordSavedNotice(true);
    setActionNotice('Identifiant Administrateur et Mots de Passe enregistrés & synchronisés en direct !');
    setTimeout(() => {
      setPasswordSavedNotice(false);
      setActionNotice(null);
    }, 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      farmName,
      currency,
      eggsPerTray,
      defaultTrayPrice,
      defaultEggPrice,
      location,
      phone,
      managerName,
      feedAlertThresholdBags,
      lowLayingRateThreshold,
      auth: {
        adminUsername,
        adminPassword,
        employeePassword,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFullClear = async () => {
    const confirmation = window.confirm(
      '⚠️ ATTENTION : Voulez-vous vraiment TOUT RÉINITIALISER et VIDER la base de données (0 lot, 0 production, 0 vente) ? Cette action est irréversible.'
    );
    if (confirmation) {
      await clearAllData();
      setActionNotice('Toutes les données ont été réinitialisées et vidées avec succès !');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleResetDemo = async () => {
    const confirmation = window.confirm(
      'Voulez-vous réinitialiser l\'application avec les données démo initiales (comptage en alvéoles et sacs) ?'
    );
    if (confirmation) {
      await resetAllDataToSample();
      setActionNotice('Données réinitialisées avec succès aux valeurs modèles (alvéoles et sacs) !');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleManualSync = async () => {
    await syncToFirebaseNow();
    setActionNotice('Synchronisation avec Firebase Firestore effectuée !');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDownloadBackup = () => {
    try {
      const dataStr = exportDataJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `sauvegarde_ferme_${farmName.toLowerCase().replace(/\s+/g, '_')}_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setActionNotice('Fichier de sauvegarde téléchargé avec succès sur votre appareil !');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (e) {
      console.error('Download backup failed:', e);
      alert('Erreur lors du téléchargement de la sauvegarde.');
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const ok = importDataJSON(content);
        if (ok) {
          await syncToFirebaseNow();
          setActionNotice('Sauvegarde restaurée et synchronisée avec succès !');
          setTimeout(() => setActionNotice(null), 4000);
        } else {
          alert('Le fichier sélectionné est invalide ou corrompu.');
        }
      } catch (err) {
        console.error('Error importing backup:', err);
        alert('Erreur lors de la lecture du fichier de sauvegarde.');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can re-import same file if needed
    event.target.value = '';
  };

  const handleRestoreFromLocalIndexedDB = async () => {
    const confirmation = window.confirm(
      'Voulez-vous restaurer vos données à partir de la base de secours locale sécurisée (IndexedDB) ?'
    );
    if (!confirmation) return;

    const ok = await restoreFromIndexedDBBackup();
    if (ok) {
      setActionNotice('Données récupérées avec succès depuis la base locale IndexedDB !');
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      alert('Aucune sauvegarde locale exploitable trouvée dans le cache IndexedDB.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Administrateur':
      case 'admin':
        return { label: 'Administrateur / Direction', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'Agent Terrain / Ramassage', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      {/* Header bar */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#434333]">
          Paramètres & Configuration de la Ferme
        </h2>
        <p className="text-xs sm:text-sm text-[#8A8A6F]">
          Personnalisation des informations d'exploitation, équipe multi-utilisateurs et synchronisation temps réel
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Cloud Persistence & Firebase Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#434333] font-serif">
                Persistance Cloud Firebase Firestore (Temps Réel)
              </h3>
              <p className="text-xs text-[#8A8A6F]">
                Synchronisation instantanée entre téléphones portables et ordinateurs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isFirebaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isFirebaseConnected ? 'Firebase Connecté' : 'Mode Local / En attente'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
            <span className="text-[10px] text-[#8A8A6F] block">Statut de Synchro</span>
            <span className="font-bold text-[#2D2D2D] font-mono capitalize">
              {syncStatus === 'synced' ? '✅ À jour en direct' : syncStatus === 'syncing' ? '🔄 En cours...' : '⚠️ Erreur synchro'}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
            <span className="text-[10px] text-[#8A8A6F] block">Dernière Sauvegarde Cloud</span>
            <span className="font-bold text-[#5A5A40] font-mono">
              {lastFirebaseSync || 'À l\'instant'}
            </span>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleManualSync}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs transition-all shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Forcer Synchro Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEAM & MULTI-USER MANAGEMENT CARD */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#434333] font-serif">
                Gestion des Comptes Utilisateurs & Équipe
              </h3>
              <p className="text-xs text-[#8A8A6F]">
                L'administrateur peut créer de nouveaux comptes, changer les mots de passe / PIN et définir les rôles
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-add-user"
            onClick={handleOpenAddUser}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Ajouter un Nouveau Compte</span>
          </button>
        </div>

        {/* Users list table / cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {users.map((user) => {
            const badge = getRoleBadge(user.role);
            const isActive = user.active !== false;

            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-[#FDFDFB] border-[#D1D1C4] hover:border-[#5A5A40]'
                    : 'bg-[#F5F5F0] border-[#E5E5DE] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#434333] flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {currentUser?.id === user.id && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                            (Vous)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            isActive ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isActive ? '● Actif' : '○ Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditUser(user, true)}
                      title="Changer le mot de passe / code PIN"
                      className="px-2 py-1.5 rounded-lg text-xs font-semibold text-[#5A5A40] hover:bg-[#EAEAE0] flex items-center gap-1 border border-[#D1D1C4]"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span className="hidden sm:inline">Changer PIN</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditUser(user, false)}
                      title="Modifier les informations"
                      className="p-1.5 rounded-lg text-[#8A8A6F] hover:text-[#5A5A40] hover:bg-[#EAEAE0]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {users.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteUserClick(user)}
                        title="Supprimer ce compte"
                        className="p-1.5 rounded-lg text-[#8A8A6F] hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E5DE] text-[11px] text-[#8A8A6F] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>PIN / Accès : <strong className="font-mono text-[#2D2D2D]">••••</strong></span>
                    {user.phone && <span className="text-[10px] text-[#8A8A6F]">({user.phone})</span>}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleUserStatus(user.id)}
                    className="text-[10px] font-semibold text-[#5A5A40] hover:underline"
                  >
                    {isActive ? 'Désactiver' : 'Réactiver'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & Access Credentials Configuration (Admin + General Passwords) */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#434333] font-serif">
                Changer le Mot de Passe Administrateur & Accès Général
              </h3>
              <p className="text-xs text-[#8A8A6F]">
                Modifiez immédiatement votre mot de passe administrateur ou les codes de secours
              </p>
            </div>
          </div>

          {passwordSavedNotice && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mots de passe mis à jour !</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSavePasswords} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Admin Credentials */}
            <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                  👑
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#2D2D2D]">Compte Administrateur Principal (Direction)</h4>
                  <p className="text-[10px] text-[#8A8A6F]">Accès complet : paramètres, finances, gestion des comptes</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[#434333] font-semibold mb-1">Identifiant Admin</label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] font-mono text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#434333] font-semibold mb-1">Nouveau Mot de Passe Administrateur</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-[#D1D1C4] rounded-xl pl-3 pr-10 py-2 text-[#2D2D2D] font-mono text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
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
              </div>
            </div>

            {/* Employee Default Credentials */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  👷
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">Code PIN Général Terrain / Secours</h4>
                  <p className="text-[10px] text-emerald-800">Code PIN par défaut pour connexion rapide</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[#434333] font-semibold mb-1">
                    Code PIN Général Terrain (4 chiffres)
                  </label>
                  <div className="relative">
                    <input
                      type={showEmployeePassword ? 'text' : 'password'}
                      required
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      placeholder="••••"
                      className="w-full bg-white border border-emerald-300 rounded-xl pl-3 pr-10 py-2 text-[#2D2D2D] font-mono text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A8A6F] hover:text-[#434333]"
                      title={showEmployeePassword ? 'Masquer' : 'Afficher'}
                    >
                      {showEmployeePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    Permet aux agents de terrain d'enregistrer la ponte et la mortalité même sans PIN spécifique.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs shadow-xs active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer & Mettre à Jour les Mots de Passe</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Farm Identity */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="text-base font-bold text-[#434333] font-serif">
              Identité de l'Exploitation Avicole
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Nom de la Ferme / Entreprise *</label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Nom du Gérant / Éleveur *</label>
              <input
                type="text"
                required
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Localisation / Ville / Région</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Téléphone de Contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency and Standard Units */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="text-base font-bold text-[#434333] font-serif">
              Monnaie & Unités de Production
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Devise Principale</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Œufs par Alvéole / Plateau</label>
              <input
                type="number"
                min="1"
                required
                value={eggsPerTray}
                onChange={(e) => setEggsPerTray(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Prix Indicatif / Alvéole</label>
              <input
                type="number"
                min="1"
                required
                value={defaultTrayPrice}
                onChange={(e) => setDefaultTrayPrice(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">Prix Indicatif Œuf Unitaire</label>
              <input
                type="number"
                min="1"
                required
                value={defaultEggPrice}
                onChange={(e) => setDefaultEggPrice(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="text-base font-bold text-[#434333] font-serif">
              Seuils d'Alerte Intelligents
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#434333] font-semibold mb-1">
                Alerte Stock Aliment Bas (nombre de sacs de 50kg)
              </label>
              <input
                type="number"
                min="1"
                value={feedAlertThresholdBags}
                onChange={(e) => setFeedAlertThresholdBags(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
              <span className="text-[10px] text-[#8A8A6F] mt-1 block">
                Déclenche un avertissement en bannière lorsque le stock passe en dessous
              </span>
            </div>
            <div>
              <label className="block text-[#434333] font-semibold mb-1">
                Alerte Baisse Taux de Ponte (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={lowLayingRateThreshold}
                onChange={(e) => setLowLayingRateThreshold(Number(e.target.value))}
                className="w-full bg-white border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs font-mono focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
              />
              <span className="text-[10px] text-[#8A8A6F] mt-1 block">
                Signale une anomalie sanitaire si la ponte journalière passe sous ce seuil
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-medium text-xs shadow-xs active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Paramètres</span>
          </button>
        </div>
      </form>

      {/* Data Protection, Multi-Layer Persistence & Backup Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#434333] font-serif flex items-center gap-2">
                <span>Sécurité & Persistance des Données (Garantie Zéro Perte)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-emerald-100 text-emerald-800">
                  Quadruple Protection Active
                </span>
              </h3>
              <p className="text-xs text-[#8A8A6F]">
                Vos données sont enregistrées en temps réel sur 4 niveaux : Cloud Firestore, IndexedDB local, Double LocalStorage et Sauvegarde Fichier
              </p>
            </div>
          </div>
        </div>

        {/* Protection badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <Cloud className="w-3.5 h-3.5" />
              <span>1. Cloud Firestore</span>
            </div>
            <p className="text-[11px] text-[#434333] leading-snug">
              Base distante permanente hébergée sur Google Cloud. Synchronise PC et téléphones.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <Database className="w-3.5 h-3.5" />
              <span>2. Cache IndexedDB</span>
            </div>
            <p className="text-[11px] text-[#434333] leading-snug">
              Base locale de votre navigateur avec persistance multi-onglets garantie.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <HardDrive className="w-3.5 h-3.5" />
              <span>3. Double Clé Locale</span>
            </div>
            <p className="text-[11px] text-[#434333] leading-snug">
              Miroir de secours LocalStorage rechargé instantanément en cas de coupure.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
              <Save className="w-3.5 h-3.5" />
              <span>4. Auto-Sauvegarde</span>
            </div>
            <p className="text-[11px] text-[#434333] leading-snug">
              Sauvegarde automatique à la fermeture d'onglet ou verrouillage d'écran.
            </p>
          </div>
        </div>

        {/* Action Buttons for Backup & Restore */}
        <div className="pt-2 border-t border-[#E5E5DE] grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#434333] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger Sauvegarde Complète (JSON)</span>
          </button>

          {/* Import JSON */}
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#D1D1C4] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer text-center">
            <Upload className="w-4 h-4 text-[#5A5A40]" />
            <span>Restaurer depuis un Fichier JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Restore IndexedDB */}
          <button
            type="button"
            onClick={handleRestoreFromLocalIndexedDB}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-[#F5F5F0] text-emerald-800 border border-emerald-300 text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-emerald-700" />
            <span>Restaurer Secours Local (IndexedDB)</span>
          </button>
        </div>
      </div>

      {/* Firebase Cloud Synchronization Section */}
      <div className="p-6 rounded-3xl bg-white border border-[#E5E5DE] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#434333] font-serif flex items-center gap-2">
                <span>Synchronisation Cloud Firebase (Firestore)</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-100 text-emerald-800'
                      : syncStatus === 'syncing'
                      ? 'bg-blue-100 text-blue-800 animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {syncStatus === 'synced' ? '● Connecté & En Direct' : syncStatus === 'syncing' ? '● En cours de synchro...' : '○ Hors Ligne'}
                </span>
              </h3>
              <p className="text-xs text-[#8A8A6F]">
                Toutes vos données (lots, ramassages, ventes, stocks, caisse) sont persistées en temps réel sur Google Cloud Firestore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const ok = await syncToFirebaseNow();
              if (ok) {
                setActionNotice('Synchronisation Cloud effectuée avec succès !');
                setTimeout(() => setActionNotice(null), 3000);
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#434333] text-white font-semibold text-xs transition-all shadow-xs active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>Synchroniser Maintenant</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A6F] block">
              Projet Cloud
            </span>
            <div className="font-mono font-bold text-[#2D2D2D] text-xs">crucial-spider-zhh41</div>
            <span className="text-[10px] text-emerald-700 font-semibold">✓ Base Provisionnée</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A6F] block">
              Base Firestore ID
            </span>
            <div className="font-mono font-bold text-[#2D2D2D] text-[11px] truncate" title="ai-studio-gestionpoulaille-53ee6dcc-f7b0-4234-8fb9-0e8d54c8b10f">
              ai-studio-gestionpoulaille
            </div>
            <span className="text-[10px] text-[#8A8A6F]">Multi-appareils actif</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F9F9F6] border border-[#E5E5DE] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A6F] block">
              Dernière Synchro Cloud
            </span>
            <div className="font-mono font-bold text-[#2D2D2D] text-xs">
              {lastFirebaseSync || 'En continu'}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {isFirebaseConnected ? '✓ Connexion active' : 'Mode hors-ligne'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone / Reset Database Section */}
      <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-700" />
          <h3 className="text-base font-bold font-serif">
            Zone de Réinitialisation des Données
          </h3>
        </div>
        <p className="text-xs text-rose-700">
          Actions d'administration pour réinitialiser ou vider intégralement la base de données locale et Firebase Firestore.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleFullClear}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tout Vider / Réinitialiser à Zéro (0 Donnée)</span>
          </button>

          <button
            type="button"
            onClick={handleResetDemo}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#D1D1C4] text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-[#5A5A40]" />
            <span>Réinitialiser avec Données Modèles (Alvéoles & Sacs)</span>
          </button>
        </div>
      </div>

      {/* USER MANAGEMENT MODAL */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D1D1C4] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="font-bold font-serif text-base text-[#434333]">
                  {editingUserId ? 'Modifier le Collaborateur' : 'Ajouter un Collaborateur'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-[#8A8A6F] hover:text-[#434333]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#434333] mb-1">
                  Nom complet du Collaborateur *
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Mamadou Diallo"
                  className="w-full bg-[#F9F9F6] border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#434333] mb-1">
                  Rôle & Permissions *
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full bg-[#F9F9F6] border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] focus:ring-2 focus:ring-[#5A5A40] focus:outline-none font-medium"
                >
                  <option value="Employé">Agent de Ramassage / Employé (Terrain : ponte & mortalités)</option>
                  <option value="Administrateur">Administrateur / Direction (Accès complet à tous les modules)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#434333]">
                    Code PIN / Mot de Passe de Connexion *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPin}
                    className="text-[10px] text-[#5A5A40] hover:text-[#434333] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Dices className="w-3 h-3" />
                    <span>Générer un PIN</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={userPinCode}
                    onChange={(e) => setUserPinCode(e.target.value)}
                    placeholder="Ex: 1234 ou mot de passe"
                    className="w-full bg-[#F9F9F6] border border-[#D1D1C4] rounded-xl pl-3 pr-10 py-2 text-[#2D2D2D] font-mono tracking-widest font-bold focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8A8A6F] hover:text-[#434333]"
                    title={showPin ? 'Masquer' : 'Afficher'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#8A8A6F] mt-1">
                  Ce code secret (au moins 4 caractères ou chiffres) servira pour ouvrir la session de cet utilisateur.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#434333] mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Ex: 77 123 45 67"
                    className="w-full bg-[#F9F9F6] border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#434333] mb-1">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Ex: diallo@ferme.com"
                    className="w-full bg-[#F9F9F6] border border-[#D1D1C4] rounded-xl px-3 py-2 text-[#2D2D2D] text-xs focus:ring-2 focus:ring-[#5A5A40] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D1D1C4] text-[#434333] font-medium hover:bg-[#F5F5F0]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-xs active:scale-95"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
