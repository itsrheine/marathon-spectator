# 🏃 Marathon Spectator

A chaotic phone-sized marathon spectator simulator. Stand on the sideline and interact with runners as they pass — give them water, throw bananas, trash talk them, or send them the wrong way.

![Marathon Spectator Game](https://img.shields.io/badge/built%20with-vanilla%20JS-yellow) ![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

## Play

Just open `index.html` in any modern browser. No build step, no dependencies.

```
open index.html
```

Or serve it locally:

```bash
npx serve .
# or
python3 -m http.server
```

## How to Play

1. **Tap a runner** on the road to select them (dashed blue outline appears)
2. **Pick an action** from the button grid below the screen
3. Watch the chaos unfold

### Actions

| Button | Effect |
|--------|--------|
| 💧 Water | Helps most runners, boosts tired runners' morale |
| 🍌 Banana | 40% chance of dropping a peel that trips the next runner |
| ⚡ Gel | Energy boost — big morale lift for tired runners |
| 🔔 Cowbell | Crowd audio swell, personality reactions |
| 👏 Cheer | May cause runner to pause and wave |
| 😊 Nice | Compliment — boosts morale |
| 😈 Trash talk | Demoralizes tired/gullible runners; fires up salty/pro ones |
| ❓ Wrong way | Gullible (70%) and tired (45%) runners may reverse direction |

### Runner Personalities

- **Pro** — unbothered, slight speed boost from cheers, laughs off trash talk
- **Happy** — loves everything, very reactive to crowd energy
- **Tired** — easily demoralized, responds dramatically to aid
- **Salty** — trash talk makes them run *faster*, ignores wrong-way pranks
- **Gullible** — believes everything, most likely to turn around

### Special Runners

- **🦽 Wheelchair athletes** (~1% spawn rate) — aerodynamic helmet, spinning spokes, fastest on course (1.4–1.8× speed), immune to banana peels, slipping, and wrong-way pranks

### Events

- **Banana peel slip** → paramedic runs in, checks on fallen runner, jogs back off
- **Runner collisions** → same lane, opposing directions OR big speed gap triggers a bump. 30% chance the slower runner falls; 70% both stagger and exchange names
- **Wrong-way correction** → nearby runners shout the turned runner's name; 50% chance they panic back to the right direction
- **Named crowd cheering** → spectators call out visible runners by name every 1–2 seconds

### Crowd & Atmosphere

- 26 spectators line the barrier, ~25% holding hand-painted signs
- Metal railing with colorful sponsor banners draped over it (NIKK, GATORADIE, ASIKZ, POWRADE, etc.)
- Red blimp drifting back and forth across the sky
- City skyline parallax in the background
- 3 drifting clouds
- Optional crowd noise (WebAudio pink noise → bandpass filter → LFO)
- Mile counter ticks up to 26

## File Structure

```
marathon-spectator/
├── index.html   # Layout, CSS, all static HTML
├── game.js      # All game logic (vanilla JS, no deps)
└── README.md
```

## Extending the Game

### Add a new runner archetype
Add an entry to `ARCHETYPES` in `game.js`:

```js
{
  shirt: '#hex',   // shirt colour
  shorts: '#hex',  // shorts colour
  skin: '#hex',    // skin tone
  p: 'happy',      // personality: pro | happy | tired | salty | gullible
  bib: '999',      // bib number text
  g: 'F',          // gender: M | F  (controls name pool + body shape)
  hair: 'pony',    // style: short | pony | bun | bald
  hc: '#hex',      // hair colour
}
```

### Add a new action
1. Add a button to the `.action-grid` in `index.html`
2. Add a response array for each personality in the `REACTIONS` object in `game.js`
3. Add handling logic in the `react()` function

### Add a new reaction line
Find the personality in `REACTIONS` and append to any action array:

```js
tired: {
  water: ['oh god thank you', 'YOU SAVED ME', 'my hero 😭'],  // ← add here
  ...
}
```

## Browser Support

Works in all evergreen browsers. Uses:
- CSS custom properties
- SVG inline sprites
- Web Animations (CSS `@keyframes`)
- Web Audio API (optional, for crowd noise)
- `requestAnimationFrame` game loop

No canvas, no WebGL, no frameworks.

## License

MIT — do whatever you want with it.
