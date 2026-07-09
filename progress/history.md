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
