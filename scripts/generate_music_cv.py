"""
knok — «3 meses. 1.000 CVs. 0 llamadas.»  Banda sonora original (sintetizada).

Tono: cercano, con humor y optimista. 120 BPM (1 pulso = 15 frames a 30 fps), Do mayor.

  0.0 –  5.0 s  Arranque juguetón: marimba, chasquidos, fotocopiadora a ritmo
  5.0 –  8.0 s  Corte: grillos y trombón triste (0 llamadas)
  8.0 – 11.0 s  Papelera: teclas suaves, "bonk", notificación, scratch de vinilo
 11.0 – 26.0 s  Groove alegre: bombo, palmas, bajo funky, acordes y glockenspiel
 26.0 – 28.0 s  ¡Suena el teléfono!
 28.0 – 30.0 s  Acorde final + "ta-da"

Uso:  python3 scripts/generate_music_cv.py   ->  public/music-cv.wav
"""

import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
S16 = BEAT / 4

rng = np.random.default_rng(11)
dry = np.zeros((N, 2))
send = np.zeros((N, 2))


def T(d):
    return np.arange(int(SR * d)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, c, o=2):
    return sosfilt(butter(o, min(c, SR / 2 - 100), btype="low", fs=SR, output="sos"), x)


def hp(x, c, o=2):
    return sosfilt(butter(o, c, btype="high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], btype="band", fs=SR, output="sos"), x)


def env(d, decay, attack=0.002):
    t = T(d)
    return np.clip(t / attack, 0, 1) * np.exp(-t / decay)


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def osc(freq_curve):
    return np.sin(2 * np.pi * np.cumsum(freq_curve) / SR)


def add(sig, at, gain=1.0, pan=0.0, rev=0.0):
    i = int(at * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    seg = slice(i, i + len(sig))
    dry[seg, 0] += sig * gain * l
    dry[seg, 1] += sig * gain * r
    if rev:
        send[seg, 0] += sig * gain * l * rev
        send[seg, 1] += sig * gain * r * rev


# ------------------------------------------------------------ instrumentos
def marimba(n, d=0.45):
    t = T(d)
    f = midi(n)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.16) + 0.35 * np.sin(2 * np.pi * f * 3.9 * t) * np.exp(-t / 0.03)
    return s * np.clip(t / 0.002, 0, 1)


def glock(n, d=1.2):
    t = T(d)
    f = midi(n)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / dec) for k, a, dec in [(1, 1, 0.5), (2.76, 0.4, 0.15), (5.4, 0.2, 0.06)])
    return s * np.clip(t / 0.001, 0, 1)


def bass(n, d=0.22):
    t = T(d)
    f = midi(n)
    s = lp(saw(f, t), 520) * 0.7 + np.sin(2 * np.pi * f * t) * 0.6
    return np.tanh(s * 1.5) * env(d, 0.12, 0.003)


def stab(notes, d=0.18):
    t = T(d)
    s = sum(saw(midi(n), t) + saw(midi(n) * 1.004, t) for n in notes) / (2 * len(notes))
    return lp(s, 2600) * env(d, 0.07, 0.003)


def keys(notes, d=1.8):
    t = T(d)
    s = sum(np.sin(2 * np.pi * midi(n) * t) + 0.3 * np.sin(4 * np.pi * midi(n) * t) for n in notes) / len(notes)
    return s * np.clip(t / 0.01, 0, 1) * np.exp(-t / 0.9) * (1 + 0.15 * np.sin(2 * np.pi * 5 * t))


def kick():
    d = 0.35
    t = T(d)
    return np.tanh(osc(48 + 120 * np.exp(-t / 0.03)) * env(d, 0.12) * 2.4)


def clap():
    d = 0.3
    n = rng.standard_normal(int(SR * d))
    t = T(d)
    e = sum(np.exp(-np.clip(t - o, 0, None) / 0.008) * (t >= o) for o in (0, 0.011, 0.022)) * 0.5 + np.exp(-t / 0.09) * (t >= 0.022)
    return bp(n, 900, 5000) * e


