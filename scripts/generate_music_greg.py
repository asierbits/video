"""
Música + efectos + mezcla del vídeo 4 («El diario de Dani»).

Ukelele desenfadado (Karplus-Strong) con escobillas. Se vuelve menor y se apaga con el robot,
vuelve con mamá y Sara, se para en seco para los golpes en la puerta y cierra con un rasgueo.
Efectos: pasos de página, lápiz, pitidos de robot, toc-toc, chirrido de puerta, cierre del cuaderno.

Requiere: python3 scripts/generate_voice_greg.py   ->   Salida: public/greg-mix.wav
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
rng = np.random.default_rng(31)

tm = json.load(open(os.path.join(ROOT, "src", "greg", "timings.json")))
L = {l["id"]: l for l in tm["lines"]}

# momentos clave (los mismos que usa la animación: src/greg/Greg.tsx)
FLIPS = [L["l2"]["start"] - 0.15, L["l4"]["start"] - 0.15, L["l6"]["start"] - 0.13, L["l7"]["start"] - 0.15, L["l7"]["end"] + 0.02, L["l9"]["start"] - 0.15]
KNOCKS = [L["l7"]["end"] + 0.3, L["l7"]["end"] + 0.6]
DOOR = L["l7"]["end"] + 0.82
CLOSE = 28.65

music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
send = np.zeros((N, 2))


def T(d):
    return np.arange(int(SR * d)) / SR


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def filt(x, kind, f, o=2):
    return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)


def put(buf, sig, at, gain=1.0, pan=0.0, rev=0.2):
    i = int(at * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    seg = slice(i, i + len(sig))
    buf[seg, 0] += sig * gain * l
    buf[seg, 1] += sig * gain * r
    send[seg, 0] += sig * gain * l * rev
    send[seg, 1] += sig * gain * r * rev


def uke(n, d=1.2, bright=0.5):
    """Cuerda pulsada (Karplus-Strong)."""
    f = midi(n)
    period = int(SR / f)
    buf = rng.uniform(-1, 1, period) * 0.8
    buf = filt(buf, "low", 2500 + 3000 * bright) if period > 30 else buf
    out = np.zeros(int(SR * d))
    for i in range(len(out)):
        out[i] = buf[i % period]
        buf[i % period] = 0.5 * (buf[i % period] + buf[(i + 1) % period]) * 0.996
    return out * np.clip(np.arange(len(out)) / 40, 0, 1)


def strum(notes, d=1.0, down=True, gain=1.0):
    out = np.zeros(int(SR * (d + 0.1)))
    order = notes if down else notes[::-1]
    for k, n in enumerate(order):
        s = uke(n, d)
        i = int(k * 0.012 * SR)
        out[i : i + len(s)] += s[: len(out) - i] * (0.8 + 0.2 * (k == 0))
    return out * gain / len(notes)


def brush(d=0.18, gain=1.0):
    t = T(d)
    return filt(rng.standard_normal(len(t)), "band", [2000, 9000]) * np.exp(-t / 0.06) * gain


def kick():
    t = T(0.3)
    return np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.1)


def bass(n, d=0.4):
    t = T(d)
    return np.sin(2 * np.pi * midi(n) * t) * np.exp(-t / 0.25) * np.clip(t / 0.005, 0, 1)


def page_flip():
    t = T(0.35)
    n = filt(rng.standard_normal(len(t)), "band", [800, 7000])
    return n * (np.sin(np.pi * t / 0.35) ** 2) * (1 + 0.6 * np.sin(2 * np.pi * 18 * t)) * 0.7


def pencil(d=0.9):
    t = T(d)
    n = filt(rng.standard_normal(len(t)), "band", [3000, 9000])
    gate = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * (5 + 3 * np.sin(2 * np.pi * 0.7 * t)) * t))
    return n * gate * np.clip(t / 0.05, 0, 1) * np.clip((d - t) / 0.1, 0, 1) * 0.35


def beep(f, d=0.12):
    t = T(d)
    return np.sign(np.sin(2 * np.pi * f * t)) * 0.3 * np.clip((d - t) / 0.02, 0, 1) * np.clip(t / 0.005, 0, 1)


def knock():
    t = T(0.45)
    noise = filt(rng.standard_normal(len(t)), "low", 2500) * np.exp(-t / 0.008)
    modes = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in [(118, 1, 0.09), (205, 0.6, 0.06), (390, 0.35, 0.04)])
    return np.tanh((noise * 1.4 + modes) * 1.6)


def creak(d=0.7):
    t = T(d)
    f = 380 + 160 * np.sin(2 * np.pi * 1.3 * t) + 60 * t
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    grain = (np.sin(2 * np.pi * 34 * t) > 0.2).astype(float)
    return filt(saw * grain, "band", [400, 2500]) * np.sin(np.pi * t / d) * 0.6


def book_close():
    t = T(0.4)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.08) * 2) + filt(rng.standard_normal(len(t)), "low", 3000) * np.exp(-t / 0.03) * 0.6


# ---------------------------------------------------------------- música
BPM = 104
B = 60 / BPM
C_MAJ = {"C": [60, 64, 67, 72], "Am": [57, 60, 64, 69], "F": [53, 60, 65, 69], "G": [55, 62, 67, 71], "Em": [52, 59, 64, 67], "Dm": [50, 57, 62, 65]}
ROOT_N = {"C": 36, "Am": 33, "F": 29, "G": 31, "Em": 28, "Dm": 26}


def groove(t0, t1, prog, gain=1.0, drums=True):
    bar = B * 4
    k = 0
    t = t0
    while t < t1 - 0.05:
        ch = prog[k % len(prog)]
        pattern = [(0, True), (1, False), (1.5, True), (2.5, False), (3, True)]
        for beat, down in pattern:
            st = t + beat * B
            if st < t1 - 0.05:
                put(music, strum(C_MAJ[ch], 0.9, down, 0.9), st, 0.5 * gain, pan=-0.2)
        for beat in (0, 2):
            st = t + beat * B
            if st < t1:
                put(music, bass(ROOT_N[ch] + 12), st, 0.35 * gain, rev=0.05)
        if drums:
            for beat in range(4):
                st = t + beat * B
                if st < t1:
                    if beat in (0, 2):
                        put(music, kick(), st, 0.25 * gain, rev=0.0)
                    put(music, brush(0.15, 0.5 if beat in (1, 3) else 0.25), st, 0.35 * gain, pan=0.3)
                    put(music, brush(0.08, 0.15), st + B / 2, 0.35 * gain, pan=0.3)
        t += bar
        k += 1


groove(0.0, FLIPS[0], ["C", "G", "Am", "F"], 1.0)  # lunes: confiado
groove(FLIPS[0], L["l3"]["start"], ["Am", "Em"], 0.7, drums=False)  # viernes: bajón
# el robot: silencio musical, solo pitidos
for k, f in enumerate([880, 660, 990, 520]):
    put(sfx, beep(f), L["l3"]["start"] - 0.25 + k * 0.07, 0.25, pan=0.2)
put(sfx, beep(330, 0.35), L["l3"]["end"] + 0.02, 0.22)
groove(FLIPS[1], FLIPS[2], ["F", "C", "Dm", "G"], 0.75, drums=False)  # mamá
groove(FLIPS[2], FLIPS[3], ["Am", "F"], 0.8, drums=True)  # sara
groove(FLIPS[3], FLIPS[4] - 0.05, ["C", "F", "G", "C"], 1.0)  # las tres cartas: arranca
# puerta: silencio para los golpes. Después, final cálido
groove(DOOR + 0.35, CLOSE, ["F", "G", "C", "C", "F", "G", "C"], 0.9, drums=True)
put(music, strum([60, 64, 67, 72, 76], 2.5, True, 1.2), CLOSE, 0.7, rev=0.5)
put(music, uke(84, 1.8), CLOSE + 0.15, 0.25, rev=0.5)

# ---------------------------------------------------------------- efectos
for f in FLIPS:
    put(sfx, page_flip(), f - 0.05, 0.5, pan=-0.3, rev=0.1)
for st, d in [(0.1, 1.0), (FLIPS[0] + 0.2, 0.7), (FLIPS[3] + 0.3, 1.4), (FLIPS[5] + 0.2, 1.2)]:
    put(sfx, pencil(d), st, 0.35, pan=0.25, rev=0.05)
for kt in KNOCKS:
    put(sfx, knock(), kt, 0.9, rev=0.4)
put(sfx, creak(), DOOR, 0.5, pan=0.2, rev=0.3)
put(sfx, page_flip(), CLOSE - 0.25, 0.5)
put(sfx, book_close(), CLOSE, 0.7, rev=0.3)

# ---------------------------------------------------------------- mezcla
ir_t = np.arange(int(1.6 * SR)) / SR
wet = np.zeros_like(music)
for c in range(2):
    ir = filt(rng.standard_normal(len(ir_t)) * np.exp(-ir_t / 0.4), "low", 6000)
    wet[:, c] = fftconvolve(send[:, c], ir / np.sqrt(np.sum(ir**2)))[:N]
music = music / (np.max(np.abs(music)) + 1e-9)
sfx = sfx / (np.max(np.abs(sfx)) + 1e-9)

with wave.open(os.path.join(ROOT, "public", "greg-voice.wav")) as w:
    voice = np.frombuffer(w.readframes(w.getnframes()), np.int16) / 32768
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
venv = fftconvolve(np.abs(voice), np.ones(int(0.2 * SR)) / int(0.2 * SR), mode="same")
venv = np.clip(venv / (np.percentile(venv[venv > 0.01], 90) + 1e-9), 0, 1)
duck = 1 - 0.55 * venv

mix = music * 0.3 * duck[:, None] + sfx * 0.45 + wet * 0.12 + voice[:, None] * 0.95
fade = int(0.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = filt(mix.T, "high", 35).T
mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.2) / np.tanh(1.2) * 0.95
with wave.open(os.path.join(ROOT, "public", "greg-mix.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok -> public/greg-mix.wav", [round(f, 2) for f in FLIPS], KNOCKS, round(DOOR, 2))
