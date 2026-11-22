// The Gilded Vault — bootstrap: canvas, loop, and the ?shot= staging hook.
// One job: start the game, run it at a fixed step, and paint every frame.

import { CANVAS_H, CANVAS_W } from './config.js';
import { makeAudio } from './audio.js';
import { makeGame, updateGame } from './game.js';
import { makeInput } from './input.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const audio = makeAudio();
const game = makeGame(audio);
const input = makeInput(canvas);

// Staged screenshots: ?shot=cover|chase|loot|escape freezes a posed frame.
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) applyShot(game, shot);

// Exposed for headless self-tests: window.__game reads state, no network.
window.__game = game;
window.__input = input;

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.frozen) updateGame(game, input, dt);
  render(ctx, game, game.time);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
