// The Gilded Vault — configuration: canvas, palette, tuning and tool counts.
// One job: every number the rest of the game agrees on lives here.

export const CANVAS_W = 960;
export const CANVAS_H = 700;
export const HUD_H = 64;

// Floor rectangle (the room the thief crosses), below the HUD band.
export const FLOOR = { x: 0, y: HUD_H, w: CANVAS_W, h: CANVAS_H - HUD_H };

// Palette: a night museum — deep teal marble, brass gold, crimson carpet,
// velvet shadow. Safe cover reads dark, danger reads amber/red, loot glows gold.
export const PALETTE = {
  floorA: '#1d2f3a',
  floorB: '#223845',
  floorLine: '#2e4a5a',
  carpet: '#7a1f2b',
  carpetEdge: '#c9a227',
  rug: '#141f2b',
  rugEdge: '#3a5a74',
  wall: '#0e1a24',
  wallTop: '#33506a',
  pillar: '#4a6b84',
  pillarTop: '#6b8ca6',
  caseGlass: 'rgba(150, 210, 235, 0.16)',
  caseFrame: '#8a6d2f',
  caseBase: '#2c2118',
  vaultGlass: 'rgba(120, 200, 255, 0.20)',
  vaultFrame: '#c9a227',
  gold: '#f2c94c',
  goldDim: '#b98a1d',
  emerald: '#35d07f',
  crimson: '#e5484d',
  amber: '#ffb224',
  coneGuard: 'rgba(255, 178, 36, 0.20)',
  coneGuardEdge: 'rgba(255, 178, 36, 0.55)',
  coneCamera: 'rgba(229, 72, 77, 0.16)',
  coneCameraEdge: 'rgba(229, 72, 77, 0.5)',
  coneAlert: 'rgba(229, 72, 77, 0.30)',
  thief: '#3d2b52',
  thiefTrim: '#b388ff',
  guard: '#274b63',
  guardTrim: '#d8e6f2',
  hudBg: '#0b141c',
  hudText: '#e8eef4',
  hudDim: '#8fa8bb',
};

// Movement (pixels per second) and stealth tuning.
export const PLAYER = {
  radius: 13,
  walkSpeed: 155,
  sneakSpeed: 92,
  sprintSpeed: 225,
  noiseWalk: 46,
  noiseSprint: 130,
  noiseSneak: 0,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 62,
  chaseSpeed: 132,
  searchSpeed: 78,
  viewRange: 210,
  viewHalfAngle: 0.52, // ~60 degree cone
  catchDistance: 17,
  suspicionGainNear: 1.15, // per second, thief close and lit
  suspicionGainFar: 0.45,
  suspicionDecay: 0.35,
  loseSightSeconds: 2.5,
  searchSeconds: 4.0,
};

export const CAMERA = {
  viewRange: 230,
  viewHalfAngle: 0.42,
  sweepSpeed: 0.55, // radians per second
  sweepArc: 0.85,
  alarmGain: 0.55, // alarm per second while the camera sees the thief
};

export const ALARM = {
  guardGain: 0.34, // per second while any guard sees the thief
  decay: 0.055, // per second while unseen
  warnAt: 55, // HUD turns amber
  criticalAt: 80, // HUD turns red, alarm sound
};

// Tools: a cost to every trick, so routes and timing matter.
export const TOOLS = {
  coins: 3, // Q: toss a coin, nearest guard investigates the clang
  smoke: 1, // E: smoke bomb, blinds cones in a radius for a few seconds
  smokeRadius: 150,
  smokeSeconds: 6,
  coinInvestigateSeconds: 3.5,
};

export const LOOT = {
  diamondValue: 500,
  sideValue: 150,
  timeBonusPerSecond: 2,
};
