import React from 'react';
import {AbsoluteFill, Audio, random, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import {PAL, Sprite, arrowDown, check, coinK, cross, cvSprite, door, heart, runner} from './pixel';

export const ARCADE_TOTAL = 900;

// Momentos (frames) — los mismos que scripts/generate_arcade_audio.py
const T = {
  press: 50,
  r1: 60,
  r1Timer: [75, 225] as const,
  r1Reveal: 228,
  r2: 270,
  r2Timer: [300, 420] as const,
  r2Reveal: 423,
  r3: 480,
  r3Guess: [500, 590] as const,
  r3Race: [590, 660] as const,
  r3Reveal: 662,
  score: 690,
  cont: 810,
  coin: 840,
};

const BG = '#0B0B1E';
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const blink = (f: number, rate = 8) => Math.floor(f / rate) % 2 === 0;

const PX = (style: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: fonts.pixel,
  color: PAL['7'],
  textShadow: `6px 6px 0 ${PAL['1']}`,
  lineHeight: 1.3,
  ...style,
});
const VT = (style: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: fonts.term,
  color: PAL['7'],
  lineHeight: 1,
  ...style,
});

const Center: React.FC<{y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({y, children, style}) => (
  <div style={{position: 'absolute', left: 40, right: 40, top: y, textAlign: 'center', ...style}}>{children}</div>
);

const Stars: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute'}} shapeRendering="crispEdges">
    {Array.from({length: 60}, (_, i) => {
      const x = Math.floor(random(`x${i}`) * 180) * 6;
      const y = (Math.floor(random(`y${i}`) * 320) * 6 + frame * (1 + (i % 3)) * 2) % 1920;
      return <rect key={i} x={x} y={y} width={6} height={6} fill={i % 7 === 0 ? PAL.c : PAL['6']} opacity={0.35 + (i % 3) * 0.2} />;
    })}
  </svg>
);

/** Barra de tiempo + segundos. */
const Timer: React.FC<{frame: number; from: number; to: number; y: number}> = ({frame, from, to, y}) => {
  if (frame < from - 4 || frame > to + 30) return null;
  const p = 1 - seg(frame, from, to);
  const secs = Math.ceil(((to - frame) / 30) * 1) ;
  const color = p > 0.5 ? PAL.b : p > 0.25 ? PAL.a : PAL['8'];
  const w = Math.round((780 * p) / 6) * 6;
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute'}} shapeRendering="crispEdges">
        <rect x={84} y={y} width={792} height={60} fill={PAL['1']} />
        <rect x={90} y={y + 6} width={w} height={48} fill={color} />
        {Array.from({length: 13}, (_, i) => (
          <rect key={i} x={90 + i * 60} y={y + 6} width={6} height={48} fill={BG} opacity={0.4} />
        ))}
      </svg>
      <div style={PX({position: 'absolute', left: 900, top: y - 2, fontSize: 56, color: frame >= to ? PAL['8'] : color})}>{frame >= to ? 0 : Math.max(0, secs)}</div>
    </>
  );
};

const TimeUp: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const d = frame - at;
  if (d < -3 || d > 14) return null;
  return (
    <Center y={860} style={{transform: `scale(${1 + 0.4 * Math.max(0, 1 - Math.max(0, d + 3) / 5)}) rotate(-4deg)`}}>
      <div style={PX({fontSize: 110, color: blink(frame, 3) ? PAL['8'] : PAL.a, textShadow: `8px 8px 0 ${PAL['0']}`})}>¡TIEMPO!</div>
    </Center>
  );
};

const PlusPoints: React.FC<{frame: number; at: number; x: number; y: number}> = ({frame, at, x, y}) => {
  const d = frame - at - 18;
  if (d < 0 || d > 40) return null;
  return <div style={PX({position: 'absolute', left: x, top: y - d * 3, fontSize: 64, color: PAL.a, opacity: d > 30 ? 1 - (d - 30) / 10 : 1})}>+100</div>;
};

const Tip: React.FC<{frame: number; at: number; lines: string[]}> = ({frame, at, lines}) => {
  if (frame < at + 6) return null;
  const chars = Math.floor((frame - at - 6) * 2.2);
  let left = chars;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1640, padding: '22px 30px', background: PAL['1'], border: `6px solid ${PAL.a}`, boxShadow: `12px 12px 0 ${PAL['0']}`}}>
      <div style={VT({fontSize: 40, color: PAL.a, marginBottom: 6})}>EL TRUCO:</div>
      {lines.map((l, i) => {
        const shown = l.slice(0, Math.max(0, left));
        left -= l.length;
        return (
          <div key={i} style={VT({fontSize: 64})}>
            {shown}
            {left <= 0 && left > -l.length && blink(frame, 6) ? '█' : ''}
          </div>
        );
      })}
    </div>
  );
};

