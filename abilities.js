// abilities.js — three abilities per element on keys 1, 2, 3 (from the game design doc).
// No cooldowns, only cast time: press a key, the cast bar fills, then the ability fires.
//   Fire:  1 Flame blast · 2 Flame grenade · 3 Flame charge   (all fire moves burn)
//   Water: 1 Water grab  · 2 Tidal wave    · 3 Swamp          (all water moves build speed)
//   Earth: 1 Earthquake  · 2 Rock wall     · 3 Boulder throw  (all earth moves may slow)
//   Wind:  1 Gale burst  · 2 Air dash      · 3 Vacuum orb     (speed and space)
import * as THREE from 'three';
import {
  abilityCastTime, abilityPushSpeed, elementColors,
  earthSlowChance,
  flameBlastSpeed, flameBlastDamage, flameBlastRadius, flameBlastRange,
  fireGrenadeSpeed, fireGrenadeFuse, fireGrenadeBlastRadius, fireGrenadeDamage,
  flameChargeDistance, flameChargeDuration, flameChargeHitRadius, flameChargeDamage, flameChargePush,
  waterGrabRange, waterGrabHoldDistance, waterGrabMaxHold,
  waterThrowSpeed, waterThrowRange, waterThrowBlastRadius, waterThrowDamage, waterThrowPush,
  waterWaveSpeed, waterWaveWidth, waterWaveRange, waterWaveDamage,
  swampRadius, swampDuration,
  earthquakeRadius, earthquakeDamage, earthquakeDuration,
  rockWallLength, rockWallThickness, rockWallHeight, rockWallDuration, rockWallMaxRange,
  boulderSpeed, boulderDamage, boulderRadius, boulderRange, boulderPush,
  galeRadius, galeDamage, galePush,
  airDashDistance, airDashDuration, airDashInvuln,
  airCurrentDuration, airCurrentWidth, airCurrentDamage, airCurrentPush,
  vacuumSpeed, vacuumTravel, vacuumPullRadius, vacuumPullSpeed, vacuumDuration,
  vacuumTickDamage, vacuumTickInterval, vacuumPopDamage,
} from './tuning.js?v=2';
import { createFireball, updateFireball } from './fireball.js?v=1';

export const ABILITY_NAMES = {
  fire: ['Flame blast', 'Flame grenade', 'Flame charge'],
  water: ['Water grab', 'Tidal wave', 'Swamp'],
  earth: ['Earthquake', 'Rock wall', 'Boulder throw'],
  wind: ['Gale burst', 'Air dash', 'Vacuum orb'],
};

const abilities = [];   // live effects in the world
const shoves = [];      // enemies sliding from a push: { enemy, dir, remaining }
const rockWalls = [];   // { x, z, halfW, halfD, mesh, timer }
let cast = null;        // { element, slot, timer, total, released }
let grab = null;        // { enemy, timer, released }
const slotHeld = [false, false, false];

const UP = new THREE.Vector3(0, 1, 0);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

function alive(e) { return e && e.alive !== false; }
function distanceXZ(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }
function flatDir(from, to) {
  const d = new THREE.Vector3(to.x - from.x, 0, to.z - from.z);
  return d.lengthSq() > 0.0001 ? d.normalize() : new THREE.Vector3(1, 0, 0);
}

function material(color, opacity = 1, emissive = 0.5) {
  return new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: emissive, roughness: 0.5,
    transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity >= 1,
  });
}

function flatRing(color, opacity = 0.5) {
  const mesh = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.55, 64), material(color, opacity));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.08;
  return mesh;
}

function flatDisc(color, opacity = 0.35) {
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 48), material(color, opacity, 0.3));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.06;
  return mesh;
}

function strip(color, width, opacity = 0.45) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, 0.2, 1), material(color, opacity, 0.3));
  mesh.position.y = 0.15;
  return mesh;
}

