// The Gilded Vault — guard AI: patrol, suspicion, chase, search, return.
// One job: move each guard and decide what he does about the thief.

import { GUARD, PLAYER } from './config.js';
import { hitsSolid, onRug } from './level.js';
import { angleDiff, angleTo, distance, hasLineOfSight, inCone } from './vision.js';

export const GUARD_STATES = ['patrol', 'suspicious', 'chase', 'search', 'return'];

export function makeGuard(def, index) {
  const start = def.waypoints[0];
  return {
    name: def.name,
    color: def.color,
    waypoints: def.waypoints,
    waypointIndex: 1,
    x: start.x,
    y: start.y,
    facing: 0,
    state: 'patrol',
    suspicion: 0,
    lastSeenX: start.x,
    lastSeenY: start.y,
    unseenTimer: 0,
    searchTimer: 0,
    investigateX: null,
    investigateY: null,
    investigateTimer: 0,
    pauseTimer: 0,
    index,
  };
}

// Can this guard see the thief? Cones, range, line of sight, smoke.
export function guardSeesThief(guard, thief, smokePuffs) {
  for (const puff of smokePuffs) {
    if (distance(guard.x, guard.y, puff.x, puff.y) < puff.radius) return false;
    if (distance(thief.x, thief.y, puff.x, puff.y) < puff.radius) return false;
  }
  return inCone(guard.x, guard.y, guard.facing, GUARD.viewRange, GUARD.viewHalfAngle, thief.x, thief.y);
}

// How fast suspicion grows: closer is worse, rugs and sneaking slow it.
function suspicionRate(guard, thief) {
  const d = distance(guard.x, guard.y, thief.x, thief.y);
  let rate = d < 110 ? GUARD.suspicionGainNear : GUARD.suspicionGainFar;
  if (thief.sneaking) rate *= 0.45;
  if (onRug(thief.x, thief.y)) rate *= 0.5;
  if (thief.sprinting) rate *= 1.5;
  return rate;
}

function moveToward(guard, tx, ty, speed, dt) {
  const d = distance(guard.x, guard.y, tx, ty);
  if (d < 2) return true;
  const step = Math.min(speed * dt, d);
  const nx = guard.x + ((tx - guard.x) / d) * step;
  const ny = guard.y + ((ty - guard.y) / d) * step;
  // Axis-separated collision so guards slide along cases and pillars.
  if (!hitsSolid(nx, guard.y, GUARD.radius)) guard.x = nx;
  if (!hitsSolid(guard.x, ny, GUARD.radius)) guard.y = ny;
  guard.facing = angleTo(guard.x, guard.y, tx, ty);
  return distance(guard.x, guard.y, tx, ty) < 4;
}

// A coin clang pulls the nearest guard off his patrol to look.
export function distractGuard(guard, x, y) {
  if (guard.state === 'chase') return;
  guard.investigateX = x;
  guard.investigateY = y;
  guard.investigateTimer = 3.5;
  guard.state = 'suspicious';
}

export function updateGuard(guard, thief, smokePuffs, dt) {
  const sees = guardSeesThief(guard, thief, smokePuffs);

  if (sees) {
    guard.lastSeenX = thief.x;
    guard.lastSeenY = thief.y;
    guard.unseenTimer = 0;
    // A live sighting beats an old clang: drop the coin investigation.
    guard.investigateX = null;
    guard.investigateY = null;
    guard.investigateTimer = 0;
    guard.suspicion = Math.min(1, guard.suspicion + suspicionRate(guard, thief) * dt);
    if (guard.suspicion >= 1 && guard.state !== 'chase') {
      guard.state = 'chase';
      guard.searchTimer = 0;
    } else if (guard.suspicion > 0.35 && guard.state === 'patrol') {
      guard.state = 'suspicious';
    }
  } else {
    guard.unseenTimer += dt;
    guard.suspicion = Math.max(0, guard.suspicion - GUARD.suspicionDecay * dt);
    if (guard.state === 'chase' && guard.unseenTimer > GUARD.loseSightSeconds) {
      guard.state = 'search';
      guard.searchTimer = GUARD.searchSeconds;
    }
    if (guard.state === 'suspicious' && guard.suspicion <= 0.05 && guard.investigateTimer <= 0) {
      guard.state = 'return';
    }
  }

  switch (guard.state) {
    case 'patrol': {
      if (guard.pauseTimer > 0) {
        guard.pauseTimer -= dt;
        guard.facing += Math.sin(guard.pauseTimer * 2) * 0.4 * dt;
        break;
      }
      const target = guard.waypoints[guard.waypointIndex];
      if (moveToward(guard, target.x, target.y, GUARD.patrolSpeed, dt)) {
        guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
        guard.pauseTimer = 1.2; // look around at each corner, cone sweeping
      }
      break;
    }
    case 'suspicious': {
      if (guard.investigateTimer > 0) {
        guard.investigateTimer -= dt;
        if (moveToward(guard, guard.investigateX, guard.investigateY, GUARD.searchSpeed, dt)) {
          guard.investigateTimer = 0;
          guard.investigateX = null;
        }
      } else {
        // Edge toward the last seen spot, scanning as he goes.
        moveToward(guard, guard.lastSeenX, guard.lastSeenY, GUARD.searchSpeed, dt);
      }
      break;
    }
    case 'chase': {
      // Run at the thief's last seen spot; a fresh sighting updates it.
      moveToward(guard, guard.lastSeenX, guard.lastSeenY, GUARD.chaseSpeed, dt);
      break;
    }
    case 'search': {
      guard.searchTimer -= dt;
      guard.facing += dt * 1.6; // sweep the room looking for the thief
      if (guard.searchTimer <= 0) guard.state = 'return';
      break;
    }
    case 'return': {
      const home = guard.waypoints[guard.waypointIndex];
      if (moveToward(guard, home.x, home.y, GUARD.searchSpeed, dt)) {
        guard.state = 'patrol';
        guard.pauseTimer = 0.6;
      }
      break;
    }
    default:
      guard.state = 'patrol';
  }

  // Caught: a chasing guard who reaches the thief ends the heist.
  const caught =
    guard.state === 'chase' &&
    distance(guard.x, guard.y, thief.x, thief.y) < GUARD.catchDistance;
  return { sees, caught };
}
