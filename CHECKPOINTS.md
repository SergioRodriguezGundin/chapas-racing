# CHECKPOINTS — Evaluación del estado final

> Sistemas multi-agente: no se evalúa camino, se evalúa destino.
> Checkpoints objetivos para juez (humano o IA): ¿proyecto sano?

## C1 — Arnés completo

- [ ] Archivos base existen: `CLAUDE.md`, `feature_list.md`, `progress/current.md`.
- [ ] Agentes existen: `.claude/agents/leader.md`, `implementer.md`, `reviewer.md`.
- [ ] Docs existen: `docs/architecture.md`, `docs/conventions.md`, `docs/verification.md`.
- [ ] Spec de iteración en curso existe en `specs/`.
- [ ] `pnpm tsc --noEmit` exit code 0.

## C2 — Estado coherente

- [ ] Como mucho UNA tarea activa en `progress/current.md`.
- [ ] `progress/current.md` vacío o describe sesión activa. Cero basura de sesiones anteriores.
- [ ] Toda feature con checkboxes marcados en `feature_list.md` tiene `progress/impl_*.md` + `progress/review_*.md` con veredicto APPROVED.
- [ ] Ningún `review_*.md` con CHANGES_REQUESTED sin impl posterior que lo resuelva.

## C3 — Código respeta arquitectura

- [ ] `src/` solo contiene capas previstas: `app/`, `core/`, `features/`, `stores/`, `config/`, `ui/`.
- [ ] `package.json` sin deps fuera del stack cerrado (next, react, react-dom, three, fiber, drei, rapier, zustand + devDeps tipos/TS/vitest).
- [ ] Cero números mágicos de tuning inline: grep de valores en `features/` -> deben venir de `config/physics.ts`.
- [ ] Cero `any` (`grep -rn ": any\|as any" src/` vacío).
- [ ] Cero `console.log` sueltos (`console.debug` gated permitido).
- [ ] Cero TODOs sin contexto.

## C4 — Verificación real

- [ ] `pnpm tsc --noEmit` verde.
- [ ] `pnpm build` verde.
- [ ] Si vitest en repo: `pnpm vitest run` > 0 tests, todos verdes. Lógica pura nueva (geometría, stores, validación) cubierta.
- [ ] Cero mocks de rapier/Three en tests.
- [ ] Todo `progress/impl_*.md` incluye sección "Verificación manual" con pasos acción + resultado observable.

## C5 — Sesión cerrada bien

- [ ] Sin archivos sospechosos fuera de `.gitignore` (`.next/`, `node_modules/`, `*.tsbuildinfo`, `*.tmp`).
- [ ] `progress/history.md` con entrada de última sesión.
- [ ] Última tarea trabajada en estado correcto: done (checkboxes + review APPROVED) o `blocked` documentado en `progress/current.md`.

---

**Uso:** reviewer (`.claude/agents/reviewer.md`) recorre cada checkbox, marca `[x]`/`[ ]`, rechaza cierre de sesión si quedan vacíos en C1–C5.