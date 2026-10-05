import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {fonts} from '../theme';
import {Abs, Browser, Card, Check, Chip, CVDoc, Cross, Envelope, K, Person, Pop, SceneProps, Title, io, lerp, seg} from './kit';

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>;

// =============================================================== INTRO
export const I1: React.FC<SceneProps> = ({lt}) => {
  const sent = Math.round(lerp(lt, [0.2, 2.6], [0, 50], io));
  const day = Math.max(1, Math.round(lerp(lt, [2.8, 4.8], [1, 14], io)));
  const reply = lt > 5.3;
  return (
    <Stage>
      {/* enviados */}
      <Abs x={170} y={250}>
        <Card dark style={{width: 520, padding: 36}}>
          <div style={{fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.6)'}}>Enviados</div>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 150, color: '#fff', lineHeight: 1}}>{sent}</div>
          <div style={{fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.6)'}}>currículums</div>
        </Card>
      </Abs>
      {/* sobres saliendo */}
      {Array.from({length: 14}, (_, i) => {
        const p = seg(lt, 0.2 + i * 0.16, 1.2 + i * 0.16);
        if (p <= 0 || p >= 1) return null;
        return (
          <Abs key={i} x={700 + p * 520} y={420 - Math.sin(p * Math.PI) * 160 + (random(`e${i}`) - 0.5) * 140} style={{opacity: 1 - p, transform: `rotate(${(random(`r${i}`) - 0.5) * 40}deg)`}}>
            <Envelope w={70} color="#fff" stroke="#1E1B2E" />
          </Abs>
        );
      })}
      {/* calendario */}
      <Pop at={2.6} lt={lt} style={{position: 'absolute', left: 860, top: 270}}>
        <Card dark style={{width: 220, padding: 0, overflow: 'hidden', textAlign: 'center'}}>
          <div style={{background: K.coral, color: '#fff', fontFamily: fonts.ui, fontWeight: 800, fontSize: 26, padding: 10}}>DÍA</div>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 110, color: '#fff', padding: '10px 0 20px'}}>{day}</div>
        </Card>
      </Pop>
      {/* bandeja de entrada */}
      <Abs x={1180} y={250}>
        <Card dark style={{width: 600, padding: 30}}>
          <div style={{fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.6)', marginBottom: 20}}>Bandeja de entrada</div>
          {reply ? (
            <Pop at={5.3} lt={lt}>
              <div style={{display: 'flex', gap: 20, alignItems: 'center', padding: 20, borderRadius: 20, background: 'rgba(255,107,87,.15)', border: `2px solid ${K.coral}`}}>
                <Envelope w={60} color="#fff" />
                <div style={{fontFamily: fonts.ui}}>
                  <div style={{color: '#fff', fontWeight: 700, fontSize: 28}}>RR. HH. · no-reply</div>
                  <div style={{color: 'rgba(255,255,255,.75)', fontSize: 26}}>Gracias por tu interés, pero…</div>
                </div>
              </div>
            </Pop>
          ) : (
            <div style={{fontFamily: fonts.ui, fontSize: 28, color: 'rgba(255,255,255,.35)', padding: '30px 0'}}>Sin mensajes nuevos</div>
          )}
        </Card>
      </Abs>
    </Stage>
  );
};

export const I2: React.FC<SceneProps> = ({lt}) => {
  const draw = seg(lt, 2.0, 5.2);
  const pts = Array.from({length: 60}, (_, i) => {
    const x = i / 59;
    const y = 0.05 + 0.08 * x + 0.85 * Math.pow(x, 6);
    return [300 + x * 1300, 860 - y * 520];
  });
  const shown = pts.slice(0, Math.max(2, Math.round(pts.length * draw)));
  return (
    <Stage>
      <Abs x={960} y={200} center>
        <Title lt={lt} size={130} color="#fff">
          No eres tú.
        </Title>
      </Abs>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={300} y1={860} x2={1640} y2={860} stroke="rgba(255,255,255,.35)" strokeWidth={3} opacity={seg(lt, 1.6, 2.0)} />
        <line x1={300} y1={860} x2={300} y2={320} stroke="rgba(255,255,255,.35)" strokeWidth={3} opacity={seg(lt, 1.6, 2.0)} />
        <polyline points={shown.map((p) => p.join(',')).join(' ')} fill="none" stroke={K.amber} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        {draw > 0 && <circle cx={shown[shown.length - 1][0]} cy={shown[shown.length - 1][1]} r={14} fill={K.amber} />}
      </svg>
      <Abs x={300} y={890} style={{fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.6)', opacity: seg(lt, 1.8, 2.3)}}>
        hace décadas
      </Abs>
      <Abs x={1640} y={890} style={{fontFamily: fonts.ui, fontSize: 30, color: 'rgba(255,255,255,.6)', opacity: seg(lt, 1.8, 2.3), transform: 'translateX(-100%)'}}>
        hoy
      </Abs>
      <Abs x={340} y={330} style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: 32, color: K.amber, opacity: seg(lt, 4.2, 4.8)}}>
        cuánto ha cambiado buscar trabajo
      </Abs>
    </Stage>
  );
};