function removeMesh(mesh) {
  if (!mesh) return;
  if (mesh.parent) mesh.parent.remove(mesh);
  mesh.traverse?.((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material && !child.material.map) child.material.dispose();
  });
}

// --- Shared effects ----------------------------------------------------------------
// Every damage event carries the element so main.js can apply matchups and the element's rider.
function hit(events, enemy, damage, element, extra = {}) {
  const ev = { type: 'damage', enemy, damage, element, ...extra };
  if (element === 'fire') ev.applyBurn = true;
  if (element === 'earth' && (extra.applySlow || Math.random() < earthSlowChance)) ev.applySlow = true;
  events.push(ev);
}

function shove(enemy, dir, distance) {
  if (!alive(enemy) || enemy === grab?.enemy) return;
  shoves.push({ enemy, dir: dir.clone().setY(0).normalize(), remaining: distance });
}

function blast(events, enemies, center, radius, damage, element, push) {
  events.push({ type: 'burst', position: center.clone(), color: elementColors[element] });
  for (const enemy of enemies) {
    if (!alive(enemy)) continue;
    if (distanceXZ(center, enemy.mesh.position) < radius + (enemy.radius ?? 0.7)) {
      hit(events, enemy, damage, element);
      shove(enemy, flatDir(center, enemy.mesh.position), push);
    }
  }
}

function frontEnemy(player, enemies, range) {
  let best = null;
  let bestD = range;
  const pos = player.group.position;
  for (const enemy of enemies) {
    if (!alive(enemy)) continue;
    const to = new THREE.Vector3(enemy.mesh.position.x - pos.x, 0, enemy.mesh.position.z - pos.z);
    const d = to.length();
    if (d > bestD || d < 0.001) continue;
    if (to.divideScalar(d).dot(player.facing) < 0.35) continue;   // must be roughly in front
    best = enemy;
    bestD = d;
  }
  return best;
}

// --- Input -------------------------------------------------------------------------
// Press a slot key (0, 1, 2). Returns true when a cast starts.
export function pressSlot(player, slot) {
  slotHeld[slot] = true;
  if (!player.element || !ABILITY_NAMES[player.element]) return false;
  if (cast || grab) return false;
  const total = abilityCastTime[player.element][slot];
  cast = { element: player.element, slot, timer: total, total, released: false };
  return true;
}

export function releaseSlot(slot) {
  slotHeld[slot] = false;
  if (cast && cast.slot === slot) cast.released = true;
  if (grab && slot === 0) grab.released = true;
}

export function isCasting() {
  return cast !== null || grab !== null;
}

// For the HUD: what is being cast and how far along.
export function getCastState() {
  if (grab) return { name: 'Water grab (release to throw)', progress: 1, element: 'water' };
  if (!cast) return null;
  return {
    name: ABILITY_NAMES[cast.element][cast.slot],
    progress: 1 - cast.timer / cast.total,
    element: cast.element,
  };
}

// Temporary rock walls: main.js treats them like level walls for movement and enemy shots.
export function getRockWalls() {
  return rockWalls;
}

