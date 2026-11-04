/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Componente: Nivel 1 — Transcripción (Descifra el ADN)
 * 100% Interactivo, microanimaciones de ensamblaje molecular, barra de progreso y game-feel.
 */

class Level1Controller {
  constructor(levelData, onComplete, onExit) {
    this.data = levelData;
    this.onComplete = onComplete;
    this.onExit = onExit;

    // Estado del nivel
    this.templateStrand = this.data.challenge.templateStrand; // 12 bases
    this.targetStrand = this.data.challenge.targetStrand;     // 12 bases
    this.currentPosition = 0;
    this.placedBases = [];
    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;

    this.container = null;
    this._keyboardHandler = this._handleKeyboard.bind(this);
    this._scrollHandler = null;
  }

  mount(stageElement) {
    this.container = stageElement;
    this.render();
    this.attachEvents();
  }

  unmount() {
    window.removeEventListener('keydown', this._keyboardHandler);
    if (this._scrollHandler) {
      window.removeEventListener('resize', this._scrollHandler);
      const rig = this.container ? this.container.querySelector('#transcriptionRig') : null;
      if (rig) rig.removeEventListener('scroll', this._scrollHandler);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="stage-card glass-panel">
        <!-- Briefing científico de la misión -->
        <div class="stage-briefing">
          <div class="stage-briefing-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            OBJETIVO CIENTÍFICO: SÍNTESIS DE PRE-ARNm (TRANSCRIPCIÓN)
          </div>
          <p class="stage-briefing-text">
            La <strong>ARN Polimerasa II</strong> lee la hebra molde de ADN en sentido <strong>3' → 5'</strong>. 
            Tu labor es seleccionar ribonucleótidos para sintetizar la hebra complementaria de pre-ARNm en sentido <strong>5' → 3'</strong>.
            ¡Recuerda que en el ARN el <strong>Uracilo (U)</strong> reemplaza a la Timina!
          </p>
        </div>

        <!-- Barra de Progreso Molecular de Síntesis -->
        <div class="molecular-progress-container" aria-label="Progreso de transcripción">
          <div class="progress-meta">
            <span class="progress-title">
              <span class="pulse-indicator"></span> SÍNTESIS DE PRE-ARNm:
            </span>
            <span class="progress-counter" id="progressCounter">0 / 12 NUCLEÓTIDOS (0%)</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" id="progressFill" style="width: 0%;">
              <div class="progress-laser"></div>
            </div>
          </div>
        </div>

        <!-- Wrapper del Rig de Transcripción con indicadores de scroll -->
        <div class="transcription-rig-wrapper">
          <!-- Indicador visual de desplazamiento horizontal en móviles -->
          <div class="scroll-indicator-bar" id="scrollIndicatorBar">
            <span class="scroll-indicator-icon">⇄</span>
            <span>Desplaza la secuencia para explorar los 12 nucleótidos</span>
          </div>

          <!-- Sombras de desvanecimiento en bordes -->
          <div class="scroll-fade-edge left" id="scrollFadeLeft" aria-hidden="true"></div>
          <div class="scroll-fade-edge right active" id="scrollFadeRight" aria-hidden="true"></div>

          <!-- Rig de Transcripción Molecular -->
          <div class="transcription-rig" id="transcriptionRig">
            <!-- Halo de la ARN Polimerasa II móvil -->
            <div class="polymerase-halo" id="polymeraseHalo" style="left: 175px;">
              <span class="polymerase-label">ARN Polimerasa II</span>
              <div class="polymerase-glow-core"></div>
            </div>

            <!-- Fila: ADN Molde 3' -> 5' -->
            <div class="strand-row">
              <div class="strand-meta-label">
                <span class="strand-kind">ADN MOLDE</span>
                <span class="strand-polarity">3' → 5'</span>
              </div>
              <div class="strand-nucleotides-container" id="dnaSlotsContainer">
                ${this._renderDnaSlots()}
              </div>
            </div>

            <!-- Fila: Indicadores de Puentes de Hidrógeno -->
            <div class="hydrogen-bonds-row" id="hBondsRow">
              <div class="strand-meta-spacer"></div>
              <div class="h-bonds-slots-container">
                ${this._renderHBonds()}
              </div>
            </div>

            <!-- Fila: ARNm Sintetizado 5' -> 3' -->
            <div class="strand-row">
              <div class="strand-meta-label">
                <span class="strand-kind text-accent">PRE-ARNm</span>
                <span class="strand-polarity">5' → 3'</span>
              </div>
              <div class="strand-nucleotides-container" id="mrnaSlotsContainer">
                ${this._renderMrnaSlots()}
              </div>
            </div>
          </div>
        </div>

        <!-- Banner de Retroalimentación Inmediata -->
        <div class="feedback-banner info" id="liveFeedbackBanner">
          <span class="feedback-icon">🧬</span>
          <span class="feedback-text" id="liveFeedbackText">
            Posición inicial lista. Selecciona el ribonucleótido complementario para la primera base (ADN: 3'-<strong>${this.templateStrand[0]}</strong>).
          </span>
        </div>

        <!-- Panel de Control y Teclado Molecular -->
        <div class="transcription-controls">
          <div class="controls-header">
            <span class="controls-instruction">Elige el ribonucleótido trifosfato sustrato:</span>
            <span class="keyboard-hint">Teclado: [A] [U] [C] [G] o táctil</span>
          </div>

          <div class="nucleotide-keyboard" id="nucleotideKeyboard">
            <button class="btn-nucleotide" data-base="A" title="Adenina (A)" aria-label="Ribonucleótido Adenina">
              <span class="btn-base-letter">A</span>
              <span class="btn-base-name">Adenina</span>
              <span class="btn-key-shortcut">Tecla A / 1</span>
            </button>
            <button class="btn-nucleotide" data-base="U" title="Uracilo (U) - Reemplaza a Timina" aria-label="Ribonucleótido Uracilo">
              <span class="btn-base-letter">U</span>
              <span class="btn-base-name">Uracilo</span>
              <span class="btn-key-shortcut">Tecla U / 2</span>
            </button>
            <button class="btn-nucleotide" data-base="C" title="Citosina (C)" aria-label="Ribonucleótido Citosina">
              <span class="btn-base-letter">C</span>
              <span class="btn-base-name">Citosina</span>
              <span class="btn-key-shortcut">Tecla C / 3</span>
            </button>
            <button class="btn-nucleotide" data-base="G" title="Guanina (G)" aria-label="Ribonucleótido Guanina">
              <span class="btn-base-letter">G</span>
              <span class="btn-base-name">Guanina</span>
              <span class="btn-key-shortcut">Tecla G / 4</span>
            </button>
          </div>

          <div class="edit-actions-bar">
            <button id="btnUndoBase" class="btn btn-outline btn-sm" ${this.currentPosition === 0 ? 'disabled' : ''}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7v6h6"></path>
                <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
              </svg>
              Deshacer último (Backspace)
            </button>

            <button id="btnRestartLevel" class="btn btn-outline btn-sm">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              Reiniciar hebra
            </button>
          </div>
        </div>
      </div>
    `;

    this._updateScoreUI();
    this._updatePolymerasePosition();
    this._updateProgressBar();
  }

  _renderDnaSlots() {
    return this.templateStrand.map((base, idx) => {
      const isTripletEnd = (idx + 1) % 3 === 0 && idx !== this.templateStrand.length - 1;
      const baseClass = `base-${base.toLowerCase()}`;
      const baseNames = { 'A': 'Ade', 'T': 'Tim', 'C': 'Cit', 'G': 'Gua' };
      return `
        <div class="nucleotide-slot dna ${baseClass}" data-idx="${idx}" title="ADN Molde base ${idx + 1}: ${base}">
          ${base}
          <span class="base-name">${baseNames[base] || ''}</span>
        </div>
        ${isTripletEnd ? '<div class="triplet-separator"></div>' : ''}
      `;
    }).join('');
  }

  _renderHBonds() {
    return this.templateStrand.map((_, idx) => {
      const isTripletEnd = (idx + 1) % 3 === 0 && idx !== this.templateStrand.length - 1;
      const isFilled = idx < this.placedBases.length;
      const dnaBase = this.templateStrand[idx];
      const hBondText = (dnaBase === 'C' || dnaBase === 'G') ? '⋮⋮⋮' : '⋮⋮';
      return `
        <div class="h-bond-indicator ${isFilled ? 'active' : ''}" id="hBond-${idx}">
          ${isFilled ? hBondText : '·'}
        </div>
        ${isTripletEnd ? '<div class="triplet-separator" style="opacity:0;"></div>' : ''}
      `;
    }).join('');
  }

  _renderMrnaSlots() {
    return this.templateStrand.map((_, idx) => {
      const isTripletEnd = (idx + 1) % 3 === 0 && idx !== this.templateStrand.length - 1;
      const isPlaced = idx < this.placedBases.length;
      const isCurrent = idx === this.currentPosition && !this.isCompleted;
      const base = isPlaced ? this.placedBases[idx] : (isCurrent ? '?' : '');
      const baseClass = isPlaced ? `filled base-${base.toLowerCase()}` : (isCurrent ? 'active-cursor' : 'empty');
      const baseNames = { 'A': 'Ade', 'U': 'Ura', 'C': 'Cit', 'G': 'Gua' };
      return `
        <div class="nucleotide-slot mrna ${baseClass}" id="mrnaSlot-${idx}" data-idx="${idx}">
          ${base}
          <span class="base-name">${isPlaced ? (baseNames[base] || '') : ''}</span>
        </div>
        ${isTripletEnd ? '<div class="triplet-separator"></div>' : ''}
      `;
    }).join('');
  }

  attachEvents() {
    // Teclado físico
    window.addEventListener('keydown', this._keyboardHandler);

    // Botones de nucleótidos
    const buttons = this.container.querySelectorAll('.btn-nucleotide');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const base = btn.getAttribute('data-base');
        this.handleBaseSelection(base, btn);
      });
    });

    // Deshacer
    const btnUndo = this.container.querySelector('#btnUndoBase');
    if (btnUndo) {
      btnUndo.addEventListener('click', () => this.undoLastBase());
    }

    // Reiniciar
    const btnRestart = this.container.querySelector('#btnRestartLevel');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.restart());
    }

    // Monitoreo de scroll horizontal y resize
    const rig = this.container.querySelector('#transcriptionRig');
    if (rig) {
      this._scrollHandler = () => {
        this._updateScrollIndicators(rig);
      };
      rig.addEventListener('scroll', this._scrollHandler, { passive: true });
      window.addEventListener('resize', this._scrollHandler, { passive: true });
      setTimeout(() => this._updateScrollIndicators(rig), 150);
    }
  }

  _updateScrollIndicators(rig) {
    const fadeLeft = this.container.querySelector('#scrollFadeLeft');
    const fadeRight = this.container.querySelector('#scrollFadeRight');
    const hint = this.container.querySelector('#scrollIndicatorBar');

    const maxScroll = rig.scrollWidth - rig.clientWidth;
    if (maxScroll <= 8) {
      if (fadeLeft) fadeLeft.classList.remove('active');
      if (fadeRight) fadeRight.classList.remove('active');
      if (hint) hint.classList.add('hidden');
      return;
    }

    if (fadeLeft) {
      if (rig.scrollLeft > 15) fadeLeft.classList.add('active');
      else fadeLeft.classList.remove('active');
    }

    if (fadeRight) {
      if (rig.scrollLeft < maxScroll - 15) fadeRight.classList.add('active');
      else fadeRight.classList.remove('active');
    }

    if (hint && rig.scrollLeft > 25) {
      hint.classList.add('faded');
    }
  }

  _handleKeyboard(e) {
    if (this.isCompleted) return;
    const key = e.key.toUpperCase();

    if (key === 'A' || key === '1') {
      e.preventDefault();
      const btn = this.container.querySelector('.btn-nucleotide[data-base="A"]');
      this.handleBaseSelection('A', btn);
    } else if (key === 'U' || key === '2') {
      e.preventDefault();
      const btn = this.container.querySelector('.btn-nucleotide[data-base="U"]');
      this.handleBaseSelection('U', btn);
    } else if (key === 'C' || key === '3') {
      e.preventDefault();
      const btn = this.container.querySelector('.btn-nucleotide[data-base="C"]');
      this.handleBaseSelection('C', btn);
    } else if (key === 'G' || key === '4') {
      e.preventDefault();
      const btn = this.container.querySelector('.btn-nucleotide[data-base="G"]');
      this.handleBaseSelection('G', btn);
    } else if (key === 'T') {
      e.preventDefault();
      this._handleIllegalThymine();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      this.undoLastBase();
    }
  }

  _handleIllegalThymine() {
    this._handleErrorFeedback(
      'T',
      "¡Regla violada! El ARN NO contiene Timina (T). La ARN polimerasa utiliza exclusivamente Uracilo (U)."
    );
  }

  handleBaseSelection(selectedBase, clickedBtn = null) {
    if (this.isCompleted) return;
    if (this.currentPosition >= this.templateStrand.length) return;

    const dnaBase = this.templateStrand[this.currentPosition];
    const rule = this.data.challenge.rules[dnaBase];
    const expectedBase = rule.complement;

    if (selectedBase === expectedBase) {
      // Acierto: audio + animación de ensamble
      window.audioMgr.playMatch(this.currentPosition);
      this.placedBases.push(selectedBase);

      this._updateSlotVisual(this.currentPosition, selectedBase);
      this._updateHBondVisual(this.currentPosition, dnaBase);

      this.currentPosition++;
      this._updatePolymerasePosition(true); // Movimiento fluido con aura activa
      this._scrollToActiveSlot();
      this._updateProgressBar();

      // Habilitar botón de deshacer
      const btnUndo = this.container.querySelector('#btnUndoBase');
      if (btnUndo) btnUndo.disabled = false;

      // Mensaje de éxito específico
      this._showFeedback(
        `¡Correcto! ${rule.explain}`,
        "success"
      );

      // Verificar si se completó la hebra
      if (this.currentPosition === this.templateStrand.length) {
        this._handleLevelSuccess();
      } else {
        this._updateNextSlotCursor();
      }
    } else {
      // Error: retroalimentación científica + sacudida visual
      let explanation = "";
      if (dnaBase === 'A' && selectedBase !== 'U') {
        explanation = `Incompatible: Frente a Adenina (A) en el ADN molde, la ARN Polimerasa incorpora Uracilo (U). Seleccionaste ${selectedBase}.`;
      } else if (dnaBase === 'T' && selectedBase !== 'A') {
        explanation = `Incompatible: Frente a Timina (T) en el ADN molde, se debe emparejar con Adenina (A). Seleccionaste ${selectedBase}.`;
      } else if (dnaBase === 'C' && selectedBase !== 'G') {
        explanation = `Incompatible: La Citosina (C) requiere Guanina (G) para formar 3 puentes de hidrógeno. Seleccionaste ${selectedBase}.`;
      } else if (dnaBase === 'G' && selectedBase !== 'C') {
        explanation = `Incompatible: La Guanina (G) requiere Citosina (C) para formar 3 puentes de hidrógeno. Seleccionaste ${selectedBase}.`;
      }

      this._handleErrorFeedback(selectedBase, explanation, clickedBtn);
    }
  }

  _handleErrorFeedback(selectedBase, explanation, btnElement = null) {
    window.audioMgr.playError();
    this.score = Math.max(50, this.score - 5);
    this.mistakesCount++;
    this._updateScoreUI();

    // Sacudida visual en el slot activo
    const activeSlot = this.container.querySelector(`#mrnaSlot-${this.currentPosition}`);
    if (activeSlot) {
      activeSlot.classList.remove('slot-shake');
      void activeSlot.offsetWidth; // Forzar reflow
      activeSlot.classList.add('slot-shake');
      setTimeout(() => activeSlot.classList.remove('slot-shake'), 450);
    }

    // Sacudida en el botón pulsado
    if (btnElement) {
      btnElement.classList.remove('btn-shake-error');
      void btnElement.offsetWidth;
      btnElement.classList.add('btn-shake-error');
      setTimeout(() => btnElement.classList.remove('btn-shake-error'), 450);
    }

    // Vibración háptica en teléfonos si el dispositivo lo soporta
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([40, 30, 40]); } catch(e) {}
    }

    this._showFeedback(explanation, "error");
  }

