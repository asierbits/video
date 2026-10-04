import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ease, lerp} from '../utils';

const CX = 540;
const CY = 960;
const N_ENV = 70;

const Envelope: React.FC<{w?: number; stamp?: boolean}> = ({w = 120, stamp = true}) => {
  const h = w * 0.64;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="#D9D3C7" />
      <path d={`M ${-w / 2} ${-h / 2} L 0 ${h * 0.08} L ${w / 2} ${-h / 2}`} fill="none" stroke="#A39D90" strokeWidth={3} />
      {stamp && (
        <g transform={`translate(${w * 0.18} ${h * 0.12}) rotate(-14)`}>
          <rect x={-w * 0.22} y={-h * 0.16} width={w * 0.44} height={h * 0.32} rx={3} fill="none" stroke={C.red} strokeWidth={3} />
          <text textAnchor="middle" y={h * 0.08} fontFamily={fonts.mono} fontWeight={700} fontSize={w * 0.15} fill={C.red}>
            NO
          </text>
        </g>
      )}
    </g>
  );
};

/** ESCENA 4 — Vista cenital. Sentado en el centro de un reloj gigante. El tiempo pasa. Llueven los "no". */
export const S04Clock: React.FC = () => {
  const frame = useCurrentFrame();

  const rot = lerp(frame, [0, 90], [-8, 22]);
  const s = lerp(frame, [0, 70], [1.45, 0.92], ease.inOut);

  // el foco se cierra hasta la oscuridad total
  const spot = lerp(frame, [50, 70], [1400, 0], ease.in);

  const minuteA = frame * 14;
  const hourA = frame * 1.2 + 40;

  const ticks = Array.from({length: 60}, (_, i) => {
    const a = (i / 60) * Math.PI * 2;
    const big = i % 5 === 0;
    const r0 = big ? 780 : 820;
    return (
      <line
        key={i}
        x1={CX + Math.cos(a) * r0}
        y1={CY + Math.sin(a) * r0}
        x2={CX + Math.cos(a) * 860}
        y2={CY + Math.sin(a) * 860}
        stroke={C.ice}
        strokeWidth={big ? 12 : 4}
        opacity={big ? 0.7 : 0.35}
      />
    );
  });

  const numerals = Array.from({length: 12}, (_, i) => {
    const a = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;
    return (
      <text
        key={i}
        x={CX + Math.cos(a) * 690}
        y={CY + Math.sin(a) * 690 + 28}
        textAnchor="middle"
        fontFamily={fonts.serif}
        fontStyle="italic"
        fontSize={86}
        fill={C.ice}
        opacity={0.5}
      >
        {i + 1}
      </text>
    );
  });

  // los sobres caen desde la cámara (escala grande -> se posan en el suelo)
  const envs = Array.from({length: N_ENV}, (_, i) => {
    const t0 = 2 + Math.pow(random(`e${i}`), 0.7) * 70;
    const p = lerp(frame, [t0, t0 + 9], [0, 1], ease.in);
    if (p <= 0) return null;
    const a = random(`ea${i}`) * Math.PI * 2;
    const r = 170 + random(`er${i}`) * 650;
    const x = CX + Math.cos(a) * r;
    const y = CY + Math.sin(a) * r;
    const sc = 4 - 3 * p;
    const shadowOff = 40 * (1 - p);
    return (
      <g key={i}>
        <g transform={`translate(${x + shadowOff} ${y + shadowOff}) rotate(${(random(`er2${i}`) - 0.5) * 60 - 8}) scale(${sc})`} opacity={0.35 * p}>
          <rect x={-60} y={-38} width={120} height={77} fill="#000" />
        </g>
        <g transform={`translate(${x} ${y}) rotate(${(random(`er2${i}`) - 0.5) * 60 - 8}) scale(${sc})`} opacity={Math.min(1, p * 3)}>
          <Envelope w={120} />
        </g>
      </g>
    );
  });

  // personaje visto desde arriba, frente al portátil
  const breathe = 1 + 0.02 * Math.sin(frame * 0.2);
  const topDown = (
    <g transform={`translate(${CX} ${CY}) rotate(${-rot * 0.4})`}>
      {/* mesa */}
      <rect x={-150} y={-210} width={300} height={170} rx={10} fill="#1A2440" />
      {/* portátil (pantalla vista desde arriba = brillo) */}
      <rect x={-90} y={-190} width={180} height={110} rx={6} fill="#2A3556" />
      <rect x={-90} y={-196} width={180} height={12} rx={4} fill={C.cyan} opacity={0.9} />
      <ellipse cx={0} cy={-140} rx={160} ry={110} fill={C.cyan} opacity={0.08} />
      {/* hombros */}
      <g transform={`scale(${breathe})`}>
        <ellipse cx={0} cy={40} rx={110} ry={62} fill={C.hoodie} />
        {/* brazos hacia el teclado */}
        <rect x={-96} y={-70} width={34} height={110} rx={17} fill={C.hoodie} transform="rotate(12 -79 40)" />
        <rect x={62} y={-70} width={34} height={110} rx={17} fill={C.hoodie} transform="rotate(-12 79 40)" />
        {/* bufanda */}
        <ellipse cx={0} cy={18} rx={64} ry={40} fill={C.amber} />
        {/* cabeza (pelo) */}
        <circle cx={0} cy={20} r={52} fill={C.hair} />
        <path d="M -40 -6 Q 0 -30 40 -6" stroke="#2C2238" strokeWidth={8} fill="none" />
      </g>
    </g>
  );

  const lineOp1 = lerp(frame, [22, 32], [0, 1]) * lerp(frame, [48, 56], [1, 0]);

  return (
    <AbsoluteFill style={{background: '#04060D'}}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="dial">
            <stop offset="0" stopColor="#1A2547" />
            <stop offset="1" stopColor="#0A1022" />
          </radialGradient>
          <mask id="spot">
            <rect width={1080} height={1920} fill="#000" />
            <circle cx={CX} cy={CY} r={spot} fill="url(#spotFade)" />
          </mask>
          <radialGradient id="spotFade">
            <stop offset="0.6" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </radialGradient>
        </defs>
        <g mask="url(#spot)">
          <g transform={`translate(${CX} ${CY}) rotate(${rot}) scale(${s}) translate(${-CX} ${-CY})`}>
            <circle cx={CX} cy={CY} r={900} fill="url(#dial)" />
            <circle cx={CX} cy={CY} r={900} fill="none" stroke={C.steel} strokeWidth={20} />
            {ticks}
            {numerals}
            {envs}
            {/* manecillas: sombras y luego las piezas */}
            <g transform={`rotate(${hourA} ${CX} ${CY})`}>
              <rect x={CX - 18 + 24} y={CY - 520 + 24} width={36} height={540} rx={18} fill="#000" opacity={0.4} />
              <rect x={CX - 18} y={CY - 520} width={36} height={540} rx={18} fill="#8C9BBE" />
            </g>
            <g transform={`rotate(${minuteA} ${CX} ${CY})`}>
              <rect x={CX - 10 + 30} y={CY - 820 + 30} width={20} height={850} rx={10} fill="#000" opacity={0.4} />
              <rect x={CX - 10} y={CY - 820} width={20} height={850} rx={10} fill={C.ice} />
            </g>
            {topDown}
          </g>
        </g>
      </svg>

      {/* texto en la oscuridad */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 300}}>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 92,
            color: C.cream,
            opacity: lineOp1,
            letterSpacing: 1,
            textShadow: '0 0 30px rgba(0,0,0,.9)',
            transform: `translateY(${lerp(frame, [22, 40], [16, 0], ease.out)}px)`,
          }}
        >
          El mundo cambió.
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            fontFamily: fonts.serif,
            fontStyle: 'italic',
            fontSize: 120,
            color: C.cream,
            opacity: lerp(frame, [70, 76], [0, 1]),
            filter: `blur(${lerp(frame, [70, 80], [10, 0])}px)`,
          }}
        >
          ¿Y tú?
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
