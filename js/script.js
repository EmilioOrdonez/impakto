document.getElementById('yr').textContent = new Date().getFullYear();

// Navbar
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('solid', window.scrollY > 70);
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();

// Mobile nav
const tog = document.getElementById('nav-toggle');
const mob = document.getElementById('nav-mob');
tog.addEventListener('click', () => {
  tog.classList.toggle('x');
  mob.classList.toggle('show');
  document.body.style.overflow = mob.classList.contains('show') ? 'hidden' : '';
});
mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  tog.classList.remove('x'); mob.classList.remove('show'); document.body.style.overflow = '';
}));

// Reveal
const revIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revIO.unobserve(e.target); } });
}, {threshold: 0.1});
document.querySelectorAll('.rev').forEach(el => revIO.observe(el));

// Scroll spy
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const spyIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id));
  });
}, {rootMargin: '-40% 0px -55% 0px'});
sections.forEach(s => spyIO.observe(s));

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return; e.preventDefault();
    window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth'});
  });
});

// Counters — slot machine style
function animateCounter(el) {
  const target = +el.getAttribute('data-count');
  const dur = 2200;
  const digits = '0123456789';
  let start = null, scrambling = true;
  let scramTimer;

  function scramble() {
    el.textContent = digits[Math.floor(Math.random()*10)];
    scramTimer = requestAnimationFrame(scramble);
  }
  scramble();

  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  requestAnimationFrame(function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / dur, 1);
    if (p > 0.28 && scrambling) { scrambling = false; cancelAnimationFrame(scramTimer); }
    if (!scrambling) el.textContent = Math.floor(easeOutExpo(p) * target).toLocaleString('es-MX');
    if (p < 1) requestAnimationFrame(step);
    else {
      el.textContent = target.toLocaleString('es-MX');
      // Burst particles
      burst(el.closest('.stat-card') || el.closest('[class*="hero-stat"]'));
    }
  });
}

function burst(container) {
  if (!container) return;
  const prev = container.style.overflow;
  container.style.overflow = 'visible';
  container.style.position = 'relative';
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('span');
    const angle = (i / 10) * Math.PI * 2;
    const dist = 28 + Math.random() * 24;
    const colors = ['#4E9A33','#8CC63F','#2D5A1E','#6DBF45'];
    d.style.cssText = `position:absolute;width:5px;height:5px;border-radius:50%;
      background:${colors[i%colors.length]};top:50%;left:50%;
      transform:translate(-50%,-50%);pointer-events:none;z-index:99;
      animation:burst .65s ease-out forwards;
      --dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;`;
    container.appendChild(d);
    setTimeout(() => d.remove(), 700);
  }
}

if (!document.getElementById('burstkf')) {
  const s = document.createElement('style');
  s.id = 'burstkf';
  s.textContent = '@keyframes burst{0%{opacity:1;transform:translate(-50%,-50%) translate(0,0) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0)}}';
  document.head.appendChild(s);
}

const cntIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cntIO.unobserve(e.target); } });
}, {threshold: 0.6});
document.querySelectorAll('[data-count]').forEach(el => cntIO.observe(el));

/* ── REVEAL DEL TITULAR HERO ──────────────────────
   La animación se auto-ejecuta por CSS al cargar.
   Este bloque sólo la REINICIA si el usuario
   hace scroll lejos del hero y vuelve.
   ─────────────────────────────────────────────── */
(function(){
  const title = document.getElementById('heroTitle');
  if(!title) return;
  let hasLeft = false;  // controla si el hero salió del viewport

  function replay(){
    // 1. Cortar la animación (clase .replay → animation:none)
    title.classList.add('replay');
    // 2. Forzar reflow
    void title.offsetWidth;
    // 3. Quitar .replay → la animación CSS arranca de nuevo
    title.classList.remove('replay');
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting){
        hasLeft = true;   // el hero salió de pantalla
      } else if(hasLeft){
        hasLeft = false;
        replay();         // volvió: reiniciar animación
      }
    });
  },{threshold:0.15});
  io.observe(title);

  // Replay al hacer click en enlaces hacia #inicio o #hero
  document.querySelectorAll('a[href="#inicio"],a[href="#hero"]').forEach(a=>{
    a.addEventListener('click',()=>{
      setTimeout(replay, 500);
    });
  });
})();


// 3D tilt on cards — solo en dispositivos no táctiles
var isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
if(!isTouch) document.querySelectorAll('.svc-card,.case-cell').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const x = (px - 0.5) * 12;
    const y = (py - 0.5) * -12;
    card.style.transform = `translateY(-6px) rotateX(${y}deg) rotateY(${x}deg) scale(1.01)`;
    card.style.transition = 'transform .08s linear';
    // spotlight glow following cursor (solo en svc-card claras)
    if(card.classList.contains('svc-card') && !card.classList.contains('svc-card--featured')){
      card.style.background = `radial-gradient(420px circle at ${px*100}% ${py*100}%, rgba(140,198,63,.10), rgba(255,255,255,.88) 45%)`;
    }
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all .45s cubic-bezier(.4,0,.2,1)';
    if(card.classList.contains('svc-card') && !card.classList.contains('svc-card--featured')){
      card.style.background = '';
    }
  });
});

