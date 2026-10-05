import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FilmGrain} from '../components/Overlays';
import {CV_SCENES, P} from './cvTheme';
import {C01Calendar} from './scenes/C01Calendar';
import {C02Copier} from './scenes/C02Copier';
import {C03Phone} from './scenes/C03Phone';
import {C04Bin} from './scenes/C04Bin';
import {C05Makeover} from './scenes/C05Makeover';
import {C06Match} from './scenes/C06Match';
import {C07Tubes} from './scenes/C07Tubes';
import {C08Whack} from './scenes/C08Whack';
import {C09Ring} from './scenes/C09Ring';
import {C10End} from './scenes/C10End';

const scenes: [keyof typeof CV_SCENES, string, React.FC][] = [
  ['calendar', '01 3 meses', C01Calendar],
  ['copier', '02 1.000 CVs', C02Copier],
  ['phone', '03 0 llamadas', C03Phone],
  ['bin', '04 Papelera', C04Bin],
  ['makeover', '05 Correo a medida', C05Makeover],
  ['match', '06 Match', C06Match],
  ['tubes', '07 Un click', C07Tubes],
  ['whack', '08 Extensión', C08Whack],
  ['ring', '09 Suena', C09Ring],
  ['end', '10 Cierre', C10End],
];

/** Pequeño "bote" de toda la imagen con el bombo durante el groove (11 s – 26 s). */
const useBeatBump = () => {
  const frame = useCurrentFrame();
  if (frame < CV_SCENES.makeover.from || frame >= CV_SCENES.ring.from) return 1;
  return 1 + 0.014 * Math.exp(-(frame % 15) / 3.5);
};

export const KnokCV: React.FC = () => {
  const bump = useBeatBump();
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <AbsoluteFill style={{transform: `scale(${bump})`}}>
        {scenes.map(([key, name, Scene]) => (
          <Sequence key={key} from={CV_SCENES[key].from} durationInFrames={CV_SCENES[key].dur} name={name}>
            <Scene />
          </Sequence>
        ))}
      </AbsoluteFill>
      <FilmGrain opacity={0.07} />
      <Audio src={staticFile('music-cv.wav')} />
    </AbsoluteFill>
  );
};
