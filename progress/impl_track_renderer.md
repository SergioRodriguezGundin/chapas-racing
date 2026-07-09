# Implementación F04 — track_renderer

Feature 4 (`track_renderer`) de la iteración 2. Render del suelo del circuito con colliders explícitos, retirada de `Ground`.

## Archivos

### Creados
- `src/features/track/TrackRenderer.tsx` — componente cliente. Único `<RigidBody type="fixed" colliders={false}>` con:
  - Un `<group>` por segmento (`key="seg-{index}"`) en `segment.position`, `rotation={[0, segment.rotationY, 0]}`, conteniendo `CuboidCollider` + `mesh`/`boxGeometry`.
  - Un `<group>` por pad (`key="pad-{index}"`) en `pad` position, conteniendo `CylinderCollider` + `mesh`/`cylinderGeometry`.

### Modificados
- `src/config/physics.ts` — eliminada `CAP_START_POSITION`; añadida `TRACK.floorThickness = 0.1`.
- `src/core/GameCanvas.tsx` — import `Ground` → `TrackRenderer`; `<Ground />` → `<TrackRenderer />` dentro de `<Physics>`.
- `src/features/cap/Cap.tsx` — `position` del RigidBody desde `getCurrentTrack().capStart` (antes `CAP_START_POSITION`); imports ajustados (añadido `getCurrentTrack`, quitado `CAP_START_POSITION`).

### Borrados
- `src/features/track/Ground.tsx` — eliminado del repo (confirmado: `Read` devuelve "File not found"; `pnpm build` verde sin él). NOTA: grep/glob del índice del IDE muestran hit obsoleto/caché, pero el archivo no existe.

## Decisiones

- **Ejes X=length**: `useTrackGeometry` usa `rotationY = atan2(-dz, dx)`, que alinea el eje local **+X** con la dirección A→B. Por eso `boxGeometry args={[length, thickness, trackWidth]}` (X=length, Z=trackWidth) y `CuboidCollider args={[length/2, thickness/2, trackWidth/2]}` (half-extents en el mismo orden).
- **collider + mesh coherentes vía `group`**: cada segmento/pad se envuelve en un `<group>` con `position`/`rotation`, de modo que collider y mesh comparten exactamente la misma transform (imposible que diverjan). react-three-rapier resuelve la transform del collider relativa al RigidBody atravesando los groups.
- **`floorThickness`**: nueva constante en `TRACK` (`config/physics.ts`), reutilizada por segmentos y pads (box `thickness`, collider `thickness/2`, cilindro alto `thickness` / half-height `thickness/2`). No se duplica `TRACK.groundY` (Y ya lo aporta `useTrackGeometry` en cada position).
- **Pads**: `CylinderCollider args={[thickness/2, trackWidth/2]}` (half-height, radio) + `cylinderGeometry args={[trackWidth/2, trackWidth/2, thickness, 32]}` (radioTop, radioBottom, alto, segmentos).
- **Material/estilo**: color `#3a4750` (coherente con el `Ground` anterior), `receiveShadow` en todos los meshes de suelo. Sin `Grid` (el suelo es ahora solo el trazado).
- **Ids**: keys `seg-{index}` / `pad-{index}` según convención `kebab-{index}`.
- **Sin re-render por frame**: componente estático, sin `useFrame`. `getCurrentTrack()` memoiza carga; `useTrackGeometry` memoiza geometría.

## Verificación

- `pnpm tsc --noEmit` → **limpio** (exit 0). Baseline previo también verde.
- `pnpm build` → **limpio** (exit 0, "Compiled successfully", páginas generadas).
- Grep referencias muertas en `src/`:
  - `CAP_START_POSITION` → **0 referencias**.
  - Componente `Ground` (`\bGround\b`) → 0 referencias reales (único hit es el propio archivo borrado en caché del índice; `pnpm build` compila sin él). `pointToGround` en `useLaunch.ts` es una función distinta, no relacionada.

## Checklist de acceptance (feature 4)

- [x] `src/features/track/TrackRenderer.tsx` con UN solo `RigidBody type="fixed" colliders={false}`.
- [x] Por segmento: `CuboidCollider` + `boxGeometry` largo `length`, ancho `trackWidth`, alto `0.1` (`TRACK.floorThickness`), en su `position`/`rotationY`.
- [x] Por pad: `CylinderCollider` + `cylinderGeometry` radio `trackWidth/2`, alto `0.1`.
- [x] `GameCanvas.tsx` monta `<TrackRenderer />` dentro de `<Physics>` en lugar de `<Ground />`.
- [x] `src/features/track/Ground.tsx` eliminado del repo.
- [x] `Cap.tsx` toma position inicial de `track.capStart`; `CAP_START_POSITION` eliminada de `config/physics.ts` sin referencias restantes.
- [ ] **Verificación manual (pendiente-de-humano)**: el trazado de circuit-01 se ve en pantalla y la chapa cae sobre el primer tramo y se puede lanzar.
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios.

## Verificación visual pendiente-de-humano

No ejecutable por el implementer (requiere navegador/render). Razonamiento de correctitud geométrica:
- Cada segmento se centra en el punto medio de (A,B) a `y = TRACK.groundY` y se orienta con `rotationY = atan2(-dz, dx)`, alineando su eje +X (donde vive `length`) con la dirección del tramo → los tramos encadenan a lo largo de la polilínea.
- Collider y mesh comparten la MISMA transform (mismo `group`), con half-extents = dimensiones/2 en idéntico orden de ejes → el collider coincide exactamente con lo que se ve.
- Los pads cilíndricos (radio `trackWidth/2`) en cada waypoint rellenan las esquinas entre segmentos, dando continuidad de suelo.
- `capStart` de circuit-01 (`[0, 0.3, 0]`) cae sobre el primer tramo (waypoints `[0,0]→[12,0]`, suelo a `y=0` con grosor 0.1) → la chapa aterriza sobre pista y `useLaunch` puede lanzarla.

Pasos manuales sugeridos: `pnpm dev`, comprobar (1) trazado visible, (2) chapa cae sobre primer tramo, (3) lanzamiento funciona, (4) editar `trackWidth`/`waypoints` en JSON cambia el trazado al recargar.
