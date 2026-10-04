"""
Música + mezcla final del vídeo 3 («Querida yo de hace tres meses»).

Piano íntimo en Si menor mientras cuenta lo difícil que fue; al decir «Un día encontré knok»
la música se abre a Re mayor con pulso suave. Al final se queda sola con el piano.
La música baja automáticamente cuando habla la voz (ducking).

Requiere haber generado antes la voz:  python3 scripts/generate_voice.py
Salida: public/carta-mix.wav
"""

import json
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(21)

tm = json.load(open(os.path.join(ROOT, "src", "carta", "timings.json")))
LINES = tm["lines"]
KNOK = LINES[6]["start"]  # «Un día encontré knok»
LAST = LINES[12]["start"]  # «Así que respira…»
VOICE_END = LINES[12]["end"]

music = np.zeros((N, 2))
send = np.zeros((N, 2))


def T(d):
    return np.arange(int(SR * d)) / SR


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def filt(x, kind, f, o=2):
    return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)


def add(sig, at, gain=1.0, pan=0.0, rev=0.3):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    seg = slice(i, i + len(sig))
    music[seg, 0] += sig * gain * l
    music[seg, 1] += sig * gain * r
    send[seg, 0] += sig * gain * l * rev
    send[seg, 1] += sig * gain * r * rev


def piano(n, d=2.6, vel=1.0):
    """Piano 'de fieltro': armónicos que decaen, ataque suave, brillo según velocidad."""
    t = T(d)
    f = midi(n)
    s = np.zeros(len(t))
    for h, a in [(1, 1.0), (2, 0.45), (3, 0.22), (4, 0.12), (5, 0.06)]:
        s += a * np.sin(2 * np.pi * f * h * (1 + 0.0004 * h * h) * t) * np.exp(-t * (0.9 + h * 0.7))
    s += 0.3 * np.sin(2 * np.pi * f * 1.002 * t) * np.exp(-t * 1.1)
    s = filt(s, "low", 1400 + 1800 * vel)
    hammer = filt(rng.standard_normal(len(t)), "band", [300, 2500]) * np.exp(-t / 0.01) * 0.05
    env = np.clip(t / 0.006, 0, 1) * np.clip((d - t) / 0.3, 0, 1)
    return (s * 0.5 + hammer) * env * vel


def pad(notes, d, cutoff=900, att=0.8):
    t = T(d)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.07, 0.07):
            s += 2 * ((midi(n) * 2 ** (det / 12) * t + rng.random()) % 1) - 1
    s = filt(s / (len(notes) * 2), "low", cutoff)
    return s * np.clip(t / att, 0, 1) * np.clip((d - t) / 0.8, 0, 1)


def pluck(n, d=0.5):
    t = T(d)
    s = np.sin(2 * np.pi * midi(n) * t) + 0.3 * np.sin(4 * np.pi * midi(n) * t)
    return s * np.clip(t / 0.003, 0, 1) * np.exp(-t / 0.18)


def soft_kick():
    d = 0.4
    t = T(d)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.16) * 1.6)


def shaker():
    d = 0.09
    t = T(d)
    return filt(rng.standard_normal(len(t)), "band", [5000, 11000]) * np.sin(np.pi * t / d) ** 2


def bass(n, d):
    t = T(d)
    return np.sin(2 * np.pi * midi(n) * t) * np.clip(t / 0.02, 0, 1) * np.exp(-t / 1.2)


def swell(d):
    t = T(d)
    n = rng.standard_normal(len(t))
    s = filt(n, "band", [2000, 9000]) * (t / d) ** 3
    s += sum(np.sin(2 * np.pi * midi(n0) * t) for n0 in (74, 78, 81, 86)) * 0.05 * (t / d) ** 2
    return s


def glock(n, d=1.6):
    t = T(d)
    f = midi(n)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.6) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15)) * np.clip(t / 0.002, 0, 1)


# ------------------------------------------------- parte 1: íntimo (Si m – Sol – Re – La)
BEAT = 60 / 80
part1 = [([47, 54, 59, 62, 66], 35), ([43, 50, 55, 59, 62], 31), ([50, 57, 62, 66, 69], 38), ([45, 52, 57, 61, 64], 33)]
t0 = 0.0
ci = 0
while t0 < KNOK - 0.2:
    notes, root = part1[ci % 4]
    bar = BEAT * 4
    add(pad([root + 12, notes[2], notes[3]], bar + 0.6, 700, 1.2), t0, 0.10, rev=0.5)
    add(piano(root + 12, 3.5, 0.7), t0, 0.35, pan=-0.2)
    arp = [notes[1], notes[2], notes[3], notes[4], notes[3], notes[2], notes[3], notes[4]]
    for k, n in enumerate(arp):
        st = t0 + k * BEAT / 2
        if st >= KNOK - 0.15:
            break
        add(piano(n, 2.2, 0.45 + 0.1 * (k == 0)), st, 0.22, pan=-0.3 + 0.08 * k)
    t0 += bar
    ci += 1