export const I3: React.FC<SceneProps> = ({lt}) => {
  const items = [
    {at: 0.9, n: '1', t: 'Qué se ha roto', c: K.coral},
    {at: 2.2, n: '2', t: 'IA contra IA', c: K.cyan},
    {at: 4.4, n: '3', t: 'Qué puedes hacer', c: K.green},
  ];
  return (
    <Stage>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center', gap: 50}}>
        {items.map((it, i) => {
          const on = lt >= it.at;
          return (
            <Pop key={i} at={it.at - 0.3} lt={lt}>
              <Card dark style={{width: 460, height: 380, padding: 40, borderColor: on ? it.c : undefined, transform: `scale(${on && lt < it.at + 1.6 ? 1.05 : 1})`}}>
                <div style={{fontFamily: fonts.logo, fontWeight: 900, fontSize: 120, color: it.c, lineHeight: 1}}>{it.n}</div>
                <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 52, color: '#fff', marginTop: 40, lineHeight: 1.1}}>{it.t}</div>
              </Card>
            </Pop>
          );
        })}
      </div>
    </Stage>
  );
};

// =============================================================== 1 · ANTES
const Street: React.FC<{lt: number; walk?: boolean}> = ({lt, walk}) => {
  const doors = [
    {x: 160, c: '#C9604B', s: 'Imprenta'},
    {x: 560, c: '#3E7C74', s: 'Oficinas'},
    {x: 960, c: '#B88A2E', s: 'Estudio'},
    {x: 1360, c: '#5B5F97', s: 'Taller'},
  ];
  const px = lerp(lt, [0.2, 3.8], [-150, 1420], (x) => x);
  return (
    <>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={760} width={1920} height={320} fill="#D9C7A8" />
        <rect x={0} y={750} width={1920} height={14} fill="#C5B08C" />
        {doors.map((d, i) => (
          <g key={i}>
            <rect x={d.x} y={240} width={360} height={510} fill={i % 2 ? '#E7D6B9' : '#EAD9BE'} />
            <rect x={d.x + 20} y={270} width={320} height={70} rx={8} fill={d.c} />
            <text x={d.x + 180} y={318} textAnchor="middle" fontFamily={fonts.ui} fontWeight={800} fontSize={34} fill="#fff">
              {d.s}
            </text>
            <rect x={d.x + 110} y={420} width={140} height={330} rx={10} fill={d.c} />
            <circle cx={d.x + 228} cy={590} r={9} fill="#F3D27A" />
            <rect x={d.x + 30} y={400} width={60} height={120} rx={6} fill="#BFD7E0" />
            <rect x={d.x + 270} y={400} width={60} height={120} rx={6} fill="#BFD7E0" />
          </g>
        ))}
      </svg>
      {walk && (
        <Abs x={px} y={470} style={{transform: `translateY(${Math.abs(Math.sin(lt * 9)) * -8}px)`}}>
          <Person size={180} color={K.blue} scarf mood="happy" />
        </Abs>
      )}
    </>
  );
};

export const A1: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <Street lt={lt} walk />
    <Abs x={120} y={90}>
      <Title lt={lt} at={0.4} size={70}>
        Una cuestión de <span style={{color: K.coral}}>puertas</span>
      </Title>
    </Abs>
  </Stage>
);

