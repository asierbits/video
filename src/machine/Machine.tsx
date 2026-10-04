import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import EV from './events.json';

export const MACHINE_TOTAL = 900;
const H = 1920;

// ------------------------------------------------------------------ plastilina
const CLAY: Record<string, string> = {
  peach: '#FFB4A2',
  coral: '#FF7F6B',
  mint: '#9ED9C3',
  lilac: '#C7B8EA',
  butter: '#FFE29A',
  sky: '#A8D8F0',
  cream: '#FFF7EC',
  wood: '#E8C39E',
  red: '#F0605D',
  grey: '#CFC8C2',
  brown: '#8A6A55',
  green: '#8FD694',
};
const mix = (hex: string, to: string, a: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = p(hex);
  const [r2, g2, b2] = p(to);
  const c = (x: number, y: number) => Math.round(x + (y - x) * a).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};
const g = (name: string) => `url(#g-${name})`;
const INK = '#6B4A35';

const ClayDefs: React.FC = () => (
  <defs>
    {Object.entries(CLAY).map(([n, c]) => (
      <radialGradient key={n} id={`g-${n}`} cx="35%" cy="28%" r="80%">
        <stop offset="0%" stopColor={mix(c, '#ffffff', 0.45)} />
        <stop offset="55%" stopColor={c} />
        <stop offset="100%" stopColor={mix(c, '#3a2418', 0.22)} />
      </radialGradient>
    ))}
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="8" dy="14" stdDeviation="8" floodColor="#6B4A35" floodOpacity="0.28" />
    </filter>
    <filter id="lump" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={1} seed={3} />
      <feDisplacementMap in="SourceGraphic" scale={6} />
    </filter>
  </defs>
);

const ease = Easing.bezier(0.65, 0, 0.35, 1);
const easeIn = Easing.in(Easing.quad);
const lerp = (f: number, i: number[], o: number[], e: (t: number) => number = ease) => interpolate(f, i, o, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

type P = [number, number];
const along = (f: number, a: number, b: number, p0: P, p1: P, e: (t: number) => number = ease, arc = 0): P => {
  const t = lerp(f, [a, b], [0, 1], e);
  return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t - arc * Math.sin(Math.PI * t)];
};

// ------------------------------------------------------------------ rampas de la sección 0
const RAMPS: [P, P][] = [
  [[130, 560], [900, 800]],
  [[950, 960], [180, 1200]],
  [[130, 1360], [900, 1600]],
];
const onRamp = (k: number, t: number): P => {
  const [a, b] = RAMPS[k];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy);
  const ux = dx / L;
  const uy = dy / L;
  let nx = uy;
  let ny = -ux;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  return [a[0] + dx * t + nx * 62, a[1] + dy * t + ny * 62];
};

// recorrido de la plinko (sección 2)
const PLINKO_SEQ = [1, -1, 1, 1, -1, 1, -1, 1];
const plinkoX = (k: number) => 540 + 39 * PLINKO_SEQ.slice(0, k).reduce((s, v) => s + v, 0);
const rowY = (k: number) => 440 + k * 110;

