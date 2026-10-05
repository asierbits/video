import React from 'react';
import {Easing, interpolate} from 'remotion';
import {fonts} from '../theme';
import timings from './timings.json';

// ------------------------------------------------------------------ datos y tiempos
export type Line = {id: string; chapter: string; text: string; start: number; end: number};
export const LINES = timings.lines as Line[];
export const CHAPTERS = timings.chapters as Record<string, string>;
export const ENV = timings.env as number[];
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const END_SCREEN = 9.8;
export const DOC_TOTAL = Math.ceil((LINES[LINES.length - 1].end + END_SCREEN) * FPS);
export const L = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<string, Line>;
export const CHAPTER_ORDER = ['intro', 'antes', 'embudo', 'ia', 'funciona', 'knok', 'cierre'];
export const chapterStart = (c: string) => LINES.find((l) => l.chapter === c)!.start;

// ------------------------------------------------------------------ estilo
export const K = {
  paper: '#F3EEE6',
  paper2: '#FBF8F2',
  sepia: '#EFE2CB',
  ink: '#1E1B2E',
  muted: '#6B6577',
  amber: '#FFB21E',
  coral: '#FF6B57',
  teal: '#23A99A',
  blue: '#3D6BFF',
  navy: '#0E1222',
  cyan: '#4FE0FF',
  night: '#0B0B12',
  line: '#DDD5C8',
  red: '#E5484D',
  green: '#2FB574',
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const io = Easing.bezier(0.65, 0, 0.35, 1);
export const back = Easing.bezier(0.34, 1.56, 0.64, 1);
export const lerp = (t: number, i: number[], o: number[], e: (x: number) => number = ease) =>
  interpolate(t, i, o, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** props comunes de cada escena */
export type SceneProps = {t: number; lt: number; d: number; dark: boolean};

// ------------------------------------------------------------------ piezas
export const Pop: React.FC<{at: number; lt: number; children: React.ReactNode; style?: React.CSSProperties; from?: number; y?: number}> = ({at, lt, children, style, from = 0.85, y = 30}) => {
  const p = lerp(lt, [at, at + 0.45], [0, 1]);
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * y}px) scale(${from + (1 - from) * p})`, ...style}}>{children}</div>;
};

export const Title: React.FC<{lt: number; at?: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties; serif?: boolean}> = ({lt, at = 0, children, size = 84, color = K.ink, style, serif}) => {
  const p = lerp(lt, [at, at + 0.5], [0, 1]);
  return (
    <div
      style={{
        fontFamily: serif ? fonts.serif : fonts.ui,
        fontStyle: serif ? 'italic' : 'normal',
        fontWeight: serif ? 400 : 800,
        fontSize: size,
        letterSpacing: serif ? 0 : -size * 0.035,
        lineHeight: 1.05,
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 26}px)`,
        filter: `blur(${(1 - p) * 8}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; dark?: boolean}> = ({children, style, dark}) => (
  <div
    style={{
      background: dark ? 'rgba(255,255,255,.07)' : '#fff',
      border: dark ? '1.5px solid rgba(255,255,255,.14)' : `2px solid ${K.line}`,
      borderRadius: 28,
      boxShadow: dark ? '0 30px 60px rgba(0,0,0,.4)' : '0 24px 50px rgba(60,40,20,.12)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Envelope: React.FC<{w?: number; color?: string; stroke?: string}> = ({w = 80, color = '#fff', stroke = K.ink}) => (
  <svg width={w} height={w * 0.68} viewBox="0 0 100 68" style={{overflow: 'visible'}}>
    <rect x={3} y={3} width={94} height={62} rx={8} fill={color} stroke={stroke} strokeWidth={5} />
    <path d="M 6 8 L 50 40 L 94 8" fill="none" stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);

export const CVDoc: React.FC<{w?: number; accent?: string; face?: boolean; fill?: string; stroke?: string; lines?: number}> = ({w = 90, accent = K.amber, face, fill = '#fff', stroke = K.ink, lines = 4}) => (
  <svg width={w} height={w * 1.3} viewBox="0 0 100 130" style={{overflow: 'visible'}}>
    <path d="M 6 4 L 70 4 L 94 28 L 94 124 L 6 124 Z" fill={fill} stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 70 4 L 70 28 L 94 28" fill="none" stroke={stroke} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={30} cy={34} r={12} fill={accent} />
    {Array.from({length: lines}, (_, i) => (
      <rect key={i} x={18} y={60 + i * 15} width={i % 2 ? 44 : 64} height={7} rx={3.5} fill={K.line} />
    ))}
    {face && (
      <g>
        <circle cx={26} cy={32} r={2.5} fill={stroke} />
        <circle cx={34} cy={32} r={2.5} fill={stroke} />
      </g>
    )}
  </svg>
);

export const Check: React.FC<{size?: number; color?: string; p?: number}> = ({size = 40, color = K.green, p = 1}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={19} fill={color} />
    <path d="M 11 21 L 18 28 L 30 13" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
  </svg>
);

export const Cross: React.FC<{size?: number; color?: string}> = ({size = 40, color = K.red}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx={20} cy={20} r={19} fill={color} />
    <path d="M 13 13 L 27 27 M 27 13 L 13 27" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
  </svg>
);

export const KIcon: React.FC<{size?: number}> = ({size = 72}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(135deg, ${K.amber}, ${K.coral})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.logo,
      fontWeight: 900,
      fontSize: size * 0.62,
      color: '#1A0E05',
      flexShrink: 0,
    }}
  >
    k
  </div>
);

export const Browser: React.FC<{children: React.ReactNode; url: string; w: number; h: number; dark?: boolean; tabs?: string[]; active?: number; ext?: React.ReactNode}> = ({children, url, w, h, dark, tabs, active = 0, ext}) => (
  <Card dark={dark} style={{width: w, height: h, overflow: 'hidden', borderRadius: 22, background: dark ? '#14161F' : '#fff'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: dark ? 'rgba(255,255,255,.05)' : '#F2EEE8', borderBottom: `1.5px solid ${dark ? 'rgba(255,255,255,.1)' : K.line}`}}>
      {[K.coral, K.amber, K.green].map((c) => (
        <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />
      ))}
      {tabs ? (
        <div style={{display: 'flex', gap: 6, marginLeft: 16}}>
          {tabs.map((tb, i) => (
            <div key={tb} style={{padding: '6px 16px', borderRadius: 10, fontFamily: fonts.ui, fontSize: 20, background: i === active ? (dark ? 'rgba(255,255,255,.12)' : '#fff') : 'transparent', color: dark ? '#E8E8F0' : K.ink}}>
              {tb}
            </div>
          ))}
        </div>
      ) : null}
      <div style={{flex: 1, marginLeft: 16, padding: '8px 18px', borderRadius: 18, fontFamily: fonts.ui, fontSize: 20, color: dark ? 'rgba(255,255,255,.6)' : K.muted, background: dark ? 'rgba(255,255,255,.06)' : '#fff'}}>{url}</div>
      {ext}
    </div>
    <div style={{position: 'relative', height: h - 60}}>{children}</div>
  </Card>
);

/** Persona plana y simpática (estilo infografía). */
export const Person: React.FC<{color?: string; skin?: string; hair?: string; size?: number; mood?: 'ok' | 'sad' | 'happy' | 'tired'; wave?: number; scarf?: boolean}> = ({
  color = K.blue,
  skin = '#F2C2A0',
  hair = '#2B2236',
  size = 200,
  mood = 'ok',
  wave = 0,
  scarf,
}) => (
  <svg width={size} height={size * 1.6} viewBox="0 0 100 160" style={{overflow: 'visible'}}>
    <ellipse cx={50} cy={156} rx={34} ry={4} fill="rgba(0,0,0,.12)" />
    <rect x={34} y={112} width={12} height={44} rx={6} fill="#2A2740" />
    <rect x={54} y={112} width={12} height={44} rx={6} fill="#2A2740" />
    <path d="M 24 120 Q 22 74 50 70 Q 78 74 76 120 Z" fill={color} />
    <g transform={`rotate(${-wave * 120} 74 82)`}>
      <rect x={70} y={80} width={11} height={38} rx={5.5} fill={color} />
      <circle cx={75.5} cy={118} r={6} fill={skin} />
    </g>
    <rect x={19} y={80} width={11} height={38} rx={5.5} fill={color} />
    <circle cx={24.5} cy={118} r={6} fill={skin} />
    {scarf && <rect x={34} y={66} width={32} height={10} rx={5} fill={K.amber} />}
    <circle cx={50} cy={46} r={22} fill={skin} />
    <path d="M 28 44 Q 28 20 50 22 Q 74 22 72 46 Q 64 32 50 32 Q 36 32 28 44 Z" fill={hair} />
    <circle cx={42} cy={48} r={2.6} fill={K.ink} />
    <circle cx={58} cy={48} r={2.6} fill={K.ink} />
    {mood === 'happy' && <path d="M 42 56 Q 50 63 58 56" stroke={K.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" />}
    {mood === 'ok' && <path d="M 44 57 L 56 57" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" />}
    {mood === 'sad' && <path d="M 43 60 Q 50 54 57 60" stroke={K.ink} strokeWidth={2.6} fill="none" strokeLinecap="round" />}
    {mood === 'tired' && (
      <g>
        <path d="M 38 46 L 46 46 M 54 46 L 62 46" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" />
        <path d="M 44 58 L 56 58" stroke={K.ink} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    )}
  </svg>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; dark?: boolean; style?: React.CSSProperties}> = ({children, color = K.ink, dark, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderRadius: 40, fontFamily: fonts.ui, fontWeight: 600, fontSize: 26, color: dark ? '#fff' : color, background: dark ? 'rgba(255,255,255,.1)' : '#fff', border: `2px solid ${dark ? 'rgba(255,255,255,.18)' : K.line}`, ...style}}>
    {children}
  </div>
);

export const Abs: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; center?: boolean}> = ({x, y, children, style, center}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      ...(center ? {transform: 'translate(-50%, -50%)', width: 1760, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'} : {}),
      ...style,
    }}
  >
    {children}
  </div>
);
