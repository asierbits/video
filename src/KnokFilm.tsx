import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {FilmGrain, Flash, Vignette} from './components/Overlays';
import {S01Doors} from './scenes/S01Doors';
import {S02Machine} from './scenes/S02Machine';
import {S03Eye} from './scenes/S03Eye';
import {S04Clock} from './scenes/S04Clock';
import {S05Knock} from './scenes/S05Knock';
import {S06Letter} from './scenes/S06Letter';
import {S07Scan} from './scenes/S07Scan';
import {S08Flock} from './scenes/S08Flock';
import {S09Extension} from './scenes/S09Extension';
import {S10Finale} from './scenes/S10Finale';
import {C, SCENES} from './theme';

const scenes: [keyof typeof SCENES, string, React.FC][] = [
  ['doors', '01 Puertas', S01Doors],
  ['machine', '02 Monolito', S02Machine],
  ['eye', '03 Ojo', S03Eye],
  ['clock', '04 Reloj', S04Clock],
  ['knock', '05 Toc toc', S05Knock],
  ['letter', '06 Correo', S06Letter],
  ['scan', '07 Escanear', S07Scan],
  ['flock', '08 Un click', S08Flock],
  ['extension', '09 Extensión', S09Extension],
  ['finale', '10 Final', S10Finale],
];

export const KnokFilm: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    {scenes.map(([key, name, Scene]) => (
      <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].dur} name={name}>
        <Scene />
      </Sequence>
    ))}
    {/* fogonazos sincronizados con los impactos de la música */}
    <Flash at={[SCENES.machine.from, SCENES.eye.from, SCENES.clock.from]} color={C.ice} max={0.5} />
    <Flash at={[SCENES.letter.from, SCENES.scan.from, SCENES.flock.from, SCENES.extension.from]} color={C.cream} max={0.45} />
    <Flash at={[SCENES.finale.from]} color="#fff" max={0.7} length={8} />
    <Vignette strength={0.6} />
    <FilmGrain />
    <Audio src={staticFile('music.wav')} />
  </AbsoluteFill>
);
