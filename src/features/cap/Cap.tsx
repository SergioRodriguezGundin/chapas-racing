"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useLaunch } from "@/features/launch/useLaunch";
import { AimIndicator } from "@/features/launch/AimIndicator";
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

interface CapProps {
  playerIndex: number;
}

/**
 * Chapa de un jugador: cilindro plano sin modelado.
 * - Input solo si playerIndex === activePlayerIndex
 * - Detección de parada solo en la chapa activa -> settle() rota turno
 * - Fuera de pista: cada chapa a SU lastPosition; solo la activa además settle()
 */
export function Cap({ playerIndex }: CapProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const stillFrames = useRef(0);
  const lastResetId = useRef(useGameStore.getState().resetRequestId);
  const { onPointerDown } = useLaunch(bodyRef, playerIndex);
  const color = useGameStore((s) => s.players[playerIndex]?.color ?? "#e63946");
  const startPosition = useGameStore((s) => s.players[playerIndex]?.startPosition);
  const isActive = useGameStore((s) => s.activePlayerIndex === playerIndex);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    const state = useGameStore.getState();
    const player = state.players[playerIndex];
    if (!player) return;

    const rid = state.resetRequestId;
    if (rid !== lastResetId.current) {
      lastResetId.current = rid;
      stillFrames.current = 0;
      teleport(body, player.startPosition);
    }

    if (body.translation().y < OUT_OF_TRACK_Y) {
      teleport(body, player.lastPosition);
      if (playerIndex === state.activePlayerIndex) {
        state.settle();
      }
      return;
    }

    if (state.phase !== "moving" || playerIndex !== state.activePlayerIndex) return;

    const v = body.linvel();
    const speed = Math.hypot(v.x, v.y, v.z);

    if (speed < STOP_DETECTION.velocityThreshold) {
      stillFrames.current += 1;
      if (stillFrames.current >= STOP_DETECTION.framesRequired) {
        stillFrames.current = 0;
        state.settle();
      }
    } else {
      stillFrames.current = 0;
    }
  });

  if (!startPosition) return null;

  return (
    <>
      <RigidBody
        ref={bodyRef}
        position={startPosition}
        userData={{ type: "cap", playerIndex }}
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
        <mesh onPointerDown={onPointerDown} castShadow>
          <cylinderGeometry
            args={[PHYSICS.capRadius, PHYSICS.capRadius, PHYSICS.capHeight, 32]}
          />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh onPointerDown={onPointerDown} visible={false}>
          <cylinderGeometry
            args={[PHYSICS.capRadius * 2, PHYSICS.capRadius * 2, PHYSICS.capHeight * 4, 12]}
          />
        </mesh>
      </RigidBody>

      {isActive && <AimIndicator bodyRef={bodyRef} />}
    </>
  );
}
