export type UserRole =
  | 'admin'
  | 'employee'
  | 'Administrateur'
  | 'Employé'
  | 'Gérant'
  | 'Vendeur';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  pinCode?: string; // Code PIN confidentiel (ex: 4-6 chiffres)
  avatar?: string;
  active?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
}

export type LotStatus = 'Actif' | 'En attente' | 'Réformé' | 'Vendu';

export interface Lot {
  id: string;
  code: string; // e.g., "LOT-2024-01"
  name: string; // e.g., "Pondeuses Lohmann Brown"
  arrivalDate: string; // YYYY-MM-DD
  initialCount: number;
  breed: string; // e.g., "Lohmann Brown", "Isa Brown", "Novogen"
  ageWeeksAtArrival: number; // e.g., 18 semaines
  currentAgeWeeks: number;
  unitCost: number; // purchase price per pullet
  supplierId?: string;
  supplierName: string;
  currentCount: number;
  deadCount: number;
  soldCount: number;
  status: LotStatus;
  notes?: string;
  createdAt: string;
}

export interface Production {
  id: string;
  date: string; // YYYY-MM-DD
  lotId: string;
  lotName?: string;
  alveolesCollected?: number; // Nombre d'alvéoles pleines récoltées (ex: 33)
  extraEggsCollected?: number; // Œufs supplémentaires hors alvéole (ex: 10)
  eggsTotal: number; // Œufs ramassés au total = (alveoles * 30) + extra
  eggsBroken: number; // Œufs cassés (en nombre d'œufs)
  eggsDirty: number; // Œufs sales / déclassés
  eggsMarketable: number; // Œufs vendables = Total - cassés - sales
  traysCount: number; // Nombre total d'alvéoles récoltées (ex: 33.3)
  traysMarketable?: number; // Nombre d'alvéoles vendables (ex: 33.0)
  layingRatePercent: number; // % Taux de ponte du jour
  recordedBy: string;
  remarks?: string;
  createdAt: string;
}

export type EggMovementType = 'PRODUCTION' | 'VENTE' | 'PERTE' | 'AJUSTEMENT' | 'DON';

export interface EggStockMovement {
  id: string;
  date: string;
  type: EggMovementType;
  quantityEggs: number; // positif pour entrée, négatif pour sortie
  quantityTrays: number;
  balanceAfterEggs: number;
  referenceId?: string; // ID production ou vente
  notes: string;
  recordedBy: string;
}

export type PaymentMethod = 'Espèces' | 'Mobile Money' | 'Virement' | 'Chèque' | 'Crédit';
export type PaymentStatus = 'Payé' | 'Partiel' | 'Impayé';
export type ProductSaleType = 'Plateaux' | 'Œufs (Unité)' | 'Poules réformées' | 'Fientes / Engrais' | 'Autre';

export interface Sale {
  id: string;
  saleNumber: string; // e.g., "VNT-2024-0012"
  date: string; // YYYY-MM-DD
  clientId: string;
  clientName: string;
  clientPhone?: string;
  productType: ProductSaleType;
  quantity: number; // ex: 25 plateaux
  unit: 'plateau' | 'œuf' | 'sujet' | 'sac' | 'lot';
  equivalentEggs: number; // nombre total d'œufs déduits du stock
  unitPrice: number; // prix par unité
  totalAmount: number; // quantité * unitPrice
  paymentMethod: PaymentMethod;
  amountPaid: number;
  remainingDue: number;
  paymentStatus: PaymentStatus;
  sellerName: string;
  lotId?: string; // si vente de poules du lot
  notes?: string;
  createdAt: string;
}

export type FeedType = 
  | 'Pondeuse démarrage'
  | 'Pondeuse pic de ponte'
  | 'Pondeuse finition'
  | 'Maïs concassé'
  | 'Son de blé'
  | 'Tourteau de soja'
  | 'Concentré / Prémix'
  | 'Calcium / Coquilles'
  | 'Autre';

export interface FeedItem {
  id: string;
  name: string;
  type: FeedType;
  currentStockKg: number;
  minThresholdKg: number;
  unitCostPerKg: number;
  standardBagWeightKg: number; // ex: 50kg
  supplierName?: string;
  notes?: string;
}

