import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {C, fonts} from '../theme';
import {ease, lerp, shake} from '../utils';

const R = {x: 540, y: 820, r: 430};
const PRESS = 34;
const SWEEP_START = 40;
const TURNS_PER_FRAME = 1 / 55;

const FILTERS = ['remoto', 'diseño UX', 'Madrid', '+30k €'];

const OFFERS = Array.from({length: 34}, (_, i) => {
  const a = random(`oa${i}`) * Math.PI * 2;
  const d = 0.18 + Math.sqrt(random(`od${i}`)) * 0.78;
  return {a, d, match: random(`om${i}`) > 0.3};
});

const CARDS = [
  {i: 3, title: 'UX Designer', meta: 'remoto · 34k'},
  {i: 11, title: 'Product Designer', meta: 'Madrid · 38k'},
  {i: 19, title: 'UI/UX Junior', meta: 'híbrido · 31k'},
];

/** Mapa del mundo hecho de puntos (ruido -> "continentes"). */
const DotMap: React.FC = () => {
  const dots: React.ReactNode[] = [];
  const step = 26;
  for (let y = -R.r; y <= R.r; y += step) {
    for (let x = -R.r; x <= R.r; x += step) {
      if (x * x + y * y > (R.r - 20) ** 2) continue;
      const n = noise2D('land', x * 0.0042 + 3, y * 0.0055 + 1);
      if (n > 0.12) dots.push(<circle key={`${x}-${y}`} cx={R.x + x} cy={R.y + y} r={4.2} fill={C.amber} opacity={0.32} />);
    }
  }
  return <g>{dots}</g>;
};

/** Contador de paletas (split-flap). */
const Flap: React.FC<{digit: string; flipping: number}> = ({digit, flipping}) => (
  <div
    style={{
      width: 120,
      height: 170,
      borderRadius: 14,
      background: '#1C140D',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 -6px 0 rgba(0,0,0,.4)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.mono,
        fontWeight: 700,
        fontSize: 128,
        color: C.amber,
        transform: `scaleY(${1 - flipping * 0.9})`,
      }}
    >
      {digit}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 84, height: 3, background: '#000'}} />
  </div>
);

