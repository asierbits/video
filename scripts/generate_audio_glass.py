"""
Sonido del anuncio «El anuncio que te rechaza» (sin voces). Tiempos en src/glass/events.json.

 0–3 s   hilo musical de ascensor + tecleo del correo automático
 3–6 s   la IA se atasca: el hilo musical tartamudea y se desafina, notificaciones en avalancha
 6 s     silencio. Nudillos sobre el cristal desde dentro del móvil. Crujidos.
 11 s    el anuncio se rasga como papel → música cálida (piano, palmas, bajo)
 …       rotulador sobre cristal, bola de papel, notificaciones buenas, pegatina final
Salida: public/glass-mix.wav
"""

import json
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
EV = json.load(open(os.path.join(ROOT, "src", "glass", "events.json")))
F = 1 / EV["fps"]
SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(23)
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


def epiano(notes, d, detune=0.0):
    t = T(d)
    s = np.zeros(len(t))
    for n in notes:
        f = midi(n) * 2 ** (detune / 12)
        s += (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t + 0.4 * np.sin(2 * np.pi * f * t))) * np.exp(-t / 1.2)
    s *= 1 + 0.25 * np.sin(2 * np.pi * 5 * t)  # trémolo de piano eléctrico
    return s / len(notes) * np.clip(t / 0.01, 0, 1) * np.clip((d - t) / 0.05, 0, 1)


def piano(n, d=2.0, vel=0.7):
    t = T(d)
    f = midi(n)
    s = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (1.0 + h * 0.8)) for h, a in [(1, 1), (2, 0.4), (3, 0.18)])
    return filt(s, "low", 2500) * np.clip(t / 0.005, 0, 1) * vel * 0.6


def key_click():
    t = T(0.04)
    return filt(rng.standard_normal(len(t)), "band", [1500, 7000]) * np.exp(-t / 0.006) * rng.uniform(0.6, 1.0)


def tap():
    t = T(0.06)
    return np.sin(2 * np.pi * 1200 * t) * np.exp(-t / 0.01) * 0.6 + filt(rng.standard_normal(len(t)), "high", 3000) * np.exp(-t / 0.004) * 0.3


def ding(n=88, d=0.5):
    t = T(d)
    f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / 0.15)


def glitch(d):
    t = T(d)
    f = rng.uniform(200, 1800)
    return np.sign(np.sin(2 * np.pi * f * t)) * 0.4 * (1 - t / d) + np.round(rng.standard_normal(len(t)) * 2) / 4 * (1 - t / d)


def glass_knock(big=1.0):
    t = T(0.9)
    knuckle = filt(rng.standard_normal(len(t)), "band", [300, 3000]) * np.exp(-t / 0.006)
    body = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.03)
    ring = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(1150, 0.35, 0.12), (2380, 0.22, 0.08), (3960, 0.12, 0.05)])
    return np.tanh((knuckle * 1.2 + body * 0.9 + ring * big) * 1.5)


def crack(d=0.6, big=1.0):
    t = T(d)
    out = np.zeros(len(t))
    for _ in range(int(14 * big)):
        st = int(rng.uniform(0, d * 0.6) * SR)
        ln = int(rng.uniform(0.004, 0.02) * SR)
        burst = rng.standard_normal(ln) * np.exp(-np.arange(ln) / (ln / 4))
        out[st : st + ln] += burst[: len(out) - st] * rng.uniform(0.4, 1)
    out = filt(out, "high", 1800)
    tink = sum(np.sin(2 * np.pi * rng.uniform(3000, 6500) * t) * np.exp(-t / 0.08) * 0.1 for _ in range(3))
    return out + tink


def tear(d):
    t = T(d)
    n = rng.standard_normal(len(t))
    env = np.abs(filt(rng.standard_normal(len(t)), "low", 30)) * 4
    s = filt(n, "band", [600, 5000]) * np.clip(env, 0, 1.4) * np.sin(np.pi * t / d) ** 0.4
    return s * 1.2


