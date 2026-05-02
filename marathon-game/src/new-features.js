// ─────────────────────────────────────────────────────────────
//  Marathon Spectator — new-features.js
//  DROP THIS IN after game.js, or merge into game.js
//  Adds: porta-potty, water station, cramp events,
//        high-five zone, finish line + confetti, commentator
// ─────────────────────────────────────────────────────────────

// ── Commentator ───────────────────────────────────────────────
// Call commentate("text") from anywhere to pop a 🎙 bubble
window.commentate = function (text) {
  const el = document.getElementById('stage');
  const b  = document.createElement('div');
  b.style.cssText = [
    'position:absolute','bottom:52%','left:50%','transform:translateX(-50%)',
    'background:#1a1a1a','border:1px solid #444','color:#fff',
    'border-radius:8px','padding:4px 10px','font-size:10px','font-weight:700',
    'white-space:nowrap','z-index:12','animation:pop 3s ease forwards',
    'pointer-events:none',
  ].join(';');
  b.textContent = '🎙 ' + text;
  el.appendChild(b);
  setTimeout(() => b.remove(), 3000);
};

// ── Porta-potty ───────────────────────────────────────────────
const PORTA_COLORS  = ['#3a7bd5','#27ae60','#c0392b','#8e44ad'];
const PEE_TEXTS     = [
  'oh no... gotta pee 🚽',
  'NEED THE BATHROOM NOW',
  "💦 can't hold it",
  'abort mission 🚽',
  '🚨 BLADDER EMERGENCY',
  'oh god oh god 🚽',
  'why did I drink so much',
];
const RELIEF_TEXTS  = [
  'ahhh SO much better 😅',
  '*exhale* ok let\'s go',
  'that was CLOSE',
  'back in business 💨',
  'new PB incoming 🙏',
  'felt like mile 26 in there',
];

let portaActive = false;

function makePortaSVG(color) {
  return `<svg viewBox="0 0 28 44" width="28" height="44" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="6" width="26" height="38" rx="2" fill="${color}" stroke="#00000033" stroke-width=".8"/>
    <rect x="3" y="8" width="22" height="13" rx="1" fill="#5aa0e8" opacity=".35"/>
    <rect x="3" y="23" width="22" height="19" rx="1" fill="${color}" stroke="#00000022" stroke-width=".5"/>
    <line x1="14" y1="23" x2="14" y2="42" stroke="#00000033" stroke-width=".5"/>
    <rect x="11" y="31" width="3" height="5" rx=".5" fill="#00000055"/>
    <text x="14" y="5.5" text-anchor="middle"
      style="font-size:5.5px;font-weight:800;fill:#fff;font-family:system-ui,sans-serif;">WC</text>
  </svg>`;
}

// portaDash — runner bolts to right edge, uses porta-potty, returns
function portaDash(runner) {
  if (runner.peeing || runner.fallen || runner.beingRescued || runner.isWc) return;
  runner.peeing = true;
  runner.paused = 99999;

  // Show pee expression
  const pb = document.createElement('div');
  pb.className = 'reaction-bubble pee';
  pb.textContent = PEE_TEXTS[Math.floor(Math.random() * PEE_TEXTS.length)];
  if (runner.direction === -1) pb.classList.add('flipped');
  runner.el.appendChild(pb);
  setTimeout(() => pb.remove(), 2200);

  // After a beat, sprint off-screen right
  setTimeout(() => {
    const stage     = document.getElementById('stage');
    const stageW    = stage.offsetWidth;
    const portaColor = PORTA_COLORS[Math.floor(Math.random() * PORTA_COLORS.length)];

    // Spawn porta-potty at right edge
    const portaEl = document.createElement('div');
    portaEl.style.cssText = `position:absolute;right:4px;bottom:43%;z-index:6;`;
    portaEl.innerHTML = makePortaSVG(portaColor);
    stage.appendChild(portaEl);
    portaActive = true;

    // Dash animation
    let dashX = runner.x;
    const dashInterval = setInterval(() => {
      dashX += 6;
      runner.el.style.left = dashX + 'px';
      if (dashX > stageW) {
        clearInterval(dashInterval);
        runner.el.style.display = 'none';

        // "OCCUPIED" sign
        const occ = document.createElement('div');
        occ.style.cssText = `
          position:absolute;right:6px;bottom:58%;
          font-size:8px;font-weight:700;
          background:#e74c3c;color:#fff;
          padding:1px 5px;border-radius:3px;z-index:10;`;
        occ.textContent = 'OCCUPIED';
        stage.appendChild(occ);

        window.commentate(`${runner.name} made a pit stop 🚽`);

        // Wait inside
        const wait = 3500 + Math.random() * 2000;
        setTimeout(() => {
          occ.remove();
          runner.el.style.display = '';
          runner.x = stageW + 10;
          runner.el.style.left = runner.x + 'px';
          runner.el.style.transform = '';
          runner.paused = 0;
          runner.peeing = false;
          runner.morale  = Math.min(1.4, runner.morale + 0.25); // relief boost!

          const rb = document.createElement('div');
          rb.className = 'reaction-bubble';
          rb.textContent = RELIEF_TEXTS[Math.floor(Math.random() * RELIEF_TEXTS.length)];
          if (runner.direction === -1) rb.classList.add('flipped');
          runner.el.appendChild(rb);
          setTimeout(() => rb.remove(), 2400);

          window.commentate(`${runner.name} is back on course! 💨`);
          setTimeout(() => { portaEl.remove(); portaActive = false; }, 2000);
        }, wait);
      }
    }, 30);
  }, 2400);
}


