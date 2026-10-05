import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {fonts} from '../theme';
import {Abs, Card, Check, Chip, CVDoc, Cross, Envelope, K, Person, Pop, SceneProps, Title, io, lerp, seg} from './kit';

const Stage: React.FC<{children: React.ReactNode}> = ({children}) => <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>;

const Spark: React.FC<{size?: number; color?: string; glow?: number}> = ({size = 200, color = K.cyan, glow = 1}) => (
  <svg width={size} height={size} viewBox="-100 -100 200 200" style={{overflow: 'visible', filter: `drop-shadow(0 0 ${30 * glow}px ${color})`}}>
    <path d="M 0 -90 C 10 -20, 20 -10, 90 0 C 20 10, 10 20, 0 90 C -10 20, -20 10, -90 0 C -20 -10, -10 -20, 0 -90 Z" fill={color} />
    <path d="M 60 -70 C 63 -58, 66 -55, 78 -52 C 66 -49, 63 -46, 60 -34 C 57 -46, 54 -49, 42 -52 C 54 -55, 57 -58, 60 -70 Z" fill="#fff" opacity={0.85} />
  </svg>
);

const Letter: React.FC<{w?: number; hl?: number; dark?: boolean; color?: string}> = ({w = 300, hl = 0, dark = true, color}) => (
  <div style={{width: w, padding: w * 0.08, borderRadius: w * 0.06, background: color ?? (dark ? '#1C2135' : '#fff'), border: `2px solid ${dark ? 'rgba(255,255,255,.1)' : K.line}`}}>
    {[0.5, 0.95, 0.9].map((x, i) => (
      <div key={i} style={{height: w * 0.03, width: `${x * 100}%`, borderRadius: 4, background: 'rgba(255,255,255,.18)', marginBottom: w * 0.035}} />
    ))}
    <div style={{fontFamily: fonts.ui, fontSize: w * 0.052, lineHeight: 1.3, padding: '2px 4px', borderRadius: 4, color: '#fff', background: `rgba(79,224,255,${0.35 * hl})`}}>Me apasiona aportar valor a un equipo dinámico.</div>
    {[0.85, 0.6].map((x, i) => (
      <div key={i} style={{height: w * 0.03, width: `${x * 100}%`, borderRadius: 4, background: 'rgba(255,255,255,.18)', marginTop: w * 0.035}} />
    ))}
  </div>
);

// =============================================================== 3 · IA CONTRA IA
export const C1: React.FC<SceneProps> = ({lt}) => {
  const p = lerp(lt, [0, 0.8], [0, 1]);
  const flick = lt < 1.2 && Math.floor(lt * 20) % 3 === 0 ? 0.6 : 1;
  return (
    <Stage>
      {[0, 1, 2].map((k) => (
        <Abs key={k} x={960} y={500} center>
          <div style={{width: 300 + k * 160 + lt * 60, height: 300 + k * 160 + lt * 60, borderRadius: '50%', border: `2px solid rgba(79,224,255,${0.35 - k * 0.1})`}} />
        </Abs>
      ))}
      <Abs x={960} y={500} center style={{opacity: p * flick, transform: `translate(-50%, -50%) scale(${0.6 + 0.4 * p}) rotate(${lt * 20}deg)`}}>
        <Spark size={260} />
      </Abs>
      <Abs x={960} y={800} center>
        <Title lt={lt} at={0.6} size={56} color="#fff">
          Inteligencia artificial
        </Title>
      </Abs>
    </Stage>
  );
};

