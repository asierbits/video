"""
Voces del vídeo 4 («El diario de Dani»). Un personaje = una voz distinta (Kokoro-82M, Apache 2.0).

Cada voz se genera con fonética española y después se le cambia el tono (y por tanto el timbre)
remuestreando, para que los personajes se distingan bien. El robot lleva un efecto a propósito.

Salida: public/greg-voice.wav  +  src/greg/timings.json
"""

import json
import os
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

sys.path.insert(0, os.path.dirname(__file__))
from greg_lines import LINES, VOICES  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..")
KOKORO_DIR = os.environ.get("KOKORO_DIR", os.path.join(ROOT, "..", "tts"))
SR = 44100
FPS = 30
START = 0.35
KNOCK_GAP_AFTER = "l7"  # tras esta frase suenan los golpes en la puerta

from kokoro_onnx import Kokoro  # noqa: E402

k = Kokoro(os.path.join(KOKORO_DIR, "kokoro-v1.0.onnx"), os.path.join(KOKORO_DIR, "voices-v1.0.bin"))


def bq(x, kind, f, o=2):
    return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)


def render(who, text):
    voice, semis, speed, fx = VOICES[who]
    ratio = 2 ** (semis / 12)
    s, sr = k.create(text, voice=voice, speed=speed / ratio, lang="es")
    s = resample_poly(s, 147, 80)  # 24k -> 44.1k
    # subir/bajar tono: reproducir más rápido/lento (el timbre cambia con él)
    up, down = 1000, int(round(1000 * ratio))
    s = resample_poly(s, up, down)
    idx = np.where(np.abs(s) > 0.008)[0]
    s = s[max(0, idx[0] - 500) : idx[-1] + 1200]
    if fx == "robot":
        t = np.arange(len(s)) / SR
        s = s * (0.55 + 0.45 * np.sin(2 * np.pi * 55 * t))  # modulación en anillo
        s = np.round(s * 24) / 24  # un poco de "bitcrush"
        d = int(0.004 * SR)
        s = s + 0.5 * np.concatenate([np.zeros(d), s[:-d]])  # filtro peine metálico
        s = bq(s, "band", [300, 4500])
    s = s / (np.max(np.abs(s)) + 1e-9) * 0.85
    f = 300
    s[:f] *= np.linspace(0, 1, f)
    s[-f:] *= np.linspace(1, 0, f)
    return s


segs = []
t = START
timings = []
for lid, who, disp, say, pause in LINES:
    s = render(who, say)
    dur = len(s) / SR
    segs.append((t, s))
    timings.append({"id": lid, "who": who, "text": disp, "start": round(t, 3), "end": round(t + dur, 3)})
    t += dur + pause

total = t + 0.9
N = int(SR * max(total, 1))
v = np.zeros(N)
for st, s in segs:
    i = int(st * SR)
    v[i : i + len(s)] += s

# tratamiento común: limpieza, compresión suave, sala pequeña
v = bq(v, "high", 80)
env = np.sqrt(fftconvolve(v**2, np.ones(441) / 441, mode="same") + 1e-9)
v = v * np.minimum(1.0, (0.12 / env) ** 0.3)
rng = np.random.default_rng(4)
ir_t = np.arange(int(0.3 * SR)) / SR
ir = bq(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.05), "low", 5000)
v = v + fftconvolve(v, ir / np.sqrt(np.sum(ir**2)))[:N] * 0.05
v = v / (np.max(np.abs(v)) + 1e-9) * 0.9

with wave.open(os.path.join(ROOT, "public", "greg-voice.wav"), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((v * 32767).astype(np.int16).tobytes())

spf = SR // FPS
envf = [float(np.sqrt(np.mean(v[i * spf : (i + 1) * spf] ** 2))) for i in range(N // spf)]
mx = max(envf)
os.makedirs(os.path.join(ROOT, "src", "greg"), exist_ok=True)
json.dump(
    {"lines": timings, "env": [round(e / mx, 3) for e in envf], "total": round(total, 3)},
    open(os.path.join(ROOT, "src", "greg", "timings.json"), "w"),
    ensure_ascii=False,
)
for tm in timings:
    print(f'{tm["start"]:6.2f} – {tm["end"]:6.2f}  {tm["who"]:6s} {tm["text"]}')
print("total", round(total, 2))
