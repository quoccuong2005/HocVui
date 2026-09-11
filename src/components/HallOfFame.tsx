'use client';

import React from 'react';
import { Classroom, Student } from '@/types';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Download, 
  Sparkles, 
  Users,
  Check
} from 'lucide-react';
import { exportClassroomReport } from '@/lib/excelHelper';
import { fireSuperWinnerConfetti } from '@/lib/confetti';
import { sound } from '@/lib/soundEffects';

interface HallOfFameProps {
  classrooms: Classroom[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  currentClass: Classroom;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({
  classrooms,
  activeClassId,
  onSelectClass,
  currentClass,
}) => {
  const sortedStudents = [...(currentClass?.students || [])].sort(
    (a, b) => b.stars - a.stars || a.stt - b.stt
  );
  const totalStars = (currentClass?.students || []).reduce((sum, s) => sum + s.stars, 0);
  const avgStars =
    currentClass?.students && currentClass.students.length > 0
      ? (totalStars / currentClass.students.length).toFixed(1)
      : '0';

  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  const handleCelebrate = () => {
    fireSuperWinnerConfetti();
    sound.playFanfare();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* THANH CHỌN LỚP ĐỂ XEM VINH DANH (TÙY Ý CHỌN TỪNG LỚP) */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-3xl p-5 border-2 border-purple-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-purple-500 text-white font-black flex items-center justify-center text-base shadow-sm">
              🏆
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Chọn Lớp Để Xem Bảng Vinh Danh:
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Bấm chọn bất kỳ lớp nào để xem bảng xếp hạng sao thưởng và bục quán quân của lớp đó
              </p>
            </div>
          </div>
        </div>

        {/* List các lớp học */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {classrooms.map((cls) => {
            const isSelected = cls.id === activeClassId;
            const clsStars = cls.students.reduce((sum, s) => sum + s.stars, 0);

            return (
              <button
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls.id);
                  sound.playTick();
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-200 flex items-center space-x-2 btn-bounce border-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-500 shadow-md shadow-purple-300/60 scale-105 ring-2 ring-purple-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
              >
                <span>{cls.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ⭐ {clsStars} sao
                </span>
                {isSelected && <Check className="w-4 h-4 text-white ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header Banner Của Lớp Đang Chọn */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Bảng Vinh Danh: {currentClass?.name}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Tuyên Dương Ngôi Sao Nhí {currentClass?.name}
          </h1>
          <p className="text-purple-100 font-medium text-sm sm:text-base">
            Tổng kết số sao tích lũy và tinh thần học tập hăng hái của các em học sinh lớp {currentClass?.name}!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleCelebrate}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black rounded-2xl shadow-lg transition-all btn-bounce flex items-center space-x-2 text-sm sm:text-base"
          >
            <Sparkles className="w-5 h-5 text-amber-950" />
            <span>Pháo Hoa Vinh Danh 🎉</span>
          </button>

          <button
            onClick={() => exportClassroomReport(currentClass.name, currentClass.students)}
            className="px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold rounded-2xl border border-white/40 transition-all text-sm sm:text-base flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Xuất Báo Cáo Excel</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 Của Lớp Hiện Tại */}
      {sortedStudents.length >= 3 && totalStars > 0 ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm">
          <h2 className="text-center font-black text-slate-800 text-xl sm:text-2xl mb-8 flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <span>Bộ Ba Ngôi Sao Sáng Nhất Lớp {currentClass.name}</span>
          </h2>

          <div className="flex items-end justify-center gap-2 sm:gap-6 max-w-2xl mx-auto pt-6 pb-2">
            {/* Top 2: Silver */}
            {top2 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-2">{top2.avatar}</div>
                <div className="font-black text-slate-800 text-xs sm:text-sm text-center truncate max-w-[120px]">
                  {top2.fullName}
                </div>
                <div className="text-amber-500 font-extrabold text-xs sm:text-sm flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" /> {top2.stars} sao
                </div>
                <div className="w-full bg-slate-200 rounded-t-2xl h-28 sm:h-36 flex flex-col items-center justify-center text-slate-600 font-black shadow-inner">
                  <Medal className="w-7 h-7 text-slate-400 mb-1" />
                  <span className="text-2xl sm:text-3xl">#2</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold">Hạng Nhì</span>
                </div>
              </div>
            )}

            {/* Top 1: Gold */}
            {top1 && (
              <div className="flex-1 flex flex-col items-center -mt-6">
                <Crown className="w-8 h-8 text-amber-400 animate-bounce mb-1" />
                <div className="text-5xl sm:text-6xl mb-2">{top1.avatar}</div>
                <div className="font-black text-slate-900 text-sm sm:text-base text-center truncate max-w-[140px]">
                  {top1.fullName}
                </div>
                <div className="text-amber-600 font-black text-sm sm:text-base flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 fill-current text-amber-500" /> {top1.stars} sao
                </div>
                <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 rounded-t-2xl h-36 sm:h-48 flex flex-col items-center justify-center text-amber-950 font-black shadow-lg">
                  <Trophy className="w-9 h-9 text-amber-600 mb-1" />
                  <span className="text-3xl sm:text-4xl">#1</span>
                  <span className="text-[11px] uppercase tracking-widest font-black">Quán Quân</span>
                </div>
              </div>
            )}

            {/* Top 3: Bronze */}
            {top3 && (
              <div className="flex-1 flex flex-col items-center">
                <div className="text-4xl sm:text-5xl mb-2">{top3.avatar}</div>
                <div className="font-black text-slate-800 text-xs sm:text-sm text-center truncate max-w-[120px]">
                  {top3.fullName}
                </div>
                <div className="text-amber-500 font-extrabold text-xs sm:text-sm flex items-center gap-1 mb-2">
                  <Star className="w-3.5 h-3.5 fill-current" /> {top3.stars} sao
                </div>
                <div className="w-full bg-amber-100 rounded-t-2xl h-24 sm:h-30 flex flex-col items-center justify-center text-amber-800 font-black shadow-inner">
                  <Medal className="w-6 h-6 text-amber-700 mb-1" />
                  <span className="text-2xl sm:text-3xl">#3</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold">Hạng Ba</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : totalStars === 0 && currentClass.students.length > 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 space-y-2">
          <div className="text-4xl">⭐</div>
          <h3 className="text-base font-black text-slate-700">Lớp {currentClass.name} chưa tích lũy sao trong tuần này!</h3>
          <p className="text-xs text-slate-500">
            Thầy cô hãy vào phần <strong>"Lên lớp"</strong> để quay số trả lời câu hỏi và cộng sao cho các em nhé!
          </p>
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            ⭐
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{totalStars}</div>
            <div className="text-xs font-bold text-slate-500">Tổng số sao của {currentClass?.name}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            👥
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{currentClass?.students.length || 0}</div>
            <div className="text-xs font-bold text-slate-500">Sĩ số học sinh lớp {currentClass?.name}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            📈
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{avgStars} sao</div>
            <div className="text-xs font-bold text-slate-500">Trung bình sao mỗi học sinh</div>
          </div>
        </div>
      </div>

      {/* Full Ranked Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <span>📋</span> Bảng Xếp Hạng Đầy Đủ - {currentClass?.name}
        </h3>

        {sortedStudents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-bold text-sm">
            Lớp {currentClass?.name} chưa có học sinh.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-black text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">Hạng</th>
                  <th className="px-4 py-3 w-16 text-center">STT</th>
                  <th className="px-4 py-3">Học sinh</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3 text-center">Số sao ⭐</th>
                  <th className="px-4 py-3 text-right">Danh hiệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {sortedStudents.map((st, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 text-center">
                        {rank === 1 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center mx-auto shadow-sm">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center mx-auto shadow-sm">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center mx-auto shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400">{rank}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center text-slate-400 font-bold">{st.stt}</td>
                      <td className="px-4 py-3.5 flex items-center space-x-2.5">
                        <span className="text-2xl">{st.avatar}</span>
                        <span className="font-black text-slate-800 text-sm sm:text-base">{st.fullName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{st.note || '—'}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200">
                          ⭐ {st.stars}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {st.stars >= 7 ? (
                          <span className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
                            🌟 Ngôi Sao Sáng
                          </span>
                        ) : st.stars >= 4 ? (
                          <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                            🚀 Tiến Bộ Vượt Bậc
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            🌱 Mầm Non Chăm Chỉ
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
