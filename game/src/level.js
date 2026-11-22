// The Gilded Vault — the room: one dense museum floor, hand-laid.
// Walls, pillars, display cases, velvet rugs, the glass vault, the exit,
// the guards' patrol loops and the cameras' mounts. Nothing here moves;
// guard.js and camera.js animate on top of it.

import { FLOOR } from './config.js';

// Every solid is a rectangle the thief and the guards walk around.
// `blocksSight` false means glass: it stops feet, not eyes.
export const WALLS = [
  // Outer shell (thick, keeps everyone inside the floor).
  { x: 0, y: FLOOR.y, w: 8, h: FLOOR.h, blocksSight: true },
  { x: FLOOR.w - 8, y: FLOOR.y, w: 8, h: FLOOR.h, blocksSight: true },
  { x: 0, y: FLOOR.y, w: FLOOR.w, h: 8, blocksSight: true },
  { x: 0, y: FLOOR.y + FLOOR.h - 8, w: FLOOR.w, h: 8, blocksSight: true },
  // Interior pillars (square, block sight).
  { x: 224, y: 218, w: 36, h: 36, blocksSight: true },
  { x: 464, y: 198, w: 36, h: 36, blocksSight: true },
  { x: 704, y: 218, w: 36, h: 36, blocksSight: true },
  { x: 344, y: 468, w: 36, h: 36, blocksSight: true },
  { x: 584, y: 468, w: 36, h: 36, blocksSight: true },
  // Display cases (low cabinets; block sight and movement).
  { x: 130, y: 168, w: 96, h: 52, blocksSight: true, kind: 'case' },
  { x: 700, y: 148, w: 96, h: 52, blocksSight: true, kind: 'case' },
  { x: 170, y: 520, w: 96, h: 52, blocksSight: true, kind: 'case' },
  { x: 660, y: 540, w: 110, h: 52, blocksSight: true, kind: 'case' },
  { x: 420, y: 348, w: 120, h: 58, blocksSight: true, kind: 'case' },
  // The vault: glass walls around the diamond, one door gap at the bottom.
  { x: 800, y: 96, w: 8, h: 150, blocksSight: false, kind: 'glass' },
  { x: 800, y: 96, w: 152, h: 8, blocksSight: false, kind: 'glass' },
  { x: 800, y: 246, w: 62, h: 8, blocksSight: false, kind: 'glass' },
  { x: 890, y: 246, w: 62, h: 8, blocksSight: false, kind: 'glass' },
];

// Velvet rugs: standing on one halves how fast guards grow suspicious.
export const RUGS = [
  { x: 280, y: 330, w: 130, h: 80 },
  { x: 580, y: 300, w: 130, h: 80 },
  { x: 430, y: 560, w: 140, h: 70 },
];

// The carpet runner: the thief's bold route, straight from door to vault.
export const CARPET = { x: 60, y: 120, w: 46, h: 520 };

export const VAULT = {
  pedestal: { x: 872, y: 158 },
  door: { x: 845, y: 246, w: 45, h: 10 },
};

export const EXIT = { x: 24, y: 636, w: 64, h: 40 };

// Loot: the Crimson Star diamond in the vault, plus three side pieces on cases.
export const LOOT_SPOTS = [
  { id: 'diamond', kind: 'diamond', x: 872, y: 158, value: 500, label: 'CRIMSON STAR' },
  { id: 'idol', kind: 'idol', x: 178, y: 194, value: 150, label: 'GOLD IDOL' },
  { id: 'emerald', kind: 'emerald', x: 715, y: 566, value: 150, label: 'EMERALD' },
  { id: 'pearl', kind: 'pearl', x: 480, y: 377, value: 150, label: 'PEARL' },
];

// Guards: name, patrol loop, and where they start on it.
export const GUARD_DEFS = [
  {
    name: 'Marlow',
    color: '#274b63',
    waypoints: [
      { x: 180, y: 300 }, { x: 180, y: 470 }, { x: 420, y: 470 }, { x: 420, y: 300 },
    ],
  },
  {
    name: 'Okafor',
    color: '#3a2b4d',
    waypoints: [
      { x: 560, y: 160 }, { x: 760, y: 160 }, { x: 760, y: 420 }, { x: 560, y: 420 },
    ],
  },
  {
    name: 'Ivers',
    color: '#1f4438',
    waypoints: [
      { x: 470, y: 600 }, { x: 700, y: 600 }, { x: 700, y: 470 }, { x: 470, y: 470 },
    ],
  },
];

// Cameras: wall mounts that sweep a red cone across the room.
export const CAMERA_DEFS = [
  { id: 'cam-north', x: 480, y: 74, baseAngle: Math.PI / 2, label: 'CAM 1' },
  { id: 'cam-east', x: 950, y: 330, baseAngle: Math.PI, label: 'CAM 2' },
];

export const PLAYER_START = { x: 56, y: 620 };

// Point-in-rect helper used by movement, loot pickup and rug checks.
export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// True when the point stands on any velvet rug (shadow cover).
export function onRug(x, y) {
  return RUGS.some((r) => pointInRect(x, y, r));
}

// True when the circle at (x, y) with radius r hits any solid.
export function hitsSolid(x, y, r) {
  for (const w of WALLS) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) < r * r) return w;
  }
  return null;
}
