import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Character} from '../components/Character';
import {C, fonts} from '../theme';
import {ease, lerp, shake} from '../utils';

const EYE = {x: 540, y: 700};
const CHAR = {x: 540, y: 1760};
const LOCK = 58; // frame en el que el foco encuentra al personaje

/** Lluvia de datos al fondo. */
const DataRain: React.FC<{frame: number}> = ({frame}) => {
  const cols = 18;
  const out: React.ReactNode[] = [];
  for (let c = 0; c < cols; c++) {
    const speed = 9 + random(`sp${c}`) * 14;
    const len = 10 + Math.floor(random(`ln${c}`) * 14);
    const head = ((frame * speed + random(`of${c}`) * 2400) % 2600) - 300;
    for (let k = 0; k < len; k++) {
      const y = head - k * 40;
      if (y < -40 || y > 1960) continue;
      const ch = random(`ch${c}-${k}-${Math.floor(frame / 4)}`) > 0.5 ? '1' : '0';
      out.push(
        <text
          key={`${c}-${k}`}
          x={30 + c * 60}
          y={y}
          fontFamily={fonts.mono}
          fontSize={30}
          fill={k === 0 ? C.ice : C.blue}
          opacity={k === 0 ? 0.7 : 0.35 * (1 - k / len)}
        >
          {ch}
        </text>,
      );
    }
  }
  return <g>{out}</g>;
};

