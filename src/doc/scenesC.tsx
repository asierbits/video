import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {fonts} from '../theme';
import {Abs, Browser, Card, Check, Chip, Envelope, K, KIcon, Person, Pop, SceneProps, Title, io, lerp, seg} from './kit';

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>;
const GRAD = `linear-gradient(100deg, ${K.amber}, ${K.coral})`;
const gradText: React.CSSProperties = {backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

export const Logo: React.FC<{size?: number; color?: string}> = ({size = 160, color = '#fff'}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: size * 0.22}}>
    <KIcon size={size * 0.9} />
    <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: size, letterSpacing: -size * 0.06, color, lineHeight: 1}}>knok</div>
  </div>
);

// =============================================================== 5 · KNOK
export const E1: React.FC<SceneProps> = ({lt}) => {
  const p = lerp(lt, [0, 0.6], [0, 1]);
  return (
    <Stage>
      <Abs x={960} y={500} center style={{opacity: p, transform: `translate(-50%, -50%) scale(${1.3 - 0.3 * p})`, filter: `blur(${(1 - p) * 20}px)`}}>
        <Logo size={200} />
      </Abs>
    </Stage>
  );
};

const OFFERS = [
  {r: 'Product Designer', c: 'Estudio Faro', m: 96, why: ['remoto', 'Figma', '34k']},
  {r: 'Diseñador/a UX', c: 'Nubo', m: 92, why: ['Madrid', 'investigación', '32k']},
  {r: 'UI Designer', c: 'Kora Labs', m: 89, why: ['remoto', 'junior', '30k']},
];