/** Posición de la canica en coordenadas del mundo (cada sección mide 1920 de alto). */
const marblePos = (f: number): P | null => {
  const s0 = EV.s0;
  if (f < 22) return onRamp(0, 0.09);
  if (f < 50) {
    const t = lerp(f, [22, 50], [0.09, 0.97], easeIn);
    return onRamp(0, t);
  }
  if (f < 58) return along(f, 50, 58, onRamp(0, 0.97), onRamp(1, 0.05), easeIn, 20);
  if (f < 84) return onRamp(1, lerp(f, [58, 84], [0.05, 0.95], easeIn));
  if (f < 92) return along(f, 84, 92, onRamp(1, 0.95), onRamp(2, 0.08), easeIn, 20);
  if (f < 116) return onRamp(2, lerp(f, [92, 116], [0.08, 0.97], easeIn));
  if (f < s0.clacks[5]) return along(f, 116, s0.clacks[5], onRamp(2, 0.97), [560, 1760], easeIn, 60);
  if (f < 135) return along(f, s0.clacks[5], 135, [560, 1760], [540, 2000], easeIn);
  // sección 1
  const y1 = H;
  const s1 = EV.s1;
  if (f < s1.land) {
    const p = along(f, 135, s1.land, [540, 80], [840, 700], easeIn, -120);
    return [p[0], p[1] + y1];
  }
  if (f < s1.roll[0]) return [840, 700 + y1];
  if (f < s1.roll[1]) {
    const p = along(f, s1.roll[0], s1.roll[1], [840, 700], [240, 730], (t) => t);
    return [p[0], p[1] + y1];
  }
  if (f < s1.rollDown[0]) return [240, 730 + y1];
  if (f < 262) {
    const p = along(f, s1.rollDown[0], 262, [240, 730], [700, 1300], easeIn);
    return [p[0], p[1] + y1];
  }
  if (f < 284) {
    const p = along(f, 262, 284, [700, 1300], [560, 1700], (t) => t, 40);
    return [p[0], p[1] + y1];
  }
  if (f < 300) {
    const p = along(f, 284, 300, [560, 1700], [540, 2000], easeIn);
    return [p[0], p[1] + y1];
  }
  // sección 2 · plinko
  const y2 = 2 * H;
  const s2 = EV.s2;
  if (f < s2.enter) {
    const p = along(f, 300, s2.enter, [540, 80], [540, rowY(1) - 50 - 60], easeIn);
    return [p[0], p[1] + y2];
  }
  if (f < s2.rows[0]) {
    const p = along(f, s2.enter, s2.rows[0], [540, rowY(1) - 110], [540, rowY(1) - 50], easeIn);
    return [p[0], p[1] + y2];
  }
  for (let k = 0; k < s2.rows.length; k++) {
    const a = s2.rows[k];
    const b = k + 1 < s2.rows.length ? s2.rows[k + 1] : s2.bin;
    if (f < b) {
      const from: P = [plinkoX(k), rowY(k + 1) - 50];
      const to: P = k + 1 < s2.rows.length ? [plinkoX(k + 1), rowY(k + 2) - 50] : [plinkoX(8), 1440];
      const p = along(f, a, b, from, to, (t) => t, 34);
      return [p[0], p[1] + y2];
    }
  }
  if (f < s2.trap) return [plinkoX(8), 1440 + y2];
  if (f < 480) {
    const p = along(f, s2.trap, 480, [plinkoX(8), 1440], [540, 2000], easeIn, -40);
    return [p[0], p[1] + y2];
  }
  // sección 3 · botón
  const y3 = 3 * H;
  const s3 = EV.s3;
  if (f < s3.land) {
    const p = along(f, 480, s3.land, [540, 80], [540, 946], easeIn);
    return [p[0], p[1] + y3];
  }
  if (f < 640) {
    const press = lerp(f, [s3.press, s3.press + 3], [0, 30]);
    return [540, 946 + press + y3];
  }
  return null;
};

// ------------------------------------------------------------------ piezas
const Plaque: React.FC<{x: number; y: number; text: string; w?: number}> = ({x, y, text, w}) => {
  const width = w ?? text.length * 30 + 90;
  return (
    <g filter="url(#soft)">
      <rect x={x - width / 2} y={y - 50} width={width} height={100} rx={50} fill={g('cream')} />
      <text x={x + 2} y={y + 18} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={50} fill="#fff" opacity={0.8}>
        {text}
      </text>
      <text x={x} y={y + 16} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={50} fill={INK}>
        {text}
      </text>
    </g>
  );
};

