export interface PoopRecord {
  id: string;
  dateTime: string; // ISO string
  bristolType: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  amount: 'small' | 'medium' | 'large';
  color: 'brown' | 'dark-brown' | 'yellow' | 'green' | 'black' | 'red';
  memo: string;
}

export interface WaterRecord {
  id: string;
  dateTime: string; // ISO string
  amountMl: number;
}

export interface Settings {
  waterGoalMl: number;
}

export const BRISTOL_INFO = [
  { type: 1, emoji: '🪨', name: '토끼똥', desc: '딱딱한 덩어리 (변비)', healthy: false },
  { type: 2, emoji: '🍫', name: '울퉁불퉁', desc: '딱딱한 소시지 (변비)', healthy: false },
  { type: 3, emoji: '🌭', name: '금이 간 소시지', desc: '약간 딱딱 (정상)', healthy: true },
  { type: 4, emoji: '🍌', name: '부드러운 소시지', desc: '이상적인 형태! 🌟', healthy: true },
  { type: 5, emoji: '🌊', name: '부드러운 덩어리', desc: '경계가 있는 묽음', healthy: true },
  { type: 6, emoji: '💧', name: '흐물흐물', desc: '설사 (주의)', healthy: false },
  { type: 7, emoji: '💦', name: '물설사', desc: '심한 설사', healthy: false },
] as const;

export const POOP_COLORS = [
  { id: 'brown', label: '갈색', hex: '#8D6E63' },
  { id: 'dark-brown', label: '진갈색', hex: '#4E342E' },
  { id: 'yellow', label: '노란색', hex: '#FFD54F' },
  { id: 'green', label: '녹색', hex: '#81C784' },
  { id: 'black', label: '검은색', hex: '#424242' },
  { id: 'red', label: '붉은색', hex: '#E57373' },
] as const;
