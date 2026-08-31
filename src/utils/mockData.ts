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
  FarmSettings,
  AppUser
} from '../types';
import { getDaysAgoDateString, getTodayDateString } from './formatters';

export const initialSettings: FarmSettings = {
  farmName: 'Ma Ferme Avicole',
  ownerName: 'Direction / Gérant',
  phone: '',
  location: '',
  currency: 'FCFA',
  eggsPerTray: 30,
  alertThresholds: {
    minFeedStockDays: 5,
    maxDailyMortalityCount: 5,
    minLayingRatePercent: 75,
    minEggStockTrays: 10,
    maxClientDebt: 100000,
  },
  auth: {
    adminUsername: 'admin',
    adminPassword: 'admin123',
    employeePassword: '1234',
  },
};

export const initialUsers: AppUser[] = [
  { id: 'usr-admin', name: 'Administrateur Principal', role: 'Administrateur', email: 'admin@ferme.com', active: true, createdAt: new Date().toISOString() },
  { id: 'usr-manager', name: 'Gérant / Chef d’Élevage', role: 'Gérant', pinCode: '2024', email: 'gerant@ferme.com', active: true, createdAt: new Date().toISOString() },
  { id: 'usr-employee', name: 'Agent de Ramassage', role: 'Employé', pinCode: '1234', email: 'ramassage@ferme.com', active: true, createdAt: new Date().toISOString() },
  { id: 'usr-seller', name: 'Commercial / Vendeur', role: 'Vendeur', pinCode: '5678', email: 'ventes@ferme.com', active: true, createdAt: new Date().toISOString() },
];

export const initialLots: Lot[] = [];

export const initialSuppliers: Supplier[] = [];

export const initialClients: Client[] = [];

export const initialFeedItems: FeedItem[] = [];

// Generate initial history (empty for clean install)
export function generateInitialHistory() {
  const productions: Production[] = [];
  const feedConsumptions: FeedConsumption[] = [];
  const mortalities: Mortality[] = [];
  const eggMovements: EggStockMovement[] = [];

  return { productions, feedConsumptions, mortalities, eggMovements };
}

export const initialSales: Sale[] = [];

export const initialExpenses: Expense[] = [];

export const initialHealthTreatments: HealthTreatment[] = [];

export const initialCashMovements: CashMovement[] = [];
