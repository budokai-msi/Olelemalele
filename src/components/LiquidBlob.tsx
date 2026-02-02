'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPosition;

  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDisplacement;

  // Simple noise function
  float noise(vec3 p) {
    return sin(p.x * 2.0 + uTime) * cos(p.y * 2.0 + uTime) * sin(p.z * 2.0 + uTime);
  }

  void main() {
    vPosition = position;
    vNormal = normal;

    vec3 newPosition = position;
    float n = noise(position * 2.0 + uPosition);
    vDisplacement = n;
    newPosition += normal * n * uIntensity;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const fragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDisplacement;

  void main() {
    float intensity = (vDisplacement + 1.0) * 0.5;
    gl_FragColor = vec4(vec3(intensity), 1.0);
  }
`

interface LiquidBlobProps {
  position?: [number, number, number]
  scale?: number
  speed?: number
}

export default function LiquidBlob({ position = [0, 0, 0], scale = 1, speed = 1 }: LiquidBlobProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.1 },
    uPosition: { value: new THREE.Vector3(...position) },
  }), [position])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * speed
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}
