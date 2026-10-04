import {Composition} from 'remotion';
import {Carta, CARTA_TOTAL} from './carta/Carta';
import {KnokCV} from './cv/KnokCV';
import {Greg, GREG_TOTAL} from './greg/Greg';
import {Arcade, ARCADE_TOTAL} from './arcade/Arcade';
import {Launch, LAUNCH_TOTAL} from './launch/Launch';
import {Machine, MACHINE_TOTAL} from './machine/Machine';
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
    {/* Vídeo 4: «El diario de Dani», historia con varias voces (30 s) */}
    <Composition id="DiarioDani" component={Greg} durationInFrames={GREG_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Vídeo 5: «Reto arcade», minijuego retro interactivo (30 s) */}
    <Composition id="RetoArcade" component={Arcade} durationInFrames={ARCADE_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Vídeo 6: «Lanzamiento», película de producto premium sin voces (30 s) */}
    <Composition id="Lanzamiento" component={Launch} durationInFrames={LAUNCH_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* Vídeo 7: «La máquina», reacción en cadena de plastilina sin voces (30 s) */}
    <Composition id="LaMaquina" component={Machine} durationInFrames={MACHINE_TOTAL} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
