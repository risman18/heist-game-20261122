// The Gilded Vault — vision: cones, line of sight and shadows.
// One job: answer "can this watcher see the thief right now?"

import { WALLS } from './level.js';

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

// Segment AB against one rectangle: true when the segment crosses it.
function segmentHitsRect(ax, ay, bx, by, r) {
  const dx = bx - ax;
  const dy = by - ay;
  let tmin = 0;
  let tmax = 1;
  if (dx === 0) {
    if (ax < r.x || ax > r.x + r.w) return false;
  } else {
    let t1 = (r.x - ax) / dx;
    let t2 = (r.x + r.w - ax) / dx;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (dy === 0) {
    if (ay < r.y || ay > r.y + r.h) return false;
  } else {
    let t1 = (r.y - ay) / dy;
    let t2 = (r.y + r.h - ay) / dy;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

// Line of sight: nothing sight-blocking stands between the two points.
// Glass walls (blocksSight false) never block a gaze.
export function hasLineOfSight(ax, ay, bx, by) {
  for (const w of WALLS) {
    if (!w.blocksSight) continue;
    if (segmentHitsRect(ax, ay, bx, by, w)) return false;
  }
  return true;
}

// Is the thief inside this watcher's cone? Range, angle and line of sight.
export function inCone(wx, wy, facing, range, halfAngle, tx, ty) {
  const d = distance(wx, wy, tx, ty);
  if (d > range) return false;
  if (d < 12) return hasLineOfSight(wx, wy, tx, ty);
  const diff = Math.abs(angleDiff(angleTo(wx, wy, tx, ty), facing));
  if (diff > halfAngle) return false;
  return hasLineOfSight(wx, wy, tx, ty);
}

// Where a cone's edge first meets a wall: used to draw a cone that stops
// at cover instead of painting through it.
export function coneRayEnd(wx, wy, angle, range) {
  let best = range;
  const bx = wx + Math.cos(angle) * range;
  const by = wy + Math.sin(angle) * range;
  for (const w of WALLS) {
    if (!w.blocksSight) continue;
    // Sample along the ray; the first blocked sample shortens it.
    for (let t = 8; t < range; t += 8) {
      const px = wx + Math.cos(angle) * t;
      const py = wy + Math.sin(angle) * t;
      if (px >= w.x && px <= w.x + w.w && py >= w.y && py <= w.y + w.h) {
        if (t < best) best = t;
        break;
      }
    }
  }
  return { x: wx + Math.cos(angle) * best, y: wy + Math.sin(angle) * best, len: best };
}
