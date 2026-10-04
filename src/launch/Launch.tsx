import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';

export const LAUNCH_TOTAL = 900;

const S = {hook: 0, logo: 60, mail: 120, scan: 300, click: 480, ext: 600, end: 750};

const C = {
  bg: '#05060B',
  text: '#F5F6FA',
  dim: 'rgba(245,246,250,.55)',
  amber: '#FFB21E',
  pink: '#FF5E8A',
  violet: '#7C5CFF',
  teal: '#22D3B6',
  red: '#FF4D4D',
  glass: 'rgba(255,255,255,0.07)',
  edge: 'rgba(255,255,255,0.16)',
};
const GRAD = `linear-gradient(100deg, ${C.amber} 0%, ${C.pink} 55%, ${C.violet} 100%)`;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const lerp = (f: number, i: number[], o: number[], e = ease) => interpolate(f, i, o, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

const glass = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.glass,
  border: `1.5px solid ${C.edge}`,
  borderRadius: 36,
  backdropFilter: 'blur(24px)',
  boxShadow: '0 40px 80px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.12)',
  ...extra,
});

/** Fondo: auroras suaves que se mueven y cambian de color según el bloque. */
const Aurora: React.FC<{f: number}> = ({f}) => {
  const warm = lerp(f, [S.logo - 10, S.logo + 20], [0, 1]);
  const blobs = [
    {x: 200 + 120 * Math.sin(f / 70), y: 300 + 80 * Math.cos(f / 90), r: 1200, c: warm ? C.violet : '#2A2F45', o: 0.55},
    {x: 900 + 100 * Math.cos(f / 60), y: 1100 + 120 * Math.sin(f / 80), r: 1250, c: warm ? C.pink : '#3A1E28', o: 0.35},
    {x: 500 + 160 * Math.sin(f / 100), y: 1750 + 60 * Math.cos(f / 50), r: 1150, c: warm ? C.amber : '#2A2A2A', o: 0.35},
  ];
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.r / 2,
            top: b.y - b.r / 2,
            width: b.r,
            height: b.r,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.c} 0%, rgba(0,0,0,0) 65%)`,
            opacity: b.o * (0.4 + 0.6 * warm),
          }}
        />
      ))}
      {/* rejilla sutil */}
      <AbsoluteFill
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Titular: cada palabra sube y se enfoca. */
const Headline: React.FC<{f: number; at: number; lines: (string | [string, 'grad'])[]; y: number; size?: number; out?: number; align?: 'center' | 'left'}> = ({f, at, lines, y, size = 96, out, align = 'center'}) => {
  let k = 0;
  const fade = out !== undefined ? lerp(f, [out, out + 8], [1, 0]) : 1;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: y, textAlign: align, opacity: fade, transform: out !== undefined ? `translateY(${lerp(f, [out, out + 8], [0, -30])}px)` : undefined}}>
      {lines.map((ln, li) => {
        const isGrad = Array.isArray(ln);
        const text = isGrad ? ln[0] : (ln as string);
        return (
          <div key={li} style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: -size * 0.045, color: C.text}}>
            {text.split(' ').map((w, wi) => {
              const d = f - at - k++ * 2.2;
              const p = lerp(d, [0, 14], [0, 1]);
              return (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    marginRight: size * 0.24,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 50}px)`,
                    filter: `blur(${(1 - p) * 14}px)`,
                    ...(isGrad ? {backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'} : {}),
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Sub: React.FC<{f: number; at: number; y: number; children: React.ReactNode}> = ({f, at, y, children}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top: y, textAlign: 'center', fontFamily: fonts.ui, fontWeight: 400, fontSize: 40, color: C.dim, opacity: lerp(f, [at, at + 12], [0, 1]), transform: `translateY(${lerp(f, [at, at + 12], [20, 0])}px)`}}>{children}</div>
);

const Icon: React.FC<{size?: number}> = ({size = 72}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.logo, fontWeight: 900, fontSize: size * 0.62, color: '#140A05'}}>k</div>
);

