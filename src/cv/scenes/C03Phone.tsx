import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp, shake} from '../../utils';
import {Sticky} from '../Bits';
import {P} from '../cvTheme';

export const PHONE = {x: 330, y: 560, w: 420, h: 860};

/** Telaraña que crece desde la esquina del teléfono. p = 0..1, broken = 0..1 */
export const Cobweb: React.FC<{p: number; broken?: number}> = ({p, broken = 0}) => {
  const ox = PHONE.x + PHONE.w - 10;
  const oy = PHONE.y + 10;
  const spokes = 7;
  const radius = 330;
  const angles = Array.from({length: spokes}, (_, i) => (-90 + (i / (spokes - 1)) * 180) * (Math.PI / 180) * 0.95 + 0.05);
  const fall = broken * 400;
  return (
    <g opacity={1 - broken} transform={`translate(0 ${fall})`} stroke="#fff" strokeWidth={3.5} fill="none" strokeLinecap="round">
      {angles.map((a, i) => {
        const l = radius * lerp(p, [i * 0.06, 0.45 + i * 0.05], [0, 1]);
        return <line key={i} x1={ox} y1={oy} x2={ox + Math.cos(a) * l} y2={oy + Math.sin(a) * l} />;
      })}
      {[0.25, 0.45, 0.65, 0.85].map((k, j) => {
        const vis = lerp(p, [0.4 + j * 0.12, 0.55 + j * 0.12], [0, 1]);
        if (vis <= 0) return null;
        const pts = angles.slice(0, Math.max(2, Math.ceil(angles.length * vis))).map((a, i) => {
          const rr = radius * k * (0.92 + random(`w${j}${i}`) * 0.12);
          return `${ox + Math.cos(a) * rr},${oy + Math.sin(a) * rr}`;
        });
        return <polyline key={j} points={pts.join(' ')} />;
      })}
    </g>
  );
};

export const PhoneBody: React.FC<{children?: React.ReactNode; screen?: string}> = ({children, screen = '#2B2D4A'}) => (
  <g>
    <rect x={PHONE.x + 22} y={PHONE.y + 26} width={PHONE.w} height={PHONE.h} rx={64} fill={P.ink} opacity={0.3} />
    <rect x={PHONE.x} y={PHONE.y} width={PHONE.w} height={PHONE.h} rx={64} fill={P.ink} />
    <rect x={PHONE.x + 22} y={PHONE.y + 22} width={PHONE.w - 44} height={PHONE.h - 44} rx={46} fill={screen} />
    <rect x={PHONE.x + PHONE.w / 2 - 50} y={PHONE.y + 40} width={100} height={26} rx={13} fill={P.ink} />
    {children}
  </g>
);

/** C3 — "0 llamadas." El teléfono, boca arriba en la mesa, criando telarañas. */
export const C03Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [40], 6, 'ph');
  const web = lerp(frame, [4, 60], [0, 1]);
  const spiderY = lerp(frame, [14, 46], [PHONE.y - 80, PHONE.y + 300], ease.out) + 8 * Math.sin(frame * 0.2);
  const spiderX = PHONE.x + PHONE.w - 120 + 14 * Math.sin(frame * 0.12);
  const tumble = lerp(frame, [26, 86], [-200, 1300]);

  return (
    <AbsoluteFill style={{background: P.grey}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* vetas de la mesa */}
        {Array.from({length: 14}, (_, i) => (
          <path key={i} d={`M 0 ${80 + i * 140} C 300 ${60 + i * 140 + (i % 3) * 20}, 700 ${110 + i * 140}, 1080 ${90 + i * 140}`} stroke="#9BA6B8" strokeWidth={6} fill="none" />
        ))}
        <g transform={`translate(${sh.x} ${sh.y})`}>
          <PhoneBody>
            <text x={540} y={PHONE.y + 250} textAnchor="middle" fontFamily={fonts.round} fontWeight={600} fontSize={130} fill={P.cream}>
              18:47
            </text>
            <text x={540} y={PHONE.y + 310} textAnchor="middle" fontFamily={fonts.round} fontWeight={600} fontSize={34} fill={P.cream} opacity={0.7}>
              martes, 14 de junio
            </text>
            <rect x={PHONE.x + 50} y={PHONE.y + 400} width={PHONE.w - 100} height={130} rx={28} fill="#45486B" />
            <text x={PHONE.x + 80} y={PHONE.y + 455} fontFamily={fonts.round} fontWeight={700} fontSize={30} fill={P.cream}>
              Teléfono
            </text>
            <text x={PHONE.x + 80} y={PHONE.y + 500} fontFamily={fonts.round} fontWeight={600} fontSize={30} fill={P.cream} opacity={0.75}>
              Sin llamadas nuevas
            </text>
          </PhoneBody>
          <Cobweb p={web} />
          {/* araña */}
          <line x1={spiderX} y1={PHONE.y - 200} x2={spiderX} y2={spiderY} stroke="#fff" strokeWidth={3} />
          <g transform={`translate(${spiderX} ${spiderY})`}>
            {[-1, 1].map((s) =>
              [0, 1, 2].map((k) => (
                <path key={`${s}${k}`} d={`M 0 0 q ${s * 30} ${-20 + k * 16} ${s * 44} ${-4 + k * 18}`} stroke={P.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
              )),
            )}
            <circle r={22} fill={P.ink} />
            <circle cx={-7} cy={-4} r={6} fill="#fff" />
            <circle cx={7} cy={-4} r={6} fill="#fff" />
          </g>
        </g>
        {/* bola de paja del oeste */}
        <g transform={`translate(${tumble} ${1800 - Math.abs(Math.sin(frame * 0.3)) * 60}) rotate(${frame * 14})`}>
          {Array.from({length: 7}, (_, i) => (
            <ellipse key={i} rx={70 - i * 4} ry={48 + i * 3} transform={`rotate(${i * 26})`} fill="none" stroke="#8C6B3F" strokeWidth={6} />
          ))}
        </g>
        <Sticky frame={frame} at={38} x={540} y={1560} text="0 llamadas." size={124} rot={-3} color={P.mint} writeDur={14} />
      </svg>
    </AbsoluteFill>
  );
};
