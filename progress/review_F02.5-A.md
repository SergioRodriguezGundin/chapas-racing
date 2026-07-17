# Review — F02.5-A (app_stage_state_machine)

**Veredicto:** APPROVED

**Revisor:** 2026-07-17  
**Base:** `progress/impl_F02.5-A.md` + diff real (`gameStore.ts`, `page.tsx`, `SetupScreen.tsx`)  
**Verificación propia:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅ (exit 0)

---

## Criterios de aceptación

- CA1: [x] Tipo `AppStage = "auth" | "setup" | "match"` y `appStage: "auth"` inicial (`gameStore.ts` L19, L88–89).
- CA2: [x] `enterSetup` → setup; `startMatch` → `appStage: "match"` + `status: "playing"`; `logoutToAuth` → auth + `MATCH_CLEAN` (`status: "setup"`, sin `playing`/`finished` huérfanos) (`gameStore.ts` L149–180).
- CA3: [x] `page.tsx` L32–34: SetupScreen solo en `"setup"`; Hud/VictoryModal solo en `"match"`; en `"auth"` no hay setup.
- CA4: [x] `newMatch()` → `appStage: "setup"` + `MATCH_CLEAN` (`gameStore.ts` L144–148).
- CA5: [x] Guards F01 por `status !== "playing"` en `startAiming`/`launch`/`settle`/`playerFinished` intactos; `phase`/`MatchStatus` independientes de `AppStage`.
- CA6: [x] `pnpm tsc --noEmit && pnpm build` limpios (re-ejecutados en review).
- CA7: [x] Sin cambios en `package.json` / lockfile; cero deps nuevas.

---

## Scope creep

- [x] Sin UI login fullscreen / Saltar / sesión (F02.5-B).
- [x] Sin prefill / logout UI / mapeo color (F02.5-C).
- [x] Sin tocar física/Canvas; solo store + shell + quit early-return de SetupScreen.

---

## Convenciones / arquitectura

- Estado de dominio en `stores/gameStore.ts` (no store nuevo innecesario) — OK.
- Tipado estricto, cero `any` — OK.
- Gating UI en shell (`page.tsx`); SetupScreen deja de auto-ocultarse por `status` — correcto (montaje lo decide el stage).
- Naming: spec description menciona `enterAuth`/`enterMatch`; implementación usa `logoutToAuth` + `startMatch` → match, alineado con acceptance de `feature_list.json` — OK.

---

## Issues

Ninguno bloqueante.

**Nota (no bloquea):** con `appStage === "auth"` no hay UI para llamar `enterSetup` hasta F02.5-B; documentado en impl y coherente con el scope de esta subtarea.

---

## Acción para el líder

Marcar `F02.5-A` como `done` en `feature_list.json` tras este APPROVED. El revisor no marca `done`.
