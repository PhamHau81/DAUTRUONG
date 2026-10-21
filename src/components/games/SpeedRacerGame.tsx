import React, { useState, useEffect } from 'react';
import { Question } from '../../types/game';
import { MathRenderer } from '../MathRenderer';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Gauge, Flag, RotateCcw, ArrowRight, Lightbulb, CheckCircle2, XCircle, Zap } from 'lucide-react';

interface SpeedRacerGameProps {
  questions: Question[];
  onBackToHub: () => void;
  projectorMode?: boolean;
}

export const SpeedRacerGame: React.FC<SpeedRacerGameProps> = ({
  questions,
  onBackToHub,
  projectorMode = false,
}) => {
  const [currentLap, setCurrentLap] = useState(0);
  const [speed, setSpeed] = useState(80);
  const [nitroActive, setNitroActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [champion, setChampion] = useState(false);

  const totalLaps = 15;
  const currentQ = questions[currentLap] || questions[0];

  // Engine sound effect on start
  useEffect(() => {
    sound.playEngineRev();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isAnswered || gameOver) return;
    if (timeLeft <= 0) {
      sound.playWrong();
      setIsAnswered(true);
      setShowExplanation(true);
      setSpeed((prev) => Math.max(40, prev - 30));
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 0) sound.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameOver]);

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctAnswer;
    if (isCorrect) {
      sound.playNitroBoost();
      sound.playCorrect();
      setNitroActive(true);
      setSpeed((prev) => Math.min(240, prev + 25));
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      if (currentLap >= totalLaps - 1) {
        setChampion(true);
        setGameOver(true);
        sound.playFanfare();
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.5 } });
      }
    } else {
      sound.playWrong();
      setSpeed((prev) => Math.max(40, prev - 40));
    }

    setShowExplanation(true);
  };

  const handleNextLap = () => {
    if (currentLap < totalLaps - 1) {
      setCurrentLap((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setNitroActive(false);
      setTimeLeft(30);
      sound.playEngineRev();
    }
  };

  const handleRestart = () => {
    setCurrentLap(0);
    setSpeed(80);
    setNitroActive(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setTimeLeft(30);
    setGameOver(false);
    setChampion(false);
    sound.playEngineRev();
  };

  const carProgress = (currentLap / totalLaps) * 100;

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6 ${projectorMode ? 'text-lg' : ''}`}>
      {/* Top Race Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-rose-500/30 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-rose-400 tracking-wide flex items-center gap-2">
              ĐUA XE TỐC ĐỘ TOÁN HỌC
              <span className="text-xs bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                GRAND PRIX 2018
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Chặng {currentLap + 1} / {totalLaps} • {currentQ.topic}
            </p>
          </div>
        </div>

        {/* Speedometer & Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/90 px-4 py-2 rounded-xl border border-slate-700">
            <Gauge className={`w-5 h-5 ${nitroActive ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            <span className="text-xs text-slate-400">Tốc độ:</span>
            <span className="text-lg font-black text-white font-mono">{speed} km/h</span>
            {nitroActive && <span className="text-xs font-black text-rose-400 uppercase">NITRO 🔥</span>}
          </div>

          <div
            className={`px-4 py-2 rounded-xl font-black text-base border ${
              timeLeft <= 7
                ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                : 'bg-slate-800 text-cyan-300 border-cyan-500/40'
            }`}
          >
            ⏱️ {timeLeft}s
          </div>

          <button
            onClick={onBackToHub}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-slate-700"
          >
            Trang Chủ
          </button>
        </div>
      </div>

      {/* Race Track Animation */}
      <div className="bg-slate-900/90 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Track asphalt */}
        <div className="h-28 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 rounded-2xl relative border-y-4 border-amber-500/80 overflow-hidden flex items-center px-4">
          {/* Road dashed center lines */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 flex gap-6 overflow-hidden opacity-60">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-10 h-full bg-white shrink-0 rounded-sm"></div>
            ))}
          </div>

          {/* Start & Finish line markers */}
          <div className="absolute left-4 top-2 bottom-2 w-3 bg-white/20 border-r-2 border-dashed border-white/60"></div>
          <div className="absolute right-6 top-2 bottom-2 flex flex-col items-center justify-center z-10">
            <Flag className="w-8 h-8 text-amber-400 animate-bounce" />
            <span className="text-[10px] font-black text-amber-300">ĐÍCH</span>
          </div>

          {/* Obstacles along the road */}
          {[25, 50, 75].map((pct) => (
            <div
              key={pct}
              className="absolute top-1/2 -translate-y-1/2 text-lg z-0 opacity-80"
              style={{ left: `${pct}%` }}
              title="Chướng ngại vật thử thách"
            >
              🚧
            </div>
          ))}

          {/* Sports Car */}
          <div
            className="absolute transition-all duration-700 ease-out z-20 flex items-center"
            style={{ left: `calc(4% + ${carProgress * 0.85}%)` }}
          >
            <div className="relative group">
              {/* Nitro flame effect */}
              {nitroActive && (
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-2xl animate-pulse">
                  🔥🔥
                </div>
              )}
              <div className="text-4xl md:text-5xl filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)] transform -scale-x-100">
                🏎️
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar under track */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>Xuất phát</span>
          <span className="text-rose-400">Tiến độ chặng: {Math.round(carProgress)}%</span>
          <span>Cờ ca-rô đích</span>
        </div>
      </div>

      {/* Question & Interactive Answers */}
      {!gameOver ? (
        <div className="flex flex-col gap-4">
          {/* Question Banner */}
          <div className="bg-slate-900/90 border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center flex flex-col justify-center min-h-[120px]">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <Zap className="w-4 h-4" /> Thử Thách Chặng {currentLap + 1}: {currentQ.topic}
            </div>
            <div className="text-lg md:text-2xl font-bold text-white leading-relaxed">
              <MathRenderer content={currentQ.content} />
            </div>
          </div>

          {/* 4 Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctAnswer;

              let style = 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-200';
              if (isAnswered) {
                if (isCorrect) style = 'bg-emerald-600/90 border-emerald-400 text-white animate-pulse-glow';
                else if (isSelected) style = 'bg-rose-600/90 border-rose-400 text-white';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={isAnswered}
                  className={`p-4 md:p-5 rounded-2xl border-2 text-left font-semibold transition-all flex items-center gap-3.5 cursor-pointer shadow-lg hover:scale-[1.01] ${style}`}
                >
                  <span className="w-9 h-9 rounded-xl bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0 border border-slate-700 shadow-inner">
                    {letter}
                  </span>
                  <div className="flex-1 text-base md:text-lg">
                    <MathRenderer content={opt} />
                  </div>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-300 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation drawer */}
          {showExplanation && (
            <div className="bg-slate-900/95 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-extrabold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" /> Phương pháp giải & Đột phá tốc độ:
                </span>
                <button
                  onClick={handleNextLap}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                >
                  <span>Chặng Kế Tiếp</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-slate-200 text-sm md:text-base bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <MathRenderer content={currentQ.explanation} />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Winner Podium */
        <div className="bg-slate-900/90 border-2 border-amber-500 rounded-3xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fadeIn">
          <div className="text-6xl animate-bounce">🏆</div>
          <h3 className="text-3xl font-black text-amber-400">
            {champion ? 'CHÚC MỪNG BẠN LÀ NHÀ VÔ ĐỊCH ĐƯỜNG ĐUA TOÁN HỌC!' : 'HOÀN THÀNH CHẶNG ĐUA!'}
          </h3>
          <p className="text-slate-300 max-w-md">
            Bạn đã xuất sắc vượt qua toàn bộ 15 chặng đua Toán học Kết Nối Tri Thức với tốc độ đỉnh cao <b>{speed} km/h</b>!
          </p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Đua Lại Chặng Mới
            </button>
            <button
              onClick={onBackToHub}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
            >
              Về Trang Chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
