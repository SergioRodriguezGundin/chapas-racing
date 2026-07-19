# F03-A — Spike: transporte Realtime + estrategia de sync

> Fecha: 2026-07-18  
> Contexto: `chapas-racing` — F02 Auth/perfil ya en stack (`@supabase/supabase-js`, `@supabase/ssr`); hot-seat local en `gameStore`; stub `/online`.  
> Alcance: research + decisión. **Sin implementación** de salas/partida ni PoC en `src/`.  
> Spec: `specs/feature_list.md` § F03; AC en `feature_list.json` → F03-A.

---

## Resumen ejecutivo

| Pregunta | Decisión |
|----------|----------|
| Transporte | **Supabase Realtime channels** (Broadcast + Presence + `postgres_changes`). Cero deps nuevas. |
| Sync | **Validar** modelo recomendado: replicar input `{direction, power}` + **snapshot de posiciones al `settle()`** como corrección. |
| Autoridad (MVP) | Postgres = estado durable (sala/turno/ranking); Broadcast = eventos de jugada; **validación server-side de launch en F03-E** (RPC/Edge), no solo gate cliente. |
| ¿Blocked por deps? | **No.** |

---

## 1. Decisión de transporte (Realtime vs WS dedicado)

### Decisión: Supabase Realtime (incluido en `@supabase/supabase-js`)

El cliente ya existe (`src/lib/supabase/client.ts` → `createBrowserClient`). Realtime viaja por el mismo WebSocket del SDK; **no hace falta** `socket.io`, `ws`, ni servidor Node propio.

### Tres primitives y encaje F03

| Primitive | Uso en F03 | Por qué |
|-----------|------------|---------|
| **Presence** | Lobby (F03-C): quién está conectado, join/leave en vivo | Ephemeral; `track` / sync / leave; ideal para “jugadores conectados” sin spamear filas |
| **Broadcast** | Match (F03-D): `launch`, `settle`, señales de turno | Mensajes efímeros bajo demanda; latencia baja; payload pequeño turno-based |
| **postgres_changes** | Sala/partida durable (F03-B→E): create/join/start/end, roster, `active_player`, status | Fuente de verdad persistente + RLS; reconexión recupera estado leyendo tablas |

### Por qué no WS dedicado en F03

- Turn-based (no 60 Hz state stream): el cuello no es RTT de socket custom.
- Auth/JWT y RLS ya resueltos con el stack F02; canales privados + `realtime.messages` RLS encajan.
- Servidor WS propio = **nueva dep + infra** → `blocked` por `docs/architecture.md` § Principio 2, sin beneficio claro en MVP.

### Cuándo sí haría falta WS propio (→ `blocked` + discusión)

Revisar solo si aparece alguno de estos requisitos (fuera de F03 MVP):

1. **Simulación autoritativa server-side** (Rapier/Node o servidor de juego) — Realtime no simula física.
2. Matchmaking/lobbies globales a escala con lógica que no encaje en Postgres + Edge.
3. Requisitos de latencia/throughput de juego en tiempo real continuo (no turnos), o replay binario custom.
4. Necesidad de protocolo fuera del ecosistema Supabase (p.ej. P2P WebRTC mesh).

Hasta entonces: **Realtime**.

### Auth en canales

- Partidas online bajo `(protected)/online` (ya stub); sesión vía cookies/`@supabase/ssr` (ver `progress/research_supabase_auth.md`).
- Canales de partida: `config: { private: true }` + `supabase.realtime.setAuth()` antes de `subscribe`.
- RLS en `realtime.messages` filtrando por membresía de sala (`realtime.topic()` ↔ `room_id` / topic). Docs: [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization).
- Desactivar “Allow public access” en Realtime Settings del proyecto cuando se activen canales privados.

---

## 2. Estrategia de sync (validación del modelo recomendado)

### Contexto local (repo)

- Turno: `idle → aiming → moving → idle` en `src/stores/gameStore.ts`.
- Input: `aim.direction` (Vec3 unitario XZ) + `aim.power` (0..1); impulso en `useLaunch` = `direction * power * LAUNCH.maxImpulse` (`config/physics.ts`, `maxImpulse: 12`).
- `launch(from)`: fase `moving`, incrementa `strokes`, guarda `lastPosition` del activo.
- `settle()`: fase `idle`, rota `activePlayerIndex` — **no** persiste posiciones finales de física hoy; la posición vive en el `RigidBody` Rapier (`Cap.tsx`).
- Parada: `STOP_DETECTION` (umbral velocidad + N frames) en la chapa activa; colisiones pueden mover otras chapas.

