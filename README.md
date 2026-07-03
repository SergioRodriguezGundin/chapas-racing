# Chapas Racing — Iteración 1

Mecánica de lanzamiento (tirachinas) de una chapa sobre plano físico.

## Stack

| Capa | Lib | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 15+ |
| UI | React | 19 |
| 3D | @react-three/fiber | 9 (pareja de React 19) |
| Helpers 3D | @react-three/drei | 10 |
| Física | @react-three/rapier | 2 (pareja de fiber 9) |
| Estado | zustand | 5 |

## Arranque

```bash
npm install
npm run dev
# http://localhost:3000
```

## Controles

- **Orbitar cámara**: drag en zona vacía (OrbitControls).
- **Lanzar**: click/touch sobre la chapa -> arrastrar hacia atrás -> soltar.
  - Longitud del arrastre = potencia (flecha + barra HUD).
  - Dirección = opuesta al arrastre (tirachinas).
  - Arrastre corto o vuelta al origen = cancela.
- Durante el apuntado la cámara se bloquea.

## Estructura

```
src/
  app/                # Next App Router (page hace dynamic ssr:false del Canvas)
  core/               # GameCanvas: Physics, luces, cámara
  features/
    cap/              # Entidad chapa: RigidBody + detección de parada
    launch/           # Mecánica lanzamiento: useLaunch + AimIndicator
    track/            # Iter 1: plano. Futuro: circuito, límites, meta
  stores/             # gameStore: máquina estados idle→aiming→moving
  config/             # Constantes físicas — único punto de tuning
  ui/                 # HUD DOM fuera del Canvas
```

## Decisiones

- **Impulso 100% horizontal**: chapa desliza, no vuela. Freno vía `linearDamping` + fricción.
- **Snapshot `lastPosition`** en cada lanzamiento: preparado para regla "fuera de pista → volver atrás" (iter 2).
- **Detección de parada**: velocidad < umbral durante N frames → `settle()`. Punto de enganche del futuro sistema de turnos.
- **Listeners de drag en `window`**, no en el mesh: el puntero abandona el mesh al instante.
- **AimIndicator imperativo** (`useFrame`): cero re-renders React durante el drag.
- **Constantes en `config/physics.ts`**: tuning centralizado.
- **`ssr: false`**: Rapier (WASM) y Canvas son client-only.
- **Next.js elegido** por escalado futuro: lobby, auth, páginas. Realtime multijugador irá vía WebSockets externos o Supabase Realtime (las rutas API serverless no mantienen WS persistentes).

## Tuning rápido

`src/config/physics.ts`:
- `maxImpulse`: fuerza a potencia máxima.
- `linearDamping` / `friction`: cuánto desliza.
- `maxDragDistance`: sensibilidad del arrastre.
