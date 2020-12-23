import 'pepjs'

import { HemisphericLight, Vector3, MeshBuilder, PBRMetallicRoughnessMaterial, Color3, SceneLoader } from '@babylonjs/core'
import { createEngine, createScene, createPBRSkybox, createArcRotateCamera,createSpaceSkypox, camera } from './babylon'
import { createMenu } from './menu'
import { createLevel } from './battlefield';
import {SetupAttackBehavior} from './attack';
// Import stylesheets
// import './index.css';

const canvas: HTMLCanvasElement = document.getElementById('root') as HTMLCanvasElement
const engine = createEngine(canvas)
const scene = createScene()
let gameCamera;
// main function that is async so we can call the scene manager with await
const main = async () => {

  //createPBRSkybox()
  createSpaceSkypox()
  gameCamera= createArcRotateCamera()
  
  createMenu(scene);
  createLevel(scene,gameCamera);
  SetupAttackBehavior(scene);
  

  // Start the scene
  engine.runRenderLoop(() => {
    scene.render()
  })
}

// start the program
main()
