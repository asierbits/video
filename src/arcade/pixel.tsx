import React from 'react';

/** Paleta 16 colores (estilo consola de 8 bits). */
export const PAL: Record<string, string> = {
  '0': '#000000',
  '1': '#1D2B53',
  '2': '#7E2553',
  '3': '#008751',
  '4': '#AB5236',
  '5': '#5F574F',
  '6': '#C2C3C7',
  '7': '#FFF1E8',
  '8': '#FF004D',
  '9': '#FFA300',
  a: '#FFEC27',
  b: '#00E436',
  c: '#29ADFF',
  d: '#83769C',
  e: '#FF77A8',
  f: '#FFCCAA',
};

export type Grid = string[];

/** Dibuja un sprite (filas de caracteres de la paleta; '.' = transparente) fusionando tramos horizontales. */
export const Sprite: React.FC<{grid: Grid; x: number; y: number; px: number; opacity?: number; tint?: Record<string, string>}> = ({grid, x, y, px, opacity = 1, tint}) => {
  const rects: React.ReactNode[] = [];
  grid.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') {
        c++;
        continue;
      }
      let e = c + 1;
      while (e < row.length && row[e] === ch) e++;
      rects.push(<rect key={`${r}-${c}`} x={x + c * px} y={y + r * px} width={(e - c) * px} height={px} fill={(tint && tint[ch]) || PAL[ch] || ch} />);
      c = e;
    }
  });
  return (
    <g opacity={opacity} shapeRendering="crispEdges">
      {rects}
    </g>
  );
};

const blank = (w: number, h: number) => Array.from({length: h}, () => Array.from({length: w}, () => '.'));
const toGrid = (m: string[][]) => m.map((r) => r.join(''));

/** CV de 12x16. odd = el "diferente": sonríe y lleva una insignia de color. */
export const cvSprite = (odd = false, mood: 'flat' | 'smile' = 'flat'): Grid => {
  const m = blank(12, 16);
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 12; x++) {
      const border = x === 0 || x === 11 || y === 0 || y === 15;
      m[y][x] = border ? '5' : '7';
    }
  // esquina doblada
  m[0][9] = '.';
  m[0][10] = '.';
  m[0][11] = '.';
  m[1][10] = '.';
  m[1][11] = '.';
  m[2][11] = '.';
  m[1][9] = '5';
  m[2][10] = '5';
  m[3][11] = '5';
  m[1][8] = '5';
  m[2][9] = '6';
  m[3][10] = '5';
  // ojos
  m[5][4] = '1';
  m[5][7] = '1';
  // boca
  if (odd || mood === 'smile') {
    m[7][4] = '1';
    m[8][5] = '1';
    m[8][6] = '1';
    m[7][7] = '1';
  } else {
    m[8][5] = '1';
    m[8][6] = '1';
  }
  // líneas de texto
  for (let x = 2; x < 10; x++) m[11][x] = '6';
  for (let x = 2; x < 7; x++) m[13][x] = '6';
  if (odd) {
    m[2][2] = 'e';
    m[2][3] = 'e';
    m[3][2] = 'e';
    m[3][3] = 'e';
    m[13][8] = 'a';
    m[13][9] = 'a';
  }
  return toGrid(m);
};

/** Persona 8x12 (dos poses de carrera). */
export const runner = (frame: number, shirt = 'c'): Grid => {
  const step = frame % 2;
  return [
    '..4444..',
    '.4ffff4.',
    '.ff1f1f.',
    '.ffffff.',
    '..ffff..',
    `.${shirt}${shirt}${shirt}${shirt}${shirt}${shirt}.`,
    `f${shirt}${shirt}${shirt}${shirt}${shirt}${shirt}f`,
    `.${shirt}${shirt}${shirt}${shirt}${shirt}${shirt}.`,
    '..1111..',
    step ? '.11..11.' : '..1..1..',
    step ? '.1....1.' : '..1..1..',
    step ? '00....00' : '.00..00.',
  ];
};

export const door = (open: number): Grid => {
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let r = '';
    for (let x = 0; x < 10; x++) {
      const frame = x === 0 || x === 9 || y === 0;
      if (frame) r += '4';
      else if (open) r += x <= 2 ? '9' : y > 12 ? 'a' : '0';
      else r += x === 7 && y === 9 ? 'a' : '9';
    }
    rows.push(r);
  }
  return rows;
};

export const heart: Grid = ['.88.88.', '8888888', '8888888', '.88888.', '..888..', '...8...'];
export const check: Grid = ['......b', '.....bb', 'b...bb.', 'bb.bb..', '.bbb...', '..b....'];
export const cross: Grid = ['8.....8', '.8...8.', '..8.8..', '...8...', '..8.8..', '.8...8.', '8.....8'];
export const arrowDown: Grid = ['..aaa..', '..aaa..', '..aaa..', 'aaaaaaa', '.aaaaa.', '..aaa..', '...a...'];
export const coinK: Grid = [
  '...aaaa...',
  '.aa9999aa.',
  '.a949949a.',
  'a99494999a',
  'a99449999a',
  'a99494999a',
  '.a949949a.',
  '.aa9999aa.',
  '...aaaa...',
];
