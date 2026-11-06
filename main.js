// main.js — scene, camera, render loop, collision, game state and wiring for the moon-dungeon golem.
import * as THREE from 'three';
import {
  arenaSize, playerHP, playerRadius, projectileRadius, projectileDamage,
  enemyRadius, contactDamage, contactCooldown, spawnInterval, waveSize,
} from './tuning.js';
import { createPlayer, updatePlayer, updateProjectiles, getProjectiles } from './player.js';
import { spawnWave, updateEnemies, getEnemies, clearEnemies } from './enemies.js';
import { createUI, setScore, setFloor, setHealth, showGameOver, hideGameOver } from './ui.js';

// --- Overlay -----------------------------------------------------------------
const ui = createUI();

// --- Scene, camera, renderer -------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color('#595959');

// Isometric-ish top-down: high above and behind the floor, aimed at its centre.
const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, arenaSize * 1.7, arenaSize * 1.55);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#f2f2f2', '#595959', 1.6));
const sun = new THREE.DirectionalLight('#f2f2f2', 1.8);
sun.position.set(8, 16, 6);
scene.add(sun);

// --- The floor ---------------------------------------------------------------
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(arenaSize * 2, arenaSize * 2),
  new THREE.MeshStandardMaterial({ color: '#7f7f7f' })
);
floorMesh.rotation.x = -Math.PI / 2;
scene.add(floorMesh);

const grid = new THREE.GridHelper(arenaSize * 2, arenaSize, '#f2f2f2', '#a5a5a5');
grid.position.y = 0.02;
scene.add(grid);

// --- Input -------------------------------------------------------------------
// Keys are held under several spellings ('Space'/'space'/' ', 'KeyW'/'keyw'/'w')
// so player.js can look up whichever it checks for.
const keys = new Set();
const mouseNDC = { x: 0, y: 0 };
const ctx = { keys, mouseNDC, camera, arenaSize, mouseDown: false };

const spellings = (event) => [event.code, event.key, event.key.toLowerCase(), event.code.toLowerCase()];

// The left button is reported to player.js both as ctx.mouseDown and as a key token.
const MOUSE_TOKENS = ['mouse', 'Mouse0', 'mouse0', 'MouseLeft', 'mouseleft', 'Primary', 'primary', 'Fire'];

function setMouseDown(down) {
  ctx.mouseDown = down;
  for (const token of MOUSE_TOKENS) {
    if (down) keys.add(token); else keys.delete(token);
  }
}

addEventListener('keydown', (event) => {
  if (event.code === 'Space') event.preventDefault();
  for (const token of spellings(event)) keys.add(token);
  if (state === 'gameover' && event.key.toLowerCase() === 'r') restart();
});
addEventListener('keyup', (event) => { for (const token of spellings(event)) keys.delete(token); });

addEventListener('mousedown', (event) => { if (event.button === 0) setMouseDown(true); });
addEventListener('mouseup', (event) => { if (event.button === 0) setMouseDown(false); });
addEventListener('blur', () => setMouseDown(false));

addEventListener('pointermove', (event) => {
  mouseNDC.x = (event.clientX / innerWidth) * 2 - 1;
  mouseNDC.y = -(event.clientY / innerHeight) * 2 + 1;
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --- Game state --------------------------------------------------------------
const player = createPlayer(scene);
const maxHp = () => player.maxHp ?? playerHP;

let state = 'playing';       // 'playing' | 'gameover'
let score = 0;               // enemies killed
let floor = 1;               // the descent itself arrives in M2
let contactTimer = 0;
let waveTimer = 0;
let shownHp = null;

const alive = (thing) => thing.alive !== false;   // treat a missing flag as alive
const liveEnemies = () => getEnemies().filter(alive).length;
const distanceXZ = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function restart() {
  for (const enemy of getEnemies()) if (enemy.mesh) scene.remove(enemy.mesh);   // don't trust clearEnemies to un-draw them
  clearEnemies();
  for (const shot of getProjectiles()) {
    shot.alive = false;
    if (shot.mesh) scene.remove(shot.mesh);
  }
  player.hp = maxHp();
  player.dead = false;
  player.group.position.set(0, player.group.position.y, 0);
  score = 0;
  floor = 1;
  contactTimer = 0;
  waveTimer = 0;
  shownHp = player.hp;
  setMouseDown(false);
  setScore(score);
  setFloor(floor);
  setHealth(player.hp, maxHp());
  hideGameOver();
  state = 'playing';
}

ui.setRestartHandler(restart);

// --- Collision (ours, not the other builder's) --------------------------------
function hitEnemies() {
  const enemies = getEnemies();
  for (const shot of getProjectiles()) {
    if (!alive(shot)) continue;
    for (const enemy of enemies) {
      if (!alive(enemy)) continue;
      const reach = projectileRadius + (enemy.radius ?? enemyRadius);
      if (distanceXZ(shot.mesh.position, enemy.mesh.position) < reach) {
        enemy.hp -= shot.damage ?? projectileDamage;
        shot.alive = false;
        if (shot.mesh) scene.remove(shot.mesh);
        if (enemy.hp <= 0) {
          enemy.alive = false;
          if (enemy.mesh) scene.remove(enemy.mesh);
          score += 1;
        }
        break;   // this shot is spent
      }
    }
  }
}

function touchDamage(dt) {
  contactTimer -= dt;
  for (const enemy of getEnemies()) {
    if (!alive(enemy)) continue;
    const reach = (enemy.radius ?? enemyRadius) + playerRadius;
    if (contactTimer <= 0 && distanceXZ(enemy.mesh.position, player.group.position) < reach) {
      player.hp -= contactDamage;
      contactTimer = contactCooldown;
      break;
    }
  }
}

// --- Frame -------------------------------------------------------------------
function update(dt) {
  updatePlayer(player, dt, ctx);
  updateProjectiles(dt);
  updateEnemies(dt, player.group.position);

  hitEnemies();
  touchDamage(dt);

  if (player.hp <= 0 && !player.dead) {
    player.dead = true;
    state = 'gameover';
    setMouseDown(false);
    showGameOver(score, floor);
  }

  // M1 stand-in for wave progression: quiet beat once the floor is clear, then the same size wave.
  if (liveEnemies() === 0) {
    waveTimer -= dt;
    if (waveTimer <= 0) {
      spawnWave(scene, waveSize);
      waveTimer = spawnInterval;
    }
  }

  setScore(score);
  setFloor(floor);

  if (player.hp !== shownHp) {
    shownHp = player.hp;
    setHealth(player.hp, maxHp());
  }
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);   // a tab switch must not teleport the world
  if (state === 'playing') update(dt);
  renderer.render(scene, camera);
});

setScore(score);
setFloor(floor);
setHealth(player.hp, maxHp());