/** Disolución en bloques entre pantallas. */
const Dissolve: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const d = frame - at;
  if (d < -8 || d > 8) return null;
  const p = d < 0 ? (d + 8) / 8 : 1 - d / 8;
  const cols = 9;
  const rows = 16;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}} shapeRendering="crispEdges">
      {Array.from({length: cols * rows}, (_, i) => {
        if (random(`dz${i}`) > p) return null;
        return <rect key={i} x={(i % cols) * 120} y={Math.floor(i / cols) * 120} width={120} height={120} fill={i % 5 === 0 ? PAL['2'] : PAL['0']} />;
      })}
    </svg>
  );
};

const HUD: React.FC<{frame: number; round: string}> = ({frame, round}) => {
  const score = 100 * [T.r1Reveal, T.r2Reveal, T.r3Reveal].filter((r) => frame >= r + 18).length;
  return (
    <>
      <div style={PX({position: 'absolute', left: 40, top: 40, fontSize: 30, color: blink(frame, 15) ? PAL['8'] : PAL['7']})}>1UP</div>
      <div style={PX({position: 'absolute', left: 40, top: 84, fontSize: 30})}>{String(score).padStart(6, '0')}</div>
      <div style={PX({position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', fontSize: 30, color: PAL.c})}>{round}</div>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1, 2].map((i) => (
          <Sprite key={i} grid={heart} x={850 + i * 66} y={60} px={7} />
        ))}
      </svg>
    </>
  );
};

// ------------------------------------------------------------------ pantallas
const Title: React.FC<{frame: number}> = ({frame}) => {
  const pressed = frame >= T.press;
  return (
    <>
      <Center y={430}>
        <div style={PX({fontSize: 190, color: [PAL.a, PAL.e, PAL.c, PAL.b][Math.floor(frame / 5) % 4], textShadow: `12px 12px 0 ${PAL['2']}`})}>RETO</div>
      </Center>
      <Center y={760}>
        <div style={VT({fontSize: 92, lineHeight: 1.05})}>¿Puedes encontrar el CV que consigue la entrevista?</div>
      </Center>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Sprite key={i} grid={cvSprite(i === 2, 'flat')} x={150 + i * 168} y={1140 + (Math.floor(frame / 8 + i) % 2) * 7} px={8} />
        ))}
      </svg>
      <Center y={1520}>
        <div style={PX({fontSize: 52, color: pressed ? PAL.a : PAL['7'], opacity: pressed ? (blink(frame, 2) ? 1 : 0) : blink(frame, 10) ? 1 : 0})}>PULSA START</div>
      </Center>
    </>
  );
};

const ODD = 27;
const Round1: React.FC<{frame: number}> = ({frame}) => {
  const cols = 6;
  const rows = 7;
  const reveal = frame >= T.r1Reveal;
  const rv = seg(frame, T.r1Reveal, T.r1Reveal + 10);
  const appear = seg(frame, T.r1, T.r1 + 14);
  return (
    <>
      <HUD frame={frame} round="RONDA 1/3" />
      <Center y={200}>
        <div style={PX({fontSize: 46, color: PAL.a})}>ENCUENTRA</div>
        <div style={PX({fontSize: 46})}>EL CV DIFERENTE</div>
      </Center>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: cols * rows}, (_, i) => {
          if (random(`ap${i}`) > appear * 1.05) return null;
          const c = i % cols;
          const r = Math.floor(i / cols);
          const bob = (Math.floor(frame / 7 + random(`b${i}`) * 4) % 2) * 7;
          const x = 120 + c * 140;
          const y = 440 + r * 160 + bob;
          const isOdd = i === ODD;
          if (isOdd && reveal) return null;
          return <Sprite key={i} grid={cvSprite(isOdd)} x={x} y={y} px={7} opacity={reveal ? 0.18 : 1} />;
        })}
        {reveal && (
          <g>
            {(() => {
              const c = ODD % cols;
              const r = Math.floor(ODD / cols);
              const s = 7 + 5 * rv;
              const cx = 120 + c * 140 + 42;
              const cy = 440 + r * 160 + 56;
              const w = 12 * s;
              const h = 16 * s;
              return (
                <g>
                  {blink(frame, 4) && <rect x={cx - w / 2 - 18} y={cy - h / 2 - 18} width={w + 36} height={h + 36} fill="none" stroke={PAL.a} strokeWidth={8} shapeRendering="crispEdges" />}
                  <Sprite grid={cvSprite(true)} x={Math.round(cx - w / 2)} y={Math.round(cy - h / 2)} px={s} />
                </g>
              );
            })()}
          </g>
        )}
      </svg>
      <Timer frame={frame} from={T.r1Timer[0]} to={T.r1Timer[1]} y={1560} />
      <TimeUp frame={frame} at={T.r1Timer[1]} />
      <PlusPoints frame={frame} at={T.r1Reveal} x={640} y={900} />
      <Tip frame={frame} at={T.r1Reveal} lines={['NO SER UNA COPIA', 'MÁS.']} />
    </>
  );
};

