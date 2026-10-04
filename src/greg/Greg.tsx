import React from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import {INK, Person} from './People';
import timings from './timings.json';

export const GREG_TOTAL = 900;
const FPS = 30;
type Line = {id: string; who: string; text: string; start: number; end: number};
const LINES = timings.lines as Line[];
const ENV = timings.env as number[];
const L = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<string, Line>;

// mismos momentos que scripts/generate_music_greg.py
const FLIPS = [L.l2.start - 0.15, L.l4.start - 0.15, L.l6.start - 0.13, L.l7.start - 0.15, L.l7.end + 0.02, L.l9.start - 0.15];
const KNOCKS = [L.l7.end + 0.3, L.l7.end + 0.6];
const DOOR = L.l7.end + 0.82;
const CLOSE = 28.65;
const FLIP_DUR = 0.42;

const PAPER = '#FCFBF6';
const RULE = '#B7D1EC';
const MARGIN = '#EE9C9C';
const AMBER = '#FFB21E';
const RED = '#E4572E';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const pop = (t: number, at: number) => {
  const d = t - at;
  if (d < 0) return 0;
  return 1 + 0.25 * Math.exp(-d * 9) * Math.sin(d * 30) - Math.max(0, 0.3 - d * 3) * 0;
};

type Ctx = {t: number; frame: number};
const talkOf = (who: string, ctx: Ctx) => {
  const l = LINES.find((x) => ctx.t >= x.start && ctx.t <= x.end);
  if (!l || l.who !== who) return 0;
  return Math.min(1, (ENV[ctx.frame] ?? 0) * 1.8);
};

/** Texto que se escribe al ritmo de la voz. */
const words = (text: string, start: number, end: number, t: number, skip = 0) => {
  const ws = text.split(' ');
  let acc = 0;
  return ws.map((w, i) => {
    const at = start + ((end - start) * acc) / text.length;
    acc += w.length + 1;
    if (i < skip) return null;
    return (
      <span key={i} style={{opacity: t >= at ? 1 : 0}}>
        {w}{' '}
      </span>
    );
  });
};

