import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../types/game';
import { MathRenderer } from '../MathRenderer';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Disc, Gift, Sparkles, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, Users, Trophy } from 'lucide-react';

interface LuckyWheelGameProps {
  questions: Question[];
  onBackToHub: () => void;
  projectorMode?: boolean;
}

interface Sector {
  label: string;
  type: 'points' | 'double' | 'gift' | 'lucky' | 'lose';
  value: number;
  color: string;
}

const SECTORS: Sector[] = [
  { label: '100 Điểm', type: 'points', value: 100, color: '#3b82f6' },
  { label: '200 Điểm', type: 'points', value: 200, color: '#10b981' },
  { label: 'Hộp Quà 🎁', type: 'gift', value: 0, color: '#f59e0b' },
  { label: '300 Điểm', type: 'points', value: 300, color: '#8b5cf6' },
  { label: 'Nhân Đôi x2', type: 'double', value: 2, color: '#ec4899' },
  { label: '500 Điểm', type: 'points', value: 500, color: '#06b6d4' },
  { label: 'May Mắn ✨', type: 'lucky', value: 400, color: '#f97316' },
  { label: '400 Điểm', type: 'points', value: 400, color: '#14b8a6' },
  { label: 'Hộp Quà 🎁', type: 'gift', value: 0, color: '#eab308' },
  { label: '1000 Điểm', type: 'points', value: 1000, color: '#ef4444' },
];

