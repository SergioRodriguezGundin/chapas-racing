# Research: Sensor de línea de meta en @react-three/rapier

> Tema: API EXACTA para un SENSOR (línea de meta) que dispara una acción al cruzarlo un RigidBody dinámico (la chapa).
> Fuente primaria: **tipos instalados** (`.d.ts`). Prioridad sobre docs online.

## Versión instalada (confirmada)

`node_modules/@react-three/rapier/package.json`:

```
"@react-three/rapier": "2.2.0"
```

Dependencias relevantes fijadas por esa versión:
- `@dimforge/rapier3d-compat`: `0.19.2`
- peer `@react-three/fiber`: `^9.0.4`, `react`: `^19`, `three`: `>=0.159.0`

Coincide con lo esperado (2.2.0).

Ficheros `.d.ts` inspeccionados:
- `dist/declarations/src/types.d.ts` (tipos de payload, `ColliderOptions`, `RigidBodyOptions`)
- `dist/declarations/src/components/AnyCollider.d.ts` (`CuboidCollider`, `ColliderProps`)
- `dist/declarations/src/components/RigidBody.d.ts` (`RigidBodyProps`)

---

## 1. ¿`sensor` en `<CuboidCollider>` o en `<RigidBody>`? ¿Ambos?

**Ambos son válidos.** La prop `sensor?: boolean` está declarada en `ColliderOptions`, y `RigidBodyOptions` extiende de ella, por lo que se hereda a `<RigidBody>` (y desde ahí a sus auto-colliders).

`types.d.ts` (líneas 204-207), dentro de `interface ColliderOptions<ColliderArgs>`:

```ts
/**
 * Sets whether or not this collider is a sensor.
 */
sensor?: boolean;
```

`types.d.ts` (línea 247):

```ts
export interface RigidBodyOptions extends Omit<ColliderProps, "ref"> {
```

Y `ColliderProps extends ColliderOptions<any>` (`AnyCollider.d.ts` línea 4), por lo que `RigidBody` hereda `sensor`, `onIntersectionEnter`, etc.

**Recomendación:** marcar `sensor` en el **`<CuboidCollider>` explícito** (el que define la geometría de la línea de meta). Es lo más granular y evita ambigüedad. Poner `sensor` en `<RigidBody>` solo afecta a colliders auto-generados; si declaras un collider hijo explícito, marca la prop en el collider.

---

## 2. Evento de intersección: nombre, dónde va, y firma del callback

**Nombre del handler:** `onIntersectionEnter` (existe también `onIntersectionExit`).

**Dónde va:** en `ColliderOptions`, luego puede ir tanto en el `<CuboidCollider>` como en el `<RigidBody>` (herencia). **Recomendado: en el mismo `<CuboidCollider sensor>`** para mantener sensor + handler juntos.

`types.d.ts` (líneas 137-144):

```ts
/**
 * Callback when this collider, or another collider starts intersecting, and at least one of them is a `sensor`.
 */
onIntersectionEnter?: IntersectionEnterHandler;
/**
 * Callback when this, or another collider stops intersecting, and at least one of them is a `sensor`.
 */
onIntersectionExit?: IntersectionExitHandler;
```

**Firma del handler** (`types.d.ts` líneas 234, 244):

```ts
export type IntersectionEnterPayload = CollisionPayload;
export type IntersectionEnterHandler = (payload: IntersectionEnterPayload) => void;
```

**Estructura real del payload** (`types.d.ts` líneas 209-235):

```ts
export type CollisionTarget = {
    rigidBody?: RapierRigidBody;
    collider: RapierCollider;
    rigidBodyObject?: Object3D;
    colliderObject?: Object3D;
};

export type CollisionPayload = {
    /** the object firing the event */
    target: CollisionTarget;
    /** the other object involved in the event */
    other: CollisionTarget;
    /** deprecated use `payload.other.rigidBody` instead */
    rigidBody?: RapierRigidBody;
    /** deprecated use `payload.other.collider` instead */
    collider: RapierCollider;
    /** deprecated use `payload.other.rigidBodyObject` instead */
    rigidBodyObject?: Object3D;
    /** deprecated use `payload.other.colliderObject` instead */
    colliderObject?: Object3D;
};

export type IntersectionEnterPayload = CollisionPayload;
```

Campos reales a usar (NO deprecados):
- `payload.target` → el sensor (quien dispara el evento). `CollisionTarget`.
- `payload.other` → la otra parte (la chapa). `CollisionTarget`.
  - `other.rigidBody?: RapierRigidBody` (rapier body handle)
  - `other.collider: RapierCollider`
  - `other.rigidBodyObject?: THREE.Object3D` (aquí vive `userData`)
  - `other.colliderObject?: THREE.Object3D`

> IMPORTANTE: `IntersectionEnterPayload` **NO** tiene `manifold` ni `flipped`. Esos solo existen en `CollisionEnterPayload` (`types.d.ts` líneas 229-232). En intersecciones de sensor no hay contacto físico, así que no hay manifold.

Los campos top-level `payload.rigidBody`, `payload.collider`, etc. están marcados **deprecated** en los tipos → usar siempre `payload.other.*`.

