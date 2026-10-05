"""
Música del vídeo 6 «Lanzamiento» (sin voces): electrónica luminosa a 120 BPM (1 pulso = 15 frames).

  0–2 s    tensión: pad filtrado + "dings" de notificación que se amontonan + subida
  2 s      DROP: aparece knok
  2–25 s   groove con bombo, palmas, bajo con sidechain, acordes supersaw y arpegio
  25–30 s  golpe final, acorde abierto y cola

Los efectos de interfaz caen en los mismos frames que la animación (src/launch/Launch.tsx).
Salida: public/launch-mix.wav
"""

import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

ROOT = os.path.join(os.path.dirname(__file__), "..")
SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(12)
F = 1 / 30  # un frame en segundos

mus = np.zeros((N, 2))
sfx = np.zeros((N, 2))
sc = np.ones(N)  # envolvente de sidechain


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


def saw(f, t):
    return 2 * ((f * t) % 1) - 1


def supersaw(notes, d, cutoff=3000):
    t = T(d)
    s = np.zeros(len(t))
    for n in notes:
        for det in (-0.15, -0.05, 0.05, 0.15):
            s += saw(midi(n) * 2 ** (det / 12), t + rng.random())
    s = filt(s / (len(notes) * 4), "low", cutoff)
    return s * np.clip(t / 0.01, 0, 1) * np.clip((d - t) / 0.05, 0, 1)


def kick():
    t = T(0.35)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(45 + 140 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.15) * 2.5)


def clap():
    t = T(0.25)
    n = filt(rng.standard_normal(len(t)), "band", [900, 6000])
    e = sum((t >= o) * np.exp(-np.clip(t - o, 0, None) / 0.01) for o in (0, 0.012, 0.024)) * 0.4 + (t >= 0.024) * np.exp(-np.clip(t - 0.024, 0, None) / 0.08)
    return n * e


def hat(o=False):
    t = T(0.18 if o else 0.05)
    return filt(rng.standard_normal(len(t)), "high", 8000, 4) * np.exp(-t / (0.06 if o else 0.012))


def pluck(n, d=0.25):
    t = T(d)
    s = saw(midi(n), t) * 0.6 + np.sin(2 * np.pi * midi(n) * t) * 0.4
    return filt(s, "low", 3500) * np.exp(-t / 0.09)


def sub(n, d):
    t = T(d)
    return np.sin(2 * np.pi * midi(n) * t) * np.clip(t / 0.005, 0, 1) * np.clip((d - t) / 0.02, 0, 1)


def ding(n=88, d=0.6):
    t = T(d)
    f = midi(n)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / 0.1)) * np.exp(-t / 0.18) * np.clip(t / 0.002, 0, 1)


def riser(d):
    t = T(d)
    n = filt(rng.standard_normal(len(t)), "band", [1500, 9000]) * (t / d) ** 2.5
    tone = np.sin(2 * np.pi * np.cumsum(200 + 1600 * (t / d) ** 2) / SR) * (t / d) ** 2 * 0.3
    return n + tone


def impact():
    t = T(2.0)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(30 + 80 * np.exp(-t / 0.1)) / SR) * np.exp(-t / 0.6) * 2) + filt(rng.standard_normal(len(t)), "low", 4000) * np.exp(-t / 0.15) * 0.5


