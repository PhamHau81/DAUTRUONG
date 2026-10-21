import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  testGeminiApiKey,
} from '../utils/geminiAi';
import { sound } from '../utils/audio';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    sound.playClick();
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập API Key trước khi kiểm tra!',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const result = await testGeminiApiKey(apiKey.trim(), selectedModel);
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleSave = () => {
    sound.playFanfare();
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    setSavedSuccess(true);
    if (onSaved) onSaved();

    setTimeout(() => {
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                THIẾT LẬP GOOGLE GEMINI AI & API KEY
                <span className="text-[11px] bg-purple-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                  TỰ ĐỘNG FALLBACK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Nhập API Key cá nhân để mở khoá tính năng tạo câu hỏi Toán học tự động theo từng bài
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-xs">
          {/* Missing Key Mandatory Guidance Banner */}
          {!getStoredApiKey() && (
            <div className="p-4 bg-amber-500/15 border-2 border-amber-500 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>BẮT BUỘC NHẬP API KEY ĐỂ SỬ DỤNG TÍNH NĂNG AI:</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Để kích hoạt tính năng Trí tuệ Nhân tạo (AI) tạo đề theo bài học, bạn cần có một mã Google Gemini API Key (hoàn toàn miễn phí).
              </p>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-amber-500/30 text-[11px] text-slate-300 space-y-1">
                <div><b>Bước 1:</b> Nhấp vào link <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline font-bold">https://aistudio.google.com/api-keys</a></div>
                <div><b>Bước 2:</b> Đăng nhập tài khoản Google của bạn và bấm <b>"Create API key"</b>.</div>
                <div><b>Bước 3:</b> Sao chép mã và dán vào ô <b>"Google Gemini API Key"</b> bên dưới rồi bấm <b>"LƯU CẤU HÌNH"</b>.</div>
              </div>
            </div>
          )}

          {/* Section 1: API Key Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>1. Google Gemini API Key:</span>
              </label>

              {/* Get API key external link */}
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-black text-amber-400 hover:text-amber-300 underline flex items-center gap-1 transition-colors"
              >
                <span>Lấy API Key Miễn Phí tại Google AI Studio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Dán mã API Key của bạn (VD: AIzaSy...)"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 pr-20 text-xs font-mono outline-none focus:border-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                title={showKey ? 'Ẩn key' : 'Hiện key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                API Key được lưu bảo mật trong <b>localStorage</b> trình duyệt của bạn, không gửi về bất kỳ máy chủ trung gian nào. Bạn có thể thay đổi hoặc xóa bất cứ lúc nào.
              </span>
            </div>
          </div>

          {/* Section 2: Model Cards Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-extrabold text-sm text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>2. Chọn Mô Hình AI Mặc Định:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedModel(model.id);
                    }}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-black text-white text-xs">{model.name}</span>
                        {model.badge && (
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {model.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-800/80">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Mã định danh: <code>{model.id}</code></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Automatic Fallback Mechanism Alert */}
          <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-2xl flex items-start gap-2.5">
            <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 text-[11px] leading-relaxed">
              <b className="text-blue-300">Cơ chế Tự Động Fallback & Retry:</b> Nếu mô hình đang chọn bị quá tải hạn ngạch (mã lỗi 429) hoặc tạm thời không phản hồi, hệ thống sẽ <b>ngay lập tức thử lại với mô hình tiếp theo</b> trong danh sách mà không gián đoạn quá trình soạn câu hỏi của bạn.
            </div>
          </div>

          {/* Test connection result display */}
          {testResult && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
                testResult.success
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl flex items-center gap-2 font-bold animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Đã lưu API Key và Cấu hình Model thành công!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !apiKey.trim()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>LƯU CẤU HÌNH</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
