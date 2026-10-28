# Impl F01-B — Pantalla de configuración de partida

## Archivos modificados/creados

### `src/ui/SetupScreen.tsx` (NUEVO)
- Overlay centrado visible solo si `status === "setup"`.
- Selector 2–4 jugadores (`MATCH.minPlayers` / `MATCH.maxPlayers`) con botones ±.
- Por jugador: input nativo de nombre (max 24 chars) + swatches de `PLAYER_COLORS`.
- Botón "Empezar" → `startMatch(configs)` con nombres trimmeados (fallback `Jugador N`).
- Estilo alineado con `VictoryModal`: `border-border`, `bg-popover`, `font-heading`, Button shadcn.

### `src/app/page.tsx`
- Import e integración de `<SetupScreen />`.
- `<Hud />` oculto durante setup (`status !== "setup"`) para no mostrar instrucciones de lanzamiento sin partida.

### `src/stores/gameStore.ts`
- Retirado `createDefaultPlayers()` y arranque temporal F01-A.
- Estado inicial: `status = "setup"`, `players = []`.
- `startMatch()` sin cambios (ya calculaba `computeStartPositions`, `activePlayerIndex = 0`, `status = "playing"`).

## Decisiones

1. **Estado local en SetupScreen** para borradores de nombre/color; el store solo recibe la config al pulsar Empezar.
2. **Colores repetibles** entre jugadores: la spec no exige unicidad; cada jugador elige libremente de la paleta.
3. **Hud condicional en page.tsx** (no en Hud.tsx) para mantener el componente HUD enfocado en partida activa.
4. **Sin cambios en `config/physics.ts`**: `MATCH` y `PLAYER_COLORS` ya existían desde F01-A.

## Verificación automática

```bash
pnpm tsc --noEmit  # OK (exit 0)
pnpm build         # OK (exit 0)
```

## Checklist manual (pendiente humano)

- [ ] Al cargar: pantalla de setup visible, pista de fondo sin chapas, sin HUD inferior.
- [ ] Selector ±: mínimo 2, máximo 4 jugadores; filas de config se añaden/quitan.
- [ ] Editar nombre y color por jugador; colores de paleta se marcan al seleccionar.
- [ ] "Empezar" con 2 jugadores → chapas en parrilla de salida, turno jugador 0, HUD visible.
- [ ] "Empezar" con 3–4 jugadores → N chapas separadas, juego jugable.
- [ ] Nombre vacío al empezar → fallback "Jugador N".

## Criterios de aceptación F01-B (spec)

- [x] Estado inicial `status = "setup"` (sin auto-arranque F01-A).
- [x] UI setup visible solo si `status === "setup"`.
- [x] Elegir 2–4 jugadores con nombre editable + color de `PLAYER_COLORS`.
- [x] "Empezar" → `startMatch(configs)` con startPositions, `playing`, `activePlayerIndex = 0`.
- [x] Button shadcn + inputs nativos Tailwind; cero deps nuevas.
- [x] `tsc` + `build` verdes.