// Form
const form = document.getElementById('cform');
const toast = document.getElementById('toast');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('.form-submit');
  const orig = btn.innerHTML;
  btn.innerHTML = '<span style="opacity:.65">Enviando…</span>';
  btn.disabled = true;
  await new Promise(r => setTimeout(r, 1500));
  btn.innerHTML = orig; btn.disabled = false; form.reset();
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
});

/* ── FONDO 3D PREMIUM ─────────────────────────────────────
   Malla de gradiente animado + red de partículas conectadas
   Paleta verde/crema. Entre hero y footer (content-wrap).
   ─────────────────────────────────────────────────────── */
(function(){
  var C = document.getElementById('bg3d');
  if(!C) return;
  var ctx = C.getContext('2d');
  var W, H, DPR = Math.min(window.devicePixelRatio||1, 2);
  var pts = [], blobs = [];
  var mouse = {x:-9999, y:-9999};

  var GREENS = ['45,90,30','61,122,40','78,154,51','140,198,63'];

  function resize(){
    W = window.innerWidth;
    H = document.documentElement.scrollHeight;
    C.width = W*DPR; C.height = H*DPR;
    C.style.width = W+'px'; C.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
  }

  function build(){
    // Soft gradient blobs (the "3D" depth layer)
    blobs = [];
    var bn = 5;
    for(var i=0;i<bn;i++){
      blobs.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: 220 + Math.random()*260,
        col: GREENS[i % GREENS.length],
        vx:(Math.random()-.5)*0.18,
        vy:(Math.random()-.5)*0.14,
        a: 0.05 + Math.random()*0.05
      });
    }
    // Connected particles (constellation)
    pts = [];
    var density = Math.min(70, Math.floor(W*H/26000));
    for(var j=0;j<density;j++){
      pts.push({
        x: Math.random()*W,
        y: Math.random()*H,
        vx:(Math.random()-.5)*0.35,
        vy:(Math.random()-.5)*0.35,
        r: 1 + Math.random()*1.8
      });
    }
  }

  var scrollY = 0;
  window.addEventListener('scroll', function(){ scrollY = window.scrollY; }, {passive:true});
  window.addEventListener('mousemove', function(e){
    mouse.x = e.clientX; mouse.y = e.clientY + scrollY;
  });

  var raf;
  function frame(){
    ctx.clearRect(0,0,W,H);

    // 1) Gradient depth blobs
    blobs.forEach(function(b){
      b.x += b.vx; b.y += b.vy;
      if(b.x < -b.r) b.x = W+b.r; if(b.x > W+b.r) b.x = -b.r;
      if(b.y < -b.r) b.y = H+b.r; if(b.y > H+b.r) b.y = -b.r;
      var g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
      g.addColorStop(0,'rgba('+b.col+','+b.a+')');
      g.addColorStop(1,'rgba('+b.col+',0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);
    });

    // 2) Constellation network
    var vh = window.innerHeight;
    for(var i=0;i<pts.length;i++){
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;

      // only render points roughly in viewport (perf)
      var inView = p.y > scrollY-150 && p.y < scrollY+vh+150;
      if(!inView) continue;

      // mouse repel
      var dmx = p.x-mouse.x, dmy = p.y-mouse.y;
      var dm = Math.sqrt(dmx*dmx+dmy*dmy);
      if(dm < 130 && dm > 0){
        p.x += (dmx/dm)*1.4; p.y += (dmy/dm)*1.4;
      }

      // connections
      for(var k=i+1;k<pts.length;k++){
        var q = pts[k];
        if(q.y < scrollY-150 || q.y > scrollY+vh+150) continue;
        var dx=p.x-q.x, dy=p.y-q.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        if(d < 130){
          var op = (1 - d/130)*0.28;
          ctx.strokeStyle = 'rgba(78,154,51,'+op+')';
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
        }
      }
      // node
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(61,122,40,0.55)';
      ctx.fill();
    }

    raf = requestAnimationFrame(frame);
  }

  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ cancelAnimationFrame(raf); resize(); build(); frame(); }, 250);
  });
  window.addEventListener('load', function(){ resize(); build(); });

  resize(); build(); frame();
})();

/* ── FALLBACK DE LOGOS DEL MARQUEE ───────────────
   Si un logo no carga, lo sustituye por el nombre
   de la cadena en texto, manteniendo el estilo.
   ─────────────────────────────────────────────── */
/* Fallback de logos: si un PNG no carga, muestra el nombre en texto */
function logoFallback(img, name){
  const box = img.parentElement;
  img.remove();
  const span = document.createElement('span');
  span.className = 'marquee-fallback';
  span.textContent = name;
  box.appendChild(span);
}

/* ── FALLBACK DE IMÁGENES ─────────────────────────────────
   Si una foto de Unsplash no carga, se sustituye por un
   placeholder con gradiente verde e ícono. Nunca cuadros rotos.
   ─────────────────────────────────────────────────────── */
(function(){
  function placeholder(el){
    if(el.dataset.fb) return;            // ya reemplazada
    el.dataset.fb = '1';
    var box = el.parentElement;
    el.style.display = 'none';
    var ph = document.createElement('div');
    ph.className = 'img-fallback';
    ph.innerHTML = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18M9 21V9"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>';
    box.appendChild(ph);
  }
  document.querySelectorAll('img').forEach(function(img){
    img.addEventListener('error', function(){ placeholder(img); });
    // si ya falló antes de adjuntar el listener
    if(img.complete && img.naturalWidth === 0) placeholder(img);
  });
})();