/** ESCENA 3 — El ojo. Una IA te mira, te mide, te reduce a un porcentaje. */
export const S03Eye: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [0, LOCK], 12, 'eye');

  // párpados: abren al principio, se cierran al final (parpadeo = corte)
  const open = Math.min(lerp(frame, [0, 14], [0, 1], ease.out), lerp(frame, [104, 118], [1, 0], ease.in));
  const lidGap = 470 * open;

  const pupil = frame < LOCK ? 120 + 8 * Math.sin(frame * 0.3) : lerp(frame, [LOCK, LOCK + 8], [120, 54], ease.out);

  // foco que barre y encuentra al personaje
  const sweep = frame < LOCK ? 26 * Math.sin(frame * 0.11 + 0.6) * lerp(frame, [30, LOCK], [1, 0]) : 0;
  const coneAng = (sweep * Math.PI) / 180;
  const coneLen = 1250;
  const cx = EYE.x + Math.sin(coneAng) * coneLen;
  const cy = EYE.y + Math.cos(coneAng) * coneLen;
  const halfW = 230;
  const px = Math.cos(coneAng) * halfW;
  const py = -Math.sin(coneAng) * halfW;
  const lit = frame >= LOCK - 4;

  // el personaje se convierte en datos
  const glitchAmt = lit ? lerp(frame, [LOCK, LOCK + 30], [0.3, 1]) : 0;
  const bands = 9;
  const charTop = CHAR.y - 270;
  const bandH = 290 / bands;

  const pixels = lit
    ? Array.from({length: 40}, (_, k) => {
        const start = LOCK + random(`ps${k}`) * 40;
        const p = lerp(frame, [start, start + 34], [0, 1], ease.in);
        if (p <= 0 || p >= 1) return null;
        const sx = CHAR.x - 50 + random(`px${k}`) * 100;
        const sy = CHAR.y - 40 - random(`py${k}`) * 220;
        const x = sx + (EYE.x - sx) * p + Math.sin(p * 9 + k) * 20 * (1 - p);
        const y = sy + (EYE.y + 60 - sy) * p;
        const sz = 6 + random(`pz${k}`) * 9;
        return <rect key={k} x={x} y={y} width={sz} height={sz} fill={k % 2 ? C.cyan : C.amber} opacity={1 - p * 0.6} />;
      })
    : null;

  const match = Math.round(lerp(frame, [LOCK + 6, LOCK + 30], [97, 12], ease.out));

  const spokes = Array.from({length: 72}, (_, i) => {
    const a = (i / 72) * Math.PI * 2 + frame * 0.004;
    const r0 = pupil + 16;
    const r1 = 300 - (i % 3) * 18;
    return (
      <line
        key={i}
        x1={EYE.x + Math.cos(a) * r0}
        y1={EYE.y + Math.sin(a) * r0}
        x2={EYE.x + Math.cos(a) * r1}
        y2={EYE.y + Math.sin(a) * r1}
        stroke={i % 4 === 0 ? C.ice : C.cyan}
        strokeWidth={i % 4 === 0 ? 3 : 1.6}
        opacity={0.55}
      />
    );
  });

  const charNode = (
    <Character
      x={CHAR.x}
      y={CHAR.y}
      scale={1.05}
      armL={lerp(frame, [LOCK - 4, LOCK + 6], [8, 40], ease.out)}
      armR={lerp(frame, [LOCK - 4, LOCK + 6], [8, 40], ease.out)}
      headTilt={-6}
      look="cold"
      blink={lit ? 0.6 : 0}
      wind={0.6 + 0.3 * Math.sin(frame * 0.4)}
    />
  );

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 60% at 50% 35%, #0F1D44 0%, #050814 60%, #010205 100%)`}}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="iris">
            <stop offset="0" stopColor="#0A1A3E" />
            <stop offset="0.45" stopColor="#123B8E" />
            <stop offset="0.85" stopColor={C.blue} />
            <stop offset="1" stopColor="#0A1A3E" />
          </radialGradient>
          <linearGradient id="cone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={C.cyan} stopOpacity={0.55} />
            <stop offset="1" stopColor={C.cyan} stopOpacity={0.06} />
          </linearGradient>
          <clipPath id="almond">
            <path d={`M ${EYE.x - 560} ${EYE.y} Q ${EYE.x} ${EYE.y - lidGap * 1.25} ${EYE.x + 560} ${EYE.y} Q ${EYE.x} ${EYE.y + lidGap * 1.25} ${EYE.x - 560} ${EYE.y} Z`} />
          </clipPath>
          <path id="ringPath" d={`M ${EYE.x - 380} ${EYE.y} a 380 380 0 1 1 760 0 a 380 380 0 1 1 -760 0`} />
          {Array.from({length: bands}, (_, b) => (
            <clipPath key={b} id={`band${b}`}>
              <rect x={0} y={charTop + b * bandH} width={1080} height={bandH + 0.5} />
            </clipPath>
          ))}
        </defs>

        <g transform={`translate(${sh.x} ${sh.y})`}>
          <DataRain frame={frame} />

          {/* foco */}
          <polygon
            points={`${EYE.x},${EYE.y} ${cx + px},${cy + py} ${cx - px},${cy - py}`}
            fill="url(#cone)"
            opacity={open * (lit ? 1 : 0.75)}
            style={{mixBlendMode: 'screen'}}
          />
          <ellipse cx={cx} cy={Math.min(cy, CHAR.y + 10)} rx={halfW * 0.9} ry={40} fill={C.cyan} opacity={0.18 * open} />

          {/* ojo */}
          <g clipPath="url(#almond)">
          <rect x={0} y={EYE.y - 600} width={1080} height={1200} fill="#030817" />
          <g transform={`rotate(${frame * 0.6} ${EYE.x} ${EYE.y})`}>
            <circle cx={EYE.x} cy={EYE.y} r={440} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray="4 18" opacity={0.6} />
            <circle cx={EYE.x} cy={EYE.y} r={410} fill="none" stroke={C.blue} strokeWidth={14} strokeDasharray="120 40 30 40" opacity={0.6} />
          </g>
          <g transform={`rotate(${-frame * 1.1} ${EYE.x} ${EYE.y})`}>
            <text fontFamily={fonts.mono} fontSize={22} fill={C.ice} letterSpacing={6} opacity={0.75}>
              <textPath href="#ringPath">
                ANALIZANDO PERFIL · PALABRAS CLAVE · AÑOS DE EXPERIENCIA · ENCAJE CULTURAL · ANALIZANDO PERFIL ·
              </textPath>
            </text>
          </g>
          <circle cx={EYE.x} cy={EYE.y} r={320} fill="url(#iris)" />
          {spokes}
          <circle cx={EYE.x} cy={EYE.y} r={pupil + 14} fill="none" stroke={C.cyan} strokeWidth={4} />
          <circle cx={EYE.x} cy={EYE.y} r={pupil} fill="#01020A" />
          <circle cx={EYE.x - pupil * 0.35} cy={EYE.y - pupil * 0.4} r={pupil * 0.22} fill="#fff" opacity={0.85} />

          </g>
          {/* contorno del párpado */}
          <path
            d={`M ${EYE.x - 560} ${EYE.y} Q ${EYE.x} ${EYE.y - lidGap * 1.25} ${EYE.x + 560} ${EYE.y} Q ${EYE.x} ${EYE.y + lidGap * 1.25} ${EYE.x - 560} ${EYE.y} Z`}
            fill="none"
            stroke={C.cyan}
            strokeWidth={3}
            opacity={0.5 * open}
          />

          {/* lectura */}
          {frame > LOCK + 4 && (
            <g opacity={lerp(frame, [LOCK + 4, LOCK + 10], [0, 1]) * open}>
              <rect x={EYE.x - 190} y={EYE.y + 420} width={380} height={76} rx={6} fill="#02040B" stroke={match < 40 ? C.red : C.cyan} strokeWidth={3} />
              <text x={EYE.x} y={EYE.y + 472} textAnchor="middle" fontFamily={fonts.mono} fontWeight={700} fontSize={40} fill={match < 40 ? C.red : C.ice}>
                {`encaje ${match}%`}
              </text>
            </g>
          )}

          {/* suelo */}
          <rect x={0} y={CHAR.y} width={1080} height={200} fill="#02040B" />

          {/* personaje, troceado en bandas cuando le alcanza el foco */}
          {glitchAmt > 0
            ? Array.from({length: bands}, (_, b) => {
                const off = (random(`g${b}-${Math.floor(frame / 2)}`) - 0.5) * 70 * glitchAmt;
                return (
                  <g key={b} clipPath={`url(#band${b})`}>
                    <g
                      transform={`translate(${off} 0)`}
                      style={{
                        filter: `drop-shadow(${-10 * glitchAmt}px 0 0 rgba(79,240,255,0.85)) drop-shadow(${10 * glitchAmt}px 0 0 rgba(255,59,59,0.75))`,
                      }}
                    >
                      {charNode}
                    </g>
                  </g>
                );
              })
            : charNode}
          {pixels}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
