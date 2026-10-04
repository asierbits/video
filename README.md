# knok — vídeos promocionales (vertical 9:16)

Vídeo de 38 s (1080×1920, 30 fps) hecho 100 % con código en [Remotion](https://remotion.dev).
Personajes y objetos dibujados en SVG, banda sonora original sintetizada (sin derechos de terceros).

**Resultados:**
- Vídeo 1 · cortometraje de tensión (38 s): [`render/knok.mp4`](render/knok.mp4)
- Vídeo 2 · «3 meses. 1.000 CVs. 0 llamadas.» (30 s): [`render/knok-cv.mp4`](render/knok-cv.mp4)
- Vídeo 3 · «Querida yo de hace tres meses» con voz en off (30 s): [`render/knok-carta.mp4`](render/knok-carta.mp4)
- Vídeo 4 · «El diario de Dani», historia con 5 voces (30 s): [`render/diario-dani.mp4`](render/diario-dani.mp4)

---

## Vídeo 4 — «El diario de Dani»

Historia contada en las páginas de un cuaderno de rayas, con personajes originales dibujados "a boli"
(en el espíritu de los diarios ilustrados), línea temblorosa de animación a mano, pasos de página en 3D y
bocadillos. **No promociona el producto**: la historia lleva a la idea de knok (llamar bien, a la puerta correcta)
y sólo hay un guiño sutil en la portada final (una puerta con ondas de "toc toc").

| Personaje | Voz (Kokoro) | Frase |
|---|---|---|
| Dani (narrador) | `em_alex` +1,5 semitonos | «Lunes. Hoy he mandado cincuenta currículums. El mismo a todos. Eficiencia pura.» |
| Robot del filtro | `am_michael` + efecto robot | «Su perfil no encaja con nuestros requisitos.» |
| Mamá | `ef_dora` −1,5 semitonos | «En mis tiempos ibas a la puerta y llamabas.» |
| Sara | `if_sara` (fonética española) | «Pues llama a menos puertas… pero llama bien.» |
| Entrevistador | `em_santa` −3 semitonos | «¿Daniel? Pasa, pasa.» |

Final: *«Nota mental: mamá tenía razón. Solo había que llamar… a la puerta correcta.»* — y mamá asoma: «te lo dije».

Guion en `scripts/greg_lines.py`; voces `scripts/generate_voice_greg.py`; música (ukelele) y efectos
`scripts/generate_music_greg.py`; animación `src/greg/`. Exportar: `npm run render:diario`.

---

## Vídeo 3 — «Querida yo de hace tres meses»

Una chica le habla a su yo del pasado, como una carta en voz alta. Visualmente es **un único plano**:
una línea del tiempo que baja por la página mientras se dibujan ilustraciones de línea fina, de la noche azul
(el pasado) al amanecer cálido (knok). Subtítulos escritos a mano y sincronizados palabra a palabra.

> Querida yo de hace tres meses: sé que estás cansada. Que mandas currículums a ciegas… y que cada
> «ya te llamaremos» duele un poquito más. Te cuento un secreto: no eras tú. Era el método.
> Un día encontré knok. Escribe correos que suenan a mí. Busca por todo internet las ofertas que encajan
> conmigo. Y con un solo clic… salen todas. Hasta aplica por mí en LinkedIn. ¿Y sabes qué? El lunes
> empiezo. Así que respira. Lo mejor está por llegar.
>
> *Con cariño, tu yo del futuro.* — knok

- **Voz:** Kokoro-82M (Apache 2.0, uso comercial permitido), voz femenina en español `ef_dora`, procesada
  (EQ, compresión suave, sala). Guion en `scripts/voice_lines.py` (texto en pantalla + texto fonético para la voz).
- **Música:** piano íntimo en Si menor que se abre a Re mayor al decir «encontré knok»; baja sola cuando habla la voz.
- **Cambiar la voz por una grabación real:** sustituye `public/voice.wav` y ajusta los tiempos en
  `src/carta/timings.json`, después `python3 scripts/generate_music_carta.py`.

```bash
pip install kokoro-onnx soundfile numpy scipy
# modelo: kokoro-v1.0.onnx y voices-v1.0.bin (releases de github.com/thewh1teagle/kokoro-onnx) en ../tts o KOKORO_DIR
python3 scripts/generate_voice.py && python3 scripts/generate_music_carta.py
npm run render:carta
```

---

## Vídeo 2 — «3 meses. 1.000 CVs. 0 llamadas.»

Tono cercano y con humor. El protagonista es el propio **CV**: una hoja con cara, brazos y piernas de dibujo animado clásico.
Colores vivos tipo papel, rotulador y pósits. Música alegre (120 BPM, Do mayor) con efectos cómicos.

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0–2,5 s | Calendario | Pasan marzo, abril, mayo, junio, llenos de cruces. Pósit: *3 meses.* |
| 2,5–5 s | Fotocopiadora | Escupe copias idénticas (y aburridas) del CV. Contador hasta 1000. Pósit: *1.000 CVs.* |
| 5–8 s | El móvil | En la mesa, criando telarañas, una araña y una bola de paja. Trombón triste. Pósit: *0 llamadas.* |
| 8–11 s | Papelera | Al CV le caen bolas de papel (¡bonk!). Baja un móvil con knok: *¿Te echo una mano?* Y salta. |
| 11–16 s | 01 · Correo a medida | Un probador: boina, corbata, cascos, casco de obra… cada empresa, un saludo distinto. |
| 16–20 s | 02 · Ofertas que encajan | Un "match" de ofertas: NOPE / ¡MATCH! y los corazones van a un bote. |
| 20–23 s | 03 · Un solo click | Salta sobre ENVIAR y los correos salen disparados por tubos neumáticos. |
| 23–26 s | 04 · Extensión de Chrome | Aplasta-topos: el mazo knok convierte cada "Aplicar" en "hecho" en LinkedIn, InfoJobs, Indeed. |
| 26–28 s | ¡Suena! | El mismo móvil vibra, se rompe la telaraña: *Nova Studio*. El pósit: ~~0 llamadas~~ *¡Me llaman!* |
| 28–30 s | Cierre | **knok** · *Que te llamen a ti.* |

Código: `src/cv/` (escenas `C01…C10`, personaje `Sheet.tsx`). Música: `scripts/generate_music_cv.py` → `public/music-cv.wav`.

---

## Vídeo 1 — cortometraje

## Guion (escaleta)

| Tiempo | Escena | Qué pasa |
|---|---|---|
| 0–4 s | La torre de puertas | El protagonista (bufanda ámbar, lo único cálido del mundo) llama a la puerta Nº 347. Se apaga. La cámara se aleja: miles de puertas, todas apagándose. |
| 4–8 s | El monolito | Lanza su CV como avión de papel contra un monolito de datos ("filtro automático"). Cada avión se pixela y desaparece: *descartado 0.3 s*. |
| 8–12 s | El ojo | Un ojo-IA gigante barre con un foco, lo encuentra, "encaje 12 %", y el personaje se descompone en píxeles. Parpadeo = corte. |
| 12–15 s | El reloj | Plano cenital: sentado en el centro de un reloj gigante, llueven sobres con "NO". *El mundo cambió.* La luz se cierra. *¿Y tú?* |
| 15–18 s | Toc, toc | Silencio. Una aldaba golpea dos veces, la luz se cuela por las rendijas, la puerta se abre: **knok**. |
| 18–22 s | 01 · Tu correo, con tu voz | Una pluma escribe la carta, pegatinas de personalización (empresa, puesto, tono), mando de tono formal→cercano, sobre y lacre con la "k". |
| 22–27 s | 02 · Escanea internet | Interruptores de requisitos, botón ESCANEAR, radar sobre un mapa de puntos, ofertas que aparecen, contador de paletas hasta 128. |
| 27–30 s | 03 · Un solo click | "Enviar a las 128": las cartas se convierten en pájaros de papel que vuelan a la torre del inicio… y ahora las puertas se abren. |
| 30–34 s | 04 · Extensión de Chrome | Una pieza de puzle encaja en el navegador y aplica sola en LinkedIn, InfoJobs, Indeed… |
| 34–38 s | Final | Camina hacia una puerta llena de luz, la cámara entra en ella. **knok** + *Que el futuro te abra la puerta.* + último toc-toc. |

Narrativa de color: mundo frío (azul/cian de la IA) → ámbar (la bufanda del protagonista = el color de knok).

## Música

`scripts/generate_music.py` sintetiza la banda sonora a 120 BPM (1 pulso = 15 frames), así que cada corte cae en el ritmo:
dron grave + reloj + latido + ostinato creciente + *braams* en el acto 1, silencio y dos golpes de puerta reales,
y un pulso épico tipo taiko (Re m – Si♭ – Fa – Do) en el acto 2.

## Cómo usarlo

```bash
npm install
npm run music     # (opcional) regenera las músicas — requiere python3 + numpy + scipy
npm run studio    # previsualizar y editar en el navegador
npm run render    # exporta out/knok.mp4 (vídeo 1)
npm run render:cv # exporta out/knok-cv.mp4 (vídeo 2)
```

Estructura: `src/theme.ts` (escaleta, colores, fuentes), `src/scenes/S01…S10` (una escena por archivo),
`src/components/Character.tsx` (el protagonista), `public/fonts` (Unbounded, JetBrains Mono, Instrument Serif, Space Grotesk — licencia OFL).
