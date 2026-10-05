"""
Banda sonora + mezcla final del vídeo de YouTube «Por qué buscar trabajo se ha roto (y cómo arreglarlo)».

Cada capítulo tiene su ambiente; la música baja sola cuando habla la voz (ducking) y cada tarjeta
de capítulo lleva un "whoosh" + golpe suave. Lee los tiempos de src/doc/timings.json.

Requiere: python3 scripts/generate_voice_doc.py   ->   Salida: public/doc-mix.wav
"""

import json
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
TM = json.load(open(os.path.join(ROOT, "src", "doc", "timings.json")))
LINES = TM["lines"]
END_SCREEN = 9.8
DUR = LINES[-1]["end"] + END_SCREEN
SR = 44100
N = int(SR * DUR)
rng = np.random.default_rng(17)

mus = np.zeros((N, 2))
fx = np.zeros((N, 2))


def T(d):
    return np.arange(int(SR * d)) / SR


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def filt(x, kind, f, o=2):
    return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)


def put(buf, sig, at, g=1.0, pan=0.0):
    i = int(at * SR)
    if not (0 <= i < N):
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(sig), 0] += sig * g * l
    buf[i : i + len(sig), 1] += sig * g * r


def pad(notes, d, cutoff=900, att=0.8):
    t = T(d)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.08, 0.08):
            s += 2 * ((midi(n) * 2 ** (det / 12) * t + rng.random()) % 1) - 1
    s = filt(s / (len(notes) * 2), "low", cutoff)
    return s * np.clip(t / att, 0, 1) * np.clip((d - t) / 0.8, 0, 1)


def piano(n, d=2.4, vel=0.8):
    t = T(d)
    f = midi(n)
    s = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (0.9 + h * 0.7)) for h, a in [(1, 1), (2, 0.45), (3, 0.2), (4, 0.1)])
    s = filt(s, "low", 1500 + 1500 * vel)
    return s * np.clip(t / 0.006, 0, 1) * np.clip((d - t) / 0.3, 0, 1) * vel * 0.5


def pluck(n, d=0.3, bright=3000):
    t = T(d)
    s = (2 * ((midi(n) * t) % 1) - 1) * 0.5 + np.sin(2 * np.pi * midi(n) * t) * 0.5
    return filt(s, "low", bright) * np.exp(-t / 0.1)


def kick(soft=1.0):
    t = T(0.35)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(45 + 100 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.14) * 2) * soft


def shaker():
    t = T(0.08)
    return filt(rng.standard_normal(len(t)), "band", [5000, 11000]) * np.sin(np.pi * t / 0.08) ** 2


def clap():
    t = T(0.22)
    n = filt(rng.standard_normal(len(t)), "band", [900, 6000])
    return n * (np.exp(-t / 0.012) * 0.5 + (t > 0.02) * np.exp(-np.clip(t - 0.02, 0, None) / 0.07))


def sub(n, d):
    t = T(d)
    return np.sin(2 * np.pi * midi(n) * t) * np.clip(t / 0.01, 0, 1) * np.clip((d - t) / 0.05, 0, 1)


def tick():
    t = T(0.03)
    return filt(rng.standard_normal(len(t)), "band", [3000, 8000]) * np.exp(-t / 0.005)


def glitch(d=0.12):
    t = T(d)
    f = rng.uniform(400, 2400)
    return np.sign(np.sin(2 * np.pi * f * t)) * np.round(rng.standard_normal(len(t)) * 2) / 2 * (1 - t / d) * 0.4


def whoosh(d=0.8):
    t = T(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    zi = None
    for s in range(0, len(n), 256):
        p = s / len(n)
        lo = 300 + 4500 * p
        sos = butter(2, [lo, lo * 1.8], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[s : s + 256], zi = sosfilt(sos, n[s : s + 256], zi=zi)
    return out * np.sin(np.pi * t / d) ** 1.5 * 1.4


def hit():
    t = T(2.0)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(35 + 60 * np.exp(-t / 0.1)) / SR) * np.exp(-t / 0.5) * 1.5) + pad([50, 57, 62], 2.0, 1200, 0.01) * np.exp(-t / 0.7) * 0.6


