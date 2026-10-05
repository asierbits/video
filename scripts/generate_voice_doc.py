"""
Voz en off del vídeo de YouTube «Por qué buscar trabajo se ha roto (y cómo arreglarlo)».

Motor: Kokoro-82M (Apache 2.0) vía kokoro-onnx, voz femenina en español «ef_dora».
Necesita los ficheros del modelo (descarga desde las releases de GitHub de kokoro-onnx):
  kokoro-v1.0.onnx y voices-v1.0.bin  ->  carpeta indicada en KOKORO_DIR (por defecto ../tts)

Salida:
  public/doc-voice.wav        voz procesada (44.1 kHz)
  src/doc/timings.json        inicio/fin de cada frase y capítulo + envolvente por frame
"""

import json
import os
import sys

import numpy as np
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

sys.path.insert(0, os.path.dirname(__file__))
from doc_lines import LINES, CHAPTERS  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..")
KOKORO_DIR = os.environ.get("KOKORO_DIR", os.path.join(ROOT, "..", "tts"))
VOICE = "ef_dora"
SPEED = 1.0
START = 1.2  # s antes de la primera frase (logo de apertura)
SR = 44100
FPS = 30
DUR = 290.0

from kokoro_onnx import Kokoro  # noqa: E402

k = Kokoro(os.path.join(KOKORO_DIR, "kokoro-v1.0.onnx"), os.path.join(KOKORO_DIR, "voices-v1.0.bin"))

out = np.zeros(int(SR * DUR))
t = START
timings = []
for lid, chap, disp, say, pause in LINES:
    s, sr = k.create(say, voice=VOICE, speed=SPEED, lang="es")
    s = resample_poly(s, 147, 80)  # 24 kHz -> 44.1 kHz
    idx = np.where(np.abs(s) > 0.008)[0]
    s = s[max(0, idx[0] - 600) : idx[-1] + 1200]
    fade = 400
    s[:fade] *= np.linspace(0, 1, fade)
    s[-fade:] *= np.linspace(1, 0, fade)
    i = int(t * SR)
    out[i : i + len(s)] += s[: len(out) - i]
    dur = len(s) / SR
    timings.append({"id": lid, "chapter": chap, "text": disp, "start": round(t, 3), "end": round(t + dur, 3)})
    t += dur + pause

# --- tratamiento: limpieza de graves, un poco de cuerpo y presencia, sala muy sutil
def bq(x, kind, f, order=2):
    return sosfilt(butter(order, f, btype=kind, fs=SR, output="sos"), x)

v = bq(out, "high", 75)
body = bq(v, "band", [180, 400]) * 0.12
air = bq(v, "high", 6000) * 0.10
v = v + body + air
# compresión suave
env = np.sqrt(fftconvolve(v**2, np.ones(441) / 441, mode="same") + 1e-9)
gain = np.minimum(1.0, (0.12 / env) ** 0.35)
v = v * gain
# sala pequeña
rng = np.random.default_rng(3)
ir_t = np.arange(int(0.35 * SR)) / SR
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.06)
ir = bq(ir, "low", 5000)
ir /= np.sqrt(np.sum(ir**2))
v = v + fftconvolve(v, ir)[: len(v)] * 0.06
v = v / (np.max(np.abs(v)) + 1e-9) * 0.89

# envolvente por frame (para ondas que "hablan" en pantalla)
spf = SR // FPS
env_frames = [float(np.sqrt(np.mean(v[f * spf : (f + 1) * spf] ** 2))) for f in range(int(DUR * FPS))]
mx = max(env_frames)
env_frames = [round(e / mx, 3) for e in env_frames]

import wave

with wave.open(os.path.join(ROOT, "public", "doc-voice.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    st = np.repeat((v * 32767).astype(np.int16)[:, None], 2, axis=1)
    w.writeframes(st.tobytes())

os.makedirs(os.path.join(ROOT, "src", "doc"), exist_ok=True)
with open(os.path.join(ROOT, "src", "doc", "timings.json"), "w") as f:
    json.dump({"lines": timings, "chapters": CHAPTERS, "total": round(t + 3.5, 2), "env": env_frames}, f, ensure_ascii=False)

for tm in timings:
    print(f'{tm["start"]:7.2f} – {tm["end"]:7.2f}  {tm["id"]}  {tm["text"][:60]}')
print("voz termina en", round(timings[-1]["end"], 2), "s")
