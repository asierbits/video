import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Character} from '../components/Character';
import {C, fonts} from '../theme';
import {drift, ease, lerp} from '../utils';

const COLS = 5;
const ROWS = 26;
const DOOR_W = 130;
const DOOR_H = 214;
const COL_STEP = 200;
const ROW_STEP = 300;
const MARGIN = 75;
const WORLD_H = ROWS * ROW_STEP + 120;
const GROUND = WORLD_H - 60;

const KNOCK_ROW = 0;
const KNOCK_COL = 2;

const doorX = (c: number) => MARGIN + c * COL_STEP;
const doorY = (r: number) => GROUND - DOOR_H - r * ROW_STEP;

const Door: React.FC<{c: number; r: number; frame: number}> = ({c, r, frame}) => {
  const x = doorX(c);
  const y = doorY(r);
  const isMain = c === KNOCK_COL && r === KNOCK_ROW;
  const offAt = isMain ? 30 : 46 + r * 2.4 + random(`d${c}-${r}`) * 16;
  const sinceOff = frame - offAt;
  const on = sinceOff < 0;
  const red = sinceOff >= 0 && sinceOff < 5;
  const flicker = on && random(`f${c}${r}${Math.floor(frame / 2)}`) > 0.97 ? 0.4 : 1;
  const lamp = on ? C.ice : red ? C.red : '#1A2034';
  const glow = on ? 0.55 * flicker : red ? 0.9 * (1 - sinceOff / 5) : 0;

  return (
    <g>
      {/* halo de la lámpara */}
      {glow > 0 && (
        <ellipse
          cx={x + DOOR_W / 2}
          cy={y - 4}
          rx={150}
          ry={170}
          fill={`url(#${red ? 'glowRed' : 'glowIce'})`}
          opacity={glow}
        />
      )}
      {/* marco */}
      <rect x={x - 12} y={y - 12} width={DOOR_W + 24} height={DOOR_H + 12} fill="#0A0E1B" />
      {/* hoja */}
      <rect x={x} y={y} width={DOOR_W} height={DOOR_H} fill={C.navy} />
      <rect x={x + 16} y={y + 18} width={DOOR_W - 32} height={74} fill="none" stroke={C.steel} strokeWidth={4} />
      <rect x={x + 16} y={y + 108} width={DOOR_W - 32} height={88} fill="none" stroke={C.steel} strokeWidth={4} />
      <circle cx={x + DOOR_W - 22} cy={y + 118} r={7} fill={on ? '#8FA3C9' : C.steel} />
      {/* luz bajo la puerta */}
      {on && <rect x={x + 6} y={y + DOOR_H - 4} width={DOOR_W - 12} height={4} fill={C.ice} opacity={0.45} />}
      {/* lámpara */}
      <path d={`M ${x + DOOR_W / 2 - 18} ${y - 22} a 18 14 0 0 1 36 0 Z`} fill={lamp} />
      {/* número */}
      {isMain && (
        <g>
          <rect x={x + DOOR_W / 2 - 34} y={y + 34} width={68} height={30} rx={3} fill="#C9D3E8" />
          <text
            x={x + DOOR_W / 2}
            y={y + 56}
            textAnchor="middle"
            fontFamily={fonts.mono}
            fontWeight={700}
            fontSize={19}
            fill={C.ink}
          >
            {`Nº ${frame < 30 ? 346 : 347}`}
          </text>
        </g>
      )}
      {/* repisa */}
      <rect x={x - 40} y={y + DOOR_H} width={DOOR_W + 80} height={14} fill="#161D33" />
    </g>
  );
};

