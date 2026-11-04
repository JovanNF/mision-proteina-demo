/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * State Manager: Persistencia con LocalStorage y lógica de progresión
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

  _loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...this._getDefaultState(), ...parsed };
      }
    } catch (e) {
      console.warn('Error leyendo LocalStorage:', e);
    }
    return this._getDefaultState();
  }

  save() {
    try {
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
    return this.state.unlockedLevels.includes(Number(levelId));
  }

  isCompleted(levelId) {
    return this.state.completedLevels.includes(Number(levelId));
  }

  unlockLevel(levelId) {
    const id = Number(levelId);
    if (!this.state.unlockedLevels.includes(id)) {
      this.state.unlockedLevels.push(id);
      this.state.unlockedLevels.sort((a, b) => a - b);
      this.save();
    }
  }

  recordLevelCompletion(levelId, score) {
    const id = Number(levelId);
    if (!this.state.completedLevels.includes(id)) {
      this.state.completedLevels.push(id);
    }
    
    // Guardar el puntaje más alto obtenido
    const currentScore = this.state.scores[id] || 0;
    if (score > currentScore) {
      this.state.scores[id] = score;
    }

    // Desbloquear siguiente nivel si existe
    if (id < 5) {
      this.unlockLevel(id + 1);
    }

    // Recalcular puntaje global
    this.state.totalScore = Object.values(this.state.scores).reduce((acc, s) => acc + s, 0);
    this.save();
  }

  getLevelScore(levelId) {
    return this.state.scores[Number(levelId)] || 0;
  }

  getTotalScore() {
    return Object.values(this.state.scores).reduce((acc, s) => acc + s, 0);
  }

  resetProgress() {
    this.state = this._getDefaultState();
    this.save();
  }
}

// Instancia global
window.gameState = new GameStateManager();
