"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useLaunch } from "@/features/launch/useLaunch";
import { AimIndicator } from "@/features/launch/AimIndicator";
import { getCurrentTrack } from "@/features/track/track.types";
import { useGameStore } from "@/stores/gameStore";
import { OUT_OF_TRACK_Y, PHYSICS, STOP_DETECTION } from "@/config/physics";

/**
 * Reposiciona el body en una posición dando velocidades/rotación a cero.
 * El +0.2 en Y evita que la chapa reaparezca clipada dentro del suelo.
 */
function teleport(
  body: RapierRigidBody,
  [x, y, z]: [number, number, number]
) {
  body.setTranslation({ x, y: y + 0.2, z }, true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
}

/**
 * Chapa: cilindro plano sin modelado (iter 1).
 * - RigidBody dynamic, impulso lo aplica useLaunch
 * - Detección de parada: velocidad < umbral N frames -> settle()
 * - Reset fuera de pista (y < OUT_OF_TRACK_Y) y por restart (resetRequestId)
 * - Mesh invisible mayor -> hit-area cómoda en táctil
 */
export function Cap() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const stillFrames = useRef(0);
  // Detecta el teleport de restart comparando el contador del store frame a frame,
  // desacoplando el DOM del Canvas sin refs cruzadas ni suscripciones.
  const lastResetId = useRef(useGameStore.getState().resetRequestId);
  const { onPointerDown } = useLaunch(bodyRef);
  const { capStart } = getCurrentTrack();

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    // Restart: teleport a capStart en el frame siguiente al incremento.
    const rid = useGameStore.getState().resetRequestId;
    if (rid !== lastResetId.current) {
      lastResetId.current = rid;
      stillFrames.current = 0;
      teleport(body, getCurrentTrack().capStart);
    }

    // Caída fuera de pista: fuera del guard de phase porque la chapa puede caer
    // estando 'idle' (p.ej. tras un teleport al borde), no solo en 'moving'.
    if (body.translation().y < OUT_OF_TRACK_Y) {
      teleport(body, useGameStore.getState().lastPosition);
      useGameStore.getState().settle();
      return;
    }

    if (useGameStore.getState().phase !== "moving") return;

    const v = body.linvel();
    const speed = Math.hypot(v.x, v.y, v.z);

    if (speed < STOP_DETECTION.velocityThreshold) {
      stillFrames.current += 1;
      if (stillFrames.current >= STOP_DETECTION.framesRequired) {
        stillFrames.current = 0;
        useGameStore.getState().settle();
      }
    } else {
      stillFrames.current = 0;
    }
  });

  return (
    <>
      <RigidBody
        ref={bodyRef}
        position={capStart}
        userData={{ type: "cap" }}
        colliders={false}
        linearDamping={PHYSICS.linearDamping}
        angularDamping={PHYSICS.angularDamping}
        friction={PHYSICS.friction}
        restitution={PHYSICS.restitution}
        ccd
      >
        <CylinderCollider
          args={[PHYSICS.capHeight / 2, PHYSICS.capRadius]}
          density={PHYSICS.capDensity}
        />
        {/* Mesh visible */}
        <mesh onPointerDown={onPointerDown} castShadow>
          <cylinderGeometry
            args={[PHYSICS.capRadius, PHYSICS.capRadius, PHYSICS.capHeight, 32]}
          />
          <meshStandardMaterial color="#e63946" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* Hit-area invisible x2 para dedos. Sin collider: colliders={false} */}
        <mesh onPointerDown={onPointerDown} visible={false}>
          <cylinderGeometry
            args={[PHYSICS.capRadius * 2, PHYSICS.capRadius * 2, PHYSICS.capHeight * 4, 12]}
          />
        </mesh>
      </RigidBody>

      <AimIndicator bodyRef={bodyRef} />
    </>
  );
}
