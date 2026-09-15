export type Gender = 'male' | 'female' | 'other';

export interface Student {
  id: string;
  stt: number;
  fullName: string;
  dob?: string;
  gender?: Gender;
  note?: string;
  stars: number;
  avatar: string;
  isCalled?: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  grade: number; // 1, 2, 3, 4, 5
  schoolYear: string;
  students: Student[];
  createdAt: string;
  updatedAt: string;
}

export type SubjectId =
  | 'toan'
  | 'tieng_viet'
  | 'tnxh'
  | 'tieng_anh'
  | 'dao_duc'
  | 'tin_hoc'
  | 'khoa_hoc'
  | 'lich_su_dia_ly'
  | 'hoat_dong_trai_nghiem'
  | 'cong_nghe';

export interface Subject {
  id: SubjectId;
  name: string;
  icon: string;
  color: string;
  badgeBg: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank';

export interface Topic {
  id: string;
  name: string;
  subjectId: SubjectId;
  grade: number;
  createdAt?: string;
}

export interface Question {
  id: string;
  subjectId: SubjectId;
  grade: number; // 1 to 5
  topic: string;
  lesson?: string;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  imageUrl?: string;
  options?: string[]; // Cho trắc nghiệm
  correctAnswer: string | number; // Giá trị đáp án đúng hoặc index
  explanation?: string;
}

export type PickerMode = 'wheel' | 'gift' | 'cards';

export interface HistoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  starsAwarded: number;
  timestamp: string;
  questionId?: string;
}
