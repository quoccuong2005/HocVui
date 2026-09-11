import { Classroom, Question, Student, Topic } from '@/types';
import { INITIAL_CLASSROOMS, INITIAL_QUESTIONS } from './sampleData';

const STORAGE_KEYS = {
  CLASSROOMS: 'hocvui_classrooms_v1',
  ACTIVE_CLASS_ID: 'hocvui_active_class_id_v1',
  QUESTIONS: 'hocvui_questions_v1',
  TOPICS: 'hocvui_topics_v1',
  CALLED_STUDENTS: 'hocvui_called_students_v1',
};

// Khởi tạo danh sách chủ đề mặc định từ câu hỏi ban đầu
function extractInitialTopics(): Topic[] {
  const map = new Map<string, Topic>();
  INITIAL_QUESTIONS.forEach((q) => {
    const key = `${q.subjectId}_${q.grade}_${q.topic.trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: q.topic.trim(),
        subjectId: q.subjectId,
        grade: q.grade,
        createdAt: new Date().toISOString(),
      });
    }
  });
  return Array.from(map.values());
}

export const StorageService = {
  // Lớp học
  getClassrooms(): Classroom[] {
    if (typeof window === 'undefined') return INITIAL_CLASSROOMS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLASSROOMS);
      if (!data) {
        this.saveClassrooms(INITIAL_CLASSROOMS);
        return INITIAL_CLASSROOMS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CLASSROOMS;
    }
  },

  saveClassrooms(classrooms: Classroom[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify(classrooms));
  },

  getActiveClassId(): string {
    if (typeof window === 'undefined') return 'class-3a';
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
    return id || 'class-3a';
  },

  setActiveClassId(id: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CLASS_ID, id);
  },

  // Ngân hàng câu hỏi
  getQuestions(): Question[] {
    if (typeof window === 'undefined') return INITIAL_QUESTIONS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (!data) {
        this.saveQuestions(INITIAL_QUESTIONS);
        return INITIAL_QUESTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_QUESTIONS;
    }
  },

  saveQuestions(questions: Question[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  },

  // Chủ đề bài học
  getTopics(): Topic[] {
    const initial = extractInitialTopics();
    if (typeof window === 'undefined') return initial;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPICS);
      if (!data) {
        this.saveTopics(initial);
        return initial;
      }
      const loaded: Topic[] = JSON.parse(data);
      // Đảm bảo các topic từ câu hỏi không bị thiếu
      const map = new Map<string, Topic>();
      initial.forEach((t) => map.set(t.id, t));
      loaded.forEach((t) => map.set(t.id, t));
      return Array.from(map.values());
    } catch {
      return initial;
    }
  },

  saveTopics(topics: Topic[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  },

  // Học sinh đã gọi trong buổi (Session memory)
  getCalledStudentIds(classId: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = sessionStorage.getItem(`${STORAGE_KEYS.CALLED_STUDENTS}_${classId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveCalledStudentIds(classId: string, ids: string[]) {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(`${STORAGE_KEYS.CALLED_STUDENTS}_${classId}`, JSON.stringify(ids));
  },

  clearCalledStudentIds(classId: string) {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`${STORAGE_KEYS.CALLED_STUDENTS}_${classId}`);
  },

  // Xuất file sao lưu (JSON)
  exportFullBackup(): string {
    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      classrooms: this.getClassrooms(),
      questions: this.getQuestions(),
      topics: this.getTopics(),
    };
    return JSON.stringify(backup, null, 2);
  },

  // Khôi phục từ file sao lưu (JSON)
  importFullBackup(jsonString: string): boolean {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.classrooms && Array.isArray(backup.classrooms)) {
        this.saveClassrooms(backup.classrooms);
      }
      if (backup.questions && Array.isArray(backup.questions)) {
        this.saveQuestions(backup.questions);
      }
      if (backup.topics && Array.isArray(backup.topics)) {
        this.saveTopics(backup.topics);
      }
      return true;
    } catch (e) {
      console.error('Lỗi nhập dữ liệu:', e);
      return false;
    }
  },

  // Đặt lại dữ liệu gốc
  resetToDefault() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.CLASSROOMS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CLASS_ID);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    this.saveClassrooms(INITIAL_CLASSROOMS);
    this.saveQuestions(INITIAL_QUESTIONS);
    this.saveTopics(extractInitialTopics());
  }
};
