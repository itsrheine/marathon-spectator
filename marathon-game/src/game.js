(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────
  const stage = document.getElementById('stage');
  const crowd = document.getElementById('crowd');
  const sky   = document.getElementById('sky');
  const hint  = document.getElementById('hint');
  const ads   = document.getElementById('ads');

  // ── Stats ─────────────────────────────────────────────────
  const stats = { helped: 0, stop: 0, turned: 0, slip: 0, bump: 0 };
  function updateStats() {
    for (const k in stats) document.getElementById('stat-' + k).textContent = stats[k];
  }

  // ── Name pools (gender-separated) ────────────────────────
  const FEMALE_NAMES = [
    'Isabelle','Rheine','Bettina','Sophie','Aisha','Priya',
    'Olivia','Yuki','Emma','Nadia','Carmen','Zoe','Lucia','Greta',
  ];
  const MALE_NAMES = [
    'Pedro','Mateo','Dylan','Michael','Kevin','Andre',
    'Marcus','Liam','Chen','Diego','Hiro','Theo','Felix','Bruno',
  ];
  const usedNames = new Set();

  function pickName(gender) {
    const pool = gender === 'F' ? FEMALE_NAMES : MALE_NAMES;
    const available = pool.filter(n => !usedNames.has(n));
    const source = available.length > 0 ? available : pool;
    const name = source[Math.floor(Math.random() * source.length)];
    usedNames.add(name);
    return name;
  }

  // ── Sky: clouds ───────────────────────────────────────────
  const clouds = [];
  function makeCloud(x, y, scale) {
    const el = document.createElement('div');
    el.className = 'cloud';
    el.style.cssText = `left:${x}px;top:${y}px;width:${50 * scale}px;`;
    el.style.opacity = 0.6 + Math.random() * 0.4;
    el.innerHTML = `<svg viewBox="0 0 60 24" style="width:100%">
      <ellipse cx="14" cy="16" rx="10" ry="7"  fill="#fff"/>
      <ellipse cx="26" cy="12" rx="13" ry="9"  fill="#fff"/>
      <ellipse cx="40" cy="14" rx="11" ry="8"  fill="#fff"/>
      <ellipse cx="50" cy="17" rx="8"  ry="6"  fill="#fff"/>
    </svg>`;
    sky.appendChild(el);
    clouds.push({ el, x, speed: 0.03 + Math.random() * 0.08 });
    
  }
  makeCloud(40,  60, 0.9);
  makeCloud(180, 80, 0.7);
  makeCloud(280, 50, 1.0);
  makeCloud(100,  40, 0.8);
  makeCloud(220,  70, 0.6);
  makeCloud(320,  30, 1.2);
  makeCloud(60,  90, 0.7);
  makeCloud(260,  20, 0.9);

  function moveClouds() {
    for (const c of clouds) {
      c.x += c.speed;
      if (c.x > stage.offsetWidth + 60) c.x = -60;
      c.el.style.left = c.x + 'px';
    }
    requestAnimationFrame(moveClouds);
  }
  moveClouds();

  // ── Sky: blimp (no banner) ────────────────────────────────
  const blimp = document.createElement('div');
  blimp.className = 'blimp';
  blimp.style.cssText = 'width:90px;top:30px;';
  blimp.innerHTML = `<svg viewBox="0 0 100 36" style="width:100%">
    <ellipse cx="50" cy="18" rx="42" ry="13" fill="#e24b4a" stroke="#7a1414" stroke-width="0.8"/>
    <ellipse cx="50" cy="14" rx="38" ry="4"  fill="#fff" opacity="0.25"/>
    <path d="M88 18 L98 11 L98 25 Z" fill="#7a1414"/>
    <path d="M88 18 L82 7  L92 13 Z" fill="#a32d2d"/>
    <path d="M88 18 L82 29 L92 23 Z" fill="#a32d2d"/>
    <rect x="40" y="29" width="22" height="5" rx="2" fill="#444"/>
    <circle cx="45" cy="32" r="0.9" fill="#fac775"/>
    <circle cx="51" cy="32" r="0.9" fill="#fac775"/>
    <circle cx="57" cy="32" r="0.9" fill="#fac775"/>
    <line x1="44" y1="29" x2="40" y2="25" stroke="#222" stroke-width="0.5"/>
    <line x1="58" y1="29" x2="62" y2="25" stroke="#222" stroke-width="0.5"/>
  </svg>`;
  sky.appendChild(blimp);

  let blimpX = -120, blimpDir = 1;
  function moveBlimp() {
    blimpX += 0.25 * blimpDir;
    if (blimpX > stage.offsetWidth + 30) { blimpDir = -1; blimp.style.transform = 'scaleX(-1)'; }
    else if (blimpX < -120)              { blimpDir =  1; blimp.style.transform = ''; }
    blimp.style.left = blimpX + 'px';
    requestAnimationFrame(moveBlimp);
  }
  moveBlimp();

  // ── Sponsor banners on railing ────────────────────────────
  const SPONSORS = [
    { text: 'NIKK',     bg: '#fa6900', fg: '#fff' },
    { text: 'GPBS',bg: '#f47216', fg: '#fff' },
    { text: 'ASIKZ',    bg: '#1a4ba8', fg: '#fff' },
    { text: 'BANK',     bg: '#0e7c3a', fg: '#fff' },
    { text: 'NEWSDAY',  bg: '#222',    fg: '#fff' },
    { text: 'POWRADE',  bg: '#d12626', fg: '#fff' },
    { text: 'CITY26',   bg: '#ffd23f', fg: '#222' },
    { text: 'GOFAST',   bg: '#7f2eb8', fg: '#fff' },
    { text: 'STRIDE',   bg: '#0bbacd', fg: '#fff' },
  ];
  for (let i = 0; i < 8; i++) {
    const s = SPONSORS[Math.floor(Math.random() * SPONSORS.length)];
    const b = document.createElement('div');
    b.className = 'ad-banner';
    b.textContent = s.text;
    b.style.background = s.bg;
    b.style.color = s.fg;
    ads.appendChild(b);
  }

  // ── Audio ─────────────────────────────────────────────────
  let audioCtx = null, noiseGain = null, audioOn = false;
  document.getElementById('audio-toggle').addEventListener('click', function () {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const bufSize = 2 * audioCtx.sampleRate;
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + w * 0.099;
        b1 = 0.963 * b1 + w * 0.296;
        b2 = 0.57  * b2 + w * 1.05;
        data[i] = (b0 + b1 + b2) * 0.13;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf; noise.loop = true;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 800; filter.Q.value = 0.7;
      const gain = audioCtx.createGain(); gain.gain.value = 0;
      noise.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
      noise.start();
      noiseGain = gain;
    }
    audioOn = !audioOn;
    audioCtx.resume();
    noiseGain.gain.linearRampToValueAtTime(audioOn ? 0.18 : 0, audioCtx.currentTime + 0.4);
    this.textContent = audioOn ? '🔊 sound' : '🔇 mute';
  });

  function audioSwell(intensity = 0.08) {
    if (!audioOn || !noiseGain) return;
    const t = audioCtx.currentTime;
    noiseGain.gain.cancelScheduledValues(t);
    const cur = noiseGain.gain.value;
    noiseGain.gain.setValueAtTime(cur, t);
    noiseGain.gain.linearRampToValueAtTime(Math.min(0.4, cur + intensity), t + 0.2);
    noiseGain.gain.linearRampToValueAtTime(0.18, t + 1.2);
  }

  // ── Crowd spectators ──────────────────────────────────────
  const CROWD_COLORS = [
    '#e24b4a','#378add','#1d9e75','#ba7517',
    '#7f77dd','#d4537e','#888780','#fac775','#5dcaa5',
  ];
  const POSTER_TEXTS = [
    ['GO','MOM!'],['RUN','DAD'],['#1','FAN'],['MY','HERO'],
    ['GO','BABE'],['YOU','ROCK'],['💪','💪'],['🔥','🔥'],
  ];
  const POSTER_BGS = ['#FAEEDA','#E6F1FB','#E1F5EE','#FCEBEB','#EEEDFE','#FAF6E7'];
  const crowdMembers = [];

  for (let i = 0; i < 26; i++) {
    const el = document.createElement('div');
    el.className = 'spec';
    el.style.background = CROWD_COLORS[Math.floor(Math.random() * CROWD_COLORS.length)];
    el.style.height = (18 + Math.random() * 10) + 'px';
    if (Math.random() < 0.25) {
      const poster = document.createElement('div');
      poster.className = 'poster';
      const txt = POSTER_TEXTS[Math.floor(Math.random() * POSTER_TEXTS.length)];
      poster.innerHTML = txt.join('<br>');
      poster.style.background = POSTER_BGS[Math.floor(Math.random() * POSTER_BGS.length)];
      poster.style.transform = `translateX(-50%) rotate(${Math.random() * 16 - 8}deg)`;
      el.appendChild(poster);
    }
    crowd.appendChild(el);
    crowdMembers.push({ el });
  }

  // ── Crowd dialogue ────────────────────────────────────────
  const GENERIC_SHOUTS  = ['GOOOO!!','strong!','wooo!!','LETS GOOO','flying!','champ!','almost there!','BEAST MODE'];
  const CONCERN_SHOUTS  = ['oh no!','OH NO','help!','*gasps*','poor thing','medic!!','jeez!', 'what a day!'];

  function namedShout(name) {
    const opts = [
      `GO ${name.toUpperCase()}!!`, `${name}!! you got this!`, `looking good ${name}!`,
      `WE LOVE YOU ${name.toUpperCase()}`, `come on ${name}!`, `proud of you ${name} 🥹`,
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  function specBubble(spec, text, cls = '') {
    const b = document.createElement('div');
    b.className = 'spec-bubble' + (cls ? ' ' + cls : '');
    b.textContent = text;
    spec.el.appendChild(b);
    setTimeout(() => b.remove(), 1800);
  }

  function nearestSpec(runner) {
    const w = stage.offsetWidth;
    const idx = Math.floor((runner.x / w) * crowdMembers.length);
    return crowdMembers[Math.max(0, Math.min(crowdMembers.length - 1, idx))];
  }

  function randomCheer() {
    const visible = runners.filter(r => r.x > 0 && r.x < stage.offsetWidth && !r.fallen);
    if (visible.length > 0 && Math.random() < 0.6) {
      const target = visible[Math.floor(Math.random() * visible.length)];
      const spec = nearestSpec(target);
      spec.el.classList.add('cheering');
      setTimeout(() => spec.el.classList.remove('cheering'), 400);
      specBubble(spec, namedShout(target.name), 'named');
    } else {
      const spec = crowdMembers[Math.floor(Math.random() * crowdMembers.length)];
      spec.el.classList.add('cheering');
      setTimeout(() => spec.el.classList.remove('cheering'), 400);
      if (Math.random() < 0.6) specBubble(spec, GENERIC_SHOUTS[Math.floor(Math.random() * GENERIC_SHOUTS.length)]);
    }
    if (Math.random() < 0.3) audioSwell(0.06);
  }

  function scheduleCheer() {
    if (!emergency) randomCheer();
    setTimeout(scheduleCheer, 1100 + Math.random() * 1800);
  }
  setTimeout(scheduleCheer, 800);

  function crowdReact(centerX, shouts) {
    const w = stage.offsetWidth;
    const ci = Math.floor((centerX / w) * crowdMembers.length);
    audioSwell(0.15);
    for (let i = Math.max(0, ci - 5); i < Math.min(crowdMembers.length, ci + 5); i++) {
      const spec = crowdMembers[i];
      setTimeout(() => {
        spec.el.classList.add('gasping');
        setTimeout(() => spec.el.classList.remove('gasping'), 600);
        if (Math.random() < 0.5) specBubble(spec, shouts[Math.floor(Math.random() * shouts.length)], 'concern');
      }, Math.random() * 400);
    }
  }

  // ── Runner archetypes ─────────────────────────────────────
  const ARCHETYPES = [
    { shirt:'#e24b4a', shorts:'#1a1a1a', skin:'#f4c4a0', p:'pro',     bib:'001', g:'M', hair:'short', hc:'#3a2820' },
    { shirt:'#d4537e', shorts:'#1a1a1a', skin:'#f4c4a0', p:'pro',     bib:'002', g:'F', hair:'pony',  hc:'#5a3a20' },
    { shirt:'#378add', shorts:'#444',    skin:'#d9a574', p:'happy',   bib:'247', g:'M', hair:'short', hc:'#222'    },
    { shirt:'#7f77dd', shorts:'#1a1a1a', skin:'#e8c0a0', p:'happy',   bib:'326', g:'F', hair:'pony',  hc:'#3a2820' },
    { shirt:'#f5c4b3', shorts:'#5a5550', skin:'#c98c63', p:'tired',   bib:'588', g:'M', hair:'short', hc:'#1a1a1a' },
    { shirt:'#1d9e75', shorts:'#222',    skin:'#e8b48a', p:'happy',   bib:'412', g:'F', hair:'bun',   hc:'#4a2a18' },
    { shirt:'#ba7517', shorts:'#1a1a1a', skin:'#a87858', p:'salty',   bib:'003', g:'M', hair:'bald',  hc:'#888'    },
    { shirt:'#5dcaa5', shorts:'#222',    skin:'#e0a87c', p:'salty',   bib:'014', g:'F', hair:'pony',  hc:'#222'    },
    { shirt:'#fac775', shorts:'#e24b4a', skin:'#e0a87c', p:'gullible',bib:'777', g:'M', hair:'short', hc:'#3a2820' },
    { shirt:'#5dcaa5', shorts:'#333',    skin:'#dcb088', p:'gullible',bib:'512', g:'F', hair:'bun',   hc:'#5a3a20' },
    { shirt:'#185fa5', shorts:'#000',    skin:'#e8c0a0', p:'pro',     bib:'108', g:'F', hair:'pony',  hc:'#fac775' },
    { shirt:'#ff6f91', shorts:'#222',    skin:'#f1c27d', p:'happy',   bib:'639', g:'F', hair:'pony',  hc:'#5a2a1a' },
    { shirt:'#6a4c93', shorts:'#1a1a1a', skin:'#e0ac69', p:'tired',   bib:'842', g:'F', hair:'bun',  hc:'#1a1a1a' },
    { shirt:'#00b894', shorts:'#333',    skin:'#d2a679', p:'salty',   bib:'275', g:'F', hair:'pony',  hc:'#3b2f2f' },
    { shirt:'#0984e3', shorts:'#111',    skin:'#f4c4a0', p:'gullible', bib:'918', g:'F', hair:'pony', hc:'#8b4513' }
  ];
  const WC_ARCHETYPES = [
    { shirt:'#185fa5', shorts:'#1a1a1a', skin:'#e8c0a0', p:'pro', bib:'W01', g:'M', hair:'short', hc:'#3a2820', wc:true },
    { shirt:'#e24b4a', shorts:'#1a1a1a', skin:'#dcb088', p:'pro', bib:'W02', g:'F', hair:'pony',  hc:'#222',    wc:true },
  ];

  // ── SVG builders ──────────────────────────────────────────
  function makeHair(a) {
    if (a.hair === 'bald')  return '';
    if (a.hair === 'short') return `<path d="M20 14 Q20 7 29 7 Q38 7 38 14 L38 12 Q38 9 29 9 Q20 9 20 12 Z" fill="${a.hc}"/>`;
    if (a.hair === 'pony')  return `<ellipse cx="22" cy="16" rx="3" ry="6" fill="${a.hc}"/>
      <path d="M19 10 Q19 6 29 6 Q39 6 39 14 Q39 11 29 11 Q22 11 19 14 Z" fill="${a.hc}"/>`;
    if (a.hair === 'bun')   return `<circle cx="29" cy="6.5" r="3.5" fill="${a.hc}"/>
      <path d="M19 11 Q19 7 29 7 Q39 7 39 13 Q39 11 29 11 Q22 11 19 13 Z" fill="${a.hc}"/>`;
    return '';
  }

  function makeRunnerSVG(a) {
    const sL = a.g === 'F' ? 19.5 : 18, sR = a.g === 'F' ? 36.5 : 38;
    return `<svg viewBox="0 0 56 90" style="width:100%;height:100%">
      <ellipse cx="28" cy="86" rx="14" ry="3" fill="rgba(0,0,0,0.25)"/>
      <rect class="leg-back"  x="22" y="55" width="6" height="22" rx="2" fill="${a.shorts}"/>
      <rect class="leg-front" x="30" y="55" width="6" height="22" rx="2" fill="${a.shorts}"/>
      <ellipse cx="25" cy="80" rx="5" ry="3" fill="#fff"/>
      <ellipse cx="33" cy="80" rx="5" ry="3" fill="#fff"/>
      <rect x="20" y="48" width="18" height="12" rx="3" fill="${a.shorts}"/>
      <path d="M${sL} 30 Q${sL} 26 ${sL+4} 26 L${sR-4} 26 Q${sR} 26 ${sR} 30 L40 50 L18 50 Z" fill="${a.shirt}"/>
      <rect x="23" y="34" width="12" height="9" rx="1" fill="white"/>
      <text x="29" y="40.5" text-anchor="middle" style="font-family:system-ui,sans-serif;font-size:8px;font-weight:500;fill:#333;">${a.bib}</text>
      <rect class="arm-back"  x="14" y="30" width="5" height="16" rx="2.5" fill="${a.shirt}"/>
      <rect class="arm-front" x="38" y="30" width="5" height="16" rx="2.5" fill="${a.shirt}"/>
      <circle cx="16.5" cy="48" r="3" fill="${a.skin}"/>
      <circle cx="40.5" cy="48" r="3" fill="${a.skin}"/>
      <rect x="25" y="22" width="8" height="6" fill="${a.skin}"/>
      <circle cx="29" cy="16" r="9" fill="${a.skin}"/>
      ${makeHair(a)}
      <circle cx="32" cy="16" r="0.9" fill="#222"/>
    </svg>`;
  }

  function makeWcSVG(a) {
    const helmet = a.shirt === '#185fa5' ? '#0a3a6a' : '#7a1414';
    return `<svg viewBox="0 0 70 70" style="width:100%;height:100%">
      <ellipse cx="35" cy="66" rx="22" ry="3" fill="rgba(0,0,0,0.25)"/>
      <circle cx="22" cy="50" r="14" fill="none" stroke="#222" stroke-width="2.5"/>
      <circle cx="22" cy="50" r="3" fill="#444"/>
      <g class="wheel-spokes" style="transform-origin:22px 50px">
        <line x1="22" y1="38" x2="22" y2="62" stroke="#444" stroke-width="0.8"/>
        <line x1="10" y1="50" x2="34" y2="50" stroke="#444" stroke-width="0.8"/>
        <line x1="14" y1="42" x2="30" y2="58" stroke="#444" stroke-width="0.8"/>
        <line x1="14" y1="58" x2="30" y2="42" stroke="#444" stroke-width="0.8"/>
      </g>
      <circle cx="50" cy="58" r="6"  fill="none" stroke="#222" stroke-width="1.5"/>
      <circle cx="50" cy="58" r="1.5" fill="#444"/>
      <line x1="22" y1="50" x2="42" y2="40" stroke="#444" stroke-width="2"/>
      <line x1="42" y1="40" x2="50" y2="58" stroke="#444" stroke-width="2"/>
      <rect x="28" y="34" width="18" height="4" rx="1" fill="${a.shirt}"/>
      <ellipse cx="38" cy="40" rx="8" ry="4" fill="${a.shorts}"/>
      <path d="M30 34 Q28 28 32 24 L42 22 Q46 26 44 32 L40 36 Z" fill="${a.shirt}"/>
      <rect x="33" y="27" width="9" height="6" rx="1" fill="white"/>
      <text x="37.5" y="31.5" text-anchor="middle" style="font-family:system-ui,sans-serif;font-size:5px;font-weight:600;fill:#333;">${a.bib}</text>
      <circle cx="40" cy="20" r="6" fill="${a.skin}"/>
      <path d="M34 18 Q34 12 41 12 Q47 12 47 19 Q47 22 44 23 L36 23 Z" fill="${helmet}"/>
      <circle cx="42" cy="20" r="0.7" fill="#222"/>
    </svg>`;
  }

  function makeMedicSVG() {
    return `<svg viewBox="0 0 48 80" style="width:100%;height:100%">
      <ellipse cx="24" cy="76" rx="12" ry="2.5" fill="rgba(0,0,0,0.25)"/>
      <rect class="leg-back"  x="18" y="48" width="5" height="20" rx="1.5" fill="#1a1a1a"/>
      <rect class="leg-front" x="25" y="48" width="5" height="20" rx="1.5" fill="#1a1a1a"/>
      <ellipse cx="20.5" cy="71" rx="4" ry="2.5" fill="#222"/>
      <ellipse cx="27.5" cy="71" rx="4" ry="2.5" fill="#222"/>
      <path d="M16 24 Q16 20 20 20 L28 20 Q32 20 32 24 L32 50 L16 50 Z" fill="#f5f5f5" stroke="#333" stroke-width="0.5"/>
      <rect x="22"   y="30"   width="4"   height="1.5" fill="#e24b4a"/>
      <rect x="23.25" y="28.75" width="1.5" height="4" fill="#e24b4a"/>
      <rect class="arm-back"  x="11"  y="24" width="4.5" height="16" rx="1.8" fill="#f5f5f5"/>
      <rect class="arm-front" x="32.5" y="24" width="4.5" height="16" rx="1.8" fill="#f5f5f5"/>
      <circle cx="13"  cy="42" r="2.8" fill="#e8c0a0"/>
      <circle cx="34.5" cy="42" r="2.8" fill="#e8c0a0"/>
      <circle cx="24" cy="11" r="7.5" fill="#e8c0a0"/>
      <path d="M16 10 Q16 4 24 4 Q32 4 32 10 L32 9 Q32 6 24 6 Q16 6 16 9 Z" fill="#fff"/>
      <rect x="22.5" y="6.5"  width="3"   height="1" fill="#e24b4a"/>
      <rect x="23.25" y="6"   width="1.5"  height="2" fill="#e24b4a"/>
    </svg>`;
  }

  // ── Game state ────────────────────────────────────────────
  let selectedRunner = null;
  let emergency      = false;
  let mile           = 0;
  let runnersFinished = 0; 
  const runners      = [];
  const peels        = [];

  // ── Runner factory ────────────────────────────────────────
  function spawnRunner(archetype, lane) {
    const el = document.createElement('div');
    el.className = 'runner' + (archetype.wc ? ' wheelchair' : '');
    el.innerHTML = archetype.wc ? makeWcSVG(archetype) : makeRunnerSVG(archetype);
    el.style.bottom = (4 + lane * 8) + '%';
    el.style.left   = '-60px';
    stage.appendChild(el);

    let baseSpeed = 0.5 + Math.random() * 0.6
      + (archetype.p === 'pro'   ?  0.3 : 0)
      - (archetype.p === 'tired' ?  0.2 : 0);
    if (archetype.wc) baseSpeed = 1.4 + Math.random() * 0.4;

    const runner = {
      el, archetype,
      x: -60, lane,
      baseSpeed, speed: baseSpeed,
      direction: 1, paused: 0,
      bobPhase: Math.random() * Math.PI * 2,
      morale: 1, turnedAround: false,
      fallen: false, beingRescued: false,
      bumpCooldown: 0,
      name: pickName(archetype.g),
      isWc: !!archetype.wc,
    };
    runners.push(runner);

    el.addEventListener('click', e => {
      e.stopPropagation();
      if (runner.fallen || runner.beingRescued) return;
      if (selectedRunner) {
        const prev = selectedRunner.el.querySelector('svg');
        if (prev) prev.style.outline = '';
      }
      selectedRunner = runner;
      const svg = el.querySelector('svg');
      svg.style.outline      = '2px dashed #185FA5';
      svg.style.outlineOffset = '2px';
      hint.textContent = `selected ${runner.name} (#${archetype.bib}) — pick an action`;
    });
  }

  function setFlip(r) {
    if (r.direction === -1) r.el.classList.add('flipped');
    else                    r.el.classList.remove('flipped');
  }

  // ── Banana peel mechanic ──────────────────────────────────
  function dropPeel(runner) {
    const el = document.createElement('div');
    el.className = 'peel';
    el.textContent = '🍌';
    el.style.left = (runner.x + 16) + 'px';
    stage.appendChild(el);
    peels.push({ el, x: runner.x + 16, lane: runner.lane, life: 600 });
  }

  // ── Slip / paramedic ──────────────────────────────────────
  function makeSlip(runner) {
    if (runner.fallen || runner.isWc) return;
    runner.fallen = true; runner.beingRescued = true; runner.paused = 99999;
    runner.el.classList.add('fallen');
    stats.slip++; updateStats();

    const slipTexts = ['AAAAAH!', 'WHOA-', 'OOF', 'OH NO', 'MY ANKLE'];
    const b = document.createElement('div');
    b.className = 'reaction-bubble danger';
    b.textContent = slipTexts[Math.floor(Math.random() * slipTexts.length)];
    if (runner.direction === -1) b.classList.add('flipped');
    runner.el.appendChild(b);
    setTimeout(() => b.remove(), 2400);

    emergency = true;
    crowdReact(runner.x, [`${runner.name}!!`, `is ${runner.name} ok??`].concat(CONCERN_SHOUTS));
    setTimeout(() => sendMedic(runner), 600);
  }

  function sendMedic(fallenRunner) {
    const m = document.createElement('div');
    m.className = 'paramedic';
    m.innerHTML = makeMedicSVG();
    const w = stage.offsetWidth;
    m.style.left = (w + 50) + 'px';
    stage.appendChild(m);

    const targetX = fallenRunner.x + 5;
    let mx = w + 50, frame = 0;
    const interval = setInterval(() => {
      mx -= 3; frame++;
      m.style.left = mx + 'px';
      m.style.transform = `translateY(${Math.sin(frame * 0.4) * 2}px)`;
      const ls = Math.sin(frame * 0.4) * 6;
      const lb = m.querySelector('.leg-back'), lf = m.querySelector('.leg-front');
      if (lb) { lb.style.transform = `translateY(${Math.max(0,ls)}px)`; lf.style.transform = `translateY(${Math.max(0,-ls)}px)`; }

      if (mx <= targetX) {
        clearInterval(interval);
        m.style.transform = '';
        const hb = document.createElement('div');
        hb.className = 'reaction-bubble'; hb.style.bottom = '88%';
        hb.textContent = `you ok ${fallenRunner.name}?`;
        m.appendChild(hb); setTimeout(() => hb.remove(), 2400);

        setTimeout(() => {
          fallenRunner.el.classList.remove('fallen');
          fallenRunner.fallen = false; fallenRunner.beingRescued = false;
          fallenRunner.paused = 0; fallenRunner.morale = Math.max(0.5, fallenRunner.morale - 0.2);
          setTimeout(() => {
            let ef = 0;
            const exit = setInterval(() => {
              mx += 3; ef++;
              m.style.left = mx + 'px'; m.style.transform = 'scaleX(-1)';
              if (mx > w + 50) { clearInterval(exit); m.remove(); emergency = false; }
            }, 30);
          }, 1200);
        }, 2200);
      }
    }, 30);
  }

  // ── Collisions ────────────────────────────────────────────
  function bump(rA, rB) {
    if (rA.fallen || rB.fallen || rA.bumpCooldown > 0 || rB.bumpCooldown > 0) return;
    rA.bumpCooldown = 90; rB.bumpCooldown = 90;
    stats.bump++; updateStats();
    rA.el.classList.add('bumped'); rB.el.classList.add('bumped');
    setTimeout(() => { rA.el.classList.remove('bumped'); rB.el.classList.remove('bumped'); }, 500);

    const burst = document.createElement('div');
    burst.className = 'impact-burst';
    burst.textContent = ['💥', 'BAM!', 'OOF!'][Math.floor(Math.random() * 3)];
    burst.style.left   = ((rA.x + rB.x) / 2 + 20) + 'px';
    burst.style.bottom = (stage.offsetHeight * 0.18) + 'px';
    stage.appendChild(burst);
    setTimeout(() => burst.remove(), 700);

    if (Math.random() < 0.3 && !rA.isWc && !rB.isWc) {
      const faller = rA.baseSpeed < rB.baseSpeed ? rA : rB;
      makeSlip(faller);
    } else {
      [rA, rB].forEach((r, i) => {
        r.paused = 25 + Math.floor(Math.random() * 20);
        const lines = i === 0
          ? [`watch it ${rB.name}!`, 'HEY', '*grunt*']
          : [`my bad ${rA.name}!`, 'OOF', '*stumbles*'];
        setTimeout(() => {
          const b = document.createElement('div');
          b.className = 'reaction-bubble';
          b.textContent = lines[Math.floor(Math.random() * lines.length)];
          if (r.direction === -1) b.classList.add('flipped');
          r.el.appendChild(b); setTimeout(() => b.remove(), 2400);
        }, 200 + i * 300);
      });
    }
  }

  function checkCollisions() {
    for (let i = 0; i < runners.length; i++) {
      for (let j = i + 1; j < runners.length; j++) {
        const a = runners[i], b = runners[j];
        if (a.lane !== b.lane || a.fallen || b.fallen || a.bumpCooldown > 0 || b.bumpCooldown > 0) continue;
        if (Math.abs(a.x - b.x) < 18) {
          const opposing   = a.direction !== b.direction;
          const speedGap   = a.direction === b.direction && Math.abs(a.baseSpeed - b.baseSpeed) > 0.4;
          if (opposing || speedGap) bump(a, b);
        }
      }
    }
  }
  

  // ── Wrong-way correction ──────────────────────────────────
  function shoutCorrection(turnedRunner) {
    const nearby = runners.filter(r =>
      r !== turnedRunner && r.direction === 1 &&
      Math.abs(r.x - turnedRunner.x) < 100 && !r.fallen
    );
    if (nearby.length === 0) return;
    const corrector = nearby[Math.floor(Math.random() * nearby.length)];
    const shouts = [
      `${turnedRunner.name}, wrong way!`, `hey ${turnedRunner.name}!!`,
      `NO ${turnedRunner.name}, this way!`,
    ];
    const b = document.createElement('div');
    b.className = 'reaction-bubble shout';
    b.textContent = shouts[Math.floor(Math.random() * shouts.length)];
    if (corrector.direction === -1) b.classList.add('flipped');
    corrector.el.appendChild(b); setTimeout(() => b.remove(), 2400);

    if (Math.random() < 0.5) {
      setTimeout(() => {
        if (turnedRunner.el.parentNode && turnedRunner.direction === -1 && !turnedRunner.fallen) {
          turnedRunner.direction = 1; turnedRunner.turnedAround = false; setFlip(turnedRunner);
          const re = document.createElement('div');
          re.className = 'reaction-bubble confused';
          re.textContent = ['oh my god', 'OH NO', 'wait WHAT'][Math.floor(Math.random() * 3)];
          turnedRunner.el.appendChild(re); setTimeout(() => re.remove(), 2400);
        }
      }, 800 + Math.random() * 1200);
    }
  }

  // ── Spawn logic ───────────────────────────────────────────
  let spawnTimer = 0;
  function maybeSpawn() {
    if (--spawnTimer > 0) return;
    const useWc = Math.random() < 0.012 && runners.filter(r => r.isWc).length === 0;
    const pool  = useWc ? WC_ARCHETYPES : ARCHETYPES;
    spawnRunner(pool[Math.floor(Math.random() * pool.length)], Math.floor(Math.random() * 3));
    spawnTimer = 60 + Math.floor(Math.random() * 90);
  }

  // ── Main loop ─────────────────────────────────────────────
  let frame = 0;

  function tick() {
    frame++;

    maybeSpawn();
    for (const r of runners) if (r.bumpCooldown > 0) r.bumpCooldown--;

    // Peels
    for (let p = peels.length - 1; p >= 0; p--) {
      const peel = peels[p];
      if (--peel.life <= 0) { peel.el.remove(); peels.splice(p, 1); continue; }
      for (const r of runners) {
        if (r.fallen || r.beingRescued || r.isWc || r.lane !== peel.lane) continue;
        if (Math.abs(r.x - peel.x) < 10 && r.direction === 1 && r.x < peel.x + 10) {
          peel.el.remove(); peels.splice(p, 1); makeSlip(r); break;
        }
      }
    }

    // Runners
    for (let i = runners.length - 1; i >= 0; i--) {
      const r = runners[i];
      const fatigue = Math.max(0.5, 1 - mile * 0.04);
      r.speed = r.baseSpeed * fatigue * r.morale;

      if (r.paused > 0 && !r.fallen) r.paused--;
      else if (!r.fallen) r.x += r.speed * r.direction;
      r.el.style.left = r.x + 'px';

      if (!r.fallen) {
        if (r.isWc) {
          const spokes = r.el.querySelector('.wheel-spokes');
          if (spokes) spokes.style.transform = `rotate(${frame * 12 * r.direction}deg)`;
          if (!r.el.classList.contains('bumped'))
            r.el.style.transform = `translateY(${Math.sin(frame * 0.3 + r.bobPhase) * 0.6}px)`;
        } else {
          const bob = Math.sin(frame * 0.25 + r.bobPhase) * 1.5;
          const ls  = Math.sin(frame * 0.25 + r.bobPhase) * 6;
          if (!r.el.classList.contains('bumped')) r.el.style.transform = `translateY(${bob}px)`;
          const lb = r.el.querySelector('.leg-back'), lf = r.el.querySelector('.leg-front');
          const ab = r.el.querySelector('.arm-back'), af = r.el.querySelector('.arm-front');
          if (lb && r.paused <= 0) {
            lb.style.transform = `translateY(${Math.max(0,  ls)}px)`;
            lf.style.transform = `translateY(${Math.max(0, -ls)}px)`;
            ab.style.transform = `rotate(${-ls}deg)`;
            af.style.transform = `rotate(${ls}deg)`;
          }
        }
      }

      if (r.turnedAround && !r.fallen && frame % 90 === Math.floor(Math.random() * 90))
        if (Math.random() < 0.3) shoutCorrection(r);

      const w = stage.offsetWidth;
        if (r.x > w + 70 || r.x < -100) {

          if (r.direction === 1 && !r.fallen) {
            runnersFinished++;

            if (runnersFinished % 44 === 0 && mile < 26) {
              mile++;
              document.getElementById('mile').textContent = mile;
            }
          }

          r.el.remove();

          if (selectedRunner === r) {
            selectedRunner = null;
            hint.textContent = 'tap a runner, then pick an action';
          }

          usedNames.delete(r.name);
          runners.splice(i, 1);
        }
      }

    checkCollisions();
    requestAnimationFrame(tick);
  }

  // ── Reaction sets ─────────────────────────────────────────
  const REACTIONS = {
    pro:      { water:['*grabs*','thx'],         banana:['nice','*peels*'],      gel:['perfect','*nods*'],    cowbell:['🤘','lfg'],          cheer:['*nods*','thx'],        compliment:['*smirks*','I know 😎'], insult:['lol nope','*speeds up*', 'what a day!'],   confuse:['*ignores*','nice try']  },
    happy:    { water:['THANK YOU 💖','lifesaver!!'],banana:['my hero!!','YESSS'],gel:['bless you','⚡⚡⚡'], cowbell:['MORE COWBELL','wooo!!'],cheer:['THANK YOU','*blows kiss*'],compliment:['*beams*','AWWW'],     insult:['*laughs*','fair fair'],     confuse:['wait... really?','are you sure??'] },
    tired:    { water:['oh god thank you','YOU SAVED ME'],banana:['food. yes.','angel...'],gel:['I might live','please work'],cowbell:['*flinches*','too loud'],cheer:['*weak smile*','thanks...'],compliment:['*cries*','don\'t lie'],insult:['I know 😭','you\'re right'],confuse:['oh no','OH GOD','*believes you*'] },
    salty:    { water:['*grunt*','mhm'],          banana:['fine','...'],          gel:['could be colder','whatever'],cowbell:['quiet down','*glares*'],cheer:['*ignores*','*stoic*'],compliment:['*unimpressed*','kid stuff'],insult:['*flips off*','see you at 26 🖕'],confuse:['*ignores*','pathetic'] },
    gullible: { water:['THANK YOU OMG','first marathon!!'],banana:['oh wow!! food!!','thanks!!'],gel:['what is this?','ooooh'],cowbell:['IS THIS FOR ME?','I love this!!'],cheer:['I HEAR YOU 🥺','*waves*'],compliment:['ME?? thanks!!','*ugly cry*'],insult:['😭','*deeply hurt*'],confuse:['WAIT WHAT','OH NO','really??'] },
  };

  // ── Action handler ────────────────────────────────────────
  function react(runner, action) {
    if (runner.fallen || runner.beingRescued) return;
    const opts = REACTIONS[runner.archetype.p][action] || ['...'];
    const b = document.createElement('div');
    b.className = 'reaction-bubble';
    if (action === 'confuse') b.classList.add('confused');
    b.textContent = opts[Math.floor(Math.random() * opts.length)];
    if (runner.direction === -1) b.classList.add('flipped');
    runner.el.appendChild(b); setTimeout(() => b.remove(), 2400);

    const isItem = ['water','banana','gel','cowbell'].includes(action);
    const rd = Math.random(), p = runner.archetype.p;

    if (isItem) {
      stats.helped++;
      if (action === 'banana' && !runner.isWc && Math.random() < 0.4)
        setTimeout(() => dropPeel(runner), 120 + Math.random() * 120);
      if (action === 'cowbell') audioSwell(0.06);
      if (p === 'tired' && (action === 'water' || action === 'gel')) {
        runner.paused = 50; runner.morale = Math.min(1.3, runner.morale + 0.1); stats.stop++;
      }
    } else if (action === 'cheer' || action === 'compliment') {
      audioSwell(0.04);
      if (rd < 0.5) runner.morale = Math.min(1.3, runner.morale + 0.05);
      else if (rd < 0.7) { stats.stop++; runner.paused = 30; }
    } else if (action === 'insult') {
      if ((p === 'tired' || p === 'gullible') && rd < 0.6) {
        stats.stop++; runner.paused = 60; runner.morale = Math.max(0.6, runner.morale - 0.1);
      }
    } else if (action === 'confuse') {
      const chance = runner.isWc ? 0 : (p === 'gullible' ? 0.7 : p === 'tired' ? 0.45 : p === 'happy' ? 0.15 : 0);
      if (rd < chance && !runner.turnedAround) {
        runner.direction = -1; runner.turnedAround = true; setFlip(runner);
        stats.turned++;
        setTimeout(() => shoutCorrection(runner), 600);
      }
    }
    updateStats();
  }

  function tossItem(runner, emoji) {
    const it = document.createElement('div');
    it.className = 'floating-item'; it.textContent = emoji;
    const sR = stage.getBoundingClientRect(), rR = runner.el.getBoundingClientRect();
    it.style.left   = (rR.left - sR.left) + 'px';
    it.style.bottom = (sR.bottom - rR.top - 20) + 'px';
    it.style.setProperty('--tx', (Math.random() * 30 - 15) + 'px');
    it.style.setProperty('--ty', '-30px');
    stage.appendChild(it); setTimeout(() => it.remove(), 1400);
  }

  window.doAction = function (action) {
    if (!selectedRunner) { hint.textContent = '⚠ tap a runner first'; return; }
    const r = selectedRunner;
    if (r.fallen || r.beingRescued) { hint.textContent = '⚠ runner is busy'; return; }
    const emojis = { water:'💧', banana:'🍌', gel:'⚡', cowbell:'🔔' };
    if (emojis[action]) tossItem(r, emojis[action]);
    react(r, action);
  };

  tick();

})();
