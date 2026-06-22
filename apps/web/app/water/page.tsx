'use client';
import { useState, useEffect, useRef } from 'react';
import BottomNav from '@/components/BottomNav';
import {
  getTodayWaterRecords, getTodayWaterIntake, getSettings,
  saveWaterRecord, deleteWaterRecord, saveSettings, generateId,
} from '@/lib/storage';
import { WaterRecord } from '@/lib/types';

export default function WaterPage() {
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(2000);
  const [customMl, setCustomMl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    setRecords(getTodayWaterRecords());
    setIntake(getTodayWaterIntake());
    setGoal(getSettings().waterGoalMl);
  };

  useEffect(() => { refresh(); }, []);

  const addWater = (ml: number) => {
    saveWaterRecord({ id: generateId(), dateTime: new Date().toISOString(), amountMl: ml });
    refresh();
  };

  const addCustom = () => {
    const val = parseInt(customMl);
    if (val > 0) { addWater(val); setCustomMl(''); }
  };

  const handleDelete = (id: string) => {
    deleteWaterRecord(id);
    refresh();
  };

  const progress = Math.min(intake / goal, 1);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - progress);

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-24">
      <div className="p-5 space-y-5">
        <div className="pt-2 flex items-center justify-between">
          <h1 className="text-xl font-black" style={{ color: '#5D4037' }}>💧 물 마시기</h1>
          <button
            onClick={() => {
              const val = prompt('하루 목표를 설정하세요 (ml)', String(goal));
              const n = parseInt(val ?? '');
              if (n > 0) { saveSettings({ waterGoalMl: n }); refresh(); }
            }}
            className="text-sm font-semibold px-3 py-1.5 rounded-xl"
            style={{ background: '#FFF8E7', color: '#8D6E63' }}>
            ⚙️ 목표
          </button>
        </div>

        {/* Circular Progress */}
        <div className="card flex flex-col items-center py-6 gap-3">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none"
                stroke="#FFF8E7" strokeWidth="20" />
              <circle cx="100" cy="100" r="80" fill="none"
                stroke="url(#waterGrad)" strokeWidth="20"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
              <defs>
                <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4FC3F7" />
                  <stop offset="100%" stopColor="#0288D1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl">💧</span>
              <p className="text-3xl font-black" style={{ color: '#4FC3F7' }}>{intake}ml</p>
              <p className="text-sm" style={{ color: '#8D6E63' }}>/ {goal}ml</p>
            </div>
          </div>
          <p className="font-bold text-base"
            style={{ color: progress >= 1 ? '#66BB6A' : '#5D4037' }}>
            {progress >= 1 ? '🎉 오늘 목표 달성!' : `${Math.round(progress * 100)}% 달성 — ${goal - intake}ml 남음`}
          </p>
        </div>

        {/* Quick Add */}
        <div>
          <p className="font-bold mb-3" style={{ color: '#5D4037' }}>빠른 추가</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { ml: 100, label: '☕ 한 모금' },
              { ml: 200, label: '🥤 반 컵' },
              { ml: 300, label: '🥛 한 컵' },
              { ml: 500, label: '🍶 큰 컵' },
            ].map(({ ml, label }) => (
              <button key={ml} onClick={() => addWater(ml)}
                className="py-4 rounded-2xl flex flex-col items-center gap-1"
                style={{ background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)', boxShadow: '0 4px 12px rgba(79,195,247,0.3)' }}>
                <p className="text-2xl font-black text-white">+{ml}ml</p>
                <p className="text-xs text-white/80">{label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="number"
            placeholder="직접 입력 (ml)"
            value={customMl}
            onChange={e => setCustomMl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <button onClick={addCustom}
            className="px-5 py-3 rounded-2xl font-bold text-white whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)', minWidth: '70px' }}>
            추가
          </button>
        </div>

        {/* Today's records */}
        <div>
          <p className="font-bold mb-3" style={{ color: '#5D4037' }}>오늘의 기록</p>
          {records.length === 0 ? (
            <div className="card text-center py-6" style={{ color: '#8D6E63' }}>아직 기록이 없어요 💧</div>
          ) : (
            <div className="space-y-2">
              {records.map(r => {
                const t = new Date(r.dateTime);
                const timeStr = `${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'white', border: '1px solid #FFF8E7' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: 'rgba(79,195,247,0.15)' }}>💧</div>
                    <p className="flex-1 font-bold text-base" style={{ color: '#4FC3F7' }}>+{r.amountMl}ml</p>
                    <p className="text-xs" style={{ color: '#BCAAA4' }}>{timeStr}</p>
                    <button onClick={() => handleDelete(r.id)} style={{ color: '#BCAAA4' }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
