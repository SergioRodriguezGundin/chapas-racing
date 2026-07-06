# Convenciones de código

> Homogeneidad extrema. IA predice mejor cuando el repo se parece a sí mismo en todas partes.

## Estilo TypeScript

- **Versión:** TS 5.7+, `strict: true`. Cero `any`; `unknown` + narrowing si tipo desconocido.
- **Módulos:** ESM. Imports con alias `@/` (nunca relativos `../../`).
- **Orden imports:** react/next -> libs externas (three, fiber, drei, rapier, zustand) -> internos `@/`. Grupos separados por línea en blanco.
- **Strings:** comillas dobles. Template literals para interpolación.
- **Exports:** nombrados siempre. `export default` solo donde Next lo exige (`page.tsx`, `layout.tsx`).
- **Tipos:** `interface` para shapes de objetos/props; `type` para uniones, tuplas, utilidades. Discriminated unions para variantes (`SegmentType`).
- `as const` para configs/constantes de objeto.

## Nombres

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componentes React | `PascalCase.tsx` | `AimIndicator.tsx` |
| Hooks | `useCamelCase.ts` | `useLaunch.ts` |
| Stores | `camelCase` + sufijo `Store` | `gameStore.ts` |
| Tipos/interfaces | `PascalCase` | `TrackDefinition` |
| Constantes config | `UPPER_SNAKE` | `STOP_DETECTION` |
| Funciones/variables | `camelCase` | `pointToGround` |
| Archivos no-componente | `camelCase.ts` | `track.types.ts` |
| Ids runtime | `kebab-{index}` | `seg-0`, `pad-3` |

## Estructura de archivo

Componentes cliente:

```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { useGameStore } from "@/stores/gameStore";
import { LAUNCH } from "@/config/physics";

/** Una línea: propósito del componente. */
export function AimIndicator({ ... }: Props) { ... }
```

- `"use client"` primera línea en todo lo que toque Canvas/rapier/eventos.
- JSDoc de una línea sobre export principal. Decisiones no obvias -> comentario `porqué` corto.
- Props tipadas inline o `interface Props`; nunca `React.FC`.

## Patrones repo (obligatorios)

- Lógica por-frame: `useFrame(() => { store.getState() ... })`. Jamás selectores subscribe para datos por-frame.
- Selectores subscribe (`useStore(s => s.x)`) solo para datos que legítimamente re-renderizan (fase en HUD).
- Mutación Three imperativa vía refs en `useFrame` (posiciones, colores, escalas).
- Constantes numéricas -> `config/physics.ts`. Cero magia inline.
- Vectores frontera store/JSON: tuplas `[number, number, number]`. Objetos `THREE.Vector3` solo internos y reutilizados (instancia en `useRef`, no `new` por frame).

## Tests

- Framework: vitest (cuando exista en repo).
- Solo lógica pura: `useTrackGeometry` (waypoints -> transforms), stores (transiciones de fase), helpers config.
- NO testear componentes R3F/canvas/física. Verificación manual descrita en spec.
- Archivo colocado: `<módulo>.test.ts` junto a fuente.
- Nombres descriptivos: `it("resets aim when cancelAim while aiming")`.
- Store tests: reset estado en `beforeEach` (`useGameStore.setState(initial)`).

## Manejo de errores

- Validación de datos externos (JSON de pista): fn `validateTrack(def): TrackDefinition` que lanza `Error` con mensaje accionable (`"circuit-01: waypoints requiere >= 2, recibido 1"`). Falla en carga, no en runtime de física.
- Código de juego por-frame: sin throws. Estados imposibles -> early return + `console.debug` gated.
- Nunca tragar errores con catch vacío.

## Comentarios

Por defecto **no**. Solo *porqués* no obvios: workarounds documentados (`// rapier re-evalúa intersecciones tras teleport ->  reset manual del set`), invariantes sutiles, física no intuitiva. Nombres hacen el resto.