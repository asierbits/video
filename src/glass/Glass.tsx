import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Character} from '../components/Character';
import {fonts} from '../theme';
import EV from './events.json';

export const GLASS_TOTAL = EV.end;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const lerp = (f: number, i: number[], o: number[], e: (x: number) => number = ease) => interpolate(f, i, o, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const seg = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a)));

const UI = {bg: '#F6F7F9', text: '#1C1E24', muted: '#7A7F8C', line: '#E4E6EB', blue: '#2F6BFF', red: '#E5484D'};
const WARM = {amber: '#FFB21E', coral: '#FF6B57', cream: '#FFF4E3'};

// ------------------------------------------------------------------ texto del correo
const BODY = 'Estimado/a candidato/a:\n\nGracias por tu interés en nuestra empresa. Tras revisar tu perfil con atención, lamentamos comunicarte que ';
const LOOP = 'lamentamos comunicarte que ';
const GLITCH = '█▓▒░#@%&$';

const typedText = (f: number) => {
  const base = Math.floor(lerp(f, [EV.typeStart, EV.loopStart], [0, BODY.length], (x) => x));
  let txt = BODY.slice(0, base);
  if (f >= EV.loopStart) {
    const loops = Math.floor(Math.pow((f - EV.loopStart) / 6, 1.45));
    let extra = '';
    for (let i = 0; i < loops; i++) {
      let piece = LOOP;
      if (i > 6 && random(`g${i}`) > 0.6) {
        const k = Math.floor(random(`k${i}`) * piece.length);
        piece = piece.slice(0, k) + GLITCH[Math.floor(random(`c${i}`) * GLITCH.length)] + piece.slice(k + 1);
      }
      extra += piece;
    }
    txt += extra;
  }
  return txt;
};

