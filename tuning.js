// tuning.js — every tunable number in the game, named, so it can be changed without touching other files.

// Movement and the golem
export const moveSpeed = 14;         // metres per second (bigger arena needs faster movement)
export const playerHP = 100;
export const playerRadius = 0.6;

// Firing
export const fireRate = 4;           // shots per second
export const projectileSpeed = 40;   // metres per second
export const projectileDamage = 25;
export const projectileRange = 70;   // metres before the shot expires
export const projectileRadius = 0.35;

// Enemies
export const enemySpeed = 4.0;       // faster across the bigger floor
export const enemyHP = 50;
export const enemyRadius = 0.7;
export const contactDamage = 10;
export const contactCooldown = 0.8;  // seconds between contact hits on the golem
export const contactPushDistance = 1.2;   // how far the player is knocked back on contact
export const contactPushEnemy = 0.6;      // how far the enemy is knocked back on contact

// Enemy roles
export const enemyRoleWeights = { brawler: 0.45, archer: 0.20, mage: 0.15, healer: 0.20 };
export const brawlerModelScale = 1.0;   // scale for Flow Studio fire/earth brawler models
export const archerModelScale = 1.0;    // scale for Flow Studio water archer model
export const mageModelScale = 1.1;      // scale for Flow Studio water mage model

// Archer
export const archerSpeed = 2.8;
export const archerPreferredRange = 18;   // tries to stay this far from the golem
export const archerRangeTolerance = 4;    // within this band it stops backing up
export const archerFireRate = 1.2;        // shots per second
export const archerProjectileSpeed = 22;
export const archerProjectileDamage = 8;
export const archerProjectileRadius = 0.3;
export const archerProjectileRange = 35;

// Mage
export const mageSpeed = 2.4;
export const magePreferredRange = 22;     // hangs back farther than archers
export const mageRangeTolerance = 5;
export const mageFireRate = 0.7;          // slower, heavier shots
export const mageProjectileSpeed = 16;
export const mageProjectileDamage = 15;
export const mageProjectileRadius = 0.7;
export const mageProjectileRange = 30;
export const mageBlastRadius = 4;         // splash radius on hit (visual + damage)

// Healer
export const healerSpeed = 2.2;
export const healerPreferredRange = 24;   // stays far back
export const healerRangeTolerance = 5;
export const healerHealRange = 18;
export const healerHealAmount = 15;
export const healerHealRate = 0.5;        // heals per second
export const healerModelScale = 1.0;

// Enemy personalities
export const personalityWeights = { grunt: 0.5, leader: 0.15, hero: 0.15, coward: 0.2 };
export const leaderAuraRadius = 12;       // nearby allies are spurred on
export const leaderSpeedMul = 1.25;
export const heroHpMul = 1.5;
export const heroSpeedMul = 1.3;
export const cowardFleeHpRatio = 0.4;     // below this HP a coward runs away
export const arrowTurnSpeed = 4.0;      // radians per second when rotating with arrow keys

// Waves
export const spawnInterval = 2.5;    // seconds of quiet before the next wave
export const waveSize = 8;           // enemies in wave 1
export const waveGrowth = 4;         // extra enemies per floor (used from M2)
export const wavesPerFloor = 3;      // how many waves before descending to the next floor

// Spawning
export const spawnMargin = 5;          // extra distance outside the camera view to spawn
export const minSpawnDistance = 28;    // minimum distance from player to spawn
export const spawnIndicatorSize = 16;  // px
export const spawnIndicatorDuration = 1.5; // seconds the arrow stays on screen
export const spawnIndicatorColor = '#f2f2f2';

// Floor — 4x larger area: half-extent doubled from 20 to 40
export const arenaSize = 40;
export const columnCount = 14;
export const columnRadius = 1.5;
export const columnMinDistanceFromPlayer = 12;
export const wallHeight = 4;
export const wallThickness = 1.5;
export const internalWallCount = 4;
export const internalWallLength = 18;
export const internalWallThickness = 1.8;
export const floorWallMargin = 8;      // keep this much space clear around the outer walls

