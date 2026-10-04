import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Character} from '../components/Character';
import {C, fonts} from '../theme';
import {ease, lerp, shake, walkCycle} from '../utils';
import {Logo} from './S05Knock';

const DOOR = {x: 330, y: 260, w: 420, h: 1200};
const FLOOR = DOOR.y + DOOR.h;
const KNOCK_A = 75;
const KNOCK_B = 85;

/** ESCENA 10 — Caminas hacia la luz. La puerta está abierta. knok. */
export const S10Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [0, KNOCK_A, KNOCK_B], 12, 'fin');

  // el personaje se aleja hacia la puerta
  const walkP = lerp(frame, [0, 62], [0, 1], ease.inOut);
  const cy = 1900 + (FLOOR + 4 - 1900) * walkP;
  const cs = 2.1 - 1.55 * walkP;
  const w = walkCycle(frame, 0.36, 22);

  // la cámara se mete en la luz
  const push = lerp(frame, [46, 74], [1, 9], ease.in);
  const white = lerp(frame, [60, 72], [0, 1]);

  const logoIn = lerp(frame, [72, 78], [0, 1], ease.out);
  const squash = frame >= 72 ? 1 + 0.18 * Math.exp(-(frame - 72) / 3) * Math.cos((frame - 72) * 0.9) : 1;
  const waves = frame < KNOCK_B ? lerp(frame, [KNOCK_A, KNOCK_A + 6], [0, 1]) : lerp(frame, [KNOCK_B, KNOCK_B + 6], [0, 1]);
  const tagIn = lerp(frame, [90, 104], [0, 1], ease.out);

  const rays = Array.from({length: 9}, (_, i) => {
    const spread = (i - 4) * 120 + Math.sin(frame * 0.05 + i) * 20;
    return (
      <polygon
        key={i}
        points={`${DOOR.x + 40 + i * 42},${DOOR.y + 40} ${DOOR.x + 80 + i * 42},${DOOR.y + 40} ${540 + spread * 4 + 120},2000 ${540 + spread * 4 - 120},2000`}
        fill={C.cream}
        opacity={0.05 + 0.03 * Math.sin(frame * 0.1 + i * 2)}
      />
    );
  });

  const motes = Array.from({length: 46}, (_, i) => {
    const x = DOOR.x - 200 + random(`mx${i}`) * (DOOR.w + 400);
    const y = ((random(`my${i}`) * 1700 - frame * (0.6 + random(`ms${i}`) * 1.2)) % 1700 + 1700) % 1700 + 200;
    return <circle key={i} cx={x + Math.sin(frame * 0.05 + i) * 12} cy={y} r={1.5 + random(`mr${i}`) * 3} fill={C.cream} opacity={0.25 + random(`mo${i}`) * 0.4} />;
  });

  return (
    <AbsoluteFill style={{background: C.amber, overflow: 'hidden'}}>
      {frame < 74 && (
        <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
          <svg width={1080} height={1920}>
            <defs>
              <radialGradient id="doorLight" cx="0.5" cy="0.45" r="0.7">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="0.35" stopColor={C.cream} />
                <stop offset="1" stopColor={C.amber} />
              </radialGradient>
              <linearGradient id="spill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={C.amber} stopOpacity={0.9} />
                <stop offset="1" stopColor={C.orange} stopOpacity={0.15} />
              </linearGradient>
              <radialGradient id="halo">
                <stop offset="0" stopColor={C.amber} stopOpacity={0.6} />
                <stop offset="1" stopColor={C.amber} stopOpacity={0} />
              </radialGradient>
            </defs>
            <g transform={`translate(540 ${DOOR.y + DOOR.h * 0.45}) scale(${push}) translate(-540 ${-(DOOR.y + DOOR.h * 0.45)})`}>
              <rect x={-200} y={-200} width={1480} height={2400} fill="#0E0805" />
              {/* suelo */}
              <rect x={-200} y={FLOOR} width={1480} height={1000} fill="#1A0F08" />
              <ellipse cx={540} cy={DOOR.y + DOOR.h / 2} rx={700} ry={900} fill="url(#halo)" />
              {/* luz derramada en el suelo */}
              <polygon points={`${DOOR.x},${FLOOR} ${DOOR.x + DOOR.w},${FLOOR} ${1080 + 260},2000 ${-260},2000`} fill="url(#spill)" opacity={0.55} />
              {rays}
              {/* puerta abierta */}
              <rect x={DOOR.x - 30} y={DOOR.y - 30} width={DOOR.w + 60} height={DOOR.h + 30} fill="#050302" />
              <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} fill="url(#doorLight)" />
              {/* hoja de la puerta, abierta hacia dentro */}
              <polygon points={`${DOOR.x},${DOOR.y} ${DOOR.x + 70},${DOOR.y + 60} ${DOOR.x + 70},${FLOOR - 40} ${DOOR.x},${FLOOR}`} fill="#2B1A12" />
              {motes}
              {/* sombra larga hacia la cámara */}
              <polygon
                points={`${540 - 30 * cs},${cy} ${540 + 30 * cs},${cy} ${540 + 130 * cs + 60},2100 ${540 - 130 * cs - 60},2100`}
                fill="#000"
                opacity={0.55}
              />
              <Character
                x={540}
                y={cy}
                scale={cs}
                look="silhouette"
                back
                legL={w.legL}
                legR={w.legR}
                armL={w.armL}
                armR={w.armR}
                bob={w.bob}
                wind={0.7 + 0.3 * Math.sin(frame * 0.3)}
              />
            </g>
          </svg>
          <AbsoluteFill style={{background: '#FFF8EC', opacity: white}} />
        </AbsoluteFill>
      )}

      {/* cierre de marca */}
      {frame >= 70 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 85% 55% at 50% 46%, ${C.cream} 0%, ${C.amber} 70%, ${C.orange} 100%)`,
            opacity: lerp(frame, [70, 74], [0, 1]),
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            transform: `translate(${sh.x * 0.6}px, ${sh.y * 0.6}px)`,
          }}
        >
          <div style={{transform: `translateX(-50px) scale(${squash * (0.8 + 0.2 * logoIn)})`, opacity: logoIn}}>
            <Logo size={230} waves={waves} />
          </div>
          <div
            style={{
              marginTop: 70,
              fontFamily: fonts.serif,
              fontStyle: 'italic',
              fontSize: 66,
              color: C.ink,
              opacity: tagIn,
              transform: `translateY(${(1 - tagIn) * 24}px)`,
              textAlign: 'center',
              lineHeight: 1.1,
            }}
          >
            Que el futuro
            <br />
            te abra la puerta.
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
