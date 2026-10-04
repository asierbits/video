import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp} from '../../utils';
import {DotBg, Sticky} from '../Bits';
import {P} from '../cvTheme';
import {Sheet} from '../Sheet';

const MONTHS = ['MARZO', 'ABRIL', 'MAYO', 'JUNIO'];
const FLIPS = [6, 21, 36];
const CAL = {x: 150, y: 330, w: 780, h: 1000};

const Page: React.FC<{month: string; frame: number; shownAt: number}> = ({month, frame, shownAt}) => {
  const cells: React.ReactNode[] = [];
  const cw = (CAL.w - 80) / 7;
  for (let i = 0; i < 35; i++) {
    const c = i % 7;
    const r = Math.floor(i / 7);
    const cx = CAL.x + 40 + c * cw;
    const cy = CAL.y + 300 + r * 120;
    const xAt = shownAt + 1 + i * 0.32;
    const xp = lerp(frame, [xAt, xAt + 2], [0, 1]);
    cells.push(
      <g key={i}>
        <text x={cx + 14} y={cy + 40} fontFamily={fonts.round} fontWeight={600} fontSize={30} fill={P.ink} opacity={0.55}>
          {i + 1 <= 31 ? i + 1 : ''}
        </text>
        {xp > 0 && i < 31 && (
          <g stroke={P.tomato} strokeWidth={7} strokeLinecap="round" opacity={0.85}>
            <line x1={cx + 18} y1={cy + 14} x2={cx + 18 + (cw - 36) * xp} y2={cy + 14 + 80 * xp} />
            {xp > 0.5 && <line x1={cx + cw - 18} y1={cy + 14} x2={cx + cw - 18 - (cw - 36) * (xp - 0.5) * 2} y2={cy + 14 + 80 * (xp - 0.5) * 2} />}
          </g>
        )}
      </g>,
    );
  }
  return (
    <g>
      <rect x={CAL.x} y={CAL.y + 110} width={CAL.w} height={CAL.h - 110} fill={P.paper} stroke={P.ink} strokeWidth={7} />
      <text x={CAL.x + CAL.w / 2} y={CAL.y + 240} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={96} fill={P.ink}>
        {month}
      </text>
      {cells}
    </g>
  );
};

/** C1 — "3 meses." Un calendario de pared pasa hojas llenas de cruces. */
export const C01Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  const current = FLIPS.filter((f) => frame >= f + 5).length;

  return (
    <AbsoluteFill>
      <DotBg color={P.lilac} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* clavo y cordel */}
        <path d={`M 540 250 L ${CAL.x + 160} ${CAL.y + 40} M 540 250 L ${CAL.x + CAL.w - 160} ${CAL.y + 40}`} stroke={P.ink} strokeWidth={5} fill="none" />
        <circle cx={540} cy={250} r={14} fill={P.ink} />
        {/* sombra del calendario */}
        <rect x={CAL.x + 18} y={CAL.y + 24} width={CAL.w} height={CAL.h} fill={P.ink} opacity={0.25} />
        {/* cabecera */}
        <rect x={CAL.x} y={CAL.y} width={CAL.w} height={120} rx={14} fill={P.tomato} stroke={P.ink} strokeWidth={7} />
        {/* páginas: la siguiente debajo, la actual encima */}
        {current < 3 && <Page month={MONTHS[current + 1]} frame={frame} shownAt={FLIPS[current] ?? 99} />}
        {(() => {
          const f = FLIPS[current];
          const p = f !== undefined ? lerp(frame, [f, f + 5], [0, 1], ease.in) : 0;
          return (
            <g transform={`translate(0 ${CAL.y + 110}) scale(1 ${1 - p * 1.25}) translate(0 ${-(CAL.y + 110)})`} opacity={1 - p * 0.3}>
              <Page month={MONTHS[current]} frame={frame} shownAt={current === 0 ? -8 : FLIPS[current - 1]} />
            </g>
          );
        })()}
        {/* anillas */}
        {Array.from({length: 9}, (_, i) => (
          <rect key={i} x={CAL.x + 60 + i * 82} y={CAL.y + 80} width={16} height={60} rx={8} fill="#E6E2F2" stroke={P.ink} strokeWidth={5} />
        ))}

        <Sticky frame={frame} at={44} x={560} y={1100} text="3 meses." size={150} rot={-6} color={P.sun} writeDur={14} />

        {/* el protagonista, esperando */}
        <Sheet
          x={880}
          y={1830}
          scale={0.95}
          mood="bored"
          armL={14}
          armR={14 + 8 * Math.sin(frame * 0.5)}
          tilt={-3 + 2 * Math.sin(frame * 0.25)}
          look={-0.8}
          blink={random(`b${Math.floor(frame / 3)}`) > 0.93 ? 1 : 0}
        />
      </svg>
    </AbsoluteFill>
  );
};
