import {continueRender, delayRender, staticFile} from 'remotion';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// 120 BPM -> un pulso = 15 frames. Todos los cortes caen sobre el ritmo.
export const BEAT = 15;

/** Escaleta (frames). */
export const SCENES = {
  doors: {from: 0, dur: 120}, //        0.0 –  4.0 s  la torre de puertas
  machine: {from: 120, dur: 120}, //    4.0 –  8.0 s  aviones de papel vs. el monolito
  eye: {from: 240, dur: 120}, //        8.0 – 12.0 s  el ojo que analiza
  clock: {from: 360, dur: 90}, //      12.0 – 15.0 s  el reloj y la marea de rechazos
  knock: {from: 450, dur: 90}, //      15.0 – 18.0 s  toc, toc: se abre la puerta (KNOK)
  letter: {from: 540, dur: 120}, //    18.0 – 22.0 s  01 · correo personalizado
  scan: {from: 660, dur: 150}, //      22.0 – 27.0 s  02 · escanear ofertas
  flock: {from: 810, dur: 90}, //      27.0 – 30.0 s  03 · un click
  extension: {from: 900, dur: 120}, // 30.0 – 34.0 s  04 · extensión de Chrome
  finale: {from: 1020, dur: 120}, //   34.0 – 38.0 s  final
} as const;

export const TOTAL = 1140;

export const C = {
  ink: '#06070D',
  night: '#0B1020',
  navy: '#121A33',
  steel: '#25304F',
  fog: '#5A6786',
  ice: '#BFE9FF',
  cyan: '#4FF0FF',
  blue: '#2F6BFF',
  red: '#FF3B3B',
  amber: '#FFB21E',
  orange: '#FF7A1A',
  ember: '#E2531B',
  cream: '#FFF4E0',
  paper: '#F5ECDD',
  skin: '#F2C2A0',
  hair: '#1B1424',
  hoodie: '#3B4A75',
  wine: '#7A1730',
};

// Fuentes empaquetadas en /public/fonts (Google Fonts, OFL) para renderizar sin conexión.
const FONT_FILES: [string, string, string, string][] = [
  ['Unbounded', 'unbounded-900.woff2', '900', 'normal'],
  ['JetBrains Mono', 'jbmono-400.woff2', '400', 'normal'],
  ['JetBrains Mono', 'jbmono-700.woff2', '700', 'normal'],
  ['Instrument Serif', 'instrument-serif-italic.woff2', '400', 'italic'],
  ['Space Grotesk', 'grotesk-500.woff2', '500', 'normal'],
  ['Space Grotesk', 'grotesk-700.woff2', '700', 'normal'],
  ['Permanent Marker', 'permanent-marker.woff2', '400', 'normal'],
  ['Fredoka', 'fredoka-600.woff2', '600', 'normal'],
  ['Fredoka', 'fredoka-700.woff2', '700', 'normal'],
  ['Caveat', 'caveat-600.woff2', '600', 'normal'],
  ['Patrick Hand', 'patrick-hand.woff2', '400', 'normal'],
];

if (typeof document !== 'undefined') {
  const handle = delayRender('Cargando fuentes');
  Promise.all(
    FONT_FILES.map(([family, file, weight, style]) =>
      new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight, style})
        .load()
        .then((f) => document.fonts.add(f)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

export const fonts = {
  logo: 'Unbounded, sans-serif',
  mono: '"JetBrains Mono", monospace',
  serif: '"Instrument Serif", serif',
  sans: '"Space Grotesk", sans-serif',
  marker: '"Permanent Marker", cursive',
  round: 'Fredoka, sans-serif',
  hand: 'Caveat, cursive',
  diary: '"Patrick Hand", cursive',
};
