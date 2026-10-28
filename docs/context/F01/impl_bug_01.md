# impl_bug_01 — Apuntado desalineado tras el primer turno

## Causa raíz

`useLaunch` se instancia en cada `Cap` (una por jugador). El `useEffect` que registra `pointermove`/`pointerup`/`pointercancel` en `window` se activaba cuando `phase === "aiming"` en **todas** las instancias, sin filtrar por jugador activo.

Cada instancia mantiene su propio `dragOrigin` ref y `bodyRef`:

- `handleMove` de caps inactivas sobrescribía `aim` en el store usando un `dragOrigin` stale (posición de inicio de partida, no la del cap activo).
- `handleUp` de caps inactivas podía aplicar impulso al body equivocado (BUG-02 relacionado).

Tras el primer turno (`activePlayerIndex` pasa a 1), el listener del cap 0 seguía activo y competía con el del cap 1.

## Cambios

| Archivo | Cambio |
|---------|--------|
| `src/features/launch/useLaunch.ts` | Suscripción a `activePlayerIndex`; guard `playerIndex !== activePlayerIndex` en el `useEffect` de listeners window. Solo el hook del jugador activo registra listeners durante `phase === "aiming"`. |

`Cap.tsx` sin cambios — `onPointerDown` ya filtraba por `activePlayerIndex`; el bug estaba solo en los listeners window.

## Criterios de aceptación

- [x] Solo el hook `useLaunch` del jugador activo registra listeners window durante `phase === "aiming"`.
- [x] `dragOrigin` se setea solo en el cap que inicia el aim (`onPointerDown` ya lo hacía).
- [x] Sin dependencias nuevas.
- [x] `pnpm tsc --noEmit` — OK
- [x] `pnpm build` — OK

## Verificación manual (humano)

1. Iniciar partida 2 jugadores.
2. Jugador 1: click/drag en su chapa → indicador alineado con cursor; lanzar.
3. Esperar a que pare (turno pasa a jugador 2).
4. Jugador 2: click/drag → **el vector de apuntado debe seguir el cursor desde la posición de la chapa activa**, no desplazado ni invertido.
5. Repetir varios turnos alternando jugadores.
6. Confirmar que el impulso se aplica a la chapa del jugador activo (cubre también BUG-02).
