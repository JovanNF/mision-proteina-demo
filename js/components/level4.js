/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Componente: Nivel 4 — Tráfico Celular y Control de Calidad ERAD (Cellular Route & Logistics Board)
 * 
 * Rediseño de Gameplay:
 * - Mapa celular interactivo con compartimentos conectados: Citosol, Membrana RER, Lumen RER,
 *   Sitios de Salida (ERES), Red cis-Golgi, Canal de Retrotranslocación y Proteasoma 26S.
 * - Proteína visible desplazándose físicamente por los conductos celulares.
 * - Mecánica de toma de decisiones mediante compuertas de enrutamiento y palancas de desvío.
 * - Supervisión conformacional por chaperona BiP (GRP78) en el lumen del RER.
 * - Bifurcación interactiva:
 *    * Proteína con plegamiento nativo normal ⟶ Vesículas COP II hacia cis-Golgi.
 *    * Proteína con mal plegamiento persistente ⟶ Vía ERAD (retrotranslocación, ubiquitinación y degradación en proteasoma 26S).
 * - Explicación científica rigurosa y sin dogmatismo: el desvío erróneo al Golgi se presenta como
 *   un fallo de control de calidad celular por ausencia de chaperonas de repliegue en el Golgi.
 */

class Level4Controller {
  constructor(levelData, onComplete, onExit) {
    this.data = levelData;
    this.challenge = levelData.challenge;
    this.onComplete = onComplete;
    this.onExit = onExit;

    // Estación actual en el mapa celular (1 a 4)
    // 1: Citosol (Reconocimiento del Péptido Señal por SRP)
    // 2: Membrana RER (Translocón Sec61 y Peptidasa de Señal)
    // 3: Lumen RER (Supervisión de Plegamiento con Chaperona BiP)
    // 4: Bifurcación de Calidad (Compuerta COP II vs Vía ERAD Proteasoma 26S)
    this.currentStation = 1;

    // Sub-estado de la estación 4:
    // 'evaluating_normal': Lote de proteína nativa normal ⟶ Enrutar a COP II / cis-Golgi
    // 'evaluating_misfolded': Lote de proteína anómala mal plegada ⟶ Enrutar a ERAD / Proteasoma 26S
    // 'finished': Ambos lotes completados exitosamente
    this.station4Branch = 'evaluating_normal';

    // Estado del escáner BiP en estación 3
    this.bipScanCompleted = false;

    // Posición porcentual de la proteína en el conducto para feedback visual
    this.proteinState = {
      label: "Proteína Naciente",
      hasSignalPeptide: true,
      isFolded: false,
      isUbiquitinated: false,
      isDegraded: false,
      location: "cytosol" // 'cytosol', 'translocon', 'lumen', 'cop2_vesicle', 'proteasome'
    };

    this.score = 100;
    this.mistakesCount = 0;
    this.hintsRemaining = 2;
    this.isCompleted = false;

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
    if (this.currentStation === 1) {
      if (key === '1' || key === 'Enter') this._handleEngageSRP();
      if (key === '2') this._handleBypassSRP();
    } else if (this.currentStation === 2) {
      if (key === '1' || key === 'Enter') this._handleOpenSec61();
      if (key === '2') this._handleWrongTranslocon();
    } else if (this.currentStation === 3) {
      if (key === '1' || key === 'Enter' || key === ' ') this._handleInspectBiP();
    } else if (this.currentStation === 4) {
      if (key === '1' || key.toLowerCase() === 'c') this._handleRouteDecision('cop2');
      if (key === '2' || key.toLowerCase() === 'e') this._handleRouteDecision('erad');
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
    this.currentStation = 1;
    this.station4Branch = 'evaluating_normal';
    this.bipScanCompleted = false;
    this.proteinState = {
      label: "Proteína Naciente",
      hasSignalPeptide: true,
      isFolded: false,
      isUbiquitinated: false,
      isDegraded: false,
      location: "cytosol"
    };

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
          "<p>Has utilizado todas las pistas de tráfico celular. Examina las características moleculares y la señalización de cada compartimento.</p>",
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
    if (this.currentStation === 1) {
      hintText = "El péptido señal N-terminal hidrófobo debe ser reconocido en el citosol por la <strong>Partícula de Reconocimiento de Señal (SRP)</strong> para detener la elongación y acoplar el ribosoma a la membrana del RER.";
    } else if (this.currentStation === 2) {
      hintText = "El canal proteico acuoso de membrana del RER que permite la translocación cotraduccional es el <strong>translocón Sec61</strong>, donde la peptidasa de señal escindirá la secuencia líder.";
    } else if (this.currentStation === 3) {
      hintText = "En el lumen del RER, la chaperona <strong>BiP (GRP78)</strong> supervisa el plegamiento e interactúa con zonas hidrófobas expuestas. Activa el escáner para evaluar la conformación de la proteína.";
    } else {
      if (this.station4Branch === 'evaluating_normal') {
        hintText = "La proteína presenta plegamiento nativo y correcto: debe ser empaquetada en vesículas recubiertas de <strong>COP II</strong> en los sitios de salida del RE (ERES) para viajar hacia la red cis-Golgi.";
      } else {
        hintText = "La proteína presenta defectos irreversibles de plegamiento: la célula activa la <strong>Vía ERAD</strong> (retrotranslocación citosólica, marcaje con poli-ubiquitina y degradación en el proteasoma 26S). El Golgi carece de chaperonas de repliegue.";
      }
    }

    if (window.app) {
      window.app.showModal(
        `💡 Pista de Tráfico Celular (${this.hintsRemaining} restantes)`,
        `<p>${hintText}</p>`,
        "Reanudar Misión"
      );
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="stage-card glass-panel lvl4-circuit-root">
        <!-- Transición Pedagógica: Caso de Laboratorio Independiente -->
        <div class="fictional-case-disclaimer" style="border-left-color: var(--accent-cyan); background: rgba(6, 182, 212, 0.06); margin-bottom: 1rem;">
          <span class="disclaimer-badge" style="background: rgba(6, 182, 212, 0.2); color: var(--accent-cyan); border-color: rgba(6, 182, 212, 0.4);">
            🔬 MODELO EXPERIMENTAL DE VÍA SECRETORA
          </span>
          <span>
            <strong>Transición de Caso:</strong> Concluida la síntesis del oligopéptido didáctico (Fases 1–3), esta fase 4 introduce un <strong>caso de laboratorio independiente para una proteína de la vía secretora</strong> que posee péptido señal N-terminal hidrófobo para su translocación al RER y maduración en el sistema de endomembranas.
          </span>
        </div>

        <!-- Briefing de la Misión de Tráfico -->
        <div class="stage-briefing">
          <div class="stage-briefing-title">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            SISTEMA DE TRÁFICO CELULAR Y BIFURCACIÓN DE CALIDAD ERAD
          </div>
          <p class="stage-briefing-text">
            Gestiona el control de rutas celulares para esta proteína secretora: coordina el direccionamiento cotraduccional con <strong>SRP</strong>, la inserción membranosa por <strong>Sec61</strong>, la supervisión de plegamiento con chaperonas <strong>BiP</strong> en el lumen y la bifurcación crítica hacia el transporte vesicular <strong>COP II</strong> o la vía <strong>ERAD</strong>.
          </p>
        </div>

        <!-- Barra de Progreso de Estaciones -->
        <div class="lvl4-station-stepper glass-panel">
          <div class="stepper-node ${this.currentStation >= 1 ? (this.currentStation === 1 ? 'node-active' : 'node-done') : ''}">
            <span class="stepper-idx">1</span>
            <span class="stepper-label">Citosol (SRP)</span>
          </div>
          <div class="stepper-line ${this.currentStation > 1 ? 'line-done' : ''}"></div>
          <div class="stepper-node ${this.currentStation >= 2 ? (this.currentStation === 2 ? 'node-active' : 'node-done') : ''}">
            <span class="stepper-idx">2</span>
            <span class="stepper-label">Poro Sec61</span>
          </div>
          <div class="stepper-line ${this.currentStation > 2 ? 'line-done' : ''}"></div>
          <div class="stepper-node ${this.currentStation >= 3 ? (this.currentStation === 3 ? 'node-active' : 'node-done') : ''}">
            <span class="stepper-idx">3</span>
            <span class="stepper-label">Chaperona BiP</span>
          </div>
          <div class="stepper-line ${this.currentStation > 3 ? 'line-done' : ''}"></div>
          <div class="stepper-node ${this.currentStation === 4 ? (this.isCompleted ? 'node-done' : 'node-active') : ''}">
            <span class="stepper-idx">4</span>
            <span class="stepper-label">Bifurcación ERAD/COP II</span>
          </div>
        </div>

        <!-- Tablero del Mapa Celular con Vías y Tránsito de la Proteína -->
        <div class="cellular-traffic-board glass-panel" id="cellularTrafficBoard">
          ${this._renderCellularMapVisual()}
        </div>

        <!-- Consola de Control de Compuertas y Conmutadores de Ruta -->
        <div class="traffic-actuator-console glass-panel">
          ${this._renderActuatorConsole()}
        </div>

        <!-- Feedback Bioquímico -->
        <div class="lvl4-feedback-box hidden" id="lvl4Feedback"></div>

        <!-- Acciones Inferiores -->
        <div class="gameplay-footer-actions" style="margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div style="font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-mono);">
            Errores de enrutamiento: <span style="color: ${this.mistakesCount > 0 ? '#f43f5e' : '#10b981'}; font-weight: 700;">${this.mistakesCount}</span>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline btn-sm" id="btnRestartLvl4" title="Reiniciar este nivel">
              🔄 Reiniciar nivel
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindContainerEvents();
  }

  /* ================== RENDER DEL MAPA CELULAR Y VÍAS ================== */
  _renderCellularMapVisual() {
    const stn = this.currentStation;

    return `
      <div class="map-topology-grid">
        <!-- SECTOR 1: CITOSOL Y SÍNTESIS RIBOSOMAL -->
        <div class="topology-sector sector-cytosol ${stn === 1 ? 'sector-highlight glow-pulse' : (stn > 1 ? 'sector-cleared' : '')}">
          <div class="sector-tag">COMPARTIMENTO 1: CITOSOL</div>
          <div class="sector-inner">
            <div class="ribosome-graphic-symbol">
              <span class="sector-icon">⚙️</span>
              <strong>Ribosoma Citosólico</strong>
              <small>Síntesis con Péptido Señal N-terminal</small>
            </div>
            ${stn === 1 ? `
              <div class="protein-cargo-token token-in-cytosol glow-pulse" id="activeProteinCargo">
                <span class="cargo-dot">🟢</span>
                <div class="cargo-meta">
                  <strong>Péptido en Síntesis</strong>
                  <span class="badge-signal-seq">Señal N-term (Hidrofóbica)</span>
                </div>
              </div>
            ` : '<div class="cleared-badge">✓ Señal Captada por SRP</div>'}
          </div>
        </div>

        <!-- CONDUCTO TRANSVERSAL 1-2 -->
        <div class="transit-tubule ${stn > 1 ? 'tubule-lit' : ''}">
          <span class="tubule-flow-indicator">⟶</span>
        </div>

        <!-- SECTOR 2: MEMBRANA DEL RER (PORO SEC61) -->
        <div class="topology-sector sector-membrane ${stn === 2 ? 'sector-highlight glow-pulse' : (stn > 2 ? 'sector-cleared' : '')}">
          <div class="sector-tag">COMPARTIMENTO 2: MEMBRANA RER</div>
          <div class="sector-inner">
            <div class="translocon-gate-symbol">
              <span class="sector-icon">🚪</span>
              <strong>Translocón Sec61</strong>
              <small>Poro Acuoso + Peptidasa de Señal</small>
            </div>
            ${stn === 2 ? `
              <div class="protein-cargo-token token-translocating glow-pulse" id="activeProteinCargo">
                <span class="cargo-dot">🔵</span>
                <div class="cargo-meta">
                  <strong>Translocación Cotraduccional</strong>
                  <span class="badge-translocating">Ingresando por Sec61...</span>
                </div>
              </div>
            ` : (stn > 2 ? '<div class="cleared-badge">✓ Poro Abierto / Señal Escindida</div>' : '<span class="sector-idle-text">En espera de SRP</span>')}
          </div>
        </div>

        <!-- CONDUCTO TRANSVERSAL 2-3 -->
        <div class="transit-tubule ${stn > 2 ? 'tubule-lit' : ''}">
          <span class="tubule-flow-indicator">⟶</span>
        </div>

        <!-- SECTOR 3: LUMEN DEL RER (CHAPERONA BiP) -->
        <div class="topology-sector sector-lumen ${stn === 3 ? 'sector-highlight glow-pulse' : (stn > 3 ? 'sector-cleared' : '')}">
          <div class="sector-tag">COMPARTIMENTO 3: LUMEN DEL RER</div>
          <div class="sector-inner">
            <div class="chaperone-scanner-symbol">
              <span class="sector-icon">🛡️</span>
              <strong>Chaperona BiP / PDI</strong>
              <small>Inspección de Plegamiento y Puentes S-S</small>
            </div>
            ${stn === 3 ? `
              <div class="protein-cargo-token token-in-lumen glow-pulse" id="activeProteinCargo">
                <span class="cargo-dot">🟡</span>
                <div class="cargo-meta">
                  <strong>Péptido en Lumen</strong>
                  <span class="badge-folding-eval">${this.bipScanCompleted ? 'BiP: Evaluación Lista' : 'Esperando Escáner BiP...'}</span>
                </div>
              </div>
            ` : (stn > 3 ? '<div class="cleared-badge">✓ Supervisión BiP Completada</div>' : '<span class="sector-idle-text">En espera de translocación</span>')}
          </div>
        </div>

        <!-- CONDUCTO BIFURCADO 3-4 -->
        <div class="transit-tubule ${stn > 3 ? 'tubule-lit' : ''}">
          <span class="tubule-flow-indicator">⤳</span>
        </div>

        <!-- SECTOR 4: BIFURCACIÓN DE CALIDAD (GOLGI vs ERAD) -->
        <div class="topology-sector sector-bifurcation ${stn === 4 ? 'sector-highlight' : ''}">
          <div class="sector-tag">COMPARTIMENTO 4: BIFURCACIÓN DE RUTAS</div>
          <div class="bifurcation-routes-container">
            <!-- RUTA SUPERIOR: COP II ⟶ CIS-GOLGI -->
            <div class="route-channel channel-cop2 ${this.station4Branch === 'evaluating_normal' ? 'channel-active glow-pulse' : (this.station4Branch === 'finished' ? 'channel-cleared' : '')}">
              <div class="channel-header">
                <span class="channel-status-dot">🟢</span>
                <strong>Vía Anterógrada (COP II ⟶ Golgi)</strong>
              </div>
              <p class="channel-desc">Sitios de salida ERES ⟶ Vesículas COP II ⟶ Red cis-Golgi (Proteína Nativa Normal).</p>
              ${this.station4Branch !== 'evaluating_normal' ? '<div class="route-passed-badge">✓ Lote Normal Exportado</div>' : ''}
            </div>

            <!-- RUTA INFERIOR: VÍA ERAD ⟶ PROTEASOMA 26S -->
            <div class="route-channel channel-erad ${this.station4Branch === 'evaluating_misfolded' ? 'channel-active glow-pulse' : (this.station4Branch === 'finished' ? 'channel-cleared' : '')}">
              <div class="channel-header">
                <span class="channel-status-dot">🔴</span>
                <strong>Vía de Calidad ERAD (Proteasoma 26S)</strong>
              </div>
              <p class="channel-desc">Retrotranslocación citosólica ⟶ Marcaje Poli-Ubiquitina ⟶ Degradación en Proteasoma 26S.</p>
              ${this.station4Branch === 'finished' ? '<div class="route-passed-badge">✓ Lote Anómalo Degradado</div>' : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ================== CONSOLA DE ACTUADORES DE RUTA ================== */
  _renderActuatorConsole() {
    if (this.currentStation === 1) {
      return `
        <div class="actuator-stage-panel">
          <div class="actuator-panel-header">
            <span class="panel-step-badge">PUNTO DE CONTROL 1: RECONOCIMIENTO CITOSÓLICO</span>
            <h4>Péptido señal N-terminal emergente</h4>
            <p>Determina la acción molecular inicial para esta proteína naciente:</p>
          </div>
          <div class="route-switches-grid">
            <button class="btn-route-switch switch-option" id="btnActuatorEngageSRP">
              <span class="switch-shortcut">1</span>
              <div class="switch-content">
                <strong>🔗 Acoplar Partícula de Reconocimiento de Señal (SRP)</strong>
                <small>Reconocer la secuencia señal, pausar la traducción y guiar al RER</small>
              </div>
            </button>
            <button class="btn-route-switch switch-option" id="btnActuatorBypassSRP">
              <span class="switch-shortcut">2</span>
              <div class="switch-content">
                <strong>🚫 Continuar Elongación Libre en el Citosol</strong>
                <small>Permitir síntesis completa en el citoplasma sin anclaje a membranas</small>
              </div>
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStation === 2) {
      return `
        <div class="actuator-stage-panel">
          <div class="actuator-panel-header">
            <span class="panel-step-badge">PUNTO DE CONTROL 2: TRANSLOCACIÓN MEMBRANOSA</span>
            <h4>Acoplamiento en la membrana del RER</h4>
            <p>Selecciona el complejo transmembrana para la translocación cotraduccional:</p>
          </div>
          <div class="route-switches-grid">
            <button class="btn-route-switch switch-option" id="btnActuatorOpenSec61">
              <span class="switch-shortcut">1</span>
              <div class="switch-content">
                <strong>🚪 Activar Translocón Sec61 y Peptidasa de Señal</strong>
                <small>Canal acuoso transmembrana para inserción cotraduccional y escisión líder</small>
              </div>
            </button>
            <button class="btn-route-switch switch-option" id="btnActuatorWrongTranslocon">
              <span class="switch-shortcut">2</span>
              <div class="switch-content">
                <strong>🔀 Desviar a Canal de Acuaporina o Poro Nuclear (NPC)</strong>
                <small>Canales de membrana inespecíficos para el retículo endoplásmico</small>
              </div>
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStation === 3) {
      return `
        <div class="actuator-stage-panel">
          <div class="actuator-panel-header">
            <span class="panel-step-badge">PUNTO DE CONTROL 3: SUPERVISIÓN DE PLEGAMIENTO</span>
            <h4>Ingreso de la cadena al lumen del RER</h4>
            <p>Acciona la maquinaria de chaperonas para supervisar su conformación:</p>
          </div>
          <div class="route-switches-grid" style="grid-template-columns: 1fr;">
            <button class="btn-route-switch switch-option" id="btnActuatorInspectBiP">
              <span class="switch-shortcut">ESPACIO / ENTER</span>
              <div class="switch-content">
                <strong>🛡️ Desplegar Chaperona Luminal BiP (GRP78) y PDI</strong>
                <small>Supervisa conformación globular, puentes disulfuro y emite dictamen de calidad</small>
              </div>
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStation === 4) {
      if (this.station4Branch === 'evaluating_normal') {
        return `
          <div class="actuator-stage-panel bifurcation-panel">
            <div class="actuator-panel-header">
              <span class="panel-step-badge" style="color: #10b981;">BIFURCACIÓN 1/2: EVALUACIÓN DE PROTEÍNA NATIVA</span>
              <h4 style="color: #a7f3d0;">Lote 1: Conformación globular correcta y puentes disulfuro estables</h4>
              <p>Determina la compuerta de transporte vesicular adecuada:</p>
            </div>
            <div class="route-switches-grid">
              <button class="btn-route-switch switch-option" id="btnRouteCop2">
                <span class="switch-shortcut">1</span>
                <div class="switch-content">
                  <strong>📦 Empaquetar en Vesículas COP II ⟶ Red cis-Golgi</strong>
                  <small>Transporte anterógrado vesicular hacia Golgi para maduración y secreción</small>
                </div>
              </button>
              <button class="btn-route-switch switch-option" id="btnRouteEradNormal">
                <span class="switch-shortcut">2</span>
                <div class="switch-content">
                  <strong>⚠️ Enviar a Vía ERAD (Retrotranslocar y Degradar en Proteasoma)</strong>
                  <small>Destruir la proteína en el citosol con ubiquitina y proteasoma 26S</small>
                </div>
              </button>
            </div>
          </div>
        `;
      }

      if (this.station4Branch === 'evaluating_misfolded') {
        return `
          <div class="actuator-stage-panel bifurcation-panel" style="border-color: rgba(244, 63, 94, 0.4);">
            <div class="actuator-panel-header">
              <span class="panel-step-badge" style="color: #f43f5e;">BIFURCACIÓN 2/2: EVALUACIÓN DE PROTEÍNA ANÓMALA</span>
              <h4 style="color: #fecdd3;">Lote 2: Mal plegamiento irreversible y residuos hidrófobos expuestos</h4>
              <p>Determina la compuerta de gestión celular adecuada:</p>
            </div>
            <div class="route-switches-grid">
              <button class="btn-route-switch switch-option" id="btnRouteEradMisfolded">
                <span class="switch-shortcut">1</span>
                <div class="switch-content">
                  <strong>🔥 Activar Vía ERAD ⟶ Ubiquitinación y Proteasoma 26S</strong>
                  <small>Retrotranslocar al citosol, marcar con poli-ubiquitina y degradar enzimáticamente</small>
                </div>
              </button>
              <button class="btn-route-switch switch-option" id="btnRouteGolgiMisfolded">
                <span class="switch-shortcut">2</span>
                <div class="switch-content">
                  <strong>🔀 Desviar al Aparato de Golgi para Continuar Secreción</strong>
                  <small>Enviar la proteína anómala hacia la red cis-Golgi en vesículas de secreción</small>
                </div>
              </button>
            </div>
          </div>
        `;
      }

      if (this.station4Branch === 'finished') {
        return `
          <div class="stage-continue-panel" style="text-align: center; margin-top: 1rem;">
            <button class="btn btn-primary btn-large glow-effect" id="btnFinishLevel4Traffic">
              🏆 Concluir Misión de Tráfico Celular y Guardar Progreso (${this.score} pts)
            </button>
          </div>
        `;
      }
    }

    return '';
  }

