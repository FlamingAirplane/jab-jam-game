// Element fields: glowing patches on the floor that change the golem's element when walked over.
import * as THREE from 'three';
import { elementTypes, elementColors, elementFieldRadius, arenaSize } from './tuning.js';

const fields = [];

function randomPosition() {
  // Keep fields away from the player spawn at (0,0) and inside the arena.
  const minDistFromSpawn = 4;
  let x, z, dist;
  do {
    x = (Math.random() * 2 - 1) * (arenaSize - elementFieldRadius - 1);
    z = (Math.random() * 2 - 1) * (arenaSize - elementFieldRadius - 1);
    dist = Math.hypot(x, z);
  } while (dist < minDistFromSpawn);
  return { x, z };
}

export function spawnElementFields(scene, count) {
  const geometry = new THREE.CylinderGeometry(elementFieldRadius, elementFieldRadius, 0.08, 24);
  geometry.translate(0, 0.04, 0);

  for (let i = 0; i < count; i++) {
    const type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
    const pos = randomPosition();
    const material = new THREE.MeshBasicMaterial({ color: elementColors[type] });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, 0.1, pos.z);
    scene.add(mesh);
    fields.push({ mesh, type, alive: true, radius: elementFieldRadius });
  }
}

export function spawnElementFieldAt(scene, position, type) {
  const chosenType = type ?? elementTypes[Math.floor(Math.random() * elementTypes.length)];
  const geometry = new THREE.CylinderGeometry(elementFieldRadius, elementFieldRadius, 0.08, 24);
  geometry.translate(0, 0.04, 0);
  const material = new THREE.MeshBasicMaterial({ color: elementColors[chosenType] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, 0.1, position.z);
  scene.add(mesh);
  fields.push({ mesh, type: chosenType, alive: true, radius: elementFieldRadius });
}

export function getElementFields() { return fields; }

export function clearElementFields() {
  for (const field of fields) {
    if (field.mesh && field.mesh.parent) field.mesh.parent.remove(field.mesh);
  }
  fields.length = 0;
}
