# Informe — Feature 2: track_geometry

## Archivos

- **Creado** `src/features/track/useTrackGeometry.ts`
  - Tipos: `TrackSegment`, `FinishTransform`, `TrackGeometry` (tuplas `[number, number, number]` en la frontera).
  - `computeTrackGeometry(track)`: función pura (sin stores, sin efectos, sin `THREE`).
  - `useTrackGeometry(track)`: hook con `useMemo`, dependencia `[track]`.
  - Helper interno `directionAngle(dx, dz)`.
- **Modificado** `src/config/physics.ts`
  - Añadido `TRACK = { groundY: 0 }` (altura Y del centro de la geometría de suelo). No inline.

## Decisiones

- **Convención atan2 (segmentos):** `rotationY = atan2(-dz, dx)`.
  - Motivo: la rotación Y de Three mapea el eje local `+X` a `(cos, 0, -sin)`. Para alinear el largo de la caja (eje local X) con la dirección `A->B` en el plano XZ hay que igualar `(cos, -sin) = normalize(dx, dz)`, de donde `sin = -dz/len` y `rotationY = atan2(-dz, dx)`. Documentado en JSDoc del helper.
- **Meta perpendicular:** `finishTransform.rotationY = segmentAngle + π/2`, donde `segmentAngle` es el `directionAngle` del tramo que llega a la meta. Así el ancho (`finish.width`, eje local X en el consumidor `FinishLine`) queda cruzando el trazado y la profundidad fina queda a favor de la marcha.
  - Tramo de referencia: `(waypointIndex-1 -> waypointIndex)`, o `(0 -> 1)` si la meta cae en el primer waypoint (robusto ante índice 0).
- **Altura del suelo:** `TRACK.groundY = 0` en `config/physics.ts` (el task sugería 0). Segmentos y pads se centran en esa Y; el grosor 0.1 es responsabilidad del renderer (feature 4), fuera de scope aquí.
- **Tipos:** interfaces con tuplas inline `[number, number, number]`, coherente con `track.types.ts`. Cero `any`. No se reutilizó `Vec3` de `gameStore` para no acoplar el dominio track a internals del store (principio de arquitectura §capas).
- `length = Math.hypot(dx, dz)` (equivalente a `|B-A|`, sin `new Vector3`).

## Verificación

- `pnpm tsc --noEmit` -> **limpio, 0 errores** (exit 0).
- Lint (ReadLints) -> sin errores.
- `pnpm build`: no ejecutado (feature de lógica pura; los criterios de la feature 2 solo exigen `tsc --noEmit` limpio). Queda para verificación integral / features con render.

## Test (vitest)

- **Pendiente por ausencia de vitest.** `package.json` no incluye vitest en `devDependencies` ni hay `vitest.config.*`. Por regla de cero deps nuevas, NO se instaló.
- No se creó `useTrackGeometry.test.ts`: `tsconfig.json` incluye `**/*.ts`, por lo que un archivo importando `vitest` rompería `pnpm tsc --noEmit`. Se prioriza NO romper tsc.
- **Verificación por inspección** contra `circuit-01.json` (8 waypoints):
  - `segments.length === 7` (waypoints.length - 1). OK por el bucle `i < length-1`.
  - `pads.length === 8` (waypoints.length). OK por `.map`.
  - Segmento 0 (`[0,0]->[12,0]`): `length = 12`, `rotationY = atan2(0, 12) = 0`, `position = [6, 0, 0]`. Correcto (tramo recto sobre +X).
  - Segmento 1 (`[12,0]->[16,-6]`): `length = hypot(4,-6) = √52 ≈ 7.211`, `rotationY = atan2(6, 4) ≈ 0.9828`.
  - `finishTransform` (waypointIndex 7, tramo `[-6,-12]->[-6,-4]`, dir `dz=+8`): `segmentAngle = atan2(-8,0) = -π/2`; `rotationY = -π/2 + π/2 = 0`; `position = [-6, 0, -4]`.

## Checklist criterios de aceptación (feature 2)

- [x] Existe `src/features/track/useTrackGeometry.ts` con `computeTrackGeometry(track)` (pura) y `useTrackGeometry(track)` con `useMemo`.
- [x] `segments: { position, rotationY, length }[]` por par consecutivo, centrado en punto medio, largo `|B-A|`, rotación atan2 según dirección.
- [x] `pads: position[]` — una por waypoint.
- [x] `finishTransform: { position, rotationY }` perpendicular al último tramo, centrada en `waypoints[finish.waypointIndex]`.
- [x] circuit-01: `segments.length === 7`, `pads.length === 8` (por inspección).
- [x] Sin acceso a stores ni efectos: función pura verificable por inspección.
- [x] `pnpm tsc --noEmit` limpio.

## Pendiente para humano / review

- Verificación visual real se dará al integrar en `TrackRenderer` (feature 4) / `FinishLine` (feature 5): confirmar que los tramos se ven alineados y la meta cruza el trazado.
- Si en el futuro se añade vitest, portar la verificación por inspección a `useTrackGeometry.test.ts`.
