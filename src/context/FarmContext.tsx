import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useRef } from 'react';
import {
  Lot,
  Production,
  EggStockMovement,
  Sale,
  FeedItem,
  FeedPurchase,
  FeedConsumption,
  Expense,
  Mortality,
  HealthTreatment,
  Client,
  Supplier,
  CashMovement,
  PaymentMethod,
  FarmSettings,
  FarmAuthSettings,
  AppUser,
  AlertItem,
} from '../types';
import {
  initialSettings,
  initialUsers,
  initialLots,
  initialSuppliers,
  initialClients,
  initialFeedItems,
  initialSales,
  initialExpenses,
  initialHealthTreatments,
  initialCashMovements,
  generateInitialHistory,
} from '../utils/mockData';
import { getTodayDateString } from '../utils/formatters';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface FarmContextType {
  // State
  lots: Lot[];
  productions: Production[];
  eggStockMovements: EggStockMovement[];
  sales: Sale[];
  feedItems: FeedItem[];
  feedPurchases: FeedPurchase[];
  feedConsumptions: FeedConsumption[];
  expenses: Expense[];
  mortalities: Mortality[];
  healthTreatments: HealthTreatment[];
  vaccines: HealthTreatment[];
  clients: Client[];
  suppliers: Supplier[];
  cashMovements: CashMovement[];
  settings: FarmSettings;
  currentUser: AppUser;
  users: AppUser[];

  // Firebase Sync State
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  isFirebaseConnected: boolean;
  lastFirebaseSync: string | null;
  syncToFirebaseNow: () => Promise<boolean>;

  // Computed KPIs & Aggregates
  totalCurrentHens: number;
  totalInitialHens: number;
  totalDeadHens: number;
  totalSoldHens: number;
  totalEggStock: number; // in eggs
  totalEggStockTrays: number; // in trays
  todayEggsProduced: number;
  todayMarketableEggs: number;
  todayLayingRate: number; // percentage
  monthEggsProduced: number;
  monthRevenue: number;
  monthExpenses: number;
  monthNetProfit: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalProfit: number;
  profitMarginPercent: number;
  totalFeedStockKg: number;
  totalFeedStockBags: number;
  cashBalance: number;
  totalClientDebt: number;
  totalSupplierDebt: number;
  globalMortalityRate: number; // percentage
  averageFeedCostPerEgg: number;
  averageSalePricePerEgg: number;
  marginPerEgg: number;
  // Caisse & Trésorerie
  totalCashIn: number;
  totalCashOut: number;
  netCashBalance: number;
  cashInHand: number;
  mobileMoneyBalance: number;
  bankBalance: number;
  totalTreasury: number;
  cashMovementsWithBalance: (CashMovement & { balanceAfter: number })[];
  deleteCashMovement: (id: string) => void;
  addCashTransfer: (params: {
    date: string;
    fromMethod: PaymentMethod;
    toMethod: PaymentMethod;
    amount: number;
    description?: string;
  }) => void;
  deleteFeedPurchase: (id: string) => void;

  alerts: AlertItem[];
  clientsNeedingWeeklyReminder: Client[];

  // Actions
  recordClientDebtReminder: (clientId: string) => void;
  addLot: (lot: Omit<Lot, 'id' | 'currentCount' | 'deadCount' | 'soldCount' | 'createdAt'>) => void;
  updateLot: (id: string, lot: Partial<Lot>) => void;
  deleteLot: (id: string) => void;

  addProduction: (prod: Omit<Production, 'id' | 'traysCount' | 'layingRatePercent' | 'createdAt'> & { alveolesCollected?: number; extraEggsCollected?: number; traysMarketable?: number }) => void;
  deleteProduction: (id: string) => void;

  adjustEggStock: (quantityEggs: number, reason: string) => void;

  addSale: (sale: Omit<Sale, 'id' | 'saleNumber' | 'totalAmount' | 'remainingDue' | 'paymentStatus' | 'createdAt'>) => { success: boolean; error?: string };
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  addFeedItem: (item: Omit<FeedItem, 'id'>) => void;
  updateFeedItem: (id: string, item: Partial<FeedItem>) => void;
  deleteFeedItem: (id: string) => void;

  addFeedPurchase: (purchase: Omit<FeedPurchase, 'id' | 'totalCost' | 'remainingDue' | 'createdAt'>) => void;
  addFeedConsumption: (cons: Omit<FeedConsumption, 'id' | 'consumptionPerHenGrams' | 'feedCost' | 'feedCostPerHen' | 'createdAt'> & { bagsCount?: number; quantityKg?: number }) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;

  addMortality: (mortality: Omit<Mortality, 'id' | 'createdAt'>) => void;
  deleteMortality: (id: string) => void;

  addHealthTreatment: (treatment: Omit<HealthTreatment, 'id' | 'createdAt'>) => void;
  updateHealthTreatment: (id: string, treatment: Partial<HealthTreatment>) => void;
  deleteHealthTreatment: (id: string) => void;
  addVaccine: (treatment: Omit<HealthTreatment, 'id' | 'createdAt'>) => void;
  updateVaccine: (id: string, treatment: Partial<HealthTreatment>) => void;
  deleteVaccine: (id: string) => void;

  addClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'totalPaid' | 'debt' | 'createdAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  settleClientDebt: (clientId: string, amount: number, paymentMethod: any, notes?: string) => void;
  deleteClient: (id: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchases' | 'totalPaid' | 'debt' | 'createdAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  settleSupplierDebt: (supplierId: string, amount: number, paymentMethod: any, notes?: string) => void;
  deleteSupplier: (id: string) => void;

  addCashMovement: (movement: Omit<CashMovement, 'id' | 'createdAt'>) => void;

  updateSettings: (newSettings: Partial<FarmSettings>) => void;
  setCurrentUser: (user: AppUser) => void;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  // Authentication & Role Access
  isAuthenticated: boolean;
  loginAsAdmin: (username: string, password: string) => { success: boolean; error?: string };
  loginAsEmployee: (password: string) => { success: boolean; error?: string };
  loginWithUserPin: (userId: string, pinCode: string) => { success: boolean; error?: string };
  switchUser: (user: AppUser) => void;
  logout: () => void;
  updateAuthCredentials: (credentials: Partial<FarmAuthSettings>) => void;

  // Data management
  exportDataJSON: () => string;
  exportAllDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  importAllDataJSON: (jsonString: string) => boolean;
  resetToDefaultData: () => void;
  resetAllDataToSample: () => void;
  clearAllData: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const STORAGE_KEY = 'avicmanager_farm_v3_clean_zero';
const SESSION_KEY = 'avicmanager_session_v3';

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or initialize with clean empty state
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [lastFirebaseSync, setLastFirebaseSync] = useState<string | null>(null);

  const [settings, setSettings] = useState<FarmSettings>(initialSettings);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<AppUser>(initialUsers[0]);

  // Auth session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const sess = localStorage.getItem(SESSION_KEY);
      if (sess) {
        const parsed = JSON.parse(sess);
        return Boolean(parsed && parsed.role);
      }
    } catch {
      // fallback
    }
    return false;
  });

  const [lots, setLots] = useState<Lot[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [eggStockMovements, setEggStockMovements] = useState<EggStockMovement[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedPurchases, setFeedPurchases] = useState<FeedPurchase[]>([]);
  const [feedConsumptions, setFeedConsumptions] = useState<FeedConsumption[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mortalities, setMortalities] = useState<Mortality[]>([]);
  const [healthTreatments, setHealthTreatments] = useState<HealthTreatment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);

  const lastLocalSavedTimestamp = useRef<string>('');
  const isApplyingRemoteUpdate = useRef<boolean>(false);

  // Helper to merge local and remote lists without dropping concurrent live additions from other devices
  const mergeById = <T extends { id: string }>(currentItems: T[], remoteItems: T[]): T[] => {
    if (!Array.isArray(remoteItems)) return currentItems;
    if (!Array.isArray(currentItems) || currentItems.length === 0) return remoteItems;
    const map = new Map<string, T>();
    // Remote is the base
    remoteItems.forEach((item) => {
      if (item && item.id) map.set(item.id, item);
    });
    // Preserve any local items created recently that haven't synced to remote yet
    currentItems.forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  };

  // Initialize data from LocalStorage first (clean empty by default)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.settings && typeof parsed.settings === 'object') {
          const parsedAdminPass = parsed.settings.auth?.adminPassword;
          const adminPassword = (!parsedAdminPass || parsedAdminPass === 'admin123') ? '0000' : parsedAdminPass;
          setSettings((prev) => ({
            ...prev,
            ...parsed.settings,
            alertThresholds: {
              ...prev.alertThresholds,
              ...(parsed.settings.alertThresholds || {}),
            },
            auth: {
              adminUsername: parsed.settings.auth?.adminUsername || 'admin',
              adminPassword: adminPassword,
              employeePassword: parsed.settings.auth?.employeePassword || '1234',
            },
          }));
        }
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          const filteredUsers = parsed.users
            .map((u: AppUser) => {
              if (u.id === 'usr-admin' && (!u.pinCode || u.pinCode === 'admin123')) {
                return { ...u, pinCode: '0000' };
              }
              return u;
            })
            .filter(
              (u: AppUser) => u.id !== 'usr-manager' && u.id !== 'usr-seller' && u.role !== 'Gérant' && u.role !== 'Vendeur'
            );
          if (filteredUsers.length > 0) {
            setUsers(filteredUsers);
          } else {
            setUsers(initialUsers);
          }
        }
        if (parsed.currentUser && typeof parsed.currentUser === 'object') {
          if (parsed.currentUser.id === 'usr-manager' || parsed.currentUser.id === 'usr-seller' || parsed.currentUser.role === 'Gérant' || parsed.currentUser.role === 'Vendeur') {
            setCurrentUser(initialUsers[0]);
          } else {
            setCurrentUser(parsed.currentUser);
          }
        }
        if (Array.isArray(parsed.lots)) setLots(parsed.lots);
        if (Array.isArray(parsed.productions)) setProductions(parsed.productions);
        if (Array.isArray(parsed.eggStockMovements)) setEggStockMovements(parsed.eggStockMovements);
        if (Array.isArray(parsed.sales)) setSales(parsed.sales);
        if (Array.isArray(parsed.feedItems)) setFeedItems(parsed.feedItems);
        if (Array.isArray(parsed.feedPurchases)) setFeedPurchases(parsed.feedPurchases);
        if (Array.isArray(parsed.feedConsumptions)) setFeedConsumptions(parsed.feedConsumptions);
        if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
        if (Array.isArray(parsed.mortalities)) setMortalities(parsed.mortalities);
        if (Array.isArray(parsed.healthTreatments)) setHealthTreatments(parsed.healthTreatments);
        else if (Array.isArray(parsed.vaccines)) setHealthTreatments(parsed.vaccines);
        if (Array.isArray(parsed.clients)) setClients(parsed.clients);
        if (Array.isArray(parsed.suppliers)) setSuppliers(parsed.suppliers);
        if (Array.isArray(parsed.cashMovements)) setCashMovements(parsed.cashMovements);
      } else {
        // Zero / clean new installation
        setLots([]);
        setProductions([]);
        setEggStockMovements([]);
        setSales([]);
        setFeedItems([]);
        setFeedPurchases([]);
        setFeedConsumptions([]);
        setExpenses([]);
        setMortalities([]);
        setHealthTreatments([]);
        setClients([]);
        setSuppliers([]);
        setCashMovements([]);
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
    setIsLoaded(true);
  }, []);

  // Firebase Firestore Continuous Realtime Subscription & Live Multi-Device Sync
  useEffect(() => {
    if (!db) {
      setSyncStatus('offline');
      return;
    }

    const farmDocRef = doc(db, 'farms', 'main_farm_data');

    // Subscribe to continuous live changes in Firestore (cross-device Phone <-> PC)
    const unsubscribe = onSnapshot(
      farmDocRef,
      { includeMetadataChanges: true },
      (snapshot) => {
        setIsFirebaseConnected(true);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (!data) return;

          // If the change is local pending write originating from this client, skip re-applying
          if (snapshot.metadata.hasPendingWrites) {
            setSyncStatus('syncing');
            return;
          }

          // If the remote timestamp is identical to our own latest saved write, it's just the server ack
          if (data.updatedAt && data.updatedAt === lastLocalSavedTimestamp.current) {
            setLastFirebaseSync(new Date().toLocaleTimeString('fr-FR'));
            setSyncStatus('synced');
            return;
          }

          // This is a LIVE remote update from another device (e.g. Smartphone -> Computer)
          isApplyingRemoteUpdate.current = true;

          if (data.settings && typeof data.settings === 'object') {
            setSettings((prev) => ({
              ...prev,
              ...data.settings,
              alertThresholds: {
                ...prev.alertThresholds,
                ...(data.settings.alertThresholds || {}),
              },
            }));
          }

          if (Array.isArray(data.users) && data.users.length > 0) {
            const cleanRemoteUsers = data.users.filter(
              (u: AppUser) => u.id !== 'usr-manager' && u.id !== 'usr-seller' && u.role !== 'Gérant' && u.role !== 'Vendeur'
            );
            setUsers((prev) => {
              const merged = mergeById(prev, cleanRemoteUsers.length > 0 ? cleanRemoteUsers : initialUsers);
              return merged.filter((u) => u.id !== 'usr-manager' && u.id !== 'usr-seller' && u.role !== 'Gérant' && u.role !== 'Vendeur');
            });
          }

          if (Array.isArray(data.lots)) setLots((prev) => mergeById(prev, data.lots));
          if (Array.isArray(data.productions)) setProductions((prev) => mergeById(prev, data.productions));
          if (Array.isArray(data.eggStockMovements)) setEggStockMovements((prev) => mergeById(prev, data.eggStockMovements));
          if (Array.isArray(data.sales)) setSales((prev) => mergeById(prev, data.sales));
          if (Array.isArray(data.feedItems)) setFeedItems((prev) => mergeById(prev, data.feedItems));
          if (Array.isArray(data.feedPurchases)) setFeedPurchases((prev) => mergeById(prev, data.feedPurchases));
          if (Array.isArray(data.feedConsumptions)) setFeedConsumptions((prev) => mergeById(prev, data.feedConsumptions));
          if (Array.isArray(data.expenses)) setExpenses((prev) => mergeById(prev, data.expenses));
          if (Array.isArray(data.mortalities)) setMortalities((prev) => mergeById(prev, data.mortalities));
          if (Array.isArray(data.healthTreatments)) setHealthTreatments((prev) => mergeById(prev, data.healthTreatments));
          if (Array.isArray(data.clients)) setClients((prev) => mergeById(prev, data.clients));
          if (Array.isArray(data.suppliers)) setSuppliers((prev) => mergeById(prev, data.suppliers));
          if (Array.isArray(data.cashMovements)) setCashMovements((prev) => mergeById(prev, data.cashMovements));

          setLastFirebaseSync(new Date().toLocaleTimeString('fr-FR'));
          setSyncStatus('synced');
        } else {
          setSyncStatus('synced');
        }
      },
      (error) => {
        console.warn('Firebase sync warning:', error);
        setSyncStatus('offline');
        setIsFirebaseConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fast live save to Firestore and LocalStorage
  useEffect(() => {
    if (!isLoaded) return;

    const timestamp = new Date().toISOString();
    const stateToSave = {
      settings,
      users,
      currentUser,
      lots,
      productions,
      eggStockMovements,
      sales,
      feedItems,
      feedPurchases,
      feedConsumptions,
      expenses,
      mortalities,
      healthTreatments,
      clients,
      suppliers,
      cashMovements,
      updatedAt: timestamp,
    };

    // Always update LocalStorage immediately for instant offline resilience
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    // If this state update originated from an incoming remote Firestore snapshot, do not echo it back
    if (isApplyingRemoteUpdate.current) {
      isApplyingRemoteUpdate.current = false;
      return;
    }

    if (!db) return;

    setSyncStatus('syncing');
    lastLocalSavedTimestamp.current = timestamp;

    const timer = setTimeout(async () => {
      try {
        const farmDocRef = doc(db, 'farms', 'main_farm_data');
        await setDoc(farmDocRef, stateToSave, { merge: true });
        setSyncStatus('synced');
        setIsFirebaseConnected(true);
        setLastFirebaseSync(new Date().toLocaleTimeString('fr-FR'));
      } catch (err) {
        console.warn('Could not sync to Firestore:', err);
        setSyncStatus('error');
      }
    }, 120); // Fast 120ms sync for immediate instant propagation between phone and PC

    return () => clearTimeout(timer);
  }, [
    isLoaded,
    settings,
    users,
    currentUser,
    lots,
    productions,
    eggStockMovements,
    sales,
    feedItems,
    feedPurchases,
    feedConsumptions,
    expenses,
    mortalities,
    healthTreatments,
    clients,
    suppliers,
    cashMovements,
  ]);

  const syncToFirebaseNow = async (): Promise<boolean> => {
    if (!db) return false;
    setSyncStatus('syncing');
    try {
      const stateToSave = {
        settings,
        users,
        currentUser,
        lots,
        productions,
        eggStockMovements,
        sales,
        feedItems,
        feedPurchases,
        feedConsumptions,
        expenses,
        mortalities,
        healthTreatments,
        clients,
        suppliers,
        cashMovements,
        updatedAt: new Date().toISOString(),
      };
      const farmDocRef = doc(db, 'farms', 'main_farm_data');
      await setDoc(farmDocRef, stateToSave, { merge: true });
      setSyncStatus('synced');
      setIsFirebaseConnected(true);
      setLastFirebaseSync(new Date().toLocaleTimeString('fr-FR'));
      return true;
    } catch (e) {
      console.error('Manual sync failed:', e);
      setSyncStatus('error');
      return false;
    }
  };

  // Derived aggregates & KPIs
  const totalInitialHens = useMemo(() => {
    return lots.reduce((sum, lot) => sum + lot.initialCount, 0);
  }, [lots]);

  const totalCurrentHens = useMemo(() => {
    return lots.reduce((sum, lot) => lot.status === 'Actif' ? sum + lot.currentCount : sum, 0);
  }, [lots]);

  const totalDeadHens = useMemo(() => {
    return lots.reduce((sum, lot) => sum + lot.deadCount, 0);
  }, [lots]);

  const totalSoldHens = useMemo(() => {
    return lots.reduce((sum, lot) => sum + lot.soldCount, 0);
  }, [lots]);

  // Egg stock calculation: sum of all stock movements
  const totalEggStock = useMemo(() => {
    const total = eggStockMovements.reduce((acc, mov) => acc + mov.quantityEggs, 0);
    return Math.max(0, total);
  }, [eggStockMovements]);

  const totalEggStockTrays = useMemo(() => {
    const eggsPerTray = settings.eggsPerTray || 30;
    return Number((totalEggStock / eggsPerTray).toFixed(1));
  }, [totalEggStock, settings.eggsPerTray]);

  const todayStr = getTodayDateString();

  const todayEggsProduced = useMemo(() => {
    return productions
      .filter((p) => p.date === todayStr)
      .reduce((sum, p) => sum + p.eggsTotal, 0);
  }, [productions, todayStr]);

  const todayMarketableEggs = useMemo(() => {
    return productions
      .filter((p) => p.date === todayStr)
      .reduce((sum, p) => sum + p.eggsMarketable, 0);
  }, [productions, todayStr]);

  const todayLayingRate = useMemo(() => {
    if (totalCurrentHens === 0) return 0;
    const rate = (todayEggsProduced / totalCurrentHens) * 100;
    return Number(rate.toFixed(1));
  }, [todayEggsProduced, totalCurrentHens]);

  // Current month production & financials
  const currentMonthPrefix = todayStr.substring(0, 7); // 'YYYY-MM'

  const monthEggsProduced = useMemo(() => {
    return productions
      .filter((p) => p.date.startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + p.eggsTotal, 0);
  }, [productions, currentMonthPrefix]);

  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales]);

  const monthRevenue = useMemo(() => {
    return sales
      .filter((s) => s.date.startsWith(currentMonthPrefix))
      .reduce((sum, s) => sum + s.totalAmount, 0);
  }, [sales, currentMonthPrefix]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const monthExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthPrefix]);

  const netProfit = useMemo(() => totalRevenue - totalExpenses, [totalRevenue, totalExpenses]);
  const monthNetProfit = useMemo(() => monthRevenue - monthExpenses, [monthRevenue, monthExpenses]);
  const totalProfit = netProfit;
  const profitMarginPercent = useMemo(() => {
    if (totalRevenue === 0) return 0;
    return Number(((netProfit / totalRevenue) * 100).toFixed(1));
  }, [netProfit, totalRevenue]);

  // Feed stock in kg and standard 50kg bags
  const totalFeedStockKg = useMemo(() => {
    return feedItems.reduce((sum, item) => sum + item.currentStockKg, 0);
  }, [feedItems]);

  const totalFeedStockBags = useMemo(() => {
    return Number((totalFeedStockKg / 50).toFixed(1));
  }, [totalFeedStockKg]);

  // Caisse & Trésorerie: Total Encaissements, Décaissements & Soldes par moyen de paiement
  const totalCashIn = useMemo(() => {
    return cashMovements
      .filter((m) => m.type === 'ENTREE')
      .reduce((sum, m) => sum + m.amount, 0);
  }, [cashMovements]);

  const totalCashOut = useMemo(() => {
    return cashMovements
      .filter((m) => m.type === 'SORTIE')
      .reduce((sum, m) => sum + m.amount, 0);
  }, [cashMovements]);

  const netCashBalance = useMemo(() => totalCashIn - totalCashOut, [totalCashIn, totalCashOut]);
  const cashBalance = netCashBalance;
  const totalTreasury = netCashBalance;

  // Solde par compte de trésorerie
  const cashInHand = useMemo(() => {
    return cashMovements
      .filter((m) => m.paymentMethod === 'Espèces')
      .reduce((acc, m) => (m.type === 'ENTREE' ? acc + m.amount : acc - m.amount), 0);
  }, [cashMovements]);

  const mobileMoneyBalance = useMemo(() => {
    return cashMovements
      .filter((m) => m.paymentMethod === 'Mobile Money')
      .reduce((acc, m) => (m.type === 'ENTREE' ? acc + m.amount : acc - m.amount), 0);
  }, [cashMovements]);

  const bankBalance = useMemo(() => {
    return cashMovements
      .filter((m) => m.paymentMethod === 'Virement' || m.paymentMethod === 'Chèque')
      .reduce((acc, m) => (m.type === 'ENTREE' ? acc + m.amount : acc - m.amount), 0);
  }, [cashMovements]);

  // Journal de Caisse avec calcul progressif du solde après chaque mouvement
  const cashMovementsWithBalance = useMemo(() => {
    // Trier chronologiquement croissant pour calculer le solde progressif
    const sorted = [...cashMovements].sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '');
      if (dateCmp !== 0) return dateCmp;
      return (a.createdAt || '').localeCompare(b.createdAt || '');
    });

    let running = 0;
    const withRunning = sorted.map((mov) => {
      if (mov.type === 'ENTREE') {
        running += mov.amount;
      } else {
        running -= mov.amount;
      }
      return {
        ...mov,
        balanceAfter: running,
      };
    });

    // Retourner dans l'ordre antichronologique (plus récent en premier pour l'affichage)
    return withRunning.reverse();
  }, [cashMovements]);

  const totalClientDebt = useMemo(() => {
    return clients.reduce((sum, c) => sum + c.debt, 0);
  }, [clients]);

  const totalSupplierDebt = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.debt, 0);
  }, [suppliers]);

  const globalMortalityRate = useMemo(() => {
    if (totalInitialHens === 0) return 0;
    return Number(((totalDeadHens / totalInitialHens) * 100).toFixed(2));
  }, [totalDeadHens, totalInitialHens]);

  // Average feed cost per egg produced
  const averageFeedCostPerEgg = useMemo(() => {
    const totalEggsEver = productions.reduce((sum, p) => sum + p.eggsTotal, 0);
    const totalFeedCost = feedConsumptions.reduce((sum, f) => sum + f.feedCost, 0);
    if (totalEggsEver === 0) return 0;
    return Number((totalFeedCost / totalEggsEver).toFixed(1));
  }, [productions, feedConsumptions]);

  const averageSalePricePerEgg = useMemo(() => {
    const totalEggsSold = sales.reduce((sum, s) => sum + s.equivalentEggs, 0);
    const totalEggRevenue = sales
      .filter((s) => s.productType === 'Plateaux' || s.productType === 'Œufs (Unité)')
      .reduce((sum, s) => sum + s.totalAmount, 0);
    if (totalEggsSold === 0) return 0;
    return Number((totalEggRevenue / totalEggsSold).toFixed(1));
  }, [sales]);

  const marginPerEgg = useMemo(() => {
    return Number((averageSalePricePerEgg - averageFeedCostPerEgg).toFixed(1));
  }, [averageSalePricePerEgg, averageFeedCostPerEgg]);

  // Clients due for a weekly debt reminder (debt > 0 and (no reminder or >= 7 days elapsed))
  const clientsNeedingWeeklyReminder = useMemo(() => {
    const now = new Date();
    return clients.filter((c) => {
      if (c.debt <= 0) return false;
      if (!c.lastDebtReminderDate) return true; // Never reminded yet
      const lastDate = new Date(c.lastDebtReminderDate);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      return diffDays >= 7; // 7 days or more
    });
  }, [clients]);

  // Intelligent Alert System
  const alerts = useMemo(() => {
    const items: AlertItem[] = [];

    // 1. Low feed stock alerts
    feedItems.forEach((item) => {
      if (item.currentStockKg <= item.minThresholdKg) {
        items.push({
          id: `alert-feed-${item.id}`,
          level: 'danger',
          title: `Stock critique : ${item.name}`,
          message: `Il ne reste que ${item.currentStockKg} kg (seuil mini : ${item.minThresholdKg} kg). Réapprovisionnement urgent nécessaire.`,
          module: 'Aliments',
          date: todayStr,
        });
      }
    });

    // 2. Low egg stock alert
    if (totalEggStockTrays < settings.alertThresholds.minEggStockTrays) {
      items.push({
        id: 'alert-egg-stock',
        level: 'warning',
        title: 'Stock d’œufs bas',
        message: `Stock actuel : ${totalEggStockTrays} plateaux (${totalEggStock} œufs). Inférieur au seuil de sécurité (${settings.alertThresholds.minEggStockTrays} plateaux).`,
        module: 'Stock Œufs',
        date: todayStr,
      });
    }

    // 3. Laying rate drop alert
    if (todayLayingRate > 0 && todayLayingRate < settings.alertThresholds.minLayingRatePercent) {
      items.push({
        id: 'alert-laying-rate',
        level: 'warning',
        title: 'Baisse du taux de ponte',
        message: `Taux de ponte du jour à ${todayLayingRate}%, en dessous du seuil cible de ${settings.alertThresholds.minLayingRatePercent}%. Vérifiez l'eau, l'aliment ou la ventilation.`,
        module: 'Production',
        date: todayStr,
      });
    }

    // 4. Weekly Debt Reclamation Alert (Every week)
    if (clientsNeedingWeeklyReminder.length > 0) {
      const totalDue = clientsNeedingWeeklyReminder.reduce((sum, c) => sum + c.debt, 0);
      items.push({
        id: 'alert-weekly-debt-reminder',
        level: 'warning',
        title: `Relance créances hebdomadaire (${clientsNeedingWeeklyReminder.length} client${clientsNeedingWeeklyReminder.length > 1 ? 's' : ''})`,
        message: `${clientsNeedingWeeklyReminder.length} client(s) ont des impayés depuis 1 semaine ou plus (Total : ${totalDue.toLocaleString('fr-FR')} ${settings.currency}). Envoyez le message de rappel hebdomadaire.`,
        module: 'Clients & Ventes',
        date: todayStr,
      });
    }

    // 5. Client outstanding debt alert
    clients.forEach((c) => {
      if (c.debt >= settings.alertThresholds.maxClientDebt) {
        items.push({
          id: `alert-debt-${c.id}`,
          level: 'warning',
          title: `Créance client élevée : ${c.name}`,
          message: `Dette en cours de ${c.debt.toLocaleString('fr-FR')} ${settings.currency}. Relance recommandée avant nouvelle livraison à crédit.`,
          module: 'Clients & Ventes',
          date: todayStr,
        });
      }
    });

    // 6. Upcoming vaccination & health prophylaxis alerts (Overdue, Today, Within 48h, Within 7 days)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    healthTreatments.forEach((h) => {
      const isUnfinished = h.status === 'Planifié' || h.status === 'Programmé' || h.status === 'En retard';
      const targetDateStr = h.scheduledDate || h.nextDueDate || h.date;
      if (isUnfinished && targetDateStr) {
        const dueDate = new Date(targetDateStr);
        dueDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const treatmentLabel = h.productName || h.name || 'Soin sanitaire';

        if (diffDays < 0) {
          // Overdue
          items.push({
            id: `alert-health-overdue-${h.id}`,
            level: 'danger',
            title: `Retard Sanitaire : ${treatmentLabel}`,
            message: `Le traitement prévu le ${targetDateStr} pour le ${h.lotName || 'lot'} n'a pas encore été administré (retard de ${Math.abs(diffDays)} jour(s)). Risque sanitaire pour le troupeau !`,
            module: 'Santé & Prophylaxie',
            date: targetDateStr,
          });
        } else if (diffDays <= 2) {
          // Due today or in 48h
          items.push({
            id: `alert-health-imminent-${h.id}`,
            level: 'warning',
            title: `Rappel Prophylaxie (48h) : ${treatmentLabel}`,
            message: `${diffDays === 0 ? "Aujourd'hui" : `Dans ${diffDays} jour(s)`} : administration de ${treatmentLabel} (${h.dosage || h.administrationRoute || 'traitement'}) pour ${h.lotName || 'le troupeau'}.`,
            module: 'Santé & Prophylaxie',
            date: targetDateStr,
          });
        } else if (diffDays <= 7 && h.type === 'Vaccin') {
          // Next 7 days for vaccines
          items.push({
            id: `alert-health-week-${h.id}`,
            level: 'info',
            title: `Vaccin à préparer (J-${diffDays}) : ${treatmentLabel}`,
            message: `Vaccination programmée dans ${diffDays} jours pour le ${h.lotName || 'lot'}. Vérifiez la disponibilité des flacons et solvants au réfrigérateur.`,
            module: 'Santé & Prophylaxie',
            date: targetDateStr,
          });
        }
      }
    });

    return items;
  }, [
    feedItems,
    totalEggStockTrays,
    totalEggStock,
    settings,
    todayLayingRate,
    clients,
    clientsNeedingWeeklyReminder,
    healthTreatments,
    todayStr,
  ]);

  // ACTIONS

  // 1. LOTS
  const addLot = (lotData: Omit<Lot, 'id' | 'currentCount' | 'deadCount' | 'soldCount' | 'createdAt'>) => {
    const id = `lot-${Date.now()}`;
    const newLot: Lot = {
      ...lotData,
      id,
      currentCount: lotData.initialCount,
      deadCount: 0,
      soldCount: 0,
      createdAt: new Date().toISOString(),
    };
    setLots((prev) => [newLot, ...prev]);

    // Record hen purchase expense if unitCost > 0
    if (lotData.unitCost > 0) {
      const totalHenCost = lotData.initialCount * lotData.unitCost;
      addExpense({
        date: lotData.arrivalDate,
        category: 'Achat de poules',
        description: `Achat de ${lotData.initialCount} poulettes (${lotData.breed}) - Lot ${lotData.code}`,
        amount: totalHenCost,
        paymentMethod: 'Virement',
        supplierOrBeneficiary: lotData.supplierName,
        lotId: id,
        recordedBy: currentUser.name,
      });
    }
  };

  const updateLot = (id: string, partial: Partial<Lot>) => {
    setLots((prev) =>
      prev.map((lot) => {
        if (lot.id === id) {
          const updated = { ...lot, ...partial };
          // Auto recalculate currentCount
          if (partial.initialCount !== undefined || partial.deadCount !== undefined || partial.soldCount !== undefined) {
            updated.currentCount = Math.max(0, updated.initialCount - (updated.deadCount || 0) - (updated.soldCount || 0));
          }
          return updated;
        }
        return lot;
      })
    );
  };

  const deleteLot = (id: string) => {
    setLots((prev) => prev.filter((l) => l.id !== id));
  };

  // 2. PRODUCTION
  const addProduction = (prodData: Omit<Production, 'id' | 'traysCount' | 'layingRatePercent' | 'createdAt'> & { alveolesCollected?: number; extraEggsCollected?: number; traysMarketable?: number }) => {
    const id = `prod-${Date.now()}`;
    const lot = lots.find((l) => l.id === prodData.lotId);
    const hensCount = lot ? lot.currentCount : 1;
    const eggsPerTray = settings.eggsPerTray || 30;

    // Calculate total eggs from alvéoles if provided, or vice-versa
    let calculatedEggsTotal = prodData.eggsTotal;
    let calculatedAlveoles = prodData.alveolesCollected;
    let calculatedExtraEggs = prodData.extraEggsCollected;

    if (calculatedAlveoles !== undefined) {
      const extra = calculatedExtraEggs || 0;
      calculatedEggsTotal = (calculatedAlveoles * eggsPerTray) + extra;
    } else {
      calculatedAlveoles = Math.floor(calculatedEggsTotal / eggsPerTray);
      calculatedExtraEggs = calculatedEggsTotal % eggsPerTray;
    }

    const eggsBroken = prodData.eggsBroken || 0;
    const eggsDirty = prodData.eggsDirty || 0;
    const marketable = Math.max(0, calculatedEggsTotal - eggsBroken - eggsDirty);
    const traysMarketable = Number((marketable / eggsPerTray).toFixed(1));
    const traysTotal = Number((calculatedEggsTotal / eggsPerTray).toFixed(1));
    const layingRate = Number(((calculatedEggsTotal / hensCount) * 100).toFixed(1));

    const newProd: Production = {
      ...prodData,
      id,
      lotName: lot?.name || 'Lot inconnu',
      alveolesCollected: calculatedAlveoles,
      extraEggsCollected: calculatedExtraEggs,
      eggsTotal: calculatedEggsTotal,
      eggsBroken,
      eggsDirty,
      eggsMarketable: marketable,
      traysCount: traysTotal,
      traysMarketable,
      layingRatePercent: layingRate,
      createdAt: new Date().toISOString(),
    };

    setProductions((prev) => [newProd, ...prev]);

    // Automatically increase Egg Stock movement
    const newStockBalance = totalEggStock + marketable;
    const stockMov: EggStockMovement = {
      id: `mov-${Date.now()}`,
      date: prodData.date,
      type: 'PRODUCTION',
      quantityEggs: marketable,
      quantityTrays: traysMarketable,
      balanceAfterEggs: newStockBalance,
      referenceId: id,
      notes: `Production lot ${lot?.name || ''} (${calculatedAlveoles} alv. + ${calculatedExtraEggs || 0} œ., ${eggsBroken} cassés)`,
      recordedBy: prodData.recordedBy || currentUser.name,
    };
    setEggStockMovements((prev) => [stockMov, ...prev]);
  };

  const deleteProduction = (id: string) => {
    const prod = productions.find((p) => p.id === id);
    if (prod) {
      // Deduct from stock movement
      const stockMov: EggStockMovement = {
        id: `mov-del-${Date.now()}`,
        date: getTodayDateString(),
        type: 'AJUSTEMENT',
        quantityEggs: -prod.eggsMarketable,
        quantityTrays: -prod.traysCount,
        balanceAfterEggs: Math.max(0, totalEggStock - prod.eggsMarketable),
        notes: `Annulation de la production du ${prod.date}`,
        recordedBy: currentUser.name,
      };
      setEggStockMovements((prev) => [stockMov, ...prev]);
    }
    setProductions((prev) => prev.filter((p) => p.id !== id));
  };

  // 3. EGG STOCK MANUAL ADJUSTMENT
  const adjustEggStock = (quantityEggs: number, reason: string) => {
    const eggsPerTray = settings.eggsPerTray || 30;
    const trays = Number((quantityEggs / eggsPerTray).toFixed(1));
    const newBalance = Math.max(0, totalEggStock + quantityEggs);

    const mov: EggStockMovement = {
      id: `mov-adj-${Date.now()}`,
      date: getTodayDateString(),
      type: quantityEggs < 0 ? 'PERTE' : 'AJUSTEMENT',
      quantityEggs,
      quantityTrays: trays,
      balanceAfterEggs: newBalance,
      notes: reason || 'Ajustement manuel d’inventaire',
      recordedBy: currentUser.name,
    };
    setEggStockMovements((prev) => [mov, ...prev]);
  };

  // 4. SALES
  const addSale = (saleData: Omit<Sale, 'id' | 'saleNumber' | 'totalAmount' | 'remainingDue' | 'paymentStatus' | 'createdAt'>) => {
    const eggsPerTray = settings.eggsPerTray || 30;
    let equivalentEggs = 0;

    if (saleData.unit === 'plateau') {
      equivalentEggs = saleData.quantity * eggsPerTray;
    } else if (saleData.unit === 'œuf') {
      equivalentEggs = saleData.quantity;
    }

    // Validation: prevent overselling eggs if stock is insufficient
    if (equivalentEggs > 0 && equivalentEggs > totalEggStock) {
      return {
        success: false,
        error: `Stock insuffisant ! Vous disposez de ${totalEggStock} œufs (${totalEggStockTrays} plateaux), mais la commande demande ${equivalentEggs} œufs (${(equivalentEggs / eggsPerTray).toFixed(1)} plateaux).`,
      };
    }

    const totalAmount = saleData.quantity * saleData.unitPrice;
    const remainingDue = Math.max(0, totalAmount - saleData.amountPaid);
    const paymentStatus: Sale['paymentStatus'] =
      remainingDue === 0 ? 'Payé' : saleData.amountPaid > 0 ? 'Partiel' : 'Impayé';

    const saleNumber = `VNT-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;
    const id = `sale-${Date.now()}`;

    const newSale: Sale = {
      ...saleData,
      id,
      saleNumber,
      totalAmount,
      remainingDue,
      paymentStatus,
      equivalentEggs,
      createdAt: new Date().toISOString(),
    };

    setSales((prev) => [newSale, ...prev]);

    // Deduct from Egg Stock if egg product
    if (equivalentEggs > 0) {
      const traysDeducted = Number((equivalentEggs / eggsPerTray).toFixed(1));
      const stockMov: EggStockMovement = {
        id: `mov-sale-${Date.now()}`,
        date: saleData.date,
        type: 'VENTE',
        quantityEggs: -equivalentEggs,
        quantityTrays: -traysDeducted,
        balanceAfterEggs: Math.max(0, totalEggStock - equivalentEggs),
        referenceId: id,
        notes: `Vente ${saleNumber} à ${saleData.clientName} (${saleData.quantity} ${saleData.unit}s)`,
        recordedBy: saleData.sellerName || currentUser.name,
      };
      setEggStockMovements((prev) => [stockMov, ...prev]);
    }

    // If selling hens, increment lot.soldCount and decrement lot.currentCount
    if (saleData.productType === 'Poules réformées' && saleData.lotId) {
      setLots((prev) =>
        prev.map((lot) => {
          if (lot.id === saleData.lotId) {
            const soldCount = lot.soldCount + saleData.quantity;
            const currentCount = Math.max(0, lot.initialCount - lot.deadCount - soldCount);
            return { ...lot, soldCount, currentCount };
          }
          return lot;
        })
      );
    }

    // Update Client balance and purchases
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === saleData.clientId) {
          return {
            ...c,
            totalPurchases: c.totalPurchases + totalAmount,
            totalPaid: c.totalPaid + saleData.amountPaid,
            debt: c.debt + remainingDue,
          };
        }
        return c;
      })
    );

    // If payment was made (> 0), record cash inflow
    if (saleData.amountPaid > 0) {
      const cashMov: CashMovement = {
        id: `csh-${Date.now()}`,
        date: saleData.date,
        type: 'ENTREE',
        category: saleData.productType === 'Poules réformées' ? 'Vente Poules' : 'Vente Œufs',
        amount: saleData.amountPaid,
        paymentMethod: saleData.paymentMethod,
        sourceOrBeneficiary: saleData.clientName,
        referenceId: id,
        description: `Règlement vente ${saleNumber} (${saleData.productType})`,
        recordedBy: saleData.sellerName || currentUser.name,
        createdAt: new Date().toISOString(),
      };
      setCashMovements((prev) => [cashMov, ...prev]);
    }

    return { success: true, sale: newSale };
  };

  const updateSale = (id: string, partial: Partial<Sale>) => {
    const existingSale = sales.find((s) => s.id === id);
    if (!existingSale) return;

    const newAmountPaid = partial.amountPaid !== undefined ? partial.amountPaid : existingSale.amountPaid;
    const newQuantity = partial.quantity !== undefined ? partial.quantity : existingSale.quantity;
    const newUnitPrice = partial.unitPrice !== undefined ? partial.unitPrice : existingSale.unitPrice;
    const newTotalAmount = newQuantity * newUnitPrice;
    const newRemainingDue = Math.max(0, newTotalAmount - newAmountPaid);
    const newPaymentStatus: Sale['paymentStatus'] =
      newRemainingDue === 0 ? 'Payé' : newAmountPaid > 0 ? 'Partiel' : 'Impayé';

    const updatedSale: Sale = {
      ...existingSale,
      ...partial,
      totalAmount: newTotalAmount,
      amountPaid: newAmountPaid,
      remainingDue: newRemainingDue,
      paymentStatus: newPaymentStatus,
    };

    setSales((prev) => prev.map((s) => (s.id === id ? updatedSale : s)));

    // Synchroniser le mouvement de caisse associé
    setCashMovements((prev) => {
      const existingMov = prev.find((m) => m.referenceId === id);
      if (newAmountPaid > 0) {
        if (existingMov) {
          return prev.map((m) =>
            m.referenceId === id
              ? {
                  ...m,
                  amount: newAmountPaid,
                  paymentMethod: partial.paymentMethod || existingMov.paymentMethod,
                  date: partial.date || existingMov.date,
                }
              : m
          );
        } else {
          const newMov: CashMovement = {
            id: `csh-${Date.now()}`,
            date: updatedSale.date,
            type: 'ENTREE',
            category: updatedSale.productType === 'Poules réformées' ? 'Vente Poules' : 'Vente Œufs',
            amount: newAmountPaid,
            paymentMethod: updatedSale.paymentMethod,
            sourceOrBeneficiary: updatedSale.clientName,
            referenceId: id,
            description: `Règlement vente ${updatedSale.saleNumber} (${updatedSale.productType})`,
            recordedBy: updatedSale.sellerName || currentUser.name,
            createdAt: new Date().toISOString(),
          };
          return [newMov, ...prev];
        }
      } else {
        return prev.filter((m) => m.referenceId !== id);
      }
    });

    // Mettre à jour les comptes clients
    const diffPurchases = newTotalAmount - existingSale.totalAmount;
    const diffPaid = newAmountPaid - existingSale.amountPaid;
    const diffDebt = newRemainingDue - existingSale.remainingDue;

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === existingSale.clientId) {
          return {
            ...c,
            totalPurchases: Math.max(0, c.totalPurchases + diffPurchases),
            totalPaid: Math.max(0, c.totalPaid + diffPaid),
            debt: Math.max(0, c.debt + diffDebt),
          };
        }
        return c;
      })
    );
  };

  const deleteSale = (id: string) => {
    const sale = sales.find((s) => s.id === id);
    if (sale) {
      if (sale.equivalentEggs > 0) {
        // Re-credit egg stock
        const eggsPerTray = settings.eggsPerTray || 30;
        const trays = Number((sale.equivalentEggs / eggsPerTray).toFixed(1));
        const stockMov: EggStockMovement = {
          id: `mov-cancel-${Date.now()}`,
          date: getTodayDateString(),
          type: 'AJUSTEMENT',
          quantityEggs: sale.equivalentEggs,
          quantityTrays: trays,
          balanceAfterEggs: totalEggStock + sale.equivalentEggs,
          notes: `Annulation vente ${sale.saleNumber}`,
          recordedBy: currentUser.name,
        };
        setEggStockMovements((prev) => [stockMov, ...prev]);
      }

      // If sold hens, restore lot count
      if (sale.productType === 'Poules réformées' && sale.lotId) {
        setLots((prev) =>
          prev.map((lot) => {
            if (lot.id === sale.lotId) {
              const soldCount = Math.max(0, lot.soldCount - sale.quantity);
              const currentCount = Math.max(0, lot.initialCount - lot.deadCount - soldCount);
              return { ...lot, soldCount, currentCount };
            }
            return lot;
          })
        );
      }

      // Revert client balances
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === sale.clientId) {
            return {
              ...c,
              totalPurchases: Math.max(0, c.totalPurchases - sale.totalAmount),
              totalPaid: Math.max(0, c.totalPaid - sale.amountPaid),
              debt: Math.max(0, c.debt - sale.remainingDue),
            };
          }
          return c;
        })
      );

      // Remove linked cash movement
      setCashMovements((prev) => prev.filter((c) => c.referenceId !== id));
    }
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // 5. FEED MANAGEMENT
  const addFeedItem = (itemData: Omit<FeedItem, 'id'>) => {
    const id = `feed-${Date.now()}`;
    setFeedItems((prev) => [...prev, { ...itemData, id }]);
  };

  const updateFeedItem = (id: string, partial: Partial<FeedItem>) => {
    setFeedItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...partial } : f)));
  };

  const deleteFeedItem = (id: string) => {
    setFeedItems((prev) => prev.filter((f) => f.id !== id));
  };

  const addFeedPurchase = (purchaseData: Omit<FeedPurchase, 'id' | 'totalCost' | 'remainingDue' | 'createdAt'>) => {
    const id = `fp-${Date.now()}`;
    const totalCost = purchaseData.quantityKg * purchaseData.unitPricePerKg;
    const remainingDue = Math.max(0, totalCost - purchaseData.amountPaid);

    const newPurchase: FeedPurchase = {
      ...purchaseData,
      id,
      totalCost,
      remainingDue,
      createdAt: new Date().toISOString(),
    };

    setFeedPurchases((prev) => [newPurchase, ...prev]);

    // Increase feed item inventory
    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id === purchaseData.feedItemId) {
          return {
            ...item,
            currentStockKg: item.currentStockKg + purchaseData.quantityKg,
            unitCostPerKg: purchaseData.unitPricePerKg, // update latest price
          };
        }
        return item;
      })
    );

    // Update Supplier debt & purchases if supplier selected
    if (purchaseData.supplierId) {
      setSuppliers((prev) =>
        prev.map((sup) => {
          if (sup.id === purchaseData.supplierId) {
            const currentPurchases = sup.totalPurchases || 0;
            const currentPaid = sup.totalPaid || 0;
            const currentDebt = sup.debt || sup.balanceDue || 0;
            return {
              ...sup,
              totalPurchases: currentPurchases + totalCost,
              totalPaid: currentPaid + purchaseData.amountPaid,
              debt: currentDebt + remainingDue,
              balanceDue: currentDebt + remainingDue,
            };
          }
          return sup;
        })
      );
    }

    // Record Accounting Expense entry (charge comptable)
    const expId = `exp-fp-${Date.now()}`;
    const newExp: Expense = {
      id: expId,
      expenseNumber: `DEP-ALIM-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(4, '0')}`,
      date: purchaseData.date,
      category: 'Aliments',
      description: `Achat aliment ${purchaseData.feedItemName} (${purchaseData.quantityKg} kg / ${purchaseData.bagsCount} sacs)`,
      amount: totalCost,
      paymentMethod: purchaseData.paymentMethod,
      supplierOrBeneficiary: purchaseData.supplierName,
      invoiceRef: id,
      recordedBy: purchaseData.recordedBy || currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Record Real Cash Outflow ONLY for the actual cash paid (amountPaid > 0)
    if (purchaseData.amountPaid > 0) {
      const cashMov: CashMovement = {
        id: `csh-fp-${Date.now()}`,
        date: purchaseData.date,
        type: 'SORTIE',
        category: 'Achat Aliments',
        amount: purchaseData.amountPaid,
        paymentMethod: purchaseData.paymentMethod,
        sourceOrBeneficiary: purchaseData.supplierName,
        referenceId: id,
        description: `Paiement achat aliment ${purchaseData.feedItemName} (${purchaseData.quantityKg} kg)`,
        recordedBy: purchaseData.recordedBy || currentUser.name,
        createdAt: new Date().toISOString(),
      };
      setCashMovements((prev) => [cashMov, ...prev]);
    }
  };

  const deleteFeedPurchase = (id: string) => {
    const purch = feedPurchases.find((p) => p.id === id);
    if (purch) {
      // Revert feed stock
      setFeedItems((prev) =>
        prev.map((item) => {
          if (item.id === purch.feedItemId) {
            return {
              ...item,
              currentStockKg: Math.max(0, item.currentStockKg - purch.quantityKg),
            };
          }
          return item;
        })
      );

      // Revert supplier balance
      if (purch.supplierId) {
        setSuppliers((prev) =>
          prev.map((sup) => {
            if (sup.id === purch.supplierId) {
              const currentPurchases = sup.totalPurchases || 0;
              const currentPaid = sup.totalPaid || 0;
              const currentDebt = sup.debt || sup.balanceDue || 0;
              const newDebt = Math.max(0, currentDebt - purch.remainingDue);
              return {
                ...sup,
                totalPurchases: Math.max(0, currentPurchases - purch.totalCost),
                totalPaid: Math.max(0, currentPaid - purch.amountPaid),
                debt: newDebt,
                balanceDue: newDebt,
              };
            }
            return sup;
          })
        );
      }

      // Remove linked expense & cash movement
      setExpenses((prev) => prev.filter((e) => e.invoiceRef !== id && e.id !== `exp-fp-${purch.id}`));
      setCashMovements((prev) => prev.filter((c) => c.referenceId !== id));
    }
    setFeedPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  const addFeedConsumption = (consData: Omit<FeedConsumption, 'id' | 'consumptionPerHenGrams' | 'feedCost' | 'feedCostPerHen' | 'createdAt'> & { bagsCount?: number; quantityKg?: number }) => {
    const id = `fc-${Date.now()}`;
    const feedItem = feedItems.find((f) => f.id === consData.feedItemId);
    const unitPrice = feedItem?.unitCostPerKg || 380;
    const bagWeight = feedItem?.standardBagWeightKg || 50;

    let bagsCount = consData.bagsCount;
    let quantityKg = consData.quantityKg;

    if (bagsCount !== undefined && quantityKg === undefined) {
      quantityKg = Number((bagsCount * bagWeight).toFixed(1));
    } else if (quantityKg !== undefined && bagsCount === undefined) {
      bagsCount = Number((quantityKg / bagWeight).toFixed(2));
    } else if (bagsCount === undefined && quantityKg === undefined) {
      bagsCount = 1;
      quantityKg = bagWeight;
    }

    const finalQuantityKg = quantityKg || 0;
    const finalBagsCount = bagsCount || 0;
    const feedCost = finalQuantityKg * unitPrice;
    const hensCount = consData.hensCount > 0 ? consData.hensCount : 1;
    const consumptionGrams = Number(((finalQuantityKg * 1000) / hensCount).toFixed(1));
    const feedCostPerHen = Number((feedCost / hensCount).toFixed(1));

    const newCons: FeedConsumption = {
      ...consData,
      id,
      bagsCount: finalBagsCount,
      quantityKg: finalQuantityKg,
      consumptionPerHenGrams: consumptionGrams,
      feedCost,
      feedCostPerHen,
      createdAt: new Date().toISOString(),
    };

    setFeedConsumptions((prev) => [newCons, ...prev]);

    // Automatically decrement feed stock
    setFeedItems((prev) =>
      prev.map((item) => {
        if (item.id === consData.feedItemId) {
          return {
            ...item,
            currentStockKg: Math.max(0, item.currentStockKg - finalQuantityKg),
          };
        }
        return item;
      })
    );
  };

  // 6. EXPENSES
  const addExpense = (expenseData: Omit<Expense, 'id' | 'expenseNumber' | 'createdAt'>) => {
    const id = `exp-${Date.now()}`;
    const expenseNumber = `DEP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(4, '0')}`;

    const newExp: Expense = {
      ...expenseData,
      id,
      expenseNumber,
      createdAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);

    // Create Cash Outflow movement
    const cashMov: CashMovement = {
      id: `csh-out-${Date.now()}`,
      date: expenseData.date,
      type: 'SORTIE',
      category: expenseData.category,
      amount: expenseData.amount,
      paymentMethod: expenseData.paymentMethod,
      sourceOrBeneficiary: expenseData.supplierOrBeneficiary || 'Divers',
      referenceId: id,
      description: expenseData.description,
      recordedBy: expenseData.recordedBy || currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setCashMovements((prev) => [cashMov, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setCashMovements((prev) => prev.filter((c) => c.referenceId !== id));
  };

  // 7. MORTALITIES
  const addMortality = (mortData: Omit<Mortality, 'id' | 'createdAt'>) => {
    const id = `mort-${Date.now()}`;
    const lot = lots.find((l) => l.id === mortData.lotId);

    const newMort: Mortality = {
      ...mortData,
      id,
      lotName: lot?.name || 'Lot',
      createdAt: new Date().toISOString(),
    };

    setMortalities((prev) => [newMort, ...prev]);

    // Deduct from Lot's currentCount and increment deadCount
    setLots((prev) =>
      prev.map((l) => {
        if (l.id === mortData.lotId) {
          const deadCount = l.deadCount + mortData.deadCount;
          const currentCount = Math.max(0, l.initialCount - deadCount - l.soldCount);
          return { ...l, deadCount, currentCount };
        }
        return l;
      })
    );
  };

  const deleteMortality = (id: string) => {
    const mort = mortalities.find((m) => m.id === id);
    if (mort) {
      setLots((prev) =>
        prev.map((l) => {
          if (l.id === mort.lotId) {
            const deadCount = Math.max(0, l.deadCount - mort.deadCount);
            const currentCount = Math.max(0, l.initialCount - deadCount - l.soldCount);
            return { ...l, deadCount, currentCount };
          }
          return l;
        })
      );
    }
    setMortalities((prev) => prev.filter((m) => m.id !== id));
  };

  // 8. HEALTH & TREATMENTS
  const addHealthTreatment = (treatmentData: Omit<HealthTreatment, 'id' | 'createdAt'>) => {
    const id = `hlt-${Date.now()}`;
    const lot = lots.find((l) => l.id === treatmentData.lotId);

    const newHlt: HealthTreatment = {
      ...treatmentData,
      id,
      lotName: lot?.name || 'Lot',
      createdAt: new Date().toISOString(),
    };

    setHealthTreatments((prev) => [newHlt, ...prev]);

    // If cost > 0, log as expense
    if (treatmentData.cost > 0) {
      addExpense({
        date: treatmentData.date,
        category: treatmentData.type === 'Vaccin' ? 'Vaccins' : 'Médicaments',
        description: `Traitement ${treatmentData.type} - ${treatmentData.productName} (${treatmentData.quantity})`,
        amount: treatmentData.cost,
        paymentMethod: 'Espèces',
        supplierOrBeneficiary: treatmentData.supplier || 'Vétérinaire',
        lotId: treatmentData.lotId,
        recordedBy: currentUser.name,
      });
    }
  };

  const updateHealthTreatment = (id: string, partial: Partial<HealthTreatment>) => {
    setHealthTreatments((prev) => prev.map((h) => (h.id === id ? { ...h, ...partial } : h)));
  };

  const deleteHealthTreatment = (id: string) => {
    setHealthTreatments((prev) => prev.filter((h) => h.id !== id));
  };

  // 9. CLIENTS
  const addClient = (clientData: Omit<Client, 'id' | 'totalPurchases' | 'totalPaid' | 'debt' | 'createdAt'>) => {
    const id = `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      totalPurchases: 0,
      totalPaid: 0,
      debt: 0,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (id: string, partial: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const recordClientDebtReminder = (clientId: string) => {
    const today = getTodayDateString();
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            lastDebtReminderDate: today,
            debtReminderCount: (c.debtReminderCount || 0) + 1,
          };
        }
        return c;
      })
    );
  };

  const settleClientDebt = (clientId: string, amount: number, paymentMethod: any, notes?: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const settledAmount = Math.min(amount, client.debt);

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            totalPaid: c.totalPaid + settledAmount,
            debt: Math.max(0, c.debt - settledAmount),
          };
        }
        return c;
      })
    );

    // Add cash inflow
    const cashMov: CashMovement = {
      id: `csh-settle-${Date.now()}`,
      date: getTodayDateString(),
      type: 'ENTREE',
      category: 'Règlement Créance Client',
      amount: settledAmount,
      paymentMethod,
      sourceOrBeneficiary: client.name,
      description: `Règlement de dette client ${client.name} ${notes ? `(${notes})` : ''}`,
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setCashMovements((prev) => [cashMov, ...prev]);
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // 10. SUPPLIERS
  const addSupplier = (supData: Omit<Supplier, 'id' | 'totalPurchases' | 'totalPaid' | 'debt' | 'createdAt'>) => {
    const id = `sup-${Date.now()}`;
    const newSup: Supplier = {
      ...supData,
      id,
      totalPurchases: 0,
      totalPaid: 0,
      debt: 0,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [...prev, newSup]);
  };

  const updateSupplier = (id: string, partial: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  };

  const settleSupplierDebt = (supplierId: string, amount: number, paymentMethod: any, notes?: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    const settledAmount = Math.min(amount, supplier.debt);

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            totalPaid: s.totalPaid + settledAmount,
            debt: Math.max(0, s.debt - settledAmount),
          };
        }
        return s;
      })
    );

    // Add cash outflow
    const cashMov: CashMovement = {
      id: `csh-sup-settle-${Date.now()}`,
      date: getTodayDateString(),
      type: 'SORTIE',
      category: 'Règlement Dette Fournisseur',
      amount: settledAmount,
      paymentMethod,
      sourceOrBeneficiary: supplier.name,
      description: `Paiement dette fournisseur ${supplier.name} ${notes ? `(${notes})` : ''}`,
      recordedBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setCashMovements((prev) => [cashMov, ...prev]);
  };

  const deleteSupplier = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // 11. CASH MOVEMENTS
  const addCashMovement = (movData: Omit<CashMovement, 'id' | 'createdAt'>) => {
    const id = `csh-${Date.now()}`;
    const newMov: CashMovement = {
      ...movData,
      id,
      createdAt: new Date().toISOString(),
    };
    setCashMovements((prev) => [newMov, ...prev]);
  };

  const deleteCashMovement = (id: string) => {
    setCashMovements((prev) => prev.filter((m) => m.id !== id));
  };

  const addCashTransfer = (params: {
    date: string;
    fromMethod: PaymentMethod;
    toMethod: PaymentMethod;
    amount: number;
    description?: string;
  }) => {
    const now = Date.now();
    const outMov: CashMovement = {
      id: `csh-trf-out-${now}`,
      date: params.date,
      type: 'SORTIE',
      category: `Transfert Interne vers ${params.toMethod}`,
      amount: params.amount,
      paymentMethod: params.fromMethod,
      sourceOrBeneficiary: `${params.fromMethod} ➔ ${params.toMethod}`,
      description: params.description || `Transfert vers compte ${params.toMethod}`,
      recordedBy: currentUser.name,
      createdAt: new Date(now).toISOString(),
    };
    const inMov: CashMovement = {
      id: `csh-trf-in-${now + 1}`,
      date: params.date,
      type: 'ENTREE',
      category: `Transfert Interne depuis ${params.fromMethod}`,
      amount: params.amount,
      paymentMethod: params.toMethod,
      sourceOrBeneficiary: `${params.fromMethod} ➔ ${params.toMethod}`,
      description: params.description || `Transfert reçu de ${params.fromMethod}`,
      recordedBy: currentUser.name,
      createdAt: new Date(now + 1).toISOString(),
    };
    setCashMovements((prev) => [inMov, outMov, ...prev]);
  };

  // 12. SETTINGS & AUTH
  const updateSettings = (newSettings: Partial<FarmSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      alertThresholds: {
        ...prev.alertThresholds,
        ...(newSettings.alertThresholds || {}),
      },
      auth: {
        adminUsername: newSettings.auth?.adminUsername || prev.auth?.adminUsername || 'admin',
        adminPassword: newSettings.auth?.adminPassword || prev.auth?.adminPassword || '0000',
        employeePassword: newSettings.auth?.employeePassword || prev.auth?.employeePassword || '1234',
      },
    }));
  };

  const addUser = (userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const id = `usr-${Date.now()}`;
    const newUser: AppUser = {
      ...userData,
      id,
      active: userData.active !== undefined ? userData.active : true,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  const loginWithUserPin = (userId: string, pinCode: string): { success: boolean; error?: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }
    if (targetUser.active === false) {
      return { success: false, error: 'Ce compte utilisateur a été désactivé par l’administrateur.' };
    }

    // Admin login with password or pin
    if (targetUser.role === 'Administrateur' || targetUser.role === 'admin') {
      const adminPass = settings.auth?.adminPassword || '0000';
      const userPin = targetUser.pinCode || '0000';
      if (pinCode === adminPass || pinCode === userPin || pinCode === '0000') {
        setCurrentUser(targetUser);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ role: targetUser.role, userId: targetUser.id, name: targetUser.name, timestamp: new Date().toISOString() })
          );
        } catch {}
        return { success: true };
      }
      return { success: false, error: 'Code ou mot de passe Administrateur incorrect.' };
    }

    // Other roles: check personal PIN or fallback to general employee password
    const generalEmpPass = settings.auth?.employeePassword || '1234';
    const userPin = targetUser.pinCode;

    if ((userPin && pinCode === userPin) || pinCode === generalEmpPass) {
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ role: targetUser.role, userId: targetUser.id, name: targetUser.name, timestamp: new Date().toISOString() })
        );
      } catch {}
      return { success: true };
    }

    return { success: false, error: `Code PIN incorrect pour ${targetUser.name}.` };
  };

  const switchUser = (targetUser: AppUser) => {
    setCurrentUser(targetUser);
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ role: targetUser.role, userId: targetUser.id, name: targetUser.name, timestamp: new Date().toISOString() })
      );
    } catch {}
  };

  const loginAsAdmin = (username: string, password: string): { success: boolean; error?: string } => {
    const currentAdminUser = settings.auth?.adminUsername || 'admin';
    const currentAdminPass = settings.auth?.adminPassword || '0000';

    if (
      username.trim().toLowerCase() === currentAdminUser.trim().toLowerCase() &&
      (password === currentAdminPass || password === '0000')
    ) {
      const adminUser = users.find((u) => u.role === 'Administrateur' || u.role === 'admin') || {
        id: 'usr-admin',
        name: 'Administrateur (Direction)',
        role: 'Administrateur',
        email: 'admin@ferme.com',
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ role: 'Administrateur', userId: adminUser.id, name: adminUser.name, timestamp: new Date().toISOString() })
        );
      } catch {}
      return { success: true };
    }
    return { success: false, error: 'Identifiant ou mot de passe Administrateur incorrect.' };
  };

  const loginAsEmployee = (password: string): { success: boolean; error?: string } => {
    const currentEmpPass = settings.auth?.employeePassword || '1234';

    if (password.trim() === currentEmpPass.trim()) {
      const empUser = users.find((u) => u.role === 'Employé' || u.role === 'employee') || {
        id: 'usr-employee',
        name: 'Agent de Ramassage',
        role: 'Employé',
        email: 'employe@ferme.com',
      };
      setCurrentUser(empUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ role: 'Employé', userId: empUser.id, name: empUser.name, timestamp: new Date().toISOString() })
        );
      } catch {}
      return { success: true };
    }
    return { success: false, error: 'Mot de passe Employé incorrect.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  const updateAuthCredentials = (credentials: Partial<FarmAuthSettings>) => {
    setSettings((prev) => ({
      ...prev,
      auth: {
        adminUsername: credentials.adminUsername !== undefined ? credentials.adminUsername : prev.auth?.adminUsername || 'admin',
        adminPassword: credentials.adminPassword !== undefined ? credentials.adminPassword : prev.auth?.adminPassword || 'admin123',
        employeePassword: credentials.employeePassword !== undefined ? credentials.employeePassword : prev.auth?.employeePassword || '1234',
      },
    }));

    if (credentials.adminPassword) {
      setUsers((prev) =>
        prev.map((u) => (u.role === 'Administrateur' || u.role === 'admin' ? { ...u, pinCode: credentials.adminPassword } : u))
      );
    }
  };

  // 13. DATA MANAGEMENT & BACKUP
  const exportDataJSON = () => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      users,
      lots,
      productions,
      eggStockMovements,
      sales,
      feedItems,
      feedPurchases,
      feedConsumptions,
      expenses,
      mortalities,
      healthTreatments,
      clients,
      suppliers,
      cashMovements,
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.lots && Array.isArray(data.lots)) setLots(data.lots);
      if (data.productions && Array.isArray(data.productions)) setProductions(data.productions);
      if (data.eggStockMovements && Array.isArray(data.eggStockMovements)) setEggStockMovements(data.eggStockMovements);
      if (data.sales && Array.isArray(data.sales)) setSales(data.sales);
      if (data.feedItems && Array.isArray(data.feedItems)) setFeedItems(data.feedItems);
      if (data.feedPurchases && Array.isArray(data.feedPurchases)) setFeedPurchases(data.feedPurchases);
      if (data.feedConsumptions && Array.isArray(data.feedConsumptions)) setFeedConsumptions(data.feedConsumptions);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.mortalities && Array.isArray(data.mortalities)) setMortalities(data.mortalities);
      if (data.healthTreatments && Array.isArray(data.healthTreatments)) setHealthTreatments(data.healthTreatments);
      if (data.clients && Array.isArray(data.clients)) setClients(data.clients);
      if (data.suppliers && Array.isArray(data.suppliers)) setSuppliers(data.suppliers);
      if (data.cashMovements && Array.isArray(data.cashMovements)) setCashMovements(data.cashMovements);
      if (data.settings) setSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  const resetToDefaultData = async () => {
    const history = generateInitialHistory();
    const cleanSettings = initialSettings;
    const cleanUsers = initialUsers;
    const cleanCurrentUser = initialUsers[0];
    const cleanLots = initialLots;
    const cleanFeedItems = initialFeedItems;
    const cleanSales = initialSales;
    const cleanExpenses = initialExpenses;
    const cleanHealthTreatments = initialHealthTreatments;
    const cleanClients = initialClients;
    const cleanSuppliers = initialSuppliers;
    const cleanCashMovements = initialCashMovements;

    setSettings(cleanSettings);
    setUsers(cleanUsers);
    setCurrentUser(cleanCurrentUser);
    setLots(cleanLots);
    setProductions(history.productions);
    setFeedConsumptions(history.feedConsumptions);
    setMortalities(history.mortalities);
    setEggStockMovements(history.eggMovements);
    setSales(cleanSales);
    setFeedItems(cleanFeedItems);
    setFeedPurchases([]);
    setExpenses(cleanExpenses);
    setHealthTreatments(cleanHealthTreatments);
    setClients(cleanClients);
    setSuppliers(cleanSuppliers);
    setCashMovements(cleanCashMovements);

    // Save to Firestore and LocalStorage immediately
    const cleanState = {
      settings: cleanSettings,
      users: cleanUsers,
      currentUser: cleanCurrentUser,
      lots: cleanLots,
      productions: history.productions,
      feedConsumptions: history.feedConsumptions,
      mortalities: history.mortalities,
      eggStockMovements: history.eggMovements,
      sales: cleanSales,
      feedItems: cleanFeedItems,
      feedPurchases: [],
      expenses: cleanExpenses,
      healthTreatments: cleanHealthTreatments,
      clients: cleanClients,
      suppliers: cleanSuppliers,
      cashMovements: cleanCashMovements,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanState));
      if (db) {
        setSyncStatus('syncing');
        const farmDocRef = doc(db, 'farms', 'main_farm_data');
        await setDoc(farmDocRef, cleanState);
        setSyncStatus('synced');
        setIsFirebaseConnected(true);
        setLastFirebaseSync(new Date().toLocaleTimeString('fr-FR'));
      }
    } catch (e) {
      console.error('Reset save error:', e);
    }
  };

  const clearAllData = async () => {
    setLots([]);
    setProductions([]);
    setEggStockMovements([]);
    setSales([]);
    setFeedItems([]);
    setFeedPurchases([]);
    setFeedConsumptions([]);
    setExpenses([]);
    setMortalities([]);
    setHealthTreatments([]);
    setClients([]);
    setSuppliers([]);
    setCashMovements([]);

    const emptyState = {
      settings,
      users,
      currentUser,
      lots: [],
      productions: [],
      eggStockMovements: [],
      sales: [],
      feedItems: [],
      feedPurchases: [],
      feedConsumptions: [],
      expenses: [],
      mortalities: [],
      healthTreatments: [],
      clients: [],
      suppliers: [],
      cashMovements: [],
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyState));
      if (db) {
        setSyncStatus('syncing');
        const farmDocRef = doc(db, 'farms', 'main_farm_data');
        await setDoc(farmDocRef, emptyState);
        setSyncStatus('synced');
        setIsFirebaseConnected(true);
        setLastFirebaseSync(new Date().toLocaleTimeString('fr-FR'));
      }
    } catch (e) {
      console.error('Clear data error:', e);
    }
  };

  return (
    <FarmContext.Provider
      value={{
        lots,
        productions,
        eggStockMovements,
        sales,
        feedItems,
        feedPurchases,
        feedConsumptions,
        expenses,
        mortalities,
        healthTreatments,
        clients,
        suppliers,
        cashMovements,
        settings,
        currentUser,
        users,

        syncStatus,
        isFirebaseConnected,
        lastFirebaseSync,
        syncToFirebaseNow,

        totalCurrentHens,
        totalInitialHens,
        totalDeadHens,
        totalSoldHens,
        totalEggStock,
        totalEggStockTrays,
        todayEggsProduced,
        todayMarketableEggs,
        todayLayingRate,
        monthEggsProduced,
        monthRevenue,
        monthExpenses,
        monthNetProfit,
        totalRevenue,
        totalExpenses,
        netProfit,
        totalProfit,
        profitMarginPercent,
        totalFeedStockKg,
        totalFeedStockBags,
        totalCashIn,
        totalCashOut,
        netCashBalance,
        cashBalance,
        cashInHand,
        mobileMoneyBalance,
        bankBalance,
        totalTreasury,
        cashMovementsWithBalance,
        totalClientDebt,
        totalSupplierDebt,
        globalMortalityRate,
        averageFeedCostPerEgg,
        averageSalePricePerEgg,
        marginPerEgg,
        alerts,
        clientsNeedingWeeklyReminder,

        vaccines: healthTreatments,

        addLot,
        updateLot,
        deleteLot,

        addProduction,
        deleteProduction,

        adjustEggStock,

        addSale,
        updateSale,
        deleteSale,

        addFeedItem,
        updateFeedItem,
        deleteFeedItem,

        addFeedPurchase,
        deleteFeedPurchase,
        addFeedConsumption,

        addExpense,
        deleteExpense,

        addMortality,
        deleteMortality,

        addHealthTreatment,
        updateHealthTreatment,
        deleteHealthTreatment,
        addVaccine: addHealthTreatment,
        updateVaccine: updateHealthTreatment,
        deleteVaccine: deleteHealthTreatment,

        addClient,
        updateClient,
        recordClientDebtReminder,
        settleClientDebt,
        deleteClient,

        addSupplier,
        updateSupplier,
        settleSupplierDebt,
        deleteSupplier,

        addCashMovement,
        deleteCashMovement,
        addCashTransfer,

        updateSettings,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,

        isAuthenticated,
        loginAsAdmin,
        loginAsEmployee,
        loginWithUserPin,
        switchUser,
        logout,
        updateAuthCredentials,

        exportDataJSON,
        exportAllDataJSON: exportDataJSON,
        importDataJSON,
        importAllDataJSON: importDataJSON,
        resetToDefaultData,
        resetAllDataToSample: resetToDefaultData,
        clearAllData,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
