# Implementación F02-A — supabase_client_setup

> Fecha: 2026-07-12  
> Estado: listo para review

## Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `.env.local.example` | Plantilla documentada con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `src/lib/supabase/env.ts` | Helpers con placeholders para build sin `.env.local` |
| `src/lib/supabase/client.ts` | `createBrowserClient<Database>` para componentes cliente |
| `src/lib/supabase/server.ts` | `createServerClient` + `await cookies()` + `getAll`/`setAll` |
| `src/lib/supabase/middleware.ts` | `updateSession` con `getAll`/`setAll`/`getUser` |
| `middleware.ts` | Refresh de sesión solo en `/login` y `/auth/*` |
| `src/types/supabase.ts` | Tipo `Database` placeholder hasta `supabase gen types` |

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `package.json` / `pnpm-lock.yaml` | `@supabase/supabase-js@2.110.2`, `@supabase/ssr@0.12.0` |
| `.gitignore` | Excepción `!.env.local.example` (`.env*` ignoraba la plantilla) |
| `progress/current.md` | Plan implementer actualizado |

## Decisiones

1. **`src/lib/supabase/env.ts`**: centraliza URL/anon key con placeholders JWT-shaped para que `pnpm build` pase en CI/sin credenciales. En runtime real el usuario sustituye vía `.env.local`.
2. **Middleware mínimo (F02-A)**: solo `updateSession` + return; sin `PROTECTED_PREFIXES` ni redirects (F02-E).
3. **Matcher**: `["/login", "/auth/:path*"]` — **no incluye `/`** → hot-seat público sin overhead auth.
4. **`setAll` en middleware**: implementa segundo argumento `headers` según tipos `@supabase/ssr@0.12`.
5. **Generic `Database`**: factories tipadas con placeholder vacío; F02-C regenerará tipos reales.

## Criterios de aceptación

- [x] `pnpm add @supabase/supabase-js @supabase/ssr`
- [x] `.env.local.example` con vars documentadas
- [x] `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- [x] `middleware.ts` raíz: refresh en auth/login; matcher sin `/`
- [x] `src/types/supabase.ts` placeholder
- [x] Cero imports Supabase en `src/app/page.tsx` y `src/core/`
- [x] `pnpm tsc --noEmit && pnpm build` verde

## Verificación ejecutada

```bash
pnpm add @supabase/supabase-js @supabase/ssr   # exit 0
pnpm tsc --noEmit                               # exit 0
pnpm build                                      # exit 0, Next.js 15.5.20
```

## Pasos manuales (usuario)

1. Copiar plantilla: `cp .env.local.example .env.local`
2. Dashboard Supabase → Settings → API → pegar **Project URL** y **anon public key**
3. (F02-C) Tras migración profiles: `pnpm dlx supabase gen types typescript --project-id <ref> > src/types/supabase.ts`
4. (F02-B) Configurar Google OAuth y redirect URLs en Dashboard

## Verificación manual pendiente (post credenciales reales)

- Navegar a `/` sin sesión: juego hot-seat carga sin redirect (middleware no aplica).
- Tras F02-B: visitar `/login` con cookies de sesión refresca tokens vía middleware.

## Fuera de scope (correcto)

- Login UI (F02-B)
- Migración profiles / RLS (F02-C)
- Protección de rutas con redirect (F02-E)
