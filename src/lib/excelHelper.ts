import * as XLSX from 'xlsx';
import { Student, Question, SubjectId, Difficulty } from '@/types';
import { CUTE_AVATARS } from './constants';

// --- PHẦN EXCEL HỌC SINH ---

export function downloadSampleExcel() {
  const sampleData = [
    { 'STT': 1, 'Họ và tên': 'Nguyễn Gia Bảo', 'Giới tính': 'Nam', 'Ngày sinh': '15/03/2016', 'Ghi chú': 'Hăng hái' },
    { 'STT': 2, 'Họ và tên': 'Trần Thảo Linh', 'Giới tính': 'Nữ', 'Ngày sinh': '22/07/2016', 'Ghi chú': 'Hát hay' },
    { 'STT': 3, 'Họ và tên': 'Lê Minh Khôi', 'Giới tính': 'Nam', 'Ngày sinh': '05/11/2016', 'Ghi chú': 'Toán tốt' },
    { 'STT': 4, 'Họ và tên': 'Phạm Ngọc Ánh', 'Giới tính': 'Nữ', 'Ngày sinh': '18/02/2016', 'Ghi chú': 'Chữ đẹp' },
    { 'STT': 5, 'Họ và tên': 'Vũ Đức Nam', 'Giới tính': 'Nam', 'Ngày sinh': '30/09/2016', 'Ghi chú': 'Nhanh nhẹn' },
    { 'STT': 6, 'Họ và tên': 'Đỗ Hà My', 'Giới tính': 'Nữ', 'Ngày sinh': '12/05/2016', 'Ghi chú': 'Chăm chỉ' },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh_HocVui.xlsx');
}

export function parseExcelStudents(file: File): Promise<Student[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawRows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawRows || rawRows.length === 0) {
          throw new Error('File Excel rỗng!');
        }

        let headerRowIdx = -1;
        let nameColIdx = -1;
        let sttColIdx = -1;
        let genderColIdx = -1;
        let dobColIdx = -1;
        let noteColIdx = -1;

        for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
          const row = rawRows[r];
          if (!row) continue;

          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || '').toLowerCase().trim();
            if (cellVal.includes('họ và tên') || cellVal.includes('họ tên') || cellVal === 'tên') {
              headerRowIdx = r;
              nameColIdx = c;
              break;
            }
          }
          if (headerRowIdx !== -1) break;
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0;
          nameColIdx = 1;
        }

        const headerRow = rawRows[headerRowIdx] || [];
        for (let c = 0; c < headerRow.length; c++) {
          const cellVal = String(headerRow[c] || '').toLowerCase().trim();
          if (cellVal.includes('stt') || cellVal.includes('số tt')) sttColIdx = c;
          if (cellVal.includes('giới tính') || cellVal.includes('nam/nữ')) genderColIdx = c;
          if (cellVal.includes('ngày sinh') || cellVal.includes('năm sinh')) dobColIdx = c;
          if (cellVal.includes('ghi chú') || cellVal.includes('nhận xét')) noteColIdx = c;
        }

        const students: Student[] = [];
        let autoStt = 1;

        for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row) continue;

          const fullName = String(row[nameColIdx] || '').trim();
          if (!fullName) continue;

          const sttVal = sttColIdx !== -1 && row[sttColIdx] ? Number(row[sttColIdx]) : autoStt;
          const genderRaw = genderColIdx !== -1 ? String(row[genderColIdx] || '').toLowerCase().trim() : '';
          const gender = genderRaw.includes('nữ') || genderRaw === 'f' ? 'female' : 'male';
          const dob = dobColIdx !== -1 ? String(row[dobColIdx] || '').trim() : undefined;
          const note = noteColIdx !== -1 ? String(row[noteColIdx] || '').trim() : undefined;

          const randomAvatar = CUTE_AVATARS[Math.floor(Math.random() * CUTE_AVATARS.length)];

          students.push({
            id: `st-${Date.now()}-${autoStt}`,
            stt: isNaN(sttVal) ? autoStt : sttVal,
            fullName,
            gender,
            dob,
            note,
            stars: 0,
            avatar: randomAvatar,
          });

          autoStt++;
        }

        if (students.length === 0) {
          throw new Error('Không tìm thấy dữ liệu học sinh trong file!');
        }

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export function exportClassroomReport(className: string, students: Student[]) {
  const sortedStudents = [...students].sort((a, b) => b.stars - a.stars || a.stt - b.stt);
  
  const reportData = sortedStudents.map((st, idx) => ({
    'Hạng': idx + 1,
    'STT': st.stt,
    'Họ và tên': st.fullName,
    'Số sao tích lũy ⭐': st.stars,
    'Ghi chú': st.note || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(reportData);
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 6 },
    { wch: 24 },
    { wch: 18 },
    { wch: 25 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BaoCaoTuyenDuong');

  const filename = `Bao_Cao_Sao_Thuong_${className.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

// --- PHẦN EXCEL CÂU HỎI HÀNG LOẠT ---

export function downloadQuestionSampleExcel() {
  const sampleQuestions = [
    {
      'Câu hỏi': 'Kết quả của phép tính: 7 × 8 = ?',
      'Đáp án A': '54',
      'Đáp án B': '56',
      'Đáp án C': '58',
      'Đáp án D': '63',
      'Đáp án đúng': 'B',
      'Mức độ': 'Dễ',
      'Giải thích': 'Theo bảng nhân 7 thì 7 × 8 = 56.'
    },
    {
      'Câu hỏi': 'Hình chữ nhật có chiều dài 8cm, chiều rộng 5cm. Chu vi là bao nhiêu?',
      'Đáp án A': '13 cm',
      'Đáp án B': '26 cm',
      'Đáp án C': '40 cm',
      'Đáp án D': '20 cm',
      'Đáp án đúng': 'B',
      'Mức độ': 'Vừa',
      'Giải thích': 'Chu vi = (8 + 5) × 2 = 26 cm.'
    },
    {
      'Câu hỏi': 'Số liền sau của số 99 là số nào?',
      'Đáp án A': '98',
      'Đáp án B': '100',
      'Đáp án C': '101',
      'Đáp án D': '90',
      'Đáp án đúng': 'B',
      'Mức độ': 'Dễ',
      'Giải thích': 'Số liền sau = 99 + 1 = 100.'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleQuestions);
  worksheet['!cols'] = [
    { wch: 45 }, // Câu hỏi
    { wch: 18 }, // Đáp án A
    { wch: 18 }, // Đáp án B
    { wch: 18 }, // Đáp án C
    { wch: 18 }, // Đáp án D
    { wch: 14 }, // Đáp án đúng
    { wch: 12 }, // Mức độ
    { wch: 35 }, // Giải thích
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'NganHangCauHoi');
  XLSX.writeFile(workbook, 'Mau_Cau_Hoi_HocVui.xlsx');
}

export function parseExcelQuestions(
  file: File,
  topicName: string,
  subjectId: SubjectId,
  grade: number
): Promise<Question[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (!rawRows || rawRows.length < 2) {
          throw new Error('File Excel rỗng hoặc không có dữ liệu!');
        }

        // Tìm dòng header
        let headerRowIdx = 0;
        let promptCol = -1;
        let optACol = -1;
        let optBCol = -1;
        let optCCol = -1;
        let optDCol = -1;
        let ansCol = -1;
        let diffCol = -1;
        let expCol = -1;

        for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
          const row = rawRows[r] || [];
          for (let c = 0; c < row.length; c++) {
            const val = String(row[c] || '').toLowerCase().trim();
            if (val.includes('câu hỏi') || val.includes('nội dung')) promptCol = c;
            if (val.includes('đáp án a') || val === 'a') optACol = c;
            if (val.includes('đáp án b') || val === 'b') optBCol = c;
            if (val.includes('đáp án c') || val === 'c') optCCol = c;
            if (val.includes('đáp án d') || val === 'd') optDCol = c;
            if (val.includes('đáp án đúng') || val.includes('kết quả') || val === 'đáp án') ansCol = c;
            if (val.includes('mức độ') || val.includes('độ khó')) diffCol = c;
            if (val.includes('giải thích') || val.includes('hướng dẫn')) expCol = c;
          }
          if (promptCol !== -1 && optACol !== -1) {
            headerRowIdx = r;
            break;
          }
        }

        // Mặc định thứ tự cột nếu không tìm thấy tên chính xác
        if (promptCol === -1) promptCol = 0;
        if (optACol === -1) optACol = 1;
        if (optBCol === -1) optBCol = 2;
        if (optCCol === -1) optCCol = 3;
        if (optDCol === -1) optDCol = 4;
        if (ansCol === -1) ansCol = 5;
        if (diffCol === -1) diffCol = 6;
        if (expCol === -1) expCol = 7;

        const questions: Question[] = [];

        for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row) continue;

          const prompt = String(row[promptCol] || '').trim();
          if (!prompt) continue;

          const optA = String(row[optACol] || '').trim();
          const optB = String(row[optBCol] || '').trim();
          const optC = optCCol !== -1 && row[optCCol] ? String(row[optCCol]).trim() : '';
          const optD = optDCol !== -1 && row[optDCol] ? String(row[optDCol]).trim() : '';

          const options = [optA, optB, optC, optD].filter(Boolean);
          if (options.length < 2) continue;

          // Phân tích đáp án đúng
          const rawAns = ansCol !== -1 && row[ansCol] ? String(row[ansCol]).trim().toUpperCase() : 'A';
          let actualAnswer = rawAns;
          if (rawAns === 'A') actualAnswer = optA;
          else if (rawAns === 'B') actualAnswer = optB;
          else if (rawAns === 'C') actualAnswer = optC || optA;
          else if (rawAns === 'D') actualAnswer = optD || optA;

          // Phân tích độ khó
          let difficulty: Difficulty = 'easy';
          const diffStr = diffCol !== -1 && row[diffCol] ? String(row[diffCol]).toLowerCase() : '';
          if (diffStr.includes('vừa') || diffStr.includes('thông hiểu')) difficulty = 'medium';
          else if (diffStr.includes('khó') || diffStr.includes('vận dụng')) difficulty = 'hard';

          const explanation = expCol !== -1 && row[expCol] ? String(row[expCol]).trim() : undefined;

          questions.push({
            id: `q-excel-${Date.now()}-${r}`,
            subjectId,
            grade,
            topic: topicName,
            difficulty,
            type: 'multiple_choice',
            prompt,
            options,
            correctAnswer: actualAnswer,
            explanation,
          });
        }

        if (questions.length === 0) {
          throw new Error('Không tìm thấy câu hỏi hợp lệ trong file Excel!');
        }

        resolve(questions);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
