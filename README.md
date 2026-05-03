# Marathon Spectator

Super chaotic marathon spectator simulator. Have fun!

![Marathon Spectator Game](https://img.shields.io/badge/built%20with-vanilla%20JS-yellow) ![No dependencies](https://img.shields.io/badge/dependencies-none-brightgreen)

## Play

👉 [Play Marathon Spectator](https://marathon-game-tan.vercel.app)

## Game Modes

- **Marathon** — 26 miles of runners, crowd chaos, random race events, and finish-line drama.
- **Saboteur** — 60 seconds to cause as much chaos as possible.
- **Helper** — 90 seconds to aid runners, high-five them, and avoid creating disasters.
  
## How to Play

1. Tap a runner to select them.
2. Choose an action from the button grid.
3. Watch the runner, crowd, and course react in real time.

### Actions

| Button | Effect |
|--------|--------|
| 💧 Water | Helps most runners, boosts tired runners' morale |
| 🍌 Banana | 40% chance of dropping a peel that trips the next runner |
| ⚡ Gel | Energy boost, provides big morale lift for tired runners |
| 🔔 Cowbell | Crowd audio swell, personality reactions |
| 👏 Cheer | May cause runner to pause and wave |
| 😊 Nice | Compliment — boosts morale |
| 😈 Trash talk | Demoralizes tired/gullible runners, sometimes fires up salty/pro ones |
| ❓ Wrong way | Gullible (70%) and tired (45%) runners may reverse direction |

### Runner Personalities

- **Pro** — unbothered, slight speed boost from cheers, laughs off trash talk
- **Happy** — loves everything, very reactive to crowd energy
- **Tired** — easily demoralized, responds dramatically to aid
- **Salty** — trash talk makes them run *faster*, ignores wrong-way pranks
- **Gullible** — believes everything, most likely to turn around

## New Features

- **Start screen with mode selection** for Marathon, Saboteur, and Helper modes.
- **Real crowd ambience audio** using `crowd.mp3` instead of generated white noise.
- **Porta-potty events** where runners can leave the course for an emergency pit stop.
- **Cramp events** that slow runners down temporarily.
- **High-five zone** where players can tap near the railing to boost runners.
- **Finish line and confetti** near the end of the marathon.
- **Commentator bubbles** with milestone callouts and funny race updates.
- **Crowd scream events** every 6 miles that distract visible runners.
- **Crowd photographers** who snap photos when runners pass by.
- **Pigeons** that fly across the sky and can cause poop-drop chaos.
- **Weather events** including rain, snow, and lightning effects.
- **Expanded runner names and archetypes** for more variety.
- **Bonus scoring** for Helper and Saboteur-style play.
  
### Special Runners

- ** Wheelchair athletes** (~1% spawn rate) — aerodynamic helmet, spinning spokes, fastest on course (1.4–1.8× speed), immune to banana peels, slipping, and wrong-way pranks.

### Events

- **Banana peel slip** → paramedic runs in, checks on fallen runner, jogs back off
- **Runner collisions** → same lane, opposing directions OR big speed gap triggers a bump. 30% chance the slower runner falls, 70% both stagger and exchange names
- **Wrong-way correction** → nearby runners shout the turned runner's name; 50% chance they panic back to the right direction
- **Named crowd cheering** → spectators call out visible runners by name every 1–2 seconds

### Crowd & Atmosphere

- 26 animated spectators along the railing.
- Some spectators hold signs.
- Sponsor banners line the course.
- Animated clouds, skyline, and blimp.
- Runner reactions, crowd bubbles, collisions, slips, paramedics, and random chaos.

## Tech

Built with:

- HTML
- CSS
- JavaScript
- Vite
- Vercel deployment

No game engine, no canvas, no WebGL.

## Local Development

```bash
cd marathon-game
npm install
npm run dev
```
