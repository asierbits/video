"""
Audio del vídeo 5 «Reto arcade»: chiptune 8 bits + efectos + presentador (Kokoro) con filtro de altavoz.

Los momentos (en segundos) son los mismos que usa src/arcade/Arcade.tsx (constante T).
Salida: public/arcade-mix.wav
"""

import os
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

sys.path.insert(0, os.path.dirname(__file__))
from arcade_lines import ANNOUNCER, LINES  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..")
KOKORO_DIR = os.environ.get("KOKORO_DIR", os.path.join(ROOT, "..", "tts"))
SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(8)

# --- momentos clave (s) — deben coincidir con src/arcade/Arcade.tsx
START_PRESS = 50 / 30
R1_TIMER = (75 / 30, 225 / 30)
R2_TIMER = (300 / 30, 420 / 30)
R3_GUESS = (500 / 30, 590 / 30)
R3_RACE = (590 / 30, 660 / 30)
REVEALS = [228 / 30, 423 / 30, 662 / 30]
SCORE = 690 / 30
CONT = 810 / 30
COIN = 840 / 30

music = np.zeros(N)
sfx = np.zeros(N)


def T(d):
    return np.arange(int(SR * d)) / SR


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def filt(x, kind, f, o=2):
    return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)


def put(buf, sig, at, g=1.0):
    i = int(at * SR)
    if 0 <= i < N:
        sig = sig[: N - i]
        buf[i : i + len(sig)] += sig * g


def sq(n, d, duty=0.5, decay=None, vib=0.0):
    t = T(d)
    f = midi(n) * (1 + vib * 0.01 * np.sin(2 * np.pi * 6 * t))
    ph = np.cumsum(f) / SR % 1
    s = np.where(ph < duty, 1.0, -1.0)
    env = np.exp(-t / decay) if decay else np.clip((d - t) / 0.01, 0, 1)
    return s * env * np.clip(t / 0.002, 0, 1)


def tri(n, d):
    t = T(d)
    ph = (midi(n) * t) % 1
    return (4 * np.abs(ph - 0.5) - 1) * np.clip((d - t) / 0.01, 0, 1)


