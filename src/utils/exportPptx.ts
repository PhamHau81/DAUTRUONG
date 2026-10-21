import { Question } from '../types/game';

/**
 * PowerPoint / Fullscreen Presentation Slide Exporter
 * Creates a standalone presentation file with keyboard navigation, KaTeX math formulas,
 * animated answer reveals, and classroom projector optimization.
 */
export function exportQuestionsToPresentation(
  questions: Question[],
  presentationTitle: string = 'BÀI GIẢNG TRÌNH CHIẾU TOÁN HỌC',
  grade: string = '12',
  lessonTitle?: string
): void {
  if (!questions || questions.length === 0) {
    alert('Không có câu hỏi nào để xuất bài giảng trình chiếu!');
    return;
  }

  const payload = JSON.stringify({
    title: presentationTitle,
    grade,
    lessonTitle: lessonTitle || 'SGK Kết Nối Tri Thức',
    questions,
  });

  const slideHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentationTitle} - Slide Trình Chiếu</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 10%, #0f172a, #020617);
      color: #f8fafc;
      font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }
    .slide-header {
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      background: rgba(2,6,23,0.7);
      backdrop-filter: blur(10px);
    }
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 32px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    .question-card {
      width: 100%;
      background: rgba(30, 41, 59, 0.7);
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 28px;
      padding: 36px 44px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(16px);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .q-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white;
      font-weight: 900;
      font-size: 13px;
      padding: 4px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .q-text {
      font-size: 26px;
      font-weight: 800;
      line-height: 1.5;
      color: #ffffff;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 8px;
    }
    .opt-btn {
      background: rgba(15, 23, 42, 0.85);
      border: 2px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 18px;
      font-weight: 700;
      color: #e2e8f0;
      transition: all 0.2s;
      cursor: pointer;
    }
    .opt-label {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 15px;
      color: #cbd5e1;
      flex-shrink: 0;
    }
    .opt-btn.correct {
      background: rgba(16, 185, 129, 0.25);
      border-color: #10b981;
      color: #a7f3d0;
      box-shadow: 0 0 25px rgba(16, 185, 129, 0.3);
    }
    .opt-btn.correct .opt-label {
      background: #10b981;
      color: #022c22;
    }
    .explanation-box {
      margin-top: 16px;
      padding: 20px 24px;
      background: rgba(15, 23, 42, 0.95);
      border-left: 4px solid #f59e0b;
      border-radius: 12px;
      font-size: 16px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .slide-footer {
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(2,6,23,0.85);
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .nav-btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;
      transition: all 0.15s;
    }
    .btn-prev { background: #334155; color: white; }
    .btn-next { background: linear-gradient(135deg, #10b981, #059669); color: #022c22; }
    .btn-reveal { background: linear-gradient(135deg, #f59e0b, #d97706); color: #451a03; }
    .btn-fullscreen { background: #1e293b; color: #94a3b8; }
    .nav-btn:hover { transform: scale(1.05); }
    .nav-btn:active { transform: scale(0.96); }
  </style>
</head>
<body>
  <div class="slide-header">
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 24px;">📐</span>
      <div>
        <h2 style="font-size: 17px; font-weight: 900; color: #fff;">${presentationTitle}</h2>
        <p style="font-size: 12px; color: #94a3b8;">Môn: Toán Lớp ${grade} • ${lessonTitle || 'SGK Kết Nối Tri Thức'}</p>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span id="slideIndicator" style="font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 8px;">1 / 1</span>
    </div>
  </div>

  <div class="slide-body">
    <div class="question-card" id="qCard">
      <div class="q-meta">
        <span class="badge" id="qBadge">Câu 1</span>
        <span id="qLevel" style="font-size: 13px; font-weight: 700; color: #94a3b8;">Thông hiểu</span>
      </div>
      <div class="q-text" id="qText">Đang tải câu hỏi...</div>
      <div class="options-grid" id="optionsGrid"></div>
      <div class="explanation-box" id="expBox" style="display: none;"></div>
    </div>
  </div>

  <div class="slide-footer">
    <button class="nav-btn btn-fullscreen" onclick="toggleFullscreen()">⛶ Toàn Màn Hình</button>
    <div style="display: flex; gap: 12px;">
      <button class="nav-btn btn-prev" onclick="prevSlide()">◀ Câu Trước (←)</button>
      <button class="nav-btn btn-reveal" id="revealBtn" onclick="toggleReveal()">💡 Hiện Đáp Án (Phím Cách)</button>
      <button class="nav-btn btn-next" onclick="nextSlide()">Câu Kế Tiếp (→) ▶</button>
    </div>
  </div>

  <script>
    const DATA = ${payload};
    let currentIndex = 0;
    let isRevealed = false;

    function renderMath(el, text) {
      if (!text) { el.innerHTML = ''; return; }
      if (window.katex) {
        try {
          let s = text.replace(/\\\\vec\\\\s*\\\\{\\\\s*([A-Z][A-Za-z0-9_']{1,})\\\\s*\\\\}/g, '\\\\overrightarrow{$1}');
          s = s.replace(/\\\\vec\\\\s+([A-Z]{2,})(?![A-Za-z0-9_'])/g, '\\\\overrightarrow{$1}');
          s = s.replace(/\\\\vec\\\\s+([a-zA-Z0-9])(?![A-Za-z0-9_'])/g, '\\\\vec{$1}');
          const parts = s.split(/(\\\\$\\$[\\\\s\\\\S]*?\\\\$\\$|\\\\$[^$\\\\n]+?\\\\$)/g);
          el.innerHTML = parts.map(part => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              return katex.renderToString(part.slice(2, -2).trim(), { displayMode: true, throwOnError: false, macros: { '\\\\vect': '\\\\vec', '\\\\vector': '\\\\vec' } });
            } else if (part.startsWith('$') && part.endsWith('$')) {
              return katex.renderToString(part.slice(1, -1).trim(), { displayMode: false, throwOnError: false, macros: { '\\\\vect': '\\\\vec', '\\\\vector': '\\\\vec' } });
            }
            return part;
          }).join('');
          return;
        } catch(e) {}
      }
      el.innerText = text;
    }

    function updateSlide() {
      isRevealed = false;
      const q = DATA.questions[currentIndex];
      document.getElementById('slideIndicator').innerText = (currentIndex + 1) + ' / ' + DATA.questions.length;
      document.getElementById('qBadge').innerText = 'CÂU ' + (currentIndex + 1);
      document.getElementById('qLevel').innerText = q.level || 'Thông hiểu';
      renderMath(document.getElementById('qText'), q.content);

      const grid = document.getElementById('optionsGrid');
      grid.innerHTML = '';
      const labels = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('div');
        btn.className = 'opt-btn';
        btn.id = 'opt_' + idx;
        const lbl = document.createElement('div');
        lbl.className = 'opt-label';
        lbl.innerText = labels[idx];
        const txt = document.createElement('div');
        txt.className = 'opt-content';
        renderMath(txt, opt);
        btn.appendChild(lbl);
        btn.appendChild(txt);
        grid.appendChild(btn);
      });

      const exp = document.getElementById('expBox');
      exp.style.display = 'none';
      renderMath(exp, '<b>Lời giải chi tiết:</b> ' + (q.explanation || 'Chưa có lời giải chi tiết.'));
      document.getElementById('revealBtn').innerText = '💡 Hiện Đáp Án (Phím Cách)';
    }

    function toggleReveal() {
      const q = DATA.questions[currentIndex];
      const correctBtn = document.getElementById('opt_' + q.correctAnswer);
      const exp = document.getElementById('expBox');
      if (!isRevealed) {
        if (correctBtn) correctBtn.classList.add('correct');
        exp.style.display = 'block';
        document.getElementById('revealBtn').innerText = 'Ẩn Đáp Án';
        isRevealed = true;
      } else {
        if (correctBtn) correctBtn.classList.remove('correct');
        exp.style.display = 'none';
        document.getElementById('revealBtn').innerText = '💡 Hiện Đáp Án (Phím Cách)';
        isRevealed = false;
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlide();
      }
    }

    function nextSlide() {
      if (currentIndex < DATA.questions.length - 1) {
        currentIndex++;
        updateSlide();
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(()=>{});
      } else {
        document.exitFullscreen().catch(()=>{});
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      } else if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleReveal();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    });

    window.addEventListener('load', () => {
      setTimeout(updateSlide, 100);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([slideHtml], { type: 'text/html;charset=utf-8' });
  const fileName = `Slide_Bai_Giang_Toan_${grade}_${Date.now()}.html`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