def whoosh(d=0.4, up=True):
    t = T(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    zi = None
    for s in range(0, len(n), 256):
        p = s / len(n)
        p = p if up else 1 - p
        lo = 300 + 5000 * p
        sos = butter(2, [lo, lo * 1.8], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[s : s + 256], zi = sosfilt(sos, n[s : s + 256], zi=zi)
    return out * np.sin(np.pi * t / d) * 1.5


def click():
    t = T(0.05)
    return filt(rng.standard_normal(len(t)), "band", [2000, 7000]) * np.exp(-t / 0.006) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.01) * 0.5


def shimmer():
    out = np.zeros(int(SR * 0.6))
    for k, n in enumerate([88, 91, 95, 100]):
        s = ding(n, 0.4) * 0.5
        i = int(k * 0.03 * SR)
        out[i : i + len(s)] += s[: len(out) - i]
    return out


# ------------------------------------------------------------ intro (0–2 s)
t = T(2.0)
pad = supersaw([47, 54, 59, 62], 2.0, 700) * (t / 2.0)
put(mus, pad, 0.0, 0.5)
# notificaciones (mismos frames que las tarjetas)
for k in range(18):
    fr = 4 + k * 2.6
    put(sfx, ding(86 + (k % 3) * 2, 0.35), fr * F, 0.25 + 0.02 * k, pan=(k % 2) * 0.4 - 0.2)
put(sfx, riser(1.0), 1.0, 0.6)
put(sfx, whoosh(0.3, False), 54 * F, 0.5)

# ------------------------------------------------------------ groove (2–25 s)
BPM = 120
B = 0.5
S16 = B / 4
PROG = [([59, 62, 66], 35), ([55, 59, 62], 31), ([62, 66, 69], 38), ([57, 61, 64], 33)]  # Bm G D A
DROP = 2.0
END = 25.0
bar = 0
tt = DROP
while tt < END - 0.01:
    notes, root = PROG[bar % 4]
    energy = 1.0 if bar >= 1 else 0.8
    put(mus, supersaw([n + 12 for n in notes] + [notes[0]], 2.0, 2600 + 400 * (bar % 2)), tt, 0.32 * energy)
    for s in range(16):
        st = tt + s * S16
        if st >= END:
            break
        if s % 4 == 0:
            put(mus, kick(), st, 0.9)
            k0 = int(st * SR)
            ln = int(0.22 * SR)
            if k0 + ln < N:
                sc[k0 : k0 + ln] = np.minimum(sc[k0 : k0 + ln], 0.25 + 0.75 * np.linspace(0, 1, ln) ** 1.5)
        if s in (4, 12):
            put(mus, clap(), st, 0.45, 0.05)
        if s % 4 == 2:
            put(mus, hat(True), st, 0.18, 0.3)
        elif s % 2 == 1:
            put(mus, hat(), st, 0.12, 0.3)
        if s % 2 == 0:
            put(mus, sub(root - 12 + (12 if s % 8 == 6 else 0), S16 * 1.8), st, 0.55)
        arp = [notes[0], notes[1], notes[2], notes[1] + 12][s % 4] + 12
        put(mus, pluck(arp), st, 0.10, -0.3 + 0.6 * (s % 2))
    tt += 2.0
    bar += 1

# transiciones entre bloques (frames de corte)
for fr in (120, 300, 480, 600):
    put(sfx, whoosh(0.45), fr * F - 0.4, 0.45)
    put(sfx, impact()[: int(0.7 * SR)], fr * F, 0.35)
put(sfx, impact(), DROP, 0.9)
put(sfx, shimmer(), 64 * F, 0.5)

# personalizar: cambios de texto
for fr in (150, 180, 210):
    put(sfx, shimmer(), fr * F, 0.35)
# escanear: ofertas que aparecen
for k, fr in enumerate((345, 360, 375, 390, 405)):
    put(sfx, ding(93 + (k % 2) * 3, 0.25), fr * F, 0.25, 0.3 - 0.15 * k)
# un clic
put(sfx, click(), 510 * F, 0.9)
put(sfx, whoosh(0.6), 512 * F, 0.6)
for k in range(12):
    put(sfx, ding(96 + (k % 4), 0.12), (514 + k * 2.5) * F, 0.12, (k % 3 - 1) * 0.5)
put(sfx, shimmer(), 560 * F, 0.5)
# extensión
put(sfx, click(), 640 * F, 0.7)
put(sfx, click(), 660 * F, 0.9)
put(sfx, shimmer(), 676 * F, 0.45)
for fr in (692, 722):
    put(sfx, click(), fr * F, 0.5)
    put(sfx, ding(91, 0.3), (fr + 10) * F, 0.3)

# ------------------------------------------------------------ final (25–30 s)
put(sfx, riser(1.2), END - 1.2, 0.5)
put(sfx, impact(), END, 1.0)
put(mus, kick(), END, 1.0)
final = supersaw([62, 66, 69, 74, 78], 5.0, 2400)
final *= np.exp(-T(5.0) / 6.0)
put(mus, final, END, 0.5)
put(mus, sub(26, 3.0) * np.exp(-T(3.0) / 1.2), END, 0.6)
put(sfx, shimmer(), 770 * F, 0.6)
for k in range(16):
    n = [74, 78, 81, 86, 81, 78][k % 6]
    put(mus, pluck(n, 0.6), END + 0.5 + k * 0.25, 0.16)
for k in range(4):
    put(mus, kick(), END + 1.0 + k * 1.0, 0.5)
    put(mus, hat(True), END + 1.5 + k * 1.0, 0.15, 0.3)

# ------------------------------------------------------------ mezcla
mus *= sc[:, None]
ir_t = np.arange(int(2.0 * SR)) / SR
send = mus * 0.25 + sfx * 0.35
wet = np.zeros_like(mus)
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.5), "low", 7000)
    wet[:, c] = fftconvolve(send[:, c], ir / np.sqrt(np.sum(ir**2)))[:N]
mix = mus / (np.max(np.abs(mus)) + 1e-9) * 0.7 + sfx / (np.max(np.abs(sfx)) + 1e-9) * 0.45 + wet * 0.1
mix = filt(mix.T, "high", 30).T
mix[-int(0.4 * SR) :] *= np.linspace(1, 0, int(0.4 * SR))[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.4) / np.tanh(1.4) * 0.95
with wave.open(os.path.join(ROOT, "public", "launch-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/launch-mix.wav")
