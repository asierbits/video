import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ease, lerp, shake} from '../utils';

const LETTER = {x: 540, y: 880, w: 660, h: 840};

/** Línea de "caligrafía" como polilínea, para poder dibujarla y seguirla con la pluma. */
const scribble = (i: number, x0: number, y0: number, width: number) => {
  // trazo cursivo: bucles que avanzan, con "palabras" de distinto tamaño
  const pts: [number, number][] = [];
  let t = 0;
  let x = x0;
  while (x < x0 + width) {
    const word = Math.floor(t / 5.5);
    const amp = 8 + random(`a${i}-${word}`) * 12;
    const gap = Math.floor(t / 5.5) * 14;
    x = x0 + t * 13 - 10 * Math.sin(t * 2.4) + gap;
    const y = y0 - amp * Math.sin(t * 2.4 + 0.9) - (t % 5.5 < 0.6 ? 0 : 2);
    pts.push([x, y]);
    t += 0.12;
  }
  const lens = [0];
  for (let j = 1; j < pts.length; j++) {
    lens.push(lens[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  }
  return {pts, lens, total: lens[lens.length - 1]};
};

const pointAt = (sc: ReturnType<typeof scribble>, p: number): [number, number] => {
  const target = sc.total * p;
  for (let j = 1; j < sc.pts.length; j++) {
    if (sc.lens[j] >= target) {
      const t = (target - sc.lens[j - 1]) / (sc.lens[j] - sc.lens[j - 1] || 1);
      return [
        sc.pts[j - 1][0] + (sc.pts[j][0] - sc.pts[j - 1][0]) * t,
        sc.pts[j - 1][1] + (sc.pts[j][1] - sc.pts[j - 1][1]) * t,
      ];
    }
  }
  return sc.pts[sc.pts.length - 1];
};

const LINES = [0, 1, 2, 3, 4, 5].map((i) => scribble(i, -LETTER.w / 2 + 70, -LETTER.h / 2 + 300 + i * 72, i === 5 ? 300 : 500));
const LINE_T = [24, 30, 36, 42, 48, 54];
const LINE_D = 7;

const STICKERS = [
  {label: 'Nova Studio', tag: 'empresa', at: 34, x: 120, y: -250, r: 6, dot: C.orange},
  {label: 'Product Designer', tag: 'puesto', at: 42, x: -40, y: 170, r: -5, dot: C.blue},
  {label: 'cercano', tag: 'tono', at: 50, x: 150, y: 330, r: 4, dot: C.amber},
];

/** ESCENA 6 — 01: tu correo, con tu voz. Una carta que se escribe sola, pero suena a ti. */
export const S06Letter: React.FC = () => {
  const frame = useCurrentFrame();
  const SEAL = 98;
  const sh = shake(frame, [0, SEAL, ...STICKERS.map((s) => s.at + 6)], 6, 'l');

  const intro = lerp(frame, [0, 12], [0, 1], ease.out);
  const fold = lerp(frame, [68, 82], [0, 1], ease.inOut);
  const envY = lerp(frame, [66, 84], [1500, 0], ease.out);
  const flap = lerp(frame, [84, 94], [-1, 1], ease.inOut);
  const seal = lerp(frame, [SEAL - 4, SEAL], [2.4, 1], ease.in);
  const sealOp = lerp(frame, [SEAL - 4, SEAL - 2], [0, 1]);
  const push = lerp(frame, [0, 120], [1, 1.08]);

  // pluma: sigue el trazo activo
  let pen: [number, number] = [-LETTER.w / 2 + 70, -LETTER.h / 2 + 170];
  const greetP = lerp(frame, [10, 22], [0, 1], ease.inOut);
  if (frame < 22) pen = [-LETTER.w / 2 + 70 + greetP * 380, -LETTER.h / 2 + 175 + Math.sin(greetP * 20) * 8];
  LINES.forEach((ln, i) => {
    const p = lerp(frame, [LINE_T[i], LINE_T[i] + LINE_D], [0, 1]);
    if (p > 0 && p < 1) pen = pointAt(ln, p);
  });
  const penOp = lerp(frame, [6, 10], [0, 1]) * lerp(frame, [62, 68], [1, 0]);

  const tagSwing = 10 * Math.sin(frame * 0.14) * Math.exp(-frame / 70);
  const dial = lerp(frame, [26, 52], [-62, 58], ease.inOut);

  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      {/* formas de fondo */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <circle cx={980} cy={1620} r={520} fill={C.amber} />
        <circle cx={60} cy={260} r={260} fill="none" stroke={C.amber} strokeWidth={40} opacity={0.5} />
        {Array.from({length: 40}, (_, i) => (
          <line key={i} x1={0} y1={i * 48} x2={1080} y2={i * 48} stroke="#E9DCC4" strokeWidth={2} />
        ))}
      </svg>

      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${push})`}}>
        <svg width={1080} height={1920}>
          <defs>
            <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="22" stdDeviation="22" floodColor="#7A4A10" floodOpacity="0.28" />
            </filter>
            <clipPath id="greet">
              <rect x={-LETTER.w / 2 + 60} y={-LETTER.h / 2 + 100} width={greetP * 440} height={110} />
            </clipPath>
          </defs>

          {/* carta */}
          <g transform={`translate(${LETTER.x} ${LETTER.y + (1 - intro) * 300}) rotate(-3) scale(${1 - fold * 0.18} ${1 - fold * 0.72})`} opacity={intro * (1 - lerp(frame, [80, 84], [0, 1]))}>
            <rect x={-LETTER.w / 2} y={-LETTER.h / 2} width={LETTER.w} height={LETTER.h} rx={6} fill="#FFFDF8" filter="url(#soft)" />
            {fold > 0 && <line x1={-LETTER.w / 2} x2={LETTER.w / 2} y1={-LETTER.h / 6} y2={-LETTER.h / 6} stroke="#D9C9AE" strokeWidth={3} />}
            {fold > 0 && <line x1={-LETTER.w / 2} x2={LETTER.w / 2} y1={LETTER.h / 6} y2={LETTER.h / 6} stroke="#D9C9AE" strokeWidth={3} />}
            <g clipPath="url(#greet)">
              <text x={-LETTER.w / 2 + 70} y={-LETTER.h / 2 + 185} fontFamily={fonts.serif} fontStyle="italic" fontSize={84} fill={C.ink}>
                Hola, Marta:
              </text>
            </g>
            {LINES.map((ln, i) => {
              const p = lerp(frame, [LINE_T[i], LINE_T[i] + LINE_D], [0, 1]);
              return (
                <polyline
                  key={i}
                  points={ln.pts.map((q) => q.join(',')).join(' ')}
                  fill="none"
                  stroke="#2A2F45"
                  strokeWidth={4}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={ln.total}
                  strokeDashoffset={ln.total * (1 - p)}
                />
              );
            })}
            {/* pegatinas de personalización */}
            {STICKERS.map((st) => {
              const p = lerp(frame, [st.at, st.at + 7], [0, 1], ease.in);
              if (p <= 0) return null;
              const sc = 1.9 - 0.9 * p;
              const w = st.label.length * 19 + 130;
              return (
                <g key={st.label} transform={`translate(${st.x} ${st.y}) rotate(${st.r + (1 - p) * 16}) scale(${sc})`} opacity={Math.min(1, p * 2)}>
                  <rect x={-w / 2 + 6} y={-34 + 8 * (1 - p) + 6} width={w} height={68} rx={34} fill="#000" opacity={0.18 * p} />
                  <rect x={-w / 2} y={-34} width={w} height={68} rx={34} fill={C.ink} />
                  <circle cx={-w / 2 + 34} cy={0} r={12} fill={st.dot} />
                  <text x={-w / 2 + 58} y={-6} fontFamily={fonts.mono} fontSize={16} fill="#9AA3BD">
                    {st.tag}
                  </text>
                  <text x={-w / 2 + 58} y={20} fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={C.cream}>
                    {st.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* pluma */}
          <g transform={`translate(${LETTER.x} ${LETTER.y}) rotate(-3) translate(${pen[0]} ${pen[1]}) rotate(35)`} opacity={penOp}>
            <path d="M 0 0 L -12 -46 L 12 -46 Z" fill={C.amber} />
            <rect x={-18} y={-330} width={36} height={290} rx={16} fill={C.ink} />
            <rect x={-18} y={-120} width={36} height={14} fill={C.amber} />
          </g>

          {/* sobre */}
          <g transform={`translate(${LETTER.x} ${LETTER.y + 40 + envY}) rotate(-3)`}>
            <rect x={-360} y={-230} width={720} height={460} rx={10} fill="#F2E4C9" filter="url(#soft)" />
            <path d="M -360 230 L 0 -10 L 360 230 Z" fill="#E8D5B0" />
            <path d="M -360 -230 L -360 230 L 0 0 Z" fill="#EEDDBD" />
            <path d="M 360 -230 L 360 230 L 0 0 Z" fill="#EEDDBD" />
            {/* solapa */}
            <g transform={`translate(0 -230) scale(1 ${flap})`}>
              <path d="M -360 0 L 0 250 L 360 0 Z" fill={flap > 0 ? '#E3CC9F' : '#F7ECD6'} />
            </g>
            {/* lacre */}
            <g transform={`translate(0 30) scale(${seal}) rotate(-8)`} opacity={sealOp}>
              <path
                d={Array.from({length: 14}, (_, i) => {
                  const a = (i / 14) * Math.PI * 2;
                  const r = i % 2 ? 82 : 92;
                  return `${i ? 'L' : 'M'} ${Math.cos(a) * r} ${Math.sin(a) * r}`;
                }).join(' ') + ' Z'}
                fill={C.ember}
              />
              <circle r={64} fill="none" stroke="#B53A0E" strokeWidth={6} />
              <text textAnchor="middle" y={30} fontFamily={fonts.logo} fontWeight={900} fontSize={88} fill="#B53A0E">
                k
              </text>
            </g>
          </g>
        </svg>
      </AbsoluteFill>

      {/* etiqueta colgante */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(230 0) rotate(${tagSwing})`}>
          <line x1={0} y1={0} x2={0} y2={200} stroke={C.ink} strokeWidth={3} />
          <g transform="translate(0 200) rotate(-4)">
            <path d="M -40 0 L 40 0 L 260 0 L 260 150 L -180 150 L -180 0 Z" fill={C.ink} />
            <circle cx={0} cy={24} r={11} fill={C.cream} />
            <text x={-150} y={98} fontFamily={fonts.logo} fontWeight={900} fontSize={64} fill={C.amber}>
              01
            </text>
            <text x={-20} y={80} fontFamily={fonts.sans} fontWeight={700} fontSize={30} fill={C.cream}>
              tu correo,
            </text>
            <text x={-20} y={118} fontFamily={fonts.serif} fontStyle="italic" fontSize={38} fill={C.cream}>
              con tu voz
            </text>
          </g>
        </g>

        {/* mando de tono */}
        <g transform="translate(880 1500)" opacity={lerp(frame, [16, 24], [0, 1]) * (1 - fold)}>
          <circle r={120} fill={C.ink} />
          <text x={-100} y={-140} fontFamily={fonts.mono} fontSize={24} fill={C.ink}>
            formal
          </text>
          <text x={30} y={-140} fontFamily={fonts.mono} fontSize={24} fill={C.ink}>
            cercano
          </text>
          {Array.from({length: 9}, (_, i) => {
            const a = ((-120 + i * 30) * Math.PI) / 180 - Math.PI / 2;
            return <line key={i} x1={Math.cos(a) * 100} y1={Math.sin(a) * 100} x2={Math.cos(a) * 112} y2={Math.sin(a) * 112} stroke={C.cream} strokeWidth={4} />;
          })}
          <g transform={`rotate(${dial})`}>
            <circle r={78} fill="#1E2236" />
            <rect x={-6} y={-78} width={12} height={46} rx={6} fill={C.amber} />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
