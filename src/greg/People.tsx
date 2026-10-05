import React from 'react';

export const INK = '#1F1F24';
const W = 5.5;

export type Kind = 'dani' | 'mama' | 'sara' | 'jefe';
export type Face = 'normal' | 'smug' | 'sad' | 'happy' | 'surprised';

export type PersonProps = {
  kind: Kind;
  x: number;
  y: number;
  s?: number;
  /** 0..1 cuánto abre la boca (lip-sync con la voz) */
  talk?: number;
  face?: Face;
  /** grados: 0 = brazo hacia abajo, 90 = horizontal hacia fuera, 160 = arriba */
  armL?: number;
  armR?: number;
  look?: -1 | 0 | 1;
  tie?: boolean;
  /** sólo dibuja de cintura para arriba */
  bust?: boolean;
};

const stroke = {stroke: INK, strokeWidth: W, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};

/**
 * Personajes originales dibujados "a boli", en el espíritu de los diarios ilustrados:
 * cabeza grande, ojos de punto, cuerpo simple y extremidades de palito. Origen = entre los pies.
 */
export const Person: React.FC<PersonProps> = ({kind, x, y, s = 1, talk = 0, face = 'normal', armL = 12, armR = 12, look = 0, tie = false, bust = false}) => {
  const tall = kind === 'jefe' ? 50 : 0;
  const headY = -320 - tall;
  const hr = kind === 'jefe' ? 64 : 68;
  const shoulderY = -232 - tall;
  const hipY = -110;

  const arm = (side: -1 | 1, a: number) => {
    const sx = side * 34;
    const r = (a * Math.PI) / 180;
    const ex = sx + side * Math.sin(r * 0.55) * 52;
    const ey = shoulderY + Math.cos(r * 0.55) * 52;
    const hx = sx + side * Math.sin(r) * 100;
    const hy = shoulderY + Math.cos(r) * 100;
    return (
      <g>
        <path d={`M ${sx} ${shoulderY} Q ${ex + side * 6} ${ey} ${hx} ${hy}`} fill="none" {...stroke} />
        <circle cx={hx} cy={hy} r={9} fill="#fff" {...stroke} strokeWidth={4} />
      </g>
    );
  };

  const eyeDX = look * 8;
  const eyes =
    face === 'happy' ? (
      <>
        <path d={`M ${-30 + eyeDX} ${headY - 6} q 9 -10 18 0`} fill="none" {...stroke} strokeWidth={4.5} />
        <path d={`M ${12 + eyeDX} ${headY - 6} q 9 -10 18 0`} fill="none" {...stroke} strokeWidth={4.5} />
      </>
    ) : face === 'surprised' ? (
      <>
        <circle cx={-20 + eyeDX} cy={headY - 6} r={9} fill="#fff" {...stroke} strokeWidth={4} />
        <circle cx={20 + eyeDX} cy={headY - 6} r={9} fill="#fff" {...stroke} strokeWidth={4} />
        <circle cx={-20 + eyeDX} cy={headY - 6} r={3} fill={INK} />
        <circle cx={20 + eyeDX} cy={headY - 6} r={3} fill={INK} />
      </>
    ) : (
      <>
        <circle cx={-20 + eyeDX} cy={headY - 6} r={5} fill={INK} />
        <circle cx={20 + eyeDX} cy={headY - 6} r={5} fill={INK} />
        {face === 'sad' && <path d={`M ${-34 + eyeDX} ${headY - 26} L ${-12 + eyeDX} ${headY - 20} M ${34 + eyeDX} ${headY - 26} L ${12 + eyeDX} ${headY - 20}`} {...stroke} strokeWidth={4} />}
        {face === 'smug' && <path d={`M ${-32 + eyeDX} ${headY - 12} L ${-10 + eyeDX} ${headY - 12} M ${10 + eyeDX} ${headY - 12} L ${32 + eyeDX} ${headY - 12}`} {...stroke} strokeWidth={4} />}
      </>
    );

  const my = headY + 30;
  const open = Math.max(0, Math.min(1, talk));
  const mouth =
    open > 0.08 ? (
      <ellipse cx={eyeDX * 0.6} cy={my + 2} rx={10 + 4 * open} ry={3 + 13 * open} fill={INK} />
    ) : face === 'happy' || face === 'smug' ? (
      <path d={`M ${-16 + eyeDX * 0.6} ${my - 2} Q ${eyeDX * 0.6 + (face === 'smug' ? 8 : 0)} ${my + 14} ${18 + eyeDX * 0.6} ${my - 6}`} fill="none" {...stroke} strokeWidth={4.5} />
    ) : face === 'sad' ? (
      <path d={`M ${-14 + eyeDX * 0.6} ${my + 8} Q ${eyeDX * 0.6} ${my - 4} ${14 + eyeDX * 0.6} ${my + 8}`} fill="none" {...stroke} strokeWidth={4.5} />
    ) : face === 'surprised' ? (
      <ellipse cx={eyeDX * 0.6} cy={my + 4} rx={8} ry={11} fill="none" {...stroke} strokeWidth={4.5} />
    ) : (
      <path d={`M ${-12 + eyeDX * 0.6} ${my + 2} L ${12 + eyeDX * 0.6} ${my + 2}`} {...stroke} strokeWidth={4.5} />
    );

  const hair =
    kind === 'dani' ? (
      <path d={`M -14 ${headY - hr + 4} q -4 -22 -16 -26 M 0 ${headY - hr + 2} q 2 -24 -4 -32 M 14 ${headY - hr + 4} q 8 -20 18 -22`} fill="none" {...stroke} strokeWidth={4.5} />
    ) : kind === 'mama' ? (
      <path
        d={`M ${-hr - 8} ${headY + 34} Q ${-hr - 16} ${headY - hr - 20} 0 ${headY - hr - 14} Q ${hr + 16} ${headY - hr - 20} ${hr + 8} ${headY + 34} L ${hr - 8} ${headY + 34} Q ${hr - 4} ${headY - 30} 20 ${headY - hr + 10} Q -10 ${headY - 34} ${-hr + 8} ${headY - 20} L ${-hr + 8} ${headY + 34} Z`}
        fill={INK}
        {...stroke}
      />
    ) : kind === 'sara' ? (
      <g>
        <path d={`M ${-hr + 4} ${headY - 18} Q -10 ${headY - hr - 34} ${hr - 4} ${headY - 24} Q 20 ${headY - hr + 6} ${-hr + 4} ${headY - 18} Z`} fill={INK} {...stroke} />
        <path d={`M ${hr - 8} ${headY - 40} q 46 0 40 70 q -6 30 -24 34`} fill="none" {...stroke} strokeWidth={9} />
        <circle cx={-20 + eyeDX} cy={headY - 6} r={17} fill="none" {...stroke} strokeWidth={3.5} />
        <circle cx={20 + eyeDX} cy={headY - 6} r={17} fill="none" {...stroke} strokeWidth={3.5} />
        <path d={`M ${-3 + eyeDX} ${headY - 6} L ${3 + eyeDX} ${headY - 6}`} {...stroke} strokeWidth={3.5} />
      </g>
    ) : (
      <g>
        <path d={`M ${-hr + 2} ${headY - 4} q -4 -14 6 -26 M ${hr - 2} ${headY - 4} q 4 -14 -6 -26`} fill="none" {...stroke} strokeWidth={6} />
        <path d={`M ${-28 + eyeDX * 0.6} ${headY + 22} q 14 -14 28 -2 q 14 -12 28 2 q -14 10 -28 2 q -14 8 -28 -2 Z`} fill={INK} {...stroke} strokeWidth={3} />
      </g>
    );

  const body =
    kind === 'mama' ? (
      <path d={`M -36 ${shoulderY - 6} Q 0 ${shoulderY - 18} 36 ${shoulderY - 6} L 64 -70 L -64 -70 Z`} fill="#fff" {...stroke} />
    ) : kind === 'sara' ? (
      <path d={`M -34 ${shoulderY - 6} Q 0 ${shoulderY - 18} 34 ${shoulderY - 6} L 40 ${hipY} L -40 ${hipY} Z`} fill="#fff" {...stroke} />
    ) : (
      <path d={`M -36 ${shoulderY - 6} Q 0 ${shoulderY - 18} 36 ${shoulderY - 6} L 42 ${hipY} L -42 ${hipY} Z`} fill="#fff" {...stroke} />
    );

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {!bust && (
        <g>
          {kind === 'mama' ? (
            <path d="M -20 -70 L -22 -6 M 20 -70 L 22 -6" {...stroke} />
          ) : (
            <path d={`M -18 ${hipY} L -24 -6 M 18 ${hipY} L 24 -6`} {...stroke} />
          )}
          <path d="M -24 -6 l -26 0 q -6 8 2 8 l 24 0 Z M 24 -6 l 26 0 q 6 8 -2 8 l -24 0 Z" fill={INK} {...stroke} strokeWidth={3} />
        </g>
      )}
      {arm(-1, armL)}
      {body}
      {kind === 'sara' && <path d={`M -40 ${hipY} L -48 -40 L 48 -40 L 40 ${hipY}`} fill="#fff" {...stroke} />}
      {(tie || kind === 'jefe') && <path d={`M 0 ${shoulderY - 10} l -9 14 l 9 60 l 9 -60 Z`} fill={INK} {...stroke} strokeWidth={3} />}
      {kind === 'dani' && !tie && <path d={`M -8 ${shoulderY - 6} q 8 10 16 0`} fill="none" {...stroke} strokeWidth={4} />}
      {arm(1, armR)}
      {/* cabeza */}
      <path d={`M 0 ${shoulderY - 8} L 0 ${headY + hr - 4}`} {...stroke} />
      <ellipse cx={0} cy={headY} rx={hr} ry={hr * 1.02} fill="#fff" {...stroke} />
      <path d={`M ${-hr} ${headY + 4} q -12 0 -10 14 q 2 10 12 6 M ${hr} ${headY + 4} q 12 0 10 14 q -2 10 -12 6`} fill="#fff" {...stroke} strokeWidth={4} />
      {hair}
      {eyes}
      {mouth}
    </g>
  );
};
