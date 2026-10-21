import { Question } from '../types/game';
import { normalizeMathType } from './mathParser';

export interface AiModelConfig {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

// Model order as specified in AI_INSTRUCTIONS.md:
// 1. gemini-3-flash-preview (Default)
// 2. gemini-3-pro-preview
// 3. gemini-2.5-flash
export const AVAILABLE_MODELS: AiModelConfig[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    description: 'Tốc độ cực nhanh, phản hồi tức thì, tối ưu cho tạo câu hỏi trắc nghiệm.',
    badge: 'Default',
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    description: 'Khả năng tư duy toán học chuyên sâu, độ chính xác công thức cao nhất.',
    badge: 'Chuyên sâu',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Mô hình dự phòng ổn định, tiết kiệm quota, phản hồi nhanh.',
    badge: 'Dự phòng ổn định',
  },
];

// Fallback sequence as specified in AI_INSTRUCTIONS.md
export const FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash',
];

const STORAGE_KEY_API_KEY = 'gemini_api_key';
const STORAGE_KEY_MODEL = 'gemini_selected_model';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return FALLBACK_MODELS[0];
  return localStorage.getItem(STORAGE_KEY_MODEL) || FALLBACK_MODELS[0];
}

export function setStoredModel(model: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MODEL, model);
}

/**
 * Test user's Gemini API Key
 */
