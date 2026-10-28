# Review — Feature 6: cap_reset_teleport

**Veredicto:** APPROVED

## Criterios de aceptación (evidencia archivo/línea)

- CA1 `OUT_OF_TRACK_Y = -3` en `config/physics.ts`: [x]
  `src/config/physics.ts:38-39` — constante suelta con JSDoc de una línea, valor `-3`.
- CA2 En `useFrame`: `y < OUT_OF_TRACK_Y` -> teleport a `lastPosition` con `y+0.2`, linvel/angvel cero, rotación identidad, `settle()`: [x]
  `Cap.tsx:56-60` dispara `teleport(body, useGameStore.getState().lastPosition)` + `settle()`.
  Helper `Cap.tsx:16-24`: `setTranslation({x, y:y+0.2, z}, true)`, `setLinvel({0,0,0})`, `setAngvel({0,0,0})`, `setRotation({x:0,y:0,z:0,w:1})`.
- CA3 Cap observa `resetRequestId` y teleporta a `track.capStart` sin refs cruzadas DOM<->Canvas: [x]
  `Cap.tsx:47-52` lee `useGameStore.getState().resetRequestId`, compara con ref y `teleport(body, getCurrentTrack().capStart)`. Cero refs DOM.
- CA4 Ambos caminos comparten helper de teleport (posición como parámetro): [x]
  Helper único `teleport(body, [x,y,z])` `Cap.tsx:16-24`, usado en línea 51 (restart) y 57 (caída). Sin duplicación.
- CA5 Patrón iter 1: imperativo con `getState()` en `useFrame`, sin suscripciones por-frame: [x]
  Todo vía `useGameStore.getState()` (líneas 47, 57, 58, 62, 71). `lastResetId`/`stillFrames` son `useRef`. Sin `useGameStore(selector)`.
- CA6 `pnpm tsc --noEmit` limpio: [x] (ver salidas)
- CA-manual Verificación física real: [ ] pendiente-de-humano (fuera del alcance del reviewer; flujo validado por inspección, coherente).

## Análisis de los 3 puntos de inspección críticos

1. **Detección de caída fuera del guard de phase** — CORRECTO.
   `Cap.tsx:56` (caída) está ANTES de `Cap.tsx:62` (`if (phase !== "moving") return;`). Una chapa parada/`idle` fuera de pista SÍ se resetea. No es el bug descrito.

2. **Inicialización de `lastResetId` sin teleport espurio** — CORRECTO.
   `Cap.tsx:38`: `useRef(useGameStore.getState().resetRequestId)` arranca con el valor actual del store (0 inicial, `gameStore.ts:56`). Store=0, ref=0 -> `rid !== lastResetId.current` es falso en el primer frame. No teleporta hasta que `restart()` incremente (`gameStore.ts:71`).

3. **Detección de parada por velocidad para 'moving'** — CORRECTO E INTACTA.
   `Cap.tsx:62-75`: tras el guard `phase === "moving"`, cálculo de `speed` con `STOP_DETECTION.velocityThreshold`/`framesRequired` y `settle()`. La reordenación no la rompió; `stillFrames` se resetea también en el camino restart (`Cap.tsx:50`) evitando arrastre.

   Nota adicional (no bloqueante): el orden restart -> caída en el mismo frame es seguro: `setTranslation` de Rapier aplica inmediato, así `translation().y` tras teleport a `capStart` (y=0.5) queda por encima de `-3` y la comprobación de caída no lo revierte.

## Verificación ejecutada por el reviewer

- `pnpm tsc --noEmit` -> exit code **0** (limpio).
- `pnpm build` -> exit code **0** ("Compiled successfully", 4 páginas generadas).
- Dependencias nuevas: **ninguna**. `git status` no muestra `package.json`/lockfile modificados. Archivos tocados: `src/config/physics.ts`, `src/features/cap/Cap.tsx` (+ `progress/`).
- Convenciones: alias `@/` (`Cap.tsx:6-10`), sin `any` (body tipado `RapierRigidBody`), comillas dobles, exports nombrados, comentarios solo "porqués" (`Cap.tsx:12-15,36-37,54-55`).

## Conclusión

Todos los criterios objetivos cumplidos, los tres puntos de inspección críticos correctamente resueltos, tsc y build verdes, cero deps nuevas, convenciones respetadas. Sin scope creep. **APPROVED.**
