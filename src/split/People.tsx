import React from 'react';

export type Mood = 'neutral' | 'focus' | 'sad' | 'overwhelmed' | 'surprised' | 'happy' | 'excited';

const SKIN = {lucia: '#F2C2A0', marta: '#E6B08C'};

/**
 * Busto de personaje (cabeza + hombros) para sostener un móvil delante.
 * Origen (0,0) = centro de la cabeza. Radio de la cabeza = 110 * s.
 */
export const Bust: React.FC<{kind: 'lucia' | 'marta'; x: number; y: number; s?: number; mood?: Mood; blink?: number; tilt?: number; look?: number}> = ({
  kind,
  x,
  y,
  s = 1,
  mood = 'neutral',
  blink = 0,
  tilt = 0,
  look = 0,
}) => {
  const skin = SKIN[kind];
  const r = 110;
  const ink = '#24202E';
  const eyeOpen = Math.max(0.08, 1 - blink);
  const ex = 40;
  const ey = 6;
  const lx = look * 8;
  const brows: Record<Mood, [number, number]> = {
    neutral: [0, 0],
    focus: [6, 4],
    sad: [-12, 8],
    overwhelmed: [-6, -10],
    surprised: [0, -18],
    happy: [0, -6],
    excited: [0, -14],
  };
  const [browTilt, browLift] = brows[mood];
  const eyes =
    mood === 'happy' ? (
      <g stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round">
        <path d={`M ${-ex - 16} ${ey} q 16 -18 32 0`} />
        <path d={`M ${ex - 16} ${ey} q 16 -18 32 0`} />
      </g>
    ) : (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <ellipse cx={sd * ex + lx} cy={ey} rx={mood === 'surprised' || mood === 'overwhelmed' ? 17 : 13} ry={(mood === 'surprised' || mood === 'overwhelmed' ? 21 : 17) * eyeOpen} fill={ink} />
            <circle cx={sd * ex + lx - 4} cy={ey - 6 * eyeOpen} r={4.5 * eyeOpen} fill="#fff" />
          </g>
        ))}
      </g>
    );
  const my = 52;
  const mouth =
    mood === 'happy' || mood === 'excited' ? (
      <path d={`M -30 ${my - 6} Q 0 ${my + (mood === 'excited' ? 40 : 26)} 30 ${my - 6} Z`} fill="#9E3B3B" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
    ) : mood === 'sad' ? (
      <path d={`M -22 ${my + 10} Q 0 ${my - 8} 22 ${my + 10}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mood === 'surprised' ? (
      <ellipse cx={0} cy={my + 4} rx={13} ry={17} fill="#9E3B3B" stroke={ink} strokeWidth={5} />
    ) : mood === 'overwhelmed' ? (
      <path d={`M -26 ${my + 4} q 9 -10 17 0 q 9 10 17 0 q 9 -10 17 0`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : mood === 'focus' ? (
      <path d={`M -14 ${my + 2} L 14 ${my + 2}`} stroke={ink} strokeWidth={6} strokeLinecap="round" />
    ) : (
      <path d={`M -18 ${my} Q 0 ${my + 10} 18 ${my}`} stroke={ink} strokeWidth={6} fill="none" strokeLinecap="round" />
    );

  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`}>
      {/* hombros */}
      {kind === 'lucia' ? (
        <g>
          <path d="M -230 520 Q -230 200 -90 160 L 90 160 Q 230 200 230 520 Z" fill="#3B4A75" />
          <rect x={-120} y={120} width={240} height={60} rx={30} fill="#FFB21E" />
          <path d="M -60 170 Q -90 260 -120 330 L -80 340 Q -50 260 -20 180 Z" fill="#FFB21E" />
        </g>
      ) : (
        <g>
          <path d="M -230 520 Q -230 200 -90 160 L 90 160 Q 230 200 230 520 Z" fill="#23A99A" />
          <path d="M -40 160 L 0 260 L 40 160 Z" fill="#F7F3EA" />
          <path d="M -90 160 L -20 300 L -60 320 Z M 90 160 L 20 300 L 60 320 Z" fill="#1C8F82" />
        </g>
      )}
      <rect x={-34} y={80} width={68} height={90} fill={skin} />
      {/* pelo de detrás */}
      {kind === 'lucia' && <path d={`M ${-r - 8} 0 Q ${-r - 20} 200 -70 250 L 70 250 Q ${r + 20} 200 ${r + 8} 0 Z`} fill="#3A2318" />}
      {/* cabeza */}
      <circle cx={0} cy={0} r={r} fill={skin} />
      <ellipse cx={-r + 4} cy={14} rx={16} ry={24} fill={skin} />
      <ellipse cx={r - 4} cy={14} rx={16} ry={24} fill={skin} />
      {/* pelo */}
      {kind === 'lucia' ? (
        <path d={`M ${-r - 6} 10 C ${-r - 10} -90, -40 -${r + 30}, 20 -${r + 14} C 80 -${r + 4}, ${r + 16} -60, ${r + 6} 10 C 80 -50, 30 -40, -10 -70 C -40 -40, -80 -30, ${-r - 6} 10 Z`} fill="#3A2318" />
      ) : (
        <g>
          <path d={`M ${-r - 14} 60 C ${-r - 30} -80, -30 -${r + 30}, 20 -${r + 16} C 90 -${r + 6}, ${r + 30} -70, ${r + 14} 60 L ${r - 10} 60 C ${r - 6} -20, 60 -60, -10 -64 C -60 -40, ${-r + 10} -10, ${-r + 10} 60 Z`} fill="#A0472B" />
          <circle cx={-ex + lx} cy={ey} r={30} fill="none" stroke={ink} strokeWidth={6} />
          <circle cx={ex + lx} cy={ey} r={30} fill="none" stroke={ink} strokeWidth={6} />
          <path d={`M ${-10 + lx} ${ey} L ${10 + lx} ${ey}`} stroke={ink} strokeWidth={6} />
        </g>
      )}
      {/* cejas */}
      <g stroke={ink} strokeWidth={7} strokeLinecap="round">
        <path d={`M ${-ex - 20} ${-34 + browLift - browTilt * 0.5} L ${-ex + 18} ${-34 + browLift + browTilt * 0.5}`} />
        <path d={`M ${ex - 18} ${-34 + browLift + browTilt * 0.5} L ${ex + 20} ${-34 + browLift - browTilt * 0.5}`} />
      </g>
      {eyes}
      {(mood === 'happy' || mood === 'excited') && (
        <g>
          <ellipse cx={-62} cy={42} rx={18} ry={10} fill="#F08A8A" opacity={0.6} />
          <ellipse cx={62} cy={42} rx={18} ry={10} fill="#F08A8A" opacity={0.6} />
        </g>
      )}
      {mouth}
      {mood === 'overwhelmed' && <path d={`M ${r - 20} -50 q 14 26 0 34 q -14 -8 0 -34 Z`} fill="#8EC9F2" stroke={ink} strokeWidth={3} />}
      {mood === 'sad' && <path d={`M ${ex + 6} ${ey + 22} q 8 16 0 22 q -8 -6 0 -22 Z`} fill="#8EC9F2" />}
    </g>
  );
};

/** Manos que sujetan el móvil (se dibujan encima del móvil). */
export const Hands: React.FC<{x: number; y: number; w: number; skin: string}> = ({x, y, w, skin}) => (
  <g>
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${x + (sd * w) / 2} ${y})`}>
        <ellipse cx={sd * 14} cy={0} rx={34} ry={56} fill={skin} />
        <ellipse cx={-sd * 12} cy={-46} rx={14} ry={26} fill={skin} transform={`rotate(${sd * -20} ${-sd * 12} -46)`} />
      </g>
    ))}
  </g>
);