export async function testGeminiApiKey(apiKey: string, model: string = 'gemini-3-flash-preview'): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra!' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'Respond with exactly: "OK"' }],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const code = errData.error?.code || response.status;
      const status = errData.error?.status || '';
      const errMsg = errData.error?.message || response.statusText;
      return { success: false, message: `${code} ${status}: ${errMsg}`.trim() };
    }

    return { success: true, message: `Kết nối thành công với ${model}!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Không thể kết nối đến máy chủ Google Gemini.' };
  }
}

export interface GenerateQuestionsParams {
  grade: '10' | '11' | '12';
  chapterId: string;
  chapterTitle: string;
  lessonId: string;
  lessonTitle: string;
  count: number;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao' | 'Hỗn hợp';
  customNotes?: string;
  onModelAttempt?: (model: string, attemptIndex: number) => void;
  onStepProgress?: (step: 1 | 2 | 3, status: 'running' | 'success' | 'error', detail?: string) => void;
}

/**
 * Generate Math Questions using Google Gemini AI with automatic Fallback & Retry
 */
export async function generateQuestionsWithGemini(
  params: GenerateQuestionsParams
): Promise<{ questions: Question[]; usedModel: string }> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('CHƯA_CÓ_API_KEY');
  }

  const preferredModel = getStoredModel();

  // Create model attempt list starting with user's preferred model, followed by fallback list
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  const systemInstruction = `
Bạn là chuyên gia biên soạn đề thi Toán học THPT theo Chương trình GDPT 2018 (SGK Kết Nối Tri Thức Với Cuộc Sống).
Nhiệm vụ của bạn: Tạo đúng ${params.count} câu hỏi trắc nghiệm Toán học 4 lựa chọn (A, B, C, D) cho:
- Khối lớp: Toán ${params.grade} (SGK Kết Nối Tri Thức Với Cuộc Sống)
- Chương: ${params.chapterTitle}
- Bài học: ${params.lessonTitle}
- Mức độ nhận thức: ${params.level}
${params.customNotes ? `- Yêu cầu bổ sung của giáo viên: ${params.customNotes}` : ''}

QUY TẮC CÔNG THỨC TOÁN & MATHTYPE CỰC KỲ QUAN TRỌNG:
1. MỌI công thức toán học, biến số, toạ độ, số học phải đặt trong cặp dấu $ ... $ (inline) hoặc $$ ... $$ (display).
2. KÍ HIỆU VECTƠ PHẢI CHÍNH XÁC 100%:
   - Vectơ 1 chữ cái: BẮT BUỘC dùng \\vec{a}, \\vec{b}, \\vec{c}, \\vec{u}, \\vec{v}, \\vec{n}, \\vec{i}, \\vec{j}, \\vec{k}, \\vec{0}.
   - Vectơ 2 điểm/chữ cái trở lên: BẮT BUỘC dùng \\overrightarrow{AB}, \\overrightarrow{CD}, \\overrightarrow{MN}, \\overrightarrow{OA}, \\overrightarrow{BC}, \\overrightarrow{AC}, \\overrightarrow{u_1}. TUYỆT ĐỐI KHÔNG dùng \\vec{AB} (vì mũi tên bị ngắn đè chữ).
   - Tích vô hướng: dùng \\cdot như $\\vec{a} \\cdot \\vec{b}$ hoặc $\\overrightarrow{AB} \\cdot \\overrightarrow{CD}$.
   - Độ dài vectơ: dùng $|\\vec{u}|$ hoặc $|\\overrightarrow{AB}|$.
   - Toạ độ điểm và toạ độ vectơ: dùng dấu chấm phẩy $(x; y)$ hoặc $(x; y; z)$ theo chuẩn SGK Việt Nam.
3. Kí hiệu toán học: dùng \\frac{a}{b}, \\sqrt{x}, \\le, \\ge, \\ne, \\in, \\infty, 45^\\circ.
4. Mỗi câu hỏi gồm:
   - content: Nội dung câu hỏi rõ ràng, sư phạm, chính xác.
   - options: Mảng 4 phần tử [A, B, C, D], trong đó chỉ có DUY NHẤT 1 đáp án đúng.
   - correctAnswer: Số nguyên 0, 1, 2, hoặc 3 (tương ứng với A, B, C, D).
   - explanation: Lời giải chi tiết, rõ ràng từng bước suy luận theo SGK Kết Nối Tri Thức.
   - level: Một trong 4 mức độ: "Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao".

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC:
Trả về DUY NHẤT một mảng JSON thuần túy (không bọc trong markdown \`\`\`json hay text thừa):
[
  {
    "content": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "...",
    "level": "Thông hiểu"
  }
]
`;

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    if (params.onModelAttempt) {
      params.onModelAttempt(currentModel, i + 1);
    }
    if (params.onStepProgress) {
      params.onStepProgress(1, 'running', `Đang gọi ${currentModel} (Lần thử ${i + 1}/${modelsToTry.length})`);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemInstruction }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const status = errJson.error?.status || `HTTP_${response.status}`;
        const code = errJson.error?.code || response.status;
        const msg = errJson.error?.message || response.statusText;
        // Format verbatim error as required in AI_INSTRUCTIONS.md (e.g. 429 RESOURCE_EXHAUSTED)
        const verbatimError = `${code} ${status}: ${msg}`.trim();
        lastError = new Error(verbatimError);
        console.warn(`[AI Fallback] ${currentModel} thất bại (${verbatimError}). Đang tự động thử model tiếp theo...`);
        continue;
      }

      if (params.onStepProgress) {
        params.onStepProgress(1, 'success', `Đã kết nối thành công với ${currentModel}`);
        params.onStepProgress(2, 'running', 'Đang phân tích và xử lý cấu trúc câu hỏi SGK...');
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!rawText) {
        lastError = new Error(`500 EMPTY_RESPONSE: Model ${currentModel} trả về phản hồi rỗng.`);
        continue;
      }

      // Clean markdown code fence if present
      let cleanJson = rawText.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedArray = JSON.parse(cleanJson);
      if (!Array.isArray(parsedArray) || parsedArray.length === 0) {
        lastError = new Error(`502 INVALID_FORMAT: Dữ liệu JSON từ ${currentModel} không đúng định dạng mảng câu hỏi.`);
        continue;
      }

      if (params.onStepProgress) {
        params.onStepProgress(2, 'success', `Đã tạo xong ${parsedArray.length} câu hỏi`);
        params.onStepProgress(3, 'running', 'Đang chuẩn hóa công thức MathType và kí hiệu Vectơ KaTeX...');
      }

      // Normalize all formulas and vectors with normalizeMathType
      const validLevels = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
      const validatedQuestions: Question[] = parsedArray.map((q: any, idx: number) => {
        const parsedLevel = validLevels.includes(q.level)
          ? q.level
          : params.level === 'Hỗn hợp'
          ? 'Thông hiểu'
          : params.level;

        return {
          id: `ai_${Date.now()}_${idx}`,
          grade: params.grade,
          chapterId: params.chapterId,
          chapterTitle: params.chapterTitle,
          lessonId: params.lessonId,
          lessonTitle: params.lessonTitle,
          topic: params.lessonTitle,
          level: parsedLevel,
          content: normalizeMathType(q.content || ''),
          options: [
            normalizeMathType(q.options?.[0] || 'Phương án A'),
            normalizeMathType(q.options?.[1] || 'Phương án B'),
            normalizeMathType(q.options?.[2] || 'Phương án C'),
            normalizeMathType(q.options?.[3] || 'Phương án D'),
          ] as [string, string, string, string],
          correctAnswer: (typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3)
            ? q.correctAnswer
            : 0,
          explanation: normalizeMathType(q.explanation || 'Lời giải chi tiết theo SGK Kết Nối Tri Thức.'),
        };
      });

      if (params.onStepProgress) {
        params.onStepProgress(3, 'success', 'Chuẩn hóa hoàn tất 100% không lỗi font');
      }

      return {
        questions: validatedQuestions,
        usedModel: currentModel,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Fallback] Lỗi khi xử lý với model ${currentModel}:`, err);
    }
  }

  // If all models failed, notify step failure
  if (params.onStepProgress) {
    params.onStepProgress(1, 'error', lastError?.message || '429 RESOURCE_EXHAUSTED');
  }

  // If all models failed, throw verbatim error
  throw lastError || new Error('429 RESOURCE_EXHAUSTED: Quota exceeded for all models. Please check your API key.');
}

/**
 * AI Math Tutor (Hint Agent): Provides pedagogical step-by-step guidance without spoiling the answer
 */
export async function generateHintForQuestion(question: Question, hintStage: 1 | 2 | 3 = 1): Promise<string> {
  const apiKey = getStoredApiKey();
  if (!apiKey) throw new Error('Vui lòng nhập API Key để sử dụng AI Gia Sư!');

  const model = getStoredModel();
  const stageDesc =
    hintStage === 1
      ? 'Mức 1: Nhắc lại công thức, định lý hoặc khái niệm cốt lõi cần dùng theo SGK Kết Nối Tri Thức'
      : hintStage === 2
      ? 'Mức 2: Gợi ý bước biến đổi đầu tiên hoặc phương pháp đặt ẩn, hướng đi chính xác'
      : 'Mức 3: Phân tích sâu phương pháp loại trừ đáp án sai và cách kiểm tra kết quả';

  const prompt = `
Bạn là AI Gia Sư Toán THPT tận tâm theo SGK Kết Nối Tri Thức Với Cuộc Sống.
Nhiệm vụ: Cung cấp một gợi ý sư phạm ngắn gọn (từ 2 - 4 dòng) cho học sinh đang giải câu hỏi sau:
Câu hỏi: "${question.content}"
Các phương án: A: ${question.options[0]}, B: ${question.options[1]}, C: ${question.options[2]}, D: ${question.options[3]}

Mức gợi ý yêu cầu: ${stageDesc}.

NGUYÊN TẮC QUAN TRỌNG:
1. TUYỆT ĐỐI KHÔNG tiết lộ đáp án trực tiếp (không nói "Chọn A" hay "Đáp án là B").
2. MỌI công thức toán phải đặt trong dấu $ ... $ và ký hiệu vectơ phải chính xác (\\vec{u}, \\overrightarrow{AB}).
3. Lời lẽ truyền cảm hứng, động viên học sinh tự suy nghĩ giải ra đáp số.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    throw new Error('Không thể nhận phản hồi từ AI Gia Sư lúc này.');
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Hãy kiểm tra lại định nghĩa và áp dụng công thức vào bài toán nhé!';
  return normalizeMathType(reply);
}