// ── Cramp event ───────────────────────────────────────────────
const CRAMP_TEXTS   = ['OW OW OW 😖','*calf cramp*','NOT THE HAMSTRING','ow ow ow','*winces*'];
const UNCRAMP_TEXTS = ['walked it off','okay OKAY going','shook it out 💪','*grits teeth* fine'];

function triggerCramp(runner) {
  if (runner.cramping || runner.fallen || runner.peeing || runner.isWc) return;
  runner.cramping = true;
  runner.speed   *= 0.3;
  runner.el.classList.add('cramping');

  const b = document.createElement('div');
  b.className  = 'reaction-bubble danger';
  b.textContent = CRAMP_TEXTS[Math.floor(Math.random() * CRAMP_TEXTS.length)];
  if (runner.direction === -1) b.classList.add('flipped');
  runner.el.appendChild(b);
  setTimeout(() => b.remove(), 2400);

  const dur = 4000 + Math.random() * 3000;
  setTimeout(() => {
    runner.cramping = false;
    runner.speed    = runner.baseSpeed * runner.morale;
    runner.el.classList.remove('cramping');
    const rb = document.createElement('div');
    rb.className  = 'reaction-bubble';
    rb.textContent = UNCRAMP_TEXTS[Math.floor(Math.random() * UNCRAMP_TEXTS.length)];
    if (runner.direction === -1) rb.classList.add('flipped');
    runner.el.appendChild(rb);
    setTimeout(() => rb.remove(), 2400);
  }, dur);
}

// ── High-five zone ─────────────────────────────────────────────
// Attach to a clickable element that spans the railing.
// Call attachHifiZone(el, runners, stage) once on init.
const HIFI_TEXTS = ['YEAH!!','*SLAP*','LET\'S GO','🙌','WOOOO','THAT\'S THE ONE'];

window.attachHifiZone = function (zoneEl, runners, stage) {
  zoneEl.addEventListener('click', e => {
    const stageR = stage.getBoundingClientRect();
    const tapX   = e.clientX - stageR.left;
    const nearby = runners.filter(r => Math.abs(r.x + 23 - tapX) < 44 && !r.fallen && !r.peeing);

    if (nearby.length > 0) {
      const r = nearby[0];
      r.morale = Math.min(1.4, r.morale + 0.08);
      // Bump hifi counter for Helper mode scoring
      if (window._marathonBonusStats) window._marathonBonusStats.hifi++;

      const rb = document.createElement('div');
      rb.className  = 'reaction-bubble';
      rb.textContent = HIFI_TEXTS[Math.floor(Math.random() * HIFI_TEXTS.length)];
      if (r.direction === -1) rb.classList.add('flipped');
      r.el.appendChild(rb);
      setTimeout(() => rb.remove(), 1800);

      // 🙌 burst
      const burst = document.createElement('div');
      burst.style.cssText = `
        position:absolute;font-size:20px;z-index:12;pointer-events:none;
        left:${r.x + 8}px;bottom:48%;
        animation:hifiBurst .8s ease-out forwards;`;
      burst.textContent = '🙌';
      stage.appendChild(burst);
      setTimeout(() => burst.remove(), 800);
    } else {
      const hint = document.getElementById('hint');
      hint.textContent = '😬 no runner in range for a high-five';
      setTimeout(() => hint.textContent = 'tap a runner, then pick an action', 1500);
    }
  });
};

// ── Finish line ────────────────────────────────────────────────
let finishLineEl = null;
window.finishLineEl = null;
let finishSpawned  = false;
const CONFETTI_COLORS = ['#e24b4a','#fac775','#378add','#1d9e75','#7f77dd','#fff'];

window.spawnFinishLine = function (stage) {
  if (finishSpawned) return;
  finishSpawned = true;

  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;bottom:0;right:0;width:6px;height:45%;z-index:6;
    display:flex;flex-direction:column;`;
  // checkered stripes
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('div');
    s.style.cssText = `flex:1;background:${i % 2 === 0 ? '#fff' : '#111'};`;
    el.appendChild(s);
  }
  // FINISH banner above
  const banner = document.createElement('div');
  banner.style.cssText = `
    position:absolute;top:-18px;left:-22px;width:50px;height:14px;
    background:#e24b4a;border-radius:2px;
    display:flex;align-items:center;justify-content:center;
    font-size:6px;font-weight:800;color:#fff;letter-spacing:.3px;`;
  banner.textContent = 'FINISH';
  el.appendChild(banner);
  stage.appendChild(el);
  finishLineEl = el; window.finishLineEl = el;
};

window.triggerFinish = function (runner, stage) {
  // confetti burst
  for (let i = 0; i < 28; i++) {
    setTimeout(() => {
      const c  = document.createElement('div');
      const cx = stage.offsetWidth - 10 + (Math.random() * 30 - 15);
      const cy = stage.offsetHeight * 0.2 + Math.random() * stage.offsetHeight * 0.3;
      c.style.cssText = `
        position:absolute;width:5px;height:7px;border-radius:1px;pointer-events:none;z-index:12;
        left:${cx}px;top:${cy}px;
        background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
        animation:confettiFall ${0.7 + Math.random() * 0.8}s ease-in forwards;
        --dx:${Math.random() * 60 - 30}px;`;
      stage.appendChild(c);
      setTimeout(() => c.remove(), 1600);
    }, i * 55);
  }

  // finisher bubble
  const fb = document.createElement('div');
  fb.style.cssText = `
    position:absolute;bottom:55%;left:50%;transform:translateX(-50%);
    font-size:13px;font-weight:700;white-space:nowrap;z-index:12;
    background:#fac775;border:.5px solid #ba7517;color:#633806;
    border-radius:8px;padding:4px 10px;animation:pop 3.5s ease forwards;`;
  fb.textContent = `🏅 ${runner.name} finishes!`;
  stage.appendChild(fb);
  setTimeout(() => fb.remove(), 3500);


};

