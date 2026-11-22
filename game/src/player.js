// The Gilded Vault — the thief: movement, sneak, sprint, noise and tools.
// One job: turn keys and clicks into a body that guards can hear and see.

import { FLOOR, PLAYER, TOOLS } from './config.js';
import { hitsSolid, pointInRect, VAULT, EXIT, LOOT_SPOTS, onRug } from './level.js';

export function makePlayer() {
  return {
    x: 56,
    y: 620,
    radius: PLAYER.radius,
    facing: -Math.PI / 2,
    moving: false,
    sneaking: false,
    sprinting: false,
    clickTarget: null,
    coins: TOOLS.coins,
    smoke: TOOLS.smoke,
    lootTaken: [],
    score: 0,
    noise: 0, // current noise radius, for the renderer's sound rings
    stepTimer: 0,
  };
}

function clampToFloor(p) {
  p.x = Math.max(10 + p.radius, Math.min(FLOOR.w - 10 - p.radius, p.x));
  p.y = Math.max(FLOOR.y + 10 + p.radius, Math.min(FLOOR.y + FLOOR.h - 10 - p.radius, p.y));
}

// Move with axis-separated collision so the thief slides along cases.
function tryMove(p, dx, dy) {
  if (!hitsSolid(p.x + dx, p.y, p.radius)) p.x += dx;
  if (!hitsSolid(p.x, p.y + dy, p.radius)) p.y += dy;
  clampToFloor(p);
}

export function updatePlayer(p, input, dt) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;

  // A click sets a destination; any key press cancels it.
  if (mx !== 0 || my !== 0) p.clickTarget = null;

  if (mx === 0 && my === 0 && p.clickTarget) {
    const dx = p.clickTarget.x - p.x;
    const dy = p.clickTarget.y - p.y;
    const d = Math.hypot(dx, dy);
    if (d < 6) {
      p.clickTarget = null;
    } else {
      mx = dx / d;
      my = dy / d;
    }
  }

  const len = Math.hypot(mx, my);
  p.moving = len > 0;
  p.sneaking = !!input.sneak && p.moving;
  p.sprinting = !!input.sprint && p.moving && !p.sneaking;
  const speed = p.sneaking ? PLAYER.sneakSpeed : p.sprinting ? PLAYER.sprintSpeed : PLAYER.walkSpeed;

  if (len > 0) {
    const nx = (mx / len) * speed * dt;
    const ny = (my / len) * speed * dt;
    tryMove(p, nx, ny);
    p.facing = Math.atan2(my, mx);
    p.stepTimer -= dt;
  }

  p.noise = !p.moving ? 0 : p.sneaking ? PLAYER.noiseSneak : p.sprinting ? PLAYER.noiseSprint : PLAYER.noiseWalk;
  p.onRug = onRug(p.x, p.y);
  p.inVault = pointInRect(p.x, p.y, { x: 800, y: 96, w: 152, h: 158 });
  return p;
}

// Pick up any loot within reach. Returns the loot taken, if any.
export function tryPickup(p) {
  for (const spot of LOOT_SPOTS) {
    if (p.lootTaken.includes(spot.id)) continue;
    if (Math.hypot(spot.x - p.x, spot.y - p.y) < 30) {
      p.lootTaken.push(spot.id);
      p.score += spot.value;
      return spot;
    }
  }
  return null;
}

export function hasDiamond(p) {
  return p.lootTaken.includes('diamond');
}

export function atExit(p) {
  return pointInRect(p.x, p.y, EXIT);
}

export function lootCount(p) {
  return p.lootTaken.length;
}
