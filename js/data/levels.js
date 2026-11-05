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
      machinery: "Complejo Espliceosoma + Poli-A polimerasa + Guanililtransferasa / Metiltransferasa",
      mechanism: "El pre-ARNm eucariota sufre la adición cotranscripcional de la caperuza 5' (incorporación de GMP a partir de GTP por la guanililtransferasa mediante enlace 5'–5' trifosfato y posterior metilación en N7 por la metiltransferasa para generar m7G), escisión de secuencias intrónicas no codificantes mediante dos reacciones de transesterificación del espliceosoma (sin ligasa independiente) y la adición template-independent de una cola poli-A en 3' para estabilizar y permitir la exportación al citoplasma."
    },
    locked: false,
    challenge: {
      sequenceData: {
        fiveUtr: "GGAGU",
        exon1: "AUGCCU",
        intronDonor: "GU",
        intronCore: "AAGUA",
        branchpoint: "A",
        intronAcceptor: "AG",
        exon2: "GAAUGA",
        polyASignal: "AAUAAA",
        threeUtrTail: "CAUGC"
      },
      cappingOptions: [
        { 
          id: "gtp", 
          label: "GTP (Guanosina trifosfato)", 
          correct: true, 
          explain: "¡Correcto! La guanililtransferasa emplea GTP como sustrato e incorpora GMP mediante un enlace invertido 5'–5' trifosfato [G(5')ppp(5')]. Posteriormente, una metiltransferasa específica añade el grupo metilo en la posición N7 de la guanina para constituir la caperuza madura m7G." 
        },
        { 
          id: "m7gtp", 
          label: "m7GTP preformado libre", 
          correct: false, 
          explain: "Imprecisión bioquímica. La guanililtransferasa celular no utiliza m7GTP preformado como sustrato; emplea GTP estándar para transferir GMP formando el enlace 5'–5' trifosfato, y posteriormente la metiltransferasa cataliza la metilación en N7." 
        },
        { 
          id: "atp", 
          label: "ATP (Adenosina trifosfato)", 
          correct: false, 
          explain: "Incorrecto. La modificación del extremo 5' requiere específicamente un ribonucleótido de guanina (GTP), no adenina." 
        },
        { 
          id: "dgtp", 
          label: "Desoxiguanosina trifosfato (dGTP)", 
          correct: false, 
          explain: "Error. El dGTP es un desoxirribonucleótido sustrato de ADN polimerasas. El procesamiento del ARN requiere ribonucleótidos." 
        }
      ],
      splicingSteps: [
        {
          stepId: 1,
          title: "Reconocimiento del sitio donador 5'",
          instruction: "Identifica y selecciona el dinucleótido del sitio donador 5' (5'-GU) reconocido por la ribonucleoproteína snRNP U1.",
          targetKey: "intronDonor",
          targetText: "GU",
          explain: "U1 snRNP se aparea específicamente con la secuencia consenso del sitio donador 5'-GU en la unión exón 1-intrón."
        },
        {
          stepId: 2,
          title: "Reconocimiento del punto de ramificación",
          instruction: "Identifica la Adenina del punto de ramificación (Branchpoint A) reconocida por snRNP U2.",
          targetKey: "branchpoint",
          targetText: "A",
          explain: "U2 snRNP reconoce la secuencia de ramificación y expone el grupo 2'-OH reactivo de esta Adenina para iniciar el ataque nucleofílico."
        },
        {
          stepId: 3,
          title: "1ª Transesterificación: Formación del lazo (Lariat)",
          instruction: "Activa el ataque del 2'-OH de la Adenina sobre el enlace fosfodiéster en el sitio donador 5'-GU.",
          actionType: "transesterification_1",
          explain: "¡Primera transesterificación ejecutada! El 2'-OH de la Adenina rompe el enlace 5' exón-intrón y forma un enlace fosfodiéster 2'-5' inusual, liberando el Exón 1 con un extremo 3'-OH reactivo y conformando la estructura de lazo (lariat)."
        },
        {
          stepId: 4,
          title: "Reconocimiento del sitio aceptor 3'",
          instruction: "Identifica el dinucleótido del sitio aceptor 3' (3'-AG) del intrón.",
          targetKey: "intronAcceptor",
          targetText: "AG",
          explain: "El espliceosoma aproxima el sitio aceptor 3'-AG al 3'-OH libre del Exón 1 para orientar la segunda reacción catalítica."
        },
        {
          stepId: 5,
          title: "2ª Transesterificación: Unión exónica directa (sin ligasa)",
          instruction: "Activa el ataque nucleofílico del 3'-OH del Exón 1 sobre el enlace fosfodiéster en el aceptor 3'-AG.",
          actionType: "transesterification_2",
          explain: "¡Segunda transesterificación completada! El 3'-OH del Exón 1 ataca el sitio 3'-AG, uniendo de forma covalente y directa el Exón 1 al Exón 2 y liberando el intrón en lazo. Todo el proceso es catalizado por el espliceosoma sin participación de ninguna ligasa independiente."
        }
      ],
      polyAWorkflow: {
        signal: "AAUAAA",
        signalExplain: "CPSF (Factor de Especificidad de Escisión y Poliadenilación) reconoce la secuencia hexamérica conservada AAUAAA en la región 3' UTR.",
        cleavageExplain: "Una endonucleasa escinde el transcrito entre 10 y 30 nucleótidos downstream de la señal AAUAAA, dejando un extremo 3'-OH libre.",
        pulsesRequired: 4,
        tailTargetLength: "~200-250 Adeninas",
        papExplain: "La Poli-A Polimerasa (PAP) sintetiza la cola poli-A de forma template-independent utilizando ATP como sustrato energético y de monómeros."
      },
      clinicalDilemma: {
        caseText: "En un escenario didáctico de estudio molecular, un transcrito presenta una alteración en el sitio aceptor 3' del intrón (cambio de 5'-AG-3' a 5'-GG-3'). ¿Qué consecuencia molecular describe con mayor rigor este fenómeno?",
        options: [
          { id: "opt_retention", text: "Una alteración del sitio aceptor puede provocar distintos patrones de splicing aberrante (como retención intrónica, omisión de exón o utilización de sitios alternativos), dependiendo del contexto de la secuencia; en este escenario didáctico específico se observa retención del intrón.", correct: true, feedback: "¡Correcto! Una alteración del sitio aceptor 3'-AG impide la segunda transesterificación normal y puede originar diversos patrones de procesamiento anómalo (retención del intrón, salto de exón o uso de sitios alternativos/crípticos). La repercusión exacta sobre el marco de lectura depende de las secuencias y del procesamiento resultante; en nuestro escenario didáctico específico se identifica la retención del intrón no escindido." },
          { id: "opt_capping_fail", text: "Se bloquea la adición de la 7-metilguanosina (Cap 5') en el extremo inicial del transcrito.", correct: false, feedback: "Incorrecto. El capping ocurre cotranscripcionalmente en 5' mucho antes del splicing y de forma totalmente independiente del sitio aceptor 3'." },
          { id: "opt_polya_fail", text: "La ARN Polimerasa II detiene inmediatamente la transcripción en el promotor.", correct: false, feedback: "Incorrecto. La polimerasa II ya transcribió este segmento; la mutación altera el procesamiento postranscripcional en el ARN, no la iniciación en el promotor." },
          { id: "opt_no_effect", text: "No produce ningún efecto debido a la redundancia del código genético.", correct: false, feedback: "Error crítico. El código genético se aplica a la traducción en ribosomas; el splicing depende de señales moleculares de ARN rigurosamente conservadas." }
        ]
      }
    },
    hints: [
      "Los intrones son secuencias escindidas que no se conservan en el ARNm maduro. Los exones permanecen en el ARNm procesado, aunque este incluye tanto la región codificante (CDS) como las regiones no traducidas 5' UTR y 3' UTR.",
      "El espliceosoma cataliza dos reacciones de transesterificación consecutivas: primero ataca el 2'-OH de la Adenina de ramificación y luego el 3'-OH libre del exón 1 une los exones sin ligasa.",
      "El extremo 5' recibe 7-metilguanosina (m7G) y el extremo 3' recibe ~200 adeninas tras la escisión downstream de la señal AAUAAA."
    ]
  },
  {
    id: 3,
    title: "Traducción — Fabrica la Proteína",
    shortTitle: "Traducción Ribosomal",
    subtitle: "Decodificación por el Ribosoma y Síntesis Peptídica",
    statusBadge: "Fase 03 · Citoplasma / Ribosoma",
    description: "Interpreta los codones del ARNm con el ribosoma citosólico, coordina el acoplamiento de los ARNt con sus aminoácidos en orientación antiparalela y reconoce la señal de terminación.",
    maxScore: 100,
    scientificBrief: {
      location: "Citoplasma / Subunidades ribosomales 40S y 60S (80S eucariota)",
      machinery: "Ribosoma + Complejos ARNt-aminoacil sintetasa + Factores eIF y eRF1",
      mechanism: "El complejo ribosomal inicia en el codón AUG (Metionina), cataliza la formación de enlaces peptídicos en el sitio peptidil (P) y aceptor (A) mediante peptidiltransferasa (ARNr 28S), finalizando al topar con un codón Stop (UGA) reconocido por eRF1."
    },
    locked: false,
    challenge: {
      mrnaSequence: [
        { codon: "AUG", role: "Inicio", aminoAcid: "Metionina", aaShort: "Met", anticodon35: "3'-UAC-5'", isStop: false },
        { codon: "CCU", role: "Elongación 1", aminoAcid: "Prolina", aaShort: "Pro", anticodon35: "3'-GGA-5'", isStop: false },
        { codon: "GAA", role: "Elongación 2", aminoAcid: "Ácido Glutámico", aaShort: "Glu", anticodon35: "3'-CUU-5'", isStop: false },
        { codon: "UGA", role: "Terminación", aminoAcid: "Ninguno (eRF1)", aaShort: "STOP", anticodon35: "Sin anticodón", isStop: true }
      ],
      availableTrnas: [
        { id: "trna_met", anticodonDisplay: "3'-UAC-5'", targetCodon: "AUG", aminoAcid: "Metionina (Met)", color: "#06b6d4" },
        { id: "trna_pro", anticodonDisplay: "3'-GGA-5'", targetCodon: "CCU", aminoAcid: "Prolina (Pro)", color: "#10b981" },
        { id: "trna_glu", anticodonDisplay: "3'-CUU-5'", targetCodon: "GAA", aminoAcid: "Ácido Glutámico (Glu)", color: "#8b5cf6" },
        { id: "trna_decoy1", anticodonDisplay: "3'-AUG-5'", targetCodon: "NONE", aminoAcid: "Tirosina (Tyr)", color: "#f59e0b" },
        { id: "trna_decoy2", anticodonDisplay: "3'-AGG-5'", targetCodon: "NONE", aminoAcid: "Arginina (Arg)", color: "#ec4899" },
        { id: "trna_decoy3", anticodonDisplay: "3'-CAA-5'", targetCodon: "NONE", aminoAcid: "Valina (Val)", color: "#3b82f6" }
      ],
      terminationFactor: {
        id: "erf1",
        name: "eRF1 (Factor de Liberación Eucariota 1)",
        nature: "Proteína mimética molecular de ARNt",
        mechanism: "Reconoce codones de parada (UGA, UAA, UAG) en el sitio A y cataliza la hidrólisis del enlace éster del peptidil-ARNt para liberar la proteína."
      }
    },
    hints: [
      "El apareamiento codón-anticodón es estrictamente antiparalelo: frente a un codón 5'→3', el anticodón del ARNt se orienta 3'→5' (ej. 5'-AUG-3' se aparea con 3'-UAC-5').",
      "Frente al codón de parada 5'-UGA-3', no existe ningún ARNt con aminoácido: debes reclutar el factor proteico de liberación eRF1."
    ]
  },
  {
    id: 4,
    title: "Modificación y Tráfico — Ruta Celular",
    shortTitle: "Tráfico y Vía Secretora",
    subtitle: "Reticulo Endoplásmico, Golgi y Clasificación Vesicular",
    statusBadge: "Fase 04 · Sistema de Endomembranas",
    description: "Caso de laboratorio independiente: orienta una proteína modelo de la vía secretora dotada de péptido señal N-terminal a través del sistema de endomembranas: translocación al RER por Sec61, supervisión de calidad con chaperonas BiP y bifurcación hacia vesículas COP II (Golgi) o degradación en la vía ERAD.",
    maxScore: 100,
    scientificBrief: {
      location: "RER → Aparato de Golgi (cis, medial, trans) → Vesículas de secreción",
      machinery: "Partícula SRP + Translocón Sec61 + Chaperonas BiP/Calnexina + COP II / COP I / Proteasoma 26S",
      mechanism: "Este nivel introduce un caso experimental independiente para una proteína de secreción (distinta del oligopéptido didáctico de los niveles 1-3). Las proteínas secretoras poseen una secuencia señal N-terminal hidrófoba reconocida por SRP. En el lumen del RER son supervisadas por chaperonas como BiP; si están correctamente plegadas avanzan en vesículas COP II hacia el cis-Golgi, mientras que proteínas con defectos irreversibles son derivadas a la vía ERAD para retrotranslocación y degradación en el proteasoma 26S."
    },
    locked: false,
    challenge: {
      proteinModel: {
        name: "Enzima Hidrolasa / Proteína de Vía Secretora",
        signalPeptide: "Met-Arg-Leu-Leu-Val-Leu-Leu-Ala-Val-Phe",
        nature: "Secuencia hidrofóbica N-terminal de ~15-30 residuos"
      },
      stages: [
        {
          stageId: 1,
          title: "Reconocimiento del Péptido Señal",
          scenario: "El ribosoma traduce en el citosol los primeros aminoácidos de la proteína. Emerge una secuencia N-terminal hidrófoba (péptido señal).",
          question: "¿Qué complejo citosólico reconoce específicamente esta señal y arresta temporalmente la traducción?",
          options: [
            { id: "srp", name: "Partícula de Reconocimiento de Señal (SRP)", correct: true, explain: "¡Exacto! La SRP (ribonucleoproteína 7SL ARN + 6 polipéptidos) se une al péptido señal hidrófobo, frena la elongación y dirige el ribosoma hacia la membrana del RER." },
            { id: "proteasome", name: "Proteasoma 26S", correct: false, explain: "Incorrecto. El proteasoma es la maquinaria de degradación proteica en el citosol; no participa en el reconocimiento inicial de señales de secreción." },
            { id: "clathrin", name: "Cubierta de Clatrina", correct: false, explain: "Incorrecto. La clatrina interviene en endocitosis y transporte vesicular desde el trans-Golgi, no en la síntesis ribosomal inicial." },
            { id: "snrnp", name: "Ribonucleoproteína snRNP U1", correct: false, explain: "Incorrecto. Las snRNP operan en el núcleo celular durante el corte y empalme del pre-ARNm." }
          ]
        },
        {
          stageId: 2,
          title: "Translocación Cotraduccional en el RER",
          scenario: "El complejo Ribosoma-SRP se ancla a la superficie citoplasmática del Retículo Endoplásmico Rugoso (RER).",
          question: "¿A través de qué canal transmembrana se inserta la cadena naciente hacia el lumen del RER?",
          options: [
            { id: "sec61", name: "Complejo Translocón Sec61", correct: true, explain: "¡Correcto! El translocón Sec61 forma un poro acuoso por el que la cadena en crecimiento ingresa al lumen mientras la peptidasa de señal escinde el péptido señal." },
            { id: "aquaporin", name: "Canal de Acuaporina", correct: false, explain: "Incorrecto. Las acuaporinas transportan agua a través de la membrana plasmática." },
            { id: "nuclear_pore", name: "Poro Nuclear (NPC)", correct: false, explain: "Incorrecto. El poro nuclear comunica el nucleoplasma con el citosol en la envoltura nuclear." },
            { id: "tim23", name: "Translocasa TIM23", correct: false, explain: "Incorrecto. TIM23 introduce proteínas en la matriz mitocondrial, no en el RER." }
          ]
        },
        {
          stageId: 3,
          title: "Control de Calidad y Chaperonas Luminales",
          scenario: "Dentro del lumen del RER, la cadena peptídica comienza su plegamiento tridimensional y su N-glicosilación.",
          question: "¿Qué chaperona residente del lumen del RER supervisa el plegamiento e interactúa con regiones hidrófobas expuestas?",
          options: [
            { id: "bip", name: "Chaperona BiP (Binding Protein / GRP78)", correct: true, explain: "¡Excelente! BiP (miembro de la familia Hsp70) se une transitoriamente a segmentos hidrófobos, previene agregados y supervisa la correcta conformación estructural." },
            { id: "actin", name: "Microfilamentos de Actina", correct: false, explain: "Incorrecto. La actina forma parte de la arquitectura del citoesqueleto citosólico." },
            { id: "caspase", name: "Caspasa efectora 3", correct: false, explain: "Incorrecto. Las caspasas son proteasas citosólicas que ejecutan la apoptosis." },
            { id: "ubiquitin_e3", name: "E3 Ubiquitina Ligasa soluble", correct: false, explain: "Incorrecto. Las ubiquitina ligasas son enzimas citoplasmáticas; no actúan en el interior luminal del RER." }
          ]
        },
        {
          stageId: 4,
          title: "Bifurcación Celular: Vía Secretora vs Vía ERAD",
          scenario: "El sistema de control de calidad evalúa el estado conformacional final de la proteína:",
          branches: [
            {
              type: "normal",
              label: "Proteína de conformación nativa correcta",
              question: "¿Qué tipo de vesícula transporta la proteína correctamente plegada de forma anterógrada hacia el cis-Golgi?",
              options: [
                { id: "cop2", name: "Vesículas con cubierta COP II", correct: true, explain: "¡Exacto! El coatómero COP II media el tráfico vesicular anterógrado desde los sitios de salida del RER (ERES) hacia el complejo de Golgi." },
                { id: "cop1", name: "Vesículas con cubierta COP I", correct: false, explain: "Incorrecto. COP I se encarga del transporte retrógrado (de Golgi de vuelta al RER o dentro de las cisternas del Golgi)." },
                { id: "lysosome", name: "Fagolisosoma directo", correct: false, explain: "Incorrecto. No hay paso directo de vesículas recién plegadas del RER a fagolisosomas." }
              ]
            },
            {
              type: "misfolded",
              label: "Proteína con mal plegamiento irreversible (mutante)",
              question: "Si la proteína presenta un defecto estructural insalvable, ¿qué mecanismo de control celular debe activarse?",
              options: [
                { id: "erad", name: "Vía ERAD (Retrotranslocación al citosol + Ubiquitinación + Proteasoma 26S)", correct: true, explain: "¡Diagnóstico biológico perfecto! La vía ERAD (Degradación Asociada al Retículo) retrotransloca la proteína al citoplasma, donde es marcada con cadenas de poliubiquitina y destruida en el proteasoma 26S para evitar toxicidad celular." },
                { id: "secretion", name: "Exocitosis inmediata al espacio extracelular", correct: false, explain: "Peligro celular severo. Exportar proteínas mal plegadas genera proteotoxicidad y pérdida tisular." },
                { id: "nucleus", name: "Importación nuclear directa al nucleolo", correct: false, explain: "Imposible. Las proteínas de la vía secretora no poseen señales de localización nuclear (NLS)." }
              ]
            }
          ]
        }
      ]
    },
    hints: [
      "El péptido señal N-terminal es captado por la partícula SRP en el citosol y translocado al lumen del RER a través del poro Sec61.",
      "Las proteínas correctamente plegadas viajan en vesículas COP II al Golgi; las proteínas irremediablemente mal plegadas van a la vía ERAD para ser degradadas en el proteasoma 26S."
    ]
  },
  {
    id: 5,
    title: "Diagnóstico Molecular — Resuelve el Caso",
    shortTitle: "Caso Clínico Genético",
    subtitle: "Identificación de Mutaciones y Fisiopatología",
    statusBadge: "Fase 05 · Diagnóstico Clínico",
    description: "Compara la secuencia de ADN del paciente frente a la referencia de control, identifica la alteración nucleotídica, decodifica el codón resultante en el ARNm y determina las posibles consecuencias moleculares y celulares.",
    maxScore: 100,
    scientificBrief: {
      location: "Laboratorio de Genética Médica y Diagnóstico Molecular",
      machinery: "Secuenciación de ADN + Análisis Bioinformático de Marcos de Lectura",
      mechanism: "Identificación de variantes nucleotídicas en la hebra codificante de ADN y análisis de cómo un codón de terminación prematuro puede afectar la síntesis proteica, cuyas repercusiones moleculares (truncamiento o degradación por NMD) dependerán del contexto biológico y la arquitectura del transcrito."
    },
    locked: false,
    challenge: {
      caseId: "CASO EXPERIMENTAL 042-B (DIDÁCTICO)",
      patientProfile: "Caso de estudio didáctico: Análisis molecular del gen sintético POLM-1 para identificación de variantes y consecuencias moleculares. Secuencia analítica ficticia con fines formativos.",
      geneSymbol: "POLM-1 (Gen Enzimático Sintético)",
      wtDnaCoding:   ["A", "T", "G", "G", "A", "A", "C", "C", "T", "T", "A", "A"],
      patDnaCoding:  ["A", "T", "G", "T", "A", "A", "C", "C", "T", "T", "A", "A"],
      mutationIndex: 3, // Base 4 (0-index 3): G -> T transversión
      wtCodons: [
        { num: 1, dna: "ATG", mrna: "AUG", aa: "Metionina (Met)" },
        { num: 2, dna: "GAA", mrna: "GAA", aa: "Ácido Glutámico (Glu)" },
        { num: 3, dna: "CCT", mrna: "CCU", aa: "Prolina (Pro)" },
        { num: 4, dna: "TAA", mrna: "UAA", aa: "Codón de terminación (Stop)" }
      ],
      patCodons: [
        { num: 1, dna: "ATG", mrna: "AUG", aa: "Metionina (Met)" },
        { num: 2, dna: "TAA", mrna: "UAA", aa: "STOP (Terminación Prematura)" },
        { num: 3, dna: "CCT", mrna: "CCU", aa: "No traducido" },
        { num: 4, dna: "TAA", mrna: "UAA", aa: "No traducido" }
      ],
      clinicalQuestions: [
        {
          id: "q_class",
          question: "1. ¿Cómo se clasifica a nivel molecular la mutación puntual identificada en el codón 2 (GAA → TAA en ADN codificante; GAA → UAA en ARNm)?",
          options: [
            { id: "nonsense", text: "Mutación sin sentido (nonsense): sustitución que genera un codón de terminación prematuro (PTC).", correct: true, explain: "¡Correcto! El codón 2 que normalmente codifica Ácido Glutámico (GAA) se convirtió en codón de parada UAA, provocando la terminación anticipada de la cadena." },
            { id: "missense", text: "Mutación de sentido erróneo (missense): sustitución que cambia un aminoácido por otro diferente.", correct: false, explain: "Incorrecto. UAA no codifica ningún aminoácido; es una señal de parada de la traducción." },
            { id: "frameshift", text: "Mutación por desfase del marco de lectura (frameshift): por inserción o deleción de bases.", correct: false, explain: "Incorrecto. No hubo ganancia ni pérdida de nucleótidos; se mantiene la longitud y la pauta de lectura, tratándose de una transversión puntual de un solo nucleótido." },
            { id: "silent", text: "Mutación sinónima o silenciosa: sustitución que no altera el aminoácido resultante.", correct: false, explain: "Incorrecto. El codón original codifica Glutamato y el mutado es una señal de paro." }
          ]
        },
        {
          id: "q_consequence",
          question: "2. Con base en los mecanismos moleculares celulares, ¿cuál es el destino fisiopatológico de este transcrito y de la proteína?",
          options: [
            { id: "truncated_nmd", text: "Se sintetiza un polipéptido truncado de solo 1 residuo (Met); con la secuencia presentada no puede determinarse si ocurrirá NMD.", correct: true, explain: "¡Dictamen pericial riguroso! Se produce truncamiento proteico en Met-1. Con la secuencia aislada de 12 nucleótidos no puede determinarse si ocurrirá degradación por NMD, ya que la vía de vigilancia NMD requiere datos de posición de complejos de unión de exones (EJC) a más de 50-55 nt o la arquitectura completa del ARNm." },
            { id: "normal_function", text: "La proteína retiene su actividad funcional normal porque el primer aminoácido está intacto.", correct: false, explain: "Error. Una sola metionina no puede formar el plegamiento tridimensional ni el centro activo de una enzima compleja." },
            { id: "polymerase_halt", text: "La ARN Polimerasa II no logra transcribir el gen en el núcleo celular.", correct: false, explain: "Incorrecto. La maquinaria de transcripción en el núcleo no se detiene ante codones de parada de traducción; el transcrito se sintetiza completamente." }
          ]
        }
      ]
    },
    hints: [
      "Compara base por base la secuencia de ADN del paciente frente al control para detectar la posición exacta de la discrepancia nucleotídica.",
      "Transcribe el triplete resultante al ARNm respetando las reglas de complementariedad con el ARN (Uracilo en lugar de Timina) para consultar el código genético."
    ]
  }
];
