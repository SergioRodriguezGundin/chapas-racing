# Review — track_renderer (F04, iteración 2)

**Veredicto:** APPROVED

## Verificación ejecutada

- `pnpm tsc --noEmit` → **exit 0** (limpio).
- `pnpm build` → **exit 0** ("Compiled successfully", 4/4 páginas generadas, sin errores de lint/tipos).
- Búsqueda referencias muertas en `src/`:
  - `CAP_START_POSITION` → **0 referencias** (Grep sin coincidencias).
  - `\bGround\b` → 1 hit **obsoleto de caché del índice** (`src/features/track/Ground.tsx`). Verificado que NO existe en disco: `Read` = "File not found", `ls src/features/track/` no lo lista, `git status` muestra `D src/features/track/Ground.tsx` (borrado). Sin imports/usos reales.

## Checklist de aceptación

- **CA1: [x]** — `src/features/track/TrackRenderer.tsx:23` un único `<RigidBody type="fixed" colliders={false}>`.
- **CA2: [x]** — Por segmento (`TrackRenderer.tsx:24-37`): `CuboidCollider args={[length/2, thickness/2, trackWidth/2]}` (línea 31) + `boxGeometry args={[length, thickness, trackWidth]}` (línea 33), dentro de `<group position rotation={[0, rotationY, 0]}>`. **Coherencia de ejes correcta**: `useTrackGeometry` usa `rotationY = atan2(-dz, dx)` que alinea el eje local +X con la dirección A→B (`useTrackGeometry.ts:27-33`), por lo que `length` va en X y `trackWidth` en Z tanto en mesh como en collider (mismo orden de half-extents). No hay intercambio X↔Z. `thickness = TRACK.floorThickness = 0.1`.
- **CA3: [x]** — Por pad (`TrackRenderer.tsx:39-47`): `CylinderCollider args={[thickness/2, trackWidth/2]}` (half-height, radio; línea 41) + `cylinderGeometry args={[trackWidth/2, trackWidth/2, thickness, 32]}` (radio `trackWidth/2`, alto `thickness=0.1`; línea 43).
- **CA4: [x]** — `GameCanvas.tsx:8` importa `TrackRenderer`; `GameCanvas.tsx:34-37` monta `<TrackRenderer />` dentro de `<Physics>`. Sin import ni uso residual de `Ground`.
- **CA5: [x]** — `src/features/track/Ground.tsx` eliminado (git `D`, no en disco).
- **CA6: [x]** — `Cap.tsx:22` `const { capStart } = getCurrentTrack();` y `Cap.tsx:47` `position={capStart}`. `CAP_START_POSITION` eliminada de `config/physics.ts` (no aparece en el archivo) y 0 referencias en todo `src/`.
- **CA7: [ ] pendiente-de-humano** — Verificación visual/física en pantalla (trazado visible, chapa cae sobre primer tramo y se puede lanzar). No verificable por el reviewer (requiere render/navegador). La matemática de ejes collider↔mesh queda validada por inspección (ver CA2).
- **CA8: [x]** — `tsc --noEmit` y `build` limpios (exit 0 ambos).

## Convenciones (`docs/conventions.md`)

- `"use client"` primera línea (`TrackRenderer.tsx:1`). ✓
- Imports con alias `@/` (líneas 5-7). ✓
- Keys `kebab-{index}`: `seg-${index}`, `pad-${index}`. ✓
- Exports nombrados (`export function TrackRenderer`). ✓
- Sin `any`. ✓
- Comentarios solo *porqués* (línea 25 justifica alineación de ejes; JSDoc de propósito líneas 11-14). ✓
- Constantes en `config/physics.ts`: `TRACK.floorThickness = 0.1` (`physics.ts:42`), sin `0.1` mágico inline en el render. ✓
- Componente estático sin `useFrame` → sin re-render por frame. ✓

## Pendiente-de-humano (no bloquea aprobación)

Ejecutar `pnpm dev` y confirmar: (1) trazado de circuit-01 visible, (2) la chapa cae sobre el primer tramo (`capStart [0, 0.3, 0]` sobre tramo `[0,0]→[12,0]` a `y=0`), (3) el lanzamiento funciona, (4) editar `trackWidth`/`waypoints` en el JSON cambia el trazado al recargar.