// --------------------------------------------------------------- 1 · gancho
const NOTE_COUNT = 18;
const Hook: React.FC<{f: number}> = ({f}) => {
  const implode = lerp(f, [52, 60], [0, 1], Easing.in(Easing.cubic));
  const companies = ['Nova Studio', 'Grupo Atlas', 'Banco Sol', 'Nubo', 'Kora Labs', 'Pliego', 'Ruta 9', 'Malva'];
  return (
    <AbsoluteFill>
      <Headline f={f} at={18} y={240} size={92} lines={['Buscar trabajo', ['se ha roto.', 'grad']]} />
      {Array.from({length: NOTE_COUNT}, (_, i) => {
        const at = 4 + i * 2.6;
        const p = lerp(f, [at, at + 8], [0, 1]);
        if (p <= 0) return null;
        const depth = Math.min(NOTE_COUNT, Math.floor((f - 4) / 2.6)) - i;
        const y = 760 + Math.min(depth, 6) * 26 - (1 - p) * 300;
        const sc = 1 - Math.min(depth, 6) * 0.04;
        const tx = (random(`nx${i}`) - 0.5) * 60 * implode;
        return (
          <div
            key={i}
            style={{
              ...glass({borderRadius: 34, padding: '26px 30px', background: 'rgba(34,36,48,.97)'}),
              position: 'absolute',
              left: 80,
              right: 80,
              top: y,
              opacity: p * (depth > 6 ? 0 : 1) * (1 - implode),
              transform: `translateX(${tx}px) scale(${sc * (1 - implode * 0.6)})`,
              zIndex: 100 + i,
              display: 'flex',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <div style={{width: 80, height: 80, borderRadius: 20, background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={46} height={36} viewBox="0 0 46 36">
                <rect x={2} y={2} width={42} height={32} rx={6} fill="none" stroke="#fff" strokeWidth={4} />
                <path d="M 4 5 L 23 20 L 42 5" fill="none" stroke="#fff" strokeWidth={4} />
              </svg>
            </div>
            <div style={{flex: 1, fontFamily: fonts.ui}}>
              <div style={{display: 'flex', justifyContent: 'space-between', color: C.text, fontWeight: 600, fontSize: 34}}>
                <span>{companies[i % companies.length]}</span>
                <span style={{color: C.dim, fontWeight: 400, fontSize: 28}}>ahora</span>
              </div>
              <div style={{color: C.dim, fontSize: 32, marginTop: 4}}>Gracias por tu interés, pero…</div>
            </div>
          </div>
        );
      })}
      {/* contador de rechazos */}
      <div style={{position: 'absolute', right: 70, top: 690, width: 92, height: 92, borderRadius: 46, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: '#fff', zIndex: 200, opacity: (f > 6 ? 1 : 0) * (1 - implode), transform: `scale(${1 + 0.15 * Math.exp(-((f - 4) % 2.6))})`}}>
        {Math.min(NOTE_COUNT, Math.max(1, Math.floor((f - 4) / 2.6) + 1))}
      </div>
      {/* punto de luz donde implosiona todo */}
      <div style={{position: 'absolute', left: 540 - 60, top: 900 - 60, width: 120, height: 120, borderRadius: 60, background: `radial-gradient(circle, #fff 0%, ${C.amber} 40%, rgba(0,0,0,0) 70%)`, opacity: implode, transform: `scale(${0.3 + implode * 1.5})`}} />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- 2 · logo
const LogoReveal: React.FC<{f: number}> = ({f}) => {
  const d = f - S.logo;
  const p = lerp(d, [0, 18], [0, 1]);
  const shine = lerp(d, [8, 34], [-40, 140], io);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,178,30,.35) 0%, rgba(0,0,0,0) 60%)`, transform: `scale(${0.6 + 0.5 * p})`, opacity: p}} />
      <div style={{transform: `scale(${1.6 - 0.6 * p})`, filter: `blur(${(1 - p) * 30}px)`, opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 50}}>
        <div style={{...glass({borderRadius: 70, width: 240, height: 240}), display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
          <Icon size={170} />
          <div style={{position: 'absolute', top: -50, bottom: -50, width: 70, left: `${shine}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.65), rgba(255,255,255,0))', transform: 'rotate(18deg)'}} />
        </div>
        <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 210, letterSpacing: -12, color: C.text, lineHeight: 1}}>knok</div>
      </div>
      <Sub f={f} at={S.logo + 26} y={1330}>
        Tu búsqueda de empleo, en piloto automático.
      </Sub>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- maqueta de móvil
const Phone: React.FC<{children: React.ReactNode; rx: number; ry: number; x: number; y: number; s?: number}> = ({children, rx, ry, x, y, s = 1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 600, height: 1180, transform: `perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`, transformStyle: 'preserve-3d'}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 96, background: '#0C0D12', border: '3px solid #2E3040', boxShadow: '0 80px 160px rgba(0,0,0,.6), inset 0 0 0 10px #15161E'}} />
    <div style={{position: 'absolute', inset: 22, borderRadius: 76, overflow: 'hidden', background: '#0F1018'}}>{children}</div>
    <div style={{position: 'absolute', left: 230, top: 44, width: 140, height: 40, borderRadius: 20, background: '#000'}} />
    <div style={{position: 'absolute', inset: 0, borderRadius: 96, background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 35%)', pointerEvents: 'none'}} />
  </div>
);

