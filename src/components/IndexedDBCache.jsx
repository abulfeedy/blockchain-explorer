import { openDB } from "idb";

// Initialize IndexedDB
const initDB = async () => {
  return openDB("WalletTransactionDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", { keyPath: "key" });
      }
    },
  });
};

// Cache data with expiry (5 minutes)
export const setCachedData = async (summaryKey, txsKey, summaryData, txData) => {
  try {
    const db = await initDB();
    const tx = db.transaction("cache", "readwrite");
    const store = tx.objectStore("cache");
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await store.put({ key: summaryKey, data: summaryData, expiry });
    await store.put({ key: txsKey, data: txData, expiry });
    await tx.done;
  } catch (err) {
    console.error("Failed to cache data:", err.message);
  }
};

// Retrieve cached data
export const getCachedData = async (summaryKey, txsKey) => {
  try {
    const db = await initDB();
    const tx = db.transaction("cache", "readonly");
    const store = tx.objectStore("cache");
    const summary = await store.get(summaryKey);
    const transactions = await store.get(txsKey);
    if (summary && transactions && summary.expiry > Date.now() && transactions.expiry > Date.now()) {
      return { summary: summary.data, transactions: transactions.data, isExpired: false };
    } else if (summary && transactions) {
      return { summary: summary.data, transactions: transactions.data, isExpired: true };
    }
    return null;
  } catch (err) {
    console.error("Failed to retrieve cached data:", err.message);
    return null;
  }
};