export const A2: React.FC<SceneProps> = ({lt}) => {
  const hand = lerp(lt, [1.2, 2.8], [0, 1], io);
  return (
    <Stage>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={820} width={1920} height={260} fill="#D9C7A8" />
        <rect x={980} y={640} width={700} height={36} rx={10} fill="#8C6A4E" />
        <rect x={1020} y={676} width={30} height={170} fill="#7A5A40" />
        <rect x={1610} y={676} width={30} height={170} fill="#7A5A40" />
      </svg>
      <Abs x={1260} y={330}>
        <Person size={240} color={K.teal} hair="#5A3A2A" mood={lt > 4 ? 'happy' : 'ok'} />
      </Abs>
      <Abs x={420} y={350}>
        <Person size={240} color={K.blue} scarf mood="happy" wave={lerp(lt, [1, 1.6], [0, 0.6]) * (1 - lerp(lt, [2.8, 3.3], [0, 1]))} />
      </Abs>
      <Abs x={720 + hand * 460} y={600 - Math.sin(hand * Math.PI) * 60} style={{transform: `rotate(${-10 + 10 * hand}deg)`}}>
        <CVDoc w={90} />
      </Abs>
      <Pop at={3.6} lt={lt} style={{position: 'absolute', left: 1100, top: 150}}>
        <Card style={{padding: '18px 30px', fontFamily: fonts.ui, fontSize: 32, fontWeight: 600, color: K.ink}}>Cuéntame un poco de ti…</Card>
      </Pop>
      <Pop at={6.2} lt={lt} style={{position: 'absolute', left: 1500, top: 120}}>
        <svg width={170} height={140} viewBox="0 0 170 140">
          <ellipse cx={95} cy={60} rx={70} ry={52} fill="#fff" stroke={K.line} strokeWidth={4} />
          <circle cx={30} cy={118} r={10} fill="#fff" stroke={K.line} strokeWidth={4} />
          <path d="M 95 88 C 60 60, 70 30, 95 48 C 120 30, 130 60, 95 88 Z" fill={K.coral} />
        </svg>
      </Pop>
      <Abs x={120} y={90}>
        <Title lt={lt} at={4.6} size={64}>
          Una persona <span style={{color: K.teal}}>te veía</span>.
        </Title>
      </Abs>
    </Stage>
  );
};

export const A3: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 120}}>
      <Pop at={0.1} lt={lt}>
        <Card style={{width: 360, height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20}}>
          <CVDoc w={110} accent={K.coral} lines={3} />
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: K.ink}}>1 oferta</div>
        </Card>
      </Pop>
      <div style={{display: 'flex', gap: 10}}>
        {[0, 1, 2, 3].map((i) => (
          <Pop key={i} at={0.8 + i * 0.25} lt={lt}>
            <Person size={110} color={[K.blue, K.teal, K.coral, '#8E6CC8'][i]} hair={['#2B2236', '#5A3A2A', '#2B2236', '#7A4A2A'][i]} />
          </Pop>
        ))}
      </div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 720, display: 'flex', justifyContent: 'center', gap: 80}}>
      <Title lt={lt} at={2.3} size={90} serif>
        Lento, sí.
      </Title>
      <Title lt={lt} at={3.2} size={90} serif color={K.coral}>
        Pero humano.
      </Title>
    </div>
  </Stage>
);

// =============================================================== 2 · EMBUDO
const JOBS = ['Diseñador/a UX · Remoto', 'Atención al cliente · Madrid', 'Marketing digital · Híbrido', 'Desarrollador/a web · Remoto'];

