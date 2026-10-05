// «3 meses. 1.000 CVs. 0 llamadas.» — segundo vídeo de knok.
// 120 BPM (1 pulso = 15 frames). Escaleta en frames a 30 fps.

export const CV_TOTAL = 900;

export const CV_SCENES = {
  calendar: {from: 0, dur: 75}, //    0.0 –  2.5 s  "3 meses."
  copier: {from: 75, dur: 75}, //     2.5 –  5.0 s  "1.000 CVs."
  phone: {from: 150, dur: 90}, //     5.0 –  8.0 s  "0 llamadas."
  bin: {from: 240, dur: 90}, //       8.0 – 11.0 s  la papelera y el "¿te echo una mano?"
  makeover: {from: 330, dur: 150}, // 11.0 – 16.0 s  01 · un correo a medida
  match: {from: 480, dur: 120}, //    16.0 – 20.0 s  02 · ofertas que encajan
  tubes: {from: 600, dur: 90}, //     20.0 – 23.0 s  03 · un click
  whack: {from: 690, dur: 90}, //     23.0 – 26.0 s  04 · extensión
  ring: {from: 780, dur: 60}, //      26.0 – 28.0 s  ¡suena el teléfono!
  end: {from: 840, dur: 60}, //       28.0 – 30.0 s  knok · que te llamen a ti
} as const;

export const P = {
  ink: '#1D1A2F',
  paper: '#FFFDF7',
  cream: '#FFF6E9',
  lilac: '#B9A7FF',
  lilacDeep: '#8E78F0',
  mint: '#7EE0B5',
  mintDeep: '#3FBF8A',
  tomato: '#FF5A4E',
  sun: '#FFD23F',
  sky: '#7CC6FE',
  pink: '#FF9EC7',
  amber: '#FFB21E',
  orange: '#FF7A1A',
  grey: '#AEB8C8',
  line: '#D9D4E8',
};

export const OUTLINE = 7;
