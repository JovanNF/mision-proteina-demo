# Misión Proteína: Código de Vida 🧬

Videojuego educativo y simulador interactivo de biología molecular y genética médica, diseñado para estudiantes universitarios de la licenciatura en Medicina y ciencias biomédicas.

---

## 🔬 Descripción General

El jugador asume el rol de un investigador biomédico en formación dentro de un laboratorio de biología molecular y genética celular. A través de cinco misiones interactivas con mecánicas diferenciadas, el estudiante reconstruye y manipula paso a paso el **Dogma Central de la Biología Molecular** y resuelve un caso pericial didáctico:

1. **Fase 01: Transcripción — Descifra el ADN (Núcleo)**
   - Síntesis enzimática del pre-ARNm complementario en dirección 5' → 3' a partir de la hebra molde de ADN (3' → 5') mediante la ARN Polimerasa II.
   - Enlace por puentes de hidrógeno específicos (2 enlaces A-U, 3 enlaces G-C), teclado molecular táctil y detección de errores conceptuales (incorporación de Timina en ARN).

2. **Fase 02: Procesamiento y Maduración del pre-ARNm (Mesa Quirúrgica Molecular)**
   - Capping cotranscripcional en el extremo 5': incorporación de GMP a partir de GTP por la guanililtransferasa (enlace 5'-5' trifosfato) y metilación en N7 por la metiltransferasa para formar la caperuza m7G.
   - Espliceosoma y dos reacciones de transesterificación concertadas: ataque nucleofílico del 2'-OH de la Adenina de ramificación sobre el sitio donador 5'-GU (formación del lazo intrónico) y posterior empalme directo de exones por el 3'-OH libre del exón 1 sobre el sitio aceptor 3'-AG, sin intervención de ligasa independiente.
   - Reconocimiento de la señal de poliadenilación 5'-AAUAAA-3' por el factor CPSF, escisión endonucleolítica 3' y síntesis de la cola poli-A (~200-250 Adeninas) por la Poli-A Polimerasa (PAP).
   - Evaluación diagnóstica de splicing aberrante ante alteraciones en el sitio aceptor 3'-AG (retención intrónica en el escenario didáctico).

3. **Fase 03: Traducción Ribosomal 80S (Motor Molecular de Trinquete)**
   - Iniciación eucariota: ensamblaje del complejo 80S con el ARNt iniciador (tRNAi-Met, 3'-UAC-5') posicionado directamente en el Sitio P sobre el codón 5'-AUG-3'.
   - Elongación y comprobación cinética: apareamiento antiparalelo de codones 5' → 3' frente a anticodones 3' → 5' asistido por el factor eEF1A en el Sitio A.
   - Catálisis peptidil transferasa por la ribozima de ARNr 28S de la subunidad mayor 60S para formar el enlace peptídico (-CO-NH-).
   - Translocación mecanobiológica: desplazamiento del ribosoma sobre el ARNm en dirección 5' → 3' avanzando exactamente un codón por acción de la palanca de trinquete del factor eEF2 con hidrólisis de GTP, eyección del ARNt desacilado por el Sitio E y proyección de la cadena por el túnel de salida.
   - Terminación por el factor de liberación eRF1 ante el codón de parada 5'-UGA-3'.

4. **Fase 04: Modificación y Tráfico Celular (Logística y Control ERAD)**
   - Transición pedagógica a un modelo experimental independiente dedicado a una proteína de la vía secretora dotada de péptido señal N-terminal hidrófobo.
   - Reconocimiento citosólico por la partícula SRP, arresto de la traducción y anclaje a la membrana del RER.
   - Apertura del poro del translocón Sec61 y escisión cotraduccional por la peptidasa de señal.
   - Supervisión conformacional en el lumen del retículo por chaperonas moleculares (BiP / GRP78 y PDI).
   - Conmutación de la bifurcación celular de calidad: empaquetamiento anterógrado en vesículas COP II hacia la red cis-Golgi (proteína nativa) versus activación de la vía ERAD (retrotranslocación citosólica, marcaje con poli-ubiquitina y degradación en el proteasoma 26S para proteínas con mal plegamiento irreversible).

