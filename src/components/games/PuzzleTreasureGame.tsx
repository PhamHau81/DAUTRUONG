import React, { useState } from 'react';
import { Question } from '../../types/game';
import { MathRenderer } from '../MathRenderer';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Puzzle, Sparkles, KeyRound, CheckCircle2, XCircle, RotateCcw, Lightbulb, Trophy } from 'lucide-react';

interface PuzzleTreasureGameProps {
  questions: Question[];
  onBackToHub: () => void;
  projectorMode?: boolean;
}

export const PuzzleTreasureGame: React.FC<PuzzleTreasureGameProps> = ({
  questions,
  onBackToHub,
  projectorMode = false,
}) => {
  // 16 tiles (0..15)
  const [solvedTiles, setSolvedTiles] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [treasureUnlocked, setTreasureUnlocked] = useState(false);
  const [score, setScore] = useState(0);

  // Background painting theme
  const secretTheme = {
    title: 'ĐỊNH LÝ PYTHAGORAS & HÌNH HỌC KHÔNG GIAN',
    keywords: ['pythagoras', 'pitago', 'tam giac vuong', 'dinh ly pitago'],
    description:
      'Chân dung nhà toán học vĩ đại Pythagoras và định lý hình học nền tảng $a^2 + b^2 = c^2$, mở đường cho toàn bộ hệ thống hình học giải tích và không gian THPT!',
    imageUrl:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80',
  };

  const currentQ =
    activeTile !== null ? questions[activeTile % questions.length] : null;

  const handleTileClick = (index: number) => {
    if (solvedTiles.includes(index) || treasureUnlocked) return;
    sound.playClick();
    setActiveTile(index);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
  };

  const handleSelectOption = (idx: number) => {
    if (!currentQ || isAnswered || activeTile === null) return;
    sound.playClick();
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctAnswer) {
      sound.playCorrect();
      setSolvedTiles((prev) => [...prev, activeTile]);
      setScore((prev) => prev + 100);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

      if (solvedTiles.length + 1 >= 16) {
        setTreasureUnlocked(true);
        sound.playFanfare();
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      }
    } else {
      sound.playWrong();
    }
    setShowExplanation(true);
  };

  const handleCloseQuestion = () => {
    setActiveTile(null);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
  };

  // Guess whole picture
  const handleCheckGuess = () => {
    const cleaned = guessInput.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isMatched = secretTheme.keywords.some((k) => cleaned.includes(k));

    if (isMatched) {
      sound.playFanfare();
      confetti({ particleCount: 250, spread: 150, origin: { y: 0.5 } });
      setTreasureUnlocked(true);
      setSolvedTiles(Array.from({ length: 16 }, (_, i) => i));
      setScore((prev) => prev + 1000);
      setGuessFeedback('🎉 CHÍNH XÁC TUYỆT ĐỐI! BẠN ĐÃ GIẢI MÃ THÀNH CÔNG BỨC TRANH BÍ MẬT!');
      setTimeout(() => {
        setGuessModalOpen(false);
      }, 2000);
    } else {
      sound.playWrong();
      setGuessFeedback('❌ Chưa chính xác! Hãy mở thêm các mảnh ghép để có thêm manh mối!');
    }
  };

  const handleRestart = () => {
    setSolvedTiles([]);
    setActiveTile(null);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setTreasureUnlocked(false);
    setScore(0);
    setGuessInput('');
    setGuessFeedback(null);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6 ${projectorMode ? 'text-lg' : ''}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-indigo-500/30 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/40">
            <Puzzle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-indigo-400 tracking-wide flex items-center gap-2">
              LẬT MẢNH GHÉP KHO BÁU TOÁN HỌC
              <span className="text-xs bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                16 Ô BÍ MẬT
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Đã mở: {solvedTiles.length} / 16 mảnh ghép • Điểm tích luỹ: <b className="text-amber-400">{score}</b>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuessModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all hover:scale-105 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            Đoán Bức Tranh Bí Mật (+1000đ)
          </button>

          <button
            onClick={onBackToHub}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-slate-700"
          >
            Trang Chủ
          </button>
        </div>
      </div>

      {/* Main Grid & Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 4x4 Puzzle Picture Board */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[440px] bg-slate-950 border-4 border-indigo-500/40 rounded-3xl p-3 shadow-2xl overflow-hidden">
            {/* Secret image underneath */}
            <div
              className="absolute inset-3 rounded-2xl bg-cover bg-center transition-all duration-1000"
              style={{
                backgroundImage: `url(${secretTheme.imageUrl})`,
                filter: treasureUnlocked ? 'none' : 'brightness(0.9)',
              }}
            >
              {/* Overlay with info when unlocked */}
              {treasureUnlocked && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
                  <div className="text-4xl mb-2">🏆</div>
                  <h4 className="text-lg md:text-xl font-black text-amber-400 mb-1">{secretTheme.title}</h4>
                  <p className="text-xs text-slate-200 leading-relaxed"><MathRenderer content={secretTheme.description} /></p>
                </div>
              )}
            </div>

            {/* 16 Tiles Grid */}
            <div className="relative z-10 w-full h-full grid grid-cols-4 grid-rows-4 gap-2">
              {Array.from({ length: 16 }).map((_, i) => {
                const isSolved = solvedTiles.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleTileClick(i)}
                    disabled={isSolved || treasureUnlocked}
                    className={`rounded-xl font-black text-lg md:text-xl flex items-center justify-center transition-all duration-500 border shadow-md ${
                      isSolved
                        ? 'opacity-0 scale-75 pointer-events-none'
                        : 'bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 hover:from-indigo-500 hover:to-blue-500 border-indigo-400/60 text-white cursor-pointer hover:scale-105 active:scale-95'
                    }`}
                  >
                    {!isSolved && (i + 1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-400 font-semibold text-center">
            💡 Nhấn vào một mảnh ghép còn đóng để mở câu hỏi thử thách!
          </div>
        </div>

        {/* Right: Question Card or Hint Panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {activeTile === null || !currentQ ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[360px] gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Sparkles className="w-9 h-9" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">
                BẢN ĐỒ KHO BÁU TOÁN HỌC ĐANG CHỜ ĐÓN!
              </h3>
              <p className="text-slate-400 max-w-md text-sm md:text-base leading-relaxed">
                Hãy cùng các bạn học sinh chọn một mảnh ghép trên bảng 4x4. Trả lời đúng để bóc tách lớp màn bí ẩn, hoặc bấm "Đoán Bức Tranh" để ghi điểm đột phá!
              </p>
              {treasureUnlocked && (
                <button
                  onClick={handleRestart}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Bắt Đầu Ván Mới
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-indigo-400 font-black">Mảnh ghép số #{activeTile + 1}</span>
                <span>{currentQ.topic} ({currentQ.level})</span>
              </div>

              {/* Question Text */}
              <div className="bg-slate-950/70 border border-indigo-500/40 rounded-2xl p-5 text-lg md:text-xl font-bold text-white text-center leading-relaxed">
                <MathRenderer content={currentQ.content} />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const letter = ['A', 'B', 'C', 'D'][idx];
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswer;

                  let style = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200';
                  if (isAnswered) {
                    if (isCorrect) style = 'bg-emerald-600/90 border-emerald-400 text-white animate-pulse-glow';
                    else if (isSelected) style = 'bg-rose-600/90 border-rose-400 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`p-4 rounded-xl border-2 text-left font-semibold transition-all flex items-center gap-3 cursor-pointer ${style}`}
                    >
                      <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        {letter}
                      </span>
                      <div className="flex-1 text-sm md:text-base">
                        <MathRenderer content={opt} />
                      </div>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Close Button */}
              {showExplanation && (
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Lời giải sư phạm:
                    </span>
                    <button
                      onClick={handleCloseQuestion}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
                    >
                      Tiếp Tục Mở Ô Khác
                    </button>
                  </div>
                  <div className="text-slate-300 text-xs md:text-sm">
                    <MathRenderer content={currentQ.explanation} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Guess Mystery Picture Modal */}
      {guessModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl flex flex-col gap-4 animate-fadeIn">
            <h3 className="text-2xl font-black text-amber-400 flex items-center justify-center gap-2">
              <KeyRound className="w-6 h-6" /> ĐOÁN CHỦ ĐỀ BỨC TRANH BÍ MẬT
            </h3>
            <p className="text-slate-300 text-sm">
              Nhập tên nhà toán học hoặc định lý ẩn giấu đằng sau các mảnh ghép (Ví dụ: <i>Pythagoras, Pitago, Tam giác vuông...</i>):
            </p>

            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCheckGuess()}
              placeholder="Nhập câu trả lời của bạn..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-amber-500"
              autoFocus
            />

            {guessFeedback && (
              <div className="text-sm font-bold text-amber-300 p-2 rounded-lg bg-amber-950/40">
                {guessFeedback}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setGuessModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={handleCheckGuess}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm cursor-pointer shadow-lg"
              >
                Xác Nhận Đoán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
