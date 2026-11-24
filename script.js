/* ==========================================================================
   DANIELA AYLEN — MIS XV AÑOS
   Fluttering Butterflies Canvas, Manual Music Player, Countdown & Interactions
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
     2. INTERACTIVE MUSIC PLAYER (MANUAL PLAY ONLY — NO AUTOPLAY)
     ------------------------------------------------------------------------ */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggleBtn = document.getElementById('musicToggle');
  const playerPlayBtn = document.getElementById('playerPlayBtn');
  const playerSeek = document.getElementById('playerSeek');
  const playerCurrentTime = document.getElementById('playerCurrentTime');
  const playerDuration = document.getElementById('playerDuration');
  const musicPrompt = document.getElementById('musicPrompt');
  let fadeInterval = null;
  let isSeeking = false;

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function updateSeekVisual(pct) {
    if (!playerSeek) return;
    const clamped = Math.max(0, Math.min(100, pct));
    playerSeek.value = String(clamped);
    playerSeek.style.setProperty('--progress', `${clamped}%`);
  }

  function syncMusicUI(playing) {
    if (musicToggleBtn) {
      musicToggleBtn.classList.toggle('is-playing', playing);
      musicToggleBtn.setAttribute('aria-label', playing ? 'Pausar música' : 'Reproducir música');
    }
    if (playerPlayBtn) {
      playerPlayBtn.classList.toggle('is-playing', playing);
      playerPlayBtn.setAttribute(
        'aria-label',
        playing ? 'Pausar See You Again' : 'Reproducir See You Again'
      );
    }
    if (musicPrompt) {
      musicPrompt.textContent = playing
        ? 'Reproduciendo · Puedes pausarla cuando gustes'
        : 'Dale Play para escuchar mientras lees la invitación';
    }
  }

  function fadeInAudio(audioEl, targetVolume = 0.85, durationMs = 1100) {
    if (!audioEl) return;
    clearInterval(fadeInterval);
    try {
      audioEl.volume = 0.08;
    } catch {
      return;
    }
    const steps = 20;
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

  function startSong(withToast = true) {
    if (!bgMusic) return;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(() => {
          fadeInAudio(bgMusic, 0.85, 1100);
          syncMusicUI(true);
          if (withToast) showToast('♪ Reproduciendo: See You Again');
        })
        .catch(() => {
          syncMusicUI(false);
        });
    } else {
      fadeInAudio(bgMusic, 0.85, 1100);
      syncMusicUI(true);
      if (withToast) showToast('♪ Reproduciendo: See You Again');
    }
  }

  function pauseSong(withToast = true) {
    if (!bgMusic) return;
    clearInterval(fadeInterval);
    bgMusic.pause();
    syncMusicUI(false);
    if (withToast) showToast('Música pausada');
  }

  function toggleSong() {
    if (!bgMusic || bgMusic.paused) {
      startSong(true);
    } else {
      pauseSong(true);
    }
  }

  if (bgMusic) {
    bgMusic.addEventListener('loadedmetadata', () => {
      if (playerDuration && Number.isFinite(bgMusic.duration)) {
        playerDuration.textContent = formatTime(bgMusic.duration);
      }
    });

    bgMusic.addEventListener('timeupdate', () => {
      if (isSeeking || !bgMusic.duration) return;
      const pct = (bgMusic.currentTime / bgMusic.duration) * 100;
      updateSeekVisual(pct);
      if (playerCurrentTime) {
        playerCurrentTime.textContent = formatTime(bgMusic.currentTime);
      }
    });

    bgMusic.addEventListener('play', () => syncMusicUI(true));
    bgMusic.addEventListener('pause', () => syncMusicUI(false));
  }

  if (playerPlayBtn) {
    playerPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = playerPlayBtn.getBoundingClientRect();
      spawnButterflyBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 4);
      toggleSong();
    });
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSong();
    });
  }

  if (playerSeek && bgMusic) {
    playerSeek.addEventListener('input', () => {
      isSeeking = true;
      const pct = Number(playerSeek.value);
      updateSeekVisual(pct);
      if (bgMusic.duration && playerCurrentTime) {
        playerCurrentTime.textContent = formatTime((pct / 100) * bgMusic.duration);
      }
    });

    playerSeek.addEventListener('change', () => {
      const pct = Number(playerSeek.value);
      if (bgMusic.duration) {
        bgMusic.currentTime = (pct / 100) * bgMusic.duration;
      }
      isSeeking = false;
    });
  }

  /* ------------------------------------------------------------------------
     3. FULL-SCREEN BUTTERFLIES & ROSE PETALS CANVAS ENGINE
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('butterfly-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let width = window.innerWidth;
  let height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const petals = [];
  const butterflies = [];
  const burstButterflies = [];

  const BUTTERFLY_PALETTES = [
    { upper: '#e2b969', lower: '#d09b46', stroke: '#8f622a', body: '#6e4a1f' }, // Champagne Gold
    { upper: '#ef88ab', lower: '#dc658e', stroke: '#9f4062', body: '#733049' }, // Vivid Rose Pink
    { upper: '#98bc9f', lower: '#6d9476', stroke: '#45694f', body: '#375440' }, // Botanical Sage
    { upper: '#f4d99b', lower: '#e79ab6', stroke: '#9b6c38', body: '#724d24' }, // Rose-Gold Shimmer
  ];

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
      size: 5 + Math.random() * 7,
      vy: 0.34 + Math.random() * 0.58,
      vx: -0.25 + Math.random() * 0.5,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.018,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: -0.014 + Math.random() * 0.028,
      opacity: 0.32 + Math.random() * 0.34,
      color: Math.random() > 0.45 ? '#ef8fb0' : '#f7b9ce',
    };
  }

  function createButterfly(randomPos = true) {
    const palette = BUTTERFLY_PALETTES[Math.floor(Math.random() * BUTTERFLY_PALETTES.length)];
    const dir = Math.random() > 0.5 ? 1 : -1;
    return {
      x: randomPos ? Math.random() * width : dir > 0 ? -30 : width + 30,
      y: randomPos ? Math.random() * height : Math.random() * height,
      size: 7.5 + Math.random() * 7.5,
      vx: dir * (0.35 + Math.random() * 0.65),
      vy: -0.22 - Math.random() * 0.35,
      wavePhase: Math.random() * Math.PI * 2,
      waveSpeed: 0.018 + Math.random() * 0.02,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.14 + Math.random() * 0.09,
      opacity: 0.55 + Math.random() * 0.35,
      palette,
    };
  }

  function spawnButterflyBurst(x, y, count = 8) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 1.1 + Math.random() * 2.5;
      const palette = BUTTERFLY_PALETTES[Math.floor(Math.random() * BUTTERFLY_PALETTES.length)];
      burstButterflies.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.65,
        size: 5.5 + Math.random() * 5,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.22 + Math.random() * 0.1,
        alpha: 0.95,
        decay: 0.013 + Math.random() * 0.01,
        palette,
      });
    }
  }

  function spawnTrailButterfly(x, y) {
    if (prefersReducedMotion || burstButterflies.length > 14) return;
    const palette = BUTTERFLY_PALETTES[Math.floor(Math.random() * BUTTERFLY_PALETTES.length)];
    burstButterflies.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.5 - Math.random() * 0.65,
      size: 4.5 + Math.random() * 3.2,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.22,
      alpha: 0.78,
      decay: 0.022,
      palette,
    });
  }

  function drawButterfly(context, x, y, size, angle, wingOpen, palette, alpha) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.globalAlpha = Math.max(0, alpha);

    // Wing flap compression along X axis
    const flap = 0.24 + Math.abs(Math.cos(wingOpen)) * 0.76;

    // Draw both left & right symmetrical wings
    for (const side of [-1, 1]) {
      context.save();
      context.scale(side * flap, 1);

      // Upper wing
      context.fillStyle = palette.upper;
      context.strokeStyle = palette.stroke;
      context.lineWidth = 0.75;
      context.beginPath();
      context.moveTo(0, -size * 0.15);
      context.bezierCurveTo(
        size * 0.65, -size * 1.15,
        size * 1.45, -size * 0.65,
        size * 1.05, size * 0.15
      );
      context.quadraticCurveTo(size * 0.5, size * 0.25, 0, size * 0.05);
      context.closePath();
      context.fill();
      context.stroke();

      // Lower wing
      context.fillStyle = palette.lower;
      context.beginPath();
      context.moveTo(0, size * 0.05);
      context.bezierCurveTo(
        size * 0.95, size * 0.2,
        size * 0.85, size * 1.05,
        size * 0.28, size * 0.88
      );
      context.quadraticCurveTo(size * 0.08, size * 0.65, 0, size * 0.28);
      context.closePath();
      context.fill();
      context.stroke();

      context.restore();
    }

    // Delicate body & antennae
    context.fillStyle = palette.body;
    context.beginPath();
    context.ellipse(0, size * 0.12, size * 0.11, size * 0.42, 0, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = palette.body;
    context.lineWidth = 0.65;
    context.beginPath();
    context.moveTo(-size * 0.05, -size * 0.26);
    context.quadraticCurveTo(-size * 0.22, -size * 0.52, -size * 0.34, -size * 0.56);
    context.moveTo(size * 0.05, -size * 0.26);
    context.quadraticCurveTo(size * 0.22, -size * 0.52, size * 0.34, -size * 0.56);
    context.stroke();

    context.restore();
  }

  function drawPetal(context, p) {
    context.save();
    context.translate(p.x, p.y);
    context.rotate(p.rotation);
    context.globalAlpha = p.opacity;

    const grad = context.createLinearGradient(-p.size, -p.size, p.size, p.size);
    grad.addColorStop(0, '#fff7fa');
    grad.addColorStop(0.55, p.color);
    grad.addColorStop(1, '#d8668d');

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

    const petalCount = width < 640 ? 8 : 12;
    const butterflyCount = width < 640 ? 4 : 7;

    petals.length = 0;
    butterflies.length = 0;
    for (let i = 0; i < petalCount; i += 1) petals.push(createPetal(true));
    for (let i = 0; i < butterflyCount; i += 1) butterflies.push(createButterfly(true));

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

      // Ambient fluttering butterflies
      for (let i = 0; i < butterflies.length; i += 1) {
        const bf = butterflies[i];
        bf.wavePhase += bf.waveSpeed;
        bf.wingPhase += bf.wingSpeed;
        const dy = bf.vy + Math.sin(bf.wavePhase) * 0.42;
        const dx = bf.vx + Math.cos(bf.wavePhase * 0.7) * 0.25;
        bf.x += dx;
        bf.y += dy;

        if (bf.y < -40) {
          bf.y = height + 30;
          bf.x = Math.random() * width;
        }
        if (bf.x < -45) bf.x = width + 35;
        if (bf.x > width + 45) bf.x = -35;

        const heading = Math.atan2(dy, dx) + Math.PI / 2;
        drawButterfly(ctx, bf.x, bf.y, bf.size, heading * 0.35, bf.wingPhase, bf.palette, bf.opacity);
      }

      // Interactive burst & pointer-trail butterflies
      for (let i = burstButterflies.length - 1; i >= 0; i -= 1) {
        const b = burstButterflies[i];
        b.wingPhase += b.wingSpeed;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.985;
        b.vy = b.vy * 0.985 - 0.015;
        b.alpha -= b.decay;

        if (b.alpha <= 0) {
          burstButterflies.splice(i, 1);
          continue;
        }

        const heading = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        drawButterfly(ctx, b.x, b.y, b.size, heading * 0.4, b.wingPhase, b.palette, b.alpha);
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  initParticles();

  // Subtle butterfly trail on pointer move & light flutter on tap
  let lastTrailTime = 0;
  window.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      if (now - lastTrailTime > 420) {
        lastTrailTime = now;
        spawnTrailButterfly(e.clientX, e.clientY);
      }
    },
    { passive: true }
  );

  window.addEventListener('pointerdown', (e) => {
    spawnButterflyBurst(e.clientX, e.clientY, 2);
  });

  /* ------------------------------------------------------------------------
     4. INTRO CURTAIN / ROYAL SEAL OPENING (NO AUTOPLAY MUSIC)
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
      spawnButterflyBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    }

    // Music does NOT autoplay here — guest chooses when to press Play
    syncMusicUI(false);

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
      void el.offsetWidth;
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
      'DESCRIPTION:Hay momentos inolvidables que se atesoran en el corazón para siempre, por esa razón, quiero que celebres conmigo éste día tan especial.\\n\\nPapás: Sergio Lara Muñoz y Marlene Quistiano Lara\\nPadrinos: Geovany Lara Flores y Mariela Badillo Saucedo\\n\\nHorarios:\\n- Misa: 3:30 pm en Parroquia de Papalotla (https://maps.app.goo.gl/154zJtA4wKnbMP8MA)\\n- Recepción: 4:00 pm en Salón Oasis (https://maps.app.goo.gl/PTvKgszfCb8MqS4W7)\\n- Vals: 8:00 pm\\n- Fiesta: 9:00 pm\\n- Banda: 11:00 pm',
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
      spawnButterflyBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 5);
      downloadCalendarEvent();
    });
  }

  /* ------------------------------------------------------------------------
     9. WHATSAPP RSVP CONFIRMATION (+52 1 272 100 8243)
     ------------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = '5212721008243';
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpName = document.getElementById('rsvpName');
  const rsvpGuests = document.getElementById('rsvpGuests');
  const rsvpGuestsWrap = document.getElementById('rsvpGuestsWrap');
  const rsvpMessage = document.getElementById('rsvpMessage');
  const rsvpPills = document.querySelectorAll('.rsvp-pill');
  const whatsappConfirmBtn = document.getElementById('whatsappConfirmBtn');
  let attendChoice = 'si';

  rsvpPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      attendChoice = pill.dataset.attend || 'si';
      rsvpPills.forEach((btn) => {
        const active = btn === pill;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (rsvpGuestsWrap) {
        rsvpGuestsWrap.classList.toggle('is-disabled', attendChoice === 'no');
      }
    });
  });

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = rsvpName ? rsvpName.value.trim() : '';
      const guests = rsvpGuests ? rsvpGuests.value : '2';
      const note = rsvpMessage ? rsvpMessage.value.trim() : '';

      const lines = [];
      if (attendChoice === 'si') {
        lines.push('¡Hola! Confirmo con mucho gusto mi asistencia a los XV años de Daniela Aylen (19 de diciembre de 2026). 👑🦋');
        if (name) lines.push(`Nombre / Familia: ${name}`);
        lines.push(`Personas: ${guests === '6' ? '6 o más' : guests}`);
      } else {
        lines.push('¡Hola! Muchas gracias por la invitación a los XV años de Daniela Aylen, lamentablemente en esta ocasión no podré asistir. Les deseo una noche maravillosa. 🌸');
        if (name) lines.push(`Nombre / Familia: ${name}`);
      }

      if (note) {
        lines.push(`Mensaje: ${note}`);
      }

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;

      if (whatsappConfirmBtn) {
        const rect = whatsappConfirmBtn.getBoundingClientRect();
        spawnButterflyBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 6);
      }

      showToast('Abriendo WhatsApp para enviar tu confirmación...');
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }
})();
