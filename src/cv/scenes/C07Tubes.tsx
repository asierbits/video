import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp, shake} from '../../utils';
import {DotBg, Label} from '../Bits';
import {P} from '../cvTheme';
import {MiniSheet, Sheet} from '../Sheet';

const LAND = 15;
const SHOTS = [30, 37.5, 45, 52.5, 60];
const TINTS = [P.tomato, P.lilacDeep, P.mintDeep, P.orange, P.sky];
const HUB = {x: 540, y: 1080};
const TUBE_X = [180, 360, 540, 720, 900];

const tubePath = (i: number) => {
  const tx = TUBE_X[i];
  return `M ${HUB.x - 120 + i * 60} ${HUB.y - 60} C ${HUB.x - 120 + i * 60} ${HUB.y - 400}, ${tx} ${HUB.y - 500}, ${tx} ${HUB.y - 800} L ${tx} -200`;
};

const tubePoint = (i: number, p: number): [number, number] => {
  // aproximación: curva hasta y=460, luego recto
  const x0 = HUB.x - 120 + i * 60;
  const tx = TUBE_X[i];
  if (p < 0.5) {
    const t = p / 0.5;
    const u = 1 - t;
    const y0 = HUB.y - 60;
    const x = u ** 3 * x0 + 3 * u * u * t * x0 + 3 * u * t * t * tx + t ** 3 * tx;
    const y = u ** 3 * y0 + 3 * u * u * t * (HUB.y - 400) + 3 * u * t * t * (HUB.y - 500) + t ** 3 * (HUB.y - 800);
    return [x, y];
  }
  const t = (p - 0.5) / 0.5;
  return [tx, HUB.y - 800 - t * 900];
};

/** C7 — 03: un click. Salta sobre el botón y los correos salen disparados por tubos neumáticos. */
export const C07Tubes: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, [LAND, ...SHOTS], 6, 'tb');

  // salto hacia el botón
  const jp = lerp(frame, [0, LAND], [0, 1]);
  const jx = 170 + (540 - 170) * ease.inOut(jp);
  const jy = frame < LAND ? 1800 - 520 * Math.sin(jp * Math.PI) + (1640 - 1800) * jp : 1640;
  const landSq = frame >= LAND ? 0.6 * Math.exp(-(frame - LAND) / 3) * Math.cos((frame - LAND) * 0.9) : -0.2;
  const press = frame >= LAND ? lerp(frame, [LAND, LAND + 3, LAND + 14], [0, 1, 0.3]) : 0;
  const happyBounce = frame > LAND + 14 ? Math.abs(Math.sin((frame - LAND) * 0.21)) * 50 : 0;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <DotBg color={P.mint} dot="rgba(29,26,47,.10)" />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${sh.x} ${sh.y})`}>
          {/* tubos (detrás) */}
          {TUBE_X.map((_, i) => (
            <g key={i}>
              <path d={tubePath(i)} stroke={P.ink} strokeWidth={84} fill="none" />
              <path d={tubePath(i)} stroke="#DFFBF0" strokeWidth={68} fill="none" />
              <path d={tubePath(i)} stroke="#fff" strokeWidth={14} fill="none" opacity={0.7} transform="translate(-20 0)" />
            </g>
          ))}
          {/* cápsulas */}
          {SHOTS.map((t, i) => {
            const p = lerp(frame, [t, t + 10], [0, 1], ease.in);
            if (p <= 0 || p >= 1) return null;
            const [x, y] = tubePoint(i, p);
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                {[1, 2, 3].map((k) => (
                  <line key={k} x1={-24 + k * 12} y1={60} x2={-24 + k * 12} y2={60 + 60 * p + k * 20} stroke={P.ink} strokeWidth={5} strokeLinecap="round" opacity={0.6} />
                ))}
                <rect x={-42} y={-74} width={84} height={148} rx={42} fill="#fff" stroke={P.ink} strokeWidth={6} />
                <g transform="scale(0.62)">
                  <MiniSheet w={90} mood="happy" tint={TINTS[i]} />
                </g>
              </g>
            );
          })}
          {/* centralita */}
          <rect x={HUB.x - 230} y={HUB.y - 80} width={460} height={230} rx={40} fill={P.lilac} stroke={P.ink} strokeWidth={8} />
          {SHOTS.map((t, i) => (
            <circle key={i} cx={HUB.x - 160 + i * 80} cy={HUB.y + 40} r={20} fill={frame >= t ? P.sun : '#fff'} stroke={P.ink} strokeWidth={5} />
          ))}
          <text x={HUB.x} y={HUB.y + 120} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={34} fill={P.ink}>
            {`${SHOTS.filter((t) => frame >= t).length} enviados`}
          </text>

          {/* botón */}
          <g transform={`translate(540 ${1660 + press * 26})`}>
            <rect x={-300} y={-10} width={600} height={140} rx={30} fill="#3B3060" stroke={P.ink} strokeWidth={8} />
          </g>
          <g transform={`translate(540 ${1640 + press * 26})`}>
            <ellipse cx={0} cy={30} rx={230} ry={56} fill="#A52A22" stroke={P.ink} strokeWidth={8} />
            <ellipse cx={0} cy={0} rx={230} ry={56} fill={P.tomato} stroke={P.ink} strokeWidth={8} />
          </g>
          <text x={540} y={1850} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={64} fill={P.cream} stroke={P.ink} strokeWidth={10} paintOrder="stroke">
            ENVIAR
          </text>

          <Sheet
            x={jx}
            y={jy + press * 26 - happyBounce}
            scale={0.95}
            mood={frame < LAND ? 'wow' : 'happy'}
            armL={frame < LAND ? 160 : 140 - 30 * Math.sin(frame * 0.4)}
            armR={frame < LAND ? 160 : 140 + 30 * Math.sin(frame * 0.4)}
            squash={landSq}
            stance={frame < LAND ? 0.6 : 1}
          />
          {frame >= LAND && frame < LAND + 9 && (
            <text x={760} y={1500} fontFamily={fonts.marker} fontSize={92} fill={P.ink} transform="rotate(10 760 1500)">
              ¡boing!
            </text>
          )}
        </g>
      </svg>
      <Label frame={frame} n="03" title="Un solo click" sub="y salen todas" color={P.tomato} y={90} />
    </AbsoluteFill>
  );
};