export const E2: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <Abs x={140} y={110}>
      <Title lt={lt} size={64} color="#fff">
        Ofertas que <span style={gradText}>encajan</span>, y por qué
      </Title>
    </Abs>
    <div style={{position: 'absolute', left: 140, top: 280, display: 'flex', flexDirection: 'column', gap: 26}}>
      {OFFERS.map((o, i) => {
        const at = 0.6 + i * 0.9;
        const ring = lerp(lt, [at + 0.2, at + 1.2], [0, o.m / 100], io);
        return (
          <Pop key={o.r} at={at} lt={lt} y={20}>
            <Card dark style={{width: 1640, padding: '24px 34px', display: 'flex', alignItems: 'center', gap: 30}}>
              <svg width={110} height={110}>
                <circle cx={55} cy={55} r={46} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={10} />
                <circle cx={55} cy={55} r={46} fill="none" stroke={K.green} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${ring * 289} 289`} transform="rotate(-90 55 55)" />
                <text x={55} y={66} textAnchor="middle" fontFamily={fonts.ui} fontWeight={800} fontSize={30} fill="#fff">
                  {Math.round(ring * 100)}%
                </text>
              </svg>
              <div style={{width: 560}}>
                <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: '#fff'}}>{o.r}</div>
                <div style={{fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.6)'}}>{o.c}</div>
              </div>
              <div style={{display: 'flex', gap: 14}}>
                {o.why.map((w, j) => (
                  <Pop key={w} at={at + 0.9 + j * 0.2} lt={lt}>
                    <Chip dark>
                      <Check size={28} /> {w}
                    </Chip>
                  </Pop>
                ))}
              </div>
            </Card>
          </Pop>
        );
      })}
    </div>
  </Stage>
);

const SWAPS = [
  {at: 1.2, a: 'Estimado/a responsable de selección:', b: 'Hola, Marta:'},
  {at: 2.6, a: 'Me interesa el puesto ofertado en su empresa.', b: 'Me encantó el rediseño de vuestra app de reservas.'},
  {at: 4.0, a: 'Quedo a la espera de su respuesta.', b: '¿Te va bien que hablemos el jueves?'},
];
export const E3: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <Abs x={140} y={110}>
      <Title lt={lt} size={64} color="#fff">
        Un correo <span style={gradText}>distinto</span> para cada empresa
      </Title>
    </Abs>
    <Abs x={140} y={270}>
      <Pop at={0.2} lt={lt}>
        <Card dark style={{width: 1100, padding: 44, fontFamily: fonts.ui}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26}}>
            <KIcon size={56} />
            <div style={{color: '#fff', fontWeight: 800, fontSize: 34}}>Para: Marta · Estudio Faro</div>
          </div>
          {SWAPS.map((s) => {
            const done = lt >= s.at + 0.3;
            return (
              <div key={s.at} style={{fontSize: 34, lineHeight: 1.5, padding: '6px 12px', margin: '0 -12px 8px', borderRadius: 12, background: done ? `rgba(255,178,30,${0.18 * (1 - seg(lt, s.at + 1.2, s.at + 2.4))})` : 'transparent', color: done ? '#fff' : 'rgba(255,255,255,.45)', textDecoration: !done && lt > s.at - 0.3 ? 'line-through' : 'none'}}>
                {done ? s.b : s.a}
              </div>
            );
          })}
        </Card>
      </Pop>
    </Abs>
    <div style={{position: 'absolute', left: 1300, top: 280, display: 'flex', flexDirection: 'column', gap: 20}}>
      <Pop at={4.6} lt={lt}>
        <Chip dark style={{fontSize: 32}}>✦ tu tono</Chip>
      </Pop>
      <Pop at={4.9} lt={lt}>
        <Chip dark style={{fontSize: 32}}>✦ tu historia</Chip>
      </Pop>
      <Pop at={5.6} lt={lt}>
        <div style={{display: 'flex', gap: 14, marginTop: 20}}>
          <div style={{padding: '18px 30px', borderRadius: 30, border: '2px solid rgba(255,255,255,.3)', fontFamily: fonts.ui, fontWeight: 700, fontSize: 30, color: '#fff'}}>Editar</div>
          <div style={{padding: '18px 30px', borderRadius: 30, background: GRAD, fontFamily: fonts.ui, fontWeight: 800, fontSize: 30, color: '#1A0E05'}}>Revisado ✓</div>
        </div>
      </Pop>
    </div>
  </Stage>
);

export const E4: React.FC<SceneProps> = ({lt}) => {
  const CLICK = 0.9;
  const sent = Math.round(lerp(lt, [CLICK + 0.1, CLICK + 1.6], [0, 12], io));
  const done = lt > CLICK + 1.7;
  return (
    <Stage>
      {Array.from({length: 24}, (_, i) => {
        const at = CLICK + 0.05 + i * 0.05;
        const p = seg(lt, at, at + 1.1);
        if (p <= 0 || p >= 1) return null;
        const a = -Math.PI / 2 + (random(`ea${i}`) - 0.5) * 2.4;
        const dist = 400 + random(`ed${i}`) * 500;
        return (
          <Abs key={i} x={960 + Math.cos(a) * dist * p - 35} y={560 + Math.sin(a) * dist * p + 260 * p * p} style={{opacity: 1 - p, transform: `rotate(${a * 57 + 90}deg)`}}>
            <Envelope w={70} color={i % 2 ? K.amber : '#fff'} stroke="#1A0E05" />
          </Abs>
        );
      })}
      <Abs x={960} y={560} center>
        <div style={{padding: '44px 90px', borderRadius: 90, background: done ? K.green : GRAD, fontFamily: fonts.ui, fontWeight: 800, fontSize: 64, color: '#1A0E05', transform: `scale(${lt > CLICK && lt < CLICK + 0.15 ? 0.94 : 1})`, boxShadow: '0 30px 70px rgba(255,107,87,.35)'}}>
          {done ? '✓ 12 enviadas' : lt > CLICK ? `Enviando… ${sent}/12` : 'Enviar a 12 empresas'}
        </div>
      </Abs>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(${lerp(lt, [0, CLICK], [1400, 1080], io)} ${lerp(lt, [0, CLICK], [900, 600], io)})`} opacity={1 - seg(lt, CLICK + 0.4, CLICK + 0.7)}>
          <path d="M 0 0 L 0 56 L 14 43 L 25 66 L 36 61 L 26 39 L 46 39 Z" fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
        </g>
      </svg>
      <Abs x={960} y={200} center>
        <Title lt={lt} size={72} color="#fff">
          Un solo clic.
        </Title>
      </Abs>
    </Stage>
  );
};

export const E5: React.FC<SceneProps> = ({lt}) => {
  const tab = lt > 5.0 ? 2 : lt > 3.0 ? 1 : 0;
  const tabs = ['linkedin.com/jobs', 'infojobs.net', 'indeed.es'];
  const roles = ['Product Designer · Nubo', 'Diseñador/a UX · Kora Labs', 'UI Designer · Malva'];
  const appliedAt = [2.3, 4.3, 6.2];
  return (
    <Stage>
      <Abs x={140} y={90}>
        <Title lt={lt} size={60} color="#fff">
          Extensión para Chrome: <span style={gradText}>aplica donde ya buscas</span>
        </Title>
      </Abs>
      <Abs x={140} y={230}>
        <Pop at={0.2} lt={lt}>
          <Browser dark w={1640} h={690} url={`https://${tabs[tab]}`} tabs={tabs} active={tab} ext={<KIcon size={44} />}>
            <div style={{padding: 50, fontFamily: fonts.ui}}>
              <div style={{width: 110, height: 110, borderRadius: 26, background: [K.blue, K.teal, '#8E6CC8'][tab]}} />
              <div style={{marginTop: 26, fontSize: 52, fontWeight: 800, color: '#fff'}}>{roles[tab]}</div>
              <div style={{marginTop: 8, fontSize: 30, color: 'rgba(255,255,255,.55)'}}>Remoto · Jornada completa</div>
              {[0.8, 0.65, 0.72].map((w, i) => (
                <div key={i} style={{marginTop: i ? 16 : 40, height: 18, width: `${w * 60}%`, borderRadius: 9, background: 'rgba(255,255,255,.1)'}} />
              ))}
              <div style={{marginTop: 46, display: 'inline-block', padding: '20px 40px', borderRadius: 40, fontSize: 32, fontWeight: 800, background: lt > appliedAt[tab] ? K.green : 'rgba(255,255,255,.12)', color: '#fff'}}>
                {lt > appliedAt[tab] ? '✓ Solicitud enviada' : 'Solicitar'}
              </div>
            </div>
            <div style={{position: 'absolute', right: 30, top: 30, width: 460, padding: 30, borderRadius: 24, background: '#202331', border: '1.5px solid rgba(255,255,255,.15)', transformOrigin: '90% 0', transform: `scale(${lerp(lt, [0.9, 1.3], [0, 1])})`, fontFamily: fonts.ui}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <KIcon size={48} />
                <div style={{fontWeight: 800, fontSize: 32, color: '#fff'}}>knok</div>
              </div>
              <div style={{marginTop: 16, fontSize: 26, color: 'rgba(255,255,255,.6)'}}>Perfil, CV y carta listos para esta oferta.</div>
              <div style={{marginTop: 20, textAlign: 'center', padding: '16px 0', borderRadius: 24, background: GRAD, fontWeight: 800, fontSize: 28, color: '#1A0E05'}}>
                {`Aplicadas: ${appliedAt.filter((a) => lt > a).length}`}
              </div>
            </div>
          </Browser>
        </Pop>
      </Abs>
    </Stage>
  );
};

export const E6: React.FC<SceneProps> = ({lt}) => {
  const chores = ['copiar y pegar', 'rellenar formularios', 'buscar en 10 webs', 'adaptar cada carta'];
  return (
    <Stage>
      <Abs x={140} y={110}>
        <Title lt={lt} size={64} color="#fff">
          No te sustituye. <span style={gradText}>Te quita lo repetitivo.</span>
        </Title>
      </Abs>
      {chores.map((c, i) => {
        const at = 0.8 + i * 0.4;
        const p = seg(lt, at + 1.4, at + 2.2);
        return (
          <Abs key={c} x={160 + p * 420} y={330 + i * 110 + p * (200 - i * 70)} style={{opacity: 1 - p, transform: `scale(${1 - 0.6 * p})`}}>
            <Pop at={at} lt={lt}>
              <Chip dark style={{fontSize: 32}}>{c}</Chip>
            </Pop>
          </Abs>
        );
      })}
      <Abs x={700} y={560} center>
        <Pop at={0.4} lt={lt}>
          <KIcon size={150} />
        </Pop>
      </Abs>
      <Abs x={1180} y={330}>
        <Pop at={3.6} lt={lt}>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 30}}>
            <Person size={180} color={K.blue} scarf mood="happy" />
            <Card style={{width: 420, padding: 30, fontFamily: fonts.ui}}>
              <div style={{fontWeight: 800, fontSize: 30, color: K.ink}}>Preparar la entrevista</div>
              {['Por qué esta empresa', 'Mis 3 mejores proyectos', 'Preguntas para ellos'].map((q, i) => (
                <div key={q} style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, fontSize: 26, color: K.ink}}>
                  <Check size={30} p={seg(lt, 4.4 + i * 0.4, 4.8 + i * 0.4)} /> {q}
                </div>
              ))}
            </Card>
          </div>
        </Pop>
      </Abs>
    </Stage>
  );
};

