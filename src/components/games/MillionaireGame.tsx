import React, { useState, useEffect } from 'react';
import { Question } from '../../types/game';
import { MathRenderer } from '../MathRenderer';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Phone, Users, HelpCircle, RotateCcw, CheckCircle2, XCircle, ArrowRight, Lightbulb, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';
import { generateHintForQuestion } from '../../utils/geminiAi';

interface MillionaireGameProps {
  questions: Question[];
  onBackToHub: () => void;
  projectorMode?: boolean;
}

const PRIZES = [
  '200.000',
  '400.000',
  '600.000',
  '1.000.000',
  '2.000.000', // Mốc 1
  '3.000.000',
  '6.000.000',
  '10.000.000',
  '14.000.000',
  '22.000.000', // Mốc 2
  '30.000.000',
  '40.000.000',
  '60.000.000',
  '85.000.000',
  '150.000.000', // Mốc đỉnh
];

export const MillionaireGame: React.FC<MillionaireGameProps> = ({
  questions,
  onBackToHub,
  projectorMode = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    audience: true,
    phoneCall: true,
    aiTutor: true,
  });
  const [audienceChart, setAudienceChart] = useState<number[] | null>(null);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);
  const [aiTutorHint, setAiTutorHint] = useState<string | null>(null);
  const [loadingAiTutor, setLoadingAiTutor] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wonGrandPrize, setWonGrandPrize] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number>(45); // 30, 45, 60, or 999
  const [timeLeft, setTimeLeft] = useState(45);
  const [timerActive, setTimerActive] = useState(true);

  const currentQ = questions[currentIndex] || questions[0];

  // Sound suspense on mount
  useEffect(() => {
    sound.playSuspense();
    return () => {
      sound.stopSuspense();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!timerActive || isAnswered || gameOver) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 6 && prev > 1) sound.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, isAnswered, gameOver]);

  const handleTimeOut = () => {
    sound.playWrong();
    setIsAnswered(true);
    setGameOver(true);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered || eliminatedOptions.includes(index)) return;
    sound.playClick();
    setSelectedAnswer(index);
    setIsAnswered(true);
    setTimerActive(false);

    // After 1.2s delay for dramatic suspense
    setTimeout(() => {
      if (index === currentQ.correctAnswer) {
        sound.playCorrect();
        setShowExplanation(true);
        if (currentIndex === 14) {
          setWonGrandPrize(true);
          setGameOver(true);
          sound.playFanfare();
          confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
        }
      } else {
        sound.playWrong();
        setGameOver(true);
        setShowExplanation(true);
      }
    }, 1200);
  };

  const handleNextQuestion = () => {
    if (currentIndex < 14) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setEliminatedOptions([]);
      setAudienceChart(null);
      setPhoneMessage(null);
      setAiTutorHint(null);
      setTimeLeft(timerDuration);
      setTimerActive(timerDuration < 900);
      sound.playSuspense();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setEliminatedOptions([]);
    setLifelines({ fiftyFifty: true, audience: true, phoneCall: true, aiTutor: true });
    setAudienceChart(null);
    setPhoneMessage(null);
    setAiTutorHint(null);
    setGameOver(false);
    setWonGrandPrize(false);
    setShowExplanation(false);
    setTimeLeft(timerDuration);
    setTimerActive(timerDuration < 900);
    sound.playSuspense();
  };

  // AI Math Tutor Lifeline
  const useAiTutor = async () => {
    if (!lifelines.aiTutor || isAnswered || loadingAiTutor) return;
    sound.playLifeline();
    setLoadingAiTutor(true);
    setLifelines((prev) => ({ ...prev, aiTutor: false }));
    try {
      const hint = await generateHintForQuestion(currentQ, 1);
      setAiTutorHint(hint);
    } catch {
      setAiTutorHint('Gợi ý: Hãy quan sát kỹ công thức định nghĩa cốt lõi trong SGK Kết Nối Tri Thức và kiểm tra các điều kiện bài toán để tìm ra hướng giải đúng nhất!');
    } finally {
      setLoadingAiTutor(false);
    }
  };

  // 50:50 Lifeline
  const useFiftyFifty = () => {
    if (!lifelines.fiftyFifty || isAnswered) return;
    sound.playLifeline();
    const wrongIndices = [0, 1, 2, 3].filter((i) => i !== currentQ.correctAnswer);
    // Shuffle and pick 2 to eliminate
    const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminatedOptions(toEliminate);
    setLifelines((prev) => ({ ...prev, fiftyFifty: false }));
  };

  // Audience Lifeline
  const useAudience = () => {
    if (!lifelines.audience || isAnswered) return;
    sound.playLifeline();
    const correct = currentQ.correctAnswer;
    const votes = [0, 0, 0, 0];
    const correctPct = 60 + Math.floor(Math.random() * 25); // 60% - 85%
    votes[correct] = correctPct;
    let rem = 100 - correctPct;
    const others = [0, 1, 2, 3].filter((i) => i !== correct);
    const p1 = Math.floor(Math.random() * rem);
    votes[others[0]] = p1;
    rem -= p1;
    const p2 = Math.floor(Math.random() * rem);
    votes[others[1]] = p2;
    votes[others[2]] = rem - p2;

    setAudienceChart(votes);
    setLifelines((prev) => ({ ...prev, audience: false }));
  };

  // Phone Lifeline
  const usePhoneCall = () => {
    if (!lifelines.phoneCall || isAnswered) return;
    sound.playLifeline();
    const letters = ['A', 'B', 'C', 'D'];
    const tips = [
      `"Thầy cố vấn Toán THPT: Chắc chắn là phương án ${letters[currentQ.correctAnswer]} rồi em nhé, dựa vào công thức chuẩn SGK Kết Nối Tri Thức!"`,
      `"Chuyên gia Toán học: Theo tôi ${Math.random() > 0.1 ? letters[currentQ.correctAnswer] : 'A'} là phương án hoàn toàn chính xác!"`,
    ];
    setPhoneMessage(tips[Math.floor(Math.random() * tips.length)]);
    setLifelines((prev) => ({ ...prev, phoneCall: false }));
  };

  return (
    <div className={`w-full max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6 ${projectorMode ? 'text-lg' : ''}`}>
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-amber-400 tracking-wide flex items-center gap-2">
              AI LÀ TRIỆU PHÚ TOÁN HỌC
              <span className="text-xs bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
                KẾT NỐI TRI THỨC
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Câu {currentIndex + 1} / 15 • {currentQ.topic} ({currentQ.level})
            </p>
          </div>
        </div>

        {/* Lifelines */}
        <div className="flex items-center gap-2">
          <button
            onClick={useFiftyFifty}
            disabled={!lifelines.fiftyFifty || isAnswered}
            className={`px-3 py-2 rounded-xl font-black text-sm flex items-center gap-1.5 transition-all shadow-md ${
              lifelines.fiftyFifty && !isAnswered
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Trợ giúp 50:50 (Loại bỏ 2 phương án sai)"
          >
            <HelpCircle className="w-4 h-4" /> 50:50
          </button>

          <button
            onClick={useAudience}
            disabled={!lifelines.audience || isAnswered}
            className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-md ${
              lifelines.audience && !isAnswered
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Hỏi ý kiến khán giả trường quay"
          >
            <Users className="w-4 h-4" /> Khán Giả
          </button>

          <button
            onClick={usePhoneCall}
            disabled={!lifelines.phoneCall || isAnswered}
            className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-md ${
              lifelines.phoneCall && !isAnswered
                ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Gọi điện thoại cho chuyên gia Toán học"
          >
            <Phone className="w-4 h-4" /> Gọi Điện
          </button>

          {/* AI Math Tutor Lifeline */}
          <button
            onClick={useAiTutor}
            disabled={!lifelines.aiTutor || isAnswered || loadingAiTutor}
            className={`px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all shadow-md ${
              lifelines.aiTutor && !isAnswered
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 text-white cursor-pointer hover:scale-105'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
            title="Trợ giúp AI Gia Sư: Gợi ý phương pháp giải từng bước mà không lộ đáp án"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${loadingAiTutor ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{loadingAiTutor ? 'Đang hỏi AI...' : 'AI Gia Sư'}</span>
          </button>
        </div>

        {/* Timer Controls & Back */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Timer Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {[
              { val: 30, label: '30s' },
              { val: 45, label: '45s' },
              { val: 60, label: '60s' },
              { val: 999, label: 'Vô hạn' },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => {
                  setTimerDuration(t.val);
                  setTimeLeft(t.val);
                  setTimerActive(t.val < 900);
                }}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  timerDuration === t.val ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl font-black text-base md:text-lg border ${
              timerDuration >= 900
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : timeLeft <= 10
                ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                : 'bg-slate-800 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {timerDuration >= 900 ? '⏱️ ∞' : `⏱️ ${timeLeft}s`}
          </div>

          <button
            onClick={onBackToHub}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs md:text-sm font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            Trang Chủ
          </button>
        </div>
      </div>

      {/* Main Game Stage + Prize Ladder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Question + Options Stage */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* AI Math Tutor Hint Alert */}
          {aiTutorHint && (
            <div className="bg-purple-950/70 border-2 border-purple-500/60 p-4 rounded-2xl shadow-xl backdrop-blur-md animate-fadeIn flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  GỢI Ý TỪ AI GIA SƯ TOÁN THPT (KNTT):
                </h4>
                <button
                  onClick={() => setAiTutorHint(null)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-slate-800"
                >
                  Đóng
                </button>
              </div>
              <div className="text-white text-sm leading-relaxed pl-1">
                <MathRenderer content={aiTutorHint} />
              </div>
            </div>
          )}
          {/* Audience Poll Modal or Alert */}
          {audienceChart && (
            <div className="bg-slate-800/90 border border-emerald-500/50 p-4 rounded-2xl shadow-xl backdrop-blur-md">
              <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" /> Ý kiến bình chọn của khán giả:
              </h4>
              <div className="grid grid-cols-4 gap-3 text-center">
                {['A', 'B', 'C', 'D'].map((char, i) => (
                  <div key={char} className="bg-slate-900 p-2 rounded-xl border border-slate-700">
                    <div className="text-sm font-extrabold text-slate-400 mb-1">{char}</div>
                    <div className="h-16 flex items-end justify-center bg-slate-950 rounded-lg p-1">
                      <div
                        className="w-full bg-emerald-500 rounded-md transition-all duration-700"
                        style={{ height: `${audienceChart[i]}%` }}
                      ></div>
                    </div>
                    <div className="text-xs font-black text-emerald-300 mt-1">{audienceChart[i]}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phone Message Alert */}
          {phoneMessage && (
            <div className="bg-purple-950/70 border border-purple-500/50 p-4 rounded-2xl text-purple-200 text-sm italic flex items-center gap-3">
              <Phone className="w-5 h-5 text-purple-400 shrink-0" />
              <span>{phoneMessage}</span>
            </div>
          )}

          {/* Question Box */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-2 border-blue-500/50 rounded-3xl p-6 md:p-8 shadow-2xl text-center flex flex-col justify-center min-h-[140px]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-extrabold text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-lg border border-blue-400">
              Câu hỏi số {currentIndex + 1} • {PRIZES[currentIndex]} VNĐ
            </div>
            <div className="text-lg md:text-2xl font-bold text-white leading-relaxed">
              <MathRenderer content={currentQ.content} />
            </div>
          </div>

          {/* 4 Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const isEliminated = eliminatedOptions.includes(idx);
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentQ.correctAnswer;

              let btnStyle =
                'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:border-blue-500';
              if (isSelected && !isAnswered) {
                btnStyle = 'bg-amber-600 border-amber-400 text-white';
              } else if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-600/90 border-emerald-400 text-white animate-pulse-glow';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-600/90 border-rose-400 text-white';
                }
              }

              if (isEliminated) {
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 opacity-20 pointer-events-none"
                  >
                    <span className="text-slate-600 font-bold">{letter}. ---</span>
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-4 md:p-5 rounded-2xl border-2 text-left font-semibold transition-all duration-200 flex items-center gap-3.5 cursor-pointer shadow-lg hover:scale-[1.015] active:scale-[0.99] ${btnStyle}`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-inner ${
                      isSelected ? 'bg-white text-slate-950' : 'bg-blue-900/60 text-blue-300 border border-blue-600/40'
                    }`}
                  >
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

          {/* Explanation & Action Box */}
          {showExplanation && (
            <div className="bg-slate-900/95 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-md animate-fadeIn flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold">
                  <Lightbulb className="w-5 h-5" />
                  <span>Lời Giải Thích Chi Tiết & Phương Pháp Sư Phạm:</span>
                </div>
                {selectedAnswer === currentQ.correctAnswer && !gameOver && (
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-all"
                  >
                    <span>Câu Tiếp Theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-slate-200 leading-relaxed text-sm md:text-base bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <MathRenderer content={currentQ.explanation} />
              </div>
            </div>
          )}

          {/* Game Over / Win Box */}
          {gameOver && (
            <div
              className={`p-6 rounded-2xl border-2 text-center flex flex-col items-center gap-4 ${
                wonGrandPrize
                  ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                  : 'bg-rose-950/60 border-rose-500 text-rose-200'
              }`}
            >
              <h3 className="text-2xl md:text-3xl font-black">
                {wonGrandPrize
                  ? '🏆 CHÚC MỪNG BẠN LÀ TRIỆU PHÚ TOÁN HỌC ĐỈNH CAO! 🏆'
                  : 'CUỘC CHƠI DỪNG LẠI! BẠN ĐÃ RẤT NỖ LỰC!'}
              </h3>
              <p className="text-slate-300">
                Mức tiền thưởng đạt được:{' '}
                <b className="text-amber-400 text-xl">
                  {wonGrandPrize
                    ? '150.000.000 đ'
                    : currentIndex >= 10
                    ? '22.000.000 đ'
                    : currentIndex >= 5
                    ? '2.000.000 đ'
                    : '0 đ'}
                </b>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Chơi Lại Từ Đầu
                </button>
                <button
                  onClick={onBackToHub}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Về Trang Chủ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prize Ladder Sidebar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-2">
          <div className="text-center font-black text-amber-400 text-sm tracking-wider uppercase pb-2 border-b border-slate-800">
            Thang Giải Thưởng
          </div>
          <div className="flex flex-col-reverse gap-1">
            {PRIZES.map((prize, idx) => {
              const isCurrent = idx === currentIndex;
              const isPassed = idx < currentIndex;
              const isMilestone = idx === 4 || idx === 9 || idx === 14;

              let itemStyle = 'text-slate-500 bg-slate-950/40';
              if (isCurrent) {
                itemStyle = 'bg-amber-500 text-slate-950 font-black shadow-lg scale-105';
              } else if (isPassed) {
                itemStyle = 'text-emerald-400 bg-emerald-950/20 font-semibold';
              } else if (isMilestone) {
                itemStyle = 'text-cyan-400 bg-slate-900/80 font-bold border border-cyan-500/30';
              }

              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-xl text-xs md:text-sm flex items-center justify-between transition-all ${itemStyle}`}
                >
                  <span className="font-mono">
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    {isMilestone && ' ★'}
                  </span>
                  <span className="font-bold">{prize} đ</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
