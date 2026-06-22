'use client';
import { useState } from 'react';
import { BRISTOL_INFO, POOP_COLORS } from '@/lib/types';
import { savePoopRecord, generateId } from '@/lib/storage';

interface Props { onClose: () => void; }

export default function AddPoopModal({ onClose }: Props) {
  const [bristol, setBristol] = useState(4);
  const [amount, setAmount] = useState<'small' | 'medium' | 'large'>('medium');
  const [color, setColor] = useState('brown');
  const [memo, setMemo] = useState('');

  const save = () => {
    savePoopRecord({
      id: generateId(),
      dateTime: new Date().toISOString(),
      bristolType: bristol as any,
      amount,
      color: color as any,
      memo,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg mx-auto rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        style={{ background: 'white' }}
        onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#BCAAA4' }} />
        <h2 className="text-2xl font-black" style={{ color: '#5D4037' }}>🚽 배변 기록</h2>

        {/* Bristol Scale */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: '#8D6E63' }}>대변 형태</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {BRISTOL_INFO.map(b => (
              <button
                key={b.type}
                onClick={() => setBristol(b.type)}
                className="flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all"
                style={{
                  background: bristol === b.type ? 'rgba(255,183,77,0.2)' : '#FFF8E7',
                  border: bristol === b.type ? '2px solid #FFB74D' : '2px solid transparent',
                }}>
                <span className="text-3xl">{b.emoji}</span>
                <span className="text-[10px] font-semibold text-center leading-tight"
                  style={{ color: bristol === b.type ? '#F57C00' : '#8D6E63' }}>
                  {b.name}
                </span>
              </button>
            ))}
          </div>
          {(() => {
            const b = BRISTOL_INFO.find(b => b.type === bristol)!;
            return (
              <p className="text-xs mt-2 font-medium" style={{ color: b.healthy ? '#66BB6A' : '#FF7043' }}>
                {b.healthy ? '✅' : '⚠️'} {b.desc}
              </p>
            );
          })()}
        </div>

        {/* Amount */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: '#8D6E63' }}>양</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'small', label: '💨 적음' },
              { id: 'medium', label: '💩 보통' },
              { id: 'large', label: '🪣 많음' },
            ].map(a => (
              <button key={a.id} onClick={() => setAmount(a.id as any)}
                className="py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: amount === a.id ? 'rgba(255,183,77,0.2)' : '#FFF8E7',
                  border: amount === a.id ? '2px solid #FFB74D' : '2px solid transparent',
                  color: amount === a.id ? '#F57C00' : '#8D6E63',
                }}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: '#8D6E63' }}>색상</p>
          <div className="flex gap-4 flex-wrap">
            {POOP_COLORS.map(c => (
              <button key={c.id} onClick={() => setColor(c.id)}
                className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full transition-all"
                  style={{
                    background: c.hex,
                    border: color === c.id ? `3px solid #5D4037` : '3px solid transparent',
                    boxShadow: color === c.id ? `0 0 0 2px ${c.hex}40` : 'none',
                  }} />
                <span className="text-[10px] font-semibold"
                  style={{ color: color === c.id ? '#5D4037' : '#BCAAA4' }}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div>
          <p className="text-sm font-bold mb-2" style={{ color: '#8D6E63' }}>메모 (선택)</p>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="예) 커피 마신 후, 배가 아팠음..."
            rows={2}
            className="resize-none"
          />
        </div>

        <button onClick={save} className="btn-accent" style={{ fontSize: '18px', padding: '16px' }}>
          저장하기 💩
        </button>
      </div>
    </div>
  );
}
