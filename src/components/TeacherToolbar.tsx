import React, { useState } from 'react';
import {
  Download,
  Monitor,
  Volume2,
  VolumeX,
  BookOpen,
  Info,
  HelpCircle,
  Sparkles,
  Settings,
  Compass,
  FileText,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TeacherToolbarProps {
  projectorMode: boolean;
  onToggleProjector: () => void;
  onOpenQuestionBank: () => void;
  onDownloadOfflineHtml: () => void;
  onOpenUploadModal: () => void;
  onOpenAiGenerator: () => void;
  onOpenAiSettings: () => void;
  onOpenVectorVisualizer: () => void;
  onExportWord: () => void;
  onExportPresentation: () => void;
}

export const TeacherToolbar: React.FC<TeacherToolbarProps> = ({
  projectorMode,
  onToggleProjector,
  onOpenQuestionBank,
  onDownloadOfflineHtml,
  onOpenUploadModal,
  onOpenAiGenerator,
  onOpenAiSettings,
  onOpenVectorVisualizer,
  onExportWord,
  onExportPresentation,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(sound.isEnabled());
  const [volume, setVolume] = useState(sound.getVolume());
  const [showGuideModal, setShowGuideModal] = useState(false);

  const toggleSound = () => {
    const newState = !audioEnabled;
    sound.setEnabled(newState);
    setAudioEnabled(newState);
    if (newState) sound.playClick();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    sound.setVolume(val);
    if (val > 0 && !audioEnabled) {
      sound.setEnabled(true);
      setAudioEnabled(true);
    }
  };

  return (
    <>
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 md:p-2.5 px-3 md:px-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Quick indicators */}
        <div className="hidden xl:flex items-center gap-2 text-slate-300 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>BẢNG ĐIỀU KHIỂN:</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          {/* Settings / API Key Button as specified in AI_INSTRUCTIONS.md */}
          <button
            onClick={onOpenAiSettings}
            className="px-2.5 py-1.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700 shadow-sm group"
            title="Cài đặt Google Gemini API Key & Mô hình AI"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-45 transition-transform" />
            <span className="font-extrabold text-[11px] text-white">Settings (API Key)</span>
            <span className="text-[10px] font-black text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-md border border-rose-500/40 animate-pulse">
              Lấy API key để sử dụng app
            </span>
          </button>

          {/* AI Question Generator Button */}
          <button
            onClick={onOpenAiGenerator}
            className="px-3 py-1.5 rounded-xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/25 hover:scale-105 active:scale-95"
            title="Tự động tạo câu hỏi chuẩn SGK Kết Nối Tri Thức theo từng bài học bằng AI Google Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>✨ AI TẠO ĐỀ</span>
          </button>

          {/* Vector Math Visualizer Button */}
          <button
            onClick={onOpenVectorVisualizer}
            className="px-3 py-1.5 rounded-xl font-bold bg-cyan-700 hover:bg-cyan-600 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            title="Mô phỏng hình học vectơ 2D Oxy và không gian 3D Oxyz trực quan"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-200" />
            <span>📐 Vẽ Vectơ 2D/3D</span>
          </button>

          {/* Word Export Button */}
          <button
            onClick={onExportWord}
            className="px-2.5 py-1.5 rounded-xl font-bold bg-blue-700 hover:bg-blue-600 text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Xuất bộ đề thi môn Toán ra file Word (.doc) có sẵn bảng đáp án và lời giải"
          >
            <FileText className="w-3.5 h-3.5 text-blue-200" />
            <span>Xuất Word (.doc)</span>
          </button>

          {/* Presentation Slide Export Button */}
          <button
            onClick={onExportPresentation}
            className="px-2.5 py-1.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            title="Xuất slide bài giảng trình chiếu toàn màn hình để chiếu trên máy chiếu"
          >
            <Monitor className="w-3.5 h-3.5 text-slate-950" />
            <span>Xuất Slide</span>
          </button>

          {/* Upload / Import Questions */}
          <button
            onClick={onOpenUploadModal}
            className="px-2.5 py-1.5 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Tải lên hoặc dán câu hỏi từ Word / MathType chuẩn hóa không lỗi font"
          >
            <span>➕ Nạp Đề</span>
          </button>

          {/* Question Bank */}
          <button
            onClick={onOpenQuestionBank}
            className="px-2.5 py-1.5 rounded-xl font-bold bg-indigo-700 hover:bg-indigo-600 text-white flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            title="Quản lý và chỉnh sửa ngân hàng câu hỏi"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ngân Hàng</span>
          </button>

          {/* Download Standalone HTML Button */}
          <button
            onClick={onDownloadOfflineHtml}
            className="px-3 py-1.5 rounded-xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            title="Tải về trọn bộ ứng dụng trong 01 file HTML duy nhất để mang đi dạy không cần mạng Internet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TẢI 1 FILE OFFLINE</span>
          </button>

          {/* Projector Mode */}
          <button
            onClick={onToggleProjector}
            className={`px-2 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer border ${
              projectorMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Phóng to giao diện và tối ưu độ tương phản cho Máy chiếu / Bảng tương tác"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{projectorMode ? 'Máy Chiếu: BẬT' : 'Máy Chiếu'}</span>
          </button>

          {/* Audio Volume Slider & Toggle */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-xl border border-slate-700">
            <button
              onClick={toggleSound}
              className="text-slate-400 hover:text-white cursor-pointer"
              title={audioEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {audioEnabled && volume > 0.01 ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-14 accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              title={`Âm lượng: ${Math.round(volume * 100)}%`}
            />
            <span className="text-[10px] font-mono text-slate-400 w-6">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* User Guide */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            title="Hướng dẫn sử dụng, công thức MathType và Vectơ"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teacher Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl flex flex-col gap-4 animate-fadeIn">
            <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Info className="w-6 h-6" /> HƯỚNG DẪN SỬ DỤNG DÀNH CHO GIÁO VIÊN TOÁN THPT
            </h3>

            <div className="text-slate-200 text-sm leading-relaxed space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-cyan-300 mb-1">1. Tính năng Vẽ Hình Học & Vectơ Trực Quan (Math Visualizer):</h4>
                <p className="text-xs text-slate-300">
                  - Bấm nút <b>"📐 Vẽ Vectơ 2D/3D"</b> để mở mô phỏng:
                  <br />
                  + Biểu diễn toạ độ vectơ trong mặt phẳng toạ độ $Oxy$ với toạ độ điểm $A, B$ có thanh trượt thay đổi thời gian thực.
                  <br />
                  + Minh hoạ trực quan quy tắc 3 điểm $(\overrightarrow{AB} + \overrightarrow{BC} = \overrightarrow{AC})$ và quy tắc hình bình hành.
                  <br />
                  + Minh hoạ hệ toạ độ không gian 3 chiều $Oxyz$ (toạ độ vectơ $\vec{u} = x\vec{i} + y\vec{j} + z\vec{k}$).
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-blue-300 mb-1">2. Xuất Đề Thi Word (.doc) & Slide Bài Giảng:</h4>
                <p className="text-xs text-slate-300">
                  - <b>Xuất Word (.doc)</b>: Bấm nút trên thanh công cụ hoặc trong Ngân Hàng để tạo ngay file đề thi chuẩn Bộ GD&ĐT (đề bài, bảng đáp án, lời giải chi tiết).
                  <br />
                  - <b>Xuất Slide Chiếu</b>: Tạo bài giảng trình chiếu toàn màn hình với phím mũi tên và phím cách hiện đáp án.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-purple-300 mb-1">3. AI Gia Sư & AI Tạo Câu Đổi Số:</h4>
                <p className="text-xs text-slate-300">
                  - Trong game <i>Ai Là Triệu Phú</i>: Quyền trợ giúp <b>AI Gia Sư</b> sẽ hướng dẫn gợi ý phương pháp giải từng bước mà không lộ đáp án.
                  <br />
                  - Trong <i>Ngân Hàng Câu Hỏi</i>: Nút <b>"✨ AI Đổi Số"</b> tự động sinh ra câu hỏi biến thể mới cùng dạng để chống học sinh học vẹt.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-300 mb-1">4. Chuẩn Hoá Ký Hiệu Vectơ & MathType:</h4>
                <p className="text-xs text-slate-300">
                  - Mọi ký hiệu vectơ 1 chữ cái: <code>$\vec{u}$</code>, <code>$\vec{v}$</code>, <code>$\vec{n}$</code>, <code>$\vec{0}$</code>.
                  <br />
                  - Vectơ 2 điểm/chữ cái trở lên: <code>$\overrightarrow{AB}$</code>, <code>$\overrightarrow{CD}$</code>, <code>$\overrightarrow{MN}$</code> mũi tên mở rộng phủ kín chữ cái.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm cursor-pointer shadow-lg"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
