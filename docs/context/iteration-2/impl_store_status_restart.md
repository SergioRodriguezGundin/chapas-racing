# Impl — Feature 3: store_status_restart

Tarea: añadir estado de partida (`status`), acciones `win`/`restart`, `resetRequestId` y
mover `lastPosition` inicial a `getCurrentTrack().capStart`. Toca SOLO `src/stores/gameStore.ts`.

## Archivos tocados

- `src/stores/gameStore.ts` (único archivo modificado).

## Diff conceptual (`src/stores/gameStore.ts`)

Imports:
- Se elimina `import { CAP_START_POSITION } from "@/config/physics";` (quedaba muerto tras el cambio).
- Se añade `import { getCurrentTrack } from "@/features/track/track.types";` (grupo interno `@/`).
- `CAP_START_POSITION` NO se toca en `config/physics.ts` (su eliminación es feature 4).

Tipos:
- Nuevo `export type GameStatus = "playing" | "won";`.
- `GameState` gana `status: GameStatus` y `resetRequestId: number`, más las acciones `win` y `restart`.

Estado inicial:
- `status: "playing"`.
- `lastPosition: getCurrentTrack().capStart` (antes `CAP_START_POSITION`).
- `resetRequestId: 0`.

Acciones:
- `startAiming`: guard con forma funcional de set. Si `status !== "playing"` -> `set(() => ({}))`
  (early return sin cambiar estado); si no, transición previa `{ phase: "aiming", aim: AIM_ZERO }`.
- `win`: `set({ status: "won" })`.
- `restart`: forma funcional de set para leer `resetRequestId` previo:
  `set((s) => ({ phase: "idle", status: "playing", aim: AIM_ZERO, lastPosition: getCurrentTrack().capStart, resetRequestId: s.resetRequestId + 1 }))`.
- `updateAim`, `cancelAim`, `launch`, `settle`: SIN cambios (semántica de `phase` intacta;
  `settle` sigue poniendo `phase: "idle"`).

## Decisiones

- **Forma funcional de set en `restart`**: exigida para incrementar `resetRequestId` leyendo el
  valor previo (`s.resetRequestId + 1`). Documentado en JSDoc por qué existe el contador
  (desacopla el teleport de reset del DOM; `Cap` observará su cambio en feature 6).
- **Guard de `startAiming` con set funcional**: devolver `{}` (partial vacío) es el "no-op" idiomático
  de zustand; no fuerza re-render de suscriptores porque no cambia ninguna clave. Alternativa
  `getState()` + early return también válida, pero mantener todo dentro de `set` evita capturar
  `useGameStore` antes de su definición.
- **`getCurrentTrack().capStart`**: tipado `[number, number, number]` en `track.types.ts`, compatible
  directo con `Vec3` (misma tupla). Sin casts.
- **Import muerto**: al dejar de usar `CAP_START_POSITION` se retira su import para no dejar símbolos
  sin uso (tsc/lint limpios).

## Verificación

- `pnpm tsc --noEmit` -> **exit 0, 0 errores** (ejecutado en `c:\Projects\threejs\chapas-racing`).
- Linter (ReadLints sobre gameStore.ts) -> sin errores.
- vitest no instalado -> no se ejecutan tests. Verificación de transiciones por inspección abajo.

### Transiciones (inspección)

- Inicial: `phase="idle"`, `status="playing"`, `aim=AIM_ZERO`, `lastPosition=capStart`, `resetRequestId=0`.
- `startAiming` con `status="playing"` -> `phase="aiming"`. Con `status="won"` -> no-op (estado intacto).
- `win()` -> `status="won"` (phase/aim/lastPosition sin tocar).
- `restart()` -> `phase="idle"`, `status="playing"`, `aim=AIM_ZERO`, `lastPosition=capStart`,
  `resetRequestId` +1 respecto al previo.

## Checklist criterios de aceptación (feature 3)

- [x] Exporta `type GameStatus = "playing" | "won"`; `status` inicial `"playing"`.
- [x] `win()` pone `status = "won"`.
- [x] `restart()` restaura estado inicial completo: `phase "idle"`, `status "playing"`, aim a cero,
      `lastPosition = getCurrentTrack().capStart`.
- [x] `restart()` incrementa `resetRequestId: number` (inicial 0, expuesto en el estado).
- [x] `startAiming` no hace nada si `status !== "playing"`.
- [x] `lastPosition` inicial se lee de `getCurrentTrack().capStart` (ya no de `CAP_START_POSITION`).
- [x] Semántica de `phase` (idle -> aiming -> moving) sin cambios.
- [x] `pnpm tsc --noEmit` limpio.

## Pendiente para humano / features siguientes

- Consumo de `status`/`resetRequestId`/`win`/`restart` en `Cap.tsx`, `FinishLine.tsx` y
  `VictoryModal.tsx` (features 4-7).
- Eliminación de `CAP_START_POSITION` de `config/physics.ts` (feature 4).
- NO marcada `done` en `feature_list.json` (decide reviewer).
