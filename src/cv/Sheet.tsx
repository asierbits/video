import React from 'react';
import {fonts} from '../theme';
import {OUTLINE, P} from './cvTheme';

export type Mood = 'bored' | 'sad' | 'happy' | 'wow';
export type Outfit = 'none' | 'beret' | 'tie' | 'headset' | 'hardhat';

export type SheetProps = {
  x: number;
  y: number;
  scale?: number;
  mood?: Mood;
  outfit?: Outfit;
  /** ángulo de los brazos en grados: 0 = abajo, 90 = horizontal hacia fuera, 180 = arriba */
  armL?: number;
  armR?: number;
  /** separación de los pies */
  stance?: number;
  /** >0 aplasta, <0 estira (squash & stretch) */
  squash?: number;
  tilt?: number;
  blink?: number;
  /** mirada (-1..1) */
  look?: number;
  legs?: boolean;
  opacity?: number;
};

const W = 180;
const H = 240;
const TOP = -60 - H;

/**
 * El protagonista: un CV con cara, brazos y piernas "de manguera" (rubber hose).
 * Origen (0,0) = suelo, entre los pies.
 */
export const Sheet: React.FC<SheetProps> = ({
  x,
  y,
  scale = 1,
  mood = 'happy',
  outfit = 'none',
  armL = 20,
  armR = 20,
  stance = 1,
  squash = 0,
  tilt = 0,
  blink = 0,
  look = 0,
  legs = true,
  opacity = 1,
}) => {
  const sx = 1 + squash * 0.35;
  const sy = 1 - squash * 0.35;

  const arm = (side: -1 | 1, angle: number) => {
    const sh: [number, number] = [side * (W / 2 - 4), TOP + 120];
    const a = (angle * Math.PI) / 180;
    const len = 100;
    const hx = sh[0] + side * Math.sin(a) * len;
    const hy = sh[1] + Math.cos(a) * len;
    const cx = (sh[0] + hx) / 2 + side * 26 * Math.cos(a);
    const cy = (sh[1] + hy) / 2 - 10;
    return (
      <g>
        <path d={`M ${sh[0]} ${sh[1]} Q ${cx} ${cy} ${hx} ${hy}`} stroke={P.ink} strokeWidth={9} fill="none" strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={17} fill="#fff" stroke={P.ink} strokeWidth={6} />
      </g>
    );
  };

  const eyeY = TOP + 92;
  const lid = mood === 'bored' ? 0.55 : mood === 'sad' ? 0.3 : 0;
  const eyeR = mood === 'wow' ? 22 : 17;
  const eye = (ex: number, side: number) => {
    const open = Math.max(0.08, 1 - blink);
    return (
      <g>
        <ellipse cx={ex} cy={eyeY} rx={eyeR} ry={(eyeR + 4) * open} fill="#fff" stroke={P.ink} strokeWidth={5} />
        <circle cx={ex + look * 7} cy={eyeY + 4 * open} r={(mood === 'wow' ? 11 : 9) * Math.min(1, open * 1.6)} fill={P.ink} />
        {mood === 'wow' && <circle cx={ex + look * 7 - 4} cy={eyeY - 2} r={4} fill="#fff" />}
        {lid > 0 && (
          <path
            d={`M ${ex - eyeR - 3} ${eyeY - (eyeR + 4)} L ${ex + eyeR + 3} ${eyeY - (eyeR + 4)} L ${ex + eyeR + 3} ${eyeY - (eyeR + 4) + (eyeR + 4) * 2 * lid + (mood === 'sad' ? side * 6 : 0)} L ${ex - eyeR - 3} ${eyeY - (eyeR + 4) + (eyeR + 4) * 2 * lid - (mood === 'sad' ? side * 6 : 0)} Z`}
            fill={P.paper}
            stroke={P.ink}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        )}
      </g>
    );
  };

  const mouthY = TOP + 148;
  const mouth =
    mood === 'happy' ? (
      <path d={`M -30 ${mouthY - 6} Q 0 ${mouthY + 34} 30 ${mouthY - 6} Z`} fill={P.tomato} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
    ) : mood === 'wow' ? (
      <ellipse cx={0} cy={mouthY + 6} rx={14} ry={18} fill={P.ink} />
    ) : mood === 'sad' ? (
      <path d={`M -24 ${mouthY + 12} Q 0 ${mouthY - 10} 24 ${mouthY + 12}`} stroke={P.ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : (
      <path d={`M -22 ${mouthY + 4} L 22 ${mouthY + 2}`} stroke={P.ink} strokeWidth={6} strokeLinecap="round" />
    );

  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${tilt})`} opacity={opacity}>
      <ellipse cx={0} cy={4} rx={110} ry={16} fill={P.ink} opacity={0.18} />
      {legs && (
        <g>
          <path d={`M -40 -64 Q ${-46 - 10 * stance} -30 ${-44 * stance - 6} -6`} stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d={`M 40 -64 Q ${46 + 10 * stance} -30 ${44 * stance + 6} -6`} stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" />
          <ellipse cx={-44 * stance - 18} cy={-4} rx={30} ry={14} fill={P.ink} />
          <ellipse cx={44 * stance + 18} cy={-4} rx={30} ry={14} fill={P.ink} />
        </g>
      )}
      <g transform={`translate(0 -60) scale(${sx} ${sy}) translate(0 60)`}>
        {arm(-1, armL)}
        {arm(1, armR)}
        {/* hoja */}
        <path
          d={`M ${-W / 2} ${TOP + 10} Q ${-W / 2} ${TOP} ${-W / 2 + 10} ${TOP} L ${W / 2 - 40} ${TOP} L ${W / 2} ${TOP + 40} L ${W / 2} ${-70} Q ${W / 2} -60 ${W / 2 - 10} -60 L ${-W / 2 + 10} -60 Q ${-W / 2} -60 ${-W / 2} -70 Z`}
          fill={P.paper}
          stroke={P.ink}
          strokeWidth={OUTLINE}
          strokeLinejoin="round"
        />
        <path d={`M ${W / 2 - 40} ${TOP} L ${W / 2 - 40} ${TOP + 40} L ${W / 2} ${TOP + 40}`} fill={P.line} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
        <text x={-W / 2 + 16} y={TOP + 38} fontFamily={fonts.round} fontWeight={700} fontSize={26} fill={P.ink}>
          CV
        </text>
        {eye(-34, 1)}
        {eye(34, -1)}
        {mood === 'happy' && (
          <>
            <ellipse cx={-58} cy={TOP + 130} rx={12} ry={7} fill={P.pink} />
            <ellipse cx={58} cy={TOP + 130} rx={12} ry={7} fill={P.pink} />
          </>
        )}
        {mood === 'sad' && <path d={`M 52 ${eyeY + 18} q 6 12 0 16 q -6 -4 0 -16`} fill={P.sky} stroke={P.ink} strokeWidth={3} />}
        {mouth}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-W / 2 + 22} y={TOP + 186 + i * 16} width={i === 2 ? 80 : W - 44} height={7} rx={3.5} fill={P.line} />
        ))}

        {/* vestuario */}
        {outfit === 'beret' && (
          <g transform={`translate(-10 ${TOP - 6}) rotate(-14)`}>
            <ellipse cx={0} cy={0} rx={86} ry={28} fill={P.tomato} stroke={P.ink} strokeWidth={6} />
            <path d="M -4 -28 q 4 -18 10 -18" stroke={P.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          </g>
        )}
        {outfit === 'tie' && (
          <g>
            <circle cx={-34} cy={eyeY} r={30} fill="none" stroke={P.ink} strokeWidth={6} />
            <circle cx={34} cy={eyeY} r={30} fill="none" stroke={P.ink} strokeWidth={6} />
            <line x1={-4} y1={eyeY} x2={4} y2={eyeY} stroke={P.ink} strokeWidth={6} />
            <path d="M -13 -112 L 13 -112 L 8 -99 L -8 -99 Z" fill={P.lilacDeep} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d="M -8 -99 L 8 -99 L 16 -76 L 0 -60 L -16 -76 Z" fill={P.lilacDeep} stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
          </g>
        )}
        {outfit === 'headset' && (
          <g>
            <path d={`M ${-W / 2 - 8} ${eyeY + 10} Q ${-W / 2 - 8} ${TOP - 70} 0 ${TOP - 70} Q ${W / 2 + 8} ${TOP - 70} ${W / 2 + 8} ${eyeY + 10}`} stroke={P.ink} strokeWidth={10} fill="none" />
            <rect x={-W / 2 - 26} y={eyeY - 16} width={30} height={52} rx={12} fill={P.mint} stroke={P.ink} strokeWidth={6} />
            <rect x={W / 2 - 4} y={eyeY - 16} width={30} height={52} rx={12} fill={P.mint} stroke={P.ink} strokeWidth={6} />
            <path d={`M ${-W / 2 - 10} ${eyeY + 30} Q -60 ${mouthY + 26} -26 ${mouthY + 12}`} stroke={P.ink} strokeWidth={6} fill="none" />
            <circle cx={-24} cy={mouthY + 12} r={8} fill={P.ink} />
          </g>
        )}
        {outfit === 'hardhat' && (
          <g transform={`translate(0 ${TOP + 4})`}>
            <path d="M -80 0 Q -80 -78 0 -78 Q 80 -78 80 0 Z" fill={P.sun} stroke={P.ink} strokeWidth={6} strokeLinejoin="round" />
            <rect x={-104} y={-8} width={208} height={18} rx={9} fill={P.sun} stroke={P.ink} strokeWidth={6} />
            <path d="M 0 -78 L 0 -6" stroke={P.ink} strokeWidth={5} />
          </g>
        )}
      </g>
    </g>
  );
};

/** Hoja pequeña y simple (para pilas, copias, cápsulas). */
export const MiniSheet: React.FC<{w?: number; mood?: 'bored' | 'happy'; tint?: string}> = ({w = 80, mood = 'bored', tint}) => {
  const h = w * 1.33;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.06} fill={P.paper} stroke={P.ink} strokeWidth={w * 0.05} />
      {tint && <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.16} rx={w * 0.06} fill={tint} />}
      <circle cx={-w * 0.17} cy={-h * 0.12} r={w * 0.05} fill={P.ink} />
      <circle cx={w * 0.17} cy={-h * 0.12} r={w * 0.05} fill={P.ink} />
      {mood === 'bored' ? (
        <line x1={-w * 0.12} y1={h * 0.04} x2={w * 0.12} y2={h * 0.04} stroke={P.ink} strokeWidth={w * 0.045} strokeLinecap="round" />
      ) : (
        <path d={`M ${-w * 0.14} ${h * 0.01} Q 0 ${h * 0.12} ${w * 0.14} ${h * 0.01}`} stroke={P.ink} strokeWidth={w * 0.045} fill="none" strokeLinecap="round" />
      )}
      <rect x={-w * 0.32} y={h * 0.2} width={w * 0.64} height={w * 0.05} rx={w * 0.025} fill={P.line} />
      <rect x={-w * 0.32} y={h * 0.3} width={w * 0.4} height={w * 0.05} rx={w * 0.025} fill={P.line} />
    </g>
  );
};
