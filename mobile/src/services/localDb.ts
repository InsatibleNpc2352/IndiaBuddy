import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDb = async () => {
  db = await SQLite.openDatabaseAsync('indiabuddy.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS searches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT,
      destination TEXT,
      date TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS cached_results (
      key TEXT PRIMARY KEY,
      data TEXT,
      expiresAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS user_prefs (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
};

export const saveSearch = async (origin: string, destination: string, date: string) => {
  if (!db) return;
  await db.runAsync(
    'INSERT INTO searches (origin, destination, date) VALUES (?, ?, ?)',
    [origin, destination, date]
  );
};

export const getRecentSearches = async () => {
  if (!db) return [];
  const result = await db.getAllAsync<{ origin: string; destination: string; date: string }>(
    'SELECT DISTINCT origin, destination, date FROM searches ORDER BY timestamp DESC LIMIT 10'
  );
  return result;
};

export const cacheResults = async (key: string, data: any, ttlSeconds: number) => {
  if (!db) return;
  const expiresAt = Date.now() + ttlSeconds * 1000;
  await db.runAsync(
    'INSERT OR REPLACE INTO cached_results (key, data, expiresAt) VALUES (?, ?, ?)',
    [key, JSON.stringify(data), expiresAt]
  );
};

export const getCached = async (key: string) => {
  if (!db) return null;
  const result = await db.getFirstAsync<{ data: string; expiresAt: number }>(
    'SELECT data, expiresAt FROM cached_results WHERE key = ?',
    [key]
  );
  if (result) {
    if (Date.now() > result.expiresAt) {
      await db.runAsync('DELETE FROM cached_results WHERE key = ?', [key]);
      return null;
    }
    return JSON.parse(result.data);
  }
  return null;
};
