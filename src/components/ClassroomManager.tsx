'use client';

import React, { useState, useRef } from 'react';
import { Classroom, Student, Gender } from '@/types';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Search, 
  LayoutGrid, 
  List, 
  Star, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Users,
  Check
} from 'lucide-react';
import { downloadSampleExcel, parseExcelStudents, exportClassroomReport } from '@/lib/excelHelper';
import { CUTE_AVATARS } from '@/lib/constants';
import { sound } from '@/lib/soundEffects';
import { fireStarsConfetti } from '@/lib/confetti';

interface ClassroomManagerProps {
  classrooms: Classroom[];
  activeClassId: string;
  onUpdateClassrooms: (classrooms: Classroom[]) => void;
  onSelectClass: (id: string) => void;
}

export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  classrooms,
  activeClassId,
  onUpdateClassrooms,
  onSelectClass,
}) => {
  const currentClass = classrooms.find((c) => c.id === activeClassId) || classrooms[0];
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(3);
  
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Student form state
  const [stFullName, setStFullName] = useState('');
  const [stGender, setStGender] = useState<Gender>('male');
  const [stDob, setStDob] = useState('');
  const [stNote, setStNote] = useState('');
  const [stAvatar, setStAvatar] = useState(CUTE_AVATARS[0]);

  // Excel upload feedback
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = (currentClass?.students || []).filter((s) =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStars = (currentClass?.students || []).reduce((sum, s) => sum + s.stars, 0);

  // Tạo lớp mới
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: Classroom = {
      id: `class-${Date.now()}`,
      name: newClassName.trim(),
      grade: newClassGrade,
      schoolYear: '2024 - 2025',
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...classrooms, newClass];
    onUpdateClassrooms(updated);
    onSelectClass(newClass.id);
    setIsAddClassOpen(false);
    setNewClassName('');
    sound.playCorrect();
    fireStarsConfetti();
  };

  // Xóa lớp hiện tại
  const handleDeleteClass = (classId: string, className: string) => {
    if (classrooms.length <= 1) {
      alert('Cần giữ lại ít nhất một lớp học!');
      return;
    }
    if (confirm(`Thầy/Cô có chắc chắn muốn xóa "${className}" không?`)) {
      const remaining = classrooms.filter((c) => c.id !== classId);
      onUpdateClassrooms(remaining);
      if (activeClassId === classId) {
        onSelectClass(remaining[0].id);
      }
    }
  };

  // Nhập file Excel
  const handleFileUpload = async (file: File) => {
    try {
      setImportStatus('Đang xử lý file Excel...');
      const importedStudents = await parseExcelStudents(file);

      // Cập nhật vào lớp hiện tại
      const updatedClass: Classroom = {
        ...currentClass,
        students: importedStudents,
        updatedAt: new Date().toISOString(),
      };

      const updated = classrooms.map((c) => (c.id === currentClass.id ? updatedClass : c));
      onUpdateClassrooms(updated);
      setImportStatus(`Thành công! Đã nhập ${importedStudents.length} học sinh.`);
      sound.playFanfare();
      fireStarsConfetti();

      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi khi đọc file!';
      setImportStatus(`Lỗi: ${errorMsg}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Thêm hoặc Cập nhật học sinh
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stFullName.trim()) return;

    if (editingStudent) {
      // Cập nhật
      const updatedStudents = currentClass.students.map((s) =>
        s.id === editingStudent.id
          ? { ...s, fullName: stFullName.trim(), gender: stGender, dob: stDob, note: stNote, avatar: stAvatar }
          : s
      );
      const updatedClass = { ...currentClass, students: updatedStudents, updatedAt: new Date().toISOString() };
      onUpdateClassrooms(classrooms.map((c) => (c.id === currentClass.id ? updatedClass : c)));
    } else {
      // Thêm mới
      const newStt = currentClass.students.length > 0 ? Math.max(...currentClass.students.map((s) => s.stt)) + 1 : 1;
      const newStudent: Student = {
        id: `st-${Date.now()}`,
        stt: newStt,
        fullName: stFullName.trim(),
        gender: stGender,
        dob: stDob,
        note: stNote,
        stars: 0,
        avatar: stAvatar,
      };
      const updatedClass = { ...currentClass, students: [...currentClass.students, newStudent], updatedAt: new Date().toISOString() };
      onUpdateClassrooms(classrooms.map((c) => (c.id === currentClass.id ? updatedClass : c)));
    }

    sound.playCorrect();
    setIsAddStudentOpen(false);
    setEditingStudent(null);
    resetStudentForm();
  };

  const openEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStFullName(s.fullName);
    setStGender(s.gender || 'male');
    setStDob(s.dob || '');
    setStNote(s.note || '');
    setStAvatar(s.avatar);
    setIsAddStudentOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Xóa học sinh này khỏi danh sách?')) {
      const updatedStudents = currentClass.students.filter((s) => s.id !== studentId);
      const updatedClass = { ...currentClass, students: updatedStudents, updatedAt: new Date().toISOString() };
      onUpdateClassrooms(classrooms.map((c) => (c.id === currentClass.id ? updatedClass : c)));
    }
  };

  const handleResetClassStars = () => {
    if (confirm('Đặt lại tất cả số sao về 0 cho lớp này để bắt đầu tuần mới?')) {
      const updatedStudents = currentClass.students.map((s) => ({ ...s, stars: 0 }));
      const updatedClass = { ...currentClass, students: updatedStudents, updatedAt: new Date().toISOString() };
      onUpdateClassrooms(classrooms.map((c) => (c.id === currentClass.id ? updatedClass : c)));
      sound.playEncourage();
    }
  };

  const resetStudentForm = () => {
    setStFullName('');
    setStGender('male');
    setStDob('');
    setStNote('');
    setStAvatar(CUTE_AVATARS[Math.floor(Math.random() * CUTE_AVATARS.length)]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* SECTION 1: DANH SÁCH & CHỌN LỚP HỌC (TÙY Ý CHỌN & THÊM LỚP MỚI) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>🏫</span> Danh Sách Các Lớp Học Của Thầy Cô
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Bấm vào lớp bất kỳ để xem và chỉnh sửa danh sách học sinh của lớp đó
            </p>
          </div>

          <button
            onClick={() => setIsAddClassOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-md shadow-blue-200 transition-all btn-bounce text-sm shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Thêm Lớp Mới</span>
          </button>
        </div>

        {/* Danh sách thẻ các lớp học */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
          {classrooms.map((cls) => {
            const isSelected = cls.id === activeClassId;
            const clsStars = cls.students.reduce((sum, s) => sum + s.stars, 0);

            return (
              <div
                key={cls.id}
                onClick={() => {
                  onSelectClass(cls.id);
                  sound.playTick();
                }}
                className={`rounded-2xl p-4 border-2 cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-500 shadow-md ring-2 ring-blue-400/30'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-black rounded-full">
                      Khối {cls.grade}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-black text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-blue-200">
                        <Check className="w-3 h-3 text-blue-600" /> Đang chọn
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-base text-slate-800 truncate">
                    {cls.name}
                  </h3>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-semibold mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {cls.students.length} học sinh
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {clsStars} sao
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    {isSelected ? 'Bấm để quản lý 👆' : 'Bấm để chọn xem'}
                  </span>
                  {classrooms.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id, cls.name);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Xóa lớp này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Ô Thêm Lớp Nhanh */}
          <button
            onClick={() => setIsAddClassOpen(true)}
            className="rounded-2xl p-4 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 min-h-[120px] space-y-1.5"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-black text-xs sm:text-sm">+ Tạo Thêm Lớp Mới</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: CHI TIẾT LỚP ĐANG ĐƯỢC CHỌN (IMPORT EXCEL, DANH SÁCH HỌC SINH) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
              <span>🎒</span> Chi Tiết: {currentClass?.name}
            </h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
              Khối {currentClass?.grade}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Năm học {currentClass?.schoolYear} • Sĩ số: <strong className="text-slate-800">{currentClass?.students.length}</strong> học sinh • Tổng sao:{' '}
            <strong className="text-amber-500">⭐ {totalStars}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              resetStudentForm();
              setEditingStudent(null);
              setIsAddStudentOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold rounded-2xl shadow-sm transition-all btn-bounce text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>

          <button
            onClick={() => exportClassroomReport(currentClass.name, currentClass.students)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-2xl border border-amber-200 transition-all text-sm"
            title="Xuất bảng xếp hạng và số sao ra Excel"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>

          <button
            onClick={handleResetClassStars}
            className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border border-slate-200 transition-colors"
            title="Đặt lại sao về 0 cho lớp này"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Excel Import & Download Template Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`lg:col-span-2 border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
              : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-700">
                Nhập danh sách học sinh {currentClass?.name} từ file Excel hoặc CSV
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả file vào đây hoặc bấm nút bên dưới để chọn file từ máy tính
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all btn-bounce text-xs sm:text-sm flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Tải file Excel lên</span>
              </button>

              <button
                onClick={downloadSampleExcel}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs sm:text-sm flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Tải file Excel mẫu (.xlsx)</span>
              </button>
            </div>

            {importStatus && (
              <div
                className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 ${
                  importStatus.startsWith('Lỗi')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {importStatus.startsWith('Lỗi') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Gợi ý cho Thầy Cô:</span>
            </div>
            <ul className="text-xs text-amber-900/80 space-y-1.5 font-medium leading-relaxed">
              <li>• Mỗi lớp học đều có danh sách học sinh và điểm sao hoàn toàn độc lập.</li>
              <li>• File Excel chỉ cần các cột: <strong>STT, Họ và tên</strong> (tùy chọn: Ngày sinh, Giới tính, Ghi chú).</li>
              <li>• Hệ thống tự động gán hình đại diện con vật ngộ nghĩnh cho từng học sinh.</li>
            </ul>
          </div>
          <div className="mt-3 text-right">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-200/60 px-2.5 py-1 rounded-full">
              Chế độ lưu Offline an toàn ✨
            </span>
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng thẻ lưới sinh động"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'table' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Dạng bảng chi tiết"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student List Content */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
          <div className="text-5xl">🎒</div>
          <h3 className="text-lg font-black text-slate-700">Lớp {currentClass?.name} chưa có học sinh nào!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Thầy cô hãy nhập danh sách từ file Excel hoặc bấm <strong>"Thêm học sinh"</strong> để bắt đầu.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-2xl p-3.5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center">
                    {st.stt}
                  </span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditStudent(st)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(st.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-center my-2">
                  <div className="text-4xl transform group-hover:scale-110 transition-transform inline-block">
                    {st.avatar}
                  </div>
                  <h4 className="font-black text-slate-800 text-sm mt-1 truncate" title={st.fullName}>
                    {st.fullName}
                  </h4>
                  {st.note && (
                    <p className="text-[11px] text-slate-400 truncate italic mt-0.5" title={st.note}>
                      {st.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Stars & Quick Bonus */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-black text-amber-600 text-sm">{st.stars}</span>
                </div>
                <button
                  onClick={() => {
                    const updated = currentClass.students.map((s) => (s.id === st.id ? { ...s, stars: s.stars + 1 } : s));
                    onUpdateClassrooms(classrooms.map((c) => (c.id === currentClass.id ? { ...c, students: updated } : c)));
                    sound.playCorrect();
                    fireStarsConfetti();
                  }}
                  className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-black rounded-lg transition-colors btn-bounce"
                  title="Cộng 1 sao nhanh"
                >
                  +1 ⭐
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-extrabold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-16 text-center">STT</th>
                  <th className="px-4 py-3">Học sinh</th>
                  <th className="px-4 py-3">Giới tính</th>
                  <th className="px-4 py-3">Ngày sinh</th>
                  <th className="px-4 py-3">Ghi chú</th>
                  <th className="px-4 py-3 text-center">Số sao ⭐</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center font-bold text-slate-500">{st.stt}</td>
                    <td className="px-4 py-3 flex items-center space-x-2">
                      <span className="text-2xl">{st.avatar}</span>
                      <span className="font-extrabold text-slate-800">{st.fullName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{st.gender === 'female' ? 'Nữ' : 'Nam'}</td>
                    <td className="px-4 py-3 text-slate-500">{st.dob || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{st.note || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                        ⭐ {st.stars}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          const updated = currentClass.students.map((s) => (s.id === st.id ? { ...s, stars: s.stars + 1 } : s));
                          onUpdateClassrooms(classrooms.map((c) => (c.id === currentClass.id ? { ...c, students: updated } : c)));
                          sound.playCorrect();
                        }}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg"
                      >
                        +1 ⭐
                      </button>
                      <button
                        onClick={() => openEditStudent(st)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tạo Lớp Học */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-slate-100 space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>🏫</span> Tạo Lớp Học Mới
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lớp 3C, Lớp 1A - Họa Mi..."
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Khối lớp:</label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400"
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
                  onClick={() => setIsAddClassOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-sm shadow-md"
                >
                  Tạo lớp ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Học Sinh */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-slate-100 space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>{editingStudent ? '✏️' : '🎒'}</span>
              <span>{editingStudent ? 'Chỉnh Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Mới'}</span>
            </h3>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Họ và tên học sinh:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={stFullName}
                  onChange={(e) => setStFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Giới tính:</label>
                  <select
                    value={stGender}
                    onChange={(e) => setStGender(e.target.value as Gender)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="male">Nam 👦</option>
                    <option value="female">Nữ 👧</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Ngày sinh (tùy chọn):</label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={stDob}
                    onChange={(e) => setStDob(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ghi chú / Biệt danh:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Hăng hái, thích toán..."
                  value={stNote}
                  onChange={(e) => setStNote(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Chọn biểu tượng con vật:</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {CUTE_AVATARS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setStAvatar(emoji)}
                      className={`text-2xl p-1.5 rounded-xl transition-all ${
                        stAvatar === emoji ? 'bg-amber-200 scale-125 shadow-sm' : 'hover:bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md"
                >
                  {editingStudent ? 'Cập nhật' : 'Thêm ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