---

## 3. Identificar que `other` es la chapa

Vías posibles (de más simple a más robusta):

**(A) Única chapa dinámica — la más simple (VÁLIDA en esta iteración):**
Si en el mundo solo hay UN RigidBody dinámico (la chapa) y el sensor es `fixed`, cualquier `onIntersectionEnter` del sensor ya implica "la chapa cruzó". No hace falta comparar nada. Es lo recomendado ahora por simplicidad.

**(B) Comparación por referencia de RigidBody (robusta, barata):**
Mantener un `ref` a la chapa y comparar contra `payload.other.rigidBody`:

```ts
if (payload.other.rigidBody === capRef.current) { /* meta */ }
```

`capRef` es `RefObject<RapierRigidBody>` (el ref que devuelve `<RigidBody ref={capRef}>`).

**(C) Por `userData` (robusta y auto-descriptiva, escala a varios bodies):**
`RigidBodyOptions` acepta `userData` (`types.d.ts` líneas 379-382):

```ts
/** Passed down to the object3d representing this collider. */
userData?: ThreeElements["object3D"]["userData"];
```

Se lee en el handler vía el Object3D:

```ts
if (payload.other.rigidBodyObject?.userData?.type === "cap") { /* meta */ }
```

`name` (`ColliderOptions.name`, líneas 78-82) se aplica al `Object3D` del collider; se leería como `payload.other.colliderObject?.name`. Menos idiomático que `userData`.

**Recomendación dado que solo hay UNA chapa:** usar (A) como base, y añadir el guard (C) por `userData.type === "cap"` como red de seguridad barata y a prueba de futuro (si mañana entra otro dynamic body, no rompe). No cuesta nada y documenta intención.

---

## 4. ¿Sensor y chapa bajo el mismo `<Physics>`?

**Sí, obligatorio.** Los eventos de colisión/intersección se resuelven dentro del `World` de rapier que crea cada `<Physics>`. Dos árboles `<Physics>` distintos = dos mundos independientes, sin detección de intersección entre ellos. Sensor (`<RigidBody type="fixed">` con `<CuboidCollider sensor>`) y chapa (`<RigidBody type="dynamic">`) deben colgar del **mismo** `<Physics>`.

---

## 5. Gotcha: re-disparo tras teleport con `setTranslation` (features 6/7)

Relevante para reinicios / respawn de la chapa mediante `capRef.current.setTranslation(pos, true)`:

- `onIntersectionEnter` se dispara en la **transición** no-intersectando → intersectando. `onIntersectionExit` en la inversa.
- Si tras cruzar la meta teletransportas la chapa **de vuelta antes** de que rapier registre el `Exit` (o la dejas solapando el sensor), el motor puede no emitir `Exit`, y el siguiente cruce real puede **no** volver a emitir `Enter` (el par sigue considerado "intersectando"). Riesgo de meta que no re-dispara.
- Mitigaciones:
  - Respawnear/teleportar la chapa a una posición **claramente fuera** del volumen del sensor, garantizando un `Exit` limpio antes del próximo `Enter`.
  - No colocar la línea de salida solapando el sensor de meta.
  - Guardar un flag de estado (p.ej. `hasFinished` en el store) y desarmarlo explícitamente en el reset, en lugar de depender solo del par Enter/Exit del motor.
  - Tras `setTranslation` de un dynamic body, considerar resetear velocidades (`setLinvel`/`setAngvel` a 0) para evitar que arrastre estado de movimiento al nuevo punto.

---

## SNIPPET MÍNIMO DE REFERENCIA (JSX)

> Referencia de API; NO se ha tocado `src/`. Constantes reales irían a `config/physics.ts`.

```tsx
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import type { IntersectionEnterPayload } from "@react-three/rapier";

function FinishLineSensor({ onCross }: { onCross: () => void }) {
  const handleEnter = (payload: IntersectionEnterPayload) => {
    // Guard robusto por userData (opcional dado que solo hay 1 chapa dinámica).
    // Con una sola chapa, bastaría con llamar onCross() directamente.
    if (payload.other.rigidBodyObject?.userData?.type === "cap") {
      onCross();
    }
  };

  return (
    <RigidBody type="fixed" colliders={false}>
      {/* args = half-extents [hx, hy, hz]; volumen fino y alto que cruza la pista */}
      <CuboidCollider
        args={[2, 1, 0.05]}
        sensor
        onIntersectionEnter={handleEnter}
      />
    </RigidBody>
  );
}

// La chapa (único dynamic body), en el MISMO <Physics>:
// <RigidBody type="dynamic" userData={{ type: "cap" }} ref={capRef}> ... </RigidBody>
```

Notas del snippet:
- `colliders={false}` en el `<RigidBody>` para no auto-generar un collider además del `<CuboidCollider>` explícito.
- `sensor` va en el `<CuboidCollider>` (granular, junto al handler).
- El guard por `userData.type === "cap"` es opcional en esta iteración (una sola chapa) pero recomendado como red de seguridad.
- Payload usa campos NO deprecados: `payload.other.rigidBody` / `payload.other.rigidBodyObject`.
