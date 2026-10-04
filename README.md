# knok — vídeos promocionales (vertical 9:16)

Vídeo de 38 s (1080×1920, 30 fps) hecho 100 % con código en [Remotion](https://remotion.dev).
Personajes y objetos dibujados en SVG, banda sonora original sintetizada (sin derechos de terceros).

**Resultados:**
- Vídeo 1 · cortometraje de tensión (38 s): [`render/knok.mp4`](render/knok.mp4)
- Vídeo 2 · «3 meses. 1.000 CVs. 0 llamadas.» (30 s): [`render/knok-cv.mp4`](render/knok-cv.mp4)

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
