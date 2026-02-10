'use client'

import { Float, Sparkles, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

// Gelato frame color options — matches Gelato's actual framed canvas catalog
// White = gallery-wrapped canvas (no frame). The 3 framed options are Black, Natural Wood, Dark Brown.
export const GELATO_FRAME_OPTIONS = {
  white: {
    name: 'Gallery Wrap',
    primary: '#f5f5f0',
    secondary: '#e8e8e4',
    accent: '#ffffff',
  },
  black: {
    name: 'Black',
    primary: '#000000',
    secondary: '#0a0a0a',
    accent: '#1a1a1a',
  },
  natural: {
    name: 'Natural Wood',
    primary: '#9D6C3C',
    secondary: '#7a5430',
    accent: '#b07d4a',
  },
  darkbrown: {
    name: 'Dark Brown',
    primary: '#5C4033',
    secondary: '#3d2817',
    accent: '#6d4c3d',
  },
} as const

export type FrameStyle = keyof typeof GELATO_FRAME_OPTIONS

interface Product3DProps {
  image: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  onClick?: () => void
  disableAnimation?: boolean
  frameStyle?: FrameStyle
}

// Animated rings around the product
function AuraRing({ radius, speed, color, opacity }: { radius: number; speed: number; color: string; opacity: number }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

// Floating particles around the product
function FloatingParticles() {
  return (
    <Sparkles
      count={40}
      scale={[4, 5, 4]}
      size={1.5}
      speed={0.2}
      opacity={0.3}
      color="#a78bfa"
    />
  )
}

// Premium Gelato-style frame with realistic depth
function GelatoFrame({
  width,
  height,
  depth,
  frameStyle
}: {
  width: number
  height: number
  depth: number
  frameStyle: FrameStyle
}) {
  const colors = GELATO_FRAME_OPTIONS[frameStyle]
  const frameThickness = 0.06
  const innerBevelThickness = 0.015

  return (
    <group>
      {/* Main back panel - stretched canvas backing */}
      <mesh position={[0, 0, -depth / 2]}>
        <boxGeometry args={[width + frameThickness * 2, height + frameThickness * 2, 0.015]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.95} metalness={0} />
      </mesh>

      {/* Stretcher bars (wooden frame bars visible from back) */}
      <mesh position={[0, height / 2 - 0.1, -depth / 2 + 0.02]}>
        <boxGeometry args={[width * 0.9, 0.03, 0.03]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.7} />
      </mesh>
      <mesh position={[0, -height / 2 + 0.1, -depth / 2 + 0.02]}>
        <boxGeometry args={[width * 0.9, 0.03, 0.03]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.7} />
      </mesh>

      {/* Frame sides - Gelato style clean frames */}
      {/* Top */}
      <mesh position={[0, height / 2 + frameThickness / 2, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, depth]} />
        <meshStandardMaterial
          color={colors.primary}
          roughness={frameStyle === 'white' ? 0.4 : 0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -height / 2 - frameThickness / 2, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, depth]} />
        <meshStandardMaterial
          color={colors.primary}
          roughness={frameStyle === 'white' ? 0.4 : 0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Left */}
      <mesh position={[-width / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, depth]} />
        <meshStandardMaterial
          color={colors.primary}
          roughness={frameStyle === 'white' ? 0.4 : 0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Right */}
      <mesh position={[width / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, depth]} />
        <meshStandardMaterial
          color={colors.primary}
          roughness={frameStyle === 'white' ? 0.4 : 0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Inner lip / mat edge - subtle accent line */}
      <mesh position={[0, height / 2 - innerBevelThickness / 2, depth / 2 - 0.008]}>
        <boxGeometry args={[width, innerBevelThickness, 0.012]} />
        <meshStandardMaterial
          color={colors.accent}
          roughness={0.2}
          metalness={0.1}
          emissive={'#000000'}
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[0, -height / 2 + innerBevelThickness / 2, depth / 2 - 0.008]}>
        <boxGeometry args={[width, innerBevelThickness, 0.012]} />
        <meshStandardMaterial
          color={colors.accent}
          roughness={0.2}
          metalness={0.1}
          emissive={'#000000'}
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[-width / 2 + innerBevelThickness / 2, 0, depth / 2 - 0.008]}>
        <boxGeometry args={[innerBevelThickness, height - innerBevelThickness * 2, 0.012]} />
        <meshStandardMaterial
          color={colors.accent}
          roughness={0.2}
          metalness={0.1}
          emissive={'#000000'}
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[width / 2 - innerBevelThickness / 2, 0, depth / 2 - 0.008]}>
        <boxGeometry args={[innerBevelThickness, height - innerBevelThickness * 2, 0.012]} />
        <meshStandardMaterial
          color={colors.accent}
          roughness={0.2}
          metalness={0.1}
          emissive={'#000000'}
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

export default function Product3D({
  image,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  onClick,
  disableAnimation = false,
  frameStyle = 'white'
}: Product3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Load texture
  const texture = useTexture(image)
  texture.colorSpace = THREE.SRGBColorSpace

  // Canvas dimensions - Gelato standard sizes
  const canvasWidth = 2
  const canvasHeight = 3
  const canvasDepth = 0.12

  // Subtle idle animation
  useFrame((state) => {
    if (groupRef.current && !disableAnimation) {
      // Gentle breathing effect
      const breathe = Math.sin(state.clock.elapsedTime * 0.8) * 0.015
      groupRef.current.position.y = breathe

      // Subtle tilt based on time
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.015
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Floating wrapper with levitation effect */}
      <Float
        speed={disableAnimation ? 0 : 1.2}
        rotationIntensity={disableAnimation ? 0 : 0.15}
        floatIntensity={disableAnimation ? 0 : 0.2}
        floatingRange={[-0.03, 0.03]}
      >
        <group
          ref={groupRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Subtle glow backdrop */}
          <mesh position={[0, 0, -0.15]}>
            <planeGeometry args={[canvasWidth * 1.3, canvasHeight * 1.3]} />
            <meshBasicMaterial
              color={hovered ? "#7c3aed" : "#4f46e5"}
              transparent
              opacity={hovered ? 0.12 : 0.06}
            />
          </mesh>

          {/* Gelato-style premium frame */}
          <GelatoFrame
            width={canvasWidth}
            height={canvasHeight}
            depth={canvasDepth}
            frameStyle={frameStyle}
          />

          {/* The canvas/artwork itself - slightly recessed for realism */}
          <mesh position={[0, 0, canvasDepth / 2 - 0.005]}>
            <planeGeometry args={[canvasWidth - 0.03, canvasHeight - 0.03]} />
            <meshStandardMaterial
              map={texture}
              roughness={0.35}
              metalness={0.02}
              envMapIntensity={0.4}
            />
          </mesh>

          {/* Canvas texture effect - subtle bumps */}
          <mesh position={[0, 0, canvasDepth / 2 + 0.001]}>
            <planeGeometry args={[canvasWidth - 0.03, canvasHeight - 0.03]} />
            <meshStandardMaterial
              transparent
              opacity={0.03}
              color="#ffffff"
              roughness={1}
            />
          </mesh>

          {/* Animated aura rings */}
          {!disableAnimation && (
            <>
              <AuraRing radius={2} speed={0.25} color="#8b5cf6" opacity={0.12} />
              <AuraRing radius={2.3} speed={-0.15} color="#6366f1" opacity={0.08} />
            </>
          )}
        </group>
      </Float>

      {/* Floating particles */}
      {!disableAnimation && <FloatingParticles />}

      {/* Ground reflection hint */}
      <mesh position={[0, -2.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.04} />
      </mesh>
    </group>
  )
}
