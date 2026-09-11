import { Question, SubjectId, Difficulty } from '@/types';

/**
 * Hàm phân tích văn bản thô (từ Word, ChatGPT, Zalo...) thành danh sách câu hỏi trắc nghiệm
 * Có nhận diện cấp độ bài tập (Mức 1 - Nhận biết, Mức 2 - Thông hiểu, Mức 3 - Vận dụng)
 */
export function parseTextQuestions(
  rawText: string,
  topicName: string,
  subjectId: SubjectId,
  grade: number,
  fallbackDifficulty: Difficulty = 'easy'
): Question[] {
  if (!rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const questions: Question[] = [];

  let currentPrompt = '';
  let options: string[] = [];
  let correctAnswer = 'A';
  let explanation = '';
  let difficulty: Difficulty = fallbackDifficulty;

  function saveCurrent() {
    if (currentPrompt && options.length >= 2) {
      let actualAnswer = correctAnswer;
      const letterIdx = ['A', 'B', 'C', 'D'].indexOf(correctAnswer.toUpperCase());
      if (letterIdx !== -1 && options[letterIdx]) {
        actualAnswer = options[letterIdx];
      }

      questions.push({
        id: `q-${Date.now()}-${questions.length + 1}`,
        subjectId,
        grade,
        topic: topicName,
        difficulty,
        type: 'multiple_choice',
        prompt: currentPrompt,
        options: options.slice(0, 4),
        correctAnswer: actualAnswer,
        explanation: explanation || undefined,
      });
    }

    currentPrompt = '';
    options = [];
    correctAnswer = 'A';
    explanation = '';
    difficulty = fallbackDifficulty;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Nhận diện dòng cấp độ: "Mức độ: Mức 1", "[Mức 2]", "Cấp độ: Vận dụng", "Độ khó: Dễ"
    const diffMatch = line.match(/^(?:mức độ|cấp độ|độ khó|mức)[:\s]+(.*)/i);
    if (diffMatch) {
      const val = diffMatch[1].toLowerCase();
      if (val.includes('3') || val.includes('vận dụng') || val.includes('khó') || val.includes('thử thách')) {
        difficulty = 'hard';
      } else if (val.includes('2') || val.includes('thông hiểu') || val.includes('vừa') || val.includes('trung bình')) {
        difficulty = 'medium';
      } else if (val.includes('1') || val.includes('nhận biết') || val.includes('dễ')) {
        difficulty = 'easy';
      }
      continue;
    }

    // Phát hiện dòng bắt đầu câu hỏi: "Câu 1:", "Bài 1.", "1.", "1/"
    const questionMatch = line.match(/^(?:câu|bài|\d+)[\s\d]*[:\.\/\)]\s*(.*)/i);
    if (questionMatch && !line.match(/^[A-D][\.\:\/\)]/i)) {
      if (currentPrompt) {
        saveCurrent();
      }

      let promptText = questionMatch[1] ? questionMatch[1].trim() : line;

      // Kiểm tra xem trong dòng tiêu đề câu hỏi có gài sẵn tag mức độ không: ví dụ "Câu 1: [Mức 1] 7 x 8 = ?"
      if (promptText.includes('[Mức 3]') || promptText.includes('[Vận dụng]') || promptText.includes('[Khó]')) {
        difficulty = 'hard';
        promptText = promptText.replace(/\[(?:mức 3|vận dụng|khó)\]/gi, '').trim();
      } else if (promptText.includes('[Mức 2]') || promptText.includes('[Thông hiểu]') || promptText.includes('[Vừa]')) {
        difficulty = 'medium';
        promptText = promptText.replace(/\[(?:mức 2|thông hiểu|vừa)\]/gi, '').trim();
      } else if (promptText.includes('[Mức 1]') || promptText.includes('[Nhận biết]') || promptText.includes('[Dễ]')) {
        difficulty = 'easy';
        promptText = promptText.replace(/\[(?:mức 1|nhận biết|dễ)\]/gi, '').trim();
      }

      currentPrompt = promptText;
      continue;
    }

    // Phát hiện lựa chọn A, B, C, D
    const optionMatch = line.match(/^([A-D])[\.\:\/\)]\s*(.*)/i);
    if (optionMatch) {
      const content = optionMatch[2].trim();
      options.push(content);
      continue;
    }

    // Phát hiện dòng đáp án
    const ansMatch = line.match(/^(?:đáp án|đa|key|kết quả|đáp số)[:\s]+([A-D]|\d+)/i);
    if (ansMatch) {
      correctAnswer = ansMatch[1].toUpperCase();
      continue;
    }

    // Phát hiện dòng giải thích
    const expMatch = line.match(/^(?:giải thích|hướng dẫn|lời giải)[:\s]+(.*)/i);
    if (expMatch) {
      explanation = expMatch[1].trim();
      continue;
    }

    // Dòng nối tiếp của đề bài
    if (options.length === 0 && currentPrompt) {
      currentPrompt += ' ' + line;
    }
  }

  saveCurrent();
  return questions;
}

export const SAMPLE_BATCH_TEXT = `Câu 1: [Mức 1 - Nhận biết] Kết quả của phép nhân: 7 × 9 = ?
A. 56
B. 63
C. 72
D. 64
Đáp án: B
Mức độ: Mức 1
Giải thích: Theo bảng nhân 7 thì 7 × 9 = 63.

Câu 2: [Mức 2 - Thông hiểu] Một hình chữ nhật có chiều dài 8cm, chiều rộng 5cm. Chu vi của hình đó là:
A. 13 cm
B. 26 cm
C. 40 cm
D. 20 cm
Đáp án: B
Mức độ: Mức 2
Giải thích: Chu vi = (8 + 5) × 2 = 26 cm.

Câu 3: [Mức 3 - Vận dụng] Bình có 6 viên bi. Số bi của Nam gấp 4 lần số bi của Bình. Hỏi cả hai bạn có tất cả bao nhiêu viên bi?
A. 24 viên
B. 30 viên
C. 10 viên
D. 28 viên
Đáp án: B
Mức độ: Mức 3
Giải thích: Nam có: 6 × 4 = 24 viên. Cả hai bạn có: 6 + 24 = 30 viên bi.`;
