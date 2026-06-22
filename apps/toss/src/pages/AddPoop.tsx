import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePoopRecord, generateId } from '../lib/storage';
import { BRISTOL_INFO, POOP_COLORS } from '../lib/types';

export default function AddPoop() {
  const nav = useNavigate();
  const [bristol, setBristol] = useState(4);
  const [amount, setAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [color, setColor] = useState('brown');
  const [memo, setMemo] = useState('');

  const save = () => {
    savePoopRecord({
      id: generateId(),
      dateTime: new Date().toISOString(),
      bristolType: bristol as any,
      amount, color, memo,
    });
    nav('/');
  };

  const selected = BRISTOL_INFO.find(b => b.type === bristol)!;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#fff' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#333', padding: '4px' }}>‹</button>
        <p style={{ fontWeight: 800, fontSize: '18px' }}>🚽 배변 기록</p>
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Bristol Scale */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#666', marginBottom: '12px' }}>대변 형태</p>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {BRISTOL_INFO.map(b => (
              <button key={b.type} onClick={() => setBristol(b.type)} style={{
                flexShrink: 0, width: '76px', height: '96px',
                border: bristol === b.type ? '2px solid #FFB74D' : '2px solid #f0f0f0',
                borderRadius: '16px', background: bristol === b.type ? 'rgba(255,183,77,0.1)' : 'white',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '4px',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '28px' }}>{b.emoji}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: bristol === b.type ? '#F57C00' : '#888', textAlign: 'center', lineHeight: '1.3' }}>
                  {b.name}
                </span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '10px', background: selected.healthy ? '#E8F5E9' : '#FBE9E7' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: selected.healthy ? '#388E3C' : '#D84315' }}>
              {selected.healthy ? '✅' : '⚠️'} {selected.desc}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#666', marginBottom: '12px' }}>양</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { id: 'small', label: '💨', sub: '적음' },
              { id: 'medium', label: '💩', sub: '보통' },
              { id: 'large', label: '🪣', sub: '많음' },
            ].map(a => (
              <button key={a.id} onClick={() => setAmount(a.id as any)} style={{
                border: amount === a.id ? '2px solid #FFB74D' : '2px solid #f0f0f0',
                borderRadius: '14px', background: amount === a.id ? 'rgba(255,183,77,0.1)' : 'white',
                padding: '14px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '4px',
              }}>
                <span style={{ fontSize: '24px' }}>{a.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: amount === a.id ? '#F57C00' : '#888' }}>{a.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#666', marginBottom: '12px' }}>색상</p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {POOP_COLORS.map(c => (
              <button key={c.id} onClick={() => setColor(c.id)} style={{
                border: 'none', background: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%', background: c.hex,
                  border: color === c.id ? `3px solid #333` : '3px solid transparent',
                  boxShadow: color === c.id ? `0 0 0 2px ${c.hex}60` : 'none',
                }} />
                <span style={{ fontSize: '10px', fontWeight: 600, color: color === c.id ? '#333' : '#bbb' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div>
          <p style={{ fontWeight: 700, fontSize: '14px', color: '#666', marginBottom: '8px' }}>메모 (선택)</p>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="예) 커피 마신 후, 배가 아팠음..."
            rows={3}
            style={{
              width: '100%', border: '2px solid #f0f0f0', borderRadius: '14px',
              padding: '12px 16px', fontSize: '14px', color: '#333',
              resize: 'none', outline: 'none', background: '#fafafa',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#4FC3F7'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#f0f0f0'; }}
          />
        </div>

        {/* Save */}
        <button onClick={save} style={{
          width: '100%', padding: '18px', border: 'none', borderRadius: '16px',
          background: 'linear-gradient(135deg, #FFB74D, #FF8F00)', color: 'white',
          fontWeight: 800, fontSize: '18px', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(255,183,77,0.4)',
        }}>
          저장하기 💩
        </button>
      </div>
    </div>
  );
}