  undoLastBase() {
    if (this.currentPosition === 0 || this.isCompleted) return;

    this.currentPosition--;
    this.placedBases.pop();

    // Resetear visualmente el slot actual y el enlace
    const slot = this.container.querySelector(`#mrnaSlot-${this.currentPosition}`);
    if (slot) {
      slot.className = 'nucleotide-slot mrna active-cursor';
      slot.innerHTML = '?<span class="base-name"></span>';
    }

    const nextSlot = this.container.querySelector(`#mrnaSlot-${this.currentPosition + 1}`);
    if (nextSlot) {
      nextSlot.className = 'nucleotide-slot mrna empty';
      nextSlot.innerHTML = '<span class="base-name"></span>';
    }

    const hBond = this.container.querySelector(`#hBond-${this.currentPosition}`);
    if (hBond) {
      hBond.className = 'h-bond-indicator';
      hBond.textContent = '·';
    }

    this._updatePolymerasePosition(false);
    this._scrollToActiveSlot();
    this._updateProgressBar();
    this._showFeedback("Se retiró el último ribonucleótido incorporado.", "info");

    const btnUndo = this.container.querySelector('#btnUndoBase');
    if (btnUndo && this.currentPosition === 0) {
      btnUndo.disabled = true;
    }
  }

  restart() {
    this.currentPosition = 0;
    this.placedBases = [];
    this.isCompleted = false;
    this.render();
    this.attachEvents();
  }