### ¿Rapier es determinista entre clientes?

**No de forma fiable.** Mismos impulsos en dos browsers (WASM, dt/frame pacing, orden de contactos, floating point) pueden divergir tras unos segundos de simulación. Por tanto:

- **Solo input replication sin corrección** → riesgo alto de desync visual y de ranking (meta cruzada en un cliente y no en otro).
- **Solo snapshots continuos** → overkill turno-based, más ancho de banda, peor UX de “replay” del tiro.

### Modelo elegido (confirma spec § F03)

```
Cliente activo:  aim local → broadcast launch{direction, power, from?}
Todos:           applyImpulse idéntico → simulan en local (moving)
Cliente activo:  detecta stop → broadcast settle{positions[], nextTurn, strokes?}
Todos:           teleport/correción a snapshot → settle() local (rota turno)
```

| Fase | Qué se sincroniza | Quién emite |
|------|-------------------|-------------|
| Aim (opcional) | No obligatorio en MVP; aim local del activo basta | — |
| Launch | `{ direction, power }` (+ `from` opcional para alinear origen) | Jugador activo |
| Moving | Nada (cada cliente simula) | — |
| Settle | Posiciones **de todas las chapas** + índice turno / strokes | Jugador activo (MVP); host fallback si timeout |
| Start / End / Disconnect | Estado durable + eventos | Host / server / Presence leave |

### Alternativas y trade-offs

| Estrategia | Pros | Contras | Veredicto F03 |
|------------|------|---------|---------------|
| **A. Input + settle snapshot** (elegida) | Simple; reutiliza física local; payloads minúsculos; corrige divergencia al fin de turno | Durante `moving` puede haber desfase visual breve; activo puede mentir en snapshot (mitigar en F03-E) | **MVP** |
| B. Solo input, sin snapshot | Implementación mínima | Desync acumulativo; meta/ranking inconsistente | Rechazada |
| C. Host autoritativo emite posiciones cada N frames | Consistencia fuerte mid-shot | Más mensajes; host lag = jank; más complejidad | Post-MVP si hace falta |
| D. Servidor simula física | Autoridad real anti-cheat | Nueva infra/deps; Rapier en server; **blocked** | Fuera de alcance |
| E. Solo `postgres_changes` para cada launch/settle | Persistencia + audit | Latencia/roundtrip DB por evento; peor feel | Solo estado durable, no el impulso en caliente |

### Detalle de corrección al settle

Hoy `settle()` no lee traslaciones Rapier. En F03-D hará falta un puente (patrón tipo `resetRequestId`):

1. Activo lee `translation()` de todos los `RigidBody`.
2. Broadcast `settle` con `positions: Vec3[]` (orden = roster).
3. Todos aplican teleport (como `Cap.tsx` `teleport`) y luego `gameStore.settle()` / sync de `activePlayerIndex` desde payload o desde fila Postgres.

Incluir **todas** las chapas: un tiro puede empujar rivales.

### Quién es autoritativo

| Dato | Autoridad MVP | Notas |
|------|---------------|-------|
| Roster, código, pista, status lobby/playing/finished | **Postgres** (host crea/inicia) | RLS F03-B |
| Jugador activo / orden de turnos | **Postgres** (actualizado en settle validado o RPC) | Broadcast puede adelantar UI; DB gana en reconexión |
| Impulso launch | Emisor = activo; **validación** = RPC/Edge F03-E | Broadcast solo no basta (spoof) |
| Posiciones settle | Emisor = activo (o host si skip) | Confianza MVP; host override opcional después |
| Ranking / winner | **Postgres** + evento `end` | Misma fuente para VictoryModal |

---

## 3. Contrato tentativo de eventos / mensajes

Convención de canal: `room:{roomId}` (privado).  
Envelope común (Broadcast):

```ts
type RoomEvent =
  | { v: 1; type: "launch"; payload: LaunchPayload }
  | { v: 1; type: "settle"; payload: SettlePayload }
  | { v: 1; type: "disconnect_signal"; payload: DisconnectPayload }
  // create/join/start/end preferentemente vía Postgres + postgres_changes;
  // Broadcast opcional como hint de UI inmediata
```

### Durables (Postgres → `postgres_changes` / lectura inicial)