5. **Fase 05: Diagnóstico Clínico Molecular (Caso Didáctico 042-B)**
   - Comparación genómica directa de hebras codificantes (WT control vs muestra 042-B) e identificación de la alteración primaria en ADN sin sesgos anticipados.
   - Decodificación del triplete mutado en ARNm mediante visor molecular del marco de lectura.
   - Tablero de deducción causal (Pinboard): correlación rigurosa de causa-efecto (transversión c.4G>T ➔ mutación sin sentido / *nonsense* ➔ codón de parada prematuro PTC: 5'-UAA-3' ➔ truncamiento en Met-1).
   - Análisis crítico de los límites diagnósticos: determinación formal de que la susceptibilidad a decaimiento mediado por mutaciones sin sentido (NMD) no es determinable con una secuencia aislada de 12 nucleótidos al requerir la posición del complejo de unión de exones (EJC >50-55 nt).

---

## 🏆 Certificado de Finalización

Al concluir con éxito las cinco fases del simulador en una partida regular, el sistema emite el documento solemne:
**Certificado de finalización — Misión Proteína**, con desglose formal de puntuación por fase sobre 100 puntos (Puntuación máxima global: **500 puntos**) y firma de «Misión Proteína — Simulador educativo».

---

## 💻 Arquitectura Técnica y Tolerancia a Fallos

- **Cero Dependencias Externas:** Desarrollado exclusivamente en Vanilla JavaScript (ES6+), HTML5 semántico y CSS3 moderno.
- **Audio Nativo Sintetizado:** Implementado íntegramente mediante la **Web Audio API** de los navegadores, generando tonos armónicos e ignición de frecuencias sin requerir descargas de archivos `.mp3` ni `.wav`.
- **Fondo Ambiental Interactivo:** Partículas bioluminiscentes y filamentos de ADN flotantes renderizados sobre `<canvas>` con aceleración por hardware a 60 FPS.
- **Persistencia Robusta (`js/state.js`):** Almacenamiento local mediante `LocalStorage` con sanitización de identificadores de nivel (1–5), acotamiento estricto de puntuaciones (0–100 pts por nivel, 0–500 pts acumulados) y normalización ante datos locales corruptos o no numéricos.
- **Modo de Pruebas Local:** Barra de herramientas de desarrollador activa únicamente en entornos locales (`localhost`, `127.0.0.1`, `file:`) y completamente inhabilitada en producción.
- **Diseño Responsive Integral:** Interfaces fluidas probadas y adaptadas para resoluciones desde 360px (móviles compactos), 390px, 768px (tablets) hasta 1024px+ (escritorio), con soporte táctil y atajos de teclado físico.

---

## 📂 Estructura del Proyecto

```text
mision-proteina/
├── index.html                           # Estructura semántica, vistas HUD y modales
├── css/
│   └── styles.css                       # Diseño Biotech Dark, componentes y responsive
├── js/
│   ├── app.js                           # Orquestador principal, navegación y certificado
│   ├── audio.js                         # Motor de audio con Web Audio API
│   ├── state.js                         # Gestor de estado normalizado y persistencia
│   ├── data/
│   │   └── levels.js                    # Base de datos científica y desafíos moleculares
│   └── components/
│       ├── ambientBackground.js         # Canvas de partículas bioluminiscentes
│       ├── level1.js                    # Controlador Nivel 1: Transcripción
│       ├── level2.js                    # Controlador Nivel 2: Maduración y Splicing
│       ├── level3.js                    # Controlador Nivel 3: Traducción Ribosomal 80S
│       ├── level4.js                    # Controlador Nivel 4: Tráfico Celular y ERAD
│       └── level5.js                    # Controlador Nivel 5: Diagnóstico y Genética Médica
└── README.md                            # Documentación técnica y pedagógica
```

---

## 🚀 Despliegue en GitHub Pages

El proyecto está diseñado para funcionar como un sitio estático puro:
1. No requiere instalación de paquetes (`node_modules`), compiladores ni servidores Node.js.
2. Compatible con cualquier servidor HTTP o plataforma de hosting estático (GitHub Pages, Netlify, Vercel).
3. Todas las rutas de recursos son relativas y utilizan codificación estándar UTF-8.
