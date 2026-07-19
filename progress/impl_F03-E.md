# Impl F03-E — disconnect_end_validate

> Fecha: 2026-07-19  
> Scope: Skip turno por desconexión, reconexión, fin/ranking sync, validación server launch.  
> Fuera: marcar `done` / checkboxes specs (reviewer).

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/20260719010000_f03e_disconnect_finish_launch.sql` | **Nuevo** — cols `turn_started_at`/`launch_pending`; RPCs `room_dense_user`, `submit_room_launch`, `skip_room_turn`, `finish_room`; patch `start_room`/`commit_room_settle` |
| `src/config/online.ts` | `disconnectTurnTimeoutMs: 15000`, `presenceHeartbeatMs: 5000` |
| `src/features/online/roomEvents.ts` | Envelope `disconnect_signal` |
| `src/features/online/onlineSession.ts` | RPC launch/skip/finish; sync turno; Broadcast tras RPC |
| `src/features/launch/useLaunch.ts` | `submitRoomLaunch` OK → impulso + Broadcast |
| `src/stores/gameStore.ts` | `applyOnlineFinish`; `startMatch` acepta `activePlayerIndex`/`strokes` |
| `src/ui/OnlineLobby.tsx` | Reconnect, heartbeat, skip timeout, finish sync; unmount ≠ leave_room; post-review: pick activa + leave finished |
| `src/types/supabase.ts` | Types rooms + Functions F03-E |
| `progress/current.md` | Plan F03-E |
| `progress/impl_F03-E.md` | Este informe |

## Decisiones

1. **Launch autoridad:** cliente activo llama `submit_room_launch` (security definer) antes de impulso local. Rechaza no-activo / `turn_seq` mismatch / `launch_pending`. Broadcast sigue siendo hint visual; spoofers sin RPC no marcan autoridad en DB.
2. **Skip disconnect:** cliente detecta activo ausente (Presence leave o `connected=false`) durante `ONLINE.disconnectTurnTimeoutMs` → RPC `skip_room_turn` (race-safe por `turn_seq`). Server exige activo stale (`connected=false` o `last_seen_at` > 15s; sync con config). Broadcast `disconnect_signal` alinea UI; DB gana.
3. **Heartbeat:** mientras lobby/match, `last_seen_at` cada `presenceHeartbeatMs` para que el stale check del server funcione tras crash.
4. **Reconexión:** al montar `/online`, si hay membership en sala `lobby`/`playing`, `enterLobby` + Presence + `connected=true`. Match usa `active_slot`/`turn_seq`/strokes DB.
5. **Unmount ≠ leave:** cleanup solo `connected=false` + quitar canal. `leave_room` solo botón «Salir del lobby» / Victory «Salir al lobby». Permite reconnect mid-match.
6. **Fin:** `playerFinished` local → `finish_room` (ranking jsonb). Remotos: `postgres_changes` status=finished → `applyOnlineFinish` (mismo ranking strokes). VictoryModal reutiliza store.
7. **Settle:** `commit_room_settle` acepta `p_strokes` opcional; limpia `launch_pending` y setea `turn_started_at`.
8. **Cero deps nuevas.** Migración aplicada remoto (MCP, troceada v2+). No marcado `done`.

### Desviaciones vs diseño líder

- No se persistió `rooms.positions jsonb` (reconnect mid-`moving` teleporta a start positions del track; turnos/strokes sí desde DB). Justificación: AC pide no corromper turnos, no snapshot físico mid-shot.
- Skip no exige host: cualquier miembro con `turn_seq` válido (race-safe).

## Checklist aceptación

- [x] Desconexión: turno ausente se salta tras timeout; partida no bloqueada
- [x] Reconexión: recupera lobby o match sin corromper turnos (post-review: pick activa entre 0..N; ignora/limpia finished)
- [x] Fin: ranking sincronizado vía Postgres + VictoryModal
- [x] Validación server-side: launch no-activo rechazado (`submit_room_launch`)
- [x] Timeout/constantes en `config/online.ts`
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios
- [x] Cero deps nuevas

## Verificación automática

```
pnpm tsc --noEmit  # OK
pnpm build         # OK
```

## Fix post-review (CHANGES_REQUESTED → CA2)

**Problema:** reconnect usaba `.from("room_members").eq("user_id").maybeSingle()` sin filtrar por status de sala. Con membership `finished` huérfana + sala nueva `lobby`/`playing` → ≥2 filas → error PostgREST → reconnect silencioso fallaba.

**Cambio:** helper `findActiveMembershipForReconnect` en `OnlineLobby.tsx`:
- Fetch array `room_members` + embed `rooms(*)`, orden `joined_at` desc (nunca `maybeSingle` sobre 0..N).
- Pick primera fila con `rooms.status` ∈ (`lobby`, `playing`).
- Filas `finished`: `leave_room` fire-and-forget para no acumular huérfanos (Victory «Salir al lobby» ya hacía leave; este path cubre F5 sin salir).
- Profile sigue con `maybeSingle` (1 fila por user_id).

**Verificación:** `pnpm tsc --noEmit` + `pnpm build` OK (post-fix).

**Manual extra:** (1) Partida finished sin «Salir» → create/join otra sala → F5 en `/online` recupera la activa, no error. (2) Solo membership finished → entry limpio (leave limpia huérfano).

## Pasos manuales (humano / 2–3 clientes)

### Precondiciones

- Migración F03-E aplicada (RPCs `submit_room_launch`, `skip_room_turn`, `finish_room`).
- Dos usuarios autenticados con perfil.

### 1. Disconnect skip

1. A y B en partida; turno de A.
2. Cerrar pestaña/cerrar red de A (sin «Salir»).
3. Tras ~15s, B debe ver turno avanzar a B; partida jugable.
4. Confirmar que no queda bloqueada en A.

### 2. Reconexión

1. A y B en lobby (o mid-match).
2. A recarga `/online` (F5).
3. A vuelve al mismo lobby o match con `active_slot`/`turn_seq` correctos; puede completar turno cuando le toque.
4. Unmount/navegación sin botón Salir no borra membership.

### 3. Fin + ranking

1. Un jugador cruza meta → VictoryModal en ese cliente.
2. El otro ve el mismo ranking (nombres + strokes) sin haber cruzado localmente.
3. «Salir al lobby» → leave_room + entry limpio.

### 4. Spoof launch (validación server)

1. En DevTools, intentar `submit_room_launch` como jugador no activo (o Broadcast launch falsificado).
2. RPC debe fallar con «not active player»; el turno/DB no avanza por el spoof.
3. Jugador activo: aim → soltar → impulso solo tras RPC OK; remoto ve réplica Broadcast.

---

## Cierre (post-APPROVED)

> Fecha: 2026-07-19  
> Review: `progress/review_F03-E.md` — **APPROVED**.

- `feature_list.json`: F03-E `"status": "done"`; `completed.f03_online` = `["F03-A","F03-B","F03-C","F03-D","F03-E"]`; description → F03 online completo; siguiente elegible F07.
- Checkboxes § F03 en `specs/feature_list.md` (L69–76): todos `[x]`.
- Bitácora: append F03-E + nota **feature F03 completa** en `progress/history.md`.
- `progress/current.md`: plantilla vacía → siguiente elegible **F07**.
- Sin código nuevo de feature en este cierre.
