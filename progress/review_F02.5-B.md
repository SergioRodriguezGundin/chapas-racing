# Review — F02.5-B (auth_entry_fullscreen_skip)

**Veredicto:** APPROVED

**Revisor:** 2026-07-17  
**Base:** `progress/impl_F02.5-B.md` + diff real (`AuthEntryScreen.tsx`, `LoginForm.tsx`, `page.tsx`)  
**Prerrequisito A:** `review_F02.5-A.md` APPROVED — sin regresión en `appStage` / gating (`page.tsx` L32–35, `enterSetup` intacto)  
**Verificación propia:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅ (exit 0)

---

## Criterios de aceptación

- CA1: [x] Sin sesión → overlay fullscreen `AuthEntryScreen` (`absolute inset-0 z-10`) + `LoginForm` (no modal/dialog). `page.tsx` L32 monta solo en `appStage === "auth"`.
- CA2: [x] Botón «Saltar» vía `showSkip` + `onSkip={enterSetup}` (`AuthEntryScreen.tsx` L58–59; `LoginForm.tsx` L316–331) → `appStage 'setup'` invitado (sin tocar sesión Supabase).
- CA3: [x] Login/registro email → `onAuthSuccess={enterSetup}` (`completeAuth`); OAuth/sesión vía `onAuthStateChange` → `enterSetup` (`AuthEntryScreen.tsx` L27–32).
- CA4: [x] Sesión activa al abrir: `getUser()` → `enterSetup()` antes de mostrar form; loading «Cargando…» evita flash (`AuthEntryScreen.tsx` L18–24, L41–50).
- CA5: [x] `/login` usa defaults (`showSkip=false`, `showBackToGame=true`, sin `onAuthSuccess`) → sigue `router.push(nextPath)` (`login/page.tsx` L21; `LoginForm.tsx` L88–94). Home = flujo auth-first.
- CA6: [x] `pnpm tsc --noEmit && pnpm build` limpios (re-ejecutados en review).
- CA7: [x] Sin cambios en `package.json` / lockfile; cero deps nuevas.

---

## Scope creep

- [x] Sin prefill `display_name`/`cap_color` ni mapeo color (F02.5-C).
- [x] Sin UI logout desde setup (F02.5-C); `logoutToAuth` solo en store (F02.5-A).
- [x] F02.5-A intacto: `appStage`, `enterSetup`, gating Setup/Hud/VictoryModal.

---

## Convenciones / arquitectura

- UI en `src/ui/` (shell DOM, no R3F) — OK.
- Reutiliza `LoginForm` + cliente Supabase existente — OK.
- Tipado estricto, cero `any` — OK.
- AuthNav oculto en `auth` (`page.tsx` L30) — coherente, evita duplicar CTA.

---

## Issues

Ninguno bloqueante.

**Nota (no bloquea):** si `getUser()` rechaza la Promise, `sessionResolved` no pasa a `true` y el overlay queda en «Cargando…». Fuera de CA; opcional endurecer en follow-up.

---

## Acción para el líder

Marcar `F02.5-B` como `done` en `feature_list.json` tras este APPROVED. El revisor no marca `done`. Continuar con F02.5-C.