def noise(d, decay, lo=1000):
    t = T(d)
    # ruido "NES": muestreado y retenido
    step = 4
    n = np.repeat(rng.choice([-1.0, 1.0], len(t) // step + 1), step)[: len(t)]
    return filt(n, "high", lo) * np.exp(-t / decay)


def kick():
    t = T(0.15)
    f = 160 * np.exp(-t / 0.03) + 50
    ph = np.cumsum(f) / SR % 1
    return (4 * np.abs(ph - 0.5) - 1) * np.exp(-t / 0.06)


def beep(n, d=0.09, g=1.0):
    return sq(n, d, 0.25) * g


def coin():
    return np.concatenate([sq(83, 0.07, 0.5), sq(88, 0.35, 0.5, decay=0.12)])


def buzzer():
    return sq(40, 0.6, 0.5) * 0.7 + sq(40.4, 0.6, 0.3) * 0.5


def jingle_ok():
    out = np.zeros(int(SR * 0.9))
    for k, n in enumerate([72, 76, 79, 84]):
        s = sq(n, 0.28 if k == 3 else 0.09, 0.25, decay=0.2 if k == 3 else None)
        i = int(k * 0.08 * SR)
        out[i : i + len(s)] += s
    return out


def fanfare():
    out = np.zeros(int(SR * 2.0))
    seq = [(72, 0.0, 0.1), (72, 0.12, 0.1), (72, 0.24, 0.1), (77, 0.36, 0.5), (79, 0.9, 0.12), (81, 1.04, 0.12), (84, 1.18, 0.7)]
    for n, st, d in seq:
        s = sq(n, d, 0.5, vib=0.4 if d > 0.3 else 0)
        i = int(st * SR)
        out[i : i + len(s)] += s
        s2 = sq(n - 12, d, 0.25)
        out[i : i + len(s2)] += s2 * 0.4
    return out


def whoosh(d=0.4):
    t = T(d)
    f = 200 + 2400 * (t / d) ** 2
    ph = np.cumsum(f) / SR % 1
    return np.where(ph < 0.5, 1.0, -1.0) * (1 - t / d) * 0.4 + noise(d, d) * 0.3


# ------------------------------------------------------------- música
BPM = 120
B = 60 / BPM
S16 = B / 4
PROG = [(57, [69, 72, 76]), (53, [65, 69, 72]), (60, [67, 72, 76]), (55, [67, 71, 74])]  # Am F C G
LEAD = [76, None, 79, 76, 74, None, 72, None, 74, 76, None, 72, 69, None, None, None]


def loop(t0, t1, lead=True, drums=True, gain=1.0, fast=False):
    bar = B * 4
    k = 0
    t = t0
    while t < t1 - 0.01:
        root, chord = PROG[k % 4]
        for s in range(16):
            st = t + s * S16
            if st >= t1:
                break
            if s % 2 == 0:
                put(music, tri(root - 12 + (12 if s % 4 == 2 else 0), S16 * 1.8), st, 0.5 * gain)
            put(music, sq(chord[s % 3] + 12, S16 * 0.9, 0.125), st, 0.1 * gain)  # arpegio rápido
            if lead and LEAD[s] is not None:
                put(music, sq(LEAD[s] + (2 if k % 4 == 3 else 0), S16 * 1.7, 0.5, vib=0.3), st, 0.17 * gain)
            if drums:
                if s % 4 == 0:
                    put(music, kick(), st, 0.6 * gain)
                if s in (4, 12):
                    put(music, noise(0.12, 0.05, 1500), st, 0.35 * gain)
                if fast or s % 2 == 0:
                    put(music, noise(0.03, 0.01, 6000), st, 0.15 * gain)
        t += bar
        k += 1


# título: arpegio de arranque
for k, n in enumerate([60, 64, 67, 72, 76, 79, 84]):
    put(music, sq(n, 0.1, 0.5), 0.05 + k * 0.08, 0.25)
loop(0.7, START_PRESS - 0.05, lead=False, drums=False, gain=0.6)
put(sfx, jingle_ok(), START_PRESS, 0.4)

# ronda 1
loop(2.0, R1_TIMER[1], gain=0.85)
# ronda 2
loop(R1_TIMER[1] + 1.4, R2_TIMER[1], gain=0.85)
loop(14.9, 16.0, lead=False, drums=True, gain=0.6)
# ronda 3 (más rápida en la carrera)
loop(16.0, R3_GUESS[1], gain=0.8)
loop(R3_RACE[0], R3_RACE[1] + 0.1, gain=1.0, fast=True)
# marcador: tranquilo
loop(SCORE, CONT, lead=False, drums=True, gain=0.6)

# cuentas atrás (un bip por segundo; los 3 últimos más agudos)
for t0, t1 in (R1_TIMER, R2_TIMER, R3_GUESS):
    secs = int(round(t1 - t0))
    for k in range(secs):
        last = secs - k <= 3
        put(sfx, beep(84 if last else 76, 0.08), t0 + k, 0.5 if last else 0.35)
for t0, t1 in (R1_TIMER, R2_TIMER):
    put(sfx, buzzer(), t1, 0.45)
for r in REVEALS:
    put(sfx, jingle_ok(), r + 0.15, 0.5)
    put(sfx, coin(), r + 0.6, 0.5)
# carrera: pasos del corredor A, y el "todo de una" de B
for k in range(14):
    put(sfx, noise(0.04, 0.015, 800), R3_RACE[0] + 0.1 + k * 0.16, 0.35)
put(sfx, whoosh(0.5), R3_RACE[0] + 0.25, 0.6)
for k in range(10):
    put(sfx, beep(88 + (k % 3) * 2, 0.04), R3_RACE[0] + 0.45 + k * 0.03, 0.18)

# continue: cuenta atrás tensa, moneda y fanfarria
for k in range(3):
    put(sfx, beep(72 - k, 0.18), CONT + k * 0.5, 0.45)
put(sfx, coin(), COIN, 0.7)
put(music, fanfare(), COIN + 0.25, 0.45)

# ------------------------------------------------------------- presentador
from kokoro_onnx import Kokoro  # noqa: E402

k = Kokoro(os.path.join(KOKORO_DIR, "kokoro-v1.0.onnx"), os.path.join(KOKORO_DIR, "voices-v1.0.bin"))
voice = np.zeros(N)
vname, semis, speed = ANNOUNCER
ratio = 2 ** (semis / 12)
for lid, st, txt in LINES:
    s, _ = k.create(txt, voice=vname, speed=speed / ratio, lang="es")
    s = resample_poly(s, 147, 80)
    s = resample_poly(s, 1000, int(round(1000 * ratio)))
    idx = np.where(np.abs(s) > 0.008)[0]
    s = s[idx[0] : idx[-1] + 800]
    s = s / (np.max(np.abs(s)) + 1e-9)
    put(voice, s, st)
# altavoz de recreativa: banda media + un poco de saturación + eco corto
voice = filt(voice, "band", [180, 6500])
voice = np.tanh(voice * 1.6) / np.tanh(1.6)
d = int(0.09 * SR)
voice = voice + 0.18 * np.concatenate([np.zeros(d), voice[:-d]])

# ------------------------------------------------------------- mezcla
venv = fftconvolve(np.abs(voice), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
venv = np.clip(venv / (np.percentile(venv[venv > 0.02], 90) + 1e-9), 0, 1)
duck = 1 - 0.55 * venv
music_n = music / (np.max(np.abs(music)) + 1e-9)
sfx_n = sfx / (np.max(np.abs(sfx)) + 1e-9)
mix = music_n * 0.42 * duck + sfx_n * 0.42 + voice * 0.8
mix = filt(mix, "high", 40)
mix[-int(0.3 * SR) :] *= np.linspace(1, 0, int(0.3 * SR))
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.3) / np.tanh(1.3) * 0.95
st = np.repeat((mix * 32767).astype(np.int16)[:, None], 2, axis=1)
with wave.open(os.path.join(ROOT, "public", "arcade-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(st.tobytes())
print("ok -> public/arcade-mix.wav")
