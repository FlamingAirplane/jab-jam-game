// ui.js — the plain-DOM overlay: kills, floor, health bar, and the game over / restart panel.
const GREY = { dark: '#595959', mid: '#7f7f7f', light: '#a5a5a5', pale: '#cccccc', white: '#f2f2f2' };

let els = null;            // built by createUI
let onRestart = null;      // set by main.js
let shown = { score: null, floor: null };   // skip redrawing unchanged readouts

export function createUI() {
  const root = document.getElementById('ui') || document.createElement('div');
  root.id = 'ui';
  Object.assign(root.style, {
    position: 'fixed', inset: '0', zIndex: '10', pointerEvents: 'none',
    font: '15px/1.5 system-ui, sans-serif', color: GREY.white, userSelect: 'none',
  });

  // Top-left readout.
  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position: 'absolute', left: '16px', top: '16px', padding: '10px 14px', minWidth: '170px',
    background: 'rgba(0,0,0,0.45)', border: `1px solid ${GREY.mid}`, borderRadius: '6px',
  });
  const score = document.createElement('div');
  const floor = document.createElement('div');
  const hp = document.createElement('div');
  Object.assign(hp.style, { marginTop: '8px', fontSize: '13px', color: GREY.pale });
  const barOuter = document.createElement('div');
  Object.assign(barOuter.style, {
    marginTop: '4px', height: '10px', background: GREY.dark, border: `1px solid ${GREY.mid}`,
  });
  const bar = document.createElement('div');
  Object.assign(bar.style, { height: '100%', width: '100%', background: GREY.pale });
  barOuter.appendChild(bar);
  panel.append(score, floor, hp, barOuter);

  // Game over: a centred panel with one Restart button. The button is the only clickable thing.
  const over = document.createElement('div');
  Object.assign(over.style, {
    position: 'absolute', inset: '0', display: 'none', placeItems: 'center',
    background: 'rgba(0,0,0,0.6)',
  });
  const box = document.createElement('div');
  Object.assign(box.style, {
    padding: '24px 32px', textAlign: 'center', background: 'rgba(0,0,0,0.75)',
    border: `1px solid ${GREY.light}`, borderRadius: '8px',
  });
  const title = document.createElement('div');
  title.textContent = 'The golem is destroyed';
  Object.assign(title.style, { fontSize: '20px', marginBottom: '10px' });
  const overStats = document.createElement('div');
  Object.assign(overStats.style, { color: GREY.pale, marginBottom: '16px' });
  const hint = document.createElement('div');
  hint.textContent = 'press R or click Restart';
  Object.assign(hint.style, { color: GREY.light, fontSize: '13px', marginTop: '10px' });
  const button = document.createElement('button');
  button.textContent = 'Restart';
  Object.assign(button.style, {
    pointerEvents: 'auto', cursor: 'pointer', font: 'inherit', padding: '8px 20px',
    color: GREY.white, background: GREY.dark, border: `1px solid ${GREY.light}`, borderRadius: '6px',
  });
  button.addEventListener('click', () => { if (onRestart) onRestart(); });
  button.addEventListener('mousedown', (event) => event.stopPropagation());  // don't read as a shot
  box.append(title, overStats, button, hint);
  over.appendChild(box);

  root.append(panel, over);
  if (!root.isConnected) document.body.appendChild(root);

  els = { score, floor, hp, bar, over, overStats };
  setScore(0);
  setFloor(1);
  setHealth(1, 1);
  return { setRestartHandler(fn) { onRestart = fn; } };
}

export function setScore(n) {
  if (!els || shown.score === n) return;
  shown.score = n;
  els.score.textContent = `Kills: ${n}`;
}

export function setFloor(n) {
  if (!els || shown.floor === n) return;
  shown.floor = n;
  els.floor.textContent = `Floor: ${n}`;
}

export function setHealth(hp, maxHp) {
  if (!els) return;
  const shown = Math.max(0, Math.ceil(hp));
  els.hp.textContent = `HP: ${shown} / ${maxHp}`;
  els.bar.style.width = `${Math.max(0, Math.min(1, maxHp > 0 ? hp / maxHp : 0)) * 100}%`;
}

export function showGameOver(score, floor) {
  if (!els) return;
  els.overStats.textContent = `Kills: ${score}    Floor: ${floor}`;
  els.over.style.display = 'grid';
}

export function hideGameOver() { if (els) els.over.style.display = 'none'; }
