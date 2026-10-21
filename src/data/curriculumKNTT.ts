import { ChapterInfo } from '../types/game';

export const CURRICULUM_KNTT: Record<'10' | '11' | '12', ChapterInfo[]> = {
  '10': [
    {
      id: 'g10_c1',
      chapterNumber: 'I',
      title: 'Chương I: Mệnh đề và tập hợp',
      lessons: [
        { id: 'g10_c1_b1', lessonNumber: 1, title: 'Bài 1: Mệnh đề' },
        { id: 'g10_c1_b2', lessonNumber: 2, title: 'Bài 2: Tập hợp và các phép toán trên tập hợp' }
      ]
    },
    {
      id: 'g10_c2',
      chapterNumber: 'II',
      title: 'Chương II: Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
      lessons: [
        { id: 'g10_c2_b3', lessonNumber: 3, title: 'Bài 3: Bất phương trình bậc nhất hai ẩn' },
        { id: 'g10_c2_b4', lessonNumber: 4, title: 'Bài 4: Hệ bất phương trình bậc nhất hai ẩn' }
      ]
    },
    {
      id: 'g10_c3',
      chapterNumber: 'III',
      title: 'Chương III: Hệ thức lượng trong tam giác',
      lessons: [
        { id: 'g10_c3_b5', lessonNumber: 5, title: 'Bài 5: Giá trị lượng giác của một góc từ 0° đến 180°' },
        { id: 'g10_c3_b6', lessonNumber: 6, title: 'Bài 6: Hệ thức lượng trong tam giác' }
      ]
    },
    {
      id: 'g10_c4',
      chapterNumber: 'IV',
      title: 'Chương IV: Vectơ',
      lessons: [
        { id: 'g10_c4_b7', lessonNumber: 7, title: 'Bài 7: Các khái niệm mở đầu' },
        { id: 'g10_c4_b8', lessonNumber: 8, title: 'Bài 8: Tổng và hiệu của hai vectơ' },
        { id: 'g10_c4_b9', lessonNumber: 9, title: 'Bài 9: Tích của một vectơ với một số' },
        { id: 'g10_c4_b10', lessonNumber: 10, title: 'Bài 10: Tích vô hướng của hai vectơ' }
      ]
    },
    {
      id: 'g10_c5',
      chapterNumber: 'V',
      title: 'Chương V: Các số đặc trưng đo xu thế trung tâm',
      lessons: [
        { id: 'g10_c5_b11', lessonNumber: 11, title: 'Bài 11: Số gần đúng và sai số' },
        { id: 'g10_c5_b12', lessonNumber: 12, title: 'Bài 12: Số đặc trưng đo xu thế trung tâm' },
        { id: 'g10_c5_b13', lessonNumber: 13, title: 'Bài 13: Số đặc trưng đo độ phân tán' }
      ]
    },
    {
      id: 'g10_c6',
      chapterNumber: 'VI',
      title: 'Chương VI: Hàm số, đồ thị và ứng dụng',
      lessons: [
        { id: 'g10_c6_b15', lessonNumber: 15, title: 'Bài 15: Hàm số và đồ thị' },
        { id: 'g10_c6_b16', lessonNumber: 16, title: 'Bài 16: Hàm số bậc hai' },
        { id: 'g10_c6_b17', lessonNumber: 17, title: 'Bài 17: Dấu của tam thức bậc hai' },
        { id: 'g10_c6_b18', lessonNumber: 18, title: 'Bài 18: Phương trình quy về phương trình bậc hai' }
      ]
    },
    {
      id: 'g10_c7',
      chapterNumber: 'VII',
      title: 'Chương VII: Phương pháp toạ độ trong mặt phẳng',
      lessons: [
        { id: 'g10_c7_b19', lessonNumber: 19, title: 'Bài 19: Phương trình đường thẳng' },
        { id: 'g10_c7_b20', lessonNumber: 20, title: 'Bài 20: Vị trí tương đối giữa hai đường thẳng. Góc và khoảng cách' },
        { id: 'g10_c7_b21', lessonNumber: 21, title: 'Bài 21: Đường tròn trong mặt phẳng toạ độ' },
        { id: 'g10_c7_b22', lessonNumber: 22, title: 'Bài 22: Ba đường conic' }
      ]
    },
    {
      id: 'g10_c8',
      chapterNumber: 'VIII',
      title: 'Chương VIII: Đại số tổ hợp',
      lessons: [
        { id: 'g10_c8_b23', lessonNumber: 23, title: 'Bài 23: Quy tắc đếm' },
        { id: 'g10_c8_b24', lessonNumber: 24, title: 'Bài 24: Hoán vị, chỉnh hợp và tổ hợp' },
        { id: 'g10_c8_b25', lessonNumber: 25, title: 'Bài 25: Nhị thức Newton' }
      ]
    },
    {
      id: 'g10_c9',
      chapterNumber: 'IX',
      title: 'Chương IX: Tính xác suất theo định nghĩa cổ điển',
      lessons: [
        { id: 'g10_c9_b26', lessonNumber: 26, title: 'Bài 26: Biến cố và định nghĩa cổ điển của xác suất' },
        { id: 'g10_c9_b27', lessonNumber: 27, title: 'Bài 27: Thực hành tính xác suất' }
      ]
    }
  ],
  '11': [
    {
      id: 'g11_c1',
      chapterNumber: 'I',
      title: 'Chương I: Hàm số lượng giác và phương trình lượng giác',
      lessons: [
        { id: 'g11_c1_b1', lessonNumber: 1, title: 'Bài 1: Giá trị lượng giác của góc lượng giác' },
        { id: 'g11_c1_b2', lessonNumber: 2, title: 'Bài 2: Công thức lượng giác' },
        { id: 'g11_c1_b3', lessonNumber: 3, title: 'Bài 3: Hàm số lượng giác' },
        { id: 'g11_c1_b4', lessonNumber: 4, title: 'Bài 4: Phương trình lượng giác cơ bản' }
      ]
    },
    {
      id: 'g11_c2',
      chapterNumber: 'II',
      title: 'Chương II: Dãy số. Cấp số cộng và cấp số nhân',
      lessons: [
        { id: 'g11_c2_b5', lessonNumber: 5, title: 'Bài 5: Dãy số' },
        { id: 'g11_c2_b6', lessonNumber: 6, title: 'Bài 6: Cấp số cộng' },
        { id: 'g11_c2_b7', lessonNumber: 7, title: 'Bài 7: Cấp số nhân' }
      ]
    },
    {
      id: 'g11_c3',
      chapterNumber: 'III',
      title: 'Chương III: Các số đặc trưng đo xu thế trung tâm (mẫu ghép nhóm)',
      lessons: [
        { id: 'g11_c3_b8', lessonNumber: 8, title: 'Bài 8: Mẫu số liệu ghép nhóm' },
        { id: 'g11_c3_b9', lessonNumber: 9, title: 'Bài 9: Các số đặc trưng đo xu thế trung tâm' }
      ]
    },
    {
      id: 'g11_c4',
      chapterNumber: 'IV',
      title: 'Chương IV: Quan hệ song song trong không gian',
      lessons: [
        { id: 'g11_c4_b10', lessonNumber: 10, title: 'Bài 10: Đường thẳng và mặt phẳng trong không gian' },
        { id: 'g11_c4_b11', lessonNumber: 11, title: 'Bài 11: Hai đường thẳng song song' },
        { id: 'g11_c4_b12', lessonNumber: 12, title: 'Bài 12: Đường thẳng và mặt phẳng song song' },
        { id: 'g11_c4_b13', lessonNumber: 13, title: 'Bài 13: Hai mặt phẳng song song' }
      ]
    },
    {
      id: 'g11_c5',
      chapterNumber: 'V',
      title: 'Chương V: Giới hạn. Hàm số liên tục',
      lessons: [
        { id: 'g11_c5_b15', lessonNumber: 15, title: 'Bài 15: Giới hạn của dãy số' },
        { id: 'g11_c5_b16', lessonNumber: 16, title: 'Bài 16: Giới hạn của hàm số' },
        { id: 'g11_c5_b17', lessonNumber: 17, title: 'Bài 17: Hàm số liên tục' }
      ]
    },
    {
      id: 'g11_c6',
      chapterNumber: 'VI',
      title: 'Chương VI: Hàm số mũ và hàm số lôgarit',
      lessons: [
        { id: 'g11_c6_b18', lessonNumber: 18, title: 'Bài 18: Luỹ thừa với số mũ thực' },
        { id: 'g11_c6_b19', lessonNumber: 19, title: 'Bài 19: Lôgarit' },
        { id: 'g11_c6_b20', lessonNumber: 20, title: 'Bài 20: Hàm số mũ và hàm số lôgarit' },
        { id: 'g11_c6_b21', lessonNumber: 21, title: 'Bài 21: Phương trình, bất phương trình mũ và lôgarit' }
      ]
    },
    {
      id: 'g11_c7',
      chapterNumber: 'VII',
      title: 'Chương VII: Đạo hàm',
      lessons: [
        { id: 'g11_c7_b22', lessonNumber: 22, title: 'Bài 22: Khái niệm đạo hàm. Ý nghĩa hình học của đạo hàm' },
        { id: 'g11_c7_b23', lessonNumber: 23, title: 'Bài 23: Quy tắc tính đạo hàm' }
      ]
    },
    {
      id: 'g11_c8',
      chapterNumber: 'VIII',
      title: 'Chương VIII: Quan hệ vuông góc trong không gian',
      lessons: [
        { id: 'g11_c8_b24', lessonNumber: 24, title: 'Bài 24: Hai đường thẳng vuông góc' },
        { id: 'g11_c8_b25', lessonNumber: 25, title: 'Bài 25: Đường thẳng vuông góc với mặt phẳng' },
        { id: 'g11_c8_b26', lessonNumber: 26, title: 'Bài 26: Hai mặt phẳng vuông góc' },
        { id: 'g11_c8_b27', lessonNumber: 27, title: 'Bài 27: Khoảng cách trong không gian' },
        { id: 'g11_c8_b28', lessonNumber: 28, title: 'Bài 28: Thể tích' }
      ]
    },
    {
      id: 'g11_c9',
      chapterNumber: 'IX',
      title: 'Chương IX: Xác suất',
      lessons: [
        { id: 'g11_c9_b29', lessonNumber: 29, title: 'Bài 29: Biến cố hợp, biến cố giao, biến cố độc lập' },
        { id: 'g11_c9_b30', lessonNumber: 30, title: 'Bài 30: Công thức nhân xác suất cho hai biến cố độc lập' }
      ]
    }
  ],
  '12': [
    {
      id: 'g12_c1',
      chapterNumber: 'I',
      title: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
      lessons: [
        { id: 'g12_c1_b1', lessonNumber: 1, title: 'Bài 1: Tính đơn điệu và cực trị của hàm số' },
        { id: 'g12_c1_b2', lessonNumber: 2, title: 'Bài 2: Giá trị lớn nhất và giá trị nhỏ nhất của hàm số' },
        { id: 'g12_c1_b3', lessonNumber: 3, title: 'Bài 3: Đường tiệm cận của đồ thị hàm số' },
        { id: 'g12_c1_b4', lessonNumber: 4, title: 'Bài 4: Khảo sát sự biến thiên và vẽ đồ thị của hàm số' },
        { id: 'g12_c1_b5', lessonNumber: 5, title: 'Bài 5: Ứng dụng đạo hàm để giải quyết một số bài toán thực tiễn' }
      ]
    },
    {
      id: 'g12_c2',
      chapterNumber: 'II',
      title: 'Chương II: Toạ độ của vectơ trong không gian',
      lessons: [
        { id: 'g12_c2_b6', lessonNumber: 6, title: 'Bài 6: Vectơ trong không gian' },
        { id: 'g12_c2_b7', lessonNumber: 7, title: 'Bài 7: Hệ trục toạ độ trong không gian' },
        { id: 'g12_c2_b8', lessonNumber: 8, title: 'Bài 8: Biểu thức toạ độ của các phép toán vectơ' }
      ]
    },
    {
      id: 'g12_c3',
      chapterNumber: 'III',
      title: 'Chương III: Các số đặc trưng đo mức độ phân tán cho mẫu ghép nhóm',
      lessons: [
        { id: 'g12_c3_b9', lessonNumber: 9, title: 'Bài 9: Khoảng biến thiên và khoảng tứ phân vị' },
        { id: 'g12_c3_b10', lessonNumber: 10, title: 'Bài 10: Phương sai và độ lệch chuẩn' }
      ]
    },
    {
      id: 'g12_c4',
      chapterNumber: 'IV',
      title: 'Chương IV: Nguyên hàm và tích phân',
      lessons: [
        { id: 'g12_c4_b11', lessonNumber: 11, title: 'Bài 11: Nguyên hàm' },
        { id: 'g12_c4_b12', lessonNumber: 12, title: 'Bài 12: Tích phân' },
        { id: 'g12_c4_b13', lessonNumber: 13, title: 'Bài 13: Ứng dụng hình học của tích phân' }
      ]
    },
    {
      id: 'g12_c5',
      chapterNumber: 'V',
      title: 'Chương V: Phương pháp toạ độ trong không gian (Oxyz)',
      lessons: [
        { id: 'g12_c5_b14', lessonNumber: 14, title: 'Bài 14: Phương trình mặt phẳng' },
        { id: 'g12_c5_b15', lessonNumber: 15, title: 'Bài 15: Phương trình đường thẳng trong không gian' },
        { id: 'g12_c5_b16', lessonNumber: 16, title: 'Bài 16: Phương trình mặt cầu' }
      ]
    },
    {
      id: 'g12_c6',
      chapterNumber: 'VI',
      title: 'Chương VI: Xác suất có điều kiện',
      lessons: [
        { id: 'g12_c6_b17', lessonNumber: 17, title: 'Bài 17: Xác suất có điều kiện' },
        { id: 'g12_c6_b18', lessonNumber: 18, title: 'Bài 18: Công thức xác suất toàn phần và công thức Bayes' }
      ]
    }
  ]
};

export function getChaptersByGrade(grade: '10' | '11' | '12'): ChapterInfo[] {
  return CURRICULUM_KNTT[grade] || [];
}

export function getLessonsByChapter(grade: '10' | '11' | '12', chapterId: string) {
  const chapters = CURRICULUM_KNTT[grade] || [];
  const found = chapters.find((c) => c.id === chapterId);
  return found ? found.lessons : [];
}

export function findChapterAndLesson(grade: '10' | '11' | '12', lessonId: string) {
  const chapters = CURRICULUM_KNTT[grade] || [];
  for (const c of chapters) {
    const l = c.lessons.find((item) => item.id === lessonId);
    if (l) {
      return { chapter: c, lesson: l };
    }
  }
  return null;
}
