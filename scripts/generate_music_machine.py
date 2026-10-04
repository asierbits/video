"""
Sonido del vídeo 7 «La máquina» (sin voces): kalimba suave + efectos "foley" de una máquina de reacción en cadena.
Los tiempos salen de src/machine/events.json (los mismos que la animación).
Salida: public/machine-mix.wav
"""

import json
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
EV = json.load(open(os.path.join(ROOT, "src", "machine", "events.json")))
SR = 44100
DUR = 30.0
N = int(SR * DUR)
F = 1 / EV["fps"]
rng = np.random.default_rng(5)

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


def kalimba(n, d=1.4):
    t = T(d)
    f = midi(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55) + 0.35 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t / 0.04) + 0.15 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t / 0.3)
    return s * np.clip(t / 0.003, 0, 1)


def soft_bass(n, d):
    t = T(d)
    return np.sin(2 * np.pi * midi(n) * t) * np.clip(t / 0.03, 0, 1) * np.exp(-t / 1.0)


def shaker():
    t = T(0.08)
    return filt(rng.standard_normal(len(t)), "band", [5000, 11000]) * np.sin(np.pi * t / 0.08) ** 2


def roll(d):
    t = T(d)
    n = filt(rng.standard_normal(len(t)), "band", [120, 900])
    flutter = 0.7 + 0.3 * np.sin(2 * np.pi * (6 + 10 * t / d) * t)
    return n * flutter * np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.05, 0, 1) * 0.8


def clack(pitch=900):
    t = T(0.15)
    return np.sin(2 * np.pi * pitch * t) * np.exp(-t / 0.025) + filt(rng.standard_normal(len(t)), "band", [1500, 6000]) * np.exp(-t / 0.006) * 0.6


def plink(n):
    t = T(0.25)
    return np.sin(2 * np.pi * midi(n) * t) * np.exp(-t / 0.07) + np.sin(2 * np.pi * midi(n) * 3.1 * t) * np.exp(-t / 0.02) * 0.3


def squish(d=0.4):
    t = T(d)
    return filt(rng.standard_normal(len(t)), "low", 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d) * 0.8


def servo(d):
    t = T(d)
    f = 520 + 120 * np.sin(2 * np.pi * 1.5 * t)
    ph = np.cumsum(f) / SR
    return (2 * (ph % 1) - 1) * 0.15 * np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.05, 0, 1)


def pop():
    t = T(0.12)
    return np.sin(2 * np.pi * np.cumsum(300 + 900 * t / 0.12) / SR) * np.exp(-t / 0.04)


def bell(n=96, d=1.2):
    t = T(d)
    f = midi(n)
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / dd) for k, a, dd in [(1, 1, 0.5), (2.76, 0.5, 0.2), (5.4, 0.25, 0.08)])


def clunk():
    t = T(0.3)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(70 + 120 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.09) * 2) + filt(rng.standard_normal(len(t)), "low", 2000) * np.exp(-t / 0.02) * 0.5


