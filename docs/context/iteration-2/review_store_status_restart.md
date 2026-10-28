# Review — Feature 3: store_status_restart

**Veredicto:** APPROVED

Ámbito: solo `src/stores/gameStore.ts` (confirmado por `git status`/`git diff`). Sin cambios en otros `src/` ni en `package.json`.

## Checklist de aceptación

- **CA1 — Exporta `type GameStatus = 'playing' | 'won'` y estado con `status` inicial `'playing'`:** [x]
  - `export type GameStatus = "playing" | "won";` en `gameStore.ts:13`.
  - `status: "playing"` en estado inicial `gameStore.ts:53`; campo en interfaz `gameStore.ts:28`.
- **CA2 — `win()` pone `status = 'won'`:** [x]
  - `win: () => set({ status: "won" })` en `gameStore.ts:64`.
- **CA3 — `restart()` restaura estado inicial completo (phase `idle`, status `playing`, aim a cero, `lastPosition = getCurrentTrack().capStart`):** [x]
  - `gameStore.ts:65-72`: `phase: "idle"`, `status: "playing"`, `aim: AIM_ZERO`, `lastPosition: getCurrentTrack().capStart`.
- **CA4 — `restart()` incrementa `resetRequestId: number` (inicial 0, expuesto) con lectura del valor previo (set funcional):** [x]
  - Campo declarado `resetRequestId: number` en interfaz `gameStore.ts:36`; inicial `resetRequestId: 0` en `gameStore.ts:56`.
  - Incremento funcional real: `set((s) => ({ ..., resetRequestId: s.resetRequestId + 1 }))` en `gameStore.ts:66-71`. NO fija constante.
- **CA5 — `startAiming` no hace nada si `status !== 'playing'` (early return sin mutar estado):** [x]
  - `startAiming: () => set((s) => (s.status !== "playing" ? {} : { phase: "aiming", aim: AIM_ZERO }))` en `gameStore.ts:58-59`. Devolver `{}` (partial vacío) es el no-op idiomático de zustand: no cambia ninguna clave, no dispara re-render.
- **CA6 — `lastPosition` inicial desde `getCurrentTrack().capStart`, ya no de `CAP_START_POSITION`:** [x]
  - `lastPosition: getCurrentTrack().capStart` en `gameStore.ts:55`. `capStart` es tupla `[number, number, number]` en `track.types.ts:9`, compatible con `Vec3` sin casts.
- **CA7 — Semántica de phase (idle -> aiming -> moving) intacta (`launch`, `updateAim`, `cancelAim`, `settle` sin cambios de comportamiento):** [x]
  - `updateAim` (`:60`), `cancelAim` (`:61`), `launch` (`:62`), `settle` (`:63`) idénticos al diff previo. `settle` sigue en `phase: "idle"`.
- **CA8 — `pnpm tsc --noEmit` limpio:** [x] (ver salida abajo).

## Salida de `pnpm tsc --noEmit`

```
EXIT: 0
```
0 errores.

## Verificación de convenciones y regresión

- **Alias `@/`:** [x] `import { getCurrentTrack } from "@/features/track/track.types";` (`gameStore.ts:3`).
- **Orden de imports:** [x] zustand (externo) -> línea en blanco -> interno `@/` (`gameStore.ts:1-3`).
- **Exports nombrados:** [x] `GameStatus`, `useGameStore` nombrados; sin `export default`.
- **Cero `any`:** [x] ninguno introducido.
- **Tuplas en frontera:** [x] `Vec3` / `capStart` como `[number, number, number]`.
- **Comentarios solo con "porqué":** [x] JSDoc de una línea en `GameStatus`, `resetRequestId`, `win`, `restart`; sin ruido.
- **Import muerto:** [x] `CAP_START_POSITION` retirado de `gameStore.ts` (ya no se usa); confirmado por diff.
- **Cero deps nuevas:** [x] `package.json` sin cambios (`git status`/`git diff` limpios).
- **Regresión `CAP_START_POSITION` intacta en config:** [x] sigue en `config/physics.ts:38`; su uso en `Cap.tsx:9,45` permanece (su eliminación es feature 4, fuera de scope aquí).
- **Scope:** [x] único archivo `src/` tocado: `gameStore.ts`.

## Notas

- No se marca `done` en `feature_list.json`; queda a criterio del líder tras cerrar el ciclo.
- vitest no está instalado en el repo; verificación de transiciones por inspección del diff (aceptable por convenciones: tests solo cuando el framework existe).
