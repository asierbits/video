import React from 'react';
import {random} from 'remotion';
import {Logo} from '../scenes/S05Knock';
import {fonts} from '../theme';
import {Ink, Pt, circlePath, rectPath, seg, smooth, spline} from './draw';

export const K = {
  night: '#121829',
  light: '#E8ECF8',
  ink: '#1D1A2F',
  amber: '#FFB21E',
  coral: '#FF8A7A',
  muted: '#8E9AC0',
  cream: '#FFF4E0',
};

export type BlockProps = {p: number; t: number; color: string; env?: number};

const Hand: React.FC<{x: number; y: number; size: number; color: string; p: number; anchor?: 'start' | 'middle' | 'end'; rot?: number; children: string}> = ({
  x,
  y,
  size,
  color,
  p,
  anchor = 'middle',
  rot = 0,
  children,
}) => {
  const n = Math.round(children.length * smooth(Math.min(1, p)));
  return (
    <text x={x} y={y} fontFamily={fonts.hand} fontWeight={600} fontSize={size} fill={color} textAnchor={anchor} transform={`rotate(${rot} ${x} ${y})`}>
      {children.slice(0, n)}
    </text>
  );
};

/** B0 — De noche. Ella, de espaldas, frente al portátil. «Querida yo… sé que estás cansada.» */
export const B0Night: React.FC<BlockProps> = ({p, t, color}) => {
  const lean = smooth(seg(p, 0.62, 0.8));
  return (
    <g>
      {/* ventana + luna + estrellas */}
      <Ink d={rectPath(120, -400, 300, 360, 10)} p={seg(p, 0, 0.18)} color={color} />
      <Ink d="M 270 -400 L 270 -40 M 120 -220 L 420 -220" p={seg(p, 0.1, 0.25)} color={color} w={4} />
      <Ink d="M 200 -340 A 46 46 0 1 0 252 -278 A 36 36 0 1 1 200 -340 Z" p={seg(p, 0.15, 0.3)} color={K.amber} w={5} fill={K.amber} fillOpacity={0.9} />
      {[
        [340, -350],
        [380, -290],
        [330, -150],
        [170, -120],
      ].map(([x, y], i) => (
        <Ink key={i} d={`M ${x - 9} ${y} L ${x + 9} ${y} M ${x} ${y - 9} L ${x} ${y + 9}`} p={seg(p, 0.2 + i * 0.03, 0.3 + i * 0.03)} color={color} w={3} opacity={0.6 + 0.4 * Math.sin(t * 4 + i)} />
      ))}
      {/* mesa */}
      <Ink d="M -420 230 L 420 230 M -360 230 L -360 420 M 360 230 L 360 420" p={seg(p, 0.18, 0.38)} color={color} />
      {/* portátil (por detrás) con su luz fría */}
      <Ink d={rectPath(-110, 40, 260, 180, 12)} p={seg(p, 0.3, 0.48)} color={color} fill="#9FC4FF" fillOpacity={0.18} />
      <Ink d="M -150 230 L 190 230" p={seg(p, 0.42, 0.5)} color={color} w={8} />
      <circle cx={20} cy={130} r={14} fill="none" stroke={color} strokeWidth={4} opacity={seg(p, 0.45, 0.5)} />
      {/* ella, de espaldas */}
      <g transform={`rotate(${-8 * lean} -300 200)`}>
        <Ink d={circlePath(-300, 40, 72, Math.PI / 2)} p={seg(p, 0.45, 0.62)} color={color} />
        <Ink d={circlePath(-300, -52, 32)} p={seg(p, 0.55, 0.64)} color={color} fill={color} fillOpacity={0.9} />
        <Ink d="M -340 104 Q -300 130 -260 104" p={seg(p, 0.58, 0.64)} color={color} w={5} />
        <Ink d="M -420 230 Q -420 150 -360 128 Q -300 112 -240 128 Q -180 150 -180 230" p={seg(p, 0.55, 0.7)} color={color} />
      </g>
      {/* brazo que sujeta la cabeza (cansada) */}
      <Ink d="M -200 210 Q -180 140 -236 82" p={seg(p, 0.66, 0.8)} color={color} />
      {/* taza con vapor */}
      <Ink d="M 250 150 L 250 225 Q 250 232 258 232 L 322 232 Q 330 232 330 225 L 330 150 Z M 330 170 Q 362 172 360 196 Q 358 214 330 212" p={seg(p, 0.72, 0.86)} color={color} />
      {[0, 1].map((i) => (
        <Ink
          key={i}
          d={spline(Array.from({length: 6}, (_, k) => [272 + i * 28 + 10 * Math.sin(t * 3 + k + i), 130 - k * 22] as Pt))}
          p={seg(p, 0.82, 0.95)}
          color={color}
          w={3.5}
          opacity={0.7}
        />
      ))}
      <Hand x={60} y={330} size={46} color={color} p={seg(p, 0.85, 1)}>
        02:47
      </Hand>
    </g>
  );
};