def bell(n, d=1.2):
    t = T(d)
    f = midi(n)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.5) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15)) * np.clip(t / 0.002, 0, 1)


def chap_start(ch):
    return next(l["start"] for l in LINES if l["chapter"] == ch)


CH = ["intro", "antes", "embudo", "ia", "funciona", "knok", "cierre"]
BOUNDS = {c: chap_start(c) for c in CH}
BOUNDS["intro"] = 0.0
SEC = {c: (BOUNDS[c] if i == 0 else BOUNDS[c] - 2.6, (BOUNDS[CH[i + 1]] - 2.6) if i + 1 < len(CH) else DUR) for i, c in enumerate(CH)}


def section_pad(t0, t1, prog, bar, cutoff, gain, pianos=False, arp=None, drums=None, bass=True):
    k = 0
    t = t0
    while t < t1 - 0.2:
        notes, root = prog[k % len(prog)]
        d = min(bar, t1 - t) + 0.4
        put(mus, pad(notes, d, cutoff), t, 0.16 * gain)
        if bass:
            put(mus, sub(root - 12, min(bar, t1 - t)), t, 0.22 * gain)
        if pianos:
            put(mus, piano(root + 12, 3.0, 0.7), t, 0.4 * gain, -0.2)
            for j, n in enumerate([notes[1] + 12, notes[2] + 12, notes[0] + 24, notes[2] + 12]):
                st = t + (j + 1) * bar / 5
                if st < t1:
                    put(mus, piano(n, 2.0, 0.5), st, 0.25 * gain, -0.3 + 0.2 * j)
        if arp:
            step = arp
            m = 0
            st = t
            while st < min(t + bar, t1):
                n = [notes[0], notes[1], notes[2], notes[1]][m % 4] + 12
                put(mus, pluck(n), st, 0.07 * gain, -0.3 + 0.6 * (m % 2))
                st += step
                m += 1
        if drums:
            beat, kinds = drums
            st = t
            m = 0
            while st < min(t + bar, t1):
                if "k" in kinds and m % 2 == 0:
                    put(mus, kick(0.8), st, 0.45 * gain)
                if "c" in kinds and m % 4 == 2:
                    put(mus, clap(), st, 0.25 * gain, 0.05)
                if "s" in kinds:
                    put(mus, shaker(), st + beat / 2, 0.08 * gain, 0.4)
                st += beat
                m += 1
        t += bar
        k += 1


# intro: tensión contenida (La m)
s0, s1 = SEC["intro"]
section_pad(s0 + 0.2, s1, [([57, 60, 64], 45), ([53, 57, 60], 41), ([48, 55, 60], 36), ([55, 59, 62], 43)], 4.0, 700, 0.9)
tt = 1.0
while tt < s1 - 0.5:
    put(fx, tick(), tt, 0.12, 0.3 if int(tt * 2) % 2 else -0.3)
    tt += 0.5

# antes: nostálgico, piano (Do)
a0, a1 = SEC["antes"]
section_pad(a0, a1, [([60, 64, 67], 48), ([57, 60, 64], 45), ([53, 57, 60], 41), ([55, 59, 62], 43)], 3.0, 800, 1.0, pianos=True, bass=False)

# embudo: pulso que crece (Re m)
b0, b1 = SEC["embudo"]
section_pad(b0, b1, [([62, 65, 69], 50), ([58, 62, 65], 46), ([57, 60, 65], 41), ([60, 64, 67], 48)], 2.4, 1100, 1.0, arp=0.15, drums=(0.6, "k"))

