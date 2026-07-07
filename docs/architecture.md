# Arquitectura — Qué significa "hacer un buen trabajo"

> Estándar de calidad. Reviewer evalúa código contra este archivo.
> Si no está aquí, no es requisito.

## Capas

Cinco capas, solo cinco:

- `src/config/` — constantes de física/gameplay. Cero lógica.
- `src/stores/` — estado de dominio (zustand). `gameStore` (partida/turno), `trackStore` (presencia en pista). Cero Three.js, cero React.
- `src/features/<dominio>/` — entidades y mecánicas: `cap/`, `launch/`, `track/`. Componentes R3F + hooks. Un dominio no importa internals de otro: comunica vía stores.
- `src/core/` — composición de escena (`GameCanvas`): Physics, luces, cámara. No contiene lógica de juego.
- `src/ui/` — HUD/modales DOM fuera del Canvas. Lee stores, nunca refs de Three.

`src/app/` = infraestructura Next (routing, layout). No es capa de juego.

No introducir capas nuevas (services, repositories, ECS) sin razón concreta documentada en `feature_list.md`.

## Principios

1. **Constantes centralizadas.** Todo número de tuning (impulsos, damping, umbrales, grace frames) vive en `config/physics.ts`. Número mágico inline = rechazo.

2. **Sin dependencias nuevas.** Stack cerrado: next, react, three, fiber, drei, rapier, zustand. Feature requiere lib nueva -> estado `blocked`, se discute.

3. **Física imperativa, render declarativo.** Lógica por-frame (velocidades, teleports, detección parada) -> `useFrame` + `store.getState()`. PROHIBIDO estado React que re-renderice por frame o por drag. Feedback visual continuo (flecha aim) -> mutación imperativa de refs.

4. **Stores = fuente de verdad de dominio.** Fase de turno, aim, presencia en pista, victoria: solo en stores. Componentes no guardan estado de dominio en `useState`. Eventos alta frecuencia NO pasan por store (van por refs); eventos discretos (enter/exit pieza, settle, win) sí.

5. **Pista data-driven.** Geometría de circuito derivada 100% de JSON (`TrackDefinition`). Código genera, nunca hardcodea trazados. Schema versionado, extensiones retrocompatibles.

6. **Tipado estricto.** Cero `any`. `userData`, schemas JSON, tipos de tramo -> discriminated unions + type guards.

7. **Client boundary explícito.** Canvas + Rapier (WASM) = client-only. Entrada vía `dynamic(..., { ssr: false })` en `app/`. Nada de Three/rapier importado en server components.

## Flujo de datos

```
input usuario ─→ features/launch (useLaunch: raycast, drag)
                    │ updateAim / launch
                    ▼
                 stores (gameStore, trackStore)
                    │ getState() en useFrame        │ subscribe
                    ▼                               ▼
                 features/cap, track (física)     ui/ (HUD, modales)
                    │ applyImpulse / sensores
                    ▼
                 rapier ─→ render fiber
```

## Qué NO hacer

- No `setState` React en `useFrame` ni en `pointermove` de drag.
- No listeners de drag en meshes: puntero abandona mesh -> drag muere. Window listeners + raycast a plano.
- No lógica de juego en `core/` ni en `app/`.
- No acoplar `ui/` a Three: modales/HUD solo hablan con stores (patrón `resetRequestId` para efectos DOM -> Canvas).
- No colliders físicos en visuales de carretera: suelo físico = plano base; carretera = visual + sensores.
- No sensores/rigid bodies fuera de `<Physics>`.
- No `console.log` residual: `console.debug` gated o nada.