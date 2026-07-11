# Review — BUG-01 (f01_bug_aim_misalignment_after_turn)

**Veredicto:** APPROVED

## Criterios de aceptación

- CA1 — Tras `settle()` del jugador 1, el jugador 2 puede apuntar con drag alineado a `AimIndicator` y dirección de impulso: [x] El guard `playerIndex !== activePlayerIndex` en `useLaunch.ts:70` evita que instancias inactivas sobrescriban `aim` con un `dragOrigin` stale. `onPointerDown` (`useLaunch.ts:57`) ya restringe el inicio del aim al jugador activo y setea `dragOrigin` desde el `bodyRef` correcto.
- CA2 — Tras varios turnos alternados, el apuntado sigue alineado: [x] Misma corrección estructural; el `useEffect` re-evalúa cuando cambia `activePlayerIndex` (`useLaunch.ts:117`), de modo que solo la instancia del turno actual monta listeners.
- CA3 — Solo la chapa del jugador activo registra listeners `pointermove`/`pointerup` durante `aiming`: [x] Confirmado en `useLaunch.ts:70` — early return si `phase !== "aiming"` o `playerIndex !== activePlayerIndex`. `Cap.tsx:39` pasa `playerIndex` al hook; no hay otros call sites de `useLaunch`.
- CA4 — `pnpm tsc --noEmit` y `pnpm build` limpios: [x] Ejecutados en revisión; ambos verdes.

## Convenciones y alcance

- Constantes de lanzamiento en `config/physics.ts` (`LAUNCH`) — sin magia inline en `useLaunch.ts`.
- Sin dependencias nuevas.
- Lógica por-frame en `Cap.tsx` usa `getState()` dentro de `useFrame`; selectores subscribe solo para datos de render (`color`, `isActive`).
- Alcance del fix acotado a `useLaunch.ts` + cableado necesario en `Cap.tsx` (`playerIndex`). Coherente con la causa raíz documentada en `progress/impl_bug_01.md`.

## Verificación manual

Pasos listados en `progress/impl_bug_01.md` (§ Verificación manual). No ejecutables por revisor automatizado; la corrección de código es suficiente para aprobar estructuralmente; validación humana pendiente en runtime.

## BUG-02 (impulso chapa incorrecta)

**Aplica el mismo fix.** Antes, cada `handleUp` (`useLaunch.ts:86-107`) podía ejecutarse en todas las instancias `useLaunch` durante `aiming`, aplicando `applyImpulse` al `bodyRef` de caps inactivas. Con el guard de `useLaunch.ts:70`, solo el hook del jugador activo registra `pointerup`/`pointercancel`, por lo que el impulso se aplica exclusivamente al `RigidBody` del turno actual. BUG-02 puede marcarse resuelto tras verificación manual de los pasos 6 del informe de implementación.

## Observación menor (no bloqueante)

`progress/impl_bug_01.md` indica «Cap.tsx sin cambios», pero el diff incluye el paso de `playerIndex` a `useLaunch` — cambio requerido para el guard, no scope creep.
