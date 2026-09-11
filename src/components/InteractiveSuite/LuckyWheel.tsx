'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Student } from '@/types';
import { sound } from '@/lib/soundEffects';

interface LuckyWheelProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  disabled?: boolean;
}

const WHEEL_COLORS = [
  '#FF5964', '#35A7FF', '#FFE74C', '#38B000', 
  '#FF9F1C', '#9D4EDD', '#00F5D4', '#FF6B8B',
  '#4361EE', '#F72585', '#4CC9F0', '#70E000'
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  students,
  onSelectStudent,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Vẽ vòng quay lên canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (students.length === 0) {
      // Vòng quay rỗng
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 16px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Đã gọi hết học sinh!', centerX, centerY);
      return;
    }

    const sliceAngle = (2 * Math.PI) / students.length;

    // Vẽ từng sector
    for (let i = 0; i < students.length; i++) {
      const st = students[i];
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Màu nền sector
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();

      // Đường viền sector
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vẽ chữ và avatar tên học sinh
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Chữ trắng đậm có viền bóng
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#ffffff';

      const fontSize = students.length > 25 ? 12 : students.length > 15 ? 14 : 16;
      ctx.font = `bold ${fontSize}px Nunito, sans-serif`;

      // Cắt gọn tên nếu quá dài
      const displayName = `${st.avatar} ${st.fullName.split(' ').slice(-2).join(' ')}`;
      ctx.fillText(displayName, radius - 25, 0);

      ctx.restore();
    }

    // Viền tròn ngoài cùng nổi bật
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Vòng bi hạt sáng trang trí xung quanh
    const numPins = Math.max(students.length, 12);
    for (let p = 0; p < numPins; p++) {
      const pinAngle = angle + (p * 2 * Math.PI) / numPins;
      const pinX = centerX + (radius + 2) * Math.cos(pinAngle);
      const pinY = centerY + (radius + 2) * Math.sin(pinAngle);

      ctx.beginPath();
      ctx.arc(pinX, pinY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFE600';
      ctx.fill();
      ctx.strokeStyle = '#D4A373';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Tâm tròn ở giữa vòng quay
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF7849';
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', centerX, centerY);
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [students]);

  // Logic bắt đầu quay
  const spin = () => {
    if (isSpinning || disabled || students.length === 0) return;

    setIsSpinning(true);

    const spinRounds = 5 + Math.random() * 4; // Từ 5 đến 9 vòng
    const extraAngle = Math.random() * 2 * Math.PI;
    const totalSpinAngle = spinRounds * 2 * Math.PI + extraAngle;
    const startRotation = rotationRef.current;
    const targetRotation = startRotation + totalSpinAngle;

    const duration = 5000; // 5 giây
    const startTime = performance.now();
    let lastTickAngle = startRotation;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Hàm gia tốc giảm dần (easeOutCubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startRotation + totalSpinAngle * easeOut;

      rotationRef.current = currentAngle;
      drawWheel(currentAngle);

      // Hiệu ứng âm thanh tạch tạch khi qua từng học sinh
      const sliceAngle = (2 * Math.PI) / students.length;
      if (Math.abs(currentAngle - lastTickAngle) >= sliceAngle) {
        sound.playTick();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Xác định học sinh trúng giải (kim chỉ ở góc 270 độ / 3 * PI / 2 hoặc góc 0)
        // Kim chỉ cố định ở góc trên đỉnh: 3 * Math.PI / 2
        const pointerAngle = (3 * Math.PI) / 2;
        const normalizedAngle = (pointerAngle - (currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(normalizedAngle / sliceAngle) % students.length;
        const winner = students[winningIndex];

        if (winner) {
          onSelectStudent(winner);
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Kim chỉ vòng quay cố định phía trên */}
      <div className="absolute top-2 z-20 flex flex-col items-center pointer-events-none drop-shadow-lg">
        <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[34px] border-t-rose-600"></div>
        <div className="w-4 h-4 rounded-full bg-amber-300 -mt-7 border-2 border-white shadow-sm"></div>
      </div>

      {/* Vòng quay Canvas */}
      <div className="relative p-3 bg-gradient-to-b from-amber-200/50 to-orange-200/40 rounded-full border-4 border-amber-300/80 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={460}
          height={460}
          className="max-w-[340px] max-h-[340px] sm:max-w-[430px] sm:max-h-[430px] rounded-full cursor-pointer"
          onClick={spin}
        />
      </div>

      {/* Nút bấm quay to lớn */}
      <button
        onClick={spin}
        disabled={isSpinning || disabled || students.length === 0}
        className={`mt-6 px-8 py-3.5 sm:px-10 sm:py-4 rounded-3xl font-black text-lg sm:text-xl shadow-xl transition-all btn-bounce flex items-center space-x-3 ${
          isSpinning
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : students.length === 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-orange-300/80 hover:scale-105 active:scale-95'
        }`}
      >
        <span className="text-2xl animate-spin-slow">🎡</span>
        <span>{isSpinning ? 'Đang quay vui nhộn...' : 'QUAY NGAY!'}</span>
      </button>
    </div>
  );
};
