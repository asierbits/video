import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/** Grano de película animado (cambia de semilla cada frame). */
export const FilmGrain: React.FC<{opacity?: number}> = ({opacity = 0.11}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={frame % 97}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Fogonazo de un par de frames en los impactos. */
export const Flash: React.FC<{at: number[]; color?: string; length?: number; max?: number}> = ({
  at,
  color = '#fff',
  length = 6,
  max = 0.85,
}) => {
  const frame = useCurrentFrame();
  let o = 0;
  for (const a of at) {
    const d = frame - a;
    if (d >= 0 && d < length) o = Math.max(o, max * (1 - d / length));
  }
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: color, opacity: o, mixBlendMode: 'screen'}} />;
};

/** Fuga de luz de color (resplandor de lente). */
export const LightLeak: React.FC<{color: string; opacity: number; x?: number; y?: number}> = ({
  color,
  opacity,
  x = 80,
  y = 10,
}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      mixBlendMode: 'screen',
      opacity,
      background: `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, rgba(0,0,0,0) 55%)`,
    }}
  />
);