export const C2: React.FC<SceneProps> = ({lt}) => {
  const typed = Math.round(lerp(lt, [0.8, 2.6], [0, 5], (x) => x));
  return (
    <Stage>
      <Abs x={480} y={150} center>
        <Pop at={0} lt={lt}>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 44, color: K.amber}}>Candidatos</div>
        </Pop>
      </Abs>
      <Abs x={1440} y={150} center>
        <Pop at={2.6} lt={lt}>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 44, color: K.cyan}}>Empresas</div>
        </Pop>
      </Abs>
      <Abs x={160} y={230}>
        <Pop at={0.2} lt={lt}>
          <Card dark style={{width: 640, height: 560, padding: 36}}>
            <div style={{alignSelf: 'flex-end', marginLeft: 'auto', width: 'fit-content', padding: '14px 22px', borderRadius: 22, background: 'rgba(255,178,30,.18)', fontFamily: fonts.ui, fontSize: 26, color: '#fff'}}>Escríbeme una carta de presentación</div>
            <div style={{display: 'flex', gap: 16, marginTop: 30}}>
              <Spark size={50} color={K.amber} glow={0.3} />
              <div style={{flex: 1}}>
                {Array.from({length: typed}, (_, i) => (
                  <div key={i} style={{height: 16, width: `${[90, 80, 95, 60, 85][i]}%`, borderRadius: 8, background: 'rgba(255,255,255,.25)', marginBottom: 18}} />
                ))}
              </div>
            </div>
          </Card>
        </Pop>
      </Abs>
      <Abs x={1120} y={230}>
        <Pop at={2.8} lt={lt}>
          <Card dark style={{width: 640, height: 560, padding: 36, position: 'relative', overflow: 'hidden'}}>
            <div style={{display: 'flex', gap: 14, flexWrap: 'wrap'}}>
              {Array.from({length: 6}, (_, i) => (
                <Letter key={i} w={170} />
              ))}
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 40 + ((lt * 200) % 460), height: 6, background: K.cyan, boxShadow: `0 0 24px ${K.cyan}`}} />
            <div style={{position: 'absolute', left: 36, bottom: 30, display: 'flex', alignItems: 'center', gap: 12, fontFamily: fonts.ui, fontSize: 26, color: K.cyan}}>
              <Spark size={36} glow={0.3} /> Analizando cartas…
            </div>
          </Card>
        </Pop>
      </Abs>
    </Stage>
  );
};