  /* ================== ACCIONES Y DECISIONES DE ENRUTAMIENTO ================== */

  // Estación 1: SRP
  _handleEngageSRP() {
    if (this.currentStation !== 1) return;

    if (window.audioMgr) window.audioMgr.playAssemble();
    this.currentStation = 2;
    this.proteinState.location = 'translocon';

    this._showFeedbackSuccess(
      "✓ Reconocimiento por SRP Exitoso",
      "La Partícula de Reconocimiento de Señal (SRP) reconoció los residuos hidrófobos N-terminales en el ribosoma, pausó la elongación y ancló el complejo a su receptor en la membrana del RER."
    );
    this.render();
  }

  _handleBypassSRP() {
    if (this.currentStation !== 1) return;

    if (window.audioMgr) window.audioMgr.playMistake();
    this._deductPoints(10);
    this._showFeedbackError(
      "✕ Desvío Citosólico Erróneo (-10 pts)",
      "La proteína posee una secuencia señal de secreción. Sin el acoplamiento de SRP, la elongación continúa en el citosol y la proteína se plegaría o precipitaría en el compartimento incorrecto sin ingresar al sistema de endomembranas."
    );
  }

  // Estación 2: Sec61
  _handleOpenSec61() {
    if (this.currentStation !== 2) return;

    if (window.audioMgr) window.audioMgr.playAssemble();
    this.currentStation = 3;
    this.proteinState.hasSignalPeptide = false;
    this.proteinState.location = 'lumen';

    this._showFeedbackSuccess(
      "✓ Poro Translocón Sec61 Activado",
      "El ribosoma se acopló al translocón Sec61; la cadena naciente fue introducida al lumen del RER mientras la peptidasa de señal escindió la secuencia líder hidrofóbica."
    );
    this.render();
  }