export interface FeedPurchase {
  id: string;
  date: string;
  feedItemId: string;
  feedItemName: string;
  quantityKg: number;
  bagsCount: number;
  bagWeightKg: number;
  unitPricePerKg: number;
  totalCost: number;
  supplierId?: string;
  supplierName: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  remainingDue: number;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface FeedConsumption {
  id: string;
  date: string;
  lotId: string;
  lotName?: string;
  feedItemId: string;
  feedItemName: string;
  quantityKg: number;
  bagsCount: number;
  hensCount: number; // Effectif du lot ce jour
  consumptionPerHenGrams: number; // (quantityKg * 1000) / hensCount
  feedCost: number; // quantityKg * unitCostPerKg
  feedCostPerHen: number;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Aliments'
  | 'Médicaments'
  | 'Vaccins'
  | 'Produits vétérinaires'
  | 'Soins vétérinaires & Vaccins'
  | 'Électricité'
  | 'Eau'
  | 'Électricité & Eau'
  | 'Transport'
  | 'Salaires'
  | 'Salaires & Main d’œuvre'
  | 'Entretien'
  | 'Entretien & Matériel'
  | 'Emballages / Alvéoles'
  | 'Réparation'
  | 'Achat de poules'
  | 'Matériel'
  | 'Construction'
  | 'Nettoyage'
  | 'Autre';

export interface Expense {
  id: string;
  expenseNumber: string; // e.g., "DEP-2024-0045"
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  supplierOrBeneficiary: string;
  lotId?: string;
  invoiceRef?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type MortalityCause =
  | 'Maladie bactérienne/virale'
  | 'Maladie respiratoire'
  | 'Infection bactérienne'
  | 'Chaleur / Coup de chaud'
  | 'Stress thermique / Chaleur'
  | 'Stress'
  | 'Picage / Prolapsus'
  | 'Prolapsus / Piquage'
  | 'Étouffement / Écrasement'
  | 'Écrasement / Panique'
  | 'Prédateur'
  | 'Vieillesse'
  | 'Vieillesse / Réforme'
  | 'Inconnue'
  | 'Autre';

export interface Mortality {
  id: string;
  date: string;
  lotId: string;
  lotName?: string;
  deadCount: number;
  cause: MortalityCause;
  ageWeeks: number;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type TreatmentType = 'Vaccin' | 'Médicament' | 'Vermifuge' | 'Vitamines' | 'Désinfection' | 'Autre';
export type TreatmentStatus = 'Effectué' | 'Planifié' | 'En retard' | 'Fait' | 'Programmé';

export interface HealthTreatment {
  id: string;
  date: string;
  lotId: string;
  lotName?: string;
  type: TreatmentType;
  productName: string;
  name?: string; // alias for productName
  dosage: string; // ex: "1g/L d'eau"
  quantity: string; // ex: "2 flacons"
  cost: number;
  supplier?: string;
  nextDueDate?: string; // Date prévue du prochain rappel
  scheduledDate?: string; // Date planifiée
  targetAgeWeeks?: number; // Âge cible en semaines (ex: 24 sem.)
  administrationRoute?: string; // ex: "Eau de boisson", "Injection", "Nébulisation"
  administeredDate?: string; // Date réelle d'administration
  status: TreatmentStatus;
  veterinarian?: string;
  notes?: string;
  createdAt: string;
}

export type VaccineTreatment = HealthTreatment;

export type ClientType = 'Particulier' | 'Restaurant' | 'Boutique' | 'Grossiste' | 'Revendeur' | 'Hôtel' | 'Autre';

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: ClientType;
  totalPurchases: number;
  totalPaid: number;
  debt: number; // totalPurchases - totalPaid
  lastSaleDate?: string;
  lastDebtReminderDate?: string; // Date of last weekly debt reminder sent
  debtReminderCount?: number; // Number of times reminded
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  category?: string;
  suppliedProducts?: string; // ex: "Aliments complets, Maïs, Alvéoles"
  totalPurchases?: number;
  totalSupplied?: number;
  totalPaid?: number;
  balanceDue?: number;
  debt?: number; // Somme restant due au fournisseur
  notes?: string;
  createdAt: string;
}

export type CashMovementType = 'ENTREE' | 'SORTIE';

export interface CashMovement {
  id: string;
  date: string;
  type: CashMovementType;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  sourceOrBeneficiary?: string;
  referenceId?: string; // Vente, dépense, achat aliment, etc.
  balanceAfter?: number;
  description: string;
  recordedBy: string;
  createdAt: string;
}

export interface AlertItem {
  id: string;
  level: 'danger' | 'warning' | 'info';
  title: string;
  message: string;
  module: string;
  date: string;
}

export interface FarmAuthSettings {
  adminUsername: string; // default 'admin'
  adminPassword: string; // default 'admin123'
  employeePassword: string; // default '1234'
}

export interface FarmSettings {
  farmName: string;
  ownerName: string;
  phone: string;
  location: string;
  currency: string; // 'FCFA' | '€' | '$' | 'DH' | 'DZD' | etc.
  eggsPerTray: number; // default 30
  alertThresholds: {
    minFeedStockDays: number; // alerte si stock aliments < X jours
    maxDailyMortalityCount: number; // alerte si > X morts par jour
    minLayingRatePercent: number; // alerte si taux ponte < X %
    minEggStockTrays: number; // alerte si stock œufs < X plateaux
    maxClientDebt: number; // alerte si dette client > X
  };
  auth?: FarmAuthSettings;
}
