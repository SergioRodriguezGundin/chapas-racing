# Impl F03-B — rooms_schema_rls

> Fecha: 2026-07-18  
> Scope: schema Postgres salas/partida + RLS + RPCs + tipos TS. Sin UI `/online`, sin sync launch, sin Edge Functions.

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260718230000_rooms.sql` | **Nuevo** — enum `room_status`, tablas `rooms` / `room_members`, triggers capacidad + `updated_at`, RPCs `create_room` / `join_room`, RLS, publication Realtime, policies `realtime.messages` (si existe) |
| `src/types/supabase.ts` | **Regenerado** vía MCP `generate_typescript_types` tras aplicar migración remota |
| `progress/current.md` | Plan F03-B |
| `progress/impl_F03-B.md` | Este informe |

## Decisiones

1. **Código corto 6 chars** charset `A-Z0-9` sin I/O/0/1 (menos ambigüedad al dictar). Unique index + retry en `create_room` (hasta 20 intentos) ante `unique_violation`.
2. **INSERT solo vía RPC:** sin policies INSERT en `rooms` / `room_members` → rechazo por defecto. `create_room` / `join_room` son `security definer` + `search_path = ''` (mismo estilo que `handle_new_user` en profiles).
3. **Capacidad:** check `max_players` 2–4 en tabla + validación en RPC + trigger `enforce_room_capacity` BEFORE INSERT (safety net).
4. **Host:** `rooms.host_id` → `profiles`; policy UPDATE solo host (cubre start en F03-D). `is_host` no se duplica en members (se infiere de `host_id`).
5. **Membership helper:** `is_room_member(uuid)` security definer para evitar recursión RLS en SELECT policies.
6. **`join_room`:** idempotente si ya eres miembro; exige `status = lobby`; normaliza code a UPPER/trim.
7. **Realtime:** tablas añadidas a `supabase_realtime`; policies opcionales en `realtime.messages` para topic `room:{uuid}` (bloque DO si la tabla existe).
8. **Tipos:** regenerados con MCP (mismo camino que F02-C). El archivo sigue incluyendo schema legacy de otras apps del proyecto MCP; `rooms`, `room_members`, `room_status`, `create_room`, `join_room` tipados.
9. **Migración remota:** aplicada con MCP `apply_migration` nombre `rooms_schema_rls` (equivalente al SQL local).

## Checklist aceptación

- [x] Migración: salas con código corto único, `track_id`, `max_players` 2–4, host, status `lobby|playing|finished`
- [x] `room_members` ligados a `profiles`; PK `(room_id, user_id)`; `slot_index` unique per room; capacidad enforced
- [x] RLS: create/join autenticado vía RPC; SELECT solo miembros; UPDATE rooms solo host; sin filtrado = rechazo
- [x] Tipos TS regenerados (`rooms`, `room_members`, enum, RPCs)
- [x] Código corto único con manejo de colisión (retry)
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios
- [x] Cero deps nuevas
- [x] F03-B marcado `done` post-APPROVED (cierre docs)
- [x] **No** UI `/online` (F03-C)

## Verificación automática

```
pnpm tsc --noEmit  # OK
pnpm build         # OK
```

## Pasos manuales (humano / reviewer)

### 1. Confirmar schema en Dashboard

Supabase → Table Editor: existen `rooms` y `room_members` con RLS enabled.

### 2. Smoke RPC (SQL o cliente autenticado)

```sql
-- Como usuario autenticado (JWT) o vía supabase-js:
select public.create_room('circuit-01', 4);
-- Debe devolver fila con code de 6 chars; host en room_members slot 0

select public.join_room('<CODE>');
-- Segundo usuario: nuevo member; sala llena / status≠lobby → exception
```

### 3. RLS negativo

- `select * from rooms` sin ser miembro → 0 filas
- `insert into rooms (...)` directo como authenticated → deny
- `update rooms set status = 'playing'` como no-host → deny

### 4. Proyecto local limpio

Si se usa CLI contra otro proyecto: `supabase db push` (o aplicar `20260718230000_rooms.sql`) y regenerar tipos:

```
pnpm dlx supabase gen types typescript --linked > src/types/supabase.ts
```

### 5. Realtime Authorization

Para canales privados `room:{id}` en F03-C: desactivar “Allow public access” en Realtime Settings si aún está abierto; las policies de `realtime.messages` ya están creadas si la tabla existía.

## Fix post-review (CA3 — CHANGES_REQUESTED)

> Fecha: 2026-07-18  
> Veredicto previo: `progress/review_F03-B.md` — policy UPDATE permitía mutar `room_id` / `slot_index` / `strokes`.

### Elección: Opción A (column grants)

Camino: migración remota `rooms_schema_rls` **ya aplicada** → no se reescribe el historial remoto; se añade migración correctiva + se alinea el SQL local greenfield.

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260718230000_rooms.sql` | Greenfield: `REVOKE UPDATE` de `anon`/`authenticated` + `GRANT UPDATE (connected, last_seen_at)` a `authenticated` antes de la policy |
| `supabase/migrations/20260718231000_room_members_update_presence_only.sql` | **Nuevo** — mismo endurecimiento para proyectos que ya tenían `rooms_schema_rls` |

### Remoto

- Aplicada vía MCP `apply_migration` nombre `room_members_update_presence_only`.
- Verificado en `information_schema.column_privileges`: `authenticated` tiene `UPDATE` solo en `connected` y `last_seen_at` (no en `room_id` / `slot_index` / `user_id` / `strokes`).
- Policy `"Members can update own membership"` recreada: `USING`/`WITH CHECK` = `auth.uid() = user_id`.
- Tipos TS: no regenerados (solo grants/policy; schema público de columnas/RPCs sin cambio).

### Verificación automática (post-fix)

```
pnpm tsc --noEmit  # OK
pnpm build         # OK
```

### RLS negativo adicional (reviewer / humano)

- Miembro: `update room_members set room_id = '<otra>'` → deny (privilege)
- Miembro: `update room_members set strokes = 99` / `slot_index = 3` → deny (privilege)
- Miembro: `update room_members set connected = false, last_seen_at = now()` en su fila → OK (RLS + column grant)
- Otro usuario: UPDATE fila ajena → deny (RLS)

### feature_list

**No** marcado `done` (sigue `in_progress` hasta re-review).

---

## Cierre (post-APPROVED)

> Fecha: 2026-07-18  
> Review: `progress/review_F03-B.md` — **APPROVED**.

- `feature_list.json`: F03-B `"status": "done"`; `completed.f03_online` = `["F03-A", "F03-B"]`; description actualizada.
- Bitácora: append en `progress/history.md`.
- `progress/current.md`: plantilla → siguiente elegible **F03-C**.
- Checkboxes F03 en `specs/feature_list.md`: **no** marcados (feature completa abierta).
