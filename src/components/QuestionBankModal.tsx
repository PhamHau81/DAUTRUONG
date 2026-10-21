import React, { useState, useMemo } from 'react';
import { Question } from '../types/game';
import { MathRenderer } from './MathRenderer';
import { getChaptersByGrade } from '../data/curriculumKNTT';
import { X, Plus, Edit2, Check, BookOpen, Layers, Upload, FileText, Monitor, Sparkles } from 'lucide-react';
import { exportQuestionsToWord } from '../utils/exportWord';
import { exportQuestionsToPresentation } from '../utils/exportPptx';
import { generateVariantQuestion } from '../utils/geminiAi';
import { sound } from '../utils/audio';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionsMap: {
    millionaire: Question[];
    wheel: Question[];
    racer: Question[];
    puzzle: Question[];
  };
  onUpdateQuestion: (gameKey: string, question: Question) => void;
  onAddQuestion: (gameKey: string, question: Question) => void;
  onOpenUploadModal?: () => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  questionsMap,
  onUpdateQuestion,
  onAddQuestion,
  onOpenUploadModal,
}) => {
  const [selectedGame, setSelectedGame] = useState<'millionaire' | 'wheel' | 'racer' | 'puzzle'>('millionaire');
  const [gradeFilter, setGradeFilter] = useState<'all' | '10' | '11' | '12'>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [lessonFilter, setLessonFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit draft form
  const [draftContent, setDraftContent] = useState('');
  const [draftOptions, setDraftOptions] = useState<[string, string, string, string]>(['', '', '', '']);
  const [draftCorrect, setDraftCorrect] = useState<0 | 1 | 2 | 3>(0);
  const [draftExplanation, setDraftExplanation] = useState('');
  const [draftGrade, setDraftGrade] = useState<'10' | '11' | '12'>('12');
  const [draftChapterId, setDraftChapterId] = useState<string>('');
  const [draftLessonId, setDraftLessonId] = useState<string>('');

  // Chapters for filtering
  const filterChapters = useMemo(() => {
    if (gradeFilter === 'all') return [];
    return getChaptersByGrade(gradeFilter);
  }, [gradeFilter]);

  const filterLessons = useMemo(() => {
    if (chapterFilter === 'all') return [];
    const found = filterChapters.find((c) => c.id === chapterFilter);
    return found ? found.lessons : [];
  }, [filterChapters, chapterFilter]);

  // Chapters for edit draft
  const draftChapters = useMemo(() => getChaptersByGrade(draftGrade), [draftGrade]);
  const draftLessons = useMemo(() => {
    const found = draftChapters.find((c) => c.id === draftChapterId);
    return found ? found.lessons : (draftChapters[0]?.lessons || []);
  }, [draftChapters, draftChapterId]);

  if (!isOpen) return null;

  const currentList = questionsMap[selectedGame] || [];
  const filteredList = currentList.filter((q) => {
    if (gradeFilter !== 'all' && q.grade !== gradeFilter) return false;
    if (chapterFilter !== 'all' && q.chapterId !== chapterFilter) return false;
    if (lessonFilter !== 'all' && q.lessonId !== lessonFilter) return false;
    return true;
  });

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setDraftContent(q.content);
    setDraftOptions([...q.options] as [string, string, string, string]);
    setDraftCorrect(q.correctAnswer);
    setDraftExplanation(q.explanation);
    setDraftGrade(q.grade);

    const chaps = getChaptersByGrade(q.grade);
    const chapId = q.chapterId || chaps[0]?.id || '';
    setDraftChapterId(chapId);
    const less = chaps.find((c) => c.id === chapId)?.lessons || [];
    setDraftLessonId(q.lessonId || less[0]?.id || '');
  };

  const saveEdit = (id: string) => {
    const chap = draftChapters.find((c) => c.id === draftChapterId) || draftChapters[0];
    const less = chap?.lessons.find((l) => l.id === draftLessonId) || chap?.lessons[0];

    const updated: Question = {
      id,
      grade: draftGrade,
      chapterId: chap?.id,
      chapterTitle: chap?.title,
      lessonId: less?.id,
      lessonTitle: less?.title,
      topic: less?.title || 'Toán THPT KNTT',
      level: 'Thông hiểu',
      content: draftContent,
      options: draftOptions,
      correctAnswer: draftCorrect,
      explanation: draftExplanation,
    };
    onUpdateQuestion(selectedGame, updated);
    setEditingId(null);
  };

  const handleAddNew = () => {
    const defaultGrade: '10' | '11' | '12' = gradeFilter === 'all' ? '12' : gradeFilter;
    const chaps = getChaptersByGrade(defaultGrade);
    const firstChap = chaps[0];
    const firstLess = firstChap?.lessons[0];

    const newQ: Question = {
      id: `${selectedGame}_${Date.now()}`,
      grade: defaultGrade,
      chapterId: firstChap?.id,
      chapterTitle: firstChap?.title,
      lessonId: firstLess?.id,
      lessonTitle: firstLess?.title,
      topic: firstLess?.title || 'Bài tập mới KNTT',
      level: 'Thông hiểu',
      content: 'Nhập nội dung câu hỏi mới với công thức LaTeX $x^2 + 1 = 0$...',
      options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
      correctAnswer: 0,
      explanation: 'Lời giải chi tiết theo SGK Kết Nối Tri Thức...',
    };
    onAddQuestion(selectedGame, newQ);
    startEdit(newQ);
  };

  const [generatingVariantId, setGeneratingVariantId] = useState<string | null>(null);

  const handleCreateVariant = async (q: Question) => {
    sound.playClick();
    setGeneratingVariantId(q.id);
    try {
      const variant = await generateVariantQuestion(q);
      sound.playFanfare();
      onAddQuestion(selectedGame, variant);
      alert(`Đã tạo thành công câu hỏi biến thể đổi số cho bài: "${q.lessonTitle || q.topic}"!`);
    } catch (err: any) {
      sound.playWrong();
      alert(err.message || 'Không thể tạo biến thể lúc này. Vui lòng kiểm tra lại API Key.');
    } finally {
      setGeneratingVariantId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                NGÂN HÀNG CÂU HỎI TOÁN THPT (KNTT)
                <span className="text-xs bg-blue-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                  {currentList.length} CÂU
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Phân loại theo từng Chương và Bài học SGK Kết Nối Tri Thức • Chuẩn KaTeX 100% không lỗi font
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenUploadModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUploadModal();
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105"
              >
                <Upload className="w-4 h-4" /> Tải Lên / MathType
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Game Selector Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {[
              { key: 'millionaire', label: '👑 Ai Là Triệu Phú' },
              { key: 'wheel', label: '🎡 Vòng Quay May Mắn' },
              { key: 'racer', label: '🏎️ Đua Xe Tốc Độ' },
              { key: 'puzzle', label: '🧩 Lật Mảnh Ghép' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setSelectedGame(tab.key as any);
                  setEditingId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedGame === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                sound.playFanfare();
                exportQuestionsToWord(
                  filteredList,
                  `ĐỀ KIỂM TRA MÔN TOÁN THPT`,
                  gradeFilter === 'all' ? '12' : gradeFilter,
                  lessonFilter !== 'all'
                    ? filterLessons.find((l) => l.id === lessonFilter)?.title
                    : chapterFilter !== 'all'
                    ? filterChapters.find((c) => c.id === chapterFilter)?.title
                    : undefined
                );
              }}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Xuất bộ câu hỏi ra file Word (.doc) chuẩn mẫu Bộ GD&ĐT (đề bài, bảng đáp án, lời giải)"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-300" />
              <span>Xuất Đề Word (.doc)</span>
            </button>

            <button
              onClick={() => {
                sound.playFanfare();
                exportQuestionsToPresentation(
                  filteredList,
                  `BÀI GIẢNG TRÌNH CHIẾU TOÁN HỌC`,
                  gradeFilter === 'all' ? '12' : gradeFilter,
                  lessonFilter !== 'all'
                    ? filterLessons.find((l) => l.id === lessonFilter)?.title
                    : chapterFilter !== 'all'
                    ? filterChapters.find((c) => c.id === chapterFilter)?.title
                    : undefined
                );
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Xuất slide trình chiếu toàn màn hình để chiếu trên máy chiếu lớp học"
            >
              <Monitor className="w-3.5 h-3.5 text-amber-200" />
              <span>Xuất Slide Chiếu</span>
            </button>

            <button
              onClick={handleAddNew}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Thêm Câu Mới
            </button>
          </div>
        </div>

        {/* CASCADING FILTER DROPDOWNS: LỚP -> CHƯƠNG -> BÀI */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/70 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          {/* Lớp */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">Lọc theo Khối Lớp:</label>
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value as any);
                setChapterFilter('all');
                setLessonFilter('all');
              }}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="all">⭐ Tất cả Khối Lớp</option>
              <option value="10">Toán Lớp 10 (KNTT)</option>
              <option value="11">Toán Lớp 11 (KNTT)</option>
              <option value="12">Toán Lớp 12 (KNTT)</option>
            </select>
          </div>

          {/* Chương */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">Lọc theo Chương (Dropdown):</label>
            <select
              value={chapterFilter}
              onChange={(e) => {
                setChapterFilter(e.target.value);
                setLessonFilter('all');
              }}
              disabled={gradeFilter === 'all'}
              className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                gradeFilter === 'all'
                  ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 text-amber-300'
              }`}
            >
              <option value="all">-- Tất cả Chương --</option>
              {filterChapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Bài */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">Lọc theo Bài học (Dropdown):</label>
            <select
              value={lessonFilter}
              onChange={(e) => setLessonFilter(e.target.value)}
              disabled={chapterFilter === 'all' || gradeFilter === 'all'}
              className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                chapterFilter === 'all' || gradeFilter === 'all'
                  ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 border-slate-700 text-emerald-300'
              }`}
            >
              <option value="all">-- Tất cả Bài học --</option>
              {filterLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-950/40">
          {filteredList.map((q, index) => {
            const isEditing = editingId === q.id;

            if (isEditing) {
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border-2 border-blue-500/80 rounded-2xl p-5 flex flex-col gap-4 shadow-xl"
                >
                  <div className="flex flex-wrap items-center justify-between text-xs font-bold text-blue-400 gap-2">
                    <span>Đang chỉnh sửa câu hỏi #{index + 1}</span>

                    {/* Cascading Dropdowns in Edit mode */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={draftGrade}
                        onChange={(e) => {
                          const g = e.target.value as any;
                          setDraftGrade(g);
                          const chaps = getChaptersByGrade(g);
                          setDraftChapterId(chaps[0]?.id || '');
                          setDraftLessonId(chaps[0]?.lessons[0]?.id || '');
                        }}
                        className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg text-xs font-bold"
                      >
                        <option value="10">Lớp 10</option>
                        <option value="11">Lớp 11</option>
                        <option value="12">Lớp 12</option>
                      </select>

                      <select
                        value={draftChapterId}
                        onChange={(e) => {
                          setDraftChapterId(e.target.value);
                          const chap = draftChapters.find((c) => c.id === e.target.value);
                          setDraftLessonId(chap?.lessons[0]?.id || '');
                        }}
                        className="bg-slate-800 text-amber-300 border border-slate-700 px-2 py-1 rounded-lg text-xs font-bold max-w-xs"
                      >
                        {draftChapters.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>

                      <select
                        value={draftLessonId}
                        onChange={(e) => setDraftLessonId(e.target.value)}
                        className="bg-slate-800 text-emerald-300 border border-slate-700 px-2 py-1 rounded-lg text-xs font-bold max-w-xs"
                      >
                        {draftLessons.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">
                      Nội dung câu hỏi (hỗ trợ $công thức$ LaTeX/MathType):
                    </label>
                    <textarea
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none font-mono"
                    />
                    <div className="mt-1 text-xs text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                      <b>Xem trước:</b> <MathRenderer content={draftContent} />
                    </div>
                  </div>

                  {/* 4 Options editor */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={letter} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct_${q.id}`}
                          checked={draftCorrect === optIdx}
                          onChange={() => setDraftCorrect(optIdx as any)}
                          className="accent-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-bold text-slate-400 text-xs">{letter}:</span>
                        <input
                          type="text"
                          value={draftOptions[optIdx]}
                          onChange={(e) => {
                            const newOpts = [...draftOptions] as [string, string, string, string];
                            newOpts[optIdx] = e.target.value;
                            setDraftOptions(newOpts);
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">
                      Lời giải chi tiết:
                    </label>
                    <textarea
                      value={draftExplanation}
                      onChange={(e) => setDraftExplanation(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 text-xs outline-none font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => saveEdit(q.id)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" /> Lưu Câu Hỏi
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={q.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col gap-3 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-blue-300 text-xs font-bold border border-blue-600/30">
                      Câu {index + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Lớp {q.grade}
                    </span>
                    {q.chapterTitle && (
                      <span className="text-xs text-amber-400 font-semibold">
                        • {q.chapterTitle}
                      </span>
                    )}
                    {q.lessonTitle && (
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {q.lessonTitle}
                      </span>
                    )}
                    <span className="text-xs text-cyan-400 font-bold">[{q.level}]</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCreateVariant(q)}
                      disabled={generatingVariantId === q.id}
                      className="p-1.5 px-2 bg-purple-950/60 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer border border-purple-500/40"
                      title="AI tạo câu hỏi tương tự cùng dạng toán nhưng đổi số liệu"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${generatingVariantId === q.id ? 'animate-spin' : ''}`} />
                      <span>{generatingVariantId === q.id ? 'Đang tạo...' : 'AI Đổi Số'}</span>
                    </button>

                    <button
                      onClick={() => startEdit(q)}
                      className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Sửa
                    </button>
                  </div>
                </div>

                <div className="text-white font-semibold text-sm leading-relaxed">
                  <MathRenderer content={q.content} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2 rounded-lg border ${
                        oIdx === q.correctAnswer
                          ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold mr-1">
                        {['A', 'B', 'C', 'D'][oIdx]}.
                      </span>
                      <MathRenderer content={opt} />
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-emerald-400 font-bold">Giải thích: </span>
                  <MathRenderer content={q.explanation} />
                </div>
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
              <BookOpen className="w-10 h-10 text-slate-700" />
              <p className="text-sm font-semibold">Chưa có câu hỏi nào theo bộ lọc này.</p>
              <button
                onClick={handleAddNew}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                + Thêm Câu Hỏi Mới Cho Bài Này
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
          <span>Tổng số: {filteredList.length} câu hỏi hiển thị</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
          >
            Đóng Bảng Quản Lý
          </button>
        </div>
      </div>
    </div>
  );
};