# IA: oscuro y electrónico, con chispazos (Mi m) y un claro al final
c0, c1 = SEC["ia"]
section_pad(c0, c1, [([64, 67, 71], 52), ([60, 64, 67], 48), ([55, 59, 62], 43), ([62, 66, 69], 50)], 2.4, 900, 0.9, arp=0.3)
for gt in np.arange(c0 + 1.0, c1 - 6, 1.7):
    put(fx, glitch(rng.uniform(0.05, 0.15)), gt + rng.uniform(0, 0.5), 0.08, rng.uniform(-0.7, 0.7))
c6 = next(l for l in LINES if l["id"] == "c6")["start"]
put(fx, bell(88, 2.0), c6, 0.25)
put(fx, bell(95, 2.0), c6 + 0.15, 0.2)

# lo que funciona: optimista con ritmo (Fa)
d0, d1 = SEC["funciona"]
section_pad(d0, d1, [([65, 69, 72], 53), ([60, 64, 67], 48), ([67, 71, 74], 55), ([57, 60, 64], 45)], 2.3, 1500, 1.0, arp=0.2875, drums=(0.575, "kcs"))
for lid in ("d2", "d3", "d4", "d4b", "d4c"):
    st = next(l for l in LINES if l["id"] == lid)["start"]
    put(fx, bell(84, 0.8), st, 0.2)

# knok: luminoso (Re)
e0, e1 = SEC["knok"]
put(fx, hit(), e0 + 2.6, 0.5)
section_pad(e0 + 2.6, e1, [([62, 66, 69], 50), ([57, 61, 64], 45), ([59, 62, 66], 47), ([55, 59, 62], 43)], 2.0, 1900, 1.05, arp=0.125, drums=(0.5, "kcs"))

# cierre: reflexivo, se abre al final (Do)
f0, f1 = SEC["cierre"]
section_pad(f0, f1 - 0.5, [([60, 64, 67], 48), ([55, 59, 62], 43), ([57, 60, 64], 45), ([53, 57, 60], 41)], 3.0, 1200, 1.0, pianos=True, drums=(0.75, "s"))
put(mus, pad([48, 55, 60, 64, 67], 6.0, 1600, 0.5), DUR - 6.5, 0.18)

# tarjetas de capítulo: whoosh + golpe suave
for c in CH[1:]:
    st = BOUNDS[c] - 2.6
    put(fx, whoosh(0.8), st - 0.5, 0.35)
    put(fx, hit()[: int(1.2 * SR)], st + 0.3, 0.25)

# ------------------------------------------------------------ mezcla con la voz
ir_t = np.arange(int(2.2 * SR)) / SR
wet = np.zeros_like(mus)
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.6), "low", 6000)
    wet[:, c] = fftconvolve(mus[:, c] * 0.3 + fx[:, c] * 0.2, ir / np.sqrt(np.sum(ir**2)))[:N]

with wave.open(os.path.join(ROOT, "public", "doc-voice.wav")) as w:
    v = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels())[:, 0] / 32768
voice = np.zeros(N)
voice[: min(N, len(v))] = v[:N]
venv = fftconvolve(np.abs(voice), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode="same")
venv = np.clip(venv / (np.percentile(venv[venv > 0.01], 90) + 1e-9), 0, 1)
duck = 1 - 0.6 * venv

m = mus / (np.max(np.abs(mus)) + 1e-9)
x = fx / (np.max(np.abs(fx)) + 1e-9)
mix = (m * 0.36 + wet * 0.08) * duck[:, None] + x * 0.22 + voice[:, None] * 0.95
mix = filt(mix.T, "high", 35).T
mix[-int(2.5 * SR) :] *= np.linspace(1, 0, int(2.5 * SR))[:, None] ** 1.5
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.15) / np.tanh(1.15) * 0.93
with wave.open(os.path.join(ROOT, "public", "doc-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/doc-mix.wav", round(DUR, 2), "s")
