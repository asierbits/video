import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {fonts} from '../../theme';
import {ease, lerp} from '../../utils';
import {Sticky} from '../Bits';
import {P} from '../cvTheme';
import {Sheet} from '../Sheet';
import {Cobweb, PHONE, PhoneBody} from './C03Phone';

const RINGS = [0, 18, 36];

/** C9 — El mismo teléfono de antes… ¡suena! Se rompe la telaraña. */
export const C09Ring: React.FC = () => {
  const frame = useCurrentFrame();
  const ringing = RINGS.some((r) => frame >= r && frame < r + 12);
  const vib = ringing ? 14 : 0;
  const vx = noise2D('vx', frame * 2.5, 0) * vib;
  const vr = noise2D('vr', frame * 2.5, 0) * vib * 0.25;
  const pulse = 1 + 0.08 * Math.sin(frame * 0.7);
  const charIn = lerp(frame, [22, 32], [0, 1], ease.back);
  const dance = Math.sin(frame * 0.42);

  return (
    <AbsoluteFill style={{background: P.sun, overflow: 'hidden'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {Array.from({length: 14}, (_, i) => (
          <path key={i} d={`M 0 ${80 + i * 140} C 300 ${60 + i * 140 + (i % 3) * 20}, 700 ${110 + i * 140}, 1080 ${90 + i * 140}`} stroke="#F2B92C" strokeWidth={6} fill="none" />
        ))}
        {/* ondas de vibración */}
        {RINGS.map((r) =>
          frame >= r && frame < r + 16 ? (
            <g key={r} opacity={1 - (frame - r) / 16}>
              {[0, 1, 2].map((k) => (
                <path
                  key={k}
                  d={`M ${PHONE.x - 40 - k * 40 - (frame - r) * 4} ${PHONE.y + 300} q -40 130 0 260 M ${PHONE.x + PHONE.w + 40 + k * 40 + (frame - r) * 4} ${PHONE.y + 300} q 40 130 0 260`}
                  stroke={P.ink}
                  strokeWidth={10}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </g>
          ) : null,
        )}
        <g transform={`translate(${vx} 0) rotate(${vr} 540 990)`}>
          <PhoneBody screen="#2D7A5A">
            <text x={540} y={PHONE.y + 190} textAnchor="middle" fontFamily={fonts.round} fontWeight={600} fontSize={36} fill={P.cream} opacity={0.85}>
              Llamada entrante
            </text>
            <circle cx={540} cy={PHONE.y + 340} r={90} fill={P.tomato} stroke={P.cream} strokeWidth={6} />
            <text x={540} y={PHONE.y + 372} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={90} fill={P.cream}>
              N
            </text>
            <text x={540} y={PHONE.y + 500} textAnchor="middle" fontFamily={fonts.round} fontWeight={700} fontSize={64} fill={P.cream}>
              Nova Studio
            </text>
            <text x={540} y={PHONE.y + 548} textAnchor="middle" fontFamily={fonts.round} fontWeight={600} fontSize={32} fill={P.cream} opacity={0.75}>
              Recursos Humanos
            </text>
            <g transform={`translate(${PHONE.x + 110} ${PHONE.y + 720})`}>
              <circle r={56} fill={P.tomato} />
              <path d="M -26 6 q 26 -22 52 0" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" />
            </g>
            <g transform={`translate(${PHONE.x + PHONE.w - 110} ${PHONE.y + 720}) scale(${pulse})`}>
              <circle r={56} fill="#38D27A" />
              <path d="M -26 -6 q 26 22 52 0" stroke="#fff" strokeWidth={12} fill="none" strokeLinecap="round" />
            </g>
          </PhoneBody>
          <Cobweb p={1} broken={lerp(frame, [1, 12], [0, 1], ease.in)} />
        </g>
        {/* la araña huye */}
        {frame < 20 && (
          <g transform={`translate(${PHONE.x + PHONE.w - 120 + frame * 40} ${PHONE.y + 300 - frame * 14})`}>
            <circle r={22} fill={P.ink} />
            <circle cx={-7} cy={-4} r={7} fill="#fff" />
            <circle cx={7} cy={-4} r={7} fill="#fff" />
            <text x={30} y={-30} fontFamily={fonts.marker} fontSize={44} fill={P.ink}>
              ¡!
            </text>
          </g>
        )}
        <Sticky
          frame={frame}
          at={-30}
          x={540}
          y={1560}
          text="0 llamadas."
          size={110}
          rot={-3}
          color={P.mint}
          writeDur={1}
          strike={lerp(frame, [8, 16], [0, 1])}
          extra="¡Me llaman!"
          extraAt={18}
        />
        <g transform={`translate(900 ${2300 - 1000 * charIn})`}>
          <Sheet x={0} y={0} scale={0.8} mood="wow" armL={160 + 20 * dance} armR={160 - 20 * dance} tilt={10 * dance} squash={0.08 * dance} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
