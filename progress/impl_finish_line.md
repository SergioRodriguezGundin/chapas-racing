# Impl: feature 5 `finish_line`

## Archivos creados
- `src/features/track/FinishLine.tsx` — sensor de meta.

## Archivos modificados
- `src/config/physics.ts` — nuevas constantes en el objeto `TRACK`: `finishHeight: 1`, `finishDepth: 0.3`, `finishOpacity: 0.4`.
- `src/features/cap/Cap.tsx` — añadido `userData={{ type: "cap" }}` al `<RigidBody>` de la chapa (red de seguridad del guard).
- `src/core/GameCanvas.tsx` — import + montaje de `<FinishLine />` dentro de `<Physics>`, entre `<TrackRenderer />` y `<Cap />`.

## Decisiones
- **Guard elegido:** status + userData. Guard obligatorio `if (useGameStore.getState().status !== "playing") return;` y, como red de seguridad recomendada por el research, `if (payload.other.rigidBodyObject?.userData?.type !== "cap") return;`. Al usar el guard por userData, fue necesario añadir `userData={{ type: "cap" }}` al `<RigidBody>` de la chapa (cambio mínimo autorizado por la tarea); sin él el guard bloquearía `win()`. Ambos cambios van juntos. Se usa `getState()` (no selector suscrito), patrón repo.
- **Constantes:** en el objeto `TRACK` de `config/physics.ts` (`finishHeight`, `finishDepth`, `finishOpacity`). `finish.width` NO es constante: viene del track. Color `FINISH_COLOR = "#ffd166"` como const local del módulo, mismo patrón que `FLOOR_COLOR` en `TrackRenderer.tsx`.
- **Ejes del sensor:** `finish.width` en el eje X del collider (half-extents `[finish.width/2, finishHeight/2, finishDepth/2]`), mismo criterio que el largo de los segmentos en `TrackRenderer`. Como `finishTransform.rotationY = anguloTramo + π/2`, al girar +90º el ancho de la meta cruza la pista. El `boxGeometry` usa dimensiones COMPLETAS `[finish.width, finishHeight, finishDepth]`, coincidentes con el sensor, en la misma position/rotation (heredadas del `<RigidBody>`).
- **Sensor + handler** juntos en el `<CuboidCollider>` explícito; `colliders={false}` en el `<RigidBody>` para no auto-generar collider extra (recomendación del research).
- **Payload tipado** con `IntersectionEnterPayload` de `@react-three/rapier`. Campos NO deprecados (`payload.other.rigidBodyObject`). Sin `any`.
- **Sin drei `Text`** (opcional en spec), para no complicar.

## Salidas de verificación
- `pnpm tsc --noEmit` (baseline previo): exit 0.
- `pnpm tsc --noEmit && pnpm build`: exit 0. `✓ Compiled successfully`, `✓ Generating static pages (4/4)`. Sin errores de tipos ni de build.
- Lints de archivos tocados: sin errores.
- Sin dependencias nuevas.

## Checklist de acceptance (feature 5)
- [x] Existe `src/features/track/FinishLine.tsx`: `RigidBody type="fixed"` + `CuboidCollider sensor` en `finishTransform`, ancho `finish.width`, alto ~1 (`finishHeight`), profundidad ~0.3 (`finishDepth`).
- [x] `onIntersectionEnter` llama a `win()` solo si `status === "playing"` (guard con `getState()`).
- [x] Visual: mesh semitransparente de color distintivo (`#ffd166`, `transparent`, `opacity 0.4`) en la posición/rotación del sensor.
- [x] Montado en `GameCanvas` dentro de `<Physics>` (mismo mundo que la chapa).
- [x] Dimensiones nuevas como constantes en `config/physics.ts`, no inline.
- [x] `pnpm tsc --noEmit` limpio.

## Verificación pendiente-de-humano
No ejecutable por el implementer (requiere runtime/canvas/física):
- Cruzar la meta con la chapa cambia `status` a `won`.
- Tocar la meta con `status === "won"` NO re-dispara.

**Por qué el guard de status previene el re-disparo:** al primer cruce, `win()` pone `status = "won"`. Cualquier `onIntersectionEnter` posterior (p.ej. la chapa quieta sobre el sensor, o un segundo contacto) hace early-return en `if (status !== "playing")`, así que `win()` no vuelve a ejecutarse. El gotcha del research sobre re-intersecciones tras teleport (feature 6/7) no afecta a esta feature porque `win()` es idempotente respecto a `status` y no depende del par Enter/Exit para "desarmarse": queda bloqueado por estado hasta un `restart()` explícito (feature 7), que devolverá `status` a `playing`.
