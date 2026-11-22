// The Gilded Vault — sound: every effect synthesized with WebAudio.
// One job: footsteps, coin clangs, alarm stings and chimes, no audio files.

export function makeAudio() {
  return {
    ctx: null,
    muted: false,
    alarmOn: false,
    alarmNodes: null,
  };
}

function ensureCtx(audio) {
  if (!audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
    } catch (e) {
      audio.ctx = null;
    }
  }
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
  return audio.ctx;
}

function blip(audio, freq, dur, type, gain, slideTo) {
  if (audio.muted) return;
  const ctx = ensureCtx(audio);
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
  g.gain.setValueAtTime(gain || 0.08, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function playStep(audio, sneaking) {
  if (sneaking) return; // sneaking is silent — that is the point
  blip(audio, 140 + Math.random() * 40, 0.06, 'triangle', 0.03);
}

export function playCoin(audio) {
  blip(audio, 2400, 0.09, 'square', 0.05);
  setTimeout(() => blip(audio, 1800, 0.12, 'square', 0.05), 90);
}

export function playSmoke(audio) {
  blip(audio, 320, 0.5, 'sawtooth', 0.05, 90);
}

export function playPickup(audio, big) {
  blip(audio, 880, 0.12, 'sine', 0.09);
  setTimeout(() => blip(audio, big ? 1760 : 1320, 0.18, 'sine', 0.09), 110);
}

export function playSpotted(audio) {
  blip(audio, 620, 0.16, 'sawtooth', 0.08, 930);
}

export function playCaught(audio) {
  blip(audio, 220, 0.5, 'sawtooth', 0.12, 55);
}

export function playWin(audio) {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(audio, f, 0.25, 'sine', 0.09), i * 130));
}

// A low pulsing drone while the alarm is critical; stops when it calms.
export function setAlarmDrone(audio, on) {
  if (on === audio.alarmOn) return;
  audio.alarmOn = on;
  const ctx = ensureCtx(audio);
  if (!ctx) return;
  if (on && !audio.muted) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 110;
    lfo.frequency.value = 2.2;
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    g.gain.value = 0.045;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    lfo.start();
    audio.alarmNodes = { osc, lfo, g };
  } else if (audio.alarmNodes) {
    try {
      audio.alarmNodes.osc.stop();
      audio.alarmNodes.lfo.stop();
    } catch (e) { /* already stopped */ }
    audio.alarmNodes = null;
  }
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  if (audio.muted) setAlarmDrone(audio, false);
  return audio.muted;
}
