# Impl F03-C — lobby_create_join

> Fecha: 2026-07-18  
> Scope: UI `/online` crear/unirse + lobby realtime (roster + Presence). **Sin** start match / sync launch (F03-D).  
> Post-review: fix baja durable vía `leave_room` (ver § Fix post-review).

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `src/config/online.ts` | **Nuevo** — `ONLINE`, `ONLINE_TRACKS` (`circuit-01`) |
| `src/ui/OnlineLobby.tsx` | **Nuevo** — flujo crear/unirse + vista lobby; leave durable |
| `src/app/(protected)/online/page.tsx` | Stub «Próximamente» → monta `OnlineLobby` |
| `supabase/migrations/20260718232000_leave_room.sql` | **Nuevo (post-review)** — RPC `leave_room` |
| `src/types/supabase.ts` | `leave_room` en Functions |
| `progress/current.md` | Plan F03-C |
| `progress/impl_F03-C.md` | Este informe |

## Decisiones

1. **UI en un componente cliente** `OnlineLobby` (entry tabs crear/unirse → lobby). Estilo alineado a `SetupScreen` / `LoginForm` (card, inputs, `Button`).
2. **RPCs F03-B:** `create_room(p_track_id, p_max_players)` / `join_room(p_code)`. Tras join, SELECT `rooms` por `membership.room_id`.
3. **Roster durable:** select inicial `room_members` + join `profiles(display_name, cap_color)` + `postgres_changes` `*` filtrado por `room_id`.
4. **Presencia:** canal privado `room:{uuid}`, `realtime.setAuth(access_token)` antes de subscribe, Presence `track` con `{ user_id, slot_index, display_name, cap_color }`. UI marca Conectado/Ausente vía `presenceState`.
5. **DB presence columns:** UPDATE `connected` / `last_seen_at` al entrar (SUBSCRIBED) y al salir (botón / unmount) — column grants F03-B.
6. **Errores RPC** mapeados a español (`room not found`, `room full`, `room not joinable`, etc.).
7. **Iniciar partida:** botón visible **deshabilitado** + copy «próxima iteración». Fuera de scope (F03-D).
8. **Tracks:** solo `circuit-01` en selector; lista extensible en `ONLINE_TRACKS`.
9. **Hot-seat:** enlace «Volver al hot-seat» → `/`; no se tocó `gameStore` ni home.
10. **Cero deps nuevas.** No `useEffectEvent` (no exportado en React del proyecto) — helpers de módulo + refs.
11. **No** marcado `done` / checkboxes en `feature_list` (reviewer).

## Checklist aceptación

- [x] Crear sala: código corto visible/copiable, pista, capacidad 2–4
- [x] Unirse por código; inválido/llena/no lobby → error claro
- [x] Lobby jugadores en tiempo real (postgres_changes altas/bajas + Presence conectados)
- [x] `/online` usable; stub reemplazado
- [x] Hot-seat `/` intacto
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios
- [x] Cero deps nuevas
- [x] Host visible en lista (badge «Host»)
- [x] Botón Iniciar deshabilitado (documentado; F03-D)
- [x] «Salir del lobby» elimina membresía (`leave_room`) — post-review

## Fix post-review (CHANGES_REQUESTED)

### Problema

`handleLeave` solo hacía Presence leave + `connected=false`. La fila en `room_members` permanecía → slot ocupado (`join_room` contaba miembros) y sin DELETE en `postgres_changes` (roster no bajaba).

### Solución

1. **RPC `leave_room(p_room_id uuid)`** — `security definer`, `search_path = ''`, grant `authenticated`.
   - DELETE de `room_members` para `auth.uid()` (idempotente si no es miembro / sala inexistente).
   - Lock `FOR UPDATE` en `rooms` para serializar host transfer / delete.
2. **Política host leave (elegida: transferir + borrar vacía):**
   - Si el que sale es host y quedan miembros → `host_id` pasa al miembro con menor `slot_index` (estable, predecible; no hace falta `is_host` en members).
   - Si no quedan miembros → `DELETE` de la sala (cascade limpia leftovers).
   - **Por qué no bloquear host leave:** el host debe poder abandonar el lobby sin atrapar a los demás; transferir es el patrón habitual de salas.
   - **Por qué no borrar la sala siempre al salir el host:** castigaría a miembros que ya están en lobby; transferir preserva código/capacidad.
3. **Migración** `supabase/migrations/20260718232000_leave_room.sql` aplicada remoto (MCP `leave_room`).
4. **UI** `OnlineLobby.tsx`:
   - «Salir del lobby» → `rpc('leave_room')` + unsub canal; limpia `lobbyMetaRef` antes para no doble-leave en unmount.
   - Unmount / navigate away → `leave_room` + removeChannel (libera slot; reconnect durable queda para F03-E).
   - Tras `postgres_changes` en members, refetch de `rooms` para actualizar badge Host tras transfer.
5. Tipos: `leave_room: { Args: { p_room_id: string }; Returns: undefined }`.
6. **No** marcado `done` (re-review).

### Verificación automática (post-fix)

```
pnpm tsc --noEmit  # OK
pnpm build         # OK
```

## Verificación automática

```
pnpm tsc --noEmit  # OK
pnpm build         # OK (sin warnings useEffectEvent)
```

## Pasos manuales (humano / 2 browsers)

### Precondiciones

- Dos usuarios autenticados (perfiles con `display_name` / `cap_color`).
- Migraciones F03-B + `leave_room` aplicadas; Realtime: si canales privados fallan, revisar «Allow public access» + policies `realtime.messages` (ver `impl_F03-B`).

### 1. Crear sala (browser A)

1. Login → `/online`.
2. Crear sala: pista Circuito 01, max 2–4.
3. Ver código de 6 chars; Copiar funciona.
4. Host aparece en lista con badge Host y Conectado.

### 2. Unirse (browser B)

1. Login otro user → `/online` → Unirse + código de A.
2. Ambos ven 2 jugadores sin reload.
3. Presence: ambos «Conectado».

### 3. Errores

- Código inventado → «Código de sala inválido.»
- Sala a capacidad → «La sala está llena.» (crear con max 2, unir 2º, intentar 3º).

### 4. Altas/bajas (CRÍTICO post-fix)

1. Sala max 2 → A host + B unido.
2. B «Salir del lobby» → A deja de ver a B en roster (DELETE via postgres_changes).
3. C se une con el mismo código → OK (no «La sala está llena.»).
4. (Opcional) Host A sale con B aún dentro → B recibe host; sala persiste.
5. Último miembro sale → sala eliminada; código ya no es joinable.

### 5. Regresión

- `/` hot-seat setup/partida local intacto.
- Botón «Iniciar partida» sigue deshabilitado.

---

## Cierre (post-APPROVED)

> Fecha: 2026-07-18  
> Review: `progress/review_F03-C.md` — **APPROVED**.

- `feature_list.json`: F03-C `"status": "done"`; `completed.f03_online` = `["F03-A", "F03-B", "F03-C"]`; description actualizada.
- Bitácora: append en `progress/history.md`.
- `progress/current.md`: plantilla → siguiente elegible **F03-D**.
- Checkboxes F03 en `specs/feature_list.md`: **no** marcados (feature completa abierta).
