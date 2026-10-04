import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, fonts} from '../theme';
import {ease, lerp, shake} from '../utils';

const SNAP = 22;
const TABS = ['linkedin.com/jobs', 'infojobs.net', 'indeed.es'];
const TAB_SWITCH = [0, 62, 88];
const JOBS = [
  ['Diseñador/a UX', 'Estudio Faro · Remoto'],
  ['Product Designer', 'Nubo · Madrid'],
  ['UX Researcher', 'Kora Labs · Híbrido'],
  ['Diseño de Interfaz', 'Malva · Remoto'],
  ['UI Designer Jr.', 'Pliego · Valencia'],
  ['Design Ops', 'Ruta 9 · Remoto'],
  ['UX Writer', 'Alba Tech · Madrid'],
  ['Visual Designer', 'Oleaje · Remoto'],
  ['Service Designer', 'Cobalto · Bilbao'],
];

const Puzzle: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <path
      d="M 10 22 L 38 22 C 34 6, 62 6, 58 22 L 86 22 L 86 46 C 100 42, 100 70, 86 66 L 86 92 L 10 92 L 10 66 C 24 70, 24 42, 10 46 Z"
      fill={C.amber}
      stroke={C.ink}
      strokeWidth={4}
    />
    <text x={48} y={74} textAnchor="middle" fontFamily={fonts.logo} fontWeight={900} fontSize={46} fill={C.ink}>
      k
    </text>
  </svg>
);

const Check: React.FC<{p: number}> = ({p}) => (
  <svg width={34} height={34} viewBox="0 0 34 34">
    <path d="M 6 18 L 14 26 L 28 8" fill="none" stroke={C.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - p)} />
  </svg>
);

