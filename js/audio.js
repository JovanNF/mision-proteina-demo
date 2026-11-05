/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Audio Manager: Sintetizador Web Audio API autónomo (Zero dependencias externas)
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('mision_proteina_muted') === 'true';
    this._initAudioContext();
  }

  _initAudioContext() {
    // Inicialización perezosa al primer gesto del usuario
    const unlockAudio = () => {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('mision_proteina_muted', this.isMuted.toString());
    return this.isMuted;
  }

  _playTone(freq, type, duration, gainVal = 0.15) {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // Clic de interfaz sutil
  playClick() {
    this._playTone(800, 'sine', 0.04, 0.08);
  }

  // Nucleótido insertado correctamente
  playMatch(baseIndex = 0) {
    if (this.isMuted || !this.ctx) return;
    // Escala pentatónica ascendente según el índice
    const pentatonic = [392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
    const freq = pentatonic[baseIndex % pentatonic.length] || 523.25;
    this._playTone(freq, 'triangle', 0.14, 0.18);
  }

  // Error de complementariedad o regla
  playError() {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {
      console.warn(e);
    }
  }

  // Fanfarria armónica al completar un nivel
  playLevelComplete() {
    if (this.isMuted || !this.ctx) return;
    const chords = [523.25, 659.25, 783.99, 1046.50]; // C Mayor brillante
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this._playTone(freq, 'sine', 0.45, 0.16);
      }, idx * 90);
    });
  }

  // Pista activada
  playHint() {
    this._playTone(660, 'sine', 0.15, 0.12);
    setTimeout(() => this._playTone(880, 'sine', 0.25, 0.12), 100);
  }

  // Ensamblaje molecular correcto (acople de reactivos, cap, snRNP, etc.)
  playAssemble() {
    this._playTone(523.25, 'triangle', 0.12, 0.18);
    setTimeout(() => this._playTone(783.99, 'sine', 0.18, 0.2), 60);
  }

  // Alias para compatibilidad de controladores
  playCorrect(baseIndex = 0) {
    this.playMatch(baseIndex);
  }

  playMistake() {
    this.playError();
  }

  playSuccess() {
    this.playLevelComplete();
  }
}

// Instancia global
window.audioMgr = new AudioManager();