def whoosh(d=0.6):
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
    return out * np.sin(np.pi * t / d) * 1.4


def marker(d):
    t = T(d)
    f = 2600 + 700 * np.sin(2 * np.pi * 3.3 * t) + 300 * np.sin(2 * np.pi * 11 * t)
    gate = (np.sin(2 * np.pi * (4 + 2 * np.sin(2 * np.pi * 0.7 * t)) * t) > -0.3).astype(float)
    gate = filt(gate, "low", 60)
    squeak = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 + filt(rng.standard_normal(len(t)), "band", [2000, 7000]) * 0.4
    return squeak * gate * np.clip(t / 0.03, 0, 1) * np.clip((d - t) / 0.05, 0, 1) * 0.6


def crumple(d):
    t = T(d)
    out = np.zeros(len(t))
    for _ in range(60):
        st = int(rng.uniform(0, d - 0.03) * SR)
        ln = int(rng.uniform(0.005, 0.03) * SR)
        out[st : st + ln] += rng.standard_normal(ln) * np.exp(-np.arange(ln) / (ln / 3)) * rng.uniform(0.3, 1)
    return filt(out, "band", [800, 7000])


def thup():
    t = T(0.25)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(120 + 200 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.06) * 2) + filt(rng.standard_normal(len(t)), "band", [500, 4000]) * np.exp(-t / 0.01) * 0.4


