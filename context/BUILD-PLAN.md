# Build Plan

Drafted by the build terminal from your context kit and your card; you edit and approve it in `/jam-plan`. One page. Nothing here that you didn't say or approve.

**Approved by:** AJ, BD, JM — 12:59

## The game in one line

> You are a golem in a dungeon on the moon. You aim and fire at overwhelming odds, absorbing one
> element at a time from the environment, and descend floor after floor until you're destroyed.

## The one action

> Aim and fire. The mouse aims; click or hold to shoot heavy, weighty shots.

## Card

> 3. Single-screen shooter — aim and fire. (Allowed: one enemy type in waves, wave count rises, one
> projectile. We added: WASD movement, three absorbable elements, descending floors.)

## Done means (3 to 5 checks you can play)

- [ ] I can walk with WASD and aim with the mouse.
- [ ] Clicking fires a heavy shot, and enemies burst when they die.
- [ ] Walking into an elemental field changes my element. I can only hold one — taking a new one drops the old.
- [ ] Clearing a wave takes me down a floor, and the next wave is bigger.
- [ ] When the golem is destroyed I see a game over and I'm playing again in under 2 seconds.

## Milestones

| Milestone | By | Done when (your words) |
|---|---|---|
| M1 gray box | 1:30 | Plain shapes: I can move, aim, fire, kill something, and restart. |
| M2 loop | 2:00 | Waves spawn, they get bigger, I can die, I'm scored on floors, and restart is instant. **Playtest 1** |
| M3 feel | 2:45 | The numbers are in `tuning.js`, all three elements work, and firing and dying both *feel* like something. **Playtest 2** |
| M4 look | 3:15 | Mosaic look, golem model, sounds. Gameplay frozen. |
| M5 ship | 3:30 | `JUDGING.md` self-check done, `/jam-ship` run. |

## Tasks

| Milestone | Task | Files | Owner | Check |
|---|---|---|---|---|
| M1 | Page, import map, canvas, render loop, golem box, WASD movement | `index.html`, `main.js`, `tuning.js` | jam-builder | `curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/` returns 200; WASD moves the box |
| M1 | Mouse aim, click/hold to fire, projectile travel, one enemy that takes damage and dies | `player.js`, `enemies.js` | jam-builder | Console clean; clicking kills the enemy |
| M1 | Score readout, game over, restart key | `ui.js`, `main.js` | jam-builder | Dies → press R → playing again |
| M2 | Wave spawner, wave size grows per floor, floor descend on clear | `enemies.js`, `floors.js` | jam-builder | Wave 3 is visibly bigger than wave 1 |
| M2 | Golem HP, contact damage, death, restart under 2s | `player.js`, `main.js` | jam-builder | Die and restart in one keypress |
| M2 | Elemental fields spawn on the floor, walking in absorbs the element, one at a time | `elements.js`, `tuning.js` | jam-builder | Pick up fire, then water — the projectile changes colour and behaviour |
| M3 | Every tunable number named in `tuning.js` | `tuning.js` | jam-builder | Changing a number changes the game without touching other files |
| M3 | Hit feedback: enemy burst, screen shake, muzzle flash, damage flash | `fx.js`, `player.js`, `ui.js` | jam-builder | Firing and dying both read on screen |
| M3 | Third element + per-element projectile behaviour | `elements.js`, `player.js` | jam-builder | Each element fires something different |
| M4 | Mosaic textures (canvas-drawn), golem model, floor/wall look | `assets/`, `main.js` | jam-builder | Looks like the palette, not like prototype boxes |
| M4 | Three sound effects; `meta.json` credits | `meta.json`, `main.js` | jam-helper | Sounds fire on shoot, hit, death; credits present |
| M5 | `JUDGING.md` self-check | — | jam-helper | Report read back to the makers |

## File map

- `index.html`: page, import map (three.js 0.186.1), loads `main.js`
- `main.js`: scene, camera, render loop, game state, wiring
- `tuning.js`: every number you might tune
- `player.js`: the golem — movement, aim, firing, HP
- `enemies.js`: spawning and enemy behaviour
- `floors.js`: wave sizing, floor descent
- `elements.js`: the three elements, their fields, their projectiles
- `fx.js`: bursts, shake, flashes
- `ui.js`: score, game over, restart, title
- `assets/`: generated textures and models

## Tuning knobs

- `moveSpeed` — how fast the golem walks
- `fireRate` — shots per second
- `projectileSpeed`, `projectileDamage`
- `enemySpeed`, `enemyHP`, `contactDamage`
- `playerHP`
- `waveSize`, `waveGrowth` — how much bigger each floor is
- `spawnInterval` — how fast they trickle in
- `elementFieldCount`, `elementSwapCooldown`

## Assets plan (the card's safe budget)

- **3 models:** the golem, the enemy, an elemental field marker
- **3 sounds:** shoot, enemy burst, golem destroyed
- Mosaic textures drawn to canvas at runtime (no downloads), in the five-grey palette
- More than this costs build time — we'll say so before adding

## Cut list

- All six elements → **fire, water, earth** today; the other three are Stretch
- Skill tree, skill points, item drops → Stretch
- Procedural infinite floors → floors get harder; that's the escalation
- A second enemy *type* (different behaviour) → Stretch

## Stretch (only after M4)

- The other three elements — darkness, light, wind (we built fire, water, earth today)
- A second enemy type
- Skill points and a skill tree
- Item drops
