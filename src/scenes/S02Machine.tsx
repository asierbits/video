import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Character} from '../components/Character';
import {C, fonts} from '../theme';
import {ease, lerp, quad, shake} from '../utils';

const MONO = {x: 190, y: 150, w: 700, h: 1180};
const SLOT_Y = MONO.y + MONO.h - 150;
const THROWS = [4, 24, 44, 64, 84];
const FLIGHT = 22;
const HAND: [number, number] = [366, 1430];

export const PaperPlane: React.FC<{size?: number; color?: string}> = ({size = 70, color = C.paper}) => (
  <g transform={`scale(${size / 100})`}>
    <path d="M 50 0 L -50 -26 L -18 0 Z" fill={color} />
    <path d="M 50 0 L -18 0 L -40 26 Z" fill="#CFC4B2" />
    <path d="M 50 0 L -18 0" stroke="#A89C88" strokeWidth={2} />
  </g>
);

/** ESCENA 2 — Lanzas tu CV como un avión de papel. Un monolito lo tritura en 0,3 s. */
export const S02Machine: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, THROWS.map((t) => t + FLIGHT), 9, 'm');

  // cámara: empuje lento + plano holandés
  const s = lerp(frame, [0, 120], [1, 1.12]);
  const rot = lerp(frame, [0, 120], [-2.5, -5.5]);

  // brazo de lanzamiento
  let armR = 10;
  for (const t of THROWS) {
    const p = frame - (t - 8);
    if (p >= 0 && p < 20) {
      armR = p < 8 ? lerp(p, [0, 8], [10, -70], ease.out) : lerp(p, [8, 12, 20], [-70, 150, 40], ease.out);
    }
  }

  const hits = THROWS.filter((t) => frame >= t + FLIGHT).length;

  // rejilla del monolito
  const cells: React.ReactNode[] = [];
  const COLS = 17;
  const ROWS = 23;
  const cw = MONO.w / COLS;
  const scanY = MONO.y + ((frame * 14) % MONO.h);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cy = MONO.y + 210 + r * cw;
      if (cy > SLOT_Y - 40) continue;
      const base = random(`c${r}-${c}`);
      const tw = random(`t${r}-${c}-${Math.floor(frame / 3)}`);
      const nearScan = Math.max(0, 1 - Math.abs(cy - scanY) / 60);
      const o = 0.06 + base * 0.12 + (tw > 0.94 ? 0.4 : 0) + nearScan * 0.5;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={MONO.x + 8 + c * cw}
          y={cy}
          width={cw - 10}
          height={cw - 10}
          fill={C.cyan}
          opacity={o}
        />,
      );
    }
  }

  // aviones + desintegración
  const planes = THROWS.map((t, i) => {
    const target: [number, number] = [380 + random(`tx${i}`) * 320, SLOT_Y + 6];
    const ctrl: [number, number] = [HAND[0] + 260 + random(`cx${i}`) * 260, 520 + random(`cy${i}`) * 300];
    const p = (frame - t) / FLIGHT;
    if (p < 0) return null;
    if (p <= 1) {
      const e = ease.in(Math.min(p, 1));
      const q = quad(e, HAND, ctrl, target);
      return (
        <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${q.angle})`}>
          <PaperPlane size={80 - 30 * e} />
        </g>
      );
    }
    // al tocar: el papel se convierte en píxeles que la ranura absorbe
    const d = frame - (t + FLIGHT);
    if (d > 22) return null;
    const bits = Array.from({length: 18}, (_, k) => {
      const ang = random(`a${i}${k}`) * Math.PI * 2;
      const burst = lerp(d, [0, 6], [0, 30 + random(`r${i}${k}`) * 70], ease.out);
      const suck = lerp(d, [6, 22], [0, 1], ease.in);
      const bx = target[0] + Math.cos(ang) * burst;
      const by = target[1] + Math.sin(ang) * burst;
      const x = bx + (target[0] - bx) * suck;
      const y = by + (SLOT_Y + 4 - by) * suck;
      const sz = 8 + random(`s${i}${k}`) * 10;
      return (
        <rect
          key={k}
          x={x - sz / 2}
          y={y - sz / 2}
          width={sz}
          height={sz}
          fill={k % 3 === 0 ? C.cyan : C.paper}
          opacity={1 - suck * 0.7}
        />
      );
    });
    return <g key={i}>{bits}</g>;
  });

  // mensajes de la máquina
  const logLines = Array.from({length: hits}, (_, i) => `cand_${(347 + i).toString().padStart(4, '0')}  ··  descartado  0.3s`);

  const slotGlow = THROWS.reduce((a, t) => {
    const d = frame - (t + FLIGHT);
    return d >= 0 && d < 12 ? Math.max(a, 1 - d / 12) : a;
  }, 0);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 70% at 50% 35%, #142041 0%, ${C.night} 55%, #03040A 100%)`}}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="monoFace" x1="0" x2="1">
            <stop offset="0" stopColor="#05070E" />
            <stop offset="0.5" stopColor="#0B1122" />
            <stop offset="1" stopColor="#04050B" />
          </linearGradient>
          <linearGradient id="floorG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0D1530" />
            <stop offset="1" stopColor="#020309" />
          </linearGradient>
          <radialGradient id="slotGlow">
            <stop offset="0" stopColor={C.red} stopOpacity={0.9} />
            <stop offset="1" stopColor={C.red} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(${540 + sh.x} ${960 + sh.y}) rotate(${rot + sh.r}) scale(${s}) translate(-540 -960)`}>
          {/* suelo */}
          <rect x={-400} y={1560} width={1900} height={800} fill="url(#floorG)" />
          {/* reflejo del monolito en el suelo */}
          <rect x={MONO.x} y={1560} width={MONO.w} height={360} fill={C.cyan} opacity={0.04} />

          {/* monolito */}
          <rect x={MONO.x - 30} y={MONO.y - 30} width={MONO.w + 60} height={MONO.h + 30 + 1560 - MONO.y - MONO.h} fill="#02030799" />
          <rect x={MONO.x} y={MONO.y} width={MONO.w} height={1560 - MONO.y} fill="url(#monoFace)" />
          <rect x={MONO.x} y={MONO.y} width={MONO.w} height={1560 - MONO.y} fill="none" stroke="#1E2A4D" strokeWidth={3} />
          {cells}
          {/* línea de escaneo */}
          <rect x={MONO.x} y={scanY} width={MONO.w} height={3} fill={C.cyan} opacity={0.8} />

          {/* pantalla de registro */}
          <rect x={MONO.x + 30} y={MONO.y + 30} width={MONO.w - 60} height={150} fill="#030510" stroke="#1B2A55" strokeWidth={2} />
          <text x={MONO.x + 50} y={MONO.y + 66} fontFamily={fonts.mono} fontWeight={700} fontSize={22} fill={C.cyan} letterSpacing={4}>
            FILTRO AUTOMÁTICO · v9
          </text>
          {logLines.slice(-3).map((l, i, arr) => (
            <text
              key={l}
              x={MONO.x + 50}
              y={MONO.y + 104 + i * 30}
              fontFamily={fonts.mono}
              fontSize={21}
              fill={i === arr.length - 1 ? C.red : '#5C78B8'}
            >
              {l}
            </text>
          ))}

          {/* ranura */}
          <ellipse cx={540} cy={SLOT_Y} rx={360} ry={70} fill="url(#slotGlow)" opacity={slotGlow} />
          <rect x={MONO.x + 60} y={SLOT_Y - 8} width={MONO.w - 120} height={16} rx={8} fill="#000" />
          <rect x={MONO.x + 60} y={SLOT_Y - 2} width={MONO.w - 120} height={4} fill={slotGlow > 0 ? C.red : C.cyan} opacity={0.6 + slotGlow * 0.4} />

          {planes}

          <Character
            x={300}
            y={1640}
            scale={1.05}
            armR={armR}
            armL={-10}
            headTilt={-12}
            lean={-4}
            look="cold"
            wind={0.4 + 0.3 * Math.sin(frame * 0.25)}
            holding={frame < THROWS[THROWS.length - 1] - 2 ? <g transform="rotate(-90)"><PaperPlane size={56} /></g> : null}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
