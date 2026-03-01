// ── Nav: background on scroll ──────────────────
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  updateActiveNav();
}, { passive: true });

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current = '';

  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// ── Fade-in on scroll ──────────────────────────
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));


// ── Canvas setup ───────────────────────────────
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const hero = document.getElementById('hero');
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initSandRipples(); }, { passive: true });

const R = 0, G = 119, B = 182;
let time = 0;

// ── Particles (dots + connecting lines) ────────
const PARTICLE_COUNT = 55;
const particles = [];

class Particle {
  constructor() { this.init(); }
  init() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.r  = Math.random() * 2 + 1;
    this.a  = Math.random() * 0.3 + 0.08;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${R},${G},${B},${this.a})`;
    ctx.fill();
  }
}

for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());


// ── Wave lines ─────────────────────────────────
const WAVE_COUNT = 14;
const waveLines = [];

class WaveLine {
  constructor() { this.init(); }
  init() {
    this.y          = Math.random() * canvas.height;
    this.amplitude  = Math.random() * 18 + 6;
    this.wavelength = Math.random() * 220 + 140;
    this.speed      = (Math.random() * 0.4 + 0.1) * (Math.random() < 0.5 ? 1 : -1);
    this.phase      = Math.random() * Math.PI * 2;
    this.a          = Math.random() * 0.07 + 0.02;
    this.lw         = Math.random() * 0.8 + 0.4;
  }
  update() {
    this.phase += this.speed * 0.018;
  }
  draw() {
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${R},${G},${B},${this.a})`;
    ctx.lineWidth = this.lw;
    for (let x = 0; x <= canvas.width; x += 3) {
      const y = this.y + Math.sin((x / this.wavelength) + this.phase) * this.amplitude;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

for (let i = 0; i < WAVE_COUNT; i++) waveLines.push(new WaveLine());

// ── Bubbles floating upward ────────────────────
const BUBBLE_COUNT = 12;
const bubbles = [];

class Bubble {
  constructor(fromBottom = false) { this.init(fromBottom); }
  init(fromBottom = false) {
    this.x       = Math.random() * canvas.width;
    this.y       = fromBottom ? canvas.height + Math.random() * 60 : Math.random() * canvas.height;
    this.r       = Math.random() * 5 + 2;
    this.vy      = -(Math.random() * 0.4 + 0.15);
    this.wobble  = Math.random() * Math.PI * 2;
    this.wobbleS = Math.random() * 0.025 + 0.008;
    this.a       = Math.random() * 0.12 + 0.04;
  }
  update() {
    this.y       += this.vy;
    this.wobble  += this.wobbleS;
    this.x       += Math.sin(this.wobble) * 0.4;
    if (this.y < -this.r * 2) this.init(true);
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${R},${G},${B},${this.a})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

for (let i = 0; i < BUBBLE_COUNT; i++) bubbles.push(new Bubble());

// ── Sand ripples (bottom of hero) ──────────────
let sandRipples = [];

function initSandRipples() {
  sandRipples = [];
  const rows    = 3;
  const spacing = 36;
  for (let row = 0; row < rows; row++) {
    const baseY = canvas.height - 30 - row * 14;
    const offset = row % 2 === 0 ? 0 : spacing / 2;
    for (let x = offset; x < canvas.width + spacing; x += spacing) {
      sandRipples.push({ x, baseY, phase: Math.random() * Math.PI * 2, speed: (Math.random() * 0.3 + 0.1), a: (0.06 - row * 0.015), w: spacing * 0.42 });
    }
  }
}
initSandRipples();

function drawSandRipples() {
  sandRipples.forEach(r => {
    const y = r.baseY + Math.sin(time * r.speed + r.phase) * 1.5;
    ctx.beginPath();
    ctx.ellipse(r.x, y, r.w, 5, 0, Math.PI, 0);
    ctx.strokeStyle = `rgba(${R},${G},${B},${r.a})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });
}

// ── Photo floating in shifting oval ───────────
const photo = document.querySelector('.hero-photo');
let photoTime = 0;

function floatPhoto() {
  photoTime += 0.007;
  const x = Math.sin(photoTime * 1.3) * 9;
  const y = Math.sin(photoTime) * 13;
  photo.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(floatPhoto);
}
floatPhoto();

// ── Animation loop ─────────────────────────────
function animate() {
  time += 0.016;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p  => { p.update(); p.draw(); });
  waveLines.forEach(w  => { w.update(); w.draw(); });
  bubbles.forEach(b    => { b.update(); b.draw(); });
  drawSandRipples();

  requestAnimationFrame(animate);
}

animate();