const Marble: React.FC<{x: number; y: number; f: number; painted: number; hat: boolean; r?: number; spin?: number}> = ({x, y, f, painted, hat, r = 44, spin}) => {
  const rot = spin ?? (x / r) * 57.3;
  return (
    <g transform={`translate(${x} ${y})`} filter="url(#soft)">
      <circle r={r} fill={painted > 0.5 ? g('coral') : g('grey')} />
      {painted > 0 && (
        <g transform={`rotate(${rot})`} opacity={painted}>
          <path d={`M ${-r} -8 Q 0 -${r * 0.6} ${r} -8`} stroke={CLAY.butter} strokeWidth={9} fill="none" />
          <path d={`M ${-r} 14 Q 0 ${r * 0.3} ${r} 14`} stroke={CLAY.mint} strokeWidth={9} fill="none" />
        </g>
      )}
      <g transform={`scale(${r / 44})`}>
        <rect x={-22} y={-14} width={44} height={28} rx={6} fill="#fff" opacity={0.92} />
        <text y={9} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={22} fill={INK}>
          CV
        </text>
      </g>
      <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.22} ry={r * 0.13} fill="#fff" opacity={0.6} />
      {hat && (
        <g transform={`translate(4 ${-r + 4}) rotate(-12)`}>
          <ellipse rx={r * 0.85} ry={r * 0.32} fill={g('lilac')} />
          <circle cx={0} cy={-r * 0.3} r={6} fill={CLAY.lilac} />
        </g>
      )}
    </g>
  );
};

const Ramp: React.FC<{a: P; b: P; color?: string}> = ({a, b, color = 'wood'}) => {
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return (
    <g filter="url(#soft)">
      <g transform={`translate(${a[0]} ${a[1]}) rotate(${ang})`}>
        <rect x={0} y={-18} width={L} height={36} rx={18} fill={g(color)} />
        <rect x={0} y={-30} width={L} height={14} rx={7} fill={g(color)} opacity={0.9} />
      </g>
      <rect x={a[0] + 20} y={Math.min(a[1], b[1]) + 30} width={18} height={Math.abs(b[1] - a[1]) + 60} rx={9} fill={g('brown')} opacity={0.0} />
    </g>
  );
};

// ------------------------------------------------------------------ secciones
const Section0: React.FC<{f: number}> = ({f}) => {
  const push = lerp(f, [EV.s0.push - 4, EV.s0.push + 2], [0, 40]);
  return (
    <g>
      <Plaque x={540} y={220} text="SALIDA" />
      {/* palanca que empuja */}
      <g transform={`translate(110 520) rotate(${push})`} filter="url(#soft)">
        <rect x={-12} y={-150} width={24} height={150} rx={12} fill={g('butter')} />
        <circle cx={0} cy={-150} r={22} fill={g('coral')} />
      </g>
      <circle cx={110} cy={520} r={20} fill={g('brown')} />
      {RAMPS.map(([a, b], i) => (
        <Ramp key={i} a={a} b={b} color={['peach', 'mint', 'lilac'][i]} />
      ))}
      {/* embudo */}
      <g filter="url(#soft)">
        <path d="M 380 1690 L 700 1690 L 590 1860 L 490 1860 Z" fill={g('sky')} />
        <rect x={490} y={1850} width={100} height={90} fill={g('sky')} />
      </g>
    </g>
  );
};