  _handleWrongTranslocon() {
    if (this.currentStation !== 2) return;

    if (window.audioMgr) window.audioMgr.playMistake();
    this._deductPoints(10);
    this._showFeedbackError(
      "✕ Canal de Membrana Incompatible (-10 pts)",
      "El translocón específico para la translocación cotraduccional en la membrana del RER es el complejo hetero-trimérico Sec61. Otros canales celulares (como acuaporinas o poros nucleares) no realizan esta función."
    );
  }

  // Estación 3: Chaperona BiP
  _handleInspectBiP() {
    if (this.currentStation !== 3) return;

    if (window.audioMgr) window.audioMgr.playCorrect();
    this.bipScanCompleted = true;
    this.currentStation = 4;
    this.station4Branch = 'evaluating_normal';

    this._showFeedbackSuccess(
      "✓ Inspección con Chaperona BiP Completada",
      "La chaperona BiP (GRP78, familia Hsp70 del RE) supervisó el plegamiento luminal. La máquina habilita la bifurcación interactiva para evaluar el direccionamiento de calidad celular."
    );
    this.render();
  }

  // Estación 4: Decisiones en la Bifurcación
  _handleRouteDecision(decision) {
    if (this.currentStation !== 4) return;

    // Evaluando lote normal
    if (this.station4Branch === 'evaluating_normal') {
      if (decision === 'cop2') {
        if (window.audioMgr) window.audioMgr.playSuccess();
        this.station4Branch = 'evaluating_misfolded';
        this._showFeedbackSuccess(
          "✓ Lote Normal: Tráfico Anterógrado COP II Activado",
          "La proteína con plegamiento nativo correcto se concentró en los sitios de salida del RE (ERES), brotó en vesículas con cubierta de coatómero COP II y fue dirigida a la red cis-Golgi. Ahora evalúa el lote de proteína anómala."
        );
        this.render();
      } else {
        // Envió erróneamente proteína normal a ERAD
        if (window.audioMgr) window.audioMgr.playMistake();
        this._deductPoints(10);
        this._showFeedbackError(
          "✕ Desvío Erróneo a ERAD (-10 pts)",
          "La proteína posee una conformación globular nativa estable y correcta. Destruirla en el proteasoma 26S constituiría un desperdicio metabólico injustificado; su destino fisiológico es el empaquetamiento en vesículas COP II hacia el Golgi."
        );
      }
      return;
    }

    // Evaluando lote anómalo / mal plegado
    if (this.station4Branch === 'evaluating_misfolded') {
      if (decision === 'erad') {
        if (window.audioMgr) window.audioMgr.playSuccess();
        this.station4Branch = 'finished';
        this.isCompleted = true;

        this._showFeedbackSuccess(
          "✓ Vía ERAD Ejecutada con Rigor de Calidad Celular",
          "La proteína con mal plegamiento irreversible fue retrotranslocada a través de la membrana al citosol, marcada covalentemente con una cadena de poli-ubiquitina (K48) y degradada en péptidos reutilizables por el proteasoma 26S."
        );
        this.render();
      } else {
        // Envió erróneamente proteína mal plegada al Golgi
        if (window.audioMgr) window.audioMgr.playMistake();
        this._deductPoints(10);
        this._showFeedbackError(
          "✕ Fallo de Control de Calidad: Envío Anómalo al Golgi (-10 pts)",
          "Has intentado enviar la proteína con mal plegamiento al Aparato de Golgi. El Golgi carece de la maquinaria de chaperonas de repliegue del RE (como BiP y calnexina). Enviar proteínas no conformes elude el control de calidad celular y genera riesgo de acumulación anómala."
        );
      }
    }
  }

