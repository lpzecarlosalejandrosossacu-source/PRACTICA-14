import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

const START = [-8, 0.45, 0]
const GOAL = [8, 0.55, 0]
const PLAYER_RADIUS = 0.48

// Cada obstáculo se mueve de arriba abajo por una línea distinta.
const OBSTACLES = [
  { x: -4.5, amplitude: 2.8, speed: 1.1, phase: 0 },
  { x: 0, amplitude: 3.1, speed: 1.5, phase: 1.8 },
  { x: 4.5, amplitude: 2.5, speed: 1.9, phase: 3.4 },
]

function obstaclePosition(obstacle, time) {
  return [
    obstacle.x,
    0.65,
    Math.sin(time * obstacle.speed + obstacle.phase) * obstacle.amplitude,
  ]
}

function Marker({ position, color, label }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.78, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>
      <Text position={[0, 0.45, -0.85]} fontSize={0.42} color={color} anchorX="center">
        {label}
      </Text>
    </group>
  )
}

function Mouse({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.48, 24, 24]} />
        <meshStandardMaterial color="#aeb8c4" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.43, 0]} castShadow>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshStandardMaterial color="#e7a7b8" />
      </mesh>
      <mesh position={[-0.2, 0.43, 0]} castShadow>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshStandardMaterial color="#e7a7b8" />
      </mesh>
      <mesh position={[0, 0, -0.45]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#303842" />
      </mesh>
    </group>
  )
}

function Cheese() {
  return (
    <group position={GOAL} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.78, 0.78, 0.48, 3]} />
        <meshStandardMaterial color="#ffd633" roughness={0.55} />
      </mesh>
      <mesh position={[0.18, 0.42, 0.08]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#e6a700" />
      </mesh>
      <mesh position={[-0.2, 0.42, -0.12]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#e6a700" />
      </mesh>
    </group>
  )
}

function Obstacle({ obstacle }) {
  const mesh = useRef()

  useFrame(({ clock }) => {
    const [x, y, z] = obstaclePosition(obstacle, clock.getElapsedTime())
    mesh.current.position.set(x, y, z)
    mesh.current.rotation.y += 0.025
  })

  return (
    <mesh ref={mesh} castShadow>
      <boxGeometry args={[0.9, 1.3, 0.9]} />
      <meshStandardMaterial color="#e05252" emissive="#4a1010" />
    </mesh>
  )
}

function Player({ position, setPosition, reset, playing, won, onDeath, onWin }) {
  const keys = useRef({})
  const canMove = useRef(true)

  useEffect(() => {
    const press = (event) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault()
        keys.current[event.code] = true
      }
    }
    const release = (event) => {
      keys.current[event.code] = false
    }
    const clearKeys = () => { keys.current = {} }
    window.addEventListener('keydown', press)
    window.addEventListener('keyup', release)
    window.addEventListener('blur', clearKeys)
    return () => {
      window.removeEventListener('keydown', press)
      window.removeEventListener('keyup', release)
      window.removeEventListener('blur', clearKeys)
    }
  }, [])

  useEffect(() => {
    canMove.current = true
    setPosition(START)
  }, [reset, setPosition])

  useFrame(({ clock }, delta) => {
    if (!playing || won || !canMove.current) return

    const horizontal = Number(keys.current.KeyD || keys.current.ArrowRight) - Number(keys.current.KeyA || keys.current.ArrowLeft)
    const vertical = Number(keys.current.KeyS || keys.current.ArrowDown) - Number(keys.current.KeyW || keys.current.ArrowUp)
    // Si no hay tecla presionada, "next" conserva la posición actual.
    // Así también se revisan choques con obstáculos que se acercan al ratón quieto.
    let next = position
    if (horizontal || vertical) {
      const direction = new THREE.Vector3(horizontal, 0, vertical).normalize()
      next = [
        THREE.MathUtils.clamp(position[0] + direction.x * delta * 4.2, -8.8, 8.8),
        0.45,
        THREE.MathUtils.clamp(position[2] + direction.z * delta * 4.2, -4.2, 4.2),
      ]
    }

    const time = clock.getElapsedTime()
    const hit = OBSTACLES.some((obstacle) => {
      const [x, , z] = obstaclePosition(obstacle, time)
      return Math.hypot(next[0] - x, next[2] - z) < PLAYER_RADIUS + 0.62
    })

    if (hit) {
      canMove.current = false
      setPosition(START)
      onDeath()
      return
    }
    if (Math.hypot(next[0] - GOAL[0], next[2] - GOAL[2]) < 0.9) {
      canMove.current = false
      onWin()
      return
    }
    if (horizontal || vertical) setPosition(next)
  })

  return <Mouse position={position} />
}

function Scene({ position, setPosition, reset, playing, won, onDeath, onWin }) {
  return (
    <>
      <color attach="background" args={['#b9e3f6']} />
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 10, 4]} intensity={2} castShadow />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 11]} />
        <meshStandardMaterial color="#78b75b" />
      </mesh>
      <gridHelper args={[20, 20, '#4d8141', '#8ec978']} position={[0, 0.01, 0]} />
      <Marker position={START} color="#0d7f3f" label="A · Inicio" />
      <Marker position={GOAL} color="#cf8600" label="B · Queso" />
      <Cheese />
      {OBSTACLES.map((obstacle, index) => <Obstacle key={index} obstacle={obstacle} />)}
      <Player
        position={position}
        setPosition={setPosition}
        reset={reset}
        playing={playing}
        won={won}
        onDeath={onDeath}
        onWin={onWin}
      />
      <OrbitControls enablePan={false} minDistance={11} maxDistance={19} maxPolarAngle={Math.PI / 2.15} />
    </>
  )
}

export default function App() {
  const [position, setPosition] = useState(START)
  const [deaths, setDeaths] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [won, setWon] = useState(false)
  const [reset, setReset] = useState(0)

  function restart(countDeath = false) {
    if (countDeath) setDeaths((total) => total + 1)
    setWon(false)
    setPlaying(true)
    setPosition(START)
    setReset((number) => number + 1)
  }

  return (
    <main>
      <section className="panel">
        <p className="eyebrow">MISIÓN CÓNDOR · REACT 3D</p>
        <h1>Ratón al queso</h1>
        <p className="instructions">Lleva el ratón desde A hasta el queso. Usa <b>WASD</b> o las <b>flechas</b> y evita los bloques rojos.</p>
        {!playing && <p className="notice">Primero pulsa <b>Iniciar juego</b>. Después las teclas moverán al ratón.</p>}
        <div className="stats">
          <span>💥 Choques: <b>{deaths}</b></span>
          <span>🧀 Meta: punto B</span>
        </div>
        <button onClick={() => restart(false)}>{playing ? 'Reiniciar partida' : 'Iniciar juego'}</button>
      </section>
      <Canvas shadows camera={{ position: [0, 13, 13], fov: 48 }}>
        <Scene
          position={position}
          setPosition={setPosition}
          reset={reset}
          playing={playing}
          won={won}
          onDeath={() => restart(true)}
          onWin={() => setWon(true)}
        />
      </Canvas>
      {won && (
        <div className="victory" role="status">
          <h2>¡Ganaste! 🧀</h2>
          <p>El ratón llegó al queso con {deaths} choque{deaths === 1 ? '' : 's'}.</p>
          <button onClick={() => restart(false)}>Jugar otra vez</button>
        </div>
      )}
    </main>
  )
}
