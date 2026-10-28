# Impl F01-C — HUD de turno + modal con ranking

## Archivos modificados

### `src/ui/Hud.tsx`
- Panel superior izquierdo: **orden de turnos** rotado desde el jugador activo (activo primero, resaltado con `bg-muted`).
- Cada fila: swatch de color, nombre, contador de tiros (`N tiro(s)`).
- Panel inferior (conservado): badge **"Turno de {nombre}"** con color del activo, instrucción de fase y barra de potencia en `aiming`.
- Selectores zustand: `players`, `activePlayerIndex`, `phase`, `aim.power`.

### `src/ui/VictoryModal.tsx`
- Función pura `computeRankingOrder`: 1º `winnerIndex`, resto por `strokes` ascendente, desempate por índice original.
- Lista ordenada (`<ol>`) con posición, color, nombre, etiqueta "Ganador" y tiros.
- Botón **"Jugar de nuevo"** → `restart()`.
- Botón **"Nueva partida"** → `newMatch()` (variant outline).
- `useMemo` para ranking derivado de `players` + `winnerIndex`.

## Decisiones

1. **Orden de turnos rotado**: el activo aparece primero en la lista para leer el ciclo de un vistazo; el badge inferior refuerza quién juega ahora.
2. **Ranking en módulo del modal**: lógica local `computeRankingOrder` (sin archivo nuevo; spec acotaba a `Hud.tsx` + `VictoryModal.tsx`).
3. **HUD visible en `finished`**: `page.tsx` solo oculta en `setup`; durante el modal el HUD queda detrás — sin cambio de wiring.
4. **Estilo**: tokens preset (`border-border`, `bg-popover`, `text-muted-foreground`) alineados con `SetupScreen` y modal previo.

## Verificación automática

```bash
pnpm tsc --noEmit  # OK (exit 0)
pnpm build         # OK (exit 0)
```

## Checklist manual (pendiente humano)

- [ ] Partida 3 jugadores: HUD muestra orden rotado al cambiar turno; badge "Turno de …" coincide con chapa lanzable.
- [ ] Contador de tiros incrementa por jugador tras cada lanzamiento.
- [ ] Barra de potencia solo en fase `aiming` (sin regresión).
- [ ] Cruzar meta: modal con ranking — 1º ganador, resto por menos tiros; desempate estable por orden de jugador.
- [ ] Cada fila del ranking muestra tiros.
- [ ] "Jugar de nuevo" → mismos jugadores, strokes 0, turno jugador 0.
- [ ] "Nueva partida" → vuelve a setup.

## Criterios de aceptación F01-C (spec)

- [x] HUD: jugador activo (nombre + color).
- [x] HUD: orden de turnos.
- [x] HUD: contador de tiros por jugador.
- [x] HUD: barra potencia/fase existente conservada.
- [x] VictoryModal: ranking decisión 7 (ganador 1º, strokes asc, desempate índice).
- [x] VictoryModal: tiros visibles por jugador.
- [x] VictoryModal: "Jugar de nuevo" (`restart`) y "Nueva partida" (`newMatch`).
- [x] `tsc` + `build` verdes.
