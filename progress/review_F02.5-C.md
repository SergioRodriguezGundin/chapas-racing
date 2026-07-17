# Review — F02.5-C (setup_prefill_profile_logout)

**Veredicto:** APPROVED

**Revisor:** 2026-07-17  
**Base:** `progress/impl_F02.5-C.md` + diff real (`SetupScreen.tsx`, `src/lib/nearestPlayerColor.ts`)  
**Prerrequisitos:** `review_F02.5-A.md` / `review_F02.5-B.md` APPROVED — sin regresión en `appStage` / gating / AuthEntryScreen  
**Acceptance:** `feature_list.json` → `F02.5-C`  
**Verificación propia:** `pnpm tsc --noEmit && pnpm build` ✅ (exit 0)

---

## Criterios de aceptación

- CA1: [x] Sesión activa → `getUser()` + `profiles.select("display_name, cap_color")`; Jugador 1 draft con nombre (perfil o fallback metadata/email) y color mapeado (`SetupScreen.tsx` L41–81).
- CA2: [x] `nearestPlayerColor` (`src/lib/nearestPlayerColor.ts`): exacto case-insensitive o menor distancia RGB²; paleta default `PLAYER_COLORS` de `config/physics.ts`; hex inválido → `palette[0]`.
- CA3: [x] Prefill editable vía `updateDraft` (estado local); `handleStart` solo llama `startMatch`; único acceso a `profiles` es `.select` (L57–61) — cero `.update`/`.upsert`/`.insert`.
- CA4: [x] `user === null` → sin prefill (`setPrefillReady` y return L48–51); drafts default `Jugador N` + `PLAYER_COLORS`; sin botón logout (`hasSession` false).
- CA5: [x] «Cerrar sesión» → `signOut()` + `logoutToAuth()` → `appStage: "auth"` (`SetupScreen.tsx` L127–133; store L176–180). Solo visible si `hasSession` (L231–241).
- CA6: [x] `pnpm tsc --noEmit && pnpm build` limpios (re-ejecutados en review, exit 0).
- CA7: [x] Sin cambios en `package.json` / lockfile; cero deps nuevas.

---

## Scope creep

- [x] AuthEntryScreen / LoginForm no tocados en C (solo consumo de `logoutToAuth` / sesión en SetupScreen).
- [x] Sin escritura a `profiles` desde setup.
- [x] Sin deps nuevas.
- [x] F02.5-A/B intactos: `appStage`, `enterSetup`, `logoutToAuth`, gating `page.tsx` L32–35, AuthEntryScreen skip/login.

---

## Regresión A/B

- [x] `page.tsx` sigue montando Auth / Setup / Hud+Victory según `appStage`.
- [x] `enterSetup` / `newMatch` → setup; `startMatch` → match; `logoutToAuth` → auth + `MATCH_CLEAN`.
- [x] Auth-first B: skip/login/sesión activa no alterados por C.

---

## Notas (no bloquean)

1. Sin vitest en repo → helper puro sin test unitario OK (`docs/verification.md` nivel 2 solo si existe framework). Pasos manuales listados en impl (nivel 3).
2. Default DB `cap_color = #3b82f6` (fuera de paleta) queda cubierto por distancia RGB — caso CA2 real.
3. `feature_list.json` F02.5-C permanece `in_progress` (revisor no marca `done`).

---

## Cierre

Tras este APPROVED, el implementer/líder puede marcar `F02.5-C` como `done` en `feature_list.json`. El revisor no marca `done`.
