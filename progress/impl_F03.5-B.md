# impl_F03.5-B — Rama local: setup jugadores

**Fecha:** 2026-07-20  
**Estado:** awaiting review  
**Verificación:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅  
**Deps nuevas:** ninguna

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/ui/SetupScreen.tsx` | Botón «Volver» → `enterMode` (mode, no auth). Logout intacto → `logoutToAuth`. Prefill one-shot sin cambios. |
| `src/stores/gameStore.ts` | JSDoc `chooseLocal` actualizado (ya no dice “F03.5-B cableará…”). |
| `progress/current.md` | Plan implementer F03.5-B. |
| `progress/impl_F03.5-B.md` | Este informe. |

**No tocados (ya correctos desde F03.5-A / F02.5-C):**

- `ModeSelectScreen` CTA «Jugar en local» → `chooseLocal` → `setup`
- `page.tsx` monta `SetupScreen` en `appStage === "setup"`
- Prefill Jugador 1 (`prefillAppliedRef`, profiles, `nearestPlayerColor`)
- `startMatch` sin `options.mode` → `matchMode: "local"` (hot-seat)

## Decisiones

1. **«Volver» = `enterMode`:** limpia match (`MATCH_CLEAN`) y pone `appStage: "mode"`. Distinto de logout (`logoutToAuth` → `"auth"`).
2. **UI:** botón `outline` entre «Empezar» y «Cerrar sesión»; siempre visible (sesión o invitado). Logout sigue `ghost` solo si `hasSession`.
3. **Prefill:** cero cambios al efecto one-shot / `prefillAppliedRef` — solo se añade navegación atrás.
4. **Sin lógica pura nueva:** no hay test vitest adicional (solo UI + comentario store).

## Criterios de aceptación

- [x] CTA «Jugar en local» → SetupScreen (nº jugadores, nombres, colores) — `chooseLocal` + montaje page
- [x] Con sesión: Jugador 1 pre-rellenado (display_name + cap_color → PLAYER_COLORS) — F02.5-C intacto
- [x] Sin sesión (Saltar): setup usable sin prefill — intacto
- [x] Iniciar partida local → match hot-seat; física/turnos F01 sin cambios — `startMatch` sin `mode: "online"`
- [x] Navegación atrás desde setup → mode (no auth); logout → auth — botón «Volver» + logout existente
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios
- [x] Cero dependencias nuevas

## Verificación manual (humano)

1. Auth o Saltar → ModeSelect → «Jugar en local» → SetupScreen.
2. Con sesión: Jugador 1 prefilled; editar nombre/color; «Empezar» → partida hot-seat (turnos F01).
3. Sin sesión: drafts default «Jugador N»; setup usable; «Empezar» OK.
4. En setup, «Volver» → ModeSelect (no AuthEntry).
5. En setup con sesión, «Cerrar sesión» → AuthEntry.
6. Desde mode otra vez «Jugar en local» → setup fresco (prefill one-shot al remount).

## Fuera de alcance

- F03.5-C (online lobby)
- Marcar `done` en `feature_list` (reviewer)