export const B1: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <Abs x={960} y={540} center>
      <Pop at={0} lt={lt}>
        <Browser url="portal-de-empleo.com/ofertas" w={1300} h={720}>
          <div style={{padding: 40, display: 'flex', flexDirection: 'column', gap: 22}}>
            {JOBS.map((j, i) => {
              const hl = i === 0 && lt > 2.6;
              return (
                <Pop key={j} at={0.3 + i * 0.25} lt={lt}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 24, padding: '20px 26px', borderRadius: 18, border: `2px solid ${K.line}`, background: '#FBF8F2'}}>
                    <div style={{width: 64, height: 64, borderRadius: 16, background: [K.blue, K.teal, K.coral, '#8E6CC8'][i]}} />
                    <div style={{flex: 1, fontFamily: fonts.ui, fontWeight: 700, fontSize: 32, color: K.ink}}>{j}</div>
                    <div
                      style={{
                        padding: '14px 26px',
                        borderRadius: 30,
                        fontFamily: fonts.ui,
                        fontWeight: 800,
                        fontSize: 24,
                        color: '#fff',
                        background: K.blue,
                        transform: `scale(${hl ? 1.12 + 0.04 * Math.sin(lt * 8) : 1})`,
                        boxShadow: hl ? `0 0 0 10px rgba(61,107,255,.2)` : 'none',
                      }}
                    >
                      ⚡ Solicitud rápida
                    </div>
                  </div>
                </Pop>
              );
            })}
          </div>
        </Browser>
      </Pop>
    </Abs>
  </Stage>
);

