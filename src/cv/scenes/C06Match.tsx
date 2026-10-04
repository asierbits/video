import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp} from '../../utils';
import {DotBg, Label} from '../Bits';
import {P} from '../cvTheme';
import {Sheet} from '../Sheet';

const CARDS = [
  {role: 'Contable sénior', place: 'Presencial · Zaragoza', pay: '24k', ok: false, color: P.grey},
  {role: 'Diseñador/a UX', place: 'Remoto', pay: '34k', ok: true, color: P.tomato},
  {role: 'Product Designer', place: 'Madrid · híbrido', pay: '38k', ok: true, color: P.lilacDeep},
  {role: 'UI Designer', place: 'Remoto', pay: '32k', ok: true, color: P.mintDeep},
];
const DECIDE = [15, 45, 75, 105];
const CARD = {x: 540, y: 960, w: 640, h: 700};
const JAR = {x: 820, y: 1560};

const Heart: React.FC<{s?: number; color?: string}> = ({s = 1, color = P.tomato}) => (
  <path
    transform={`scale(${s})`}
    d="M 0 18 C -40 -6, -34 -40, -12 -38 C -4 -37, 0 -30, 0 -26 C 0 -30, 4 -37, 12 -38 C 34 -40, 40 -6, 0 18 Z"
    fill={color}
    stroke={P.ink}
    strokeWidth={5 / s}
    strokeLinejoin="round"
  />
);

