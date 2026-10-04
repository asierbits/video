import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, interpolateColors, random, staticFile, useCurrentFrame} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {FilmGrain} from '../components/Overlays';
import {fonts} from '../theme';
import {B0Night, B10Sunrise, B1Fog, B2Crack, B4Knok, B5Voice, B6Fit, B7Fan, B8Browser, B9Monday, BEnd, BlockProps, K} from './blocks';
import {Ink, Pt, seg, smooth, spline} from './draw';
import timings from './timings.json';

export const CARTA_TOTAL = 900;
const FPS = 30;
const L = timings.lines;
const ENV = timings.env as number[];

const GAP = 900;
const Y0 = 760;
const Yk = (k: number) => Y0 + k * GAP;
const MX = 58; // margen: la línea del tiempo
const SCREEN_Y = 860;

type Block = {
  key: string;
  start: number; // s
  end: number; // s (fin del dibujo)
  label?: string;
  Comp?: React.FC<BlockProps>;
};

const BLOCKS: Block[] = [
  {key: 'noche', start: 0.15, end: L[1].end, label: 'hace 3 meses', Comp: B0Night},
  {key: 'niebla', start: L[2].start, end: L[2].end + 0.1, Comp: B1Fog},
  {key: 'grieta', start: L[3].start, end: L[3].end, Comp: B2Crack},
  {key: 'nudo', start: L[4].start, end: L[5].end},
  {key: 'knok', start: L[6].start, end: L[6].end + 0.3, label: 'el día que lo cambió todo', Comp: B4Knok},
  {key: 'voz', start: L[7].start, end: L[7].end + 0.1},
  {key: 'encaja', start: L[8].start, end: L[8].end, Comp: B6Fit},
  {key: 'abanico', start: L[9].start, end: L[9].end, Comp: B7Fan},
  {key: 'navegador', start: L[10].start, end: L[10].end + 0.2, Comp: B8Browser},
  {key: 'lunes', start: L[11].start, end: L[11].end, label: 'hoy', Comp: B9Monday},
  {key: 'amanecer', start: L[12].start, end: L[12].end, Comp: B10Sunrise},
  {key: 'firma', start: L[12].end + 0.12, end: 29.6, Comp: BEnd},
];
const KNOT = 3;
const WARM_FROM = 4;

const blockColor = (k: number) => (k < WARM_FROM ? K.light : K.ink);

// ---------------------------------------------------------------- la línea (un tramo por bloque)
const knotPoints = (() => {
  const n = 34;
  const pts: Pt[] = [];
  let a = 0;
  for (let i = 0; i < n; i++) {
    a += 0.85 + random(`ka${i}`) * 0.7;
    const r = 90 + random(`kr${i}`) * 170;
    const y = -250 + (i / (n - 1)) * 500;
    pts.push([540 + Math.cos(a) * r, y + Math.sin(a) * r * 0.75]);
  }
  return pts;
})();

const threadPoints = (k: number, straighten: number): Pt[] => {
  const y = Yk(k);
  if (k === KNOT) {
    const mid = knotPoints.map(([x, yy], i) => {
      const sx = 540;
      const sy = -250 + (i / (knotPoints.length - 1)) * 500;
      return [x + (sx - x) * straighten, y + yy + (sy - yy) * straighten] as Pt;
    });
    return [[MX, y - GAP / 2], [260, y - 380], [540, y - 300], ...mid, [540, y + 300], [260, y + 380], [MX, y + GAP / 2]];
  }
  const w = 14;
  return [
    [MX, y - GAP / 2],
    [MX + w, y - 220],
    [MX, y],
    [MX - w * 0.6, y + 220],
    [MX, y + GAP / 2],
  ];
};

