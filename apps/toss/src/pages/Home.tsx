import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodayPoop, getTodayIntake, getGoal, getStreak,
  saveWaterRecord, generateId,
} from '../lib/storage';

export default function Home() {
  const nav = useNavigate();
  const [data, setData] = useState({ poop: 0, water: 0, goal: 2000, streak: 0, lastPoop: '' });
  const [showWater, setShowWater] = useState(false);

  const refresh = () => {
    const poops = getTodayPoop();
    const intake = getTodayIntake();
    const goal = getGoal();
    const streak = getStreak();
    const last = poops[0] ? (() => {
      const t = new Date(poops[0].dateTime);
      return `${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
    })() : '';
    setData({ poop: poops.length, water: intake, goal, streak, lastPoop: last });
  };

  useEffect(() => { refresh(); }, []);

  const addWater = (ml: number) => {
    saveWaterRecord({ id: generateId(), dateTime: new Date().toISOString(), amountMl: ml });
    setShowWater(false);
    refresh();
  };

  const progress = Math.min(data.water / data.goal, 1);

  return (
    <div style={{ padding: '20px', paddingBottom: '24px', maxWidth: '480px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1a1a1a', marginBottom: '4px' }}>
          물한잔똥한번 💧🚽
        </h1>
        <p style={{ fontSize: '13px', color: '#888' }}>
          {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* Streak */}
      {data.streak > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FF8C42, #FFB74D)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '32px' }}>🔥</span>
          <div>
            <p style={{ fontWeight: 800, color: 'white', fontSize: '16px' }}>{data.streak}일 연속 기록!</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>오늘도 잊지 말고 기록해요</p>
          </div>
        </div>
      )}

      {/* Water Card */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>💧</span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>오늘 물 섭취</span>
          </div>
          <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>{data.water}/{data.goal}ml</span>
        </div>
        <div style={{ height: '10px', background: '#f5f5f5', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #4FC3F7, #29B6F6)',
            borderRadius: '5px',
            transition: 'width 0.5s',
          }} />
        </div>
        <p style={{ fontSize: '12px', color: progress >= 1 ? '#4CAF50' : '#888', marginTop: '8px', fontWeight: 600 }}>
          {progress >= 1 ? '🎉 목표 달성!' : `목표까지 ${data.goal - data.water}ml`}
        </p>
      </div>

      {/* Poop Card */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '22px' }}>🚽</span>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>오늘 배변</span>
          </div>
          <p style={{ fontSize: '40px', fontWeight: 900, color: '#FFB74D' }}>{data.poop}회</p>
          <p style={{ fontSize: '12px', color: '#888' }}>마지막: {data.lastPoop || '아직 없음'}</p>
        </div>
        <div style={{ fontSize: '48px' }}>{data.poop > 0 ? '😊' : '😢'}</div>
      </div>

      {/* Actions */}
      <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#1a1a1a' }}>빠른 기록</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => setShowWater(true)} style={{
          background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
          border: 'none', borderRadius: '16px', padding: '20px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(79,195,247,0.35)',
        }}>
          <span style={{ fontSize: '28px' }}>💧</span>
          <span style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>물 마셨어요</span>
        </button>
        <button onClick={() => nav('/poop/add')} style={{
          background: 'linear-gradient(135deg, #FFB74D, #FF8F00)',
          border: 'none', borderRadius: '16px', padding: '20px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,183,77,0.35)',
        }}>
          <span style={{ fontSize: '28px' }}>🚽</span>
          <span style={{ fontWeight: 700, color: 'white', fontSize: '14px' }}>배변했어요</span>
        </button>
      </div>

      {/* Quick water intake */}
      <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px', color: '#1a1a1a' }}>물 빠르게 추가</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        {[100, 200, 300, 500].map(ml => (
          <button key={ml} onClick={() => addWater(ml)} style={{
            flex: 1, padding: '12px 0', border: '2px solid #4FC3F7',
            borderRadius: '12px', fontWeight: 700, color: '#4FC3F7',
            background: 'rgba(79,195,247,0.08)', fontSize: '13px', cursor: 'pointer',
          }}>
            +{ml}
          </button>
        ))}
      </div>

      {/* Water picker modal */}
      {showWater && (
        <div onClick={() => setShowWater(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '480px', margin: '0 auto',
            background: 'white', borderRadius: '20px 20px 0 0', padding: '24px',
          }}>
            <div style={{ width: '40px', height: '4px', background: '#e0e0e0', borderRadius: '2px', margin: '0 auto 20px' }} />
            <p style={{ fontWeight: 800, fontSize: '20px', marginBottom: '16px' }}>💧 물 마신 양</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[100, 200, 300, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)} style={{
                  padding: '20px', border: 'none', borderRadius: '16px', fontWeight: 900,
                  fontSize: '20px', color: 'white', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
                }}>+{ml}ml</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
