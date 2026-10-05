"""
Sonido del anuncio «Las dos pantallas» (sin voces). Tiempos en src/split/events.json.

 0–8 s    pizzicato juguetón que se acelera + "fwip" de cada envío + avalancha de notificaciones
 8 s      archivar todo (barrido)            9,5 s  rechazo automático (dos notas tristes)
 9,7–15 s piano triste y lluvia              12–15 s borrar plantilla, teclear, chispa de knok
 15–21 s  el correo de verdad cruza la pantalla: piano esperanzador, campanita especial
 21–25 s  "Llamar": la llamada sube, tono de llamada y vibración
 25–30 s  descuelga: groove alegre y cierre
Salida: public/split-mix.wav
"""

import json
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
EV = json.load(open(os.path.join(ROOT, "src", "split", "events.json")))
F = 1 / EV["fps"]
SR = 44100
DUR = EV["end"] * F
N = int(SR * DUR)
rng = np.random.default_rng(41)
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


def pizz(n, d=0.25):
    t = T(d)
    s = np.sin(2 * np.pi * midi(n) * t) + 0.4 * np.sin(4 * np.pi * midi(n) * t) * np.exp(-t / 0.05)
    return s * np.exp(-t / 0.09) * np.clip(t / 0.002, 0, 1)


def piano(n, d=2.2, vel=0.7):
    t = T(d)
    f = midi(n)
    s = sum(a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (0.9 + h * 0.8)) for h, a in [(1, 1), (2, 0.42), (3, 0.18), (4, 0.08)])
    return filt(s, "low", 2600) * np.clip(t / 0.005, 0, 1) * vel * 0.6


def pad(notes, d, cutoff=1000):
    t = T(d)
    s = sum(2 * ((midi(n) * 2 ** (dt / 12) * t + rng.random()) % 1) - 1 for n in notes for dt in (-0.07, 0.07))
    return filt(s / (len(notes) * 2), "low", cutoff) * np.clip(t / 0.6, 0, 1) * np.clip((d - t) / 0.6, 0, 1)


def ping(n=88, d=0.3):
    t = T(d)
    return (np.sin(2 * np.pi * midi(n) * t) + 0.3 * np.sin(2 * np.pi * midi(n) * 2 * t)) * np.exp(-t / 0.08)


def fwip(d=0.18, up=False):
    t = T(d)
    f = (2400 - 1800 * t / d) if not up else (500 + 2400 * t / d)
    return filt(rng.standard_normal(len(t)), "band", [800, 6000]) * np.sin(np.pi * t / d) * 0.6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.25


def swoosh(d=0.6):
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


def crunch():
    t = T(0.35)
    out = np.zeros(len(t))
    for _ in range(30):
        st = int(rng.uniform(0, 0.3) * SR)
        ln = int(rng.uniform(0.004, 0.02) * SR)
        out[st : st + ln] += rng.standard_normal(ln)[: len(out) - st] * np.exp(-np.arange(min(ln, len(out) - st)) / (ln / 3))
    return filt(out, "band", [600, 6000])


def key_click():
    t = T(0.04)
    return filt(rng.standard_normal(len(t)), "band", [1500, 7000]) * np.exp(-t / 0.006)


def shimmer():
    out = np.zeros(int(SR * 1.2))
    for k, n in enumerate([88, 93, 96, 100, 105]):
        s = ping(n, 0.8) * 0.5
        i = int(k * 0.05 * SR)
        out[i : i + len(s)] += s[: len(out) - i]
    return out


def rain(d):
    t = T(d)
    n = filt(rng.standard_normal(len(t)), "band", [1500, 9000]) * 0.25
    drops = np.zeros(len(t))
    for _ in range(int(d * 40)):
        i = int(rng.uniform(0, d - 0.02) * SR)
        drops[i : i + 200] += rng.standard_normal(200) * np.exp(-np.arange(200) / 30) * rng.uniform(0.2, 0.8)
    return (n + filt(drops, "high", 2000)) * np.clip(t / 1.0, 0, 1) * np.clip((d - t) / 1.0, 0, 1)


