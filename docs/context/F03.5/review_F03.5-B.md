# Review — F03.5-B

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] CTA «Jugar en local» → `chooseLocal` (`ModeSelectScreen.tsx` L65) → `appStage: "setup"` (`gameStore.ts` L306–309); `page.tsx` L35 monta `SetupScreen` (nº 2–4, nombres, colores).
- CA2: [x] Prefill Jugador 1 intacto: `prefillAppliedRef` + `profiles.display_name` / `cap_color` → `nearestPlayerColor` (`SetupScreen.tsx` L57–82); sin regresiones F02.5-C.
- CA3: [x] Sin sesión: `!user` → `setPrefillReady(true)` sin mutar drafts (`SetupScreen.tsx` L49–52); defaults «Jugador N».
- CA4: [x] `handleStart` llama `startMatch(configs)` sin `options.mode` (`SetupScreen.tsx` L119–126) → `matchMode: options?.mode ?? "local"` (`gameStore.ts` L291); física/turnos no tocados.
- CA5: [x] «Volver» → `enterMode` (`SetupScreen.tsx` L232–238 → store L301–304 → `"mode"`); logout → `logoutToAuth` (`SetupScreen.tsx` L128–135 → store L319–322 → `"auth"`).
- CA6: [x] `pnpm tsc --noEmit && pnpm build` exit 0 (2026-07-20).
- CA7: [x] Cero deps nuevas (`package.json` / `pnpm-lock.yaml` sin diff).

## Scope
- [x] Sin cableado OnlineLobby en hub: `chooseOnline` sigue stub (`gameStore.ts` L311–313); `page.tsx` no importa `OnlineLobby` (solo `/online`). Fuera de alcance F03.5-C OK.

## Notas
- Cambio propio F03.5-B: botón «Volver» + JSDoc `chooseLocal`. Flujo mode→setup ya existía (F03.5-A). Informe + verificación manual nivel 3 presentes.
- Sin lógica pura nueva → no se exigen tests vitest adicionales.
