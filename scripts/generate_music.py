"""
KNOK — banda sonora original (sintetizada, libre de derechos).

Estilo: thriller cinematográfico con pulso. 120 BPM (1 pulso = 15 frames a 30 fps),
así cada corte de escena cae exactamente sobre el ritmo.

  0.0 – 15.0 s  Tensión: dron grave, reloj, latido, ostinato que crece, "braams"
 15.0 – 17.0 s  Silencio. Toc… toc. (los golpes de puerta de KNOK)
 17.0 s         Impacto: se abre la puerta
 18.0 – 34.0 s  Pulso épico: percusión tipo taiko, bajo, ostinato Dm–Bb–F–C
 34.0 – 38.0 s  Golpe final, acorde suspendido y último "toc toc"

Uso:  python3 scripts/generate_music.py   ->  public/music.wav
"""

import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
DUR = 38.0
N = int(SR * DUR)
BPM = 120
BEAT = 60 / BPM
S16 = BEAT / 4

rng = np.random.default_rng(7)

dry = np.zeros((N, 2))
verb_send = np.zeros((N, 2))


# ----------------------------------------------------------------- helpers
def t_arr(dur):
    return np.arange(int(SR * dur)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, cutoff, order=2):
    sos = butter(order, min(cutoff, SR / 2 - 100), btype="low", fs=SR, output="sos")
    return sosfilt(sos, x)


def hp(x, cutoff, order=2):
    sos = butter(order, cutoff, btype="high", fs=SR, output="sos")
    return sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def saw(freq, t, phase=0.0):
    return 2.0 * ((freq * t + phase) % 1.0) - 1.0


def add(sig, start, gain=1.0, pan=0.0, send=0.0):
    """Mezcla una señal mono en el bus estéreo (pan -1..1) con envío a reverb."""
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    seg = slice(i, i + len(sig))
    dry[seg, 0] += sig * gain * l
    dry[seg, 1] += sig * gain * r
    if send:
        verb_send[seg, 0] += sig * gain * l * send
        verb_send[seg, 1] += sig * gain * r * send


def env_exp(dur, decay, attack=0.002):
    t = t_arr(dur)
    a = np.clip(t / attack, 0, 1)
    return a * np.exp(-t / decay)


# ----------------------------------------------------------------- sounds
def tick(high=True):
    d = 0.04
    n = rng.standard_normal(int(SR * d))
    s = bp(n, 4500 if high else 2800, 9000 if high else 6000) * env_exp(d, 0.006)
    return s


def heartbeat():
    d = 0.35
    t = t_arr(d)
    f = 48 + 40 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, 0.09, 0.004)
    return np.tanh(s * 2.2)


def kick(big=False):
    d = 0.6 if big else 0.4
    t = t_arr(d)
    f = (38 if big else 45) + (140 if big else 110) * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, 0.22 if big else 0.14, 0.001)
    click = hp(rng.standard_normal(len(t)), 2000) * env_exp(d, 0.004)
    return np.tanh(body * 2.5) + click * 0.25


def taiko():
    d = 0.9
    t = t_arr(d)
    f = 70 + 60 * np.exp(-t / 0.05)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, 0.28, 0.002)
    skin = lp(rng.standard_normal(len(t)), 900) * env_exp(d, 0.06)
    return np.tanh(body * 1.8 + skin * 1.2)


def snare_low():
    d = 0.5
    t = t_arr(d)
    tone = np.sin(2 * np.pi * 180 * t) * env_exp(d, 0.06)
    noise = bp(rng.standard_normal(len(t)), 600, 7000) * env_exp(d, 0.12)
    return np.tanh(tone * 0.8 + noise * 1.4)


def hat(open_=False):
    d = 0.25 if open_ else 0.06
    n = rng.standard_normal(int(SR * d))
    return hp(n, 7000, 4) * env_exp(d, 0.08 if open_ else 0.012)


