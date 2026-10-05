import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from '../theme';
import EV from './events.json';
import {Bust, Hands, Mood} from './People';

export const SPLIT_TOTAL = EV.end;

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const io = Easing.bezier(0.65, 0, 0.35, 1);
const lerp = (f: number, i: number[], o: number[], e: (x: number) => number = ease) => interpolate(f, i, o, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const seg = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a)));

const UI = {text: '#1C1E24', muted: '#7A7F8C', line: '#E4E6EB', blue: '#2F6BFF', red: '#E5484D', green: '#2FB574', amber: '#FFB21E', coral: '#FF6B57'};
const HALF = 960;
const PH = {x: 340, y: 300, w: 400, h: 640};

// ------------------------------------------------------------------ móvil genérico
const Phone: React.FC<{children: React.ReactNode; dx?: number; dy?: number; rot?: number; glow?: number}> = ({children, dx = 0, dy = 0, rot = 0, glow = 0}) => (
  <div style={{position: 'absolute', left: PH.x + dx, top: PH.y + dy, width: PH.w, height: PH.h, transform: `rotate(${rot}deg)`}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 56, background: '#111216', boxShadow: `0 30px 60px rgba(0,0,0,.35)${glow ? `, 0 0 ${80 * glow}px rgba(255,178,30,${0.8 * glow})` : ''}`}} />
    <div style={{position: 'absolute', inset: 14, borderRadius: 44, overflow: 'hidden', background: '#fff', fontFamily: fonts.ui}}>
      <div style={{height: 46, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', fontSize: 18, fontWeight: 700, color: UI.text}}>
        <span>9:41</span>
        <span>●●● ▮</span>
      </div>
      <div style={{position: 'absolute', top: 46, left: 0, right: 0, bottom: 0}}>{children}</div>
    </div>
    <div style={{position: 'absolute', left: PH.w / 2 - 50, top: 22, width: 100, height: 28, borderRadius: 14, background: '#111216'}} />
  </div>
);

const Banner: React.FC<{from: string; msg: string; color?: string; style?: React.CSSProperties; hl?: boolean}> = ({from, msg, color = '#C9CDD6', style, hl}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 18, background: hl ? '#FFF4DE' : '#fff', boxShadow: hl ? '0 0 0 3px #FFB21E, 0 10px 24px rgba(255,178,30,.35)' : '0 8px 18px rgba(0,0,0,.14)', fontFamily: fonts.ui, ...style}}>
    <div style={{width: 40, height: 40, borderRadius: 12, background: color, flexShrink: 0}} />
    <div style={{minWidth: 0}}>
      <div style={{fontWeight: 800, fontSize: 18, color: UI.text}}>{from}</div>
      <div style={{fontSize: 17, color: UI.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260}}>{msg}</div>
    </div>
  </div>
);

// ------------------------------------------------------------------ pantallas de Lucía
const TEMPLATE = 'Estimado/a responsable:\nMe interesa el puesto ofertado en su empresa. Adjunto mi CV.\nUn saludo.';
const PERSONAL = 'Hola, Marta:\nVi el rediseño de vuestra app de reservas y me encantó cómo simplificasteis el pago. Me gustaría contaros cómo lo mejoraría con test de usuarios.';

