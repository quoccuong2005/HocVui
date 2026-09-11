'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, Student } from '@/types';
import { SUBJECTS, DIFFICULTY_LABELS } from '@/lib/constants';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  Star, 
  ArrowRight,
  Volume2
} from 'lucide-react';
import { sound } from '@/lib/soundEffects';
import { fireStarsConfetti, fireSuperWinnerConfetti } from '@/lib/confetti';

interface PresentationQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  student: Student | null;
  onAwardStars: (studentId: string, count: number) => void;
  onNextQuestion?: () => void;
}

export const PresentationQuizModal: React.FC<PresentationQuizModalProps> = ({
  isOpen,
  onClose,
  question,
  student,
  onAwardStars,
  onNextQuestion,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const subject = SUBJECTS.find((s) => s.id === question.subjectId);
  const diff = DIFFICULTY_LABELS[question.difficulty];

  // Reset state when question changes
  useEffect(() => {
    setIsAnswerRevealed(false);
    setSelectedOption(null);
    setTimeLeft(timerDuration);
    setIsTimerRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, [question, timerDuration]);

  // Timer loop
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            sound.playTimeUp();
            return 0;
          }
          // Âm thanh đếm ngược
          if (prev <= 4) {
            sound.playCountdownTick(true);
          } else {
            sound.playCountdownTick(false);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleStartTimer = () => {
    if (timeLeft === 0) setTimeLeft(timerDuration);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(timerDuration);
  };

  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
    sound.playFanfare();
  };

  const handleAward = (count: number) => {
    if (!student) return;
    onAwardStars(student.id, count);
    if (count > 1) {
      fireSuperWinnerConfetti();
      sound.playFanfare();
    } else if (count === 1) {
      fireStarsConfetti();
      sound.playCorrect();
    } else {
      sound.playEncourage();
    }
  };

  const timerProgress = (timeLeft / timerDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        {/* Left: Subject & Grade tags */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className={`px-4 py-1.5 rounded-2xl text-sm sm:text-base font-black ${subject?.badgeBg}`}>
            {subject?.name}
          </span>
          <span className="px-3.5 py-1.5 rounded-2xl text-sm sm:text-base font-black bg-slate-800 text-slate-200 border border-slate-700">
            Lớp {question.grade}
          </span>
          <span className={`px-3 py-1 rounded-2xl text-xs sm:text-sm font-black border ${diff.bg} ${diff.color}`}>
            {diff.dot} {diff.label}
          </span>
        </div>

        {/* Center: Spotlight on Student */}
        {student && (
          <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-400/60 px-4 py-1.5 rounded-2xl">
            <span className="text-3xl">{student.avatar}</span>
            <div>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">Người trả lời:</span>
              <span className="text-base sm:text-lg font-black text-white">{student.fullName}</span>
            </div>
            <button
              onClick={() => sound.speakText(`Xin mời bạn ${student.fullName}`)}
              title="Đọc tên học sinh"
              className="p-1.5 text-amber-300 hover:text-white bg-amber-500/30 rounded-xl"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Fullscreen & Close buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toàn màn hình máy chiếu"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
            title="Đóng trình chiếu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Stage: Timer & Question Prompt */}
      <div className="max-w-5xl mx-auto w-full my-auto py-6 space-y-8">
        {/* Timer Bar & Controls */}
        <div className="bg-slate-900/80 border-2 border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Thời gian:</span>
            {[10, 15, 30, 45, 60].map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  setTimerDuration(sec);
                  setTimeLeft(sec);
                  setIsTimerRunning(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  timerDuration === sec
                    ? 'bg-amber-400 text-amber-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Big Digital Countdown */}
          <div className="flex items-center space-x-4">
            <div
              className={`text-4xl sm:text-5xl font-black px-6 py-1 rounded-2xl border-2 transition-all ${
                timeLeft <= 5 && timeLeft > 0
                  ? 'bg-rose-500/30 border-rose-500 text-rose-400 animate-pulse'
                  : timeLeft === 0
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-slate-800 border-amber-400/50 text-amber-300'
              }`}
            >
              {timeLeft}s
            </div>

            {/* Timer action buttons */}
            <div className="flex items-center space-x-1.5">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg transition-all btn-bounce"
                  title="Bắt đầu đếm ngược"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl shadow-lg transition-all btn-bounce"
                  title="Tạm dừng"
                >
                  <Pause className="w-5 h-5 fill-current" />
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
                title="Đặt lại đồng hồ"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Prompt (Huge font for Projector) */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-900/60 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
            Chủ đề: {question.topic} {question.lesson ? `• ${question.lesson}` : ''}
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {question.prompt}
          </h2>
        </div>

        {/* 4 Big Options */}
        {question.options && question.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isCorrect =
                String(question.correctAnswer).trim() === opt.trim() ||
                String(question.correctAnswer).trim() === letter;
              const isSelected = selectedOption === opt;

              let cardStyle = 'bg-slate-800/90 border-slate-700 text-slate-100 hover:border-slate-500';
              let letterBg = 'bg-slate-700 text-slate-300';

              if (isAnswerRevealed) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-400/50 scale-[1.02] shadow-2xl shadow-emerald-500/50';
                  letterBg = 'bg-white text-emerald-700';
                } else if (isSelected) {
                  cardStyle = 'bg-rose-900/50 border-rose-500 text-rose-200 opacity-60';
                  letterBg = 'bg-rose-700 text-white';
                } else {
                  cardStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-40';
                  letterBg = 'bg-slate-800 text-slate-600';
                }
              } else if (isSelected) {
                cardStyle = 'bg-amber-500 border-amber-300 text-amber-950 font-black ring-4 ring-amber-400/50';
                letterBg = 'bg-amber-950 text-amber-300';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-5 sm:p-6 rounded-3xl border-3 text-left transition-all duration-200 flex items-center space-x-4 btn-bounce ${cardStyle}`}
                >
                  <span
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 shadow-md ${letterBg}`}
                  >
                    {letter}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold leading-snug flex-1">
                    {opt}
                  </span>
                  {isAnswerRevealed && isCorrect && (
                    <CheckCircle2 className="w-8 h-8 text-white shrink-0 animate-bounce" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Explanation Card (Revealed) */}
        {isAnswerRevealed && question.explanation && (
          <div className="bg-amber-400/20 border-2 border-amber-400 rounded-3xl p-5 text-amber-200 flex items-start space-x-3 text-base sm:text-lg animate-pop">
            <Lightbulb className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 text-lg sm:text-xl block mb-1">Lời giải thích:</strong>
              {question.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Reveal Answer & 1-Click Star Rewards */}
      <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Reveal Button */}
        <div>
          {!isAnswerRevealed ? (
            <button
              onClick={handleRevealAnswer}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all btn-bounce flex items-center space-x-2 text-base sm:text-lg"
            >
              <Eye className="w-5 h-5" />
              <span>Hiện Đáp Án Chính Xác</span>
            </button>
          ) : (
            <span className="text-emerald-400 font-black text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Đã công bố kết quả!
            </span>
          )}
        </div>

        {/* Center: Star Rewards */}
        {student && (
          <div className="flex items-center space-x-2 sm:space-x-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-black text-slate-400 uppercase hidden sm:inline px-2">
              Chấm điểm:
            </span>

            <button
              onClick={() => handleAward(1)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-xl text-sm sm:text-base transition-all btn-bounce flex items-center space-x-1.5 shadow-lg shadow-amber-400/20"
            >
              <Star className="w-5 h-5 fill-current" />
              <span>Đúng rồi (+1 ⭐)</span>
            </button>

            <button
              onClick={() => handleAward(2)}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-black rounded-xl text-sm sm:text-base transition-all btn-bounce flex items-center space-x-1.5 shadow-lg shadow-orange-500/30"
            >
              <Sparkles className="w-5 h-5" />
              <span>Xuất sắc (+2 🌟)</span>
            </button>

            <button
              onClick={() => handleAward(0)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all"
            >
              👏 Cố lên
            </button>
          </div>
        )}

        {/* Right: Next Question */}
        <div>
          {onNextQuestion && (
            <button
              onClick={onNextQuestion}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold rounded-2xl transition-all flex items-center space-x-2 text-sm sm:text-base border border-slate-700"
            >
              <span>Đổi câu hỏi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
