import { extend } from '@react-three/fiber'
import { Mesh, MeshPhysicalMaterial, Group, AmbientLight, DirectionalLight } from 'three'

// Extend Three.js elements for react-three-fiber
extend({ Mesh, MeshPhysicalMaterial, Group, AmbientLight, DirectionalLight })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any
      meshPhysicalMaterial: any
      group: any
      ambientLight: any
      directionalLight: any
    }
  }
}