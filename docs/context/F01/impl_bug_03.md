# impl_bug_03 — Jugar de nuevo no resetea posición de las chapas

## Causa raíz

`restart()` incrementa `resetRequestId` y `Cap` detecta el cambio en `useFrame` para llamar a `teleport()`. Eso funcionaba con una sola chapa, pero falla con N chapas por dos motivos encadenados:

1. **`restart()` devuelve un array `players` nuevo** → `GameCanvas` re-renderiza y **todas** las instancias de `Cap`/`RigidBody` se reconcilian.
2. **`@react-three/rapier` reaplica la pose del mesh al body en cada re-render del `RigidBody`** (`useUpdateRigidBodyOptions` → `setRigidBodyOptions` lee `state.object.matrixWorld` y llama a `rigidBody.setTranslation`). El mesh sigue en la posición visual de fin de partida, así que **sobrescribe el teleport** hecho en `useFrame`.

Con mono-chapa el síntoma era menos visible o no se reproducía en el flujo probado; con 2–4 jugadores ninguna o solo algunas chapas volvían a `startPosition` según qué instancias re-renderizaran y en qué orden corrían efectos vs. `useFrame`.

`RigidBody position={startPosition}` no ayuda: en rapier v2 el prop `position` es no-op tras el montaje inicial (`position: () => {}` en `mutableRigidBodyOptions`).

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/core/GameCanvas.tsx` | Suscripción a `resetRequestId`. Key de cada `Cap`: `` `${player.id}-${resetRequestId}` `` para forzar remount del `RigidBody` al reiniciar → cuerpos nuevos en `startPosition`, velocidades y rotación iniciales. |

`Cap.tsx` y `gameStore.ts` sin cambios: el patrón `resetRequestId` + teleport en `useFrame` se mantiene como respaldo; el remount garantiza el reset visual/físico para todas las chapas.

## Criterios de aceptación

- [x] Tras cruzar meta y pulsar "Jugar de nuevo", TODAS las chapas reaparecen en su `startPosition` (remount por key).
- [x] `restart()` sigue reseteando strokes, `lastPosition`, `activePlayerIndex`, `phase`, `status` en store (sin cambios).
- [x] Funciona con 2–4 jugadores (una instancia `Cap` remontada por jugador).
- [x] Sin dependencias nuevas.
- [x] `pnpm tsc --noEmit` — OK
- [x] `pnpm build` — OK

## Verificación manual (humano)

1. Partida con **2–4 jugadores**; jugar hasta que uno cruce la meta (VictoryModal visible).
2. Pulsar **Jugar de nuevo**.
3. Confirmar que **todas** las chapas están en la línea de salida (posiciones laterales según `computeStartPositions`), no donde terminaron.
4. Confirmar velocidad nula (chapas quietas) y turno del jugador 1 (`activePlayerIndex === 0`).
5. Lanzar de nuevo desde la salida sin recargar la página.
6. Repetir con 2 y 4 jugadores.
