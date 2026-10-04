import {Composition} from 'remotion';
import {Carta, CARTA_TOTAL} from './carta/Carta';
import {KnokCV} from './cv/KnokCV';
import {CV_TOTAL} from './cv/cvTheme';
import {KnokFilm} from './KnokFilm';
import {FPS, HEIGHT, TOTAL, WIDTH} from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Vídeo 1: cortometraje de tensión (38 s) */}
    <Composition id="KnokFilm" component={KnokFilm} durationInFrames={TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Vídeo 2: «3 meses. 1.000 CVs. 0 llamadas.» (30 s) */}
    <Composition id="KnokCV" component={KnokCV} durationInFrames={CV_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Vídeo 3: «Querida yo de hace tres meses» con voz en off (30 s) */}
    <Composition id="KnokCarta" component={Carta} durationInFrames={CARTA_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
