// The Gilded Vault — input: keyboard and mouse, one shared state.
// One job: read the player's hands and hand the game a clean snapshot.

export function makeInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    sprint: false,
    coinPressed: false, // edge-triggered: game.js consumes it
    smokePressed: false, // edge-triggered: game.js consumes it
    pausePressed: false,
    restartPressed: false,
    mutePressed: false,
    confirmPressed: false,
    clickX: null,
    clickY: null,
    mouseX: 0,
    mouseY: 0,
  };

  const keyMap = {
    ArrowUp: 'up', KeyW: 'up',
    ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ShiftLeft: 'sneak', ShiftRight: 'sneak',
    Space: 'sprint',
  };

  window.addEventListener('keydown', (e) => {
    if (keyMap[e.code] !== undefined) {
      input[keyMap[e.code]] = true;
      e.preventDefault();
    }
    if (e.code === 'KeyQ' && !e.repeat) input.coinPressed = true;
    if (e.code === 'KeyE' && !e.repeat) input.smokePressed = true;
    if (e.code === 'KeyP' && !e.repeat) input.pausePressed = true;
    if (e.code === 'KeyR' && !e.repeat) input.restartPressed = true;
    if (e.code === 'KeyM' && !e.repeat) input.mutePressed = true;
    if ((e.code === 'Enter' || e.code === 'Space') && !e.repeat) input.confirmPressed = true;
  });

  window.addEventListener('keyup', (e) => {
    if (keyMap[e.code] !== undefined) input[keyMap[e.code]] = false;
  });

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPoint(e);
    input.mouseX = p.x;
    input.mouseY = p.y;
  });

  // Click to walk: the thief heads for the clicked floor spot.
  canvas.addEventListener('click', (e) => {
    const p = canvasPoint(e);
    input.clickX = p.x;
    input.clickY = p.y;
  });

  // Right-click tosses a coin at the cursor (same as Q, aimed).
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const p = canvasPoint(e);
    input.clickX = null;
    input.coinPressed = true;
    input.coinX = p.x;
    input.coinY = p.y;
  });

  return input;
}
