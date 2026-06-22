'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', emoji: '🏠', label: '홈' },
  { href: '/poop', emoji: '🚽', label: '배변' },
  { href: '/water', emoji: '💧', label: '물' },
  { href: '/calendar', emoji: '📅', label: '캘린더' },
  { href: '/analysis', emoji: '📊', label: '분석' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_16px_rgba(93,64,55,0.1)] z-50">
      <div className="max-w-lg mx-auto flex">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center py-3 gap-0.5"
            >
              <span className="text-2xl leading-none">{tab.emoji}</span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: active ? '#4FC3F7' : '#BCAAA4' }}
              >
                {tab.label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-[#4FC3F7] absolute bottom-1" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
