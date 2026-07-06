# AGENTS.md — Mapa de navegación para agentes de IA

> Punto de entrada para CUALQUIER agente en este repo. No es biblia: es **mapa**.
> Divulgación progresiva: lee solo lo que necesites cuando lo necesites.
> Repo: `chapas-racing` — Next 15, React 19, @react-three/fiber 9, @react-three/rapier 2, zustand 5, **pnpm**.

---

## 1. Antes de empezar (obligatorio)

1. `pnpm install && pnpm tsc --noEmit` -> sin errores. Falla -> **para**, resuelve entorno antes de tocar código.
2. Lee `progress/current.md` -> estado de última sesión.
3. Identifica tu tarea: asignada por líder (referencia a spec) o, si trabajas solo, elige UNA feature de `feature_list.md` (ver §4). Nunca más de una.

## 2. Mapa del repositorio

| Archivo / carpeta | Contiene | Cuándo leer |
|---|---|---|
| `CLAUDE.md` | Modos de trabajo (ligero/harness) para Claude Code | Si eres Claude Code |
| `feature_list.md` | Roadmap F01–F12: descripción + criterios aceptación + dependencias | Siempre, al empezar |
| `specs/*.md` | Spec detallada de iteración en curso | Si tu tarea la referencia |
| `progress/current.md` | Estado de sesión actual | Siempre, al empezar |
| `progress/history.md` | Bitácora append-only | Si necesitas contexto histórico |
| `progress/impl_*.md`, `review_*.md`, `research_*.md` | Informes de subagentes | Si continúas trabajo previo |
| `docs/architecture.md` | Qué significa "buen trabajo": capas, principios, anti-patrones | Antes de implementar |
| `docs/conventions.md` | Estilo, nombres, patrones repo | Antes de escribir código |
| `docs/verification.md` | Niveles de evidencia para declarar `done` | Antes de cerrar tarea |
| `CHECKPOINTS.md` | Criterios objetivos de estado final sano | Auto-evaluación / cierre |
| `.claude/agents/` | Subagentes: leader, implementer, reviewer | Si orquestas trabajo |
| `src/config/` | Constantes física/gameplay — único punto tuning | Al tocar comportamiento |
| `src/stores/` | Estado dominio (zustand) | Al tocar lógica de juego |
| `src/features/` | Mecánicas: `cap/`, `launch/`, `track/` | Para implementar |
| `src/core/`, `src/ui/`, `src/app/` | Escena, HUD DOM, infra Next | Según tarea |

## 3. Reglas duras (no negociables)

- **Una feature/tarea a la vez.** Cero mezcla de cambios en misma sesión.
- **Nada `done` sin verificación verde**: `pnpm tsc --noEmit && pnpm build` (+ `pnpm vitest run` si existe).
- **Documenta MIENTRAS trabajas** en `progress/current.md`, no al final.
- **Repo limpio antes de cerrar** (§5).
- **Duda -> `docs/`** antes de inventar.
- **Cero deps nuevas** sin discusión (`blocked`).
- **pnpm siempre.** Nunca npm/yarn.

## 4. Cómo elegir tarea (solo si trabajas sin líder)

```
1. Abre feature_list.md
2. Descarta features con checkboxes completos o dependencias incumplidas (ver grafo al final del archivo)
3. Coge la primera elegible en orden sugerido
4. Anota en progress/current.md: feature, plan breve (3-5 bullets)
```

Líder te asignó tarea -> saltas esto: su referencia (spec/feature) manda.

## 5. Cierre de sesión (lifecycle)

1. `pnpm tsc --noEmit && pnpm build` — verde.
2. Tarea acabada + review APPROVED -> marca checkboxes en `feature_list.md`.
3. Resumen de `progress/current.md` -> append a `progress/history.md`.
4. Vacía `progress/current.md` (solo plantilla).
5. Cero temporales, cero `console.log` debug, cero TODOs sin contexto.

## 6. Si te bloqueas

- Relee sección relevante de `docs/`.
- Herramienta no hace lo esperado -> **NO inventes workaround**: documenta bloqueo en `progress/current.md` estado `blocked`, para sesión.