# Estado actual

Tarea en curso: 1 — track_types_and_data

Plan:
- Crear `src/features/track/track.types.ts` con `TrackDefinition` + `validateTrack` (throws con mensaje accionable).
- Crear `src/features/track/tracks/circuit-01.json` con los datos exactos de la spec.
- Punto único de acceso `getCurrentTrack()` en `track.types.ts`: importa JSON, normaliza arrays -> tuplas, valida una vez (memoiza).
- `resolveJsonModule` ya activo en tsconfig: no tocar config.
- Verificar: `pnpm tsc --noEmit` + `pnpm build` limpios; reporte en `progress/impl_track_types_and_data.md`.
