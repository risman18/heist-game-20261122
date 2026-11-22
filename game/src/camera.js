// The Gilded Vault — security cameras: sweeping red cones on the wall.
// One job: sweep, watch, and raise the alarm when the thief crosses the lens.

import { CAMERA } from './config.js';
import { distance, inCone } from './vision.js';

export function makeCamera(def) {
  return {
    id: def.id,
    label: def.label,
    x: def.x,
    y: def.y,
    baseAngle: def.baseAngle,
    phase: Math.random() * Math.PI * 2,
    angle: def.baseAngle,
    locked: false, // true while the thief is in frame: the lens follows
    seesThief: false,
  };
}

// Sweep back and forth; when the thief is spotted the camera locks on.
export function updateCamera(camera, thief, smokePuffs, time, dt) {
  for (const puff of smokePuffs) {
    if (distance(thief.x, thief.y, puff.x, puff.y) < puff.radius) {
      camera.seesThief = false;
      camera.locked = false;
      return false;
    }
  }
  const sweep = Math.sin(time * CAMERA.sweepSpeed + camera.phase) * CAMERA.sweepArc;
  camera.angle = camera.baseAngle + sweep;
  const seen = inCone(camera.x, camera.y, camera.angle, CAMERA.viewRange, CAMERA.viewHalfAngle, thief.x, thief.y);
  camera.seesThief = seen;
  camera.locked = seen;
  return seen;
}
