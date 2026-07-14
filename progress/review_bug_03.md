# Review — BUG-03

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] Tras cruzar meta y pulsar "Jugar de nuevo", TODAS las chapas reaparecen en su `startPosition` — `GameCanvas.tsx` línea 41: key `` `${player.id}-${resetRequestId}` `` fuerza remount de cada `RigidBody` en `startPosition` al incrementar `restart()`; `Cap.tsx` líneas 52–57 mantiene teleport de respaldo.
- CA2: [x] Velocidades y rotación a cero; phase idle; activePlayerIndex 0; strokes reseteados — `gameStore.ts` líneas 108–121: `restart()` pone `phase: "idle"`, `activePlayerIndex: 0`, `strokes: 0`, `lastPosition: p.startPosition`; remount crea cuerpos nuevos con velocidades iniciales nulas; `teleport()` líneas 19–22 en `Cap.tsx` zera linvel/angvel/rotación si aplica.
- CA3: [x] Se puede lanzar de nuevo inmediatamente desde la línea de salida — `restart()` deja `status: "playing"` y `phase: "idle"`; `useLaunch.ts` líneas 55–57 solo permite input del jugador activo en `idle`.
- CA4: [x] Funciona con 2–4 jugadores — `GameCanvas.tsx` líneas 40–42: una instancia `Cap` por jugador con key única; posiciones laterales vía `computeStartPositions` en `startMatch`.
- CA5: [x] `pnpm tsc --noEmit` y `pnpm build` limpios — ejecutados en revisión, exit code 0.

## Convenciones y arquitectura
- Estructura respetada: `core/GameCanvas`, `features/cap/Cap`, `stores/gameStore`.
- Lógica por-frame en `useFrame` + `getState()` sin suscripciones por frame (`Cap.tsx` líneas 44–80).
- Constantes física en `config/physics.ts`; sin deps nuevas.
- Cero `any`; `userData` tipado con `playerIndex`.
- Verificación manual documentada en `progress/impl_bug_03.md` (pasos 1–6); sin framework de tests en repo.

## Notas (no bloqueantes)
- `teleport()` usa `y + 0.2` inline (`Cap.tsx` línea 19) — convención preexistente; fuera del alcance de BUG-03.
- El informe `impl_bug_03.md` declara Cap/gameStore "sin cambios", pero el diff incluye refactor multijugador previo; el estado final cumple los CA de BUG-03.
