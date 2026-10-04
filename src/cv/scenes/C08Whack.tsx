import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {fonts} from '../../theme';
import {ease, lerp, shake} from '../../utils';
import {DotBg, Label} from '../Bits';
import {P} from '../cvTheme';

const HITS = Array.from({length: 9}, (_, k) => 8 + k * 8);
const ORDER = [4, 0, 8, 2, 6, 1, 7, 3, 5];
const WIN = {x: 70, y: 400, w: 940, h: 1280};
const TABS = ['LinkedIn', 'InfoJobs', 'Indeed'];

const holePos = (h: number) => ({x: WIN.x + 170 + (h % 3) * 300, y: WIN.y + 400 + Math.floor(h / 3) * 300});

/** C8 — 04: la extensión. Como el juego de aplastar topos, pero con botones de "Aplicar". */
export const C08Whack: React.FC = () => {
  const frame = useCurrentFrame();
  const sh = shake(frame, HITS, 7, 'wh');
  const done = HITS.filter((t) => frame >= t).length;
  const tab = Math.min(2, Math.floor(frame / 30));

  // el mazo va de topo en topo
  const next = HITS.findIndex((t) => frame < t + 4);
  const k = next === -1 ? HITS.length - 1 : next;
  const target = holePos(ORDER[k]);
  const prev = k > 0 ? holePos(ORDER[k - 1]) : {x: 1100, y: 300};
  const travel = lerp(frame, [(HITS[k - 1] ?? 0) + 2, HITS[k] - 1], [0, 1], ease.inOut);
  const mx = prev.x + (target.x - prev.x) * travel;
  const my = prev.y + (target.y - prev.y) * travel;
  const swing = frame < HITS[k] ? lerp(frame, [HITS[k] - 4, HITS[k]], [55, -4], ease.in) : lerp(frame, [HITS[k], HITS[k] + 4], [-4, 40]);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <DotBg color={P.lilac} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <g transform={`translate(${sh.x} ${sh.y})`}>
          {/* ventana del navegador */}
          <rect x={WIN.x + 18} y={WIN.y + 22} width={WIN.w} height={WIN.h} rx={40} fill={P.ink} opacity={0.3} />
          <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={40} fill={P.cream} stroke={P.ink} strokeWidth={8} />
          <path d={`M ${WIN.x} ${WIN.y + 170} L ${WIN.x + WIN.w} ${WIN.y + 170}`} stroke={P.ink} strokeWidth={6} />
          {TABS.map((t, i) => (
            <g key={t} transform={`translate(${WIN.x + 40 + i * 250} ${WIN.y + 24})`}>
              <rect width={230} height={60} rx={20} fill={i === tab ? '#fff' : P.line} stroke={P.ink} strokeWidth={5} />
              <text x={115} y={42} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={30} fill={P.ink}>
                {t}
              </text>
            </g>
          ))}
          <rect x={WIN.x + 40} y={WIN.y + 100} width={WIN.w - 200} height={52} rx={26} fill="#fff" stroke={P.ink} strokeWidth={5} />
          <text x={WIN.x + 70} y={WIN.y + 136} fontFamily={fonts.mono} fontSize={24} fill={P.ink} opacity={0.6}>
            {`${TABS[tab].toLowerCase()}.com/empleos`}
          </text>
          {/* icono de la extensión */}
          <g transform={`translate(${WIN.x + WIN.w - 90} ${WIN.y + 126})`}>
            <rect x={-38} y={-38} width={76} height={76} rx={20} fill={P.amber} stroke={P.ink} strokeWidth={5} />
            <text y={20} textAnchor="middle" fontFamily={fonts.logo} fontWeight={900} fontSize={50} fill={P.ink}>
              k
            </text>
          </g>

          {/* agujeros y topos-botón */}
          {Array.from({length: 9}, (_, h) => {
            const {x, y} = holePos(h);
            const order = ORDER.indexOf(h);
            const hit = HITS[order];
            const up = lerp(frame, [hit - 8, hit - 4], [0, 1], ease.back);
            const isDone = frame >= hit;
            const squash = isDone ? lerp(frame, [hit, hit + 2, hit + 6], [0.55, 0.55, 1]) : 1;
            return (
              <g key={h}>
                <ellipse cx={x} cy={y + 60} rx={120} ry={36} fill={P.ink} />
                <defs>
                  <clipPath id={`hole${h}`}>
                    <rect x={x - 140} y={y - 200} width={280} height={260} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#hole${h})`}>
                  <g transform={`translate(${x} ${y + 60 + (1 - up) * 160}) scale(1 ${squash})`}>
                    <rect x={-110} y={-120} width={220} height={110} rx={55} fill={isDone ? P.mint : P.ink} stroke={P.ink} strokeWidth={6} />
                    {isDone ? (
                      <path d="M -56 -66 L -34 -44 L 0 -86" stroke={P.ink} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-24 4)" />
                    ) : null}
                    <text x={isDone ? 30 : 0} y={-52} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={isDone ? 30 : 38} fill={isDone ? P.ink : P.cream}>
                      {isDone ? 'hecho' : 'Aplicar'}
                    </text>
                  </g>
                </g>
                {isDone && frame < hit + 8 && (
                  <g transform={`translate(${x} ${y - 90})`} opacity={1 - (frame - hit) / 8}>
                    {Array.from({length: 6}, (_, s) => {
                      const a = (s / 6) * Math.PI * 2;
                      const r = 60 + (frame - hit) * 12;
                      return <circle key={s} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.6} r={10} fill={P.sun} stroke={P.ink} strokeWidth={4} />;
                    })}
                  </g>
                )}
              </g>
            );
          })}

          <text x={540} y={WIN.y + WIN.h - 60} textAnchor="middle" fontFamily={fonts.marker} fontSize={60} fill={P.ink}>
            {`${done} candidaturas enviadas`}
          </text>

          {/* mazo knok (pivota desde el mango, a la derecha del golpe) */}
          <g transform={`translate(${mx + 300} ${my - 40}) rotate(${swing})`}>
            <rect x={-300} y={-14} width={300} height={28} rx={14} fill="#C98A4B" stroke={P.ink} strokeWidth={6} />
            <g transform="translate(-300 0)">
              <rect x={-70} y={-60} width={140} height={120} rx={26} fill={P.amber} stroke={P.ink} strokeWidth={7} />
              <text y={30} textAnchor="middle" fontFamily={fonts.logo} fontWeight={900} fontSize={80} fill={P.ink}>
                k
              </text>
            </g>
          </g>
          {frame >= HITS[0] && done < 9 && frame - HITS[done - 1] < 4 && (
            <text x={holePos(ORDER[done - 1]).x + 60} y={holePos(ORDER[done - 1]).y - 150} fontFamily={fonts.marker} fontSize={64} fill={P.tomato} stroke={P.ink} strokeWidth={8} paintOrder="stroke">
              ¡pum!
            </text>
          )}
        </g>
      </svg>
      <Label frame={frame} n="04" title="Extensión de Chrome" sub="aplica en LinkedIn y más" color={P.amber} y={110} />
    </AbsoluteFill>
  );
};
