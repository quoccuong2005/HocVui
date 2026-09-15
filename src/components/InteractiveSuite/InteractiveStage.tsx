'use client';

import React, { useState } from 'react';
import { Classroom, Student, Question, PickerMode, SubjectId, Difficulty, Topic } from '@/types';
import { LuckyWheel } from './LuckyWheel';
import { MysteryBox } from './MysteryBox';
import { CardPicker } from './CardPicker';
import { PresentationQuizModal } from './PresentationQuizModal';
import { 
  Sparkles, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  Volume2, 
  Star, 
  Flame, 
  Award,
  ChevronRight,
  Filter,
  Users,
  Plus,
  Check
} from 'lucide-react';
import { sound } from '@/lib/soundEffects';
import { fireStarsConfetti, fireSuperWinnerConfetti } from '@/lib/confetti';
import { SUBJECTS } from '@/lib/constants';

interface InteractiveStageProps {
  classrooms: Classroom[];
  activeClassId: string;
  onSelectClass: (id: string) => void;
  onAddClass?: (newClass: Classroom) => void;
  currentClass: Classroom;
  questions: Question[];
  topics: Topic[];
  calledStudentIds: string[];
  onUpdateCalledStudentIds: (ids: string[]) => void;
  onAwardStars: (studentId: string, count: number) => void;
}