const SWAPS = [
  {at: 150, from: 'Estimado/a responsable de selección:', to: 'Hola, Marta:'},
  {at: 180, from: 'Me interesa el puesto ofertado en su empresa.', to: 'Me encantó el rediseño que hicisteis de la app de Faro.'},
  {at: 210, from: 'Quedo a la espera de su respuesta.', to: '¿Te va bien una llamada el jueves?'},
];

const Morph: React.FC<{f: number; at: number; from: string; to: string}> = ({f, at, from, to}) => {
  const p = lerp(f, [at, at + 10], [0, 1], io);
  const sweep = lerp(f, [at - 2, at + 14], [-20, 120]);
  const after = f >= at + 5;
  return (
    <div style={{position: 'relative', padding: '6px 10px', margin: '0 -10px', borderRadius: 12, background: after ? `rgba(255,178,30,${0.18 * (1 - lerp(f, [at + 20, at + 60], [0, 1]))})` : 'transparent', overflow: 'hidden'}}>
      <span style={{color: after ? C.text : 'rgba(245,246,250,.45)', textDecoration: !after && f >= at - 6 ? 'line-through' : 'none', opacity: after ? p : 1 - p * 0.5}}>{after ? to : from}</span>
      {f >= at - 2 && f < at + 16 && <div style={{position: 'absolute', top: 0, bottom: 0, width: 80, left: `${sweep}%`, background: 'linear-gradient(90deg, rgba(255,178,30,0), rgba(255,178,30,.6), rgba(255,178,30,0))'}} />}
    </div>
  );
};

