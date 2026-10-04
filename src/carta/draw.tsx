import React from 'react';

export type Pt = [number, number];

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** progreso local de un tramo [a, b] dentro de p */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** Curva suave (Catmull-Rom -> Bézier cúbica) que pasa por todos los puntos. */
export const spline = (pts: Pt[]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

/** Trazo que se dibuja solo: p = 0..1 */
export const Ink: React.FC<{
  d: string;
  p: number;
  color: string;
  w?: number;
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
  dash?: boolean;
}> = ({d, p, color, w = 6, fill = 'none', fillOpacity = 1, opacity = 1}) => {
  if (p <= 0.001) return null;
  return (
    <>
      {fill !== 'none' && <path d={d} fill={fill} opacity={fillOpacity * smooth(clamp01((p - 0.7) / 0.3)) * opacity} />}
      <path
        d={d}
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
        fill="none"
        stroke={color}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
    </>
  );
};

export const circlePath = (cx: number, cy: number, r: number, start = -Math.PI / 2) => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = start + (i / 48) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return 'M ' + pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L ');
};

export const rectPath = (x: number, y: number, w: number, h: number, r = 18) =>
  `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
