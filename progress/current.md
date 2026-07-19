# Estado actual

**Feature:** F03.5 — Hub Local / Online post-auth
**Modo:** —
**Subtarea:** _(sin implementar; tareas en feature_list.json)_

## Flujo objetivo

```
auth (login | sesión | Saltar)
  → mode (Jugar en local | Jugar online)
      → local:  setup (nº / nombre / color) → match hot-seat
      → online: crear sala | unirse por código → lobby → match (F03)
```

## Subtareas

1. **F03.5-A** — `appStage: 'mode'` + pantalla de elección
2. **F03.5-B** — Rama local → SetupScreen existente
3. **F03.5-C** — Rama online → reutilizar OnlineLobby en hub `/`

## Notas

- F03 A–E completado (sync/salas). F03.5 es UX de entrada.
- Invitado: solo local; online exige sesión.
- Siguiente tras F03.5 (roadmap): F07 leaderboards.
