"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CylinderCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";

import { LAUNCH, OUT_OF_TRACK_Y, PHYSICS, STOP_DETECTION } from "@/config/physics";
import { registerCapBody } from "@/features/online/capBodyRegistry";
import {
  canLocalPlayerAim,
  commitLocalSettle,
  isOnlineMatchActive,
} from "@/features/online/onlineSession";
import { useLaunch } from "@/features/launch/useLaunch";
import { AimIndicator } from "@/features/launch/AimIndicator";
import { useGameStore } from "@/stores/gameStore";

/**
 * Reposiciona el body en una posición dando velocidades/rotación a cero.
 * El +0.2 en Y evita que la chapa reaparezca clipada dentro del suelo.
 */
function teleport(
  body: RapierRigidBody,
  [x, y, z]: [number, number, number],
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
 * - Input solo si playerIndex === activePlayerIndex (y slot local en online)
 * - Detección de parada: local settle / online solo el activo emite snapshot
 * - Fuera de pista: cada chapa a SU lastPosition; solo la activa además settle
 */
export function Cap({ playerIndex }: CapProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const stillFrames = useRef(0);
  const lastResetId = useRef(useGameStore.getState().resetRequestId);
  const lastRemoteImpulseId = useRef(
    useGameStore.getState().remoteImpulseRequestId,
  );
  const lastSnapshotId = useRef(useGameStore.getState().snapshotRequestId);
  const { onPointerDown } = useLaunch(bodyRef, playerIndex);
  const color = useGameStore((s) => s.players[playerIndex]?.color ?? "#e63946");
  const startPosition = useGameStore(
    (s) => s.players[playerIndex]?.startPosition,
  );
  const showAim = useGameStore(
    (s) =>
      s.activePlayerIndex === playerIndex &&
      (s.matchMode !== "online" || canLocalPlayerAim(playerIndex)),
  );

  useEffect(() => {
    registerCapBody(playerIndex, bodyRef.current);
    return () => registerCapBody(playerIndex, null);
  }, [playerIndex, startPosition]);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) return;

    registerCapBody(playerIndex, body);

    const state = useGameStore.getState();
    const player = state.players[playerIndex];
    if (!player) return;

    const rid = state.resetRequestId;
    if (rid !== lastResetId.current) {
      lastResetId.current = rid;
      stillFrames.current = 0;
      teleport(body, player.startPosition);
    }

    const snapId = state.snapshotRequestId;
    if (snapId !== lastSnapshotId.current) {
      lastSnapshotId.current = snapId;
      stillFrames.current = 0;
      const pos = state.pendingSnapshot?.[playerIndex];
      if (pos) {
        teleport(body, pos);
      }
    }

    const impulseId = state.remoteImpulseRequestId;
    if (
      impulseId !== lastRemoteImpulseId.current &&
      playerIndex === state.activePlayerIndex
    ) {
      lastRemoteImpulseId.current = impulseId;
      const impulse = state.pendingRemoteImpulse;
      if (impulse) {
        stillFrames.current = 0;
        teleport(body, impulse.from);
        body.wakeUp();
        body.applyImpulse(
          {
            x: impulse.direction[0] * impulse.power * LAUNCH.maxImpulse,
            y: 0,
            z: impulse.direction[2] * impulse.power * LAUNCH.maxImpulse,
          },
          true,
        );
      }
    } else if (impulseId !== lastRemoteImpulseId.current) {
      lastRemoteImpulseId.current = impulseId;
    }

    if (body.translation().y < OUT_OF_TRACK_Y) {
      teleport(body, player.lastPosition);
      if (playerIndex === state.activePlayerIndex) {
        if (isOnlineMatchActive()) {
          commitLocalSettle();
        } else {
          state.settle();
        }
      }
      return;
    }

    if (state.phase !== "moving" || playerIndex !== state.activePlayerIndex) {
      return;
    }

    const v = body.linvel();
    const speed = Math.hypot(v.x, v.y, v.z);

    if (speed < STOP_DETECTION.velocityThreshold) {
      stillFrames.current += 1;
      if (stillFrames.current >= STOP_DETECTION.framesRequired) {
        stillFrames.current = 0;
        if (isOnlineMatchActive()) {
          // Solo el cliente dueño del slot activo emite settle; remotos esperan Broadcast.
          commitLocalSettle();
        } else {
          state.settle();
        }
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
            args={[
              PHYSICS.capRadius * 2,
              PHYSICS.capRadius * 2,
              PHYSICS.capHeight * 4,
              12,
            ]}
          />
        </mesh>
      </RigidBody>

      {showAim && <AimIndicator bodyRef={bodyRef} />}
    </>
  );
}