# respiración antes de knok
add(swell(1.2), KNOK - 1.2, 0.35, rev=0.6)

# ------------------------------------------------- parte 2: se abre (Re – La – Si m – Sol)
part2 = [([50, 57, 62, 66, 69], 38), ([45, 52, 57, 61, 64], 33), ([47, 54, 59, 62, 66], 35), ([43, 50, 55, 59, 62], 31)]
t0 = KNOK
ci = 0
BEAT2 = 60 / 100
bar = BEAT2 * 4
add(glock(86, 2.0), KNOK, 0.25, rev=0.7)
add(glock(90, 2.0), KNOK + 0.12, 0.2, rev=0.7)
while t0 < LAST - 0.1:
    notes, root = part2[ci % 4]
    energy = min(1.0, 0.55 + 0.15 * ci)
    add(pad(notes[1:], bar + 0.4, 900 + 500 * energy, 0.3), t0, 0.13, rev=0.5)
    add(bass(root, bar), t0, 0.35, rev=0.1)
    add(piano(root + 12, 3.0, 0.8), t0, 0.32, pan=-0.2)
    for s in range(8):
        st = t0 + s * BEAT2 / 2
        if st >= LAST - 0.05:
            break
        if s in (0, 4) or (s == 6 and ci >= 1):
            add(soft_kick(), st, 0.45, rev=0.05)
        add(shaker(), st, (0.05 if s % 2 == 0 else 0.08) * energy, pan=0.4, rev=0.1)
        n = [notes[2], notes[4], notes[3] + 12, notes[4]][s % 4] + 12
        add(pluck(n), st, 0.07 * energy, pan=0.3 - 0.15 * (s % 2), rev=0.4)
    t0 += bar
    ci += 1

# ------------------------------------------------- final: piano solo + acorde luminoso
for k, n in enumerate([62, 66, 69, 74]):
    add(piano(n, 3.5, 0.6), LAST + k * 0.35, 0.25, pan=-0.2 + 0.1 * k)
add(pad([50, 57, 62, 64, 69], 30 - LAST, 1100, 1.0), LAST, 0.12, rev=0.6)
END = VOICE_END + 0.15
for k, n in enumerate([50, 57, 62, 66, 69, 76]):
    add(piano(n, 30 - END, 0.75), END + k * 0.05, 0.3, pan=-0.3 + 0.12 * k)
for k, n in enumerate([81, 86, 90, 93]):
    add(glock(n, 1.8), END + 0.1 + k * 0.11, 0.14, pan=-0.2 + 0.15 * k, rev=0.8)
# firma: "toc toc" muy suave en madera (guiño a la marca)
for st in (END + 0.9, END + 1.15):
    t = T(0.3)
    knock = np.tanh(sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(120, 1, 0.08), (210, 0.6, 0.05), (400, 0.3, 0.03)]) * 1.5)
    add(knock, st, 0.25, rev=0.4)

# ------------------------------------------------- reverb + ducking + mezcla con la voz
ir_t = np.arange(int(2.6 * SR)) / SR
wet = np.zeros_like(music)
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.8), "low", 6000)
    wet[:, c] = fftconvolve(send[:, c], ir / np.sqrt(np.sum(ir**2)))[:N]
music = music + wet * 0.45
music = filt(music.T, "high", 35).T

with wave.open(os.path.join(ROOT, "public", "voice.wav")) as w:
    voice = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2) / 32768
voice = np.pad(voice, ((0, max(0, N - len(voice))), (0, 0)))[:N]

venv = np.abs(voice[:, 0])
win = int(0.25 * SR)
venv = fftconvolve(venv, np.ones(win) / win, mode="same")
venv = np.clip(venv / (np.percentile(venv[venv > 0.01], 90) + 1e-9), 0, 1)
duck = 1 - 0.5 * venv

music /= np.max(np.abs(music)) + 1e-9
mix = music * 0.42 * duck[:, None] + voice * 0.95
fade = int(0.6 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2) * 0.95

with wave.open(os.path.join(ROOT, "public", "carta-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/carta-mix.wav")