def thup():
    t = T(0.18)
    return np.sin(2 * np.pi * np.cumsum(140 + 260 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.05) + filt(rng.standard_normal(len(t)), "band", [400, 3000]) * np.exp(-t / 0.01) * 0.4


def domino():
    t = T(0.08)
    return filt(rng.standard_normal(len(t)), "band", [1800, 5000]) * np.exp(-t / 0.008) + np.sin(2 * np.pi * 1300 * t) * np.exp(-t / 0.012) * 0.4


def old_phone(d=0.42):
    t = T(d)
    hammer = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    tone = np.sin(2 * np.pi * 1180 * t) + 0.7 * np.sin(2 * np.pi * 1640 * t) + 0.3 * np.sin(2 * np.pi * 2350 * t)
    return tone * (0.4 + 0.6 * hammer) * np.clip(t / 0.005, 0, 1) * np.clip((d - t) / 0.03, 0, 1) * 0.6


def plop():
    t = T(0.25)
    return np.sin(2 * np.pi * np.cumsum(500 * np.exp(-t / 0.05) + 120) / SR) * np.exp(-t / 0.06)


# ---------------------------------------------------------------- música: kalimba pentatónica
B = 0.5
PAT = [72, 76, 79, 84, 81, 79, 76, 79, 74, 77, 81, 86, 84, 81, 77, 81]
BASS = [48, 48, 45, 45, 41, 41, 43, 43]
t = 0.3
k = 0
while t < 29.0:
    gain = 0.5 if t < 4.5 else 0.7
    put(mus, kalimba(PAT[k % 16] - (0 if (k // 16) % 2 == 0 else 2)), t, 0.22 * gain, pan=-0.3 + 0.6 * (k % 2))
    if k % 4 == 0:
        put(mus, soft_bass(BASS[(k // 4) % 8], 2.0), t, 0.3 * gain)
    if t > 4.5 and k % 2 == 1:
        put(mus, shaker(), t, 0.08, 0.4)
    t += B / 2
    k += 1
for kk, n in enumerate([84, 88, 91, 96]):
    put(mus, kalimba(n, 2.0), EV["s5"]["settle"] * F + kk * 0.09, 0.3)

# ---------------------------------------------------------------- efectos
s0 = EV["s0"]
put(fx, clack(700), s0["push"] * F, 0.6)
for a, b in [(22, 50), (58, 84), (92, 116)]:
    put(fx, roll((b - a) * F), a * F, 0.5)
for i, c in enumerate(s0["clacks"]):
    put(fx, clack(820 + 60 * (i % 3)), c * F, 0.7, -0.3 + 0.3 * (i % 3))

s1 = EV["s1"]
put(fx, clack(760), s1["land"] * F, 0.6)
put(fx, roll((s1["roll"][1] - s1["roll"][0]) * F), s1["roll"][0] * F, 0.45)
put(fx, squish((s1["paint"][1] - s1["paint"][0]) * F), s1["paint"][0] * F, 0.6)
put(fx, servo((s1["craneDown"][1] - s1["craneDown"][0]) * F), s1["craneDown"][0] * F, 0.7)
put(fx, pop(), s1["hat"] * F, 0.6)
put(fx, bell(91, 0.6), s1["hat"] * F + 0.05, 0.25)
put(fx, roll((s1["rollDown"][1] - s1["rollDown"][0]) * F), s1["rollDown"][0] * F, 0.5)

s2 = EV["s2"]
put(fx, clack(800), s2["enter"] * F, 0.5)
for i, r in enumerate(s2["rows"]):
    put(fx, plink([84, 86, 88, 91, 93, 96, 98, 100][i]), r * F, 0.45, (-1) ** i * 0.3)
put(fx, clack(600), s2["bin"] * F, 0.6)
put(fx, bell(96, 1.4), s2["bin"] * F + 0.05, 0.45)
put(fx, clack(500), s2["trap"] * F, 0.5)

s3 = EV["s3"]
put(fx, clack(650), s3["land"] * F, 0.5)
put(fx, clunk(), s3["press"] * F, 0.8)
for i, sh in enumerate(s3["shots"]):
    put(fx, thup(), sh * F, 0.45, -0.5 + i / 11)
    put(fx, plop(), (sh + s3["flight"]) * F, 0.35, -0.5 + i / 11)

s4 = EV["s4"]
for i in range(s4["count"]):
    put(fx, domino(), (s4["start"] + i * s4["step"]) * F, 0.35 + 0.2 * (i / s4["count"]), -0.6 + 1.2 * (i / s4["count"]))
for r in s4["ring"]:
    put(fx, old_phone(), r * F, 0.7)

s5 = EV["s5"]
for i, l in enumerate(s5["letters"]):
    put(fx, thup(), l * F + 0.2, 0.6, -0.4 + 0.27 * i)
put(fx, roll((s5["marble"][1] - s5["marble"][0]) * F), s5["marble"][0] * F, 0.4)
put(fx, plop(), s5["settle"] * F, 0.7)
put(fx, bell(100, 1.8), s5["settle"] * F + 0.1, 0.35)

# ---------------------------------------------------------------- mezcla
ir_t = np.arange(int(1.4 * SR)) / SR
wet = np.zeros_like(mus)
send = mus * 0.4 + fx * 0.15
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.35), "low", 6000)
    wet[:, c] = fftconvolve(send[:, c], ir / np.sqrt(np.sum(ir**2)))[:N]
mix = mus / (np.max(np.abs(mus)) + 1e-9) * 0.42 + fx / (np.max(np.abs(fx)) + 1e-9) * 0.7 + wet * 0.12
mix = filt(mix.T, "high", 40).T
mix[-int(0.6 * SR) :] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2) * 0.95
with wave.open(os.path.join(ROOT, "public", "machine-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/machine-mix.wav")
