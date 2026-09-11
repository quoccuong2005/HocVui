'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Question, SubjectId, Difficulty, Topic } from '@/types';
import { SUBJECTS, DIFFICULTY_LABELS } from '@/lib/constants';
import { StorageService } from '@/lib/storage';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  CheckCircle, 
  Lightbulb, 
  Folder, 
  FolderOpen, 
  FolderPlus,
  ArrowLeft, 
  ChevronRight, 
  BookOpen, 
  FileText,
  FileSpreadsheet,
  Download,
  Upload,
  ClipboardPaste,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { sound } from '@/lib/soundEffects';
import { fireStarsConfetti, fireSuperWinnerConfetti } from '@/lib/confetti';
import { parseTextQuestions, SAMPLE_BATCH_TEXT } from '@/lib/textQuestionParser';
import { downloadQuestionSampleExcel, parseExcelQuestions } from '@/lib/excelHelper';

interface QuestionBankManagerProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({
  questions,
  onUpdateQuestions,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Danh sách các chủ đề
  const [topics, setTopics] = useState<Topic[]>([]);

  // Quản lý chủ đề đang chọn (null = ở màn hình danh sách chủ đề)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Modal 1: THÊM CHỦ ĐỀ MỚI
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicSubject, setNewTopicSubject] = useState<SubjectId>('toan');
  const [newTopicGrade, setNewTopicGrade] = useState<number>(3);

  // Modal 2: THÊM THỦ CÔNG 1 CÂU HỎI
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formLesson, setFormLesson] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('easy');
  const [formPrompt, setFormPrompt] = useState('');
  const [formOptionA, setFormOptionA] = useState('');
  const [formOptionB, setFormOptionB] = useState('');
  const [formOptionC, setFormOptionC] = useState('');
  const [formOptionD, setFormOptionD] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('A');
  const [formExplanation, setFormExplanation] = useState('');

  // Modal 3: DÁN NHANH HÀNG LOẠT TỪ VĂN BẢN (WORD / CHATGPT)
  const [isBatchTextModalOpen, setIsBatchTextModalOpen] = useState(false);
  const [batchRawText, setBatchRawText] = useState(SAMPLE_BATCH_TEXT);
  const [batchDefaultDifficulty, setBatchDefaultDifficulty] = useState<Difficulty>('easy');

  // Bộ lọc cấp độ riêng khi đang ở bên trong chủ đề
  const [topicDifficultyFilter, setTopicDifficultyFilter] = useState<Difficulty | 'all'>('all');

  // Modal 4: NHẬP HÀNG LOẠT TỪ FILE EXCEL
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelImportStatus, setExcelImportStatus] = useState<string | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Nạp topics từ storage khi component mount
  useEffect(() => {
    const loadedTopics = StorageService.getTopics();
    setTopics(loadedTopics);
  }, []);

  const handleUpdateTopics = (updated: Topic[]) => {
    setTopics(updated);
    StorageService.saveTopics(updated);
  };

  // Tạo chủ đề mới & lập tức vào chủ đề đó
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newId = `topic-${Date.now()}`;
    const newTopic: Topic = {
      id: newId,
      name: newTopicName.trim(),
      subjectId: newTopicSubject,
      grade: newTopicGrade,
      createdAt: new Date().toISOString(),
    };

    const updatedTopics = [newTopic, ...topics];
    handleUpdateTopics(updatedTopics);

    setIsAddTopicModalOpen(false);
    setNewTopicName('');
    setSelectedTopicId(newId);

    sound.playFanfare();
    fireStarsConfetti();
  };

  // Xóa chủ đề
  const handleDeleteTopic = (topicId: string, topicName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Thầy/Cô có chắc chắn muốn xóa chủ đề "${topicName}" không?`)) {
      const remainingTopics = topics.filter((t) => t.id !== topicId);
      handleUpdateTopics(remainingTopics);
      if (selectedTopicId === topicId) {
        setSelectedTopicId(null);
      }
    }
  };

  // Lọc danh sách chủ đề ở màn hình ngoài
  const filteredTopics = topics.filter((t) => {
    if (selectedSubject !== 'all' && t.subjectId !== selectedSubject) return false;
    if (selectedGrade !== 'all' && t.grade !== selectedGrade) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchTopic = t.name.toLowerCase().includes(qLower);
      const matchQuestionInTopic = questions.some(
        (q) => q.topic.toLowerCase() === t.name.toLowerCase() && q.prompt.toLowerCase().includes(qLower)
      );
      if (!matchTopic && !matchQuestionInTopic) return false;
    }
    return true;
  });

  // Chủ đề hiện tại đang mở
  const currentTopic = topics.find((t) => t.id === selectedTopicId);

  // Danh sách câu hỏi trong chủ đề đang mở
  const questionsInCurrentTopic = currentTopic
    ? questions.filter(
        (q) =>
          q.topic.trim().toLowerCase() === currentTopic.name.trim().toLowerCase() &&
          q.subjectId === currentTopic.subjectId &&
          q.grade === currentTopic.grade
      )
    : [];

  const displayedQuestions = questionsInCurrentTopic.filter((q) => {
    if (topicDifficultyFilter !== 'all' && q.difficulty !== topicDifficultyFilter) return false;
    if (searchQuery.trim()) {
      return q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Số lượng câu theo từng cấp độ trong chủ đề hiện tại
  const topicEasyCount = questionsInCurrentTopic.filter((q) => q.difficulty === 'easy').length;
  const topicMediumCount = questionsInCurrentTopic.filter((q) => q.difficulty === 'medium').length;
  const topicHardCount = questionsInCurrentTopic.filter((q) => q.difficulty === 'hard').length;

  // --- THÊM CÂU HỎI THỦ CÔNG ---
  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setFormLesson('');
    setFormDifficulty('easy');
    setFormPrompt('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectAnswer('A');
    setFormExplanation('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: Question) => {
    setEditingQuestion(q);
    setFormLesson(q.lesson || '');
    setFormDifficulty(q.difficulty);
    setFormPrompt(q.prompt);
    setFormOptionA(q.options?.[0] || '');
    setFormOptionB(q.options?.[1] || '');
    setFormOptionC(q.options?.[2] || '');
    setFormOptionD(q.options?.[3] || '');
    setFormCorrectAnswer(String(q.correctAnswer));
    setFormExplanation(q.explanation || '');
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim() || !currentTopic) return;

    const options = [formOptionA.trim(), formOptionB.trim(), formOptionC.trim(), formOptionD.trim()].filter(Boolean);

    let finalCorrectAnswer = formCorrectAnswer;
    if (formCorrectAnswer === 'A') finalCorrectAnswer = formOptionA.trim();
    else if (formCorrectAnswer === 'B') finalCorrectAnswer = formOptionB.trim();
    else if (formCorrectAnswer === 'C') finalCorrectAnswer = formOptionC.trim();
    else if (formCorrectAnswer === 'D') finalCorrectAnswer = formOptionD.trim();

    if (editingQuestion) {
      const updated = questions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              subjectId: currentTopic.subjectId,
              grade: currentTopic.grade,
              topic: currentTopic.name,
              lesson: formLesson.trim() || undefined,
              difficulty: formDifficulty,
              prompt: formPrompt.trim(),
              options,
              correctAnswer: finalCorrectAnswer,
              explanation: formExplanation.trim() || undefined,
            }
          : q
      );
      onUpdateQuestions(updated);
    } else {
      const newQ: Question = {
        id: `q-${Date.now()}`,
        subjectId: currentTopic.subjectId,
        grade: currentTopic.grade,
        topic: currentTopic.name,
        lesson: formLesson.trim() || undefined,
        difficulty: formDifficulty,
        type: 'multiple_choice',
        prompt: formPrompt.trim(),
        options,
        correctAnswer: finalCorrectAnswer,
        explanation: formExplanation.trim() || undefined,
      };
      onUpdateQuestions([...questions, newQ]);
    }

    sound.playCorrect();
    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm('Thầy/Cô có chắc muốn xóa câu hỏi này?')) {
      onUpdateQuestions(questions.filter((q) => q.id !== id));
    }
  };

  // --- DÁN NHANH HÀNG LOẠT TỪ WORD / CHATGPT ---
  const parsedBatchQuestions = currentTopic
    ? parseTextQuestions(batchRawText, currentTopic.name, currentTopic.subjectId, currentTopic.grade, batchDefaultDifficulty)
    : [];

  const handleImportBatchText = () => {
    if (parsedBatchQuestions.length === 0) {
      alert('Không nhận diện được câu hỏi nào! Thầy/cô vui lòng kiểm tra lại định dạng văn bản.');
      return;
    }

    onUpdateQuestions([...questions, ...parsedBatchQuestions]);
    sound.playFanfare();
    fireSuperWinnerConfetti();
    setIsBatchTextModalOpen(false);
    alert(`Thành công! Đã thêm ${parsedBatchQuestions.length} câu hỏi vào chủ đề "${currentTopic?.name}".`);
  };

  // --- NHẬP HÀNG LOẠT TỪ EXCEL ---
  const handleExcelUpload = async (file: File) => {
    if (!currentTopic) return;
    try {
      setExcelImportStatus('Đang đọc file Excel...');
      const imported = await parseExcelQuestions(file, currentTopic.name, currentTopic.subjectId, currentTopic.grade);
      onUpdateQuestions([...questions, ...imported]);
      sound.playFanfare();
      fireSuperWinnerConfetti();
      setExcelImportStatus(`Thành công! Đã nhập ${imported.length} câu hỏi vào chủ đề.`);
      setTimeout(() => {
        setIsExcelModalOpen(false);
        setExcelImportStatus(null);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đọc file!';
      setExcelImportStatus(`Lỗi: ${msg}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Button Thêm chủ đề mới ở màn hình ngoài */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
              <span>📚</span> Ngân Hàng Câu Hỏi Theo Chủ Đề
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Tổng cộng <strong className="text-slate-800">{topics.length}</strong> chủ đề bài học • <strong className="text-emerald-600">{questions.length}</strong> câu hỏi chuẩn bị cho máy chiếu
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {selectedTopicId ? (
            /* Khi đang ở bên trong chủ đề: Nút quay lại */
            <button
              onClick={() => setSelectedTopicId(null)}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all text-sm btn-bounce"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Xem tất cả chủ đề</span>
            </button>
          ) : (
            /* Nút "+ Thêm Chủ Đề Mới" ở ngoài */
            <button
              onClick={() => {
                setNewTopicName('');
                setNewTopicSubject(selectedSubject === 'all' ? 'toan' : selectedSubject);
                setNewTopicGrade(selectedGrade === 'all' ? 3 : selectedGrade);
                setIsAddTopicModalOpen(true);
              }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-md shadow-blue-200 transition-all btn-bounce text-sm sm:text-base"
            >
              <FolderPlus className="w-5 h-5" />
              <span>+ Thêm Chủ Đề Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            setSelectedSubject('all');
            setSelectedTopicId(null);
          }}
          className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all ${
            selectedSubject === 'all'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả các môn ({topics.length} chủ đề)
        </button>
        {SUBJECTS.map((sub) => {
          const count = topics.filter((t) => t.subjectId === sub.id).length;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setSelectedTopicId(null);
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
                selectedSubject === sub.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{sub.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${selectedSubject === sub.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grade, Difficulty & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Grade Filter */}
        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-1">Khối lớp:</label>
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setSelectedTopicId(null);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-400"
          >
            <option value="all">Tất cả khối lớp (1 - 5)</option>
            <option value="1">Lớp 1</option>
            <option value="2">Lớp 2</option>
            <option value="3">Lớp 3</option>
            <option value="4">Lớp 4</option>
            <option value="5">Lớp 5</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-1">Mức độ khó:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty | 'all')}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-400"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="easy">🟢 Dễ (Nhận biết)</option>
            <option value="medium">🟡 Vừa (Thông hiểu)</option>
            <option value="hard">🔴 Thử thách (Vận dụng)</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-extrabold text-slate-500 mb-1">Tìm kiếm:</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên chủ đề hoặc câu hỏi..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* GIAO DIỆN 1: MÀN HÌNH NGOÀI - DANH SÁCH CÁC CHỦ ĐỀ                   */}
      {/* =================================================================== */}
      {!selectedTopicId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>Danh Sách Các Chủ Đề Bài Học ({filteredTopics.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">
              Bấm vào một chủ đề để vào trong và thêm câu hỏi hàng loạt
            </span>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-black text-slate-700">Chưa có chủ đề nào phù hợp!</h3>
              <p className="text-sm text-slate-500">
                Thầy/Cô hãy bấm nút <strong>"+ Thêm Chủ Đề Mới"</strong> ở góc trên để tạo chủ đề đầu tiên.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => {
                const subject = SUBJECTS.find((s) => s.id === topic.subjectId);
                const topicQuestions = questions.filter(
                  (q) =>
                    q.topic.trim().toLowerCase() === topic.name.trim().toLowerCase() &&
                    q.subjectId === topic.subjectId &&
                    q.grade === topic.grade
                );
                const easyCount = topicQuestions.filter((q) => q.difficulty === 'easy').length;
                const mediumCount = topicQuestions.filter((q) => q.difficulty === 'medium').length;
                const hardCount = topicQuestions.filter((q) => q.difficulty === 'hard').length;

                return (
                  <div
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      sound.playTick();
                    }}
                    className="bg-white rounded-3xl p-5 border-2 border-slate-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group btn-bounce"
                  >
                    <div>
                      {/* Badges & Delete */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${subject?.badgeBg}`}>
                            {subject?.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Khối {topic.grade}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleDeleteTopic(topic.id, topic.name, e)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xóa chủ đề này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Topic Name */}
                      <div className="flex items-start space-x-3 my-2">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-base sm:text-lg text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Gồm <strong className="text-slate-800 font-black">{topicQuestions.length}</strong> câu hỏi chuẩn bị sẵn
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Difficulties tags & Action */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs">
                        {easyCount > 0 && (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200">
                            🟢 {easyCount}
                          </span>
                        )}
                        {mediumCount > 0 && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                            🟡 {mediumCount}
                          </span>
                        )}
                        {hardCount > 0 && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200">
                            🔴 {hardCount}
                          </span>
                        )}
                        {topicQuestions.length === 0 && (
                          <span className="text-[11px] font-bold text-slate-400 italic">
                            Chưa có câu hỏi
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 text-xs font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                        <span>Vào chủ đề</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Ô Thêm Chủ Đề Mới Nhanh */}
              <div
                onClick={() => {
                  setNewTopicName('');
                  setNewTopicSubject(selectedSubject === 'all' ? 'toan' : selectedSubject);
                  setNewTopicGrade(selectedGrade === 'all' ? 3 : selectedGrade);
                  setIsAddTopicModalOpen(true);
                }}
                className="rounded-3xl p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 cursor-pointer min-h-[160px] space-y-2 btn-bounce"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <span className="font-black text-sm">+ Tạo Thêm Chủ Đề Mới</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* GIAO DIỆN 2: BÊN TRONG CHỦ ĐỀ - CÓ 3 CÁCH THÊM CÂU HỎI SIÊU NHANH  */
        /* =================================================================== */
        <div className="space-y-5">
          {/* Header Chủ Đề & 3 Nút Thêm Câu Hỏi Nhanh */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-6 border-2 border-emerald-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => setSelectedTopicId(null)}
                className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-700 hover:text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 shadow-sm mb-2 btn-bounce"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại danh sách chủ đề</span>
              </button>

              <div className="flex items-center space-x-3 mt-1">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
                  <span>📖</span> {currentTopic?.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Môn: <strong>{SUBJECTS.find((s) => s.id === currentTopic?.subjectId)?.name}</strong> • Khối: <strong>Lớp {currentTopic?.grade}</strong> • Số câu: <strong>{questionsInCurrentTopic.length}</strong> câu
              </p>
            </div>

            {/* BỘ BA NÚT NHẬP CÂU HỎI: DÁN VĂN BẢN / EXCEL / THỦ CÔNG */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Nút Dán nhanh Word/ChatGPT */}
              <button
                onClick={() => setIsBatchTextModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-sm transition-all btn-bounce text-xs sm:text-sm"
                title="Dán nhiều câu hỏi từ file Word hoặc ChatGPT"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Dán Nhanh Từ Word / AI</span>
              </button>

              {/* Nút Nhập từ Excel */}
              <button
                onClick={() => {
                  setExcelImportStatus(null);
                  setIsExcelModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-black rounded-2xl shadow-sm transition-all btn-bounce text-xs sm:text-sm"
                title="Tải lên file Excel hàng chục câu"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Nhập Từ Excel</span>
              </button>

              {/* Nút Thêm thủ công 1 câu */}
              <button
                onClick={openAddQuestionModal}
                className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm transition-all btn-bounce text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm 1 Câu</span>
              </button>
            </div>
          </div>

          {/* THANH PHÂN LOẠI CẤP ĐỘ CÂU HỎI TRONG CHỦ ĐỀ (MỨC 1, MỨC 2, MỨC 3) */}
          <div className="flex items-center space-x-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <span className="text-xs font-black text-slate-400 uppercase px-2 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Phân biệt cấp độ:
            </span>

            <button
              onClick={() => setTopicDifficultyFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                topicDifficultyFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả các mức ({questionsInCurrentTopic.length})
            </button>

            <button
              onClick={() => setTopicDifficultyFilter('easy')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                topicDifficultyFilter === 'easy'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>🟢 Mức 1: Nhận biết (Dễ)</span>
              <span className="opacity-80">({topicEasyCount})</span>
            </button>

            <button
              onClick={() => setTopicDifficultyFilter('medium')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                topicDifficultyFilter === 'medium'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>🟡 Mức 2: Thông hiểu (Vừa)</span>
              <span className="opacity-80">({topicMediumCount})</span>
            </button>

            <button
              onClick={() => setTopicDifficultyFilter('hard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 ${
                topicDifficultyFilter === 'hard'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <span>🔴 Mức 3: Vận dụng (Khó)</span>
              <span className="opacity-80">({topicHardCount})</span>
            </button>
          </div>

          {/* Nếu chủ đề chưa có câu hỏi: Hiện 3 thẻ hành động to rõ ràng */}
          {displayedQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 space-y-6">
              <div className="space-y-2">
                <div className="text-5xl">🎒</div>
                <h3 className="text-xl font-black text-slate-800">
                  Chủ đề "{currentTopic?.name}" chưa có câu hỏi nào!
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Thầy cô có thể chọn 1 trong 3 cách siêu nhanh bên dưới để nạp câu hỏi cho tiết dạy:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                {/* Cách 1: Dán nhanh */}
                <div
                  onClick={() => setIsBatchTextModalOpen(true)}
                  className="bg-amber-50/70 border-2 border-amber-200 rounded-3xl p-5 hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-all btn-bounce flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center">
                      <ClipboardPaste className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-sm text-amber-950">1. Dán Nhanh Từ Word / AI</h4>
                    <p className="text-xs text-amber-900/70 leading-relaxed">
                      Copy toàn bộ 5 - 20 câu hỏi từ đề Word hoặc ChatGPT rồi dán vào. Hệ thống tự nhận diện A, B, C, D!
                    </p>
                  </div>
                  <span className="text-xs font-black text-amber-600 mt-4 block">
                    Khuyên dùng (Siêu nhanh ⚡) →
                  </span>
                </div>

                {/* Cách 2: File Excel */}
                <div
                  onClick={() => {
                    setExcelImportStatus(null);
                    setIsExcelModalOpen(true);
                  }}
                  className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-5 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer transition-all btn-bounce flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-200/80 text-emerald-800 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-sm text-emerald-950">2. Nhập Từ File Excel</h4>
                    <p className="text-xs text-emerald-900/70 leading-relaxed">
                      Tải file mẫu Excel về, điền câu hỏi hoặc nạp file có sẵn để đưa hàng loạt vào hệ thống.
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 mt-4 block">
                    Nhập hàng loạt 📊 →
                  </span>
                </div>

                {/* Cách 3: Thủ công */}
                <div
                  onClick={openAddQuestionModal}
                  className="bg-blue-50/70 border-2 border-blue-200 rounded-3xl p-5 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all btn-bounce flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-200/80 text-blue-800 flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-sm text-blue-950">3. Nhập Thủ Công Từng Câu</h4>
                    <p className="text-xs text-blue-900/70 leading-relaxed">
                      Gõ trực tiếp từng câu hỏi kèm 4 lựa chọn và giải thích trên biểu mẫu trực quan.
                    </p>
                  </div>
                  <span className="text-xs font-black text-blue-600 mt-4 block">
                    Nhập thủ công ✍️ →
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedQuestions.map((q) => {
                const subject = SUBJECTS.find((s) => s.id === q.subjectId);
                const diff = DIFFICULTY_LABELS[q.difficulty];

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Badges & Actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${subject?.badgeBg}`}>
                            {subject?.name}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Lớp {q.grade}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${diff.bg} ${diff.color}`}>
                            {diff.dot} {diff.label.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEditQuestionModal(q)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lesson if any */}
                      {q.lesson && (
                        <p className="text-xs font-bold text-slate-400 mt-2">
                          Bài học: <span className="text-slate-600">{q.lesson}</span>
                        </p>
                      )}

                      {/* Prompt */}
                      <h3 className="text-base sm:text-lg font-black text-slate-800 mt-2 leading-snug">
                        {q.prompt}
                      </h3>

                      {/* Options */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {q.options.map((opt, idx) => {
                            const letter = ['A', 'B', 'C', 'D'][idx];
                            const isCorrect = String(q.correctAnswer).trim() === opt.trim() || String(q.correctAnswer) === letter;

                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-black'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black ${
                                    isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="truncate">{opt}</span>
                                {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-2.5 flex items-start space-x-2 text-xs text-amber-900 font-medium">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Giải thích:</strong> {q.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: THÊM CHỦ ĐỀ MỚI                                            */}
      {/* =================================================================== */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-slate-100 space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <FolderPlus className="w-6 h-6 text-blue-600" />
              <span>Thêm Chủ Đề Bài Học Mới</span>
            </h3>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên chủ đề bài học:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bảng nhân trong phạm vi 1000, Hình học phẳng..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Môn học:</label>
                  <select
                    value={newTopicSubject}
                    onChange={(e) => setNewTopicSubject(e.target.value as SubjectId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Khối lớp:</label>
                  <select
                    value={newTopicGrade}
                    onChange={(e) => setNewTopicGrade(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value={1}>Lớp 1</option>
                    <option value={2}>Lớp 2</option>
                    <option value={3}>Lớp 3</option>
                    <option value={4}>Lớp 4</option>
                    <option value={5}>Lớp 5</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl text-sm shadow-md"
                >
                  Tạo chủ đề và vào thêm câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: DÁN NHANH HÀNG LOẠT CÂU HỎI TỪ VĂN BẢN (WORD / CHATGPT)     */}
      {/* =================================================================== */}
      {isBatchTextModalOpen && currentTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl border-2 border-slate-100 my-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ClipboardPaste className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800">
                    Dán Nhanh Hàng Loạt Câu Hỏi Từ Word / ChatGPT
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Nhập vào chủ đề: <strong>{currentTopic.name}</strong> (Lớp {currentTopic.grade})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBatchTextModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl text-sm font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Hướng dẫn định dạng:
              </div>
              <p>Thầy cô chỉ cần copy đề thi có dạng: <strong>Câu 1: ... A. ... B. ... C. ... D. ... Đáp án: B ... Giải thích: ...</strong> rồi dán vào ô bên dưới. Hệ thống sẽ tự bóc tách thông minh!</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Cấp độ mặc định nếu trong đề chưa ghi:
              </span>
              <select
                value={batchDefaultDifficulty}
                onChange={(e) => setBatchDefaultDifficulty(e.target.value as Difficulty)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="easy">🟢 Mức 1: Nhận biết (Dễ)</option>
                <option value="medium">🟡 Mức 2: Thông hiểu (Vừa)</option>
                <option value="hard">🔴 Mức 3: Vận dụng (Khó)</option>
              </select>
            </div>

            <div>
              <textarea
                rows={9}
                value={batchRawText}
                onChange={(e) => setBatchRawText(e.target.value)}
                placeholder="Dán nội dung các câu hỏi vào đây..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            {/* Trạng thái nhận diện trực tiếp */}
            <div className="flex items-center justify-between bg-slate-100 p-3.5 rounded-2xl">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600">Kết quả nhận diện tự động:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  parsedBatchQuestions.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {parsedBatchQuestions.length > 0
                    ? `✓ Nhận diện được ${parsedBatchQuestions.length} câu hỏi`
                    : 'Chưa tìm thấy câu hỏi hợp lệ'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBatchTextModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleImportBatchText}
                  disabled={parsedBatchQuestions.length === 0}
                  className={`px-5 py-2 rounded-xl text-sm font-black shadow-md transition-all btn-bounce ${
                    parsedBatchQuestions.length > 0
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Nhập {parsedBatchQuestions.length} câu này ngay!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: NHẬP HÀNG LOẠT TỪ FILE EXCEL                                */}
      {/* =================================================================== */}
      {isExcelModalOpen && currentTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Nhập Câu Hỏi Hàng Loạt Từ Excel
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Chủ đề: <strong>{currentTopic.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl text-sm font-bold"
              >
                Đóng
              </button>
            </div>

            <input
              type="file"
              ref={excelInputRef}
              accept=".xlsx, .xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleExcelUpload(e.target.files[0])}
            />

            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-400 rounded-3xl p-6 text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Chọn file Excel chứa danh sách câu hỏi của thầy cô
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => excelInputRef.current?.click()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition-all btn-bounce flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn File Excel Từ Máy Tính</span>
                </button>

                <button
                  onClick={downloadQuestionSampleExcel}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Tải File Excel Mẫu (.xlsx)</span>
                </button>
              </div>

              {excelImportStatus && (
                <div
                  className={`mt-2 p-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 ${
                    excelImportStatus.startsWith('Lỗi')
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {excelImportStatus.startsWith('Lỗi') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{excelImportStatus}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: THÊM/SỬA CÂU HỎI THỦ CÔNG                                  */}
      {/* =================================================================== */}
      {isQuestionModalOpen && currentTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border-2 border-slate-100 my-8 space-y-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>{editingQuestion ? '✏️' : '✨'}</span>
              <span>
                {editingQuestion
                  ? 'Chỉnh Sửa Câu Hỏi'
                  : `Thêm Câu Hỏi Vào Chủ Đề: "${currentTopic.name}"`}
              </span>
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">Môn học:</span>
                  <strong className="text-slate-800 text-sm">
                    {SUBJECTS.find((s) => s.id === currentTopic.subjectId)?.name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Khối lớp:</span>
                  <strong className="text-slate-800 text-sm">Lớp {currentTopic.grade}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Chủ đề:</span>
                  <strong className="text-emerald-700 text-sm truncate block">{currentTopic.name}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mức độ khó:</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  >
                    <option value="easy">🟢 Dễ (Nhận biết)</option>
                    <option value="medium">🟡 Vừa (Thông hiểu)</option>
                    <option value="hard">🔴 Khó (Vận dụng)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tên bài học cụ thể (tùy chọn):</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tiết 1, Bài 4..."
                    value={formLesson}
                    onChange={(e) => setFormLesson(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nội dung câu hỏi (chữ to trên máy chiếu):</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ví dụ: Một hình chữ nhật có chiều dài 8cm, chiều rộng 5cm..."
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">4 Lựa chọn trả lời & Chọn đáp án đúng:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-lg bg-blue-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      A
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Đáp án A..."
                      value={formOptionA}
                      onChange={(e) => setFormOptionA(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      B
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Đáp án B..."
                      value={formOptionB}
                      onChange={(e) => setFormOptionB(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      C
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Đáp án C..."
                      value={formOptionC}
                      onChange={(e) => setFormOptionC(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <span className="w-6 h-6 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                      D
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Đáp án D..."
                      value={formOptionD}
                      onChange={(e) => setFormOptionD(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-1">
                  <span className="text-xs font-extrabold text-slate-600">Đáp án chính xác:</span>
                  {(['A', 'B', 'C', 'D'] as const).map((letter) => (
                    <label key={letter} className="flex items-center space-x-1 cursor-pointer font-black text-sm">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value={letter}
                        checked={formCorrectAnswer === letter}
                        onChange={(e) => setFormCorrectAnswer(e.target.value)}
                        className="accent-emerald-600 w-4 h-4 cursor-pointer"
                      />
                      <span>{letter}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Lời giải thích khi hiện đáp án (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chu vi = (8 + 5) × 2 = 26cm!"
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm shadow-md"
                >
                  {editingQuestion ? 'Cập nhật câu hỏi' : 'Lưu vào chủ đề'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
