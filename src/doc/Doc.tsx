import React from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import {CHAPTERS, CHAPTER_ORDER, DOC_TOTAL, FPS, K, LINES, Line, SceneProps, chapterStart, lerp, seg} from './kit';
import {A1, A2, A3, B1, B2, B3, B4, B4b, B5, I1, I2, I3} from './scenesA';
import {C1, C2, C3, C4, C5, C6, D1, D2, D3, D4, D4b, D4c, D5} from './scenesB';
import {E1, E2, E3, E4, E5, E6, E7, EndScreen, F1, F2, F3, R1} from './scenesC';

export {DOC_TOTAL};

const SCENES: Record<string, React.FC<SceneProps>> = {
  i1: I1, i2: I2, i3: I3,
  a1: A1, a2: A2, a3: A3,
  b1: B1, b2: B2, b3: B3, b4: B4, b4b: B4b, b5: B5,
  c1: C1, c2: C2, c3: C3, c4: C4, c5: C5, c6: C6,
  d1: D1, d2: D2, d3: D3, d4: D4, d4b: D4b, d4c: D4c, d5: D5,
  e1: E1, e2: E2, e3: E3, e4: E4, e5: E5, e6: E6, e7: E7,
  r1: R1, f1: F1, f2: F2, f3: F3,
};

const LOOK: Record<string, {bg: string; dark: boolean; accent: string}> = {
  intro: {bg: '#14121C', dark: true, accent: K.amber},
  antes: {bg: K.sepia, dark: false, accent: K.coral},
  embudo: {bg: K.paper, dark: false, accent: K.blue},
  ia: {bg: K.navy, dark: true, accent: K.cyan},
  funciona: {bg: '#F6F2EA', dark: false, accent: K.green},
  knok: {bg: K.night, dark: true, accent: K.amber},
  cierre: {bg: '#F6F2EA', dark: false, accent: K.coral},
};
const DARK_LINES = new Set(['f3']);
const END_AT = LINES[LINES.length - 1].end;

const lookOf = (l: Line | 'end') => {
  if (l === 'end' || DARK_LINES.has(l.id)) return {bg: K.night, dark: true, accent: K.amber};
  return LOOK[l.chapter];
};