export const E7: React.FC<SceneProps> = ({lt}) => {
  const rows = ['Estudio Faro · Product Designer', 'Nubo · Diseñador/a UX', 'Kora Labs · UI Designer'];
  return (
    <Stage>
      <Abs x={960} y={150} center>
        <Title lt={lt} size={76} color="#fff">
          Tú decides <span style={gradText}>qué se envía</span>.
        </Title>
      </Abs>
      <div style={{position: 'absolute', left: 360, top: 300, display: 'flex', flexDirection: 'column', gap: 24}}>
        {rows.map((r, i) => {
          const ok = lt > 1.2 + i * 0.9;
          return (
            <Pop key={r} at={0.3 + i * 0.2} lt={lt}>
              <Card dark style={{width: 1200, padding: '24px 34px', display: 'flex', alignItems: 'center', gap: 24}}>
                <Envelope w={64} color="#fff" stroke="#1A0E05" />
                <div style={{flex: 1, fontFamily: fonts.ui, fontWeight: 700, fontSize: 36, color: '#fff'}}>{r}</div>
                <div style={{padding: '14px 28px', borderRadius: 30, fontFamily: fonts.ui, fontWeight: 800, fontSize: 28, background: ok ? K.green : 'rgba(255,255,255,.12)', color: '#fff'}}>{ok ? '✓ Aprobado' : 'Aprobar'}</div>
              </Card>
            </Pop>
          );
        })}
      </div>
    </Stage>
  );
};

