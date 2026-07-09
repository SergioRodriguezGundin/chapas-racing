# Review — Feature 2: track_geometry

**Veredicto:** APPROVED

## Salida de verificación

```
$ pnpm tsc --noEmit
EXIT: 0   (0 errores)
```

- Sin dependencias nuevas: `package.json` intacto (no aparece en `git status`). Solo tocados `src/config/physics.ts` (M) y `src/features/track/useTrackGeometry.ts` (nuevo).

## Checklist de aceptación (contra código real)

- **CA1 — [x]** `src/features/track/useTrackGeometry.ts` existe con `computeTrackGeometry(track)` pura (L39-73) y `useTrackGeometry(track)` con `useMemo` dep `[track]` (L76-78).
- **CA2 — [x]** `segments: { position, rotationY, length }[]` (interface `TrackSegment` L7-11). Bucle por par consecutivo `i < waypoints.length-1` (L44); `position` en punto medio `[(ax+bx)/2, y, (az+bz)/2]` (L51); `length = Math.hypot(dx,dz) = |B-A|` (L53); `rotationY = atan2(-dz, dx)` vía `directionAngle` (L31-33, L52).
- **CA3 — [x]** `pads: [number,number,number][]` una por waypoint vía `.map` (L57).
- **CA4 — [x]** `finishTransform: { position, rotationY }` (L67-70). Centrada en `waypoints[finish.waypointIndex]` -> `[fx, y, fz]` (L64, L68). Perpendicular al tramo entrante: `segmentAngle + π/2` (L69). Robusto ante índice 0 (`from`/`to` fallback a `0->1`, L61-62).
- **CA5 — [x]** circuit-01 tiene 8 waypoints -> el bucle produce 7 `segments` y `.map` produce 8 `pads`. Coincide con `segments.length === waypoints.length-1` y `pads.length === waypoints.length`.
- **CA6 — [x]** Función pura: sin imports de stores, sin `useEffect`, sin `THREE`, sin I/O. Solo `useMemo` (permitido en el hook wrapper) y `@/config/physics`.
- **CA7 — [x]** `pnpm tsc --noEmit` exit 0.

## Verificación matemática (inspección)

- **rotationY segmento:** rotación Y de Three mapea local `+X -> (cosθ, 0, -sinθ)`. Igualar con dirección `(dx, dz)` normalizada exige `sinθ = -dz/len`, luego `θ = atan2(-dz, dx)`. Correcto.
  - Segmento 0 `[0,0]->[12,0]`: `atan2(0,12)=0`, `pos=[6,0,0]`, `length=12`. OK.
  - Segmento 1 `[12,0]->[16,-6]`: `atan2(6,4)≈0.983`, `length=√52≈7.21`. OK.
- **finishTransform (perpendicularidad):** waypointIndex 7, tramo `[-6,-12]->[-6,-4]`, `dx=0, dz=8` -> `segmentAngle=atan2(-8,0)=-π/2`; `rotationY=-π/2+π/2=0`; `pos=[-6,0,-4]`. Perpendicular (+90º) verificado.

## Convenciones

- **[x]** Alias `@/` en todos los imports (L3-4); sin relativos.
- **[x]** Exports nombrados (`computeTrackGeometry`, `useTrackGeometry`, interfaces).
- **[x]** Tuplas `[number,number,number]` en la frontera de tipos.
- **[x]** Constante nueva `TRACK.groundY` en `config/physics.ts` (L40-43), no inline; consumida vía `TRACK.groundY` (L41 del hook).
- **[x]** Cero `any`.
- **[x]** Comentarios solo justifican "porqué" (mapeo atan2, tramo de referencia de meta, perpendicularidad). JSDoc de una línea en exports.
- **[x]** Orden de imports react -> internos `@/` con línea en blanco.
- Nota: módulo sin `"use client"` — correcto, no toca Canvas/rapier/eventos (lógica pura + `useMemo`).

## Observaciones (no bloqueantes)

- Test vitest ausente por regla de cero deps nuevas (vitest no está en el repo). Convención lo pide "cuando exista framework"; correcto no instalarlo. La verificación por inspección cubre la lógica pura.