def ringtone(d=2.0):
    out = np.zeros(int(SR * d))
    pattern = [(79, 0.0), (76, 0.15), (79, 0.3), (84, 0.45), (79, 0.9), (76, 1.05), (79, 1.2), (84, 1.35)]
    for n, st in pattern:
        tt = T(0.25)
        s = (np.sin(2 * np.pi * midi(n) * tt) + 0.5 * np.sin(2 * np.pi * midi(n) * 3.95 * tt) * np.exp(-tt / 0.03)) * np.exp(-tt / 0.12)
        i = int(st * SR)
        out[i : i + len(s)] += s[: len(out) - i]
    return out


def buzz(d):
    t = T(d)
    on = (np.sin(2 * np.pi * 2.2 * t) > 0).astype(float)
    return filt(np.sign(np.sin(2 * np.pi * 160 * t)), "low", 350) * on * 0.5


def kick():
    t = T(0.3)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.12) * 2)


def clap():
    t = T(0.2)
    return filt(rng.standard_normal(len(t)), "band", [900, 6000]) * (np.exp(-t / 0.01) * 0.5 + (t > 0.02) * np.exp(-np.clip(t - 0.02, 0, None) / 0.06))


def glock(n, d=1.0):
    t = T(d)
    return (np.sin(2 * np.pi * midi(n) * t) * np.exp(-t / 0.4) + 0.3 * np.sin(2 * np.pi * midi(n) * 2.76 * t) * np.exp(-t / 0.1)) * np.clip(t / 0.002, 0, 1)


def pop():
    t = T(0.12)
    return np.sin(2 * np.pi * np.cumsum(400 + 1200 * t / 0.12) / SR) * np.exp(-t / 0.04)


s = lambda k: EV[k] * F  # noqa: E731
r = lambda k: (EV[k][0] * F, EV[k][1] * F)  # noqa: E731

# ------------------------------------------------------------ 0–8 s: el spam
PATTERN = [72, 76, 79, 76, 74, 77, 81, 77]
t = 0.1
k = 0
sp0, sp1 = r("spam")
while t < sp1:
    put(mus, pizz(PATTERN[k % 8] - (12 if k % 4 == 0 else 0)), t, 0.4, -0.2 + 0.4 * (k % 2))
    speed = 0.25 if t < sp0 else max(0.08, 0.25 - (t - sp0) * 0.03)
    t += speed
    k += 1
n_s = EV["spamSends"]
sends = sp0 + (sp1 - sp0 - 0.4) * (np.linspace(0, 1, n_s) ** 0.7)
for i, st in enumerate(sends):
    put(fx, fwip(), st, 0.35, 0.3)
    put(fx, ping(86 + (i % 4) * 2, 0.25), st + 0.25, 0.25, -0.2)
o0, o1 = r("overflow")
for i, st in enumerate(np.cumsum(np.geomspace(0.25, 0.04, 70)) + o0):
    if st < o1:
        put(fx, ping(84 + (i % 6) * 2, 0.2), st, 0.12, rng.uniform(-0.6, 0.6))
# archivar
a0, a1 = r("archive")
put(fx, swoosh(a1 - a0 + 0.2), a0, 0.7)
put(fx, crunch(), a1 - 0.1, 0.6)
# rechazo
put(fx, ping(76, 0.5), s("rejectIn"), 0.5)
put(fx, ping(72, 0.7), s("rejectIn") + 0.18, 0.5)

# ------------------------------------------------------------ 9,7–15 s: piano triste + lluvia
SAD = [([57, 60, 64], 45), ([53, 57, 60], 41), ([55, 59, 62], 43), ([52, 55, 59], 40)]
t = s("slump") if isinstance(EV["slump"], int) else EV["slump"][0] * F
k = 0
while t < s("send") - 0.2:
    notes, root = SAD[k % 4]
    put(mus, piano(root + 12, 2.5, 0.6), t, 0.5, -0.2)
    for j, n in enumerate([notes[1] + 12, notes[2] + 12, notes[0] + 24]):
        put(mus, piano(n, 1.6, 0.4), t + 0.45 + j * 0.45, 0.35, -0.1 + 0.15 * j)
    t += 1.6
    k += 1
rn0, rn1 = r("rain")
put(fx, rain(rn1 - rn0), rn0, 0.25)
put(fx, pop(), EV["deleteTpl"][0] * F, 0.4)
put(fx, crunch(), EV["deleteTpl"][0] * F + 0.3, 0.3)
ty0, ty1 = r("typing")
tt = ty0
while tt < ty1:
    put(fx, key_click(), tt, 0.35, rng.uniform(-0.3, 0.3))
    tt += rng.uniform(0.06, 0.13)
