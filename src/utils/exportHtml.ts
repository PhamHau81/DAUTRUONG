import { Question } from '../types/game';
import { CURRICULUM_KNTT } from '../data/curriculumKNTT';

export function generateStandaloneHtml(questionsMap: {
  millionaire: Question[];
  wheel: Question[];
  racer: Question[];
  puzzle: Question[];
}): string {
  const jsonQuestions = JSON.stringify(questionsMap);
  const jsonCurriculum = JSON.stringify(CURRICULUM_KNTT);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đấu Trường Toán Học THPT - 4 Game Show Giáo Dục (Kết Nối Tri Thức)</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      font-family: 'Be Vietnam Pro', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 60%, #030712 100%);
      color: #f8fafc;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .katex .text { font-family: 'Be Vietnam Pro', 'Inter', system-ui, sans-serif !important; }
    header {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .badge {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #000;
      font-weight: 800;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
    .btn-amber { background: linear-gradient(135deg, #f59e0b, #ea580c); color: #fff; }
    .btn-emerald { background: linear-gradient(135deg, #10b981, #059669); }
    .btn-rose { background: linear-gradient(135deg, #f43f5e, #e11d48); }
    .btn-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); }
    .btn-ghost { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.2); }
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; width: 100%; flex: 1; }
    .hub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 24px; }
    .game-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .game-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.4);
      border-color: rgba(99, 102, 241, 0.5);
    }
    .card-icon { font-size: 40px; margin-bottom: 12px; }
    .screen { display: none; }
    .screen.active { display: block; animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .game-box {
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 28px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    }
    .q-banner {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border: 2px solid #3b82f6;
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 24px;
      text-align: center;
      font-size: 1.35rem;
      font-weight: 700;
      min-height: 110px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .opt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 640px) { .opt-grid { grid-template-columns: 1fr; } }
    .opt-btn {
      background: rgba(15, 23, 42, 0.8);
      border: 2px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      padding: 16px 20px;
      border-radius: 14px;
      text-align: left;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .opt-btn:hover { background: rgba(59, 130, 246, 0.2); border-color: #60a5fa; transform: translateY(-2px); }
    .opt-btn.correct { background: rgba(16, 185, 129, 0.4) !important; border-color: #10b981 !important; }
    .opt-btn.wrong { background: rgba(239, 68, 68, 0.4) !important; border-color: #ef4444 !important; }
    .opt-tag {
      background: #3b82f6;
      color: #fff;
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: 800;
      flex-shrink: 0;
    }
    /* Millionaire Ladder */
    .ladder { display: flex; flex-direction: column-reverse; gap: 4px; }
    .ladder-item {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
    }
    .ladder-item.active { background: #eab308; color: #000; font-weight: 800; }
    .ladder-item.milestone { color: #38bdf8; font-weight: 700; }
    /* Wheel */
    #wheelCanvas { width: 340px; height: 340px; max-width: 100%; border-radius: 50%; box-shadow: 0 0 30px rgba(234, 179, 8, 0.4); }
    /* Puzzle 4x4 Grid */
    .puzzle-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      aspect-ratio: 1;
      max-width: 480px;
      margin: 0 auto;
      position: relative;
      background: #0f172a;
      border-radius: 16px;
      padding: 10px;
      border: 3px solid #6366f1;
    }
    .puzzle-bg-img {
      position: absolute;
      inset: 10px;
      background: url('https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80') center/cover no-repeat;
      border-radius: 10px;
      z-index: 1;
    }
    .puzzle-tile {
      z-index: 2;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border: 2px solid #60a5fa;
      border-radius: 8px;
      color: white;
      font-size: 1.5rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .puzzle-tile:hover { transform: scale(1.04); background: #2563eb; }
    .puzzle-tile.solved { opacity: 0; pointer-events: none; }
    /* Racer Highway */
    .track {
      background: #1e293b;
      border: 3px solid #475569;
      height: 140px;
      border-radius: 14px;
      position: relative;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .road-lines {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 4px;
      background: repeating-linear-gradient(90deg, #eab308, #eab308 30px, transparent 30px, transparent 60px);
    }
    .car {
      position: absolute;
      top: 35px;
      left: 10%;
      font-size: 48px;
      transition: left 0.5s ease;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
    }
    .finish-flag { position: absolute; right: 15px; top: 35px; font-size: 40px; }
  </style>
</head>
<body>
  <header>
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-size:28px;">📐</span>
      <div>
        <h1 style="font-size:1.15rem; font-weight:800; display:flex; align-items:center; gap:8px;">
          ĐẤU TRƯỜNG TOÁN HỌC THPT
          <span class="badge">GDPT 2018 - KNTT</span>
        </h1>
        <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
          <span style="font-size:0.75rem; font-weight:800; color:#fde047; background:rgba(234,179,8,0.2); padding:1px 8px; border-radius:6px; border:1px solid rgba(234,179,8,0.4);">
            Tác giả: PHẠM HẬU
          </span>
          <span style="font-size:0.75rem; color:#94a3b8;">• 4 Game Show Giáo Dục Offline Tương Tác</span>
        </div>
      </div>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="btn btn-ghost" onclick="exportWordFromOffline()" title="Xuất đề thi ra file Word (.doc) có sẵn bảng đáp án">📄 Xuất Đề Word (.doc)</button>
      <button class="btn btn-ghost" id="btnAudioToggle" onclick="toggleAudio()">🔊 Âm thanh: BẬT</button>
      <button class="btn btn-amber" onclick="goHome()">🏠 Về Màn Hình Chính</button>
    </div>
  </header>

  <div class="container">
    <!-- HUB SCREEN -->
    <div id="screenHub" class="screen active">
      <div style="text-align:center; margin-bottom:30px;">
        <h2 style="font-size:2.2rem; font-weight:900; background:linear-gradient(135deg, #60a5fa, #c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          HỆ THỐNG TRÒ CHƠI TOÁN HỌC KẾT NỐI TRI THỨC
        </h2>
        <div style="display:inline-block; margin-top:6px; font-size:0.85rem; font-weight:800; color:#fde047; background:rgba(234,179,8,0.2); padding:3px 12px; border-radius:999px; border:1px solid rgba(234,179,8,0.4);">
          Tác giả & Biên soạn: Thầy PHẠM HẬU
        </div>
        <p style="color:#cbd5e1; font-size:1.05rem; margin-top:8px;">
          Lớp 10, 11, 12 - Tích hợp 60 câu hỏi phân hoá chuẩn chương trình - 100% Chạy Offline
        </p>
      </div>

      <!-- CASCADING DROPDOWNS: LỚP -> CHƯƠNG -> BÀI HỌC (ĐỂ CÁC EM KHỎI PHẢI NHẬP) -->
      <div style="background:rgba(15,23,42,0.85); border:2px solid rgba(99,102,241,0.4); border-radius:20px; padding:18px; margin-bottom:24px; box-shadow:0 10px 25px rgba(0,0,0,0.4);">
        <div style="font-size:0.85rem; font-weight:800; color:#818cf8; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
          <span>📚 LỰA CHỌN BÀI HỌC THEO SGK KẾT NỐI TRI THỨC (CÁC EM KHÔNG CẦN GÕ TAY):</span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">1. Chọn Khối Lớp:</label>
            <select id="hubGradeSelect" onchange="onHubGradeChange()" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; border-radius:10px; padding:10px; font-weight:700; font-size:0.85rem; outline:none;">
              <option value="all">⭐ Tất Cả Khối Lớp (Tổng hợp 10, 11, 12)</option>
              <option value="10">📘 Toán Lớp 10 (KNTT)</option>
              <option value="11">📙 Toán Lớp 11 (KNTT)</option>
              <option value="12">📕 Toán Lớp 12 (KNTT)</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">2. Tên Chương (Dropdown tự động):</label>
            <select id="hubChapterSelect" onchange="onHubChapterChange()" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fde047; border-radius:10px; padding:10px; font-weight:700; font-size:0.85rem; outline:none;">
              <option value="all">-- Tất Cả Các Chương --</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.75rem; font-weight:700; color:#94a3b8; display:block; margin-bottom:4px;">3. Tên Bài Học (Dropdown tự động):</label>
            <select id="hubLessonSelect" onchange="onHubLessonChange()" style="width:100%; background:#0f172a; border:1px solid #475569; color:#6ee7b7; border-radius:10px; padding:10px; font-weight:700; font-size:0.85rem; outline:none;">
              <option value="all">-- Tất Cả Bài Học --</option>
            </select>
          </div>
        </div>
      </div>

      <div class="hub-grid">
        <div class="game-card" onclick="startGame('millionaire')">
          <div>
            <div class="card-icon">👑</div>
            <span class="badge" style="background:#f59e0b;">Game Show 15 Câu</span>
            <h3 style="font-size:1.4rem; font-weight:800; margin:10px 0 6px;">Ai Là Triệu Phú</h3>
            <p style="color:#94a3b8; font-size:0.9rem;">15 câu thang điểm leo đỉnh vinh quang với quyền 50:50, Gọi người thân, Khán giả.</p>
          </div>
          <button class="btn btn-amber" style="margin-top:20px; width:100%; justify-content:center;">Vào Chơi Ngay →</button>
        </div>

        <div class="game-card" onclick="startGame('wheel')">
          <div>
            <div class="card-icon">🎡</div>
            <span class="badge" style="background:#10b981; color:#fff;">May Mắn & Điểm Thưởng</span>
            <h3 style="font-size:1.4rem; font-weight:800; margin:10px 0 6px;">Vòng Quay May Mắn</h3>
            <p style="color:#94a3b8; font-size:0.9rem;">Quay bánh xe nhận điểm thưởng, mở Hộp Quà Bí Ẩn và trả lời 15 câu thử thách.</p>
          </div>
          <button class="btn btn-emerald" style="margin-top:20px; width:100%; justify-content:center;">Vào Chơi Ngay →</button>
        </div>

        <div class="game-card" onclick="startGame('racer')">
          <div>
            <div class="card-icon">🏎️</div>
            <span class="badge" style="background:#ef4444; color:#fff;">Tốc Độ & Phản Xạ</span>
            <h3 style="font-size:1.4rem; font-weight:800; margin:10px 0 6px;">Đua Xe Tốc Độ</h3>
            <p style="color:#94a3b8; font-size:0.9rem;">Trả lời đúng để nạp Nitro tăng tốc bứt phá, né chướng ngại vật cán đích 15 chặng.</p>
          </div>
          <button class="btn btn-rose" style="margin-top:20px; width:100%; justify-content:center;">Vào Chơi Ngay →</button>
        </div>

        <div class="game-card" onclick="startGame('puzzle')">
          <div>
            <div class="card-icon">🧩</div>
            <span class="badge" style="background:#8b5cf6; color:#fff;">Khám Phá Bí Ẩn</span>
            <h3 style="font-size:1.4rem; font-weight:800; margin:10px 0 6px;">Lật Mảnh Ghép</h3>
            <p style="color:#94a3b8; font-size:0.9rem;">Lật mở 16 mảnh ghép bí mật hé lộ bức tranh chân dung Toán học vĩ đại đằng sau.</p>
          </div>
          <button class="btn btn-indigo" style="margin-top:20px; width:100%; justify-content:center;">Vào Chơi Ngay →</button>
        </div>
      </div>
    </div>

    <!-- GAME 1: MILLIONAIRE SCREEN -->
    <div id="screenMillionaire" class="screen">
      <div style="display:grid; grid-template-columns: 1fr 280px; gap:24px;">
        <div class="game-box">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="display:flex; gap:10px;">
              <button class="btn btn-ghost" id="mLife50" onclick="mUse5050()">50:50</button>
              <button class="btn btn-ghost" id="mLifeAudience" onclick="mUseAudience()">📊 Khán Giả</button>
              <button class="btn btn-ghost" id="mLifeCall" onclick="mUseCall()">📞 Gọi Điện</button>
            </div>
            <div style="font-size:1.1rem; font-weight:800; color:#fbbf24;" id="mScore">Giải thưởng: 0 đ</div>
          </div>
          <div class="q-banner" id="mQuestionText">Đang tải câu hỏi...</div>
          <div class="opt-grid" id="mOptionsContainer"></div>
          <div id="mExplanation" style="display:none; margin-top:20px; padding:16px; background:rgba(15,23,42,0.8); border-left:4px solid #10b981; border-radius:10px;"></div>
        </div>
        <div class="game-box" style="padding:16px;">
          <h4 style="font-weight:800; text-align:center; margin-bottom:10px; color:#e2e8f0;">THANG TIỀN THƯỞNG</h4>
          <div class="ladder" id="mLadder"></div>
        </div>
      </div>
    </div>

    <!-- GAME 2: WHEEL SCREEN -->
    <div id="screenWheel" class="screen">
      <div class="game-box" style="text-align:center;">
        <h3 style="font-size:1.5rem; font-weight:800; margin-bottom:16px;">🎡 VÒNG QUAY MAY MẮN TOÁN HỌC</h3>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:30px; margin-bottom:24px;">
          <div style="position:relative; display:inline-block;">
            <canvas id="wheelCanvas" width="340" height="340"></canvas>
            <div style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); font-size:32px; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));">🔻</div>
          </div>
          <div style="max-width:320px; text-align:left;">
            <button class="btn btn-emerald" id="btnSpin" style="font-size:1.2rem; padding:12px 28px;" onclick="spinWheel()">BẮT ĐẦU QUAY</button>
            <div style="margin-top:16px; background:rgba(15,23,42,0.6); padding:16px; border-radius:14px;">
              <div>Điểm tích lũy: <b id="wheelScore" style="color:#10b981; font-size:1.4rem;">0</b></div>
              <div style="margin-top:6px;">Ô trúng: <b id="wheelResult" style="color:#f59e0b;">Chưa quay</b></div>
            </div>
          </div>
        </div>
        <div id="wheelQuestionArea" style="display:none; text-align:left;">
          <div class="q-banner" id="wQuestionText"></div>
          <div class="opt-grid" id="wOptionsContainer"></div>
          <div id="wExplanation" style="display:none; margin-top:16px; padding:14px; background:rgba(15,23,42,0.8); border-left:4px solid #10b981; border-radius:10px;"></div>
        </div>
      </div>
    </div>

    <!-- GAME 3: RACER SCREEN -->
    <div id="screenRacer" class="screen">
      <div class="game-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="font-size:1.4rem; font-weight:800; color:#f43f5e;">🏎️ ĐƯỜNG ĐUA TOÁN HỌC GRAND PRIX</h3>
          <div style="display:flex; gap:16px; font-weight:700;">
            <div>Chặng: <span id="racerLap" style="color:#38bdf8;">1 / 15</span></div>
            <div>Tốc độ: <span id="racerSpeed" style="color:#f59e0b;">80 km/h</span></div>
          </div>
        </div>
        <div class="track">
          <div class="road-lines"></div>
          <div class="car" id="raceCar">🏎️</div>
          <div class="finish-flag">🏁</div>
        </div>
        <div class="q-banner" id="rQuestionText"></div>
        <div class="opt-grid" id="rOptionsContainer"></div>
        <div id="rExplanation" style="display:none; margin-top:16px; padding:14px; background:rgba(15,23,42,0.8); border-left:4px solid #10b981; border-radius:10px;"></div>
      </div>
    </div>

    <!-- GAME 4: PUZZLE SCREEN -->
    <div id="screenPuzzle" class="screen">
      <div class="game-box" style="text-align:center;">
        <h3 style="font-size:1.5rem; font-weight:800; margin-bottom:8px;">🧩 LẬT MẢNH GHÉP KHO BÁU TOÁN HỌC</h3>
        <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:20px;">Lật mở 16 ô bí ẩn để giải mã bức tranh nhà toán học vĩ đại!</p>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:24px; align-items:flex-start;">
          <div class="puzzle-grid" id="puzzleGrid">
            <div class="puzzle-bg-img"></div>
          </div>
          <div style="flex:1; min-width:280px; max-width:550px; text-align:left;">
            <div id="puzzlePrompt" style="background:rgba(15,23,42,0.6); padding:20px; border-radius:14px; text-align:center;">
              👉 Hãy nhấn vào một ô số bất kỳ trên bảng để mở câu hỏi!
            </div>
            <div id="puzzleQuestionBox" style="display:none;">
              <div class="q-banner" id="pQuestionText"></div>
              <div class="opt-grid" id="pOptionsContainer"></div>
              <div id="pExplanation" style="display:none; margin-top:16px; padding:14px; background:rgba(15,23,42,0.8); border-left:4px solid #10b981; border-radius:10px;"></div>
            </div>
          </div>
        </div>
    </div>
  </div>

  <footer style="border-top:1px solid rgba(255,255,255,0.1); background:rgba(15,23,42,0.7); padding:16px; text-align:center; font-size:0.8rem; color:#94a3b8; margin-top:auto;">
    <div>Ứng dụng Game Show Giáo Dục Toán Học THPT (GDPT 2018 - Kết Nối Tri Thức Với Cuộc Sống).</div>
    <div style="margin-top:4px;">Tác giả & Phát triển: <b style="color:#fde047;">Thầy PHẠM HẬU</b> • Chạy Offline 100% không cần Internet.</div>
  </footer>

  <script>
    // Embedded Questions Data
    const QUESTIONS_DATA = ${jsonQuestions};
    const CURRICULUM_DATA = ${jsonCurriculum};

    let curGrade = '12';
    let curChapter = 'all';
    let curLesson = 'all';

    function initCurriculum() {
      const gSel = document.getElementById('hubGradeSelect');
      if (gSel) {
        curGrade = gSel.value;
        populateChapters();
      }
    }

    function onHubGradeChange() {
      const gSel = document.getElementById('hubGradeSelect');
      curGrade = gSel.value;
      curChapter = 'all';
      curLesson = 'all';
      populateChapters();
    }

    function populateChapters() {
      const cSel = document.getElementById('hubChapterSelect');
      const lSel = document.getElementById('hubLessonSelect');
      if (!cSel || !lSel) return;
      cSel.innerHTML = '<option value="all">-- Tất Cả Các Chương --</option>';
      lSel.innerHTML = '<option value="all">-- Tất Cả Bài Học --</option>';

      if (curGrade === 'all') {
        cSel.disabled = true;
        lSel.disabled = true;
        return;
      }
      cSel.disabled = false;
      const list = CURRICULUM_DATA[curGrade] || [];
      list.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = c.title;
        cSel.appendChild(opt);
      });
    }

    function onHubChapterChange() {
      const cSel = document.getElementById('hubChapterSelect');
      const lSel = document.getElementById('hubLessonSelect');
      curChapter = cSel.value;
      curLesson = 'all';
      lSel.innerHTML = '<option value="all">-- Tất Cả Bài Học --</option>';

      if (curChapter === 'all') {
        lSel.disabled = true;
        return;
      }
      lSel.disabled = false;
      const list = CURRICULUM_DATA[curGrade] || [];
      const found = list.find(c => c.id === curChapter);
      if (found) {
        found.lessons.forEach(l => {
          const opt = document.createElement('option');
          opt.value = l.id;
          opt.innerText = l.title;
          lSel.appendChild(opt);
        });
      }
    }

    function onHubLessonChange() {
      const lSel = document.getElementById('hubLessonSelect');
      curLesson = lSel.value;
    }

    function getFilteredQuestions(gameKey) {
      const list = QUESTIONS_DATA[gameKey] || [];
      let filtered = list;
      if (curGrade !== 'all') filtered = filtered.filter(q => q.grade === curGrade);
      if (curChapter !== 'all') filtered = filtered.filter(q => q.chapterId === curChapter);
      if (curLesson !== 'all') filtered = filtered.filter(q => q.lessonId === curLesson);
      if (filtered.length >= 5) return filtered;
      return list;
    }

    // Web Audio Synthesizer
    let audioEnabled = true;
    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }
    function toggleAudio() {
      audioEnabled = !audioEnabled;
      document.getElementById('btnAudioToggle').innerText = audioEnabled ? '🔊 Âm thanh: BẬT' : '🔇 Âm thanh: TẮT';
    }
    function playBeep(freq, type, duration) {
      if (!audioEnabled) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch(e) {}
    }
    function playCorrect() {
      if (!audioEnabled) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        setTimeout(() => playBeep(f, 'triangle', 0.3), i * 80);
      });
      if (window.confetti) confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    function playWrong() {
      if (!audioEnabled) return;
      playBeep(130, 'sawtooth', 0.4);
    }
    function playFanfare() {
      if (!audioEnabled) return;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        setTimeout(() => playBeep(f, 'triangle', 0.4), i * 110);
      });
      if (window.confetti) confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }

    // Helper normalize and render MathJax / KaTeX
    function normalizeClientMath(str) {
      if (!str) return '';
      var s = str;
      s = s.replace(/\\vec\s*\{\s*([A-Z][A-Za-z0-9_']{1,})\s*\}/g, '\\overrightarrow{$1}');
      s = s.replace(/\\vec\s+([A-Z]{2,})(?![A-Za-z0-9_'])/g, '\\overrightarrow{$1}');
      s = s.replace(/\\vec\s+([a-zA-Z0-9])(?![A-Za-z0-9_'])/g, '\\vec{$1}');
      s = s.replace(/\\vec\s*\{\s*([a-zA-Z])_([0-9a-zA-Z]+)\s*\}/g, '\\vec{$1}_{$2}');
      return s;
    }

    function renderMath(el, text) {
      if (window.katex) {
        try {
          const norm = normalizeClientMath(text);
          const parts = norm.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
          el.innerHTML = parts.map(part => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              return katex.renderToString(part.slice(2, -2).trim(), { displayMode: true, throwOnError: false, macros: { '\\vect': '\\vec', '\\vector': '\\vec' } });
            } else if (part.startsWith('$') && part.endsWith('$')) {
              return katex.renderToString(part.slice(1, -1).trim(), { displayMode: false, throwOnError: false, macros: { '\\vect': '\\vec', '\\vector': '\\vec' } });
            }
            return part;
          }).join('');
          return;
        } catch(e) {}
      }
      el.innerText = text;
    }

    function exportWordFromOffline() {
      var allQ = (QUESTIONS_MAP.millionaire || []).concat(QUESTIONS_MAP.wheel || []);
      var seen = {};
      var list = [];
      allQ.forEach(function(q) {
        if (!seen[q.id]) { seen[q.id] = true; list.push(q); }
      });
      var letters = ['A', 'B', 'C', 'D'];
      var qHtml = list.map(function(q, idx) {
        return '<div style="margin-bottom:12px;">' +
          '<p style="font-weight:bold; margin-bottom:4px;">Câu ' + (idx+1) + ' [' + (q.level || 'Thông hiểu') + ']: ' + q.content + '</p>' +
          '<table style="width:100%; margin-left:12px;"><tr>' +
          '<td style="width:50%; padding:2px;"><b>A.</b> ' + q.options[0] + '</td>' +
          '<td style="width:50%; padding:2px;"><b>B.</b> ' + q.options[1] + '</td></tr><tr>' +
          '<td style="width:50%; padding:2px;"><b>C.</b> ' + q.options[2] + '</td>' +
          '<td style="width:50%; padding:2px;"><b>D.</b> ' + q.options[3] + '</td></tr></table></div>';
      }).join('');
      var expHtml = list.map(function(q, idx) {
        return '<p style="margin-bottom:6px;"><b>Câu ' + (idx+1) + ': Chọn đáp án <span style="color:#c00000;">' + letters[q.correctAnswer] + '</span>.</b> <i>' + (q.explanation || '') + '</i></p>';
      }).join('');
      var doc = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
        '<head><meta charset="utf-8"><title>Đề Thi Toán KNTT</title>' +
        '<style>body{font-family:Times New Roman, serif; font-size:12pt; line-height:1.35;}</style></head><body>' +
        '<h2 style="text-align:center; color:#002060;">ĐỀ KIỂM TRA MÔN TOÁN THPT (KẾT NỐI TRI THỨC)</h2>' +
        '<p style="text-align:center; font-style:italic;">Thời gian làm bài: 45 phút • Tài liệu xuất bản offline</p><hr/>' +
        '<h3 style="color:#002060;">PHẦN I. CÂU HỎI TRẮC NGHIỆM</h3>' + qHtml +
        '<br clear="all" style="page-break-before:always" />' +
        '<h3 style="color:#002060;">PHẦN II. HƯỚNG DẪN GIẢI CHI TIẾT</h3>' + expHtml + '</body></html>';
      var blob = new Blob(['\\ufeff', doc], { type: 'application/msword;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'De_Thi_Toan_Offline_' + Date.now() + '.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Navigation
    function showScreen(id) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id).classList.add('active');
    }
    function goHome() {
      showScreen('screenHub');
    }
    function startGame(game) {
      if (game === 'millionaire') initMillionaire();
      else if (game === 'wheel') initWheel();
      else if (game === 'racer') initRacer();
      else if (game === 'puzzle') initPuzzle();
    }

    // GAME 1: MILLIONAIRE LOGIC
    const M_PRIZES = ['200.000', '400.000', '600.000', '1.000.000', '2.000.000', '3.000.000', '6.000.000', '10.000.000', '14.000.000', '22.000.000', '30.000.000', '40.000.000', '60.000.000', '85.000.000', '150.000.000'];
    let mIndex = 0;
    function initMillionaire() {
      showScreen('screenMillionaire');
      mIndex = 0;
      renderMLadder();
      loadMQuestion();
    }
    function renderMLadder() {
      const container = document.getElementById('mLadder');
      container.innerHTML = '';
      M_PRIZES.forEach((p, i) => {
        const item = document.createElement('div');
        item.className = 'ladder-item' + (i === mIndex ? ' active' : '') + (i === 4 || i === 9 || i === 14 ? ' milestone' : '');
        item.innerHTML = '<span>Câu ' + (i+1) + '</span><span>' + p + ' đ</span>';
        container.appendChild(item);
      });
    }
    function loadMQuestion() {
      renderMLadder();
      const list = getFilteredQuestions('millionaire');
      const q = list[mIndex % list.length];
      renderMath(document.getElementById('mQuestionText'), 'Câu ' + (mIndex+1) + ': ' + q.content);
      const optContainer = document.getElementById('mOptionsContainer');
      optContainer.innerHTML = '';
      document.getElementById('mExplanation').style.display = 'none';

      ['A', 'B', 'C', 'D'].forEach((char, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.id = 'mOpt' + i;
        btn.innerHTML = '<span class="opt-tag">' + char + '</span><span class="opt-txt"></span>';
        renderMath(btn.querySelector('.opt-txt'), q.options[i]);
        btn.onclick = () => checkMAnswer(i);
        optContainer.appendChild(btn);
      });
    }
    function checkMAnswer(idx) {
      const q = QUESTIONS_DATA.millionaire[mIndex];
      const optBtns = document.querySelectorAll('#mOptionsContainer .opt-btn');
      optBtns.forEach(b => b.disabled = true);

      if (idx === q.correctAnswer) {
        optBtns[idx].classList.add('correct');
        playCorrect();
        document.getElementById('mScore').innerText = 'Giải thưởng: ' + M_PRIZES[mIndex] + ' đ';
        setTimeout(() => {
          if (mIndex < 14) {
            mIndex++;
            loadMQuestion();
          } else {
            playFanfare();
            alert('CHÚC MỪNG BẠN ĐÃ TRỞ THÀNH TRIỆU PHÚ TOÁN HỌC VỚI 150.000.000 Đ!');
            goHome();
          }
        }, 1400);
      } else {
        optBtns[idx].classList.add('wrong');
        optBtns[q.correctAnswer].classList.add('correct');
        playWrong();
        const exp = document.getElementById('mExplanation');
        exp.style.display = 'block';
        renderMath(exp, '<b>Giải thích:</b> ' + q.explanation);
      }
    }
    function mUse5050() {
      const q = QUESTIONS_DATA.millionaire[mIndex];
      let removed = 0;
      for (let i = 0; i < 4; i++) {
        if (i !== q.correctAnswer && removed < 2) {
          const btn = document.getElementById('mOpt' + i);
          if (btn) btn.style.visibility = 'hidden';
          removed++;
        }
      }
      document.getElementById('mLife50').disabled = true;
    }
    function mUseAudience() {
      alert('Khán giả bình chọn: 78% chọn phương án đúng theo trực giác Toán học!');
      document.getElementById('mLifeAudience').disabled = true;
    }
    function mUseCall() {
      alert('Chuyên gia Toán THPT khuyên bạn: "Căn cứ theo SGK Kết Nối Tri Thức, hãy chọn công thức chuẩn xác!"');
      document.getElementById('mLifeCall').disabled = true;
    }

    // GAME 2: WHEEL LOGIC
    const WHEEL_SECTORS = ['100 Điểm', '200 Điểm', 'Hộp Quà 🎁', '300 Điểm', 'Nhân Đôi x2', '500 Điểm', 'May Mắn ✨', '400 Điểm'];
    const WHEEL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'];
    let wheelAngle = 0;
    let isSpinning = false;
    let wheelScore = 0;
    let wIndex = 0;
    function initWheel() {
      showScreen('screenWheel');
      drawWheel();
      wIndex = 0;
    }
    function drawWheel() {
      const cvs = document.getElementById('wheelCanvas');
      if (!cvs) return;
      const ctx = cvs.getContext('2d');
      const num = WHEEL_SECTORS.length;
      const arc = (2 * Math.PI) / num;
      ctx.clearRect(0, 0, 340, 340);
      ctx.save();
      ctx.translate(170, 170);
      ctx.rotate(wheelAngle);

      for (let i = 0; i < num; i++) {
        const ang = i * arc;
        ctx.beginPath();
        ctx.fillStyle = WHEEL_COLORS[i];
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 160, ang, ang + arc);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.rotate(ang + arc / 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(WHEEL_SECTORS[i], 140, 5);
        ctx.restore();
      }
      ctx.restore();
    }
    function spinWheel() {
      if (isSpinning) return;
      isSpinning = true;
      document.getElementById('btnSpin').disabled = true;
      let rotSpeed = 0.3 + Math.random() * 0.2;
      const friction = 0.985;
      const timer = setInterval(() => {
        wheelAngle += rotSpeed;
        rotSpeed *= friction;
        drawWheel();
        playBeep(450, 'triangle', 0.02);
        if (rotSpeed < 0.003) {
          clearInterval(timer);
          isSpinning = false;
          document.getElementById('btnSpin').disabled = false;
          const arc = (2 * Math.PI) / WHEEL_SECTORS.length;
          const normalized = (2 * Math.PI - (wheelAngle % (2 * Math.PI)) + Math.PI / 2) % (2 * Math.PI);
          const picked = Math.floor(normalized / arc) % WHEEL_SECTORS.length;
          document.getElementById('wheelResult').innerText = WHEEL_SECTORS[picked];
          loadWheelQuestion(WHEEL_SECTORS[picked]);
        }
      }, 20);
    }
    function loadWheelQuestion(reward) {
      document.getElementById('wheelQuestionArea').style.display = 'block';
      const list = getFilteredQuestions('wheel');
      const q = list[wIndex % list.length];
      renderMath(document.getElementById('wQuestionText'), 'Thử thách: ' + q.content);
      const optContainer = document.getElementById('wOptionsContainer');
      optContainer.innerHTML = '';
      document.getElementById('wExplanation').style.display = 'none';

      ['A', 'B', 'C', 'D'].forEach((char, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerHTML = '<span class="opt-tag">' + char + '</span><span class="opt-txt"></span>';
        renderMath(btn.querySelector('.opt-txt'), q.options[i]);
        btn.onclick = () => {
          if (i === q.correctAnswer) {
            btn.classList.add('correct');
            playCorrect();
            wheelScore += 200;
            document.getElementById('wheelScore').innerText = wheelScore;
            wIndex++;
          } else {
            btn.classList.add('wrong');
            playWrong();
            const exp = document.getElementById('wExplanation');
            exp.style.display = 'block';
            renderMath(exp, '<b>Giải thích:</b> ' + q.explanation);
          }
        };
        optContainer.appendChild(btn);
      });
    }

    // GAME 3: RACER LOGIC
    let rIndex = 0;
    function initRacer() {
      showScreen('screenRacer');
      rIndex = 0;
      loadRacerQuestion();
    }
    function loadRacerQuestion() {
      document.getElementById('racerLap').innerText = (rIndex + 1) + ' / 15';
      const pct = 10 + (rIndex / 15) * 80;
      document.getElementById('raceCar').style.left = pct + '%';
      const list = getFilteredQuestions('racer');
      const q = list[rIndex % list.length];
      renderMath(document.getElementById('rQuestionText'), 'Chặng ' + (rIndex+1) + ': ' + q.content);
      const optContainer = document.getElementById('rOptionsContainer');
      optContainer.innerHTML = '';
      document.getElementById('rExplanation').style.display = 'none';

      ['A', 'B', 'C', 'D'].forEach((char, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerHTML = '<span class="opt-tag">' + char + '</span><span class="opt-txt"></span>';
        renderMath(btn.querySelector('.opt-txt'), q.options[i]);
        btn.onclick = () => {
          if (i === q.correctAnswer) {
            btn.classList.add('correct');
            playCorrect();
            rIndex++;
            document.getElementById('racerSpeed').innerText = (80 + rIndex * 10) + ' km/h';
            setTimeout(() => {
              if (rIndex < 15) loadRacerQuestion();
              else {
                playFanfare();
                alert('CHÚC MỪNG BẠN ĐÃ CÁN ĐÍCH VÔ ĐỊCH ĐƯỜNG ĐUA TOÁN HỌC!');
                goHome();
              }
            }, 1000);
          } else {
            btn.classList.add('wrong');
            playWrong();
            const exp = document.getElementById('rExplanation');
            exp.style.display = 'block';
            renderMath(exp, '<b>Giải thích:</b> ' + q.explanation);
          }
        };
        optContainer.appendChild(btn);
      });
    }

    // GAME 4: PUZZLE LOGIC
    let solvedTiles = 0;
    function initPuzzle() {
      showScreen('screenPuzzle');
      const grid = document.getElementById('puzzleGrid');
      // Keep background image element
      grid.innerHTML = '<div class="puzzle-bg-img"></div>';
      solvedTiles = 0;
      for (let i = 0; i < 16; i++) {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.id = 'pTile' + i;
        tile.innerText = (i + 1);
        tile.onclick = () => openPuzzleQuestion(i);
        grid.appendChild(tile);
      }
    }
    function openPuzzleQuestion(tileIdx) {
      document.getElementById('puzzlePrompt').style.display = 'none';
      document.getElementById('puzzleQuestionBox').style.display = 'block';
      const list = getFilteredQuestions('puzzle');
      const q = list[tileIdx % list.length];
      renderMath(document.getElementById('pQuestionText'), 'Mảnh ghép #' + (tileIdx+1) + ': ' + q.content);
      const optContainer = document.getElementById('pOptionsContainer');
      optContainer.innerHTML = '';
      document.getElementById('pExplanation').style.display = 'none';

      ['A', 'B', 'C', 'D'].forEach((char, i) => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerHTML = '<span class="opt-tag">' + char + '</span><span class="opt-txt"></span>';
        renderMath(btn.querySelector('.opt-txt'), q.options[i]);
        btn.onclick = () => {
          if (i === q.correctAnswer) {
            btn.classList.add('correct');
            playCorrect();
            const t = document.getElementById('pTile' + tileIdx);
            if (t) t.classList.add('solved');
            solvedTiles++;
            setTimeout(() => {
              document.getElementById('puzzleQuestionBox').style.display = 'none';
              document.getElementById('puzzlePrompt').style.display = 'block';
              if (solvedTiles >= 16) {
                playFanfare();
                alert('TUYỆT VỜI! BẠN ĐÃ MỞ TOÀN BỘ BỨC TRANH KHO BÁU TOÁN HỌC!');
              }
            }, 800);
          } else {
            btn.classList.add('wrong');
            playWrong();
            const exp = document.getElementById('pExplanation');
            exp.style.display = 'block';
            renderMath(exp, '<b>Giải thích:</b> ' + q.explanation);
          }
        };
        optContainer.appendChild(btn);
      });
    }

    // Auto-init on load
    window.addEventListener('DOMContentLoaded', () => {
      initCurriculum();
    });
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(questionsMap: {
  millionaire: Question[];
  wheel: Question[];
  racer: Question[];
  puzzle: Question[];
}) {
  const htmlContent = generateStandaloneHtml(questionsMap);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Dau_Truong_Toan_Hoc_THPT_GDPT2018_KNTT.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
