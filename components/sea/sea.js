import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
const OrbitControls = require('three-orbit-controls')(THREE)

import glsl from 'glslify'

import dat from 'dat.gui'

import React, { useContext, useEffect, useState, useRef } from 'react'
import { useAnimationFrame } from './../utils'

import styles from './sea.module.scss'

const sea = () => {
  // Refs
  const container = useRef(null)
  const gui = useRef(null)
  const settings = useRef({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    material: null,
    geometry: null,
    mesh: null,
    controls: null,
  })
  const debugObject = useRef({
    depthColor: '#186691',
    surfaceColor: '#9bd8ff',
  })

  // States
  const [time, setTime] = useState(0)
  const [sizes, setSizes] = useState({
    width: 0,
    height: 0,
  })

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

  // Create methods
  const createScene = () => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    return scene
  }

  const createCamera = (width, height) => {
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100)
    camera.position.x = 1
    camera.position.y = 1
    camera.position.z = 1

    camera.lookAt(0, 0, 0)

    return camera
  }

  const createGeometry = () => {
    return new THREE.PlaneBufferGeometry(10.0, 10.0, 512.0, 512.0)
  }

  const createMaterial = () => {
		const vertexShader = glsl(`
			${require('glsl-noise/classic/3d.glsl').default}
			${require('./glsl/sea.vert').default}
		`)
		const fragmentShader = glsl(`${require('./glsl/sea.frag').default}`)

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },
        uTime: { value: 0 },
        uDepthColor: { value: new THREE.Color(debugObject.current.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.current.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5.0 },
				uSmallWavesElevation: { value: 0.15 },
				uSmallWavesFrequency: { value: 3 },
				uSmallWavesSpeed: { value: 0.2 },
				uSmallWavesIterations: { value: 4 },
				uSize: { value: 1.0 },
      },
      side: THREE.DoubleSide,
			transparent: true,
    })
  }

  const createMesh = (geometry, material) => {
    const mesh = new THREE.Points(geometry, material)
    mesh.rotation.x = - Math.PI / 2

    return mesh
  }

  const createRenderer = (width, height) => {
    const renderer = new THREE.WebGLRenderer({ antialias: false })
    renderer.setSize(width, height)

    return renderer;
  }

  const createOrbitControls = (camera, element) => {
    return new OrbitControls(camera, element)
  }

  // Lifecycle
  const init = () => {
    const { width, height } = container.current.getBoundingClientRect()

    setSizes({
      width,
      height,
    })

    settings.current.scene = createScene()
    settings.current.camera = createCamera(width, height)
    settings.current.geometry = createGeometry()
    settings.current.material = createMaterial()
    settings.current.mesh = createMesh(settings.current.geometry, settings.current.material)

    settings.current.scene.add(settings.current.mesh)
    settings.current.renderer = createRenderer(width, height)
    settings.current.controls = createOrbitControls(settings.current.camera, settings.current.renderer.domElement)

    settings.current.renderer.render(settings.current.scene, settings.current.camera)

    container.current.appendChild(settings.current.renderer.domElement)

    if (document?.location?.hash === '#debug') {
      gui.current = new dat.GUI({ name: 'Params'} )

      gui.current.add(settings.current.material.uniforms.uBigWavesElevation, 'value')
        .min(0)
        .max(1)
        .step(0.001)
        .name('uBigWavesElevation')

      gui.current.add(settings.current.material.uniforms.uBigWavesFrequency.value, 'x')
        .min(0)
        .max(10)
        .step(0.001)
        .name('uBigWavesFrequencyX')

      gui.current.add(settings.current.material.uniforms.uBigWavesFrequency.value, 'y')
        .min(0)
        .max(10)
        .step(0.001)
        .name('uBigWavesFrequencyY')

      gui.current.add(settings.current.material.uniforms.uBigWavesSpeed, 'value')
        .min(0)
        .max(10)
        .step(0.001)
        .name('uBigWavesSpeed')

      gui.current.addColor(debugObject.current, 'depthColor')
        .name('depthColor')
        .onChange(() => {
          settings.current.material.uniforms.uDepthColor.value.set(debugObject.current.depthColor)
        })

      gui.current.addColor(debugObject.current, 'surfaceColor')
        .name('surfaceColor')
        .onChange(() => {
          settings.current.material.uniforms.uSurfaceColor.value.set(debugObject.current.surfaceColor)
        })

      gui.current.add(settings.current.material.uniforms.uColorOffset, 'value')
        .min(0)
        .max(3)
        .step(0.001)
        .name('uColorOffset')

      gui.current.add(settings.current.material.uniforms.uColorMultiplier, 'value')
        .min(0)
        .max(10)
        .step(0.001)
        .name('uColorMultiplier')

      gui.current.add(settings.current.material.uniforms.uSmallWavesElevation, 'value')
        .min(0)
        .max(1)
        .step(0.001)
        .name('uSmallWavesElevation')

      gui.current.add(settings.current.material.uniforms.uSmallWavesFrequency, 'value')
        .min(0)
        .max(30)
        .step(0.001)
        .name('uSmallWavesFrequency')

      gui.current.add(settings.current.material.uniforms.uSmallWavesSpeed, 'value')
        .min(0)
        .max(4)
        .step(0.001)
        .name('uSmallWavesSpeed')

      gui.current.add(settings.current.material.uniforms.uSmallWavesIterations, 'value')
        .min(0)
        .max(5)
        .step(1)
        .name('uSmallWavesIterations')

      gui.current.add(settings.current.material.uniforms.uSize, 'value')
        .min(1)
        .max(5)
        .step(0.1)
        .name('uSize')
    }
  }

  // Update
  const update = () => {
    // Update material
    settings.current.material.uniforms.uTime.value = time / 100.0

    // Render
    settings.current.renderer && settings.current.renderer.render(settings.current.scene, settings.current.camera)
  }

  const destroy = () => {
    gui.current && gui.current.destroy()
  }

  return (
    <div className={styles.sea}>
      <div className={styles.container} ref={container}>
      </div>
    </div>
  )
}

export default sea