const Header: React.FC<{children: string; t: number; at: number}> = ({children, t, at}) => (
  <div style={{position: 'absolute', left: 170, top: 128, fontFamily: fonts.diary, fontSize: 92, color: INK, opacity: t >= at ? 1 : 0}}>
    {children}
    <svg width={children.length * 40} height={20} style={{position: 'absolute', left: 0, top: 104}}>
      <path d={`M 4 10 Q ${children.length * 10} 2 ${children.length * 20} 10 T ${children.length * 40 - 6} 8`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    </svg>
  </div>
);

const Diary: React.FC<{line: Line; t: number; top?: number; skip?: number}> = ({line, t, top = 310, skip = 0}) => (
  <div style={{position: 'absolute', left: 170, right: 70, top, fontFamily: fonts.diary, fontSize: 64, lineHeight: '62px', color: INK}}>
    {words(line.text, line.start, line.end, t, skip)}
  </div>
);

/** Bocadillo dibujado a mano con cola hacia quien habla. */
const Bubble: React.FC<{line: Line; t: number; x: number; y: number; w: number; tail: [number, number]; size?: number; extra?: React.ReactNode}> = ({line, t, x, y, w, tail, size = 54, extra}) => {
  const p = pop(t, line.start - 0.08);
  if (p <= 0) return null;
  const lines = Math.ceil((line.text.length * size * 0.42) / (w - 60));
  const h = lines * size * 1.1 + 60;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const jit = (k: string) => (random(k) - 0.5) * 10;
  const d = `M ${x + 30} ${y + jit('a')} Q ${cx} ${y - 14} ${x + w - 30} ${y + jit('b')} Q ${x + w + 8} ${y + 4} ${x + w + jit('c')} ${cy} Q ${x + w + 6} ${y + h + 4} ${x + w - 30} ${y + h} Q ${cx} ${y + h + 14} ${x + 30} ${y + h + jit('d')} Q ${x - 8} ${y + h - 4} ${x + jit('e')} ${cy} Q ${x - 6} ${y - 4} ${x + 30} ${y + jit('a')} Z`;
  const bx = Math.max(x + 50, Math.min(x + w - 90, tail[0]));
  const by = tail[1] < y ? y : y + h;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${tail[0]}px ${tail[1]}px`, transform: `scale(${p})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M ${bx} ${by} L ${tail[0]} ${tail[1]} L ${bx + 46} ${by} Z`} fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={d} fill="#fff" stroke={INK} strokeWidth={5} />
        <path d={`M ${bx + 4} ${by} L ${bx + 42} ${by}`} stroke="#fff" strokeWidth={8} />
      </svg>
      <div style={{position: 'absolute', left: x + 28, top: y + 26, width: w - 56, fontFamily: fonts.diary, fontSize: size, lineHeight: 1.1, color: INK, textAlign: 'center'}}>
        {words(line.text, line.start, line.end, t)}
      </div>
      {extra}
    </div>
  );
};

/** Flecha con anotación manuscrita, muy de diario. */
const Note: React.FC<{t: number; at: number; x: number; y: number; text: string; arrow: string; size?: number; rot?: number}> = ({t, at, x, y, text, arrow, size = 44, rot = -4}) => {
  const p = seg(t, at, at + 0.35);
  if (p <= 0) return null;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={arrow} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: x, top: y, fontFamily: fonts.diary, fontSize: size, color: INK, transform: `rotate(${rot}deg)`, opacity: p, whiteSpace: 'pre'}}>{text}</div>
    </>
  );
};

const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 29}, (_, i) => (
        <line key={i} x1={0} x2={1080} y1={248 + i * 62} y2={248 + i * 62} stroke={RULE} strokeWidth={2.5} />
      ))}
      <line x1={140} x2={140} y1={0} y2={1920} stroke={MARGIN} strokeWidth={3} />
      {[360, 960, 1560].map((y) => (
        <circle key={y} cx={64} cy={y} r={24} fill="#2E2A26" />
      ))}
    </svg>
    <AbsoluteFill style={{filter: 'url(#boil)'}}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- páginas
const PageMonday: React.FC<Ctx> = (c) => {
  const {t} = c;
  const send = seg(t, 1.6, 4.2);
  return (
    <Paper>
      <Header t={t} at={0}>Lunes</Header>
      <Diary line={L.l1} t={t} skip={1} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* mesa, portátil y montón de CVs */}
        <path d="M 440 1420 L 1010 1420 M 480 1420 L 480 1700 M 970 1420 L 970 1700" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 560 1250 L 820 1250 L 820 1410 L 560 1410 Z M 520 1420 L 860 1420 L 840 1404 L 540 1404 Z" fill="#fff" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        <rect x={620} y={1300} width={140} height={50} rx={10} fill={t > 1.6 && Math.floor(t * 6) % 2 ? AMBER : '#fff'} stroke={INK} strokeWidth={4} />
        <text x={690} y={1336} textAnchor="middle" fontFamily={fonts.diary} fontSize={34} fill={INK}>enviar</text>
        {Array.from({length: 9}, (_, i) => (
          <path key={i} d={`M ${880 + (i % 2) * 6} ${1404 - i * 14} l 100 0 l 0 12 l -100 0 Z`} fill="#fff" stroke={INK} strokeWidth={3.5} />
        ))}
        <text x={935} y={1250} textAnchor="middle" fontFamily={fonts.diary} fontSize={44} fill={INK}>x50</text>
        {/* CVs volando */}
        {Array.from({length: 7}, (_, i) => {
          const p = seg(send, i * 0.1, 0.3 + i * 0.1);
          if (p <= 0 || p >= 1) return null;
          const x = 690 + p * (200 + i * 40) * (i % 2 ? 1 : -0.4);
          const y = 1250 - p * 700;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${p * 200 * (i % 2 ? 1 : -1)})`}>
              <path d="M -30 -40 L 30 -40 L 30 40 L -30 40 Z M -18 -20 L 18 -20 M -18 -4 L 18 -4 M -18 12 L 8 12" fill="#fff" stroke={INK} strokeWidth={4} />
            </g>
          );
        })}
        <Person kind="dani" x={290} y={1740} s={1.65} face="smug" armR={95 + 6 * Math.sin(t * 9)} armL={20} talk={talkOf('dani', c)} look={1} />
        {/* destellos de "genio" */}
        {t > 3.2 &&
          [
            [190, 1130],
            [420, 1100],
          ].map(([x, y], i) => <path key={i} d={`M ${x} ${y - 24} L ${x + 6} ${y - 6} L ${x + 24} ${y} L ${x + 6} ${y + 6} L ${x} ${y + 24} L ${x - 6} ${y + 6} L ${x - 24} ${y} L ${x - 6} ${y - 6} Z`} fill={AMBER} stroke={INK} strokeWidth={3} />)}
      </svg>
      <Note t={t} at={3.3} x={170} y={830} text={'yo, un genio'} arrow="M 330 900 Q 380 960 330 1040" />
    </Paper>
  );
};

