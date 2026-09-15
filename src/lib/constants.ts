import { Subject, Difficulty } from '@/types';

export const SUBJECTS: Subject[] = [
  {
    id: 'toan',
    name: 'Toán học',
    icon: 'Calculator',
    color: '#00BBF9',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 'tieng_viet',
    name: 'Tiếng Việt',
    icon: 'BookOpen',
    color: '#FF7849',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    id: 'tnxh',
    name: 'Tự nhiên & Xã hội',
    icon: 'Leaf',
    color: '#52B788',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 'tieng_anh',
    name: 'Tiếng Anh',
    icon: 'Languages',
    color: '#9B5DE5',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 'dao_duc',
    name: 'Đạo đức',
    icon: 'HeartHandshake',
    color: '#FF6B8B',
    badgeBg: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  {
    id: 'khoa_hoc',
    name: 'Khoa học',
    icon: 'FlaskConical',
    color: '#2A9D8F',
    badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'lich_su_dia_ly',
    name: 'Lịch sử và Địa lý',
    icon: 'Globe2',
    color: '#E76F51',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 'hoat_dong_trai_nghiem',
    name: 'Hoạt động trải nghiệm',
    icon: 'Compass',
    color: '#F4A261',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    id: 'cong_nghe',
    name: 'Công nghệ',
    icon: 'Cpu',
    color: '#457B9D',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
  },
];

export const DIFFICULTY_LABELS: Record<Difficulty, { 
  label: string; 
  shortLabel: string; 
  color: string; 
  bg: string; 
  dot: string; 
  level: number;
  description: string;
}> = {
  easy: {
    label: 'Mức 1: Nhận biết (Dễ)',
    shortLabel: 'Mức 1 - Dễ',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-300',
    dot: '🟢',
    level: 1,
    description: 'Nhắc lại kiến thức, bài tập đơn giản, củng cố nền tảng',
  },
  medium: {
    label: 'Mức 2: Thông hiểu (Vừa)',
    shortLabel: 'Mức 2 - Vừa',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-300',
    dot: '🟡',
    level: 2,
    description: 'Hiểu bản chất, giải thích, làm bài tập vận dụng quen thuộc',
  },
  hard: {
    label: 'Mức 3: Vận dụng (Thử thách)',
    shortLabel: 'Mức 3 - Thử thách',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-300',
    dot: '🔴',
    level: 3,
    description: 'Giải toán có lời văn, suy luận logic, phân hóa học sinh khá giỏi',
  },
};

export const CUTE_AVATARS = [
  '🐶', '🐱', '🐼', '🦊', '🐰', '🦁', '🐯', '🐨', 
  '🦄', '🐵', '🐸', '🐧', '🐥', '🦉', '🐬', '🐙',
  '🐝', '🦋', '🦖', '🌟', '🚀', '🍎', '🍓', '🎈'
];