export const C3: React.FC<SceneProps> = ({lt}) => {
  const hl = seg(lt, 3.6, 4.2);
  return (
    <Stage>
      <div style={{position: 'absolute', left: 150, right: 150, top: 80, display: 'flex', flexWrap: 'wrap', gap: 28, justifyContent: 'center'}}>
        {Array.from({length: 12}, (_, i) => (
          <Pop key={i} at={0.2 + i * 0.22} lt={lt} from={0.6}>
            <Letter w={360} hl={hl} />
          </Pop>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 120, bottom: 120, background: `rgba(14,18,34,${0.75 * seg(lt, 4.8, 5.4)})`}} />
      <Abs x={960} y={520} center style={{width: 1500, textAlign: 'center'}}>
        <Title lt={lt} at={5.0} size={78} serif color="#fff">
          «Me apasiona aportar valor a un equipo dinámico.»
        </Title>
        <Title lt={lt} at={6.4} size={40} color={K.cyan} style={{marginTop: 30}}>
          × 12 · todas iguales
        </Title>
      </Abs>
    </Stage>
  );
};

export const C4: React.FC<SceneProps> = ({lt}) => {
  const ping = (lt * 0.9) % 2;
  const dir = ping < 1 ? 1 : -1;
  const q = ping < 1 ? ping : ping - 1;
  const x = dir > 0 ? 420 + q * 1080 : 1500 - q * 1080;
  const y = 420 - Math.sin(q * Math.PI) * 180;
  return (
    <Stage>
      <Abs x={330} y={460} center>
        <Spark size={220} color={K.amber} />
        <div style={{textAlign: 'center', fontFamily: fonts.ui, fontWeight: 800, fontSize: 34, color: K.amber, marginTop: 20}}>IA que escribe</div>
      </Abs>
      <Abs x={1590} y={460} center>
        <Spark size={220} color={K.cyan} />
        <div style={{textAlign: 'center', fontFamily: fonts.ui, fontWeight: 800, fontSize: 34, color: K.cyan, marginTop: 20}}>IA que filtra</div>
      </Abs>
      <Abs x={x} y={y} center>
        <Envelope w={90} color="#1C2135" stroke="#fff" />
      </Abs>
      <Pop at={2.6} lt={lt} style={{position: 'absolute', left: 960 - 75, top: 520}}>
        <Person size={150} color={K.coral} scarf mood="happy" wave={0.5 + 0.3 * Math.sin(lt * 8)} />
      </Pop>
      <Pop at={3.4} lt={lt} style={{position: 'absolute', left: 1040, top: 470}}>
        <Card style={{padding: '14px 24px', fontFamily: fonts.ui, fontWeight: 700, fontSize: 30, color: K.ink}}>¡Eh! Aquí hay una persona</Card>
      </Pop>
    </Stage>
  );
};

export const C5: React.FC<SceneProps> = ({lt}) => {
  const strike = seg(lt, 1.0, 1.4);
  return (
    <Stage>
      <Abs x={960} y={400} center>
        <div style={{position: 'relative'}}>
          <Title lt={lt} size={110} color="rgba(255,255,255,.75)">
            No es mandar más.
          </Title>
          <div style={{position: 'absolute', left: 0, top: '52%', height: 10, width: `${strike * 100}%`, background: K.coral, borderRadius: 5}} />
        </div>
      </Abs>
      <Abs x={960} y={620} center>
        <Title lt={lt} at={1.4} size={130} color={K.amber}>
          Es mandar mejor.
        </Title>
      </Abs>
    </Stage>
  );
};

export const C6: React.FC<SceneProps> = ({lt}) => {
  const star = 17;
  const glow = seg(lt, 1.2, 2.0);
  return (
    <Stage>
      <div style={{position: 'absolute', left: 360, top: 110, display: 'grid', gridTemplateColumns: 'repeat(7, 140px)', gap: 30}}>
        {Array.from({length: 28}, (_, i) => {
          const me = i === star;
          return (
            <div key={i} style={{transform: `scale(${me ? 1 + 0.35 * glow : 1})`, opacity: me ? 1 : 1 - 0.55 * glow, filter: me ? `drop-shadow(0 0 ${30 * glow}px ${K.amber})` : 'none', zIndex: me ? 2 : 1}}>
              <CVDoc w={100} accent={me ? K.coral : '#4A5070'} fill={me ? '#FFF6E5' : '#252B42'} stroke={me ? K.amber : '#3A4060'} face={me} />
            </div>
          );
        })}
      </div>
      <Abs x={960} y={850} center>
        <Title lt={lt} at={2.6} size={70} color="#fff">
          Lo <span style={{color: K.amber}}>auténtico</span> destaca más que nunca.
        </Title>
      </Abs>
    </Stage>
  );
};

// =============================================================== 4 · LO QUE FUNCIONA
const RuleHead: React.FC<{lt: number; n: string; t: string; c: string}> = ({lt, n, t, c}) => (
  <Abs x={120} y={90}>
    <Pop at={0} lt={lt}>
      <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
        <div style={{minWidth: 110, height: 110, padding: n.length > 2 ? '0 26px' : 0, borderRadius: 30, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.logo, fontWeight: 900, fontSize: n.length > 2 ? 36 : 64, color: '#fff'}}>{n}</div>
        <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 68, color: K.ink, letterSpacing: -2}}>{t}</div>
      </div>
    </Pop>
  </Abs>
);