  giveHint() {
    if (this.hintsRemaining <= 0 || this.isCompleted) return;
    this.hintsRemaining--;
    window.audioMgr.playHint();
    this.score = Math.max(50, this.score - 5);
    this._updateScoreUI();

    const currentDna = this.templateStrand[this.currentPosition];
    const rule = this.data.challenge.rules[currentDna];
    
    const hintMsg = `
      <h4>Pista Molecular Activa:</h4>
      <p>Estás en la posición <strong>#${this.currentPosition + 1}</strong>. El nucleótido molde en el ADN es <strong>${currentDna}</strong>.</p>
      <p>Regla: ${rule.explain}</p>
      <p><small>Pistas restantes para este nivel: ${this.hintsRemaining}</small></p>
    `;

    window.app.showModal("🧬 Pista de Transcripción", hintMsg, "Entendido");
  }

  _updateSlotVisual(index, base) {
    const slot = this.container.querySelector(`#mrnaSlot-${index}`);
    if (!slot) return;
    const baseNames = { 'A': 'Ade', 'U': 'Ura', 'C': 'Cit', 'G': 'Gua' };
    slot.className = `nucleotide-slot mrna filled slot-pop base-${base.toLowerCase()}`;
    slot.innerHTML = `${base}<span class="base-name">${baseNames[base] || ''}</span>`;
  }

