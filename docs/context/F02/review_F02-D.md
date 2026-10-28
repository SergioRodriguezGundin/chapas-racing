# Review — F02-D

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] Ruta `/profile` protegida (middleware `PROTECTED_PREFIXES` + `(protected)/layout.tsx`); archivo en `src/app/(protected)/profile/page.tsx` (route group F02-E, equivalente funcional a `src/app/profile/page.tsx`)
- CA2: [x] `ProfileForm.tsx`: `display_name` 1–32 (validación cliente + `minLength`/`maxLength`), `cap_color` picker hex + presets `PLAYER_COLORS`, avatar opcional con preview
- CA3: [x] Upload a `avatars/{userId}/avatar.{ext}` con `upsert: true`; actualiza `profiles.avatar_url` con cache-buster
- CA4: [x] `supabase.from("profiles").update()` + `.select("updated_at")`; UI muestra `updated_at` tras guardar; trigger `profiles_updated_at` en migración F02-C
- CA5: [x] Coherente con `LoginForm`/`SetupScreen`: `inputClassName`, `Button` shadcn, tokens `bg-popover`, `border-border`, `text-muted-foreground`
- CA6: [x] `handleLogout`: `signOut()` → `router.push("/")` + `refresh()`
- CA7: [x] Sin cambios en infra PKCE/cookies (F02-A); `AuthNav` usa `getUser` + `onAuthStateChange` sin romper persistencia
- CA8: [x] `pnpm tsc --noEmit && pnpm build` verdes (ejecutado en review)

## Verificación build
- `pnpm tsc --noEmit`: OK
- `pnpm build`: OK — ruta `ƒ /profile` generada (3.96 kB)

## Notas (no bloqueantes)
- Enlace a perfil con sesión vía `AuthNav` en home (`src/app/page.tsx`); `LoginForm` no incluye enlace (usuarios logueados redirigidos de `/login` por middleware F02-E).
- `AuthNav` usa `pointer-events-auto` en overlay; hot-seat `/` sin imports Supabase en lógica de juego.
- Edge case documentado: perfil ausente en DB → primer `update` puede fallar; trigger F02-C debería prevenirlo.

## Cambios requeridos
Ninguno.
