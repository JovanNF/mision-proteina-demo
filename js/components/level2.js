/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Componente: Nivel 2 — Mesa de Cirugía Molecular de pre-ARNm (100% Interactivo)
 * 
 * Rediseño de Gameplay: Cirujano de ARN
 * - Cadena macromolecular biofísica interactiva y manipulable.
 * - Instrumental quirúrgico catalítico (Capping, snRNPs, Transesterificaciones, CPSF y PAP).
 * - Rigor científico: El primer corte del splicing ocurre como consecuencia directa del
 *   ataque nucleofílico del 2'-OH de la Adenina de ramificación sobre el 5'-GU (sin corte previo independiente).
 * - Unión directa de exones en la 2ª transesterificación (sin ligasa independiente).
 * - Soporte dual: Ratón (clic y arrastre) y Pantallas Táctiles (Toque de instrumento -> Toque en molécula).
 */

class Level2Controller {
  constructor(levelData, onComplete, onExit) {
    this.data = levelData;
    this.challenge = levelData.challenge;
    this.onComplete = onComplete;
    this.onExit = onExit;

    // Fases de la cirugía molecular (1 a 5)
    // 1: Capping 5' (GTP ⟶ enlace 5'-5' + metilación N7)
    // 2: Acoplamiento de snRNPs (U1 en 5'-GU, U2 en 2'-OH A)
    // 3: Transesterificaciones (Lazo por ataque 2'-OH y unión directa de exones sin ligasa)
    // 4: Escisión 3' por CPSF y Poliadenilación pulsátil con PAP (~250 A)
    // 5: Splicing Aberrante (Dilema del sitio aceptor mutado 3'-GG)
    this.currentStage = 1;
    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;

    // Herramienta quirúrgica actualmente seleccionada en la mano del cirujano
    this.activeTool = null; // { id, name, icon }

    // Estados de transformación macromolecular
    this.isCapAttached = false;
    this.u1Docked = false;
    this.u2Docked = false;
    this.lariatFormed = false;  // 1ª Transesterificación
    this.exonsJoined = false;    // 2ª Transesterificación
    this.isCleaved = false;      // Corte CPSF
    this.papPulses = 0;
    this.maxPapPulses = 4;
    this.aberrantSolved = false;

    this.container = null;
    this._keyboardHandler = this._handleKeyboard.bind(this);
    this._isWindowEventsAttached = false;
  }

  mount(stageElement) {
    this.container = stageElement;
    this.render();
    this._attachWindowEvents();
    this._updateHeaderScore();
  }

  unmount() {
    this._detachWindowEvents();
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }

  _attachWindowEvents() {
    if (this._isWindowEventsAttached) return;
    window.addEventListener('keydown', this._keyboardHandler);
    this._isWindowEventsAttached = true;
  }

  _detachWindowEvents() {
    if (!this._isWindowEventsAttached) return;
    window.removeEventListener('keydown', this._keyboardHandler);
    this._isWindowEventsAttached = false;
  }

  _isModalOpen() {
    return window.app && typeof window.app.isModalOpen === 'function' && window.app.isModalOpen();
  }

  _handleKeyboard(e) {
    if (this._isModalOpen()) return;

    const key = e.key;
    if (['1', '2', '3', '4', '5'].includes(key)) {
      const idx = parseInt(key, 10) - 1;
      const toolButtons = this.container ? this.container.querySelectorAll('.surgery-tool-btn') : [];
      if (toolButtons[idx]) {
        toolButtons[idx].click();
      }
    }
  }

  _updateHeaderScore() {
    const gpScore = document.getElementById('gpLevelScore');
    const gpHints = document.getElementById('gpHintsRemaining');
    if (gpScore) gpScore.textContent = this.score;
    if (gpHints) gpHints.textContent = this.hintsRemaining;
  }

  _deductPoints(pts = 10) {
    this.score = Math.max(10, this.score - pts);
    this.mistakesCount++;
    this._updateHeaderScore();
  }

  restart() {
    this.currentStage = 1;
    this.activeTool = null;
    this.isCapAttached = false;
    this.u1Docked = false;
    this.u2Docked = false;
    this.lariatFormed = false;
    this.exonsJoined = false;
    this.isCleaved = false;
    this.papPulses = 0;
    this.aberrantSolved = false;

    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;

    this._updateHeaderScore();
    this.render();

    if (window.audioMgr) window.audioMgr.playClick();
  }

