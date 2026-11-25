// 本機示範儲存：IndexedDB（失敗時退回記憶體）。
// 注意：IndexedDB 只係瀏覽器本機儲存，並唔等於加密保管庫。
import { MEMORIES, LEGACY, GRAVE } from './demo-data.js';

const DB_NAME = 'faanukkei-demo';
const STORE = 'kv';
const SEED = () => ({
  memories: structuredClone(MEMORIES),
  legacy: structuredClone(LEGACY),
  grave: structuredClone(GRAVE),
  graveSavedAt: null,
});

let dbPromise = null;
let mem = null; // in-memory fallback

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in self)) return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(r && r.result);
    t.onerror = () => reject(t.error);
  }));
}

export async function get(key) {
  try {
    const v = await tx('readonly', s => s.get(key));
    if (v !== undefined) return v;
  } catch (e) {
    if (!mem) mem = SEED();
    return mem[key];
  }
  const seed = SEED()[key];
  await set(key, seed);
  return structuredClone(seed);
}

export async function set(key, value) {
  try {
    await tx('readwrite', s => s.put(value, key));
  } catch (e) {
    if (!mem) mem = SEED();
    mem[key] = value;
  }
}

export async function reset() {
  mem = null;
  const seed = SEED();
  try {
    await tx('readwrite', s => { s.clear(); Object.entries(seed).forEach(([k, v]) => s.put(v, k)); });
  } catch (e) { mem = seed; }
}
