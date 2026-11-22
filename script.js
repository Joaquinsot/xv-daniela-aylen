/* ==========================================================================
   DANIELA AYLEN — MIS XV AÑOS
   Interactive Effects, Particle Engine, Live Countdown & Ambient Waltz
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. TOAST HELPER
     ------------------------------------------------------------------------ */
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 3200);
  }

  /* ------------------------------------------------------------------------
     2. BACKGROUND SONG PLAYER (assets/cancion.mp3 WITH SMOOTH FADE-IN)
     ------------------------------------------------------------------------ */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggle');
  let fadeInterval = null;

  function syncMusicButton(playing) {
    if (!musicToggleBtn) return;
    musicToggleBtn.classList.toggle('is-playing', playing);
    musicToggleBtn.setAttribute(
      'aria-label',
      playing ? 'Pausar música' : 'Reproducir música'
    );
  }

  function fadeInAudio(audioEl, targetVolume = 0.85, durationMs = 1400) {
    if (!audioEl) return;
    clearInterval(fadeInterval);
    audioEl.volume = 0.05;
    const steps = 24;
    const stepTime = Math.max(25, Math.floor(durationMs / steps));
    const delta = (targetVolume - audioEl.volume) / steps;

    fadeInterval = setInterval(() => {
      if (audioEl.paused) {
        clearInterval(fadeInterval);
        return;
      }
      const next = Math.min(targetVolume, audioEl.volume + delta);
      audioEl.volume = next;
      if (next >= targetVolume) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  function startSong(withToast = false) {
    if (!bgMusic) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          fadeInAudio(bgMusic, 0.85, 1400);
          syncMusicButton(true);
          if (withToast) showToast('♪ Reproduciendo: See You Again');
        })
        .catch(() => {
          syncMusicButton(false);
        });
    } else {
      fadeInAudio(bgMusic, 0.85, 1400);
      syncMusicButton(true);
      if (withToast) showToast('♪ Reproduciendo: See You Again');
    }
  }

  function pauseSong(withToast = false) {
    if (!bgMusic) return;
    clearInterval(fadeInterval);
    bgMusic.pause();
    syncMusicButton(false);
    if (withToast) showToast('Música pausada');
  }

  if (bgMusic) {
    bgMusic.addEventListener('play', () => syncMusicButton(true));
    bgMusic.addEventListener('pause', () => syncMusicButton(false));
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!bgMusic || bgMusic.paused) {
        startSong(true);
      } else {
        pauseSong(true);
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. FULL-SCREEN PARTICLE CANVAS (PETALS, GOLD STARDUST & TAP BURSTS)
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('sparkle-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let width = window.innerWidth;
  let height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const petals = [];
  const dusts = [];
  const bursts = [];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createPetal(randomY = true) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -20 - Math.random() * 60,
      size: 5 + Math.random() * 7.5,
      vy: 0.35 + Math.random() * 0.65,
      vx: -0.25 + Math.random() * 0.5,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.018,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: -0.014 + Math.random() * 0.028,
      opacity: 0.28 + Math.random() * 0.36,
      hueShift: Math.random() > 0.5 ? '#f5b7c8' : '#fad2de',
    };
  }

  function createDust() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.9 + Math.random() * 2.2,
      vy: -0.12 - Math.random() * 0.32,
      vx: -0.15 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.025 + Math.random() * 0.035,
      isStar: Math.random() < 0.36,
    };
  }

  function spawnSparkleBurst(x, y, count = 16) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.2 + Math.random() * 3.4;
      bursts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 2.2 + Math.random() * 4.2,
        alpha: 1,
        decay: 0.018 + Math.random() * 0.016,
        isStar: Math.random() < 0.65,
        color: Math.random() < 0.72 ? '#d4a656' : '#f2a9be',
      });
    }
  }

  function spawnTrailSparkle(x, y) {
    if (prefersReducedMotion || bursts.length > 90) return;
    bursts.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -0.4 - Math.random() * 0.6,
      size: 1.8 + Math.random() * 2.8,
      alpha: 0.85,
      decay: 0.026,
      isStar: Math.random() < 0.55,
      color: Math.random() < 0.75 ? '#dfb86e' : '#f6c3d2',
    });
  }

  function drawFourPointStar(context, x, y, radius, color, alpha) {
    context.save();
    context.translate(x, y);
    context.globalAlpha = Math.max(0, alpha);
    context.fillStyle = color;
    context.beginPath();
    const inner = radius * 0.28;
    context.moveTo(0, -radius);
    context.quadraticCurveTo(inner, -inner, radius, 0);
    context.quadraticCurveTo(inner, inner, 0, radius);
    context.quadraticCurveTo(-inner, inner, -radius, 0);
    context.quadraticCurveTo(-inner, -inner, 0, -radius);
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawPetal(context, p) {
    context.save();
    context.translate(p.x, p.y);
    context.rotate(p.rotation);
    context.globalAlpha = p.opacity;

    const grad = context.createLinearGradient(-p.size, -p.size, p.size, p.size);
    grad.addColorStop(0, '#fff4f7');
    grad.addColorStop(0.55, p.hueShift);
    grad.addColorStop(1, '#e89eb3');

    context.fillStyle = grad;
    context.beginPath();
    context.moveTo(0, -p.size);
    context.bezierCurveTo(p.size * 0.9, -p.size * 0.7, p.size * 0.95, p.size * 0.55, 0, p.size);
    context.bezierCurveTo(-p.size * 0.85, p.size * 0.55, -p.size * 0.75, -p.size * 0.65, 0, -p.size);
    context.closePath();
    context.fill();
    context.restore();
  }

  function initParticles() {
    if (!canvas || !ctx || prefersReducedMotion) return;
    resizeCanvas();

    const petalCount = width < 640 ? 12 : 18;
    const dustCount = width < 640 ? 28 : 44;

    petals.length = 0;
    dusts.length = 0;
    for (let i = 0; i < petalCount; i += 1) petals.push(createPetal(true));
    for (let i = 0; i < dustCount; i += 1) dusts.push(createDust());

    function render() {
      ctx.clearRect(0, 0, width, height);

      // Floating rose petals
      for (let i = 0; i < petals.length; i += 1) {
        const p = petals[i];
        p.swayPhase += p.swaySpeed;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.45;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y > height + 30) {
          petals[i] = createPetal(false);
        } else if (p.x < -30) {
          p.x = width + 20;
        } else if (p.x > width + 30) {
          p.x = -20;
        }
        drawPetal(ctx, p);
      }

      // Golden fairy dust & stars
      for (let i = 0; i < dusts.length; i += 1) {
        const d = dusts[i];
        d.phase += d.twinkleSpeed;
        d.x += d.vx;
        d.y += d.vy;

        if (d.y < -15) {
          d.y = height + 15;
          d.x = Math.random() * width;
        }
        if (d.x < -15) d.x = width + 15;
        if (d.x > width + 15) d.x = -15;

        const alpha = 0.2 + ((Math.sin(d.phase) + 1) * 0.5) * 0.68;
        if (d.isStar) {
          drawFourPointStar(ctx, d.x, d.y, d.r * 2.5, '#d4a656', alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = alpha * 0.75;
          ctx.fillStyle = '#e7c582';
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Interactive bursts & pointer sparkles
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.97;
        b.vy = b.vy * 0.97 + 0.035;
        b.alpha -= b.decay;

        if (b.alpha <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        if (b.isStar) {
          drawFourPointStar(ctx, b.x, b.y, b.size * 1.6, b.color, b.alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = b.alpha;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size * 0.65, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  initParticles();

  // Gentle fairy-dust trail on pointer move & celebratory sparkle on tap
  let lastTrailTime = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      if (now - lastTrailTime > 55) {
        lastTrailTime = now;
        spawnTrailSparkle(e.clientX, e.clientY);
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerdown', (e) => {
    spawnSparkleBurst(e.clientX, e.clientY, 10);
  });

  /* ------------------------------------------------------------------------
     4. INTRO CURTAIN / ROYAL SEAL OPENING
     ------------------------------------------------------------------------ */
  const introOverlay = document.getElementById('introOverlay');
  const openInviteBtn = document.getElementById('openInviteBtn');
  let isOpened = false;

  function revealHeroElements() {
    const heroReveals = document.querySelectorAll('.hero-section .reveal');
    heroReveals.forEach((el) => {
      const delay = Number(el.dataset.delay || 0);
      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);
    });
  }

  function openInvitation() {
    if (isOpened) return;
    isOpened = true;

    if (openInviteBtn) {
      const rect = openInviteBtn.getBoundingClientRect();
      spawnSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 34);
    }

    // Start the invitation song upon direct user gesture
    startSong(false);

    if (introOverlay) {
      introOverlay.classList.add('is-opening');
    }

    document.body.classList.remove('is-locked');

    setTimeout(() => {
      revealHeroElements();
    }, 320);

    setTimeout(() => {
      if (introOverlay) {
        introOverlay.classList.add('is-hidden');
      }
    }, 1150);
  }

  if (openInviteBtn) {
    openInviteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openInvitation();
    });
  }

  /* ------------------------------------------------------------------------
     5. SCROLL PROGRESS HAIRLINE & INTERSECTION OBSERVER REVEALS
     ------------------------------------------------------------------------ */
  const scrollProgress = document.getElementById('scrollProgress');

  function updateScrollProgress() {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    scrollProgress.style.width = `${pct}%`;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  const nonHeroReveals = document.querySelectorAll('section:not(.hero-section) .reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = Number(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -30px 0px' }
    );
    nonHeroReveals.forEach((el) => observer.observe(el));
  } else {
    nonHeroReveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------------
     6. SUBTLE 3D TILT ON EVENT CARDS & SILHOUETTE PARALLAX
     ------------------------------------------------------------------------ */
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        const rotateY = (relX - 0.5) * 8;
        const rotateX = (0.5 - relY) * 8;

        card.style.setProperty('--mx', `${(relX * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(relY * 100).toFixed(1)}%`);
        card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    const silhouetteStage = document.getElementById('silhouetteStage');
    const heroSection = document.querySelector('.hero-section');
    if (silhouetteStage && heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        silhouetteStage.style.transform = `translate3d(${(nx * 10).toFixed(1)}px, ${(ny * 8).toFixed(1)}px, 0)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        silhouetteStage.style.transform = '';
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. REAL-TIME COUNTDOWN TO DECEMBER 19, 2026 AT 3:30 PM (CST / MEXICO)
     ------------------------------------------------------------------------ */
  const targetTimestamp = new Date('2026-12-19T15:30:00-06:00').getTime();
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');
  const cdStatus = document.getElementById('countdownStatus');

  function updateCounterUnit(el, value) {
    if (!el) return;
    const formatted = String(value).padStart(2, '0');
    if (el.textContent !== formatted) {
      el.textContent = formatted;
      el.classList.remove('is-ticking');
      void el.offsetWidth; // trigger reflow for crisp tick animation
      el.classList.add('is-ticking');
    }
  }

  function refreshCountdown() {
    const now = Date.now();
    const diff = targetTimestamp - now;

    if (diff <= 0) {
      updateCounterUnit(cdDays, 0);
      updateCounterUnit(cdHours, 0);
      updateCounterUnit(cdMinutes, 0);
      updateCounterUnit(cdSeconds, 0);
      if (cdStatus) {
        cdStatus.textContent = '¡Hoy celebramos los XV años de Daniela Aylen!';
      }
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    updateCounterUnit(cdDays, days);
    updateCounterUnit(cdHours, hours);
    updateCounterUnit(cdMinutes, minutes);
    updateCounterUnit(cdSeconds, seconds);
  }

  refreshCountdown();
  setInterval(refreshCountdown, 1000);

  /* ------------------------------------------------------------------------
     8. SAVE TO CALENDAR (.ICS DOWNLOAD — "¡APARTA LA FECHA!")
     ------------------------------------------------------------------------ */
  const saveCalendarBtn = document.getElementById('saveCalendarBtn');

  function downloadCalendarEvent() {
    // 19 Dec 2026, 15:30 - 23:30 Mexico Central Time (UTC-6 -> 21:30Z to 05:30Z next day)
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Daniela Aylen XV//Invitacion Digital//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:daniela-aylen-xv-2026@invitacion',
      'DTSTAMP:20261122T120000Z',
      'DTSTART:20261219T213000Z',
      'DTEND:20261220T053000Z',
      'SUMMARY:XV Años de Daniela Aylen Lara Quistiano',
      'DESCRIPTION:Una noche especial está por llegar. ¡Te esperamos!\\nPapás: Sergio Lara Muñoz y Marlene Quistiano Lara\\nPadrinos: Geovany Lara Flores y Mariela Badillo Saucedo\\n\\nHorarios:\\n- Misa: 3:30 pm en Parroquia de Papalotla (https://maps.app.goo.gl/154zJtA4wKnbMP8MA)\\n- Recepción: 4:30 pm en Salón Oasis (https://maps.app.goo.gl/PTvKgszfCb8MqS4W7)\\n- Vals: 8:00 pm\\n- Fiesta: 9:00 pm\\n- Banda: 11:00 pm',
      'LOCATION:Parroquia de Papalotla / Salón Oasis',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'XV-Daniela-Aylen-19-Dic-2026.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast('¡Fecha guardada! Revisa tu archivo de calendario');
  }

  if (saveCalendarBtn) {
    saveCalendarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = saveCalendarBtn.getBoundingClientRect();
      spawnSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
      downloadCalendarEvent();
    });
  }
})();
