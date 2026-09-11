'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { sound } from '@/lib/soundEffects';
import { Gift, Sparkles } from 'lucide-react';

interface MysteryBoxProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  disabled?: boolean;
}

export const MysteryBox: React.FC<MysteryBoxProps> = ({
  students,
  onSelectStudent,
  disabled = false,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleOpenBox = () => {
    if (isOpening || disabled || students.length === 0) return;

    setIsOpening(true);
    setShaking(true);

    // Phát âm thanh nhịp đếm hồi hộp
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playTick();
      tickCount++;
      if (tickCount >= 6) {
        clearInterval(tickInterval);
      }
    }, 250);

    setTimeout(() => {
      setShaking(false);
      // Chọn ngẫu nhiên 1 học sinh
      const randomIndex = Math.floor(Math.random() * students.length);
      const chosen = students[randomIndex];
      onSelectStudent(chosen);
      setIsOpening(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none">
      {/* 3D Gift Box Animation */}
      <div className="relative my-6 cursor-pointer" onClick={handleOpenBox}>
        {/* Glow behind */}
        <div className="absolute inset-0 bg-amber-300/40 rounded-full blur-2xl scale-125 animate-pulse" />

        <div
          className={`relative text-8xl sm:text-9xl transition-transform duration-300 ${
            shaking ? 'animate-wiggle scale-110' : 'hover:scale-105'
          }`}
        >
          🎁
        </div>

        {/* Sparkles around */}
        <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-amber-400 animate-spin-slow" />
        <Sparkles className="absolute -bottom-2 -left-3 w-6 h-6 text-orange-400 animate-bounce" />
      </div>

      <p className="text-sm sm:text-base font-bold text-slate-500 max-w-sm text-center">
        Bên trong hộp quà bí mật chứa tên của bạn học sinh may mắn tiếp theo!
      </p>

      {/* Button */}
      <button
        onClick={handleOpenBox}
        disabled={isOpening || disabled || students.length === 0}
        className={`mt-6 px-8 py-3.5 sm:px-10 sm:py-4 rounded-3xl font-black text-lg sm:text-xl shadow-xl transition-all btn-bounce flex items-center space-x-3 ${
          isOpening
            ? 'bg-amber-400 text-amber-950 animate-pulse'
            : students.length === 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-purple-300/80 hover:scale-105 active:scale-95'
        }`}
      >
        <Gift className="w-6 h-6" />
        <span>{isOpening ? 'Đang mở quà bí mật...' : 'MỞ HỘP QUÀ NGAY!'}</span>
      </button>
    </div>
  );
};