// ── Random event scheduler ─────────────────────────────────────
// Call tickEvents(runners, stage) each game frame.
let _eventTimer = 250;

window.tickEvents = function (runners, stage) {
  if (--_eventTimer > 0) return;
  _eventTimer = 180 + Math.floor(Math.random() * 280);

  const candidates = runners.filter(r =>
    r.x > 40 && r.x < stage.offsetWidth - 60 &&
    !r.fallen && !r.peeing && !r.cramping && !r.isWc && r.direction === 1
  );
  if (candidates.length === 0) return;

  const r    = candidates[Math.floor(Math.random() * candidates.length)];
  const roll = Math.random();

  if (roll < 0.4)       portaDash(r);
  else if (roll < 0.75) triggerCramp(r);

};

// ── Every-6-miles crowd screamer ──────────────────────────────
const SCREAM_TEXTS = [
  'AAAAAAAAAH!!',
  'SCREEEEEE!!',
  'WAAAAAAAAH!!',
  '😱😱😱',
  'OH MY GOOOOD',
  'AHHHHHHHHHH',
  'EEEEEEEEEEK!!',
];

const RUNNER_REACTIONS = [
  'what was THAT?!',
  '...what?!',
  'excuse me??',
  'WHO IS SCREAMING',
  '*startled*',
  'is everything ok??',
  '?!?!?!',
  'sir this is a marathon',
];

// Called from mile counter in game.js when mile % 6 === 0
window.triggerCrowdScreamer = function (crowdMembers, runners, stage) {
  if (!crowdMembers || crowdMembers.length === 0) return;

  // Pick a random spectator to lose their mind
  const screamer = crowdMembers[Math.floor(Math.random() * crowdMembers.length)];

  // Big scream bubble — styled bright red to stand out
  const sb = document.createElement('div');
  sb.style.cssText = [
    'position:absolute',
    'bottom:110%',
    'left:50%',
    'transform:translateX(-50%)',
    'background:#e24b4a',
    'color:#fff',
    'border:1.5px solid #7a1414',
    'border-radius:8px',
    'padding:3px 7px',
    'font-size:10px',
    'font-weight:800',
    'white-space:nowrap',
    'z-index:20',
    'pointer-events:none',
    'animation:pop 3s ease forwards',
  ].join(';');
  sb.textContent = SCREAM_TEXTS[Math.floor(Math.random() * SCREAM_TEXTS.length)];
  screamer.el.appendChild(sb);
  setTimeout(() => sb.remove(), 3000);

  // Screamer jiggles
  screamer.el.classList.add('gasping');
  screamer.el.style.transform = 'translateY(-6px) scale(1.3)';
  screamer.el.style.filter = 'brightness(1.4)';
  setTimeout(() => {
    screamer.el.classList.remove('gasping');
    screamer.el.style.transform = '';
    screamer.el.style.filter = '';
  }, 1000);

  // Ripple to neighbours
  const idx = crowdMembers.indexOf(screamer);
  [-2, -1, 1, 2].forEach((offset, i) => {
    const neighbour = crowdMembers[idx + offset];
    if (!neighbour) return;
    setTimeout(() => {
      neighbour.el.classList.add('gasping');
      neighbour.el.style.transform = `translateY(-${3 - Math.abs(offset)}px) scale(1.1)`;
      setTimeout(() => {
        neighbour.el.classList.remove('gasping');
        neighbour.el.style.transform = '';
      }, 600);
    }, i * 80);
  });

  // Distract all visible runners for ~1 second each
  const visible = runners.filter(r =>
    r.x > 0 && r.x < stage.offsetWidth && !r.fallen && !r.peeing && !r.cramping
  );

  visible.forEach((r, i) => {
    setTimeout(() => {
      // Brief pause — runners glance over
      r.paused = 35 + Math.floor(Math.random() * 25);

      const rb = document.createElement('div');
      rb.className = 'reaction-bubble';
      rb.textContent = RUNNER_REACTIONS[Math.floor(Math.random() * RUNNER_REACTIONS.length)];
      if (r.direction === -1) rb.classList.add('flipped');
      r.el.appendChild(rb);
      setTimeout(() => rb.remove(), 2200);
    }, i * 120); // stagger so they don't all react at the exact same frame
  });

  if (window.commentate) window.commentate('Someone in the crowd is losing it 😱');
};

// ── Crowd photographers ────────────────────────────────────────
// Call initPhotographers(crowdMembers, runners, stage) once on load.
// About 20% of spectators get a phone held up. When a runner passes
// within ~40px they snap a photo: flash on runner, shutter animation,
// occasional runner reaction.

const PHOTO_REACTIONS = [
  '*squints* was that a flash',
  'no photos please 😤',
  'tag me in that!!',
  'delete that immediately',
  'hope I look ok 😅',
  'is that going online??',
  '📸 ok wait let me pose',
  '*ignores flash*',
];

// How long between shots from the same photographer (ms)
const PHOTO_COOLDOWN = 5000;

