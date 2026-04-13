import * as THREE from 'three'
import React, { Suspense, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Loader, MeshTransmissionMaterial, Float, ContactShadows, Environment } from '@react-three/drei'
import { EffectComposer, N8AO, Bloom } from '@react-three/postprocessing'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { easing } from 'maath'
import Text from './components/Text'

// ─── SVG Path → THREE.Shape ──────────────────────────────────────────────────

function makeSVGShape(pathData, svgSize = 24) {
  const center = svgSize / 2
  const shape = new THREE.Shape()
  const commands = pathData.match(/[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi) || []
  let cx = 0, cy = 0
  for (const cmd of commands) {
    const type = cmd[0]
    const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
    const tx = (x) => x - center
    const ty = (y) => -(y - center)
    if (type === 'M') { shape.moveTo(tx(nums[0]), ty(nums[1])); cx = nums[0]; cy = nums[1] }
    else if (type === 'L') { shape.lineTo(tx(nums[0]), ty(nums[1])); cx = nums[0]; cy = nums[1] }
    else if (type === 'H') { shape.lineTo(tx(nums[0]), ty(cy)); cx = nums[0] }
    else if (type === 'V') { shape.lineTo(tx(cx), ty(nums[0])); cy = nums[0] }
    else if (type === 'C') {
      for (let i = 0; i < nums.length; i += 6) {
        shape.bezierCurveTo(tx(nums[i]), ty(nums[i + 1]), tx(nums[i + 2]), ty(nums[i + 3]), tx(nums[i + 4]), ty(nums[i + 5]))
        cx = nums[i + 4]; cy = nums[i + 5]
      }
    }
    else if (type === 'Z' || type === 'z') { shape.closePath() }
  }
  return shape
}

// ─── Components ──────────────────────────────────────────────────────────────

function Houses(props) {
  const geometry = useMemo(() => {
    const path1 = "M6 17H3C2.4 17 2 16.6 2 16V8.5L8 4L18 11.5V19C18 19.6 17.6 20 17 20H7C6.4 20 6 19.6 6 19V11.5L16 4L22 8.5V16C22 16.6 21.6 17 21 17H18"
    const path2 = "M10 20V14H14V20"
    const extrudeSettings = { depth: 6, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 0.8, bevelSegments: 2 }
    return mergeGeometries([
      new THREE.ExtrudeGeometry(makeSVGShape(path1), extrudeSettings),
      new THREE.ExtrudeGeometry(makeSVGShape(path2), extrudeSettings),
    ])
  }, [])
  return (
    <mesh geometry={geometry} {...props}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={20}
        thickness={8}
        samples={8}
        roughness={0.05}
        chromaticAberration={0.06}
        distortion={0.1}
        distortionScale={0.3}
        envMapIntensity={1.5}
      />
    </mesh>
  )
}

function HeroRig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [Math.sin(-state.pointer.x) * 5, state.pointer.y * 3.5, 15 + Math.cos(state.pointer.x) * 10],
      0.2, delta
    )
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function CanvasResizer() {
  useEffect(() => { window.dispatchEvent(new Event('resize')) }, [])
  return null
}

function HouseText() {
  return (
    <group>
      <Text bold fontSize={5} letterSpacing={0.15} color="#111111" position={[0, 1, -10]} anchorX="center" anchorY="middle">
        LANGILL FARM
      </Text>
      <Text fontSize={1.25} letterSpacing={0.08} color="#C9973E" position={[0, -1.75, -10]} anchorX="center" anchorY="middle">
        STEINBACH, MANITOBA
      </Text>
    </group>
  )
}

function HeroScene() {
  return (
    <>
      <color attach="background" args={['#f0ede8']} />
      <spotLight position={[20, 20, 10]} penumbra={1} angle={0.2} />
      <Float floatIntensity={2} speed={0.5}>
        <Houses scale={0.4125} />
      </Float>
      <ContactShadows scale={100} position={[0, -7.5, 0]} blur={1} far={100} opacity={0.85} />
      <Environment preset="city" />
      <EffectComposer disableNormalPass>
        <N8AO aoRadius={0.5} intensity={4} />
        <Bloom mipmapBlur luminanceThreshold={0.8} intensity={2} levels={8} />
      </EffectComposer>
      <HouseText />
      <HeroRig />
    </>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: '100vw', height: '100vh' }}>
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <CanvasResizer />
      </Canvas>
      <Loader />
    </>
  )
}
