/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Componente: Nivel 3 — Máquina Molecular: El Trinquete Ribosomal 80S (Ratchet Engine)
 * 
 * Rediseño de Gameplay: Maquinista Molecular
 * - Máquina biológica activa con Subunidad Mayor 60S, Subunidad Menor 40S, túnel de salida y sitios E, P, A.
 * - Ciclo de elongación dividido en 3 fases mecánicas tangibles:
 *    1. Carga y Comprobación Antiparalela en Sitio A (Watson-Crick 3'→5' vs 5'→3').
 *    2. Reacción Catalítica: Percutor Peptidil Transferasa (ARNr 28S: formación de enlace peptídico -CO-NH-).
 *    3. Translocación: Palanca de Trinquete eEF2 (desplazamiento de ARNm, eyección de ARNt en E y avance de la cadena).
 * - Terminación biológica rigurosa: eRF1 en codón de parada UGA liberando una cadena polipeptídica corta (Met-Pro-Glu).
 */

class Level3Controller {
  constructor(levelData, onComplete, onExit) {
    this.data = levelData;
    this.challenge = levelData.challenge;
    this.onComplete = onComplete;
    this.onExit = onExit;

    // Estado del ciclo ribosomal
    // Codones: 0: AUG (Met), 1: CCU (Pro), 2: GAA (Glu), 3: UGA (Stop)
    this.currentCodonIdx = 0;

    // Sub-fases del ciclo ribosomal:
    // 'INITIATION': Ensamblaje del complejo 80S: ARNt iniciador Met (tRNAi-Met) se aloja en Sitio P
    // 'DOCKING': Fase de elongación: ARNt entra a Sitio A supervisado por eEF1A
    // 'PEPTIDYL_TRANSFER': ARNt apareado; esperando percutor catalítico peptidil transferasa (ARNr 28S)
    // 'TRANSLOCATION': Enlace formado; esperando tirar de la palanca de trinquete eEF2
    // 'TERMINATION': Codón UGA activo; esperando factor eRF1
    // 'COMPLETED': Cadena peptídica corta liberada
    this.cycleState = 'INITIATION';

    // Cadena naciente de aminoácidos en el túnel de salida
    this.translatedChain = []; // [{ aa: "Met", color: "#06b6d4" }, ...]

    // ARNt actualmente alojado en Sitio A en comprobación
    this.siteATrna = null;

    // ARNt actualmente alojado en Sitio P
    this.sitePTrna = null;

    // ARNt expulsado temporalmente por Sitio E
    this.ejectedTrna = null;

    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;
    this.peptideReleased = false;
    this.peptideReleased = false;

    // Normalizar ARNt para evitar cualquier propiedad indefinida
    if (this.challenge && this.challenge.availableTrnas) {
      this.challenge.availableTrnas.forEach(t => {
        if (!t.anticodonDisplay && t.anticodon35) t.anticodonDisplay = t.anticodon35;
        if (!t.anticodon35 && t.anticodonDisplay) t.anticodon35 = t.anticodonDisplay;
        if (!t.anticodon && t.anticodonDisplay) t.anticodon = t.anticodonDisplay;
        if (!t.status) t.status = t.targetCodon === 'AUG' ? 'ARNt iniciador' : 'Aminoacil-ARNt';
      });
    }

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
    if (this.cycleState === 'INITIATION' || this.cycleState === 'DOCKING') {
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        this._handleLoadTrnaIntoChamber(idx);
      }
    } else if (this.cycleState === 'PEPTIDYL_TRANSFER') {
      if (key === 'Enter' || key === ' ' || key.toLowerCase() === 'p') {
        this._handleExecutePeptidylTransfer();
      }
    } else if (this.cycleState === 'TRANSLOCATION') {
      if (key === 'Enter' || key === ' ' || key.toLowerCase() === 't') {
        this._handlePullRatchetLever();
      }
    } else if (this.cycleState === 'TERMINATION') {
      if (key === 'Enter' || key === ' ' || key.toLowerCase() === 'e') {
        this._handleReleaseFactorTrigger();
      } else if (['1', '2', '3', '4', '5'].includes(key)) {
        this._handleLoadTrnaIntoChamber(parseInt(key, 10) - 1);
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
    this.currentCodonIdx = 0;
    this.cycleState = 'INITIATION';
    this.translatedChain = [];
    this.siteATrna = null;
    this.sitePTrna = null;
    this.ejectedTrna = null;

    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;
    this.peptideReleased = false;

    this._updateHeaderScore();
    this.render();

    if (window.audioMgr) window.audioMgr.playClick();
  }

  giveHint() {
    if (this.hintsRemaining <= 0) {
      if (window.app) {
        window.app.showModal(
          "Sin pistas disponibles",
          "<p>Has utilizado todas las pistas de traducción. Observa las consignas de la máquina ribosomal y selecciona el ARNt correspondiente.</p>",
          "Entendido"
        );
      }
      return;
    }

    this.hintsRemaining--;
    this.score = Math.max(10, this.score - 5);
    this._updateHeaderScore();
    if (window.audioMgr) window.audioMgr.playHint();

    const currCodon = this.challenge.mrnaSequence[this.currentCodonIdx];
    let hintText = "";

    if (this.cycleState === 'INITIATION') {
      hintText = "En la iniciación eucariota, el <strong>ARNt iniciador de metionina (3'-UAC-5')</strong> ingresa directamente al <strong>Sitio P</strong> sobre el codón 5'-AUG-3' mediado por eIF2-GTP para formar el complejo 80S. Selecciona el ARNt de Metionina.";
    } else if (this.cycleState === 'DOCKING') {
      hintText = `El ribosoma expone en el Sitio A el codón <strong>5'-${currCodon.codon}-3'</strong>. Por reglas de complementariedad antiparalela asistida por eEF1A, busca el ARNt que presente el anticodón <strong>${currCodon.anticodon35}</strong> cargado con ${currCodon.aminoAcid}.`;
    } else if (this.cycleState === 'PEPTIDYL_TRANSFER') {
      hintText = "El aminoacil-ARNt está posicionado. Pulsa el <strong>Percutor Peptidil Transferasa</strong> para que el centro catalítico de ARNr 28S transfiera la cadena y forme el enlace peptídico (-CO-NH-).";
    } else if (this.cycleState === 'TRANSLOCATION') {
      hintText = "Acciona la <strong>Palanca de Trinquete eEF2</strong> para que el ribosoma hidrolice GTP y se desplace sobre el ARNm en dirección 5'→3', avanzando exactamente un codón durante la translocación, expulsando el ARNt desacilado por el Sitio E y empujando el polipéptido por el túnel de salida.";
    } else if (this.cycleState === 'TERMINATION') {
      hintText = "El triplete <strong>5'-UGA-3'</strong> es un codón de terminación. No existe ARNt para él: activa el <strong>Factor de Liberación eRF1</strong> para hidrolizar el enlace éster con agua y liberar la cadena polipeptídica corta.";
    }

    if (window.app) {
      window.app.showModal(
        `💡 Pista del Maquinista Ribosomal (${this.hintsRemaining} restantes)`,
        `<p>${hintText}</p>`,
        "Reanudar Operación"
      );
    }
  }

  render() {
    if (!this.container) return;

    const codons = this.challenge.mrnaSequence;
    const currentCodon = codons[this.currentCodonIdx] || codons[codons.length - 1];

    this.container.innerHTML = `
      <div class="stage-card glass-panel lvl3-engine-root">
        <!-- Briefing de la Maquinaria Ribosomal -->
        <div class="stage-briefing">
          <div class="stage-briefing-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            MÁQUINA MOLECULAR: TRINQUETE RIBOSOMAL 80S (CICLO DE ELONGACIÓN)
          </div>
          <p class="stage-briefing-text">
            Opera el motor de traducción celular paso a paso: alimenta el <strong>Sitio A</strong> con el ARNt antiparalelo correcto, acciona el percutor <strong>Peptidil Transferasa</strong> para sintetizar el enlace peptídico y acciona la <strong>Palanca de Trinquete eEF2</strong> para desplazar el ribosoma sobre el ARNm en dirección 5'→3' y expulsar el ARNt desacilado.
          </p>
        </div>

        <!-- Consola de Control y Estado de la Máquina -->
        <div class="ribosomal-engine-dashboard glass-panel">
          <div class="dashboard-status-indicator">
            <div class="phase-indicator-pill ${this._getPhaseClass()}">
              ${this._getPhaseTitle()}
            </div>
            <div class="codon-counter-display">
              Codón activo: <strong>${this.currentCodonIdx + 1}</strong> de ${codons.length}
              <span class="codon-seq-badge">5'-${currentCodon.codon}-3'</span>
            </div>
          </div>

          <!-- Túnel de Salida Superior de la Subunidad 60S -->
          <div class="ribosome-exit-tunnel-bay">
            <div class="tunnel-structural-roof">
              <span class="tunnel-header-tag">TÚNEL DE SALIDA POLIPEPTÍDICO (SUBUNIDAD 60S)</span>
            </div>
            <div class="nascent-chain-track ${this.peptideReleased ? 'chain-track-released' : ''}" id="nascentChainTrack">
              ${this.translatedChain.length === 0 ? `
                <span class="tunnel-idle-text">Esperando inicio de traducción con Metionina...</span>
              ` : `
                <div class="polypeptide-pearl-chain ${this.peptideReleased ? 'chain-released-floating glow-pulse' : ''}">
                  ${this.translatedChain.map((bead, i) => `
                    <div class="pearl-aminoacid glow-pulse" style="background: ${bead.color};">
                      <span class="aa-index">${i + 1}</span>
                      <strong class="aa-code">${bead.aa}</strong>
                    </div>
                    ${i < this.translatedChain.length - 1 ? '<span class="peptide-covalent-link">-CO-NH-</span>' : ''}
                  `).join('')}
                  ${this.peptideReleased ? '<span class="peptide-release-sparkle">✨ Cadena liberada al citosol</span>' : ''}
                </div>
              `}
            </div>
          </div>

          <!-- Chasis del Ribosoma 80S: Cámaras E, P, A -->
          <div class="ribosome-engine-chassis" id="ribosomeChassis">
            <div class="chassis-subunit-60s">
              <span class="chassis-subunit-tag">SUBUNIDAD MAYOR 60S · CENTRO PEPTIDIL TRANSFERASA (ARNr 28S)</span>
            </div>

            <!-- Fila de Cámaras Ribosomales -->
            <div class="chassis-chambers-row">
              <!-- CÁMARA E (Exit / Salida) -->
              <div class="ribosome-chamber chamber-e">
                <div class="chamber-header">
                  <span class="chamber-letter">E</span>
                  <span class="chamber-name">Exit (Salida)</span>
                </div>
                <div class="chamber-interior">
                  ${this.ejectedTrna ? `
                    <div class="trna-ejection-ghost glow-pulse">
                      <span class="ghost-icon">💨</span>
                      <strong>${this.ejectedTrna.anticodonDisplay || this.ejectedTrna.anticodon || "3'-UAC-5'"}</strong>
                      <small>${this.ejectedTrna.status || "ARNt desacilado"}</small>
                    </div>
                  ` : `
                    <span class="chamber-vacant">Vacío (Sin ARNt)</span>
                  `}
                </div>
              </div>

              <!-- CÁMARA P (Peptidyl) -->
              <div class="ribosome-chamber chamber-p ${this.cycleState === 'INITIATION' ? 'chamber-listening' : ''}">
                <div class="chamber-header">
                  <span class="chamber-letter">P</span>
                  <span class="chamber-name">Peptidil</span>
                </div>
                <div class="chamber-interior">
                  ${this.sitePTrna ? `
                    <div class="trna-docked-card ${this.cycleState === 'TRANSLOCATION' ? 'card-deacylated' : 'card-peptidyl'} glow-pulse">
                      <div class="trna-anticodon-stem">${this.sitePTrna.anticodonDisplay || this.sitePTrna.anticodon35 || "3'-UAC-5'"}</div>
                      <div class="trna-payload-badge" ${this.cycleState === 'TRANSLOCATION' ? 'style="border-color: rgba(244, 63, 94, 0.4); color: #f43f5e;"' : ''}>
                        <span>${this.cycleState === 'TRANSLOCATION' ? 'ARNt desacilado' : (this.sitePTrna.status || "Peptidil-ARNt")}</span>
                        ${this.cycleState === 'TRANSLOCATION' 
                          ? '<small style="color: #94a3b8; font-size: 0.65rem;">(Péptido transferido al Sitio A)</small>'
                          : `<strong>${this.translatedChain.length > 0 ? this.translatedChain.map(c => c.aa).join('—') : 'Met'}</strong>`}
                      </div>
                    </div>
                  ` : (this.cycleState === 'INITIATION' ? `
                    <div class="chamber-waiting-target">
                      <span class="waiting-prompt">Iniciación: <strong>5'-AUG-3'</strong></span>
                      <small class="waiting-anticodon-hint">Alojar ARNt iniciador (tRNAi-Met, 3'-UAC-5') directamente en Sitio P</small>
                    </div>
                  ` : `
                    <span class="chamber-vacant">Vacío (Sin ARNt)</span>
                  `)}
                </div>
              </div>

              <!-- CÁMARA A (Aminoacyl / Decodificación) -->
              <div class="ribosome-chamber chamber-a ${this.cycleState === 'DOCKING' ? 'chamber-listening' : ''}">
                <div class="chamber-header">
                  <span class="chamber-letter">A</span>
                  <span class="chamber-name">Aminoacil (Aceptor)</span>
                </div>
                <div class="chamber-interior" id="chamberAInterior">
                  ${this.siteATrna ? `
                    <div class="trna-docked-card ${this.cycleState === 'TRANSLOCATION' ? 'card-peptidyl' : 'card-aminoacyl'} glow-pulse" ${this.cycleState === 'TRANSLOCATION' ? 'style="border-color: #10b981;"' : ''}>
                      <div class="trna-anticodon-stem">${this.siteATrna.anticodonDisplay || this.siteATrna.anticodon35 || ''}</div>
                      <div class="trna-payload-badge" style="border-color: ${this.cycleState === 'TRANSLOCATION' ? '#10b981' : this.siteATrna.color}; color: ${this.cycleState === 'TRANSLOCATION' ? '#10b981' : this.siteATrna.color};">
                        <span style="${this.cycleState === 'TRANSLOCATION' ? 'color: #34d399; font-weight: 700;' : ''}">${this.cycleState === 'TRANSLOCATION' ? 'Peptidil-ARNt' : (this.siteATrna.status || "Aminoacil-ARNt")}</span>
                        ${this.cycleState === 'TRANSLOCATION'
                          ? `<strong style="color: #fff; font-size: 0.92rem;">${this.translatedChain.map(c => c.aa).join('—')}</strong>`
                          : `<strong>${this.siteATrna.aminoAcid}</strong>`}
                      </div>
                    </div>
                  ` : (this.cycleState === 'INITIATION' ? `
                    <div class="chamber-waiting-target">
                      <span class="waiting-prompt" style="color: var(--text-muted); font-size: 0.78rem;">Sitio A en Espera</span>
                      <small class="waiting-anticodon-hint">Se activará con eEF1A tras la iniciación</small>
                    </div>
                  ` : `
                    <div class="chamber-waiting-target">
                      <span class="waiting-prompt">
                        ${this.currentCodonIdx === 3 ? '⚠️ Señal de Parada UGA' : `Aparear: <strong>5'-${currentCodon ? currentCodon.codon : 'UGA'}-3'</strong>`}
                      </span>
                      <small class="waiting-anticodon-hint">
                        ${this.currentCodonIdx === 3 ? 'Reclutar Factor eRF1' : `Anticodón: ${currentCodon && currentCodon.anticodon35 ? currentCodon.anticodon35 : ''}`}
                      </small>
                    </div>
                  `)}
                </div>
              </div>
            </div>

            <!-- Cinta Mecánica de ARNm (Subunidad 40S) -->
            <div class="chassis-mrna-track">
              <span class="mrna-end-cap">💎 m7G-5'—</span>
              <div class="mrna-conveyor-belt" id="mrnaConveyorBelt">
                ${codons.map((c, idx) => `
                  <div class="conveyor-codon-node ${idx === this.currentCodonIdx ? 'codon-under-lens' : (idx < this.currentCodonIdx ? 'codon-translated' : '')}">
                    <span class="codon-triplet">${c.codon}</span>
                    <span class="codon-assigned-aa">${c.aaShort}</span>
                  </div>
                `).join('')}
              </div>
              <span class="mrna-end-polya">—(A)250-3'</span>
            </div>

            <div class="chassis-subunit-40s">
              <span class="chassis-subunit-tag">SUBUNIDAD MENOR 40S · GUÍA DE LECTURA Y CODÓN ACTIVO</span>
            </div>
          </div>

          <!-- Controles de la Máquina Molecular según la Fase Activa -->
          <div class="engine-actuators-console">
            ${this._renderActuatorsConsole()}
          </div>
        </div>

        <!-- Muelle de Carga de ARNt Citosólicos (En Fases INITIATION y DOCKING) -->
        ${(this.cycleState === 'INITIATION' || this.cycleState === 'DOCKING') ? `
          <div class="cytosol-docking-bay glass-panel">
            <div class="bay-header">
              <span class="bay-title">🧬 MUELLE DE ARNt CITOSÓLICOS (COMPROBACIÓN ANTIPARALELA)</span>
              <span class="bay-hint">
                ${this.cycleState === 'INITIATION' 
                  ? 'Inspecciona los ARNt y selecciona el ARNt iniciador de metionina para ensamblar el complejo en el Sitio P:' 
                  : "Examina el anticodón 3'→5' e introduce el ARNt complementario en el Sitio A con eEF1A:"}
              </span>
            </div>

            <div class="trna-dock-grid">
              ${this.challenge.availableTrnas.map((trna, idx) => `
                <button class="trna-feeder-button" data-trna-idx="${idx}">
                  <span class="feeder-key-shortcut">${idx + 1}</span>
                  <div class="feeder-icon" style="color: ${trna.color};">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.7 2.8 1.8 3.6-2.5.5-4.3 2.7-4.3 5.4 0 3 2.5 5.5 5.5 5.5.8 0 1.6-.2 2.3-.5-.2 1.3-.8 2.5-1.8 3.5h2c1.2-1.2 2-2.8 2-4.5 0-.8-.1-1.6-.4-2.3.8.5 1.7.8 2.7.8 3 0 5.5-2.5 5.5-5.5 0-2.7-1.8-4.9-4.3-5.4 1.1-.8 1.8-2.1 1.8-3.6C20.5 4 18.5 2 16 2c-1.5 0-2.8.7-3.6 1.8C11.6 2.7 10.3 2 9 2h3z"/>
                    </svg>
                  </div>
                  <div class="feeder-anticodon">
                    <small>Anticodón</small>
                    <strong>${trna.anticodonDisplay}</strong>
                  </div>
                  <div class="feeder-aminoacid" style="border-color: ${trna.color}; color: ${trna.color};">
                    ${trna.aminoAcid}
                  </div>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Caja de Feedback Bioquímico de la Máquina -->
        <div class="lvl3-feedback-box hidden" id="lvl3Feedback"></div>

        <!-- Acciones Inferiores -->
        <div class="gameplay-footer-actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">
            Errores mecánicos: <span style="color: ${this.mistakesCount > 0 ? '#f43f5e' : '#10b981'}; font-weight: 700;">${this.mistakesCount}</span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" id="btnRestartLvl3" title="Reiniciar este nivel">
              🔄 Reiniciar máquina
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindContainerEvents();
  }

  _getPhaseClass() {
    switch (this.cycleState) {
      case 'INITIATION': return 'phase-initiation glow-pulse';
      case 'DOCKING': return 'phase-docking';
      case 'PEPTIDYL_TRANSFER': return 'phase-peptidyl glow-pulse';
      case 'TRANSLOCATION': return 'phase-translocation glow-pulse';
      case 'TERMINATION': return 'phase-termination glow-pulse';
      case 'COMPLETED': return 'phase-completed';
      default: return '';
    }
  }

  _getPhaseTitle() {
    switch (this.cycleState) {
      case 'INITIATION': return 'FASE 0: ENSAMBLAJE DE INICIACIÓN 80S (SITIO P)';
      case 'DOCKING': return 'PASO 1: CARGA DE ARNt EN SITIO A (eEF1A)';
      case 'PEPTIDYL_TRANSFER': return 'PASO 2: FORMACIÓN DE ENLACE PEPTÍDICO (ARNr 28S)';
      case 'TRANSLOCATION': return 'PASO 3: TRANSLOCACIÓN POR TRINQUETE eEF2';
      case 'TERMINATION': return 'TERMINACIÓN: HIDRÓLISIS POR eRF1';
      case 'COMPLETED': return 'POLIPÉPTIDO CORTO LIBERADO';
      default: return '';
    }
  }

  /* ================== CONSOLA DE ACTUADORES MECÁNICOS ================== */
  _renderActuatorsConsole() {
    if (this.cycleState === 'INITIATION') {
      return `
        <div class="actuator-panel-hint">
          <span class="pulse-indicator">⚙️</span>
          <span>Ensamblaje del Complejo 80S: selecciona el <strong>ARNt iniciador de metionina (3'-UAC-5')</strong> del muelle inferior para alojarlo directamente en el <strong>Sitio P</strong> sobre el codón 5'-AUG-3'.</span>
        </div>
      `;
    }

    if (this.cycleState === 'DOCKING') {
      const currentCodon = this.challenge.mrnaSequence[this.currentCodonIdx];
      return `
        <div class="actuator-panel-hint">
          <span class="pulse-indicator">⚙️</span>
          <span>Fase de elongación (eEF1A): selecciona el ARNt con anticodón antiparalelo 3'→5' para acoplarlo en el <strong>Sitio A</strong> frente al codón 5'-${currentCodon ? currentCodon.codon : ''}-3'.</span>
        </div>
      `;
    }

    if (this.cycleState === 'PEPTIDYL_TRANSFER') {
      return `
        <div class="actuator-action-box glass-panel glow-pulse">
          <div class="actuator-prompt">
            ¡Apareamiento Watson-Crick verificado en el Sitio A! Activa el centro catalítico de la Subunidad 60S:
          </div>
          <button class="btn-actuator-peptidyl glow-effect" id="btnActuatorPeptidyl">
            💥 Disparar Percutor Peptidil Transferasa (ARNr 28S) [-CO-NH-]
          </button>
        </div>
      `;
    }

    if (this.cycleState === 'TRANSLOCATION') {
      return `
        <div class="actuator-action-box glass-panel glow-pulse">
          <div class="actuator-prompt">
            Enlace peptídico sintetizado. Ahora acciona la translocación mecanobiológica de la máquina:
          </div>

          <!-- Palanca Visual de Trinquete Ribosomal eEF2 -->
          <div class="ratchet-lever-assembly" id="ratchetLeverAssembly" role="button" tabindex="0" aria-label="Tirar de la Palanca de Trinquete eEF2">
            <div class="ratchet-lever-housing">
              <svg class="ratchet-lever-svg" viewBox="0 0 220 130" width="220" height="130" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="metalGradLvl3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#334155" />
                    <stop offset="40%" stop-color="#94a3b8" />
                    <stop offset="70%" stop-color="#cbd5e1" />
                    <stop offset="100%" stop-color="#1e293b" />
                  </linearGradient>
                  <radialGradient id="knobGradLvl3" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stop-color="#fda4af" />
                    <stop offset="55%" stop-color="#f43f5e" />
                    <stop offset="100%" stop-color="#881337" />
                  </radialGradient>
                  <radialGradient id="gearHubGrad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#090d16" />
                  </radialGradient>
                </defs>
                <!-- Engranaje base y rueda dentada de trinquete -->
                <circle cx="110" cy="98" r="26" fill="url(#gearHubGrad)" stroke="#06b6d4" stroke-width="2.5" />
                <g stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round">
                  <line x1="110" y1="68" x2="110" y2="76" />
                  <line x1="88" y1="78" x2="94" y2="83" />
                  <line x1="132" y1="78" x2="126" y2="83" />
                  <line x1="82" y1="98" x2="89" y2="98" />
                  <line x1="138" y1="98" x2="131" y2="98" />
                </g>
                <!-- Perno central -->
                <circle cx="110" cy="98" r="9" fill="#0284c7" stroke="#e0f2fe" stroke-width="1.5" />
                <circle cx="110" cy="98" r="3.5" fill="#f8fafc" />

                <!-- Brazo móvil de la palanca (rotación pivote en 110, 98) -->
                <g class="ratchet-arm-group" id="ratchetArmGroup">
                  <!-- Vástago metálico de la palanca -->
                  <rect x="104" y="24" width="12" height="74" rx="6" fill="url(#metalGradLvl3)" stroke="#0ea5e9" stroke-width="1.5" />
                  <!-- Anillo de acoplamiento hidráulico GTP -->
                  <rect x="102" y="52" width="16" height="8" rx="2" fill="#0284c7" stroke="#38bdf8" stroke-width="1" />
                  <circle cx="110" cy="56" r="2.5" fill="#34d399" />
                  <!-- Pomo esférico de accionamiento superior con halo -->
                  <circle cx="110" cy="20" r="16" fill="url(#knobGradLvl3)" stroke="#fda4af" stroke-width="2.5" />
                  <circle cx="106" cy="16" r="4" fill="rgba(255,255,255,0.6)" />
                  <text x="110" y="24" text-anchor="middle" font-size="8.5" font-weight="900" fill="#fff" letter-spacing="0.5">eEF2</text>
                </g>
              </svg>
            </div>
            
            <div class="ratchet-lever-details">
              <div class="lever-badge-glowing">⚙️ PALANCA DE TRINQUETE eEF2-GTP</div>
              <div class="lever-swipe-callout">Acciona la palanca: el ribosoma avanza sobre el ARNm en dirección 5'→3', un codón por ciclo</div>
            </div>
          </div>

          <button class="btn-actuator-ratchet glow-effect" id="btnActuatorRatchet">
            ⚙️ Tirar de la Palanca de Trinquete eEF2 (Avanzar ribosoma en dirección 5'→3')
          </button>
        </div>
      `;
    }

    if (this.cycleState === 'TERMINATION') {
      return `
        <div class="actuator-action-box glass-panel termination-actuator-box glow-pulse">
          <div class="actuator-prompt" style="color: #fda4af;">
            Codón de parada <strong>5'-UGA-3'</strong> alcanzado en el Sitio A. No existe ningún aminoacil-ARNt celular para este triplete.
          </div>
          <button class="btn-actuator-erf1 glow-effect" id="btnActuatorErf1">
            🛑 Acoplar Factor de Liberación eRF1 y Liberar Polipéptido Corto (H₂O)
          </button>
        </div>
      `;
    }

    if (this.cycleState === 'COMPLETED') {
      return `
        <div class="stage-continue-panel" style="text-align: center; margin-top: 1rem;">
          <div class="peptide-release-banner glow-pulse">
            ✨ <strong>Polipéptido corto sintetizado y liberado:</strong> la cadena [Met]—[Pro]—[Glu] se desacopló del túnel ribosomal y flota libremente en el citosol celular.
          </div>
          <button class="btn btn-primary btn-large glow-effect" id="btnFinishLevel3Engine" style="margin-top: 0.85rem;">
            🏆 Concluir Síntesis Ribosomal y Guardar Progreso (${this.score} pts)
          </button>
        </div>
      `;
    }

    return '';
  }

  /* ================== OPERACIONES DEL MOTOR RIBOSOMAL ================== */
  _handleLoadTrnaIntoChamber(trnaIdx) {
    if (this.cycleState === 'TERMINATION') {
      if (window.audioMgr) window.audioMgr.playMistake();
      this._deductPoints(10);
      this._showFeedbackError(
        "✕ Rechazo Biológico: Señal STOP (-10 pts)",
        "El codón 5'-UGA-3' es una señal de parada. La célula carece de aminoacil-ARNt para este triplete; sólo el factor proteico eRF1 puede unirse al Sitio A."
      );
      return;
    }

    const candidate = this.challenge.availableTrnas[trnaIdx];
    if (!candidate) return;

    // FASE 0: INICIACIÓN EUCARIOTA (Met-tRNAi en Sitio P sobre AUG)
    if (this.cycleState === 'INITIATION') {
      if (candidate.targetCodon === 'AUG') {
        if (window.audioMgr) window.audioMgr.playAssemble();
        const startCodon = this.challenge.mrnaSequence[this.currentCodonIdx];
        this.sitePTrna = candidate;
        this.translatedChain.push({ aa: startCodon ? startCodon.aaShort : 'Met', color: candidate.color });
        this.currentCodonIdx = 1; // Avanza a codón 2 (CCU) para elongación en Sitio A
        this.cycleState = 'DOCKING';

        this._showFeedbackSuccess(
          "✓ Complejo de Iniciación 80S Ensamblado (ARNt iniciador en Sitio P)",
          "El ARNt iniciador de metionina (tRNAi-Met, 3'-UAC-5') ingresó directamente al Sitio P asistido por el factor eIF2-GTP sobre el codón 5'-AUG-3'. El Sitio A queda ahora habilitado para recibir al primer aminoacil-ARNt de elongación asistido por eEF1A."
        );
        this.render();
      } else {
        if (window.audioMgr) window.audioMgr.playMistake();
        this._deductPoints(10);
        this._showFeedbackError(
          "✕ Error de Iniciación Ribosomal (-10 pts)",
          `El complejo de iniciación 80S sobre 5'-AUG-3' requiere específicamente el ARNt iniciador de metionina (tRNAi-Met, 3'-UAC-5') en el Sitio P. El ARNt con anticodón ${candidate.anticodonDisplay} fue rechazado.`
        );
      }
      return;
    }

    if (this.cycleState !== 'DOCKING') return;

    const currentCodon = this.challenge.mrnaSequence[this.currentCodonIdx];

    // Verificar si aparea con el codón activo en Sitio A asistido por eEF1A
    if (candidate.targetCodon === currentCodon.codon) {
      if (window.audioMgr) window.audioMgr.playAssemble();
      this.siteATrna = candidate;
      this.cycleState = 'PEPTIDYL_TRANSFER';

      this._showFeedbackSuccess(
        `✓ Apareamiento Antiparalelo Verificado por eEF1A (Codón ${currentCodon.codon} ⟶ Anticodón ${candidate.anticodonDisplay})`,
        `El factor eucariota de elongación eEF1A-GTP verificó la complementariedad sin distorsión estérica. El aminoácido ${candidate.aminoAcid} ha quedado alineado en el Sitio A junto al centro peptidil transferasa.`
      );
      this.render();
    } else {
      if (window.audioMgr) window.audioMgr.playMistake();
      this._deductPoints(10);
      this._showFeedbackError(
        `✕ Rechazo por Corrección de Pruebas eEF1A (-10 pts)`,
        `El anticodón <strong>${candidate.anticodonDisplay}</strong> no aparea de forma complementaria y antiparalela con el codón activo <strong>5'-${currentCodon.codon}-3'</strong>. El factor eucariota eEF1A repelió la molécula estéricamente fuera del ribosoma.`
      );
    }
  }

  // Aliases para pruebas automatizadas y compatibilidad
  _handleTrnaSelection(trnaIdx) {
    this._handleLoadTrnaIntoChamber(trnaIdx);
  }

  _handleErf1Selection() {
    this._handleReleaseFactorTrigger();
  }

  _handleExecutePeptidylTransfer() {
    if (this.cycleState !== 'PEPTIDYL_TRANSFER') return;

    if (window.audioMgr) window.audioMgr.playCorrect();

    const currentCodon = this.challenge.mrnaSequence[this.currentCodonIdx];
    this.translatedChain.push({
      aa: currentCodon.aaShort,
      color: this.siteATrna.color
    });

    // Actualización de estados moleculares:
    // P pasa a desacilado (sin péptido), A pasa a peptidilo (lleva la cadena elongada)
    if (this.sitePTrna) {
      this.sitePTrna.status = "ARNt desacilado";
    }
    if (this.siteATrna) {
      this.siteATrna.status = "Peptidil-ARNt";
    }

    this.cycleState = 'TRANSLOCATION';

    this._showFeedbackSuccess(
      "✓ Reacción Peptidil Transferasa Catalizada",
      "El ARNr 28S de la subunidad 60S catalizó la formación del enlace amida (-CO-NH-). El péptido fue transferido covalentemente al aminoácido del ARNt en el Sitio A (formando el Peptidil-ARNt), dejando un ARNt desacilado (descargado) en el Sitio P."
    );
    this.render();
  }

  _handlePullRatchetLever() {
    if (this.cycleState !== 'TRANSLOCATION') return;

    if (window.audioMgr) window.audioMgr.playSuccess();

    // Efecto visual en la palanca física y en la cinta de ARNm
    const armGroup = this.container ? this.container.querySelector('#ratchetArmGroup') : null;
    if (armGroup) armGroup.classList.add('arm-pulled');

    const belt = this.container ? this.container.querySelector('#mrnaConveyorBelt') : null;
    if (belt) belt.classList.add('mrna-shifting');

    const executeShift = () => {
      // Eyección del ARNt viejo
      this.ejectedTrna = this.sitePTrna || { anticodonDisplay: "3'-UAC-5'", status: "ARNt desacilado" };
      if (!this.ejectedTrna.anticodonDisplay && this.ejectedTrna.anticodon) {
        this.ejectedTrna.anticodonDisplay = this.ejectedTrna.anticodon;
      }
      this.ejectedTrna.status = "ARNt desacilado";

      // El ARNt con el péptido pasa de A a P
      this.sitePTrna = this.siteATrna;
      if (this.sitePTrna) {
        this.sitePTrna.status = "Peptidil-ARNt";
      }
      this.siteATrna = null;

      // Avanzar codón
      this.currentCodonIdx++;

      const nextCodon = this.challenge.mrnaSequence[this.currentCodonIdx];
      if (nextCodon && nextCodon.isStop) {
        this.cycleState = 'TERMINATION';
        this._showFeedbackSuccess(
          "⚙️ Translocación Ribosomal eEF2 Completada: Señal STOP",
          "El ribosoma se desplazó sobre el ARNm en dirección 5'→3' avanzando exactamente un codón (3 nucleótidos) mediante hidrólisis de GTP catalizada por eEF2. El ARNt desacilado fue expulsado por el Sitio E. La ventana del Sitio A expone ahora el codón de parada 5'-UGA-3'."
        );
      } else {
        this.cycleState = 'DOCKING';
        this._showFeedbackSuccess(
          "⚙️ Translocación Ribosomal eEF2 Completada",
          "El ribosoma se desplazó sobre el ARNm en dirección 5'→3' avanzando exactamente un codón mediante hidrólisis de GTP catalizada por eEF2. El ARNt desacilado fue expulsado por el Sitio E y la cadena naciente emergió un eslabón más en el túnel de salida."
        );
      }

      this.render();
    };

    if (typeof setTimeout === 'undefined' || (typeof window !== 'undefined' && window.isTestEnv) || !this.container) {
      executeShift();
    } else {
      setTimeout(executeShift, 250);
    }
  }

  _handleReleaseFactorTrigger() {
    if (this.cycleState !== 'TERMINATION') return;

    if (window.audioMgr) window.audioMgr.playSuccess();

    this.cycleState = 'COMPLETED';
    this.isCompleted = true;
    this.peptideReleased = true;

    this._showFeedbackSuccess(
      "✓ Factor eRF1 Acoplado: Hidrólisis y Liberación de Cadena Corta",
      "El factor proteico eRF1 mimético de ARNt reconoció el triplete 5'-UGA-3' y activó una molécula de agua para hidrolizar el enlace éster final, liberando la cadena polipeptídica corta [Met]-[Pro]-[Glu] al citosol y desacoplando las subunidades 40S y 60S."
    );
    this.render();
  }

  _showFeedbackSuccess(title, text) {
    const feedbackBox = this.container.querySelector('#lvl3Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl3-feedback-box success-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showFeedbackError(title, text) {
    const feedbackBox = this.container.querySelector('#lvl3Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl3-feedback-box error-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showLevelVictoryModal() {
    this.isCompleted = true;
    if (window.audioMgr) window.audioMgr.playSuccess();

    const summaryHtml = `
      <div style="text-align: center; margin-bottom: 0.85rem;">
        <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">⚙️</div>
        <h4 style="font-size: 1.18rem; color: var(--accent-cyan); margin: 0 0 0.2rem;">¡TRADUCCIÓN RIBOSOMAL COMPLETADA!</h4>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
          El motor ribosomal 80S ha sintetizado y liberado con éxito la cadena polipeptídica corta.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-glass); border-radius: 8px; padding: 0.75rem 0.95rem; margin-bottom: 0.85rem; font-size: 0.82rem; line-height: 1.45;">
        <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.35rem; text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.05em;">
          Principios Mecanobiológicos Dominados:
        </div>
        <ul style="margin: 0; padding-left: 1.15rem; color: #cbd5e1;">
          <li><strong>Iniciación Eucariota:</strong> Alojamiento directo del ARNt iniciador (tRNAi-Met) en el Sitio P sobre 5'-AUG-3' mediado por eIF2-GTP.</li>
          <li><strong>Decodificación Antiparalela:</strong> Inspección de codones 5'→3' frente a anticodones 3'→5' y prueba cinética por eEF1A.</li>
          <li><strong>Catálisis Peptidil Transferasa:</strong> Formación del enlace amida (-CO-NH-) mediante la ribozima de ARNr 28S de la subunidad 60S.</li>
          <li><strong>Translocación con Trinquete eEF2:</strong> Desplazamiento del ribosoma sobre el ARNm en dirección 5'→3' avanzando exactamente un codón y expulsión por Sitio E con gasto de GTP.</li>
          <li><strong>Terminación eRF1:</strong> Reconocimiento de UGA sin incorporación de aminoácido e hidrólisis terminal.</li>
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 0.65rem 0.95rem; font-family: var(--font-mono); font-size: 0.9rem;">
        <span>Puntuación del Maquinista:</span>
        <span style="color: var(--accent-cyan); font-weight: 800; font-size: 1.15rem;">${this.score} / 100 pts</span>
      </div>
    `;

    if (window.app) {
      window.app.showModal(
        "Fase 03 — Traducción Ribosomal",
        summaryHtml,
        "Continuar al Panel de Misiones",
        () => {
          if (typeof this.onComplete === 'function') {
            this.onComplete(3, this.score);
          }
        }
      );
    }
  }

  _bindContainerEvents() {
    if (!this.container) return;

    // Botón reiniciar nivel
    const btnRestart = this.container.querySelector('#btnRestartLvl3');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.restart());
    }

    // Botones del muelle de carga de ARNt (Fase DOCKING)
    const feederButtons = this.container.querySelectorAll('.trna-feeder-button');
    feederButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.trnaIdx, 10);
        this._handleLoadTrnaIntoChamber(idx);
      });
    });

    // Botón percutor Peptidil Transferasa (Fase PEPTIDYL_TRANSFER)
    const btnPeptidyl = this.container.querySelector('#btnActuatorPeptidyl');
    if (btnPeptidyl) {
      btnPeptidyl.addEventListener('click', () => {
        this._handleExecutePeptidylTransfer();
      });
    }

    // Botón palanca de trinquete eEF2 (Fase TRANSLOCATION)
    const btnRatchet = this.container.querySelector('#btnActuatorRatchet');
    if (btnRatchet) {
      btnRatchet.addEventListener('click', () => {
        this._handlePullRatchetLever();
      });
    }

    // Palanca táctil / click / swipe (Fase TRANSLOCATION)
    const leverAssembly = this.container.querySelector('#ratchetLeverAssembly');
    if (leverAssembly) {
      let startX = 0;
      leverAssembly.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
      });
      leverAssembly.addEventListener('pointerup', (e) => {
        const diff = e.clientX - startX;
        // Permite clic simple o arrastre hacia la derecha
        if (diff > 15 || Math.abs(diff) < 6) {
          this._handlePullRatchetLever();
        }
      });
      leverAssembly.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._handlePullRatchetLever();
        }
      });
    }

    // Botón factor de liberación eRF1 (Fase TERMINATION)
    const btnErf1 = this.container.querySelector('#btnActuatorErf1');
    if (btnErf1) {
      btnErf1.addEventListener('click', () => {
        this._handleReleaseFactorTrigger();
      });
    }

    // Botón Concluir Misión Level 3
    const btnFinish = this.container.querySelector('#btnFinishLevel3Engine');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        this._showLevelVictoryModal();
      });
    }
  }
}

// Exportar globalmente
window.Level3Controller = Level3Controller;