// Elements
export const elementTypes = ['fire', 'water', 'earth', 'wind'];
export const elementColors = {
  fire: '#e74c3c',   // warm red-orange
  water: '#3498db',  // cool blue
  earth: '#8B4513',  // saddle brown
  wind: '#95a5a6',   // pale silver / air
};

// Per-element projectile behaviour
export const fireProjectileSpeed = 35;   // fast bolt
export const waterProjectileSpeed = 28;  // piercing beam
export const earthProjectileSpeed = 18;  // heavy slow blast
export const earthProjectileScale = 2.0; // bigger projectile
export const waterPierceCount = 3;       // how many enemies a water shot passes through
export const windProjectileSpeed = 55;   // very fast dart
export const windPierceCount = 2;        // cuts through a couple enemies

// Element fields
export const elementFieldCount = 2;      // fields spawned per floor
export const elementFieldRadius = 1.8;
export const enemyElementDropChance = 0.25; // chance an enemy drops a field on death

// Per-element tempo modifiers (multipliers)
export const elementMoveSpeedMul = {
  fire: 1.0,
  water: 1.25,   // water feels flowing and mobile
  earth: 0.75,   // earth feels heavy
  wind: 1.15,    // wind feels light and quick
};

export const elementFireRateMul = {
  fire: 1.0,     // fast
  water: 0.8,    // steady
  earth: 0.55,   // slow, heavy shots
  wind: 1.3,     // rapid darts
};

export const elementRotationSpeedMul = {
  fire: 1.2,     // snappy
  water: 1.0,    // normal
  earth: 0.6,    // heavy and slow to turn
  wind: 1.5,     // agile
};

// Ability numbers reused by the 1/2/3 abilities (grenade, tidal wave, earthquake)
export const fireGrenadeSpeed = 12;
export const fireGrenadeFuse = 1.2;         // seconds until explosion if it doesn't hit first
export const fireGrenadeBlastRadius = 6;
export const fireGrenadeDamage = 40;
export const waterWaveSpeed = 18;
export const waterWaveWidth = 8;            // across the front of the wave
export const waterWaveRange = 20;           // how far the wave travels
export const waterWaveDamage = 15;
export const waterWaveKnockback = 8;        // metres per second push
export const earthquakeRadius = 14;
export const earthquakeDamage = 30;
export const earthquakeKnockback = 10;
export const earthquakeDuration = 0.5;      // seconds for the shockwave to expand

// Wind ability: a narrow gust that cuts through enemies
export const windGustSpeed = 35;
export const windGustWidth = 3;
export const windGustRange = 28;
export const windGustDamage = 12;
export const windGustKnockback = 12;

// Elemental status effects
export const burnDamagePerSecond = 5;      // fire damage over time
export const burnDuration = 3;             // seconds
export const waterSpeedBoostMul = 1.35;    // temporary move-speed boost
export const waterSpeedBoostDuration = 2;  // seconds
export const earthSlowChance = 0.25;       // chance earth attacks slow
export const earthSlowMul = 0.5;           // speed multiplier while slowed
export const earthSlowDuration = 2;        // seconds

// FX timing
export const muzzleFlashDuration = 0.06;
export const trailSpawnInterval = 0.04;  // seconds between trail dots
export const burstParticleCount = 12;
export const burstLifetime = 0.35;
export const screenShakeAmount = 0.25;
export const screenShakeDecay = 5;

// Camera
export const cameraHeight = 14;          // zoomed in half
export const cameraDistance = 11;        // zoomed in half
export const cameraFollowSpeed = 8;      // lerp speed
export const cameraAngle = Math.PI / 4;  // 45 degrees around the golem

// Enemy health bar
export const enemyHealthBarWidth = 40;   // pixels
export const enemyHealthBarHeight = 5;   // pixels
export const enemyHealthBarYOffset = 28; // pixels above enemy centre on screen
export const enemyHealthBarColor = '#e74c3c';
export const enemyHealthBarBg = '#333333';