/** C6 — 02: ofertas que encajan. Un "match" de trabajo: las que no cuadran, fuera. */
export const C06Match: React.FC = () => {
  const frame = useCurrentFrame();
  const matches = CARDS.filter((c, i) => c.ok && frame >= DECIDE[i] + 10).length;
  const anyMatchRecent = CARDS.some((c, i) => c.ok && frame >= DECIDE[i] && frame < DECIDE[i] + 14);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <DotBg color={P.sky} dot="rgba(29,26,47,.10)" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* requisitos */}
        {['remoto', 'Madrid', 'diseño', '+30k'].map((t, i) => (
          <g key={t} transform={`translate(${140 + i * 240} 370) scale(${lerp(frame, [2 + i * 2, 8 + i * 2], [0, 1], ease.back)})`}>
            <rect x={-105} y={-40} width={210} height={80} rx={40} fill={P.paper} stroke={P.ink} strokeWidth={6} />
            <circle cx={-68} cy={0} r={14} fill={P.mintDeep} stroke={P.ink} strokeWidth={4} />
            <text x={14} y={14} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={36} fill={P.ink}>
              {t}
            </text>
          </g>
        ))}

        {/* mazo de ofertas (de atrás hacia delante) */}
        {[...CARDS.keys()].reverse().map((i) => {
          const c = CARDS[i];
          const t = DECIDE[i];
          const lean = lerp(frame, [t - 8, t], [0, 1], ease.inOut);
          const out = lerp(frame, [t, t + 12], [0, 1], ease.in);
          if (out >= 1) return null;
          const dir = c.ok ? 1 : -1;
          const depth = Math.max(0, i - CARDS.findIndex((_, k) => frame < DECIDE[k] + 12));
          const x = CARD.x + dir * (40 * lean + 1100 * out);
          const y = CARD.y + depth * 26 - (c.ok ? 300 * out : -100 * out);
          const rot = dir * (6 * lean + 30 * out) + (depth ? (i % 2 ? 3 : -3) : 0);
          const sc = (1 - depth * 0.05) * (c.ok ? 1 - out * 0.6 : 1);
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
              <rect x={-CARD.w / 2 + 14} y={-CARD.h / 2 + 18} width={CARD.w} height={CARD.h} rx={44} fill={P.ink} opacity={0.25} />
              <rect x={-CARD.w / 2} y={-CARD.h / 2} width={CARD.w} height={CARD.h} rx={44} fill={P.paper} stroke={P.ink} strokeWidth={8} />
              <rect x={-CARD.w / 2} y={-CARD.h / 2} width={CARD.w} height={230} rx={44} fill={c.color} stroke={P.ink} strokeWidth={8} />
              <rect x={-CARD.w / 2 + 4} y={-CARD.h / 2 + 190} width={CARD.w - 8} height={44} fill={c.color} />
              <circle cx={0} cy={-CARD.h / 2 + 230} r={74} fill={P.cream} stroke={P.ink} strokeWidth={8} />
              <text x={0} y={-CARD.h / 2 + 258} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={70} fill={P.ink}>
                {c.role[0]}
              </text>
              <text x={0} y={30} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={60} fill={P.ink}>
                {c.role}
              </text>
              <text x={0} y={100} textAnchor="middle" fontFamily={fonts.round} fontWeight={600} fontSize={40} fill={P.ink} opacity={0.7}>
                {c.place}
              </text>
              <rect x={-110} y={150} width={220} height={84} rx={42} fill={P.sun} stroke={P.ink} strokeWidth={6} />
              <text x={0} y={208} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={46} fill={P.ink}>
                {c.pay}
              </text>
              {/* sello */}
              {lean > 0.2 && (
                <g transform={`translate(${c.ok ? -150 : 150} -170) rotate(${c.ok ? -16 : 16}) scale(${lerp(lean, [0.2, 0.6], [1.8, 1], ease.out)})`} opacity={lerp(lean, [0.2, 0.5], [0, 1])}>
                  <rect x={-150} y={-55} width={300} height={110} rx={18} fill="none" stroke={c.ok ? P.mintDeep : P.tomato} strokeWidth={12} />
                  <text y={30} textAnchor="middle" fontFamily={fonts.marker} fontSize={78} fill={c.ok ? P.mintDeep : P.tomato}>
                    {c.ok ? '¡MATCH!' : 'NOPE'}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* corazones volando al bote */}
        {CARDS.map((c, i) => {
          if (!c.ok) return null;
          const p = lerp(frame, [DECIDE[i] + 2, DECIDE[i] + 12], [0, 1], ease.inOut);
          if (p <= 0 || p >= 1) return null;
          const x = CARD.x + 300 * (1 - p) + (JAR.x - CARD.x) * p;
          const y = CARD.y - 300 * Math.sin(p * Math.PI) + (JAR.y - 60 - CARD.y) * p;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${p * 360})`}>
              <Heart s={2.4} />
            </g>
          );
        })}

        {/* bote de corazones */}
        <g transform={`translate(${JAR.x} ${JAR.y})`}>
          {Array.from({length: matches}, (_, k) => (
            <g key={k} transform={`translate(${(k % 2 ? 1 : -1) * 34} ${110 - k * 56}) rotate(${(k % 2 ? 1 : -1) * 14})`}>
              <Heart s={2.2} />
            </g>
          ))}
          <rect x={-130} y={-120} width={260} height={290} rx={40} fill="#fff" opacity={0.35} stroke={P.ink} strokeWidth={8} />
          <rect x={-110} y={-160} width={220} height={50} rx={14} fill={P.tomato} stroke={P.ink} strokeWidth={7} />
          <text x={0} y={240} textAnchor="middle" fontFamily={fonts.marker} fontSize={44} fill={P.ink}>
            {`${matches} match${matches === 1 ? '' : 'es'}`}
          </text>
        </g>

        <Sheet
          x={260}
          y={1830}
          scale={0.95}
          mood={anyMatchRecent ? 'wow' : 'happy'}
          armL={anyMatchRecent ? 165 : 40}
          armR={anyMatchRecent ? 165 : 40}
          squash={anyMatchRecent ? -0.1 : 0.05 * Math.sin(frame * 0.42)}
        />
      </svg>
      <Label frame={frame} n="02" title="Ofertas que encajan" sub="con tus requisitos" color={P.mint} y={90} />
    </AbsoluteFill>
  );
};