window.initPhotographers = function (crowdMembers, runners, stage) {
  crowdMembers.forEach(spec => {
    if (Math.random() > 0.20) return; // only ~20% have phones

    // Phone icon sitting above the spectator's head
    const phone = document.createElement('div');
    phone.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 8px;
      line-height: 1;
      z-index: 5;
      pointer-events: none;
      transition: transform 0.15s;
    `;
    phone.textContent = '📱';
    spec.el.appendChild(phone);

    spec._hasPhone  = true;
    spec._phoneCd   = 0;   // countdown until next shot (ms)
    spec._phoneEl   = phone;
  });

  // Poll every ~100 ms — check if a runner is in frame
  function pollShots() {
    const now = Date.now();
    for (const spec of crowdMembers) {
      if (!spec._hasPhone) continue;
      if (now < spec._phoneCd)  continue;

      // Work out this spectator's rough x position
      const specRect  = spec.el.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const specX     = specRect.left - stageRect.left + specRect.width / 2;

      // Find the nearest runner within ~40px
      const target = runners.find(r =>
        !r.fallen && !r.peeing &&
        Math.abs(r.x + 23 - specX) < 40
      );
      if (!target) continue;

      snap(spec, target, stage);
      spec._phoneCd = now + PHOTO_COOLDOWN + Math.random() * 4000;
    }
    requestAnimationFrame(pollShots);
  }
  requestAnimationFrame(pollShots);
};

function snap(spec, runner, stage) {
  // 1. Phone arm raises
  if (spec._phoneEl) {
    spec._phoneEl.style.transform = 'translateX(-50%) translateY(-4px) scale(1.25)';
    setTimeout(() => {
      if (spec._phoneEl) spec._phoneEl.style.transform = 'translateX(-50%)';
    }, 400);
  }

  // 2. Camera flash — white overlay on the runner
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    inset: 0;
    background: #fff;
    border-radius: 4px;
    opacity: 0;
    pointer-events: none;
    z-index: 15;
    transition: opacity 0.05s ease-in;
  `;
  runner.el.appendChild(flash);
  // flash on then off
  requestAnimationFrame(() => {
    flash.style.opacity = '0.85';
    setTimeout(() => {
      flash.style.transition = 'opacity 0.25s ease-out';
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 300);
    }, 60);
  });

  // 3. ✨ sparkle burst at spectator level
  const sparkle = document.createElement('div');
  sparkle.style.cssText = `
    position: absolute;
    font-size: 12px;
    pointer-events: none;
    z-index: 14;
    left: ${runner.x + 10}px;
    bottom: 46%;
    animation: hifiBurst 0.6s ease-out forwards;
  `;
  sparkle.textContent = '✨';
  stage.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 600);

  // 4. Runner reaction (30% chance)
  if (Math.random() < 0.30) {
    setTimeout(() => {
      if (!runner.el.parentNode || runner.fallen) return;
      const rb = document.createElement('div');
      rb.className = 'reaction-bubble';
      rb.textContent = PHOTO_REACTIONS[Math.floor(Math.random() * PHOTO_REACTIONS.length)];
      if (runner.direction === -1) rb.classList.add('flipped');
      runner.el.appendChild(rb);
      setTimeout(() => rb.remove(), 2200);
    }, 200);
  }
}

// ── Pigeons ───────────────────────────────────────────────────
// Pigeons drift across the sky. Each one has a 10% chance to
// drop a poop bomb on any runner directly below it.

const POOP_RUNNER_REACTIONS = [
  'WHAT THE—',
  'oh god NOOO',
  'was that a... BIRD?!',
  'EW EW EW 🤮',
  'I just got POOPED ON',
  '*looks up* ARE YOU KIDDING',
  'this is my life now',
  'new low. new personal low.',
  '...really?? TODAY??',
];

const CROWD_POOP_REACTIONS = [
  '*howls laughing*',
  'OH NOOO 😂',
  'did that bird just—',
  'HAHAHAHA',
  'only at a marathon',
  '*can\'t breathe*',
];

function makePigeonSVG() {
  return `<svg viewBox="0 0 32 20" width="32" height="20" xmlns="http://www.w3.org/2000/svg">
    <!-- body -->
    <ellipse cx="16" cy="12" rx="10" ry="6" fill="#9e9e9e"/>
    <!-- head -->
    <circle cx="26" cy="9" r="4.5" fill="#bdbdbd"/>
    <!-- beak -->
    <path d="M30 9 L33 8.5 L30 10 Z" fill="#e0a020"/>
    <!-- eye -->
    <circle cx="27.5" cy="8" r="1" fill="#222"/>
    <circle cx="27.8" cy="7.7" r="0.3" fill="#fff"/>
    <!-- wing (flap class lets JS toggle between two positions) -->
    <path class="wing-up"   d="M10 10 Q14 2 22 6 Q16 10 10 10 Z" fill="#757575"/>
    <path class="wing-down" d="M10 12 Q14 18 22 14 Q16 10 10 12 Z" fill="#757575" style="display:none"/>
    <!-- tail -->
    <path d="M6 12 L2 10 L2 14 Z" fill="#757575"/>
    <!-- feet (only visible when perched — hidden for flying) -->
  </svg>`;
}

let _pigeonTimer = 400 + Math.floor(Math.random() * 300);

window.tickPigeons = function (runners, stage) {
  if (--_pigeonTimer > 0) return;
  _pigeonTimer = 350 + Math.floor(Math.random() * 400);

  spawnPigeon(runners, stage);
};

