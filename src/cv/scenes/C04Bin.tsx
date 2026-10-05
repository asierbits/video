import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Logo} from '../../scenes/S05Knock';
import {fonts} from '../../theme';
import {ease, lerp} from '../../utils';
import {DotBg} from '../Bits';
import {P} from '../cvTheme';
import {Sheet} from '../Sheet';

const BONKS = [15, 30];
const PHONE_IN = 42;
const DING = 52;
const JUMP = 76;

const PaperBall: React.FC<{r?: number; seed: string}> = ({r = 46, seed}) => (
  <g>
    <circle r={r} fill={P.paper} stroke={P.ink} strokeWidth={6} />
    {Array.from({length: 4}, (_, i) => {
      const a = random(`${seed}${i}`) * Math.PI * 2;
      return (
        <path
          key={i}
          d={`M ${Math.cos(a) * r * 0.7} ${Math.sin(a) * r * 0.7} L ${Math.cos(a + 1.4) * r * 0.2} ${Math.sin(a + 1.4) * r * 0.3} L ${Math.cos(a + 2.4) * r * 0.6} ${Math.sin(a + 2.4) * r * 0.6}`}
          stroke={P.ink}
          strokeWidth={4}
          fill="none"
          strokeLinejoin="round"
        />
      );
    })}
  </g>
);

/** C4 — En la papelera. Le llueven bolas de papel. Hasta que alguien le ofrece una mano. */
export const C04Bin: React.FC = () => {
  const frame = useCurrentFrame();

  let squash = 0;
  for (const b of BONKS) if (frame >= b) squash += 0.5 * Math.exp(-(frame - b) / 3) * Math.cos((frame - b) * 1.2);

  const hopeful = frame >= DING + 2;
  const crouch = lerp(frame, [JUMP - 6, JUMP], [0, 0.6]);
  const launch = lerp(frame, [JUMP, JUMP + 12], [0, 1], ease.in);
  const charY = 1420 - launch * 1500;
  const charSquash = frame < JUMP ? Math.max(squash, crouch) : -0.5 * (1 - launch * 0.5);

  const phoneY = lerp(frame, [PHONE_IN, PHONE_IN + 12], [-700, 420], ease.back) + 10 * Math.sin(frame * 0.18);
  const ding = frame >= DING ? Math.exp(-(frame - DING) / 6) : 0;
  const bubble = lerp(frame, [DING + 2, DING + 8], [0, 1], ease.back);

  return (
    <AbsoluteFill>
      <DotBg color={P.pink} dot="rgba(29,26,47,.08)" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* suelo */}
        <rect x={0} y={1780} width={1080} height={140} fill="#F07FAE" />
        <line x1={0} y1={1780} x2={1080} y2={1780} stroke={P.ink} strokeWidth={7} />

        {/* parte trasera de la papelera */}
        <ellipse cx={540} cy={1240} rx={250} ry={50} fill="#5A4A86" stroke={P.ink} strokeWidth={7} />

        {/* bolas dentro */}
        {[-170, -80, 120, 190].map((dx, i) => (
          <g key={i} transform={`translate(${540 + dx} ${1250 - (i % 2) * 20})`}>
            <PaperBall seed={`in${i}`} r={50} />
          </g>
        ))}

        {/* protagonista */}
        <Sheet
          x={540}
          y={charY}
          scale={1.25}
          mood={hopeful ? 'wow' : 'sad'}
          armL={hopeful ? 150 : 20}
          armR={hopeful ? 150 : 20}
          squash={charSquash}
          tilt={hopeful ? 0 : -6}
          look={hopeful ? 0 : -0.5}
          legs={frame >= JUMP}
        />

        {/* frente de la papelera (rejilla) */}
        <path d="M 290 1240 L 360 1790 L 720 1790 L 790 1240 Z" fill="#7A68B8" stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
        {Array.from({length: 9}, (_, i) => {
          const t = (i + 1) / 10;
          return <line key={i} x1={290 + 500 * t} y1={1244} x2={360 + 360 * t} y2={1786} stroke={P.ink} strokeWidth={4} opacity={0.5} />;
        })}
        <path d="M 290 1240 Q 540 1300 790 1240" stroke={P.ink} strokeWidth={8} fill="none" />

        {/* bolas que caen y rebotan en la cabeza */}
        {BONKS.map((b, i) => {
          const d = frame - b;
          const headY = charY - 1.25 * 300;
          let x = 520 + i * 60;
          let y: number;
          if (d < 0) {
            const p = lerp(d, [-10, 0], [0, 1], ease.in);
            y = -100 + (headY - 50 + 100) * p;
          } else {
            const side = i ? 1 : -1;
            x += side * d * 22;
            y = headY - 50 - d * 26 + d * d * 2.2;
          }
          if (d < -10 || d > 30) return null;
          return (
            <g key={b} transform={`translate(${x} ${y}) rotate(${frame * 20})`}>
              <PaperBall seed={`b${i}`} r={44} />
            </g>
          );
        })}
        {BONKS.map((b) =>
          frame >= b && frame < b + 8 ? (
            <text key={`t${b}`} x={640} y={1060} fontFamily={fonts.marker} fontSize={90} fill={P.ink} transform={`rotate(-10 640 1060)`}>
              ¡bonk!
            </text>
          ) : null,
        )}

        {/* el móvil con knok baja del cielo */}
        <g transform={`translate(780 ${phoneY}) rotate(${8 + 3 * Math.sin(frame * 0.2)})`}>
          {ding > 0 &&
            [0, 1].map((k) => (
              <circle key={k} cx={0} cy={0} r={230 + (1 - ding) * 120 + k * 50} fill="none" stroke={P.amber} strokeWidth={10 * ding} opacity={ding} />
            ))}
          <rect x={-150} y={-280} width={300} height={560} rx={44} fill={P.ink} />
          <rect x={-134} y={-264} width={268} height={528} rx={32} fill={P.amber} />
          <foreignObject x={-134} y={-80} width={268} height={160}>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160, transform: 'translateX(-14px)'}}>
              <Logo size={62} />
            </div>
          </foreignObject>
        </g>
        {bubble > 0 && (
          <g transform={`translate(590 ${phoneY + 360}) scale(${bubble})`}>
            <rect x={-330} y={-100} width={600} height={150} rx={40} fill="#fff" stroke={P.ink} strokeWidth={7} />
            <path d="M 160 -100 L 200 -160 L 220 -100" fill="#fff" stroke={P.ink} strokeWidth={7} strokeLinejoin="round" />
            <rect x={150} y={-108} width={80} height={14} fill="#fff" />
            <text x={-30} y={-5} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={54} fill={P.ink}>
              ¿Te echo una mano?
            </text>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
