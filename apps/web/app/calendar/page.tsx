'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { getPoopRecordsForDate, getWaterIntakeForDate, getSettings } from '@/lib/storage';
import { BRISTOL_INFO } from '@/lib/types';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function CalendarPage() {
  const [today] = useState(new Date());
  const [focused, setFocused] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const [goal, setGoal] = useState(2000);

  useEffect(() => { setGoal(getSettings().waterGoalMl); }, []);

  const year = focused.getFullYear();
  const month = focused.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => setFocused(new Date(year, month - 1, 1));
  const nextMonth = () => setFocused(new Date(year, month + 1, 1));

  const selectedDate = selected ?? today;
  const selectedPoops = getPoopRecordsForDate(selectedDate);
  const selectedWater = getWaterIntakeForDate(selectedDate);
  const selectedGoal = selectedWater >= goal;

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-24">
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-black pt-2" style={{ color: '#5D4037' }}>📅 캘린더</h1>

        {/* Calendar */}
        <div className="card" style={{ padding: '16px' }}>
          {/* Month header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: '#FFF8E7', color: '#8D6E63' }}>‹</button>
            <p className="font-bold text-base" style={{ color: '#5D4037' }}>{year}년 {MONTHS[month]}</p>
            <button onClick={nextMonth} className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: '#FFF8E7', color: '#8D6E63' }}>›</button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d, i) => (
              <p key={d} className="text-center text-xs font-semibold py-1"
                style={{ color: i === 0 ? '#FF7043' : i === 6 ? '#4FC3F7' : '#8D6E63' }}>
                {d}
              </p>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const date = new Date(year, month, day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = selected && day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();
              const hasPoop = getPoopRecordsForDate(date).length > 0;
              const waterAchieved = getWaterIntakeForDate(date) >= goal;

              return (
                <button key={i}
                  onClick={() => setSelected(date)}
                  className="relative flex flex-col items-center py-1 rounded-xl"
                  style={{
                    background: isSelected ? '#4FC3F7' : isToday ? 'rgba(79,195,247,0.15)' : 'transparent',
                  }}>
                  <span className="text-sm font-semibold"
                    style={{
                      color: isSelected ? 'white' : i % 7 === 0 ? '#FF7043' : i % 7 === 6 ? '#4FC3F7' : '#5D4037',
                    }}>
                    {day}
                  </span>
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {hasPoop && <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : '#FFB74D' }} />}
                    {waterAchieved && <div className="w-1.5 h-1.5 rounded-full" style={{ background: isSelected ? 'white' : '#4FC3F7' }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs font-semibold" style={{ color: '#8D6E63' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFB74D' }} />
            배변 기록
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#4FC3F7' }} />
            물 목표 달성
          </div>
        </div>

        {/* Selected day detail */}
        <div className="space-y-3">
          <p className="font-bold" style={{ color: '#5D4037' }}>
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 기록
          </p>

          {/* Water */}
          <div className="p-4 rounded-2xl"
            style={{
              background: selectedGoal ? 'rgba(79,195,247,0.1)' : 'white',
              border: selectedGoal ? '1px solid rgba(79,195,247,0.4)' : '1px solid #FFF8E7',
            }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💧</span>
              <div>
                <p className="font-bold" style={{ color: '#5D4037' }}>물 섭취: {selectedWater}ml</p>
                <p className="text-xs" style={{ color: selectedGoal ? '#4FC3F7' : '#8D6E63' }}>
                  {selectedGoal ? '🎉 목표 달성!' : '목표 미달성'}
                </p>
              </div>
            </div>
          </div>

          {/* Poops */}
          {selectedPoops.length === 0 ? (
            <div className="p-4 rounded-2xl flex items-center gap-3"
              style={{ background: 'white', border: '1px solid #FFF8E7' }}>
              <span className="text-2xl">🚽</span>
              <p style={{ color: '#8D6E63' }}>배변 기록 없음</p>
            </div>
          ) : (
            selectedPoops.map(r => {
              const b = BRISTOL_INFO.find(b => b.type === r.bristolType)!;
              const t = new Date(r.dateTime);
              const timeStr = `${t.getHours() >= 12 ? '오후' : '오전'} ${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
              return (
                <div key={r.id} className="p-3 rounded-2xl flex items-center gap-3"
                  style={{ background: 'white', border: '1px solid #FFF8E7' }}>
                  <span className="text-2xl">{b.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: '#5D4037' }}>{b.name}</p>
                    {r.memo && <p className="text-xs" style={{ color: '#8D6E63' }}>{r.memo}</p>}
                  </div>
                  <p className="text-xs" style={{ color: '#BCAAA4' }}>{timeStr}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
