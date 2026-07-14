# Review — F01-C (HUD de turno + modal con ranking)

**Veredicto:** APPROVED

## Criterios de aceptación F01-C

- CA1 — HUD: jugador activo (nombre + color): [x]
  - `Hud.tsx` L63–71: badge "Turno de {nombre}" con swatch `backgroundColor: activePlayer.color`.

- CA2 — HUD: orden de turnos: [x]
  - `Hud.tsx` L24–29, L36–58: lista rotada desde `activePlayerIndex` (activo primero, resaltado `bg-muted`).

- CA3 — HUD: contador de tiros por jugador: [x]
  - `Hud.tsx` L53–55: `{player.strokes} tiro(s)` por fila del orden.

- CA4 — HUD: barra potencia/fase existente conservada: [x]
  - `Hud.tsx` L9–13, L73–75: `PHASE_LABEL[phase]` en badge inferior.
  - `Hud.tsx` L76–88: barra `Progress` solo en `phase === "aiming"` (sin regresión).

- CA5 — VictoryModal: ranking decisión 7 (ganador 1º, strokes asc, desempate índice): [x]
  - `VictoryModal.tsx` L17–25: `computeRankingOrder` — `[winnerIndex, ...others]` con `sort` por `strokes` y desempate `a - b`.

- CA6 — VictoryModal: tiros visibles por jugador: [x]
  - `VictoryModal.tsx` L94–96: contador de tiros en cada fila del `<ol>`.

- CA7 — VictoryModal: "Jugar de nuevo" (`restart`) y "Nueva partida" (`newMatch`): [x]
  - `VictoryModal.tsx` L103–113: botones conectados a `restart` y `newMatch` del store.

- CA8 — `tsc` + `build` verdes: [x]
  - Ejecutado en revisión: `pnpm tsc --noEmit && pnpm build` → exit 0.

## Criterios de aceptación F01 completos (A + B + C)

- F01-1 — Config partida: 2–4 jugadores, nombre + color por jugador (F01-B): [x]
  - `SetupScreen.tsx` L75–101, L113–138; `gameStore.ts` L131–150 `startMatch`.

- F01-2 — Solo la chapa del turno activo responde a input (F01-A): [x]
  - `useLaunch.ts` L54–56: guards `status === "playing"`, `phase === "idle"`, `activePlayerIndex === playerIndex`.

- F01-3 — `settle()` de chapa activa → turno rota automáticamente (F01-A): [x]
  - `Cap.tsx` L67–76 → `settle()`; `gameStore.ts` L89–98: `(activePlayerIndex + 1) % n`.

- F01-4 — HUD indica jugador activo y orden de turnos (F01-C): [x]
  - Ver CA1–CA3.

- F01-5 — Fuera de pista resetea la chapa del jugador activo a SU `lastPosition` (F01-A): [x]
  - `Cap.tsx` L59–63: teleport a `player.lastPosition`; activa además `settle()`.

- F01-6 — Primera chapa en cruzar meta gana → modal con ranking por tiradas (F01-A + F01-C): [x]
  - `FinishLine.tsx` L20–26 → `playerFinished(playerIndex)`; `VictoryModal.tsx` ranking completo.

- F01-7 — Colisión chapa-chapa funciona (F01-A): [x]
  - `GameCanvas.tsx` L39–41: N `Cap` con `RigidBody` dinámico + `CylinderCollider` dentro de `<Physics>`.

## Arquitectura y convenciones

- [x] Scope F01-C acotado a `src/ui/Hud.tsx` y `src/ui/VictoryModal.tsx` (sin cambios store/física en esta sub-tarea).
- [x] UI DOM lee solo `useGameStore`; cero acoplamiento a Three/Rapier.
- [x] Selectores zustand para datos que legitiman re-render (fase, jugadores, potencia) — alineado con `docs/conventions.md`.
- [x] Cero `any` en archivos F01-C.
- [x] Imports `@/`, `"use client"`, exports nombrados, JSDoc en exports principales.
- [x] Cero dependencias nuevas.
- [x] Pasos de verificación manual documentados en `progress/impl_f01_c.md` L32–40 (Nivel 3; no bloqueante — sin vitest en repo).

## Issues encontrados

| Severidad | Archivo | Descripción |
|-----------|---------|-------------|
| minor | `VictoryModal.tsx` L17–25 | `computeRankingOrder` es lógica pura sin test; vitest ausente en `package.json` — aceptable según precedente F01-A. |
| minor | `progress/impl_f01_c.md` | Checklist manual pendiente de ejecución humana en navegador. |

Ningún issue blocker o major.

## Resultado verificación automática

```bash
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0 — Next.js 15.5.20, compiled successfully, types OK
```

Ejecutado por reviewer en sesión actual.

## Cambios requeridos

Ninguno.
