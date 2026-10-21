import React, { useState, useMemo } from 'react';
import { Question } from '../types/game';
import { CURRICULUM_KNTT, getChaptersByGrade, getLessonsByChapter } from '../data/curriculumKNTT';
import { sampleSimilarQuestions } from '../data/sampleSimilarQuestions';
import { normalizeMathType, parseQuestionFromRawText } from '../utils/mathParser';
import { MathRenderer } from './MathRenderer';
import { sound } from '../utils/audio';
import { X, Upload, FileText, CheckCircle2, Sparkles, BookOpen, Layers, Check, AlertCircle } from 'lucide-react';

interface UploadQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestions: (gameKey: string, newQuestions: Question[]) => void;
  onOpenAiGenerator?: () => void;
  initialGrade?: '10' | '11' | '12';
  initialChapterId?: string;
  initialLessonId?: string;
}

export const UploadQuestionsModal: React.FC<UploadQuestionsModalProps> = ({
  isOpen,
  onClose,
  onAddQuestions,
  onOpenAiGenerator,
  initialGrade = '12',
  initialChapterId = '',
  initialLessonId = '',
}) => {
  // Cascading Dropdowns State
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12'>(initialGrade);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLessonId);

  // Target Game
  const [targetGame, setTargetGame] = useState<'all' | 'millionaire' | 'wheel' | 'racer' | 'puzzle'>('all');

  // Active Tab: 'paste' | 'file' | 'similar'
  const [activeTab, setActiveTab] = useState<'paste' | 'similar' | 'file'>('paste');

  // Paste / MathType inputs
  const [rawText, setRawText] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [options, setOptions] = useState<[string, string, string, string]>([
    'Phương án A',
    'Phương án B',
    'Phương án C',
    'Phương án D',
  ]);
  const [correctAnswer, setCorrectAnswer] = useState<0 | 1 | 2 | 3>(0);
  const [explanation, setExplanation] = useState('');
  const [level, setLevel] = useState<'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao'>('Thông hiểu');

  // Status message
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Available chapters for the selected grade
  const chapters = useMemo(() => getChaptersByGrade(selectedGrade), [selectedGrade]);

  // Available lessons for the selected chapter
  const currentChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId) || chapters[0],
    [chapters, selectedChapterId]
  );

  const lessons = useMemo(
    () => (currentChapter ? currentChapter.lessons : []),
    [currentChapter]
  );

  // Auto-sync chapter and lesson if invalid
  React.useEffect(() => {
    if (!chapters.some((c) => c.id === selectedChapterId) && chapters.length > 0) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  React.useEffect(() => {
    if (!lessons.some((l) => l.id === selectedLessonId) && lessons.length > 0) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  // Current selected lesson info
  const currentLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) || lessons[0],
    [lessons, selectedLessonId]
  );

  // Similar questions for currently selected lesson
  const similarList = useMemo(() => {
    if (!selectedLessonId) return [];
    return sampleSimilarQuestions[selectedLessonId] || [];
  }, [selectedLessonId]);

  if (!isOpen) return null;

  // Handle auto-parsing from MathType raw text
  const handleAutoParse = () => {
    sound.playClick();
    if (!rawText.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng dán nội dung câu hỏi trước!' });
      return;
    }

    const parsed = parseQuestionFromRawText(rawText);
    if (parsed) {
      setQuestionContent(parsed.content);
      setOptions(parsed.options);
      setCorrectAnswer(parsed.correctAnswer);
      setExplanation(parsed.explanation);
      setNotification({
        type: 'success',
        message: 'Đã phân tích và chuẩn hóa công thức MathType thành công!',
      });
    } else {
      setNotification({
        type: 'error',
        message: 'Không tìm thấy đủ 4 phương án A, B, C, D. Hãy kiểm tra định dạng!',
      });
    }
  };

  // Submit manual / parsed question
  const handleSubmitSingleQuestion = () => {
    if (!questionContent.trim()) {
      setNotification({ type: 'error', message: 'Nội dung câu hỏi không được để trống!' });
      return;
    }

    sound.playCorrect();
    const newQ: Question = {
      id: `custom_${Date.now()}`,
      grade: selectedGrade,
      chapterId: currentChapter?.id,
      chapterTitle: currentChapter?.title,
      lessonId: currentLesson?.id,
      lessonTitle: currentLesson?.title,
      topic: currentLesson ? currentLesson.title : 'Toán THPT KNTT',
      level,
      content: normalizeMathType(questionContent),
      options: [
        normalizeMathType(options[0]),
        normalizeMathType(options[1]),
        normalizeMathType(options[2]),
        normalizeMathType(options[3]),
      ],
      correctAnswer,
      explanation: normalizeMathType(explanation || 'Lời giải chi tiết theo SGK Kết Nối Tri Thức.'),
    };

    if (targetGame === 'all') {
      ['millionaire', 'wheel', 'racer', 'puzzle'].forEach((g) => {
        onAddQuestions(g, [newQ]);
      });
    } else {
      onAddQuestions(targetGame, [newQ]);
    }

    setNotification({
      type: 'success',
      message: `Đã nạp câu hỏi thành công vào Bài học: "${currentLesson?.title || ''}"!`,
    });

    // Reset form fields
    setRawText('');
    setQuestionContent('');
  };

  // Add all similar questions of the current lesson
  const handleImportSimilarQuestions = () => {
    if (similarList.length === 0) return;
    sound.playCorrect();

    if (targetGame === 'all') {
      ['millionaire', 'wheel', 'racer', 'puzzle'].forEach((g) => {
        onAddQuestions(g, similarList);
      });
    } else {
      onAddQuestions(targetGame, similarList);
    }

    setNotification({
      type: 'success',
      message: `Đã nạp ${similarList.length} câu hỏi tương tự chuẩn SGK KNTT vào hệ thống!`,
    });
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsedData = JSON.parse(text);
        const questionsToAdd: Question[] = Array.isArray(parsedData) ? parsedData : [parsedData];

        // Format and tag with selected chapter/lesson if missing
        const formatted = questionsToAdd.map((q, idx) => ({
          ...q,
          id: q.id || `uploaded_${Date.now()}_${idx}`,
          grade: q.grade || selectedGrade,
          chapterId: q.chapterId || currentChapter?.id,
          chapterTitle: q.chapterTitle || currentChapter?.title,
          lessonId: q.lessonId || currentLesson?.id,
          lessonTitle: q.lessonTitle || currentLesson?.title,
          topic: q.topic || currentLesson?.title || 'Toán THPT KNTT',
          content: normalizeMathType(q.content || ''),
          options: (q.options || ['A', 'B', 'C', 'D']).map((o: string) => normalizeMathType(o)) as [string, string, string, string],
          explanation: normalizeMathType(q.explanation || ''),
        }));

        sound.playFanfare();
        if (targetGame === 'all') {
          ['millionaire', 'wheel', 'racer', 'puzzle'].forEach((g) => {
            onAddQuestions(g, formatted);
          });
        } else {
          onAddQuestions(targetGame, formatted);
        }

        setNotification({
          type: 'success',
          message: `Tải tệp thành công! Đã nạp ${formatted.length} câu hỏi vào trò chơi!`,
        });
      } catch (err) {
        setNotification({
          type: 'error',
          message: 'Tệp JSON không đúng định dạng. Vui lòng kiểm tra lại!',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 rounded-2xl shadow-lg">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                TẢI LÊN & PHÂN LOẠI CÂU HỎI THEO BÀI HỌC
                <span className="text-[11px] bg-emerald-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">
                  SGK KẾT NỐI TRI THỨC
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động chuẩn hóa công thức MathType không lỗi font • Dropdown tự động chọn Chương & Bài
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CASCADING DROPDOWNS: KHỐI LỚP -> CHƯƠNG -> BÀI HỌC (KHÔNG CẦN NHẬP TAY) */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Phân loại câu hỏi theo Chương & Bài học SGK:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Chọn Khối Lớp */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                1. Khối Lớp (THPT):
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 text-xs font-bold outline-none focus:border-emerald-500"
              >
                <option value="10">Toán Lớp 10 (KNTT)</option>
                <option value="11">Toán Lớp 11 (KNTT)</option>
                <option value="12">Toán Lớp 12 (KNTT)</option>
              </select>
            </div>

            {/* 2. Dropdown Chương (Tự động cập nhật) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                2. Tên Chương (Dropdown tự động):
              </label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-amber-300 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-emerald-500"
              >
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Dropdown Bài học (Tự động cập nhật theo Chương) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                3. Tên Bài học (Dropdown tự động):
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-emerald-400 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-emerald-500"
              >
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Game Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Nạp vào Game Show:</span>
              <select
                value={targetGame}
                onChange={(e) => setTargetGame(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold outline-none"
              >
                <option value="all">⭐ Cả 4 Trò Chơi (Tất cả)</option>
                <option value="millionaire">👑 Ai Là Triệu Phú</option>
                <option value="wheel">🎡 Vòng Quay May Mắn</option>
                <option value="racer">🏎️ Đua Xe Tốc Độ</option>
                <option value="puzzle">🧩 Lật Mảnh Ghép</option>
              </select>
            </div>

            <div className="text-slate-400 font-semibold text-[11px]">
              Vị trí gán: <b className="text-white">{currentLesson ? currentLesson.title : ''}</b>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="px-5 pt-3 border-b border-slate-800 bg-slate-900 flex gap-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-slate-800 text-emerald-400 border-t-2 border-emerald-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" /> Dán Câu Hỏi từ Word / MathType
          </button>

          <button
            onClick={() => setActiveTab('similar')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'similar'
                ? 'bg-slate-800 text-amber-400 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Câu Hỏi Tương Tự Có Sẵn ({similarList.length})
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-slate-800 text-blue-400 border-t-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" /> Tải Lên Tệp (.JSON)
          </button>

          {onOpenAiGenerator && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onOpenAiGenerator();
              }}
              className="px-4 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-purple-300 hover:text-white bg-purple-950/40 border-t-2 border-purple-500 hover:bg-purple-900/50"
              title="Mở trình tạo câu hỏi trắc nghiệm tự động bằng AI Google Gemini"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>✨ AI Tạo Đề Theo Bài</span>
            </button>
          )}
        </div>

        {/* Notification Alert */}
        {notification && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950/40 flex flex-col gap-4">
          {/* TAB 1: PASTE WORD / MATHTYPE */}
          {activeTab === 'paste' && (
            <div className="flex flex-col gap-4">
              {/* Raw paste input */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <span>Dán câu hỏi trực tiếp từ Word hoặc MathType (hỗ trợ A., B., C., D.):</span>
                  </label>
                  <button
                    onClick={handleAutoParse}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Tự Động Phân Tích & Chuẩn Hóa
                  </button>
                </div>

                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Ví dụ định dạng dán từ Word / MathType:
Câu 1: Cho hàm số y = x^3 - 3x + 2. Giá trị cực đại của hàm số là:
A. 0
B. 2
C. 4
D. -2
Lời giải: Ta có y' = 3x^2 - 3 = 0 <=> x = +-1. Tại x = -1 thì y_CD = 4. Chọn C.`}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-emerald-500"
                />
              </div>

              {/* Form fields (Content + Options + KaTeX Live Preview) */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    Nội dung câu hỏi (sử dụng $công thức$ KaTeX/MathType):
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Mức độ:</span>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-0.5"
                    >
                      <option value="Nhận biết">Nhận biết</option>
                      <option value="Thông hiểu">Thông hiểu</option>
                      <option value="Vận dụng">Vận dụng</option>
                      <option value="Vận dụng cao">Vận dụng cao</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi (ví dụ: Tính tích phân $I = \int_0^1 (2x + 1)dx$)..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                />

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div
                      key={letter}
                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                        correctAnswer === idx
                          ? 'border-emerald-500 bg-emerald-950/20'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={correctAnswer === idx}
                        onChange={() => setCorrectAnswer(idx as any)}
                        className="accent-emerald-500 cursor-pointer"
                        title="Chọn đây là phương án đúng"
                      />
                      <span className="text-xs font-black text-slate-400">{letter}:</span>
                      <input
                        type="text"
                        value={options[idx]}
                        onChange={(e) => {
                          const next = [...options] as [string, string, string, string];
                          next[idx] = e.target.value;
                          setOptions(next);
                        }}
                        className="flex-1 bg-transparent border-none text-xs text-white outline-none"
                        placeholder={`Nội dung phương án ${letter}...`}
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1 block">
                    Lời giải sư phạm chi tiết:
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Giải thích từng bước theo SGK Kết Nối Tri Thức..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-300 outline-none"
                  />
                </div>

                {/* Live Preview (Kiểm tra hiển thị công thức MathType) */}
                {questionContent && (
                  <div className="mt-2 p-3 bg-slate-950 border border-emerald-500/30 rounded-xl flex flex-col gap-1.5">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Xem trước hiển thị (KaTeX chuẩn, 100% không lỗi font):</span>
                    </div>
                    <div className="text-white text-sm font-semibold">
                      <MathRenderer content={questionContent} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                      {options.map((opt, i) => (
                        <div
                          key={i}
                          className={`p-1.5 rounded-lg ${
                            correctAnswer === i
                              ? 'bg-emerald-900/40 text-emerald-300 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {['A', 'B', 'C', 'D'][i]}. <MathRenderer content={opt} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSubmitSingleQuestion}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> NẠP CÂU HỎI VÀO BÀI HỌC
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CÂU HỎI TƯƠNG TỰ CÓ SẴN THEO SGK KẾT NỐI TRI THỨC */}
          {activeTab === 'similar' && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Bài đang chọn: {currentLesson?.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hệ thống đã chuẩn bị sẵn các câu hỏi tương tự theo SGK Kết Nối Tri Thức.
                  </p>
                </div>

                {similarList.length > 0 && (
                  <button
                    onClick={handleImportSimilarQuestions}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Nạp Tất Cả ({similarList.length}) Vào Game
                  </button>
                )}
              </div>

              {similarList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col items-center gap-2">
                  <BookOpen className="w-8 h-8 text-slate-600" />
                  <p className="text-sm font-semibold">
                    Chưa có câu hỏi mẫu tương tự cho bài học này.
                  </p>
                  <p className="text-xs text-slate-500">
                    Bạn có thể chọn Tab "Dán câu hỏi từ Word / MathType" ở trên để nạp câu hỏi cho bài này!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {similarList.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-amber-400">
                          Câu hỏi tương tự #{idx + 1} • {q.level}
                        </span>
                        <span>{q.topic}</span>
                      </div>
                      <div className="text-white text-sm font-semibold">
                        <MathRenderer content={q.content} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border ${
                              oIdx === q.correctAnswer
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400'
                            }`}
                          >
                            {['A', 'B', 'C', 'D'][oIdx]}. <MathRenderer content={opt} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FILE UPLOAD (.JSON) */}
          {activeTab === 'file' && (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl text-center gap-4">
              <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">Tải Lên Tệp Ngân Hàng Câu Hỏi (.JSON)</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Chọn tệp chứa danh sách câu hỏi trắc nghiệm Toán KNTT. Các câu hỏi sẽ tự động được gán vào <b>{currentLesson?.title}</b>.
                </p>
              </div>

              <input
                type="file"
                accept=".json,.txt"
                onChange={handleFileUpload}
                id="fileUploadInput"
                className="hidden"
              />
              <label
                htmlFor="fileUploadInput"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> CHỌN TỆP TỪ MÁY TÍNH
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>Chuẩn chương trình SGK Toán THPT Kết Nối Tri Thức Với Cuộc Sống</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
