# Informe — Tarea 1: track_types_and_data

## Archivos creados/tocados

- `src/features/track/track.types.ts` (nuevo): `TrackDefinition`, `validateTrack`, `getCurrentTrack`.
- `src/features/track/tracks/circuit-01.json` (nuevo): datos exactos de la sección "Formato de circuito (JSON)" de `specs/iteration-2-spec.md`.
- `feature_list.json`: tarea 1 -> `in_progress`.
- `progress/current.md`: tarea en curso + plan.

## Decisiones

- `getCurrentTrack()` vive en `track.types.ts` (opción permitida por la tarea; evita un módulo extra y coincide con la estructura de archivos de la spec, que solo lista `track.types.ts` + `tracks/`).
- El JSON importado infiere `number[]`/`number[][]`; se normaliza a tuplas vía `normalizeTrack(raw: RawTrackDefinition)` con construcción explícita de tuplas — sin `as any` ni casts inseguros.
- Memoización a nivel de módulo (`currentTrack: TrackDefinition | null`): validación una sola vez por carga.
- Mensajes de error con formato accionable de `docs/conventions.md` (p.ej. `"circuit-01: waypoints requiere >= 2, recibido 1"`).
- `resolveJsonModule` ya estaba activo en `tsconfig.json` — sin cambios de config.
- Sin tests: vitest no existe en el repo (conventions: "cuando exista en repo").
- Sin dependencias nuevas; nada fuera del alcance (store, componentes, `Ground.tsx` intactos).

## Criterios de aceptación

- [x] `src/features/track/track.types.ts` con `TrackDefinition`: `name`, `trackWidth`, `capStart [x,y,z]`, `waypoints [x,z][]`, `finish { waypointIndex, width }`.
- [x] `validateTrack` lanza `Error` si `waypoints.length < 2`, `trackWidth <= 0` o `finish.waypointIndex` fuera de rango (`< 0` o `>= waypoints.length`).
- [x] `src/features/track/tracks/circuit-01.json` con los datos exactos de la spec.
- [x] `getCurrentTrack()` exporta el circuito activo cargado, normalizado a tuplas y validado (memoizado) como único punto de acceso.
- [x] `pnpm tsc --noEmit` limpio.

## Verificación

- `pnpm tsc --noEmit`: sin salida (limpio).
- `pnpm build`: `✓ Compiled successfully` + `Linting and checking validity of types` OK, 4/4 páginas estáticas generadas.

## Pendiente para humano

- Nada en esta tarea (solo tipos/datos, sin runtime visible). El render del circuito se verifica en la tarea 4.

## Estado

Pendiente de review. NO marcada como `done` en `feature_list.json` (sigue `in_progress`).
