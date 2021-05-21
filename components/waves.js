import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'

let OrbitControls = require('three-orbit-controls')(THREE)

import glsl from 'glslify'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const waves = () => {
  const container = useRef(null)

  let time = 0
  let camera, scene, renderer
  let geometry, material, mesh
  let groundGeometry, groundMaterial, groundMesh
  let composer, renderPass, bloomPass

  const setSize = () => {
    const { width, height } = container.current.getBoundingClientRect()
    renderer.setSize(width, height)
    composer.setSize(width, height)
  }

  const setCameraAspect = () => {
    const { width, height } = container.current.getBoundingClientRect()
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const createCamera = () => {
    const { width, height } = container.current.getBoundingClientRect()
    camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100)
    camera.position.z = 1
  }

  const createScene = () => {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x20162c)
  }

  const createRenderer = () => {
    const { width, height } = container.current.getBoundingClientRect()
    renderer = new THREE.WebGLRenderer({ antialias: false })
    composer = new EffectComposer(renderer)
    renderPass = new RenderPass(scene, camera)
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      3.0, // strength
      1.0, // radius
      0.3 // threshold
    )
    composer.addPass(renderPass)
    composer.addPass(bloomPass)
    bloomPass.renderToScreen = true
  }
  const createOrbitControls = () => {
    new OrbitControls(camera, renderer.domElement)
  }

  const createGround = () => {
    groundGeometry = new THREE.PlaneBufferGeometry(8.0, 8.0, 200.0, 200.0)
    groundMaterial = new THREE.ShaderMaterial({
      fragmentShader: require('./ground.frag').default,
      vertexShader: require('./ground.vert').default,
      uniforms: {
        uTime: { value: 0.0 },
      },
      transparent: true,
    })
    groundMesh = new THREE.Points(groundGeometry, groundMaterial)
    groundMesh.rotation.x = Math.PI / 2
    groundMesh.position.y = -1
    scene.add(groundMesh)
  }

  const viewportHandler = () => {
    setSize()
    setCameraAspect()
  }

  const init = () => {
    createCamera()
    createScene()
    createGround()
    createRenderer()
    createOrbitControls()

    setSize()
    container.current.appendChild(renderer.domElement)

    update()
  }

  const update = () => {
    composer.render(scene, camera)

    time += 1

    groundMaterial.uniforms.uTime.value = time

    requestAnimationFrame(update)
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div style={{height: '100vh'}} ref={container}>
    </div>
  )
}

export default waves
