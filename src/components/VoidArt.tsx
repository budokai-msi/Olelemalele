'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { memo, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// Check if WebGL is available
function isWebGLAvailable() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch (e) {
    return false
  }
}

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

    float r = length(p - uMouse * 0.2);
    float lensing = 0.02 / (r + 0.01);

    float core = smoothstep(0.1, 0.02, d);

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

  useFrame((state) => {
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

// Lazy load R3F for faster initial page load
const Canvas = dynamic(
  () => import('@react-three/fiber').then(mod => mod.Canvas),
  { ssr: false }
)

function VoidArt() {
  const [webglAvailable, setWebglAvailable] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setWebglAvailable(isWebGLAvailable())
  }, [])

  // Don't render on server or if WebGL not available
  if (!mounted || !webglAvailable) {
    return (
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-indigo-900/20 via-black to-black" />
    )
  }

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
        onError={(e) => {
          console.warn('Canvas error:', e)
        }}
      >
        <Singularity />
      </Canvas>
    </motion.div>
  )
}

export default memo(VoidArt)