  // Método de compatibilidad para pruebas automatizadas (test_phase_b_full.js)
  _evaluateCargoRoute(itemKey, targetId) {
    if (itemKey === 'srp_particle') {
      this._handleEngageSRP();
    } else if (itemKey === 'sec61_complex') {
      this._handleOpenSec61();
    } else if (itemKey === 'bip_chaperone') {
      this._handleInspectBiP();
    } else if (itemKey === 'cop2_vesicle') {
      this._handleRouteDecision('cop2');
    } else if (itemKey === 'erad_proteasome') {
      this._handleRouteDecision('erad');
    }
  }

  _showLevelVictoryModal() {
    this.isCompleted = true;
    if (window.audioMgr) window.audioMgr.playSuccess();

    const summaryHtml = `
      <div style="text-align: center; margin-bottom: 0.85rem;">
        <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">📦</div>
        <h4 style="font-size: 1.18rem; color: var(--accent-cyan); margin: 0 0 0.2rem;">¡TRÁFICO CELULAR Y CONTROL ERAD COMPLETADOS!</h4>
        <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">
          Has guiado con éxito la logística molecular a través del sistema de endomembranas y la supervisión de calidad.
        </p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid var(--border-glass); border-radius: 8px; padding: 0.75rem 0.95rem; margin-bottom: 0.85rem; font-size: 0.82rem; line-height: 1.45;">
        <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.35rem; text-transform: uppercase; font-size: 0.74rem; letter-spacing: 0.05em;">
          Principios Fisiológicos Dominados:
        </div>
        <ul style="margin: 0; padding-left: 1.15rem; color: #cbd5e1;">
          <li><strong>Direccionamiento Cotraduccional:</strong> Reconocimiento de señal hidrófoba por la ribonucleoproteína SRP.</li>
          <li><strong>Translocación en Membrana:</strong> Inserción por el poro Sec61 y corte por la peptidasa de señal.</li>
          <li><strong>Supervisión con BiP:</strong> Control conformacional en el lumen del retículo endoplásmico rugoso.</li>
          <li><strong>Tráfico Anterógrado COP II:</strong> Concentración de proteínas nativas sanas hacia la red cis-Golgi.</li>
          <li><strong>Vía ERAD y Proteasoma 26S:</strong> Retrotranslocación, ubiquitinación y degradación selectiva de proteínas con mal plegamiento irreversible sin desvío inútil al Golgi.</li>
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 0.65rem 0.95rem; font-family: var(--font-mono); font-size: 0.9rem;">
        <span>Puntuación de Logística Celular:</span>
        <span style="color: var(--accent-cyan); font-weight: 800; font-size: 1.15rem;">${this.score} / 100 pts</span>
      </div>
    `;

    if (window.app) {
      window.app.showModal(
        "Fase 04 — Modificación y Tráfico Celular",
        summaryHtml,
        "Continuar al Panel de Misiones",
        () => {
          if (typeof this.onComplete === 'function') {
            this.onComplete(4, this.score);
          }
        }
      );
    }
  }