/** ESCENA 7 — 02: escanear. Pones tus requisitos, pulsas, y un radar barre internet. */
export const S07Scan: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [PRESS], 14, 's');

  const sweepTurns = Math.max(0, frame - SWEEP_START) * TURNS_PER_FRAME;
  const sweepDeg = sweepTurns * 360 - 90;
  const radarIn = lerp(frame, [PRESS, PRESS + 12], [0, 1], ease.out);

  // una oferta "aparece" cuando el haz pasa por encima por primera vez
  const foundAt = (a: number) => {
    let ang = ((a * 180) / Math.PI + 90) % 360;
    if (ang < 0) ang += 360;
    return SWEEP_START + ang / 360 / TURNS_PER_FRAME;
  };

  const count = Math.round(lerp(frame, [SWEEP_START, 146], [0, 128], ease.inOut));
  const digits = String(Math.min(128, count)).padStart(3, '0').split('');

  const btnDown = lerp(frame, [PRESS - 3, PRESS, PRESS + 6], [0, 1, 0]);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 50% 42%, #2A1A0C 0%, #120B06 55%, #070403 100%)`, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <svg width={1080} height={1920}>
          <defs>
            <radialGradient id="radarBg">
              <stop offset="0" stopColor="#2A1806" />
              <stop offset="1" stopColor="#120A04" />
            </radialGradient>
            <clipPath id="radarClip">
              <circle cx={R.x} cy={R.y} r={R.r * radarIn} />
            </clipPath>
          </defs>

          {/* etiqueta 02 */}
          <g transform="translate(70 120)" opacity={lerp(frame, [0, 8], [0, 1])}>
            <text fontFamily={fonts.logo} fontWeight={900} fontSize={64} fill={C.amber}>
              02
            </text>
            <text x={130} y={-14} fontFamily={fonts.sans} fontWeight={700} fontSize={32} fill={C.cream}>
              escanea internet
            </text>
            <text x={130} y={26} fontFamily={fonts.serif} fontStyle="italic" fontSize={40} fill={C.cream} opacity={0.85}>
              con tus reglas
            </text>
          </g>

          {/* onda expansiva al pulsar */}
          {frame >= PRESS && frame < PRESS + 24 && (
            <circle
              cx={540}
              cy={1730}
              r={lerp(frame, [PRESS, PRESS + 24], [80, 1400], ease.out)}
              fill="none"
              stroke={C.amber}
              strokeWidth={lerp(frame, [PRESS, PRESS + 24], [30, 2])}
              opacity={lerp(frame, [PRESS, PRESS + 24], [0.9, 0])}
            />
          )}

          {/* radar */}
          <g clipPath="url(#radarClip)">
            <circle cx={R.x} cy={R.y} r={R.r} fill="url(#radarBg)" />
            <DotMap />
            {[0.25, 0.5, 0.75, 1].map((k) => (
              <circle key={k} cx={R.x} cy={R.y} r={R.r * k - 2} fill="none" stroke={C.amber} strokeWidth={2} opacity={0.35} />
            ))}
            <line x1={R.x - R.r} y1={R.y} x2={R.x + R.r} y2={R.y} stroke={C.amber} strokeWidth={1.5} opacity={0.3} />
            <line x1={R.x} y1={R.y - R.r} x2={R.x} y2={R.y + R.r} stroke={C.amber} strokeWidth={1.5} opacity={0.3} />
            {/* haz */}
            {frame >= SWEEP_START &&
              Array.from({length: 24}, (_, k) => {
                const a0 = ((sweepDeg - k * 2.2) * Math.PI) / 180;
                const a1 = ((sweepDeg - (k + 1) * 2.2) * Math.PI) / 180;
                return (
                  <path
                    key={k}
                    d={`M ${R.x} ${R.y} L ${R.x + Math.cos(a0) * R.r} ${R.y + Math.sin(a0) * R.r} L ${R.x + Math.cos(a1) * R.r} ${R.y + Math.sin(a1) * R.r} Z`}
                    fill={C.amber}
                    opacity={0.42 * (1 - k / 24)}
                  />
                );
              })}
            {frame >= SWEEP_START && (
              <line
                x1={R.x}
                y1={R.y}
                x2={R.x + Math.cos((sweepDeg * Math.PI) / 180) * R.r}
                y2={R.y + Math.sin((sweepDeg * Math.PI) / 180) * R.r}
                stroke={C.cream}
                strokeWidth={4}
              />
            )}
            {/* ofertas */}
            {OFFERS.map((o, i) => {
              const t = foundAt(o.a);
              const d = frame - t;
              if (d < 0) return null;
              const x = R.x + Math.cos(o.a) * o.d * R.r;
              const y = R.y + Math.sin(o.a) * o.d * R.r;
              return (
                <g key={i}>
                  {d < 16 && <circle cx={x} cy={y} r={8 + d * 3} fill="none" stroke={o.match ? C.cream : '#6B5A48'} strokeWidth={3} opacity={1 - d / 16} />}
                  <circle cx={x} cy={y} r={o.match ? 11 : 6} fill={o.match ? C.cream : '#6B5A48'} />
                  {o.match && <circle cx={x} cy={y} r={20} fill={C.amber} opacity={0.35} />}
                </g>
              );
            })}
          </g>
          <circle cx={R.x} cy={R.y} r={R.r * radarIn + 10} fill="none" stroke={C.amber} strokeWidth={6} opacity={radarIn} />
          {/* marcas del bisel */}
          {Array.from({length: 72}, (_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const r0 = R.r + 22;
            return (
              <line
                key={i}
                x1={R.x + Math.cos(a) * r0}
                y1={R.y + Math.sin(a) * r0}
                x2={R.x + Math.cos(a) * (r0 + (i % 6 === 0 ? 26 : 12))}
                y2={R.y + Math.sin(a) * (r0 + (i % 6 === 0 ? 26 : 12))}
                stroke={C.amber}
                strokeWidth={3}
                opacity={radarIn * 0.6}
              />
            );
          })}

          {/* fichas de oferta que salen del radar */}
          {CARDS.map((c, k) => {
            const o = OFFERS[c.i];
            const t = Math.max(foundAt(o.a), SWEEP_START + 10 + k * 10);
            const p = lerp(frame, [t, t + 12], [0, 1], ease.back);
            if (p <= 0) return null;
            const ox = R.x + Math.cos(o.a) * o.d * R.r;
            const oy = R.y + Math.sin(o.a) * o.d * R.r;
            const tx = 120 + k * 290;
            const ty = 1300;
            const x = ox + (tx - ox) * p;
            const y = oy + (ty - oy) * p;
            return (
              <g key={k} transform={`translate(${x} ${y}) rotate(${(1 - p) * 20 + (k - 1) * 3}) scale(${0.3 + 0.7 * p})`}>
                <rect x={0} y={0} width={270} height={130} rx={18} fill={C.cream} />
                <rect x={0} y={0} width={10} height={130} rx={4} fill={C.amber} />
                <text x={26} y={52} fontFamily={fonts.sans} fontWeight={700} fontSize={28} fill={C.ink}>
                  {c.title}
                </text>
                <text x={26} y={92} fontFamily={fonts.mono} fontSize={20} fill="#6B5A48">
                  {c.meta}
                </text>
              </g>
            );
          })}

          {/* interruptores de requisitos */}
          {FILTERS.map((f, i) => {
            const on = lerp(frame, [6 + i * 6, 10 + i * 6], [0, 1], ease.out);
            const x = 70 + i * 240;
            const y = 1450;
            return (
              <g key={f} transform={`translate(${x} ${y})`} opacity={lerp(frame, [0, 6], [0, 1]) * lerp(frame, [PRESS + 8, PRESS + 16], [1, 0.0])}>
                <rect width={200} height={84} rx={42} fill={on > 0.5 ? C.amber : '#2A1E14'} />
                <circle cx={42 + on * 116} cy={42} r={32} fill={C.cream} />
                <text x={100} y={130} textAnchor="middle" fontFamily={fonts.mono} fontSize={26} fill={C.cream}>
                  {f}
                </text>
              </g>
            );
          })}

          {/* botón de escanear */}
          <g transform={`translate(540 ${1730 + btnDown * 10})`} opacity={lerp(frame, [12, 18], [0, 1]) * lerp(frame, [PRESS + 10, PRESS + 18], [1, 0])}>
            <ellipse cx={0} cy={36 - btnDown * 10} rx={220} ry={60} fill="#5A3005" />
            <ellipse cx={0} cy={0} rx={220} ry={60} fill={C.amber} />
            <text x={0} y={14} textAnchor="middle" fontFamily={fonts.logo} fontWeight={900} fontSize={40} fill={C.ink} letterSpacing={4}>
              ESCANEAR
            </text>
          </g>
        </svg>

        {/* contador */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
            opacity: lerp(frame, [PRESS + 14, PRESS + 24], [0, 1]),
          }}
        >
          <div style={{display: 'flex', gap: 14}}>
            {digits.map((d, i) => (
              <Flap key={i} digit={d} flipping={frame > SWEEP_START && frame < 146 && (frame + i) % 3 === 0 ? 0.5 : 0} />
            ))}
          </div>
          <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 46, color: C.cream}}>ofertas que encajan contigo</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