| Evento lógico | Acción | Campos mínimos |
|---------------|--------|----------------|
| **create** | INSERT `rooms` | `room_id`, `code` (corto único), `track_id`, `max_players` (2–4), `host_id`, `status: lobby` |
| **join** | INSERT `room_members` | `room_id`, `user_id`, `slot_index`, `display_name`, `cap_color` (denormalizados o join a `profiles`) |
| **start** | UPDATE `rooms` | `status: playing`, `started_at`, `turn_order: uuid[]` o por `slot_index`, `active_slot` / `active_user_id`, seed posiciones iniciales |
| **end** | UPDATE `rooms` | `status: finished`, `winner_user_id` / ranking `{ user_id, strokes }[]`, `finished_at` |
| **disconnect** (persistido) | UPDATE member | `connected: false` o `last_seen_at`; Presence cubre el live |

### Ephemeral (Broadcast)

| Evento | Cuándo | Payload mínimo |
|--------|--------|----------------|
| **launch** | Activo suelta tiro válido | `user_id`, `slot_index`, `direction: [x,y,z]`, `power: number`, `from?: [x,y,z]`, `turn_seq: number` (anti-replay) |
| **settle** | Activo confirma parada | `user_id`, `turn_seq`, `positions: [x,y,z][]` (len = N jugadores), `strokes?: number[]`, `next_active_slot: number`, `finished?: { user_id }` si cruzó meta este turno |
| **disconnect_signal** | Opcional, además de Presence leave | `user_id`, `reason?: "leave" \| "timeout"` |

### Presence (lobby / conectados)

```ts
// track payload
{ user_id: string; slot_index: number; display_name: string; cap_color: string }
```

- `sync` / `join` / `leave` → UI lobby (F03-C).
- No sustituye `room_members` (reconexión y capacidad siguen en DB).

### Reglas de secuencia

1. `turn_seq` monotónico por sala; clientes ignoran launch/settle con seq ≠ esperado.
2. Solo el `active_user_id` de DB puede emitir `launch` (enforce server F03-E).
3. Tras `settle`, clientes alinean store + física; si hay `finished`, host/servidor escribe `end`.
4. Skip por desconexión (F03-E): timeout en `config/` → host o RPC avanza turno sin launch.

---

## 4. Notas para schema F03-B (sin migración aquí)

Tablas mínimas sugeridas (nombres orientativos):

### `rooms`

| Campo | Tipo / notas |
|-------|----------------|
| `id` | `uuid` PK |
| `code` | `text` único, corto (p.ej. 6 chars alfanuméricos), colisión → retry |
| `track_id` | `text` — id del JSON de pista (`circuit-01`, etc.; hoy `getCurrentTrack()` es single-track) |
| `host_id` | `uuid` → `auth.users` / `profiles` |
| `max_players` | `int` check 2–4 |
| `status` | enum: `lobby` \| `playing` \| `finished` |
| `active_slot` | `int` nullable (solo en `playing`) |
| `turn_seq` | `int` default 0 |
| `turn_order` | `uuid[]` o derivar de `room_members.slot_index` |
| `winner_id` | `uuid` nullable |
| `created_at` / `started_at` / `finished_at` | timestamptz |

Opcional MVP+ : `positions jsonb` último snapshot (ayuda reconexión mid-match sin esperar Broadcast).

### `room_members`

| Campo | Tipo / notas |
|-------|----------------|
| `room_id` | FK → rooms |
| `user_id` | FK → profiles |
| `slot_index` | `int` unique per room |
| `is_host` | bool o inferir de `rooms.host_id` |
| `strokes` | int default 0 (durante partida) |
| `connected` | bool / `last_seen_at` |
| PK | `(room_id, user_id)` |

Constraint: count(members) ≤ `max_players` (trigger o check en RPC join).

### RLS (orientación)

- SELECT room/members: solo miembros (o código join vía RPC `security definer` que inserta membership).
- INSERT room: authenticated; host = `auth.uid()`.
- JOIN: RPC `join_room(code)` valida capacidad/status lobby.
- UPDATE start/end/active_slot: solo host o RPC de settle/skip.
- Realtime: policies en `realtime.messages` con `exists` membership + `realtime.topic() = 'room:' || room_id`.

### Relación con `profiles`

Reutilizar `display_name`, `cap_color` (migración F02-C). No duplicar avatar en member salvo cache de lobby.

### Fuera de F03-B

- Tabla `turns` / log de launches: útil para audit y F03-E; no bloquea lobby.
- Edge Functions: preferible en F03-E para `submit_launch` / `submit_settle`.

