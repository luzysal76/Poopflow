'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import {
  getTodayPoopRecords,
  getTodayWaterIntake,
  getSettings,
  getStreak,
  saveWaterRecord,
  savePoopRecord,
  generateId,
} from '@/lib/storage';
import { BRISTOL_INFO } from '@/lib/types';
import AddPoopModal from '@/components/AddPoopModal';

export default function Home() {
  const [poopCount, setPoopCount] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [lastPoop, setLastPoop] = useState<string | null>(null);
  const [showPoopModal, setShowPoopModal] = useState(false);
  const [showWaterPicker, setShowWaterPicker] = useState(false);

  const refresh = () => {
    const poops = getTodayPoopRecords();
    const water = getTodayWaterIntake();
    const settings = getSettings();
    setPoopCount(poops.length);
    setWaterIntake(water);
    setWaterGoal(settings.waterGoalMl);
    setStreak(getStreak());
    if (poops.length > 0) {
      const t = new Date(poops[0].dateTime);
      setLastPoop(`${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`);
    }
  };

  useEffect(() => { refresh(); }, []);

  const addWater = (ml: number) => {
    saveWaterRecord({ id: generateId(), dateTime: new Date().toISOString(), amountMl: ml });
    setShowWaterPicker(false);
    refresh();
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  const progress = Math.min(waterIntake / waterGoal, 1);

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-24">
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#5D4037' }}>물한잔똥한번 💧🚽</h1>
            <p className="text-sm" style={{ color: '#8D6E63' }}>{dateStr}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(79,195,247,0.15)' }}>
            👋
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #FFB74D)' }}>
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-lg font-black text-white">{streak}일 연속 기록 중!</p>
              <p className="text-xs text-white/70">오늘도 잊지 말고 기록해요 💪</p>
            </div>
          </div>
        )}

        {/* Water Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💧</span>
              <span className="font-bold" style={{ color: '#5D4037' }}>오늘 물 섭취</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#8D6E63' }}>
              {waterIntake}ml / {waterGoal}ml
            </span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#FFF8E7' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #4FC3F7, #29B6F6)',
              }}
            />
          </div>
          <p className="text-xs mt-2 font-semibold"
            style={{ color: progress >= 1 ? '#66BB6A' : '#8D6E63' }}>
            {progress >= 1 ? '🎉 오늘 목표 달성!' : `목표까지 ${waterGoal - waterIntake}ml 남았어요`}
          </p>
        </div>

        {/* Poop Card */}
        <div className="card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚽</span>
              <span className="font-bold" style={{ color: '#5D4037' }}>오늘 배변</span>
            </div>
            <p className="text-4xl font-black" style={{ color: '#FFB74D' }}>{poopCount}회</p>
            <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>
              마지막: {lastPoop ?? '아직 없음'}
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: poopCount > 0 ? 'rgba(255,183,77,0.15)' : '#FFF8E7' }}>
            {poopCount > 0 ? '😊' : '😢'}
          </div>
        </div>

        {/* Quick Actions */}
        <p className="font-bold text-base" style={{ color: '#5D4037' }}>빠른 기록</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowWaterPicker(true)}
            className="rounded-2xl p-5 flex flex-col items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)', boxShadow: '0 4px 12px rgba(79,195,247,0.3)' }}>
            <span className="text-3xl">💧</span>
            <span className="font-bold text-white text-sm">물 마셨어요</span>
          </button>
          <button
            onClick={() => setShowPoopModal(true)}
            className="rounded-2xl p-5 flex flex-col items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)', boxShadow: '0 4px 12px rgba(255,183,77,0.3)' }}>
            <span className="text-3xl">🚽</span>
            <span className="font-bold text-white text-sm">배변했어요</span>
          </button>
        </div>

        {/* Recent poop records */}
        {getTodayPoopRecords().slice(0, 3).map(r => {
          const b = BRISTOL_INFO.find(b => b.type === r.bristolType)!;
          const t = new Date(r.dateTime);
          const timeStr = `${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
          return (
            <div key={r.id} className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'white', border: '1px solid #FFF8E7' }}>
              <span className="text-2xl">{b.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#5D4037' }}>{b.name}</p>
                {r.memo && <p className="text-xs" style={{ color: '#8D6E63' }}>{r.memo}</p>}
              </div>
              <span className="text-xs" style={{ color: '#BCAAA4' }}>{timeStr}</span>
            </div>
          );
        })}
      </div>

      {/* Water Picker Modal */}
      {showWaterPicker && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setShowWaterPicker(false)}>
          <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-4"
            style={{ background: 'white' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#BCAAA4' }} />
            <p className="text-xl font-black" style={{ color: '#5D4037' }}>💧 물 마신 양</p>
            <div className="grid grid-cols-2 gap-3">
              {[100, 200, 300, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)}
                  className="py-4 rounded-2xl font-black text-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)' }}>
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Poop Modal */}
      {showPoopModal && (
        <AddPoopModal onClose={() => { setShowPoopModal(false); refresh(); }} />
      )}

      <BottomNav />
    </div>
  );
}
