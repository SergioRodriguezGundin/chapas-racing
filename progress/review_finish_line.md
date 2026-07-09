# Review — feature 5 `finish_line`

**Veredicto:** APPROVED

## Verificación ejecutada
- `pnpm tsc --noEmit` → **exit 0** (limpio).
- `pnpm build` → **exit 0** (`✓ Compiled successfully`, `✓ Generating static pages (4/4)`).
- Dependencias nuevas: **cero**. `package.json` no aparece en el commit de la feature (`git show HEAD --name-only`); solo `physics.ts`, `GameCanvas.tsx`, `Cap.tsx`, `FinishLine.tsx` + docs de progreso.

## Checklist de aceptación (feature 5)
- CA1: [x] `src/features/track/FinishLine.tsx` — `RigidBody type="fixed"` (`FinishLine.tsx:30`) + `CuboidCollider sensor` (`:37-41`) posicionado en `finishTransform` (`:32-33`). Ancho `finish.width`, alto `finishHeight` (~1), prof `finishDepth` (~0.3).
  **Half-extents correctos:** `args={[finish.width / 2, finishHeight / 2, finishDepth / 2]}` (`:38`). No hay uso de extents completos → sin BUG.
- CA2: [x] `onIntersectionEnter` → `win()` con guard `if (useGameStore.getState().status !== "playing") return;` (`:23`) usando `getState()`, sin selector suscrito. `win()` vía `getState().win()` (`:25`).
- CA3: [x] Visual: `<mesh>` con `boxGeometry args={[finish.width, finishHeight, finishDepth]}` (dimensiones COMPLETAS, `:43`) y `meshStandardMaterial color="#ffd166" transparent opacity={finishOpacity}` (`:44`). Hereda position/rotation del `RigidBody` → misma pose que el sensor.
- CA4: [x] Montado en `GameCanvas.tsx:37` dentro del mismo `<Physics>` que `<Cap />` (`:35-39`).
- CA5: [x] Constantes nuevas en `config/physics.ts` dentro de `TRACK`: `finishHeight: 1`, `finishDepth: 0.3`, `finishOpacity: 0.4` (`physics.ts:44-48`). `finish.width` viene del track (correcto, no constante).
- CA6: [x] Payload tipado `IntersectionEnterPayload` (`FinishLine.tsx:3,22`), sin `any`. Guard por `userData`: `payload.other.rigidBodyObject?.userData?.type !== "cap"` (`:24`) coherente con `userData={{ type: "cap" }}` en `Cap.tsx:48`.
- CA7: [x] `pnpm tsc --noEmit` limpio (exit 0).

## Verificaciones adicionales obligatorias
- **Coherencia de ejes:** `finishTransform.rotationY = segmentAngle + Math.PI / 2` (`useTrackGeometry.ts:69`). `directionAngle` alinea el eje local **+X** con la dirección del tramo A→B (`:26-33`), criterio idéntico al de `TrackRenderer` (largo del segmento en +X, `trackWidth` en Z; `TrackRenderer.tsx:31,33`). Al sumar +90º a ese ángulo, el eje +X local de la meta (donde va `finish.width`) queda **perpendicular al tramo → cruzando la pista**. No hay intercambio de ejes; la meta NO queda paralela al tramo. Correcto.
- **Convenciones:** `"use client"` primera línea (`FinishLine.tsx:1`); alias `@/` en todos los imports (`:5-8`); export nombrado `export function FinishLine()` (`:13`); comentarios solo "porqués" (half-extents/cruce de pista `:35-36`, guard `:20-21`); orden de imports (rapier externo → `@/` internos, con línea en blanco). OK.

## Notas (no bloqueantes)
- La verificación de runtime (cruzar la meta cambia `status` a `won`; tocarla con `status === "won"` no re-dispara) queda pendiente de humano, como corresponde a un componente R3F. El razonamiento de idempotencia por guard de `status` en `impl_finish_line.md` es sólido.
