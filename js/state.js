/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * State Manager: Persistencia con LocalStorage, validación rigurosa y normalización
 */

class GameStateManager {
  constructor() {
    this.STORAGE_KEY = 'mision_proteina_state_v1';
    this.listeners = [];
    this.state = this._loadState();
  }

  _getDefaultState() {
    return {
      unlockedLevels: [1],
      completedLevels: [],
      scores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      currentLevelId: 1,
      totalScore: 0
    };
  }

  _sanitizeLevelId(levelId) {
    const num = parseInt(levelId, 10);
    if (Number.isInteger(num) && num >= 1 && num <= 5) {
      return num;
    }
    return null;
  }

  _sanitizeScore(score) {
    const num = Number(score);
    if (!Number.isFinite(num) || Number.isNaN(num)) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round(num)));
  }

  _normalizeState(raw) {
    const def = this._getDefaultState();
    if (!raw || typeof raw !== 'object') {
      return def;
    }

    // Sanitizar niveles desbloqueados (solo 1..5, asegurando que el 1 siempre esté)
    let unlocked = Array.isArray(raw.unlockedLevels)
      ? raw.unlockedLevels.map(id => parseInt(id, 10)).filter(id => id >= 1 && id <= 5)
      : [1];
    if (!unlocked.includes(1)) unlocked.push(1);
    unlocked = Array.from(new Set(unlocked)).sort((a, b) => a - b);

    // Sanitizar niveles completados (solo 1..5)
    let completed = Array.isArray(raw.completedLevels)
      ? raw.completedLevels.map(id => parseInt(id, 10)).filter(id => id >= 1 && id <= 5)
      : [];
    completed = Array.from(new Set(completed)).sort((a, b) => a - b);

    // Sanitizar puntuaciones (1 a 5, acotadas en 0..100)
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (raw.scores && typeof raw.scores === 'object') {
      for (let id = 1; id <= 5; id++) {
        scores[id] = this._sanitizeScore(raw.scores[id]);
      }
    }

    // Sanitizar currentLevelId
    let currentLevelId = parseInt(raw.currentLevelId, 10);
    if (!Number.isInteger(currentLevelId) || currentLevelId < 1 || currentLevelId > 5) {
      currentLevelId = 1;
    }

    // Calcular totalScore limitado al rango 0..500
    const calculatedTotal = Object.values(scores).reduce((acc, s) => acc + s, 0);
    const totalScore = Math.min(500, Math.max(0, calculatedTotal));

    return {
      unlockedLevels: unlocked,
      completedLevels: completed,
      scores,
      currentLevelId,
      totalScore
    };
  }

  _loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this._normalizeState(parsed);
      }
    } catch (e) {
      console.warn('Error leyendo o parseando LocalStorage, usando estado por defecto:', e);
    }
    return this._getDefaultState();
  }

  save() {
    try {
      // Siempre normalizar antes de persistir para asegurar integridad
      this.state = this._normalizeState(this.state);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this._notify();
    } catch (e) {
      console.warn('Error guardando en LocalStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  _notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (err) { console.error(err); }
    });
  }

  isUnlocked(levelId) {
    const id = this._sanitizeLevelId(levelId);
    return id !== null && this.state.unlockedLevels.includes(id);
  }

  isCompleted(levelId) {
    const id = this._sanitizeLevelId(levelId);
    return id !== null && this.state.completedLevels.includes(id);
  }

  unlockLevel(levelId) {
    const id = this._sanitizeLevelId(levelId);
    if (!id) return;

    if (!this.state.unlockedLevels.includes(id)) {
      this.state.unlockedLevels.push(id);
      this.state.unlockedLevels.sort((a, b) => a - b);
      this.save();
    }
  }

  recordLevelCompletion(levelId, score) {
    const id = this._sanitizeLevelId(levelId);
    if (!id) return;

    const validScore = this._sanitizeScore(score);

    if (!this.state.completedLevels.includes(id)) {
      this.state.completedLevels.push(id);
      this.state.completedLevels.sort((a, b) => a - b);
    }
    
    // Guardar el puntaje más alto obtenido (0 a 100)
    const currentScore = this.state.scores[id] || 0;
    if (validScore > currentScore) {
      this.state.scores[id] = validScore;
    }

    // Desbloquear siguiente nivel si existe
    if (id < 5) {
      this.unlockLevel(id + 1);
    }

    // Recalcular puntaje global (máx 500)
    this.state.totalScore = this.getTotalScore();
    this.save();
  }

  getLevelScore(levelId) {
    const id = this._sanitizeLevelId(levelId);
    return id !== null ? (this.state.scores[id] || 0) : 0;
  }

  getTotalScore() {
    const sum = Object.values(this.state.scores).reduce((acc, s) => acc + this._sanitizeScore(s), 0);
    return Math.min(500, Math.max(0, sum));
  }

  resetProgress() {
    this.state = this._getDefaultState();
    this.save();
  }
}

// Instancia global y exportación
window.GameStateManager = GameStateManager;
window.gameState = new GameStateManager();
