# Implementación F02-D — profile_editor_ui

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/ui/ProfileForm.tsx` | **Nuevo** — formulario cliente: display_name, cap_color (picker + presets), avatar opcional (Storage), guardar vía RLS, logout |
| `src/ui/AuthNav.tsx` | **Nuevo** — enlace "Mi perfil" / "Iniciar sesión" en home según sesión |
| `src/app/(protected)/profile/page.tsx` | Sustituido stub por RSC que carga perfil y monta `ProfileForm` |
| `src/app/page.tsx` | Añadido `<AuthNav />` (no bloquea hot-seat) |

## Decisiones

- **Ruta:** `/profile` bajo `(protected)/profile` — guard doble (middleware F02-E + layout).
- **Persistencia:** `supabase.from("profiles").update()` con cliente browser (anon + RLS). Sin service role.
- **Avatar:** upload a `avatars/{userId}/avatar.{ext}` con `upsert: true`; URL pública con cache-buster `?t=`.
- **Validación cliente:** nombre 1–32 chars, hex `#RRGGBB`, imagen ≤ 2 MB (JPEG/PNG/WebP).
- **Logout:** `signOut()` + `router.push("/")` + `refresh()`.
- **AuthNav:** `getUser()` + `onAuthStateChange`; `pointer-events-auto` para no interferir con HUD (`pointer-events-none`).
- **Perfil ausente:** fallback a metadata OAuth/email (trigger debería crear fila en signup).

## Criterios de aceptación

- [x] `src/app/(protected)/profile/page.tsx` accesible solo autenticado (middleware + layout)
- [x] Form edita `display_name` (1–32), `cap_color` (#RRGGBB picker + presets), avatar opcional
- [x] Upload avatar a Storage `avatars/{userId}/` y actualiza `profiles.avatar_url`
- [x] Edición persiste; UI muestra `updated_at` tras guardar (trigger DB `profiles_updated_at`)
- [x] UI coherente con `LoginForm` / `SetupScreen` (tokens shadcn, `inputClassName`, `Button`)
- [x] Logout limpia sesión y redirige a `/`
- [x] Sesión persiste entre recargas (infra PKCE cookies F02-A — sin cambios)
- [x] Enlace a perfil desde HUD/home vía `AuthNav` cuando hay sesión
- [x] Hot-seat `/` sin imports Supabase en lógica de juego; `AuthNav` es overlay opcional
- [x] `pnpm tsc --noEmit && pnpm build` verdes

## Verificación manual (humano)

Requiere `.env.local` con Supabase configurado y migración F02-C aplicada.

### Acceso y guard

1. Sin sesión: `/profile` → redirect `/login?next=%2Fprofile`.
2. Con sesión: `/profile` muestra formulario con datos actuales.

### Edición

3. Cambiar nombre (1–32 chars) y color → Guardar → mensaje éxito; recargar página → valores persisten.
4. Comprobar en Supabase Table Editor que `updated_at` cambió tras guardar.

### Avatar

5. Subir imagen JPEG/PNG/WebP (< 2 MB) → guardar → preview y `avatar_url` actualizados.
6. Verificar objeto en Storage bucket `avatars` bajo carpeta `{userId}/`.

### Logout y sesión

7. Cerrar sesión → redirect `/`; `/profile` vuelve a pedir login.
8. Iniciar sesión de nuevo → recargar `/` y `/profile` → sesión sigue activa (cookies PKCE).

### Hot-seat

9. Sin login: jugar partida completa en `/` (SetupScreen → lanzar → meta).
10. Con login: enlace "Mi perfil" visible arriba a la derecha; juego sigue funcionando.

## Notas para reviewer

- `LoginForm` no muestra enlace a perfil: usuarios logueados son redirigidos de `/login` por middleware (F02-E). El enlace con sesión está en `AuthNav`.
- Si el perfil no existe en DB (signup sin trigger), el formulario usa defaults y el primer `update` puede fallar si no hay fila — caso edge; trigger F02-C debería prevenirlo.