const FarTower: React.FC<{x: number; w: number; h: number; seed: string; frame: number; opacity: number}> = ({
  x,
  w,
  h,
  seed,
  frame,
  opacity,
}) => {
  const cells: React.ReactNode[] = [];
  const cols = Math.floor(w / 60);
  const rows = Math.floor(h / 90);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const off = 40 + r * 1.2 + random(`${seed}${r}${c}`) * 50;
      const lit = random(`${seed}L${r}${c}`) > 0.35 && frame < off;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x + 18 + c * 60}
          y={WORLD_H - 80 - (r + 1) * 90}
          width={26}
          height={46}
          fill={lit ? '#9DB8E6' : '#141A2E'}
          opacity={lit ? 0.7 : 1}
        />,
      );
    }
  }
  return (
    <g opacity={opacity}>
      <rect x={x} y={WORLD_H - 80 - h} width={w} height={h + 80} fill="#0C1224" />
      {cells}
    </g>
  );
};

/** ESCENA 1 — La torre de puertas. Llamas a una. No abre nadie. Luego ves cuántas hay. */
export const S01Doors: React.FC = () => {
  const frame = useCurrentFrame();

  // cámara: plano cerrado sobre el personaje -> gran plano general de la torre
  const pull = lerp(frame, [36, 112], [0, 1], ease.inOut);
  const s = 2.7 + (0.36 - 2.7) * pull;
  const fx = 540;
  const fy = GROUND - 150 + (-(ROWS * ROW_STEP) * 0.55) * pull;
  const d = drift(frame, 'doors', 5);
  const tx = 540 - fx * s + d.x;
  const ty = 960 - fy * s + d.y + 60 * (1 - pull);

  // llamar a la puerta: dos golpes
  const k1 = lerp(frame, [4, 9, 13], [0, 1, 0]);
  const k2 = lerp(frame, [13, 18, 22], [0, 1, 0]);
  const knockArm = 128 - 16 * Math.max(k1, k2);
  const armR = frame < 4 ? lerp(frame, [0, 4], [100, 128]) : frame < 26 ? knockArm : lerp(frame, [26, 40], [128, 8], ease.out);
  const headTilt = lerp(frame, [40, 80], [0, -14], ease.inOut);

  const doors: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) doors.push(<Door key={`${c}-${r}`} c={c} r={r} frame={frame} />);
  }

  const charX = doorX(KNOCK_COL) + DOOR_W / 2 - 26;

  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, #02030A 0%, ${C.night} 55%, #141C36 100%)`}}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="glowIce">
            <stop offset="0%" stopColor={C.ice} stopOpacity={0.55} />
            <stop offset="100%" stopColor={C.ice} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="glowRed">
            <stop offset="0%" stopColor={C.red} stopOpacity={0.8} />
            <stop offset="100%" stopColor={C.red} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="fog" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1B2440" stopOpacity={0} />
            <stop offset="100%" stopColor="#1B2440" stopOpacity={0.85} />
          </linearGradient>
        </defs>

        {/* torres lejanas (parallax lento) */}
        <g transform={`translate(${540 - 540 * s * 0.6} ${960 - fy * s * 0.6}) scale(${s * 0.6})`}>
          <FarTower x={-1500} w={900} h={5200} seed="a" frame={frame} opacity={0.6} />
          <FarTower x={1700} w={1000} h={6400} seed="b" frame={frame} opacity={0.6} />
        </g>
        <g transform={`translate(${540 - 540 * s * 0.8} ${960 - fy * s * 0.8}) scale(${s * 0.8})`}>
          <FarTower x={-1100} w={700} h={7200} seed="c" frame={frame} opacity={0.85} />
          <FarTower x={1450} w={760} h={4600} seed="d" frame={frame} opacity={0.85} />
        </g>

        <g transform={`translate(${tx} ${ty}) scale(${s})`}>
          {/* fachada */}
          <rect x={0} y={0} width={1080} height={WORLD_H} fill="#0D1328" />
          {doors}
          {/* suelo */}
          <rect x={-3000} y={GROUND} width={7000} height={600} fill="#05070F" />
          <rect x={-3000} y={GROUND - 300} width={7000} height={300} fill="url(#fog)" opacity={0.5} />
          <Character
            x={charX}
            y={GROUND}
            scale={0.62}
            armR={armR}
            armL={-4}
            headTilt={headTilt}
            look="cold"
            back
            wind={0.3 + 0.2 * Math.sin(frame * 0.2)}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
