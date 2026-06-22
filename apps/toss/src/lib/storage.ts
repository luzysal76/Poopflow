import type { PoopRecord, WaterRecord } from './types';

const POOP_KEY = 'poopflow_poop';
const WATER_KEY = 'poopflow_water';
const GOAL_KEY = 'poopflow_goal';

function get<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') ?? fallback; }
  catch { return fallback; }
}

function set<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)); }

export const getGoal = (): number => get(GOAL_KEY, 2000);
export const setGoal = (g: number) => set(GOAL_KEY, g);
export const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Poop
export const getPoopRecords = (): PoopRecord[] => get<PoopRecord[]>(POOP_KEY, []);
export const savePoopRecord = (r: PoopRecord) => set(POOP_KEY, [r, ...getPoopRecords()]);
export const deletePoopRecord = (id: string) => set(POOP_KEY, getPoopRecords().filter(r => r.id !== id));
export const getTodayPoop = () => getPoopRecords().filter(r => sameDay(new Date(r.dateTime), new Date()));
export const getPoopForDate = (d: Date) => getPoopRecords().filter(r => sameDay(new Date(r.dateTime), d));

// Water
export const getWaterRecords = (): WaterRecord[] => get<WaterRecord[]>(WATER_KEY, []);
export const saveWaterRecord = (r: WaterRecord) => set(WATER_KEY, [r, ...getWaterRecords()]);
export const deleteWaterRecord = (id: string) => set(WATER_KEY, getWaterRecords().filter(r => r.id !== id));
export const getTodayWater = () => getWaterRecords().filter(r => sameDay(new Date(r.dateTime), new Date()));
export const getTodayIntake = () => getTodayWater().reduce((s, r) => s + r.amountMl, 0);
export const getIntakeForDate = (d: Date) => getWaterRecords().filter(r => sameDay(new Date(r.dateTime), d)).reduce((s, r) => s + r.amountMl, 0);

// Utils
export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const getStreak = () => {
  let count = 0;
  const d = new Date();
  while (getPoopForDate(d).length > 0) { count++; d.setDate(d.getDate() - 1); }
  return count;
};

export const formatTime = (iso: string) => {
  const t = new Date(iso);
  const h = t.getHours(), m = t.getMinutes();
  return `${h >= 12 ? '오후' : '오전'} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
};