  _showFeedbackSuccess(title, text) {
    const feedbackBox = this.container.querySelector('#lvl4Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl4-feedback-box success-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _showFeedbackError(title, text) {
    const feedbackBox = this.container.querySelector('#lvl4Feedback');
    if (feedbackBox) {
      feedbackBox.className = 'lvl4-feedback-box error-callout';
      feedbackBox.innerHTML = `<strong>${title}</strong><p style="margin: 0.25rem 0 0;">${text}</p>`;
      feedbackBox.classList.remove('hidden');
    }
  }

  _bindContainerEvents() {
    if (!this.container) return;

    // Botón reiniciar nivel
    const btnRestart = this.container.querySelector('#btnRestartLvl4');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.restart());
    }

    // Estación 1: Botones de compuerta SRP
    const btnEngageSRP = this.container.querySelector('#btnActuatorEngageSRP');
    if (btnEngageSRP) {
      btnEngageSRP.addEventListener('click', () => this._handleEngageSRP());
    }
    const btnBypassSRP = this.container.querySelector('#btnActuatorBypassSRP');
    if (btnBypassSRP) {
      btnBypassSRP.addEventListener('click', () => this._handleBypassSRP());
    }

    // Estación 2: Botones Sec61
    const btnOpenSec61 = this.container.querySelector('#btnActuatorOpenSec61');
    if (btnOpenSec61) {
      btnOpenSec61.addEventListener('click', () => this._handleOpenSec61());
    }
    const btnWrongTranslocon = this.container.querySelector('#btnActuatorWrongTranslocon');
    if (btnWrongTranslocon) {
      btnWrongTranslocon.addEventListener('click', () => this._handleWrongTranslocon());
    }

