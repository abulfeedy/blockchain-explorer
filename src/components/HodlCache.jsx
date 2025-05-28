// src/components/HodlCache.jsx
const DB_NAME = "WalletHodlDB";
const STORE_NAME = "hodlData";
const VERSION = 1;

export const initHodlDB = async () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME, { keyPath: "key" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getCachedHodlData = async (key) => {
  const db = await initHodlDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      const data = request.result;
      if (data && data.expiry && Date.now() > data.expiry) {
        resolve(null); // Expired
      } else {
        resolve(data?.value || null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const setCachedHodlData = async (key, value, expiryMinutes = null) => {
  const db = await initHodlDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const expiry = expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null;
    const request = store.put({ key, value, expiry });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const clearExpiredHodlData = async () => {
  const db = await initHodlDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const now = Date.now();
      request.result.forEach((item) => {
        if (item.expiry && now > item.expiry) {
          store.delete(item.key);
        }
      });
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
};