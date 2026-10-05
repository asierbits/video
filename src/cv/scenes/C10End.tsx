import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Logo} from '../../scenes/S05Knock';
import {fonts} from '../../theme';
import {ease, lerp} from '../../utils';
import {P} from '../cvTheme';
import {Sheet} from '../Sheet';

/** C10 — Cierre: knok. "Que te llamen a ti." */
export const C10End: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = lerp(frame, [0, 8], [0, 1], ease.back);
  const waves = ((frame - 8) % 20) / 10;
  const tag = lerp(frame, [10, 18], [0, 1], ease.back);
  const wave = Math.sin(frame * 0.5);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, ${P.cream} 0%, ${P.amber} 60%, ${P.orange} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* rayos de sol */}
      <div
        style={{
          position: 'absolute',
          inset: -800,
          background: `repeating-conic-gradient(from ${frame * 0.8}deg at 50% 50%, rgba(255,255,255,.25) 0deg 10deg, rgba(255,255,255,0) 10deg 24deg)`,
          transform: 'translateY(-150px)',
        }}
      />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingBottom: 260}}>
        <div style={{transform: `translateX(-50px) scale(${logoIn}) rotate(${(1 - logoIn) * -10}deg)`}}>
          <Logo size={220} waves={frame > 8 ? Math.min(1, waves) : 0} />
        </div>
        <div
          style={{
            marginTop: 70,
            fontFamily: fonts.marker,
            fontSize: 92,
            color: P.ink,
            transform: `scale(${tag}) rotate(-3deg)`,
            background: P.paper,
            border: `7px solid ${P.ink}`,
            boxShadow: `10px 10px 0 ${P.ink}`,
            borderRadius: 28,
            padding: '10px 44px 22px',
          }}
        >
          Que te llamen a ti.
        </div>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <Sheet
          x={540}
          y={1900 - 300 * lerp(frame, [6, 16], [0, 1], ease.back)}
          scale={0.95}
          mood="happy"
          armL={30}
          armR={150 + 25 * wave}
          tilt={3 * wave}
        />
      </svg>
    </AbsoluteFill>
  );
};
