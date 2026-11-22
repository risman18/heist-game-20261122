# 💎 The Gilded Vault — a velvet heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/risman18/heist-game-20261122/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/risman18/heist-game-20261122/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

You are **Vesper, the velvet thief**. Tonight the museum's Crimson Star
diamond sits in its glass vault — watched by three patrolling guards, two
sweeping security cameras, and an alarm that never forgets. Slip past the
cones, mind the meter, take the Star, and leave by the EXIT **unseen**.

## The game

A complete original top-down 2D stealth heist in one dense museum room,
drawn entirely in code (no image files, no network, no libraries):

- 🔦 **Vision cones** — every guard sweeps an amber cone; step into it and
  suspicion climbs. Closer, lit, and sprinting fills it faster; sneaking
  and velvet rugs slow it down
- 📷 **Security cameras** — two wall cameras sweep red cones across the
  room and feed the alarm directly; a locked lens follows you
- 🚨 **Alarm meter** — the HUD bar climbs while any guard or camera sees
  you and cools when you break away. At 100% the museum locks down
- 🧠 **Guard AI** — patrol waypoints with a look-around at every corner,
  suspicion, chase, search, and return. Break line of sight to recover
- 🪙 **Tools at a cost** — 3 coins to toss (Q, or right-click) and pull the
  nearest guard off to investigate the clang; 1 smoke bomb (E) that blinds
  every cone it covers for 6 seconds
- 👣 **Noise** — sprinting is fast but loud; guards inside the noise ring
  come to look. Sneaking is silent. Footstep rings show what they hear
- ◆ **4 loot pieces** — the Crimson Star in the glass vault plus a gold
  idol, an emerald and a pearl on the display cases. The Star is the job;
  the rest is the score
- 🔊 All sounds synthesized with WebAudio — footsteps, coin clangs, alert
  stings, pickup chimes, a pulsing alarm drone
- ⏸️ Title, pause, caught, lockdown and clean-getaway screens, per-run timer

## Play it

Serve `game/` with any static server and open `index.html` in desktop Chrome:

```sh
node serve.ts   # http://localhost:8080
```

**Controls:** WASD / arrows move · Shift sneak · Space sprint · Q toss a coin ·
E smoke bomb · click to walk to a spot · P pause · R restart · M mute · Enter start.

## Files

- `game/src/config.js` — canvas, palette, speeds and stealth tuning
- `game/src/level.js` — the hand-laid museum floor: walls, cases, rugs, vault
- `game/src/vision.js` — cones, line of sight, cone ray-casting
- `game/src/guard.js` — guard AI: patrol, suspicion, chase, search, return
- `game/src/camera.js` — sweeping security cameras and their alarm feed
- `game/src/player.js` — Vesper: movement, sneak, sprint, noise, loot
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/input.js` — keyboard and mouse
- `game/src/render.js` — every pixel, drawn in code
- `game/src/game.js` — state machine, alarm, tools, win/lose rules
- `game/src/shots.js` — staged screenshot states (`?shot=cover|chase|loot|escape`)
- `game/src/main.js` — bootstrap and game loop
