"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useGameStore } from "@/stores/gameStore";
import { LAUNCH } from "@/config/physics";

const COLOR_LOW = new THREE.Color("#2dd4a7"); // potencia baja
const COLOR_HIGH = new THREE.Color("#ff4d3d"); // potencia máxima
const SHAFT_WIDTH = 0.12;
const HEAD_LENGTH = 0.35;
const HEAD_WIDTH = 0.3;

/**
 * Flecha en el suelo desde la chapa hacia la dirección de disparo.
 * Longitud proporcional a potencia. Color verde -> rojo.
 * Actualización imperativa en useFrame: cero re-renders React durante el drag.
 */
export function AimIndicator({
  bodyRef,
}: {
  bodyRef: React.RefObject<RapierRigidBody | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const shaft = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const shaftMat = useRef<THREE.MeshBasicMaterial>(null);
  const headMat = useRef<THREE.MeshBasicMaterial>(null);
  const color = useRef(new THREE.Color());

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    const { phase, aim } = useGameStore.getState();
    const visible = phase === "aiming" && aim.power > 0.01 && !!bodyRef.current;
    g.visible = visible;
    if (!visible) return;

    const t = bodyRef.current!.translation();
    const length = aim.power * LAUNCH.maxDragDistance;

    // Grupo orientado: +Z local apunta hacia la dirección de tiro
    g.position.set(t.x, 0.03, t.z);
    g.rotation.y = Math.atan2(aim.direction[0], aim.direction[2]);

    if (shaft.current) {
      shaft.current.scale.set(1, 1, Math.max(length - HEAD_LENGTH, 0.01));
      shaft.current.position.z = Math.max(length - HEAD_LENGTH, 0.01) / 2;
    }
    if (head.current) head.current.position.z = length - HEAD_LENGTH / 2;

    color.current.lerpColors(COLOR_LOW, COLOR_HIGH, aim.power);
    shaftMat.current?.color.copy(color.current);
    headMat.current?.color.copy(color.current);
  });

  return (
    <group ref={group} visible={false}>
      {/* Cuerpo: caja plana escalada en Z */}
      <mesh ref={shaft}>
        <boxGeometry args={[SHAFT_WIDTH, 0.02, 1]} />
        <meshBasicMaterial ref={shaftMat} transparent opacity={0.9} />
      </mesh>
      {/* Punta: cono rotado para apuntar +Z */}
      <mesh ref={head} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[HEAD_WIDTH / 2, HEAD_LENGTH, 12]} />
        <meshBasicMaterial ref={headMat} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
