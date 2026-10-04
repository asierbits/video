import React from 'react';
import {C} from '../theme';

export type CharacterProps = {
  /** posición de los pies en coordenadas del SVG padre */
  x: number;
  y: number;
  scale?: number;
  /** ángulos en grados; 0 = brazo/pierna colgando hacia abajo, positivo = hacia delante (derecha) */
  armL?: number;
  armR?: number;
  legL?: number;
  legR?: number;
  bob?: number;
  headTilt?: number;
  lean?: number;
  /** 'color' = personaje completo, 'silhouette' = contraluz */
  look?: 'color' | 'silhouette' | 'cold';
  flip?: boolean;
  /** 0..1 cierra los ojos */
  blink?: number;
  /** movimiento de la bufanda */
  wind?: number;
  /** objeto en la mano derecha */
  holding?: React.ReactNode;
  opacity?: number;
  /** de espaldas a cámara */
  back?: boolean;
};

/**
 * Protagonista dibujado: cabeza grande, sudadera, y una bufanda ámbar —
 * el único elemento cálido en el mundo frío. Ese ámbar acaba siendo el color de KNOK.
 * Origen (0,0) = entre los pies. Altura total ≈ 240 unidades.
 */
export const Character: React.FC<CharacterProps> = ({
  x,
  y,
  scale = 1,
  armL = 0,
  armR = 0,
  legL = 0,
  legR = 0,
  bob = 0,
  headTilt = 0,
  lean = 0,
  look = 'color',
  flip = false,
  blink = 0,
  wind = 0,
  holding,
  opacity = 1,
  back = false,
}) => {
  const sil = look === 'silhouette';
  const cold = look === 'cold';
  const skin = sil ? C.ink : cold ? '#9FB0CF' : C.skin;
  const hoodie = sil ? C.ink : cold ? '#2A3556' : C.hoodie;
  const hoodieShade = sil ? C.ink : cold ? '#1E2743' : '#2C3860';
  const pants = sil ? C.ink : cold ? '#141B30' : '#1D2338';
  const hair = sil ? C.ink : C.hair;
  const scarf = C.amber;
  const shoe = sil ? C.ink : '#0E111C';

  const limb = (len: number, w: number, color: string) => (
    <rect x={-w / 2} y={0} width={w} height={len} rx={w / 2} fill={color} />
  );

  const scarfTail = `M -6 -150 C ${-14 - wind * 20} -128, ${-22 - wind * 46} ${-118 + wind * 8}, ${
    -30 - wind * 70
  } ${-104 + wind * 20} L ${-18 - wind * 62} ${-100 + wind * 22} C ${-12 - wind * 34} -116, ${
    -4 - wind * 12
  } -128, 6 -146 Z`;

  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}
      opacity={opacity}
    >
      {/* sombra */}
      {!sil && <ellipse cx={0} cy={2} rx={46} ry={8} fill="#000" opacity={0.28} />}
      <g transform={`rotate(${lean} 0 0)`}>
        {/* piernas */}
        <g transform={`translate(-13 ${-84 + bob}) rotate(${-legL})`}>
          {limb(80, 24, pants)}
          <ellipse cx={6} cy={82} rx={18} ry={9} fill={shoe} />
        </g>
        <g transform={`translate(13 ${-84 + bob}) rotate(${-legR})`}>
          {limb(80, 24, pants)}
          <ellipse cx={6} cy={82} rx={18} ry={9} fill={shoe} />
        </g>

        <g transform={`translate(0 ${bob})`}>
          {/* brazo trasero */}
          <g transform={`translate(-30 -142) rotate(${-armL})`}>
            {limb(66, 20, hoodieShade)}
            <circle cx={0} cy={66} r={11} fill={skin} />
          </g>

          {/* torso / sudadera */}
          <path
            d="M -38 -150 Q -42 -110 -36 -80 L 36 -80 Q 42 -110 38 -150 Q 0 -166 -38 -150 Z"
            fill={hoodie}
          />
          {!sil && <rect x={-36} y={-90} width={72} height={10} rx={4} fill={hoodieShade} />}
          {!sil && <path d="M -10 -120 L 10 -120 L 8 -100 L -8 -100 Z" fill={hoodieShade} />}

          {/* bufanda: siempre ámbar, incluso en silueta */}
          <path d={scarfTail} fill={scarf} />
          <rect x={-30} y={-160} width={60} height={18} rx={9} fill={scarf} />

          {/* cabeza */}
          <g transform={`translate(0 -196) rotate(${headTilt})`}>
            <circle cx={0} cy={0} r={38} fill={skin} />
            {back && <path d="M -38 4 C -40 -46, 40 -46, 38 4 C 34 26, 14 36, 0 36 C -14 36, -34 26, -38 4 Z" fill={hair} />}
            {/* pelo */}
            <path
              d="M -39 -2 C -42 -40, 30 -52, 40 -10 C 30 -24, 8 -30, -10 -22 C -20 -18, -32 -12, -39 -2 Z"
              fill={hair}
            />
            {!sil && !back && (
              <>
                <ellipse cx={-13} cy={6} rx={4.2} ry={5.5 * (1 - blink) + 0.6} fill={C.hair} />
                <ellipse cx={13} cy={6} rx={4.2} ry={5.5 * (1 - blink) + 0.6} fill={C.hair} />
                <ellipse cx={-22} cy={18} rx={6} ry={3.5} fill="#E8957A" opacity={cold ? 0 : 0.55} />
                <ellipse cx={22} cy={18} rx={6} ry={3.5} fill="#E8957A" opacity={cold ? 0 : 0.55} />
              </>
            )}
          </g>

          {/* brazo delantero */}
          <g transform={`translate(30 -142) rotate(${-armR})`}>
            {limb(66, 20, hoodie)}
            <circle cx={0} cy={66} r={11} fill={skin} />
            {holding && <g transform="translate(0 70)">{holding}</g>}
          </g>
        </g>
      </g>
    </g>
  );
};
