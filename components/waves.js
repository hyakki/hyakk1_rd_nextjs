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
    createOrbitControls()

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
      },
    }

    // Dat.GUI
    gui.current = new dat.GUI({ name: 'My GUI'} )

    const unrealBloomPassFolder = gui.current.addFolder('UnrealBloomPass')

    unrealBloomPassFolder.add(initial.unrealBloomPass, 'strength', 0, 3, 0.1).onChange(v => {
      settings.current.composer.passes[1].strength = v
    })
    unrealBloomPassFolder.add(initial.unrealBloomPass, 'radius', 0, 3, 0.1).onChange(v => {
      settings.current.composer.passes[1].radius = v
    })
    unrealBloomPassFolder.add(initial.unrealBloomPass, 'threshold', 0, 3, 0.1).onChange(v => {
      settings.current.composer.passes[1].radius = v
    })

    unrealBloomPassFolder.open()

    const uniformsFolder = gui.current.addFolder('uniforms')

    uniformsFolder.add(initial.uniforms, 'uSize', 1, 10, 0.1).onChange(v => {
      settings.current.material.uniforms.uSize.value = v
    })

    uniformsFolder.open()

    // Create Scene
    settings.current.scene = new THREE.Scene()
    // settings.current.scene.background = new THREE.Color(0x20162c)
    settings.current.scene.background = new THREE.Color(0x000000)

    // Create Camera
    settings.current.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)
    settings.current.camera.position.x = 1
    settings.current.camera.position.z = 1
    settings.current.camera.lookAt(0, 0, 0)

    // Create ground
    const geometry = new THREE.PlaneBufferGeometry(8.0, 8.0, 256.0, 256.0)
    settings.current.material = new THREE.ShaderMaterial({
      fragmentShader: require('./ground.frag').default,
      vertexShader: require('./ground.vert').default,
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: initial.uniforms.uSize },
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

    settings.current.composer.render(settings.current.scene, settings.current.camera)
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
      <div className={styles.title}>
      </div>
    </div>
  )
}

export default waves
