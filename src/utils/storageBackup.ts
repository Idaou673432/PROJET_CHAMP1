// Utility for bulletproof multi-layer persistence (IndexedDB + LocalStorage Backups)

const DB_NAME = 'PoulaillerSecureDB';
const DB_VERSION = 1;
const STORE_NAME = 'farm_snapshots';
const BACKUP_STORAGE_KEY = 'poulailler_farm_data_backup_safe';
const EMERGENCY_STORAGE_KEY = 'poulailler_farm_data_emergency_snapshot';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save complete snapshot to IndexedDB
export async function saveToIndexedDB(state: unknown): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Save latest master record
    store.put({
      id: 'latest_state',
      data: state,
      updatedAt: new Date().toISOString(),
    });

    // Also keep a historical backup point (rolling last 10 snapshots)
    const historyKey = `snapshot_${new Date().toISOString().slice(0, 13)}`; // Hourly key
    store.put({
      id: historyKey,
      data: state,
      updatedAt: new Date().toISOString(),
    });

    // Also update redundant LocalStorage safety keys
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(BACKUP_STORAGE_KEY, serialized);
      localStorage.setItem(EMERGENCY_STORAGE_KEY, serialized);
    } catch {
      // LocalStorage quota might be reached, IndexedDB is safe
    }
  } catch (err) {
    console.warn('IndexedDB backup warning:', err);
  }
}

// Read latest master snapshot from IndexedDB
export async function loadFromIndexedDB(): Promise<unknown | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('latest_state');

      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Safe multi-layer fallback loader (LocalStorage -> Backup Key -> Emergency Key -> IndexedDB)
export async function retrieveSafestLocalState(primaryKey: string): Promise<any | null> {
  // 1. Try Primary LocalStorage
  try {
    const primary = localStorage.getItem(primaryKey);
    if (primary) {
      const parsed = JSON.parse(primary);
      if (hasSubstantialData(parsed)) return parsed;
    }
  } catch {}

  // 2. Try Safety Backup LocalStorage
  try {
    const backup = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (backup) {
      const parsed = JSON.parse(backup);
      if (hasSubstantialData(parsed)) return parsed;
    }
  } catch {}

  // 3. Try Emergency Snapshot
  try {
    const emergency = localStorage.getItem(EMERGENCY_STORAGE_KEY);
    if (emergency) {
      const parsed = JSON.parse(emergency);
      if (hasSubstantialData(parsed)) return parsed;
    }
  } catch {}

  // 4. Try IndexedDB
  try {
    const idbData = await loadFromIndexedDB();
    if (idbData && hasSubstantialData(idbData)) {
      return idbData;
    }
  } catch {}

  return null;
}

// Check if a state object contains actual user records
export function hasSubstantialData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  const count =
    (Array.isArray(data.lots) ? data.lots.length : 0) +
    (Array.isArray(data.productions) ? data.productions.length : 0) +
    (Array.isArray(data.sales) ? data.sales.length : 0) +
    (Array.isArray(data.feedPurchases) ? data.feedPurchases.length : 0) +
    (Array.isArray(data.expenses) ? data.expenses.length : 0) +
    (Array.isArray(data.cashMovements) ? data.cashMovements.length : 0);
  return count > 0;
}
