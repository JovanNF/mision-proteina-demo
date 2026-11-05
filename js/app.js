/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Main Application Controller (App Orchestrator)
 */

class AppController {
  constructor() {
    this.currentView = 'screenHome';
    this.activeLevelInstance = null;
    this.modalCallback = null;
    this._checkDevMode();

    this.init();
  }

  _checkDevMode() {
    // El modo de pruebas se activa automáticamente ÚNICAMENTE en entorno local
    const isLocal = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';
    this.isDevMode = isLocal;
  }

  init() {
    this._bindElements();
    this._bindEvents();
    this._renderLevelGrid();
    this._updateHudStats();

    // Suscribirse a cambios del estado
    window.gameState.subscribe(() => {
      this._updateHudStats();
      this._renderLevelGrid();
    });

    // Actualizar icono de sonido inicial
    this._updateAudioIcon();

    // Soporte para deep-linking de nivel (ej. ?level=1)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const lvl = parseInt(urlParams.get('level'), 10);
      if (lvl >= 1 && lvl <= 5) {
        // En producción solo se permite si el nivel está desbloqueado
        if (this.isDevMode || window.gameState.isUnlocked(lvl)) {
          setTimeout(() => this.startLevel(lvl), 50);
        }
      }
    } catch (e) {
      console.warn('URL params error:', e);
    }
  }

  _bindElements() {
    this.screens = {
      home: document.getElementById('screenHome'),
      selector: document.getElementById('screenLevelSelector'),
      gameplay: document.getElementById('screenGameplay')
    };

    // Botones Header
    this.btnAudioToggle = document.getElementById('btnAudioToggle');
    this.btnResetProgress = document.getElementById('btnResetProgress');

    // Botones Home
    this.btnStartGame = document.getElementById('btnStartGame');
    this.btnOpenLevelSelector = document.getElementById('btnOpenLevelSelector');

    // Gameplay Header
    this.btnHintTrigger = document.getElementById('btnHintTrigger');
    this.btnExitToSelector = document.getElementById('btnExitToSelector');

    // Modal
    this.modal = document.getElementById('gameModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    this.btnModalPrimary = document.getElementById('btnModalPrimary');
    this.btnModalClose = document.getElementById('btnModalClose');

    // Contenedores
    this.levelGrid = document.getElementById('levelCardsGrid');
    this.simulationStage = document.getElementById('simulationStage');
  }

  _bindEvents() {
    // Audio
    this.btnAudioToggle.addEventListener('click', () => {
      const isMuted = window.audioMgr.toggleMute();
      this._updateAudioIcon();
      if (!isMuted) window.audioMgr.playClick();
    });

    // Reset progreso
    this.btnResetProgress.addEventListener('click', () => {
      this.showModal(
        "⚠️ Reiniciar Simulación",
        "<p>¿Deseas reiniciar todo el progreso y las puntuaciones almacenadas en el laboratorio?</p>",
        "Sí, reiniciar",
        () => {
          if (this.activeLevelInstance) {
            this.activeLevelInstance.unmount();
            this.activeLevelInstance = null;
          }
          window.gameState.resetProgress();
          this.switchView('screenHome');
        }
      );
    });

    // Iniciar desde Home
    this.btnStartGame.addEventListener('click', () => {
      window.audioMgr.playClick();
      this.startLevel(1);
    });

    this.btnOpenLevelSelector.addEventListener('click', () => {
      window.audioMgr.playClick();
      this.switchView('screenLevelSelector');
    });

    // Volver a home desde el selector
    const btnBackHome = document.querySelector('.btn-back-home');
    if (btnBackHome) {
      btnBackHome.addEventListener('click', () => {
        window.audioMgr.playClick();
        this.switchView('screenHome');
      });
    }

    // Salir del gameplay
    this.btnExitToSelector.addEventListener('click', () => {
      window.audioMgr.playClick();
      this.showModal(
        "Pausar Misión",
        "<p>¿Deseas pausar esta fase y regresar al panel de misiones?</p>",
        "Regresar al panel",
        () => {
          if (this.activeLevelInstance) {
            this.activeLevelInstance.unmount();
            this.activeLevelInstance = null;
          }
          this.switchView('screenLevelSelector');
        }
      );
    });

    // Pista
    this.btnHintTrigger.addEventListener('click', () => {
      if (this.activeLevelInstance && typeof this.activeLevelInstance.giveHint === 'function') {
        this.activeLevelInstance.giveHint();
      }
    });

    // Modal
    this.btnModalClose.addEventListener('click', () => this.closeModal());
    this.btnModalPrimary.addEventListener('click', () => {
      const cb = this.modalCallback;
      this.closeModal();
      if (cb) cb();
    });

    // Tecla Escape para cerrar modales
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isModalOpen()) {
        e.preventDefault();
        this.closeModal();
      }
    });
  }

  switchView(viewId) {
    // Si salimos del gameplay a otra pantalla, desmontar nivel activo limpiando listeners
    if (viewId !== 'screenGameplay' && this.activeLevelInstance) {
      this.activeLevelInstance.unmount();
      this.activeLevelInstance = null;
    }
    Object.keys(this.screens).forEach(key => {
      const el = this.screens[key];
      if (el) {
        if (el.id === viewId) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
    this.currentView = viewId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  _updateAudioIcon() {
    const isMuted = window.audioMgr.isMuted;
    const soundOn = this.btnAudioToggle.querySelector('.icon-sound-on');
    const soundOff = this.btnAudioToggle.querySelector('.icon-sound-off');
    if (soundOn && soundOff) {
      if (isMuted) {
        soundOn.classList.add('hidden');
        soundOff.classList.remove('hidden');
      } else {
        soundOn.classList.remove('hidden');
        soundOff.classList.add('hidden');
      }
    }
  }

  _updateHudStats() {
    const totalScoreEl = document.getElementById('hudTotalScore');
    const currentMissionEl = document.getElementById('hudCurrentMission');

    if (totalScoreEl) {
      totalScoreEl.innerHTML = `${window.gameState.getTotalScore()} <small>/ 500</small>`;
    }

    if (currentMissionEl) {
      const completedCount = window.gameState.state.completedLevels.length;
      currentMissionEl.textContent = `${Math.min(5, completedCount + 1)} / 5`;
    }
  }

  _renderLevelGrid() {
    if (!this.levelGrid) return;
    this.levelGrid.innerHTML = '';

    // MODO DE PRUEBAS (Solo en entorno local: localhost / 127.0.0.1 / file:)
    if (this.isDevMode) {
      const devBar = document.createElement('div');
      devBar.className = 'dev-test-bar glass-panel';
      devBar.innerHTML = `
        <div class="dev-bar-header">
          <div class="dev-bar-tag"><span class="dev-dot"></span> 🧪 MODO DE PRUEBAS ACTIVO (ENTORNO LOCAL)</div>
          <div class="dev-bar-help">Acceso directo a cualquier nivel sin alterar el progreso guardado</div>
        </div>
        <div class="dev-bar-actions">
          <button class="btn btn-outline btn-xs dev-lvl-btn" data-lvl="1">Fase 01 (Transcripción)</button>
          <button class="btn btn-outline btn-xs dev-lvl-btn" data-lvl="2">Fase 02 (Splicing)</button>
          <button class="btn btn-outline btn-xs dev-lvl-btn" data-lvl="3">Fase 03 (Traducción)</button>
          <button class="btn btn-outline btn-xs dev-lvl-btn" data-lvl="4">Fase 04 (Tráfico)</button>
          <button class="btn btn-outline btn-xs dev-lvl-btn" data-lvl="5">Fase 05 (Diagnóstico)</button>
          <button class="btn btn-warning btn-xs dev-cert-btn">🎓 Certificado</button>
        </div>
      `;
      devBar.querySelectorAll('.dev-lvl-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const target = parseInt(btn.dataset.lvl, 10);
          if (window.audioMgr) window.audioMgr.playClick();
          this.startLevel(target);
        });
      });
      const bCert = devBar.querySelector('.dev-cert-btn');
      if (bCert) {
        bCert.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.audioMgr) window.audioMgr.playSuccess();
          this.showFinalCertificateModal();
        });
      }
      this.levelGrid.appendChild(devBar);
    }

    const allCompleted = [1, 2, 3, 4, 5].every(id => window.gameState.isCompleted(id));

    // Si todas las misiones están completadas, mostrar banner de certificado
    if (allCompleted) {
      const banner = document.createElement('div');
      banner.className = 'final-cert-banner glass-panel';
      banner.innerHTML = `
        <div class="cert-banner-content">
          <div class="cert-banner-icon">🎓</div>
          <div class="cert-banner-text">
            <h4>¡PROGRAMA INTEGRAL DE BIOLOGÍA MOLECULAR COMPLETADO!</h4>
            <p>Has superado las 5 fases del dogma central y resuelto el caso genético 042-B. Puntaje: <strong>${window.gameState.getTotalScore()} / 500 pts</strong></p>
          </div>
        </div>
        <button class="btn btn-primary glow-effect btn-sm" id="btnViewCertBanner">
          Ver Certificado de finalización — Misión Proteína
        </button>
      `;
      const btnCert = banner.querySelector('#btnViewCertBanner');
      if (btnCert) {
        btnCert.addEventListener('click', () => {
          if (window.audioMgr) window.audioMgr.playSuccess();
          this.showFinalCertificateModal();
        });
      }
      this.levelGrid.appendChild(banner);
    }

    window.GAME_LEVELS.forEach(lvl => {
      const isUnlocked = this.isDevMode || window.gameState.isUnlocked(lvl.id);
      const isCompleted = window.gameState.isCompleted(lvl.id);
      const currentScore = window.gameState.getLevelScore(lvl.id);

      const card = document.createElement('div');
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      let statusBadgeHtml = '';
      if (isCompleted) {
        statusBadgeHtml = `<span class="level-status-tag status-ready">✓ COMPLETADA (${currentScore} pts)</span>`;
      } else if (isUnlocked) {
        statusBadgeHtml = this.isDevMode && !window.gameState.isUnlocked(lvl.id)
          ? `<span class="level-status-tag status-ready" style="border-color: #f59e0b; color: #fcd34d;">🧪 DESBLOQUEO DEV</span>`
          : `<span class="level-status-tag status-ready">● MISIÓN DISPONIBLE</span>`;
      } else {
        statusBadgeHtml = `<span class="level-status-tag status-locked">🔒 BLOQUEADA (Fase 0${lvl.id - 1})</span>`;
      }

      card.innerHTML = `
        <div class="level-card-top">
          <span class="level-number-tag">FASE 0${lvl.id}</span>
          ${statusBadgeHtml}
        </div>

        <div>
          <h3 class="level-card-title">${lvl.shortTitle}</h3>
          <p class="level-card-desc">${lvl.description}</p>
        </div>

        <div class="level-card-bottom">
          <div class="level-score-preview">
            ${isUnlocked 
              ? `Puntuación: <span>${currentScore} / ${lvl.maxScore} pts</span>` 
              : `<span style="color: var(--text-muted); font-size: 0.8rem;">Supera la fase anterior</span>`}
          </div>
          <button class="btn ${isUnlocked ? 'btn-primary' : 'btn-outline'} btn-sm btn-play-level" ${isUnlocked ? '' : 'disabled'}>
            ${isCompleted ? 'Repetir Fase' : (isUnlocked ? 'Iniciar Fase' : 'Bloqueada')}
          </button>
        </div>
      `;

      const btn = card.querySelector('.btn-play-level');
      if (btn && isUnlocked) {
        btn.addEventListener('click', () => {
          window.audioMgr.playClick();
          this.startLevel(lvl.id);
        });
      }

      this.levelGrid.appendChild(card);
    });
  }

  startLevel(levelId) {
    const lvl = window.GAME_LEVELS.find(l => l.id === levelId);
    if (!lvl) return;

    // Desmontar nivel anterior si existe
    if (this.activeLevelInstance) {
      this.activeLevelInstance.unmount();
      this.activeLevelInstance = null;
    }

    // Actualizar encabezado del gameplay
    const gpBadge = document.getElementById('gpLevelBadge');
    const gpTitle = document.getElementById('gpLevelTitle');
    const gpScore = document.getElementById('gpLevelScore');

    if (gpBadge) gpBadge.textContent = `NIVEL ${lvl.id}`;
    if (gpTitle) gpTitle.textContent = lvl.title;
    if (gpScore) gpScore.textContent = '100';

    this.switchView('screenGameplay');

    const onComplete = (completedId, score) => {
      this._handleLevelCompleted(completedId, score);
    };

    const onExit = () => {
      this.switchView('screenLevelSelector');
    };

    if (levelId === 1 && typeof window.Level1Controller === 'function') {
      this.activeLevelInstance = new window.Level1Controller(lvl, onComplete, onExit);
    } else if (levelId === 2 && typeof window.Level2Controller === 'function') {
      this.activeLevelInstance = new window.Level2Controller(lvl, onComplete, onExit);
    } else if (levelId === 3 && typeof window.Level3Controller === 'function') {
      this.activeLevelInstance = new window.Level3Controller(lvl, onComplete, onExit);
    } else if (levelId === 4 && typeof window.Level4Controller === 'function') {
      this.activeLevelInstance = new window.Level4Controller(lvl, onComplete, onExit);
    } else if (levelId === 5 && typeof window.Level5Controller === 'function') {
      this.activeLevelInstance = new window.Level5Controller(lvl, onComplete, onExit);
    }

    if (this.activeLevelInstance) {
      this.activeLevelInstance.mount(this.simulationStage);
    }
  }

  _handleLevelCompleted(levelId, score) {
    window.gameState.recordLevelCompletion(levelId, score);
    
    // Si completó los 5 niveles, mostrar certificado
    const allCompleted = [1, 2, 3, 4, 5].every(id => window.gameState.isCompleted(id));
    if (allCompleted) {
      this.showFinalCertificateModal();
    } else {
      this.switchView('screenLevelSelector');
    }
  }

  showFinalCertificateModal() {
    if (window.audioMgr) window.audioMgr.playSuccess();

    const totalScore = window.gameState.getTotalScore();
    const scores = window.gameState.state.scores;

    const certHtml = `
      <div class="medical-cert-wrapper">
        <div class="cert-outer-frame">
          <div class="cert-header-block">
            <div class="cert-republic-seal">🧬</div>
            <span class="cert-dept-tag">MATERIA: BIOQUÍMICA · BIOLOGÍA MOLECULAR Y DOGMA CENTRAL</span>
            <h3 class="cert-title">CERTIFICADO DE FINALIZACIÓN — MISIÓN PROTEÍNA</h3>
            <p class="cert-subtitle">Certificado de finalización — Misión Proteína · Bioquímica</p>
          </div>

          <div class="cert-body-block">
            <p class="cert-conferred-text">
              Por haber completado con excelencia científica las cinco fases cardinales del flujo de la información genética celular y la resolución pericial del <strong>Caso Didáctico 042-B</strong> en el videojuego educativo <em>Misión Proteína: Código de Vida</em>, demostrando dominio de los fundamentos de <strong>Bioquímica</strong>.
            </p>

            <!-- Desglose de puntuaciones por fase -->
            <div class="cert-score-breakdown">
              <table class="cert-table">
                <thead>
                  <tr>
                    <th>Fase del Dogma Central</th>
                    <th>Mecanismo Clave</th>
                    <th style="text-align: right;">Puntuación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>01. Transcripción</strong></td>
                    <td>ARN Polimerasa II (3'→5' molde, 5'→3' síntesis)</td>
                    <td class="score-col">${scores[1] || 0} / 100</td>
                  </tr>
                  <tr>
                    <td><strong>02. Maduración y Splicing</strong></td>
                    <td>Capping m7G, 2 Transesterificaciones snRNP y Poli-A</td>
                    <td class="score-col">${scores[2] || 0} / 100</td>
                  </tr>
                  <tr>
                    <td><strong>03. Traducción Ribosomal</strong></td>
                    <td>Ribosoma 80S, Anticodones 3'→5' y Factor eRF1</td>
                    <td class="score-col">${scores[3] || 0} / 100</td>
                  </tr>
                  <tr>
                    <td><strong>04. Tráfico y Control ERAD</strong></td>
                    <td>SRP, Poro Sec61, Chaperona BiP y Proteasoma 26S</td>
                    <td class="score-col">${scores[4] || 0} / 100</td>
                  </tr>
                  <tr>
                    <td><strong>05. Diagnóstico Molecular</strong></td>
                    <td>Transversión en Codón 2, Mutación Nonsense y NMD no determinable con datos disponibles</td>
                    <td class="score-col">${scores[5] || 0} / 100</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="cert-total-row">
                    <td colspan="2"><strong>PUNTAJE GLOBAL OBTENIDO:</strong></td>
                    <td class="score-col score-total"><strong>${totalScore} / 500</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="cert-signature-row">
              <div class="cert-sig-box">
                <div class="sig-line"></div>
                <span class="sig-title">Misión Proteína — Simulador educativo</span>
              </div>
              <div class="cert-seal-badge">
                <div class="seal-circle">
                  <span>LOGRO</span>
                  <strong>100%</strong>
                  <span>COMPLETO</span>
                </div>
              </div>
              <div class="cert-sig-box">
                <div class="sig-line"></div>
                <span class="sig-title">Laboratorio de Biología Molecular</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.showModal(
      "🎓 Certificado de finalización — Misión Proteína",
      certHtml,
      "Volver al Panel de Misiones",
      () => {
        this.switchView('screenLevelSelector');
      }
    );
  }

  showLevelPreviewModal(lvl) {
    const content = `
      <div style="margin-bottom: 1rem;">
        <div style="font-family: var(--font-mono); font-size: 0.72rem; color: #f59e0b; margin-bottom: 0.35rem;">
          ${lvl.statusBadge} · PRÓXIMAMENTE
        </div>
        <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 0.5rem;">${lvl.title}</h4>
        <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5;">${lvl.description}</p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-glass); border-radius: 8px; padding: 0.85rem; font-size: 0.85rem; margin-bottom: 1rem;">
        <div style="color: var(--accent-cyan); font-weight: 600; margin-bottom: 0.25rem;">Mecanismo Celular:</div>
        <div style="color: var(--text-muted); font-size: 0.82rem; line-height: 1.45;">${lvl.scientificBrief.mechanism}</div>
      </div>

      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 0.75rem 0.85rem; font-size: 0.82rem; color: #fcd34d; line-height: 1.4;">
        ℹ️ <strong>Nivel en desarrollo:</strong> Esta fase corresponde a la versión completa del videojuego. En esta demostración interactiva está disponible la <strong>Fase 01 (Transcripción)</strong>.
      </div>
    `;

    this.showModal(`Fase 0${lvl.id}: Próximamente`, content, "Comprendido");
  }

  showModal(title, contentHtml, btnText = "Aceptar", onAction = null) {
    this.modalTitle.textContent = title;
    this.modalBody.innerHTML = contentHtml;
    this.btnModalPrimary.textContent = btnText;
    this.modalCallback = onAction;

    this.modal.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
    this.modalCallback = null;
  }

  isModalOpen() {
    return this.modal && !this.modal.classList.contains('hidden');
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
