# Implementación F02-E — route_protection

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `middleware.ts` | PROTECTED_PREFIXES, redirect sin sesión → `/login?next=`, logueado en `/login` → `/`, matcher ampliado, header `x-pathname` |
| `src/app/(protected)/layout.tsx` | **Nuevo** — `getUser()` + `redirect` con `next` (segunda capa) |
| `src/app/(protected)/online/page.tsx` | **Nuevo** — stub "Próximamente" |
| `src/app/(protected)/editor/page.tsx` | **Nuevo** — stub "Próximamente" |
| `src/app/(protected)/profile/page.tsx` | **Nuevo** — stub mínimo (formulario → F02-D) |
| `progress/current.md` | Tarea F02-E en curso |

## Decisiones

- **Matcher sin `/`:** hot-seat permanece público; middleware no intercepta la home.
- **PROTECTED_PREFIXES:** `/online`, `/editor`, `/profile` según research y spec.
- **Defensa en profundidad:** middleware (primera capa) + layout `(protected)` (segunda capa con `getUser()`).
- **Header `x-pathname`:** middleware lo inyecta para que el layout pueda construir `?next=` si el guard server actúa.
- **Perfil:** stub bajo `(protected)/profile` — F02-D implementará el formulario en la misma ruta.
- **Login con sesión:** redirect fijo a `/` (criterio de aceptación); `next` lo gestiona F02-B en flujo sin sesión.

## Criterios de aceptación

- [x] `middleware.ts`: `isProtected` redirige a `/login?next=pathname` si `!user`
- [x] Usuario logueado en `/login` redirige a `/`
- [x] Existe `src/app/(protected)/layout.tsx` con `getUser()` + `redirect`
- [x] Stubs `src/app/(protected)/online/page.tsx` y `editor/page.tsx` ("próximamente")
- [x] Tras login, param `next` devuelve a ruta original (ya soportado por F02-B `LoginForm` + callback)
- [x] `pnpm tsc --noEmit && pnpm build` verdes

## Verificación manual (humano)

Requiere `.env.local` con credenciales Supabase válidas.

### Sin sesión

1. Abrir `http://localhost:3000/` → hot-seat jugable (SetupScreen, lanzar, meta, restart) sin login.
2. Navegar a `/online` → redirect a `/login?next=%2Fonline`.
3. Navegar a `/editor` → redirect a `/login?next=%2Feditor`.
4. Navegar a `/profile` → redirect a `/login?next=%2Fprofile`.

### Con sesión

5. Iniciar sesión (email o Google) desde `/login?next=/online`.
6. Tras login exitoso → debe aparecer stub "Partidas online / Próximamente" en `/online`.
7. Repetir con `next=/editor` y `next=/profile` si se desea validar los otros stubs.
8. Con sesión activa, visitar `/login` → redirect automático a `/`.

### OAuth

9. Desde `/login?next=/profile`, "Continuar con Google" → tras callback OAuth, debe aterrizar en `/profile` (stub).

## Verificación automática

```bash
pnpm tsc --noEmit   # OK
pnpm build          # OK — rutas /online, /editor, /profile, /login dinámicas (ƒ)
```

## Fuera de scope (F02-D)

- Formulario de perfil editable, upload avatar, logout en UI perfil.
