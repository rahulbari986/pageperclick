"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Suppress Three.js Clock deprecation warning emitted by R3F internal initialization
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

function ParticleCloud({
  count = 300,
  color = "#9333ea",
  size = 0.018,
  spread = 4,
  speed = 0.12,
}: {
  count?: number;
  color?: string;
  size?: number;
  spread?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * spread * 2;
      arr[i * 3 + 1] = (Math.random() - 0.5) * spread * 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;
    }
    return arr;
  }, [count, spread]);

  // Frame-rate independent delta accumulation
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed * 0.4;
      ref.current.rotation.x += delta * speed * 0.15;
      ref.current.rotation.z += delta * speed * 0.08;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.7}
      />
    </Points>
  );
}

function ParticleRing({
  radius = 2.2,
  count = 120,
  color = "#a855f7",
  speed = 0.2,
}: {
  radius?: number;
  count?: number;
  color?: string;
  speed?: number;
}) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.4;
      arr[i * 3 + 0] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, [count, radius]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
      ref.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.5}
      />
    </Points>
  );
}

export interface ThreeParticleFieldProps {
  className?: string;
  particleCount?: number;
  primaryColor?: string;
  accentColor?: string;
  showRing?: boolean;
}

export function ThreeParticleField({
  className = "",
  particleCount = 280,
  primaryColor = "#9333ea",
  accentColor = "#c026d3",
  showRing = true,
}: ThreeParticleFieldProps) {
  return (
    <div
      className={`w-full h-full ${className}`}
      style={{ background: "transparent" }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 65 }}
        style={{ background: "transparent" }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ParticleCloud
          count={particleCount}
          color={primaryColor}
          size={0.015}
          spread={5}
          speed={0.1}
        />
        <ParticleCloud
          count={Math.floor(particleCount * 0.4)}
          color={accentColor}
          size={0.022}
          spread={3.5}
          speed={0.15}
        />
        {showRing && (
          <ParticleRing
            radius={2.5}
            count={90}
            color={primaryColor}
            speed={0.18}
          />
        )}
      </Canvas>
    </div>
  );
}