const Section1: React.FC<{f: number}> = ({f}) => {
  const s1 = EV.s1;
  const rollerRot = f * 9;
  const craneY = f < s1.craneDown[0] ? 250 : f < s1.hat ? lerp(f, s1.craneDown, [250, 560]) : lerp(f, [s1.hat, s1.hat + 8], [560, 250]);
  const holdingHat = f < s1.hat;
  return (
    <g>
      <Plaque x={540} y={150} text="PERSONALIZA" />
      {/* tubo de entrada */}
      <path d="M 540 0 L 540 260 Q 560 520 860 640" stroke={CLAY.sky} strokeWidth={130} fill="none" opacity={0.35} strokeLinecap="round" />
      {/* pista */}
      <g filter="url(#soft)">
        <path d="M 920 762 L 160 792" stroke={g('wood')} strokeWidth={34} strokeLinecap="round" />
        <path d="M 920 762 L 160 792" stroke={CLAY.wood} strokeWidth={34} strokeLinecap="round" />
      </g>
      {/* rodillos de pintura */}
      {[600, 880].map((cy, i) => (
        <g key={cy} filter="url(#soft)">
          <circle cx={540} cy={cy} r={96} fill={g(i ? 'mint' : 'butter')} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = ((rollerRot * (i ? -1 : 1) + k * 60) * Math.PI) / 180;
            return <line key={k} x1={540 + Math.cos(a) * 30} y1={cy + Math.sin(a) * 30} x2={540 + Math.cos(a) * 92} y2={cy + Math.sin(a) * 92} stroke={i ? CLAY.coral : CLAY.lilac} strokeWidth={14} strokeLinecap="round" />;
          })}
          <circle cx={540} cy={cy} r={22} fill={g('brown')} />
        </g>
      ))}
      {/* salpicaduras de pintura */}
      {f >= s1.paint[0] &&
        f < s1.paint[1] + 10 &&
        Array.from({length: 8}, (_, k) => {
          const d = f - s1.paint[0];
          const a = (k / 8) * Math.PI * 2;
          return <circle key={k} cx={540 + Math.cos(a) * (40 + d * 6)} cy={740 + Math.sin(a) * (30 + d * 4)} r={9 - d * 0.3} fill={[CLAY.coral, CLAY.butter, CLAY.mint][k % 3]} opacity={1 - d / 26} />;
        })}
      {/* grúa con la boina */}
      <g filter="url(#soft)">
        <rect x={60} y={0} width={360} height={30} rx={15} fill={g('grey')} />
        <rect x={232} y={0} width={16} height={craneY - 20} fill={g('grey')} />
        <path d={`M 210 ${craneY - 30} L 270 ${craneY - 30} L 284 ${craneY + 10} M 210 ${craneY - 30} L 196 ${craneY + 10}`} stroke={CLAY.brown} strokeWidth={10} fill="none" strokeLinecap="round" />
        {holdingHat && (
          <g transform={`translate(240 ${craneY + 10}) rotate(-12)`}>
            <ellipse rx={38} ry={14} fill={g('lilac')} />
            <circle cy={-14} r={6} fill={CLAY.lilac} />
          </g>
        )}
      </g>
      {/* rampa de bajada y embudo */}
      <Ramp a={[180, 840]} b={[760, 1380]} color="peach" />
      <g filter="url(#soft)">
        <path d="M 400 1620 L 760 1620 L 600 1800 L 480 1800 Z" fill={g('sky')} />
        <rect x={480} y={1790} width={120} height={140} fill={g('sky')} />
      </g>
    </g>
  );
};

const Section2: React.FC<{f: number}> = ({f}) => {
  const s2 = EV.s2;
  const binX = [150, 306, 462, 618, 774, 930];
  const closed = [0, 2, 5];
  const glow = f >= s2.bin ? 1 : 0;
  const trap = lerp(f, [s2.trap, s2.trap + 6], [0, 1]);
  const pegs: React.ReactNode[] = [];
  for (let k = 1; k <= 8; k++) {
    for (let m = -4; m <= k + 3; m++) {
      const x = 540 + 39 * (2 * m - (k - 1));
      if (x < 120 || x > 960) continue;
      const hit = s2.rows[k - 1];
      const isHit = Math.abs(x - plinkoX(k - 1)) < 2 && f >= hit && f < hit + 6;
      pegs.push(<circle key={`${k}-${m}`} cx={x} cy={rowY(k)} r={isHit ? 17 : 14} fill={g(isHit ? 'butter' : 'lilac')} />);
    }
  }
  return (
    <g>
      <Plaque x={540} y={150} text="FILTRA" />
      <g filter="url(#soft)">
        <rect x={90} y={300} width={900} height={1080} rx={60} fill={g('cream')} opacity={0.75} />
        {pegs}
      </g>
      {/* cubetas */}
      <g filter="url(#soft)">
        {binX.map((x, i) => (
          <g key={i}>
            <rect x={x - 70} y={1400} width={140} height={150} rx={20} fill={g(i === 3 && glow ? 'green' : 'peach')} />
            {closed.includes(i) && (
              <g>
                <rect x={x - 76} y={1386} width={152} height={30} rx={12} fill={g('red')} />
                <path d={`M ${x - 22} ${1440} L ${x + 22} ${1490} M ${x + 22} ${1440} L ${x - 22} ${1490}`} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
              </g>
            )}
          </g>
        ))}
        <rect x={60} y={1550} width={960} height={40} rx={20} fill={g('wood')} />
        {/* trampilla de la cubeta buena */}
        <rect x={548} y={1550} width={140 * (1 - trap)} height={40} rx={12} fill={g('brown')} />
      </g>
      {glow > 0 && <text x={618} y={1640} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={44} fill={INK}>¡encaja!</text>}
      {glow > 0 && f < s2.trap && <circle cx={618} cy={1440} r={90 + 10 * Math.sin(f)} fill={CLAY.green} opacity={0.25} />}
    </g>
  );
};