  giveHint() {
    if (this.hintsRemaining <= 0) {
      if (window.app) {
        window.app.showModal(
          "Sin pistas disponibles",
          "<p>Has utilizado todas las pistas quirúrgicas. Observa las marcas consenso de la macromolécula y selecciona la herramienta biofísica adecuada.</p>",
          "Entendido"
        );
      }
      return;
    }

    this.hintsRemaining--;
    this.score = Math.max(10, this.score - 5);
    this._updateHeaderScore();
    if (window.audioMgr) window.audioMgr.playHint();

    let hintText = "";
    if (this.currentStage === 1) {
      hintText = "El extremo 5' naciente presenta tres fosfatos libres (5'-PPP). Equipa la <strong>Maquinaria Capping (GTP ⟶ m7G)</strong> para que la guanililtransferasa incorpore GMP a partir de GTP mediante un enlace 5'–5' trifosfato, seguido de la metilación en N7 para formar m7G.";
    } else if (this.currentStage === 2) {
      hintText = "El ensamblaje del espliceosoma requiere que <strong>snRNP U1</strong> se acople en el sitio donador 5'-GU y que <strong>snRNP U2</strong> reconozca la Adenina del punto de ramificación (2'-OH).";
    } else if (this.currentStage === 3) {
      if (!this.lariatFormed) {
        hintText = "<strong>1ª Transesterificación:</strong> El grupo 2'-OH de la adenina de ramificación ejecuta un ataque nucleofílico directo sobre el enlace fosfodiéster del donador 5'-GU. Esto corta el enlace con el Exón 1 y forma el lazo cerrado covalente simultáneamente.";
      } else {
        hintText = "<strong>2ª Transesterificación:</strong> El 3'-OH libre del Exón 1 ataca el aceptor 3'-AG, uniendo ambos exones directamente sin necesidad de ligasa y liberando el lazo intrónico.";
      }
    } else if (this.currentStage === 4) {
      if (!this.isCleaved) {
        hintText = "El transcrito primario debe ser cortado downstream de la señal consenso <strong>AAUAAA</strong> por la endonucleasa CPSF para exponer un extremo 3'-OH limpio.";
      } else {
        hintText = "Pulsa repetidamente la <strong>Poli-A Polimerasa (PAP)</strong> para sintetizar la cola de poliadenilación hasta alcanzar ~250 Adeninas.";
      }
    } else {
      hintText = "Un sitio aceptor mutado 3'-GG no puede ser reconocido por el espliceosoma. La consecuencia fisiopatológica es la <strong>Retención del Intrón</strong> en el ARNm maduro.";
    }

    if (window.app) {
      window.app.showModal(
        `💡 Protocolo Quirúrgico (${this.hintsRemaining} restantes)`,
        `<p>${hintText}</p>`,
        "Continuar Cirugía"
      );
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="stage-card glass-panel lvl2-surgery-root">
        <!-- Briefing de la Misión Quirúrgica -->
        <div class="stage-briefing">
          <div class="stage-briefing-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M2 12h20"></path>
            </svg>
            MESA QUIRÚRGICA MOLECULAR: MADURACIÓN Y SPLICING DEL ARN
          </div>
          <p class="stage-briefing-text">
            Opera directamente sobre la macromolécula de pre-ARNm: coloca la caperuza protectora <strong>m7G</strong>, ensambla las <strong>snRNPs</strong>, ejecuta las dos <strong>transesterificaciones</strong> catalíticas (formación del lazo y empalme sin ligasa), sintetiza la <strong>cola poli-A</strong> y resuelve el dilema del splicing aberrante.
          </p>
        </div>

        <!-- Indicador de Fases Quirúrgicas -->
        <div class="lvl2-steps-bar" role="tablist">
          <button class="lvl2-step-tab ${this.currentStage === 1 ? 'active' : (this.currentStage > 1 ? 'completed' : '')}" data-stage="1">
            <span class="step-num">1</span> Cap 5' (m7G)
          </button>
          <button class="lvl2-step-tab ${this.currentStage === 2 ? 'active' : (this.currentStage > 2 ? 'completed' : '')}" data-stage="2">
            <span class="step-num">2</span> snRNPs U1/U2
          </button>
          <button class="lvl2-step-tab ${this.currentStage === 3 ? 'active' : (this.currentStage > 3 ? 'completed' : '')}" data-stage="3">
            <span class="step-num">3</span> Transesterificaciones
          </button>
          <button class="lvl2-step-tab ${this.currentStage === 4 ? 'active' : (this.currentStage > 4 ? 'completed' : '')}" data-stage="4">
            <span class="step-num">4</span> Cola Poli-A 3'
          </button>
          <button class="lvl2-step-tab ${this.currentStage === 5 ? 'active' : (this.currentStage > 5 ? 'completed' : '')}" data-stage="5">
            <span class="step-num">5</span> Splicing Aberrante
          </button>
        </div>

        <!-- Mesa de Cirugía de la Macromolécula Viva -->
        <div class="mol-surgery-table glass-panel" id="molSurgeryTable">
          ${this._renderSurgeryMoleculeStage()}
        </div>

        <!-- Rack de Instrumental Quirúrgico Molecular -->
        <div class="surgery-tool-rack glass-panel" id="surgeryToolRack">
          ${this._renderSurgeryToolRack()}
        </div>

        <!-- Feedback Formativo de la Cirugía -->
        <div class="lvl2-feedback-box hidden" id="lvl2Feedback"></div>

        <!-- Acciones Inferiores -->
        <div class="gameplay-footer-actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">
            Errores quirúrgicos: <span style="color: ${this.mistakesCount > 0 ? '#f43f5e' : '#10b981'}; font-weight: 700;">${this.mistakesCount}</span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" id="btnRestartLvl2" title="Reiniciar este nivel">
              🔄 Reiniciar nivel
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindContainerEvents();
  }

  /* ================== RENDER DE LA MACROMOLÉCULA VIVA ================== */
  _renderSurgeryMoleculeStage() {
    const stg = this.currentStage;

    if (stg === 1) {
      // ETAPA 1: CAPPING 5'
      return `
        <div class="surgery-op-header">
          <span class="surgery-badge">OPERACIÓN 1: PROTECCIÓN COTRANSCRIPCIONAL DEL EXTREMO 5'</span>
          <h4 class="surgery-title">Protege el Extremo 5'-PPP Inicial Frente al Ataque Exonucleolítico</h4>
          <p class="surgery-instruction">
            👉 El transcrito naciente presenta tres fosfatos expuestos en 5'. Aplica la maquinaria enzimática de capping: la guanililtransferasa transferirá GMP a partir de GTP mediante un enlace 5'–5' trifosfato y la metiltransferasa modificará la guanina en N7 para blindar la molécula.
          </p>
        </div>

        <div class="macromolecule-viewport">
          <div class="macromolecule-chain">
            <!-- Sitio de Operación 5' -->
            <div class="mol-node-terminal ${this.isCapAttached ? 'node-capped glow-pulse' : 'node-triphosphate pulse-target'}" 
                 id="targetCap5Node" 
                 data-target-op="capping">
              ${this.isCapAttached ? `
                <div class="cap-group-visual">
                  <span class="cap-gem-symbol">💎</span>
                  <div class="cap-text-block">
                    <strong>m<sup>7</sup>G(5')ppp(5')-</strong>
                    <small>GMP de GTP en 5'–5' + Metilación N7</small>
                  </div>
                </div>
              ` : `
                <div class="triphosphate-visual">
                  <span class="terminal-ppp-badge">5'-P~P~P</span>
                  <small>Extremo Libre Vulnerable</small>
                </div>
              `}
            </div>

            <!-- Segmentos del Transcrito Continuo -->
            <div class="mol-strand-segment segment-utr">
              <span class="segment-tag">5' UTR</span>
              <span class="segment-bases">GGAGU</span>
            </div>

            <div class="mol-strand-segment segment-exon1">
              <span class="segment-tag">Exón 1</span>
              <span class="segment-bases">AUG CCU</span>
            </div>

            <div class="mol-strand-segment segment-intron-raw">
              <span class="segment-tag tag-intron">Intrón 1</span>
              <span class="segment-bases">5'-GU ···· A(2'-OH) ···· AG-3'</span>
            </div>

            <div class="mol-strand-segment segment-exon2">
              <span class="segment-tag">Exón 2</span>
              <span class="segment-bases">GAA UGA</span>
            </div>

            <div class="mol-strand-segment segment-utr">
              <span class="segment-tag">3' UTR</span>
              <span class="segment-bases">AAUAAA-3'</span>
            </div>
          </div>
        </div>

        ${this.isCapAttached ? `
          <div class="stage-continue-panel" style="text-align: right; margin-top: 1rem;">
            <button class="btn btn-primary btn-sm glow-effect" id="btnNextToStage2">
              Siguiente: Reconocimiento del Intrón (snRNPs) →
            </button>
          </div>
        ` : ''}
      `;
    }

    if (stg === 2) {
      // ETAPA 2: ACOPLAR snRNPs U1 Y U2
      return `
        <div class="surgery-op-header">
          <span class="surgery-badge">OPERACIÓN 2: ENSAMBLAJE DEL COMPLEJO ESPLICEOSOMAL</span>
          <h4 class="surgery-title">Estructura el Centro Catalítico en las Secuencias Consenso del Intrón</h4>
          <p class="surgery-instruction">
            👉 Identifica las secuencias consenso que definen el inicio y el punto de ramificación del intrón y acopla las ribonucleoproteínas que orientarán la catálisis.
          </p>
        </div>

        <div class="macromolecule-viewport">
          <div class="macromolecule-chain">
            <!-- Extremo 5' protegido con cap -->
            <div class="mol-node-terminal node-capped-mini">
              <span>💎 m<sup>7</sup>G-</span>
            </div>

            <div class="mol-strand-segment segment-exon1">
              <span class="segment-tag">Exón 1</span>
              <span class="segment-bases">AUG CCU</span>
            </div>

            <!-- Intrón con dianas biofísicas de snRNPs -->
            <div class="mol-intron-surgery-zone">
              <div class="intron-surgical-header">
                <span class="intron-title-badge">INTRÓN NO CODIFICANTE EN OPERACIÓN</span>
              </div>

              <div class="intron-active-elements">
                <!-- Diana 5'-GU para U1 -->
                <div class="mol-consensus-target ${this.u1Docked ? 'docked-glow' : 'pulse-target'}" 
                     id="targetDonorGUNode" 
                     data-target-op="dock_u1">
                  ${this.u1Docked ? `
                    <div class="snrnp-assembled chip-u1">
                      <span>🧬 U1 acoplada</span>
                      <strong>5'-GU</strong>
                    </div>
                  ` : `
                    <div class="consensus-open">
                      <span class="donor-tag">5'-GU</span>
                      <small>Sitio Donador</small>
                    </div>
                  `}
                </div>

                <!-- Tronco intermedio de la hebra -->
                <div class="intron-connecting-strand">··· AAGUA ···</div>

                <!-- Diana Adenina 2'-OH para U2 -->
                <div class="mol-consensus-target ${this.u2Docked ? 'docked-glow' : 'pulse-target'}" 
                     id="targetBranchANode" 
                     data-target-op="dock_u2">
                  ${this.u2Docked ? `
                    <div class="snrnp-assembled chip-u2">
                      <span>🧬 U2 acoplada</span>
                      <strong>A (2'-OH)</strong>
                    </div>
                  ` : `
                    <div class="consensus-open">
                      <span class="branch-tag">A (2'-OH)</span>
                      <small>Ramificación</small>
                    </div>
                  `}
                </div>

                <div class="intron-connecting-strand">····</div>

                <!-- Sitio aceptor 3'-AG -->
                <div class="acceptor-static-node">
                  <span class="acceptor-tag">3'-AG</span>
                  <small>Aceptor</small>
                </div>
              </div>
            </div>

            <div class="mol-strand-segment segment-exon2">
              <span class="segment-tag">Exón 2</span>
              <span class="segment-bases">GAA UGA</span>
            </div>
          </div>
        </div>

        ${this.u1Docked && this.u2Docked ? `
          <div class="stage-continue-panel" style="text-align: right; margin-top: 1rem;">
            <button class="btn btn-primary btn-sm glow-effect" id="btnNextToStage3">
              Siguiente: Ejecutar Transesterificaciones del Splicing →
            </button>
          </div>
        ` : ''}
      `;
    }

    if (stg === 3) {
      // ETAPA 3: TRANSESTERIFICACIONES (ATAQUE 2'-OH FORMANDO LAZO Y UNIÓN DE EXONES SIN LIGASA)
      return `
        <div class="surgery-op-header">
          <span class="surgery-badge">OPERACIÓN 3: CATÁLISIS POR TRANSESTERIFICACIÓN CONCERTADA</span>
          <h4 class="surgery-title">
            ${!this.lariatFormed 
              ? '1ª Transesterificación: Ataque Nucleofílico Concertado y Formación del Lazo' 
              : (!this.exonsJoined 
                  ? '2ª Transesterificación: Empalme Exónico Directo sin Ligasa Externa' 
                  : '¡Splicing Concluido! Exones Empalmados y Lazo Intrónico Liberado')}
          </h4>
          <p class="surgery-instruction">
            ${!this.lariatFormed 
              ? '👉 El grupo hidroxilo interno del punto de ramificación debe ejecutar el ataque nucleofílico inicial sobre el fosfato del donador 5\'. Activa la reacción concertada.' 
              : (!this.exonsJoined 
                  ? '👉 El nucleófilo libre generado en el extremo terminal del Exón 1 debe atacar ahora el sitio aceptor para consumar la ligación exónica.' 
                  : '✓ Los exones han quedado unidos covalentemente. El lazo intrónico ha sido liberado para su desramificación y reciclaje.')}
          </p>
        </div>

        <div class="macromolecule-viewport">
          ${!this.exonsJoined ? `
            <div class="transesterification-workspace">
              <!-- Exón 1 -->
              <div class="exon1-block ${this.lariatFormed ? 'exon1-reactive-state' : ''}" 
                   id="nodeExon1Surgery" 
                   data-target-op="ligation_step">
                <span class="segment-tag">Exón 1</span>
                <span class="segment-bases">AUG CCU</span>
                <div class="exon1-terminal-status">
                  ${this.lariatFormed ? `
                    <span class="reactive-oh-beacon pulse-target">⚡ 3'-OH Libre Reactivo</span>
                  ` : `
                    <span class="bonded-label">Enlazado al intrón</span>
                  `}
                </div>
              </div>

              <!-- Zona del Lazo Intrónico -->
              <div class="lariat-catalytic-zone">
                ${!this.lariatFormed ? `
                  <div class="nucleophilic-attack-stage">
                    <div class="donor-phospho-target" id="nodeDonorTarget" data-target-op="first_transesterification">
                      <span class="target-title">🎯 Sitio 5'-GU</span>
                      <small>Fosfato diana del ataque</small>
                    </div>

                    <div class="nucleophilic-reaction-arrow">
                      <svg viewBox="0 0 100 40" width="100" height="40" class="attack-vector-svg">
                        <path d="M 90 20 Q 50 -10 10 20" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,3"></path>
                        <polygon points="10,20 18,14 16,24" fill="#38bdf8"></polygon>
                      </svg>
                      <span class="vector-label">Ataque Nucleofílico 2'-OH</span>
                    </div>

                    <button class="btn-branch-nucleophile pulse-target" id="btnBranchNucleophile" data-target-op="first_transesterification">
                      🔘 Adenina: Oxígeno 2'-OH Reactivo
                    </button>
                  </div>
                ` : `
                  <div class="lariat-physical-loop-graphic glow-pulse">
                    <svg viewBox="0 0 160 160" width="150" height="150" class="lariat-loop-svg">
                      <circle cx="80" cy="80" r="55" fill="rgba(244, 63, 94, 0.12)" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6,4"></circle>
                      <circle cx="80" cy="25" r="8" fill="#38bdf8"></circle>
                      <text x="80" y="30" font-size="7" font-weight="bold" fill="#fff" text-anchor="middle">2'-5'</text>
                      <text x="80" y="82" font-size="9" font-weight="bold" fill="#fda4af" text-anchor="middle">LAZO INTRÓNICO</text>
                      <text x="80" y="96" font-size="7" fill="#cbd5e1" text-anchor="middle">Enlace 2'-5' Covalente</text>
                    </svg>
                    <div class="lariat-acceptor-tip pulse-target" id="nodeAcceptor3AG" data-target-op="second_transesterification">
                      <span>Sitio Aceptor 3'-AG</span>
                      <small>Diana para el 3'-OH del Exón 1</small>
                    </div>
                  </div>
                `}
              </div>

              <!-- Exón 2 -->
              <div class="exon2-block" id="nodeExon2Surgery">
                <span class="segment-tag">Exón 2</span>
                <span class="segment-bases">GAA UGA</span>
                <span class="exon2-terminal-status">5'-Fosfato receptor</span>
              </div>
            </div>
          ` : `
            <!-- Macromolécula con Exones Unidos Covalentemente -->
            <div class="exons-covalently-joined glass-panel glow-pulse">
              <div class="joined-header-banner">
                ✓ SPLICING CONCLUIDO CON ÉXITO: EXONES UNIDOS MEDIANTE ENLACE FOSFODIÉSTER DIRECTO
              </div>
              <div class="spliced-chain-visual">
                <div class="spliced-exon-node exon1-color">
                  <span class="spliced-tag">Exón 1</span>
                  <strong>AUG CCU</strong>
                </div>
                <div class="covalent-transesterified-bond">
                  <span class="bond-spark">⚡</span>
                  <strong>Enlace Covalente 3'-5'</strong>
                  <small>Catálisis Spliceosomal (Sin Ligasa)</small>
                </div>
                <div class="spliced-exon-node exon2-color">
                  <span class="spliced-tag">Exón 2</span>
                  <strong>GAA UGA</strong>
                </div>
              </div>
              <div class="lariat-dissolved-note">
                💨 <em>El intrón en forma de lazo (lariat) ha sido liberado, desramificado por enzimas específicas y degradado en ribonucleótidos libres dentro del núcleo.</em>
              </div>
            </div>
          `}
        </div>

        ${this.exonsJoined ? `
          <div class="stage-continue-panel" style="text-align: right; margin-top: 1rem;">
            <button class="btn btn-primary btn-sm glow-effect" id="btnNextToStage4">
              Siguiente: Escisión 3' y Cola Poli-A →
            </button>
          </div>
        ` : ''}
      `;
    }

    if (stg === 4) {
      // ETAPA 4: POLIADENILACIÓN 3' (CPSF + PAP PULSÁTIL)
      const tailLengths = [0, 60, 130, 200, 250];
      const curLen = tailLengths[this.papPulses] || 0;

      return `
        <div class="surgery-op-header">
          <span class="surgery-badge">OPERACIÓN 4: PROCESAMIENTO Y POLIADENILACIÓN DEL EXTREMO 3'</span>
          <h4 class="surgery-title">
            ${!this.isCleaved 
              ? 'Maduración 3\': Escisión Endonucleolítica Dependiente de Señal Consenso' 
              : 'Síntesis de la Cola Poli-A Mediante Polimerización sin Molde'}
          </h4>
          <p class="surgery-instruction">
            ${!this.isCleaved 
              ? '👉 El extremo 3\' naciente contiene secuencias excedentes no traducidas. Ejecuta la escisión endonucleolítica downstream de la señal consenso para generar el extremo sustrato de la polimerasa.' 
              : '👉 Polimeriza secuencialmente las unidades de Adenina sobre el 3\'-OH libre hasta alcanzar la longitud fisiológica celular de protección.'}
          </p>
        </div>

        <div class="macromolecule-viewport">
          <div class="macromolecule-chain">
            <!-- Exones unidos -->
            <div class="mol-strand-segment segment-exon-joined">
              <span class="segment-tag">Exones 1 + 2</span>
              <span class="segment-bases">AUG CCU GAA UGA</span>
            </div>

            <!-- Señal de Poliadenilación AAUAAA -->
            <div class="mol-strand-segment segment-utr">
              <span class="segment-tag">Señal Consenso</span>
              <span class="segment-bases">5'-AAUAAA-3'</span>
            </div>

            <!-- Sitio de Corte CPSF -->
            <div class="mol-cleavage-locus ${this.isCleaved ? 'locus-cleaved' : 'pulse-target'}" 
                 id="targetCleavage3Node" 
                 data-target-op="cpsf_cut">
              ${this.isCleaved ? `
                <div class="cleaved-status-badge">
                  <span>✂️ Extremo 3'-OH Libre</span>
                  <small>Escindido 20 nt downstream</small>
                </div>
              ` : `
                <div class="cleavage-target-hint">
                  <span>🎯 Locus de Corte CPSF</span>
                  <small>Toca con Endonucleasa</small>
                </div>
              `}
            </div>

            <!-- Cola Poli-A Creciente -->
            <div class="mol-polya-tail-zone">
              ${this.isCleaved ? `
                <div class="polya-beads-tail ${this.papPulses > 0 ? 'tail-active glow-pulse' : ''}">
                  ${this.papPulses > 0 
                    ? `-(A)<sub>${curLen}</sub>-OH-3'` 
                    : '<span style="color: var(--text-muted); font-size: 0.75rem;">Esperando PAP...</span>'}
                </div>
              ` : ''}
            </div>
          </div>

          ${this.isCleaved ? `
            <div class="pap-injector-console glass-panel">
              <div class="pap-console-header">
                <span>POLIADENILACIÓN POR PAP: LONGITUD FISIOLÓGICA</span>
                <strong style="color: #f59e0b; font-family: var(--font-mono); font-size: 1.05rem;">
                  ${curLen} / 250 Adeninas
                </strong>
              </div>

              <div class="pap-meter-bar">
                <div class="pap-meter-fill" style="width: ${(this.papPulses / this.maxPapPulses) * 100}%;"></div>
              </div>

              ${this.papPulses < this.maxPapPulses ? `
                <div style="margin-top: 1rem; text-align: center;">
                  <button class="btn btn-warning btn-large glow-effect" id="btnPulsePAPDirect" data-target-op="pap_pump">
                    ⚡ Pulso de Poli-A Polimerasa (PAP) [+ATP ⟶ +(A)<sub>n</sub>]
                  </button>
                </div>
              ` : `
                <div class="success-callout" style="margin-top: 1rem; text-align: center;">
                  ✓ ¡Cola Poli-A de <strong>~250 Adeninas</strong> sintetizada! El extremo 3' está protegido contra la degradación exonucleolítica y habilitado para la exportación nuclear.
                </div>
              `}
            </div>
          ` : ''}
        </div>

        ${this.isCleaved && this.papPulses >= this.maxPapPulses ? `
          <div class="stage-continue-panel" style="text-align: right; margin-top: 1rem;">
            <button class="btn btn-primary btn-sm glow-effect" id="btnNextToStage5">
              Siguiente: Resolver Dilema de Splicing Aberrante →
            </button>
          </div>
        ` : ''}
      `;
    }

    if (stg === 5) {
      // ETAPA 5: SPLICING ABERRANTE (DILEMA MOLECULAR 3'-GG)
      return `
        <div class="surgery-op-header">
          <span class="surgery-badge">OPERACIÓN 5: EVALUACIÓN DE SPLICING ABERRANTE</span>
          <h4 class="surgery-title">Diagnostica la Falla en el Sitio Aceptor Mutado (3'-GG)</h4>
          <p class="surgery-instruction">
            👉 Este pre-ARNm presenta una alteración en el dinucleótido aceptor invariante: <strong>3'-GG</strong> en lugar de <strong>3'-AG</strong>. Evalúa el comportamiento del centro activo del espliceosoma y determina la consecuencia observada en este caso didáctico.
          </p>
        </div>

        <div class="macromolecule-viewport">
          <div class="mutant-strand-inspection">
            <div class="mutant-banner-tag">TRANSCRITO PATOLÓGICO: MUTACIÓN EN SITIO ACEPTOR 3'</div>
            <div class="macromolecule-chain" style="justify-content: center;">
              <div class="mol-strand-segment segment-exon1">
                <span class="segment-tag">Exón 1</span>
                <span class="segment-bases">AUG CCU</span>
              </div>

              <div class="mol-strand-segment segment-intron-mutant">
                <span class="segment-tag tag-mutant">Intrón Mutado</span>
                <span class="segment-bases">5'-GU ···· A(2'-OH) ···· <span class="mutation-highlight">GG-3'</span></span>
              </div>

              <div class="mol-strand-segment segment-exon2">
                <span class="segment-tag">Exón 2</span>
                <span class="segment-bases">GAA UGA</span>
              </div>
            </div>
          </div>

          <div class="aberrant-dilemma-console glass-panel">
            <div class="dilemma-prompt">
              En este caso didáctico específico, ¿cuál es la consecuencia molecular al perderse el aceptor invariante 3'-AG?
            </div>

            <div class="aberrant-options-grid">
              <button class="aberrant-verdict-btn ${this.aberrantSolved ? 'selected-correct' : ''}" 
                      id="btnVerdictIntronRetention" 
                      data-verdict="retention">
                <div class="verdict-icon">⚠️</div>
                <div class="verdict-text">
                  <strong>Retención del Intrón</strong>
                  <small>${this.aberrantSolved 
                    ? 'Resultado en este caso didáctico: al impedirse la segunda transesterificación en este transcrito, el intrón no se separa y permanece insertado en el transcrito (en otros contextos biológicos también pueden activarse sitios crípticos o causar salto de exón).' 
                    : 'El intrón permanece integrado en el transcrito al impedirse la segunda transesterificación.'}
                  </small>
                </div>
              </button>

              <button class="aberrant-verdict-btn" 
                      id="btnVerdictNormalSplicing" 
                      data-verdict="normal">
                <div class="verdict-icon">❓</div>
                <div class="verdict-text">
                  <strong>Splicing Normal Inalterado</strong>
                  <small>El espliceosoma ignora la mutación puntual y procesa el ARNm con normalidad.</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        ${this.aberrantSolved ? `
          <div class="stage-continue-panel" style="text-align: center; margin-top: 1.5rem;">
            <button class="btn btn-primary btn-large glow-effect" id="btnFinishLevel2Surgery">
              🏆 Concluir Cirugía Molecular y Guardar Progreso (${this.score} pts)
            </button>
          </div>
        ` : ''}
      `;
    }

    return '';
  }

  /* ================== RENDER DEL RACK DE HERRAMIENTAS QUIRÚRGICAS ================== */
  _renderSurgeryToolRack() {
    const stg = this.currentStage;

    let tools = [];
    if (stg === 1) {
      tools = [
        { id: 'tool_capping', name: 'Maquinaria Capping (GTP ⟶ m7G)', icon: '💎', desc: 'Guanililtransferasa (incorpora GMP a partir de GTP en enlace 5\'-5\') + Metiltransferasa (N7)', correct: true },
        { id: 'tool_ligase', name: 'Ligasa Convencional', icon: '🩹', desc: 'Cataliza la unión de enlaces fosfodiéster en ADN bicatenario', correct: false },
        { id: 'tool_exonuclease', name: 'Exonucleasa 5\'-3\'', icon: '🗑️', desc: 'Degrada polinucleótidos procesando desde el extremo 5\'', correct: false }
      ];
    } else if (stg === 2) {
      tools = [
        { id: 'tool_snrnp_u1', name: 'snRNP U1', icon: '🧬', desc: 'Reconoce por complementariedad el sitio donador 5\'-GU', correct: true },
        { id: 'tool_snrnp_u2', name: 'snRNP U2', icon: '🧬', desc: 'Reconoce la Adenina del punto de ramificación (2\'-OH)', correct: true },
        { id: 'tool_polymerase', name: 'ARN Polimerasa II', icon: '⚙️', desc: 'Enzima de síntesis transcripcional del ARN', correct: false }
      ];
    } else if (stg === 3) {
      if (!this.lariatFormed) {
        tools = [
          { id: 'tool_transester_1', name: 'Ataque 2\'-OH (1ª Transesterificación)', icon: '⚡', desc: 'Ataque nucleofílico del 2\'-OH A sobre 5\'-GU: corta y forma el lazo', correct: true },
          { id: 'tool_scalpel_free', name: 'Bisturí de Corte Independiente', icon: '🔪', desc: 'Escisión mecánica libre e independiente del extremo 5\'', correct: false },
          { id: 'tool_dnase', name: 'Endonucleasa de Restricción', icon: '🚫', desc: 'Endonucleasa bacteriana específica para corte en ADN dúplex', correct: false }
        ];
      } else {
        tools = [
          { id: 'tool_transester_2', name: 'Empalme Exónico (2ª Transesterificación)', icon: '🔗', desc: 'Ataque del 3\'-OH del Exón 1 sobre el aceptor 3\'-AG (sin ligasa)', correct: true },
          { id: 'tool_external_ligase', name: 'Ligasa Externa Libre', icon: '🚫', desc: 'Enzima citoplasmática convencional para unión de fragmentos', correct: false }
        ];
      }
    } else if (stg === 4) {
      tools = [
        { id: 'tool_cpsf_cutter', name: 'Endonucleasa CPSF', icon: '✂️', desc: 'Escinde el transcrito 15-30 nt downstream de AAUAAA', correct: true },
        { id: 'tool_pap_polymerase', name: 'Poli-A Polimerasa (PAP)', icon: '⚡', desc: 'Sintetiza la cola de Adeninas sin molde a partir de ATP', correct: true }
      ];
    } else if (stg === 5) {
      tools = [
        { id: 'tool_genetic_analyzer', name: 'Analizador de Spliceosoma', icon: '🔬', desc: 'Determina el impacto de mutaciones consenso en el splicing', correct: true }
      ];
    }

    return `
      <div class="tool-rack-container">
        <div class="tool-rack-header">
          <span class="tool-rack-title">🧰 RACK DE INSTRUMENTAL QUIRÚRGICO (OPERACIÓN ${stg} DE 5)</span>
          <span class="tool-rack-hint">
            ${this.activeTool ? `Herramienta activa: <strong style="color: #38bdf8;">${this.activeTool.name}</strong>` : 'Toca una herramienta para equiparla y usarla sobre la molécula:'}
          </span>
        </div>

        <div class="surgery-tools-grid">
          ${tools.map(tool => `
            <button class="surgery-tool-btn ${this.activeTool && this.activeTool.id === tool.id ? 'tool-equipped glow-pulse' : ''}" 
                    data-tool-id="${tool.id}" 
                    data-tool-name="${tool.name}">
              <span class="tool-icon">${tool.icon}</span>
              <div class="tool-details">
                <strong>${tool.name}</strong>
                <small>${tool.desc}</small>
              </div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* ================== EVALUACIÓN DE ACCIONES QUIRÚRGICAS ================== */
  _handleExecuteSurgeryAction(actionType) {
    if (actionType === 'capping') {
      if (this.activeTool && this.activeTool.id === 'tool_capping') {
        this.isCapAttached = true;
        if (window.audioMgr) window.audioMgr.playAssemble();
        this._showFeedbackSuccess(
          "✓ Caperuza 5' Sintetizada y Metilada (m7G)",
          "Mecanismo en dos fases completado: 1) La guanililtransferasa empleó GTP como sustrato e incorporó GMP al extremo 5'-difosfato mediante un enlace fosfodiéster invertido 5'–5' trifosfato [G(5')ppp(5')]. 2) Posteriormente, la ARN (guanina-N7)-metiltransferasa añadió el grupo metilo para constituir la caperuza madura m7G, protegiendo el ARNm de exonucleasas 5'→3' y preparando el reclutamiento ribosomal por eIF4E."
        );
        this.render();
      } else {
        this._handleSurgeryMistake(
          "Instrumento Inadecuado para Capping (-10 pts)",
          "Para proteger el extremo 5'-PPP naciente debes equipar la Maquinaria Capping (GTP ⟶ m7G) del instrumental inferior."
        );
      }
    } else if (actionType === 'dock_u1') {
      if (this.activeTool && this.activeTool.id === 'tool_snrnp_u1') {
        this.u1Docked = true;
        if (window.audioMgr) window.audioMgr.playCorrect();
        this._showFeedbackSuccess(
          "✓ snRNP U1 Acoplada al Sitio Donador",
          "El ARN de U1 reconoció por apareamiento de bases la secuencia consenso 5'-GU del inicio del intrón."
        );
        this.render();
      } else {
        this._handleSurgeryMistake(
          "Sonda Molecular Errónea (-10 pts)",
          "El sitio donador 5'-GU es reconocido específicamente por el complejo ribonucleoproteico snRNP U1."
        );
      }
    } else if (actionType === 'dock_u2') {
      if (this.activeTool && this.activeTool.id === 'tool_snrnp_u2') {
        this.u2Docked = true;
        if (window.audioMgr) window.audioMgr.playCorrect();
        this._showFeedbackSuccess(
          "✓ snRNP U2 Acoplada al Punto de Ramificación",
          "snRNP U2 reconoció el sitio consenso de ramificación, proyectando el grupo 2'-OH de la Adenina para la catálisis."
        );
        this.render();
      } else {
        this._handleSurgeryMistake(
          "Sonda Molecular Errónea (-10 pts)",
          "La Adenina de ramificación (Branchpoint) debe ser reconocida y estabilizada por snRNP U2."
        );
      }
    } else if (actionType === 'first_transesterification') {
      // 1ª Transesterificación: ataque 2'-OH sobre 5'-GU formando el lazo
      this.lariatFormed = true;
      if (window.audioMgr) window.audioMgr.playAssemble();
      this._showFeedbackSuccess(
        "✓ 1ª Transesterificación Concertada Completada",
        "El grupo 2'-OH de la Adenina interna atacó el enlace fosfodiéster en el sitio donador 5'-GU. Este ataque nucleofílico escindió simultáneamente la unión con el Exón 1 y formó el enlace covalente 2'-5' del LAZO (Lariat), dejando el 3'-OH del Exón 1 listo para la siguiente fase."
      );
      this.render();
    } else if (actionType === 'second_transesterification') {
      // 2ª Transesterificación: empalme de exones sin ligasa
      this.exonsJoined = true;
      if (window.audioMgr) window.audioMgr.playSuccess();
      this._showFeedbackSuccess(
        "✓ 2ª Transesterificación: Exones Empalmados sin Ligasa Externa",
        "El 3'-OH libre del Exón 1 atacó el sitio aceptor 3'-AG. La reacción catalizada por el centro activo del espliceosoma unió ambos exones en un enlace 3'-5' fosfodiéster continuo y liberó el lazo intrónico para su posterior desramificación y reciclaje."
      );
      this.render();
    } else if (actionType === 'cpsf_cut') {
      if (this.activeTool && this.activeTool.id === 'tool_cpsf_cutter') {
        this.isCleaved = true;
        if (window.audioMgr) window.audioMgr.playCorrect();
        this._showFeedbackSuccess(
          "✓ Escisión Endonucleolítica 3' Ejecutada",
          "El complejo proteico CPSF reconoció la señal 5'-AAUAAA-3' y escindió el transcrito 20 nucleótidos downstream, generando el extremo 3'-OH libre requerido por la Poli-A Polimerasa."
        );
        this.render();
      } else {
        this._handleSurgeryMistake(
          "Instrumento Inadecuado para Escisión (-10 pts)",
          "Equipa la Endonucleasa CPSF para realizar la incisión downstream de la señal AAUAAA."
        );
      }
    } else if (actionType === 'pap_pump') {
      if (!this.isCleaved) {
        this._handleSurgeryMistake(
          "Extremo 3' No Escindido (-10 pts)",
          "La Poli-A Polimerasa (PAP) requiere un extremo 3'-OH libre preformado por la endonucleasa CPSF."
        );
        return;
      }
      if (this.papPulses < this.maxPapPulses) {
        this.papPulses++;
        if (window.audioMgr) window.audioMgr.playCorrect();
        if (this.papPulses >= this.maxPapPulses) {
          if (window.audioMgr) window.audioMgr.playSuccess();
          this._showFeedbackSuccess(
            "✓ Cola Poli-A Fisiológica (~250 A) Completada",
            "La Poli-A Polimerasa sintetizó la cola homopolimérica de Adeninas sin molde a expensas de ATP. El ARN mensajero ahora tiene estabilidad conformacional para su exportación al citosol."
          );
        }
        this.render();
      }
    }
  }

  _handleSurgeryMistake(title, text) {
    if (window.audioMgr) window.audioMgr.playMistake();
    this._deductPoints(10);
    this._showFeedbackError(`✕ ${title}`, text);
  }

  _showFeedbackSuccess(title, text) {
    const feedbackBox = this.container.querySelector('#lvl2Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl2-feedback-box success-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showFeedbackError(title, text) {
    const feedbackBox = this.container.querySelector('#lvl2Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl2-feedback-box error-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showLevelVictoryModal() {
    this.isCompleted = true;
    if (window.audioMgr) window.audioMgr.playSuccess();

    const summaryHtml = `
      <div style="text-align: center; margin-bottom: 0.85rem;">
        <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">🧬</div>
        <h4 style="font-size: 1.18rem; color: var(--accent-cyan); margin: 0 0 0.2rem;">¡CIRUGÍA MOLECULAR COMPLETADA CON ÉXITO!</h4>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
          El pre-ARNm ha sido procesado mediante transesterificaciones rigurosas en un ARNm maduro funcional.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-glass); border-radius: 8px; padding: 0.75rem 0.95rem; margin-bottom: 0.85rem; font-size: 0.82rem; line-height: 1.45;">
        <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.35rem; text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.05em;">
          Mecanismos Bioquímicos Demostrados:
        </div>
        <ul style="margin: 0; padding-left: 1.15rem; color: #cbd5e1;">
          <li><strong>Capping 5':</strong> Incorporación de GMP a partir de GTP por la guanililtransferasa (enlace 5'–5' trifosfato) y metilación en N7 por la metiltransferasa para formar m7G.</li>
          <li><strong>snRNPs Catalíticas:</strong> U1 en 5'-GU y U2 en el punto de ramificación (2'-OH Adenina).</li>
          <li><strong>1ª Transesterificación:</strong> Ataque nucleofílico concertado 2'-OH A ⟶ 5'-GU (forma el lazo y expone el 3'-OH).</li>
          <li><strong>2ª Transesterificación:</strong> Ligación directa del 3'-OH del Exón 1 con el Exón 2 sin ligasa independiente.</li>
          <li><strong>Poliadenilación 3':</strong> Escisión por CPSF downstream de AAUAAA y adición de ~250 Adeninas por PAP.</li>
          <li><strong>Splicing Aberrante:</strong> Retención del intrón observada en este caso por pérdida del aceptor invariante.</li>
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 0.65rem 0.95rem; font-family: var(--font-mono); font-size: 0.9rem;">
        <span>Puntuación Quirúrgica:</span>
        <span style="color: var(--accent-cyan); font-weight: 800; font-size: 1.15rem;">${this.score} / 100 pts</span>
      </div>
    `;

    if (window.app) {
      window.app.showModal(
        "Fase 02 — Maduración del pre-ARNm",
        summaryHtml,
        "Continuar al Panel de Misiones",
        () => {
          if (typeof this.onComplete === 'function') {
            this.onComplete(2, this.score);
          }
        }
      );
    }
  }

  _bindContainerEvents() {
    if (!this.container) return;

    // Tabs de navegación de etapas
    const stepTabs = this.container.querySelectorAll('.lvl2-step-tab');
    stepTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetStg = parseInt(tab.dataset.stage, 10);
        if (targetStg <= this.currentStage) {
          if (window.audioMgr) window.audioMgr.playClick();
          this.currentStage = targetStg;
          this.render();
        }
      });
    });

    // Reiniciar nivel
    const btnRestart = this.container.querySelector('#btnRestartLvl2');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.restart());
    }

    // Botones de avance de etapa
    const btnNext2 = this.container.querySelector('#btnNextToStage2');
    if (btnNext2) {
      btnNext2.addEventListener('click', () => {
        if (window.audioMgr) window.audioMgr.playClick();
        this.currentStage = 2;
        this.activeTool = null;
        this.render();
      });
    }

    const btnNext3 = this.container.querySelector('#btnNextToStage3');
    if (btnNext3) {
      btnNext3.addEventListener('click', () => {
        if (window.audioMgr) window.audioMgr.playClick();
        this.currentStage = 3;
        this.activeTool = null;
        this.render();
      });
    }

    const btnNext4 = this.container.querySelector('#btnNextToStage4');
    if (btnNext4) {
      btnNext4.addEventListener('click', () => {
        if (window.audioMgr) window.audioMgr.playClick();
        this.currentStage = 4;
        this.activeTool = null;
        this.render();
      });
    }

    const btnNext5 = this.container.querySelector('#btnNextToStage5');
    if (btnNext5) {
      btnNext5.addEventListener('click', () => {
        if (window.audioMgr) window.audioMgr.playClick();
        this.currentStage = 5;
        this.activeTool = null;
        this.render();
      });
    }

    // Botón Concluir Nivel 2
    const btnFinish = this.container.querySelector('#btnFinishLevel2Surgery');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        this._showLevelVictoryModal();
      });
    }

    // ================= SELECCIÓN DE HERRAMIENTAS QUIRÚRGICAS =================
    const toolButtons = this.container.querySelectorAll('.surgery-tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const toolId = btn.dataset.toolId;
        const toolName = btn.dataset.toolName;
        this.activeTool = { id: toolId, name: toolName };
        if (window.audioMgr) window.audioMgr.playClick();

        toolButtons.forEach(b => b.classList.remove('tool-equipped'));
        btn.classList.add('tool-equipped');

        // Resaltar dianas moleculares en la macromolécula
        const targets = this.container.querySelectorAll('.pulse-target, .mol-consensus-target, .mol-node-terminal');
        targets.forEach(t => t.classList.add('target-active-pulse'));

        // Si la herramienta es PAP y estamos en fase 4 con el corte ya hecho, permite bombear directo
        if (toolId === 'tool_pap_polymerase' && this.currentStage === 4 && this.isCleaved) {
          this._handleExecuteSurgeryAction('pap_pump');
        }
      });
    });

    // ================= INTERACCIÓN DIRECTA SOBRE LA MACROMOLÉCULA =================
    // 1. Capping 5'
    const targetCapNode = this.container.querySelector('#targetCap5Node');
    if (targetCapNode) {
      targetCapNode.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('capping');
      });
    }

    // 2. snRNPs (U1 en 5'-GU, U2 en A 2'-OH)
    const targetDonorGU = this.container.querySelector('#targetDonorGUNode');
    if (targetDonorGU) {
      targetDonorGU.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('dock_u1');
      });
    }

    const targetBranchA = this.container.querySelector('#targetBranchANode');
    if (targetBranchA) {
      targetBranchA.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('dock_u2');
      });
    }

    // 3. 1ª Transesterificación: Ataque nucleofílico del 2'-OH A sobre 5'-GU
    const btnBranchNucleophile = this.container.querySelector('#btnBranchNucleophile');
    if (btnBranchNucleophile) {
      btnBranchNucleophile.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('first_transesterification');
      });
    }

    const nodeDonorTarget = this.container.querySelector('#nodeDonorTarget');
    if (nodeDonorTarget) {
      nodeDonorTarget.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('first_transesterification');
      });
    }

    // 4. 2ª Transesterificación: Empalme del 3'-OH Exón 1 con el 3'-AG
    const nodeExon1Surgery = this.container.querySelector('#nodeExon1Surgery');
    if (nodeExon1Surgery && this.lariatFormed && !this.exonsJoined) {
      nodeExon1Surgery.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('second_transesterification');
      });
    }

    const nodeAcceptor3AG = this.container.querySelector('#nodeAcceptor3AG');
    if (nodeAcceptor3AG && this.lariatFormed && !this.exonsJoined) {
      nodeAcceptor3AG.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('second_transesterification');
      });
    }

    // 5. Escisión CPSF 3'
    const targetCleavageNode = this.container.querySelector('#targetCleavage3Node');
    if (targetCleavageNode) {
      targetCleavageNode.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('cpsf_cut');
      });
    }

    // 6. Bombeo de PAP
    const btnPulsePAP = this.container.querySelector('#btnPulsePAPDirect');
    if (btnPulsePAP) {
      btnPulsePAP.addEventListener('click', () => {
        this._handleExecuteSurgeryAction('pap_pump');
      });
    }

    // 7. Splicing Aberrante: Selección de veredicto
    const btnIntronRetention = this.container.querySelector('#btnVerdictIntronRetention');
    if (btnIntronRetention) {
      btnIntronRetention.addEventListener('click', () => {
        this.aberrantSolved = true;
        if (window.audioMgr) window.audioMgr.playSuccess();
        this._showFeedbackSuccess(
          "✓ ¡Diagnóstico de Splicing Aberrante Correcto!",
          "Al mutar el sitio aceptor 3'-AG a 3'-GG, se impide el reconocimiento normal por los factores de splicing (como U2AF). Aunque biológicamente una alteración del aceptor puede generar retención intrónica, salto de exón o activación de sitios crípticos (afectando el marco de lectura según el transcrito resultante), en este escenario didáctico específico se observa la retención del intrón no escindido."
        );
        this.render();
      });
    }

    const btnNormalSplicing = this.container.querySelector('#btnVerdictNormalSplicing');
    if (btnNormalSplicing) {
      btnNormalSplicing.addEventListener('click', () => {
        this._handleSurgeryMistake(
          "Diagnóstico Molecular Erróneo (-10 pts)",
          "El dinucleótido 3'-AG es invariante y esencial para la segunda transesterificación. Sin él, el espliceosoma no puede cortar ni empalmar el exón adyacente."
        );
      });
    }
  }
}

// Exportar globalmente
window.Level2Controller = Level2Controller;