// XP / level-up meta progression
export const xpBase = 100;               // XP to reach level 2
export const xpGrowth = 1.25;            // multiply xpToNext each level
export const xpValues = {                // XP awarded on kill
  brawler: 10,
  archer: 14,
  mage: 18,
  healer: 20,
  heroMul: 1.5,
};
export const levelUpChoices = 3;         // how many upgrade cards to offer
export const upgradeOptions = [
  { key: 'damage', label: '+10% Shot Damage', mul: 1.10 },
  { key: 'speed', label: '+10% Move Speed', mul: 1.10 },
  { key: 'maxHp', label: '+10% Max HP', mul: 1.10 },
  { key: 'fireRate', label: '+10% Fire Rate', mul: 1.10 },
];

// Item drops
export const itemDropChance = 0.05;      // chance an enemy drops an item on death
export const itemDuration = 10;          // seconds temporary buffs last

// --- Element matchups (from the game design doc) ---------------------------------
// Attacker element -> elements it beats. A hit that beats the defender does elementAdvantageMul.
export const elementBeats = {
  water: ['fire'],
  fire: ['wind'],
  earth: ['fire'],
  wind: ['earth', 'water'],
  light: ['darkness'],
};
export const elementAdvantageMul = 1.25;   // +25% when your element beats theirs
export const lightBaseMul = 0.9;           // light is a little weaker against everything...
export const lightVsDarknessMul = 1.5;     // ...except darkness (+50% damage taken)
export const darknessBaseMul = 1.1;        // darkness is +10% against everything...
export const darknessVsLightMul = 0.5;     // ...except light, where it is very weak

// --- Element abilities: keys 1, 2, 3. No cooldowns, only cast time (seconds) -------
export const abilityCastTime = {
  fire: [0.2, 0.35, 0.3],    // flame blast, flame grenade, flame charge
  water: [0.15, 0.4, 0.35],  // water grab, tidal wave, swamp
  earth: [0.5, 0.35, 0.4],   // earthquake, rock wall, boulder throw
  wind: [0.15, 0.1, 0.3],    // gale burst, air dash, vacuum orb
};
export const abilityPushSpeed = 25;        // metres per second enemies slide when shoved

// Fire
export const flameBlastSpeed = 30;
export const flameBlastDamage = 45;
export const flameBlastRadius = 0.8;
export const flameBlastRange = 40;
export const flameChargeDistance = 9;
export const flameChargeDuration = 0.25;
export const flameChargeHitRadius = 2.4;
export const flameChargeDamage = 30;
export const flameChargePush = 4;

// Water
export const waterGrabRange = 7;           // how far in front the grab reaches
export const waterGrabHoldDistance = 2.4;  // where the held enemy floats
export const waterGrabMaxHold = 3;         // seconds before it launches on its own
export const waterThrowSpeed = 30;
export const waterThrowRange = 25;
export const waterThrowBlastRadius = 4.5;
export const waterThrowDamage = 35;
export const waterThrowPush = 5;
export const swampRadius = 7;
export const swampDuration = 4;

// Earth
export const rockWallLength = 7;
export const rockWallThickness = 1.2;
export const rockWallHeight = 3;
export const rockWallDuration = 5;
export const rockWallMaxRange = 18;        // furthest from the golem the wall can appear
export const boulderSpeed = 22;
export const boulderDamage = 55;
export const boulderRadius = 1.0;
export const boulderRange = 35;
export const boulderPush = 2;

// Wind
export const galeRadius = 7;
export const galeDamage = 10;
export const galePush = 6;
export const airDashDistance = 8;
export const airDashDuration = 0.15;
export const airDashInvuln = 0.3;          // seconds the golem can't be hit
export const airCurrentDuration = 2.5;
export const airCurrentWidth = 2.5;
export const airCurrentDamage = 8;
export const airCurrentPush = 3;
export const vacuumSpeed = 16;
export const vacuumTravel = 14;
export const vacuumPullRadius = 9;
export const vacuumPullSpeed = 8;
export const vacuumDuration = 2;
export const vacuumTickDamage = 6;
export const vacuumTickInterval = 0.5;
export const vacuumPopDamage = 15;