def swell(d):
    t = T(d)
    s = sum(np.sin(2 * np.pi * midi(n) * t) for n in (50, 57, 62, 66)) / 4
    x = s + rng.standard_normal(len(t)) * 0.05
    out = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), 1024):
        sos = butter(2, 400 + 1800 * (i / len(x)), btype="low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[i : i + 1024], zi = sosfilt(sos, x[i : i + 1024], zi=zi)
    return out * (t / d) ** 2


# ------------------------------------------------------------ 0–3 s · hilo musical
MUZAK = [([60, 64, 67, 71], 48), ([57, 60, 64, 67], 45), ([62, 65, 69, 72], 50), ([55, 59, 62, 65], 43)]
loop0 = EV["loopStart"] * F
fr = EV["freeze"] * F
t = 0.0
k = 0
while t < fr:
    notes, root = MUZAK[k % 4]
    stut = t >= loop0
    det = 0.0 if not stut else -0.6 * (t - loop0) / (fr - loop0) + rng.uniform(-0.3, 0.3)
    d = 0.75 if not stut else max(0.12, 0.75 - (t - loop0) * 0.25)
    put(mus, epiano(notes, d + 0.05, det), t, 0.35, -0.2)
    put(mus, piano(root, d, 0.6), t, 0.4)
    t += d
    if not stut:
        k += 1
put(fx, tap(), EV["tapOpen"] * F, 0.6)
tt = EV["typeStart"] * F
while tt < loop0:
    put(fx, key_click(), tt, 0.35, rng.uniform(-0.3, 0.3))
    tt += rng.uniform(0.05, 0.12)
# atasco: tecleo frenético, notificaciones y chispazos
gap = 0.08
while tt < fr - 0.05:
    put(fx, key_click(), tt, 0.4, rng.uniform(-0.5, 0.5))
    tt += gap
    gap = max(0.02, gap * 0.985)
for i, nt in enumerate(np.cumsum(np.geomspace(0.35, 0.03, 40)) + loop0):
    if nt < fr:
        put(fx, ding(86 + (i % 4) * 2, 0.25), nt, 0.12, (i % 3 - 1) * 0.6)
for gt in np.arange(loop0 + 0.5, fr, 0.37):
    put(fx, glitch(rng.uniform(0.04, 0.12)), gt, 0.15, rng.uniform(-0.6, 0.6))

# ------------------------------------------------------------ silencio + nudillos
for i, kf in enumerate(EV["knocks"]):
    put(fx, glass_knock(1.0 + 0.3 * i), kf * F, 0.55 + 0.1 * i)
for i, cf in enumerate(EV["crackAt"]):
    put(fx, crack(0.7, 1.0 + i), cf * F + 0.02, 0.6 + 0.2 * i)
put(mus, swell(EV["rip"][0] * F - EV["leak"] * F + 0.3), EV["leak"] * F, 0.5)

# ------------------------------------------------------------ se rasga
r0, r1 = EV["rip"][0] * F, EV["rip"][1] * F
put(fx, tear(r1 - r0), r0, 0.8)
put(fx, whoosh(0.8), r1 - 0.5, 0.5)

# ------------------------------------------------------------ música cálida (Re mayor)
B = 60 / 96
PROG = [([62, 66, 69], 38), ([57, 61, 64], 33), ([59, 62, 66], 35), ([55, 59, 62], 31)]
t = r1
k = 0
while t < 29.6:
    notes, root = PROG[k % 4]
    bar = B * 4
    put(mus, piano(root + 12, 2.5, 0.7), t, 0.5, -0.2)
    for j in range(8):
        st = t + j * B / 2
        if st >= 29.6:
            break
        n = [notes[0], notes[1], notes[2], notes[1] + 12, notes[2], notes[1], notes[0] + 12, notes[2]][j] + 12
        put(mus, piano(n, 1.2, 0.45), st, 0.35, -0.3 + 0.08 * j)
        if j % 2 == 0:
            tk = T(0.3)
            put(mus, np.sin(2 * np.pi * midi(root) * tk) * np.exp(-tk / 0.25), st, 0.35)
        if j in (2, 6) and k >= 1:
            c = filt(rng.standard_normal(int(0.2 * SR)), "band", [900, 6000]) * np.exp(-T(0.2) / 0.05)
            put(mus, c, st, 0.18, 0.1)
    t += bar
    k += 1
put(mus, swell(1.0)[::-1] * 0.6, r1, 0.4)

# ------------------------------------------------------------ acciones
w1, w2, w3 = EV["write1"], EV["write2"], EV["write3"]
for a, b in (w1, w2, w3):
    put(fx, marker((b - a) * F), a * F, 0.5, 0.15)
put(fx, crumple((EV["crumple"][1] - EV["crumple"][0]) * F), EV["crumple"][0] * F, 0.6, -0.2)
put(fx, whoosh(0.4), EV["throw"] * F, 0.5, 0.5)
for i, rf in enumerate(EV["replies"]):
    put(fx, ding(84 + i * 3, 0.7), rf * F, 0.45, 0.3 - 0.3 * i)
    put(fx, ding(91 + i * 3, 0.7), rf * F + 0.08, 0.3, 0.3 - 0.3 * i)
put(fx, thup(), EV["sticker"] * F, 0.8)
for i, n in enumerate([86, 90, 93, 98]):
    put(fx, ding(n, 1.2), EV["sticker"] * F + 0.1 + i * 0.07, 0.25)

# ------------------------------------------------------------ mezcla
ir_t = np.arange(int(1.8 * SR)) / SR
wet = np.zeros_like(mus)
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.45), "low", 6000)
    wet[:, c] = fftconvolve(mus[:, c] * 0.4 + fx[:, c] * 0.25, ir / np.sqrt(np.sum(ir**2)))[:N]
mix = mus / (np.max(np.abs(mus)) + 1e-9) * 0.45 + fx / (np.max(np.abs(fx)) + 1e-9) * 0.75 + wet * 0.1
# silencio total al congelarse (sólo la cola de la reverb)
i0, i1 = int(fr * SR), int(EV["knocks"][0] * F * SR)
mix[i0:i1] *= np.linspace(0.15, 0.0, i1 - i0)[:, None]
mix = filt(mix.T, "high", 35).T
mix[-int(0.6 * SR) :] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.25) / np.tanh(1.25) * 0.95
with wave.open(os.path.join(ROOT, "public", "glass-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/glass-mix.wav")