put(fx, shimmer(), s("kTap"), 0.4)

# ------------------------------------------------------------ 15–21 s: el correo de verdad
put(fx, fwip(0.4, up=False), s("send"), 0.5)
f0, f1 = r("flight")
for i in range(10):
    put(fx, ping(98 + (i % 3) * 2, 0.15), f0 + i * (f1 - f0) / 10, 0.08, 0.3 - 0.06 * i)
HOPE = [([62, 66, 69], 38), ([59, 62, 66], 35), ([55, 59, 62], 31), ([57, 61, 64], 33)]
t = s("send")
k = 0
while t < s("callTap"):
    notes, root = HOPE[k % 4]
    put(mus, pad(notes, 1.9, 900), t, 0.18)
    put(mus, piano(root + 12, 2.0, 0.6), t, 0.45)
    for j, n in enumerate([notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12]):
        put(mus, piano(n, 1.4, 0.4), t + 0.4 * (j + 1), 0.32, -0.2 + 0.13 * j)
    t += 1.8
    k += 1
for n, d in ((86, 0.0), (90, 0.06), (93, 0.12), (98, 0.18)):
    put(fx, glock(n, 1.6), s("special") + d, 0.35)
put(fx, pop(), EV["open"][0] * F, 0.35)
put(fx, pop(), s("heart"), 0.5)
put(fx, glock(100, 0.8), s("heart") + 0.05, 0.2)

# ------------------------------------------------------------ 21–25 s: la llamada
put(fx, pop(), s("callTap"), 0.5)
c0, c1 = r("callLine")
put(fx, swoosh(c1 - c0), c0, 0.5)
put(fx, fwip(c1 - c0, up=True), c0, 0.3)
rg0, rg1 = r("ring")
put(fx, ringtone(rg1 - rg0), rg0, 0.45)
put(fx, buzz(rg1 - rg0), rg0, 0.35)
put(mus, pad([62, 66, 69, 74], rg1 - rg0 + 0.4, 700), rg0, 0.12)

# ------------------------------------------------------------ 25–30 s: descuelga
put(fx, pop(), s("answer"), 0.6)
HAPPY = [([62, 66, 69], 38), ([57, 61, 64], 33), ([59, 62, 66], 35), ([55, 59, 62], 31)]
t = s("answer")
k = 0
B = 0.5
while t < DUR - 0.3:
    notes, root = HAPPY[k % 4]
    put(mus, pad(notes, 2.2, 1600), t, 0.2)
    for j in range(8):
        st = t + j * B / 2
        if st >= DUR - 0.3:
            break
        if j % 2 == 0:
            put(mus, kick(), st, 0.6)
            tt_ = T(0.25)
            put(mus, np.sin(2 * np.pi * midi(root) * tt_) * np.exp(-tt_ / 0.2), st, 0.4)
        if j in (2, 6):
            put(mus, clap(), st, 0.3, 0.1)
        put(mus, glock([notes[0], notes[1], notes[2], notes[1]][j % 4] + 24, 0.6), st, 0.12, -0.3 + 0.08 * j)
    t += 2.0
    k += 1
put(fx, shimmer(), s("logo"), 0.5)

# ------------------------------------------------------------ mezcla
ir_t = np.arange(int(1.6 * SR)) / SR
wet = np.zeros_like(mus)
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.4), "low", 6000)
    wet[:, c] = fftconvolve(mus[:, c] * 0.4 + fx[:, c] * 0.2, ir / np.sqrt(np.sum(ir**2)))[:N]
mix = mus / (np.max(np.abs(mus)) + 1e-9) * 0.5 + fx / (np.max(np.abs(fx)) + 1e-9) * 0.6 + wet * 0.1
# hueco de silencio tras archivar
i0, i1 = int((a1 + 0.2) * SR), int(s("rejectIn") * SR)
mix[i0:i1] *= 0.25
mix = filt(mix.T, "high", 35).T
mix[-int(0.6 * SR) :] *= np.linspace(1, 0, int(0.6 * SR))[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2) * 0.95
with wave.open(os.path.join(ROOT, "public", "split-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/split-mix.wav")
