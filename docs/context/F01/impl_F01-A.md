# Impl F01-A — Núcleo multijugador

## Archivos modificados/creados

### `src/config/physics.ts` (ya presente, sin cambios adicionales)
- `MATCH` (`minPlayers: 2`, `maxPlayers: 4`)
- `CAP_START_SPACING` (`capRadius * 2.4`)
- `PLAYER_COLORS` (4 colores hex)

### `src/features/track/startPositions.ts` (NUEVO)
- Función pura `computeStartPositions(track, count)`.
- Perpendicular en XZ al primer tramo (`waypoints[0]→[1]`), centrada en `capStart`, offsets simétricos con `CAP_START_SPACING`.

### `src/stores/gameStore.ts`
- `MatchStatus = "setup" | "playing" | "finished"` sustituye `GameStatus`.
- Modelo `Player[]` con `id`, `name`, `color`, `strokes`, `lastPosition`, `startPosition`.
- `activePlayerIndex`, `winnerIndex`.
- `launch()`: incrementa `strokes` y guarda `lastPosition` del jugador activo.
- `settle()`: rota `(activePlayerIndex + 1) % N`.
- `playerFinished(index)`: `status = "finished"`, `winnerIndex`.
- `restart()`: mismos jugadores, strokes=0, posiciones a `startPosition`, `activePlayerIndex=0`.
- `newMatch()` y `startMatch()` implementados (UI en F01-B/C).
- **Arranque temporal**: 2 jugadores por defecto (`Jugador 1`/`Jugador 2`, colores paleta), `status = "playing"`.

### `src/features/cap/Cap.tsx`
- Prop `playerIndex`.
- Color y posición por jugador (`startPosition` / `lastPosition`).
- `userData = { type: "cap", playerIndex }`.
- Parada y `settle()` solo en chapa activa.
- Fuera de pista: todas las chapas a su `lastPosition`; solo la activa llama `settle()`.
- `AimIndicator` solo en jugador activo.

### `src/features/launch/useLaunch.ts`
- Segundo parámetro `playerIndex`.
- Guard: `status === "playing"` && `phase === "idle"` && `activePlayerIndex === playerIndex`.

### `src/features/track/FinishLine.tsx`
- Lee `userData.playerIndex` y llama `playerFinished(index)`.
- Guard `status !== "playing"` conservado.

### `src/core/GameCanvas.tsx`
- Mapea `players` → `<Cap key={player.id} playerIndex={i} />`.

### `src/ui/VictoryModal.tsx`
- `open` cuando `status === "finished"`.
- Texto simple con nombre del ganador (`winnerIndex`).
- Botón "Jugar de nuevo" → `restart()`. Sin ranking ni `newMatch` (F01-C).

## Decisiones / ambigüedades

1. **Dependencia circular evitada**: `startPositions.ts` devuelve `[number, number, number][]` sin importar `Vec3` del store.
2. **`startMatch` resetea `resetRequestId` a 0** (nueva partida desde setup); `restart` lo incrementa (patrón teleport existente).
3. **`newMatch` deja `players: []`** — sin caps en canvas hasta F01-B; no afecta el flujo actual porque el botón no está en UI.
4. **AimIndicator condicional** en Cap (no en useLaunch) para no renderizar flechas en chapas inactivas.

## Verificación automática

```bash
pnpm tsc --noEmit  # OK (exit 0)
pnpm build         # OK (exit 0)
```

## Checklist manual (pendiente humano)

- [ ] Al cargar: 2 chapas visibles, separadas perpendicularmente al primer tramo, colores rojo y azul.
- [ ] Solo la chapa del turno activo responde a click/drag.
- [ ] Al parar la chapa activa, el turno pasa al otro jugador.
- [ ] Lanzar una chapa contra la otra la empuja (colisión chapa-chapa).
- [ ] Chapa activa fuera de pista → reaparece en su `lastPosition` y el turno rota.
- [ ] Chapa no activa empujada al vacío → reaparece en su `lastPosition` sin rotar turno.
- [ ] Primera chapa en cruzar meta → modal "¡Meta!" con nombre del ganador.
- [ ] "Jugar de nuevo" → mismos 2 jugadores, posiciones de salida, turno en jugador 0.

## Criterios de aceptación F01-A (spec)

- [x] Store multijugador según decisiones 1–9 con auto-arranque 2 jugadores.
- [x] `Cap` con `playerIndex`, color/posición por jugador, guards de turno y fuera-de-pista.
- [x] `GameCanvas` mapea `players` → `Cap`.
- [x] `FinishLine` → `playerFinished(playerIndex)`.
- [x] `VictoryModal` con `status === "finished"` (texto ganador simple).
- [x] `tsc` + `build` verdes.