const PageFriday: React.FC<Ctx> = (c) => {
  const {t} = c;
  const robot = t >= L.l3.start - 0.25;
  const mail = t >= L.l2.start + 1.4;
  return (
    <Paper>
      <Header t={t} at={FLIPS[0]}>Viernes</Header>
      <Diary line={L.l2} t={t} skip={1} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Person kind="dani" x={300} y={1820} s={1.6} face="sad" armL={40} armR={70} talk={talkOf('dani', c)} look={1} />
        {/* gota de sudor */}
        {robot && <path d="M 410 1250 q 14 26 0 34 q -14 -8 0 -34 Z" fill="#9CC9F0" stroke={INK} strokeWidth={3.5} />}
        <path d="M 160 1640 L 1000 1640 M 200 1640 L 200 1880 M 960 1640 L 960 1880" stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        <path d="M 520 1400 L 900 1400 L 900 1630 L 520 1630 Z M 480 1640 L 940 1640 L 920 1624 L 500 1624 Z" fill="#fff" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        {mail && !robot && (
          <g>
            <path d="M 650 1470 L 770 1470 L 770 1550 L 650 1550 Z M 650 1470 L 710 1515 L 770 1470" fill="#fff" stroke={INK} strokeWidth={4} />
            <circle cx={775} cy={1468} r={20} fill={RED} />
            <text x={775} y={1480} textAnchor="middle" fontFamily={fonts.diary} fontSize={30} fill="#fff">1</text>
          </g>
        )}
        {robot && (
          <g transform={`translate(710 1515) scale(${pop(t, L.l3.start - 0.25)})`}>
            <path d="M -70 -60 L 70 -60 L 70 60 L -70 60 Z" fill="#E8EDF5" stroke={INK} strokeWidth={5} />
            <path d="M 0 -60 L 0 -95" stroke={INK} strokeWidth={5} />
            <circle cx={0} cy={-102} r={9} fill={RED} stroke={INK} strokeWidth={3} />
            <rect x={-46} y={-30} width={30} height={22} fill={INK} />
            <rect x={16} y={-30} width={30} height={22} fill={INK} />
            <rect x={-40} y={20} width={80} height={6 + 18 * talkOf('robot', c)} fill={INK} />
          </g>
        )}
      </svg>
      {robot && <Bubble line={L.l3} t={t} x={450} y={880} w={560} tail={[700, 1400]} size={50} />}
      <Note t={t} at={L.l3.end - 0.3} x={600} y={1690} text={'el único que\nme contestó'} arrow="M 590 1750 Q 520 1720 560 1600" size={40} rot={-3} />
    </Paper>
  );
};

const PageKitchen: React.FC<Ctx> = (c) => {
  const {t} = c;
  return (
    <Paper>
      <Header t={t} at={FLIPS[1]}>Sábado</Header>
      <div style={{position: 'absolute', left: 170, top: 310, fontFamily: fonts.diary, fontSize: 60, lineHeight: '62px', color: INK}}>Mamá, en la cocina:</div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* ventana y encimera */}
        <path d="M 640 620 L 940 620 L 940 860 L 640 860 Z M 790 620 L 790 860 M 640 740 L 940 740" fill="none" stroke={INK} strokeWidth={5} />
        <path d="M 150 1500 L 1040 1500" stroke={INK} strokeWidth={5} />
        <Person kind="mama" x={330} y={1790} s={1.6} face="normal" armR={85} armL={15} talk={talkOf('mama', c)} look={1} />
        {/* taza */}
        <path d="M 445 1440 L 445 1490 Q 445 1500 455 1500 L 495 1500 Q 505 1500 505 1490 L 505 1440 Z M 505 1452 q 22 2 20 18 q -2 14 -20 14" fill="#fff" stroke={INK} strokeWidth={4} />
        <path d={`M 465 1420 q -10 -20 0 -40 M 485 1420 q 10 -20 0 -40`} stroke={INK} strokeWidth={3} fill="none" opacity={0.6 + 0.4 * Math.sin(t * 5)} />
        <Person kind="dani" x={790} y={1790} s={1.6} face={t > L.l5.start ? 'normal' : 'surprised'} armL={30} armR={t > L.l5.start ? 110 : 15} talk={talkOf('dani', c)} look={-1} />
      </svg>
      <Bubble line={L.l4} t={t} x={170} y={720} w={560} tail={[320, 1240]} size={52} />
      <Bubble
        line={L.l5}
        t={t}
        x={430}
        y={1000}
        w={600}
        tail={[760, 1250]}
        size={50}
      />
    </Paper>
  );
};