const DOORS = Array.from({length: 12}, (_, i) => ({x: 190 + (i % 4) * 233, y: 260 + Math.floor(i / 4) * 230}));
const Section3: React.FC<{f: number}> = ({f}) => {
  const s3 = EV.s3;
  const press = lerp(f, [s3.press, s3.press + 3], [0, 30]);
  return (
    <g>
      {/* casitas / puertas */}
      {DOORS.map((d, i) => {
        const arrive = s3.shots[i] + s3.flight;
        const open = f >= arrive;
        return (
          <g key={i} filter="url(#soft)">
            <path d={`M ${d.x - 80} ${d.y + 20} L ${d.x} ${d.y - 50} L ${d.x + 80} ${d.y + 20} Z`} fill={g(['coral', 'mint', 'lilac', 'sky'][i % 4])} />
            <rect x={d.x - 70} y={d.y + 10} width={140} height={130} rx={12} fill={g('cream')} />
            <rect x={d.x - 28} y={d.y + 50} width={56} height={90} rx={10} fill={open ? CLAY.butter : g('brown')} />
            {open && <circle cx={d.x} cy={d.y + 112} r={18} fill={g('coral')} />}
            {open && f < arrive + 10 && <circle cx={d.x} cy={d.y + 90} r={50 + (f - arrive) * 6} fill="none" stroke={CLAY.butter} strokeWidth={6} opacity={1 - (f - arrive) / 10} />}
          </g>
        );
      })}
      <Plaque x={540} y={1300} text="ENVÍA" />
      {/* botón */}
      <g filter="url(#soft)">
        <rect x={360} y={1060} width={360} height={90} rx={30} fill={g('wood')} />
        <ellipse cx={540} cy={1050 + press} rx={140} ry={60} fill={g('red')} />
        <rect x={400} y={1050 + press} width={280} height={30 - press} fill={CLAY.red} />
      </g>
      {/* tubos lanzadores */}
      {DOORS.map((d, i) => {
        const bx = 120 + i * 76;
        const recoil = f >= s3.shots[i] && f < s3.shots[i] + 4 ? 12 : 0;
        return (
          <g key={i} filter="url(#soft)">
            <rect x={bx - 22} y={1560 + recoil} width={44} height={160} rx={18} fill={g(['peach', 'mint', 'lilac', 'butter'][i % 4])} />
          </g>
        );
      })}
      <rect x={80} y={1700} width={920} height={60} rx={30} fill={g('wood')} filter="url(#soft)" />
      {/* canicas en vuelo */}
      {DOORS.map((d, i) => {
        const t0 = s3.shots[i];
        const p = lerp(f, [t0, t0 + s3.flight], [0, 1], (t) => t);
        if (p <= 0 || p >= 1) return null;
        const bx = 120 + i * 76;
        const x = bx + (d.x - bx) * p;
        const y = 1560 + (d.y + 112 - 1560) * p - 320 * Math.sin(Math.PI * p);
        return <Marble key={i} x={x} y={y} f={f} painted={1} hat r={20} spin={p * 360} />;
      })}
    </g>
  );
};