  _updateHBondVisual(index, dnaBase) {
    const hBond = this.container.querySelector(`#hBond-${index}`);
    if (!hBond) return;
    const hBondText = (dnaBase === 'C' || dnaBase === 'G') ? '⋮⋮⋮' : '⋮⋮';
    hBond.className = 'h-bond-indicator active h-bond-ignite';
    hBond.textContent = hBondText;
  }

  _updateNextSlotCursor() {
    const nextSlot = this.container.querySelector(`#mrnaSlot-${this.currentPosition}`);
    if (nextSlot) {
      nextSlot.className = 'nucleotide-slot mrna active-cursor';
      nextSlot.innerHTML = '?<span class="base-name"></span>';
    }
  }

  _scrollToActiveSlot() {
    const targetIdx = Math.min(this.currentPosition, this.templateStrand.length - 1);
    const targetSlot = this.container.querySelector(`#mrnaSlot-${targetIdx}`);
    const rig = this.container.querySelector('#transcriptionRig');
    if (!targetSlot || !rig) return;

    const rigRect = rig.getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();

    const isComfortable = (slotRect.left >= rigRect.left + 75) && (slotRect.right <= rigRect.right - 75);
    if (!isComfortable) {
      targetSlot.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }

  _updatePolymerasePosition(isAdvancing = false) {
    const halo = this.container.querySelector('#polymeraseHalo');
    if (!halo) return;

    const targetIdx = Math.min(this.currentPosition, this.templateStrand.length - 1);
    const targetSlot = this.container.querySelector(`#mrnaSlot-${targetIdx}`);
    const rig = this.container.querySelector('#transcriptionRig');
    if (!targetSlot || !rig) return;

    const rigRect = rig.getBoundingClientRect();
    const slotRect = targetSlot.getBoundingClientRect();
    const haloWidth = halo.offsetWidth || 140;

    const slotCenterInCanvas = (slotRect.left - rigRect.left) + rig.scrollLeft + (slotRect.width / 2);
    halo.style.left = `${Math.max(80, slotCenterInCanvas - (haloWidth / 2))}px`;

    if (isAdvancing) {
      halo.classList.add('polymerase-advancing');
      setTimeout(() => halo.classList.remove('polymerase-advancing'), 380);
    }
  }

  _updateProgressBar() {
    const fill = this.container.querySelector('#progressFill');
    const counter = this.container.querySelector('#progressCounter');
    if (!fill || !counter) return;

    const count = this.placedBases.length;
    const total = this.templateStrand.length;
    const pct = Math.round((count / total) * 100);

    fill.style.width = `${pct}%`;
    counter.textContent = `${count} / ${total} NUCLEÓTIDOS (${pct}%)`;

    if (pct === 100) {
      fill.classList.add('completed');
    } else {
      fill.classList.remove('completed');
    }
  }

  _updateScoreUI() {
    const scoreVal = document.getElementById('gpLevelScore');
    if (scoreVal) scoreVal.textContent = this.score;

    const hintCount = document.getElementById('gpHintsRemaining');
    if (hintCount) hintCount.textContent = this.hintsRemaining;
  }

  _showFeedback(text, type = "info") {
    const banner = this.container.querySelector('#liveFeedbackBanner');
    const textField = this.container.querySelector('#liveFeedbackText');
    if (!banner || !textField) return;

    banner.className = `feedback-banner ${type}`;
    textField.innerHTML = text;
  }

  _handleLevelSuccess() {
    this.isCompleted = true;
    window.audioMgr.playLevelComplete();

    // Desactivar teclado en pantalla
    const buttons = this.container.querySelectorAll('.btn-nucleotide');
    buttons.forEach(b => b.disabled = true);

    const btnUndo = this.container.querySelector('#btnUndoBase');
    if (btnUndo) btnUndo.disabled = true;

    // Registrar en el estado global
    window.gameState.recordLevelCompletion(1, this.score);

    // Modal con celebración científica de alto impacto y desglose interactivo
    const content = `
      <div class="victory-header-celebration">
        <div class="victory-badge-pulse">
          <span class="victory-emoji">🧬</span>
          <div class="victory-ring ring-1"></div>
          <div class="victory-ring ring-2"></div>
        </div>
        <h4 class="victory-title">
          ¡TRANSCRIPCIÓN EXITOSA!
        </h4>
        <p class="victory-subtext">Has sintetizado con precisión biológica la cadena de pre-ARNm en dirección 5' → 3'.</p>
      </div>

      <!-- Cadena molecular ensamblada -->
      <div class="completed-chain-display">
        <div class="chain-meta-tag">CADENA ENSAMBLADA (5' → 3')</div>
        <div class="chain-codons-grid">
          <div class="chain-codon-chip start">
            <span class="codon-seq">AUG</span>
            <span class="codon-aa">Met (Inicio)</span>
          </div>
          <span class="chain-link">•</span>
          <div class="chain-codon-chip">
            <span class="codon-seq">CCU</span>
            <span class="codon-aa">Prolina</span>
          </div>
          <span class="chain-link">•</span>
          <div class="chain-codon-chip">
            <span class="codon-seq">GAA</span>
            <span class="codon-aa">Ác. Glutámico</span>
          </div>
          <span class="chain-link">•</span>
          <div class="chain-codon-chip stop">
            <span class="codon-seq">UGA</span>
            <span class="codon-aa">STOP (Alto)</span>
          </div>
        </div>
      </div>

      <div class="victory-report-list">
        <ul>
          <li>🔹 <strong>AUG (Metionina):</strong> Codón iniciador donde se acoplará el complejo ribosomal.</li>
          <li>🔹 <strong>CCU (Prolina) & GAA (Glutamato):</strong> Residuos de aminoácidos para la cadena peptídica.</li>
          <li>🔹 <strong>UGA (Codón Stop):</strong> Señal de término; no codifica aminoácido, reclutará factores de liberación.</li>
        </ul>
      </div>

      <div class="victory-score-card">
        <span class="score-label">Rendimiento en Fase 01:</span>
        <div class="score-badge">
          <span class="score-star">★</span>
          <strong>${this.score} / 100 PTS</strong>
        </div>
      </div>
    `;

    window.app.showModal(
      "Misión Cumplida: Fase 01",
      content,
      "Continuar a Panel de Misiones",
      () => {
        if (this.onComplete) this.onComplete(1, this.score);
      }
    );
  }
}

window.Level1Controller = Level1Controller;
