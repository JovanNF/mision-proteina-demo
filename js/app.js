/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Main Application Controller (App Orchestrator)
 */

class AppController {
  constructor() {
    this.currentView = 'screenHome';
    this.activeLevelInstance = null;
    this.modalCallback = null;

    this.init();
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
      if (lvl >= 1 && lvl <= 5 && window.gameState.isUnlocked(lvl)) {
        setTimeout(() => this.startLevel(lvl), 50);
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
  }

  switchView(viewId) {
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

    window.GAME_LEVELS.forEach(lvl => {
      const isLevel1 = lvl.id === 1;
      const isCompleted = window.gameState.isCompleted(lvl.id);
      const currentScore = window.gameState.getLevelScore(lvl.id);

      const card = document.createElement('div');
      card.className = `level-card ${isLevel1 ? 'unlocked' : 'locked'}`;

      let statusBadgeHtml = '';
      if (isLevel1) {
        statusBadgeHtml = isCompleted
          ? `<span class="level-status-tag status-ready">✓ COMPLETADA</span>`
          : `<span class="level-status-tag status-ready">● DEMO JUGABLE</span>`;
      } else {
        statusBadgeHtml = `<span class="level-status-tag status-locked">🔒 PRÓXIMAMENTE</span>`;
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
            ${isLevel1 ? `Puntuación: <span>${currentScore} / ${lvl.maxScore} pts</span>` : `<span style="color: var(--text-muted); font-size: 0.8rem;">Versión completa</span>`}
          </div>
          <button class="btn ${isLevel1 ? 'btn-primary' : 'btn-outline'} btn-sm btn-play-level">
            ${isLevel1 ? (isCompleted ? 'Repetir Demo' : 'Iniciar Demo') : 'Ver detalles'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.btn-play-level');
      btn.addEventListener('click', () => {
        window.audioMgr.playClick();
        if (isLevel1) {
          this.startLevel(lvl.id);
        } else {
          this.showLevelPreviewModal(lvl);
        }
      });

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

    if (levelId === 1) {
      this.activeLevelInstance = new window.Level1Controller(
        lvl,
        (completedId, score) => {
          this._handleLevelCompleted(completedId, score);
        },
        () => {
          this.switchView('screenLevelSelector');
        }
      );
      this.activeLevelInstance.mount(this.simulationStage);
    } else {
      // Niveles 2 a 5: Próximamente en versión completa
      this.simulationStage.innerHTML = `
        <div class="stage-card glass-panel" style="text-align: center; padding: 2.75rem 1.25rem;">
          <span style="font-size: 3.2rem;">🔬</span>
          <div style="display: inline-block; font-family: var(--font-mono); font-size: 0.75rem; color: #f59e0b; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); padding: 0.25rem 0.75rem; border-radius: 999px; margin: 0.85rem 0 0.5rem; letter-spacing: 0.05em;">
            PRÓXIMAMENTE EN VERSIÓN COMPLETA
          </div>
          <h3 style="color: var(--accent-cyan); margin: 0.5rem 0; font-size: 1.35rem;">
            ${lvl.title}
          </h3>
          <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 1.25rem; font-size: 0.92rem; line-height: 1.5;">
            Esta misión forma parte del desarrollo de la versión final. En esta versión de demostración, por favor explora y evalúa la <strong>Fase 01: Transcripción</strong>.
          </p>
          <div style="background: rgba(6, 182, 212, 0.08); border: 1px solid var(--border-glass); border-radius: 8px; padding: 1rem; max-width: 520px; margin: 0 auto 1.75rem; font-size: 0.86rem; text-align: left;">
            <div style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.35rem;">Especificación Celular Prevista:</div>
            <div><strong>Ubicación:</strong> ${lvl.scientificBrief.location}</div>
            <div style="margin-top: 0.25rem;"><strong>Maquinaria:</strong> ${lvl.scientificBrief.machinery}</div>
            <div style="margin-top: 0.5rem; font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">${lvl.scientificBrief.mechanism}</div>
          </div>
          <button class="btn btn-primary" onclick="window.app.switchView('screenLevelSelector')">
            ← Volver al Panel de Misiones
          </button>
        </div>
      `;
    }
  }

  _handleLevelCompleted(levelId, score) {
    this.switchView('screenLevelSelector');
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
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
