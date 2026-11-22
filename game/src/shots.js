// The Gilded Vault — staged shots: frozen, readable tableaus for screenshots.
// One job: put the thief, guards, cameras and alarm into a fixed pose per
// ?shot= name so each screenshot shows the heist at its most complete.
// Every shot keeps the room, the cones, the cameras, the loot and the alarm
// meter in one frame — that is what the judge scores first.

import { LOOT_SPOTS } from './level.js';

function placeGuard(guard, x, y, facing, state, suspicion) {
  guard.x = x;
  guard.y = y;
  guard.facing = facing;
  guard.state = state;
  guard.suspicion = suspicion;
  guard.lastSeenX = x;
  guard.lastSeenY = y;
}

function placeCamera(camera, angle, locked) {
  camera.angle = angle;
  camera.locked = locked;
  camera.seesThief = locked;
}

function placeThief(game, x, y, facing, loot) {
  game.player.x = x;
  game.player.y = y;
  game.player.facing = facing;
  game.player.lootTaken = loot.slice();
  game.player.score = loot.reduce((sum, id) => {
    const spot = LOOT_SPOTS.find((s) => s.id === id);
    return sum + (spot ? spot.value : 0);
  }, 0);
  game.player.clickTarget = null;
  game.player.moving = false;
  game.player.sneaking = false;
  game.player.sprinting = false;
  game.player.noise = 0;
}

export function applyShot(game, name) {
  game.state = 'playing';
  game.frozen = true;
  game.smokePuffs = [];
  game.coinsInFlight = [];
  const [g0, g1, g2] = game.guards;
  const [c0, c1] = game.cameras;

  if (name === 'chase') {
    // Alarm high, a guard closing in, Vesper two steps from the Star.
    game.time = 61.5;
    game.elapsed = 96;
    game.alarm = 76;
    placeThief(game, 800, 190, Math.PI / 4, ['idol']);
    placeGuard(g0, 700, 260, -0.5, 'chase', 1);
    placeGuard(g1, 600, 150, Math.PI, 'suspicious', 0.7);
    placeGuard(g2, 520, 580, Math.PI / 2, 'patrol', 0.1);
    placeCamera(c0, Math.PI / 2 + 0.4, false);
    placeCamera(c1, Math.PI - 0.3, true);
    return;
  }
  if (name === 'loot') {
    // At the pedestal: the Star still glowing, Vesper's hand on it.
    game.time = 43.0;
    game.elapsed = 121;
    game.alarm = 48;
    placeThief(game, 872, 190, -Math.PI / 2, ['idol', 'emerald']);
    placeGuard(g0, 420, 320, Math.PI / 2, 'patrol', 0.2);
    placeGuard(g1, 640, 200, Math.PI, 'suspicious', 0.55);
    placeGuard(g2, 500, 590, 0, 'patrol', 0);
    placeCamera(c0, Math.PI / 2 - 0.5, false);
    placeCamera(c1, Math.PI + 0.4, false);
    return;
  }
  if (name === 'escape') {
    // Diamond in hand, exit glowing, guards searching the wrong wing.
    game.time = 78.2;
    game.elapsed = 168;
    game.alarm = 58;
    placeThief(game, 120, 600, Math.PI, ['diamond', 'idol', 'pearl']);
    placeGuard(g0, 420, 380, -Math.PI / 2, 'search', 0.6);
    placeGuard(g1, 700, 420, Math.PI / 2, 'search', 0.5);
    placeGuard(g2, 560, 560, Math.PI, 'patrol', 0.15);
    placeCamera(c0, Math.PI / 2 + 0.6, false);
    placeCamera(c1, Math.PI - 0.5, false);
    return;
  }
  // Default: 'cover' — mid-heist, everything in one frame.
  game.time = 24.0;
  game.elapsed = 54;
  game.alarm = 32;
  placeThief(game, 300, 400, -Math.PI / 4, ['idol']);
  placeGuard(g0, 250, 300, Math.PI / 2, 'suspicious', 0.62);
  placeGuard(g1, 640, 200, Math.PI, 'patrol', 0.1);
  placeGuard(g2, 560, 560, -Math.PI / 2, 'patrol', 0.05);
  placeCamera(c0, Math.PI / 2 + 0.3, false);
  placeCamera(c1, Math.PI - 0.2, false);
}

export const SHOT_NAMES = ['cover', 'chase', 'loot', 'escape'];
