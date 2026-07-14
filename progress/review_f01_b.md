# Review — F01-B

**Veredicto:** APPROVED

## Criterios de aceptación

- CA1 — Estado inicial `status = "setup"` (auto-arranque F01-A retirado): [x]
  - `gameStore.ts` L64–65: `status: "setup"`, `players: []`. Sin `createDefaultPlayers` ni arranque automático en el repo.

- CA2 — `SetupScreen.tsx` con UI 2–4 jugadores, nombre + color `PLAYER_COLORS`: [x]
  - `SetupScreen.tsx` L75–101: selector ± acotado por `MATCH.minPlayers` / `MATCH.maxPlayers`.
  - L113–120: input nativo de nombre con trim + fallback `Jugador N` (L57–61).
  - L121–138: swatches de `PLAYER_COLORS` con `aria-pressed`.
  - L6, L144–145: `Button` shadcn; cero deps nuevas.

- CA3 — `page.tsx` integra `SetupScreen` visible solo en setup: [x]
  - `page.tsx` L30: `<SetupScreen />` montado siempre; el componente retorna `null` si `status !== "setup"` (`SetupScreen.tsx` L30).
  - `page.tsx` L29: `<Hud />` oculto durante setup.

- CA4 — `startMatch()` conectado al botón Empezar: [x]
  - `SetupScreen.tsx` L56–62 → `handleStart` → `startMatch(configs)`.
  - `gameStore.ts` L131–150: calcula `computeStartPositions`, crea `players`, `status = "playing"`, `activePlayerIndex = 0`.

- CA5 — `tsc` + `build` verdes: [x]
  - Ejecutado en revisión: `pnpm tsc --noEmit && pnpm build` → exit 0.

## Convenciones y arquitectura

- [x] UI DOM en `src/ui/SetupScreen.tsx`; lee/escribe store, sin acoplamiento a Three.
- [x] Constantes de gameplay (`MATCH`, `PLAYER_COLORS`) en `config/physics.ts`; SetupScreen las importa, sin magia inline de física.
- [x] Estado local `useState` en SetupScreen limitado a borradores de formulario (pre-commit); dominio vive en `gameStore` al pulsar Empezar — alineado con patrón formulario de la spec.
- [x] Cero `any` en archivos F01-B.
- [x] Imports `@/`, `"use client"`, export nombrado, JSDoc en export principal.

## Verificación manual (informe implementer)

Pasos documentados en `progress/impl_f01_b.md` L35–42. No bloquean aprobación (componente DOM; sin framework vitest en repo).

## Cambios requeridos

Ninguno.
