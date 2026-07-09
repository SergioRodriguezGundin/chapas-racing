# Bitácora (append-only)

## Iteración 2

### Feature 2 — track_geometry (done)
- Modo harness (leader → implementer → reviewer).
- Implementado `src/features/track/useTrackGeometry.ts`: `computeTrackGeometry` (pura) + `useTrackGeometry` (useMemo). Constante `TRACK.groundY` añadida en `config/physics.ts`.
- Convención geometría: `rotationY = atan2(-dz, dx)` para segmentos; `finishTransform` perpendicular al último tramo (`+π/2`), centrado en `waypoints[finish.waypointIndex]`.
- circuit-01: 8 waypoints -> 7 segments, 8 pads.
- Test vitest pendiente (vitest no instalado; no se añaden deps sin discusión). Verificación por inspección documentada.
- Verificación: `pnpm tsc --noEmit` limpio; `pnpm build` limpio.
- Artefactos: `progress/impl_track_geometry.md`, `progress/review_track_geometry.md` (APPROVED).

### Feature 3 — store_status_restart (done)
- Modo harness (leader → implementer → reviewer).
- `src/stores/gameStore.ts`: `GameStatus` ('playing'|'won'), `status` inicial 'playing', `resetRequestId` (0), `win()`, `restart()` (estado inicial completo + incremento resetRequestId vía set funcional), guard de `startAiming` si status !== 'playing', `lastPosition` inicial desde `getCurrentTrack().capStart`. Retirado import muerto de `CAP_START_POSITION` (la constante sigue en config; su borrado es feature 4).
- Semántica de phase intacta.
- Verificación: `pnpm tsc --noEmit` limpio; `pnpm build` limpio.
- Artefactos: `progress/impl_store_status_restart.md`, `progress/review_store_status_restart.md` (APPROVED).

### Feature 4 — track_renderer (done)
- Modo harness (leader → implementer → reviewer).
- Nuevo `src/features/track/TrackRenderer.tsx`: UN `RigidBody fixed colliders={false}` con `CuboidCollider`+`boxGeometry` por segmento (ejes: length→X, trackWidth→Z, coherente con `rotationY=atan2(-dz,dx)`) y `CylinderCollider`+`cylinderGeometry` por pad. Usa `useTrackGeometry(getCurrentTrack())`.
- `GameCanvas.tsx`: `<Ground />` → `<TrackRenderer />` dentro de `<Physics>`.
- `Ground.tsx` eliminado (git: D). `Cap.tsx` toma position de `getCurrentTrack().capStart`. `CAP_START_POSITION` eliminada de config (0 referencias vivas; grosor de suelo en `config/physics.ts`).
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Verificación visual en pantalla queda pendiente-de-humano (leader no la ejecuta).
- Artefactos: `progress/impl_track_renderer.md`, `progress/review_track_renderer.md` (APPROVED).

### Feature 5 — finish_line (done)
- Modo harness (leader → explorer → implementer → reviewer).
- Explorer: fijada API de sensores @react-three/rapier 2.2.0 (`sensor` en CuboidCollider, `onIntersectionEnter(payload)`, usar `payload.other.*` no deprecados; sensor y chapa bajo el mismo `<Physics>`; gotcha de re-disparo tras teleport). -> `progress/research_rapier_sensors.md`.
- Nuevo `src/features/track/FinishLine.tsx`: `RigidBody fixed colliders={false}` + `CuboidCollider sensor` en `finishTransform` (half-extents `[finish.width/2, alto/2, prof/2]`), visual semitransparente. `onIntersectionEnter` -> guard `status==='playing'` (getState) + `win()`; guard extra por `userData.type==='cap'` (añadido `userData` a Cap.tsx). Montado en GameCanvas dentro de `<Physics>`. Constantes en `config/physics.ts`.
- Verificación: `pnpm tsc --noEmit` y `pnpm build` limpios. Verificación visual/física (cruzar meta -> won; no re-dispara) pendiente-de-humano.
- Artefactos: `progress/impl_finish_line.md`, `progress/review_finish_line.md` (APPROVED).
