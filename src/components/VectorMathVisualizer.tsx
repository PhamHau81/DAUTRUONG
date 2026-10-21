import React, { useState, useRef, useEffect } from 'react';
import { X, Play, RotateCcw, Compass, Eye, Sparkles, Layers } from 'lucide-react';
import { sound } from '../utils/audio';

interface VectorMathVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VectorMathVisualizer: React.FC<VectorMathVisualizerProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Visualization Mode: '2d_coord' | 'triangle_rule' | 'parallelogram' | '3d_space'
  const [mode, setMode] = useState<'2d_coord' | 'triangle_rule' | 'parallelogram' | '3d_space'>('2d_coord');

  // Coordinates state
  const [ax, setAx] = useState(1);
  const [ay, setAy] = useState(1);
  const [bx, setBx] = useState(4);
  const [by, setBy] = useState(3);

  // 3D vector state
  const [vx, setVx] = useState(2);
  const [vy, setVy] = useState(3);
  const [vz, setVz] = useState(4);

  // Computed values
  const vecABx = bx - ax;
  const vecABy = by - ay;
  const lengthAB = Math.sqrt(vecABx * vecABx + vecABy * vecABy).toFixed(2);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Center origin
    const originX = width / 2;
    const originY = height / 2;
    const scale = 35; // 35px per unit

    // Helper: Draw Arrow
    const drawArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      lineWidth: number = 3,
      label: string = ''
    ) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const headLen = 12;
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLen * Math.cos(angle - Math.PI / 7),
        toY - headLen * Math.sin(angle - Math.PI / 7)
      );
      ctx.lineTo(
        toX - headLen * Math.cos(angle + Math.PI / 7),
        toY - headLen * Math.sin(angle + Math.PI / 7)
      );
      ctx.closePath();
      ctx.fill();

      // Label
      if (label) {
        ctx.fillStyle = color;
        ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
        const midX = (fromX + toX) / 2 + 10 * Math.cos(angle - Math.PI / 2);
        const midY = (fromY + toY) / 2 + 10 * Math.sin(angle - Math.PI / 2);
        ctx.fillText(label, midX, midY);
      }
    };

    if (mode === '2d_coord' || mode === 'triangle_rule' || mode === 'parallelogram') {
      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Axes Ox, Oy
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;

      // Ox
      drawArrow(20, originY, width - 20, originY, '#94a3b8', 2, 'x');
      // Oy
      drawArrow(originX, height - 20, originX, 20, '#94a3b8', 2, 'y');

      // Origin text
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px "JetBrains Mono"';
      ctx.fillText('O (0,0)', originX - 35, originY + 18);

      // Unit vectors i and j
      drawArrow(originX, originY, originX + scale, originY, '#f59e0b', 2, 'i');
      drawArrow(originX, originY, originX, originY - scale, '#f59e0b', 2, 'j');

      if (mode === '2d_coord') {
        const pAX = originX + ax * scale;
        const pAY = originY - ay * scale;
        const pBX = originX + bx * scale;
        const pBY = originY - by * scale;

        // Draw points
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(pAX, pAY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`A(${ax}; ${ay})`, pAX + 8, pAY - 8);

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(pBX, pBY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(`B(${bx}; ${by})`, pBX + 8, pBY - 8);

        // Draw vector AB
        drawArrow(pAX, pAY, pBX, pBY, '#10b981', 3.5, `vectơ AB = (${vecABx}; ${vecABy})`);
      } else if (mode === 'triangle_rule') {
        // Triangle rule: AB + BC = AC
        const pA = { x: originX - 3 * scale, y: originY + 2 * scale };
        const pB = { x: originX + 1 * scale, y: originY - 2 * scale };
        const pC = { x: originX + 4 * scale, y: originY + 1 * scale };

        drawArrow(pA.x, pA.y, pB.x, pB.y, '#38bdf8', 3, 'vectơ AB');
        drawArrow(pB.x, pB.y, pC.x, pC.y, '#ec4899', 3, 'vectơ BC');
        drawArrow(pA.x, pA.y, pC.x, pC.y, '#10b981', 4, 'vectơ AC = AB + BC');

        // Draw points A, B, C
        [
          { p: pA, l: 'A' },
          { p: pB, l: 'B' },
          { p: pC, l: 'C' },
        ].forEach(({ p, l }) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText(l, p.x - 12, p.y - 8);
        });
      } else if (mode === 'parallelogram') {
        // Parallelogram rule: AB + AD = AC
        const pA = { x: originX - 3 * scale, y: originY + 2 * scale };
        const pB = { x: originX + 2 * scale, y: originY + 2 * scale };
        const pD = { x: originX - 1 * scale, y: originY - 2 * scale };
        const pC = { x: originX + 4 * scale, y: originY - 2 * scale };

        // Dashed lines BC & DC
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.moveTo(pB.x, pB.y);
        ctx.lineTo(pC.x, pC.y);
        ctx.lineTo(pD.x, pD.y);
        ctx.stroke();
        ctx.setLineDash([]);

        drawArrow(pA.x, pA.y, pB.x, pB.y, '#38bdf8', 3, 'vectơ AB');
        drawArrow(pA.x, pA.y, pD.x, pD.y, '#ec4899', 3, 'vectơ AD');
        drawArrow(pA.x, pA.y, pC.x, pC.y, '#f59e0b', 4, 'vectơ AC = AB + AD (đường chéo)');

        [
          { p: pA, l: 'A' },
          { p: pB, l: 'B' },
          { p: pC, l: 'C' },
          { p: pD, l: 'D' },
        ].forEach(({ p, l }) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText(l, p.x - 10, p.y + 16);
        });
      }
    } else if (mode === '3d_space') {
      // 3D Isometric Projection
      // Ox points down-left (135 deg), Oy points right (0 deg), Oz points up (90 deg)
      const project3D = (x: number, y: number, z: number) => {
        const isoAngle = Math.PI / 6; // 30 deg
        const px = originX + (y - x * Math.cos(isoAngle)) * scale;
        const py = originY + (x * Math.sin(isoAngle) - z) * scale;
        return { x: px, y: py };
      };

      const origin = { x: originX, y: originY };
      const axisLen = 5;

      const pX = project3D(axisLen, 0, 0);
      const pY = project3D(0, axisLen, 0);
      const pZ = project3D(0, 0, axisLen);

      // Draw 3D Axes
      drawArrow(origin.x, origin.y, pX.x, pX.y, '#ef4444', 2.5, 'Ox');
      drawArrow(origin.x, origin.y, pY.x, pY.y, '#10b981', 2.5, 'Oy');
      drawArrow(origin.x, origin.y, pZ.x, pZ.y, '#3b82f6', 2.5, 'Oz');

      // Draw point M(vx, vy, vz)
      const pM = project3D(vx, vy, vz);
      const pM_xy = project3D(vx, vy, 0);
      const pM_x = project3D(vx, 0, 0);
      const pM_y = project3D(0, vy, 0);
      const pM_z = project3D(0, 0, vz);

      // Projection lines (dashed)
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(pM_xy.x, pM_xy.y);
      ctx.lineTo(pM.x, pM.y);
      ctx.lineTo(pM_z.x, pM_z.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw 3D Vector u
      drawArrow(origin.x, origin.y, pM.x, pM.y, '#f59e0b', 4, `vectơ u = (${vx}; ${vy}; ${vz})`);

      // Point M
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(pM.x, pM.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`M(${vx}; ${vy}; ${vz})`, pM.x + 10, pM.y - 8);
    }
  }, [isOpen, mode, ax, ay, bx, by, vx, vy, vz]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-2xl shadow-lg">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                MÔ PHỎNG HÌNH HỌC & VECTƠ TRỰC QUAN (MATH VISUALIZER)
                <span className="text-[10px] bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  2D & 3D INTERACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Minh họa trực tiếp toạ độ vectơ, quy tắc 3 điểm, quy tắc hình bình hành và hệ toạ độ không gian Oxyz
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

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => { sound.playClick(); setMode('2d_coord'); }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              mode === '2d_coord'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            1. Vectơ Toạ Độ Oxy
          </button>
          <button
            onClick={() => { sound.playClick(); setMode('triangle_rule'); }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              mode === 'triangle_rule'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            2. Quy Tắc Ba Điểm (AB + BC = AC)
          </button>
          <button
            onClick={() => { sound.playClick(); setMode('parallelogram'); }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              mode === 'parallelogram'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            3. Quy Tắc Hình Bình Hành (AB + AD = AC)
          </button>
          <button
            onClick={() => { sound.playClick(); setMode('3d_space'); }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
              mode === '3d_space'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            4. Toạ Độ Không Gian Oxyz (3D)
          </button>
        </div>

        {/* Canvas & Controls Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4 items-center justify-center">
          {/* Canvas Box */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} width={540} height={380} className="max-w-full h-auto block" />
            <div className="absolute top-2 left-3 text-[11px] font-mono text-slate-500">
              Tỉ lệ: 1 đơn vị = 35px
            </div>
          </div>

          {/* Interactive Sliders / Coordinates */}
          <div className="w-full md:w-72 flex flex-col gap-3 text-xs bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
            <div className="font-extrabold text-sm text-cyan-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4" />
              <span>Thông Số & Toạ Độ Vectơ:</span>
            </div>

            {mode === '2d_coord' && (
              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Điểm A: ({ax}; {ay})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">X:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={ax}
                      onChange={(e) => setAx(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <span className="text-slate-400">Y:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={ay}
                      onChange={(e) => setAy(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Điểm B: ({bx}; {by})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">X:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={bx}
                      onChange={(e) => setBx(parseInt(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                    <span className="text-slate-400">Y:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={by}
                      onChange={(e) => setBy(parseInt(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                  </div>
                </div>

                {/* Vector calculation results */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                  <div className="text-emerald-400 font-bold">
                    vectơ AB = (x_B - x_A; y_B - y_A)
                  </div>
                  <div className="text-white font-bold">
                    = ({bx} - {ax}; {by} - {ay}) = <span className="text-amber-300">({vecABx}; {vecABy})</span>
                  </div>
                  <div className="text-slate-300 pt-1 border-t border-slate-800">
                    Độ dài |vectơ AB| = √({vecABx}² + {vecABy}²) = <b className="text-emerald-400">{lengthAB}</b>
                  </div>
                </div>
              </div>
            )}

            {mode === 'triangle_rule' && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-slate-300 leading-relaxed">
                <div className="font-bold text-amber-300">Quy tắc ba điểm (Phép cộng):</div>
                <p>
                  Với ba điểm bất kì $A, B, C$, ta luôn có:
                  <br />
                  <b className="text-emerald-400">vectơ AB + vectơ BC = vectơ AC</b>
                </p>
                <p className="text-[11px] text-slate-400">
                  Điểm cuối của vectơ thứ nhất trùng với điểm đầu của vectơ thứ hai.
                </p>
              </div>
            )}

            {mode === 'parallelogram' && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-slate-300 leading-relaxed">
                <div className="font-bold text-amber-300">Quy tắc hình bình hành:</div>
                <p>
                  Nếu $ABCD$ là hình bình hành, ta có:
                  <br />
                  <b className="text-amber-400">vectơ AB + vectơ AD = vectơ AC</b>
                </p>
                <p className="text-[11px] text-slate-400">
                  Tổng hai vectơ xuất phát từ đỉnh $A$ bằng vectơ đường chéo xuất phát từ $A$.
                </p>
              </div>
            )}

            {mode === '3d_space' && (
              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Toạ độ vectơ u = ({vx}; {vy}; {vz})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-red-400 font-bold">X:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={vx}
                      onChange={(e) => setVx(parseInt(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <span>{vx}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-emerald-400 font-bold">Y:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={vy}
                      onChange={(e) => setVy(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <span>{vy}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-blue-400 font-bold">Z:</span>
                    <input
                      type="range"
                      min="-4"
                      max="4"
                      value={vz}
                      onChange={(e) => setVz(parseInt(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <span>{vz}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px]">
                  <div className="text-amber-300 font-bold">
                    vectơ u = {vx}·i + {vy}·j + {vz}·k
                  </div>
                  <div className="text-slate-300">
                    Độ dài |vectơ u| = √({vx}² + {vy}² + {vz}²) = <b className="text-emerald-400">{Math.sqrt(vx*vx + vy*vy + vz*vz).toFixed(2)}</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="text-slate-400 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Kéo các thanh trượt bên phải để quan sát vectơ thay đổi hình học tương ứng trong thời gian thực.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Đóng Mô Phỏng
          </button>
        </div>
      </div>
    </div>
  );
};