const PageSara: React.FC<Ctx> = (c) => {
  const {t} = c;
  return (
    <Paper>
      <Header t={t} at={FLIPS[2]}>Sábado, más tarde</Header>
      <div style={{position: 'absolute', left: 170, top: 310, fontFamily: fonts.diary, fontSize: 60, lineHeight: '62px', color: INK}}>Se lo conté a Sara.</div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* banco del parque */}
        <path d="M 170 1600 L 950 1600 M 170 1560 L 950 1560 M 210 1600 L 210 1740 M 910 1600 L 910 1740 M 170 1470 L 950 1470 M 170 1510 L 950 1510" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <Person kind="sara" x={360} y={1770} s={1.6} face="smug" armR={165} armL={20} talk={talkOf('sara', c)} look={1} />
        <Person kind="dani" x={770} y={1770} s={1.6} face="normal" armL={10} armR={10} look={-1} />
      </svg>
      <Bubble line={L.l6} t={t} x={190} y={760} w={640} tail={[400, 1250]} size={54} />
      <Note t={t} at={L.l6.end - 0.6} x={590} y={960} text={'Sara. Siempre tiene\nrazón (no se lo digáis)'} arrow="M 590 1030 Q 500 1080 450 1170" size={38} rot={2} />
    </Paper>
  );
};

const LETTERS = [
  {name: 'Estudio Faro', icon: 'faro'},
  {name: 'Nubo', icon: 'nube'},
  {name: 'Panadería Lola', icon: 'pan'},
];

