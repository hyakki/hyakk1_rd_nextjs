import * as THREE from 'three'
import React, { useEffect, useState, useRef } from 'react'

let OrbitControls = require('three-orbit-controls')(THREE)

import glsl from 'glslify'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import styles from './waves.module.scss'

import { useAnimationFrame } from './utils'

import dat from 'dat.gui'
import convert from 'color-convert'

const waves = () => {
  // Refs
  const container = useRef(null)
  const gui = useRef(null)
  const settings = useRef({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
  })

  // States
  const [time, setTime] = useState(0)
  const [sizes, setSizes] = useState({
    width: 0,
    height: 0,
  })

  // Init and destroy
  useEffect(() => {
    init()
    // createOrbitControls()

    return () => {
      destroy()
    }
  }, [])

  // Time
  useEffect(() => {
    update()
  }, [time])

  useAnimationFrame(deltaTime => {
    setTime(t => t + 1)
  })

  useEffect(() => {
    settings.current.renderer.setSize(sizes.width, sizes.height)
  }, [sizes])


  // Lifecycle
  const init = () => {
    const { width, height } = container.current.getBoundingClientRect()

    setSizes({
      width,
      height,
    })

    // Inital
    const initial = {
      unrealBloomPass: {
        strength: 0,
        radius: 0,
        threshold: 0,
      },
      uniforms: {
        uSize: 2.5,
        uLimit: 4.0,
        uDepth: 4.0,
        uColor1: '#0038ff',
        uColor2: '#d30df4',
        uMove: true,
      },
      scene: {
        backgroundColor: '#0c0735',
      },
    }

    // Dat.GUI
    gui.current = new dat.GUI({ name: 'My GUI'} )

    const unrealBloomPassFolder = gui.current.addFolder('UnrealBloomPass')
    const uniformsFolder = gui.current.addFolder('uniforms')
    const sceneFolder = gui.current.addFolder('scene')

    // Dat.GUI unrealBloomPass
    unrealBloomPassFolder.add(initial.unrealBloomPass, 'strength', 0, 3, 0.1).onChange(v => {
      settings.current.composer.passes[1].strength = v
    })
    unrealBloomPassFolder.add(initial.unrealBloomPass, 'radius', 0, 3, 0.1).onChange(v => {
      settings.current.composer.passes[1].radius = v
    })
    unrealBloomPassFolder.add(initial.unrealBloomPass, 'threshold', 0, 3, 0.1).onChange(v => {
      settings.current.composer.passes[1].radius = v
    })

    // Dat.GUI uniforms
    uniformsFolder.add(initial.uniforms, 'uSize', 1, 10, 0.1).onChange(v => {
      settings.current.material.uniforms.uSize.value = v
    })

    uniformsFolder.add(initial.uniforms, 'uMove', 1, 10, 0.1).onChange(v => {
      settings.current.material.uniforms.uMove.value = v ? 1.0 : 0.0
    })

    uniformsFolder.add(initial.uniforms, 'uDepth', 0, 4, 0.1).onChange(v => {
      settings.current.material.uniforms.uDepth.value = v
    })

    uniformsFolder.add(initial.uniforms, 'uLimit', 1, 5, 0.1).onChange(v => {
      settings.current.material.uniforms.uLimit.value = v
    })

    uniformsFolder.addColor(initial.uniforms, 'uColor1').onChange(v => {
      const rgb = convert.hex.rgb(v).map(c => c / 256)

      settings.current.material.uniforms.uColor1.value = rgb
    })

    uniformsFolder.addColor(initial.uniforms, 'uColor2').onChange(v => {
      const rgb = convert.hex.rgb(v).map(c => c / 256)

      settings.current.material.uniforms.uColor2.value = rgb
    })

    // Dat.GUI scene
    sceneFolder.addColor(initial.scene, 'backgroundColor').onChange(v => {
      settings.current.scene.background = new THREE.Color(v)
    })

    // Dat.GUI Open folders
    unrealBloomPassFolder.open()
    uniformsFolder.open()
    sceneFolder.open()

    // Dat.GUI [end]

    // Create Scene
    settings.current.scene = new THREE.Scene()
    // settings.current.scene.background = new THREE.Color(0x20162c)
    settings.current.scene.background = new THREE.Color(initial.scene.backgroundColor)

    // Create Camera
    settings.current.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)
    settings.current.camera.position.x = 0
    settings.current.camera.position.y = 0
    settings.current.camera.position.z = 3
    settings.current.camera.lookAt(0, 0, 0)

    // Create ground
    const geometry = new THREE.PlaneBufferGeometry(8.0, 8.0, 256.0, 256.0)
    settings.current.material = new THREE.ShaderMaterial({
      fragmentShader: require('./ground.frag').default,
      vertexShader: require('./ground.vert').default,
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: initial.uniforms.uSize },
        uMove: { value: initial.uniforms.uMove ? 1.0 : 0.0 },
        uColor1: { value: convert.hex.rgb(initial.uniforms.uColor1).map(c => c / 256)},
        uColor2: { value: convert.hex.rgb(initial.uniforms.uColor2).map(c => c / 256)},
        uDepth: { value: initial.uniforms.uDepth },
        uLimit: { value: initial.uniforms.uLimit },
      },
      transparent: true,
    })
    const mesh = new THREE.Points(geometry, settings.current.material)

    mesh.rotation.x = Math.PI / 2
    mesh.position.y = -1

    // Add mesh to scene
    settings.current.scene.add(mesh)

    // Create Renderer
    settings.current.renderer = new THREE.WebGLRenderer({ antialias: false })
    settings.current.renderer.setSize(width, height)

    const renderPass = new RenderPass(settings.current.scene, settings.current.camera)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      initial.unrealBloomPass.strength,
      initial.unrealBloomPass.radius,
      initial.unrealBloomPass.threshold,
    )

    settings.current.composer = new EffectComposer(settings.current.renderer)
    settings.current.composer.addPass(renderPass)
    settings.current.composer.addPass(bloomPass)

    container.current.appendChild(settings.current.renderer.domElement)
  }
 
  const update = () => {
    settings.current.composer && settings.current.composer.render(settings.current.scene, settings.current.camera)

    if (settings.current.material) {
      settings.current.material.uniforms.uTime.value = time
    }
  }

  const destroy = () => {
    gui.current && gui.current.destroy()
  }

  const createOrbitControls = () => {
    new OrbitControls(settings.current.camera, settings.current.renderer.domElement)
  }

  return (
    <div>
      <div style={{height: '100vh'}} ref={container}>
      </div>

      <svg className={styles.title} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 319.44 91.55">
        <path fill="#fff" d="M319.2 18.35h-.2c-17.45 0-21.26 12.32-22.07 17-2.3-10.62-10.68-17.85-21.58-17.85a23.09 23.09 0 00-17.16 7.22l2.91-6.11a.17.17 0 000-.17.19.19 0 00-.16-.09H249.6a.19.19 0 00-.17.1l-14.16 29.88-14.18-29.87a.18.18 0 00-.16-.1H201.62a.19.19 0 00-.17.19v1.93a23.85 23.85 0 00-32.61 8.64 24.1 24.1 0 00-2.33 5.64c-2.46-10.32-10.68-17.31-21.46-17.31a23.13 23.13 0 00-19 9.27l2.63-8.12a.15.15 0 000-.16.18.18 0 00-.14-.09h-10.38a.2.2 0 00-.17.12l-8.68 26.4-8.57-26.4a.19.19 0 00-.17-.12h-9.23a.18.18 0 00-.16.12l-8.59 26.45-8.68-26.45a.19.19 0 00-.17-.12H65V0L54.63 3.47h.07v17.36A23.67 23.67 0 0022.22 29c-.11.18-.19.37-.29.55l3.5-10.87a.22.22 0 000-.16.22.22 0 00-.14-.09H14.87a.2.2 0 00-.17.12L12 27a.15.15 0 000 .16.19.19 0 00.16.09h10.13l-11.7 3.91a.18.18 0 00-.1.12L0 63.69a.43.43 0 000 .16.17.17 0 00.14 0h10.65a.17.17 0 00.17-.12L19 38.63a23.65 23.65 0 0023.58 26.19c4.44 0 10.19-1.48 13-4.17l9.55 3V24.29l12.79 39.43a.15.15 0 00.17.12H87a.15.15 0 00.17-.12l8.67-26.85 8.68 26.85a.19.19 0 00.17.12h9.22a.17.17 0 00.17-.12L121.47 41v.3A23.2 23.2 0 00144 65.22h1.1c9.13 0 16.8-4.32 20-11.27a.15.15 0 000-.16.09.09 0 00-.1-.09l-10-3.16a.18.18 0 00-.2.09c-1.52 3-5 4.67-9.55 4.67a12.41 12.41 0 01-12.41-9.18h33.37A23.78 23.78 0 00189.51 65c4.3 0 10.12-1.41 13-4.13l9.46 3a.17.17 0 00.17 0 .22.22 0 000-.16V24l18.95 39.77a.16.16 0 00.16.1h8.29a.24.24 0 00.18-.1l12.38-26a23.34 23.34 0 00-.19 2.53v1a23.21 23.21 0 0022.5 23.89h1c9.15 0 16.82-4.32 20-11.27a.15.15 0 000-.16.09.09 0 00-.1-.09l-10-3.16a.2.2 0 00-.21.09c-1.51 3-5 4.67-9.55 4.67a12.42 12.42 0 01-12.4-9.18h33.58v17.55a.17.17 0 00.16.19h10.51a.17.17 0 00.17-.17V40.81c0-8.42 6.14-11.46 10.26-11.46h1.42a.19.19 0 00.19-.19V18.52c-.07-.09-.15-.17-.24-.17zM42.48 55.22a14.11 14.11 0 1114.11-14.11 14.12 14.12 0 01-14.11 14.11zm90.31-18.54a12.13 12.13 0 0112-9.25 11.12 11.12 0 0111.3 9.25zm56.73 18.56a14.11 14.11 0 010-28.22 14.11 14.11 0 010 28.22zm85.66-27.81a11.09 11.09 0 0111.21 9.25h-23.26a12.17 12.17 0 0112.05-9.25z"/>
        <path fill="#fff" d="M46.07 86.54l-3.31-5.74h1.76l2.31 4 2.32-4h1.76l-3.31 5.74v4.37h-1.53v-4.37z"/>
        <path fill="#fff" d="M51.07 85.81a5 5 0 011.55-3.67 5.16 5.16 0 013.75-1.53 5.29 5.29 0 015.27 5.26 5 5 0 01-1.56 3.7 5.34 5.34 0 01-7.3.17 5 5 0 01-1.71-3.93zm1.54 0a3.66 3.66 0 001.13 2.76 3.63 3.63 0 002.59 1.08A3.67 3.67 0 0059 88.57a3.93 3.93 0 000-5.42 3.58 3.58 0 00-2.66-1.1 3.74 3.74 0 00-3.76 3.78z"/>
        <path fill="#fff" d="M65.08 80.8v6.09a3.33 3.33 0 00.43 1.91 2.27 2.27 0 003.57 0 3.32 3.32 0 00.43-1.91V80.8H71v6.51a3.61 3.61 0 01-1 2.63 3.75 3.75 0 01-6.5-2.63V80.8z"/>
        <path fill="#fff" d="M76.89 86.6L80 90.91h-1.85l-2.89-4.14H75v4.14h-1.55V80.8h1.79a4.5 4.5 0 012.9.75 2.75 2.75 0 011 2.21 3 3 0 01-.62 1.85 2.68 2.68 0 01-1.63.99zM75 85.44h.48c1.45 0 2.17-.55 2.17-1.66s-.7-1.55-2.11-1.55H75z"/>
        <path fill="#fff" d="M85.68 90.91V80.8h1.52a6.43 6.43 0 011.62.16 2.26 2.26 0 011 .53 2.76 2.76 0 01.67 1 2.92 2.92 0 01.26 1.18 2.41 2.41 0 01-.83 1.84 2.4 2.4 0 011.27 1 2.59 2.59 0 01.49 1.49 2.88 2.88 0 01-2 2.7 6.44 6.44 0 01-1.68.2h-2.32zm1.52-5.77h.48a1.75 1.75 0 001.25-.38 1.43 1.43 0 00.39-1.11 1.34 1.34 0 00-.41-1.08 1.67 1.67 0 00-1.18-.37h-.53zm0 4.34h.94a2.28 2.28 0 001.52-.41 1.39 1.39 0 00.51-1.07 1.42 1.42 0 00-.49-1.1 2.6 2.6 0 00-1.68-.48h-.77v3.06z"/>
        <path fill="#fff" d="M97 86.6l3.13 4.31H98.3l-2.89-4.14h-.28v4.14H93.6V80.8h1.79a4.5 4.5 0 012.9.75 2.75 2.75 0 011 2.21 2.94 2.94 0 01-.61 1.85 2.68 2.68 0 01-1.68.99zm-1.92-1.16h.48c1.45 0 2.17-.55 2.17-1.66s-.7-1.55-2.11-1.55h-.54z"/>
        <path fill="#fff" d="M107.62 88.46h-4.33l-1.14 2.46h-1.64l5-10.75 4.83 10.75h-1.66zM107 87l-1.5-3.44-1.57 3.44z"/>
        <path fill="#fff" d="M111.62 90.91v-10.8l7.38 7.71v-7h1.53v10.7l-7.36-7.69v7.08z"/>
        <path fill="#fff" d="M122.94 90.91V80.8h2.12a7.74 7.74 0 012.41.3 4.43 4.43 0 011.71 1 5.2 5.2 0 01-.06 7.52 4.66 4.66 0 01-1.72 1 7.75 7.75 0 01-2.38.28h-2.08zm1.53-1.43h.69a5.55 5.55 0 001.71-.22 3.38 3.38 0 001.23-.73 3.79 3.79 0 000-5.38 4.19 4.19 0 00-3-.92h-.69v7.25z"/>
        <path fill="#fff" d="M136.82 90.91v-10.8l7.36 7.71v-7h1.53v10.7l-7.37-7.69v7.08z"/>
        <path fill="#fff" d="M153.71 82.23h-4v2.43h3.94v1.43h-3.94v3.38h4v1.43h-5.57V80.79h5.57z"/>
        <path fill="#fff" d="M156.21 80.8l2.63 6.76 2.75-7.25 2.64 7.25L167 80.8h1.66l-4.51 10.75-2.6-7.17-2.71 7.17-4.3-10.76h1.65z"/>
        <path fill="#fff" d="M174.08 90.91V80.8h2.12a7.74 7.74 0 012.41.3 4.55 4.55 0 011.72 1 4.85 4.85 0 011.57 3.75 4.91 4.91 0 01-3.35 4.77 7.75 7.75 0 01-2.38.28h-2.09zm1.53-1.43h.69a5.55 5.55 0 001.71-.22 3.49 3.49 0 002.36-3.41 3.52 3.52 0 00-1.11-2.7 4.19 4.19 0 00-2.95-.92h-.69v7.25z"/>
        <path fill="#fff" d="M185.34 80.8v10.11h-1.52V80.8z"/>
        <path fill="#fff" d="M193 85.65h4.17V86a6.92 6.92 0 01-.26 2 4.43 4.43 0 01-.88 1.52 4.58 4.58 0 01-3.58 1.58 4.91 4.91 0 01-3.63-1.53 5.27 5.27 0 013.78-9 5.14 5.14 0 012.21.48 6.27 6.27 0 011.92 1.57l-1.09 1a3.65 3.65 0 00-3-1.66 3.61 3.61 0 00-2.69 1.11 3.69 3.69 0 00-1.08 2.72 3.56 3.56 0 001.2 2.78 3.63 3.63 0 002.46 1 3.05 3.05 0 002-.76 2.69 2.69 0 001-1.83H193v-1.33z"/>
        <path fill="#fff" d="M200.59 80.8v10.11h-1.52V80.8z"/>
        <path fill="#fff" d="M205.82 82.23v8.68h-1.53v-8.68H202V80.8h6.18v1.43z"/>
        <path fill="#fff" d="M214.89 88.46h-4.33l-1.13 2.46h-1.64l5-10.75 4.82 10.75h-1.67zm-.62-1.46l-1.5-3.44L211.2 87z"/>
        <path fill="#fff" d="M220.4 80.8v8.68h3v1.43h-4.5V80.8z"/>
        <path fill="#fff" d="M234 82.23h-3.5v2.43h3.4v1.43h-3.4v4.81H229V80.79h5z"/>
        <path fill="#fff" d="M237.32 80.8v6.09a3.42 3.42 0 00.42 1.91 2.29 2.29 0 003.59 0 3.32 3.32 0 00.43-1.91V80.8h1.53v6.51a3.61 3.61 0 01-1 2.63 3.86 3.86 0 01-5.5 0 3.62 3.62 0 01-1-2.63V80.8z"/>
        <path fill="#fff" d="M248.49 82.23v8.68H247v-8.68h-2.32V80.8h6.17v1.43z"/>
        <path fill="#fff" d="M253.7 80.8v6.09a3.42 3.42 0 00.42 1.91 2.29 2.29 0 003.59 0 3.32 3.32 0 00.43-1.91V80.8h1.53v6.51a3.61 3.61 0 01-1 2.63 3.75 3.75 0 01-6.5-2.63V80.8z"/>
        <path fill="#fff" d="M265.51 86.6l3.13 4.31h-1.87l-2.9-4.14h-.28v4.14h-1.52V80.8h1.79a4.52 4.52 0 012.9.75 2.75 2.75 0 011 2.21 2.89 2.89 0 01-.62 1.85 2.68 2.68 0 01-1.63.99zm-1.9-1.16h.48c1.45 0 2.17-.55 2.17-1.66s-.7-1.55-2.11-1.55h-.54v3.21z"/>
        <path fill="#fff" d="M275.73 82.23h-4.05v2.43h3.94v1.43h-3.94v3.38h4.05v1.43h-5.58V80.79h5.58z"/>
      </svg>

    </div>
  )
}

export default waves
