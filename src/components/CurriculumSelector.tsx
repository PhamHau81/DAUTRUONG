import React, { useMemo } from 'react';
import { CURRICULUM_KNTT, getChaptersByGrade, getLessonsByChapter } from '../data/curriculumKNTT';
import { GraduationCap, BookOpen, Layers, PlusCircle, CheckCircle, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface CurriculumSelectorProps {
  selectedGrade: 'all' | '10' | '11' | '12';
  onChangeGrade: (grade: 'all' | '10' | '11' | '12') => void;
  selectedChapterId: string;
  onChangeChapter: (chapterId: string) => void;
  selectedLessonId: string;
  onChangeLesson: (lessonId: string) => void;
  onOpenUploadModal: () => void;
  onOpenAiGenerator?: () => void;
  questionCount?: number;
}

export const CurriculumSelector: React.FC<CurriculumSelectorProps> = ({
  selectedGrade,
  onChangeGrade,
  selectedChapterId,
  onChangeChapter,
  selectedLessonId,
  onChangeLesson,
  onOpenUploadModal,
  onOpenAiGenerator,
  questionCount,
}) => {
  // If 'all', fallback to '12' for chapter list preview or empty
  const activeGrade = selectedGrade === 'all' ? '12' : selectedGrade;
  const chapters = useMemo(() => getChaptersByGrade(activeGrade), [activeGrade]);

  const currentChapter = useMemo(
    () => chapters.find((c) => c.id === selectedChapterId),
    [chapters, selectedChapterId]
  );

  const lessons = useMemo(
    () => (currentChapter ? currentChapter.lessons : []),
    [currentChapter]
  );

  const currentLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId),
    [lessons, selectedLessonId]
  );

  const handleGradeChange = (newGrade: 'all' | '10' | '11' | '12') => {
    sound.playClick();
    onChangeGrade(newGrade);
    onChangeChapter('all');
    onChangeLesson('all');
  };

  const handleChapterChange = (newChapId: string) => {
    sound.playClick();
    onChangeChapter(newChapId);
    onChangeLesson('all');
  };

  const handleLessonChange = (newLessonId: string) => {
    sound.playClick();
    onChangeLesson(newLessonId);
  };

  const handleResetFilter = () => {
    sound.playClick();
    onChangeGrade('all');
    onChangeChapter('all');
    onChangeLesson('all');
  };

  return (
    <div className="w-full bg-slate-900/90 border-2 border-indigo-500/30 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
      {/* Top Title & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
              LỰA CHỌN BÀI HỌC THEO SGK KẾT NỐI TRI THỨC VỚI CUỘC SỐNG
              <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                HỌC SINH KHÔNG CẦN GÕ TAY
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Chỉ cần bấm chọn Khối lớp, Chương và Bài học từ danh mục chuẩn bên dưới
            </p>
          </div>
        </div>

        {/* Upload & AI buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiGenerator && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAiGenerator();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Tự động tạo câu hỏi trắc nghiệm chuẩn SGK cho bài học này bằng AI Google Gemini"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>✨ AI TẠO ĐỀ THEO BÀI NÀY</span>
            </button>
          )}

          <button
            onClick={onOpenUploadModal}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Tải lên hoặc dán câu hỏi từ Word / MathType chuẩn hóa không lỗi font"
          >
            <PlusCircle className="w-4 h-4" />
            <span>TẢI LÊN / MẪU CÓ SẴN</span>
          </button>

          {(selectedGrade !== 'all' || selectedChapterId !== 'all' || selectedLessonId !== 'all') && (
            <button
              onClick={handleResetFilter}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
              title="Đặt lại xem tất cả bài học"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xem Tất Cả</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Cascading Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Dropdown 1: Khối Lớp */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>1. Chọn Khối Lớp:</span>
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => handleGradeChange(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 hover:border-blue-500 text-white font-bold rounded-xl px-3 py-2 text-xs md:text-sm outline-none transition-colors cursor-pointer"
          >
            <option value="all">⭐ Tất Cả Khối Lớp (Tổng hợp 10, 11, 12)</option>
            <option value="10">📘 Toán Lớp 10 (Kết Nối Tri Thức)</option>
            <option value="11">📙 Toán Lớp 11 (Kết Nối Tri Thức)</option>
            <option value="12">📕 Toán Lớp 12 (Kết Nối Tri Thức)</option>
          </select>
        </div>

        {/* Dropdown 2: Tên Chương (Dropdown tự động) */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>2. Tên Chương (Dropdown tự động):</span>
          </label>
          <select
            value={selectedChapterId}
            onChange={(e) => handleChapterChange(e.target.value)}
            disabled={selectedGrade === 'all'}
            className={`w-full border rounded-xl px-3 py-2 text-xs md:text-sm font-bold outline-none transition-colors cursor-pointer ${
              selectedGrade === 'all'
                ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-950 border-slate-700 hover:border-amber-500 text-amber-300'
            }`}
          >
            <option value="all">-- Chọn Tất Cả Chương trong Khối --</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Tên Bài Học (Dropdown tự động) */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-extrabold text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. Tên Bài Học (Dropdown tự động):</span>
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => handleLessonChange(e.target.value)}
            disabled={selectedChapterId === 'all' || selectedGrade === 'all'}
            className={`w-full border rounded-xl px-3 py-2 text-xs md:text-sm font-bold outline-none transition-colors cursor-pointer ${
              selectedChapterId === 'all' || selectedGrade === 'all'
                ? 'bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-950 border-slate-700 hover:border-emerald-500 text-emerald-300'
            }`}
          >
            <option value="all">-- Chọn Tất Cả Bài Học trong Chương --</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="font-bold text-slate-400">Trạng thái lọc:</span>
          {selectedGrade === 'all' ? (
            <span className="bg-blue-950/60 border border-blue-500/40 text-blue-300 px-2.5 py-0.5 rounded-lg font-bold">
              Tất cả các chương và bài học THPT
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 font-bold">
              <span className="bg-blue-900/60 text-blue-300 px-2 py-0.5 rounded-md">
                Lớp {selectedGrade}
              </span>
              {currentChapter && (
                <span className="bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-md">
                  {currentChapter.title}
                </span>
              )}
              {currentLesson && (
                <span className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-md">
                  {currentLesson.title}
                </span>
              )}
            </div>
          )}
        </div>

        {questionCount !== undefined && (
          <div className="text-slate-400 font-semibold text-[11px] bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            Số câu hỏi phù hợp: <b className="text-amber-400">{questionCount}</b> câu
          </div>
        )}
      </div>
    </div>
  );
};
