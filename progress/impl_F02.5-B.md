# Informe: F02.5-B — Pantalla auth fullscreen + Saltar + sesión activa

**Estado:** implementación completa — pendiente review  
**Fecha:** 2026-07-17  
**Verificación:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅ · cero deps nuevas

---

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/ui/AuthEntryScreen.tsx` | **Nuevo.** Overlay fullscreen si `appStage === 'auth'`: resuelve sesión → `enterSetup` o muestra `LoginForm` + Saltar |
| `src/ui/LoginForm.tsx` | Props opcionales `onAuthSuccess`, `showSkip`/`onSkip`, `showBackToGame`; `completeAuth()` sin romper `/login` |
| `src/app/page.tsx` | Monta `AuthEntryScreen` en auth; oculta `AuthNav` durante auth (evita link duplicado) |
| `progress/current.md` | Plan de sesión F02.5-B |
| `feature_list.json` | Ya estaba `in_progress` (sin marcar `done`) |

---

## Decisiones

1. **`AuthEntryScreen` como shell** (no modal): `absolute inset-0 z-10` + fondo `bg-background/90` + blur; Canvas puede quedar detrás (mismo patrón que SetupScreen).
2. **Sesión al abrir:** `getUser()`; si hay user → `enterSetup()` sin mostrar formulario. Mientras resuelve → «Cargando…» (evita flash auth→setup).
3. **`onAuthStateChange`:** si aparece sesión (OAuth callback a `/`, sign-in en otra pestaña) → `enterSetup()`. Email/password también llama `onAuthSuccess` → `enterSetup()` (sin `router.push` en home).
4. **OAuth:** `nextPath="/"`; tras callback el home remonta auth, `getUser`/`onAuthStateChange` entra a setup.
5. **«Saltar»:** `enterSetup()` con `session === null` (invitado). Botón ghost bajo el formulario.
6. **`/login` intacto:** props nuevas opcionales con defaults; sigue `router.push(nextPath)`.
7. **AuthNav oculto en auth:** evita «Iniciar sesión» encima del fullscreen; vuelve en setup/match.
8. **Fuera de scope:** prefill perfil, logout desde setup (F02.5-C).

---

## Criterios de aceptación

| ID | Criterio | ¿Cubierto? |
|---|---|---|
| CA1 | Sin sesión → login/registro fullscreen (no modal) | ✅ `AuthEntryScreen` |
| CA2 | «Saltar» → `appStage 'setup'` invitado | ✅ `onSkip={enterSetup}` |
| CA3 | Login/registro OK → `appStage 'setup'` | ✅ `onAuthSuccess={enterSetup}` + OAuth vía sesión |
| CA4 | Sesión activa al abrir → salta auth a setup | ✅ `getUser` → `enterSetup` |
| CA5 | `/login` no rompe; `/` es flujo principal | ✅ props opcionales; home auth-first |
| CA6 | `tsc` + `build` limpios | ✅ 2026-07-17 |
| CA7 | Cero deps nuevas | ✅ |

---

## Verificación manual pendiente (humano)

1. Abrir `/` sin cookies → fullscreen login + «Saltar»; Canvas detrás OK.
2. Pulsar «Saltar» → SetupScreen; sin sesión (AuthNav «Iniciar sesión»).
3. Login email/password en home → SetupScreen sin navegar a otra ruta.
4. Con sesión F02 ya activa → al abrir `/` no se ve auth; va a setup.
5. OAuth Google desde home → callback a `/` → setup.
6. `/login?next=/profile` sigue redirigiendo tras login como antes.
7. Tras setup → partida → «Nueva partida» sigue en setup (no auth).

---

## Fuera de scope (no tocado)

- F02.5-C: prefill `display_name`/`cap_color`, logout UI desde setup
- Cambios a callback OAuth / AuthNav más allá de ocultarlo en auth