def knock():
    """Golpe de nudillos sobre madera: transitorio + modos resonantes de la puerta."""
    d = 0.5
    t = t_arr(d)
    noise = lp(rng.standard_normal(len(t)), 2500) * env_exp(d, 0.008)
    modes = sum(
        a * np.sin(2 * np.pi * f * t) * np.exp(-t / dec)
        for f, a, dec in [(118, 1.0, 0.09), (205, 0.6, 0.06), (390, 0.35, 0.04), (760, 0.15, 0.02)]
    )
    return np.tanh((noise * 1.4 + modes * 1.1) * 1.6)


def braam(root_midi, dur=3.2, bright=1.0):
    t = t_arr(dur)
    sig = np.zeros(len(t))
    for n_off in (0, 12, 19, -12):
        f = midi(root_midi + n_off)
        for det in (-0.12, 0.0, 0.13):
            sig += saw(f * 2 ** (det / 12), t, rng.random())
    sig /= 12
    # filtro que se abre y se cierra: carácter de metales graves
    out = np.zeros_like(sig)
    blk = 1024
    zi_cut = None
    for s in range(0, len(sig), blk):
        tt = s / SR
        cut = 180 + 2200 * bright * np.exp(-tt / 0.7) * min(tt / 0.06, 1)
        sos = butter(2, cut, btype="low", fs=SR, output="sos")
        if zi_cut is None:
            zi_cut = np.zeros((sos.shape[0], 2))
        out[s : s + blk], zi_cut = sosfilt(sos, sig[s : s + blk], zi=zi_cut)
    env = np.clip(t / 0.05, 0, 1) * np.exp(-t / (dur * 0.38))
    return np.tanh(out * env * 3.0)


def sub_boom(dur=3.0):
    t = t_arr(dur)
    f = 28 + 70 * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(dur, 0.9, 0.003)
    return np.tanh(s * 2.0)


