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
export const waveGrowth = 2;         // extra enemies per floor (used from M2)

// Floor
export const arenaSize = 20;         // half-extent of the square floor