// =============================================================== CIERRE
export const R1: React.FC<SceneProps> = ({lt, d}) => {
  const items = ['Menos y mejor', 'Personaliza de verdad', 'Apunta bien', 'Haz seguimiento', 'Deja lo repetitivo a una herramienta'];
  const at = [1.2, 2.3, 3.6, 4.5, 5.6].map((x) => (x * d) / 7);
  return (
    <Stage>
      <Abs x={960} y={140} center>
        <Title lt={lt} size={72}>
          Resumen rápido
        </Title>
      </Abs>
      <div style={{position: 'absolute', left: 520, top: 260, display: 'flex', flexDirection: 'column', gap: 22}}>
        {items.map((it, i) => (
          <Pop key={it} at={at[i] - 0.3} lt={lt}>
            <div style={{display: 'flex', alignItems: 'center', gap: 26, fontFamily: fonts.ui, fontWeight: 700, fontSize: 52, color: K.ink}}>
              <Check size={64} p={seg(lt, at[i], at[i] + 0.4)} /> {it}
            </div>
          </Pop>
        ))}
      </div>
    </Stage>
  );
};

export const F1: React.FC<SceneProps> = ({lt}) => {
  const open = lerp(lt, [3.2, 4.2], [0, 1], io);
  const walk = lerp(lt, [4.0, 6.8], [0, 1], (x) => x);
  return (
    <Stage>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={800} width={1920} height={280} fill="#E3D6C2" />
        {[0, 1, 2, 3, 4].map((i) => {
          const x = 180 + i * 330;
          const me = i === 2;
          return (
            <g key={i}>
              <rect x={x} y={300} width={240} height={500} rx={10} fill={me ? '#FFE3A8' : '#D8CCB8'} />
              {me && open > 0 && <rect x={x} y={300} width={240} height={500} rx={10} fill={K.amber} opacity={0.6 * open} />}
              <g transform={`translate(${x} 300) scale(${me ? 1 - 0.85 * open : 1} 1)`}>
                <rect x={0} y={0} width={240} height={500} rx={10} fill={me ? K.coral : '#B9AC97'} />
                <circle cx={205} cy={260} r={11} fill="#F3D27A" />
              </g>
              {me && open > 0 && <polygon points={`${x},800 ${x + 240},800 ${x + 340},1080 ${x - 100},1080`} fill={K.amber} opacity={0.25 * open} />}
            </g>
          );
        })}
      </svg>
      <Abs x={lerp(walk, [0, 1], [-200, 820])} y={560 - 40 * walk} style={{opacity: 1 - seg(walk, 0.85, 1), transform: `scale(${1 - 0.2 * walk})`}}>
        <Person size={170} color={K.blue} scarf mood="happy" />
      </Abs>
      <Abs x={960} y={150} center>
        <Title lt={lt} at={4.6} size={68}>
          La puerta <span style={{color: K.coral}}>correcta</span>. Y hacerlo bien.
        </Title>
      </Abs>
    </Stage>
  );
};

