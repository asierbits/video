import {Composition} from 'remotion';
import {KnokFilm} from './KnokFilm';
import {FPS, HEIGHT, TOTAL, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="KnokFilm"
    component={KnokFilm}
    durationInFrames={TOTAL}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
