'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
  uniform float uTime;
  uniform float uIntensity;

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
    float n = noise(position * 2.0);
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

interface BlobProps {
  position?: [number, number, number]
}

export default function Blob({ position = [0, 0, 0] }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: 0.1 },
  }), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <mesh ref={meshRef} position={position} onClick={handleClick}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}