'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import AddPoopModal from '@/components/AddPoopModal';
import { getPoopRecords, deletePoopRecord } from '@/lib/storage';
import { PoopRecord, BRISTOL_INFO, POOP_COLORS } from '@/lib/types';

export default function PoopPage() {
  const [records, setRecords] = useState<PoopRecord[]>([]);
  const [showModal, setShowModal] = useState(false);

  const refresh = () => setRecords(getPoopRecords());

  useEffect(() => { refresh(); }, []);

  const handleDelete = (id: string) => {
    if (confirm('이 기록을 삭제하시겠어요?')) {
      deletePoopRecord(id);
      refresh();
    }
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-24">
      <div className="p-5">
        <div className="flex items-center justify-between mb-5 pt-2">
          <h1 className="text-xl font-black" style={{ color: '#5D4037' }}>🚽 배변 기록</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)' }}>
            + 기록
          </button>
        </div>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-7xl">🚽</span>
            <p className="text-lg font-bold" style={{ color: '#5D4037' }}>아직 기록이 없어요</p>
            <p className="text-sm" style={{ color: '#8D6E63' }}>배변 후 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(r => {
              const b = BRISTOL_INFO.find(b => b.type === r.bristolType)!;
              const c = POOP_COLORS.find(c => c.id === r.color)!;
              const t = new Date(r.dateTime);
              const dateStr = `${t.getMonth() + 1}/${t.getDate()} ${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
              const amountLabel = { small: '적음', medium: '보통', large: '많음' }[r.amount];
              return (
                <div key={r.id} className="card" style={{ padding: '16px' }}>
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                      style={{ background: b.healthy ? 'rgba(165,214,167,0.2)' : 'rgba(255,112,67,0.1)' }}>
                      {b.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold" style={{ color: '#5D4037' }}>{b.name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                          style={{
                            background: b.healthy ? 'rgba(165,214,167,0.2)' : 'rgba(255,112,67,0.1)',
                            color: b.healthy ? '#388E3C' : '#FF5722',
                          }}>
                          {b.healthy ? '✅ 정상' : '⚠️ 주의'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Tag label={`양: ${amountLabel}`} color="#4FC3F7" />
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full" style={{ background: c?.hex ?? '#8D6E63' }} />
                          <span className="text-xs font-semibold" style={{ color: '#8D6E63' }}>{c?.label}</span>
                        </div>
                        <Tag label={`유형 ${r.bristolType}`} color="#FFB74D" />
                      </div>
                      {r.memo && <p className="text-xs mt-1" style={{ color: '#8D6E63' }}>📝 {r.memo}</p>}
                      <p className="text-xs mt-1" style={{ color: '#BCAAA4' }}>{dateStr}</p>
                    </div>
                    <button onClick={() => handleDelete(r.id)}
                      className="text-lg self-start" style={{ color: '#BCAAA4' }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <AddPoopModal onClose={() => { setShowModal(false); refresh(); }} />}

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full text-2xl shadow-lg"
        style={{ background: 'linear-gradient(135deg, #FFB74D, #FF8F00)', zIndex: 40 }}>
        🚽
      </button>

      <BottomNav />
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
      style={{ background: `${color}20`, color }}>
      {label}
    </span>
  );
}