/** B1 — «Que mandas currículums a ciegas»: sobres que se pierden en una niebla. */
export const B1Fog: React.FC<BlockProps> = ({p, t, color}) => {
  const cloud = spline(
    Array.from({length: 26}, (_, i) => {
      const a = (i / 25) * Math.PI * 2 * 3.2;
      const r = 120 + 50 * Math.sin(i * 1.7);
      return [230 + Math.cos(a) * r + i * 4, -40 + Math.sin(a) * r * 0.7] as Pt;
    }),
  );
  return (
    <g>
      <Ink d={cloud} p={seg(p, 0, 0.35)} color={K.muted} w={5} opacity={0.9} />
      {/* pila de sobres */}
      {[0, 1, 2].map((i) => (
        <Ink key={i} d={`${rectPath(-380, 150 - i * 34, 230, 140, 8)} M -380 ${150 - i * 34} L -265 ${215 - i * 34} L -150 ${150 - i * 34}`} p={seg(p, 0.05 + i * 0.05, 0.25 + i * 0.05)} color={color} w={4} />
      ))}
      {/* sobres volando a ciegas hacia la niebla */}
      {Array.from({length: 5}, (_, i) => {
        const q = seg(p, 0.25 + i * 0.1, 0.55 + i * 0.1);
        if (q <= 0 || q >= 1) return null;
        const e = smooth(q);
        const x = -265 + (230 + (random(`fx${i}`) - 0.5) * 120 + 265) * e;
        const y = 120 - 260 * Math.sin(e * Math.PI) * 0.8 + (-40 - 120) * e;
        const s = 1 - 0.75 * e;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${-20 + 40 * e}) scale(${s})`} opacity={1 - smooth(seg(q, 0.7, 1))}>
            <path d="M -70 -44 L 70 -44 L 70 44 L -70 44 Z M -70 -44 L 0 6 L 70 -44" fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
          </g>
        );
      })}
      {['?', '?', '?'].map((c, i) => (
        <Hand key={i} x={180 + i * 80} y={-200 + (i % 2) * 40 - 8 * Math.sin(t * 3 + i)} size={70} color={K.muted} p={seg(p, 0.6 + i * 0.1, 0.7 + i * 0.1)}>
          {c}
        </Hand>
      ))}
    </g>
  );
};

/** B2 — «Ya te llamaremos» y un corazón que se agrieta. */
export const B2Crack: React.FC<BlockProps> = ({p, color}) => {
  const split = smooth(seg(p, 0.82, 1)) * 16;
  const heart = (side: -1 | 1) =>
    side < 0
      ? 'M 300 -60 C 280 -110, 200 -120, 180 -60 C 160 0, 230 60, 300 120 L 285 60 L 310 20 L 285 -20 L 300 -60 Z'
      : 'M 300 -60 C 320 -110, 400 -120, 420 -60 C 440 0, 370 60, 300 120 L 285 60 L 310 20 L 285 -20 L 300 -60 Z';
  return (
    <g>
      {/* móvil */}
      <Ink d={rectPath(-420, -260, 250, 460, 36)} p={seg(p, 0, 0.2)} color={color} />
      <Ink d="M -335 -230 L -255 -230" p={seg(p, 0.15, 0.22)} color={color} w={5} />
      {/* bocadillo */}
      <Ink d="M -150 -330 Q -150 -380 -100 -380 L 360 -380 Q 410 -380 410 -330 L 410 -230 Q 410 -180 360 -180 L -60 -180 L -150 -120 L -110 -190 Q -150 -200 -150 -230 Z" p={seg(p, 0.15, 0.35)} color={color} />
      <Hand x={130} y={-262} size={64} color={color} p={seg(p, 0.3, 0.55)}>
        ya te llamaremos…
      </Hand>
      {/* corazón */}
      <g transform={`translate(${-split} 0)`}>
        <Ink d={heart(-1)} p={seg(p, 0.45, 0.65)} color={K.coral} fill={K.coral} fillOpacity={0.25} />
      </g>
      <g transform={`translate(${split} 0)`}>
        <Ink d={heart(1)} p={seg(p, 0.45, 0.65)} color={K.coral} fill={K.coral} fillOpacity={0.25} />
      </g>
    </g>
  );
};

/** B4 — «Un día encontré knok»: la línea recta desemboca en un sol ámbar con el logo. */
export const B4Knok: React.FC<BlockProps> = ({p, t}) => {
  const burst = smooth(seg(p, 0.05, 0.4));
  const logo = smooth(seg(p, 0.2, 0.5));
  return (
    <g>
      <circle cx={0} cy={0} r={300 * burst} fill={K.amber} opacity={0.95} />
      {Array.from({length: 16}, (_, i) => {
        const a = (i / 16) * Math.PI * 2 + t * 0.15;
        const r0 = 330;
        const r1 = 330 + 90 * burst + (i % 2) * 40;
        return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} stroke={K.amber} strokeWidth={8} strokeLinecap="round" opacity={burst} />;
      })}
      <foreignObject x={-400} y={-110} width={800} height={220}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220, opacity: logo, transform: `translateX(-40px) scale(${0.8 + 0.2 * logo})`}}>
          <Logo size={150} waves={seg(p, 0.45, 0.8)} />
        </div>
      </foreignObject>
    </g>
  );
};

/** B5 — «Escribe correos que suenan a mí»: un sobre del que sale su propia onda de voz. */
export const B5Voice: React.FC<BlockProps & {envAt: (dt: number) => number}> = ({p, color, envAt}) => {
  const wave = seg(p, 0.25, 0.9);
  const pts: Pt[] = [];
  const n = 70;
  for (let i = 0; i <= n; i++) {
    if (i / n > wave) break;
    const x = -380 + i * 11;
    const a = (0.2 + envAt(-(n - i) * 0.025)) * 105;
    pts.push([x, -215 + Math.sin(i * 1.25) * a * Math.sin((i / n) * Math.PI)]);
  }
  return (
    <g>
      <Ink d={`${rectPath(-330, -100, 520, 330, 14)} M -330 -100 L -70 90 L 190 -100`} p={seg(p, 0, 0.3)} color={color} w={7} />
      <Ink d="M -70 140 m -36 0 a 36 36 0 1 0 72 0 a 36 36 0 1 0 -72 0" p={seg(p, 0.2, 0.35)} color={K.amber} fill={K.amber} />
      {pts.length > 1 && <path d={spline(pts)} fill="none" stroke={K.amber} strokeWidth={8} strokeLinecap="round" />}
      <Hand x={-70} y={330} size={52} color={color} p={seg(p, 0.5, 0.8)}>
        (suena a mí)
      </Hand>
    </g>
  );
};

/** B6 — «Busca por todo internet las ofertas que encajan conmigo»: globo + pieza que encaja. */
export const B6Fit: React.FC<BlockProps> = ({p, t, color}) => {
  const snap = smooth(seg(p, 0.62, 0.82));
  const piece = (dx: number, dy: number) =>
    `M ${dx - 80} ${dy - 80} L ${dx - 20} ${dy - 80} C ${dx - 30} ${dy - 120}, ${dx + 30} ${dy - 120}, ${dx + 20} ${dy - 80} L ${dx + 80} ${dy - 80} L ${dx + 80} ${dy - 20} C ${dx + 120} ${dy - 30}, ${dx + 120} ${dy + 30}, ${dx + 80} ${dy + 20} L ${dx + 80} ${dy + 80} L ${dx - 80} ${dy + 80} Z`;
  return (
    <g>
      {/* globo */}
      <Ink d={circlePath(-190, -150, 200)} p={seg(p, 0, 0.2)} color={color} />
      {[0, 1, 2].map((i) => {
        const rx = Math.abs(Math.cos(t * 0.8 + i * 1.05)) * 200;
        return <ellipse key={i} cx={-190} cy={-150} rx={rx} ry={200} fill="none" stroke={color} strokeWidth={3.5} opacity={seg(p, 0.12, 0.25)} />;
      })}
      <Ink d="M -390 -150 L 10 -150 M -362 -250 L -18 -250 M -362 -50 L -18 -50" p={seg(p, 0.15, 0.3)} color={color} w={3.5} />
      {Array.from({length: 7}, (_, i) => {
        const a = random(`ga${i}`) * Math.PI * 2;
        const r = random(`gr${i}`) * 170;
        const on = seg(p, 0.25 + i * 0.04, 0.3 + i * 0.04);
        return <circle key={i} cx={-190 + Math.cos(a) * r} cy={-150 + Math.sin(a) * r} r={14 * on} fill={i % 3 === 0 ? K.amber : color} />;
      })}
      {/* tablero con hueco + pieza */}
      <Ink d={`${rectPath(40, 80, 420, 300, 16)}`} p={seg(p, 0.3, 0.45)} color={color} />
      <Ink d={piece(250, 230)} p={seg(p, 0.4, 0.52)} color={color} w={5} opacity={0.6} />
      <g transform={`translate(${(1 - snap) * -260} ${(1 - snap) * -220}) rotate(${(1 - snap) * -40} 250 230)`} opacity={seg(p, 0.48, 0.55)}>
        <path d={piece(250, 230)} fill={K.amber} stroke={color} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {snap >= 1 && <Ink d="M 120 -10 L 160 30 M 380 -10 L 340 30 M 250 -40 L 250 10" p={seg(p, 0.82, 0.9)} color={K.amber} w={6} />}
    </g>
  );
};

/** B7 — «Y con un solo clic… salen todas»: clic y la línea se abre en abanico. */
export const B7Fan: React.FC<BlockProps> = ({p, color}) => {
  const click = seg(p, 0.25, 0.4);
  const fan = seg(p, 0.35, 0.85);
  return (
    <g>
      <Ink d="M -20 200 L -20 330 L 12 300 L 36 352 L 60 342 L 36 292 L 80 292 Z" p={seg(p, 0, 0.22)} color={color} w={6} fill="#fff" />
      {click > 0 && click < 1 && <circle cx={-20} cy={200} r={20 + 90 * click} fill="none" stroke={K.amber} strokeWidth={8 * (1 - click)} />}
      {Array.from({length: 9}, (_, i) => {
        const a = (-160 + i * 17.5) * (Math.PI / 180);
        const L = 380 + (i % 2) * 60;
        const end: Pt = [-20 + Math.cos(a) * L, 170 + Math.sin(a) * L];
        const mid: Pt = [-20 + Math.cos(a + 0.2) * L * 0.5, 170 + Math.sin(a + 0.2) * L * 0.5];
        const q = seg(fan, i * 0.04, 0.6 + i * 0.04);
        return (
          <g key={i}>
            <Ink d={spline([[-20, 170], mid, end])} p={q} color={i % 3 === 1 ? K.amber : color} w={5} />
            {q >= 1 && (
              <path
                d={`M ${end[0] - 26} ${end[1] - 17} L ${end[0] + 26} ${end[1] - 17} L ${end[0] + 26} ${end[1] + 17} L ${end[0] - 26} ${end[1] + 17} Z M ${end[0] - 26} ${end[1] - 17} L ${end[0]} ${end[1]} L ${end[0] + 26} ${end[1] - 17}`}
                fill={K.cream}
                stroke={color}
                strokeWidth={4}
                strokeLinejoin="round"
              />
            )}
          </g>
        );
      })}
    </g>
  );
};

/** B8 — «Hasta aplica por mí en LinkedIn»: navegador con checks que se marcan solos. */
export const B8Browser: React.FC<BlockProps> = ({p, color}) => (
  <g>
    <Ink d={rectPath(-360, -280, 720, 560, 28)} p={seg(p, 0, 0.2)} color={color} />
    <Ink d="M -360 -190 L 360 -190" p={seg(p, 0.12, 0.22)} color={color} w={5} />
    {['LinkedIn', 'InfoJobs', 'Indeed'].map((tb, i) => (
      <Hand key={tb} x={-300 + i * 190} y={-222} size={40} color={color} anchor="start" p={seg(p, 0.15 + i * 0.04, 0.3 + i * 0.04)}>
        {tb}
      </Hand>
    ))}
    {/* icono de la extensión */}
    <g opacity={seg(p, 0.22, 0.3)} transform={`translate(300 -235) scale(${0.6 + 0.4 * seg(p, 0.22, 0.32)})`}>
      <rect x={-28} y={-28} width={56} height={56} rx={14} fill={K.amber} stroke={color} strokeWidth={4} />
      <text y={16} textAnchor="middle" fontFamily={fonts.logo} fontWeight={900} fontSize={38} fill={K.ink}>
        k
      </text>
    </g>
    {[0, 1, 2].map((r) => {
      const y = -110 + r * 130;
      return (
        <g key={r}>
          <Ink d={`M -200 ${y - 10} L 120 ${y - 10} M -200 ${y + 26} L 40 ${y + 26}`} p={seg(p, 0.25 + r * 0.05, 0.4 + r * 0.05)} color={color} w={5} opacity={0.6} />
          <Ink d={rectPath(-300, y - 40, 70, 70, 12)} p={seg(p, 0.28 + r * 0.05, 0.4 + r * 0.05)} color={color} w={5} />
          <Ink d={`M -288 ${y - 6} L -268 ${y + 16} L -226 ${y - 40}`} p={seg(p, 0.45 + r * 0.15, 0.55 + r * 0.15)} color={K.amber} w={9} />
          <Hand x={250} y={y + 18} size={40} color={K.amber} p={seg(p, 0.5 + r * 0.15, 0.6 + r * 0.15)}>
            ¡hecho!
          </Hand>
        </g>
      );
    })}
  </g>
);

/** B9 — «¿Y sabes qué? El lunes empiezo.» */
export const B9Monday: React.FC<BlockProps> = ({p, t, color}) => (
  <g>
    <Ink d={rectPath(-260, -280, 520, 520, 24)} p={seg(p, 0, 0.2)} color={color} />
    <Ink d="M -260 -160 L 260 -160" p={seg(p, 0.12, 0.22)} color={color} />
    {[-160, -60, 60, 160].map((x, i) => (
      <Ink key={x} d={`M ${x} -310 L ${x} -250`} p={seg(p, 0.15 + i * 0.02, 0.22 + i * 0.02)} color={color} w={8} />
    ))}
    <Hand x={0} y={-190} size={62} color={color} p={seg(p, 0.2, 0.35)}>
      septiembre
    </Hand>
    <Hand x={0} y={60} size={190} color={color} p={seg(p, 0.3, 0.5)}>
      lunes
    </Hand>
    <Ink
      d={spline(Array.from({length: 22}, (_, i) => {
        const a = -Math.PI * 0.9 + (i / 21) * Math.PI * 2.15;
        return [Math.cos(a) * (230 + i * 2), 0 + Math.sin(a) * (110 + i * 1.5)] as Pt;
      }))}
      p={seg(p, 0.55, 0.8)}
      color={K.amber}
      w={11}
    />
    {[
      [-300, -60],
      [300, 120],
      [250, -140],
    ].map(([x, y], i) => {
      const s = seg(p, 0.75 + i * 0.05, 0.85 + i * 0.05) * (0.8 + 0.2 * Math.sin(t * 8 + i));
      return <path key={i} d={`M ${x} ${y - 30 * s} L ${x + 8 * s} ${y - 8 * s} L ${x + 30 * s} ${y} L ${x + 8 * s} ${y + 8 * s} L ${x} ${y + 30 * s} L ${x - 8 * s} ${y + 8 * s} L ${x - 30 * s} ${y} L ${x - 8 * s} ${y - 8 * s} Z`} fill={K.amber} />;
    })}
  </g>
);

/** B10 — «Así que respira. Lo mejor está por llegar.»: amanecer y ella, de pie, con los brazos abiertos. */
export const B10Sunrise: React.FC<BlockProps> = ({p, t, color}) => {
  const rise = smooth(seg(p, 0.1, 0.7));
  const arms = smooth(seg(p, 0.45, 0.75));
  const breathe = 1 + 0.015 * Math.sin(t * 2.4);
  return (
    <g>
      <defs>
        <clipPath id="horizon">
          <rect x={-540} y={-600} width={1080} height={700} />
        </clipPath>
      </defs>
      <g clipPath="url(#horizon)">
        <circle cx={0} cy={100 - 230 * rise} r={190} fill={K.amber} />
        {Array.from({length: 11}, (_, i) => {
          const a = Math.PI + (i / 10) * Math.PI;
          const cy = 100 - 230 * rise;
          return <line key={i} x1={Math.cos(a) * 220} y1={cy + Math.sin(a) * 220} x2={Math.cos(a) * (220 + 70 * rise)} y2={cy + Math.sin(a) * (220 + 70 * rise)} stroke={K.amber} strokeWidth={8} strokeLinecap="round" opacity={rise} />;
        })}
      </g>
      <Ink d="M -480 100 L 480 100" p={seg(p, 0, 0.15)} color={color} />
      {/* pájaros */}
      {[0, 1, 2].map((i) => {
        const x = -300 + i * 110 + t * 30;
        const y = -330 + (i % 2) * 40;
        const f = 10 * Math.sin(t * 9 + i);
        return <Ink key={i} d={`M ${x - 26} ${y - f} Q ${x - 12} ${y - 8} ${x} ${y + 4} Q ${x + 12} ${y - 8} ${x + 26} ${y - f}`} p={seg(p, 0.5 + i * 0.05, 0.6 + i * 0.05)} color={color} w={4} />;
      })}
      {/* ella, de pie, de espaldas al espectador mirando al sol */}
      <g transform={`translate(0 330) scale(${breathe})`}>
        <Ink d={circlePath(0, -270, 44)} p={seg(p, 0.25, 0.4)} color={color} fill={K.cream} />
        <Ink d={circlePath(0, -330, 20)} p={seg(p, 0.3, 0.42)} color={color} fill={color} />
        <Ink d="M -46 -100 L -30 -210 Q 0 -230 30 -210 L 46 -100 Z" p={seg(p, 0.32, 0.5)} color={color} fill={K.cream} />
        <Ink d="M -18 -100 L -24 0 M 18 -100 L 24 0" p={seg(p, 0.4, 0.55)} color={color} />
        <Ink d={`M -30 -200 Q ${-80 - 40 * arms} ${-180 + 40 * (1 - arms) - 80 * arms} ${-100 - 40 * arms} ${-120 - 160 * arms}`} p={seg(p, 0.42, 0.6)} color={color} />
        <Ink d={`M 30 -200 Q ${80 + 40 * arms} ${-180 + 40 * (1 - arms) - 80 * arms} ${100 + 40 * arms} ${-120 - 160 * arms}`} p={seg(p, 0.42, 0.6)} color={color} />
      </g>
    </g>
  );
};

/** Cierre — el logo y la firma de la carta. */
export const BEnd: React.FC<BlockProps> = ({p, color}) => {
  const logo = smooth(seg(p, 0, 0.3));
  return (
    <g>
      <foreignObject x={-450} y={-260} width={900} height={260}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260, opacity: logo, transform: `translateX(-50px) scale(${0.85 + 0.15 * logo})`}}>
          <Logo size={200} waves={seg(p, 0.35, 0.7)} />
        </div>
      </foreignObject>
      <Hand x={0} y={110} size={84} color={color} p={seg(p, 0.25, 0.6)}>
        Con cariño,
      </Hand>
      <Hand x={0} y={200} size={84} color={color} p={seg(p, 0.45, 0.85)}>
        tu yo del futuro.
      </Hand>
      <Ink d="M -220 250 Q -60 280 230 240" p={seg(p, 0.75, 0.95)} color={K.amber} w={8} />
    </g>
  );
};