export const D1: React.FC<SceneProps> = ({lt}) => (
  <Stage>
    <Abs x={960} y={150} center>
      <Title lt={lt} at={0.2} size={64}>
        Lo que repiten quienes seleccionan
      </Title>
    </Abs>
    <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', gap: 220}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{position: 'relative'}}>
          <Pop at={0.6 + i * 0.3} lt={lt}>
            <Person size={180} color={[K.teal, '#8E6CC8', K.coral][i]} hair={['#5A3A2A', '#2B2236', '#7A4A2A'][i]} mood="happy" />
          </Pop>
          <Pop at={2.6 + i * 0.6} lt={lt} style={{position: 'absolute', left: 120, top: -110}}>
            <div style={{width: 110, height: 110, borderRadius: 55, background: '#fff', border: `3px solid ${K.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.logo, fontWeight: 900, fontSize: 56, color: [K.blue, K.coral, K.green][i]}}>{i + 1}</div>
          </Pop>
        </div>
      ))}
    </div>
  </Stage>
);

export const D2: React.FC<SceneProps> = ({lt}) => {
  const win = seg(lt, 2.6, 3.2);
  return (
    <Stage>
      <RuleHead lt={lt} n="1" t="Menos y mejor" c={K.blue} />
      <Abs x={200} y={300}>
        <Pop at={0.3} lt={lt}>
          <Card style={{width: 640, height: 520, padding: 36, opacity: 1 - 0.35 * win}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 52px)', gap: 6}}>
              {Array.from({length: 40}, (_, i) => (
                <div key={i} style={{opacity: seg(lt, 0.4 + i * 0.02, 0.6 + i * 0.02)}}>
                  <CVDoc w={44} accent="#B8B0A4" lines={2} />
                </div>
              ))}
            </div>
            <div style={{marginTop: 30, fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: K.muted}}>100 iguales</div>
            <div style={{fontFamily: fonts.ui, fontSize: 30, color: K.muted}}>mismo texto, cualquier oferta</div>
          </Card>
        </Pop>
      </Abs>
      <Abs x={960} y={560} center style={{width: 200}}>
        <Pop at={2.4} lt={lt}>
          <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 120, color: K.blue}}>&lt;</div>
        </Pop>
      </Abs>
      <Abs x={1080} y={300}>
        <Pop at={1.2} lt={lt}>
          <Card style={{width: 640, height: 520, padding: 36, borderColor: win ? K.blue : K.line, borderWidth: 4, transform: `scale(${1 + 0.04 * win})`, boxShadow: win ? '0 30px 70px rgba(61,107,255,.25)' : undefined}}>
            <div style={{display: 'flex', gap: 30, justifyContent: 'center', marginTop: 30}}>
              {[0, 1, 2].map((i) => (
                <CVDoc key={i} w={120} accent={K.amber} face />
              ))}
            </div>
            <div style={{marginTop: 64, display: 'flex', alignItems: 'center', gap: 16, fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: K.blue}}>
              <Check size={48} p={win} /> unas pocas, pensadas
            </div>
            <div style={{fontFamily: fonts.ui, fontSize: 30, color: K.muted, marginLeft: 64}}>una para cada oferta</div>
          </Card>
        </Pop>
      </Abs>
    </Stage>
  );
};

export const D3: React.FC<SceneProps> = ({lt}) => {
  const swapName = lt > 1.4;
  const nope = lt > 2.6;
  const typed = 'Vi cómo rediseñasteis vuestra app de reservas y me encantaría aportar mi experiencia investigando con usuarios.';
  const n = Math.round(lerp(lt, [3.6, 6.2], [0, typed.length], (x) => x));
  return (
    <Stage>
      <RuleHead lt={lt} n="2" t="Personaliza de verdad" c={K.coral} />
      <Abs x={960} y={600} center>
        <Card style={{width: 1300, padding: 60, fontFamily: fonts.ui, fontSize: 38, lineHeight: 1.5, color: K.ink}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <span>Estimado equipo de</span>
            <span style={{padding: '2px 14px', borderRadius: 10, background: swapName ? 'rgba(255,178,30,.3)' : 'rgba(30,27,46,.08)', fontWeight: 700}}>{swapName ? 'Estudio Faro' : '[EMPRESA]'}</span>
            {nope && <Cross size={46} />}
            {nope && <span style={{color: K.red, fontWeight: 700, fontSize: 30}}>con esto no basta</span>}
          </div>
          <div style={{marginTop: 24, color: lt > 3.4 ? K.muted : K.ink, textDecoration: lt > 3.4 ? 'line-through' : 'none'}}>Me interesa mucho el puesto ofertado en su empresa.</div>
          <div style={{marginTop: 16, minHeight: 120, color: K.ink, fontWeight: 600}}>
            {typed.slice(0, n)}
            {n < typed.length && lt > 3.6 ? <span style={{color: K.coral}}>|</span> : null}
          </div>
          {n >= typed.length && (
            <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 10}}>
              <Check size={42} />
              <span style={{color: K.green, fontWeight: 700, fontSize: 30}}>sabes qué hacen · por qué encajas</span>
            </div>
          )}
        </Card>
      </Abs>
    </Stage>
  );
};

export const D4: React.FC<SceneProps> = ({lt}) => {
  const chips = ['tu perfil', 'tu ciudad', 'tu salario'];
  return (
    <Stage>
      <RuleHead lt={lt} n="3" t="Apunta bien" c={K.green} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {[260, 190, 120, 50].map((r, i) => (
          <circle key={r} cx={1300} cy={600} r={r * lerp(lt, [0.2, 0.8], [0, 1])} fill={i % 2 ? '#fff' : i === 3 ? K.green : '#E9F6EF'} stroke={K.line} strokeWidth={4} />
        ))}
        {Array.from({length: 7}, (_, i) => {
          const at = 3.6 + i * 0.35;
          const p = seg(lt, at, at + 0.5);
          if (p <= 0) return null;
          const good = i % 2 === 0;
          const tx = good ? 1300 + (random(`tx${i}`) - 0.5) * 70 : 1300 + (i % 3 === 1 ? 420 : -420);
          const ty = good ? 600 + (random(`ty${i}`) - 0.5) * 70 : 600 + (i % 4 === 1 ? -330 : 330);
          const x = 200 + (tx - 200) * p;
          const y = 600 + (ty - 600) * p - Math.sin(p * Math.PI) * 80;
          return (
            <g key={i} transform={`translate(${x} ${y})`} opacity={good ? 1 : 1 - seg(lt, at + 0.6, at + 1.0) * 0.7}>
              <rect x={-34} y={-24} width={68} height={48} rx={10} fill={good ? K.green : '#C9C1B4'} />
              <text y={10} textAnchor="middle" fontFamily={fonts.ui} fontWeight={800} fontSize={26} fill="#fff">
                {good ? '✓' : '✗'}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 330, display: 'flex', flexDirection: 'column', gap: 20}}>
        {chips.map((c, i) => (
          <Pop key={c} at={1.0 + i * 0.7} lt={lt}>
            <Chip style={{fontSize: 34}}>
              <Check size={34} /> {c}
            </Chip>
          </Pop>
        ))}
      </div>
      <Abs x={120} y={760}>
        <Title lt={lt} at={6.0} size={44} color={K.muted} style={{width: 700}}>
          Aplicar donde no encajas solo alimenta al filtro.
        </Title>
      </Abs>
    </Stage>
  );
};

export const D4b: React.FC<SceneProps> = ({lt}) => {
  const text: [string, string | null][] = [
    ['Buscamos diseñador/a con experiencia en ', null],
    ['Figma', 'a'],
    [' y en investigación con ', null],
    ['usuarios', 'b'],
    ['. Trabajo ', null],
    ['remoto', 'c'],
    [' con un equipo pequeño. Valoramos test con ', null],
    ['usuarios', 'b'],
    [', prototipos en ', null],
    ['Figma', 'a'],
    [' y comunicación clara. Puesto ', null],
    ['remoto', 'c'],
    ['; hablarás a diario con ', null],
    ['usuarios', 'b'],
    ['.', null],
  ];
  const at = {a: 1.4, b: 2.8, c: 4.2} as Record<string, number>;
  const col = {a: '#FFE08A', b: '#BDE6FF', c: '#C9F2D9'} as Record<string, string>;
  return (
    <Stage>
      <RuleHead lt={lt} n="TRUCO" t="Lee la oferta tres veces" c={K.amber} />
      <Abs x={120} y={300}>
        <Card style={{width: 1080, padding: 50, fontFamily: fonts.ui, fontSize: 36, lineHeight: 1.6, color: K.ink}}>
          {text.map(([s, k], i) => {
            const p = k ? seg(lt, at[k], at[k] + 0.5) : 0;
            return (
              <span key={i} style={k ? {backgroundImage: `linear-gradient(${col[k]}, ${col[k]})`, backgroundSize: `${p * 100}% 70%`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 80%', fontWeight: p > 0.5 ? 700 : 400} : undefined}>
                {s}
              </span>
            );
          })}
        </Card>
      </Abs>
      <div style={{position: 'absolute', left: 1300, top: 330, display: 'flex', flexDirection: 'column', gap: 26}}>
        {[
          ['Figma', '×2', 'a'],
          ['usuarios', '×3', 'b'],
          ['remoto', '×2', 'c'],
        ].map(([w, n, k]) => (
          <Pop key={w} at={at[k] + 0.4} lt={lt}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '16px 26px', borderRadius: 20, background: col[k], fontFamily: fonts.ui, fontWeight: 800, fontSize: 40, color: K.ink}}>
              {w} <span style={{opacity: 0.6}}>{n}</span>
            </div>
          </Pop>
        ))}
        <Pop at={5.6} lt={lt}>
          <div style={{fontFamily: fonts.ui, fontSize: 30, color: K.muted, width: 480}}>Úsalas en tu CV y tu carta: las busca el filtro… y la persona.</div>
        </Pop>
      </div>
    </Stage>
  );
};

export const D4c: React.FC<SceneProps> = ({lt}) => {
  const days = Math.min(7, Math.max(0, Math.round(lerp(lt, [0.6, 1.8], [0, 7], io))));
  return (
    <Stage>
      <RuleHead lt={lt} n="EXTRA" t="Haz seguimiento" c="#8E6CC8" />
      <Abs x={160} y={330}>
        <Pop at={0.3} lt={lt}>
          <Card style={{width: 340, overflow: 'hidden', textAlign: 'center'}}>
            <div style={{background: '#8E6CC8', color: '#fff', fontFamily: fonts.ui, fontWeight: 800, fontSize: 30, padding: 14}}>DÍAS DESPUÉS</div>
            <div style={{fontFamily: fonts.ui, fontWeight: 800, fontSize: 160, color: K.ink, padding: '10px 0 30px'}}>+{days}</div>
          </Card>
        </Pop>
      </Abs>
      <Abs x={640} y={340}>
        <Pop at={2.0} lt={lt}>
          <div style={{width: 900, padding: '30px 36px', borderRadius: '34px 34px 34px 8px', background: '#fff', border: `2px solid ${K.line}`, fontFamily: fonts.ui, fontSize: 34, lineHeight: 1.4, color: K.ink, boxShadow: '0 20px 40px rgba(60,40,20,.1)'}}>
            Hola, Marta. Te escribo por mi candidatura a Diseñador/a UX. ¿Pudisteis verla? Me encantaría contaros más.
          </div>
        </Pop>
      </Abs>
      <Abs x={940} y={640}>
        <Pop at={4.2} lt={lt}>
          <div style={{width: 600, padding: '26px 34px', borderRadius: '34px 34px 8px 34px', background: K.green, fontFamily: fonts.ui, fontWeight: 600, fontSize: 34, lineHeight: 1.4, color: '#fff'}}>¡Hola! Justo íbamos a escribirte. ¿Hablamos el jueves?</div>
        </Pop>
      </Abs>
    </Stage>
  );
};

export const D5: React.FC<SceneProps> = ({lt}) => {
  const tasks = ['Buscar ofertas', 'Adaptar el CV', 'Escribir cada carta', 'Rellenar formularios', 'Hacer seguimiento'];
  const spin = lt * 900;
  return (
    <Stage>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <circle cx={1360} cy={520} r={260} fill="#fff" stroke={K.ink} strokeWidth={12} />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={1360 + Math.cos(a) * 220} y1={520 + Math.sin(a) * 220} x2={1360 + Math.cos(a) * 245} y2={520 + Math.sin(a) * 245} stroke={K.ink} strokeWidth={8} />;
        })}
        <line x1={1360} y1={520} x2={1360 + Math.cos(((spin - 90) * Math.PI) / 180) * 200} y2={520 + Math.sin(((spin - 90) * Math.PI) / 180) * 200} stroke={K.coral} strokeWidth={10} strokeLinecap="round" />
        <line x1={1360} y1={520} x2={1360 + Math.cos(((spin / 12 - 90) * Math.PI) / 180) * 140} y2={520 + Math.sin(((spin / 12 - 90) * Math.PI) / 180) * 140} stroke={K.ink} strokeWidth={14} strokeLinecap="round" />
        <circle cx={1360} cy={520} r={16} fill={K.ink} />
      </svg>
      <div style={{position: 'absolute', left: 160, top: 220, display: 'flex', flexDirection: 'column', gap: 18}}>
        {tasks.map((tk, i) => (
          <Pop key={tk} at={0.1 + i * 0.25} lt={lt}>
            <Chip style={{fontSize: 34}}>{tk}</Chip>
          </Pop>
        ))}
      </div>
      <Abs x={1360} y={840} center style={{width: 900}}>
        <Title lt={lt} at={2.2} size={84} color={K.coral}>
          Muchas horas.
        </Title>
      </Abs>
    </Stage>
  );
};