def hat(open_=False):
    d = 0.2 if open_ else 0.05
    return hp(rng.standard_normal(int(SR * d)), 7500, 4) * env(d, 0.06 if open_ else 0.012)


def snap():
    d = 0.08
    return bp(rng.standard_normal(int(SR * d)), 1800, 4200) * env(d, 0.012)


def trombone(n, d, slide=-0.6, vib=0.0):
    t = T(d)
    f = midi(n) * 2 ** ((slide * t / d) / 12) * (1 + vib * 0.012 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.3, 0, 1))
    raw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    out = np.zeros_like(raw)
    zi = None
    blk = 512
    for s in range(0, len(raw), blk):
        p = s / len(raw)
        cut = 300 + 1500 * np.sin(np.pi * min(1, p * 1.4)) ** 0.7
        sos = butter(2, cut, btype="low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[s : s + blk], zi = sosfilt(sos, raw[s : s + blk], zi=zi)
    return np.tanh(out * 2) * np.clip(t / 0.03, 0, 1) * np.clip((d - t) / 0.08, 0, 1)


def cricket():
    d = 0.3
    t = T(d)
    pulses = (np.sin(2 * np.pi * 30 * t) > 0.3) * (t < 0.18)
    return np.sin(2 * np.pi * 4600 * t) * pulses * 0.6


def pop():
    d = 0.12
    t = T(d)
    return osc(380 + 1400 * (t / d)) * env(d, 0.04)


def whoosh(d=0.35):
    t = T(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    zi = None
    for s in range(0, len(n), 256):
        p = s / len(n)
        lo = 400 + 5000 * p
        sos = butter(2, [lo, lo * 1.8], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[s : s + 256], zi = sosfilt(sos, n[s : s + 256], zi=zi)
    return out * np.sin(np.pi * t / d) * 1.6


def boing():
    d = 0.7
    t = T(d)
    f = 160 + 220 * t / d + 90 * np.sin(2 * np.pi * 13 * t) * np.exp(-t * 4)
    return osc(f) * env(d, 0.3, 0.004)


def fwoop():
    d = 0.3
    t = T(d)
    return osc(250 + 1600 * (t / d) ** 2) * env(d, 0.14, 0.01) * 0.6 + whoosh(0.3) * 0.3


def bonk():
    d = 0.3
    t = T(d)
    return np.tanh(osc(330 * np.exp(-t / 0.15) + 110) * env(d, 0.07) * 2) + lp(rng.standard_normal(len(t)), 1800) * env(d, 0.01) * 0.6


def woodblock():
    d = 0.2
    t = T(d)
    return np.sin(2 * np.pi * 980 * t) * env(d, 0.03) + hp(rng.standard_normal(len(t)), 3000) * env(d, 0.004) * 0.4


def page_flip():
    d = 0.22
    t = T(d)
    return bp(rng.standard_normal(len(t)), 1500, 8000) * np.sin(np.pi * t / d) ** 2 * 0.8


def marker(d=0.6):
    t = T(d)
    f = 2600 + 400 * np.sin(2 * np.pi * 7 * t)
    gate = (np.sin(2 * np.pi * 6.5 * t) > -0.2).astype(float)
    return (osc(f) * 0.25 + bp(rng.standard_normal(len(t)), 2000, 6000) * 0.5) * gate * 0.5


def copier_chk():
    d = 0.09
    t = T(d)
    return lp(rng.standard_normal(len(t)), 1200) * env(d, 0.02) + np.sin(2 * np.pi * 140 * t) * env(d, 0.03) * 0.6


def scratch():
    d = 0.32
    t = T(d)
    speed = np.sin(2 * np.pi * t / d * 1.5)
    f = 300 + 900 * np.abs(speed)
    return bp(rng.standard_normal(len(t)), 300, 3000) * np.abs(speed) * 1.2 + osc(f) * np.abs(speed) * 0.3


def ring(d=0.42):
    t = T(d)
    s = (np.sin(2 * np.pi * 1320 * t) + np.sin(2 * np.pi * 1660 * t)) * 0.5
    trem = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    return s * trem * np.clip(t / 0.005, 0, 1) * np.clip((d - t) / 0.01, 0, 1)


def buzz(d=0.42):
    t = T(d)
    return lp(np.sign(np.sin(2 * np.pi * 150 * t)), 400) * np.clip(t / 0.01, 0, 1) * np.clip((d - t) / 0.02, 0, 1)


# =============================================================== 0–5 s
INTRO_ARP = [72, 76, 79, 76, 74, 77, 81, 77]  # Do – Re m
for i, st in enumerate(np.arange(0.0, 5.0, S16 * 2)):
    add(marimba(INTRO_ARP[i % 8]), st, 0.35, pan=-0.2 + 0.4 * (i % 2), rev=0.2)
for b in np.arange(0.0, 5.0, BEAT):
    k = int(round(b / BEAT))
    if k % 2 == 1:
        add(snap(), b, 0.5, pan=0.3, rev=0.2)
    add(bass([48, 50][int(b // 1) % 2], 0.18), b, 0.35)
for st in (0.2, 0.7, 1.2):
    add(page_flip(), st, 0.6, pan=-0.2)
add(marker(0.7), 1.7, 0.35, pan=0.2)
# fotocopiadora acelerando
tt, gap = 2.55, 0.25
while tt < 4.9:
    add(copier_chk(), tt, 0.55, pan=0.1)
    tt += gap
    gap = max(0.06, gap * 0.88)
add(marker(0.5), 4.2, 0.3)
add(pop(), 4.95, 0.4)

# =============================================================== 5–8 s
for st in np.arange(5.2, 8.0, 0.45):
    add(cricket(), st, 0.12, pan=0.6, rev=0.3)
    add(cricket(), st + 0.2, 0.08, pan=-0.6, rev=0.3)
add(trombone(55, 0.42), 5.5, 0.35, rev=0.2)
add(trombone(54, 0.42), 6.0, 0.35, rev=0.2)
add(trombone(53, 0.42), 6.5, 0.35, rev=0.2)
add(trombone(52, 1.2, slide=-0.8, vib=1.0), 7.0, 0.38, rev=0.3)

# =============================================================== 8–11 s
add(keys([57, 60, 64]), 8.0, 0.22, rev=0.4)
add(keys([53, 57, 60, 64]), 9.0, 0.22, rev=0.4)
add(bonk(), 8.5, 0.5, pan=-0.2)
add(bonk(), 9.0, 0.5, pan=0.2)
add(glock(84, 0.8), 9.75, 0.3, rev=0.4)
add(glock(91, 0.9), 9.87, 0.3, rev=0.4)
add(whoosh(0.6), 10.0, 0.25)
add(scratch(), 10.55, 0.55)

# =============================================================== 11–26 s groove
CHORDS = [
    ([65, 69, 72], 41),  # Fa
    ([67, 71, 74], 43),  # Sol
    ([64, 67, 71], 40),  # Mi m
    ([69, 72, 76], 45),  # La m
    ([65, 69, 72], 41),
    ([67, 71, 74], 43),
    ([60, 64, 67], 36),  # Do
    ([60, 64, 67], 36),
]
HOOK = [  # (semicorchea en el compás, nota) — melodía de glockenspiel
    (0, 84), (3, 84), (6, 86), (8, 88), (10, 86), (12, 84), (14, 81),
]
BASS_PAT = [0, None, 0, 12, None, 0, None, 7, 0, None, 0, 12, None, 7, 5, None]

GROOVE_START, GROOVE_END = 11.0, 26.0
for bi in range(8):
    b0 = GROOVE_START + bi * 2.0
    notes, root = CHORDS[bi]
    for s in range(16):
        st = b0 + s * S16
        if st >= GROOVE_END:
            break
        if s % 4 == 0:
            add(kick(), st, 0.8)
        if s in (4, 12):
            add(clap(), st, 0.45, pan=0.05, rev=0.25)
        if s % 4 == 2:
            add(hat(True), st, 0.13, pan=0.35)
        elif s % 2 == 1:
            add(hat(), st, 0.1, pan=0.35)
        if BASS_PAT[s] is not None:
            add(bass(root - 12 + BASS_PAT[s]), st, 0.55)
        if s in (2, 6, 10, 14):
            add(stab(notes), st, 0.22, pan=-0.25, rev=0.25)
    if bi % 2 == 0 or bi >= 4:
        for s16, n in HOOK:
            st = b0 + s16 * S16
            if st < GROOVE_END:
                add(glock(n + (0 if bi < 6 else 5 if s16 > 6 else 0)), st, 0.22, pan=0.3, rev=0.35)

# efectos sincronizados con la imagen
for st in (11.0, 12.0, 13.0, 14.0, 15.0):
    add(whoosh(0.3), st - 0.18, 0.35)
    add(pop(), st, 0.45, pan=0.15)
for st, ok in [(16.5, False), (17.5, True), (18.5, True), (19.5, True)]:
    if ok:
        add(glock(88, 0.6), st, 0.35, rev=0.3)
        add(glock(93, 0.6), st + 0.08, 0.35, rev=0.3)
    else:
        add(lp(saw(110, T(0.22)), 600) * env(0.22, 0.1), st, 0.35)
add(boing(), 20.5, 0.6, rev=0.2)
for st in (21.0, 21.25, 21.5, 21.75, 22.0):
    add(fwoop(), st, 0.45, pan=float(rng.uniform(-0.4, 0.4)), rev=0.2)
for k in range(9):
    st = 23.0 + (8 + 8 * k) / 30
    add(woodblock(), st, 0.55, pan=float(rng.uniform(-0.5, 0.5)))
    add(glock(96, 0.3), st + 0.03, 0.12)

# =============================================================== 26–28 s teléfono
for st in (26.0, 26.6, 27.2):
    add(ring(), st, 0.33, rev=0.15)
    add(buzz(), st, 0.25)
add(bass(36, 0.5), 26.0, 0.4)
add(bass(43, 0.5), 27.0, 0.4)
add(snap(), 26.5, 0.4)
add(snap(), 27.5, 0.4)
add(whoosh(0.5), 27.5, 0.3)

# =============================================================== 28–30 s final
add(kick(), 28.0, 0.9)
add(clap(), 28.0, 0.4, rev=0.5)
add(keys([48, 60, 64, 67, 72], 2.0), 28.0, 0.35, rev=0.5)
add(stab([60, 64, 67, 72], 0.5), 28.0, 0.35, rev=0.5)
for i, n in enumerate([72, 76, 79, 84, 88]):
    add(glock(n, 1.4), 28.0 + i * 0.09, 0.28, pan=-0.3 + i * 0.15, rev=0.5)
add(glock(96, 1.6), 29.0, 0.3, rev=0.6)

# =============================================================== mezcla
ir_len = int(SR * 1.8)
it = np.arange(ir_len) / SR
irs = []
for _ in range(2):
    ir = lp(rng.standard_normal(ir_len) * np.exp(-it / 0.45), 6000)
    irs.append(ir / np.sqrt(np.sum(ir**2)))
wet = np.stack([fftconvolve(send[:, c], irs[c])[:N] for c in range(2)], axis=1)
mix = dry + wet * 0.5
mix = hp(mix.T, 30).T
fade = int(0.8 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.5) / np.tanh(1.5) * 0.95

out = os.path.join(os.path.dirname(__file__), "..", "public", "music-cv.wav")
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok ->", os.path.abspath(out))
