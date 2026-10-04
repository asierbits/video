import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ease, lerp, shake} from '../utils';

const KNOCKS = [15, 30];
const OPEN = 60;
const DOOR = {x: 110, y: 120, w: 860, h: 1800};
const KNOCKER = {x: DOOR.w / 2, y: 820};

export const Logo: React.FC<{size?: number; color?: string; waves?: number; waveColor?: string}> = ({
  size = 230,
  color = C.ink,
  waves = 0,
  waveColor = C.ink,
}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
    <div
      style={{
        fontFamily: fonts.logo,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: -size * 0.06,
        color,
        lineHeight: 1,
      }}
    >
      knok
    </div>
    {/* ondas del golpe */}
    <svg
      width={size * 0.6}
      height={size}
      viewBox="0 0 60 100"
      style={{position: 'absolute', right: -size * 0.55, top: size * 0.02, overflow: 'visible'}}
    >
      {[0, 1, 2].map((i) => {
        const o = Math.max(0, Math.min(1, waves * 3 - i));
        return (
          <path
            key={i}
            d={`M ${10 + i * 16} ${28 - i * 8} Q ${24 + i * 20} 50 ${10 + i * 16} ${72 + i * 8}`}
            stroke={waveColor}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
            opacity={o}
          />
        );
      })}
    </svg>
  </div>
);