const OFFER = ['DISEÑO', 'REMOTO', 'JUNIOR'];
const OPTIONS = [
  {k: 'A', tags: ['DISEÑO', 'PRESENCIAL', 'SENIOR']},
  {k: 'B', tags: ['DISEÑO', 'REMOTO', 'JUNIOR']},
  {k: 'C', tags: ['MARKETING', 'REMOTO', 'JUNIOR']},
];
const Round2: React.FC<{frame: number}> = ({frame}) => {
  const reveal = frame >= T.r2Reveal;
  const appear = (i: number) => seg(frame, T.r2 + 6 + i * 4, T.r2 + 14 + i * 4);
  return (
    <>
      <HUD frame={frame} round="RONDA 2/3" />
      <Center y={200}>
        <div style={PX({fontSize: 46, color: PAL.a})}>¿CUÁL ENCAJA</div>
        <div style={PX({fontSize: 46})}>CON LA OFERTA?</div>
      </Center>
      {/* la oferta */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 400, padding: '26px 30px', background: PAL['2'], border: `8px solid ${PAL.e}`, boxShadow: `14px 14px 0 ${PAL['0']}`, transform: `scale(${appear(0)})`}}>
        <div style={PX({fontSize: 44, color: PAL.a, textAlign: 'center'})}>SE BUSCA</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 18, marginTop: 20}}>
          {OFFER.map((o) => (
            <div key={o} style={VT({fontSize: 52, padding: '6px 16px', background: PAL['1'], border: `4px solid ${PAL['7']}`})}>{o}</div>
          ))}
        </div>
      </div>
      {OPTIONS.map((op, i) => {
        const x = 60 + i * 330;
        const win = op.k === 'B';
        const hl = reveal && win && blink(frame, 4);
        return (
          <div
            key={op.k}
            style={{
              position: 'absolute',
              left: x,
              top: 760,
              width: 300,
              height: 760,
              background: PAL['1'],
              border: `8px solid ${hl ? PAL.a : reveal && !win ? PAL['5'] : PAL.c}`,
              boxShadow: `12px 12px 0 ${PAL['0']}`,
              transform: `scale(${appear(i + 1)})`,
              opacity: reveal && !win ? 0.45 : 1,
            }}
          >
            <div style={PX({fontSize: 80, textAlign: 'center', marginTop: 20, color: PAL.c})}>{op.k}</div>
            <svg width={300} height={160} style={{display: 'block'}}>
              <Sprite grid={cvSprite(false, win && reveal ? 'smile' : 'flat')} x={114} y={10} px={6} />
            </svg>
            <div style={{display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', marginTop: 20}}>
              {op.tags.map((tg) => {
                const ok = OFFER.includes(tg);
                return (
                  <div key={tg} style={{display: 'flex', alignItems: 'center', gap: 10}}>
                    <div style={VT({fontSize: tg.length > 8 ? 44 : 52, color: reveal ? (ok ? PAL.b : PAL['8']) : PAL['7']})}>{tg}</div>
                    {reveal && (
                      <svg width={44} height={44}>
                        <Sprite grid={ok ? check : cross} x={0} y={0} px={6} />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <Timer frame={frame} from={T.r2Timer[0]} to={T.r2Timer[1]} y={1560} />
      <TimeUp frame={frame} at={T.r2Timer[1]} />
      <PlusPoints frame={frame} at={T.r2Reveal} x={430} y={700} />
      <Tip frame={frame} at={T.r2Reveal} lines={['BUSCAR LO QUE ENCAJA,', 'NO LO PRIMERO.']} />
    </>
  );
};

const Round3: React.FC<{frame: number}> = ({frame}) => {
  const race = seg(frame, T.r3Race[0], T.r3Race[1]);
  const racing = frame >= T.r3Race[0];
  // A: va de puerta en puerta
  const aDoors = racing ? Math.min(3, Math.floor(race * 3.4)) : 0;
  const aX = racing ? 130 + race * 3.4 * 84 * 1.0 : 130;
  // B: pulsa y salen todas
  const pressB = T.r3Race[0] + 6;
  const bFly = seg(frame, pressB, pressB + 16);
  const bDone = bFly >= 1;
  const winner = frame >= T.r3Race[0] + 40;
  const lane = (y: number, label: string, count: number, color: string, children: React.ReactNode) => (
    <>
      <div style={PX({position: 'absolute', left: 60, top: y, fontSize: 34, color})}>{label}</div>
      <div style={PX({position: 'absolute', right: 60, top: y, fontSize: 34, color: count >= 20 ? PAL.b : PAL['7']})}>{`${count}/20`}</div>
      {children}
    </>
  );
  return (
    <>
      <HUD frame={frame} round="RONDA 3/3" />
      <Center y={200}>
        <div style={PX({fontSize: 44, color: PAL.a})}>¿QUIEN LLEGA ANTES</div>
        <div style={PX({fontSize: 44})}>A 20 PUERTAS?</div>
      </Center>
      {lane(
        440,
        'A · UNO A UNO',
        aDoors,
        PAL.e,
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={60} y={840} width={960} height={12} fill={PAL['5']} />
          {Array.from({length: 10}, (_, i) => (
            <Sprite key={i} grid={door(i < aDoors ? 1 : 0)} x={150 + i * 86} y={600} px={6} />
          ))}
          <Sprite grid={runner(racing ? Math.floor(frame / 3) : 0, 'e')} x={Math.min(aX, 960)} y={744} px={8} />
          {racing && <Sprite grid={cvSprite()} x={Math.min(aX, 960) + 50} y={760} px={3} />}
        </svg>,
      )}
      {lane(
        980,
        'B · TODO DE UNA',
        bDone ? 20 : 0,
        PAL.c,
        <svg width={1080} height={1920} style={{position: 'absolute'}}>
          <rect x={60} y={1380} width={960} height={12} fill={PAL['5']} />
          {Array.from({length: 10}, (_, i) => (
            <Sprite key={i} grid={door(bDone ? 1 : 0)} x={150 + i * 86} y={1140} px={6} />
          ))}
          <Sprite grid={runner(0, 'c')} x={70} y={1284} px={8} />
          {/* botón */}
          <rect x={150} y={frame >= pressB && frame < pressB + 4 ? 1346 : 1336} width={80} height={frame >= pressB && frame < pressB + 4 ? 24 : 34} fill={PAL['8']} />
          <rect x={140} y={1366} width={100} height={14} fill={PAL['5']} />
          {bFly > 0 &&
            !bDone &&
            Array.from({length: 10}, (_, i) => {
              const tx = 162 + i * 86;
              const x = 190 + (tx - 190) * bFly;
              const y = 1330 - Math.sin(bFly * Math.PI) * 220 + (1180 - 1330) * bFly;
              return <Sprite key={i} grid={cvSprite(false, 'smile')} x={Math.round(x / 6) * 6} y={Math.round(y / 6) * 6} px={3} />;
            })}
        </svg>,
      )}
      {winner && (
        <Center y={1440}>
          <div style={PX({fontSize: 70, color: blink(frame, 4) ? PAL.c : PAL.a})}>¡GANA B!</div>
        </Center>
      )}
      <Timer frame={frame} from={T.r3Guess[0]} to={T.r3Guess[1]} y={1560} />
      {frame >= T.r3Guess[1] && frame < T.r3Guess[1] + 10 && (
        <Center y={1440}>
          <div style={PX({fontSize: 80, color: PAL.b})}>¡YA!</div>
        </Center>
      )}
      <PlusPoints frame={frame} at={T.r3Reveal} x={700} y={1300} />
      <Tip frame={frame} at={T.r3Reveal} lines={['NO PERDER TIEMPO', 'EN LO REPETITIVO.']} />
    </>
  );
};

const Score: React.FC<{frame: number}> = ({frame}) => {
  const rows = [
    {s: '3/3', t: '¡CRACK!', c: PAL.b},
    {s: '2/3', t: 'CASI CASI', c: PAL.a},
    {s: '0-1', t: 'SIGUE LEYENDO', c: PAL['8']},
  ];
  return (
    <>
      <HUD frame={frame} round="RESULTADOS" />
      <Center y={300}>
        <div style={PX({fontSize: 64, color: PAL.a})}>PUNTUACION</div>
      </Center>
      {rows.map((r, i) => {
        const p = seg(frame, T.score + 8 + i * 8, T.score + 14 + i * 8);
        return (
          <div key={r.s} style={{position: 'absolute', left: 110, right: 110, top: 520 + i * 190, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transform: `translateX(${(1 - p) * 900}px)`}}>
            <div style={PX({fontSize: 64, color: r.c})}>{r.s}</div>
            <div style={VT({fontSize: 84})}>{r.t}</div>
          </div>
        );
      })}
      <Center y={1180}>
        <div style={PX({fontSize: 50, lineHeight: 1.5, opacity: blink(frame, 10) ? 1 : 0.25})}>
          COMENTA
          <br />
          TU PUNTUACION
        </div>
      </Center>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Sprite grid={arrowDown} x={498} y={1420 + (Math.floor(frame / 6) % 2) * 24} px={12} />
      </svg>
    </>
  );
};

const Continue: React.FC<{frame: number}> = ({frame}) => {
  const n = 9 - Math.min(2, Math.floor((frame - T.cont) / 15));
  const coinY = 200 + seg(frame, T.coin - 14, T.coin) * 760;
  const inserted = frame >= T.coin;
  const logo = seg(frame, T.coin + 6, T.coin + 14);
  return (
    <>
      {!inserted ? (
        <>
          <Center y={520}>
            <div style={PX({fontSize: 88, color: PAL['8']})}>CONTINUE?</div>
          </Center>
          <Center y={760}>
            <div style={PX({fontSize: 260, color: PAL['7']})}>{n}</div>
          </Center>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <rect x={470} y={1080} width={140} height={200} fill={PAL['5']} shapeRendering="crispEdges" />
            <rect x={530} y={1110} width={20} height={110} fill={PAL['0']} shapeRendering="crispEdges" />
            {frame >= T.coin - 14 && <Sprite grid={coinK} x={480} y={Math.round(coinY / 12) * 12} px={12} />}
          </svg>
          <Center y={1360}>
            <div style={VT({fontSize: 60, color: PAL.a, opacity: blink(frame, 8) ? 1 : 0})}>INSERT COIN</div>
          </Center>
        </>
      ) : (
        <>
          <Center y={620} style={{transform: `scale(${0.6 + 0.4 * logo})`, opacity: logo}}>
            <div style={PX({fontSize: 190, color: PAL.a, textShadow: `14px 14px 0 ${PAL['9']}, 28px 28px 0 ${PAL['2']}`})}>knok</div>
          </Center>
          <Center y={990}>
            <div style={VT({fontSize: 80, lineHeight: 1.05, opacity: seg(frame, T.coin + 14, T.coin + 22)})}>
              tu vida extra
              <br />
              buscando curro
            </div>
          </Center>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            {[0, 1, 2, 3].map((i) => (
              <Sprite key={i} grid={heart} x={404 + i * 70} y={1270 - (i === 3 ? Math.round(seg(frame, T.coin + 20, T.coin + 28) * 30) : 0)} px={9} opacity={i === 3 ? seg(frame, T.coin + 20, T.coin + 24) : 1} tint={i === 3 ? {'8': PAL.a} : undefined} />
            ))}
          </svg>
          <Center y={1500}>
            <div style={PX({fontSize: 40, opacity: frame > T.coin + 30 && blink(frame, 10) ? 1 : 0})}>PLAYER 1 · LISTO</div>
          </Center>
        </>
      )}
    </>
  );
};

/** Vídeo 5 — «Reto arcade»: un minijuego retro en 3 rondas que el espectador juega. */
export const Arcade: React.FC = () => {
  const frame = useCurrentFrame();
  let screen: React.ReactNode;
  if (frame < T.r1) screen = <Title frame={frame} />;
  else if (frame < T.r2) screen = <Round1 frame={frame} />;
  else if (frame < T.r3) screen = <Round2 frame={frame} />;
  else if (frame < T.score) screen = <Round3 frame={frame} />;
  else if (frame < T.cont) screen = <Score frame={frame} />;
  else screen = <Continue frame={frame} />;
  const flash = frame >= T.coin && frame < T.coin + 4;

  return (
    <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
      <Stars frame={frame} />
      {screen}
      {[T.r1, T.r2, T.r3, T.score, T.cont].map((at) => (
        <Dissolve key={at} frame={frame} at={at} />
      ))}
      {flash && <AbsoluteFill style={{background: '#fff', opacity: 0.8}} />}
      {/* pantalla CRT: líneas, viñeta y esquinas redondeadas */}
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 3px, rgba(0,0,0,0) 3px 6px)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.55) 100%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 0 18px #000', borderRadius: 60, opacity: 0.9 + 0.1 * Math.sin(frame * 0.9)}} />
      <Audio src={staticFile('arcade-mix.wav')} />
    </AbsoluteFill>
  );
};