export const LuckyWheelGame: React.FC<LuckyWheelGameProps> = ({
  questions,
  onBackToHub,
  projectorMode = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentSector, setCurrentSector] = useState<Sector | null>(null);

  // Teams
  const [teams, setTeams] = useState([
    { id: 1, name: 'Đội Đỏ', color: 'bg-rose-500 text-white', score: 0 },
    { id: 2, name: 'Đội Xanh', color: 'bg-blue-500 text-white', score: 0 },
    { id: 3, name: 'Đội Vàng', color: 'bg-amber-500 text-slate-950', score: 0 },
  ]);
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);

  // Question state
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionActive, setQuestionActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Mystery Gift Box state
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [openedGift, setOpenedGift] = useState<string | null>(null);

  const currentQ = questions[questionIndex % questions.length];

  // Draw the Wheel on canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2 - 12;
    const centerX = width / 2;
    const centerY = height / 2;
    const totalSectors = SECTORS.length;
    const arc = (2 * Math.PI) / totalSectors;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    // Draw sectors
    SECTORS.forEach((sector, i) => {
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      // Slice
      ctx.beginPath();
      ctx.fillStyle = sector.color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();

      // Border line
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(startAngle + arc / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.fillText(sector.label, radius - 20, 5);
      ctx.restore();
    });

    // Center circle knob
    ctx.restore();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center star / text
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('QUAY', centerX, centerY);
  };

  useEffect(() => {
    drawWheel(currentAngle);
  }, [currentAngle]);

  const handleSpin = () => {
    if (isSpinning || questionActive) return;
    sound.playClick();
    setIsSpinning(true);
    setCurrentSector(null);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);

    let speed = 0.35 + Math.random() * 0.25;
    const friction = 0.988;
    let angle = currentAngle;
    let lastTickAngle = angle;

    const interval = setInterval(() => {
      angle += speed;
      speed *= friction;
      setCurrentAngle(angle);

      // Play click sound on each segment
      if (Math.abs(angle - lastTickAngle) > (2 * Math.PI) / SECTORS.length) {
        sound.playWheelTick();
        lastTickAngle = angle;
      }

      if (speed < 0.003) {
        clearInterval(interval);
        setIsSpinning(false);

        // Calculate landed sector (pointer is at top: 3*PI/2)
        const total = SECTORS.length;
        const arc = (2 * Math.PI) / total;
        // Pointer is at angle 3*PI / 2
        const normalized = (2 * Math.PI - (angle % (2 * Math.PI)) + Math.PI / 2) % (2 * Math.PI);
        const sectorIndex = Math.floor(normalized / arc) % total;
        const sector = SECTORS[sectorIndex];
        setCurrentSector(sector);

        if (sector.type === 'gift') {
          sound.playFanfare();
          setShowGiftModal(true);
        } else {
          sound.playCorrect();
          // Open Question
          setTimeout(() => {
            setQuestionActive(true);
          }, 600);
        }
      }
    }, 20);
  };

  const handleOpenGift = (boxNum: number) => {
    const rewards = [
      '🎉 Chúc mừng! Nhận ngay +500 Điểm Thưởng Trực Tiếp!',
      '🌟 Thẻ Nhân Đôi Điểm x2 cho câu hỏi tiếp theo!',
      '🎁 Thẻ May Mắn: Nhận trọn vẹn 600 Điểm không cần trả lời!',
    ];
    const chosen = rewards[boxNum - 1] || rewards[0];
    setOpenedGift(chosen);
    sound.playFanfare();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });

    // Award bonus
    setTeams((prev) =>
      prev.map((t, i) => (i === activeTeamIndex ? { ...t, score: t.score + 500 } : t))
    );

    setTimeout(() => {
      setShowGiftModal(false);
      setOpenedGift(null);
      setQuestionActive(true);
    }, 2400);
  };

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctAnswer;
    if (isCorrect) {
      sound.playCorrect();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      const pts = currentSector?.type === 'points' ? currentSector.value : 300;
      setTeams((prev) =>
        prev.map((t, i) => (i === activeTeamIndex ? { ...t, score: t.score + pts } : t))
      );
    } else {
      sound.playWrong();
    }
    setShowExplanation(true);
  };

  const handleNextTurn = () => {
    setQuestionActive(false);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setCurrentSector(null);
    setQuestionIndex((prev) => prev + 1);
    // Switch to next team
    setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6 ${projectorMode ? 'text-lg' : ''}`}>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
            <Disc className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-emerald-400 tracking-wide flex items-center gap-2">
              VÒNG QUAY MAY MẮN TOÁN HỌC
              <span className="text-xs bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                15 THỬ THÁCH
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Chủ đề: {currentQ.topic} • Lớp {currentQ.grade} THPT (KNTT)
            </p>
          </div>
        </div>

        {/* Team Scoreboard */}
        <div className="flex items-center gap-2">
          {teams.map((t, i) => (
            <div
              key={t.id}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                i === activeTeamIndex
                  ? 'border-emerald-400 bg-slate-800 ring-2 ring-emerald-500/50 scale-105'
                  : 'border-slate-800 bg-slate-950/60 opacity-70'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${t.color.split(' ')[0]}`}></span>
              <span className="text-xs font-bold text-slate-300">{t.name}:</span>
              <span className="text-sm font-black text-emerald-300">{t.score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onBackToHub}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all border border-slate-700"
        >
          Trang Chủ
        </button>
      </div>

      {/* Main Wheel Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Wheel Canvas + Controls */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-2xl relative">
          {/* Wheel Pointer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-3xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce">
            🔻
          </div>

          <div className="relative p-2 rounded-full border-4 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
            <canvas ref={canvasRef} width={360} height={360} className="w-[300px] h-[300px] md:w-[340px] md:h-[340px]" />
          </div>

          {/* Spin Button */}
          <div className="mt-5 w-full flex flex-col items-center gap-3">
            <button
              onClick={handleSpin}
              disabled={isSpinning || questionActive}
              className={`w-full max-w-xs py-3.5 px-6 rounded-2xl font-black text-lg shadow-xl tracking-wider transition-all flex items-center justify-center gap-2 ${
                isSpinning || questionActive
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 cursor-pointer hover:scale-105 active:scale-95'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {isSpinning ? 'ĐANG QUAY...' : `LƯỢT QUAY: ${teams[activeTeamIndex].name.toUpperCase()}`}
            </button>

            {currentSector && (
              <div className="text-sm font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-4 py-1.5 rounded-full">
                Ô trúng: <b className="text-white">{currentSector.label}</b>
              </div>
            )}
          </div>
        </div>

        {/* Right: Question Box or Prompt */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {!questionActive ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[360px] gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-pulse">
                <Disc className="w-9 h-9" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white">
                SẴN SÀNG QUAY BÁNH XE MAY MẮN!
              </h3>
              <p className="text-slate-400 max-w-md text-sm md:text-base leading-relaxed">
                Đến lượt <b>{teams[activeTeamIndex].name}</b>. Nhấn nút "QUAY" để xác định phần thưởng điểm số hoặc mở Hộp Quà Bí Ẩn, sau đó trả lời câu hỏi Toán học thử thách!
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span className="text-emerald-400">Câu hỏi số {questionIndex + 1} / 15</span>
                <span>Mức điểm: {currentSector?.label}</span>
              </div>

              {/* Question content */}
              <div className="bg-slate-950/70 border border-blue-500/40 rounded-2xl p-5 text-lg md:text-xl font-bold text-white text-center leading-relaxed">
                <MathRenderer content={currentQ.content} />
              </div>

              {/* 4 Options */}
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
                      onClick={() => handleSelectAnswer(idx)}
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

              {/* Explanation & Next */}
              {showExplanation && (
                <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" /> Lời giải chi tiết:
                    </span>
                    <button
                      onClick={handleNextTurn}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <span>Lượt Tiếp Theo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Mystery Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl animate-fadeIn">
            <h3 className="text-2xl font-black text-amber-400 flex items-center justify-center gap-2 mb-2">
              <Gift className="w-7 h-7" /> HỘP QUÀ BÍ ẨN MAY MẮN!
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              Chọn 1 trong 3 chiếc hộp bí mật để nhận phần quà bất ngờ dành cho <b>{teams[activeTeamIndex].name}</b>!
            </p>

            {openedGift ? (
              <div className="bg-amber-950/60 border border-amber-500 p-6 rounded-2xl text-amber-200 font-extrabold text-lg animate-bounce">
                {openedGift}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleOpenGift(num)}
                    className="p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/40 hover:to-orange-500/40 border-2 border-amber-500/60 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl group"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">🎁</span>
                    <span className="text-xs font-black text-amber-300">HỘP #{num}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