export const F2: React.FC<SceneProps> = ({lt}) => {
  const sub = lt > 3.3;
  return (
    <Stage>
      <Abs x={560} y={480} center>
        <Pop at={0.2} lt={lt}>
          <Card style={{width: 620, padding: 44, textAlign: 'center', fontFamily: fonts.ui}}>
            <svg width={120} height={120} viewBox="0 0 120 120">
              <circle cx={90} cy={26} r={18} fill={K.blue} />
              <circle cx={30} cy={60} r={18} fill={K.blue} />
              <circle cx={90} cy={94} r={18} fill={K.blue} />
              <path d="M 30 60 L 90 26 M 30 60 L 90 94" stroke={K.blue} strokeWidth={8} />
            </svg>
            <div style={{fontWeight: 800, fontSize: 40, color: K.ink, marginTop: 20}}>Compártelo</div>
            <div style={{fontSize: 30, color: K.muted, marginTop: 8}}>con alguien que esté buscando trabajo</div>
          </Card>
        </Pop>
      </Abs>
      <Abs x={1360} y={480} center>
        <Pop at={2.6} lt={lt}>
          <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
            <div style={{padding: '30px 60px', borderRadius: 50, background: sub ? '#E4DED4' : '#E62117', color: sub ? K.ink : '#fff', fontFamily: fonts.ui, fontWeight: 800, fontSize: 48, transform: `scale(${lt > 3.2 && lt < 3.4 ? 0.94 : 1})`}}>{sub ? 'Suscrito ✓' : 'Suscríbete'}</div>
            {sub && (
              <svg width={70} height={70} viewBox="0 0 70 70" style={{transform: `rotate(${Math.sin(lt * 20) * 15 * (1 - seg(lt, 3.4, 4.4))}deg)`}}>
                <path d="M 35 8 C 20 8, 14 20, 14 32 L 14 44 L 8 52 L 62 52 L 56 44 L 56 32 C 56 20, 50 8, 35 8 Z" fill={K.ink} />
                <circle cx={35} cy={60} r={7} fill={K.ink} />
              </svg>
            )}
          </div>
        </Pop>
      </Abs>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(${lerp(lt, [2.4, 3.2], [1700, 1440], io)} ${lerp(lt, [2.4, 3.2], [800, 500], io)})`} opacity={seg(lt, 2.4, 2.6) * (1 - seg(lt, 4.0, 4.4))}>
          <path d="M 0 0 L 0 56 L 14 43 L 25 66 L 36 61 L 26 39 L 46 39 Z" fill="#fff" stroke="#000" strokeWidth={3} strokeLinejoin="round" />
        </g>
      </svg>
    </Stage>
  );
};

export const F3: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <Abs x={960} y={420} center style={{width: 1600, textAlign: 'center'}}>
      <Title lt={lt} size={96} serif color="#fff">
        Que el futuro te abra la puerta.
      </Title>
    </Abs>
    <Abs x={960} y={650} center>
      <Pop at={1.2} lt={lt}>
        <Logo size={110} />
      </Pop>
    </Abs>
  </Stage>
);

/** Pantalla final: deja huecos para los elementos de YouTube (vídeo + suscripción). */
export const EndScreen: React.FC<{lt: number}> = ({lt}) => (
  <Stage>
    <Abs x={960} y={150} center>
      <Title lt={lt} size={64} color="#fff">
        Sigue viendo
      </Title>
    </Abs>
    {/* hueco para el vídeo recomendado (16:9) */}
    <Abs x={220} y={300}>
      <Pop at={0.2} lt={lt}>
        <div style={{width: 800, height: 450, borderRadius: 24, border: '3px dashed rgba(255,255,255,.25)', background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.4)'}}>vídeo recomendado</div>
      </Pop>
    </Abs>
    {/* hueco para el botón de suscripción (círculo) */}
    <Abs x={1360} y={300}>
      <Pop at={0.4} lt={lt}>
        <div style={{width: 340, height: 340, borderRadius: '50%', border: '3px dashed rgba(255,255,255,.25)', background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.4)'}}>suscríbete</div>
      </Pop>
    </Abs>
    <Abs x={960} y={900} center>
      <Pop at={0.6} lt={lt}>
        <Logo size={90} />
      </Pop>
    </Abs>
  </Stage>
);