function spawnPigeon(runners, stage) {
  const el = document.createElement('div');
  el.style.cssText = `
    position: absolute;
    z-index: 3;
    pointer-events: none;
    top: ${8 + Math.random() * 28}%;
  `;
  el.innerHTML = makePigeonSVG();

  // Direction: 50/50 left→right or right→left
  const goRight = Math.random() < 0.5;
  const stageW  = stage.offsetWidth;
  let px = goRight ? -40 : stageW + 10;
  el.style.left = px + 'px';
  if (!goRight) el.style.transform = 'scaleX(-1)';

  stage.appendChild(el);

  let pf = 0;
  let hasPooped = false;

  // Wing flap toggle
  const wingInterval = setInterval(() => {
    const up   = el.querySelector('.wing-up');
    const down = el.querySelector('.wing-down');
    if (!up) return;
    const showUp = Math.floor(pf / 8) % 2 === 0;
    up.style.display   = showUp ? '' : 'none';
    down.style.display = showUp ? 'none' : '';
  }, 130);

  const moveInterval = setInterval(() => {
    px += goRight ? 1.4 : -1.4;
    pf++;
    el.style.left = px + 'px';

    // Check for a poop drop opportunity — 10% chance window
    if (!hasPooped && Math.random() < 0.001) {
      // Find a runner roughly below the pigeon
      const pigeonX = px + 16;
      const victim  = runners.find(r =>
        !r.fallen && !r.peeing &&
        Math.abs(r.x + 23 - pigeonX) < 28
      );
      if (victim) {
        hasPooped = true;
        dropPoop(victim, px + 16, el.style.top, stage);
      }
    }

    // Off screen — clean up
    if ((goRight && px > stageW + 40) || (!goRight && px < -40)) {
      clearInterval(moveInterval);
      clearInterval(wingInterval);
      el.remove();
    }
  }, 16);
}

function dropPoop(runner, pigeonX, pigeonTopPct, stage) {
  // Falling poop drop
  const poop = document.createElement('div');
  poop.style.cssText = `
    position: absolute;
    font-size: 14px;
    left: ${pigeonX - 6}px;
    top: ${pigeonTopPct};
    z-index: 11;
    pointer-events: none;
    animation: poopFall 0.6s ease-in forwards;
  `;
  poop.textContent = '💩';
  stage.appendChild(poop);
  setTimeout(() => poop.remove(), 650);

  // Splat on runner after the drop lands (~600ms)
  setTimeout(() => {
    if (!runner.el.parentNode || runner.fallen) return;

    // Splat emoji on runner briefly
    const splat = document.createElement('div');
    splat.style.cssText = `
      position: absolute;
      font-size: 16px;
      top: 0; left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 15;
      animation: poopSplat 1.2s ease forwards;
    `;
    splat.textContent = '💩';
    runner.el.appendChild(splat);
    setTimeout(() => splat.remove(), 1200);

    // Runner reacts
    const rb = document.createElement('div');
    rb.className  = 'reaction-bubble danger';
    rb.textContent = POOP_RUNNER_REACTIONS[Math.floor(Math.random() * POOP_RUNNER_REACTIONS.length)];
    if (runner.direction === -1) rb.classList.add('flipped');
    runner.el.appendChild(rb);
    setTimeout(() => rb.remove(), 2600);

    // Small morale dent — it's demoralising
    runner.morale = Math.max(0.7, runner.morale - 0.08);
    // Brief stumble pause
    runner.paused = 20 + Math.floor(Math.random() * 15);

    // Crowd nearby reacts with laughter
    const stageW  = stage.offsetWidth;
    const ci      = Math.floor((runner.x / stageW) * (window._marathonCrowd || []).length);
    const members = window._marathonCrowd || [];
    for (let i = Math.max(0, ci - 4); i < Math.min(members.length, ci + 4); i++) {
      const spec = members[i];
      setTimeout(() => {
        spec.el.classList.add('cheering'); // laughing = same jolt as cheering
        setTimeout(() => spec.el.classList.remove('cheering'), 500);
        if (Math.random() < 0.6) {
          const cb = document.createElement('div');
          cb.className  = 'spec-bubble named';
          cb.textContent = CROWD_POOP_REACTIONS[Math.floor(Math.random() * CROWD_POOP_REACTIONS.length)];
          spec.el.appendChild(cb);
          setTimeout(() => cb.remove(), 1800);
        }
      }, Math.random() * 300);
    }

    if (window.commentate) window.commentate(`${runner.name} got hit by a pigeon 💩`);
  }, 600);
}


// ══════════════════════════════════════════════════════════════
//  WEATHER SYSTEM
//  Each game session picks ONE weather type at random.
//  Weather spells fire randomly throughout the race.
//  Types: rain, snow, lightning, tornado
// ══════════════════════════════════════════════════════════════

// Pick a weather type once per page load
const WEATHER_TYPES  = ['rain', 'snow', 'lightning', 'tornado'];
const SESSION_WEATHER = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];

let _wxActive   = false;
let _wxTimer    = 500 + Math.floor(Math.random() * 700);  // frames before first spell
let _wxDuration = 0;
let _wxFrame    = 0;

// Shared sky overlay (darkens stage during weather)
let _skyOverlay = null;

// Rain / snow canvas
let _precipCanvas = null;
let _precipDrops  = [];

// Tornado element
let _tornadoEl = null;

// Show current weather type in top bar (optional — nice touch)
window.getSessionWeather = () => SESSION_WEATHER;

// ── Shared helpers ────────────────────────────────────────────
function makeSkyOverlay(stage, color, opacity) {
  _skyOverlay = document.createElement('div');
  _skyOverlay.style.cssText = `
    position:absolute;inset:0;z-index:1;pointer-events:none;
    background:${color};opacity:0;transition:opacity 1.4s ease;
    border-radius:inherit;
  `;
  stage.appendChild(_skyOverlay);
  requestAnimationFrame(() => { if (_skyOverlay) _skyOverlay.style.opacity = String(opacity); });
}

function removeSkyOverlay() {
  if (!_skyOverlay) return;
  _skyOverlay.style.opacity = '0';
  const el = _skyOverlay; _skyOverlay = null;
  setTimeout(() => el.remove(), 1400);
}