def whoosh(dur=1.0, rise=True):
    t = t_arr(dur)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    blk = 512
    zi = None
    for s in range(0, len(n), blk):
        p = s / len(n)
        p = p if rise else 1 - p
        lo = 200 + 5000 * p**2
        sos = butter(2, [lo, lo * 2.2], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        out[s : s + blk], zi = sosfilt(sos, n[s : s + blk], zi=zi)
    env = (t / dur) ** 2.2 if rise else (1 - t / dur) ** 2
    return out * env * 2.5


def glitch(dur=0.18):
    t = t_arr(dur)
    f = rng.uniform(300, 2400)
    sq = np.sign(np.sin(2 * np.pi * f * t * (1 + 3 * t)))
    crush = np.round(sq * rng.standard_normal(len(t)) * 3) / 3
    return (sq * 0.5 + crush * 0.5) * np.clip(1 - t / dur, 0, 1) ** 0.5


def pluck(freq, dur=0.22, bright=1500):
    t = t_arr(dur)
    s = saw(freq, t) * 0.6 + saw(freq * 1.005, t) * 0.4
    s = lp(s, bright)
    return s * env_exp(dur, dur * 0.35, 0.002)


def pad(freqs, dur, cutoff=900):
    t = t_arr(dur)
    s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.08, 0.08):
            s += saw(f * 2 ** (det / 12), t, rng.random())
    s = lp(s / (len(freqs) * 2), cutoff)
    a = 0.4
    env = np.clip(t / a, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return s * env


def shepard_riser(dur):
    t = t_arr(dur)
    out = np.zeros(len(t))
    voices = 6
    for v in range(voices):
        oct_pos = (v / voices + t / dur * 1.2) % 1.0
        f = 55 * 2 ** (oct_pos * voices)
        amp = np.exp(-((oct_pos - 0.5) ** 2) / 0.06)
        out += np.sin(2 * np.pi * np.cumsum(f) / SR) * amp
    return out / voices * (t / dur) ** 1.5


# ======================================================== ACTO 1: tensión
# Dron grave en Re
t = t_arr(15.0)
drone = (
    np.sin(2 * np.pi * midi(26) * t) * 0.6
    + lp(saw(midi(38), t) + saw(midi(38) * 1.003, t), 260) * 0.35
    + lp(saw(midi(45), t), 200) * 0.15
)
drone *= np.clip(t / 2.5, 0, 1) * (0.45 + 0.55 * t / 15)
add(drone, 0.0, 0.55, send=0.3)

# Reloj (tic-tac). Negras al principio, corcheas desde 8 s
tt = 0.0
k = 0
while tt < 15.0:
    add(tick(k % 2 == 0), tt, 0.32 if tt < 8 else 0.4, pan=-0.35 if k % 2 else 0.35, send=0.15)
    tt += BEAT if tt < 8 else BEAT / 2
    k += 1

# Latido (lub-dub) cada dos pulsos desde 4 s
for b in np.arange(4.0, 15.0, BEAT * 2):
    add(heartbeat(), b, 0.75)
    add(heartbeat(), b + 0.16, 0.45)

# Ostinato de semicorcheas que se abre poco a poco (Re menor)
pattern = [50, 50, 57, 50, 53, 50, 52, 50, 50, 50, 57, 50, 55, 53, 52, 49]
step = 0
for st in np.arange(4.0, 15.0, S16):
    prog = (st - 4.0) / 11.0
    n = pattern[step % 16]
    add(
        pluck(midi(n), bright=600 + 3200 * prog**1.5),
        st,
        0.10 + 0.14 * prog,
        pan=0.25 * np.sin(step * 0.7),
        send=0.25,
    )
    step += 1

# Braams en cada cambio de escena
for b, root, br in [(4.0, 26, 0.8), (8.0, 25, 0.9), (12.0, 26, 1.1)]:
    add(braam(root, 3.4, br), b, 0.75, send=0.5)
    add(sub_boom(2.0), b, 0.6)
    add(whoosh(0.8), b - 0.8, 0.18, send=0.3)

# Interferencias digitales en la escena del ojo (8–12 s)
for g in [8.62, 9.05, 9.4, 9.88, 10.3, 10.55, 11.1, 11.45]:
    add(glitch(rng.uniform(0.06, 0.2)), g, 0.12, pan=rng.uniform(-0.8, 0.8), send=0.2)

# Escalada final de tensión (Shepard + ruido + redoble)
add(shepard_riser(3.0), 12.0, 0.35, send=0.4)
add(whoosh(2.5), 12.5, 0.35, send=0.3)
for i, st in enumerate(np.arange(13.0, 15.0, S16 / 2)):
    p = (st - 13.0) / 2.0
    add(snare_low(), st, 0.05 + 0.25 * p**2, send=0.2)

# ======================================================== silencio + KNOK KNOK
add(knock(), 15.5, 0.95, pan=-0.05, send=0.55)
add(knock(), 16.0, 1.0, pan=0.05, send=0.55)
add(whoosh(1.0), 16.0, 0.35, send=0.4)

# 17 s: la puerta se abre — impacto
add(sub_boom(3.5), 17.0, 0.9)
add(braam(26, 4.0, 1.3), 17.0, 0.8, send=0.6)
add(taiko(), 17.0, 0.8, send=0.5)
add(hat(True), 17.0, 0.3, send=0.6)

# ======================================================== ACTO 2: pulso
chords = {  # i – VI – III – VII
    "Dm": [50, 53, 57],
    "Bb": [46, 50, 53],
    "F": [45, 48, 53],
    "C": [43, 48, 52],
}
roots = {"Dm": 38, "Bb": 34, "F": 41, "C": 36}
prog = ["Dm", "Bb", "F", "C", "Dm", "Bb", "F", "C"]
BAR = BEAT * 4

for bi, ch in enumerate(prog):
    b0 = 18.0 + bi * BAR
    energy = 0.6 + 0.4 * bi / 7
    # pad
    add(pad([midi(n) for n in chords[ch]] + [midi(chords[ch][0] + 12)], BAR + 0.3, 700 + 600 * energy), b0, 0.22, send=0.5)
    for s in range(16):
        st = b0 + s * S16
        # percusión
        if s in (0, 3, 8, 10):
            add(kick(), st, 0.9)
        if s in (4, 12):
            add(snare_low(), st, 0.45, send=0.35)
        if s in (6, 14) and bi % 2 == 1:
            add(taiko(), st, 0.45, pan=0.3, send=0.4)
        add(hat(open_=(s % 4 == 2)), st, (0.10 if s % 2 else 0.16) * energy, pan=0.4)
        # bajo en corcheas
        if s % 2 == 0:
            add(lp(pluck(midi(roots[ch] - 12), 0.24, 500), 400), st, 0.55)
        # ostinato arpegiado
        arp = chords[ch] + [chords[ch][1] + 12]
        nn = arp[(s * 3) % 4] + 12
        add(pluck(midi(nn), 0.16, 2500 + 1500 * energy), st, 0.08 + 0.05 * energy, pan=-0.3 + 0.6 * (s % 2), send=0.3)

# transiciones entre funciones del producto
for tr in (22.0, 27.0, 30.0):
    add(whoosh(0.6), tr - 0.6, 0.25, send=0.3)
    add(taiko(), tr, 0.7, send=0.5)
    add(sub_boom(1.2), tr, 0.4)

# subida al final
add(shepard_riser(2.0), 32.0, 0.25, send=0.4)
add(whoosh(1.6), 32.4, 0.35, send=0.3)
for st in np.arange(33.0, 34.0, S16 / 2):
    p = st - 33.0
    add(snare_low(), st, 0.1 + 0.35 * p**2, send=0.25)

# ======================================================== FINAL
add(sub_boom(4.0), 34.0, 1.0)
add(braam(26, 4.0, 1.4), 34.0, 0.7, send=0.7)
add(taiko(), 34.0, 0.9, send=0.6)
add(kick(big=True), 34.0, 0.8)
add(hat(True), 34.0, 0.3, send=0.7)
# acorde suspendido luminoso (Dsus2 -> D)
add(pad([midi(n) for n in (50, 52, 57, 62, 69)], 3.9, 1800), 34.05, 0.3, send=0.8)
# último toc-toc: firma de la marca
add(knock(), 36.5, 0.7, send=0.6)
add(knock(), 36.85, 0.75, send=0.6)

# ================================================================= mezcla
ir_len = int(SR * 2.8)
it = np.arange(ir_len) / SR
ir_l = rng.standard_normal(ir_len) * np.exp(-it / 0.75)
ir_r = rng.standard_normal(ir_len) * np.exp(-it / 0.75)
ir_l, ir_r = lp(ir_l, 5000), lp(ir_r, 5000)
ir_l /= np.sqrt(np.sum(ir_l**2))
ir_r /= np.sqrt(np.sum(ir_r**2))
wet = np.stack(
    [fftconvolve(verb_send[:, 0], ir_l)[:N], fftconvolve(verb_send[:, 1], ir_r)[:N]], axis=1
)

mix = dry + wet * 0.55
mix = hp(mix.T, 25).T
# silencio real entre 15.0 y 15.5 s (corte en seco antes del primer "toc")
cut0, cut1 = int(15.0 * SR), int(15.48 * SR)
mix[cut0:cut1] *= np.linspace(0.02, 0.0, cut1 - cut0)[:, None]
# pequeña fundida al final
fade = int(1.0 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2

mix /= np.max(np.abs(mix)) + 1e-9
mix = np.tanh(mix * 1.6) / np.tanh(1.6) * 0.95

os.makedirs(os.path.join(os.path.dirname(__file__), "..", "public"), exist_ok=True)
out_path = os.path.join(os.path.dirname(__file__), "..", "public", "music.wav")
pcm = (mix * 32767).astype(np.int16)
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok ->", os.path.abspath(out_path))
