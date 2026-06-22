import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPoopRecords, getWaterRecords, deletePoopRecord, deleteWaterRecord } from '../lib/storage';
import type { PoopRecord, WaterRecord } from '../lib/types';
import { BRISTOL_INFO } from '../lib/types';

type Tab = 'all' | 'poop' | 'water';

export default function History() {
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [poops, setPoops] = useState<PoopRecord[]>([]);
  const [waters, setWaters] = useState<WaterRecord[]>([]);

  const refresh = () => { setPoops(getPoopRecords()); setWaters(getWaterRecords()); };
  useEffect(() => { refresh(); }, []);

  const formatTime = (iso: string) => {
    const t = new Date(iso);
    return `${t.getMonth() + 1}/${t.getDate()} ${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#fff' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#333' }}>‹</button>
        <p style={{ fontWeight: 800, fontSize: '18px' }}>📋 전체 기록</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { id: 'all', label: '전체' },
            { id: 'poop', label: '🚽 배변' },
            { id: 'water', label: '💧 물' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '13px',
              background: tab === t.id ? '#4FC3F7' : '#f5f5f5',
              color: tab === t.id ? 'white' : '#888',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Poop records */}
        {(tab === 'all' || tab === 'poop') && poops.map(r => {
          const b = BRISTOL_INFO.find(b => b.type === r.bristolType)!;
          return (
            <div key={r.id} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: b.healthy ? '#E8F5E9' : '#FBE9E7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                {b.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '14px', color: '#1a1a1a' }}>{b.name}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>{b.healthy ? '✅ 정상' : '⚠️ 주의'} · {r.amount === 'small' ? '적음' : r.amount === 'medium' ? '보통' : '많음'}</p>
                {r.memo && <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>📝 {r.memo}</p>}
                <p style={{ fontSize: '11px', color: '#ccc', marginTop: '4px' }}>{formatTime(r.dateTime)}</p>
              </div>
              <button onClick={() => { deletePoopRecord(r.id); refresh(); }}
                style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
          );
        })}

        {/* Water records */}
        {(tab === 'all' || tab === 'water') && waters.map(r => (
          <div key={r.id} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(79,195,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              💧
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#4FC3F7' }}>+{r.amountMl}ml</p>
              <p style={{ fontSize: '11px', color: '#ccc', marginTop: '2px' }}>{formatTime(r.dateTime)}</p>
            </div>
            <button onClick={() => { deleteWaterRecord(r.id); refresh(); }}
              style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
        ))}

        {poops.length === 0 && waters.length === 0 && (
          <p style={{ textAlign: 'center', color: '#bbb', padding: '40px 0' }}>아직 기록이 없어요</p>
        )}
      </div>
    </div>
  );
}
