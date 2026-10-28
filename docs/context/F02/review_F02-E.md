# Review — F02-E (route_protection)

**Veredicto:** APPROVED

## Criterios de aceptación

- CA1 — `middleware.ts`: `isProtected` redirige a `/login?next=pathname` si `!user`: [x] `middleware.ts` líneas 12–21 (`PROTECTED_PREFIXES`, `url.searchParams.set("next", pathname)`).
- CA2 — Usuario logueado en `/login` redirige a `/`: [x] `middleware.ts` líneas 23–25 (`user && pathname === "/login"` → `redirect("/")`).
- CA3 — Existe `src/app/(protected)/layout.tsx` con `getUser()` + `redirect`: [x] `(protected)/layout.tsx` líneas 17–28 (`supabase.auth.getUser()`, `redirect` con `?next=`).
- CA4 — Stubs `src/app/(protected)/online/page.tsx` y `editor/page.tsx` (próximamente): [x] ambos con título + "Próximamente".
- CA5 — Verificación manual: `/` hot-seat jugable sin sesión; `/online`, `/editor`, `/profile` redirigen sin sesión: [x] código: matcher (`middleware.ts` líneas 31–38) excluye `/`; `src/app/page.tsx` sin auth; rutas protegidas cubiertas por middleware + layout. Pasos manuales documentados en `impl_F02-E.md` § Verificación manual (pendiente humano con `.env.local`).
- CA6 — Tras login, param `next` devuelve a ruta original: [x] flujo F02-B: middleware setea `next` → `login/page.tsx` líneas 7–17 → `LoginForm.tsx` líneas 79/95 (`router.push(nextPath)`) y OAuth líneas 115–116 → `auth/callback/route.ts` líneas 16–34.
- CA7 — `pnpm tsc --noEmit` y `pnpm build` limpios: [x] ejecutados en review (exit 0); rutas generadas: `/`, `/online` ƒ, `/editor` ƒ, `/profile` ƒ, `/login` ƒ.

## Checklist adicional

| Ítem | Resultado |
|------|-----------|
| Matcher excluye `/` (hot-seat público) | OK — `config.matcher` solo `/online/:path*`, `/editor/:path*`, `/profile/:path*`, `/login`, `/auth/:path*`; sin `/` ni catch-all global. |
| Defensa en profundidad | OK — middleware (capa 1) + `(protected)/layout.tsx` (capa 2 con `x-pathname` línea 27). |
| Scope creep F02-D | OK — `profile/page.tsx` es stub "Próximamente"; sin formulario, upload ni logout UI. |
| Scope creep F02-A/B/C | OK — sin cambios fuera de middleware + `(protected)/*` + `progress/` según `impl_F02-E.md`. |
| Convenciones | OK — alias `@/`; sin `any`; layout server async; stubs mínimos con tokens existentes (`bg-background`, `font-heading`). |
| Dependencias nuevas | OK — cero deps nuevas; reutiliza `@supabase/ssr` de F02-A. |

## Verificación ejecutada (reviewer)

```bash
pnpm tsc --noEmit   # exit 0
pnpm build          # exit 0 (Next.js 15.5.20, 10 rutas)
```

## Verificación manual pendiente (humano, no bloqueante para código)

1. Hot-seat jugable en `/` sin sesión.
2. `/online`, `/editor`, `/profile` → `/login?next=...` sin sesión.
3. Login con `next=/online` (email u OAuth) → aterriza en stub correcto.
4. Sesión activa en `/login` → redirect a `/`.

## Observaciones (no bloqueantes)

1. `sanitizeNextPath` duplicada en `login/page.tsx`, `auth/callback/route.ts` y `(protected)/layout.tsx` — aceptable; extraer helper compartido en refactor futuro.
2. Stub `profile/page.tsx` no está en acceptance explícito de F02-E pero alinea con descripción de la feature y guard de `/profile`.

## Cambios requeridos

Ninguno.
