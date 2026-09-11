'use client';

import React from 'react';
import { Classroom } from '@/types';
import { 
  Sparkles, 
  Gamepad2, 
  Users, 
  BookOpenCheck, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Settings2,
  ChevronDown
} from 'lucide-react';
import { sound } from '@/lib/soundEffects';

interface NavbarProps {
  activeTab: 'stage' | 'classrooms' | 'questions' | 'hof';
  setActiveTab: (tab: 'stage' | 'classrooms' | 'questions' | 'hof') => void;
  classrooms: Classroom[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  classrooms,
  activeClassId,
  onSelectClass,
  onOpenSettings,
}) => {
  const [isMuted, setIsMuted] = React.useState(false);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playCorrect();
  };

  const currentClass = classrooms.find((c) => c.id === activeClassId);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-amber-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Slogan */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('stage')}>
            <div className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-md shadow-orange-200 transform hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                  HọcVui
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  Tiểu học
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold hidden sm:block">
                Lớp học tương tác & Gamification
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('stage')}
              className={`flex items-center space-x-1.5 px-3 md:px-4 py-2 rounded-xl text-sm md:text-base font-extrabold transition-all btn-bounce ${
                activeTab === 'stage'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-white/60'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Lên lớp</span>
            </button>

            <button
              onClick={() => setActiveTab('classrooms')}
              className={`flex items-center space-x-1.5 px-3 md:px-4 py-2 rounded-xl text-sm md:text-base font-extrabold transition-all btn-bounce ${
                activeTab === 'classrooms'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white/60'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Lớp & Học sinh</span>
              <span className="sm:hidden">Lớp</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center space-x-1.5 px-3 md:px-4 py-2 rounded-xl text-sm md:text-base font-extrabold transition-all btn-bounce ${
                activeTab === 'questions'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-white/60'
              }`}
            >
              <BookOpenCheck className="w-5 h-5" />
              <span className="hidden md:inline">Ngân hàng câu hỏi</span>
              <span className="md:hidden">Câu hỏi</span>
            </button>

            <button
              onClick={() => setActiveTab('hof')}
              className={`flex items-center space-x-1.5 px-3 md:px-4 py-2 rounded-xl text-sm md:text-base font-extrabold transition-all btn-bounce ${
                activeTab === 'hof'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md shadow-purple-200'
                  : 'text-slate-600 hover:text-purple-600 hover:bg-white/60'
              }`}
            >
              <Trophy className="w-5 h-5 text-amber-300" />
              <span className="hidden sm:inline">Vinh danh</span>
              <span className="sm:hidden">Top</span>
            </button>
          </nav>

          {/* Right Tools: Class dropdown, Sound, Settings */}
          <div className="flex items-center space-x-2">
            {/* Quick Class Selector */}
            {/* <div className="relative">
              <div className="flex items-center bg-amber-50 hover:bg-amber-100/80 border-2 border-amber-200 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-amber-900 cursor-pointer">
                <span className="mr-1">🏫</span>
                <select
                  value={activeClassId}
                  onChange={(e) => onSelectClass(e.target.value)}
                  className="bg-transparent font-black outline-none cursor-pointer pr-3"
                >
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students.length} em)
                    </option>
                  ))}
                </select>
              </div>
            </div> */}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              className={`p-2 rounded-xl border-2 transition-colors ${
                isMuted
                  ? 'bg-slate-100 border-slate-300 text-slate-400'
                  : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Backup & Settings */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt & Dữ liệu"
              className="p-2 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
