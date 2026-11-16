# Pulse Rush — M1 first playable

A futuristic 3D obstacle-racing game that runs in the browser. Run a neon track, dodge lasers, slide, jump gaps and spend Pulse energy to dash through laser barriers.

## Run it

```bash
npm install
npm run dev        # open the printed URL; --host is on, so your phone can open the LAN URL too
npm run lint
npm test
npm run build
```

Android: on the same Wi-Fi, open `http://<your-PC-LAN-IP>:5173` in Chrome. Allow Node through Windows Firewall if it doesn't connect.

## Controls

| Action | Keyboard | Touch (landscape) |
| --- | --- | --- |
| Steer | A / D or arrows | drag on the left half |
| Jump | Space | Jump |
| Slide (also fast-fall in air) | Shift | Slide |
| Pulse dash | E | Dash |
| Pause | Esc | pause button |

Both feed one normalised `InputState` (`engine/input.ts`).

## Architecture

```
src/simulation/  pure TypeScript, fixed 60 Hz: constants, types, level generator, step(), tests
src/engine/      Three.js: Engine (loop + interpolation + camera), world, runner, input, quality tiers
src/ui/          React: menu, HUD, pause, results, touch controls, localStorage bests
```

* Simulation imports no React / Three / DOM / UI / engine. ESLint enforces this (`no-restricted-imports`, `no-restricted-globals`).
* The engine steps the simulation at 60 Hz and interpolates rendering. React gets HUD data about 10 times a second, never per frame.
* Levels are data (`LevelDef`), produced by a seeded generator in `level.ts`. Gap edges snap to the 4 m floor tiles.
* All tuning (speed ramp, jump, slide, dash, energy) is in `simulation/constants.ts`.

## The Pulse mechanic (first prototype)

Dash costs 40 of 100 Pulse energy. It gives a 0.28 s speed surge during which you phase through **laser** obstacles (beams, walls, sweepers). It does not save you from solid blocks or gaps. Energy regenerates at 13/s and you gain 8 for each obstacle cleared. This is deliberately only one candidate for M2 experiments.

## Obstacles

Low block (jump), laser beam (slide), tall side wall (steer around), laser gate with narrowing opening, sweeping laser (time it or dash), gaps (jump), boost pads, and track edges (fall).

## What was verified, and what was not

Verified in the build environment (offline, no npm registry):
* `src/simulation` typechecks under `strict`, and its 17 tests pass (run through a minimal Vitest-compatible harness).
* A scripted autopilot bot finished 28 of 30 generated seeds. This is a sanity check, not a playtest.
* Engine and UI files parse, and typecheck with Three.js and React types stubbed out.

**Not verified** (needs your PC): `npm install`, `npm run lint`, real `vitest`, `npm run build`, WebGL rendering, frame rate, touch controls on a real phone. Treat the first run as a test, and send me any error text.

## Not in M1

Checkpoints, finish-line polish, audio, particles, other modes, multiplayer, accounts, ads. The menu lists future features as plain "Coming later" text, not buttons.

## Merging with your M0

I could not see your M0 project, so this is a standalone project built to the same agreed architecture. Your M0 performance monitor and tests are not included. To merge, copy `src/simulation`, `src/engine` and `src/ui` into your M0 and reconcile `main.tsx` and `package.json`.
