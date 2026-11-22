// The Gilded Vault — game: the state machine, alarm, tools and win/lose.
// One job: own the rules — what raises the alarm, what ends the heist.

import { ALARM, CAMERA, GUARD, LOOT, TOOLS } from './config.js';
import { CAMERA_DEFS, GUARD_DEFS, LOOT_SPOTS, PLAYER_START } from './level.js';
import { makeCamera, updateCamera } from './camera.js';
import { distractGuard, makeGuard, updateGuard } from './guard.js';
import { atExit, hasDiamond, lootCount, makePlayer, tryPickup, updatePlayer } from './player.js';
import {
  playCaught,
  playCoin,
  playPickup,
  playSmoke,
  playSpotted,
  playStep,
  playWin,
  setAlarmDrone,
  toggleMute,
} from './audio.js';

export const GAME_STATES = ['title', 'playing', 'paused', 'caught', 'lockdown', 'win'];

export function makeGame(audio) {
  return {
    state: 'title',
    audio,
    player: makePlayer(),
    guards: GUARD_DEFS.map((d, i) => makeGuard(d, i)),
    cameras: CAMERA_DEFS.map((d) => makeCamera(d)),
    alarm: 0,
    elapsed: 0,
    time: 0,
    frozen: false, // staged screenshots freeze the simulation
    smokePuffs: [],
    coinsInFlight: [],
    lastSpottedAt: -10,
  };
}

export function resetGame(game) {
  const fresh = makeGame(game.audio);
  Object.assign(game, fresh, { state: 'playing', frozen: game.frozen });
  game.player.x = PLAYER_START.x;
  game.player.y = PLAYER_START.y;
}

function throwCoin(game, x, y) {
  const p = game.player;
  if (p.coins <= 0) return;
  p.coins -= 1;
  playCoin(game.audio);
  const tx = x !== undefined ? x : p.x + Math.cos(p.facing) * 120;
  const ty = y !== undefined ? y : p.y + Math.sin(p.facing) * 120;
  game.coinsInFlight.push({ x: tx, y: ty, ttl: 0.6 });
  // The nearest guard who is not already chasing goes to look.
  let best = null;
  let bestD = Infinity;
  for (const guard of game.guards) {
    const d = Math.hypot(guard.x - tx, guard.y - ty);
    if (d < bestD) { bestD = d; best = guard; }
  }
  if (best) distractGuard(best, tx, ty);
}

function throwSmoke(game) {
  const p = game.player;
  if (p.smoke <= 0) return;
  p.smoke -= 1;
  playSmoke(game.audio);
  game.smokePuffs.push({ x: p.x, y: p.y, radius: TOOLS.smokeRadius, ttl: TOOLS.smokeSeconds });
}

export function updateGame(game, input, dt) {
  // Edge-triggered keys, consumed once per press whatever the state.
  if (input.mutePressed) {
    toggleMute(game.audio);
    input.mutePressed = false;
  }
  if (input.restartPressed) {
    input.restartPressed = false;
    if (game.state !== 'title') resetGame(game);
    return;
  }
  if (game.state === 'title') {
    if (input.confirmPressed || input.clickX !== null) {
      input.confirmPressed = false;
      input.clickX = null;
      game.state = 'playing';
    }
    return;
  }
  if (input.pausePressed) {
    input.pausePressed = false;
    if (game.state === 'playing') game.state = 'paused';
    else if (game.state === 'paused') game.state = 'playing';
  }
  if (game.state === 'paused') return;
  if (game.state !== 'playing') {
    if (input.confirmPressed) {
      input.confirmPressed = false;
      resetGame(game);
    }
    return;
  }

  game.time += dt;
  game.elapsed += dt;

  // Tools.
  if (input.coinPressed) {
    input.coinPressed = false;
    throwCoin(game, input.coinX, input.coinY);
    input.coinX = undefined;
    input.coinY = undefined;
  }
  if (input.smokePressed) {
    input.smokePressed = false;
    throwSmoke(game);
  }

  // Click-to-move destination.
  if (input.clickX !== null) {
    game.player.clickTarget = { x: input.clickX, y: input.clickY };
    input.clickX = null;
  }

  updatePlayer(game.player, input, dt);
  if (game.player.moving && game.player.stepTimer <= 0) {
    playStep(game.audio, game.player.sneaking);
    game.player.stepTimer = game.player.sneaking ? 0.55 : 0.38;
  }

  // Loot: walk over a piece to pocket it.
  const taken = tryPickup(game.player);
  if (taken) playPickup(game.audio, taken.kind === 'diamond');

  // Smoke fades; coin markers fade faster.
  for (const puff of game.smokePuffs) puff.ttl -= dt;
  game.smokePuffs = game.smokePuffs.filter((p) => p.ttl > 0);
  for (const coin of game.coinsInFlight) coin.ttl -= dt;
  game.coinsInFlight = game.coinsInFlight.filter((c) => c.ttl > 0);

  // Guards and cameras watch; any sighting feeds the alarm.
  let anyoneSees = false;
  let caught = false;
  for (const guard of game.guards) {
    const result = updateGuard(guard, game.player, game.smokePuffs, dt);
    if (result.sees) anyoneSees = true;
    if (result.caught) caught = true;
    if (result.sees && game.time - game.lastSpottedAt > 2) {
      game.lastSpottedAt = game.time;
      playSpotted(game.audio);
    }
  }
  for (const cam of game.cameras) {
    const seen = updateCamera(cam, game.player, game.smokePuffs, game.time, dt);
    if (seen) {
      anyoneSees = true;
      game.alarm = Math.min(100, game.alarm + CAMERA.alarmGain * dt);
    }
  }

  if (anyoneSees) {
    game.alarm = Math.min(100, game.alarm + ALARM.guardGain * dt * 10);
  } else {
    game.alarm = Math.max(0, game.alarm - ALARM.decay * dt * 10);
  }
  setAlarmDrone(game.audio, game.alarm >= ALARM.criticalAt);

  // Noise pulls patrolling guards toward the thief.
  if (game.player.noise > 0) {
    for (const guard of game.guards) {
      if (guard.state === 'patrol' || guard.state === 'return') {
        const d = Math.hypot(guard.x - game.player.x, guard.y - game.player.y);
        if (d < game.player.noise) {
          guard.lastSeenX = game.player.x;
          guard.lastSeenY = game.player.y;
          guard.state = 'suspicious';
        }
      }
    }
  }

  // Endings: caught by a guard, alarm full, or diamond + exit.
  if (caught) {
    game.state = 'caught';
    setAlarmDrone(game.audio, false);
    playCaught(game.audio);
    return;
  }
  if (game.alarm >= 100) {
    game.state = 'lockdown';
    setAlarmDrone(game.audio, false);
    playCaught(game.audio);
    return;
  }
  if (hasDiamond(game.player) && atExit(game.player)) {
    game.player.score += Math.max(0, Math.round(LOOT.timeBonusPerSecond * (300 - game.elapsed)));
    game.state = 'win';
    setAlarmDrone(game.audio, false);
    playWin(game.audio);
  }
}
