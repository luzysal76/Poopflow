import { PoopRecord, WaterRecord, Settings } from './types';

const POOP_KEY = 'poopflow_poop';
const WATER_KEY = 'poopflow_water';
const SETTINGS_KEY = 'poopflow_settings';

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Poop Records
export function getPoopRecords(): PoopRecord[] {
  return getStorage<PoopRecord[]>(POOP_KEY, []);
}

export function savePoopRecord(record: PoopRecord): void {
  const records = getPoopRecords();
  records.unshift(record);
  setStorage(POOP_KEY, records);
}

export function deletePoopRecord(id: string): void {
  const records = getPoopRecords().filter(r => r.id !== id);
  setStorage(POOP_KEY, records);
}

export function getPoopRecordsForDate(date: Date): PoopRecord[] {
  return getPoopRecords().filter(r => {
    const d = new Date(r.dateTime);
    return d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate();
  });
}

export function getTodayPoopRecords(): PoopRecord[] {
  return getPoopRecordsForDate(new Date());
}

// Water Records
export function getWaterRecords(): WaterRecord[] {
  return getStorage<WaterRecord[]>(WATER_KEY, []);
}

export function saveWaterRecord(record: WaterRecord): void {
  const records = getWaterRecords();
  records.unshift(record);
  setStorage(WATER_KEY, records);
}

export function deleteWaterRecord(id: string): void {
  const records = getWaterRecords().filter(r => r.id !== id);
  setStorage(WATER_KEY, records);
}

export function getWaterRecordsForDate(date: Date): WaterRecord[] {
  return getWaterRecords().filter(r => {
    const d = new Date(r.dateTime);
    return d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate();
  });
}

export function getTodayWaterRecords(): WaterRecord[] {
  return getWaterRecordsForDate(new Date());
}

export function getTodayWaterIntake(): number {
  return getTodayWaterRecords().reduce((sum, r) => sum + r.amountMl, 0);
}

export function getWaterIntakeForDate(date: Date): number {
  return getWaterRecordsForDate(date).reduce((sum, r) => sum + r.amountMl, 0);
}

// Settings
export function getSettings(): Settings {
  return getStorage<Settings>(SETTINGS_KEY, { waterGoalMl: 2000 });
}

export function saveSettings(settings: Settings): void {
  setStorage(SETTINGS_KEY, settings);
}

// Stats
export function getStreak(): number {
  let streak = 0;
  const date = new Date();
  while (true) {
    const records = getPoopRecordsForDate(date);
    if (records.length === 0) break;
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

export function getWeeklyPoopCounts(): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return getPoopRecordsForDate(date).length;
  });
}

export function getWeeklyWaterIntakes(): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return getWaterIntakeForDate(date);
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