const PageLetters: React.FC<Ctx> = (c) => {
  const {t} = c;
  const at = [L.l7.start + 1.4, L.l7.start + 2.1, L.l7.start + 2.8];
  return (
    <Paper>
      <Header t={t} at={FLIPS[3]}>Domingo</Header>
      <Diary line={L.l7} t={t} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* los 50 CVs iguales, tachados */}
        <g opacity={seg(t, FLIPS[3] + 0.2, FLIPS[3] + 0.5)}>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${180 + i * 10} ${820 + i * 10} l 110 0 l 0 140 l -110 0 Z`} fill="#fff" stroke={INK} strokeWidth={4} />
          ))}
          <text x={255} y={920} textAnchor="middle" fontFamily={fonts.diary} fontSize={36} fill={INK}>x50</text>
          <path d="M 160 800 L 340 1010 M 340 800 L 160 1010" stroke={RED} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - seg(t, L.l7.start + 0.5, L.l7.start + 1.0)} />
        </g>
        {LETTERS.map((l, i) => {
          const p = pop(t, at[i]);
          if (p <= 0) return null;
          const x = 250 + i * 290;
          const y = 1260;
          return (
            <g key={l.name} transform={`translate(${x} ${y}) scale(${p * 1.15}) rotate(${(i - 1) * 4})`}>
              <path d="M -120 -80 L 120 -80 L 120 80 L -120 80 Z M -120 -80 L 0 10 L 120 -80" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
              {l.icon === 'faro' && <path d="M -16 70 L -8 20 L 8 20 L 16 70 Z M -10 20 L -10 6 L 10 6 L 10 20 M 14 10 L 50 -4 M 14 14 L 50 24" fill="#fff" stroke={INK} strokeWidth={4} transform="translate(60 -20) scale(0.8)" />}
              {l.icon === 'nube' && <path d="M -30 10 q -24 0 -20 -20 q 4 -18 24 -14 q 8 -22 32 -14 q 20 6 16 26 q 20 4 14 20 q -4 12 -18 10 Z" fill="#fff" stroke={INK} strokeWidth={4} transform="translate(60 30) scale(0.7)" />}
              {l.icon === 'pan' && <path d="M -50 10 q 0 -24 50 -26 q 50 2 50 26 q 0 14 -50 14 q -50 0 -50 -14 Z M -26 -8 l 8 14 M 0 -12 l 8 14 M 24 -8 l 8 14" fill="#fff" stroke={INK} strokeWidth={4} transform="translate(60 35) scale(0.7)" />}
              <path d="M -88 40 q 20 -14 40 0 q 20 14 40 0" stroke={RED} strokeWidth={5} fill="none" />
              <text x={0} y={140} textAnchor="middle" fontFamily={fonts.diary} fontSize={42} fill={INK}>{l.name}</text>
            </g>
          );
        })}
        <Person kind="dani" x={540} y={2040} s={1.45} face="happy" armL={20} armR={120 + 10 * Math.sin(t * 12)} talk={talkOf('dani', c)} bust />
        <path d={`M ${640 + 4 * Math.sin(t * 12)} 1640 l 60 -96 l 16 9 l -60 96 Z`} transform="translate(0 60)" fill={AMBER} stroke={INK} strokeWidth={4} />
      </svg>
    </Paper>
  );
};

const PageDoor: React.FC<Ctx> = (c) => {
  const {t} = c;
  const open = seg(t, DOOR, DOOR + 0.35);
  const knockArm = KNOCKS.some((k) => t >= k - 0.08 && t < k + 0.06) ? 120 : 100;
  return (
    <Paper>
      <Header t={t} at={FLIPS[4]}>Lunes (otra vez)</Header>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {/* pared y puerta */}
        <path d="M 150 1760 L 1040 1760" stroke={INK} strokeWidth={5} />
        <path d="M 520 820 L 860 820 L 860 1760 L 520 1760 Z" fill={open > 0 ? '#2E2A26' : '#fff'} stroke={INK} strokeWidth={6} />
        {open > 0 && <path d="M 520 820 L 860 820 L 860 1760 L 520 1760 Z" fill={AMBER} opacity={0.25} />}
        {open > 0 && <Person kind="jefe" x={690} y={1760} s={1.3} face="happy" armL={20} armR={60 + 30 * Math.sin(t * 10)} talk={talkOf('jefe', c)} look={-1} />}
        <g transform={`translate(520 820) scale(${1 - 0.82 * open} 1)`}>
          <path d="M 0 0 L 340 0 L 340 940 L 0 940 Z" fill="#fff" stroke={INK} strokeWidth={6} />
          <path d="M 50 60 L 290 60 L 290 420 L 50 420 Z M 50 500 L 290 500 L 290 880 L 50 880 Z" fill="none" stroke={INK} strokeWidth={4} />
          <circle cx={295} cy={480} r={14} fill="#fff" stroke={INK} strokeWidth={4} />
        </g>
        <Person kind="dani" x={330} y={1760} s={1.35} face={open > 0 ? 'surprised' : 'normal'} armL={15} armR={open > 0 ? 20 : knockArm} tie look={1} />
        {KNOCKS.map((k, i) =>
          t >= k && t < k + 0.6 ? (
            <text key={i} x={560 + i * 140} y={1010 + i * 70} fontFamily={fonts.diary} fontSize={90 * pop(t, k)} fill={INK} transform={`rotate(${-8 + i * 12} ${560 + i * 140} ${1010 + i * 70})`}>
              ¡TOC!
            </text>
          ) : null,
        )}
      </svg>
      <div style={{position: 'absolute', left: 170, top: 310, fontFamily: fonts.diary, fontSize: 64, lineHeight: '62px', color: INK}}>9:00. Estudio Faro.</div>
      {open > 0.5 && <Bubble line={L.l8} t={t} x={430} y={880} w={540} tail={[700, 1240]} size={56} />}
    </Paper>
  );
};

const PageNote: React.FC<Ctx> = (c) => {
  const {t} = c;
  const momAt = L.l9.end - 0.4;
  return (
    <Paper>
      <Header t={t} at={FLIPS[5]}>Nota mental</Header>
      <Diary line={L.l9} t={t} skip={2} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d="M 150 1760 L 1040 1760" stroke={INK} strokeWidth={5} />
        {/* puertas: dos tachadas, una buena */}
        {[0, 1, 2].map((i) => {
          const x = 560 + i * 160;
          const good = i === 2;
          return (
            <g key={i}>
              <path d={`M ${x} 1420 L ${x + 120} 1420 L ${x + 120} 1760 L ${x} 1760 Z`} fill={good ? AMBER : '#fff'} fillOpacity={good ? 0.35 : 1} stroke={INK} strokeWidth={5} />
              <circle cx={x + 100} cy={1600} r={8} fill={INK} />
              {!good && <path d={`M ${x - 10} 1410 L ${x + 130} 1770`} stroke={RED} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - seg(t, FLIPS[5] + 1 + i * 0.4, FLIPS[5] + 1.3 + i * 0.4)} />}
            </g>
          );
        })}
        <path d="M 940 1310 L 948 1336 L 976 1336 L 954 1352 L 962 1378 L 940 1362 L 918 1378 L 926 1352 L 904 1336 L 932 1336 Z" fill={AMBER} stroke={INK} strokeWidth={3} opacity={seg(t, L.l9.end - 1.4, L.l9.end - 1.1)} />
        <Person kind="dani" x={400} y={1760} s={1.3} face="happy" armL={20} armR={150} talk={talkOf('dani', c)} look={1} />
        {t >= momAt && (
          <g transform={`translate(215 ${1760 - 260 * seg(t, momAt, momAt + 0.3)})`}>
            <Person kind="mama" x={0} y={260} s={0.8} face="smug" armL={10} armR={10} bust />
          </g>
        )}
      </svg>
      {t >= momAt + 0.2 && (
        <div style={{position: 'absolute', left: 150, top: 1150, fontFamily: fonts.diary, fontSize: 46, color: INK, transform: `rotate(-6deg) scale(${pop(t, momAt + 0.2)})`, background: '#fff', border: `5px solid ${INK}`, borderRadius: 40, padding: '6px 26px'}}>
          te lo dije
        </div>
      )}
    </Paper>
  );
};

const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#C79A62', overflow: 'hidden'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(35deg, rgba(0,0,0,.035) 0 3px, rgba(255,255,255,.03) 3px 7px)'}} />
    <div
      style={{
        position: 'absolute',
        left: 150,
        right: 150,
        top: 620,
        padding: '60px 40px',
        background: '#F6EBD3',
        transform: 'rotate(-3deg)',
        boxShadow: '0 10px 0 rgba(0,0,0,.12)',
        textAlign: 'center',
        fontFamily: fonts.diary,
        color: INK,
      }}
    >
      <div style={{fontSize: 120, lineHeight: 1}}>DIARIO</div>
      <div style={{fontSize: 70, lineHeight: 1.1}}>de Dani</div>
      <div style={{fontSize: 46, marginTop: 30, opacity: 0.8}}>(buscando curro. NO leer, mamá)</div>
    </div>
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <g transform="translate(540 1380) rotate(4)">
        <path d="M -70 -110 L 70 -110 L 70 110 L -70 110 Z" fill="#F6EBD3" stroke={INK} strokeWidth={5} />
        <circle cx={46} cy={10} r={8} fill={INK} />
        <path d="M 110 -60 q 20 20 0 40 M 140 -80 q 34 40 0 80" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  </AbsoluteFill>
);

const PAGES: React.FC<Ctx>[] = [PageMonday, PageFriday, PageKitchen, PageSara, PageLetters, PageDoor, PageNote];

/** Vídeo 4 — «El diario de Dani». Historia en páginas de cuaderno, con una voz por personaje. */
export const Greg: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const ctx = {t, frame};
  const idx = FLIPS.filter((f) => t >= f).length;
  const flipFrom = FLIPS[idx - 1];
  const flipP = idx > 0 ? seg(t, flipFrom - 0.05, flipFrom - 0.05 + FLIP_DUR) : 1;
  const Cur = PAGES[idx];
  const Prev = idx > 0 ? PAGES[idx - 1] : null;
  const closeP = seg(t, CLOSE - 0.3, CLOSE + 0.1);
  const boilSeed = Math.floor(frame / 3) % 50;

  return (
    <AbsoluteFill style={{background: '#2E2A26'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}>
        <filter id="boil">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={boilSeed} />
          <feDisplacementMap in="SourceGraphic" scale={4} />
        </filter>
      </svg>
      <AbsoluteFill style={{perspective: 2600}}>
        <Cur {...ctx} />
        {Prev && flipP < 1 && (
          <AbsoluteFill
            style={{
              transformOrigin: '0% 50%',
              transform: `rotateY(${-178 * flipP * flipP}deg)`,
              backfaceVisibility: 'hidden',
              boxShadow: `${-40 * flipP}px 0 60px rgba(0,0,0,${0.35 * flipP})`,
            }}
          >
            <Prev {...ctx} />
          </AbsoluteFill>
        )}
        {closeP > 0 && (
          <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${-178 * (1 - closeP) ** 2}deg)`, backfaceVisibility: 'hidden'}}>
            <Cover />
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      <Audio src={staticFile('greg-mix.wav')} />
    </AbsoluteFill>
  );
};