/** Fondo de cada capítulo (con su textura). */
const Background: React.FC<{look: {bg: string; dark: boolean; accent: string}; chapter: string; t: number}> = ({look, chapter, t}) => (
  <AbsoluteFill style={{background: look.bg}}>
    {chapter === 'ia' &&
      Array.from({length: 40}, (_, i) => (
        <div key={i} style={{position: 'absolute', left: random(`sx${i}`) * 1920, top: (random(`sy${i}`) * 1080 + t * 12 * (1 + (i % 3))) % 1080, width: 4, height: 4, borderRadius: 2, background: K.cyan, opacity: 0.25}} />
      ))}
    {look.dark && chapter !== 'ia' && (
      <>
        <div style={{position: 'absolute', left: 1300 + 80 * Math.sin(t / 6), top: -300, width: 1100, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${look.accent}33 0%, transparent 65%)`}} />
        <div style={{position: 'absolute', left: -400, top: 400 + 60 * Math.cos(t / 7), width: 1100, height: 1100, borderRadius: '50%', background: 'radial-gradient(circle, #7C5CFF2a 0%, transparent 65%)'}} />
      </>
    )}
    {!look.dark && <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 70%)'}} />}
  </AbsoluteFill>
);

/** Divide una frase en trozos de subtítulo (≤ ~68 caracteres) con su tiempo proporcional. */
const chunks = (l: Line) => {
  const parts: string[] = [];
  const sentences = l.text.match(/[^.!?…:]+[.!?…:]*\s*/g) ?? [l.text];
  for (const s0 of sentences) {
    let s = s0.trim();
    while (s.length > 68) {
      let cut = s.lastIndexOf(', ', 68);
      if (cut < 25) cut = s.lastIndexOf(' ', 68);
      parts.push(s.slice(0, cut + 1).trim());
      s = s.slice(cut + 1).trim();
    }
    if (s) parts.push(s);
  }
  const total = parts.reduce((a, p) => a + p.length, 0);
  let acc = 0;
  return parts.map((p) => {
    const a = l.start + ((l.end - l.start) * acc) / total;
    acc += p.length;
    return {text: p, start: a, end: l.start + ((l.end - l.start) * acc) / total};
  });
};
const CAPTIONS = LINES.flatMap(chunks);

const ChapterCard: React.FC<{chapter: string; t: number; start: number}> = ({chapter, t, start}) => {
  const a = start - 2.9;
  const op = lerp(t, [a, a + 0.3], [0, 1]) * lerp(t, [start - 0.25, start + 0.05], [1, 0]);
  if (op <= 0) return null;
  const look = LOOK[chapter];
  const idx = CHAPTER_ORDER.indexOf(chapter);
  const raw = CHAPTERS[chapter];
  const [num, ...rest] = raw.split('. ');
  const title = rest.length ? rest.join('. ') : raw;
  const lt = t - a;
  const isFirst = chapter === 'antes';
  return (
    <AbsoluteFill style={{background: look.bg, opacity: op, justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      {isFirst && (
        <div style={{position: 'absolute', top: 120, fontFamily: fonts.ui, fontWeight: 600, fontSize: 34, color: look.dark ? 'rgba(255,255,255,.6)' : K.muted, opacity: seg(lt, 0.1, 0.5)}}>
          Por qué buscar trabajo se ha roto (y cómo arreglarlo)
        </div>
      )}
      <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 180, color: look.accent, lineHeight: 1, opacity: seg(lt, 0.1, 0.5), transform: `translateY(${(1 - seg(lt, 0.1, 0.6)) * 40}px)`}}>
        {chapter === 'cierre' ? '✓' : rest.length ? num : idx}
      </div>
      <div style={{marginTop: 30, width: 1500, textAlign: 'center', fontFamily: fonts.ui, fontWeight: 800, fontSize: 84, letterSpacing: -3, lineHeight: 1.05, color: look.dark ? '#fff' : K.ink, opacity: seg(lt, 0.35, 0.8), transform: `translateY(${(1 - seg(lt, 0.35, 0.9)) * 30}px)`}}>
        {title}
      </div>
      <div style={{marginTop: 40, height: 8, width: 300 * seg(lt, 0.6, 1.4), borderRadius: 4, background: look.accent}} />
    </AbsoluteFill>
  );
};

export const Doc: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // línea "activa" para el fondo y el indicador
  const idx = LINES.reduce((acc, l, i) => (t >= l.start - 0.15 ? i : acc), 0);
  const inEnd = t >= END_AT + 0.2;
  const cur = LINES[idx];
  const look = inEnd ? lookOf('end') : lookOf(cur);
  const nextChapterStarts = CHAPTER_ORDER.slice(1).map((c) => ({c, s: chapterStart(c)}));
  const card = nextChapterStarts.find(({s}) => t >= s - 2.9 && t < s + 0.1);

  // escenas visibles (con fundido cruzado de 0,3 s)
  const visible = LINES.map((l, i) => {
    const from = i === 0 ? 0 : l.start - 0.15;
    const next = LINES[i + 1];
    const to = next ? next.start - 0.15 + 0.3 : END_AT + 0.5;
    if (t < from || t > to) return null;
    const op = Math.min(seg(t, from, from + 0.3), 1 - seg(t, to - 0.3, to));
    const Scene = SCENES[l.id];
    const lk = lookOf(l);
    return (
      <AbsoluteFill key={l.id} style={{opacity: i === 0 ? Math.min(1, seg(t, 0, 0.6)) * (1 - seg(t, to - 0.3, to)) : op, transform: `scale(${1 + 0.015 * seg(t, l.start, to)})`}}>
        <Scene t={t} lt={t - l.start} d={l.end - l.start} dark={lk.dark} />
      </AbsoluteFill>
    );
  });

  const cap = !card && !inEnd ? CAPTIONS.find((c) => t >= c.start - 0.05 && t < c.end + 0.25) : undefined;

  // progreso por capítulos
  const total = DOC_TOTAL / FPS;

  return (
    <AbsoluteFill style={{background: '#000', fontFamily: fonts.ui}}>
      <Background look={look} chapter={inEnd ? 'end' : cur.chapter} t={t} />
      {visible}
      {inEnd && (
        <AbsoluteFill style={{opacity: seg(t, END_AT + 0.2, END_AT + 0.8)}}>
          <Background look={lookOf('end')} chapter="end" t={t} />
          <EndScreen lt={t - END_AT - 0.2} />
        </AbsoluteFill>
      )}
      {card && <ChapterCard chapter={card.c} t={t} start={card.s} />}

      {/* indicador de capítulo */}
      {!card && !inEnd && cur.chapter !== 'intro' && (
        <div style={{position: 'absolute', left: 50, top: 40, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderRadius: 30, background: look.dark ? 'rgba(255,255,255,.08)' : 'rgba(30,27,46,.06)', fontFamily: fonts.ui, fontWeight: 600, fontSize: 22, color: look.dark ? 'rgba(255,255,255,.75)' : K.muted}}>
          <div style={{width: 10, height: 10, borderRadius: 5, background: LOOK[cur.chapter].accent}} />
          {CHAPTERS[cur.chapter]}
        </div>
      )}

      {/* subtítulos */}
      {cap && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center'}}>
          <div style={{maxWidth: 1500, padding: '12px 28px', borderRadius: 16, background: 'rgba(10,10,16,.62)', color: '#fff', fontFamily: fonts.ui, fontWeight: 600, fontSize: 40, lineHeight: 1.3, textAlign: 'center'}}>{cap.text}</div>
        </div>
      )}

      {/* barra de progreso por capítulos */}
      {!inEnd && (
        <div style={{position: 'absolute', left: 50, right: 50, bottom: 22, height: 6, display: 'flex', gap: 6, opacity: 0.85}}>
          {CHAPTER_ORDER.map((c, i) => {
            const s = i === 0 ? 0 : chapterStart(c) - 2.9;
            const e = i + 1 < CHAPTER_ORDER.length ? chapterStart(CHAPTER_ORDER[i + 1]) - 2.9 : END_AT;
            return (
              <div key={c} style={{flex: e - s, height: 6, borderRadius: 3, background: look.dark ? 'rgba(255,255,255,.15)' : 'rgba(30,27,46,.12)', overflow: 'hidden'}}>
                <div style={{width: `${seg(t, s, e) * 100}%`, height: '100%', background: LOOK[c].accent}} />
              </div>
            );
          })}
        </div>
      )}
      <Audio src={staticFile('doc-mix.wav')} />
      {total < 0 && null}
    </AbsoluteFill>
  );
};

/** Miniatura de YouTube (1280×720). */
export const Thumb: React.FC = () => (
  <AbsoluteFill style={{background: '#14121C', overflow: 'hidden', fontFamily: fonts.ui}}>
    <div style={{position: 'absolute', right: -200, top: -250, width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, ${K.amber}55 0%, transparent 65%)`}} />
    <div style={{position: 'absolute', left: 70, top: 90, width: 760}}>
      <div style={{fontWeight: 800, fontSize: 104, lineHeight: 0.98, letterSpacing: -4, color: '#fff'}}>
        Buscar trabajo
        <br />
        <span style={{color: K.coral}}>se ha roto</span>
      </div>
      <div style={{marginTop: 30, display: 'inline-block', padding: '12px 26px', borderRadius: 14, background: K.amber, color: '#1A0E05', fontWeight: 800, fontSize: 44}}>y cómo arreglarlo</div>
    </div>
    <div style={{position: 'absolute', right: 80, top: 120, width: 380, transform: 'rotate(6deg)'}}>
      {Array.from({length: 3}, (_, i) => (
        <div key={i} style={{position: 'absolute', top: i * 26, left: i * 20, width: 340, padding: 24, borderRadius: 22, background: '#232030', border: '2px solid rgba(255,255,255,.12)'}}>
          <div style={{color: '#fff', fontWeight: 700, fontSize: 26}}>RR. HH.</div>
          <div style={{color: 'rgba(255,255,255,.7)', fontSize: 24}}>Gracias por tu interés, pero…</div>
        </div>
      ))}
      <div style={{position: 'absolute', right: -10, top: -40, width: 110, height: 110, borderRadius: 55, background: K.red, color: '#fff', fontWeight: 800, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>50</div>
    </div>
    <div style={{position: 'absolute', right: 90, bottom: 70, display: 'flex', alignItems: 'center', gap: 16}}>
      <div style={{width: 70, height: 70, borderRadius: 20, background: `linear-gradient(135deg, ${K.amber}, ${K.coral})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.logo, fontWeight: 900, fontSize: 44, color: '#1A0E05'}}>k</div>
      <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: -3}}>knok</div>
    </div>
  </AbsoluteFill>
);
