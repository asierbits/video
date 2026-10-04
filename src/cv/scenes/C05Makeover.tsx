import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp} from '../../utils';
import {Label, Puff} from '../Bits';
import {P} from '../cvTheme';
import {Outfit, Sheet} from '../Sheet';

const LOOKS: {outfit: Outfit; to: string; hello: string; color: string}[] = [
  {outfit: 'beret', to: 'Estudio Faro', hello: '¡Hola, equipo de Faro!', color: P.tomato},
  {outfit: 'tie', to: 'Banco Sol', hello: 'Estimado equipo de Banco Sol:', color: P.lilacDeep},
  {outfit: 'headset', to: 'Nubo (startup)', hello: '¡Ey, gente de Nubo!', color: P.mintDeep},
  {outfit: 'hardhat', to: 'Grupo Obra', hello: 'Buenos días, Grupo Obra:', color: P.orange},
];
const SWAP = 30;
const LINEUP = 120;

/** C5 — 01: un correo a medida. Un probador: cada empresa, un look y un saludo distinto. */
export const C05Makeover: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(3, Math.floor(frame / SWAP));
  const look = LOOKS[idx];
  const local = frame - idx * SWAP;
  const bump = Math.exp(-local / 4) * Math.cos(local * 0.9) * 0.25;
  const beat = Math.exp(-(frame % 15) / 4);
  const lineup = frame >= LINEUP;
  const bubbleIn = lerp(local, [3, 9], [0, 1], ease.back);
  const tagSwing = 6 * Math.sin(frame * 0.2) * Math.exp(-local / 20);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* probador: rayas */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(90deg, ${P.tomato} 0 90px, #FF7B70 90px 180px)`,
        }}
      />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* cortinas */}
        <path d="M 0 0 L 230 0 Q 160 900 230 1920 L 0 1920 Z" fill="#C7342A" stroke={P.ink} strokeWidth={8} />
        <path d="M 1080 0 L 850 0 Q 920 900 850 1920 L 1080 1920 Z" fill="#C7342A" stroke={P.ink} strokeWidth={8} />
        {[60, 130].map((x) => (
          <path key={x} d={`M ${x} 0 Q ${x - 40} 900 ${x} 1920`} stroke="#A2251D" strokeWidth={8} fill="none" />
        ))}
        {[950, 1020].map((x) => (
          <path key={x} d={`M ${x} 0 Q ${x + 40} 900 ${x} 1920`} stroke="#A2251D" strokeWidth={8} fill="none" />
        ))}
        {/* foco */}
        <polygon points="440,0 640,0 900,1620 180,1620" fill="#FFF3C4" opacity={0.35 + 0.1 * beat} />
        {/* tarima */}
        <ellipse cx={540} cy={1640} rx={330} ry={70} fill="#7A2A20" stroke={P.ink} strokeWidth={8} />
        <rect x={210} y={1580} width={660} height={60} fill={P.sun} />
        <ellipse cx={540} cy={1580} rx={330} ry={70} fill={P.sun} stroke={P.ink} strokeWidth={8} />
        <path d="M 210 1580 L 210 1640 M 870 1580 L 870 1640" stroke={P.ink} strokeWidth={8} />

        {!lineup ? (
          <>
            <Sheet
              x={540}
              y={1580}
              scale={1.75}
              mood="happy"
              outfit={look.outfit}
              armL={40 + 50 * beat}
              armR={120 + 30 * Math.sin(frame * 0.4)}
              squash={bump - 0.04 * beat}
              stance={1.1}
            />
            {/* bocadillo con el saludo personalizado */}
            <g transform={`translate(540 640) scale(${bubbleIn}) rotate(-2)`}>
              <rect x={-420} y={-90} width={840} height={170} rx={50} fill="#fff" stroke={P.ink} strokeWidth={8} />
              <path d="M -30 78 L 10 150 L 40 78" fill="#fff" stroke={P.ink} strokeWidth={8} strokeLinejoin="round" />
              <rect x={-36} y={70} width={84} height={16} fill="#fff" />
              <text x={0} y={18} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={look.hello.length > 24 ? 50 : 58} fill={P.ink}>
                {look.hello}
              </text>
            </g>
            {/* etiqueta de sastre */}
            <g transform={`translate(830 900) rotate(${tagSwing})`}>
              <line x1={0} y1={-120} x2={0} y2={0} stroke={P.ink} strokeWidth={4} />
              <g transform="rotate(8)">
                <rect x={-150} y={0} width={300} height={130} rx={18} fill={P.cream} stroke={P.ink} strokeWidth={6} />
                <circle cx={0} cy={22} r={9} fill={P.ink} />
                <text x={0} y={70} textAnchor="middle" fontFamily={fonts.marker} fontSize={28} fill={P.ink}>
                  para:
                </text>
                <text x={0} y={108} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={32} fill={look.color}>
                  {look.to}
                </text>
              </g>
            </g>
            {[0, 1, 2, 3].map((i) => (
              <Puff key={i} frame={frame} at={i * SWAP} x={540} y={1180} r={230} />
            ))}
          </>
        ) : (
          <>
            {LOOKS.map((l, i) => {
              const p = lerp(frame, [LINEUP + i * 3, LINEUP + i * 3 + 8], [0, 1], ease.back);
              const hop = Math.abs(Math.sin((frame + i * 4) * 0.21)) * 30;
              return (
                <Sheet
                  key={l.outfit}
                  x={180 + i * 240}
                  y={1600 - hop}
                  scale={0.82 * p}
                  mood="happy"
                  outfit={l.outfit}
                  armL={150 - (i % 2) * 40}
                  armR={110 + (i % 2) * 40}
                />
              );
            })}
            <Puff frame={frame} at={LINEUP} x={540} y={1250} r={300} />
            <g transform={`translate(540 760) rotate(-3) scale(${lerp(frame, [LINEUP + 6, LINEUP + 14], [0, 1], ease.back)})`}>
              <text textAnchor="middle" fontFamily={fonts.marker} fontSize={96} fill={P.cream} stroke={P.ink} strokeWidth={14} paintOrder="stroke">
                mismo tú,
              </text>
              <text y={110} textAnchor="middle" fontFamily={fonts.marker} fontSize={96} fill={P.sun} stroke={P.ink} strokeWidth={14} paintOrder="stroke">
                4 correos distintos
              </text>
            </g>
          </>
        )}
      </svg>
      <Label frame={frame} n="01" title="Correo a medida" sub="para cada empresa" color={P.sun} />
    </AbsoluteFill>
  );
};
