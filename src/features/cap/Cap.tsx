"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useLaunch } from "@/features/launch/useLaunch";
import { AimIndicator } from "@/features/launch/AimIndicator";
import { getCurrentTrack } from "@/features/track/track.types";
import { useGameStore } from "@/stores/gameStore";
import { PHYSICS, STOP_DETECTION } from "@/config/physics";

/**
 * Chapa: cilindro plano sin modelado (iter 1).
 * - RigidBody dynamic, impulso lo aplica useLaunch
 * - Detección de parada: velocidad < umbral N frames -> settle()
 * - Mesh invisible mayor -> hit-area cómoda en táctil
 */
export function Cap() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const stillFrames = useRef(0);
  const { onPointerDown } = useLaunch(bodyRef);
  const { capStart } = getCurrentTrack();

  useFrame(() => {
    if (useGameStore.getState().phase !== "moving") return;
    const body = bodyRef.current;
    if (!body) return;

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