const Section4: React.FC<{f: number}> = ({f}) => {
  const s4 = EV.s4;
  const shelves = [
    {y: 520, from: 120, to: 960, dir: 1, n: 13},
    {y: 1000, from: 960, to: 120, dir: -1, n: 13},
    {y: 1480, from: 120, to: 760, dir: 1, n: 12},
  ];
  let idx = 0;
  const ringing = s4.ring.some((r) => f >= r && f < r + 12);
  const shake = ringing ? Math.sin(f * 2.2) * 8 : 0;
  return (
    <g>
      <Plaque x={540} y={220} text="…Y TE LLAMAN" />
      {shelves.map((sh, si) => (
        <g key={si}>
          <rect x={80} y={sh.y} width={920} height={34} rx={17} fill={g('wood')} filter="url(#soft)" />
          {Array.from({length: sh.n}, (_, k) => {
            const i = idx++;
            const x = sh.from + ((sh.to - sh.from) * (k + 0.5)) / sh.n;
            const t0 = s4.start + i * s4.step;
            const ang = lerp(f, [t0, t0 + 5], [0, 68], Easing.in(Easing.quad)) * sh.dir;
            return (
              <g key={k} transform={`translate(${x} ${sh.y}) rotate(${ang} ${sh.dir > 0 ? 14 : -14} 0)`} filter="url(#soft)">
                <rect x={-14} y={-130} width={28} height={130} rx={8} fill={g(['coral', 'butter', 'mint', 'lilac', 'sky'][i % 5])} />
                <circle cx={0} cy={-90} r={4} fill="#fff" opacity={0.8} />
                <circle cx={0} cy={-40} r={4} fill="#fff" opacity={0.8} />
              </g>
            );
          })}
        </g>
      ))}
      {/* teléfono antiguo */}
      <g transform={`translate(${880 + shake} 1480) rotate(${shake * 0.4})`} filter="url(#soft)">
        <path d="M -120 0 L -90 -150 L 90 -150 L 120 0 Z" fill={g('mint')} />
        <circle cx={0} cy={-75} r={52} fill={g('cream')} />
        {Array.from({length: 8}, (_, k) => {
          const a = (k / 8) * Math.PI * 2;
          return <circle key={k} cx={Math.cos(a) * 34} cy={-75 + Math.sin(a) * 34} r={7} fill={CLAY.brown} opacity={0.6} />;
        })}
        <g transform={`translate(0 ${-175 - (ringing ? 18 + Math.abs(Math.sin(f)) * 14 : 0)})`}>
          <path d="M -130 10 Q -130 -40 -90 -40 L 90 -40 Q 130 -40 130 10 L 100 10 Q 90 -10 70 -10 L -70 -10 Q -90 -10 -100 10 Z" fill={g('mint')} />
        </g>
      </g>
      {ringing &&
        [0, 1].map((k) => (
          <path
            key={k}
            d={`M ${700 - k * 40} ${1240 - k * 30} q -30 30 0 60 M ${1060 + k * 40} ${1240 - k * 30} q 30 30 0 60`}
            stroke={CLAY.coral}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      {f >= s4.ring[0] && (
        <text x={880} y={1130} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={70} fill={INK} transform={`rotate(-6 880 1130)`}>
          ¡riiing!
        </text>
      )}
    </g>
  );
};

const LETTERS = [
  {ch: 'k', x: 240, c: 'coral'},
  {ch: 'n', x: 450, c: 'mint'},
  {ch: 'o', x: 665, c: 'butter'},
  {ch: 'k', x: 870, c: 'lilac'},
];
const BASE = 1080;
const Section5: React.FC<{f: number}> = ({f}) => {
  const s5 = EV.s5;
  const mT = lerp(f, s5.marble, [0, 1], (t) => t);
  const bounce = (t: number) => {
    // dos botes y cae en la "o"
    const pts: P[] = [
      [-80, 300],
      [240, 640],
      [450, 560],
      [665, 1000],
    ];
    const seg = Math.min(2, Math.floor(t * 3));
    const lt = t * 3 - seg;
    const a = pts[seg];
    const b = pts[seg + 1];
    return [a[0] + (b[0] - a[0]) * lt, a[1] + (b[1] - a[1]) * lt - 220 * Math.sin(Math.PI * lt)] as P;
  };
  const settled = f >= s5.settle;
  const mp = settled ? ([665, 1000] as P) : bounce(mT);
  return (
    <g>
      <rect x={120} y={BASE + 30} width={840} height={70} rx={35} fill={g('wood')} filter="url(#soft)" />
      {LETTERS.map((l, i) => {
        const t0 = s5.letters[i];
        const drop = lerp(f, [t0, t0 + 8], [-1400, 0], Easing.in(Easing.quad));
        const sq = f >= t0 + 8 ? 1 + 0.18 * Math.exp(-(f - t0 - 8) / 3) * Math.cos((f - t0 - 8) * 1.1) : 1;
        if (f < t0) return null;
        return (
          <g key={i} transform={`translate(${l.x} ${BASE + 30 + drop}) scale(${2 - sq} ${sq})`} filter="url(#soft)">
            <text x={6} y={10} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={330} fill={mix(CLAY[l.c], '#3a2418', 0.3)}>
              {l.ch}
            </text>
            <text x={0} y={0} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={330} fill={g(l.c)}>
              {l.ch}
            </text>
          </g>
        );
      })}
      {f >= s5.marble[0] && <Marble x={mp[0]} y={mp[1]} f={f} painted={1} hat r={settled ? 40 : 44} spin={settled ? 0 : mT * 720} />}
      {f >= s5.tag && (
        <g opacity={lerp(f, [s5.tag, s5.tag + 8], [0, 1])} transform={`translate(0 ${lerp(f, [s5.tag, s5.tag + 8], [30, 0])})`}>
          <Plaque x={540} y={1360} text="Deja que la máquina trabaje." w={940} />
        </g>
      )}
    </g>
  );
};

/** Vídeo 7 — «La máquina»: reacción en cadena de plastilina, sin voces. */
export const Machine: React.FC = () => {
  const frame = useCurrentFrame();
  // stop-motion: la imagen se mueve "a dos" (15 poses por segundo) con un leve temblor
  const f = Math.floor(frame / 2) * 2;
  const jx = (random(`jx${f}`) - 0.5) * 3;
  const jy = (random(`jy${f}`) - 0.5) * 3;

  const cuts = EV.cuts;
  let cam = 0;
  cuts.forEach((c, i) => {
    cam += lerp(frame, [c - 8, c + 6], [0, H]) * (i >= 0 ? 1 : 0);
  });
  const sec = Math.min(5, cuts.filter((c) => frame >= c - 8).length);
  const visible = (k: number) => Math.abs(k - cam / H) < 1.05;
  const mp = marblePos(f);
  const s1 = EV.s1;
  const painted = lerp(f, s1.paint, [0, 1], (t) => t);

  return (
    <AbsoluteFill style={{background: '#F4E7D7', overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <ClayDefs />
        <defs>
          <pattern id="dots" width={80} height={80} patternUnits="userSpaceOnUse">
            <circle cx={20} cy={20} r={5} fill="#E9D6C0" />
            <circle cx={60} cy={60} r={3} fill="#EBDDCB" />
          </pattern>
          <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F7ECDF" />
            <stop offset="1" stopColor="#EED9C2" />
          </linearGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#wall)" />
        <g transform={`translate(${jx} ${-cam * 0.2 + jy})`}>
          <rect x={0} y={-2000} width={1080} height={H * 7} fill="url(#dots)" />
        </g>
        <g transform={`translate(${jx} ${-cam + jy})`}>
          {visible(0) && <Section0 f={f} />}
          {visible(1) && (
            <g transform={`translate(0 ${H})`}>
              <Section1 f={f} />
            </g>
          )}
          {visible(2) && (
            <g transform={`translate(0 ${2 * H})`}>
              <Section2 f={f} />
            </g>
          )}
          {visible(3) && (
            <g transform={`translate(0 ${3 * H})`}>
              <Section3 f={f} />
            </g>
          )}
          {visible(4) && (
            <g transform={`translate(0 ${4 * H})`}>
              <Section4 f={f} />
            </g>
          )}
          {visible(5) && (
            <g transform={`translate(0 ${5 * H})`}>
              <Section5 f={f} />
            </g>
          )}
          {mp && <Marble x={mp[0]} y={mp[1]} f={f} painted={painted} hat={f >= s1.hat} />}
        </g>
      </svg>
      {sec >= 0 && null}
      {/* textura de papel / grano suave */}
      <AbsoluteFill style={{opacity: 0.06, mixBlendMode: 'multiply'}}>
        <svg width="100%" height="100%">
          <filter id="paper">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={f % 30} />
          </filter>
          <rect width="100%" height="100%" filter="url(#paper)" />
        </svg>
      </AbsoluteFill>
      <Audio src={staticFile('machine-mix.wav')} />
    </AbsoluteFill>
  );
};
