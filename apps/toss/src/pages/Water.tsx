import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayWater, getTodayIntake, getGoal, setGoal, saveWaterRecord, deleteWaterRecord, generateId } from '../lib/storage';
import type { WaterRecord } from '../lib/types';

export default function Water() {
  const nav = useNavigate();
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [intake, setIntake] = useState(0);
  const [goal, setGoalState] = useState(2000);
  const [custom, setCustom] = useState('');

  const refresh = () => {
    setRecords(getTodayWater());
    setIntake(getTodayIntake());
    setGoalState(getGoal());
  };
  useEffect(() => { refresh(); }, []);

  const add = (ml: number) => {
    saveWaterRecord({ id: generateId(), dateTime: new Date().toISOString(), amountMl: ml });
    refresh();
  };

  const progress = Math.min(intake / goal, 1);
  const r = 80, circ = 2 * Math.PI * r;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#fff' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#333' }}>‹</button>
          <p style={{ fontWeight: 800, fontSize: '18px' }}>💧 물 마시기</p>
        </div>
        <button onClick={() => {
          const v = prompt('하루 목표 (ml)', String(goal));
          const n = parseInt(v ?? '');
          if (n > 0) { setGoal(n); refresh(); }
        }} style={{ background: '#f5f5f5', border: 'none', borderRadius: '10px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: '#666' }}>
          목표 설정
        </button>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Circle */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '20px', background: '#fafafa', borderRadius: '20px' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={r} fill="none" stroke="#f0f0f0" strokeWidth="18" />
              <circle cx="100" cy="100" r={r} fill="none"
                stroke="#4FC3F7" strokeWidth="18" strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '36px' }}>💧</span>
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#4FC3F7' }}>{intake}</p>
              <p style={{ fontSize: '13px', color: '#888' }}>/ {goal}ml</p>
            </div>
          </div>
          <p style={{ fontWeight: 700, fontSize: '15px', color: progress >= 1 ? '#4CAF50' : '#333' }}>
            {progress >= 1 ? '🎉 오늘 목표 달성!' : `${Math.round(progress * 100)}% — ${goal - intake}ml 남음`}
          </p>
        </div>

        {/* Quick add */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#333' }}>빠른 추가</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { ml: 100, label: '☕ 한 모금' },
              { ml: 200, label: '🥤 반 컵' },
              { ml: 300, label: '🥛 한 컵' },
              { ml: 500, label: '🍶 큰 컵' },
            ].map(({ ml, label }) => (
              <button key={ml} onClick={() => add(ml)} style={{
                padding: '16px', border: 'none', borderRadius: '16px',
                background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
                color: 'white', fontWeight: 800, fontSize: '18px', cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(79,195,247,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              }}>
                <span>+{ml}ml</span>
                <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.85 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="number" placeholder="직접 입력 (ml)" value={custom}
            onChange={e => setCustom(e.target.value)}
            style={{
              flex: 1, border: '2px solid #f0f0f0', borderRadius: '14px', padding: '12px 16px',
              fontSize: '14px', color: '#333', outline: 'none', background: '#fafafa',
            }} />
          <button onClick={() => { const v = parseInt(custom); if (v > 0) { add(v); setCustom(''); } }}
            style={{ padding: '12px 20px', border: 'none', borderRadius: '14px', background: '#4FC3F7', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
            추가
          </button>
        </div>

        {/* Records */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#333' }}>오늘의 기록</p>
          {records.length === 0
            ? <p style={{ textAlign: 'center', color: '#bbb', padding: '20px 0' }}>아직 기록이 없어요 💧</p>
            : records.map(r => {
              const t = new Date(r.dateTime);
              const time = `${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid #f5f5f5' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(79,195,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💧</div>
                  <p style={{ flex: 1, fontWeight: 700, color: '#4FC3F7', fontSize: '16px' }}>+{r.amountMl}ml</p>
                  <p style={{ fontSize: '12px', color: '#bbb' }}>{time}</p>
                  <button onClick={() => { deleteWaterRecord(r.id); refresh(); }}
                    style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}
