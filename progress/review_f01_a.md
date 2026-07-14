# Review — F01-A (Núcleo multijugador)

**Veredicto:** APPROVED

## Criterios de aceptación F01-A

| # | Criterio | Resultado |
|---|----------|-----------|
| CA1 | Store multijugador: `MatchStatus`, `players[]`, `activePlayerIndex`, `strokes`, `lastPosition`/`startPosition` por jugador | pass |
| CA2 | Arranque temporal 2 jugadores por defecto | pass |
| CA3 | `Cap` con `playerIndex`, color por jugador, input solo activo, reset fuera-de-pista per-player | pass |
| CA4 | `GameCanvas` mapea N `Cap` | pass |
| CA5 | `FinishLine` → `playerFinished(playerIndex)` | pass |
| CA6 | `VictoryModal` con `status === "finished"` (ranking no requerido) | pass |
| CA7 | `computeStartPositions` pura en `startPositions.ts` | pass |
| CA8 | Constantes `MATCH`, `CAP_START_SPACING`, `PLAYER_COLORS` en `physics.ts` | pass |
| CA9 | `restart()` y `newMatch()` en store | pass |
| CA10 | `pnpm tsc --noEmit && pnpm build` verdes | pass |

## Checklist spec F01-A (sección spec)

- [x] Store multijugador según decisiones 1–9 con auto-arranque 2 jugadores (`gameStore.ts`)
- [x] `Cap` acepta `playerIndex`; color/posición por jugador; guards de turno; `userData = { type: 'cap', playerIndex }` (`Cap.tsx`)
- [x] Reset fuera-de-pista a `lastPosition` propia; solo activa llama `settle()` (`Cap.tsx:59-63`)
- [x] `GameCanvas` mapea `players` → `<Cap playerIndex={i} key={player.id} />` (`GameCanvas.tsx:39-41`)
- [x] `FinishLine` identifica jugador vía `userData.playerIndex` → `playerFinished(index)` (`FinishLine.tsx:20-26`)
- [x] `VictoryModal` abre con `status === "finished"`; texto ganador simple; botón `restart()` (`VictoryModal.tsx`)
- [x] `useLaunch` guard: `status === "playing"` && `phase === "idle"` && `activePlayerIndex === playerIndex` (`useLaunch.ts:54-56`)
- [x] `settle()` rota `(activePlayerIndex + 1) % N` (`gameStore.ts:115-123`)
- [x] `launch()` incrementa `strokes` y guarda `lastPosition` del activo (`gameStore.ts:101-114`)
- [x] Sin dependencias nuevas
- [x] Archivos dentro del scope F01-A (sin pantalla setup ni ranking HUD — reservados F01-B/C)

## Arquitectura y convenciones

- [x] Capas respetadas: constantes en `config/`, dominio en `stores/`, mecánicas en `features/`, composición en `core/`, UI DOM en `ui/`
- [x] Lógica por-frame en `useFrame` + `getState()` (`Cap.tsx`, `useLaunch.ts` impulso en handler)
- [x] Cero `any` en archivos tocados
- [x] Imports con alias `@/`
- [x] Sensores/colliders dentro de `<Physics>` (`GameCanvas.tsx`)
- [x] Pasos de verificación manual documentados en `progress/impl_f01_a.md` (Nivel 3; ejecución humana pendiente, no bloqueante para código)

## Issues encontrados

| Severidad | Archivo | Descripción |
|-----------|---------|-------------|
| minor | `Cap.tsx:19` | Offset Y `+0.2` en `teleport` sigue inline (preexistente); convención pide constante en `physics.ts` |
| minor | `Cap.tsx:40` | Fallback `"#e63946"` duplica `PLAYER_COLORS[0]` |
| minor | `FinishLine.tsx:10` | `FINISH_COLOR` hardcodeado (preexistente) |
| minor | `FinishLine.tsx:22-25` | `userData` sin union tipada ni type guard (funciona en runtime; mejora futura de tipado estricto) |
| minor | `progress/impl_f01_a.md` | Checklist manual marcado pendiente — reviewer no ejecutó navegador en esta sesión |

Ningún issue blocker o major.

## Resultado verificación automática

```bash
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0 — Next.js 15.5.20, compiled successfully, types OK
```

Ejecutado por reviewer en sesión actual.

## Notas

- `startMatch()` incluido en store (preparación F01-B); coherente con decisión 9 de la spec y no rompe F01-A.
- `newMatch()` deja `players: []` sin UI expuesta — aceptable; sin caps en canvas hasta F01-B.
- Vitest no presente en `package.json`; no se exige test de `computeStartPositions` en este repo.
