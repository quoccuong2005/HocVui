'use client';

import React, { useState, useEffect } from 'react';
import { Classroom, Question } from '@/types';
import { StorageService } from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { InteractiveStage } from '@/components/InteractiveSuite/InteractiveStage';
import { ClassroomManager } from '@/components/ClassroomManager';
import { QuestionBankManager } from '@/components/QuestionBankManager';
import { HallOfFame } from '@/components/HallOfFame';
import { DataBackupModal } from '@/components/DataBackupModal';
import { Sparkles, Heart } from 'lucide-react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'stage' | 'classrooms' | 'questions' | 'hof'>('stage');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [activeClassId, setActiveClassId] = useState<string>('class-3a');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [calledStudentIds, setCalledStudentIds] = useState<string[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Khởi tạo dữ liệu từ StorageService khi client mount
  useEffect(() => {
    setIsClient(true);
    const loadedClassrooms = StorageService.getClassrooms();
    const loadedActiveId = StorageService.getActiveClassId();
    const loadedQuestions = StorageService.getQuestions();
    
    // Đảm bảo activeClassId hợp lệ
    const validId = loadedClassrooms.some((c) => c.id === loadedActiveId)
      ? loadedActiveId
      : loadedClassrooms[0]?.id || 'class-3a';

    const loadedCalled = StorageService.getCalledStudentIds(validId);

    setClassrooms(loadedClassrooms);
    setActiveClassId(validId);
    setQuestions(loadedQuestions);
    setCalledStudentIds(loadedCalled);
  }, []);

  // Đổi lớp học đang chọn
  const handleSelectClass = (classId: string) => {
    setActiveClassId(classId);
    StorageService.setActiveClassId(classId);
    const called = StorageService.getCalledStudentIds(classId);
    setCalledStudentIds(called);
  };

  // Cập nhật danh sách lớp
  const handleUpdateClassrooms = (updated: Classroom[]) => {
    setClassrooms(updated);
    StorageService.saveClassrooms(updated);
  };

  // Cập nhật ngân hàng câu hỏi
  const handleUpdateQuestions = (updated: Question[]) => {
    setQuestions(updated);
    StorageService.saveQuestions(updated);
  };

  // Cập nhật danh sách học sinh đã gọi
  const handleUpdateCalledStudentIds = (ids: string[]) => {
    setCalledStudentIds(ids);
    StorageService.saveCalledStudentIds(activeClassId, ids);
  };

  // Thưởng sao cho học sinh
  const handleAwardStars = (studentId: string, count: number) => {
    const updated = classrooms.map((cls) => {
      if (cls.id !== activeClassId) return cls;
      const updatedStudents = cls.students.map((st) => {
        if (st.id === studentId) {
          return { ...st, stars: Math.max(0, st.stars + count) };
        }
        return st;
      });
      return { ...cls, students: updatedStudents, updatedAt: new Date().toISOString() };
    });

    handleUpdateClassrooms(updated);
  };

  // Nạp lại dữ liệu sau khi khôi phục sao lưu
  const handleDataReloaded = () => {
    const loadedClassrooms = StorageService.getClassrooms();
    const loadedActiveId = StorageService.getActiveClassId();
    const loadedQuestions = StorageService.getQuestions();
    const loadedCalled = StorageService.getCalledStudentIds(loadedActiveId);

    setClassrooms(loadedClassrooms);
    setActiveClassId(loadedActiveId);
    setQuestions(loadedQuestions);
    setCalledStudentIds(loadedCalled);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl animate-spin-slow flex items-center justify-center text-2xl shadow-lg">
            🎡
          </div>
          <p className="text-slate-600 font-extrabold text-sm">Đang tải HọcVui...</p>
        </div>
      </div>
    );
  }

  const currentClass = classrooms.find((c) => c.id === activeClassId) || classrooms[0];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Header Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          classrooms={classrooms}
          activeClassId={activeClassId}
          onSelectClass={handleSelectClass}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Tab Content */}
        <main className="transition-all duration-300">
          {activeTab === 'stage' && currentClass && (
            <InteractiveStage
              classrooms={classrooms}
              activeClassId={activeClassId}
              onSelectClass={handleSelectClass}
              onAddClass={(newClass) => {
                const updated = [...classrooms, newClass];
                handleUpdateClassrooms(updated);
              }}
              currentClass={currentClass}
              questions={questions}
              calledStudentIds={calledStudentIds}
              onUpdateCalledStudentIds={handleUpdateCalledStudentIds}
              onAwardStars={handleAwardStars}
            />
          )}

          {activeTab === 'classrooms' && (
            <ClassroomManager
              classrooms={classrooms}
              activeClassId={activeClassId}
              onUpdateClassrooms={handleUpdateClassrooms}
              onSelectClass={handleSelectClass}
            />
          )}

          {activeTab === 'questions' && (
            <QuestionBankManager
              questions={questions}
              onUpdateQuestions={handleUpdateQuestions}
            />
          )}

          {activeTab === 'hof' && currentClass && (
            <HallOfFame
              classrooms={classrooms}
              activeClassId={activeClassId}
              onSelectClass={handleSelectClass}
              currentClass={currentClass}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-amber-100 bg-white/60 text-center text-xs font-semibold text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-black text-amber-600">HọcVui</span>
            <span>— Trợ lý tương tác & Gamification cho Giáo viên Tiểu học</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Thiết kế dành tặng các thầy cô và học sinh</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </footer>

      {/* Settings & Backup Modal */}
      <DataBackupModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataReloaded={handleDataReloaded}
      />
    </div>
  );
}