const MailScene: React.FC<{f: number}> = ({f}) => {
  const d = f - S.mail;
  const enter = lerp(d, [0, 20], [0, 1]);
  const tone = lerp(f, [228, 240], [0, 1], io);
  return (
    <AbsoluteFill>
      <Headline f={f} at={S.mail + 4} y={150} size={92} lines={['Cada correo,', ['a medida.', 'grad']]} out={S.scan - 10} />
      <Phone x={240} y={470 + (1 - enter) * 500} rx={8 - 4 * enter} ry={-22 + 10 * enter + 2 * Math.sin(f / 30)}>
        <div style={{padding: '110px 40px 40px', fontFamily: fonts.ui, color: C.text}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <Icon size={56} />
            <div style={{fontWeight: 800, fontSize: 38}}>Nuevo correo</div>
          </div>
          <div style={{marginTop: 34, fontSize: 28, color: C.dim}}>Para</div>
          <div style={{fontSize: 32, fontWeight: 600}}>Marta · Estudio Faro</div>
          <div style={{marginTop: 18, fontSize: 28, color: C.dim}}>Puesto</div>
          <div style={{fontSize: 32, fontWeight: 600}}>Product Designer</div>
          <div style={{marginTop: 30, height: 2, background: C.edge}} />
          <div style={{marginTop: 26, fontSize: 32, lineHeight: 1.35, display: 'flex', flexDirection: 'column', gap: 16}}>
            {SWAPS.map((s) => (
              <Morph key={s.at} f={f} {...s} />
            ))}
          </div>
          <div style={{marginTop: 40, fontSize: 26, color: C.dim}}>Tono</div>
          <div style={{marginTop: 10, position: 'relative', display: 'flex', background: 'rgba(255,255,255,.06)', borderRadius: 40, padding: 6}}>
            <div style={{position: 'absolute', top: 6, bottom: 6, left: `calc(${tone * 50}% + 6px)`, width: 'calc(50% - 12px)', borderRadius: 34, background: GRAD}} />
            {['Formal', 'Cercano'].map((t, i) => (
              <div key={t} style={{flex: 1, textAlign: 'center', padding: '14px 0', fontSize: 30, fontWeight: 600, position: 'relative', color: (i === 1 ? tone > 0.5 : tone <= 0.5) ? '#140A05' : C.text}}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </Phone>
      {/* chip flotante */}
      <div style={{...glass({borderRadius: 28, padding: '20px 28px'}), position: 'absolute', left: 70, top: 1500, fontFamily: fonts.ui, fontSize: 32, color: C.text, opacity: lerp(f, [160, 172], [0, 1]), transform: `translateY(${lerp(f, [160, 172], [30, 0]) + 6 * Math.sin(f / 18)}px)`}}>
        ✦ Escrito con <b>tu</b> voz, para <b>su</b> empresa
      </div>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- 4 · escanear
const GLOBE_PTS = (() => {
  const pts: [number, number, number][] = [];
  const n = 900;
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
  }
  return pts;
})();

const JOBS = [
  {at: 345, role: 'Product Designer', co: 'Estudio Faro', m: 98, side: -1, y: 520},
  {at: 360, role: 'UX/UI Designer', co: 'Nubo', m: 95, side: 1, y: 700},
  {at: 375, role: 'Diseñador/a de producto', co: 'Kora Labs', m: 92, side: -1, y: 1180},
  {at: 390, role: 'UI Designer Jr.', co: 'Malva', m: 90, side: 1, y: 1360},
];

const ScanScene: React.FC<{f: number}> = ({f}) => {
  const d = f - S.scan;
  const enter = lerp(d, [0, 20], [0, 1]);
  const rot = f * 0.012;
  const cx = 540;
  const cy = 1000;
  const R = 330 * (0.7 + 0.3 * enter);
  const count = Math.round(lerp(f, [S.scan + 10, S.click - 20], [0, 12480], io));
  const found = Math.round(lerp(f, [340, S.click - 20], [0, 37], io));
  return (
    <AbsoluteFill>
      <Headline f={f} at={S.scan + 4} y={150} size={88} lines={['Ofertas que', ['encajan contigo.', 'grad']]} out={S.click - 10} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="globeGlow">
            <stop offset="0%" stopColor={C.violet} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C.violet} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R * 1.6} fill="url(#globeGlow)" opacity={enter} />
        {GLOBE_PTS.map(([x, y, z], i) => {
          const xr = x * Math.cos(rot) - z * Math.sin(rot);
          const zr = x * Math.sin(rot) + z * Math.cos(rot);
          if (zr < -0.05) return null;
          const hot = random(`g${i}`) > 0.985;
          return <circle key={i} cx={cx + xr * R} cy={cy + y * R} r={(hot ? 6 : 3.2) * (0.5 + 0.5 * zr)} fill={hot ? C.amber : '#B9C0FF'} opacity={(0.25 + 0.75 * zr) * enter} />;
        })}
        {JOBS.map((j, i) => {
          const p = lerp(f, [j.at - 10, j.at], [0, 1], io);
          if (p <= 0) return null;
          const sx = cx + (j.side < 0 ? -0.5 : 0.5) * R;
          const sy = cy + (i % 2 ? -0.3 : 0.35) * R;
          const ex = j.side < 0 ? 300 : 780;
          const ey = j.y + 70;
          const mx = (sx + ex) / 2;
          const my = Math.min(sy, ey) - 120;
          return <path key={i} d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`} fill="none" stroke={C.amber} strokeWidth={3} strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - p} opacity={0.8} />;
        })}
      </svg>
      {JOBS.map((j) => {
        const p = lerp(f, [j.at, j.at + 12], [0, 1]);
        if (p <= 0) return null;
        const ring = lerp(f, [j.at + 4, j.at + 24], [0, j.m / 100], io);
        return (
          <div
            key={j.role}
            style={{
              ...glass({borderRadius: 30, padding: '22px 26px', background: 'rgba(20,22,32,.72)'}),
              position: 'absolute',
              top: j.y + 8 * Math.sin(f / 20 + j.at),
              left: j.side < 0 ? 60 : undefined,
              right: j.side > 0 ? 60 : undefined,
              width: 470,
              display: 'flex',
              gap: 20,
              alignItems: 'center',
              fontFamily: fonts.ui,
              opacity: p,
              transform: `scale(${0.85 + 0.15 * p})`,
            }}
          >
            <svg width={96} height={96}>
              <circle cx={48} cy={48} r={40} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={8} />
              <circle cx={48} cy={48} r={40} fill="none" stroke={C.teal} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${ring * 251} 251`} transform="rotate(-90 48 48)" />
              <text x={48} y={58} textAnchor="middle" fontFamily={fonts.ui} fontWeight={800} fontSize={28} fill={C.text}>{Math.round(ring * 100)}%</text>
            </svg>
            <div>
              <div style={{fontWeight: 800, fontSize: 32, color: C.text}}>{j.role}</div>
              <div style={{fontSize: 28, color: C.dim}}>{j.co} · remoto</div>
            </div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1620, textAlign: 'center', fontFamily: fonts.ui}}>
        <div style={{fontSize: 34, color: C.dim}}>Escaneando {count.toLocaleString('es-ES')} ofertas</div>
        <div style={{fontSize: 64, fontWeight: 800, color: C.text, marginTop: 8}}>
          <span style={{backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{found}</span> encajan contigo
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- 5 · un clic
const ClickScene: React.FC<{f: number}> = ({f}) => {
  const CLICK = 510;
  const d = f - S.click;
  const enter = lerp(d, [0, 16], [0, 1]);
  const press = f >= CLICK && f < CLICK + 6 ? 1 : lerp(f, [CLICK - 3, CLICK], [0, 1]) * (f < CLICK ? 1 : 0);
  const cur = lerp(f, [S.click + 6, CLICK - 2], [0, 1], io);
  const sent = Math.round(lerp(f, [CLICK + 2, CLICK + 40], [0, 37], io));
  const done = f >= CLICK + 42;
  return (
    <AbsoluteFill>
      <Headline f={f} at={S.click + 4} y={170} size={110} lines={['Un clic.', ['Todas enviadas.', 'grad']]} out={S.ext - 10} />
      {/* partículas: 37 correos que salen disparados */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 37}, (_, i) => {
          const t0 = CLICK + 2 + i * 0.9;
          const p = lerp(f, [t0, t0 + 26], [0, 1], Easing.out(Easing.quad));
          if (p <= 0 || p >= 1) return null;
          const a = -Math.PI / 2 + (random(`pa${i}`) - 0.5) * 2.4;
          const dist = 600 + random(`pd${i}`) * 700;
          const x = 540 + Math.cos(a) * dist * p;
          const y = 1080 + Math.sin(a) * dist * p + 300 * p * p;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${a * 57 + 90}) scale(${1 - p * 0.5})`} opacity={1 - p}>
              <rect x={-22} y={-15} width={44} height={30} rx={5} fill={i % 3 === 0 ? C.amber : i % 3 === 1 ? C.pink : '#fff'} />
              <path d="M -20 -12 L 0 3 L 20 -12" fill="none" stroke="#140A05" strokeWidth={3} />
            </g>
          );
        })}
      </svg>
      {/* botón de cristal */}
      <div style={{position: 'absolute', left: 140, right: 140, top: 990, height: 190, transform: `scale(${(0.8 + 0.2 * enter) * (1 - press * 0.05)})`, opacity: enter}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 95, background: done ? C.teal : GRAD, boxShadow: `0 ${30 - press * 20}px ${80 - press * 40}px rgba(255,94,138,.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, fontFamily: fonts.ui, fontWeight: 800, fontSize: 64, color: '#140A05'}}>
          {done ? (
            <>
              <svg width={60} height={60} viewBox="0 0 60 60">
                <path d="M 12 32 L 25 44 L 48 16" fill="none" stroke="#140A05" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              37 enviadas
            </>
          ) : f >= CLICK ? (
            `Enviando… ${sent}/37`
          ) : (
            'Enviar a 37 empresas'
          )}
        </div>
        <div style={{position: 'absolute', inset: 0, borderRadius: 95, background: 'linear-gradient(180deg, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 50%)'}} />
      </div>
      {/* cursor */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${900 - 300 * cur} ${1500 - 380 * cur}) scale(${1 - press * 0.12})`} opacity={lerp(f, [CLICK + 10, CLICK + 18], [1, 0])}>
          <path d="M 0 0 L 0 76 L 20 58 L 34 92 L 50 85 L 36 52 L 62 52 Z" fill="#fff" stroke="#000" strokeWidth={4} strokeLinejoin="round" />
        </g>
        {f >= CLICK && f < CLICK + 14 && <circle cx={600} cy={1120} r={20 + (f - CLICK) * 14} fill="none" stroke="#fff" strokeWidth={4} opacity={1 - (f - CLICK) / 14} />}
      </svg>
      <Sub f={f} at={CLICK + 20} y={1300}>
        Sin copiar y pegar. Sin rellenar el mismo formulario 37 veces.
      </Sub>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- 6 · extensión
const TABS = ['linkedin.com/jobs', 'infojobs.net', 'indeed.es'];
const ExtScene: React.FC<{f: number}> = ({f}) => {
  const d = f - S.ext;
  const enter = lerp(d, [0, 20], [0, 1]);
  const tab = f >= 722 ? 2 : f >= 692 ? 1 : 0;
  const popup = lerp(f, [642, 652], [0, 1]);
  const applying = f >= 660;
  const applied = (t: number) => (t === 0 ? f >= 676 : t === 1 ? f >= 702 : f >= 732);
  const roles = ['Product Designer · Nubo', 'Diseñador/a UX · Kora Labs', 'UI Designer · Malva'];
  return (
    <AbsoluteFill>
      <Headline f={f} at={S.ext + 4} y={150} size={92} lines={['Y aplica por ti', ['en LinkedIn y más.', 'grad']]} out={S.end - 8} />
      <div style={{position: 'absolute', left: 60, top: 520, width: 960, height: 1080, transform: `perspective(2600px) rotateX(${10 - 6 * enter}deg) rotateY(${12 - 8 * enter + Math.sin(f / 40) * 2}deg) translateY(${(1 - enter) * 300}px)`, opacity: enter}}>
        <div style={{...glass({borderRadius: 34, background: 'rgba(18,20,30,.85)'}), position: 'absolute', inset: 0, overflow: 'hidden', fontFamily: fonts.ui}}>
          {/* pestañas */}
          <div style={{display: 'flex', gap: 8, padding: '18px 18px 0', background: 'rgba(255,255,255,.04)'}}>
            {TABS.map((t, i) => (
              <div key={t} style={{padding: '14px 22px', borderRadius: '16px 16px 0 0', background: i === tab ? 'rgba(255,255,255,.10)' : 'transparent', color: i === tab ? C.text : C.dim, fontSize: 26}}>
                {t}
              </div>
            ))}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderBottom: `1.5px solid ${C.edge}`}}>
            <div style={{flex: 1, padding: '14px 24px', borderRadius: 30, background: 'rgba(255,255,255,.06)', color: C.dim, fontSize: 26}}>https://{TABS[tab]}</div>
            <div style={{transform: `scale(${f >= 640 && f < 646 ? 0.9 : 1})`}}>
              <Icon size={60} />
            </div>
          </div>
          {/* oferta */}
          <div style={{padding: 40}}>
            <div style={{width: 120, height: 120, borderRadius: 28, background: ['#3B82F6', '#22D3B6', '#A855F7'][tab]}} />
            <div style={{marginTop: 26, fontSize: 52, fontWeight: 800, color: C.text}}>{roles[tab]}</div>
            <div style={{marginTop: 8, fontSize: 30, color: C.dim}}>Remoto · Jornada completa · 32–38k</div>
            {[0.9, 0.75, 0.82, 0.6].map((w, i) => (
              <div key={i} style={{marginTop: i ? 16 : 40, height: 18, width: `${w * 100}%`, borderRadius: 9, background: 'rgba(255,255,255,.08)'}} />
            ))}
            <div style={{marginTop: 50, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '22px 40px', borderRadius: 40, background: applied(tab) ? C.teal : 'rgba(255,255,255,.12)', color: applied(tab) ? '#04110E' : C.text, fontSize: 36, fontWeight: 800}}>
              {applied(tab) ? '✓ Solicitud enviada' : 'Solicitar'}
            </div>
          </div>
        </div>
        {/* ventana emergente de la extensión */}
        <div style={{...glass({borderRadius: 30, background: 'rgba(28,30,42,.95)', padding: 30}), position: 'absolute', right: 30, top: 600, width: 430, fontFamily: fonts.ui, transformOrigin: '90% 0%', transform: `scale(${popup})`, opacity: popup * lerp(f, [745, 750], [1, 0])}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <Icon size={48} />
            <div style={{fontWeight: 800, fontSize: 32, color: C.text}}>knok</div>
          </div>
          <div style={{marginTop: 18, fontSize: 26, color: C.dim}}>Perfil, CV y carta listos para esta oferta.</div>
          <div style={{marginTop: 22, padding: '18px 0', textAlign: 'center', borderRadius: 26, background: GRAD, color: '#140A05', fontWeight: 800, fontSize: 30, transform: `scale(${f >= 660 && f < 665 ? 0.95 : 1})`}}>
            {applying ? `Aplicadas: ${[0, 1, 2].filter(applied).length}` : 'Aplicar con knok'}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- 7 · final
const EndScene: React.FC<{f: number}> = ({f}) => {
  const d = f - S.end;
  const p = lerp(d, [0, 22], [0, 1]);
  const shine = lerp(d, [20, 50], [-40, 140], io);
  const orbit = lerp(d, [0, 26], [1, 0], io);
  const items = ['Correo a medida', 'Ofertas que encajan', 'Un clic', 'Extensión Chrome'];
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      {items.map((it, i) => {
        const a = (i / items.length) * Math.PI * 2 + d * 0.03;
        const r = 520 * orbit + 0;
        return (
          <div key={it} style={{...glass({borderRadius: 26, padding: '16px 24px'}), position: 'absolute', left: 540 + Math.cos(a) * r - 170, top: 900 + Math.sin(a) * r * 1.3 - 30, width: 340, textAlign: 'center', fontFamily: fonts.ui, fontWeight: 600, fontSize: 30, color: C.text, opacity: orbit * 0.9}}>
            {it}
          </div>
        );
      })}
      <div style={{position: 'absolute', width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,94,138,.28) 0%, rgba(0,0,0,0) 60%)', transform: `scale(${0.5 + 0.6 * p})`}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, transform: `scale(${0.6 + 0.4 * p})`, opacity: p}}>
        <div style={{...glass({borderRadius: 64, width: 210, height: 210}), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative'}}>
          <Icon size={150} />
          <div style={{position: 'absolute', top: -50, bottom: -50, width: 60, left: `${shine}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.65), rgba(255,255,255,0))', transform: 'rotate(18deg)'}} />
        </div>
        <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 200, letterSpacing: -12, color: C.text, lineHeight: 1}}>knok</div>
      </div>
      <Headline f={f} at={S.end + 26} y={1340} size={76} lines={[['Llama distinto.', 'grad']]} />
      <Sub f={f} at={S.end + 44} y={1460}>
        Correo a medida · Ofertas que encajan
        <br />
        Un clic · Extensión para Chrome
      </Sub>
    </AbsoluteFill>
  );
};

/** Vídeo 6 — «Lanzamiento»: película de producto premium, sin voces. */
export const Launch: React.FC = () => {
  const f = useCurrentFrame();
  const fadeIn = (at: number) => lerp(f, [at, at + 6], [0, 1]);
  const scene =
    f < S.logo ? <Hook f={f} /> : f < S.mail ? <LogoReveal f={f} /> : f < S.scan ? <MailScene f={f} /> : f < S.click ? <ScanScene f={f} /> : f < S.ext ? <ClickScene f={f} /> : f < S.end ? <ExtScene f={f} /> : <EndScene f={f} />;
  const cuts = [S.logo, S.mail, S.scan, S.click, S.ext, S.end];
  const last = cuts.filter((c) => f >= c).pop() ?? 0;
  const flash = f >= S.logo && f < S.logo + 5 ? 1 - (f - S.logo) / 5 : 0;
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Aurora f={f} />
      <AbsoluteFill style={{opacity: last ? fadeIn(last) : 1}}>{scene}</AbsoluteFill>
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash * 0.8}} />}
      {/* grano fino */}
      <AbsoluteFill style={{opacity: 0.05, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id="lgrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 50} />
          </filter>
          <rect width="100%" height="100%" filter="url(#lgrain)" />
        </svg>
      </AbsoluteFill>
      <Audio src={staticFile('launch-mix.wav')} />
    </AbsoluteFill>
  );
};
