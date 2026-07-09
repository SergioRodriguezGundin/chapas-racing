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
