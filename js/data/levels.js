/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Base de Datos Científica de Niveles y Desafíos
 * Verificado para estudiantes de Medicina (Biología Molecular y Genética Médica)
 */

window.GAME_LEVELS = [
  {
    id: 1,
    title: "Transcripción — Descifra el ADN",
    shortTitle: "Transcripción",
    subtitle: "Síntesis de ARN mensajero por la ARN Polimerasa II",
    statusBadge: "Fase 01 · Núcleo Celular",
    description: "Reconstruye la hebra complementaria de pre-ARNm a partir de la hebra molde de ADN nuclear aplicando las reglas de complementariedad bioquímica.",
    maxScore: 100,
    scientificBrief: {
      location: "Núcleo celular / Complejo de transcripción",
      machinery: "ARN Polimerasa II + Factores de Transcripción Basales",
      mechanism: "La ARN Polimerasa lee la hebra molde de ADN en sentido 3' → 5' y sintetiza la molécula de pre-ARNm en sentido 5' → 3', incorporando ribonucleótidos trifosfato complementarios (ATP, UTP, CTP, GTP).",
      keyRule: "En el ARN la Timina (T) es sustituida por el Uracilo (U). Por tanto: Adenina (ADN) se aparea con Uracilo (ARN)."
    },
    challenge: {
      templateStrand: ["T", "A", "C", "G", "G", "A", "C", "T", "T", "A", "C", "T"],
      templatePolarity: { start: "3'", end: "5'" },
      targetStrand:   ["A", "U", "G", "C", "C", "U", "G", "A", "A", "U", "G", "A"],
      targetPolarity:   { start: "5'", end: "3'" },
      codonsSummary: [
        { codon: "AUG", role: "Codón de inicio (Metionina)" },
        { codon: "CCU", role: "Prolina" },
        { codon: "GAA", role: "Ácido Glutámico (Glu)" },
        { codon: "UGA", role: "Codón de terminación (Stop)" }
      ],
      rules: {
        "T": { complement: "A", hBonds: 2, explain: "La Timina (T) del ADN se aparea con Adenina (A) mediante 2 puentes de hidrógeno." },
        "A": { complement: "U", hBonds: 2, explain: "¡Principio fundamental! La Adenina (A) del ADN se aparea con Uracilo (U) en el ARN (no con Timina)." },
        "C": { complement: "G", hBonds: 3, explain: "La Citosina (C) se aparea con Guanina (G) mediante 3 puentes de hidrógeno." },
        "G": { complement: "C", hBonds: 3, explain: "La Guanina (G) se aparea con Citosina (C) mediante 3 puentes de hidrógeno." }
      },
      errorExplanations: {
        "T_in_RNA": "¡Error biológico! El ARN no contiene Timina (T). La base pirimidínica que utiliza la ARN polimerasa es el Uracilo (U).",
        "A_pairing_fail": "Frente a una Adenina (A) en el molde de ADN, la polimerasa recluta Uracilo (U), pues forman 2 enlaces de hidrógeno.",
        "T_pairing_fail": "Frente a una Timina (T) en el ADN, la base complementaria es la Adenina (A).",
        "C_pairing_fail": "La Citosina (C) requiere Guanina (G) para estabilizar el emparejamiento con 3 enlaces de hidrógeno.",
        "G_pairing_fail": "La Guanina (G) requiere Citosina (C) para formar los 3 enlaces de hidrógeno."
      }
    },
    hints: [
      "Recuerda la complementariedad de bases entre ADN y ARN: la Adenina (ADN) se aparea con Uracilo (ARN) y la Guanina con Citosina.",
      "La hebra molde corre en dirección 3' → 5', por lo que tu síntesis avanza estrictamente en dirección 5' → 3'."
    ]
  },
  {
    id: 2,
    title: "Procesamiento — Prepara el Mensaje",
    shortTitle: "Maduración y Splicing",
    subtitle: "Capping 5', Poliadenilación 3' y Espliceosoma",
    statusBadge: "Fase 02 · Núcleo Eucariota",
    description: "Convierte el pre-ARNm primario en ARNm maduro eliminando intrones mediante corte y empalme (splicing) y añadiendo las modificaciones protectoras en ambos extremos.",
    maxScore: 100,
    scientificBrief: {
      location: "Núcleo celular / Espliceosoma (snRNP U1, U2, U4/U6, U5)",
      machinery: "Complejo Espliceosoma + Poli-A polimerasa + Guaniiltransferasa",
      mechanism: "El pre-ARNm eucariota sufre la adición de la 7-metilguanosina (Cap 5'), escisión de secuencias intrónicas no codificantes en los sitios consenso (GU...AG) y la adición de una cola poli-A en 3' para estabilizar y permitir la exportación al citoplasma."
    },
    locked: true,
    hints: [
      "Los intrones son secuencias escindidas que no se conservan en el ARNm maduro. Los exones permanecen en el ARNm procesado, aunque este incluye tanto la región codificante (CDS) como las regiones no traducidas 5' UTR y 3' UTR.",
      "El Cap 5' protege contra exonucleasas y es esencial para el reconocimiento del ribosoma."
    ]
  },
  {
    id: 3,
    title: "Traducción — Fabrica la Proteína",
    shortTitle: "Traducción Ribosomal",
    subtitle: "Decodificación por el Ribosoma y Síntesis Peptídica",
    statusBadge: "Fase 03 · Citoplasma / Ribosoma",
    description: "Interpreta los codones del ARNm con el ribosoma citosólico, coordina el acoplamiento de los ARNt con sus aminoácidos y reconoce la señal de terminación.",
    maxScore: 100,
    scientificBrief: {
      location: "Citoplasma / Subunidades ribosomales 40S y 60S (80S eucariota)",
      machinery: "Ribosoma + Complejos ARNt-aminoacil sintetasa + Factores eIF y eRF",
      mechanism: "El complejo ribosomal inicia en el codón AUG (Metionina), cataliza la formación de enlaces peptídicos en el sitio peptidil (P) y aceptor (A), finalizando al topar con un codón Stop (UGA, UAA o UAG) reconocido por factores de liberación."
    },
    locked: true,
    hints: [
      "El primer codón a leer siempre es AUG, que codifica Metionina.",
      "UGA no codifica un aminoácido en el código genético estándar: actúa como señal de alto o terminación."
    ]
  },
  {
    id: 4,
    title: "Modificación y Tráfico — Ruta Celular",
    shortTitle: "Tráfico y Vía Secretora",
    subtitle: "Reticulo Endoplásmico, Golgi y Clasificación Vesicular",
    statusBadge: "Fase 04 · Sistema de Endomembranas",
    description: "Orienta la proteína con péptido señal a través de la vía secretora: translocación al RER, control de calidad con chaperonas, glicosilación y clasificación en el Aparato de Golgi.",
    maxScore: 100,
    scientificBrief: {
      location: "RER → Aparato de Golgi (cis, medial, trans) → Vesículas de secreción",
      machinery: "Partícula SRP + Translocón Sec61 + Chaperonas BiP/Calnexina + COP II / COP I",
      mechanism: "Las proteínas de secreción son dirigidas por un péptido señal N-terminal. En el lumen del RER son plegadas y sufren N-glicosilación; luego viajan en vesículas COPII al Golgi para madurar y ser enviadas al exterior celular."
    },
    locked: true,
    hints: [
      "La partícula de reconocimiento de señal (SRP) detiene temporalmente la traducción hasta que el ribosoma se ancla al translocón del RER.",
      "En el RER actúan chaperonas para asegurar que solo proteínas correctamente plegadas pasen al Golgi."
    ]
  },
  {
    id: 5,
    title: "Diagnóstico Molecular — Resuelve el Caso",
    shortTitle: "Caso Clínico Genético",
    subtitle: "Identificación de Mutaciones y Fisiopatología",
    statusBadge: "Fase 05 · Diagnóstico Clínico",
    description: "Compara el ADN del paciente frente a la secuencia control, localiza la mutación puntual, deduce el cambio generado en el codón del ARNm (mutación sin sentido) y analiza las posibles repercusiones moleculares de un codón de terminación prematuro.",
    maxScore: 100,
    scientificBrief: {
      location: "Laboratorio de Genética Médica y Diagnóstico Molecular",
      machinery: "Secuenciación de ADN + Análisis Bioinformático de Marcos de Lectura",
      mechanism: "Una mutación en la cadena codificante (5'-ATG GAA CCT TAA-3' → 5'-ATG TAA CCT TAA-3') altera el codón 2 en el ARNm de GAA (Glutamato) a UAA, introduciendo un codón de terminación prematuro (mutación sin sentido o nonsense). Las consecuencias celulares dependerán del contexto biológico y la posición del transcrito: puede inducir degradación por decaimiento mediado por mutaciones sin sentido (NMD) o dar lugar a un polipéptido truncado con pérdida de función, efecto dominante negativo o inestabilidad estructural."
    },
    locked: true,
    hints: [
      "Compara base por base la secuencia codificante para detectar si es una sustitución, inserción o deleción.",
      "Verifica si el nuevo codón generado en el ARNm codifica un aminoácido o si es una señal de parada prematura (mutación sin sentido)."
    ]
  }
];
