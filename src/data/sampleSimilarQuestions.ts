import { Question } from '../types/game';

/**
 * Ngân hàng các câu hỏi tương tự theo từng Bài học và Chương trong SGK Kết Nối Tri Thức
 * Giúp giáo viên & học sinh nạp ngay câu hỏi tương tự bài đang học chỉ bằng 1 nút bấm!
 */
export const sampleSimilarQuestions: Record<string, Question[]> = {
  // Lớp 10 - Bài 1: Mệnh đề
  g10_c1_b1: [
    {
      id: 'sim_10_1_1',
      grade: '10',
      chapterId: 'g10_c1',
      chapterTitle: 'Chương I: Mệnh đề và tập hợp',
      lessonId: 'g10_c1_b1',
      lessonTitle: 'Bài 1: Mệnh đề',
      topic: 'Mệnh đề chứa biến',
      level: 'Nhận biết',
      content: 'Trong các câu sau, câu nào là một mệnh đề toán học?',
      options: [
        '$3$ là một số nguyên tố',
        'Hôm nay trời đẹp quá!',
        'Bạn có thích môn Toán không?',
        '$x + 2 > 5$'
      ],
      correctAnswer: 0,
      explanation: 'Câu "$3$ là một số nguyên tố" là một khẳng định đúng, do đó là một mệnh đề toán học.'
    },
    {
      id: 'sim_10_1_2',
      grade: '10',
      chapterId: 'g10_c1',
      chapterTitle: 'Chương I: Mệnh đề và tập hợp',
      lessonId: 'g10_c1_b1',
      lessonTitle: 'Bài 1: Mệnh đề',
      topic: 'Phủ định của mệnh đề',
      level: 'Thông hiểu',
      content: 'Mệnh đề phủ định của mệnh đề "$P: \\exists x \\in \\mathbb{R}, x^2 = 3$" là:',
      options: [
        '$\\overline{P}: \\forall x \\in \\mathbb{R}, x^2 \\ne 3$',
        '$\\overline{P}: \\exists x \\in \\mathbb{R}, x^2 \\ne 3$',
        '$\\overline{P}: \\forall x \\in \\mathbb{R}, x^2 = 3$',
        '$\\overline{P}: \\forall x \\notin \\mathbb{R}, x^2 \\ne 3$'
      ],
      correctAnswer: 0,
      explanation: 'Phủ định của "tồn tại $\\exists$" là "với mọi $\\forall$", phủ định của "$=$" là "$\\ne$".'
    }
  ],

  // Lớp 10 - Bài 2: Tập hợp và các phép toán trên tập hợp
  g10_c1_b2: [
    {
      id: 'sim_10_2_1',
      grade: '10',
      chapterId: 'g10_c1',
      chapterTitle: 'Chương I: Mệnh đề và tập hợp',
      lessonId: 'g10_c1_b2',
      lessonTitle: 'Bài 2: Tập hợp và các phép toán trên tập hợp',
      topic: 'Giao của hai tập hợp',
      level: 'Thông hiểu',
      content: 'Cho tập hợp $A = [-2; 3]$ và $B = (1; 5)$. Giao của hai tập hợp $A \\cap B$ là:',
      options: ['$(1; 3]$', '$[-2; 5)$', '$[1; 3]$', '$(1; 3)$'],
      correctAnswer: 0,
      explanation: 'Giao của hai tập hợp là phần tử thuộc cả hai tập: $A \\cap B = (1; 3]$.'
    }
  ],

  // Lớp 11 - Bài 2: Công thức lượng giác
  g11_c1_b2: [
    {
      id: 'sim_11_2_1',
      grade: '11',
      chapterId: 'g11_c1',
      chapterTitle: 'Chương I: Hàm số lượng giác và phương trình lượng giác',
      lessonId: 'g11_c1_b2',
      lessonTitle: 'Bài 2: Công thức lượng giác',
      topic: 'Công thức cộng và nhân đôi',
      level: 'Thông hiểu',
      content: 'Công thức nào sau đây biểu diễn đúng cho $\\cos(2a)$?',
      options: [
        '$\\cos(2a) = \\cos^2 a - \\sin^2 a$',
        '$\\cos(2a) = \\cos^2 a + \\sin^2 a$',
        '$\\cos(2a) = 2\\cos a$',
        '$\\cos(2a) = 2\\sin a \\cos a$'
      ],
      correctAnswer: 0,
      explanation: 'Theo công thức nhân đôi trong SGK Toán 11 KNTT: $\\cos(2a) = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$.'
    }
  ],

  // Lớp 11 - Bài 6: Cấp số cộng
  g11_c2_b6: [
    {
      id: 'sim_11_6_1',
      grade: '11',
      chapterId: 'g11_c2',
      chapterTitle: 'Chương II: Dãy số. Cấp số cộng và cấp số nhân',
      lessonId: 'g11_c2_b6',
      lessonTitle: 'Bài 6: Cấp số cộng',
      topic: 'Công sai cấp số cộng',
      level: 'Nhận biết',
      content: 'Cho cấp số cộng có $u_1 = 5$ và $u_2 = 9$. Công sai $d$ của cấp số cộng bằng:',
      options: ['$4$', '$-4$', '$14$', '$45$'],
      correctAnswer: 0,
      explanation: 'Công sai $d = u_2 - u_1 = 9 - 5 = 4$.'
    }
  ],

  // Lớp 12 - Bài 1: Tính đơn điệu và cực trị của hàm số
  g12_c1_b1: [
    {
      id: 'sim_12_1_1',
      grade: '12',
      chapterId: 'g12_c1',
      chapterTitle: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
      lessonId: 'g12_c1_b1',
      lessonTitle: 'Bài 1: Tính đơn điệu và cực trị của hàm số',
      topic: 'Tính đồng biến nghịch biến',
      level: 'Thông hiểu',
      content: 'Hàm số $y = -x^3 + 3x - 2$ đồng biến trên khoảng nào dưới đây?',
      options: ['$(-1; 1)$', '$(-\\infty; -1)$', '$(1; +\\infty)$', '$(-\\infty; 1)$'],
      correctAnswer: 0,
      explanation: 'Đạo hàm $y\' = -3x^2 + 3 > 0 \\iff x^2 < 1 \\iff -1 < x < 1$. Do đó hàm số đồng biến trên $(-1; 1)$.'
    },
    {
      id: 'sim_12_1_2',
      grade: '12',
      chapterId: 'g12_c1',
      chapterTitle: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
      lessonId: 'g12_c1_b1',
      lessonTitle: 'Bài 1: Tính đơn điệu và cực trị của hàm số',
      topic: 'Điểm cực đại của hàm số',
      level: 'Thông hiểu',
      content: 'Điểm cực đại của đồ thị hàm số $y = x^3 - 3x^2 + 2$ là:',
      options: ['$(0; 2)$', '$(2; -2)$', '$x = 0$', '$x = 2$'],
      correctAnswer: 0,
      explanation: '$y\' = 3x^2 - 6x = 0 \\iff x=0$ hoặc $x=2$. Qua $x=0$, $y\'$ đổi dấu từ $+$ sang $-$ nên điểm cực đại của đồ thị là $(0; 2)$.'
    }
  ],

  // Lớp 12 - Bài 2: Giá trị lớn nhất và nhỏ nhất của hàm số
  g12_c1_b2: [
    {
      id: 'sim_12_2_1',
      grade: '12',
      chapterId: 'g12_c1',
      chapterTitle: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
      lessonId: 'g12_c1_b2',
      lessonTitle: 'Bài 2: Giá trị lớn nhất và giá trị nhỏ nhất của hàm số',
      topic: 'GTLN - GTNN trên đoạn',
      level: 'Thông hiểu',
      content: 'Giá trị nhỏ nhất của hàm số $f(x) = x + \\frac{4}{x}$ trên đoạn $[1; 4]$ là:',
      options: ['$4$', '$5$', '$2$', '$8$'],
      correctAnswer: 0,
      explanation: 'Theo bất đẳng thức Cauchy hoặc đạo hàm $f\'(x) = 1 - 4/x^2 = 0 \\implies x = 2$. $f(2) = 4, f(1) = 5, f(4) = 5$. Vậy $\\min = 4$.'
    }
  ],

  // Lớp 12 - Bài 11: Nguyên hàm
  g12_c4_b11: [
    {
      id: 'sim_12_11_1',
      grade: '12',
      chapterId: 'g12_c4',
      chapterTitle: 'Chương IV: Nguyên hàm và tích phân',
      lessonId: 'g12_c4_b11',
      lessonTitle: 'Bài 11: Nguyên hàm',
      topic: 'Nguyên hàm cơ bản',
      level: 'Nhận biết',
      content: 'Họ nguyên hàm của hàm số $f(x) = \\cos x$ là:',
      options: ['$\\sin x + C$', '$-\\sin x + C$', '$\\tan x + C$', '$-\\cos x + C$'],
      correctAnswer: 0,
      explanation: 'Ta có $(\\sin x)\' = \\cos x$ nên $\\int \\cos x dx = \\sin x + C$.'
    }
  ],

  // Lớp 12 - Bài 14: Phương trình mặt phẳng
  g12_c5_b14: [
    {
      id: 'sim_12_14_1',
      grade: '12',
      chapterId: 'g12_c5',
      chapterTitle: 'Chương V: Phương pháp toạ độ trong không gian (Oxyz)',
      lessonId: 'g12_c5_b14',
      lessonTitle: 'Bài 14: Phương trình mặt phẳng',
      topic: 'Vectơ pháp tuyến của mặt phẳng',
      level: 'Nhận biết',
      content: 'Mặt phẳng $(P): x - 2y + 3z - 1 = 0$ có một vectơ pháp tuyến là:',
      options: ['$\\vec{n} = (1; -2; 3)$', '$\\vec{n} = (1; 2; 3)$', '$\\vec{n} = (-1; 2; 3)$', '$\\vec{n} = (1; -2; -1)$'],
      correctAnswer: 0,
      explanation: 'Mặt phẳng $Ax + By + Cz + D = 0$ có VTPT là $\\vec{n} = (A; B; C) = (1; -2; 3)$.'
    }
  ],

  // Lớp 10 - Bài 7: Các khái niệm mở đầu về Vectơ
  g10_c4_b7: [
    {
      id: 'sim_10_4_7_1',
      grade: '10',
      chapterId: 'g10_c4',
      chapterTitle: 'Chương IV: Vectơ',
      lessonId: 'g10_c4_b7',
      lessonTitle: 'Bài 7: Các khái niệm mở đầu',
      topic: 'Định nghĩa vectơ & Độ dài vectơ',
      level: 'Nhận biết',
      content: 'Cho đoạn thẳng $AB$ có độ dài bằng $5$. Độ dài của vectơ $\\overrightarrow{AB}$ (kí hiệu là $|\\overrightarrow{AB}|$) bằng:',
      options: ['$5$', '$-5$', '$10$', '$\\sqrt{5}$'],
      correctAnswer: 0,
      explanation: 'Độ dài của vectơ $\\overrightarrow{AB}$ chính là độ dài đoạn thẳng $AB$, do đó $|\\overrightarrow{AB}| = AB = 5$.'
    },
    {
      id: 'sim_10_4_7_2',
      grade: '10',
      chapterId: 'g10_c4',
      chapterTitle: 'Chương IV: Vectơ',
      lessonId: 'g10_c4_b7',
      lessonTitle: 'Bài 7: Các khái niệm mở đầu',
      topic: 'Vectơ-không',
      level: 'Thông hiểu',
      content: 'Khẳng định nào sau đây là ĐÚNG về vectơ-không (kí hiệu $\\vec{0}$)?',
      options: [
        'Vectơ $\\vec{0}$ có độ dài bằng $0$ và cùng hướng với mọi vectơ',
        'Vectơ $\\vec{0}$ có độ dài bằng $1$',
        'Vectơ $\\vec{0}$ có hướng xác định duy nhất là hướng dương',
        'Vectơ $\\vec{0}$ không có điểm đầu và điểm cuối'
      ],
      correctAnswer: 0,
      explanation: 'Theo SGK KNTT, vectơ-không kí hiệu là $\\vec{0}$, có độ dài $|\\vec{0}| = 0$, điểm đầu trùng điểm cuối và quy ước cùng hướng với mọi vectơ.'
    }
  ],

  // Lớp 10 - Bài 8: Tổng và hiệu của hai vectơ
  g10_c4_b8: [
    {
      id: 'sim_10_4_8_1',
      grade: '10',
      chapterId: 'g10_c4',
      chapterTitle: 'Chương IV: Vectơ',
      lessonId: 'g10_c4_b8',
      lessonTitle: 'Bài 8: Tổng và hiệu của hai vectơ',
      topic: 'Quy tắc ba điểm',
      level: 'Nhận biết',
      content: 'Cho ba điểm phân biệt $A, B, C$. Đẳng thức vectơ nào sau đây luôn ĐÚNG (Quy tắc ba điểm)?',
      options: [
        '$\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$',
        '$\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{BC}$',
        '$\\overrightarrow{AB} - \\overrightarrow{BC} = \\overrightarrow{AC}$',
        '$\\overrightarrow{CA} + \\overrightarrow{BA} = \\overrightarrow{CB}$'
      ],
      correctAnswer: 0,
      explanation: 'Theo quy tắc ba điểm (phép cộng vectơ): $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$.'
    },
    {
      id: 'sim_10_4_8_2',
      grade: '10',
      chapterId: 'g10_c4',
      chapterTitle: 'Chương IV: Vectơ',
      lessonId: 'g10_c4_b8',
      lessonTitle: 'Bài 8: Tổng và hiệu của hai vectơ',
      topic: 'Quy tắc hình bình hành',
      level: 'Thông hiểu',
      content: 'Cho hình bình hành $ABCD$. Vectơ tổng $\\overrightarrow{AB} + \\overrightarrow{AD}$ bằng vectơ nào sau đây?',
      options: [
        '$\\overrightarrow{AC}$',
        '$\\overrightarrow{CA}$',
        '$\\overrightarrow{BD}$',
        '$\\overrightarrow{DB}$'
      ],
      correctAnswer: 0,
      explanation: 'Theo quy tắc hình bình hành, tổng hai vectơ xuất phát từ cùng một đỉnh bằng vectơ đường chéo xuất phát từ đỉnh đó: $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AC}$.'
    }
  ],

  // Lớp 10 - Bài 10: Tích vô hướng của hai vectơ
  g10_c4_b10: [
    {
      id: 'sim_10_4_10_1',
      grade: '10',
      chapterId: 'g10_c4',
      chapterTitle: 'Chương IV: Vectơ',
      lessonId: 'g10_c4_b10',
      lessonTitle: 'Bài 10: Tích vô hướng của hai vectơ',
      topic: 'Công thức tích vô hướng',
      level: 'Thông hiểu',
      content: 'Cho hai vectơ $\\vec{u}$ và $\\vec{v}$ khác $\\vec{0}$, có $|\\vec{u}| = 3$, $|\\vec{v}| = 4$ và góc giữa hai vectơ $(\\vec{u}, \\vec{v}) = 60^\\circ$. Tích vô hướng $\\vec{u} \\cdot \\vec{v}$ bằng:',
      options: ['$6$', '$12$', '$6\\sqrt{3}$', '$12\\sqrt{3}$'],
      correctAnswer: 0,
      explanation: 'Ta có $\\vec{u} \\cdot \\vec{v} = |\\vec{u}| \\cdot |\\vec{v}| \\cdot \\cos(\\vec{u}, \\vec{v}) = 3 \\cdot 4 \\cdot \\cos 60^\\circ = 12 \\cdot \\frac{1}{2} = 6$.'
    }
  ],

  // Lớp 12 - Bài 6: Vectơ trong không gian
  g12_c2_b6: [
    {
      id: 'sim_12_2_6_1',
      grade: '12',
      chapterId: 'g12_c2',
      chapterTitle: 'Chương II: Toạ độ của vectơ trong không gian',
      lessonId: 'g12_c2_b6',
      lessonTitle: 'Bài 6: Vectơ trong không gian',
      topic: 'Quy tắc hình hộp',
      level: 'Thông hiểu',
      content: 'Cho hình hộp chữ nhật $ABCD.A\'B\'C\'D\'$. Khẳng định nào sau đây là ĐÚNG (Quy tắc hình hộp)?',
      options: [
        '$\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA\'} = \\overrightarrow{AC\'}$',
        '$\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA\'} = \\overrightarrow{AC}$',
        '$\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA\'} = \\overrightarrow{CA\'}$',
        '$\\overrightarrow{AB} + \\overrightarrow{BC} + \\overrightarrow{CD} = \\overrightarrow{AC\'}$'
      ],
      correctAnswer: 0,
      explanation: 'Theo quy tắc hình hộp: Tổng ba vectơ xuất phát từ đỉnh $A$ dọc theo ba cạnh bằng vectơ đường chéo xuất phát từ $A$: $\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA\'} = \\overrightarrow{AC\'}$.'
    }
  ],

  // Lớp 12 - Bài 8: Biểu thức toạ độ của các phép toán vectơ
  g12_c2_b8: [
    {
      id: 'sim_12_2_8_1',
      grade: '12',
      chapterId: 'g12_c2',
      chapterTitle: 'Chương II: Toạ độ của vectơ trong không gian',
      lessonId: 'g12_c2_b8',
      lessonTitle: 'Bài 8: Biểu thức toạ độ của các phép toán vectơ',
      topic: 'Tích vô hướng và góc trong không gian Oxyz',
      level: 'Vận dụng',
      content: 'Trong không gian $Oxyz$, cho hai vectơ $\\vec{u} = (1; 2; -2)$ và $\\vec{v} = (2; -1; 0)$. Tích vô hướng $\\vec{u} \\cdot \\vec{v}$ bằng:',
      options: ['$0$', '$4$', '$-4$', '$\\sqrt{5}$'],
      correctAnswer: 0,
      explanation: '$\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2 = 1(2) + 2(-1) + (-2)(0) = 2 - 2 + 0 = 0$. Hai vectơ này vuông góc với nhau.'
    }
  ]
};
