# Impl F02-C — profiles_migration_rls

## Archivos tocados

| Archivo | Acción |
|---------|--------|
| `supabase/migrations/20260712100000_profiles.sql` | **Nuevo** — DDL canónico: tabla `profiles`, RLS, trigger `on_auth_user_created`, bucket `avatars` |
| `src/types/supabase.ts` | **Regenerado** vía MCP `generate_typescript_types` (incluye `profiles`) |
| `progress/current.md` | Actualizado con plan de tarea |

## Decisiones

1. **`display_name` default `'Jugador'`** (no `''`): cumple constraint `char_length BETWEEN 1 AND 32` del research doc, que con default vacío fallaría en inserts sin nombre.
2. **Migración en repo vs MCP:** el SQL versionado en `supabase/migrations/` es el esquema limpio para un proyecto Supabase dedicado a chapas-racing (trigger nuevo sobre `auth.users`).
3. **Aplicación MCP adaptada:** el proyecto conectado al MCP ya tenía trigger `on_auth_user_created` → `handle_new_user()` insertando en `public.user`. La migración remota (`profiles_rls_avatars`, versión `20260712172211`) **extendió** `handle_new_user()` para insertar también en `public.profiles` sin romper el flujo legacy. En proyecto nuevo, aplicar el archivo local con `supabase db push` o CLI equivalente.
4. **Tipos TS:** el archivo generado refleja **todo** el esquema del proyecto MCP (incluye tablas de otras apps). `profiles` está tipado; regenerar tras conectar un proyecto Supabase exclusivo de chapas-racing reducirá el archivo.

## Estado migración

| Item | Estado |
|------|--------|
| Tabla `public.profiles` | ✅ Creada |
| RLS enabled | ✅ `relrowsecurity = true` |
| Políticas SELECT / INSERT / UPDATE | ✅ 3 políticas activas |
| Trigger signup → `profiles` | ✅ `handle_new_user()` incluye INSERT en `profiles` (trigger existente `on_auth_user_created`) |
| Bucket `avatars` (public read) | ✅ `public = true` |
| Storage policies (select / insert / update en `{userId}/`) | ✅ Políticas `Avatar images are publicly accessible`, `Users can upload own avatar`, `Users can update own avatar` |
| MCP `apply_migration` | ✅ `profiles_rls_avatars` |
| `cap_color` default `#3b82f6` | ✅ Verificado en `information_schema.columns` |

## Criterios de aceptación

- [x] `supabase/migrations/` con SQL: tabla, constraints, RLS, políticas select/insert/update
- [x] Trigger `on_auth_user_created` crea fila `profiles` con `display_name` desde metadata Google/email
- [x] Bucket `avatars` con lectura pública y upload/update solo carpeta `{userId}/`
- [x] Migración aplicada en proyecto Supabase (MCP)
- [x] `src/types/supabase.ts` regenerado con tipos `profiles`
- [ ] Verificación signup → fila `profiles` (manual — ver abajo)
- [ ] Verificación anon no puede update ajeno (manual — ver abajo)
- [x] `cap_color` default hex válido `#3b82f6`

## Verificación automática (repo)

```bash
pnpm tsc --noEmit   # ✅
pnpm build          # ✅
```

## Verificación manual pendiente (humano)

### 1. Nuevo signup crea fila `profiles`

1. Configurar `.env.local` con URL/anon key del proyecto donde se aplicó la migración.
2. Registrar usuario nuevo (email/password o Google OAuth tras F02-B).
3. En Supabase Dashboard → Table Editor → `profiles`: debe existir fila con `id = auth.users.id`, `display_name` derivado de metadata/email, `cap_color = #3b82f6`.

### 2. Anon no puede actualizar perfil ajeno

En SQL Editor o cliente con anon key:

```sql
-- Como usuario autenticado A, obtener id de otro perfil B
-- Intentar desde cliente JS:
-- supabase.from('profiles').update({ display_name: 'hack' }).eq('id', '<uuid-de-B>')
-- Debe devolver 0 filas / error RLS, no modificar B.
```

Alternativa: Dashboard → Authentication → un usuario logueado en la app → editar solo su propio perfil en `/profile` (F02-D); otro `id` debe fallar.

### 3. Proyecto Supabase dedicado (opcional)

Si chapas-racing usa un proyecto distinto al MCP actual:

```bash
pnpm dlx supabase link --project-ref <ref>
pnpm dlx supabase db push
pnpm dlx supabase gen types typescript --linked > src/types/supabase.ts
```

## Notas reviewer

- No se implementó login UI (F02-B) ni editor perfil (F02-D).
- `handle_new_user` en MCP conserva insert legacy en `public.user` además de `profiles`.
