/**
 * Database Module: IndexedDB persistence layer
 * Manages Collections Items, Categories, and Exhibitions
 */

const DB_NAME = 'CollectionMuseum';
const DB_VERSION = 1;
const STORES = {
    ITEMS: 'items',
    CATEGORIES: 'categories',
    EXHIBITIONS: 'exhibitions'
};

let db = null;

/**
 * Initialize or upgrade IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export async function initDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            const error = new Error('Database open failed');
            error.details = request.error;
            reject(error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Items store
            if (!database.objectStoreNames.contains(STORES.ITEMS)) {
                const itemStore = database.createObjectStore(STORES.ITEMS, { keyPath: 'id' });
                itemStore.createIndex('createdAt', 'createdAt', { unique: false });
                itemStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                itemStore.createIndex('categoryId', 'categoryId', { unique: false });
            }

            // Categories store
            if (!database.objectStoreNames.contains(STORES.CATEGORIES)) {
                database.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
            }

            // Exhibitions store
            if (!database.objectStoreNames.contains(STORES.EXHIBITIONS)) {
                database.createObjectStore(STORES.EXHIBITIONS, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Get database instance
 * @returns {IDBDatabase}
 */
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

/**
 * Add or update an item
 * @param {string} storeName - Store name (STORES constant)
 * @param {Object} data - Data to store
 * @returns {Promise<string>} - Returns the key
 */
export async function put(storeName, data) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onerror = () => {
            reject(new Error(`Failed to put data in ${storeName}: ${request.error}`));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

/**
 * Get a record by key
 * @param {string} storeName - Store name
 * @param {string|number} key - Record key
 * @returns {Promise<Object|undefined>}
 */
export async function get(storeName, key) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onerror = () => {
            reject(new Error(`Failed to get from ${storeName}: ${request.error}`));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

/**
 * Get all records from a store
 * @param {string} storeName - Store name
 * @returns {Promise<Array>}
 */
export async function getAll(storeName) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        const transaction = database.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => {
            reject(new Error(`Failed to get all from ${storeName}: ${request.error}`));
        };

        request.onsuccess = () => {
            resolve(request.result || []);
        };
    });
}

/**
 * Delete a record
 * @param {string} storeName - Store name
 * @param {string|number} key - Record key
 * @returns {Promise<void>}
 */
export async function remove(storeName, key) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onerror = () => {
            reject(new Error(`Failed to delete from ${storeName}: ${request.error}`));
        };

        request.onsuccess = () => {
            resolve();
        };
    });
}

/**
 * Clear all records from a store
 * @param {string} storeName - Store name
 * @returns {Promise<void>}
 */
export async function clear(storeName) {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        const transaction = database.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onerror = () => {
            reject(new Error(`Failed to clear ${storeName}: ${request.error}`));
        };

        request.onsuccess = () => {
            resolve();
        };
    });
}

/**
 * Execute a complex transaction
 * @param {Array<string>} storeNames - Stores to transaction
 * @param {Function} operation - Function taking stores object, must return void or Promise<void>
 * @param {'readonly'|'readwrite'} mode - Transaction mode
 * @returns {Promise<void>}
 */
export async function transaction(storeNames, operation, mode = 'readwrite') {
    return new Promise((resolve, reject) => {
        const database = getDatabase();
        const tx = database.transaction(storeNames, mode);
        const stores = {};

        storeNames.forEach(name => {
            stores[name] = tx.objectStore(name);
        });

        tx.onerror = () => {
            reject(new Error(`Transaction failed: ${tx.error}`));
        };

        tx.oncomplete = () => {
            resolve();
        };

        tx.onabort = () => {
            reject(new Error('Transaction aborted'));
        };

        try {
            operation(stores, tx);
        } catch (error) {
            tx.abort();
            reject(error);
        }
    });
}

/**
 * Generate a unique ID
 * @returns {string}
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current ISO timestamp
 * @returns {string}
 */
export function getCurrentTimestamp() {
    return new Date().toISOString();
}

export const STORE_NAMES = STORES;