// --- Firing an ability once its cast completes ------------------------------------
function fire(player, element, slot, enemies, scene, events, released) {
  const origin = player.group.position.clone();
  origin.y = 0.6;
  const dir = player.facing.clone().setY(0).normalize();
  if (element === 'water') events.push({ type: 'speedBoost' });   // all water moves build speed

  const key = `${element}${slot + 1}`;

  if (key === 'fire1') {
    // Flame blast: one big fireball that burns.
    const fb = createFireball(scene, 2.6);
    fb.sprite.position.copy(origin).addScaledVector(dir, 1);
    abilities.push({ type: 'bolt', element, fb, mesh: fb.sprite, dir, speed: flameBlastSpeed,
      radius: flameBlastRadius, damage: flameBlastDamage, range: flameBlastRange, traveled: 0, push: 1.5 });
  } else if (key === 'fire2') {
    // Flame grenade: lobbed ball that explodes on contact or when the fuse runs out.
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), material(elementColors.fire, 1, 0.6));
    mesh.position.copy(origin);
    scene.add(mesh);
    abilities.push({ type: 'grenade', element, mesh, dir, fuse: fireGrenadeFuse });
  } else if (key === 'fire3') {
    // Flame charge: dash forward wrapped in flame; anything touched is burned and thrown aside.
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(flameChargeHitRadius, 20, 12), material(elementColors.fire, 0.35, 0.8));
    scene.add(mesh);
    abilities.push({ type: 'dash', element, mesh, dir, speed: flameChargeDistance / flameChargeDuration,
      timer: flameChargeDuration, hitRadius: flameChargeHitRadius, damage: flameChargeDamage,
      push: flameChargePush, damaged: new Set() });
    events.push({ type: 'shake', amount: 0.3 });
  } else if (key === 'water1') {
    // Water grab: seize the nearest enemy in front; release the key to launch it.
    const target = frontEnemy(player, enemies, waterGrabRange);
    if (!target) {
      events.push({ type: 'burst', position: origin.clone().addScaledVector(dir, 2), color: elementColors.water });
      return;
    }
    grab = { enemy: target, timer: waterGrabMaxHold, released: released || !slotHeld[0] };
    target.grabbed = true;
  } else if (key === 'water2') {
    // Tidal wave: a wide wall of water rolling forward.
    const mesh = strip(elementColors.water, waterWaveWidth, 0.55);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(Z_AXIS, dir);
    scene.add(mesh);
    abilities.push({ type: 'wave', element, mesh, origin: origin.clone(), dir, traveled: 0,
      speed: waterWaveSpeed, width: waterWaveWidth, range: waterWaveRange, damage: waterWaveDamage,
      push: 4, damaged: new Set() });
  } else if (key === 'water3') {
    // Swamp: a pool around the golem that slows everything inside it.
    const mesh = flatDisc(elementColors.water, 0.35);
    mesh.scale.set(swampRadius, swampRadius, 1);
    mesh.position.set(origin.x, 0.06, origin.z);
    scene.add(mesh);
    abilities.push({ type: 'swamp', element, mesh, center: origin.clone(), timer: swampDuration });
  } else if (key === 'earth1') {
    // Earthquake: a shockwave rolling out from the golem.
    const mesh = flatRing(elementColors.earth, 0.55);
    mesh.position.set(origin.x, 0.08, origin.z);
    scene.add(mesh);
    abilities.push({ type: 'quake', element, mesh, origin: origin.clone(), elapsed: 0, damaged: new Set() });
    events.push({ type: 'shake', amount: 0.5 });
  } else if (key === 'earth2') {
    // Rock wall: a temporary wall raised where the mouse is.
    const aim = player.aimPoint ?? origin.clone().addScaledVector(dir, 8);
    const offset = new THREE.Vector3(aim.x - origin.x, 0, aim.z - origin.z);
    if (offset.length() > rockWallMaxRange) offset.setLength(rockWallMaxRange);
    const cx = origin.x + offset.x;
    const cz = origin.z + offset.z;
    // Walls are axis-aligned boxes: run the wall across the golem's line of fire.
    const acrossX = Math.abs(dir.z) >= Math.abs(dir.x);
    const halfW = acrossX ? rockWallLength / 2 : rockWallThickness / 2;
    const halfD = acrossX ? rockWallThickness / 2 : rockWallLength / 2;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(halfW * 2, rockWallHeight, halfD * 2),
      new THREE.MeshStandardMaterial({ color: elementColors.earth, roughness: 1, flatShading: true }),
    );
    mesh.position.set(cx, -rockWallHeight / 2, cz);   // rises out of the floor
    scene.add(mesh);
    rockWalls.push({ x: cx, z: cz, halfW, halfD, mesh, timer: rockWallDuration, temp: true });
    events.push({ type: 'burst', position: new THREE.Vector3(cx, 0.5, cz), color: elementColors.earth });
    events.push({ type: 'shake', amount: 0.25 });
    // Anyone standing where the wall rises gets thrown clear.
    for (const enemy of enemies) {
      if (!alive(enemy)) continue;
      const p = enemy.mesh.position;
      if (Math.abs(p.x - cx) < halfW + 0.7 && Math.abs(p.z - cz) < halfD + 0.7) {
        hit(events, enemy, 10, element);
        shove(enemy, flatDir(new THREE.Vector3(cx, 0, cz), p), 3);
      }
    }
  } else if (key === 'earth3') {
    // Boulder throw: a heavy ranged rock.
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(boulderRadius, 0),
      new THREE.MeshStandardMaterial({ color: elementColors.earth, roughness: 1, flatShading: true }),
    );
    mesh.position.copy(origin).addScaledVector(dir, 1.2);
    mesh.position.y = 1;
    scene.add(mesh);
    abilities.push({ type: 'bolt', element, mesh, dir, speed: boulderSpeed, radius: boulderRadius,
      damage: boulderDamage, range: boulderRange, traveled: 0, push: boulderPush, spin: true });
  } else if (key === 'wind1') {
    // Gale burst: blow everything nearby away from the golem.
    const mesh = flatRing(elementColors.wind, 0.6);
    mesh.position.set(origin.x, 0.08, origin.z);
    scene.add(mesh);
    abilities.push({ type: 'ring', mesh, elapsed: 0, duration: 0.25, radius: galeRadius });
    blast(events, enemies, origin, galeRadius, galeDamage, element, galePush);
    events.push({ type: 'shake', amount: 0.25 });
  } else if (key === 'wind2') {
    // Air dash: a quick dodge in the move direction, leaving an air current behind.
    const moveDir = player.moveDir && player.moveDir.lengthSq() > 0.01 ? player.moveDir.clone().normalize() : dir;
    const mesh = strip(elementColors.wind, airCurrentWidth, 0.4);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(Z_AXIS, moveDir);
    scene.add(mesh);
    abilities.push({ type: 'dash', element, mesh: null, dir: moveDir, speed: airDashDistance / airDashDuration,
      timer: airDashDuration, hitRadius: 0, damage: 0, push: 0, damaged: new Set() });
    abilities.push({ type: 'current', element, mesh, origin: origin.clone(), dir: moveDir,
      length: airDashDistance, timer: airCurrentDuration, damaged: new Set() });
    events.push({ type: 'invuln', time: airDashInvuln });
  } else if (key === 'wind3') {
    // Vacuum orb: flies forward, stops, and drags nearby enemies into a knot.
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 12), material(elementColors.wind, 0.75, 0.8));
    mesh.position.copy(origin).addScaledVector(dir, 1);
    mesh.position.y = 1;
    const ring = flatRing(elementColors.wind, 0.35);
    ring.scale.set(vacuumPullRadius, vacuumPullRadius, 1);
    ring.visible = false;
    scene.add(mesh, ring);
    abilities.push({ type: 'vacuum', element, mesh, ring, dir, traveled: 0, timer: vacuumDuration,
      tick: 0, flying: true });
  }
}