/** ESCENA 5 — Silencio. Toc. Toc. La puerta se abre y la luz tiene nombre: knok. */
export const S05Knock: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [...KNOCKS, OPEN], 16, 'k');

  // aldaba: se levanta y golpea
  let lift = 0;
  for (const k of KNOCKS) {
    if (frame >= k - 9 && frame < k) lift = lerp(frame, [k - 9, k - 2, k], [0, 1, 1], ease.out);
    if (frame >= k && frame < k + 6) lift = lerp(frame, [k, k + 1, k + 6], [0.35, 0, 0]);
  }
  const ringRy = 112 - 82 * lift;
  const ringCy = KNOCKER.y + ringRy;

  // la luz se cuela por las rendijas tras cada golpe
  const leak =
    lerp(frame, [KNOCKS[0], KNOCKS[0] + 3], [0, 0.45]) +
    lerp(frame, [KNOCKS[1], KNOCKS[1] + 3], [0, 0.35]) +
    lerp(frame, [44, OPEN], [0, 0.2]) +
    0.06 * Math.sin(frame * 0.9) * (frame > KNOCKS[0] ? 1 : 0);
  const reveal = lerp(frame, [0, KNOCKS[0]], [0.0, 0.25]) + lerp(frame, [KNOCKS[0], KNOCKS[0] + 2], [0, 0.5]);

  const doorAngle = lerp(frame, [OPEN, OPEN + 16], [0, -108], ease.out);
  const rattle = frame > 48 && frame < OPEN ? Math.sin(frame * 3) * 2 : 0;

  // ondas de sonido sobre la madera
  const ripples = KNOCKS.flatMap((k) =>
    [0, 1, 2].map((i) => {
      const d = frame - k - i * 3;
      if (d < 0 || d > 22) return null;
      const r = 60 + d * 34;
      return (
        <circle
          key={`${k}-${i}`}
          cx={KNOCKER.x}
          cy={KNOCKER.y + 112}
          r={r}
          fill="none"
          stroke={C.amber}
          strokeWidth={6 - i * 1.5}
          opacity={(1 - d / 22) * 0.8}
        />
      );
    }),
  );

  const dust = KNOCKS.flatMap((k) =>
    Array.from({length: 16}, (_, i) => {
      const d = frame - k;
      if (d < 0 || d > 40) return null;
      const a = random(`da${k}${i}`) * Math.PI * 2;
      const v = 4 + random(`dv${k}${i}`) * 10;
      return (
        <circle
          key={`${k}-${i}`}
          cx={KNOCKER.x + Math.cos(a) * v * d}
          cy={KNOCKER.y + 112 + Math.sin(a) * v * d + d * d * 0.15}
          r={2 + random(`dr${k}${i}`) * 3}
          fill={C.cream}
          opacity={(1 - d / 40) * 0.6}
        />
      );
    }),
  );

  const logoIn = lerp(frame, [OPEN + 4, OPEN + 20], [0, 1], ease.out);
  const flood = lerp(frame, [OPEN, OPEN + 6, OPEN + 20], [0, 1, 0.15]);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg)`}}>
        {/* lo que hay detrás de la puerta */}
        <AbsoluteFill
          style={{
            left: DOOR.x,
            top: DOOR.y,
            width: DOOR.w,
            height: DOOR.h,
            background: `radial-gradient(ellipse 80% 55% at 50% 45%, ${C.cream} 0%, ${C.amber} 45%, ${C.orange} 100%)`,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* rayos */}
          <div
            style={{
              position: 'absolute',
              inset: -600,
              background: `repeating-conic-gradient(from ${frame * 0.6}deg at 50% 50%, rgba(255,255,255,.22) 0deg 6deg, rgba(255,255,255,0) 6deg 18deg)`,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              transform: `translateX(-40px) scale(${1.25 - 0.25 * logoIn})`,
              opacity: logoIn,
              filter: `blur(${(1 - logoIn) * 14}px)`,
            }}
          >
            <Logo size={200} waves={lerp(frame, [OPEN + 14, OPEN + 26], [0, 1])} />
          </div>
        </AbsoluteFill>

        {/* marco de la puerta */}
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={DOOR.x - 60} y={DOOR.y - 60} width={DOOR.w + 120} height={DOOR.h + 60} fill="none" stroke="#120B08" strokeWidth={120} />
          {/* rendijas de luz */}
          <rect x={DOOR.x - 4} y={DOOR.y - 4} width={DOOR.w + 8} height={DOOR.h + 4} fill="none" stroke={C.amber} strokeWidth={8} opacity={Math.min(1, leak * 2)} style={{filter: 'blur(3px)'}} />
          <rect x={DOOR.x - 40} y={DOOR.y - 40} width={DOOR.w + 80} height={DOOR.h + 40} fill="none" stroke={C.amber} strokeWidth={50} opacity={leak * 0.35} style={{filter: 'blur(30px)'}} />
        </svg>

        {/* la puerta (3D) */}
        <div style={{position: 'absolute', left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, perspective: 2200}}>
          <div
            style={{
              width: '100%',
              height: '100%',
              transformOrigin: '0% 50%',
              transform: `rotateY(${doorAngle}deg) translateX(${rattle}px)`,
              backfaceVisibility: 'hidden',
            }}
          >
            <svg width={DOOR.w} height={DOOR.h}>
              <defs>
                <linearGradient id="wood" x1="0" x2="1">
                  <stop offset="0" stopColor="#2B1A12" />
                  <stop offset="0.5" stopColor="#3A2418" />
                  <stop offset="1" stopColor="#24150E" />
                </linearGradient>
                <radialGradient id="brass" cx="0.35" cy="0.3">
                  <stop offset="0" stopColor="#F7D58A" />
                  <stop offset="0.6" stopColor="#B07A2A" />
                  <stop offset="1" stopColor="#5A3A12" />
                </radialGradient>
              </defs>
              <rect width={DOOR.w} height={DOOR.h} fill="url(#wood)" />
              {Array.from({length: 7}, (_, i) => (
                <line key={i} x1={(i + 1) * (DOOR.w / 8)} y1={0} x2={(i + 1) * (DOOR.w / 8)} y2={DOOR.h} stroke="#1A0F09" strokeWidth={3} opacity={0.7} />
              ))}
              <rect x={90} y={120} width={DOOR.w - 180} height={480} fill="none" stroke="#1A0F09" strokeWidth={16} />
              <rect x={90} y={1080} width={DOOR.w - 180} height={560} fill="none" stroke="#1A0F09" strokeWidth={16} />
              {/* pomo */}
              <circle cx={DOOR.w - 90} cy={1000} r={30} fill="url(#brass)" />
              {/* aldaba */}
              <circle cx={KNOCKER.x} cy={KNOCKER.y} r={64} fill="url(#brass)" />
              <circle cx={KNOCKER.x} cy={KNOCKER.y} r={64} fill="none" stroke="#3A2408" strokeWidth={4} />
              <rect x={KNOCKER.x - 14} y={KNOCKER.y - 6} width={28} height={30} rx={8} fill="#6E4A16" />
              <ellipse cx={KNOCKER.x} cy={ringCy} rx={112} ry={ringRy} fill="none" stroke="url(#brass)" strokeWidth={24} />
              <ellipse cx={KNOCKER.x} cy={KNOCKER.y + 224} rx={34} ry={14} fill="#140C07" opacity={0.8} />
              {ripples}
              {dust}
              {/* oscuridad */}
              <rect width={DOOR.w} height={DOOR.h} fill="#000" opacity={1 - Math.min(1, reveal)} />
              {/* luz rasante cálida desde las rendijas */}
              <rect width={DOOR.w} height={DOOR.h} fill={C.amber} opacity={leak * 0.12} style={{mixBlendMode: 'screen'}} />
            </svg>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{background: C.cream, opacity: flood, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