    // Estación 3: Botón escáner BiP
    const btnInspectBiP = this.container.querySelector('#btnActuatorInspectBiP');
    if (btnInspectBiP) {
      btnInspectBiP.addEventListener('click', () => this._handleInspectBiP());
    }

    // Estación 4: Botones de Bifurcación
    const btnRouteCop2 = this.container.querySelector('#btnRouteCop2');
    if (btnRouteCop2) {
      btnRouteCop2.addEventListener('click', () => this._handleRouteDecision('cop2'));
    }
    const btnRouteEradNormal = this.container.querySelector('#btnRouteEradNormal');
    if (btnRouteEradNormal) {
      btnRouteEradNormal.addEventListener('click', () => this._handleRouteDecision('erad'));
    }
    const btnRouteEradMisfolded = this.container.querySelector('#btnRouteEradMisfolded');
    if (btnRouteEradMisfolded) {
      btnRouteEradMisfolded.addEventListener('click', () => this._handleRouteDecision('erad'));
    }
    const btnRouteGolgiMisfolded = this.container.querySelector('#btnRouteGolgiMisfolded');
    if (btnRouteGolgiMisfolded) {
      btnRouteGolgiMisfolded.addEventListener('click', () => this._handleRouteDecision('cop2'));
    }

    // Botón Concluir Misión Level 4
    const btnFinish = this.container.querySelector('#btnFinishLevel4Traffic');
    if (btnFinish) {
      btnFinish.addEventListener('click', () => {
        this._showLevelVictoryModal();
      });
    }
  }
}

// Exportar globalmente
window.Level4Controller = Level4Controller;
