import React from 'react';
import {random} from 'remotion';
import {fonts} from '../theme';
import {ease, lerp} from '../utils';
import {P} from './cvTheme';

/** Pósit que se pega de golpe y se escribe a rotulador. */
export const Sticky: React.FC<{
  frame: number;
  at: number;
  x: number;
  y: number;
  text: string;
  rot?: number;
  size?: number;
  color?: string;
  ink?: string;
  writeDur?: number;
  strike?: number;
  extra?: string;
  extraAt?: number;
}> = ({frame, at, x, y, text, rot = -5, size = 120, color = P.sun, ink = P.ink, writeDur = 16, strike = 0, extra, extraAt = 0}) => {
  const d = frame - at;
  if (d < 0) return null;
  const slap = lerp(d, [0, 4, 8], [1.6, 0.94, 1], ease.out);
  const w = Math.max(text.length * size * 0.56 + 90, 380);
  const h = size * (extra ? 2.6 : 1.8);
  const write = lerp(d, [3, 3 + writeDur], [0, 1]);
  const write2 = extra ? lerp(frame, [extraAt, extraAt + writeDur], [0, 1]) : 0;
  const id = `st${at}${x}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${slap})`}>
      <defs>
        <clipPath id={id}>
          <rect x={-w / 2} y={-h / 2} width={w * write} height={h * 0.62} />
        </clipPath>
        <clipPath id={`${id}b`}>
          <rect x={-w / 2} y={-h / 2 + h * 0.55} width={w * write2} height={h} />
        </clipPath>
      </defs>
      <rect x={-w / 2 + 12} y={-h / 2 + 16} width={w} height={h} fill={P.ink} opacity={0.18} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={color} />
      <path d={`M ${w / 2 - 60} ${h / 2} L ${w / 2} ${h / 2 - 60} L ${w / 2} ${h / 2} Z`} fill="#000" opacity={0.08} />
      <rect x={-70} y={-h / 2 - 22} width={140} height={44} fill="#fff" opacity={0.55} transform="rotate(4)" />
      <g clipPath={`url(#${id})`}>
        <text x={0} y={(extra ? -h * 0.18 : 0) + size * 0.36} textAnchor="middle" fontFamily={fonts.marker} fontSize={size} fill={ink}>
          {text}
        </text>
      </g>
      {strike > 0 && (
        <path
          d={`M ${-w * 0.42} ${(extra ? -h * 0.18 : 0) + 4} L ${-w * 0.42 + w * 0.84 * strike} ${(extra ? -h * 0.18 : 0) - 10 * strike}`}
          stroke={P.tomato}
          strokeWidth={14}
          strokeLinecap="round"
        />
      )}
      {extra && (
        <g clipPath={`url(#${id}b)`}>
          <text x={0} y={h * 0.32} textAnchor="middle" fontFamily={fonts.marker} fontSize={size} fill={P.tomato}>
            {extra}
          </text>
        </g>
      )}
    </g>
  );
};

/** Etiqueta de función (01–04): pegatina redonda + texto. */
export const Label: React.FC<{frame: number; n: string; title: string; sub: string; color: string; x?: number; y?: number; dark?: boolean}> = ({
  frame,
  n,
  title,
  sub,
  color,
  x = 60,
  y = 110,
  dark = false,
}) => {
  const p = lerp(frame, [0, 10], [0, 1], ease.back);
  const fg = dark ? P.cream : P.ink;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        transform: `scale(${p}) rotate(${(1 - p) * -12 - 2}deg)`,
        transformOrigin: '0% 50%',
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          background: color,
          border: `7px solid ${P.ink}`,
          boxShadow: `8px 8px 0 ${P.ink}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.round,
          fontWeight: 700,
          fontSize: 54,
          color: P.ink,
        }}
      >
        {n}
      </div>
      <div style={{lineHeight: 1.05}}>
        <div style={{fontFamily: fonts.round, fontWeight: 700, fontSize: 50, color: fg}}>{title}</div>
        <div style={{fontFamily: fonts.marker, fontSize: 38, color: fg, opacity: 0.85}}>{sub}</div>
      </div>
    </div>
  );
};

/** Nube de "puf" para cambios de vestuario. */
export const Puff: React.FC<{frame: number; at: number; x: number; y: number; r?: number; color?: string}> = ({frame, at, x, y, r = 170, color = '#fff'}) => {
  const d = frame - at;
  if (d < -4 || d > 12) return null;
  const p = lerp(d, [-4, 2, 12], [0, 1, 0.3], ease.out);
  const o = lerp(d, [-4, -1, 4, 8], [0, 1, 1, 0]);
  return (
    <g opacity={o}>
      {Array.from({length: 9}, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + random(`pa${at}${i}`);
        const rr = r * (0.45 + random(`pr${at}${i}`) * 0.3) * p;
        return (
          <circle key={i} cx={x + Math.cos(a) * r * 0.55 * p} cy={y + Math.sin(a) * r * 0.55 * p} r={rr} fill={color} stroke={P.ink} strokeWidth={6} />
        );
      })}
      <circle cx={x} cy={y} r={r * 0.7 * p} fill={color} />
    </g>
  );
};

/** Fondo de papel con puntitos. */
export const DotBg: React.FC<{color: string; dot?: string; step?: number}> = ({color, dot = 'rgba(29,26,47,.10)', step = 44}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: color,
      backgroundImage: `radial-gradient(${dot} 3px, transparent 3.5px)`,
      backgroundSize: `${step}px ${step}px`,
    }}
  />
);
