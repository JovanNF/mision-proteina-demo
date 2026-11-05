/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Componente: Nivel 5 — Detective Genético: Diagnóstico Molecular y Caso Clínico 042-B
 * 100% Interactivo: Comparador Genómico Visual, Ensamblador de Codón ARNm en Ranuras (U-A-A),
 * y Mesa de Dictamen Médico con Fichas Diagnósticas Coleccionables (Nonsense, Truncamiento y NMD).
 */

class Level5Controller {
  constructor(levelData, onComplete, onExit) {
    this.data = levelData;
    this.challenge = levelData.challenge;
    this.onComplete = onComplete;
    this.onExit = onExit;

    // Fases del Detective Genético (1 a 3)
    // 1: Comparador Genómico (Clic en nucleótido alterado)
    // 2: Ensamblaje de Codón ARNm (Ranuras 5'-[U][A][A]-3')
    // 3: Mesa de Dictamen Molecular (Fichas en Expediente Médico)
    this.currentPhase = 1;
    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;

    // Estado Fase 1: Alineamiento
    this.detectedMutationIdx = null;

    // Estado Fase 2: Ensamblaje de Codón ARNm (3 ranuras)
    this.assembledMrnaSlots = [null, null, null]; // esperados: 'U', 'A', 'A'

    // Estado Fase 3: Expediente de Dictamen (4 casillas)
    this.slottedTokens = {
      mutation_type: null,    // esperado: 'nonsense'
      codon_impact: null,     // esperado: 'premature_stop'
      protein_fate: null,     // esperado: 'truncation_met1'
      cellular_pathway: null  // esperado: 'nmd_decay'
    };

    // Ficha sostenida por toque
    this.heldToken = null;

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

    if (this.currentPhase === 2) {
      const k = e.key.toUpperCase();
      if (['A', 'U', 'C', 'G', 'T'].includes(k)) {
        this._handleSlotRnaBase(k);
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
    this.currentPhase = 1;
    this.detectedMutationIdx = null;
    this.assembledMrnaSlots = [null, null, null];
    this.slottedTokens = {
      mutation_type: null,
      codon_impact: null,
      protein_fate: null,
      cellular_pathway: null
    };
    this.heldToken = null;
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
          "<p>Has utilizado todas las pistas diagnósticas. Examina el comparador genómico y las características moleculares del caso clínico.</p>",
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
    if (this.currentPhase === 1) {
      hintText = "Compara las bases de ambas secuencias posición por posición (1 a 12). Observa atentamente el segundo codón (posiciones 4, 5 y 6).";
    } else if (this.currentPhase === 2) {
      hintText = "Recuerda que la ARN polimerasa II incorpora ribonucleótidos complementarios a la hebra molde; la secuencia del transcrito de ARNm reproduce la hebra codificante sustituyendo Timina (T) por Uracilo (U).";
    } else {
      hintText = "El triplete UAA es un codón de parada precoz (mutación sin sentido), lo que trunca el péptido tras el residuo 1. Considera con rigor si una secuencia de 12 nt aporta información sobre complejos EJC o si la vía NMD es indeterminable con estos datos.";
    }

    if (window.app) {
      window.app.showModal(
        `💡 Pista Diagnóstica (${this.hintsRemaining} restantes)`,
        `<p>${hintText}</p>`,
        "Continuar"
      );
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="stage-card glass-panel lvl5-detective-root">
        <!-- Banner de Advertencia de Caso Didáctico Ficticio -->
        <div class="fictional-case-disclaimer">
          <span class="disclaimer-badge">⚠️ ESTUDIO DIDÁCTICO FICTICIO</span>
          <span>Caso docente sobre el gen sintético <code class="bio-code">POLM-1</code> (Muestra 042-B). Modelo pedagógico para el análisis del dogma central y correlación molecular, sin correspondencia con pacientes reales ni patologías clínicas humanas.</span>
        </div>

        <!-- Expediente del Caso de Investigación Molecular -->
        <div class="stage-briefing clinical-dossier">
          <div class="stage-briefing-title">
            <span class="dossier-stamp">CASO INVESTIGACIÓN 042-B</span>
            UNIDAD DE GENÓMICA MOLECULAR Y DOGMA CENTRAL
          </div>
          <p class="stage-briefing-text">
            <strong>Secuencia objeto de estudio:</strong> Gen didáctico <code class="bio-code">POLM-1</code>.
            <br>
            <strong>Metodología de Peritaje:</strong>
            (Fase A) Comparación genómica directa entre la hebra de referencia (WT) y la muestra del paciente 042-B para identificar la alteración primaria en el ADN.
            (Fase B) Decodificación del triplete transcrito y análisis del marco de lectura mediante el visor del código genético.
            (Fase C) Deducción causal del impacto molecular: clasificación de la mutación, consecuencia en la síntesis proteica y análisis riguroso de los límites diagnósticos del decaimiento NMD.
          </p>
        </div>

        <!-- Indicador de Fases Diagnósticas -->
        <div class="lvl5-phases-bar" role="tablist">
          <button class="lvl5-phase-tab ${this.currentPhase === 1 ? 'active' : (this.currentPhase > 1 ? 'completed' : '')}" data-phase="1">
            <span class="step-num">1</span> Escáner Genético
          </button>
          <button class="lvl5-phase-tab ${this.currentPhase === 2 ? 'active' : (this.currentPhase > 2 ? 'completed' : '')}" data-phase="2">
            <span class="step-num">2</span> Decodificador Molecular
          </button>
          <button class="lvl5-phase-tab ${this.currentPhase === 3 ? 'active' : (this.currentPhase > 3 ? 'completed' : '')}" data-phase="3">
            <span class="step-num">3</span> Tablero de Investigación (Pinboard)
          </button>
        </div>

        <!-- Escenario Dinámico de la Fase Activa -->
        <div class="lvl5-detective-stage" id="lvl5DetectiveStage">
          ${this._renderDetectiveStage()}
        </div>

        <!-- Bandeja de Herramientas / Fichas según Fase -->
        <div class="lvl5-tools-section" id="lvl5ToolsSection">
          ${this._renderDetectiveToolsTray()}
        </div>

        <!-- Feedback Formativo -->
        <div class="lvl5-feedback-box hidden" id="lvl5Feedback"></div>

        <!-- Acciones Inferiores -->
        <div class="gameplay-footer-actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">
            Errores cometidos: <span style="color: ${this.mistakesCount > 0 ? '#f43f5e' : '#10b981'}; font-weight: 700;">${this.mistakesCount}</span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" id="btnRestartLvl5" title="Reiniciar este nivel">
              🔄 Reiniciar nivel
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindContainerEvents();
  }

  /* ================== RENDER DE LAS ETAPAS DEL DETECTIVE ================== */
  _renderDetectiveStage() {
    const ph = this.currentPhase;

    if (ph === 1) {
      // FASE 1: ESCÁNER GENÉTICO COMPARATIVO
      const wt = this.challenge.wtDnaCoding;
      const pat = this.challenge.patDnaCoding;
      const isDetected = this.detectedMutationIdx !== null;

      return `
        <div class="detective-header">
          <span class="lvl2-tag">FASE A: COMPARACIÓN GENÓMICA (5' → 3')</span>
          <h4 class="workbench-title">Localiza la Alteración en la Secuencia de ADN</h4>
          <p class="workbench-goal">
            👉 Examina y compara nucleótido a nucleótido la secuencia control WT con la muestra del paciente 042-B. <strong>Haz clic sobre la base que difiere</strong> en la hebra del paciente.
          </p>
        </div>

        <div class="genomic-alignment-box">
          <!-- Hebra Control WT -->
          <div class="alignment-row control-row">
            <div class="seq-row-label">
              <span class="badge-seq-wt">CONTROL WT</span>
              <span class="polarity-tag">5'</span>
            </div>
            <div class="bases-track">
              ${wt.map((b, i) => `
                <div class="base-cell ${isDetected && i === 3 ? 'wt-mutation-spot' : ''}">
                  <span class="base-pos">${i + 1}</span>
                  <span class="base-letter base-${b}">${b}</span>
                </div>
              `).join('')}
            </div>
            <span class="polarity-tag">3'</span>
          </div>

          <!-- Divisor de Comparación -->
          <div class="alignment-divider">
            ${wt.map((b, i) => `
              <span class="divider-indicator ${isDetected && i === 3 ? 'divider-mismatch' : ''}">
                ${isDetected && i === 3 ? '≠' : '|'}
              </span>
            `).join('')}
          </div>

          <!-- Hebra Paciente 042-B -->
          <div class="alignment-row patient-row">
            <div class="seq-row-label">
              <span class="badge-seq-pat">MUESTRA 042-B</span>
              <span class="polarity-tag">5'</span>
            </div>
            <div class="bases-track" id="patientBasesTrack">
              ${pat.map((b, i) => `
                <button class="base-cell base-interactive ${this.detectedMutationIdx === i ? 'selected-mutation glow-pulse' : ''}" data-idx="${i}">
                  <span class="base-pos">${i + 1}</span>
                  <span class="base-letter base-${b}">${b}</span>
                </button>
              `).join('')}
            </div>
            <span class="polarity-tag">3'</span>
          </div>
        </div>

        ${isDetected ? `
          <div class="evidence-registered-card glow-pulse">
            <div class="ev-card-tag">📌 EVIDENCIA A REGISTRADA: ALTERACIÓN EN SECUENCIA ADN</div>
            <div class="ev-card-body">
              <div class="ev-card-highlight">Transversión puntual: <strong>c.4G>T</strong> (Purina ➔ Pirimidina)</div>
              <p>En el codón 2 del exón 1, la base 4 de la hebra codificante es Timina (T) en vez de Guanina (G), transformando el triplete <strong>5'-GAA-3'</strong> en <strong>5'-TAA-3'</strong>.</p>
            </div>
          </div>

          <div class="stage-continue-panel" style="text-align: right; margin-top: 1rem;">
            <button class="btn btn-primary btn-sm glow-effect" id="btnNextToPhase2">
              Siguiente: Decodificar Triplete en ARNm →
            </button>
          </div>
        ` : ''}
      `;
    }

    if (ph === 2) {
      // FASE 2: DECODIFICADOR MOLECULAR Y MARCO DE LECTURA
      const slots = this.assembledMrnaSlots;
      const isComplete = slots.every(s => s !== null);

      return `
        <div class="detective-header">
          <span class="lvl2-tag">FASE B: DECODIFICADOR MOLECULAR Y MARCO DE LECTURA</span>
          <h4 class="workbench-title">Ensambla el Triplete de ARNm y Consulta el Visor Genético</h4>
          <p class="workbench-goal">
            El codón 2 en la hebra codificante mutó a <code class="bio-code">5'-TAA-3'</code>.
            👉 Coloca las bases de ARN en las 3 ranuras y examina su decodificación en el visor del código genético.
          </p>
        </div>

        <div class="mrna-slots-assembly-bay glass-panel">
          <div class="source-dna-codon-box">
            <span>Codón 2 en ADN codificante:</span>
            <strong>5'-TAA-3'</strong>
          </div>
          <div class="transcription-arrow-label">⟶ Transcripción a pre-ARNm ⟶</div>

          <!-- Ranuras interactivas de ARNm -->
          <div class="mrna-codon-slots-row">
            <span class="mrna-tag-end">5'-</span>

            <!-- Ranura 1 (esperado: U) -->
            <div class="mrna-slot-box mol-drop-target ${slots[0] ? 'slot-filled glow-pulse' : 'socket-pulse'}" id="slotMrna0" data-slot="0" data-accept="U">
              ${slots[0] ? `<span class="slot-base base-${slots[0]}">${slots[0]}</span>` : '<span class="slot-hint">[1ª Base]</span>'}
            </div>

            <!-- Ranura 2 (esperado: A) -->
            <div class="mrna-slot-box mol-drop-target ${slots[1] ? 'slot-filled glow-pulse' : 'socket-pulse'}" id="slotMrna1" data-slot="1" data-accept="A">
              ${slots[1] ? `<span class="slot-base base-${slots[1]}">${slots[1]}</span>` : '<span class="slot-hint">[2ª Base]</span>'}
            </div>

            <!-- Ranura 3 (esperado: A) -->
            <div class="mrna-slot-box mol-drop-target ${slots[2] ? 'slot-filled glow-pulse' : 'socket-pulse'}" id="slotMrna2" data-slot="2" data-accept="A">
              ${slots[2] ? `<span class="slot-base base-${slots[2]}">${slots[2]}</span>` : '<span class="slot-hint">[3ª Base]</span>'}
            </div>

            <span class="mrna-tag-end">-3'</span>
          </div>

          <!-- Visor del Código Genético -->
          <div class="genetic-code-lens-card glass-panel">
            <div class="lens-header">
              <span class="lens-icon">🔬</span>
              <span>VISOR DE CÓDIGO GENÉTICO: INTERPRETACIÓN DE TRIPLETES</span>
            </div>
            <div class="lens-content-row">
              <div class="lens-triplet-card">
                <span class="triplet-badge badge-wt">Codón Silvestre</span>
                <strong class="triplet-formula">5'-GAA-3'</strong>
                <div class="triplet-translation">Ácido Glutámico (Glu)</div>
                <small class="triplet-nature">Residuo aniónico polar normal</small>
              </div>
              <div class="lens-comparator-arrow">➔</div>
              <div class="lens-triplet-card ${isComplete ? 'triplet-card-mutant glow-pulse' : ''}">
                <span class="triplet-badge badge-mut">Codón Transcrito</span>
                <strong class="triplet-formula text-danger">5'-${slots[0] || '?'}${slots[1] || '?'}${slots[2] || '?'}-3'</strong>
                <div class="triplet-translation ${isComplete ? 'text-danger font-bold' : ''}">
                  ${isComplete ? '🛑 SEÑAL STOP (PTC)' : 'Completar ranuras...'}
                </div>
                <small class="triplet-nature">
                  ${isComplete ? 'Codón de parada prematuro (Ochre) en exón 1' : 'Introduce las bases de ARN en las ranuras'}
                </small>
              </div>
            </div>
          </div>

          ${isComplete ? `
            <div class="codon-decoded-callout success-callout glow-pulse" style="margin-top: 1rem;">
              ✓ Codón de ARNm <strong>5'-UAA-3'</strong> sintetizado correctamente.
              <br><small>Corresponde a una señal de parada (Codón Stop Ochre / PTC).</small>
            </div>
          ` : ''}
        </div>

        ${isComplete ? `
          <div class="evidence-registered-card glow-pulse">
            <div class="ev-card-tag">📌 EVIDENCIA B REGISTRADA: INTRODUCCIÓN DE CODÓN STOP PREMATURO</div>
            <div class="ev-card-body">
              <div class="ev-card-highlight">Triplete de ARNm: <strong>5'-UAA-3' (Codón Stop Prematuro / PTC)</strong></div>
              <p>La ARN polimerasa II transcribe el triplete mutado como 5'-UAA-3'. Al ubicarse en el exón 1 inmediatamente tras el codón iniciador AUG, introduce una señal de terminación precoz.</p>
            </div>
          </div>

          <div class="stage-continue-panel" style="text-align: right; margin-top: 1rem;">
            <button class="btn btn-primary btn-sm glow-effect" id="btnNextToPhase3">
              Siguiente: Conectar Tablero de Investigación Causal →
            </button>
          </div>
        ` : ''}
      `;
    }

    if (ph === 3) {
      // FASE 3: TABLERO DE INVESTIGACIÓN Y DEDUCCIÓN CAUSAL (PINBOARD)
      const t = this.slottedTokens;
      const isAllSlotted = t.mutation_type && t.codon_impact && t.protein_fate && t.cellular_pathway;

      return `
        <div class="detective-header">
          <span class="lvl2-tag">FASE C: TABLERO DE INVESTIGACIÓN Y DEDUCCIÓN CAUSAL</span>
          <h4 class="workbench-title">Establece la Cadena Causal y sus Límites Diagnósticos</h4>
          <p class="workbench-goal">
            👉 Conecta las evidencias moleculares en estricto orden de causa-efecto: tipo de mutación ➔ señal en ARNm ➔ consecuencia peptídica ➔ determinación rigurosa sobre el destino celular y NMD según los datos disponibles.
          </p>
        </div>

        <div class="medical-dossier-board glass-panel pinboard-board">
          <div class="dossier-header-bar">
            <span>TABLERO DE DEDUCCIÓN CAUSAL: CASO DIDÁCTICO POLM-1</span>
            <span class="dossier-id-tag">REF: POLM1-c.4G>T</span>
          </div>

          <div class="pinboard-flow-container">
            <!-- Estación 1: Clasificación de la Mutación -->
            <div class="pinboard-station">
              <div class="station-header">
                <span class="station-pin">📍</span>
                <span class="entry-label">1. Tipo de Mutación:</span>
              </div>
              <div class="mol-drop-target pinboard-slot ${t.mutation_type ? 'dossier-slotted glow-pulse' : 'socket-pulse'}" id="dossierSlotType" data-category="mutation_type" data-accept="token_nonsense">
                ${t.mutation_type 
                  ? '<div class="slotted-content">✓ Mutación Sin Sentido (Nonsense)</div>' 
                  : '<div class="target-placeholder">🎯 [Ficha de Tipo de Mutación]</div>'}
              </div>
            </div>

            <div class="pinboard-path-connector"><span class="connector-arrow">➔</span><span class="connector-label">origina</span></div>

            <!-- Estación 2: Impacto en el Codón -->
            <div class="pinboard-station">
              <div class="station-header">
                <span class="station-pin">📍</span>
                <span class="entry-label">2. Señal en ARNm:</span>
              </div>
              <div class="mol-drop-target pinboard-slot ${t.codon_impact ? 'dossier-slotted glow-pulse' : 'socket-pulse'}" id="dossierSlotImpact" data-category="codon_impact" data-accept="token_premature_stop">
                ${t.codon_impact 
                  ? '<div class="slotted-content">✓ Codón Stop Prematuro (UAA / PTC)</div>' 
                  : '<div class="target-placeholder">🎯 [Ficha de Señal en ARNm]</div>'}
              </div>
            </div>

            <div class="pinboard-path-connector"><span class="connector-arrow">➔</span><span class="connector-label">produce</span></div>

            <!-- Estación 3: Impacto en la Proteína -->
            <div class="pinboard-station">
              <div class="station-header">
                <span class="station-pin">📍</span>
                <span class="entry-label">3. Consecuencia Peptídica:</span>
              </div>
              <div class="mol-drop-target pinboard-slot ${t.protein_fate ? 'dossier-slotted glow-pulse' : 'socket-pulse'}" id="dossierSlotProtein" data-category="protein_fate" data-accept="token_truncation">
                ${t.protein_fate 
                  ? '<div class="slotted-content">✓ Truncamiento en Residuo 1 (Met-1)</div>' 
                  : '<div class="target-placeholder">🎯 [Ficha de Truncamiento]</div>'}
              </div>
            </div>

            <div class="pinboard-path-connector"><span class="connector-arrow">➔</span><span class="connector-label">evalúa</span></div>

            <!-- Estación 4: Evaluación de NMD con Datos Disponibles -->
            <div class="pinboard-station">
              <div class="station-header">
                <span class="station-pin">📍</span>
                <span class="entry-label">4. Evaluación de NMD:</span>
              </div>
              <div class="mol-drop-target pinboard-slot ${t.cellular_pathway ? 'dossier-slotted glow-pulse' : 'socket-pulse'}" id="dossierSlotPathway" data-category="cellular_pathway" data-accept="token_nmd">
                ${t.cellular_pathway 
                  ? '<div class="slotted-content">✓ No determinable con datos disponibles (Requiere EJC)</div>' 
                  : '<div class="target-placeholder">🎯 [Evaluación de NMD con Datos Disponibles]</div>'}
              </div>
            </div>
          </div>
        </div>

        ${isAllSlotted ? `
          <div class="stage-continue-panel" style="text-align: center; margin-top: 1.5rem;">
            <button class="btn btn-primary btn-large glow-effect" id="btnFinishLevel5Detective">
              🏆 Firmar Dictamen Pericial y Generar Certificado de finalización (${this.score} pts)
            </button>
          </div>
        ` : ''}
      `;
    }

    return '';
  }

  /* ================== RENDER DE BANDEJA DE FICHAS ================== */
  _renderDetectiveToolsTray() {
    const ph = this.currentPhase;

    if (ph === 1) {
      return `
        <div class="tray-container glass-panel">
          <div class="tray-header">
            <span class="tray-title">🔍 MESA DE COMPARACIÓN GENÓMICA</span>
            <span class="tray-hint">Inspecciona ambas secuencias (Posición 1 a 12) y haz clic sobre la base discrepante en la fila del paciente:</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted);">
            Estado del análisis: <strong style="color: ${this.detectedMutationIdx !== null ? '#10b981' : 'var(--text-muted)'};">
              ${this.detectedMutationIdx !== null ? `✓ Discrepancia identificada en Posición 4: Control WT (Guanina) ≠ Paciente (Timina)` : 'Comparando alineamiento de pares de bases...'}
            </strong>
          </div>
        </div>
      `;
    }

    if (ph === 2) {
      // Ribonucleótidos para colocar en las ranuras
      const bases = [
        { base: 'U', icon: '🟣', label: 'Uracilo (ARN)', desc: 'Ribonucleótido complementario a Timina' },
        { base: 'A', icon: '🔵', label: 'Adenina (ARN)', desc: 'Ribonucleótido de adenina' },
        { base: 'T', icon: '🔴', label: 'Timina (ADN)', desc: '¡Exclusivo de ADN! Incompatible con ARN' },
        { base: 'C', icon: '🟡', label: 'Citosina (ARN)', desc: 'Ribonucleótido pirimidínico' },
        { base: 'G', icon: '🟢', label: 'Guanina (ARN)', desc: 'Ribonucleótido púrico' }
      ];

      return `
        <div class="tray-container glass-panel">
          <div class="tray-header">
            <span class="tray-title">🧬 BANDEJA DE BASES DE ARN</span>
            <span class="tray-hint">Arrastra o toca para seleccionar la base y colócala en la ranura vacía:</span>
          </div>
          <div class="mol-tools-grid">
            ${bases.map(b => `
              <div class="cargo-item-token rna-base-token ${this.heldToken && this.heldToken.base === b.base ? 'tool-held' : ''}" 
                   draggable="true" 
                   data-base="${b.base}">
                <div class="tool-token-icon">${b.icon}</div>
                <div class="tool-token-info">
                  <strong>${b.label}</strong>
                  <small>${b.desc}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (ph === 3) {
      // Fichas diagnósticas para el tablero de deducción causal
      const tokens = [
        { id: 'token_nonsense', label: "Mutación Sin Sentido (Nonsense)", icon: "🛑", desc: "Sustitución puntual que transforma un codón codificante en codón de parada" },
        { id: 'token_missense', label: "Mutación Cambio de Sentido (Missense)", icon: "🔄", desc: "Sustitución que reemplaza un aminoácido por otro (distractor)" },
        { id: 'token_premature_stop', label: "Codón Stop Prematuro (UAA / PTC)", icon: "⚠️", desc: "El triplete 5'-UAA-3' en exón 1 aborta la elongación tras el residuo 1" },
        { id: 'token_frameshift', label: "Desfase de Lectura (Frameshift)", icon: "〰️", desc: "Inserción o deleción de nucleótidos (distractor)" },
        { id: 'token_truncation', label: "Truncamiento Proteico (Met-1)", icon: "✂️", desc: "Polipéptido afuncional; solo se sintetizó la metionina inicial" },
        { id: 'token_nmd', label: "NMD: No determinable con estos datos", icon: "❓", desc: "12 nt no permiten ubicar complejos EJC ni demostrar degradación por NMD" },
        { id: 'token_nmd_confirmed', label: "NMD: Degradación demostrada", icon: "⚠️", desc: "Afirma erróneamente degradación por NMD sin datos de posición EJC (distractor)" }
      ];

      return `
        <div class="tray-container glass-panel">
          <div class="tray-header">
            <span class="tray-title">📋 BANDEJA DE EVIDENCIAS Y FICHAS DIAGNÓSTICAS</span>
            <span class="tray-hint">Arrastra o toca una ficha y colócala en su estación causal correspondiente:</span>
          </div>
          <div class="mol-tools-grid">
            ${tokens.map(tk => `
              <div class="cargo-item-token diagnosis-token ${this.heldToken && this.heldToken.id === tk.id ? 'tool-held' : ''}" 
                   draggable="true" 
                   data-token-id="${tk.id}">
                <div class="tool-token-icon">${tk.icon}</div>
                <div class="tool-token-info">
                  <strong>${tk.label}</strong>
                  <small>${tk.desc}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return '';
  }

  /* ================== EVALUACIONES DE FASE ================== */
  _handleBaseCellClick(idx) {
    if (this.currentPhase !== 1) return;

    if (idx === this.challenge.mutationIndex) {
      this.detectedMutationIdx = idx;
      if (window.audioMgr) window.audioMgr.playAssemble();

      this._showFeedbackSuccess(
        "✓ ¡Transversión Patogénica Localizada!",
        "En la posición 4 (Codón 2), la hebra codificante de ADN del paciente presenta una <strong>Timina (T)</strong> en lugar de la Guanina (G) normal del control. Se trata de una transversión puntual purina ⟶ pirimidina."
      );
      this.render();
    } else {
      if (window.audioMgr) window.audioMgr.playMistake();
      this._deductPoints(10);
      this._showFeedbackError(
        "✕ Posición Invariable (-10 pts)",
        `En la posición ${idx + 1}, tanto el control como el paciente tienen la misma base. Compara columna por columna para hallar la discrepancia.`
      );
    }
  }

  _handleSlotRnaBase(baseLetter, targetSlotIdx = null) {
    if (this.currentPhase !== 2) return;

    // Si intenta poner Timina en ARN
    if (baseLetter === 'T') {
      if (window.audioMgr) window.audioMgr.playMistake();
      this._deductPoints(10);
      this._showFeedbackError(
        "✕ Error Biológico: Timina en ARN (-10 pts)",
        "¡Principio fundamental! El ARN mensajero nunca utiliza Timina (T). La base pirimidínica sintetizada por la ARN polimerasa es el Uracilo (U)."
      );
      return;
    }

    // Determinar la ranura destino (la primera vacía o la clickeada)
    let slotIdx = targetSlotIdx;
    if (slotIdx === null) {
      slotIdx = this.assembledMrnaSlots.findIndex(s => s === null);
    }
    if (slotIdx === -1) return;

    const expectedBases = ['U', 'A', 'A'];
    if (baseLetter === expectedBases[slotIdx]) {
      // Acierto
      if (window.audioMgr) window.audioMgr.playCorrect();
      this.assembledMrnaSlots[slotIdx] = baseLetter;
      this.heldToken = null;

      const allFilled = this.assembledMrnaSlots.every(s => s !== null);
      if (allFilled) {
        if (window.audioMgr) window.audioMgr.playSuccess();
        this._showFeedbackSuccess(
          "✓ Codón 5'-UAA-3' Completado",
          "El triplete 5'-TAA-3' de ADN se transcribió fielmente como 5'-UAA-3' en el ARNm. Este codón es una señal de parada de la traducción."
        );
      }
      this.render();
    } else {
      // Error
      if (window.audioMgr) window.audioMgr.playMistake();
      this._deductPoints(10);
      this._showFeedbackError(
        "✕ Base Incorrecta para este Codón (-10 pts)",
        `La base ${baseLetter} no corresponde a la posición ${slotIdx + 1} de este codón (recuerda que el ADN codificante es T-A-A).`
      );
    }
  }

  _evaluateDiagnosisToken(tokenId, targetCategory, targetAccept) {
    if (tokenId === targetAccept || (targetCategory === 'cellular_pathway' && (tokenId === 'token_nmd' || tokenId === 'token_nmd_indeterminable'))) {
      if (window.audioMgr) window.audioMgr.playAssemble();
      this.slottedTokens[targetCategory] = tokenId;
      this.heldToken = null;

      const t = this.slottedTokens;
      const allDone = t.mutation_type && t.codon_impact && t.protein_fate && t.cellular_pathway;
      if (allDone) {
        if (window.audioMgr) window.audioMgr.playSuccess();
        this._showFeedbackSuccess(
          "✓ ¡Expediente Pericial Completado con Rigor Científico!",
          "Conclusiones demostrables: mutación sin sentido (nonsense), señal de terminación prematura (PTC) y truncamiento proteico. Límite diagnóstico establecido: la degradación por NMD no es determinable con una secuencia de 12 nt (requiere evaluar la presencia y distancia al complejo EJC >50-55 nt)."
        );
      }
      this.render();
    } else {
      if (window.audioMgr) window.audioMgr.playMistake();
      this._deductPoints(10);

      let msg = "Esta ficha diagnóstica no corresponde a este rubro del peritaje.";
      if (tokenId === 'token_missense') msg = "Una mutación missense sustituye un aminoácido por otro; en este caso se genera una señal de terminación.";
      if (tokenId === 'token_frameshift') msg = "No hay desfase de lectura porque no hubo inserción ni deleción; es una sustitución puntual de un solo nucleótido.";
      if (tokenId === 'token_nmd_confirmed') msg = "Error metodológico: La degradación por NMD no puede afirmarse como hecho demostrado con solo 12 nt. Se desconoce la arquitectura completa del transcrito y la posición del complejo EJC (>50-55 nt). La respuesta científicamente correcta es que no es determinable con los datos disponibles.";

      this._showFeedbackError("✕ Ficha Diagnóstica Inadecuada (-10 pts)", msg);
    }
  }

  _showFeedbackSuccess(title, text) {
    const feedbackBox = this.container.querySelector('#lvl5Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl5-feedback-box success-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showFeedbackError(title, text) {
    const feedbackBox = this.container.querySelector('#lvl5Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl5-feedback-box error-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showLevelVictoryModal() {
    this.isCompleted = true;
    if (window.audioMgr) window.audioMgr.playSuccess();

    const summaryHtml = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🩺</div>
        <h4 style="font-size: 1.35rem; color: var(--accent-cyan); margin: 0 0 0.25rem;">¡CASO DOCENTE 042-B RESUELTO!</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin: 0;">
          Peritaje de investigación molecular y deducción causal completado con rigor científico.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-glass); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem; font-size: 0.84rem; line-height: 1.55;">
        <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.78rem; letter-spacing: 0.05em;">
          Cadena Causal de Biología Molecular Demostrada:
        </div>
        <ul style="margin: 0; padding-left: 1.2rem; color: #cbd5e1;">
          <li><strong>Alteración Primaria en ADN:</strong> Transversión puntual <code class="bio-code">c.4G>T</code> (5'-GAA-3' ⟶ 5'-TAA-3') en la hebra codificante del exón 1 del gen sintético <code class="bio-code">POLM-1</code>.</li>
          <li><strong>Clasificación Genética:</strong> Mutación puntual de tipo <strong>Sin Sentido (Nonsense)</strong>.</li>
          <li><strong>Mensaje en ARNm:</strong> Introducción de un <strong>Codón de Parada Prematuro (PTC: 5'-UAA-3')</strong> inmediatamente adyacente al AUG de inicio.</li>
          <li><strong>Consecuencia en Traducción:</strong> <strong>Truncamiento proteico absoluto</strong> (polipéptido abortivo no funcional con solo el residuo Met-1).</li>
          <li><strong>Evaluación de NMD y Destino Celular:</strong> <strong>Conclusión no determinable con los datos disponibles</strong>: La secuencia analizada de 12 nucleótidos no permite ubicar la posición de los complejos de unión de exones (EJC) ni demostrar la susceptibilidad efectiva a NMD. Como principio molecular, el NMD puede ocurrir si el codón prematuro se ubica a >50-55 nt del último EJC, o en caso contrario sintetizarse el péptido truncado no funcional. Demostrar qué destino ocurre exige datos genómicos y transcriptómicos adicionales.</li>
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 0.75rem 1rem; font-family: var(--font-mono); font-size: 0.95rem;">
        <span>Puntuación del Peritaje:</span>
        <span style="color: var(--accent-cyan); font-weight: 800; font-size: 1.2rem;">${this.score} / 100 pts</span>
      </div>
    `;

    if (window.app) {
      window.app.showModal(
        "Fase 05 — Diagnóstico Molecular",
        summaryHtml,
        "Emitir Certificado de finalización — Misión Proteína",
        () => {
          if (typeof this.onComplete === 'function') {
            this.onComplete(5, this.score);
          }
        }
      );
    }
  }

  _bindContainerEvents() {
    if (!this.container) return;

    // Tabs de fases
    const phaseTabs = this.container.querySelectorAll('.lvl5-phase-tab');
    phaseTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetPhase = parseInt(tab.dataset.phase, 10);
        if (targetPhase <= this.currentPhase) {
          if (window.audioMgr) window.audioMgr.playClick();
          this.currentPhase = targetPhase;
          this.render();
        }
      });
    });

    // Reiniciar nivel
    const btnRestart = this.container.querySelector('#btnRestartLvl5');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.restart());
    }

    // Botones de avance de fase
    const btnNext2 = this.container.querySelector('#btnNextToPhase2');
    if (btnNext2) {
      btnNext2.addEventListener('click', () => {
        if (window.audioMgr) window.audioMgr.playClick();
        this.currentPhase = 2;
        this.render();
      });
    }

    const btnNext3 = this.container.querySelector('#btnNextToPhase3');
    if (btnNext3) {
      btnNext3.addEventListener('click', () => {
        if (window.audioMgr) window.audioMgr.playClick();
        this.currentPhase = 3;
        this.render();
      });
    }

    // Botón firmar dictamen final
    const btnFinish = this.container.querySelector('#btnFinishLevel5Detective');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        this._showLevelVictoryModal();
      });
    }

    // ================= FASE 1: COMPARADOR GENÓMICO =================
    if (this.currentPhase === 1) {
      const baseButtons = this.container.querySelectorAll('#patientBasesTrack .base-interactive');
      baseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this._handleBaseCellClick(idx);
        });
      });
    }

    // ================= FASE 2: ENSAMBLADOR DE CODÓN ARNm =================
    if (this.currentPhase === 2) {
      const rnaTokens = this.container.querySelectorAll('.rna-base-token');
      rnaTokens.forEach(token => {
        token.addEventListener('click', () => {
          const baseLetter = token.dataset.base;
          this.heldToken = { type: 'rna_base', base: baseLetter };
          if (window.audioMgr) window.audioMgr.playClick();

          rnaTokens.forEach(t => t.classList.remove('tool-held'));
          token.classList.add('tool-held');

          // Si hace clic en la ficha, intentar slotear en la primera ranura vacía
          this._handleSlotRnaBase(baseLetter);
        });

        token.addEventListener('dragstart', (e) => {
          const baseLetter = token.dataset.base;
          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'rna_base', base: baseLetter }));
          token.classList.add('dragging');
        });

        token.addEventListener('dragend', () => {
          token.classList.remove('dragging');
        });
      });

      const slots = this.container.querySelectorAll('.mrna-slot-box');
      slots.forEach(slot => {
        const slotIdx = parseInt(slot.dataset.slot, 10);

        slot.addEventListener('click', () => {
          if (this.heldToken && this.heldToken.type === 'rna_base') {
            this._handleSlotRnaBase(this.heldToken.base, slotIdx);
          }
        });

        slot.addEventListener('dragover', (e) => {
          e.preventDefault();
          slot.classList.add('drag-hover');
        });

        slot.addEventListener('dragleave', () => {
          slot.classList.remove('drag-hover');
        });

        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          slot.classList.remove('drag-hover');
          try {
            const raw = e.dataTransfer.getData('text/plain');
            const data = JSON.parse(raw);
            if (data.type === 'rna_base') {
              this._handleSlotRnaBase(data.base, slotIdx);
            }
          } catch (err) {
            console.warn('Drop error:', err);
          }
        });
      });
    }

    // ================= FASE 3: EXPEDIENTE Y DICTAMEN =================
    if (this.currentPhase === 3) {
      const diagTokens = this.container.querySelectorAll('.diagnosis-token');
      diagTokens.forEach(token => {
        token.addEventListener('click', () => {
          const tokenId = token.dataset.tokenId;
          this.heldToken = { type: 'diagnosis_token', id: tokenId };
          if (window.audioMgr) window.audioMgr.playClick();

          diagTokens.forEach(t => t.classList.remove('tool-held'));
          token.classList.add('tool-held');

          const targets = this.container.querySelectorAll('.mol-drop-target');
          targets.forEach(tgt => tgt.classList.add('target-active-pulse'));
        });

        token.addEventListener('dragstart', (e) => {
          const tokenId = token.dataset.tokenId;
          e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'diagnosis_token', id: tokenId }));
          token.classList.add('dragging');
        });

        token.addEventListener('dragend', () => {
          token.classList.remove('dragging');
        });
      });

      const dossierSlots = this.container.querySelectorAll('.mol-drop-target[data-category]');
      dossierSlots.forEach(slot => {
        const category = slot.dataset.category;
        const accept = slot.dataset.accept;

        slot.addEventListener('click', () => {
          if (this.heldToken && this.heldToken.type === 'diagnosis_token') {
            this._evaluateDiagnosisToken(this.heldToken.id, category, accept);
          } else {
            this._showFeedbackError(
              "Selecciona primero una ficha de diagnóstico",
              "Toca una ficha de la bandeja inferior y colócala en este rubro del expediente médico."
            );
          }
        });

        slot.addEventListener('dragover', (e) => {
          e.preventDefault();
          slot.classList.add('drag-hover');
        });

        slot.addEventListener('dragleave', () => {
          slot.classList.remove('drag-hover');
        });

        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          slot.classList.remove('drag-hover');
          try {
            const raw = e.dataTransfer.getData('text/plain');
            const data = JSON.parse(raw);
            if (data.type === 'diagnosis_token') {
              this._evaluateDiagnosisToken(data.id, category, accept);
            }
          } catch (err) {
            console.warn('Drop error:', err);
          }
        });
      });
    }
  }
}

// Exportar globalmente
window.Level5Controller = Level5Controller;