function runnerBubble(r, text, cls = '') {
  if (!r.el.parentNode || r.fallen) return;
  const b = document.createElement('div');
  b.className   = 'reaction-bubble' + (cls ? ' ' + cls : '');
  b.textContent = text;
  if (r.direction === -1) b.classList.add('flipped');
  r.el.appendChild(b);
  setTimeout(() => b.remove(), 2400);
}

function crowdBubbles(stage, texts, cls = 'concern') {
  const members = window._marathonCrowd || [];
  const n = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const spec = members[Math.floor(Math.random() * members.length)];
    if (!spec) continue;
    setTimeout(() => {
      spec.el.classList.add('gasping');
      setTimeout(() => spec.el.classList.remove('gasping'), 500);
      const cb = document.createElement('div');
      cb.className  = 'spec-bubble ' + cls;
      cb.textContent = texts[Math.floor(Math.random() * texts.length)];
      spec.el.appendChild(cb);
      setTimeout(() => cb.remove(), 2000);
    }, i * 280);
  }
}

function visibleRunners(stage) {
  return (window._marathonRunners || []).filter(r =>
    r.x > 0 && r.x < stage.offsetWidth && !r.fallen && !r.peeing
  );
}

// ── RAIN ──────────────────────────────────────────────────────
const RAIN_START  = ['oh great, RAIN 🌧','my socks 😭','are you KIDDING','I trained for this?!','*spits water*','worst timing ever'];
const RAIN_STOP   = ['finally!!','ok we\'re back','*shakes off water*','that sucked','cleared up!'];
const RAIN_CROWD  = ['*opens umbrella*','oh no no no','my hair!!','we stay!! WE STAY!!','*hugs sign*'];

function startRain(stage) {
  makeSkyOverlay(stage, 'rgba(50,70,100,0.4)', 0.9);

  _precipCanvas = document.createElement('canvas');
  _precipCanvas.style.cssText = `position:absolute;inset:0;z-index:8;pointer-events:none;border-radius:inherit;`;
  _precipCanvas.width  = stage.offsetWidth;
  _precipCanvas.height = stage.offsetHeight;
  stage.appendChild(_precipCanvas);

  _precipDrops = [];
  const count = 100 + Math.floor(Math.random() * 60);
  for (let i = 0; i < count; i++) {
    _precipDrops.push({
      x:     Math.random() * _precipCanvas.width,
      y:     Math.random() * _precipCanvas.height,
      speed: 5 + Math.random() * 5,
      drift: -0.6 - Math.random() * 1.4,
      len:   8 + Math.random() * 10,
    });
  }

  visibleRunners(stage).forEach((r, i) => {
    if (Math.random() > 0.5) return;
    setTimeout(() => runnerBubble(r, RAIN_START[Math.floor(Math.random() * RAIN_START.length)]), 600 + i * 200);
  });
  crowdBubbles(stage, RAIN_CROWD);
  if (window.commentate) window.commentate("It's starting to rain!! 🌧");
}

function tickRainDrops() {
  if (!_precipCanvas) return;
  const ctx = _precipCanvas.getContext('2d');
  ctx.clearRect(0, 0, _precipCanvas.width, _precipCanvas.height);
  ctx.strokeStyle = 'rgba(174,214,241,0.75)';
  ctx.lineWidth   = 0.9;
  for (const d of _precipDrops) {
    d.y += d.speed; d.x += d.drift;
    if (d.y > _precipCanvas.height) { d.y = -12; d.x = Math.random() * _precipCanvas.width; }
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.drift * 2, d.y + d.len); ctx.stroke();
  }
}

function stopRain(stage) {
  removeSkyOverlay();
  if (_precipCanvas) { _precipCanvas.remove(); _precipCanvas = null; _precipDrops = []; }
  visibleRunners(stage).forEach((r, i) => {
    if (Math.random() > 0.45) return;
    setTimeout(() => runnerBubble(r, RAIN_STOP[Math.floor(Math.random() * RAIN_STOP.length)]), i * 150);
  });
  if (window.commentate) window.commentate("Rain's cleared up! ☀️");
}

// ── SNOW ──────────────────────────────────────────────────────
const SNOW_START  = ['is this… SNOW?!','❄️ oh come on','my legs are FROZEN','who ordered snow??','I can\'t feel my face','*blows on hands*'];
const SNOW_STOP   = ['oh thank god it stopped','*thaws slowly*','never again','that was surreal'];
const SNOW_CROWD  = ['❄️ SNOW!!','*cheers* SNOW DAY','this is INSANE','I did not pack for this'];