/**
 * AI Question Variant Generator: Clones an existing question with different numbers / parameters
 */
export async function generateVariantQuestion(baseQuestion: Question): Promise<Question> {
  const apiKey = getStoredApiKey();
  if (!apiKey) throw new Error('Vui lòng cài đặt API Key trong Cấu hình AI!');

  const model = getStoredModel();
  const prompt = `
Bạn là chuyên gia biên soạn đề thi Toán THPT (SGK Kết Nối Tri Thức Với Cuộc Sống).
Dựa trên câu hỏi gốc sau đây:
Nội dung: "${baseQuestion.content}"
Phương án: A: ${baseQuestion.options[0]} | B: ${baseQuestion.options[1]} | C: ${baseQuestion.options[2]} | D: ${baseQuestion.options[3]}
Chủ đề: "${baseQuestion.topic}" - Khối: ${baseQuestion.grade}

Nhiệm vụ: Tạo một câu hỏi MỚI TƯƠNG TỰ (cùng dạng toán, cùng mức độ tư duy nhưng thay đổi số liệu, toạ độ, hoặc dữ kiện) để học sinh luyện tập đổi số.
Mọi công thức toán học phải kẹp trong $...$. Ký hiệu vectơ: 1 chữ cái dùng \\vec{u}, \\vec{v}, \\vec{0}; 2 chữ cái dùng \\overrightarrow{AB}, \\overrightarrow{CD}.
Trả về DUY NHẤT một đối tượng JSON:
{
  "content": "Nội dung câu hỏi mới kẹp trong $...$",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Lời giải chi tiết từng bước",
  "level": "${baseQuestion.level}"
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw new Error('Lỗi khi gọi AI tạo câu hỏi biến thể.');
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let cleanJson = rawText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  const parsed = JSON.parse(cleanJson);

  return {
    id: `variant_${Date.now()}`,
    grade: baseQuestion.grade,
    chapterId: baseQuestion.chapterId,
    chapterTitle: baseQuestion.chapterTitle,
    lessonId: baseQuestion.lessonId,
    lessonTitle: baseQuestion.lessonTitle,
    topic: baseQuestion.topic,
    level: baseQuestion.level,
    content: normalizeMathType(parsed.content || ''),
    options: [
      normalizeMathType(parsed.options?.[0] || 'A'),
      normalizeMathType(parsed.options?.[1] || 'B'),
      normalizeMathType(parsed.options?.[2] || 'C'),
      normalizeMathType(parsed.options?.[3] || 'D'),
    ],
    correctAnswer: parsed.correctAnswer ?? 0,
    explanation: normalizeMathType(parsed.explanation || 'Lời giải chi tiết.'),
  };
}
