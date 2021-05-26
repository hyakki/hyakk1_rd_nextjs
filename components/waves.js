import * as THREE from 'three'
import React, { useEffect, useState, useRef } from 'react'

let OrbitControls = require('three-orbit-controls')(THREE)

import glsl from 'glslify'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import styles from './waves.module.scss'

import { useAnimationFrame } from './utils'

const waves = () => {
  // Refs
  const container = useRef(null)

  // States
  const [time, setTime] = useState(0)
  const [scene, setScene] = useState(null)

  // const [composer, setComposer] = useState()
  // const [ground, setGround] = useState({
  //   material,
  //   mesh,
  //   geometry,
  // })
  const [sizes, setSizes] = useState({
    width: 0,
    height: 0,
  })

  // Init and destroy
  useEffect(() => {
    init()

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
    // renderer.setSize(sizes.width, sizes.height)
    console.log('update renderer size')
  }, [sizes])

  useEffect(() => {
    console.log('scene updated')
  }, [scene])


  // Lifecycle
  const init = () => {
    console.log('init')
    const { width, height } = container.current.getBoundingClientRect()

    setSizes({
      width,
      height,
    })

    // Create Scene
    const _scene = new THREE.Scene()
    _scene.background = new THREE.Color(0x20162c)

    // Create Camera
    const _camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)
    _camera.position.x = 1
    _camera.position.z = 1
    _camera.lookAt(0, 0, 0)

    // Create ground
    const _geometry = new THREE.PlaneBufferGeometry(8.0, 8.0, 256.0, 256.0)
    const _material = new THREE.ShaderMaterial({
      fragmentShader: require('./ground.frag').default,
      vertexShader: require('./ground.vert').default,
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 2.5 },
      },
      transparent: true,
    })
    const _mesh = new THREE.Points(_geometry, _material)

    _mesh.rotation.x = Math.PI / 2
    _mesh.position.y = -1

    // Add mesh to scene
    _scene.add(_mesh)

    // Create Renderer
    const _renderer = new THREE.WebGLRenderer({ antialias: false })
    _renderer.setSize(width, height)

    const _renderPass = new RenderPass(_scene, _camera)

    const _bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1, // strength
      0.3, // radius
      0.3, // threshold
    )

    const _composer = new EffectComposer(_renderer)
    _composer.addPass(_renderPass)
    _composer.addPass(_bloomPass)

    container.current.appendChild(_renderer.domElement)

    setComposer(_composer)

    // createScene()
    // createGround()
    // createRenderer()
    // createOrbitControls()

    // const { width, height } = container.current.getBoundingClientRect()

    // setSizes({width, height})

    // // renderer.setSize(width, height)

    // console.log('appendChild')
    // container.current.appendChild(renderer.domElement)
  }
 
  const update = () => {
    console.log('update')

    // composer && composer.render(scene, camera)
    
    // if (ground.material) {
    //   ground.material.uniforms.uTime.value = time
    // }
  }

  const destroy = () => {
    console.log('destroy')
  }

  // Width, height
  // useEffect(() => {
  //   // const { width, height } = container.current.getBoundingClientRect()
    
  //   console.log(sizes.width, sizes.height)

  //   composer && composer.setSize(sizes.width, sizes.height)
  // }, [composer, sizes])

  // const [state, setState] = useState({
  //   time: 0,
  //   camera,
  //   scene,
  //   renderer,
  //   geometry,
  //   material,
  //   mesh,
  //   groundGeometry,
  //   groundMaterial,
  //   groundMesh,
  //   composer,
  //   renderPass,
  //   bloomPass,
  //   settings,
  //   gui,
  // })
  
  // let time = 0
  // let camera, scene, renderer
  // let geometry, material, mesh
  // // let groundGeometry, groundMaterial, groundMesh
  // let renderPass, bloomPass
  // let settings

  // const setSize = () => {
  //   const { width, height } = container.current.getBoundingClientRect()

  //   renderer.setSize(width, height)
  // }

  // const setCameraAspect = () => {
  //   const { width, height } = container.current.getBoundingClientRect()

  //   camera.aspect = width / height
  //   camera.updateProjectionMatrix()
  // }

  const createCamera = () => {
    const { width, height } = container.current.getBoundingClientRect()
    camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)
    camera.position.x = 1
    camera.position.z = 1
    camera.lookAt(0, 0, 0)
  }

  const createScene = () => {
    const s = new THREE.Scene()
    s.background = new THREE.Color(0x20162c)

    setScene(s)
  }

  const createRenderer = () => {
    const { width, height } = container.current.getBoundingClientRect()

    renderer = new THREE.WebGLRenderer({ antialias: false })
    renderPass = new RenderPass(scene, camera)

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1, // strength
      0.3, // radius
      0.3, // threshold
    )

    const c = new EffectComposer(renderer)
    c.addPass(renderPass)
    c.addPass(bloomPass)

    setComposer(c)

    // composer.addPass(renderPass)
    // composer.addPass(bloomPass)
    // bloomPass.renderToScreen = true
  }
  const createOrbitControls = () => {
    new OrbitControls(camera, renderer.domElement)
  }

  const createGround = () => {
    console.log('createGround')

    if (!scene) {
      return
    }

    const geometry = new THREE.PlaneBufferGeometry(8.0, 8.0, 256.0, 256.0)
    const material = new THREE.ShaderMaterial({
      fragmentShader: require('./ground.frag').default,
      vertexShader: require('./ground.vert').default,
      uniforms: {
        uTime: { value: 0.0 },
        uSize: { value: 2.5 },
      },
      transparent: true,
    })
    const mesh = new THREE.Points(geometry, material)

    mesh.rotation.x = Math.PI / 2
    mesh.position.y = -1

    setGround({
      material,
      geometry,
      mesh,
    })

    scene.add(mesh)
  }

  // const viewportHandler = () => {
  //   setSize()
  //   setCameraAspect()
  // }

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
