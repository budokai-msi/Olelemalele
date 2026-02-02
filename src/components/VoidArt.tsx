'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { memo, useMemo, useRef } from 'react'
import * as THREE from 'three'

// Lazy load R3F for faster initial page load
const Canvas = dynamic(
  () => import('@react-three/fiber').then(mod => mod.Canvas),
  { ssr: false }
)

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);

    // Gravitational Lensing effect
    float r = length(p - uMouse * 0.2);
    float lensing = 0.02 / (r + 0.01);

    // The "Void" core
    float core = smoothstep(0.1, 0.02, d);

    // Accretion disk vibes
    float disk = sin(d * 20.0 - uTime * 2.0) * 0.5 + 0.5;
    disk *= smoothstep(0.4, 0.2, d);

    vec3 color = vec3(0.0);
    color += vec3(0.1, 0.2, 0.5) * disk * 0.5;
    color += vec3(1.0) * lensing * 0.2;

    color *= (1.0 - core * 2.0);

    gl_FragColor = vec4(color, color.r * 2.0);
  }
`

// Memoized singularity component
const Singularity = memo(function Singularity() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  // Import useFrame dynamically to avoid SSR issues
  const { useFrame } = require('@react-three/fiber')

  useFrame((state: { clock: { elapsedTime: number }; mouse: { x: number; y: number } }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uMouse.value.lerp(
        new THREE.Vector2(
          (state.mouse.x * 0.5),
          (state.mouse.y * 0.5)
        ),
        0.05
      )
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
})

function VoidArt() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-0 z-[1] pointer-events-none"
    >
      <Canvas
        camera={{ position: [0, 0, 2] }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          alpha: true
        }}
        frameloop="demand"
        performance={{ min: 0.5 }}
      >
        <Singularity />
      </Canvas>
    </motion.div>
  )
}

export default memo(VoidArt)
