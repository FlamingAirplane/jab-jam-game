// The golem: WASD movement on the floor, mouse aim, and firing element-charged shots.
import * as THREE from 'three';
import {
  moveSpeed,
  playerHP,
  playerRadius,
  fireRate,
  projectileSpeed,
  projectileDamage,
  projectileRange,
  projectileRadius,
  arenaSize,
  elementColors,
  fireProjectileSpeed,
  waterProjectileSpeed,
  earthProjectileSpeed,
  earthProjectileScale,
  waterPierceCount,
} from './tuning.js';

const GOLEM_COLOR = '#c6cbd0';
const PROJECTILE_COLOR = '#f1f2f4';

// Module state: the game has one golem and one projectile list at a time.
let activePlayer = null; // whose position new shots start from
let shotScene = null; // the scene shot meshes are added to
let fireTimer = 0; // seconds until the next shot is allowed
const projectiles = []; // [{ mesh, dir, damage, alive, traveled, speed, pierce }]

const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const raycaster = new THREE.Raycaster();
const hitPoint = new THREE.Vector3();
const moveStep = new THREE.Vector3();
let projectileGeometry = null; // one shared sphere, made on first shot

// movement keys are matched on e.code ('KeyW') and on the plain letter, so either convention works
function held(keys, code, letter) {
  return keys.has(code) || keys.has(letter);
}

// Firing is Space, or the left mouse button held down. main.js reports the button either
// as a key token in ctx.keys or as a flag, so accept the obvious spellings of each.
function firing(ctx) {
  const keys = ctx.keys;
  if (ctx.mouseDown || ctx.firing || (ctx.mouse && ctx.mouse.down)) return true;
  if (keys.has('Space') || keys.has('space')) return true;
  return (
    keys.has('Mouse0') ||
    keys.has('mouse0') ||
    keys.has('MouseLeft') ||
    keys.has('mouseleft') ||
    keys.has('Primary') ||
    keys.has('primary')
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function createPlayer(scene) {
  // A restart builds a fresh golem: drop the old one and the shots it left in the air.
  if (activePlayer && activePlayer.group.parent) activePlayer.group.parent.remove(activePlayer.group);
  clearProjectiles();

  const group = new THREE.Group();
  const size = playerRadius * 2;
  const geometry = new THREE.BoxGeometry(size, size, size);
  geometry.translate(0, size / 2, 0); // base sits on the floor, so the group can live at y = 0
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: GOLEM_COLOR }));
  group.add(mesh);
  group.position.set(0, 0, 0);
  scene.add(group);

  shotScene = scene;
  fireTimer = 0;

  const player = {
    group,
    mesh, // the golem box, so setElement can recolour it
    hp: playerHP,
    maxHp: playerHP,
    dead: false,
    element: 'fire',
    facing: new THREE.Vector3(0, 0, 1), // where the next shot goes
  };
  setElement(player, 'fire');
  activePlayer = player;
  return player;
}

export function setElement(player, type) {
  player.element = type;
  if (player.mesh && player.mesh.material) {
    player.mesh.material.color.set(elementColors[type] ?? GOLEM_COLOR);
  }
}

export function getElement(player) {
  return player.element;
}

export function updatePlayer(player, dt, ctx) {
  activePlayer = player;
  const keys = ctx.keys;
  const position = player.group.position;

  // Walk: normalised so moving diagonally isn't faster, then clamped to the arena.
  moveStep.set(0, 0, 0);
  if (held(keys, 'KeyW', 'w')) moveStep.z -= 1;
  if (held(keys, 'KeyS', 's')) moveStep.z += 1;
  if (held(keys, 'KeyA', 'a')) moveStep.x -= 1;
  if (held(keys, 'KeyD', 'd')) moveStep.x += 1;
  if (moveStep.lengthSq() > 0) {
    moveStep.normalize().multiplyScalar(moveSpeed * dt);
    position.x = clamp(position.x + moveStep.x, -arenaSize, arenaSize);
    position.z = clamp(position.z + moveStep.z, -arenaSize, arenaSize);
  }

  // Aim: shoot the mouse ray at the floor plane and face that spot.
  raycaster.setFromCamera(ctx.mouseNDC, ctx.camera);
  if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
    const dx = hitPoint.x - position.x;
    const dz = hitPoint.z - position.z;
    if (dx !== 0 || dz !== 0) {
      player.facing.set(dx, 0, dz).normalize();
      player.group.rotation.y = Math.atan2(player.facing.x, player.facing.z);
    }
  }

  // Fire: one shot per cooldown while the button or Space is held.
  fireTimer = Math.max(0, fireTimer - dt);
  if (firing(ctx) && fireTimer === 0) {
    spawnShot(player);
    fireTimer = 1 / fireRate;
  }

  player.dead = player.hp <= 0;
}

export function updateProjectiles(dt) {
  // Drop last frame's spent shots first, in place: the caller holds this exact array.
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (projectiles[i].alive) continue;
    const mesh = projectiles[i].mesh;
    if (mesh.parent) mesh.parent.remove(mesh);
    projectiles.splice(i, 1);
  }

  for (const shot of projectiles) {
    const step = shot.speed * dt;
    shot.mesh.position.addScaledVector(shot.dir, step);
    shot.traveled += step;
    if (shot.traveled >= projectileRange) shot.alive = false; // cleaned up next frame
  }
}

export function getProjectiles() {
  return projectiles;
}

function spawnShot(player) {
  if (!projectileGeometry) projectileGeometry = new THREE.SphereGeometry(projectileRadius, 10, 6);

  const element = player.element ?? 'fire';
  const material = new THREE.MeshStandardMaterial({ color: elementColors[element] ?? PROJECTILE_COLOR });

  let mesh;
  let speed = projectileSpeed;
  let damage = projectileDamage;
  let pierce;

  if (element === 'water') {
    // Thinner, longer piercing beam.
    mesh = new THREE.Mesh(projectileGeometry, material);
    mesh.scale.set(0.5, 0.5, 2.5);
    speed = waterProjectileSpeed;
    pierce = waterPierceCount;
  } else if (element === 'earth') {
    // Larger, slower, harder-hitting blast.
    mesh = new THREE.Mesh(projectileGeometry, material);
    mesh.scale.setScalar(earthProjectileScale);
    speed = earthProjectileSpeed;
    damage = projectileDamage * 1.5;
  } else {
    // Fire: fast default bolt.
    mesh = new THREE.Mesh(projectileGeometry, material);
    speed = fireProjectileSpeed;
  }

  const dir = player.facing.clone();
  mesh.position.copy(player.group.position);
  mesh.position.y = playerRadius; // chest height, clear of the floor
  mesh.position.addScaledVector(dir, playerRadius); // clear of the golem's own box
  shotScene.add(mesh);

  projectiles.push({
    mesh,
    dir,
    damage,
    alive: true,
    traveled: 0,
    speed,
    pierce,
  });
}

function clearProjectiles() {
  for (const shot of projectiles) {
    if (shot.mesh.parent) shot.mesh.parent.remove(shot.mesh);
  }
  projectiles.length = 0;
}