/** ESCENA 9 — 04: la extensión. Una pieza encaja en el navegador y empieza a aplicar sola. */
export const S09Extension: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [SNAP], 14, 'x');

  const winIn = lerp(frame, [0, 14], [0, 1], ease.out);
  const rx = lerp(frame, [0, 120], [18, 6]);
  const ry = lerp(frame, [0, 120], [-16, -4]);

  // la pieza vuela y encaja
  const fly = lerp(frame, [2, SNAP], [0, 1], ease.in);
  const pieceX = 1100 * (1 - fly) + 836 * fly;
  const pieceY = -400 * (1 - fly) + 4 * fly;
  const pieceRot = 220 * (1 - fly);
  const snapRing = frame >= SNAP && frame < SNAP + 16;

  const activeTab = TAB_SWITCH.filter((t) => frame >= t).length - 1;
  const scroll = lerp(frame, [36, 116], [0, 980], ease.inOut);

  const applied = JOBS.map((_, i) => 34 + i * 9);
  const appliedCount = applied.filter((t) => frame >= t + 4).length;

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 100% 70% at 50% 40%, #33210F 0%, #140C06 60%, #080503 100%)`, overflow: 'hidden'}}>
      {/* etiqueta 04 */}
      <div style={{position: 'absolute', left: 70, top: 70, display: 'flex', gap: 26, alignItems: 'center', opacity: lerp(frame, [0, 8], [0, 1])}}>
        <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 64, color: C.amber}}>04</div>
        <div style={{lineHeight: 1.05}}>
          <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 32, color: C.cream}}>extensión de Chrome</div>
          <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 40, color: C.cream, opacity: 0.85}}>aplica donde ya buscas</div>
        </div>
      </div>

      <AbsoluteFill style={{perspective: 2400, transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 260,
            width: 940,
            height: 1460,
            transform: `translateY(${(1 - winIn) * 500}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
            opacity: winIn,
            borderRadius: 28,
            background: '#F7F1E6',
            boxShadow: '0 60px 120px rgba(0,0,0,.6)',
            overflow: 'hidden',
          }}
        >
          {/* pestañas */}
          <div style={{height: 70, background: '#1B1510', display: 'flex', alignItems: 'flex-end', paddingLeft: 24, gap: 6}}>
            {TABS.map((t, i) => (
              <div
                key={t}
                style={{
                  height: 54,
                  padding: '0 26px',
                  borderRadius: '16px 16px 0 0',
                  background: i === activeTab ? '#F7F1E6' : '#2E251C',
                  color: i === activeTab ? C.ink : '#A89880',
                  fontFamily: fonts.mono,
                  fontSize: 22,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t}
              </div>
            ))}
          </div>
          {/* barra de direcciones */}
          <div style={{height: 92, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 18, borderBottom: '2px solid #E2D6C2'}}>
            <div style={{flex: 1, height: 56, borderRadius: 28, background: '#EADFCB', fontFamily: fonts.mono, fontSize: 22, color: '#6B5A48', display: 'flex', alignItems: 'center', paddingLeft: 28}}>
              {`https://${TABS[activeTab]}`}
            </div>
            {/* hueco de la extensión */}
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                border: frame < SNAP ? `4px dashed ${C.fog}` : `4px solid ${C.amber}`,
                background: frame < SNAP ? 'transparent' : 'rgba(255,178,30,.18)',
              }}
            />
          </div>
          {/* lista de ofertas */}
          <div style={{position: 'relative', height: 1300, overflow: 'hidden'}}>
            <div style={{transform: `translateY(${-scroll}px)`, padding: 28, display: 'flex', flexDirection: 'column', gap: 24}}>
              {JOBS.map(([title, meta], i) => {
                const t = applied[i];
                const done = lerp(frame, [t, t + 6], [0, 1], ease.out);
                return (
                  <div
                    key={title}
                    style={{
                      height: 230,
                      borderRadius: 22,
                      background: '#fff',
                      border: done > 0 ? `4px solid ${C.amber}` : '4px solid #EADFCB',
                      padding: 28,
                      display: 'flex',
                      gap: 24,
                      position: 'relative',
                    }}
                  >
                    <div style={{width: 96, height: 96, borderRadius: 20, background: ['#2F6BFF', '#1B1510', '#E2531B', '#5A6786'][i % 4]}} />
                    <div style={{flex: 1}}>
                      <div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 40, color: C.ink}}>{title}</div>
                      <div style={{fontFamily: fonts.mono, fontSize: 24, color: '#8A7A66', marginTop: 8}}>{meta}</div>
                      <div style={{marginTop: 22, height: 14, width: '80%', borderRadius: 7, background: '#F0E7D8'}} />
                      <div style={{marginTop: 12, height: 14, width: '55%', borderRadius: 7, background: '#F0E7D8'}} />
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        right: 28,
                        bottom: 28,
                        height: 70,
                        padding: '0 30px',
                        borderRadius: 35,
                        background: done > 0.5 ? C.amber : C.ink,
                        color: done > 0.5 ? C.ink : C.cream,
                        fontFamily: fonts.sans,
                        fontWeight: 700,
                        fontSize: 30,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transform: `scale(${1 + 0.18 * Math.sin(done * Math.PI)})`,
                      }}
                    >
                      {done > 0.5 && <Check p={lerp(frame, [t + 2, t + 8], [0, 1])} />}
                      {done > 0.5 ? 'aplicado' : 'aplicar'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* pieza del puzle */}
          <div style={{position: 'absolute', left: pieceX, top: pieceY + 70, transform: `rotate(${pieceRot}deg) scale(${frame < SNAP ? 1.6 - 0.6 * fly : 1 + 0.25 * Math.max(0, 1 - (frame - SNAP) / 6)})`}}>
            <Puzzle size={84} />
          </div>
          {snapRing && (
            <div
              style={{
                position: 'absolute',
                left: 878 - (frame - SNAP) * 12,
                top: 116 - (frame - SNAP) * 12,
                width: (frame - SNAP) * 24,
                height: (frame - SNAP) * 24,
                borderRadius: '50%',
                border: `6px solid ${C.amber}`,
                opacity: 1 - (frame - SNAP) / 16,
              }}
            />
          )}

          {/* mini panel de la extensión */}
          <div
            style={{
              position: 'absolute',
              right: 24,
              top: 176,
              width: 330,
              padding: '20px 24px',
              borderRadius: 20,
              background: C.ink,
              color: C.cream,
              boxShadow: '0 20px 40px rgba(0,0,0,.35)',
              transformOrigin: '90% 0%',
              transform: `scale(${lerp(frame, [SNAP + 4, SNAP + 12], [0, 1], ease.back)})`,
            }}
          >
            <div style={{fontFamily: fonts.mono, fontSize: 20, color: C.amber}}>knok · auto-aplicar</div>
            <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 72, lineHeight: 1.1}}>{appliedCount}</div>
            <div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 32}}>candidaturas enviadas</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