export const Carta: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // ------------------------------------------------ cámara
  const camT: number[] = [0];
  const camY: number[] = [Yk(0) - 60];
  BLOCKS.forEach((b, k) => {
    if (k === 0) return;
    camT.push(b.start - 0.45, b.start + 0.25);
    camY.push(Yk(k - 1) + 50, Yk(k) - 50);
  });
  camT.push(30);
  camY.push(Yk(BLOCKS.length - 1) + 30);
  const cam = interpolate(t, camT, camY, {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // ------------------------------------------------ línea del tiempo
  const straighten = smooth(seg(t, L[5].start - 0.1, L[5].end));
  const segs = BLOCKS.slice(0, -1).map((b, k) => {
    const next = BLOCKS[k + 1].start;
    const d = spline(threadPoints(k, k === KNOT ? straighten : 0));
    let p: number;
    if (k === KNOT) p = 0.82 * smooth(seg(t, b.start, L[4].end)) + 0.18 * seg(t, L[5].end, next);
    else p = seg(t, b.start, next);
    return {d, p, color: k === WARM_FROM ? K.amber : blockColor(k)};
  });
  const active = segs.findIndex((s) => s.p > 0 && s.p < 1);
  let tip: {x: number; y: number} | null = null;
  if (active >= 0) {
    const s = segs[active];
    tip = getPointAtLength(s.d, getLength(s.d) * s.p);
  }

  const envAt = (dt: number) => ENV[Math.max(0, Math.min(ENV.length - 1, Math.round((t + dt) * FPS)))] ?? 0;

  // ------------------------------------------------ subtítulos escritos a mano
  const li = L.findIndex((l, i) => t >= l.start - 0.05 && t < (L[i + 1]?.start ?? l.end + 0.6) - 0.05);
  const line = li >= 0 ? L[li] : null;
  let caption: React.ReactNode = null;
  if (line && t < L[12].end + 0.3) {
    const words = line.text.split(' ');
    const total = line.text.length;
    let acc = 0;
    const capWorldY = cam + 720;
    const capColor = interpolateColors(capWorldY, [Yk(WARM_FROM) - 330, Yk(WARM_FROM) - 230], [K.light, K.ink]);
    const capShadow = capWorldY < Yk(WARM_FROM) - 280 ? '0 2px 18px rgba(0,0,0,.6)' : '0 2px 14px rgba(255,244,224,.9)';
    caption = (
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 60,
          top: 1500,
          fontFamily: fonts.hand,
          fontWeight: 600,
          fontSize: 76,
          lineHeight: 1.05,
          color: capColor,
          textShadow: capShadow,
          textAlign: 'center',
          opacity: seg(t, line.start - 0.05, line.start + 0.1),
        }}
      >
        {words.map((w, i) => {
          const at = line.start + ((line.end - line.start) * acc) / total;
          acc += w.length + 1;
          const on = seg(t, at - 0.05, at + 0.12);
          return (
            <span key={i} style={{opacity: on, display: 'inline-block', transform: `translateY(${(1 - on) * 10}px)`, marginRight: 18}}>
              {w}
            </span>
          );
        })}
      </div>
    );
  }

  const worldTop = SCREEN_Y - cam;

  return (
    <AbsoluteFill style={{background: K.night, overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <linearGradient id="sky" gradientUnits="userSpaceOnUse" x1={0} x2={0} y1={0} y2={Yk(12) + 1200}>
            {[
              [0, '#0E1324'],
              [Yk(3), '#1A2038'],
              [Yk(4) - 470, '#2E2747'],
              [Yk(4) - 180, '#FFE3B8'],
              [Yk(4) + 300, K.cream],
              [Yk(10), '#FFEBCB'],
              [Yk(12) + 1200, '#FFD89A'],
            ].map(([o, c]) => (
              <stop key={String(o)} offset={(o as number) / (Yk(12) + 1200)} stopColor={c as string} />
            ))}
          </linearGradient>
        </defs>
        <g transform={`translate(0 ${worldTop})`}>
          <rect x={0} y={-2000} width={1080} height={Yk(12) + 4000} fill="url(#sky)" />
          <rect x={0} y={-2000} width={1080} height={2000} fill="#0E1324" />
          {/* estrellas de la parte "noche" */}
          {Array.from({length: 70}, (_, i) => {
            const y = random(`sy${i}`) * (Yk(4) - 600);
            const x = 120 + random(`sx${i}`) * 940;
            const tw = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * (1 + random(`st${i}`) * 3) + i));
            return <circle key={i} cx={x} cy={y} r={1.5 + random(`sr${i}`) * 2.5} fill="#fff" opacity={tw * 0.6} />;
          })}

          {/* línea del tiempo */}
          {segs.map((s, k) => (
            <Ink key={k} d={s.d} p={s.p} color={s.color} w={k === KNOT ? 7 : 5} />
          ))}
          {BLOCKS.map((b, k) => {
            if (k === KNOT || k === BLOCKS.length - 1) return null;
            const on = seg(t, b.start + 0.05, b.start + 0.3);
            return (
              <g key={b.key}>
                <circle cx={MX} cy={Yk(k)} r={14 * on} fill={k === WARM_FROM ? K.amber : blockColor(k)} />
                {b.label && (
                  <text
                    x={MX - 22}
                    y={Yk(k) - 34}
                    transform={`rotate(-90 ${MX - 22} ${Yk(k) - 34})`}
                    fontFamily={fonts.hand}
                    fontWeight={600}
                    fontSize={40}
                    fill={k === WARM_FROM ? '#C97E00' : blockColor(k)}
                    opacity={on}
                    textAnchor="start"
                    dx={0}
                  >
                    {b.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* dibujos */}
          {BLOCKS.map((b, k) => {
            const p = seg(t, b.start, b.end);
            if (p <= 0) return null;
            if (Math.abs(Yk(k) - cam) > 1700) return null;
            const color = blockColor(k);
            return (
              <g key={b.key} transform={`translate(565 ${Yk(k)}) scale(1.08)`}>
                {b.key === 'voz' ? <B5Voice p={p} t={t} color={color} envAt={envAt} /> : b.Comp ? <b.Comp p={p} t={t} color={color} /> : null}
              </g>
            );
          })}

          {/* punta del bolígrafo */}
          {tip && (
            <g>
              <circle cx={tip.x} cy={tip.y} r={30} fill={K.amber} opacity={0.25} />
              <circle cx={tip.x} cy={tip.y} r={11} fill={K.amber} />
            </g>
          )}
        </g>
      </svg>
      {caption}
      <FilmGrain opacity={0.06} />
      <Audio src={staticFile('carta-mix.wav')} />
    </AbsoluteFill>
  );
};
