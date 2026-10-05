import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp, quad, shake} from '../../utils';
import {DotBg, Sticky} from '../Bits';
import {P} from '../cvTheme';
import {MiniSheet} from '../Sheet';

const TRAY: [number, number] = [250, 1150];
// hojas expulsadas cada vez más rápido
const EMIT: number[] = [];
{
  let t = 2;
  let gap = 7;
  while (t < 70) {
    EMIT.push(t);
    t += gap;
    gap = Math.max(1.2, gap * 0.86);
  }
}
const FLY = 12;

/** C2 — "1.000 CVs." Una fotocopiadora escupe copias idénticas (y aburridas) del protagonista. */
export const C02Copier: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, EMIT.filter((t) => t > 30), 2.2, 'cop');
  const count = Math.round(lerp(frame, [2, 66], [0, 1000], ease.in));
  const landed = EMIT.filter((t) => frame >= t + FLY).length;
  const pileH = landed * 9;
  const scan = (frame * 0.09) % 1;

  return (
    <AbsoluteFill>
      <DotBg color={P.sun} dot="rgba(29,26,47,.12)" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* suelo */}
        <rect x={0} y={1640} width={1080} height={280} fill="#F2B92C" />
        <line x1={0} y1={1640} x2={1080} y2={1640} stroke={P.ink} strokeWidth={7} />

        <g transform={`translate(${sh.x} ${sh.y})`}>
          {/* fotocopiadora */}
          <rect x={300} y={820} width={620} height={820} rx={24} fill="#E9E6F2" stroke={P.ink} strokeWidth={8} />
          <rect x={340} y={1180} width={540} height={170} rx={14} fill="#D6D1E6" stroke={P.ink} strokeWidth={6} />
          <rect x={340} y={1380} width={540} height={170} rx={14} fill="#D6D1E6" stroke={P.ink} strokeWidth={6} />
          <rect x={560} y={1250} width={100} height={22} rx={11} fill={P.ink} />
          <rect x={560} y={1450} width={100} height={22} rx={11} fill={P.ink} />
          {/* tapa + cristal con luz de escaneo */}
          <rect x={280} y={760} width={660} height={80} rx={16} fill="#CFC8E3" stroke={P.ink} strokeWidth={8} />
          <rect x={300 + 600 * scan} y={830} width={30} height={20} fill={P.mint} opacity={0.9} />
          {/* panel */}
          <rect x={620} y={900} width={260} height={220} rx={18} fill={P.ink} />
          <rect x={644} y={924} width={212} height={96} rx={8} fill="#9BF2C6" />
          <text x={750} y={994} textAnchor="middle" fontFamily={fonts.mono} fontWeight={700} fontSize={64} fill={P.ink}>
            {String(count).padStart(4, '0')}
          </text>
          <text x={750} y={1066} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={26} fill={P.cream} letterSpacing={3}>
            COPIAS
          </text>
          <circle cx={680} cy={1096} r={9} fill={P.tomato} opacity={frame % 6 < 3 ? 1 : 0.3} />
          {/* bandeja de salida */}
          <path d={`M 300 1080 L ${TRAY[0] - 60} ${TRAY[1] - 10} L ${TRAY[0] - 60} ${TRAY[1] + 20} L 300 1120 Z`} fill="#CFC8E3" stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
          {/* humo de esfuerzo */}
          {frame > 40 &&
            [0, 1, 2].map((i) => {
              const d = ((frame - 40 + i * 9) % 27) / 27;
              return <circle key={i} cx={860 + i * 20 + d * 40} cy={740 - d * 260} r={20 + d * 50} fill="#fff" stroke={P.ink} strokeWidth={5} opacity={1 - d} />;
            })}
        </g>

        {/* la pila de copias */}
        {Array.from({length: Math.min(landed, 90)}, (_, i) => (
          <g key={i} transform={`translate(${170 + (random(`px${i}`) - 0.5) * 50} ${1630 - i * 9}) rotate(${(random(`pr${i}`) - 0.5) * 14})`}>
            <rect x={-95} y={-6} width={190} height={14} fill={P.paper} stroke={P.ink} strokeWidth={4} />
          </g>
        ))}
        {/* copias en vuelo */}
        {EMIT.map((t, i) => {
          const p = (frame - t) / FLY;
          if (p < 0 || p > 1) return null;
          const target: [number, number] = [170, 1600 - pileH];
          const q = quad(p, [TRAY[0] - 30, TRAY[1]], [60 - random(`c${i}`) * 80, 760 + random(`d${i}`) * 200], target);
          return (
            <g key={i} transform={`translate(${q.x} ${q.y}) rotate(${(random(`r${i}`) - 0.5) * 120 * p})`}>
              <MiniSheet w={110} mood="bored" />
            </g>
          );
        })}

        <Sticky frame={frame} at={40} x={640} y={560} text="1.000 CVs." size={128} rot={4} color={P.pink} writeDur={14} />
      </svg>
    </AbsoluteFill>
  );
};
