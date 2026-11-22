// The Gilded Vault — render: every pixel drawn in code, no image files.
// One job: paint the room, the cones, the people and the HUD so the heist
// reads at a glance — safe cover dark, danger amber and red, loot gold.

import { ALARM, CANVAS_H, CANVAS_W, FLOOR, HUD_H, PALETTE } from './config.js';
import { CAMERA_DEFS, CARPET, EXIT, LOOT_SPOTS, RUGS, VAULT, WALLS } from './level.js';
import { coneRayEnd } from './vision.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawFloor(ctx, time) {
  // Marble checker.
  const tile = 48;
  for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
    for (let x = 0; x < FLOOR.w; x += tile) {
      const even = ((x / tile) + ((y - FLOOR.y) / tile)) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= FLOOR.w; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, FLOOR.y); ctx.lineTo(x, FLOOR.y + FLOOR.h); ctx.stroke();
  }
  for (let y = FLOOR.y; y <= FLOOR.y + FLOOR.h; y += tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FLOOR.w, y); ctx.stroke();
  }
  // Crimson carpet runner from the door to the vault.
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(CARPET.x, CARPET.y, CARPET.w, CARPET.h);
  ctx.fillStyle = PALETTE.carpetEdge;
  ctx.fillRect(CARPET.x, CARPET.y, 3, CARPET.h);
  ctx.fillRect(CARPET.x + CARPET.w - 3, CARPET.y, 3, CARPET.h);
  // Velvet rugs: shadow cover, drawn darker than the floor.
  for (const rug of RUGS) {
    ctx.fillStyle = PALETTE.rug;
    roundRect(ctx, rug.x, rug.y, rug.w, rug.h, 10);
    ctx.fill();
    ctx.strokeStyle = PALETTE.rugEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function drawWallsAndCases(ctx) {
  for (const w of WALLS) {
    if (w.kind === 'glass') {
      ctx.fillStyle = PALETTE.vaultGlass;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = PALETTE.vaultFrame;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
      continue;
    }
    if (w.kind === 'case') {
      ctx.fillStyle = PALETTE.caseBase;
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = PALETTE.caseGlass;
      ctx.fillRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
      ctx.strokeStyle = PALETTE.caseFrame;
      ctx.lineWidth = 3;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
      continue;
    }
    const isOuter = w.w > 400 || w.h > 400;
    ctx.fillStyle = isOuter ? PALETTE.wallTop : PALETTE.pillar;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    if (!isOuter) {
      ctx.fillStyle = PALETTE.pillarTop;
      ctx.fillRect(w.x + 4, w.y + 4, w.w - 8, 6);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(w.x + w.w, w.y + 4, 5, w.h);
    }
  }
  // Vault label and pedestal.
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('— THE VAULT —', 876, 118);
  ctx.fillStyle = PALETTE.caseBase;
  ctx.beginPath();
  ctx.arc(VAULT.pedestal.x, VAULT.pedestal.y + 12, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.caseFrame;
  ctx.fillRect(VAULT.pedestal.x - 16, VAULT.pedestal.y + 6, 32, 8);
  // Exit door, bottom-left, glowing green when the diamond is taken.
  ctx.fillStyle = '#123524';
  ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.strokeStyle = '#35d07f';
  ctx.lineWidth = 2;
  ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
  ctx.fillStyle = '#b8ffcf';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText('EXIT', EXIT.x + EXIT.w / 2, EXIT.y + EXIT.h / 2 + 5);
}

export function drawLoot(ctx, game, time) {
  for (const spot of LOOT_SPOTS) {
    if (game.player.lootTaken.includes(spot.id)) continue;
    const pulse = 0.6 + 0.4 * Math.sin(time * 3 + spot.x);
    if (spot.kind === 'diamond') {
      const glow = ctx.createRadialGradient(spot.x, spot.y, 4, spot.x, spot.y, 46);
      glow.addColorStop(0, `rgba(242, 201, 76, ${0.55 * pulse})`);
      glow.addColorStop(1, 'rgba(242, 201, 76, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(spot.x, spot.y, 46, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe98a';
      ctx.beginPath();
      ctx.moveTo(spot.x, spot.y - 16);
      ctx.lineTo(spot.x + 13, spot.y);
      ctx.lineTo(spot.x, spot.y + 14);
      ctx.lineTo(spot.x - 13, spot.y);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff6c9';
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#fff6c9';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText('CRIMSON STAR', spot.x, spot.y - 26);
    } else {
      const colors = { idol: '#f2c94c', emerald: '#35d07f', pearl: '#e8eef4' };
      ctx.fillStyle = colors[spot.kind];
      ctx.beginPath(); ctx.arc(spot.x, spot.y, 8 + 2 * pulse, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = 'rgba(232,238,244,0.85)';
      ctx.font = '10px Georgia, serif';
      ctx.fillText(spot.label, spot.x, spot.y - 14);
    }
  }
}

function drawCone(ctx, x, y, facing, range, halfAngle, fill, edge) {
  const steps = 24;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= steps; i++) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    const end = coneRayEnd(x, y, a, range);
    ctx.lineTo(end.x, end.y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}

export function drawGuards(ctx, game) {
  for (const guard of game.guards) {
    const alert = guard.state === 'chase';
    const suspicious = guard.state === 'suspicious' || guard.suspicion > 0.35;
    const fill = alert ? PALETTE.coneAlert : PALETTE.coneGuard;
    const edge = alert ? PALETTE.crimson : PALETTE.coneGuardEdge;
    drawCone(ctx, guard.x, guard.y, guard.facing, 210, 0.52, fill, edge);
  }
  for (const guard of game.guards) {
    // Body: navy uniform, cap, facing tick.
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(guard.x + 3, guard.y + 4, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = guard.color;
    ctx.beginPath(); ctx.arc(guard.x, guard.y, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PALETTE.guardTrim;
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = PALETTE.guardTrim;
    ctx.beginPath(); ctx.arc(guard.x, guard.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0e1a24';
    ctx.beginPath(); ctx.arc(guard.x, guard.y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = PALETTE.guardTrim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.facing) * 18, guard.y + Math.sin(guard.facing) * 18);
    ctx.stroke();
    // Name and state: "!" when chasing, "?" when searching.
    ctx.fillStyle = PALETTE.hudText;
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(guard.name.toUpperCase(), guard.x, guard.y - 22);
    if (guard.state === 'chase') {
      ctx.fillStyle = PALETTE.crimson;
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('!', guard.x, guard.y - 34);
    } else if (guard.state === 'search' || guard.state === 'suspicious') {
      ctx.fillStyle = PALETTE.amber;
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('?', guard.x, guard.y - 34);
    } else if (guard.suspicion > 0.05) {
      // Suspicion arc over the guard's head.
      ctx.strokeStyle = PALETTE.amber;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(guard.x, guard.y - 30, 8, -Math.PI / 2, -Math.PI / 2 + guard.suspicion * Math.PI * 2);
      ctx.stroke();
    }
  }
}

export function drawCameras(ctx, game) {
  for (const cam of game.cameras) {
    const fill = cam.locked ? PALETTE.coneAlert : PALETTE.coneCamera;
    const edge = cam.locked ? PALETTE.crimson : PALETTE.coneCameraEdge;
    drawCone(ctx, cam.x, cam.y, cam.angle, 230, 0.42, fill, edge);
    // Wall mount: small dome with a red lens.
    ctx.fillStyle = '#1a2b3a';
    ctx.beginPath(); ctx.arc(cam.x, cam.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = cam.locked ? PALETTE.crimson : '#7d94a8';
    ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = cam.locked ? PALETTE.crimson : PALETTE.amber;
    ctx.beginPath(); ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2); ctx.fill();
    // Label inside the room, never under the HUD band or off the edge:
    // the north mount labels below its dome, the east mount to its left.
    ctx.fillStyle = PALETTE.hudText;
    ctx.font = 'bold 10px Georgia, serif';
    if (cam.y < 100) {
      ctx.textAlign = 'center';
      ctx.fillText(cam.label, cam.x, cam.y + 26);
    } else if (cam.x > 900) {
      ctx.textAlign = 'right';
      ctx.fillText(cam.label, cam.x - 18, cam.y + 4);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(cam.label, cam.x, cam.y - 18);
    }
  }
}

export function drawThief(ctx, game, time) {
  const p = game.player;
  if (p.noise > 0) {
    ctx.strokeStyle = 'rgba(232, 238, 244, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.noise * (0.7 + 0.3 * Math.sin(time * 5)), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 4, 14, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2; ctx.stroke();
  // Hooded mask: two eyes and a facing tick.
  ctx.fillStyle = '#e8eef4';
  const ex = Math.cos(p.facing);
  const ey = Math.sin(p.facing);
  ctx.beginPath(); ctx.arc(p.x + ex * 4 - ey * 4, p.y + ey * 4 + ex * 4, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x + ex * 4 + ey * 4, p.y + ey * 4 - ex * 4, 2.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + ex * 17, p.y + ey * 17);
  ctx.stroke();
  ctx.fillStyle = PALETTE.thiefTrim;
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VESPER', p.x, p.y - 22);
  if (p.sneaking) {
    ctx.fillStyle = PALETTE.hudDim;
    ctx.font = '10px Georgia, serif';
    ctx.fillText('sneaking…', p.x, p.y + 28);
  }
}

export function drawSmoke(ctx, game) {
  for (const puff of game.smokePuffs) {
    const grad = ctx.createRadialGradient(puff.x, puff.y, 8, puff.x, puff.y, puff.radius);
    grad.addColorStop(0, 'rgba(200, 210, 220, 0.55)');
    grad.addColorStop(1, 'rgba(200, 210, 220, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2); ctx.fill();
  }
  for (const coin of game.coinsInFlight) {
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath(); ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff6c9';
    ctx.lineWidth = 1.5; ctx.stroke();
  }
}

export function drawHud(ctx, game) {
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.fillStyle = PALETTE.carpetEdge;
  ctx.fillRect(0, HUD_H - 2, CANVAS_W, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('THE GILDED VAULT', 16, 28);
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = '12px Georgia, serif';
  ctx.fillText('a velvet heist · steal the Crimson Star, leave by the EXIT', 16, 48);

  // Alarm meter: the big readable bar the whole game turns on.
  const alarm = game.alarm;
  const ax = 470;
  const ay = 16;
  const aw = 220;
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText('ALARM', ax, ay + 11);
  ctx.fillStyle = '#233240';
  roundRect(ctx, ax + 62, ay, aw, 16, 8);
  ctx.fill();
  const alarmColor = alarm >= ALARM.criticalAt ? PALETTE.crimson : alarm >= ALARM.warnAt ? PALETTE.amber : '#35d07f';
  ctx.fillStyle = alarmColor;
  if (alarm > 1) {
    roundRect(ctx, ax + 62, ay, Math.max(16, (aw * alarm) / 100), 16, 8);
    ctx.fill();
  }
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText(`${Math.round(alarm)}%`, ax + 62 + aw + 8, ay + 12);
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = '11px Georgia, serif';
  const objective = game.player.lootTaken.includes('diamond')
    ? 'Diamond taken — reach the EXIT!'
    : 'Grab the CRIMSON STAR in the vault';
  ctx.fillText(objective, ax, ay + 34);

  // Loot, tools, timer on the right.
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`◆ LOOT ${game.player.lootTaken.length}/4   $${game.player.score}`, CANVAS_W - 16, 26);
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = '12px Georgia, serif';
  const mm = String(Math.floor(game.elapsed / 60)).padStart(2, '0');
  const ss = String(Math.floor(game.elapsed % 60)).padStart(2, '0');
  ctx.fillText(`⏱ ${mm}:${ss}   ● coins ${game.player.coins}   ◐ smoke ${game.player.smoke}`, CANVAS_W - 16, 48);
  ctx.textAlign = 'center';
}

export function drawOverlay(ctx, game) {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  function panel(title, lines, color) {
    ctx.fillStyle = 'rgba(5, 10, 16, 0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = color || PALETTE.gold;
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy - 40);
    ctx.fillStyle = PALETTE.hudText;
    ctx.font = '16px Georgia, serif';
    lines.forEach((line, i) => ctx.fillText(line, cx, cy - 4 + i * 26));
  }
  if (game.state === 'title') {
    panel('THE GILDED VAULT', [
      'Tonight the museum sleeps — except for its guards, its cameras, and you.',
      'Vesper the thief needs the Crimson Star. Slip past the cones, mind the alarm.',
      'WASD / arrows move · Shift sneak · Space sprint · Q toss a coin · E smoke bomb',
      'Click anywhere to walk there · P pause · R restart · M mute',
      '',
      'Press ENTER to begin the heist',
    ]);
  } else if (game.state === 'paused') {
    panel('PAUSED', ['The guards hold their patrol. The Star still waits.', 'P resume · R restart'], PALETTE.hudDim);
  } else if (game.state === 'caught') {
    panel('CAUGHT!', [
      `A guard laid hands on Vesper after ${Math.floor(game.elapsed)}s — the Star stays in its case.`,
      `Loot kept: $${game.player.score}`,
      'Press R to try the heist again',
    ], PALETTE.crimson);
  } else if (game.state === 'lockdown') {
    panel('LOCKDOWN!', [
      'The alarm hit 100% — steel shutters, sirens, and nowhere left to run.',
      `Loot kept: $${game.player.score}`,
      'Press R to try the heist again',
    ], PALETTE.crimson);
  } else if (game.state === 'win') {
    panel('CLEAN GETAWAY!', [
      `Vesper slips into the night with the Crimson Star — $${game.player.score} in ${Math.floor(game.elapsed)}s.`,
      'The museum never knew she was there.',
      'Press R to run the heist again',
    ], '#35d07f');
  }
}

export function render(ctx, game, time) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawFloor(ctx, time);
  drawWallsAndCases(ctx);
  drawLoot(ctx, game, time);
  drawGuards(ctx, game);
  drawCameras(ctx, game);
  drawThief(ctx, game, time);
  drawSmoke(ctx, game);
  drawHud(ctx, game);
  if (game.state !== 'playing') drawOverlay(ctx, game);
  // Red vignette while the alarm is critical: the room itself feels the heat.
  if (game.state === 'playing' && game.alarm >= ALARM.criticalAt) {
    const pulse = 0.10 + 0.05 * Math.sin(time * 6);
    ctx.strokeStyle = `rgba(229, 72, 77, ${pulse})`;
    ctx.lineWidth = 14;
    ctx.strokeRect(7, HUD_H + 7, CANVAS_W - 14, CANVAS_H - HUD_H - 14);
  }
}
