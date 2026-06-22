'use client';
import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import {
  getPoopRecords, getWeeklyPoopCounts, getWeeklyWaterIntakes, getSettings
} from '@/lib/storage';

const WEEKDAY_LABELS = ['6일전', '5일전', '4일전', '3일전', '이틀전', '어제', '오늘'];

export default function AnalysisPage() {
  const [poopCounts, setPoopCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [waterIntakes, setWaterIntakes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [goal, setGoal] = useState(2000);
  const [totalDays, setTotalDays] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const settings = getSettings();
    const g = settings.waterGoalMl;
    const pc = getWeeklyPoopCounts();
    const wc = getWeeklyWaterIntakes();
    const records = getPoopRecords();
    const days = new Set(records.map(r => {
      const d = new Date(r.dateTime);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;

    const waterScore = Math.round(wc.filter(w => w >= g).length / 7 * 40);
    const poopScore = Math.round(pc.filter(c => c >= 1).length / 7 * 40);
    const bristolScore = (() => {
      const recent = records.slice(0, 10);
      if (!recent.length) return 0;
      const healthy = recent.filter(r => r.bristolType >= 3 && r.bristolType <= 5).length;
      return Math.round(healthy / recent.length * 20);
    })();

    setGoal(g);
    setPoopCounts(pc);
    setWaterIntakes(wc);
    setTotalDays(days);
    setScore(Math.min(waterScore + poopScore + bristolScore, 100));
  }, []);

  const maxWater = Math.max(...waterIntakes, goal);
  const maxPoop = Math.max(...poopCounts, 3);
  const scoreColor = score >= 80 ? '#66BB6A' : score >= 60 ? '#4FC3F7' : score >= 40 ? '#FFB74D' : '#FF7043';

  return (
    <div className="max-w-lg mx-auto min-h-screen pb-24">
      <div className="p-5 space-y-4">
        <h1 className="text-xl font-black pt-2" style={{ color: '#5D4037' }}>📊 분석</h1>

        {totalDays < 7 ? (
          <div className="card flex flex-col items-center py-8 gap-4">
            <span className="text-6xl">📊</span>
            <p className="text-lg font-black" style={{ color: '#5D4037' }}>AI 분석 준비 중</p>
            <p className="text-sm text-center" style={{ color: '#8D6E63', lineHeight: '1.7' }}>
              7일 이상 기록하면<br />AI 분석을 볼 수 있어요!<br />현재: {totalDays}일 기록됨
            </p>
            <div className="w-full" style={{ background: '#FFF8E7', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
              <div style={{
                width: `${(totalDays / 7) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #4FC3F7, #29B6F6)',
                borderRadius: '8px',
                transition: 'width 0.5s',
              }} />
            </div>
            <p className="text-xs" style={{ color: '#BCAAA4' }}>{7 - totalDays}일 더 기록하면 분석 시작!</p>
          </div>
        ) : (
          <div className="card">
            <p className="font-bold mb-4" style={{ color: '#5D4037' }}>장 건강 점수</p>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#FFF8E7" strokeWidth="12" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black" style={{ color: scoreColor }}>{score}</p>
                  <p className="text-xs" style={{ color: '#8D6E63' }}>점</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: '💧 수분', value: Math.round(waterIntakes.filter(w => w >= goal).length / 7 * 40), max: 40, color: '#4FC3F7' },
                  { label: '🚽 배변', value: Math.round(poopCounts.filter(c => c >= 1).length / 7 * 40), max: 40, color: '#FFB74D' },
                  { label: '📊 형태', value: score - Math.round(waterIntakes.filter(w => w >= goal).length / 7 * 40) - Math.round(poopCounts.filter(c => c >= 1).length / 7 * 40), max: 20, color: '#A5D6A7' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#8D6E63' }}>{item.label}</span>
                      <span className="font-bold" style={{ color: item.color }}>{item.value}/{item.max}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#FFF8E7' }}>
                      <div style={{
                        width: `${(item.value / item.max) * 100}%`,
                        height: '100%',
                        background: item.color,
                        borderRadius: '4px',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Water Chart */}
        <div className="card">
          <p className="font-bold mb-4" style={{ color: '#5D4037' }}>💧 주간 수분 섭취</p>
          <div className="flex items-end gap-2 h-32">
            {waterIntakes.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all duration-500 relative"
                  style={{
                    height: `${Math.max((val / maxWater) * 100, 4)}%`,
                    background: val >= goal ? 'linear-gradient(180deg, #4FC3F7, #29B6F6)' : 'rgba(79,195,247,0.3)',
                    minHeight: '4px',
                  }} />
                <span className="text-[9px] font-semibold" style={{ color: '#8D6E63' }}>{WEEKDAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: '#8D6E63' }}>
            <div className="w-3 h-3 rounded" style={{ background: '#4FC3F7' }} />
            목표 달성
            <div className="w-3 h-3 rounded ml-2" style={{ background: 'rgba(79,195,247,0.3)' }} />
            미달성
          </div>
        </div>

        {/* Weekly Poop Chart */}
        <div className="card">
          <p className="font-bold mb-4" style={{ color: '#5D4037' }}>🚽 주간 배변 횟수</p>
          <div className="flex items-end gap-2 h-32">
            {poopCounts.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((val / maxPoop) * 100, 4)}%`,
                    background: val > 0 ? 'linear-gradient(180deg, #FFB74D, #FF8F00)' : 'rgba(255,183,77,0.3)',
                    minHeight: '4px',
                  }} />
                <span className="text-[9px] font-semibold" style={{ color: '#8D6E63' }}>{WEEKDAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {totalDays >= 7 && (
          <div className="card space-y-3">
            <p className="font-bold" style={{ color: '#5D4037' }}>🤖 AI 인사이트</p>
            {[
              waterIntakes.reduce((s, v) => s + v, 0) / 7 >= goal * 0.9
                ? { emoji: '💧', text: `이번 주 수분 섭취가 훌륭해요! 평균 ${Math.round(waterIntakes.reduce((s, v) => s + v, 0) / 7)}ml를 마셨어요.` }
                : { emoji: '⚠️', text: `이번 주 수분 섭취가 부족해요. 목표의 ${Math.round(waterIntakes.reduce((s, v) => s + v, 0) / 7 / goal * 100)}%만 달성했어요.` },
              poopCounts.filter(c => c >= 1).length >= 5
                ? { emoji: '✅', text: '규칙적인 배변 습관을 유지하고 있어요!' }
                : { emoji: '🚨', text: '배변 횟수가 적어요. 물을 더 마시고 식이섬유를 섭취해보세요.' },
            ].map((insight, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xl">{insight.emoji}</span>
                <p className="text-sm leading-relaxed" style={{ color: '#5D4037' }}>{insight.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
