'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { sound } from '@/lib/soundEffects';
import { Sparkles, Layers } from 'lucide-react';

interface CardPickerProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  disabled?: boolean;
}

const CARD_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
  'from-rose-500 to-pink-600',
];

export const CardPicker: React.FC<CardPickerProps> = ({
  students,
  onSelectStudent,
  disabled = false,
}) => {
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  const handlePickCard = (cardIdx: number) => {
    if (isShuffling || disabled || students.length === 0) return;

    setSelectedCardIdx(cardIdx);
    sound.playTick();

    // Random chọn 1 học sinh
    const chosen = students[Math.floor(Math.random() * students.length)];
    setTimeout(() => {
      onSelectStudent(chosen);
      setSelectedCardIdx(null);
    }, 800);
  };

  const handleShuffle = () => {
    if (isShuffling || disabled || students.length === 0) return;
    setIsShuffling(true);

    let count = 0;
    const interval = setInterval(() => {
      sound.playTick();
      count++;
      if (count >= 5) {
        clearInterval(interval);
        setIsShuffling(false);
        handlePickCard(Math.floor(Math.random() * 4));
      }
    }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      <p className="text-sm font-bold text-slate-500 mb-6 text-center">
        Bấm chọn một lá bài ma thuật hoặc bấm "Xáo bài tự động"
      </p>

      {/* 4 Mystery Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl w-full">
        {[0, 1, 2, 3].map((idx) => {
          const isSelected = selectedCardIdx === idx;
          return (
            <div
              key={idx}
              onClick={() => handlePickCard(idx)}
              className={`h-48 sm:h-56 rounded-3xl bg-gradient-to-br ${CARD_COLORS[idx]} p-1 shadow-lg cursor-pointer transform transition-all duration-300 ${
                isShuffling
                  ? 'scale-95 translate-y-2 opacity-80'
                  : isSelected
                  ? 'scale-110 -translate-y-4 shadow-2xl ring-4 ring-amber-300'
                  : 'hover:scale-105 hover:-translate-y-2'
              }`}
            >
              <div className="w-full h-full rounded-[22px] border-2 border-white/40 flex flex-col items-center justify-center text-white space-y-3 p-4">
                <div className="text-3xl sm:text-4xl animate-pulse">🌟</div>
                <div className="text-xl sm:text-2xl font-black">#{idx + 1}</div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                  Lá Bài May Mắn
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleShuffle}
        disabled={isShuffling || disabled || students.length === 0}
        className="mt-8 px-8 py-3.5 sm:px-10 sm:py-4 rounded-3xl font-black text-lg sm:text-xl shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-300/80 hover:scale-105 active:scale-95 transition-all btn-bounce flex items-center space-x-3"
      >
        <Layers className="w-6 h-6" />
        <span>{isShuffling ? 'Đang xáo bài ma thuật...' : 'XÁO BÀI TỰ ĐỘNG!'}</span>
      </button>
    </div>
  );
};