// --- Per-frame update ---------------------------------------------------------------
// world.hitsWall(position, radius) tells flying abilities when they strike a wall.
export function updateAbilities(dt, player, enemies, scene, world) {
  const events = [];

  // Casting.
  if (cast) {
    cast.timer -= dt;
    if (cast.element !== player.element) cast = null;   // swapped element mid-cast: fizzle
    else if (cast.timer <= 0) {
      const { element, slot, released } = cast;
      cast = null;
      fire(player, element, slot, enemies, scene, events, released);
    }
  }

  // Holding a grabbed enemy, then throwing it.
  if (grab) {
    const enemy = grab.enemy;
    grab.timer -= dt;
    if (!alive(enemy)) {
      grab = null;
    } else {
      const hold = player.group.position.clone().addScaledVector(player.facing, waterGrabHoldDistance);
      enemy.mesh.position.set(hold.x, 0.8, hold.z);
      enemy.fireTimer = Math.max(enemy.fireTimer ?? 0, 0.5);
      if (grab.released || !slotHeld[0] || grab.timer <= 0) {
        const dir = player.facing.clone().setY(0).normalize();
        abilities.push({ type: 'thrown', element: 'water', enemy, dir, traveled: 0 });
        grab = null;
        events.push({ type: 'speedBoost' });
      }
    }
  }

  // Shoves: enemies slide a set distance instead of teleporting.
  for (let i = shoves.length - 1; i >= 0; i--) {
    const s = shoves[i];
    if (!alive(s.enemy) || s.remaining <= 0) { shoves.splice(i, 1); continue; }
    const step = Math.min(s.remaining, abilityPushSpeed * dt);
    s.enemy.mesh.position.addScaledVector(s.dir, step);
    s.remaining -= step;
  }

  // Rock walls rise, stand, then sink.
  for (let i = rockWalls.length - 1; i >= 0; i--) {
    const w = rockWalls[i];
    w.timer -= dt;
    const age = rockWallDuration - w.timer;
    const rise = Math.min(1, age / 0.2);
    const sink = Math.min(1, Math.max(0, w.timer) / 0.3);
    w.mesh.position.y = -rockWallHeight / 2 + rockWallHeight * Math.min(rise, sink);
    if (w.timer <= 0) {
      removeMesh(w.mesh);
      rockWalls.splice(i, 1);
    }
  }

  for (let i = abilities.length - 1; i >= 0; i--) {
    const ab = abilities[i];
    let done = false;

    if (ab.type === 'bolt') {
      // A single heavy projectile: flame blast or boulder.
      const step = ab.speed * dt;
      ab.mesh.position.addScaledVector(ab.dir, step);
      ab.traveled += step;
      if (ab.fb) updateFireball(ab.fb, dt);
      if (ab.spin) { ab.mesh.rotation.x += dt * 8; ab.mesh.rotation.z += dt * 5; }
      let struck = null;
      for (const enemy of enemies) {
        if (!alive(enemy)) continue;
        if (distanceXZ(ab.mesh.position, enemy.mesh.position) < ab.radius + (enemy.radius ?? 0.7)) { struck = enemy; break; }
      }
      if (struck) {
        hit(events, struck, ab.damage, ab.element);
        shove(struck, ab.dir, ab.push);
        events.push({ type: 'burst', position: ab.mesh.position.clone(), color: elementColors[ab.element] });
        events.push({ type: 'shake', amount: 0.3 });
        done = true;
      } else if (ab.traveled >= ab.range || world.hitsWall(ab.mesh.position, ab.radius * 0.5)) {
        events.push({ type: 'burst', position: ab.mesh.position.clone(), color: elementColors[ab.element] });
        done = true;
      }
    } else if (ab.type === 'grenade') {
      ab.mesh.position.addScaledVector(ab.dir, fireGrenadeSpeed * dt);
      ab.fuse -= dt;
      let contact = ab.fuse <= 0 || world.hitsWall(ab.mesh.position, 0.4);
      for (const enemy of enemies) {
        if (contact) break;
        if (alive(enemy) && distanceXZ(ab.mesh.position, enemy.mesh.position) < 0.8 + (enemy.radius ?? 0.7)) contact = true;
      }
      if (contact) {
        blast(events, enemies, ab.mesh.position, fireGrenadeBlastRadius, fireGrenadeDamage, 'fire', 3);
        events.push({ type: 'shake', amount: 0.6 });
        done = true;
      }
    } else if (ab.type === 'dash') {
      // Move the golem; main.js resolves walls after the move.
      const step = ab.speed * dt;
      events.push({ type: 'movePlayer', delta: ab.dir.clone().multiplyScalar(step) });
      ab.timer -= dt;
      if (ab.mesh) ab.mesh.position.copy(player.group.position).setY(0.8);
      if (ab.hitRadius > 0) {
        for (const enemy of enemies) {
          if (!alive(enemy) || ab.damaged.has(enemy)) continue;
          if (distanceXZ(player.group.position, enemy.mesh.position) < ab.hitRadius + (enemy.radius ?? 0.7)) {
            ab.damaged.add(enemy);
            hit(events, enemy, ab.damage, ab.element);
            // Thrown to whichever side of the charge they were on.
            const side = flatDir(player.group.position, enemy.mesh.position);
            shove(enemy, side.addScaledVector(ab.dir, 0.5), ab.push);
          }
        }
      }
      if (ab.timer <= 0) done = true;
    } else if (ab.type === 'thrown') {
      // A grabbed enemy flying until it hits another enemy, a wall, or runs out of range.
      const enemy = ab.enemy;
      if (!alive(enemy)) { done = true; } else {
        const step = waterThrowSpeed * dt;
        enemy.mesh.position.addScaledVector(ab.dir, step);
        enemy.mesh.position.y = 0.8;
        enemy.fireTimer = Math.max(enemy.fireTimer ?? 0, 0.5);
        ab.traveled += step;
        let impact = ab.traveled >= waterThrowRange || world.hitsWall(enemy.mesh.position, enemy.radius ?? 0.7);
        for (const other of enemies) {
          if (impact) break;
          if (other === enemy || !alive(other)) continue;
          if (distanceXZ(enemy.mesh.position, other.mesh.position) < (enemy.radius ?? 0.7) + (other.radius ?? 0.7)) impact = true;
        }
        if (impact) {
          enemy.mesh.position.y = 0;
          enemy.grabbed = false;
          blast(events, enemies, enemy.mesh.position.clone(), waterThrowBlastRadius, waterThrowDamage, 'water', waterThrowPush);
          events.push({ type: 'shake', amount: 0.7 });
          done = true;
        }
      }
    } else if (ab.type === 'wave') {
      const step = ab.speed * dt;
      ab.traveled += step;
      ab.mesh.position.copy(ab.origin).addScaledVector(ab.dir, ab.traveled / 2);
      ab.mesh.position.y = 0.15;
      ab.mesh.scale.z = Math.max(1, ab.traveled);
      const halfWidth = ab.width / 2;
      for (const enemy of enemies) {
        if (!alive(enemy) || ab.damaged.has(enemy)) continue;
        const to = new THREE.Vector3().subVectors(enemy.mesh.position, ab.origin).setY(0);
        const along = to.dot(ab.dir);
        const perp = Math.sqrt(Math.max(0, to.lengthSq() - along * along));
        if (along >= 0 && along <= ab.traveled && perp < halfWidth + (enemy.radius ?? 0.7)) {
          ab.damaged.add(enemy);
          hit(events, enemy, ab.damage, ab.element);
          shove(enemy, ab.dir, ab.push);
        }
      }
      if (ab.traveled >= ab.range) done = true;
    } else if (ab.type === 'swamp') {
      ab.timer -= dt;
      ab.mesh.material.opacity = 0.35 * Math.min(1, ab.timer / 0.5);
      for (const enemy of enemies) {
        if (!alive(enemy)) continue;
        if (distanceXZ(ab.center, enemy.mesh.position) < swampRadius) {
          enemy.slowTimer = Math.max(enemy.slowTimer ?? 0, 0.25);
        }
      }
      if (ab.timer <= 0) done = true;
    } else if (ab.type === 'quake') {
      ab.elapsed += dt;
      const r = earthquakeRadius * Math.min(1, ab.elapsed / earthquakeDuration);
      ab.mesh.scale.set(r, r, 1);
      for (const enemy of enemies) {
        if (!alive(enemy) || ab.damaged.has(enemy)) continue;
        if (distanceXZ(ab.origin, enemy.mesh.position) <= r) {
          ab.damaged.add(enemy);
          hit(events, enemy, earthquakeDamage, 'earth', { applySlow: true });
          shove(enemy, flatDir(ab.origin, enemy.mesh.position), 4);
        }
      }
      if (ab.elapsed >= earthquakeDuration) done = true;
    } else if (ab.type === 'ring') {
      ab.elapsed += dt;
      const r = ab.radius * Math.min(1, ab.elapsed / ab.duration);
      ab.mesh.scale.set(r, r, 1);
      ab.mesh.position.x = player.group.position.x;
      ab.mesh.position.z = player.group.position.z;
      if (ab.elapsed >= ab.duration) done = true;
    } else if (ab.type === 'current') {
      // Air current left by a dash: enemies crossing it are buffeted sideways.
      ab.timer -= dt;
      ab.mesh.position.copy(ab.origin).addScaledVector(ab.dir, ab.length / 2).setY(0.15);
      ab.mesh.scale.z = ab.length;
      ab.mesh.material.opacity = 0.4 * Math.min(1, ab.timer / 0.5);
      const side = new THREE.Vector3().crossVectors(ab.dir, UP).normalize();
      for (const enemy of enemies) {
        if (!alive(enemy) || ab.damaged.has(enemy)) continue;
        const to = new THREE.Vector3().subVectors(enemy.mesh.position, ab.origin).setY(0);
        const along = to.dot(ab.dir);
        const perp = to.dot(side);
        if (along >= 0 && along <= ab.length && Math.abs(perp) < airCurrentWidth / 2 + (enemy.radius ?? 0.7)) {
          ab.damaged.add(enemy);
          hit(events, enemy, airCurrentDamage, 'wind');
          shove(enemy, side.clone().multiplyScalar(perp >= 0 ? 1 : -1), airCurrentPush);
        }
      }
      if (ab.timer <= 0) done = true;
    } else if (ab.type === 'vacuum') {
      if (ab.flying) {
        const step = vacuumSpeed * dt;
        ab.mesh.position.addScaledVector(ab.dir, step);
        ab.traveled += step;
        if (ab.traveled >= vacuumTravel || world.hitsWall(ab.mesh.position, 0.8)) {
          ab.flying = false;
          ab.ring.visible = true;
          ab.ring.position.set(ab.mesh.position.x, 0.08, ab.mesh.position.z);
        }
      } else {
        ab.timer -= dt;
        ab.tick -= dt;
        ab.mesh.rotation.y += dt * 6;
        const center = ab.mesh.position;
        const tickNow = ab.tick <= 0;
        if (tickNow) ab.tick = vacuumTickInterval;
        for (const enemy of enemies) {
          if (!alive(enemy) || enemy.grabbed) continue;
          const d = distanceXZ(center, enemy.mesh.position);
          if (d > vacuumPullRadius) continue;
          if (d > 1) enemy.mesh.position.addScaledVector(flatDir(enemy.mesh.position, center), Math.min(d - 1, vacuumPullSpeed * dt));
          if (tickNow) hit(events, enemy, vacuumTickDamage, 'wind');
        }
        if (ab.timer <= 0) {
          blast(events, enemies, center, 3, vacuumPopDamage, 'wind', 2);
          done = true;
        }
      }
    }

    if (done) {
      removeMesh(ab.mesh);
      removeMesh(ab.ring);
      abilities.splice(i, 1);
    }
  }

  return events;
}

export function clearAbilities() {
  for (const ab of abilities) {
    removeMesh(ab.mesh);
    removeMesh(ab.ring);
    if (ab.enemy) ab.enemy.grabbed = false;
  }
  abilities.length = 0;
  for (const w of rockWalls) removeMesh(w.mesh);
  rockWalls.length = 0;
  shoves.length = 0;
  if (grab?.enemy) grab.enemy.grabbed = false;
  cast = null;
  grab = null;
}

export function getAbilityCount() {
  return abilities.length + rockWalls.length;
}
