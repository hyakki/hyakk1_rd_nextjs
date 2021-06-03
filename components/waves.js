import * as THREE from 'three'
import React, { useContext, useEffect, useState, useRef } from 'react'

let OrbitControls = require('three-orbit-controls')(THREE)

import glsl from 'glslify'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import styles from './waves.module.scss'

import { useAnimationFrame } from './utils'

import dat from 'dat.gui'
import convert from 'color-convert'

import SwipeContext from './../contexts/SwipeContext'

const waves = () => {
  // Contexts
  const [swipe] = useContext(SwipeContext)

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


  useEffect(() => {
    // console.log(swipe)
  }, [swipe])

  let onResize = e => {
    const { width, height } = container.current.getBoundingClientRect()

    setSizes({
      width,
      height,
    })
  }

  onResize = onResize.bind(this)

  // Init and destroy
  useEffect(() => {
    init()

    window.addEventListener('resize', onResize)

    return () => {
      destroy()

      window.removeEventListener('resize', onResize)
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

    settings.current.camera.aspect = sizes.width / sizes.height
    settings.current.camera.updateProjectionMatrix()
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

    if (document?.location?.hash === '#debug') {
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

      uniformsFolder
        .addColor(initial.uniforms, 'uColor1')
        .onChange(v => {
          const rgb = convert.hex.rgb(v).map(c => c / 256)

          settings.current.material.uniforms.uColor1.value = rgb
        })

      uniformsFolder
        .addColor(initial.uniforms, 'uColor2')
        .onChange(v => {
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

      gui.current.close()

      // Dat.GUI [end]
    }

    // Create Scene
    settings.current.scene = new THREE.Scene()
    // settings.current.scene.background = new THREE.Color(0x20162c)
    settings.current.scene.background = new THREE.Color(initial.scene.backgroundColor)

    // Create Camera
    settings.current.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)

    // SETTINGS 1
    // settings.current.camera.position.set(0, 0, -1)
    // settings.current.camera.lookAt(0, 0, 0)
    
    // SETTINGS 2
    settings.current.camera.position.set(-2, 2, 0)
    settings.current.camera.lookAt(0, 0, 0)

    // Create ground
    const geometry = new THREE.PlaneBufferGeometry(8.0, 8.0, 256.0, 256.0)
    settings.current.material = new THREE.ShaderMaterial()
    // settings.current.material = new THREE.ShaderMaterial({
    //   fragmentShader: require('./ground.frag').default,
    //   vertexShader: require('./ground.vert').default,
    //   uniforms: {
    //     uTime: { value: 0.0 },
    //     uSize: { value: initial.uniforms.uSize },
    //     uMove: { value: initial.uniforms.uMove ? 1.0 : 0.0 },
    //     uColor1: { value: convert.hex.rgb(initial.uniforms.uColor1).map(c => c / 256)},
    //     uColor2: { value: convert.hex.rgb(initial.uniforms.uColor2).map(c => c / 256)},
    //     uDepth: { value: initial.uniforms.uDepth },
    //     uLimit: { value: initial.uniforms.uLimit },
    //   },
    //   transparent: false,
    // })
    const mesh = new THREE.Mesh(geometry, settings.current.material)

    mesh.rotation.x = - Math.PI / 2
    // mesh.position.y = -1

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

    createOrbitControls()
  }
 
  const update = () => {
    settings.current.composer && settings.current.composer.render(settings.current.scene, settings.current.camera)

    // if (settings.current.material) {
    //   settings.current.material.uniforms.uTime.value = time
    // }
  }

  const destroy = () => {
    gui.current && gui.current.destroy()
  }

  const createOrbitControls = () => {
    new OrbitControls(settings.current.camera, settings.current.renderer.domElement)
  }

  return (
    <div className={styles.waves}>
      <div className={styles.container} ref={container}>
      </div>
    </div>
  )
}

export default waves