export const InteractiveStage: React.FC<InteractiveStageProps> = ({
  classrooms,
  activeClassId,
  onSelectClass,
  onAddClass,
  currentClass,
  questions,
  topics,
  calledStudentIds,
  onUpdateCalledStudentIds,
  onAwardStars,
}) => {
  const [pickerMode, setPickerMode] = useState<PickerMode>('wheel');
  const [isNoRepeat, setIsNoRepeat] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Quick Add Class modal
  const [isQuickAddClassOpen, setIsQuickAddClassOpen] = useState(false);
  const [quickClassName, setQuickClassName] = useState('');
  const [quickClassGrade, setQuickClassGrade] = useState(3);

  // Question selection for presentation
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<Difficulty | 'all'>('all');

  // Khi đổi môn học → reset chủ đề
  const handleSubjectChange = (subjectId: SubjectId | 'all') => {
    setSelectedSubjectFilter(subjectId);
    setSelectedTopicFilter('all');
  };

  // Lọc học sinh có thể gọi (loại trừ các bạn đã gọi nếu bật NoRepeat)
  const availableStudents = currentClass?.students.filter((s) => {
    if (isNoRepeat && calledStudentIds.includes(s.id)) {
      return false;
    }
    return true;
  }) || [];

  // Khi chọn được học sinh may mắn
  const handleStudentChosen = (student: Student) => {
    setSelectedStudent(student);
    sound.playFanfare();
    fireStarsConfetti();

    // Tự động phát âm thanh đọc tên
    setTimeout(() => {
      sound.speakText(`Xin chúc mừng bạn ${student.fullName}!`);
    }, 600);

    // Ghi nhớ đã gọi
    if (isNoRepeat && !calledStudentIds.includes(student.id)) {
      onUpdateCalledStudentIds([...calledStudentIds, student.id]);
    }
  };

  // Làm mới danh sách đã gọi
  const handleResetCalled = () => {
    onUpdateCalledStudentIds([]);
    setSelectedStudent(null);
    sound.playEncourage();
  };

  // Bốc câu hỏi cho học sinh (Có phân biệt cấp độ Mức 1, Mức 2, Mức 3)
  const handlePickQuestion = () => {
    let pool = questions.filter((q) => q.grade === currentClass?.grade);
    
    // Lọc theo môn học nếu có
    if (selectedSubjectFilter !== 'all') {
      pool = pool.filter((q) => q.subjectId === selectedSubjectFilter);
    }

    // Lọc theo chủ đề nếu có
    if (selectedTopicFilter !== 'all') {
      const topicFiltered = pool.filter((q) => q.topic.trim() === selectedTopicFilter);
      if (topicFiltered.length > 0) pool = topicFiltered;
    }

    // Lọc theo CẤP ĐỘ nếu giáo viên chỉ định (Mức 1, Mức 2, Mức 3)
    if (selectedDifficultyFilter !== 'all') {
      const difficultyPool = pool.filter((q) => q.difficulty === selectedDifficultyFilter);
      if (difficultyPool.length > 0) {
        pool = difficultyPool;
      }
    }

    // Nếu không có câu hỏi trùng khối lớp, lấy toàn bộ ngân hàng
    if (pool.length === 0) {
      pool = questions;
    }

    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    setActiveQuestion(randomQ);
    setIsQuizModalOpen(true);
    sound.playTick();
  };

  const handleNextQuestion = () => {
    handlePickQuestion();
  };

  // Tạo nhanh lớp mới từ màn hình Lên Lớp
  const handleCreateQuickClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClassName.trim()) return;

    const newClass: Classroom = {
      id: `class-${Date.now()}`,
      name: quickClassName.trim(),
      grade: quickClassGrade,
      schoolYear: '2024 - 2025',
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (onAddClass) {
      onAddClass(newClass);
    }
    onSelectClass(newClass.id);
    setIsQuickAddClassOpen(false);
    setQuickClassName('');
    sound.playCorrect();
    fireStarsConfetti();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ============================================================ */}
      {/* BƯỚC 1: LIST CHỌN LỚP HỌC TRƯỚC KHI QUAY SỐ (YÊU CẦU CỦA USER) */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-base shadow-sm">
              🏫
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Chọn Lớp Học Đang Vào Tiết:
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Thầy cô bấm vào lớp bên dưới để vòng quay và câu hỏi tự động đồng bộ theo lớp đó
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQuickAddClassOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all btn-bounce"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo thêm lớp mới</span>
          </button>
        </div>

        {/* List các lớp học để bấm chọn tùy ý */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {classrooms.map((cls) => {
            const isSelected = cls.id === activeClassId;
            return (
              <button
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls.id);
                  setSelectedStudent(null);
                  sound.playTick();
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-200 flex items-center space-x-2 btn-bounce border-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-orange-400 shadow-md shadow-orange-300/60 scale-105 ring-2 ring-orange-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                <span>{cls.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cls.students.length} em
                </span>
                {isSelected && <Check className="w-4 h-4 text-white ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* BƯỚC 2: THANH ĐIỀU KHIỂN & CHẾ ĐỘ QUAY (VÒNG QUAY / HỘP QUÀ / THẺ BÀI) */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Mode Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setPickerMode('wheel')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black transition-all btn-bounce ${
              pickerMode === 'wheel'
                ? 'bg-amber-400 text-amber-950 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-lg">🎡</span>
            <span>Vòng quay may mắn</span>
          </button>

          <button
            onClick={() => setPickerMode('gift')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black transition-all btn-bounce ${
              pickerMode === 'gift'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-lg">🎁</span>
            <span>Hộp quà bí mật</span>
          </button>

          <button
            onClick={() => setPickerMode('cards')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-black transition-all btn-bounce ${
              pickerMode === 'cards'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-lg">🎴</span>
            <span>Lá bài ma thuật</span>
          </button>
        </div>

        {/* Right: Anti-repeat & Call counter */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsNoRepeat(!isNoRepeat)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black border transition-all ${
              isNoRepeat
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {isNoRepeat ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
            <span>Không gọi trùng</span>
          </button>

          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-amber-900">
            <span>Đã gọi:</span>
            <span className="text-amber-600 font-black">
              {calledStudentIds.length} / {currentClass?.students.length || 0} em
            </span>
          </div>

          <button
            onClick={handleResetCalled}
            title="Làm mới lượt gọi trong buổi học"
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive Picker Area */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[500px]">
          {!currentClass || currentClass.students.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl">🎒</div>
              <h3 className="text-lg font-black text-slate-700">Lớp {currentClass?.name || ''} chưa có học sinh!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Thầy cô vui lòng chuyển sang mục <strong>"Lớp & Học sinh"</strong> để nhập danh sách hoặc chọn lớp khác ở phía trên.
              </p>
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="text-6xl animate-bounce">🎉</div>
              <h3 className="text-2xl font-black text-emerald-600">Tuyệt vời! Cả lớp {currentClass.name} đã được gọi đủ một lượt!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Tất cả {currentClass.students.length} bạn đều đã được tham gia trả lời. Thầy cô có thể làm mới lượt gọi để bắt đầu vòng tiếp theo!
              </p>
              <button
                onClick={handleResetCalled}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg transition-all btn-bounce text-sm"
              >
                Làm mới lượt gọi cả lớp 🔄
              </button>
            </div>
          ) : (
            <>
              {pickerMode === 'wheel' && (
                <LuckyWheel
                  students={availableStudents}
                  onSelectStudent={handleStudentChosen}
                />
              )}
              {pickerMode === 'gift' && (
                <MysteryBox
                  students={availableStudents}
                  onSelectStudent={handleStudentChosen}
                />
              )}
              {pickerMode === 'cards' && (
                <CardPicker
                  students={availableStudents}
                  onSelectStudent={handleStudentChosen}
                />
              )}
            </>
          )}
        </div>

        {/* Right Panel: Selected Student Spotlight & Quick Game Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* Spotlight Winner Box */}
          <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl p-6 text-white shadow-xl shadow-orange-200/50 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl" />

            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-wider uppercase mb-3">
              {selectedStudent ? '🌟 Bạn Học Sinh May Mắn' : '🎯 Đang Chờ Quay Số'}
            </span>

            {selectedStudent ? (
              <div className="space-y-3 w-full animate-pop">
                <div className="text-7xl drop-shadow-md my-1 animate-bounce">
                  {selectedStudent.avatar}
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm truncate">
                    {selectedStudent.fullName}
                  </h3>
                  <p className="text-xs text-amber-100 font-bold mt-0.5">
                    STT #{selectedStudent.stt} • {selectedStudent.note || 'Lớp ' + currentClass?.name}
                  </p>
                </div>

                {/* Stars Display */}
                <div className="inline-flex items-center space-x-1.5 bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
                  <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                  <span className="text-lg font-black text-white">{selectedStudent.stars} Sao</span>
                </div>

                {/* Speech Button */}
                <div className="pt-1">
                  <button
                    onClick={() => sound.speakText(`Xin mời bạn ${selectedStudent.fullName}`)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/25 hover:bg-white/40 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Đọc tên loa</span>
                  </button>
                </div>

                {/* Quick Score Awards */}
                <div className="pt-3 border-t border-white/20 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onAwardStars(selectedStudent.id, 1);
                      setSelectedStudent({ ...selectedStudent, stars: selectedStudent.stars + 1 });
                      sound.playCorrect();
                      fireStarsConfetti();
                    }}
                    className="py-2 bg-white text-orange-600 hover:bg-amber-50 font-black text-xs rounded-xl shadow transition-all btn-bounce"
                  >
                    +1 ⭐
                  </button>

                  <button
                    onClick={() => {
                      onAwardStars(selectedStudent.id, 2);
                      setSelectedStudent({ ...selectedStudent, stars: selectedStudent.stars + 2 });
                      sound.playFanfare();
                      fireSuperWinnerConfetti();
                    }}
                    className="py-2 bg-amber-200 text-amber-950 hover:bg-amber-300 font-black text-xs rounded-xl shadow transition-all btn-bounce"
                  >
                    +2 🌟
                  </button>

                  <button
                    onClick={() => {
                      sound.playEncourage();
                    }}
                    className="py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all"
                  >
                    👏 Cố lên
                  </button>
                </div>

                {/* Launch Quiz Button */}
                <button
                  onClick={handlePickQuestion}
                  className="w-full mt-3 py-3.5 bg-white text-rose-600 hover:bg-slate-50 font-black rounded-2xl shadow-lg transition-all btn-bounce flex items-center justify-center space-x-2 text-base"
                >
                  <span>🎯 BỐC CÂU HỎI CHO EM</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <div className="text-5xl opacity-80">🎲</div>
                <p className="text-sm font-bold text-amber-100 max-w-xs">
                  Bấm nút quay số hoặc mở hộp quà để tìm bạn học sinh lên bảng!
                </p>
              </div>
            )}
          </div>

          {/* Quick Subject & Difficulty Filter for Questions */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm space-y-4">
            {/* Chọn Môn Học */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> 1. Môn học:
                </span>
                <span className="text-xs font-bold text-blue-600">
                  {questions.length} câu sẵn sàng
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSubjectChange('all')}
                  className={`p-2 rounded-xl text-xs font-black text-left border transition-all ${
                    selectedSubjectFilter === 'all'
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🌈 Tất cả môn
                </button>

                {SUBJECTS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubjectChange(sub.id)}
                    className={`p-2 rounded-xl text-xs font-black text-left border transition-all truncate ${
                      selectedSubjectFilter === sub.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn Chủ Đề — chỉ hiện khi đã chọn môn cụ thể */}
            {selectedSubjectFilter !== 'all' && (() => {
              // Lọc chủ đề theo môn học VÀ khối lớp hiện tại
              const subjectTopics = topics.filter(
                (t) => t.subjectId === selectedSubjectFilter && t.grade === currentClass.grade
              );
              // Nếu không có topic theo khối, thử lấy từ câu hỏi trực tiếp (fallback)
              const topicNamesFromQuestions = [
                ...new Set(
                  questions
                    .filter((q) => q.subjectId === selectedSubjectFilter && q.grade === currentClass.grade)
                    .map((q) => q.topic.trim())
                ),
              ];
              // Dùng topicNamesFromQuestions làm nguồn chính xác nhất
              if (topicNamesFromQuestions.length === 0) return null;
              return (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 2. Chủ đề:
                    </span>
                    {selectedTopicFilter !== 'all' && (
                      <button
                        onClick={() => setSelectedTopicFilter('all')}
                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        ✕ Bỏ chọn
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-0.5 scrollbar-thin">
                    <button
                      onClick={() => setSelectedTopicFilter('all')}
                      className={`w-full px-3 py-1.5 rounded-xl text-xs font-black text-left border transition-all ${
                        selectedTopicFilter === 'all'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      📚 Tất cả chủ đề
                    </button>
                    {topicNamesFromQuestions.map((topicName) => {
                      // Đếm câu hỏi theo đúng môn + khối + chủ đề
                      const count = questions.filter(
                        (q) =>
                          q.subjectId === selectedSubjectFilter &&
                          q.grade === currentClass.grade &&
                          q.topic.trim() === topicName
                      ).length;
                      // Tên hiển thị: ưu tiên từ topics list, fallback là topicName
                      const displayName =
                        subjectTopics.find((t) => t.name.trim() === topicName)?.name ?? topicName;
                      return (
                        <button
                          key={topicName}
                          onClick={() => setSelectedTopicFilter(topicName)}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs font-black text-left border transition-all flex items-center justify-between gap-1 ${
                            selectedTopicFilter === topicName
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                        >
                          <span className="truncate">📖 {displayName}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            selectedTopicFilter === topicName
                              ? 'bg-white/25 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* PHÂN BIỆT CẤP ĐỘ (MỨC 1, MỨC 2, MỨC 3) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {selectedSubjectFilter !== 'all' ? '3.' : '2.'} Cấp độ câu hỏi:
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  Phân hóa học sinh
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedDifficultyFilter('all')}
                  className={`p-2 rounded-xl text-xs font-black text-left border transition-all ${
                    selectedDifficultyFilter === 'all'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🎲 Ngẫu nhiên
                </button>

                <button
                  onClick={() => setSelectedDifficultyFilter('easy')}
                  className={`p-2 rounded-xl text-xs font-black text-left border transition-all ${
                    selectedDifficultyFilter === 'easy'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-emerald-50/50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  🟢 Mức 1 (Dễ)
                </button>

                <button
                  onClick={() => setSelectedDifficultyFilter('medium')}
                  className={`p-2 rounded-xl text-xs font-black text-left border transition-all ${
                    selectedDifficultyFilter === 'medium'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-amber-50/50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  🟡 Mức 2 (Vừa)
                </button>

                <button
                  onClick={() => setSelectedDifficultyFilter('hard')}
                  className={`p-2 rounded-xl text-xs font-black text-left border transition-all ${
                    selectedDifficultyFilter === 'hard'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-rose-50/50 text-rose-800 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  🔴 Mức 3 (Khó)
                </button>
              </div>
            </div>

            <button
              onClick={handlePickQuestion}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-xl text-xs border border-blue-200 transition-colors flex items-center justify-center space-x-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Xem trước câu hỏi theo tiêu chí này</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Tạo Nhanh Lớp Học Mới Ngay Tại Trang Lên Lớp */}
      {isQuickAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-slate-100 space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🏫</span> Tạo Lớp Học Mới Để Vào Tiết
            </h3>
            <form onSubmit={handleCreateQuickClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 3C, Lớp 4B..."
                  value={quickClassName}
                  onChange={(e) => setQuickClassName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Khối lớp:</label>
                <select
                  value={quickClassGrade}
                  onChange={(e) => setQuickClassGrade(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>Khối 1 (Lớp 1)</option>
                  <option value={2}>Khối 2 (Lớp 2)</option>
                  <option value={3}>Khối 3 (Lớp 3)</option>
                  <option value={4}>Khối 4 (Lớp 4)</option>
                  <option value={5}>Khối 5 (Lớp 5)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickAddClassOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl text-sm shadow-md"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Presentation Modal */}
      {isQuizModalOpen && activeQuestion && (
        <PresentationQuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          question={activeQuestion}
          student={selectedStudent}
          onAwardStars={onAwardStars}
          onNextQuestion={handleNextQuestion}
        />
      )}
    </div>
  );
};