const StatusBar: React.FC = () => (
  <div style={{height: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 60px 18px', fontFamily: fonts.ui, fontWeight: 600, fontSize: 34, color: UI.text}}>
    <span>9:41</span>
    <span style={{display: 'flex', gap: 14, alignItems: 'center'}}>
      <span style={{fontSize: 28}}>●●●</span>
      <span style={{width: 56, height: 26, border: `3px solid ${UI.text}`, borderRadius: 7, display: 'inline-block', position: 'relative'}}>
        <span style={{position: 'absolute', left: 3, top: 3, bottom: 3, width: 26, background: UI.text, borderRadius: 3}} />
      </span>
    </span>
  </div>
);

const MailRow: React.FC<{from: string; subject: string; preview: string; unread?: boolean; time: string}> = ({from, subject, preview, unread, time}) => (
  <div style={{display: 'flex', gap: 26, padding: '30px 50px', borderBottom: `2px solid ${UI.line}`, fontFamily: fonts.ui}}>
    <div style={{width: 18, paddingTop: 18}}>{unread && <div style={{width: 18, height: 18, borderRadius: 9, background: UI.blue}} />}</div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 36, fontWeight: unread ? 800 : 600, color: UI.text}}>
        <span>{from}</span>
        <span style={{fontSize: 28, fontWeight: 400, color: UI.muted}}>{time}</span>
      </div>
      <div style={{fontSize: 32, fontWeight: unread ? 700 : 400, color: UI.text, marginTop: 4}}>{subject}</div>
      <div style={{fontSize: 30, color: UI.muted, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{preview}</div>
    </div>
  </div>
);

/** La app de correo (lo que "es" el anuncio al principio). fr = frame congelado a partir del atasco. */
const MailApp: React.FC<{fr: number}> = ({fr}) => {
  const open = lerp(fr, [EV.tapOpen, EV.tapOpen + 10], [0, 1], io);
  const txt = typedText(fr);
  const lines = txt.length / 30;
  const scroll = Math.max(0, lines * 50 - 900);
  const stack = fr >= 130 ? Math.floor(Math.pow((fr - 130) / 3, 1.3)) : 0;
  const badge = fr >= EV.loopStart ? Math.min(999, Math.floor(1 + Math.pow((fr - EV.loopStart) / 2.2, 1.9))) : 1;
  return (
    <AbsoluteFill style={{background: UI.bg, overflow: 'hidden'}}>
      <StatusBar />
      {/* bandeja */}
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, transform: `translateX(${-open * 30}%)`, opacity: 1 - open * 0.6}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 50px 30px'}}>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 76, color: UI.text}}>Recibidos</div>
          <div style={{minWidth: 64, height: 64, padding: '0 18px', borderRadius: 32, background: UI.red, color: '#fff', fontFamily: fonts.ui, fontWeight: 800, fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{badge}</div>
        </div>
        <MailRow from="Equipo de Selección" subject="Tu candidatura" preview="Gracias por tu interés en nuestra empresa…" unread time="9:40" />
        <MailRow from="Portal de Empleo" subject="10 ofertas nuevas para ti" preview="Mira las ofertas que hemos encontrado…" time="ayer" />
        <MailRow from="Newsletter" subject="Consejos para tu CV" preview="Cinco formas de destacar…" time="lun" />
        <MailRow from="Equipo de Selección" subject="Tu candidatura" preview="Gracias por tu interés, pero…" time="dom" />
        <MailRow from="RR. HH. Grupo Atlas" subject="Actualización de tu proceso" preview="Lamentamos informarte de que…" time="sáb" />
        <MailRow from="Portal de Empleo" subject="Tu perfil ha sido visto 0 veces" preview="Completa tu perfil para…" time="vie" />
        <MailRow from="Equipo de Selección" subject="Tu candidatura" preview="Hemos decidido continuar con otros…" time="jue" />
        <MailRow from="Talento · Banco Sol" subject="Gracias por aplicar" preview="Tu candidatura no ha sido seleccionada…" time="mié" />
        <MailRow from="no-reply" subject="Re: Diseñador/a UX" preview="Este buzón no admite respuestas…" time="mar" />
      </div>
      {/* toque */}
      {fr >= EV.tapOpen - 4 && fr < EV.tapOpen + 8 && (
        <div style={{position: 'absolute', left: 540 - 60, top: 470 - 60, width: 120, height: 120, borderRadius: 60, background: 'rgba(47,107,255,.25)', transform: `scale(${lerp(fr, [EV.tapOpen - 4, EV.tapOpen + 8], [0.4, 1.6])})`, opacity: 1 - seg(fr, EV.tapOpen, EV.tapOpen + 8)}} />
      )}
      {/* correo abierto */}
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, bottom: 0, background: '#fff', transform: `translateX(${(1 - open) * 100}%)`, fontFamily: fonts.ui}}>
        <div style={{padding: '20px 50px', fontSize: 34, color: UI.blue}}>‹ Recibidos</div>
        <div style={{padding: '10px 50px 30px', borderBottom: `2px solid ${UI.line}`}}>
          <div style={{fontSize: 58, fontWeight: 800, color: UI.text}}>Tu candidatura</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 24}}>
            <div style={{width: 76, height: 76, borderRadius: 38, background: '#C9CDD6'}} />
            <div>
              <div style={{fontSize: 32, fontWeight: 700, color: UI.text}}>Equipo de Selección</div>
              <div style={{fontSize: 26, color: UI.muted}}>no-reply · respuesta automática</div>
            </div>
          </div>
        </div>
        <div style={{position: 'absolute', top: 330, left: 50, right: 50, bottom: 0, overflow: 'hidden'}}>
          <div style={{transform: `translateY(${-scroll}px)`, fontSize: 40, lineHeight: 1.45, color: UI.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
            {txt}
            {fr < EV.freeze && Math.floor(fr / 8) % 2 === 0 ? <span style={{color: UI.blue}}>|</span> : null}
          </div>
        </div>
      </div>
      {/* avalancha de clones del rechazo */}
      {Array.from({length: Math.min(stack, 60)}, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 60 + (random(`sx${i}`) - 0.5) * 120,
            top: 200 + i * 26 + (random(`sy${i}`) - 0.5) * 60,
            width: 960,
            padding: '26px 30px',
            borderRadius: 30,
            background: 'rgba(255,255,255,.97)',
            boxShadow: '0 16px 30px rgba(0,0,0,.12)',
            transform: `rotate(${(random(`sr${i}`) - 0.5) * 8}deg)`,
            fontFamily: fonts.ui,
          }}
        >
          <div style={{fontSize: 30, fontWeight: 800, color: UI.text}}>Equipo de Selección</div>
          <div style={{fontSize: 30, color: UI.muted}}>Gracias por tu interés, pero…</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ grietas
type Crack = {x: number; y: number; paths: string[]};
const makeCrack = (x: number, y: number, seed: string, rays = 9, len = 520): Crack => {
  const paths: string[] = [];
  for (let r = 0; r < rays; r++) {
    let a = (r / rays) * Math.PI * 2 + random(`${seed}a${r}`) * 0.5;
    let px = x;
    let py = y;
    let d = `M ${x} ${y}`;
    const steps = 6 + Math.floor(random(`${seed}s${r}`) * 5);
    for (let s = 0; s < steps; s++) {
      a += (random(`${seed}t${r}${s}`) - 0.5) * 0.7;
      const l = (len / steps) * (0.6 + random(`${seed}l${r}${s}`) * 0.8);
      px += Math.cos(a) * l;
      py += Math.sin(a) * l;
      d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      if (random(`${seed}b${r}${s}`) > 0.75) {
        const ba = a + (random(`${seed}ba${r}${s}`) > 0.5 ? 0.8 : -0.8);
        d += ` M ${px.toFixed(1)} ${py.toFixed(1)} L ${(px + Math.cos(ba) * l * 0.7).toFixed(1)} ${(py + Math.sin(ba) * l * 0.7).toFixed(1)} M ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }
    paths.push(d);
  }
  // anillos concéntricos
  for (let c = 1; c <= 2; c++) {
    const rr = 40 * c + random(`${seed}r${c}`) * 20;
    let d = '';
    for (let k = 0; k <= 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const j = rr * (0.8 + random(`${seed}j${c}${k}`) * 0.4);
      d += `${k ? 'L' : 'M'} ${(x + Math.cos(a) * j).toFixed(1)} ${(y + Math.sin(a) * j).toFixed(1)} `;
    }
    paths.push(d);
  }
  return {x, y, paths};
};
const CRACKS = [makeCrack(560, 980, 'c1', 10, 560), makeCrack(430, 640, 'c2', 8, 460)];

const Knuckles: React.FC<{x: number; y: number; o: number}> = ({x, y, o}) => (
  <g opacity={o}>
    <ellipse cx={x} cy={y} rx={150} ry={95} fill="rgba(140,150,170,.28)" style={{filter: 'blur(22px)'}} />
    {[-54, -18, 18, 54].map((dx, i) => (
      <g key={i}>
        <ellipse cx={x + dx} cy={y + Math.abs(dx) * 0.3} rx={22} ry={30} fill="rgba(90,95,110,.45)" style={{filter: 'blur(4px)'}} />
        <ellipse cx={x + dx - 4} cy={y + Math.abs(dx) * 0.3 - 6} rx={10} ry={13} fill="rgba(255,255,255,.5)" style={{filter: 'blur(3px)'}} />
      </g>
    ))}
  </g>
);

// ------------------------------------------------------------------ mundo cálido de detrás
const Room: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, #FFE9C7 0%, ${WARM.cream} 55%, #F7D9B5 100%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', right: -120, top: 120, width: 520, height: 760, borderRadius: 30, background: 'linear-gradient(160deg, #FFF8EA, #FFD58C)', boxShadow: 'inset 0 0 0 18px #E9B97A'}} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{position: 'absolute', right: 40 + i * 140, top: 0, width: 90, height: 1920, background: 'rgba(255,214,140,.25)', transform: 'skewX(-18deg)', transformOrigin: 'top', opacity: 0.6 + 0.2 * Math.sin(f / 20 + i)}} />
    ))}
    <div style={{position: 'absolute', left: 90, top: 300, width: 220, height: 280, borderRadius: 14, background: '#fff', boxShadow: '0 0 0 14px #C9935C, 0 20px 40px rgba(120,70,20,.2)'}}>
      <div style={{position: 'absolute', inset: 26, borderRadius: 8, background: 'linear-gradient(160deg, #9ED9C3, #FFB4A2)'}} />
    </div>
    <div style={{position: 'absolute', left: 60, bottom: 230, width: 160, height: 190, borderRadius: '20px 20px 30px 30px', background: '#E07A5F'}} />
    {[-40, 0, 40, -20, 20].map((dx, i) => (
      <div key={i} style={{position: 'absolute', left: 140 + dx, bottom: 400, width: 70, height: 220, borderRadius: '50%', background: i % 2 ? '#5DA271' : '#7BBF8C', transform: `rotate(${dx * 0.8 + Math.sin(f / 25 + i) * 3}deg)`, transformOrigin: 'bottom center'}} />
    ))}
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 250, background: '#E8C49A'}} />
  </AbsoluteFill>
);

// ------------------------------------------------------------------ escritura en el cristal
const Scribble: React.FC<{f: number; at: number[]; x: number; y: number; size: number; text: string; rot?: number; color?: string; fade?: number}> = ({f, at, x, y, size, text, rot = -3, color = '#2B2236', fade = 1}) => {
  const p = seg(f, at[0], at[1]);
  if (p <= 0) return null;
  const lines = text.split('\n');
  // la escritura avanza línea a línea; el rotulador sigue la punta
  const lp = p * lines.length;
  const li = Math.min(lines.length - 1, Math.floor(lp));
  const within = Math.min(1, lp - li);
  const longest = Math.max(...lines.map((l) => l.length));
  const tipX = (lines[li].length / longest) * within * (longest * size * 0.62);
  const tipY = li * size * 1.05 + size * 0.75;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, opacity: fade}}>
      {lines.map((ln, i) => {
        const q = i < li ? 1 : i === li ? within : 0;
        return (
          <div key={i} style={{fontFamily: fonts.marker, fontSize: size, lineHeight: 1.05, color, whiteSpace: 'pre', clipPath: `inset(-20px ${(1 - q) * 100}% -20px -20px)`, textShadow: '0 3px 0 rgba(255,255,255,.6)'}}>
            {ln}
          </div>
        );
      })}
      {p < 1 && (
        <div style={{position: 'absolute', left: tipX, top: tipY, transform: 'translate(-10px, -100%) rotate(28deg)', transformOrigin: 'bottom left'}}>
          <div style={{width: 34, height: 26, background: color, borderRadius: '4px 4px 0 0', marginLeft: 0}} />
          <div style={{width: 46, height: 200, marginLeft: -6, borderRadius: 14, background: 'linear-gradient(90deg, #FF8A5C, #FF6B57)', boxShadow: '0 10px 20px rgba(0,0,0,.2)'}} />
        </div>
      )}
    </div>
  );
};

const REPLIES = [
  {from: 'Estudio Faro', msg: '¡Hola! ¿Hablamos el jueves?'},
  {from: 'Nubo', msg: 'Nos ha encantado tu carta 🙌'},
  {from: 'Kora Labs', msg: '¿Te va bien una entrevista?'},
];

/** «El anuncio que te rechaza»: el anuncio se rompe y detrás hay una persona. */
export const Glass: React.FC = () => {
  const f = useCurrentFrame();
  const fr = Math.min(f, EV.freeze - 1);

  // golpes: temblor
  let shake = 0;
  EV.knocks.forEach((k, i) => {
    if (f >= k) shake += (6 + i * 5) * Math.exp(-(f - k) / 3) * Math.sin((f - k) * 2.4);
  });
  // atasco: aberración cromática creciente
  const jam = f >= EV.loopStart && f < EV.freeze ? seg(f, EV.loopStart, EV.freeze) : 0;
  const jx = jam > 0 ? (random(`jx${f}`) - 0.5) * 24 * jam : 0;

  const rip = lerp(f, EV.rip, [0, 1], Easing.bezier(0.5, 0, 0.2, 1));
  const ripStarted = f >= EV.rip[0];
  const leak = seg(f, EV.leak, EV.rip[0]);
  const crackP = (i: number) => seg(f, EV.crackAt[i], EV.crackAt[i] + 4);

  // personaje
  const waveArm = f >= EV.wave && f < EV.write1[0] ? 150 + 25 * Math.sin((f - EV.wave) * 0.6) : null;
  const writing = [EV.write1, EV.write2, EV.write3].find(([a, b]) => f >= a - 4 && f < b + 4);
  const writeArm = writing ? 140 + 14 * Math.sin(f * 1.3) : null;
  const crumpling = f >= EV.crumple[0] && f < EV.throw;
  const throwing = f >= EV.throw && f < EV.throw + 10;
  const armR = waveArm ?? writeArm ?? (crumpling ? 80 : throwing ? lerp(f, [EV.throw, EV.throw + 6], [80, 170]) : f >= EV.sticker + 6 ? 165 : 18);
  const armL = crumpling ? 80 : 14;
  const charIn = lerp(f, [EV.rip[0] + 20, EV.rip[1] + 10], [380, 0]);
  const wipe = seg(f, EV.write3[0] - 14, EV.write3[0] - 2);

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {/* detrás del cristal */}
      {ripStarted && (
        <AbsoluteFill>
          <Room f={f} />
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <Character x={540} y={2330 + charIn} scale={5.0} look="color" armR={armR} armL={armL} headTilt={Math.sin(f / 22) * 3} wind={0.2 + 0.1 * Math.sin(f / 10)} blink={Math.floor(f / 4) % 40 === 0 ? 1 : 0} />
            {crumpling && <circle cx={540 + 230} cy={2330 + charIn - 5 * 142 - lerp(f, EV.crumple, [0, 60])} r={lerp(f, EV.crumple, [110, 52])} fill="#fff" stroke="#C9CDD6" strokeWidth={4} />}
            {throwing && <circle cx={lerp(f, [EV.throw, EV.throw + 10], [770, 1300])} cy={lerp(f, [EV.throw, EV.throw + 10], [1500, 700])} r={52} fill="#fff" stroke="#C9CDD6" strokeWidth={4} />}
          </svg>
          {/* luz que entra al rasgarse */}
          <AbsoluteFill style={{background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,214,140,${0.9 * (1 - seg(f, EV.rip[1], EV.rip[1] + 20))}) 0%, rgba(255,214,140,0) 70%)`}} />
        </AbsoluteFill>
      )}

      {/* el anuncio-correo, que se agrieta y se rasga */}
      {rip < 1 &&
        (ripStarted ? [-1, 1] : [0]).map((side) => {
          const tearPts = Array.from({length: 25}, (_, i) => [540 + (random(`tp${i}`) - 0.5) * 70, (i / 24) * 1920] as [number, number]);
          const poly = side === -1 ? `polygon(0 0, ${tearPts.map(([x, y]) => `${x}px ${y}px`).join(', ')}, 0 1920px)` : side === 1 ? `polygon(1080px 0, ${tearPts.map(([x, y]) => `${x}px ${y}px`).join(', ')}, 1080px 1920px)` : undefined;
          return (
            <AbsoluteFill
              key={side}
              style={{
                clipPath: poly,
                transform: side ? `translateX(${side * rip * 760}px) rotate(${side * rip * 9}deg)` : `translate(${shake + jx}px, ${shake * 0.4}px)`,
                transformOrigin: side < 0 ? '0% 100%' : '100% 100%',
                filter: jam > 0 ? `drop-shadow(${8 * jam}px 0 0 rgba(255,0,60,.5)) drop-shadow(${-8 * jam}px 0 0 rgba(0,200,255,.5))` : undefined,
              }}
            >
              <MailApp fr={fr} />
              {/* marcas y grietas sobre el correo */}
              <svg width={1080} height={1920} style={{position: 'absolute'}}>
                {EV.knocks.slice(0, 3).map((k, i) => (
                  <Knuckles key={k} x={[540, 600, 500][i]} y={[1000, 900, 1080][i]} o={seg(f, k, k + 3) * 0.9} />
                ))}
                {CRACKS.map((c, i) => (
                  <g key={i} opacity={crackP(i)}>
                    {c.paths.map((d, j) => (
                      <path key={j} d={d} fill="none" stroke={leak > 0 ? WARM.amber : 'rgba(255,255,255,.95)'} strokeWidth={leak > 0 ? 5 + 6 * leak : 4} strokeLinecap="round" strokeLinejoin="round" style={{filter: leak > 0 ? `drop-shadow(0 0 ${20 * leak}px ${WARM.amber})` : 'drop-shadow(0 0 2px rgba(0,0,0,.5))'}} />
                    ))}
                    {c.paths.map((d, j) => (
                      <path key={`s${j}`} d={d} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={1.5} transform="translate(2 2)" />
                    ))}
                  </g>
                ))}
              </svg>
              {/* luz cálida que se cuela */}
              {leak > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at 540px 980px, rgba(255,178,30,${0.45 * leak}) 0%, rgba(255,178,30,0) ${30 + 30 * leak}%)`}} />}
              {/* borde de papel al rasgarse */}
              {side !== 0 && (
                <svg width={1080} height={1920} style={{position: 'absolute'}}>
                  <polyline points={tearPts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#fff" strokeWidth={18} />
                </svg>
              )}
            </AbsoluteFill>
          );
        })}

      {/* tiras de papel volando */}
      {ripStarted &&
        f < EV.rip[1] + 20 &&
        Array.from({length: 18}, (_, i) => {
          const p = seg(f, EV.rip[0] + i * 1.5, EV.rip[0] + 34 + i * 1.5);
          if (p <= 0 || p >= 1) return null;
          const y0 = random(`py${i}`) * 1920;
          return (
            <div key={i} style={{position: 'absolute', left: 540 + (random(`pd${i}`) - 0.5) * 900 * p, top: y0 - p * 400, width: 40, height: 14, background: '#fff', transform: `rotate(${p * 720 * (random(`pr${i}`) - 0.5)}deg)`, opacity: 1 - p}} />
          );
        })}

      {/* ---------- el cristal (delante): escritura, respuestas y pegatina ---------- */}
      <Scribble f={f} at={EV.write1} x={110} y={420} size={110} text={'Hola. Soy\nuna persona.'} rot={-4} fade={1 - wipe} />
      <Scribble f={f} at={EV.write2} x={150} y={760} size={96} text={'No una plantilla.'} rot={3} color="#E0533D" fade={1 - wipe} />
      {wipe > 0 && wipe < 1 && <div style={{position: 'absolute', left: -200 + wipe * 1400, top: 380, width: 240, height: 640, background: 'rgba(255,255,255,.25)', filter: 'blur(30px)'}} />}

      {REPLIES.map((r, i) => {
        const at = EV.replies[i];
        const p = lerp(f, [at, at + 10], [0, 1]);
        if (p <= 0) return null;
        return (
          <div
            key={r.from}
            style={{
              position: 'absolute',
              left: 60,
              right: 60,
              top: 120 + i * 150,
              padding: '24px 30px',
              borderRadius: 34,
              background: 'rgba(255,255,255,.92)',
              boxShadow: '0 20px 40px rgba(120,70,20,.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              fontFamily: fonts.ui,
              transform: `translateY(${(1 - p) * -120}px) scale(${0.9 + 0.1 * p})`,
              opacity: p,
            }}
          >
            <div style={{width: 72, height: 72, borderRadius: 20, background: ['#3D6BFF', '#23A99A', '#8E6CC8'][i], flexShrink: 0}} />
            <div style={{flex: 1}}>
              <div style={{fontWeight: 800, fontSize: 30, color: UI.text}}>{r.from}</div>
              <div style={{fontSize: 32, color: UI.text}}>{r.msg}</div>
            </div>
            <div style={{fontSize: 26, color: UI.muted}}>ahora</div>
          </div>
        );
      })}

      <Scribble f={f} at={EV.write3} x={90} y={600} size={124} text={'Llama a la\npuerta correcta.'} rot={-3} />

      {f >= EV.sticker && (
        <div
          style={{
            position: 'absolute',
            left: 540 - 230,
            top: 950,
            width: 460,
            padding: '26px 0',
            borderRadius: 40,
            background: `linear-gradient(135deg, ${WARM.amber}, ${WARM.coral})`,
            boxShadow: '0 16px 30px rgba(120,60,10,.3), inset 0 0 0 6px rgba(255,255,255,.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            transform: `rotate(-6deg) scale(${lerp(f, [EV.sticker, EV.sticker + 4, EV.sticker + 9], [1.8, 0.92, 1])})`,
          }}
        >
          <div style={{width: 78, height: 78, borderRadius: 22, background: '#1A0E05', color: WARM.amber, fontFamily: fonts.logo, fontWeight: 900, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>k</div>
          <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 96, letterSpacing: -5, color: '#1A0E05'}}>knok</div>
        </div>
      )}

      {/* reflejo del cristal, siempre */}
      <AbsoluteFill style={{background: 'linear-gradient(125deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 62%, rgba(255,255,255,.06) 75%, rgba(255,255,255,0) 85%)', pointerEvents: 'none'}} />
      <Audio src={staticFile('glass-mix.wav')} />
    </AbsoluteFill>
  );
};
