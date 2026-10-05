"""
Genera los extras para subir el vídeo a YouTube a partir de src/doc/timings.json:
  render/youtube/subtitulos.srt   subtítulos (mismo troceado que los subtítulos del vídeo)
  render/youtube/descripcion.txt  descripción con capítulos (marcas de tiempo)
"""

import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
TM = json.load(open(os.path.join(ROOT, "src", "doc", "timings.json")))
LINES = TM["lines"]
CH = TM["chapters"]
OUT = os.path.join(ROOT, "render", "youtube")
os.makedirs(OUT, exist_ok=True)


def chunks(l):
    parts = []
    for s0 in re.findall(r"[^.!?…:]+[.!?…:]*\s*", l["text"]) or [l["text"]]:
        s = s0.strip()
        while len(s) > 68:
            cut = s.rfind(", ", 0, 68)
            if cut < 25:
                cut = s.rfind(" ", 0, 68)
            parts.append(s[: cut + 1].strip())
            s = s[cut + 1 :].strip()
        if s:
            parts.append(s)
    total = sum(len(p) for p in parts)
    acc = 0
    out = []
    for p in parts:
        a = l["start"] + (l["end"] - l["start"]) * acc / total
        acc += len(p)
        out.append((p, a, l["start"] + (l["end"] - l["start"]) * acc / total))
    return out


def ts(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = t % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}"


subs = [c for l in LINES for c in chunks(l)]
with open(os.path.join(OUT, "subtitulos.srt"), "w") as f:
    for i, (txt, a, b) in enumerate(subs, 1):
        nxt = subs[i][1] if i < len(subs) else b + 1
        f.write(f"{i}\n{ts(a)} --> {ts(min(b + 0.2, nxt - 0.02))}\n{txt}\n\n")

order = ["intro", "antes", "embudo", "ia", "funciona", "knok", "cierre"]
marks = []
for c in order:
    first = next(l for l in LINES if l["chapter"] == c)
    t = 0 if c == "intro" else max(0, first["start"] - 2.9)
    marks.append((t, CH[c]))


def mmss(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"


desc = f"""¿Mandas currículums y nadie te contesta? No eres tú: la forma de buscar trabajo ha cambiado. En este vídeo vemos qué se ha roto, por qué la inteligencia artificial lo ha complicado todavía más, y qué puedes hacer para que te llamen.

Capítulos
{chr(10).join(f"{mmss(t)} {name}" for t, name in marks)}

Resumen:
✔ Menos y mejor
✔ Personaliza de verdad
✔ Apunta bien (perfil, ciudad, salario)
✔ Haz seguimiento
✔ Deja lo repetitivo a una herramienta

knok busca ofertas que encajan contigo, escribe un correo distinto para cada empresa, lo envía en un clic y aplica desde LinkedIn y otros portales con su extensión para Chrome.

#buscartrabajo #empleo #inteligenciaartificial #cv #entrevistadetrabajo #knok
"""
with open(os.path.join(OUT, "descripcion.txt"), "w") as f:
    f.write(desc)
print(desc)
print(len(subs), "subtítulos")
