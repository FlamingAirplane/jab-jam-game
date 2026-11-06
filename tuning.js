// tuning.js — every tunable number in the game, named, so it can be changed without touching other files.

// Movement and the golem
export const moveSpeed = 8;          // metres per second
export const playerHP = 100;
export const playerRadius = 0.6;

// Firing
export const fireRate = 3;           // shots per second
export const projectileSpeed = 30;   // metres per second
export const projectileDamage = 25;
export const projectileRange = 30;   // metres before the shot expires
export const projectileRadius = 0.35;

// Enemies
export const enemySpeed = 2.2;
export const enemyHP = 50;
export const enemyRadius = 0.7;
export const contactDamage = 10;
export const contactCooldown = 0.8;  // seconds between contact hits on the golem

// Waves
export const spawnInterval = 3;      // seconds of quiet before the next wave
export const waveSize = 5;           // enemies in wave 1
export const waveGrowth = 3;         // extra enemies per floor (used from M2)

// Floor
export const arenaSize = 20;         // half-extent of the square floor

// Elements
export const elementTypes = ['fire', 'water', 'earth'];
export const elementColors = {
  fire: '#e74c3c',   // warm red-orange
  water: '#3498db',  // cool blue
  earth: '#8e44ad',  // stone purple / brownish
};

// Per-element projectile behaviour
export const fireProjectileSpeed = 35;   // fast bolt
export const waterProjectileSpeed = 28;  // piercing beam
export const earthProjectileSpeed = 18;  // heavy slow blast
export const earthProjectileScale = 2.0; // bigger projectile
export const waterPierceCount = 3;       // how many enemies a water shot passes through

// Element fields
export const elementFieldCount = 2;      // fields spawned per floor
export const elementFieldRadius = 1.8;

// Camera
export const cameraHeight = 28;          // was ~34; zoom in
export const cameraDistance = 22;        // was ~31; zoom in
export const cameraFollowSpeed = 8;      // lerp speed