---

## 5. Riesgos y open questions

### Riesgos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Divergencia física mid-shot | Media (UX) | Snapshot al settle; no decidir victoria solo en cliente remoto sin confirmación |
| Activo miente en settle / launch spoof | Alta (fairness) | F03-E: RPC valida activo + `turn_seq`; opcional host ack |
| Latencia launch→réplica | Baja (turno-based) | Aceptable ~50–200 ms; no stream 60 Hz |
| Payload size | Muy baja | launch ~100 B; settle 4×Vec3 ≪ 1 KB (Realtime aguanta benchmarks 1–50 KB) |
| JWT expire mid-match | Media | Refresh sesión F02; `setAuth` / reconnect channel |
| Presence ≠ membership | Media | Leave Presence no borra member; timeout skip turno (F03-E) |
| Race settle vs meta (`playerFinished`) | Media | Incluir flag `finished` en settle o escribir winner en misma RPC |
| Single track hoy | Baja | `track_id` en room prepara multi-pista; F03-C selecciona aunque solo exista una |

### Open questions (resolver en F03-B/D/E, no bloquean esta spike)

1. ¿Host debe **ack** cada settle, o basta confianza en el activo hasta F03-E?
2. ¿Persistir último `positions jsonb` en `rooms` para reconexión mid-`moving`?
3. ¿Aim preview se replica? (recomendación: no en MVP).
4. Timeout exacto de skip y constantes → `config/` (nombre sugerido `config/online.ts` o sección en `physics.ts` — decidir en F03-E).
5. Código de sala: longitud/charset y RPC vs unique index retry.

---

## 6. Recomendación: ¿blocked por deps nuevas?

**No.**

- Transporte: Realtime ya en `@supabase/supabase-js` (^2.110.2 en `package.json`).
- Persistencia/Auth: mismo Supabase + RLS que F02.
- No añadir `socket.io`, `ws`, Colyseus, ni servidor de física sin nuevo spike + acuerdo.

PoC en `src/`: **no realizado** (decisión desbloqueada con docs + lectura de código). Si en F03-C se prototipa un canal, debe vivir en el flujo real `/online`, no como archivo huérfano.

---

## 7. Mapa a subtareas F03

| Subtarea | Consume de este doc |
|----------|---------------------|
| F03-B | Schema `rooms` / `room_members`, RLS, códigos; topics Realtime |
| F03-C | Presence + create/join + `postgres_changes` lobby; reemplazar stub `/online` |
| F03-D | Broadcast launch/settle + puente física/`gameStore` |
| F03-E | Timeout disconnect, reconexión desde DB, RPC validación launch, end/ranking |

---

## 8. Referencias

### Docs externas

- [Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization) — canales privados, RLS `realtime.messages`, Presence + Broadcast.
- [Realtime Presence](https://supabase.com/docs/guides/realtime/presence) — `track` / sync / leave.
- [Realtime Settings](https://supabase.com/docs/guides/realtime/settings) — límites (payload KB, clients, events/s), public vs private.
- [Broadcast](https://supabase.com/docs/guides/realtime/broadcast) — mensajería efímera entre clientes.
- Research Auth previa: `progress/research_supabase_auth.md`.

### Código del repo

- Stack Supabase: `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`.
- Turnos locales: `src/stores/gameStore.ts` (`launch`, `settle`, `activePlayerIndex`, `Player`, `AimState`).
- Impulso: `src/features/launch/useLaunch.ts` + `src/config/physics.ts` (`LAUNCH`, `STOP_DETECTION`).
- Física / settle local: `src/features/cap/Cap.tsx` (`teleport`, detección parada).
- Stub online: `src/app/(protected)/online/page.tsx`.
- Perfiles: `supabase/migrations/20260712100000_profiles.sql` (`display_name`, `cap_color`).
- Arquitectura / cero deps: `docs/architecture.md`.
- Spec F03: `specs/feature_list.md` L63–78; AC F03-A: `feature_list.json`.

---

## Checklist aceptación F03-A

- [x] Decisión transporte (Realtime vs WS) + justificación
- [x] Estrategia sync documentada (input + settle snapshot) + alternativas
- [x] Contrato tentativo create/join/start/launch/settle/disconnect/end
- [x] Deps nuevas: **no** → no `blocked`
- [x] Sin PoC muerto en `src/`
- [ ] **No** marcar F03-A `done` en `feature_list.json` (lo hace el flujo leader/implementer tras review)