export const B2: React.FC<SceneProps> = ({lt}) => {
  const press = lt > 0.8 && lt < 1.0;
  return (
    <Stage>
      <Abs x={960} y={430} center>
        <div style={{padding: '40px 80px', borderRadius: 80, background: K.blue, color: '#fff', fontFamily: fonts.ui, fontWeight: 800, fontSize: 64, transform: `scale(${press ? 0.94 : 1})`, boxShadow: '0 30px 60px rgba(61,107,255,.35)'}}>⚡ Solicitud rápida</div>
      </Abs>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 26}, (_, i) => {
          const at = i === 0 ? 0 : 2.2 + random(`ca${i}`) * 2.2;
          if (lt < at) return null;
          const x = i === 0 ? lerp(lt, [0, 0.7], [1300, 1010], io) : 300 + random(`cx${i}`) * 1320;
          const y = i === 0 ? lerp(lt, [0, 0.7], [760, 470], io) : 640 + random(`cy${i}`) * 300;
          const click = ((lt - at) * 3) % 1 < 0.2;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${click ? 0.9 : 1})`}>
              {click && i > 0 && <circle r={26} fill="none" stroke={K.blue} strokeWidth={3} opacity={0.5} />}
              <path d="M 0 0 L 0 46 L 12 35 L 21 56 L 30 52 L 22 32 L 38 32 Z" fill="#fff" stroke={K.ink} strokeWidth={3} strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
      <Abs x={960} y={150} center>
        <Title lt={lt} at={2.5} size={64}>
          Cuando cuesta un clic, <span style={{color: K.blue}}>lo hace todo el mundo</span>.
        </Title>
      </Abs>
    </Stage>
  );
};

export const B3: React.FC<SceneProps> = ({lt}) => {
  const count = Math.floor(lerp(lt, [0.6, 5], [0, 70], (x) => x));
  return (
    <Stage>
      <Abs x={960} y={130} center>
        <Card style={{padding: '24px 40px', display: 'flex', alignItems: 'center', gap: 20}}>
          <div style={{width: 60, height: 60, borderRadius: 16, background: K.blue}} />
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 38, color: K.ink}}>Diseñador/a UX · Remoto</div>
        </Card>
      </Abs>
      {Array.from({length: count}, (_, i) => {
        const at = 0.6 + i * 0.063;
        const fall = seg(lt, at, at + 0.5);
        const col = i % 14;
        const row = Math.floor(i / 14);
        const tx = 520 + col * 62 + (random(`b${i}`) - 0.5) * 20;
        const ty = 780 - row * 62 + (random(`c${i}`) - 0.5) * 10;
        const y = 220 + (ty - 220) * fall;
        return (
          <Abs key={i} x={tx} y={y} style={{transform: `rotate(${(random(`d${i}`) - 0.5) * 30}deg)`}}>
            <CVDoc w={52} accent={[K.coral, K.amber, K.teal, K.blue][i % 4]} lines={2} />
          </Abs>
        );
      })}
      <Pop at={3.2} lt={lt} style={{position: 'absolute', left: 1480, top: 560}}>
        <Person size={150} color={K.teal} hair="#5A3A2A" mood="tired" />
      </Pop>
      <Pop at={3.6} lt={lt} style={{position: 'absolute', left: 1430, top: 470}}>
        <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: K.coral}}>¿¡Todo esto!?</div>
      </Pop>
      <Abs x={140} y={320}>
        <Title lt={lt} at={0.8} size={60}>
          <span style={{color: K.blue}}>Cientos</span>
          <br />
          de candidaturas
        </Title>
      </Abs>
    </Stage>
  );
};

export const B4: React.FC<SceneProps> = ({lt}) => {
  const items = Array.from({length: 16}, (_, i) => i);
  return (
    <Stage>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={80} y={640} width={700} height={24} rx={12} fill="#C9BFAF" />
        {Array.from({length: 14}, (_, i) => (
          <circle key={i} cx={100 + i * 50 + ((lt * 60) % 50)} cy={652} r={7} fill="#A89D8B" />
        ))}
        <rect x={1140} y={430} width={700} height={20} rx={10} fill="#BFE8D3" />
        <rect x={1140} y={820} width={700} height={20} rx={10} fill="#F6C9C2" />
      </svg>
      {/* máquina */}
      <Abs x={780} y={430}>
        <div style={{width: 360, height: 380, borderRadius: 30, background: K.ink, position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,.25)'}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 30, textAlign: 'center', fontFamily: fonts.ui, fontWeight: 800, fontSize: 30, color: '#fff'}}>FILTRO</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: fonts.ui, fontSize: 26, color: 'rgba(255,255,255,.6)'}}>automático</div>
          <div style={{position: 'absolute', left: 40, right: 40, top: 140 + ((lt * 120) % 180), height: 6, background: K.cyan, boxShadow: `0 0 20px ${K.cyan}`}} />
          <div style={{position: 'absolute', left: 40, right: 40, top: 130, bottom: 40, border: '3px solid rgba(255,255,255,.2)', borderRadius: 16}} />
        </div>
      </Abs>
      {items.map((i) => {
        const at = 0.3 + i * 0.5;
        const p = seg(lt, at, at + 1.6);
        if (p <= 0 || p >= 1) return null;
        const pass = i % 7 === 3;
        let x: number;
        let y: number;
        if (p < 0.5) {
          x = 60 + (p / 0.5) * 760;
          y = 560;
        } else {
          const q = (p - 0.5) / 0.5;
          x = 1140 + q * 640;
          y = pass ? 330 : 720;
        }
        return (
          <Abs key={i} x={x} y={y} style={{opacity: p > 0.45 && p < 0.55 ? 0 : 1}}>
            <div style={{position: 'relative'}}>
              <CVDoc w={60} lines={2} accent={pass ? K.green : K.amber} />
              {p >= 0.55 && <div style={{position: 'absolute', right: -16, top: -16}}>{pass ? <Check size={34} /> : <Cross size={34} />}</div>}
            </div>
          </Abs>
        );
      })}
      <Abs x={1860} y={370} style={{transform: 'translateX(-100%)', whiteSpace: 'nowrap', fontFamily: fonts.ui, fontWeight: 800, fontSize: 30, color: K.green}}>
        pasa a una persona
      </Abs>
      <Abs x={1860} y={860} style={{transform: 'translateX(-100%)', whiteSpace: 'nowrap', fontFamily: fonts.ui, fontWeight: 800, fontSize: 30, color: K.red}}>
        descartado
      </Abs>
      <div style={{position: 'absolute', left: 120, top: 150, display: 'flex', gap: 16}}>
        {['palabras clave', 'segundos', 'antes que una persona'].map((c, i) => (
          <Pop key={c} at={2.4 + i * 1.6} lt={lt}>
            <Chip>{c}</Chip>
          </Pop>
        ))}
      </div>
    </Stage>
  );
};

export const B4b: React.FC<SceneProps> = ({lt}) => {
  const words = ['Figma', 'investigación de usuarios', 'remoto'];
  return (
    <Stage>
      <Abs x={260} y={150}>
        <Card style={{width: 560, height: 720, padding: 50, position: 'relative'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{width: 90, height: 90, borderRadius: 45, background: K.amber}} />
            <div>
              <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 36, color: K.ink}}>Lucía Martín</div>
              <div style={{fontFamily: fonts.ui, fontSize: 26, color: K.muted}}>Diseñadora</div>
            </div>
          </div>
          {[0.9, 0.7, 0.85, 0.6, 0.8, 0.5, 0.75, 0.65].map((w, i) => (
            <div key={i} style={{marginTop: i === 0 ? 50 : 22, height: 16, width: `${w * 100}%`, borderRadius: 8, background: K.line}} />
          ))}
          <div style={{marginTop: 40, fontFamily: fonts.ui, fontSize: 26, color: K.muted}}>“Diseño apps que la gente entiende a la primera.”</div>
          {lt > 3.6 && (
            <div style={{position: 'absolute', left: 60, top: 300, transform: `rotate(-14deg) scale(${lerp(lt, [3.6, 3.8], [1.6, 1])})`, border: `8px solid ${K.red}`, color: K.red, fontFamily: fonts.ui, fontWeight: 800, fontSize: 64, padding: '8px 24px', borderRadius: 14, opacity: 0.9}}>
              DESCARTADO
            </div>
          )}
        </Card>
      </Abs>
      <Abs x={980} y={190}>
        <div style={{fontFamily: fonts.ui, fontWeight: 600, fontSize: 30, color: K.muted, marginBottom: 20}}>El filtro busca:</div>
        {words.map((w, i) => (
          <Pop key={w} at={0.5 + i * 0.7} lt={lt} style={{marginBottom: 20}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <Chip style={{fontSize: 32}}>{w}</Chip>
              {lt > 1.6 + i * 0.6 && <Cross size={44} />}
              {lt > 1.6 + i * 0.6 && <span style={{fontFamily: fonts.ui, fontSize: 26, color: K.red}}>no encontrado</span>}
            </div>
          </Pop>
        ))}
      </Abs>
      <Abs x={980} y={620}>
        <Title lt={lt} at={4.6} size={76} serif>
          No porque no valgas.
        </Title>
        <Title lt={lt} at={6.0} size={44} style={{marginTop: 20}} color={K.muted}>
          Porque faltaban las palabras que buscaba.
        </Title>
      </Abs>
    </Stage>
  );
};

export const B5: React.FC<SceneProps> = ({lt}) => {
  const n = 90;
  return (
    <Stage>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d="M 560 220 L 1360 220 L 1010 690 L 1010 900 L 910 900 L 910 690 Z" fill="#fff" stroke={K.line} strokeWidth={6} strokeLinejoin="round" opacity={seg(lt, 0, 0.5)} />
        {Array.from({length: n}, (_, i) => {
          const at = (i / n) * 4.5;
          const p = ((lt - at) % 2.2) / 2.2;
          if (lt < at) return null;
          const passes = i % 15 === 0;
          const x0 = 600 + random(`fx${i}`) * 720;
          let x: number;
          let y: number;
          if (p < 0.6) {
            const q = p / 0.6;
            y = 160 + q * 520;
            const half = 400 - q * 350;
            x = 960 + ((x0 - 960) / 400) * half;
          } else if (passes) {
            const q = (p - 0.6) / 0.4;
            y = 680 + q * 300;
            x = 960;
          } else {
            const q = (p - 0.6) / 0.4;
            y = 680 - q * 40;
            x = 960 + ((x0 - 960) / 400) * 50;
            return <circle key={i} cx={x} cy={y} r={9} fill={K.coral} opacity={0.4 * (1 - q)} />;
          }
          return <circle key={i} cx={x} cy={y} r={passes ? 14 : 10} fill={passes ? K.green : K.blue} opacity={0.85} />;
        })}
      </svg>
      <Abs x={350} y={170} style={{transform: 'translateX(-50%)'}}>
        <Pop at={0.4} lt={lt}>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 46, color: K.blue}}>muchísimas</div>
          <div style={{fontFamily: fonts.ui, fontSize: 34, color: K.muted}}>candidaturas</div>
        </Pop>
      </Abs>
      <Abs x={1350} y={860}>
        <Pop at={3.5} lt={lt}>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 46, color: K.green}}>muy pocas</div>
          <div style={{fontFamily: fonts.ui, fontSize: 34, color: K.muted}}>conversaciones</div>
        </Pop>
      </Abs>
    </Stage>
  );
};
