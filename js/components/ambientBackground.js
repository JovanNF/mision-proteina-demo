/**
 * MISIÓN PROTEÍNA: CÓDIGO DE VIDA
 * Fondo Ambiental Interactivo: Partículas Bioluminiscentes & Ondas Moleculares
 * Ultraliviano, 60 FPS, acelerado por hardware, compatible con móviles.
 */

class AmbientBackground {
  constructor(canvasId = 'bioAmbientCanvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animId = null;
    this.isVisible = true;

    // Ajuste de densidad según el ancho de pantalla
    this.isMobile = window.innerWidth <= 600;
    this.particleCount = this.isMobile ? 18 : 36;

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.isMobile = this.width <= 600;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
    }, { passive: true });

    // Pausar render si la pestaña está en segundo plano para ahorrar batería/CPU
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animId) {
        this.loop();
      }
    });
  }

  createParticles() {
    this.particles = [];
    const colors = [
      'rgba(6, 182, 212, ',   // Cian eléctrico
      'rgba(139, 92, 246, ',  // Violeta
      'rgba(59, 130, 246, ',  // Azul cobalto
      'rgba(16, 185, 129, '   // Esmeralda
    ];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.35 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  loop() {
    if (!this.isVisible) {
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    const now = Date.now() * 0.001;

    // Dibujar y actualizar partículas
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      // Rebote suave en bordes
      if (p.x < 0) p.x = this.width;
      else if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      else if (p.y > this.height) p.y = 0;

      // Pulso de luminosidad biológica sutil
      const currentAlpha = p.alpha + Math.sin(now * p.pulseSpeed * 60 + p.pulseOffset) * 0.1;
      const safeAlpha = Math.max(0.05, Math.min(0.55, currentAlpha));

      // Partícula
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.colorBase}${safeAlpha})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `${p.colorBase}0.6)`;
      this.ctx.fill();

      // Conectar partículas cercanas con hebras tenues (estilo red molecular)
      const maxDist = this.isMobile ? 70 : 105;
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const lineAlpha = (1 - dist / maxDist) * 0.12;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          this.ctx.lineWidth = 0.75;
          this.ctx.shadowBlur = 0;
          this.ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

// Inicializar cuando el DOM esté disponible
document.addEventListener('DOMContentLoaded', () => {
  window.ambientBg = new AmbientBackground();
});
