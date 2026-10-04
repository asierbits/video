# Guion del vídeo 4 «El diario de Dani» — una voz por personaje.
# (id, personaje, texto en pantalla, texto para la voz, pausa después en s)
VOICES = {
    # voz kokoro, semitonos de tono, velocidad final, efecto
    "dani": ("em_alex", 1.5, 1.12, None),
    "robot": ("am_michael", -1.0, 1.05, "robot"),
    "mama": ("ef_dora", -1.5, 1.0, None),
    "sara": ("if_sara", 0.5, 1.1, None),
    "jefe": ("em_santa", -3.0, 1.0, None),
}

LINES = [
    ("l1", "dani", "Lunes. Hoy he mandado cincuenta currículums. El mismo a todos. Eficiencia pura.",
     "Lunes. Hoy he mandado cincuenta currículums. El mismo a todos. Eficiencia pura.", 0.35),
    ("l2", "dani", "Viernes. Cero respuestas. Bueno, una:",
     "Viernes. Cero respuestas. Bueno… una.", 0.1),
    ("l3", "robot", "Su perfil no encaja con nuestros requisitos.",
     "Su perfil no encaja, con nuestros requisitos.", 0.3),
    ("l4", "mama", "En mis tiempos ibas a la puerta y llamabas.",
     "En mis tiempos, ibas a la puerta, y llamabas.", 0.15),
    ("l5", "dani", "Mamá, ahora las puertas son robots.",
     "Mamá, ahora las puertas son robots.", 0.25),
    ("l6", "sara", "Pues llama a menos puertas… pero llama bien.",
     "Pues llama a menos puertas. Pero llama bien.", 0.3),
    ("l7", "dani", "Así que eso hice. Tres empresas. Tres cartas. Cada una, de verdad.",
     "Así que eso hice. Tres empresas. Tres cartas. Cada una, de verdad.", 1.0),
    ("l8", "jefe", "¿Daniel? Pasa, pasa.",
     "¿Daniel? Pasa, pasa.", 0.35),
    ("l9", "dani", "Nota mental: mamá tenía razón. Solo había que llamar… a la puerta correcta.",
     "Nota mental. Mamá tenía razón. Solo había que llamar… a la puerta correcta.", 0.0),
]
