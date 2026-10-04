import {Easing, interpolate} from 'remotion';
import {noise2D} from '@remotion/noise';

/** interpolate con extrapolación bloqueada (lo que queremos el 99% de las veces). */
export const lerp = (
  frame: number,
  input: number[],
  output: number[],
  easing?: (t: number) => number,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** Temblor de cámara que decae tras un impacto. */
export const shake = (frame: number, hits: number[], strength = 18, seed = 'shk') => {
  let amp = 0;
  for (const h of hits) {
    if (frame >= h) amp += strength * Math.exp(-(frame - h) / 5);
  }
  return {
    x: noise2D(seed + 'x', frame * 0.6, 0) * amp,
    y: noise2D(seed + 'y', frame * 0.6, 0) * amp,
    r: noise2D(seed + 'r', frame * 0.4, 0) * amp * 0.08,
  };
};

/** Deriva orgánica lenta (cámara en mano). */
export const drift = (frame: number, seed: string, amp = 6) => ({
  x: noise2D(seed, frame * 0.012, 1) * amp,
  y: noise2D(seed, frame * 0.012, 7) * amp,
});

/** Ciclo de paso para el personaje. */
export const walkCycle = (frame: number, speed = 0.32, swing = 26) => {
  const s = Math.sin(frame * speed);
  return {
    legL: s * swing,
    legR: -s * swing,
    armL: -s * swing * 0.8,
    armR: s * swing * 0.8,
    bob: Math.abs(Math.cos(frame * speed)) * -5,
  };
};

/** Punto sobre una curva de Bézier cuadrática + ángulo de la tangente. */
export const quad = (
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
) => {
  const u = 1 - t;
  const x = u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0];
  const y = u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1];
  const dx = 2 * u * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
  const dy = 2 * u * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
  return {x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI};
};