const LuciaScreen: React.FC<{f: number}> = ({f}) => {
  const sp0 = EV.spam[0];
  const sp1 = EV.spam[1];
  const sent = Math.min(50, Math.floor(lerp(f, [sp0, sp1 - 10], [0, 50], (x) => Math.pow(x, 0.7))));
  const press = f >= sp0 && f < sp1 && (f - sp0) % 8 < 3;
  if (f >= EV.ring[0]) {
    const answered = f >= EV.answer;
    return (
      <div style={{position: 'absolute', inset: 0, background: answered ? 'linear-gradient(180deg, #1E6B4F, #123C2E)' : 'linear-gradient(180deg, #2B2D52, #15162C)', color: '#fff', textAlign: 'center', paddingTop: 70}}>
        <div style={{fontSize: 20, opacity: 0.75}}>{answered ? '00:0' + Math.min(9, Math.floor((f - EV.answer) / 30) + 1) : 'Llamada entrante…'}</div>
        <div style={{width: 120, height: 120, borderRadius: 60, background: '#23A99A', margin: '26px auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 56}}>M</div>
        <div style={{fontWeight: 800, fontSize: 32}}>Marta</div>
        <div style={{fontSize: 22, opacity: 0.75}}>Estudio Faro</div>
        {!answered && (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 60, display: 'flex', justifyContent: 'space-around'}}>
            <div style={{width: 84, height: 84, borderRadius: 42, background: UI.red}} />
            <div style={{width: 84, height: 84, borderRadius: 42, background: UI.green, transform: `scale(${1 + 0.1 * Math.sin(f * 0.6)})`}} />
          </div>
        )}
      </div>
    );
  }
  const personal = f >= EV.deleteTpl[0];
  const delP = seg(f, EV.deleteTpl[0], EV.deleteTpl[1]);
  const typed = Math.floor(lerp(f, EV.typing, [0, PERSONAL.length], (x) => x));
  const kGlow = f >= EV.kTap && f < EV.kTap + 24;
  const sentOne = f >= EV.send;
  const rejected = f >= EV.rejectIn && f < EV.deleteTpl[0];
  return (
    <div style={{position: 'absolute', inset: 0, padding: '10px 22px', fontFamily: fonts.ui}}>
      <div style={{fontSize: 26, fontWeight: 800, color: UI.text}}>Nuevo correo</div>
      <div style={{fontSize: 17, color: UI.muted, marginTop: 6, paddingBottom: 8, borderBottom: `2px solid ${UI.line}`}}>
        Para: {personal ? <b style={{color: UI.text}}>Marta · Estudio Faro</b> : <span>{sent > 0 ? `${sent} empresas` : 'empresas@…'}</span>}
      </div>
      <div style={{position: 'relative', marginTop: 10, fontSize: 19, lineHeight: 1.35, color: UI.text, whiteSpace: 'pre-wrap', minHeight: 300}}>
        {!personal || delP < 1 ? (
          <span style={{opacity: 1 - delP, textDecoration: personal ? 'line-through' : 'none', color: personal ? UI.red : UI.text}}>{TEMPLATE}</span>
        ) : (
          <span>
            {PERSONAL.slice(0, typed)}
            {typed < PERSONAL.length && <span style={{color: UI.blue}}>|</span>}
          </span>
        )}
        {personal && delP < 1 && <div style={{position: 'absolute', left: 0, top: -6, padding: '4px 10px', borderRadius: 8, background: UI.red, color: '#fff', fontSize: 15, fontWeight: 700, opacity: delP > 0 ? 1 : 0}}>Plantilla eliminada</div>}
      </div>
      {personal && f >= EV.typing[0] && f < EV.send && (
        <div style={{position: 'absolute', left: 22, bottom: 92, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 14, background: kGlow ? '#FFF4DE' : '#F4F5F7', boxShadow: kGlow ? '0 0 0 3px #FFB21E' : 'none', fontSize: 15, color: UI.text}}>
          <div style={{width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#FFB21E,#FF6B57)', color: '#1A0E05', fontFamily: fonts.logo, fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>k</div>
          sobre su empresa: app de reservas
        </div>
      )}
      <div style={{position: 'absolute', left: 22, right: 22, bottom: 24, height: 56, borderRadius: 28, background: sentOne ? UI.green : UI.blue, color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${press || (f >= EV.send - 2 && f < EV.send + 3) ? 0.94 : 1})`}}>
        {sentOne ? 'Enviado ✓' : f >= sp0 && f < EV.archive[0] ? `Enviar a todas (${sent})` : 'Enviar'}
      </div>
      {rejected && (
        <div style={{position: 'absolute', left: 10, right: 10, top: 6, transform: `translateY(${lerp(f, [EV.rejectIn, EV.rejectIn + 8], [-80, 0])}px)`}}>
          <Banner from="Equipo de Selección" msg="Gracias por tu interés, pero…" />
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ pantallas de Marta
const MartaScreen: React.FC<{f: number}> = ({f}) => {
  const badge = f < EV.spam[0] ? 2 : f < EV.archive[0] ? Math.floor(lerp(f, EV.spam, [2, 312], (x) => Math.pow(x, 1.4))) : 0;
  const archived = f >= EV.archive[0];
  const open = seg(f, EV.open[0], EV.open[1]);
  const special = f >= EV.special;
  const calling = f >= EV.callTap;
  if (calling) {
    const answered = f >= EV.answer;
    return (
      <div style={{position: 'absolute', inset: 0, background: answered ? 'linear-gradient(180deg, #1E6B4F, #123C2E)' : 'linear-gradient(180deg, #23A99A, #116B61)', color: '#fff', textAlign: 'center', paddingTop: 70, fontFamily: fonts.ui}}>
        <div style={{fontSize: 20, opacity: 0.8}}>{answered ? 'Conectado' : 'Llamando…'}</div>
        <div style={{width: 120, height: 120, borderRadius: 60, background: '#FFB21E', margin: '26px auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 56, color: '#1A0E05'}}>L</div>
        <div style={{fontWeight: 800, fontSize: 32}}>Lucía Martín</div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, padding: '10px 18px', fontFamily: fonts.ui}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontSize: 28, fontWeight: 800, color: UI.text}}>Candidaturas</div>
        {badge > 0 && <div style={{minWidth: 44, height: 36, padding: '0 10px', borderRadius: 18, background: UI.red, color: '#fff', fontWeight: 800, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{badge}</div>}
      </div>
      {!archived ? (
        <div style={{marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
          {Array.from({length: 7}, (_, i) => (
            <Banner key={i} from={`Candidato/a ${Math.max(1, badge - i)}`} msg="Me apasiona aportar valor a un equipo…" />
          ))}
        </div>
      ) : open < 1 ? (
        <div style={{marginTop: 12}}>
          {!special && <div style={{marginTop: 120, textAlign: 'center', color: UI.muted, fontSize: 20}}>Todo archivado ✓</div>}
          {special && (
            <div style={{transform: `scale(${lerp(f, [EV.special, EV.special + 8], [0.6, 1], Easing.bezier(0.34, 1.56, 0.64, 1))})`, opacity: 1 - open}}>
              <Banner from="Lucía Martín" msg="Hola, Marta: vi el rediseño de vuestra app…" color="#FFB21E" hl />
            </div>
          )}
        </div>
      ) : (
        <div style={{marginTop: 10, fontSize: 19, lineHeight: 1.4, color: UI.text}}>
          <div style={{fontWeight: 800, fontSize: 22}}>Lucía Martín</div>
          <div style={{color: UI.muted, fontSize: 16, marginBottom: 10}}>Product Designer</div>
          <div style={{whiteSpace: 'pre-wrap'}}>{PERSONAL}</div>
          <div style={{position: 'absolute', left: 18, right: 18, bottom: 24, height: 56, borderRadius: 28, background: UI.green, color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${f >= EV.callTap - 4 && f < EV.callTap ? 0.94 : 1})`, opacity: lerp(f, [EV.smile, EV.smile + 10], [0, 1])}}>📞 Llamar</div>
        </div>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ fondos
const LuciaRoom: React.FC<{f: number}> = ({f}) => {
  const rainOn = seg(f, EV.rain[0], EV.rain[0] + 20) * (1 - seg(f, EV.rain[1] - 20, EV.rain[1]));
  const warm = seg(f, EV.special, EV.special + 40);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${warm ? '#4A3F6B' : '#2B2D52'} 0%, ${warm ? '#7A5A6E' : '#3B3F70'} 100%)`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 60, top: 80, width: 230, height: 300, borderRadius: 14, background: 'linear-gradient(180deg, #141633, #2C2F5E)', boxShadow: 'inset 0 0 0 12px #5A5E92'}}>
        <div style={{position: 'absolute', left: 150, top: 40, width: 36, height: 36, borderRadius: 18, background: '#F7E7B0', opacity: 0.9}} />
        {rainOn > 0 &&
          Array.from({length: 26}, (_, i) => {
            const x = 16 + random(`rx${i}`) * 200;
            const y = ((random(`ry${i}`) * 300 + f * (18 + random(`rs${i}`) * 10)) % 300) + 10;
            return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3, height: 26, borderRadius: 2, background: 'rgba(190,210,255,.6)', opacity: rainOn}} />;
          })}
      </div>
      <div style={{position: 'absolute', right: 70, top: 110, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,140,.55) 0%, rgba(255,214,140,0) 70%)'}} />
      <div style={{position: 'absolute', right: 120, top: 150, width: 60, height: 80, borderRadius: '30px 30px 6px 6px', background: '#FFD58C'}} />
      <div style={{position: 'absolute', right: 146, top: 230, width: 8, height: 120, background: '#B9B4D8'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'rgba(0,0,0,.18)'}} />
    </AbsoluteFill>
  );
};

const MartaOffice: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #EAF3F1 0%, #DDEBE7 100%)', overflow: 'hidden'}}>
    <div style={{position: 'absolute', right: 60, top: 70, width: 260, height: 320, borderRadius: 14, background: 'linear-gradient(160deg, #FFFFFF, #CDE9F5)', boxShadow: 'inset 0 0 0 12px #B9D3CE'}} />
    {[0, 1, 2].map((r) => (
      <div key={r} style={{position: 'absolute', left: 50, top: 110 + r * 110, width: 220, height: 12, background: '#B48A64'}}>
        {Array.from({length: 5}, (_, i) => (
          <div key={i} style={{position: 'absolute', left: 10 + i * 38, bottom: 12, width: 26, height: 60 + ((i * 17 + r * 11) % 30), background: ['#E07A5F', '#3D6BFF', '#F2CC8F', '#81B29A', '#8E6CC8'][(i + r) % 5], borderRadius: 3}} />
        ))}
      </div>
    ))}
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 120, background: 'rgba(0,0,0,.05)'}} />
  </AbsoluteFill>
);

const Tag: React.FC<{text: string; f: number; dark?: boolean}> = ({text, f, dark}) => (
  <div style={{position: 'absolute', left: 30, top: 26, padding: '6px 18px', borderRadius: 12, background: dark ? 'rgba(255,255,255,.12)' : 'rgba(30,27,46,.08)', fontFamily: fonts.hand, fontWeight: 600, fontSize: 40, color: dark ? '#fff' : '#1E1B2E', transform: `rotate(-3deg) translateY(${lerp(f, [4, 16], [-80, 0])}px)`}}>{text}</div>
);

// ------------------------------------------------------------------ composición
export const Split: React.FC = () => {
  const f = useCurrentFrame();
  const merge = seg(f, EV.merge[0], EV.merge[1]);

  // estados de ánimo
  const luciaMood: Mood =
    f >= EV.jump[0] ? 'excited' : f >= EV.ring[0] ? 'surprised' : f >= EV.send ? 'focus' : f >= EV.deleteTpl[0] ? 'focus' : f >= EV.slump[0] ? 'sad' : f >= EV.spam[0] ? 'neutral' : 'neutral';
  const martaMood: Mood = f >= EV.smile ? 'happy' : f >= EV.special ? 'surprised' : f >= EV.archive[1] ? 'neutral' : f >= EV.overflow[0] ? 'overwhelmed' : 'neutral';
  const slump = lerp(f, EV.slump, [0, 40]) * (1 - seg(f, EV.deleteTpl[0] - 10, EV.deleteTpl[0]));
  const jump = f >= EV.jump[0] && f < EV.jump[1] + 6 ? Math.abs(Math.sin((f - EV.jump[0]) * 0.32)) * -60 : 0;
  const ringShake = f >= EV.ring[0] && f < EV.answer ? Math.sin(f * 2.6) * 5 : 0;
  const blink = (seed: string) => (Math.floor(f / 3 + random(seed) * 30) % 40 === 0 ? 1 : 0);

  // sobres del spam (de arriba abajo)
  const sends = Array.from({length: EV.spamSends}, (_, i) => EV.spam[0] + (EV.spam[1] - EV.spam[0] - 12) * Math.pow(i / (EV.spamSends - 1), 0.7));

  // montón de notificaciones que desborda el móvil de Marta
  const pileN = f < EV.overflow[0] ? 0 : Math.floor(lerp(f, EV.overflow, [0, 70], (x) => Math.pow(x, 0.8)));
  const sweep = seg(f, EV.archive[0], EV.archive[1]);

  const top = (
    <AbsoluteFill style={{top: 0, height: HALF, overflow: 'hidden', transform: `translateY(${-merge * 120}px)`}}>
      <LuciaRoom f={f} />
      <svg width={1080} height={HALF} style={{position: 'absolute'}}>
        <Bust kind="lucia" x={540} y={200 + slump + jump} s={0.95} mood={luciaMood} blink={blink('l')} tilt={slump * 0.2} />
      </svg>
      <Phone dy={slump * 0.6 + jump} dx={ringShake} glow={f >= EV.send && f < EV.send + 12 ? 1 - (f - EV.send) / 12 : 0}>
        <LuciaScreen f={f} />
      </Phone>
      <svg width={1080} height={HALF} style={{position: 'absolute'}}>
        <Hands x={540 + ringShake} y={700 + slump * 0.6 + jump} w={PH.w} skin="#F2C2A0" />
      </svg>
      <Tag text="Lucía · busca trabajo" f={f} dark />
    </AbsoluteFill>
  );

  const bottom = (
    <AbsoluteFill style={{top: HALF, height: HALF, overflow: 'hidden', transform: `translateY(${merge * 120}px)`}}>
      <MartaOffice />
      <svg width={1080} height={HALF} style={{position: 'absolute'}}>
        <Bust kind="marta" x={540} y={200} s={0.95} mood={martaMood} blink={blink('m')} />
        {f >= EV.heart && f < EV.heart + 30 && (
          <path transform={`translate(700 ${80 - (f - EV.heart) * 3}) scale(${lerp(f, [EV.heart, EV.heart + 6], [0.3, 1.4])})`} d="M 0 18 C -40 -6, -34 -40, -12 -38 C -4 -37, 0 -30, 0 -26 C 0 -30, 4 -37, 12 -38 C 34 -40, 40 -6, 0 18 Z" fill="#FF6B57" opacity={1 - seg(f, EV.heart + 18, EV.heart + 30)} />
        )}
      </svg>
      <Phone glow={f >= EV.special && f < EV.open[0] ? 0.6 + 0.4 * Math.sin(f * 0.4) : 0}>
        <MartaScreen f={f} />
      </Phone>
      <svg width={1080} height={HALF} style={{position: 'absolute'}}>
        <Hands x={540} y={700} w={PH.w} skin="#E6B08C" />
      </svg>
      {/* las notificaciones se salen del móvil y la entierran */}
      {Array.from({length: pileN}, (_, i) => {
        const born = EV.overflow[0] + (i / 70) * (EV.overflow[1] - EV.overflow[0]);
        const p = seg(f, born, born + 10);
        const tx = 40 + random(`px${i}`) * 700;
        const ty = 900 - Math.floor(i / 7) * 50 - random(`py${i}`) * 24;
        const x = 340 + (tx - 340) * p;
        const y = 300 + (ty - 300) * p - Math.sin(p * Math.PI) * 160;
        return (
          <div key={i} style={{position: 'absolute', left: x - sweep * 1400, top: y, width: 320, transform: `rotate(${(random(`pr${i}`) - 0.5) * 30 + sweep * -40}deg)`}}>
            <Banner from="Candidato/a" msg="Me apasiona aportar valor…" />
          </div>
        );
      })}
      {f >= EV.archive[0] && f < EV.archive[1] + 6 && <div style={{position: 'absolute', left: 0, right: 0, top: 380, height: 300, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))', transform: `translateX(${lerp(f, EV.archive, [900, -1100])}px)`}} />}
      <Tag text="Marta · selecciona personal" f={f} />
    </AbsoluteFill>
  );

  // sobres que cruzan la línea
  const planes = sends.map((t0, i) => {
    const p = seg(f, t0, t0 + 14);
    if (p <= 0 || p >= 1) return null;
    const x = 540 + Math.sin(i * 1.7) * 60 * Math.sin(p * Math.PI);
    const y = 880 + p * 260;
    return (
      <svg key={i} width={70} height={48} viewBox="0 0 100 68" style={{position: 'absolute', left: x - 35, top: y - 24, transform: `rotate(${Math.sin(i) * 20}deg)`}}>
        <rect x={3} y={3} width={94} height={62} rx={8} fill="#fff" stroke="#9AA0AC" strokeWidth={5} />
        <path d="M 6 8 L 50 40 L 94 8" fill="none" stroke="#9AA0AC" strokeWidth={5} />
      </svg>
    );
  });

  // el correo de verdad: viaja despacio y brilla
  const fl = lerp(f, EV.flight, [0, 1], io);
  const special = f >= EV.flight[0] && f < EV.flight[1] + 2 && (
    <div style={{position: 'absolute', left: 540 - 60 + Math.sin(fl * Math.PI * 2) * 80, top: 860 + fl * 420 - 40, width: 120, height: 82, filter: 'drop-shadow(0 0 24px #FFB21E)'}}>
      <svg width={120} height={82} viewBox="0 0 100 68">
        <rect x={3} y={3} width={94} height={62} rx={8} fill="#FFF4DE" stroke="#FFB21E" strokeWidth={5} />
        <path d="M 6 8 L 50 40 L 94 8" fill="none" stroke="#FFB21E" strokeWidth={5} />
      </svg>
    </div>
  );

  // la llamada sube
  const cl = lerp(f, EV.callLine, [0, 1], io);
  const call = f >= EV.callLine[0] && f < EV.ring[0] + 10 && (
    <div style={{position: 'absolute', left: 536, top: 1260 - cl * 640, width: 8, height: 200, borderRadius: 4, background: 'linear-gradient(180deg, #FFB21E, rgba(255,178,30,0))', boxShadow: '0 0 30px #FFB21E', opacity: 1 - seg(f, EV.ring[0], EV.ring[0] + 10)}} />
  );

  return (
    <AbsoluteFill style={{background: '#111'}}>
      {top}
      {bottom}
      {/* línea divisoria */}
      <div style={{position: 'absolute', left: 0, right: 0, top: HALF - 4, height: 8, background: '#fff', opacity: 1 - merge, boxShadow: '0 0 20px rgba(0,0,0,.3)'}} />
      {planes}
      {special}
      {call}

      {/* final: se unen */}
      {f >= EV.merge[0] && (
        <AbsoluteFill style={{opacity: merge, background: 'linear-gradient(180deg, #FFE9C7 0%, #FFF4E3 55%, #F7D9B5 100%)'}}>
          <svg width={1080} height={1920} style={{position: 'absolute'}}>
            <Bust kind="lucia" x={300} y={1250} s={0.95} mood="excited" blink={blink('l2')} tilt={6} look={1} />
            <Bust kind="marta" x={790} y={1250} s={0.95} mood="happy" tilt={-6} look={-1} />
            <path d="M 420 1300 Q 545 1180 670 1300" stroke="#FFB21E" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - seg(f, EV.merge[0] + 10, EV.merge[1] + 10)} />
          </svg>
          <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', fontFamily: fonts.ui, fontWeight: 800, fontSize: 104, lineHeight: 1.02, letterSpacing: -4, color: '#1E1B2E'}}>
            <div style={{opacity: seg(f, EV.tagline, EV.tagline + 10), transform: `translateY(${(1 - seg(f, EV.tagline, EV.tagline + 12)) * 30}px)`}}>Escribe a personas.</div>
            <div style={{opacity: seg(f, EV.tagline + 12, EV.tagline + 22), color: '#FF6B57', transform: `translateY(${(1 - seg(f, EV.tagline + 12, EV.tagline + 24)) * 30}px)`}}>No a filtros.</div>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: seg(f, EV.logo, EV.logo + 8), transform: `scale(${lerp(f, [EV.logo, EV.logo + 10], [0.7, 1], Easing.bezier(0.34, 1.56, 0.64, 1))})`}}>
            <div style={{width: 110, height: 110, borderRadius: 30, background: 'linear-gradient(135deg,#FFB21E,#FF6B57)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.logo, fontWeight: 900, fontSize: 70, color: '#1A0E05'}}>k</div>
            <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 130, letterSpacing: -7, color: '#1E1B2E'}}>knok</div>
          </div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile('split-mix.wav')} />
    </AbsoluteFill>
  );
};
