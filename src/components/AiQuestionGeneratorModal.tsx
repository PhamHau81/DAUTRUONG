import React, { useState, useMemo, useEffect } from 'react';
import { Question } from '../types/game';
import { CURRICULUM_KNTT, getChaptersByGrade, getLessonsByChapter } from '../data/curriculumKNTT';
import {
  generateQuestionsWithGemini,
  getStoredApiKey,
  getStoredModel,
} from '../utils/geminiAi';
import { MathRenderer } from './MathRenderer';
import { sound } from '../utils/audio';
import {
  X,
  Sparkles,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Key,
  Copy,
  Check,
  ChevronDown,
  Edit2,
  Trash2,
  Save,
} from 'lucide-react';

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (gameKey: string, newQuestions: Question[]) => void;
  onOpenSettings: () => void;
  initialGrade?: '10' | '11' | '12';
  initialChapterId?: string;
  initialLessonId?: string;
}

export const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
  onOpenSettings,
  initialGrade = '12',
  initialChapterId = '',
  initialLessonId = '',
}) => {
  // Curriculum Cascading Dropdowns
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12'>(initialGrade);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId);

  // Settings
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [level, setLevel] = useState<'Hỗn hợp' | 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Hỗn hợp');
  const [targetGame, setTargetGame] = useState<'all' | 'millionaire' | 'wheel' | 'racer' | 'puzzle'>('all');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentAttemptModel, setCurrentAttemptModel] = useState<string>('');
  const [attemptIndex, setAttemptIndex] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // 3 Pipeline Steps as required by AI_INSTRUCTIONS.md
  const [step1, setStep1] = useState<{ status: 'idle' | 'running' | 'success' | 'error'; label: string }>({
    status: 'idle',
    label: 'Chờ xử lý',
  });
  const [step2, setStep2] = useState<{ status: 'idle' | 'running' | 'success' | 'error'; label: string }>({
    status: 'idle',
    label: 'Chờ xử lý',
  });
  const [step3, setStep3] = useState<{ status: 'idle' | 'running' | 'success' | 'error'; label: string }>({
    status: 'idle',
    label: 'Chờ xử lý',
  });

  // Results
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Chapters & Lessons for Grade
  const chapters = useMemo(() => getChaptersByGrade(selectedGrade), [selectedGrade]);

  const currentChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) || chapters[0],
    [chapters, selectedChapterId]
  );

  const lessons = useMemo(
    () => (currentChapter ? currentChapter.lessons : []),
    [currentChapter]
  );

  const currentLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) || lessons[0],
    [lessons, selectedLessonId]
  );

  // Keep dropdowns in sync
  useEffect(() => {
    if (!chapters.some((c) => c.id === selectedChapterId) && chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (!lessons.some((l) => l.id === selectedLessonId) && lessons.length > 0) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialGrade) setSelectedGrade(initialGrade);
      if (initialChapterId) setSelectedChapterId(initialChapterId);
      if (initialLessonId) setSelectedLessonId(initialLessonId);
      setErrorMessage(null);
    }
  }, [isOpen, initialGrade, initialChapterId, initialLessonId]);

  if (!isOpen) return null;

  const hasApiKey = Boolean(getStoredApiKey());

  const handleStartGeneration = async () => {
    sound.playClick();
    if (!hasApiKey) {
      onOpenSettings();
      return;
    }

    if (!currentChapter || !currentLesson) {
      setErrorMessage('Vui lòng chọn Chương và Bài học hợp lệ!');
      return;
    }

    setIsGenerating(true);
    setIsFailed(false);
    setErrorMessage(null);
    setGeneratedQuestions([]);
    setProgressPercent(15);
    setStep1({ status: 'running', label: `Đang kết nối ${getStoredModel()}...` });
    setStep2({ status: 'idle', label: 'Chờ xử lý' });
    setStep3({ status: 'idle', label: 'Chờ xử lý' });
    setCurrentAttemptModel(getStoredModel());
    setAttemptIndex(1);

    try {
      const result = await generateQuestionsWithGemini({
        grade: selectedGrade,
        chapterId: currentChapter.id,
        chapterTitle: currentChapter.title,
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        count: questionCount,
        level,
        customNotes: customNotes.trim() || undefined,
        onModelAttempt: (model, attempt) => {
          setCurrentAttemptModel(model);
          setAttemptIndex(attempt);
          if (attempt > 1) {
            setStep1({ status: 'running', label: `Dự phòng: Đang chuyển ${model} (lần ${attempt})...` });
          }
        },
        onStepProgress: (step, status, detail) => {
          if (step === 1) {
            if (status === 'running') {
              setProgressPercent(30);
              setStep1({ status: 'running', label: detail || 'Đang kết nối...' });
            } else if (status === 'success') {
              setProgressPercent(50);
              setStep1({ status: 'success', label: detail || 'Hoàn tất' });
            }
          } else if (step === 2) {
            if (status === 'running') {
              setProgressPercent(75);
              setStep2({ status: 'running', label: detail || 'Đang tạo câu hỏi...' });
            } else if (status === 'success') {
              setProgressPercent(90);
              setStep2({ status: 'success', label: detail || 'Hoàn tất' });
            }
          } else if (step === 3) {
            if (status === 'running') {
              setProgressPercent(95);
              setStep3({ status: 'running', label: detail || 'Đang chuẩn hóa...' });
            } else if (status === 'success') {
              setProgressPercent(100);
              setStep3({ status: 'success', label: detail || 'Hoàn tất' });
            }
          }
        },
      });

      sound.playFanfare();
      setGeneratedQuestions(result.questions);
      setStep1({ status: 'success', label: `Hoàn tất (${result.usedModel})` });
      setStep2({ status: 'success', label: 'Hoàn tất' });
      setStep3({ status: 'success', label: 'Hoàn tất' });
      setProgressPercent(100);
    } catch (err: any) {
      sound.playWrong();
      setIsFailed(true);
      // Quy tắc Mục 3 trong AI_INSTRUCTIONS.md:
      // "Trạng thái các cột đang chờ phải chuyển thành "Đã dừng do lỗi", tuyệt đối không được hiện "Hoàn tất" hoặc checkmark xanh nếu quy trình bị gián đoạn."
      setStep1((prev) => (prev.status === 'success' ? prev : { status: 'error', label: 'Đã dừng do lỗi' }));
      setStep2((prev) => (prev.status === 'success' ? prev : { status: 'error', label: 'Đã dừng do lỗi' }));
      setStep3({ status: 'error', label: 'Đã dừng do lỗi' });

      const rawError = err.message || '429 RESOURCE_EXHAUSTED';
      setErrorMessage(rawError);
      if (rawError === 'CHƯA_CÓ_API_KEY') {
        onOpenSettings();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImportToGame = () => {
    if (generatedQuestions.length === 0) return;
    sound.playCorrect();

    if (targetGame === 'all') {
      ['millionaire', 'wheel', 'racer', 'puzzle'].forEach((g) => {
        onAddQuestions(g, generatedQuestions);
      });
    } else {
      onAddQuestions(targetGame, generatedQuestions);
    }

    alert(
      `Đã nạp thành công ${generatedQuestions.length} câu hỏi AI vào bài học: "${currentLesson?.title}"!`
    );
    onClose();
  };

  const handleCopyJson = () => {
    sound.playClick();
    const str = JSON.stringify(generatedQuestions, null, 2);
    navigator.clipboard.writeText(str);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDeleteQuestion = (idx: number) => {
    sound.playClick();
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 text-white rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                TẠO CÂU HỎI THEO TỪNG BÀI BẰNG A.I
                <span className="text-[11px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                  GOOGLE GEMINI
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chuẩn SGK Kết Nối Tri Thức • Chuẩn hoá công thức MathType và kí hiệu Vectơ $\vec{u}$, $\overrightarrow{AB}$ 100% không lỗi font
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              title="Đổi API Key & Chọn Model"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Cấu hình AI</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 text-xs">
          {/* Missing API Key Warning */}
          {!hasApiKey && (
            <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="font-extrabold text-sm text-white">Chưa cài đặt Gemini API Key</div>
                  <div className="text-[11px] text-amber-300/90 mt-0.5">
                    Để tạo câu hỏi tự động bằng AI, bạn cần nhập API key cá nhân (hoàn toàn miễn phí từ Google AI Studio).
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenSettings}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs hover:brightness-110 shadow-md shrink-0 cursor-pointer"
              >
                Nhập API Key Ngay
              </button>
            </div>
          )}

          {/* CASCADING DROPDOWNS: LỚP -> CHƯƠNG -> BÀI HỌC */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>1. Chọn Khối Lớp, Chương & Bài học SGK Kết Nối Tri Thức:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Grade */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Khối Lớp (THPT):</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold outline-none focus:border-purple-500"
                >
                  <option value="10">Toán Lớp 10 (KNTT)</option>
                  <option value="11">Toán Lớp 11 (KNTT)</option>
                  <option value="12">Toán Lớp 12 (KNTT)</option>
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Tên Chương:</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-amber-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-purple-500"
                >
                  {chapters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">Tên Bài Học:</label>
                <select
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-emerald-400 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-purple-500"
                >
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* GENERATION PARAMETERS */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-black text-purple-400 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>2. Tuỳ chọn cấu hình tạo đề:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Question Count */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                  Số lượng câu hỏi:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 3, 5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer border ${
                        questionCount === cnt
                          ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                  Mức độ nhận thức:
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-purple-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-purple-500"
                >
                  <option value="Hỗn hợp">⭐ Hỗn hợp (Ma trận chuẩn GDPT)</option>
                  <option value="Nhận biết">1. Nhận biết (Khái niệm, nhận dạng)</option>
                  <option value="Thông hiểu">2. Thông hiểu (Áp dụng công thức)</option>
                  <option value="Vận dụng">3. Vận dụng (Tính toán đa bước)</option>
                  <option value="Vận dụng cao">4. Vận dụng cao (Phân loại giỏi)</option>
                </select>
              </div>

              {/* Target Game */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                  Nạp vào Game Show:
                </label>
                <select
                  value={targetGame}
                  onChange={(e) => setTargetGame(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 text-blue-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-purple-500"
                >
                  <option value="all">⭐ Cả 4 Trò Chơi (Tất cả)</option>
                  <option value="millionaire">👑 Ai Là Triệu Phú</option>
                  <option value="wheel">🎡 Vòng Quay May Mắn</option>
                  <option value="racer">🏎️ Đua Xe Tốc Độ</option>
                  <option value="puzzle">🧩 Lật Mảnh Ghép</option>
                </select>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                Ghi chú hoặc yêu cầu trọng tâm cho AI (Tuỳ chọn):
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="VD: Tập trung vào tính góc giữa hai vectơ, bài toán toạ độ Oxyz, độ dài đoạn thẳng..."
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>ĐANG TẠO CÂU HỎI BẰNG {currentAttemptModel.toUpperCase()} (LẦN THỬ {attemptIndex})...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>BẮT ĐẦU TẠO {questionCount} CÂU HỎI BẰNG A.I THEO BÀI ĐÃ CHỌN</span>
                </>
              )}
            </button>

            {/* 3 Processing Columns / Steps as strictly required in AI_INSTRUCTIONS.md Section 3 */}
            {(isGenerating || isFailed || generatedQuestions.length > 0) && (
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-300">Tiến trình xử lý quy trình AI:</span>
                  <span
                    className={
                      isFailed
                        ? 'text-rose-400 font-extrabold'
                        : progressPercent === 100
                        ? 'text-emerald-400 font-extrabold'
                        : 'text-purple-400 font-extrabold'
                    }
                  >
                    {isFailed ? 'ĐÃ DỪNG DO LỖI' : `${progressPercent}%`}
                  </span>
                </div>

                {/* Progress bar: only green when successful, red when error/stopped */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFailed
                        ? 'bg-rose-600'
                        : progressPercent === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* 3 Pipeline Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
                  {/* Step 1 Column */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      step1.status === 'error'
                        ? 'bg-rose-950/40 border-rose-500/80 text-rose-300'
                        : step1.status === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                        : step1.status === 'running'
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200 animate-pulse'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">Bước 1: Kết Nối Model</span>
                      {step1.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {step1.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {step1.status === 'running' && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
                    </div>
                    <div className="text-[11px] font-bold">{step1.label}</div>
                  </div>

                  {/* Step 2 Column */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      step2.status === 'error'
                        ? 'bg-rose-950/40 border-rose-500/80 text-rose-300'
                        : step2.status === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                        : step2.status === 'running'
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200 animate-pulse'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">Bước 2: Soạn Đề KNTT</span>
                      {step2.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {step2.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {step2.status === 'running' && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
                    </div>
                    <div className="text-[11px] font-bold">{step2.label}</div>
                  </div>

                  {/* Step 3 Column */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                      step3.status === 'error'
                        ? 'bg-rose-950/40 border-rose-500/80 text-rose-300'
                        : step3.status === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                        : step3.status === 'running'
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200 animate-pulse'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">Bước 3: Chuẩn Hóa Vectơ</span>
                      {step3.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {step3.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
                      {step3.status === 'running' && <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />}
                    </div>
                    <div className="text-[11px] font-bold">{step3.label}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Verbatim Error Message Display */}
            {errorMessage && (
              <div className="p-4 bg-rose-950/80 border-2 border-rose-500 text-rose-200 rounded-2xl flex items-start gap-3 font-bold shadow-lg">
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-white text-sm font-extrabold flex items-center gap-2">
                    <span>ĐÃ DỪNG DO LỖI:</span>
                  </div>
                  <div className="text-xs text-rose-300 mt-1 font-mono p-2 bg-slate-950/60 rounded-lg border border-rose-500/40 break-all select-all">
                    {errorMessage}
                  </div>
                  <div className="text-[11px] text-rose-300/90 mt-2 flex items-center gap-2">
                    <span>Nếu lỗi 429 RESOURCE_EXHAUSTED hoặc hết quota:</span>
                    <button
                      onClick={onOpenSettings}
                      className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-black hover:bg-rose-400 cursor-pointer"
                    >
                      Đổi API Key Khác
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW OF GENERATED QUESTIONS */}
          {generatedQuestions.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm text-white">
                    Kết quả: Đã tạo {generatedQuestions.length} câu hỏi đạt chuẩn KaTeX & Vectơ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                  </button>

                  <button
                    onClick={handleImportToGame}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Nạp {generatedQuestions.length} Câu Vào Game</span>
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="flex flex-col gap-4">
                {generatedQuestions.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-3 shadow-md"
                  >
                    {/* Top line of question */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-black text-xs border border-purple-500/30">
                          Câu {qIndex + 1}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {q.level} • {q.lessonTitle}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(qIndex)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Xoá câu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Content with MathRenderer */}
                    <div className="text-sm font-bold text-white leading-relaxed pl-1">
                      <MathRenderer content={q.content} />
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      {q.options.map((opt, optIndex) => {
                        const isCorrect = q.correctAnswer === optIndex;
                        const label = ['A', 'B', 'C', 'D'][optIndex];
                        return (
                          <div
                            key={optIndex}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                isCorrect
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {label}
                            </span>
                            <div className="text-xs font-semibold leading-normal flex-1">
                              <MathRenderer content={opt} />
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] font-black uppercase text-emerald-400 shrink-0">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3 bg-slate-900/90 border border-slate-800/90 rounded-xl text-slate-400 text-xs">
                        <span className="font-bold text-amber-300">Lời giải chi tiết: </span>
                        <MathRenderer content={q.explanation} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-400 text-xs">
            Vị trí gán: <b className="text-white">{currentLesson?.title}</b> ({selectedGrade} - KNTT)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Đóng
            </button>

            {generatedQuestions.length > 0 && (
              <button
                onClick={handleImportToGame}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>NẠP VÀO TRÒ CHƠI NGAY ({generatedQuestions.length} CÂU)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
