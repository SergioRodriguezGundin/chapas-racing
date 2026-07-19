# Impl F03-D — online_match_sync

> Fecha: 2026-07-18  
> Scope: Host inicia partida; sync launch/settle; turnos visibles; gate input cliente.  
> Fuera: disconnect timeout, reconexión durable, ranking end sync, validación server launch (F03-E).

## Cierre

- Review: `progress/review_F03-D.md` — **APPROVED** (re-review 2026-07-19).
- `feature_list.json`: F03-D `"status": "done"`; `completed.f03_online` incluye F03-D.
- Checkboxes F03 en `specs/feature_list.md` **no** marcados (pendiente F03-E).
- Siguiente elegible: F03-E (`progress/current.md`).

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260718233000_start_room_settle.sql` | **Nuevo** — RPC `start_room`, `commit_room_settle` |
| `src/types/supabase.ts` | Tipos Functions `start_room` / `commit_room_settle` |
| `src/config/online.ts` | `ONLINE.minPlayersToStart: 2` |
| `src/stores/gameStore.ts` | `matchMode`, `queueRemoteImpulse`, `applySettleSnapshot`, `PlayerConfig.id`, bridges requestId |
| `src/features/online/roomEvents.ts` | **Nuevo** — envelope `{ v:1, type, payload }` |
| `src/features/online/capBodyRegistry.ts` | **Nuevo** — refs RigidBody para snapshot |
| `src/features/online/onlineSession.ts` | **Nuevo** — Broadcast launch/settle, turn_seq, gate aim |
| `src/features/cap/Cap.tsx` | Remote impulse + snapshot teleport; settle online vía `commitLocalSettle` |
| `src/features/launch/useLaunch.ts` | Gate slot local; `broadcastLocalLaunch` |
| `src/ui/OnlineLobby.tsx` | Iniciar (≥2 host); `postgres_changes` rooms→match; Canvas+Hud |
| `src/ui/VictoryModal.tsx` | Online: solo «Salir al lobby» (newMatch) |
| `src/app/(protected)/online/page.tsx` | Monta `OnlineLobby` (layout interno) |
| `progress/current.md` | Plan F03-D |
| `progress/impl_F03-D.md` | Este informe |

## Decisiones

1. **Start durable:** RPC `start_room` (security definer): host + lobby + ≥2 members → `status=playing`, `active_slot=0`, `turn_seq=0`, `started_at`. Evita race de UPDATE directo.
2. **Entrada a match:** todos escuchan `postgres_changes` UPDATE en `rooms`; host también llama `beginOnlineMatch` tras RPC (idempotente con `matchStartedRef`).
3. **Roster → gameStore:** `startMatch([{ id: userId, name, color: nearestPlayerColor(cap_color) }], { mode: "online" })` orden `slot_index`.
4. **Sync efímero:** Broadcast en canal existente `room:{uuid}`, evento `room_event`, envelope research §3. `turn_seq` compartido launch+settle; tras settle `expectedTurnSeq++`. Eco propio ignorado por `user_id`.
5. **Puente física:** `remoteImpulseRequestId` + `pendingRemoteImpulse`; `snapshotRequestId` + `pendingSnapshot` (patrón `resetRequestId`). Registry de bodies para leer posiciones al settle.
6. **Autoridad settle:** solo el cliente cuyo `slotIndex === activePlayerIndex` emite settle (stop / out-of-track). Remotos esperan Broadcast (no rotan turno solos).
7. **DB al settle (opcional F03-E):** `commit_room_settle(room_id, turn_seq, next_active_slot)` avanza `active_slot` y `turn_seq+1`; no-op si seq no coincide.
8. **Victory:** local OK; online no reinicia partida (desync); «Salir al lobby» → `newMatch` + `leave_room`. Ranking server = F03-E.
9. **Hot-seat `/`:** intacto (`matchMode: "local"` default).
10. **Cero deps nuevas.** Migración aplicada remoto (MCP). No marcado `done`.

### Desviaciones vs research

- No se persiste `positions jsonb` en rooms (reconexión mid-moving = F03-E).
- Aim preview no se replica (como recomendaba research).
- Cap/useLaunch importan `onlineSession` (acoplamiento features) para gate/broadcast sin capa service nueva.

## Checklist aceptación

- [x] Host inicia; todos → playing misma pista y roster
- [x] Orden turnos + activo visibles/consistentes (Hud + `activePlayerIndex` alineado settle)
- [x] Solo activo lanza local; input replicado (Broadcast launch)
- [x] Tras settle, posiciones corregidas vía snapshot en todos
- [x] Rotación turno post-settle alineada F01 (`(i+1) % n`)
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios
- [x] Cero deps nuevas

## Verificación automática

```
pnpm tsc --noEmit  # OK
pnpm build         # OK
```

## Fix post-review (CHANGES_REQUESTED)

> Fecha: 2026-07-19  
> Responde a `progress/review_F03-D.md` cambios #1 y #2.

### Archivos tocados (fix)

| Archivo | Cambio |
|---------|--------|
| `src/ui/OnlineLobby.tsx` | `beginOnlineMatch`: siempre `fetchLobbyMembers` antes de `startMatch`; `slotIndex` = `roster.findIndex` (denso) |
| `src/features/online/onlineSession.ts` | Documenta que `session.slotIndex` es índice denso = Cap `playerIndex` |
| `src/features/online/roomEvents.ts` | Comentarios: `slot_index` / `next_active_slot` = dense 0..n-1 |
| `supabase/migrations/20260718233000_start_room_settle.sql` | Comentario RPC: `active_slot` = dense playerIndex |

### Decisiones fix

1. **Opción (a) — índice denso:** no compactamos `room_members.slot_index` en leave. Al start, roster ordenado por `slot_index` DB → array denso 0..n-1. `bindOnlineSession({ slotIndex: findIndex })`. Launch/settle/`commit_room_settle` ya usaban `session.slotIndex` / `(active+1)%n`, así que quedan alineados con Cap `playerIndex` y `rooms.active_slot`.
2. **Roster canónico:** refetch siempre (error o `< minPlayers` → abort, no `matchStartedRef`).
3. **RPC:** sin cambio de lógica; `p_next_active_slot < member_count` ya valida semántica densa.

### Checklist post-fix

- [x] #1 slot DB ≠ playerIndex resuelto vía dense findIndex
- [x] #2 fetchLobbyMembers siempre antes de startMatch
- [x] `pnpm tsc --noEmit` OK
- [x] `pnpm build` OK
- [ ] Manual: 3 jugadores → uno sale → host inicia → ambos completan un turno (pending humano)

## Pasos manuales (humano / 2–3 clientes)

### Precondiciones

- Dos/tres usuarios autenticados con perfil.
- Migración `start_room_settle` aplicada.
- Realtime: canal privado `room:{uuid}` (mismo setup F03-C).

### 1. Start

1. A crea sala max 2–4; B se une.
2. A ve «Iniciar partida» habilitado (≥2); B lo ve deshabilitado.
3. A inicia → ambos montan Canvas + Hud con mismos nombres/colores/orden slots.
4. Hot-seat `/` sigue funcionando aparte.

### 2. Turnos + launch

1. Slot 0 (A si es host slot 0) puede apuntar; el otro no.
2. A lanza → B ve la chapa impulsada (réplica).
3. Al parar → ambos alinean posiciones y el turno pasa al siguiente (Hud).
4. B lanza en su turno; A observa réplica + settle.

### 3. Gaps tras leave (review #1/#3)

1. A, B, C en lobby (slots DB 0,1,2).
2. B sale → quedan A y C (slots DB 0 y 2).
3. Host inicia → ambos en match; A (playerIndex 0) y C (playerIndex 1) pueden completar un turno cada uno (aim + launch replica + settle + Hud).

### 4. Meta (opcional)

1. Quien cruce meta ve VictoryModal local; «Salir al lobby» vuelve a entry (leave_room).
2. No se exige ranking idéntico en DB (F03-E).
