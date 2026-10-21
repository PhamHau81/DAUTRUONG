import React, { useState, useMemo } from 'react';
import { GameId, Question } from './types/game';
import { allInitialQuestions } from './data/questions';
import { sound } from './utils/audio';
import { downloadStandaloneHtmlFile } from './utils/exportHtml';
import { MillionaireGame } from './components/games/MillionaireGame';
import { LuckyWheelGame } from './components/games/LuckyWheelGame';
import { SpeedRacerGame } from './components/games/SpeedRacerGame';
import { PuzzleTreasureGame } from './components/games/PuzzleTreasureGame';
import { TeacherToolbar } from './components/TeacherToolbar';
import { QuestionBankModal } from './components/QuestionBankModal';
import { UploadQuestionsModal } from './components/UploadQuestionsModal';
import { CurriculumSelector } from './components/CurriculumSelector';
import { AiQuestionGeneratorModal } from './components/AiQuestionGeneratorModal';
import { AiSettingsModal } from './components/AiSettingsModal';
import { VectorMathVisualizer } from './components/VectorMathVisualizer';
import { exportQuestionsToWord } from './utils/exportWord';
import { exportQuestionsToPresentation } from './utils/exportPptx';
import { getStoredApiKey } from './utils/geminiAi';
import { Sparkles, ChevronRight, Download, BookOpen, Layers, FileText, Monitor, Compass } from 'lucide-react';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [projectorMode, setProjectorMode] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);

  // Curriculum Filter State: Grade -> Chapter -> Lesson
  const [selectedGrade, setSelectedGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all');

  // AI Modal Preselected state
  const [aiGrade, setAiGrade] = useState<'10' | '11' | '12'>('12');
  const [aiChapterId, setAiChapterId] = useState<string>('');
  const [aiLessonId, setAiLessonId] = useState<string>('');

  // Check if API key exists on initial launch; if not, open Settings modal as required by AI_INSTRUCTIONS.md
  useEffect(() => {
    const key = getStoredApiKey();
    if (!key) {
      setIsAiSettingsOpen(true);
    }
  }, []);

  const handleOpenAiGenerator = (grade?: '10' | '11' | '12', chapId?: string, lessId?: string) => {
    sound.playClick();
    setAiGrade(grade || (selectedGrade === 'all' ? '12' : selectedGrade));
    setAiChapterId(chapId || (selectedChapterId === 'all' ? '' : selectedChapterId));
    setAiLessonId(lessId || (selectedLessonId === 'all' ? '' : selectedLessonId));
    setIsAiGeneratorOpen(true);
  };

  // Question State (mutable by teacher / student upload)
  const [questionsMap, setQuestionsMap] = useState({
    millionaire: allInitialQuestions.millionaire,
    wheel: allInitialQuestions.wheel,
    racer: allInitialQuestions.racer,
    puzzle: allInitialQuestions.puzzle,
  });

  const handleUpdateQuestion = (gameKey: string, updated: Question) => {
    setQuestionsMap((prev) => ({
      ...prev,
      [gameKey]: prev[gameKey as keyof typeof prev].map((q) =>
        q.id === updated.id ? updated : q
      ),
    }));
  };

  const handleAddQuestion = (gameKey: string, newQ: Question) => {
    setQuestionsMap((prev) => ({
      ...prev,
      [gameKey]: [newQ, ...prev[gameKey as keyof typeof prev]],
    }));
  };

  const handleAddMultipleQuestions = (gameKey: string, newQuestions: Question[]) => {
    setQuestionsMap((prev) => ({
      ...prev,
      [gameKey]: [...newQuestions, ...prev[gameKey as keyof typeof prev]],
    }));
  };

  const handleDownloadOfflineHtml = () => {
    sound.playFanfare();
    downloadStandaloneHtmlFile(questionsMap);
  };

  // Current filtered question list for Word / Slide export
  const getExportQuestionsList = (): Question[] => {
    const all = [
      ...questionsMap.millionaire,
      ...questionsMap.wheel,
      ...questionsMap.racer,
      ...questionsMap.puzzle,
    ];
    // Deduplicate by id
    const uniqueMap = new Map<string, Question>();
    all.forEach((q) => {
      if (!uniqueMap.has(q.id)) {
        if (selectedGrade !== 'all' && q.grade !== selectedGrade) return;
        if (selectedChapterId !== 'all' && q.chapterId !== selectedChapterId) return;
        if (selectedLessonId !== 'all' && q.lessonId !== selectedLessonId) return;
        uniqueMap.set(q.id, q);
      }
    });
    const list = Array.from(uniqueMap.values());
    return list.length > 0 ? list : questionsMap.millionaire;
  };

  const handleExportWord = () => {
    sound.playFanfare();
    const list = getExportQuestionsList();
    exportQuestionsToWord(
      list,
      'ĐỀ KIỂM TRA MÔN TOÁN THPT (KNTT)',
      selectedGrade === 'all' ? '12' : selectedGrade
    );
  };

  const handleExportPresentation = () => {
    sound.playFanfare();
    const list = getExportQuestionsList();
    exportQuestionsToPresentation(
      list,
      'BÀI GIẢNG TRÌNH CHIẾU TOÁN HỌC THPT',
      selectedGrade === 'all' ? '12' : selectedGrade
    );
  };

  const handleSelectGame = (gameId: GameId) => {
    sound.playClick();
    setActiveGame(gameId);
  };

  const handleBackToHub = () => {
    sound.playClick();
    setActiveGame(null);
  };

  // Filter questions for active game based on Grade -> Chapter -> Lesson
  const getActiveQuestions = (gameId: GameId): Question[] => {
    const list = questionsMap[gameId] || [];

    // Filter by grade, chapter, lesson
    let filtered = list;
    if (selectedGrade !== 'all') {
      filtered = filtered.filter((q) => q.grade === selectedGrade);
    }
    if (selectedChapterId !== 'all') {
      filtered = filtered.filter((q) => q.chapterId === selectedChapterId);
    }
    if (selectedLessonId !== 'all') {
      filtered = filtered.filter((q) => q.lessonId === selectedLessonId);
    }

    // If filtered list has enough questions, return it
    if (filtered.length >= 10) return filtered;

    // If filtered list is small (e.g. 1-2 questions uploaded for a single lesson),
    // pad with other questions from the same grade or bank so 15-question games like Millionaire always work!
    if (filtered.length > 0) {
      const remainingNeeded = Math.max(0, 15 - filtered.length);
      const padding = list.filter((q) => !filtered.some((f) => f.id === q.id)).slice(0, remainingNeeded);
      return [...filtered, ...padding];
    }

    return list;
  };

  // Total matching questions across all banks for the active filter
  const totalFilteredCount = useMemo(() => {
    const all = [
      ...questionsMap.millionaire,
      ...questionsMap.wheel,
      ...questionsMap.racer,
      ...questionsMap.puzzle,
    ];
    return all.filter((q) => {
      if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;
      if (selectedChapterId !== 'all' && q.chapterId !== selectedChapterId) return false;
      if (selectedLessonId !== 'all' && q.lessonId !== selectedLessonId) return false;
      return true;
    }).length;
  }, [questionsMap, selectedGrade, selectedChapterId, selectedLessonId]);

  return (
    <div
      className={`min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col font-sans transition-all duration-300 ${
        projectorMode ? 'text-lg brightness-110 contrast-105' : ''
      }`}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div
            onClick={handleBackToHub}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              📐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg md:text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  ĐẤU TRƯỜNG TOÁN HỌC THPT
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                  GDPT 2018
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/40 shadow-sm">
                  Tác giả: PHẠM HẬU
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  • Sách Kết Nối Tri Thức Với Cuộc Sống (Lớp 10, 11, 12)
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Fast Action Bar */}
          <TeacherToolbar
            projectorMode={projectorMode}
            onToggleProjector={() => setProjectorMode((prev) => !prev)}
            onOpenQuestionBank={() => setIsQuestionBankOpen(true)}
            onDownloadOfflineHtml={handleDownloadOfflineHtml}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenAiGenerator={() => handleOpenAiGenerator()}
            onOpenAiSettings={() => setIsAiSettingsOpen(true)}
            onOpenVectorVisualizer={() => setIsVisualizerOpen(true)}
            onExportWord={handleExportWord}
            onExportPresentation={handleExportPresentation}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col items-center">
        {activeGame === 'millionaire' && (
          <MillionaireGame
            questions={getActiveQuestions('millionaire')}
            onBackToHub={handleBackToHub}
            projectorMode={projectorMode}
          />
        )}

        {activeGame === 'wheel' && (
          <LuckyWheelGame
            questions={getActiveQuestions('wheel')}
            onBackToHub={handleBackToHub}
            projectorMode={projectorMode}
          />
        )}

        {activeGame === 'racer' && (
          <SpeedRacerGame
            questions={getActiveQuestions('racer')}
            onBackToHub={handleBackToHub}
            projectorMode={projectorMode}
          />
        )}

        {activeGame === 'puzzle' && (
          <PuzzleTreasureGame
            questions={getActiveQuestions('puzzle')}
            onBackToHub={handleBackToHub}
            projectorMode={projectorMode}
          />
        )}

        {activeGame === null && (
          /* HUB HOME SCREEN */
          <div className="w-full flex flex-col gap-8 items-center animate-fadeIn">
            {/* Hero Welcome */}
            <div className="text-center max-w-3xl flex flex-col items-center gap-3 mt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Hệ Thống Trò Chơi Giáo Dục Tương Tác Chuẩn GDPT 2018
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                4 GAME SHOW TOÁN HỌC ĐỈNH CAO
              </h2>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-black shadow-sm">
                🎓 Tác giả & Biên soạn: Thầy PHẠM HẬU
              </div>

              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Thiết kế chuyên sâu cho Giáo viên & Học sinh Toán THPT theo <b>SGK Kết Nối Tri Thức Với Cuộc Sống</b>. Phân loại bài tập chi tiết theo từng Chương, từng Bài học, hỗ trợ tải lên câu hỏi tương tự MathType không lỗi font.
              </p>
            </div>

            {/* CASCADING CURRICULUM SELECTOR (DROPDOWN CHƯƠNG, BÀI ĐỂ HỌC SINH KHÔNG PHẢI GÕ TAY) */}
            <div className="w-full max-w-5xl">
              <CurriculumSelector
                selectedGrade={selectedGrade}
                onChangeGrade={setSelectedGrade}
                selectedChapterId={selectedChapterId}
                onChangeChapter={setSelectedChapterId}
                selectedLessonId={selectedLessonId}
                onChangeLesson={setSelectedLessonId}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                onOpenAiGenerator={() => handleOpenAiGenerator()}
                questionCount={totalFilteredCount}
              />
            </div>

            {/* 4 Games Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Card 1: Millionaire */}
              <div
                onClick={() => handleSelectGame('millionaire')}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none"></div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30 mb-5 group-hover:scale-110 transition-transform">
                    👑
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                    Game Show Đỉnh Cao
                  </span>
                  <h3 className="text-xl font-black text-white mt-3 mb-2 group-hover:text-amber-400 transition-colors">
                    Ai Là Triệu Phú
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Thang giải thưởng 15 câu leo núi tri thức theo bài học đã chọn với 3 quyền trợ giúp 50:50, Khán giả và Gọi điện.
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>15 câu hỏi bám sát bài học KNTT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Mốc an toàn câu 5 & câu 10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span>Âm thanh kịch tính suspense</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                  <span>BẮT ĐẦU CHƠI NGAY</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 2: Lucky Wheel */}
              <div
                onClick={() => handleSelectGame('wheel')}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30 mb-5 group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    May Mắn & Đấu Đội
                  </span>
                  <h3 className="text-xl font-black text-white mt-3 mb-2 group-hover:text-emerald-400 transition-colors">
                    Vòng Quay May Mắn
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Bánh xe vật lý quay ngẫu nhiên điểm số, mở Hộp Quà Bí Ẩn và thi đấu câu hỏi theo chương bài KNTT.
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Vòng quay Canvas vật lý siêu mượt</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Mở 3 Hộp Quà Bí Ẩn thưởng lớn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Bảng điểm Đội Đỏ, Xanh, Vàng</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                  <span>BẮT ĐẦU CHƠI NGAY</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3: Speed Racer */}
              <div
                onClick={() => handleSelectGame('racer')}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none"></div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/30 mb-5 group-hover:scale-110 transition-transform">
                    🏎️
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    Tốc Độ & Phản Xạ
                  </span>
                  <h3 className="text-xl font-black text-white mt-3 mb-2 group-hover:text-rose-400 transition-colors">
                    Đua Xe Tốc Độ
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Đua xe thể thao Grand Prix, giải toán thần tốc nạp Nitro bứt phá vượt qua chướng ngại vật về đích.
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Đường đua chuyển động thời gian thực</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Nitro boost tăng tốc lên 240 km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      <span>Âm thanh động cơ gầm rú sôi động</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                  <span>BẮT ĐẦU CHƠI NGAY</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 4: Puzzle Treasure */}
              <div
                onClick={() => handleSelectGame('puzzle')}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none"></div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/30 mb-5 group-hover:scale-110 transition-transform">
                    🧩
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Khám Phá Bí Ẩn
                  </span>
                  <h3 className="text-xl font-black text-white mt-3 mb-2 group-hover:text-indigo-400 transition-colors">
                    Lật Mảnh Ghép
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Lật mở lưới 16 ô bí mật hé lộ bức tranh chân dung và định lý Toán học vĩ đại đằng sau.
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span>Lưới 4x4 với 16 mảnh ghép tương tác</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span>Chức năng Đoán Chủ Đề (+1000đ)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span>Khám phá chân dung Pythagoras</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 group-hover:shadow-lg transition-all">
                  <span>BẮT ĐẦU CHƠI NGAY</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Teacher Standalone Banner & Tools Grid */}
            <div className="w-full max-w-5xl flex flex-col gap-4 mt-4">
              {/* Export to Word / Slide / Visualizer Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <button
                  onClick={handleExportWord}
                  className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-blue-500/30 hover:border-blue-400 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group text-left"
                >
                  <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      XUẤT ĐỀ THI WORD (.DOC)
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Có tiêu đề trường lớp, đề bài, bảng đáp án & giải chi tiết.
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleExportPresentation}
                  className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group text-left"
                >
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      XUẤT SLIDE TRÌNH CHIẾU
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Chiếu toàn màn hình, chuyển slide phím mũi tên & phím cách.
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setIsVisualizerOpen(true)}
                  className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400 rounded-2xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group text-left"
                >
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      MÔ PHỎNG VECTƠ 2D/3D
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Vẽ toạ độ Oxy, Oxyz, quy tắc 3 điểm & hình bình hành.
                    </p>
                  </div>
                </button>
              </div>

              {/* Teacher Standalone Banner */}
              <div className="w-full bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-500/40">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                      XUẤT BẢN FILE HTML CHẠY OFFLINE 100%
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        KHÔNG CẦN INTERNET
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      Tải về máy 01 file <code>.html</code> duy nhất chứa trọn vẹn cả 4 game show, 60 câu hỏi Toán KNTT, bộ lọc Chương - Bài học và âm thanh Web Audio để mang đi dạy tại mọi lớp học.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadOfflineHtml}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>TẢI FILE OFFLINE NGAY</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>
          Ứng dụng Game Show Giáo Dục Toán Học THPT (GDPT 2018 - Kết Nối Tri Thức Với Cuộc Sống).
        </p>
        <p className="mt-1 text-slate-400">
          Tác giả: <span className="font-bold text-amber-300">Thầy PHẠM HẬU</span> • Tương thích Máy chiếu, Bảng tương tác thông minh, Máy tính & Điện thoại.
        </p>
      </footer>

      {/* Question Bank Modal */}
      <QuestionBankModal
        isOpen={isQuestionBankOpen}
        onClose={() => setIsQuestionBankOpen(false)}
        questionsMap={questionsMap}
        onUpdateQuestion={handleUpdateQuestion}
        onAddQuestion={handleAddQuestion}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Upload & MathType Question Modal */}
      <UploadQuestionsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddQuestions={handleAddMultipleQuestions}
        onOpenAiGenerator={() => handleOpenAiGenerator()}
        initialGrade={selectedGrade === 'all' ? '12' : selectedGrade}
        initialChapterId={selectedChapterId === 'all' ? '' : selectedChapterId}
        initialLessonId={selectedLessonId === 'all' ? '' : selectedLessonId}
      />

      {/* AI Question Generator Modal (Per Lesson) */}
      <AiQuestionGeneratorModal
        isOpen={isAiGeneratorOpen}
        onClose={() => setIsAiGeneratorOpen(false)}
        onAddQuestions={handleAddMultipleQuestions}
        onOpenSettings={() => setIsAiSettingsOpen(true)}
        initialGrade={aiGrade}
        initialChapterId={aiChapterId}
        initialLessonId={aiLessonId}
      />

      {/* AI & API Key Settings Modal */}
      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
      />

      {/* Vector Math Visualizer (2D Oxy & 3D Oxyz) */}
      <VectorMathVisualizer
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
      />
    </div>
  );
}
