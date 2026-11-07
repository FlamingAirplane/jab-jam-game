# AI use log

Update this file **as you go**, each time you use AI during the jam. It is honest accounting for you, judges, and teachers: what you asked, what came back, and what you kept. Using AI is expected; hiding it is not the goal.

Log **every** AI touch: Claude Code in the build terminal, image or 3D generators, sound tools, or anything else. If something became part of your game, log it here **and** credit the file in `meta.json` (`ai_assets`, or `assets` with source and license).

The devlog agent (`claude --agent devlog`) can add rows when you report what you did. Say the tool, a short prompt or summary, and what you did with the result.

## Your log

Add one row per use (newest first). Leave blank cells as `—` if they do not apply.

| Time | Tool / model | What you asked (prompt or short summary) | What came back | Kept, changed, or rejected (why) | Game asset? |
|------|--------------|------------------------------------------|----------------|-----------------------------------|-------------|
| Nov 7 | Claude Code (Opus), build session | Follow our game design doc: element matchups and three abilities per element on keys 1/2/3; rock wall at the mouse | `abilities.js` rewritten, new `matchups.js`, edits to `main.js`, `player.js`, `enemies.js`, `ui.js`, `tuning.js` (commit `63cf59b`) | Kept; not yet playtested by us | No (code only) |
| Nov 7 | Claude Code (Opus), build session | Make a game design document from our slide deck and `context/references/` | A design doc (Claude Doc) covering overview, core loop, mechanics, world, art, scope, open questions | Changed: we edited it in Google Docs, filled in wind/light/darkness abilities, colours, the 1.25× matchup bonus, localStorage saves, rock wall placement | No |

## Worked example

You can delete this section once you understand the format. Do not copy these rows into your log.

┌───────┬──────────────────────────┬───────────────────────────────────────────┬────────────────────────────────────────────────────────────┬────────────────────────────────┬───────────────────────┐
│ Time  │       Tool / model       │ What you asked (prompt or short summary)  │                       What came back                       │  Kept, changed, or rejected    │      Game asset?      │
│       │                          │                                           │                                                            │             (why)              │                       │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 11:30 │ Claude Code (jam-guide), │ Plan the game: card, world, character,    │ Drafted context/ kit and BUILD-PLAN.md                     │ Kept after team edits and      │ No                    │
│       │  build terminal          │ twist, context kit, build plan            │                                                            │ approval (AJ, BD, JM)          │                       │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 13:00 │ Claude Code (jam-lead),  │ Build M1–M3 core loop: movement, aim,     │ main.js, player.js, enemies.js, elements.js, fx.js, ui.js, │ Kept; tuned numbers in         │ No                    │
│       │ build terminal           │ fire, waves, elements, collision          │  tuning.js                                                 │ tuning.js after play           │                       │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 14:30 │ Claude Code (jam-lead),  │ Add M4 visuals: mosaic floor,             │ Runtime canvas mosaic texture, blocky golem, pyramid       │ Kept; later upgraded golem     │ Floor texture no;     │
│       │ build terminal           │ golem/enemy/field models, sounds          │ enemies, rune fields, generated Web Audio sounds           │ model                          │ sounds no             │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 15:00 │ Claude Code (jam-lead),  │ Headless Blender export for golem model   │ assets/make_golem.py and assets/golem.glb                  │ Kept after rotating and        │ Yes: assets/golem.glb │
│       │ build terminal           │                                           │                                                            │ floor-aligning the model       │                       │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 15:20 │ Claude Code (jam-lead),  │ Add element variant parts to the golem    │ One Blender model with fire_, water_, earth_ parts toggled │ Kept                           │ Yes: assets/golem.glb │
│       │ build terminal           │ model                                     │  in code                                                   │                                │                       │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 15:30 │ Claude Code (jam-lead),  │ Add walls, columns, enemy separation,     │ Internal walls, more columns, enemy-enemy separation, 10   │ Kept                           │ No                    │
│       │ build terminal           │ same-element healing                      │ HP heal on matching element                                │                                │                       │
├───────┼──────────────────────────┼───────────────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────┼───────────────────────┤
│ 15:40 │ Claude Code (jam-lead),  │ Add brawler and archer enemy roles        │ enemies.js with melee brawlers and ranged archers          │ Kept                           │ No                    │
│       │ build terminal           │                                           │                                                            │                                │                       │
└───────┴──────────────────────────┴───────────────────────────────────────────┴────────────────────────────────────────────────────────────┴────────────────────────────────┴───────────────────────┘