function startSnow(stage) {
  makeSkyOverlay(stage, 'rgba(180,210,240,0.3)', 0.85);

  _precipCanvas = document.createElement('canvas');
  _precipCanvas.style.cssText = `position:absolute;inset:0;z-index:8;pointer-events:none;border-radius:inherit;`;
  _precipCanvas.width  = stage.offsetWidth;
  _precipCanvas.height = stage.offsetHeight;
  stage.appendChild(_precipCanvas);

  _precipDrops = [];
  const count = 80 + Math.floor(Math.random() * 50);
  for (let i = 0; i < count; i++) {
    _precipDrops.push({
      x:      Math.random() * _precipCanvas.width,
      y:      Math.random() * _precipCanvas.height,
      speed:  0.8 + Math.random() * 1.4,
      drift:  (Math.random() - 0.5) * 0.8,
      radius: 1.5 + Math.random() * 2.5,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  visibleRunners(stage).forEach((r, i) => {
    if (Math.random() > 0.55) return;
    setTimeout(() => runnerBubble(r, SNOW_START[Math.floor(Math.random() * SNOW_START.length)]), 700 + i * 220);
  });
  crowdBubbles(stage, SNOW_CROWD, 'named');
  if (window.commentate) window.commentate('Snow?! IN A MARATHON?! ❄️');
}

function tickSnowFlakes() {
  if (!_precipCanvas) return;
  const ctx = _precipCanvas.getContext('2d');
  ctx.clearRect(0, 0, _precipCanvas.width, _precipCanvas.height);
  ctx.fillStyle = 'rgba(220,235,255,0.9)';
  for (const d of _precipDrops) {
    d.wobble += 0.04;
    d.y += d.speed;
    d.x += d.drift + Math.sin(d.wobble) * 0.4;
    if (d.y > _precipCanvas.height) { d.y = -6; d.x = Math.random() * _precipCanvas.width; }
    if (d.x < 0) d.x = _precipCanvas.width;
    if (d.x > _precipCanvas.width) d.x = 0;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function stopSnow(stage) {
  removeSkyOverlay();
  if (_precipCanvas) { _precipCanvas.remove(); _precipCanvas = null; _precipDrops = []; }
  visibleRunners(stage).forEach((r, i) => {
    if (Math.random() > 0.4) return;
    setTimeout(() => runnerBubble(r, SNOW_STOP[Math.floor(Math.random() * SNOW_STOP.length)]), i * 180);
  });
  if (window.commentate) window.commentate('Snow stopping… what a day ☀️');
}

// ── LIGHTNING ─────────────────────────────────────────────────
const LIGHTNING_RUNNER = ['WAS THAT LIGHTNING?!','*panics*','are we supposed to STOP??','I\'m the tallest thing out here!!','oh no oh no oh no','THUNDER 😱'];
const LIGHTNING_CROWD  = ['LIGHTNING!!','get inside!!','😱😱😱','*screams*','everyone RUN'];

let _lightningCount = 0;  // strikes in this spell

function startLightning(stage) {
  makeSkyOverlay(stage, 'rgba(30,30,60,0.5)', 0.9);
  _lightningCount = 3 + Math.floor(Math.random() * 4);
  fireNextStrike(stage, 0);
  crowdBubbles(stage, LIGHTNING_CROWD);
  if (window.commentate) window.commentate('LIGHTNING!! ⚡ Runners beware!');
}

function fireNextStrike(stage, idx) {
  if (idx >= _lightningCount || !_wxActive) return;
  const delay = 1800 + Math.random() * 3000;
  setTimeout(() => {
    if (!_wxActive) return;
    doStrike(stage);
    // Runner nearest strike panics
    const runners = window._marathonRunners || [];
    const victim  = runners[Math.floor(Math.random() * runners.length)];
    if (victim && !victim.fallen && !victim.peeing) {
      victim.paused = 40 + Math.floor(Math.random() * 30);
      runnerBubble(victim, LIGHTNING_RUNNER[Math.floor(Math.random() * LIGHTNING_RUNNER.length)], 'danger');
    }
    fireNextStrike(stage, idx + 1);
  }, delay);
}

function doStrike(stage) {
  // White full-stage flash
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:absolute;inset:0;background:#fff;z-index:20;
    pointer-events:none;border-radius:inherit;opacity:0;
    transition:opacity 0.04s;
  `;
  stage.appendChild(flash);
  requestAnimationFrame(() => {
    flash.style.opacity = '0.9';
    setTimeout(() => { flash.style.transition = 'opacity 0.3s'; flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 350); }, 60);
  });

  // SVG lightning bolt
  const bolt = document.createElement('div');
  const bx   = 30 + Math.random() * (stage.offsetWidth - 60);
  bolt.style.cssText = `
    position:absolute;left:${bx}px;top:0;z-index:19;
    pointer-events:none;animation:boltFade 0.5s ease forwards;
  `;
  bolt.innerHTML = `<svg width="22" height="${stage.offsetHeight * 0.55}" viewBox="0 0 22 120" xmlns="http://www.w3.org/2000/svg">
    <polyline points="14,0 6,52 13,52 4,120" fill="none" stroke="#fffde7" stroke-width="3" stroke-linejoin="round"/>
    <polyline points="14,0 6,52 13,52 4,120" fill="none" stroke="#ffd600" stroke-width="1.5" stroke-linejoin="round" opacity="0.8"/>
  </svg>`;
  stage.appendChild(bolt);
  setTimeout(() => bolt.remove(), 500);
}

function stopLightning(stage) {
  removeSkyOverlay();
  if (window.commentate) window.commentate('Storm passing… that was close ⚡');
}

// ── TORNADO ───────────────────────────────────────────────────
const TORNADO_RUNNER = ['IS THAT A TORNADO?!','*looks up* OH NO','EVERYONE SCATTER','am I hallucinating??','not today not TODAY','*runs faster*'];
const TORNADO_CROWD  = ['TORNADO!!','*grabs neighbour*','oh my GOD','*dives behind sign*','EVERYONE DOWN'];

function startTornado(stage) {
  makeSkyOverlay(stage, 'rgba(60,50,20,0.45)', 0.9);

  _tornadoEl = document.createElement('div');
  _tornadoEl.style.cssText = `
    position:absolute;top:0;z-index:9;pointer-events:none;
    animation:tornadoSway 3s ease-in-out infinite;
  `;
  const stageH = stage.offsetHeight;
  // Start off one side
  const goRight = Math.random() < 0.5;
  let tx = goRight ? -60 : stage.offsetWidth + 20;
  _tornadoEl.style.left = tx + 'px';

  // Funnel cloud SVG
  _tornadoEl.innerHTML = `<svg width="60" height="${stageH * 0.7}" viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#78716c" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#44403c" stop-opacity="0.5"/>
      </linearGradient>
    </defs>
    <!-- funnel shape — wide at top, narrows to tip -->
    <path d="M5 0 Q0 60 18 120 Q26 160 29 200 Q31 200 32 200 Q35 160 42 120 Q60 60 55 0 Z"
      fill="url(#tg)"/>
    <!-- swirl lines -->
    <path d="M12 30 Q30 40 48 30" fill="none" stroke="#a8a29e" stroke-width="1.2" opacity="0.6"/>
    <path d="M16 60 Q30 72 44 60" fill="none" stroke="#a8a29e" stroke-width="1" opacity="0.5"/>
    <path d="M20 90 Q30 102 40 90" fill="none" stroke="#a8a29e" stroke-width="0.9" opacity="0.4"/>
    <path d="M23 120 Q30 130 37 120" fill="none" stroke="#a8a29e" stroke-width="0.8" opacity="0.35"/>
    <!-- debris dots -->
    <circle cx="8"  cy="50"  r="2" fill="#78716c"/>
    <circle cx="50" cy="40"  r="1.5" fill="#57534e"/>
    <circle cx="15" cy="80"  r="1.5" fill="#78716c"/>
    <circle cx="45" cy="70"  r="2" fill="#57534e"/>
    <circle cx="20" cy="110" r="1" fill="#78716c"/>
  </svg>`;
  stage.appendChild(_tornadoEl);

  // Move tornado across stage
  const speed = goRight ? 0.5 : -0.5;
  const tornadoMove = setInterval(() => {
    if (!_wxActive) { clearInterval(tornadoMove); return; }
    tx += speed;
    _tornadoEl.style.left = tx + 'px';

    // Suck in nearby runners (slow them, make them react)
    for (const r of (window._marathonRunners || [])) {
      if (r.fallen || r.peeing) continue;
      const dist = Math.abs(r.x + 23 - (tx + 30));
      if (dist < 50 && !r._tornadoReacted) {
        r._tornadoReacted = true;
        r.paused = 50 + Math.floor(Math.random() * 40);
        r.morale = Math.max(0.6, r.morale - 0.1);
        runnerBubble(r, TORNADO_RUNNER[Math.floor(Math.random() * TORNADO_RUNNER.length)], 'danger');
        setTimeout(() => { if (r) r._tornadoReacted = false; }, 4000);
      }
    }

    // Off-screen — stop
    if ((goRight && tx > stage.offsetWidth + 80) || (!goRight && tx < -80)) {
      clearInterval(tornadoMove);
    }
  }, 16);

  visibleRunners(stage).forEach((r, i) => {
    setTimeout(() => runnerBubble(r, TORNADO_RUNNER[Math.floor(Math.random() * TORNADO_RUNNER.length)], 'danger'), 600 + i * 250);
  });
  crowdBubbles(stage, TORNADO_CROWD);
  if (window.commentate) window.commentate('A TORNADO?! ON THE COURSE?! 🌪');
}

function stopTornado(stage) {
  removeSkyOverlay();
  if (_tornadoEl) { _tornadoEl.remove(); _tornadoEl = null; }
  if (window.commentate) window.commentate('Tornado passed… somehow everyone\'s fine 🌪');
}

// ── Main weather tick — called from game.js ───────────────────
window.tickWeather = function (runners, stage) {
  _wxFrame++;

  // Tick precipitation if active
  if (_wxActive) {
    if (SESSION_WEATHER === 'rain')  tickRainDrops();
    if (SESSION_WEATHER === 'snow')  tickSnowFlakes();
    if (--_wxDuration <= 0) stopWeather(stage);
    return;
  }

  // Countdown to next spell
  if (--_wxTimer <= 0) startWeather(stage);
};

function startWeather(stage) {
  _wxActive   = true;
  // Durations in frames at ~60fps: rain 15-35s, snow 20-40s, lightning 10-25s, tornado 8-16s
  const durations = { rain: [900,2100], snow: [1200,2400], lightning: [600,1500], tornado: [480,960] };
  const [min, max] = durations[SESSION_WEATHER];
  _wxDuration = min + Math.floor(Math.random() * (max - min));

  if (SESSION_WEATHER === 'rain')      startRain(stage);
  if (SESSION_WEATHER === 'snow')      startSnow(stage);
  if (SESSION_WEATHER === 'lightning') startLightning(stage);
  if (SESSION_WEATHER === 'tornado')   startTornado(stage);

  // Schedule next spell after this one ends + a break
  _wxTimer = _wxDuration + 1200 + Math.floor(Math.random() * 1800);
}

function stopWeather(stage) {
  _wxActive = false;
  if (SESSION_WEATHER === 'rain')      stopRain(stage);
  if (SESSION_WEATHER === 'snow')      stopSnow(stage);
  if (SESSION_WEATHER === 'lightning') stopLightning(stage);
  if (SESSION_WEATHER === 'tornado')   stopTornado(stage);
}

// Expose for index.html start screen (shows weather type badge)
window.SESSION_WEATHER = SESSION_WEATHER;

// Add a weather badge to top bar once DOM is ready
window.addEventListener('load', () => {
  const icons = { rain:'🌧', snow:'❄️', lightning:'⚡', tornado:'🌪' };
  const pill = document.createElement('div');
  pill.className   = 'pill';
  pill.textContent = icons[SESSION_WEATHER] + ' ' + SESSION_WEATHER;
  const topBar = document.querySelector('.top-bar');
  if (topBar) topBar.appendChild(pill);
});