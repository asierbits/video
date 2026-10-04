import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ease, lerp, quad, shake} from '../utils';

const CLICK = 13;
const COLS = 4;
const ROWS = 5;
const DW = 140;
const DH = 230;
const STACK: [number, number] = [540, 2860];
const WORLD_H = 3400;

const doorPos = (i: number) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return {x: 130 + c * 225, y: 330 + r * 380};
};

const ORDER = Array.from({length: COLS * ROWS}, (_, i) => i).sort((a, b) => random(`o${a}`) - random(`o${b}`));
const FLIGHT = 30;
const launchAt = (k: number) => CLICK + 4 + k * 1.6;

const Bird: React.FC<{flap: number}> = ({flap}) => (
  <g>
    <path d={`M -10 0 L -56 ${-58 * flap} L 14 -4 Z`} fill="#F7E9CF" />
    <path d="M 40 0 L -40 -10 L -30 10 Z" fill={C.cream} />
    <path d={`M -6 0 L -46 ${44 * flap} L 16 4 Z`} fill="#E8D2A8" />
    <path d="M 40 0 L 56 -10 L 46 4 Z" fill={C.amber} />
  </g>
);

/** ESCENA 8 — 03: un click. Las cartas se convierten en pájaros y vuelan hacia las puertas, que ahora se abren. */
export const S08Flock: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [CLICK], 10, 'f');

  const pan = lerp(frame, [16, 74], [0, 1], ease.inOut);
  const camY = -(WORLD_H - 1920) * (1 - pan);
  const scale = lerp(frame, [60, 90], [1, 1.06]);

  const cursorP = lerp(frame, [0, CLICK - 1], [0, 1], ease.out);
  const press = lerp(frame, [CLICK - 1, CLICK, CLICK + 5], [0, 1, 0]);

  const launched = ORDER.filter((_, k) => frame >= launchAt(k)).length;
  const stackLeft = Math.max(0, 7 - Math.floor((launched / ORDER.length) * 8));

  return (
    <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
      <svg width={1080} height={1920}>
        <defs>
          <linearGradient id="dawn" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#070B18" />
            <stop offset="0.45" stopColor="#1A1A33" />
            <stop offset="0.62" stopColor="#7A3A22" />
            <stop offset="0.75" stopColor={C.orange} />
            <stop offset="1" stopColor={C.amber} />
          </linearGradient>
          <radialGradient id="doorGlow">
            <stop offset="0" stopColor={C.amber} stopOpacity={0.8} />
            <stop offset="1" stopColor={C.amber} stopOpacity={0} />
          </radialGradient>
        </defs>
        <g transform={`translate(${540 + sh.x} ${960 + sh.y}) scale(${scale}) translate(-540 ${-960 + camY})`}>
          <rect x={-200} y={0} width={1480} height={WORLD_H} fill="url(#dawn)" />

          {/* la torre de puertas, otra vez */}
          <rect x={80} y={200} width={920} height={2000} fill="#0D1328" />
          {Array.from({length: COLS * ROWS}, (_, i) => {
            const {x, y} = doorPos(i);
            const k = ORDER.indexOf(i);
            const arrive = launchAt(k) + FLIGHT;
            const open = lerp(frame, [arrive, arrive + 6], [0, 1], ease.out);
            return (
              <g key={i}>
                {open > 0 && <ellipse cx={x + DW / 2} cy={y + DH / 2} rx={190} ry={220} fill="url(#doorGlow)" opacity={open} />}
                <rect x={x - 12} y={y - 12} width={DW + 24} height={DH + 12} fill="#0A0E1B" />
                <rect x={x} y={y} width={DW} height={DH} fill={open > 0 ? C.cream : '#05070F'} />
                {open > 0 && <rect x={x} y={y} width={DW} height={DH} fill={C.amber} opacity={0.6} />}
                {/* hoja de la puerta, girando sobre la bisagra izquierda */}
                <g transform={`translate(${x} ${y}) scale(${1 - open * 0.84} 1)`}>
                  <rect width={DW} height={DH} fill={open > 0 ? '#2B3460' : C.navy} />
                  <rect x={16} y={18} width={DW - 32} height={78} fill="none" stroke={C.steel} strokeWidth={4} />
                  <rect x={16} y={112} width={DW - 32} height={96} fill="none" stroke={C.steel} strokeWidth={4} />
                </g>
                <rect x={x - 40} y={y + DH} width={DW + 80} height={14} fill="#161D33" />
                {/* luz que cae en la repisa */}
                {open > 0 && <polygon points={`${x},${y + DH} ${x + DW},${y + DH} ${x + DW + 60},${y + DH + 120} ${x - 60},${y + DH + 120}`} fill={C.amber} opacity={0.25 * open} />}
              </g>
            );
          })}

          {/* etiqueta 03 */}
          <g transform="translate(110 2520)">
            <text fontFamily={fonts.logo} fontWeight={900} fontSize={64} fill={C.ink}>
              03
            </text>
            <text x={130} y={-14} fontFamily={fonts.sans} fontWeight={700} fontSize={32} fill={C.ink}>
              un solo click
            </text>
            <text x={130} y={26} fontFamily={fonts.serif} fontStyle="italic" fontSize={40} fill={C.ink}>
              y todas salen
            </text>
          </g>

          {/* pila de cartas */}
          {Array.from({length: stackLeft}, (_, i) => (
            <g key={i} transform={`translate(${STACK[0] + (random(`sx${i}`) - 0.5) * 20} ${STACK[1] - i * 14}) rotate(${(random(`sr${i}`) - 0.5) * 8})`}>
              <rect x={-170} y={-60} width={340} height={120} rx={8} fill={i % 2 ? '#F2E4C9' : C.cream} stroke="#C9AD7A" strokeWidth={2} />
              <path d="M -170 -60 L 0 10 L 170 -60" fill="none" stroke="#C9AD7A" strokeWidth={3} />
              <circle cx={0} cy={10} r={18} fill={C.ember} />
            </g>
          ))}

          {/* botón enviar */}
          <g transform={`translate(540 ${3120 + press * 8})`}>
            <rect x={-300} y={-62 + 14 - press * 8} width={600} height={124} rx={62} fill="#2A1508" />
            <rect x={-300} y={-62} width={600} height={124} rx={62} fill={C.ink} />
            <text x={0} y={18} textAnchor="middle" fontFamily={fonts.sans} fontWeight={700} fontSize={50} fill={C.amber}>
              enviar a las 128
            </text>
            {frame >= CLICK && frame < CLICK + 18 && (
              <rect
                x={-300 - (frame - CLICK) * 8}
                y={-62 - (frame - CLICK) * 8}
                width={600 + (frame - CLICK) * 16}
                height={124 + (frame - CLICK) * 16}
                rx={62 + (frame - CLICK) * 8}
                fill="none"
                stroke={C.ink}
                strokeWidth={5}
                opacity={1 - (frame - CLICK) / 18}
              />
            )}
          </g>

          {/* cursor */}
          <g transform={`translate(${900 - 300 * cursorP} ${3420 - 280 * cursorP}) scale(${1 - press * 0.15})`} opacity={lerp(frame, [CLICK + 8, CLICK + 14], [1, 0])}>
            <path d="M 0 0 L 0 84 L 22 64 L 38 100 L 54 92 L 38 58 L 66 58 Z" fill="#fff" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          </g>

          {/* bandada */}
          {ORDER.map((door, k) => {
            const t0 = launchAt(k);
            const p = (frame - t0) / FLIGHT;
            if (p < 0 || p > 1) return null;
            const {x, y} = doorPos(door);
            const target: [number, number] = [x + DW / 2, y + DH / 2];
            const ctrl: [number, number] = [100 + random(`bx${k}`) * 880, 1700 + random(`by${k}`) * 700];
            const q = quad(ease.inOut(p), STACK, ctrl, target);
            const flap = Math.sin(frame * 1.1 + k * 1.7);
            const sc = 2.1 - 1.0 * p;
            return (
              <g key={k} transform={`translate(${q.x} ${q.y}) rotate(${q.angle}) scale(${sc})`} opacity={lerp(p, [0.9, 1], [1, 0])}>
                <Bird flap={flap} />
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
