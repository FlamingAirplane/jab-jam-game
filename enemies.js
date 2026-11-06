// Enemy boxes: spawn a wave just inside the arena edge, then walk straight at the golem.
import * as THREE from 'three';
import { enemySpeed, enemyHP, enemyRadius, arenaSize } from './tuning.js';

const ENEMY_COLOR = '#5a5a5a';
const enemies = []; // [{ mesh, hp, alive, radius }]
let enemyGeometry = null; // one shared shape, made on the first spawn

// A jagged floating shard — a tall pyramid with its base on the floor.
function getEnemyGeometry() {
  if (!enemyGeometry) {
    enemyGeometry = new THREE.ConeGeometry(enemyRadius, enemyRadius * 2.4, 4);
    enemyGeometry.translate(0, enemyRadius * 1.2, 0);
  }
  return enemyGeometry;
}

export function spawnEnemyAt(scene, position) {
  const mesh = new THREE.Mesh(
    getEnemyGeometry(),
    new THREE.MeshStandardMaterial({ color: ENEMY_COLOR, roughness: 0.9, flatShading: true })
  );
  mesh.position.copy(position);
  mesh.position.y = 0;
  scene.add(mesh);
  enemies.push({ mesh, hp: enemyHP, alive: true, radius: enemyRadius });
  return enemies[enemies.length - 1];
}

export function spawnWave(scene, count) {
  for (let i = 0; i < count; i++) {
    // Pick one of the four edges, then a spot along it, just inside the arena.
    const edge = Math.floor(Math.random() * 4);
    const along = (Math.random() * 2 - 1) * arenaSize;
    const inset = arenaSize * (0.92 + Math.random() * 0.06);
    const position = new THREE.Vector3();
    if (edge === 0) position.set(along, 0, -inset);
    else if (edge === 1) position.set(along, 0, inset);
    else if (edge === 2) position.set(-inset, 0, along);
    else position.set(inset, 0, along);
    spawnEnemyAt(scene, position);
  }
}

export function updateEnemies(dt, targetPos) {
  // Drop the ones killed last frame first, in place: the caller holds this exact array.
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].alive) continue;
    const mesh = enemies[i].mesh;
    if (mesh.parent) mesh.parent.remove(mesh);
    enemies.splice(i, 1);
  }

  const step = enemySpeed * dt;
  for (const enemy of enemies) {
    const position = enemy.mesh.position;
    const dx = targetPos.x - position.x;
    const dz = targetPos.z - position.z;
    const distance = Math.hypot(dx, dz);
    if (distance > 1e-4) {
      const travel = Math.min(step, distance); // don't overshoot the golem
      position.x += (dx / distance) * travel;
      position.z += (dz / distance) * travel;
    }
    position.y = 0; // keep the meshes on the floor
  }
}

export function getEnemies() {
  return enemies;
}

export function clearEnemies() {
  for (const enemy of enemies) {
    if (enemy.mesh.parent) enemy.mesh.parent.remove(enemy.mesh);
  }
  enemies.length = 0;
}
