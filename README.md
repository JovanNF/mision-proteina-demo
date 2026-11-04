# Misión Proteína: Código de Vida 🧬

Videojuego educativo y simulador interactivo de biología molecular y genética médica, diseñado para estudiantes universitarios de la licenciatura en Medicina.

---

## 🔬 Descripción del Proyecto

El jugador asume el rol de un investigador biomédico en un laboratorio celular. Una línea celular ha detenido la síntesis de una proteína funcional vital. Para diagnosticar y resolver la patología celular, el estudiante debe reconstruir de manera interactiva cada etapa del **Dogma Central de la Biología Molecular**:

1. **Fase 1: Transcripción (Núcleo) [DEMO ACTIVA]** — Reconstrucción del pre-ARNm complementario en dirección 5' → 3' a partir de la hebra molde de ADN (3' → 5') mediante la ARN Polimerasa II.
2. **Fase 2: Procesamiento del pre-ARNm [Próximamente]** — Capping 5' (7-metilguanosina), remoción de intrones por el espliceosoma (sitios consenso GU...AG), ligación de exones y poliadenilación en 3'.
3. **Fase 3: Traducción Ribosomal [Próximamente]** — Decodificación de codones, emparejamiento codón-anticodón con ARNt, enlaces peptídicos y reconocimiento de codones de terminación (Stop: UGA/UAA/UAG).
4. **Fase 4: Modificación y Tráfico Celular [Próximamente]** — Reconocimiento del péptido señal por la partícula SRP, translocación al RER, control de calidad con chaperonas y tránsito vesicular por el Aparato de Golgi.
5. **Fase 5: Diagnóstico Molecular (Caso Clínico) [Próximamente]** — Comparación de secuencias genéticas de un paciente frente al gen control, identificación de mutaciones puntuales (mutación sin sentido / *nonsense*) y fundamentación fisiopatológica.

---

## 🚀 Versión Actual: DEMO v1.0 (Demostración de Fase 01)

Esta versión de demostración pública incluye la experiencia interactiva completa de la **Fase 01: Transcripción**:

- **Pantalla Inicial (Hero/Home):** Alerta fisiopatológica celular, narrativa de inmersión y previsualización de las fases.
- **HUD Central:** Indicador de misión activa (1/5), puntaje global acumulativo (0/500 pts), control de sonido sintetizado nativo y reinicio de simulación.
- **Panel de Misiones:** Estado dinámico de niveles; la Fase 01 se encuentra completamente interactiva y jugable, mientras que las fases 02 a 05 están documentadas con sus mecanismos celulares previstos para la versión completa.
- **Nivel 1 (Transcripción) 100% Funcional e Interactivo:**
  - Secuencia de ADN molde: `3'-TAC GGA CTT ACT-5'`.
  - Secuencia objetivo de pre-ARNm: `5'-AUG CCU GAA UGA-3'`.
  - Enzima ARN Polimerasa II animada con desplazamiento dinámico y aura luminosa activa.
  - Ignición visual de puentes de hidrógeno (2 enlaces A-U, 3 enlaces G-C).
  - Microanimación de ensamblaje molecular en cada ribonucleótido incorporado.
  - Barra de progreso molecular en tiempo real con puntero láser de síntesis.
  - Fondo ambiental de laboratorio vivo con partículas bioluminiscentes aceleradas por hardware (60 FPS).
  - Teclado molecular táctil optimizado para pantallas táctiles de celulares, tablets y mouse de escritorio.
  - Atajos de teclado físico: `[A]`, `[U]`, `[C]`, `[G]` o números `[1]`, `[2]`, `[3]`, `[4]`.
  - Detección de error conceptual grave: advertencia y penalización si el usuario intenta ingresar Timina en el ARN (`T`).
  - Botón de "Deshacer último nucleótido" (o tecla `Backspace`) y botón de reinicio de hebra.
  - Sistema de pistas pedagógicas limitadas (`💡 Pista`).
  - Validación bioquímica inmediata con explicación específica de la complementariedad entre ADN y ARN.
  - Al completar la hebra: celebración sonora, desglose didáctico de los 4 codones (`AUG`: Metionina, `CCU`: Prolina, `GAA`: Glutamato, `UGA`: Stop) y registro de puntuación.
- **Audio Sintetizado Nativo:** Motor de sonido con **Web Audio API** (sin archivos de audio externos que puedan fallar en GitHub Pages o requerir conexión).
- **Persistencia:** Almacenamiento del progreso y récord de puntuaciones mediante `LocalStorage`.

---

## 📂 Archivos del Videojuego

```text
mision-proteina/
├── index.html                           # Estructura semántica, accesibilidad y vistas principales
├── css/
│   └── styles.css                       # Tema Biotech Dark, microanimaciones y responsive
├── js/
│   ├── audio.js                         # Sintetizador Web Audio API (cero dependencias externas)
│   ├── state.js                         # Gestor de estado reactivo y persistencia en LocalStorage
│   ├── app.js                           # Orquestador de vistas, modales y navegación
│   ├── data/
│   │   └── levels.js                    # Base de datos científica de los niveles
│   └── components/
│       ├── ambientBackground.js         # Fondo ambiental interactivo de partículas en canvas
│       └── level1.js                    # Controlador interactivo del Nivel 1 (Transcripción)
└── README.md                            # Documentación del proyecto
```

---

## 🌐 Compatibilidad y Despliegue

- **Compatibilidad:** Google Chrome, Microsoft Edge, Mozilla Firefox, Safari (iOS/macOS) y navegadores móviles de Android.
- **Diseño Responsive:** Totalmente adaptado para pantallas de escritorio, tablets y teléfonos móviles (360px a 1024px+).
- **Alojamiento:** Diseñado para ejecución 100% estática en **GitHub Pages** sin requerir backend, dependencias npm ni bases de datos externas.
