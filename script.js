// =========================
// Utilitaires
// =========================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Année footer
(function setYear(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// =========================
// Intro vidéo (avec bouton "Passer")
// =========================
(function setupIntro(){
  const overlay = document.getElementById('intro');
  const video = document.getElementById('introVideo');
  const skip = document.querySelector('.intro-skip');
  if (!overlay) return;

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    overlay.classList.add('hidden');
  };

  if (skip) skip.addEventListener('click', close);

  // Respect prefers-reduced-motion : on skip direct
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return close();

  if (video) {
    video.addEventListener('ended', close);
    video.addEventListener('error', close);
    video.play().catch(()=> close());
  }
  setTimeout(close, 7400);
})();

// =========================
// Menu mobile
// =========================
(function mobileNav(){
  const btn = document.querySelector('.nav-toggle');
  const nav = document.querySelector('[data-nav]');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Ferme au clic sur un lien (mobile)
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
})();

// =========================
// Scroll cue
// =========================
(function scrollCue(){
  const btn = document.querySelector('[data-scroll]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-scroll');
    const el = document.querySelector(target);
    if (!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
  });
})();

// =========================
// Reveal on scroll
// =========================
(function revealOnScroll(){
  const els = document.querySelectorAll('.reveal-on-scroll');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el=> el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver((entries, observer)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, {threshold:.12, rootMargin: "0px 0px -60px 0px"});

  els.forEach(el=> io.observe(el));
})();

// =========================
// Starfield (canvas)
// =========================
(function starfield(){
  const c = document.getElementById('starfield');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = c.width = window.innerWidth;
  let h = c.height = window.innerHeight;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // pas d'anim si reduce

  const stars = Array.from({length: 120}, () => ({
    x: Math.random()*w,
    y: Math.random()*h,
    z: Math.random()*0.8 + 0.2,
    v: Math.random()*0.3 + 0.05
  }));

  let raf;
  function draw(){
    ctx.clearRect(0,0,w,h);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#E8FFFF';
    for (const s of stars){
      const size = s.z * 1.2;
      ctx.fillRect(s.x, s.y, size, size);
      s.y += s.v * (1.5 - s.z);
      if (s.y > h) { s.y = -2; s.x = Math.random()*w; }
    }
    raf = requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', ()=>{
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
  });
})();

// =========================
// Animation H1 (split mots)
// =========================
(function splitHeadline(){
  const h1 = document.querySelector('.headline-split');
  if (!h1) return;

  // Si déjà splitté, on évite double split
  if (h1.querySelector('.word')) return;

  const text = h1.textContent.trim();
  const words = text.split(/\s+/);
  h1.textContent = '';
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.animationDelay = (0.06 * i) + 's';
    span.textContent = word;
    h1.appendChild(span);
    if (i < words.length - 1) h1.appendChild(document.createTextNode(' '));
  });
})();

// =========================
// Galerie vidéo + lightbox
// =========================
(function setupVideoLightbox() {
  const lightbox = document.getElementById('video-lightbox');
  const lightboxVideo = document.getElementById('lightbox-video');
  const closeButton = document.getElementById('close-lightbox');
  const videoCards = document.querySelectorAll('.video-card');

  if (!lightbox || !lightboxVideo || !closeButton) return;

  const openLightbox = (videoSrc) => {
    lightboxVideo.src = videoSrc;
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxVideo.play().catch(()=>{});
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxVideo.pause();
    lightboxVideo.src = "";
  };

  videoCards.forEach(card => {
    card.addEventListener('click', () => {
      const videoSrc = card.getAttribute('data-video-src');
      if (videoSrc) openLightbox(videoSrc);
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });
})();

// =========================
// Score IA (page score-ia.html)
// =========================
(function scoreIA(){
  const calcBtn = document.getElementById('calcScore');
  if (!calcBtn) return;

  const resultBox = document.getElementById('scoreResult');
  const scoreHidden = document.getElementById('scoreHidden');

  // gestion chips (1 choix par question)
  const groups = $$('.score-q');
  groups.forEach(group => {
    const chips = $$('.chip', group);
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });

  function compute(){
    // total max = 50 (6 questions: 6+8+8+10+8+10 = 50)
    let total = 0;
    let answered = 0;

    groups.forEach(group => {
      const active = $('.chip.active', group);
      if (active) {
        total += Number(active.dataset.score || 0);
        answered++;
      }
    });

    return { total, answered };
  }

  function planFor(score100){
    if (score100 >= 80) {
      return [
        "Passe en mode scaling : déclinaisons ads + retargeting.",
        "Ajoute de la preuve chiffrée (avis, chiffres, cas).",
        "Optimise la capture lead (WhatsApp + formulaire + automation)."
      ];
    }
    if (score100 >= 55) {
      return [
        "Clarifie ton offre (packs, promesse, étapes).",
        "Refais une landing conversion-first avec CTA unique.",
        "Crée 10 contenus déclinaison (reels, stories, ads)."
      ];
    }
    return [
      "Repose les bases : identité cohérente + message simple.",
      "Mets un CTA direct (WhatsApp) + un formulaire ultra court.",
      "Crée un tunnel : audit → score → plan → prise de RDV."
    ];
  }

  calcBtn.addEventListener('click', () => {
    const { total, answered } = compute();
    if (answered < groups.length) {
      resultBox.classList.remove('hidden');
      resultBox.innerHTML = `
        <h3>Il manque ${groups.length - answered} réponse(s)</h3>
        <p>Réponds à toutes les questions pour un score fiable.</p>
      `;
      return;
    }

    const score100 = Math.round((total / 50) * 100);
    const actions = planFor(score100);

    if (scoreHidden) scoreHidden.value = String(score100);

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `
      <h3>Ton Score : ${score100}/100</h3>
      <p><strong>Priorités :</strong></p>
      <ul>
        ${actions.map(a => `<li>${a}</li>`).join('')}
      </ul>
      <p style="opacity:.85; margin-top:10px">
        Pour un plan complet (14 jours) + estimation : <a href="audit.html">fais l’audit</a>.
      </p>
    `;
  });
})();
