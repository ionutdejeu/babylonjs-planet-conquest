import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

//import 'babylonjs-inspector'; 



export let canvas: HTMLCanvasElement
export let engine: BABYLON.Engine
export let scene: BABYLON.Scene
export let camera: BABYLON.ArcRotateCamera
let handleResize: any

export const createEngine = (hostCanvas: HTMLCanvasElement) => {
  canvas = hostCanvas
  engine = new BABYLON.Engine(canvas, true, {}, true)

  handleResize = () => engine.resize()
  window.addEventListener('resize', handleResize)

  return engine
}

export const createScene = () => {
  scene = new BABYLON.Scene(engine)

  scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1)

  // optimize scene for opaque background
  scene.autoClear = false
  scene.autoClearDepthAndStencil = false

  // show the inspector when pressing shift + alt + I
  //scene.onKeyboardObservable.add(({ event }) => {
  //  if (event.ctrlKey && event.shiftKey && event.code === 'KeyI') {
  //    if (scene.debugLayer.isVisible()) {
  //      scene.debugLayer.hide()
  //    } else {
  //      scene.debugLayer.show()
  //    }
  //  }
  //})

  return scene
}

export const createArcRotateCamera = () => {
    const startAlpha = -1.5
    const startBeta = 1.4
    const startRadius = 100
    const startPosition = new BABYLON.Vector3(0, 30, 0)
    const camera = new BABYLON.ArcRotateCamera('camera', startAlpha, startBeta, startRadius, startPosition, scene, true)
    camera.attachControl(canvas, false);

    // Set some basic camera settings
    camera.minZ = 1 // clip at 1 meter

    camera.panningAxis = new BABYLON.Vector3(1, 0, 1) // pan along ground
    camera.panningSensibility = 1000 // how fast do you pan, set to 0 if you don't want to allow panning
    camera.panningOriginTarget = BABYLON.Vector3.Zero() // where does the panning distance limit originate from
    camera.panningDistanceLimit = 100 // how far can you pan from the origin
    
    camera.allowUpsideDown = false // don't allow zooming inverted
    camera.lowerRadiusLimit = 2 // how close can you zoom
    camera.upperRadiusLimit = 500 // how far out can you zoom
    camera.lowerBetaLimit = 0.5 // how high can you move the camera
    camera.upperBetaLimit = 1.4 // how low down can you move the camera
    
    camera.checkCollisions = true // make the camera collide with meshes
    camera.collisionRadius = new BABYLON.Vector3(2, 2, 2) // how close can the camera go to other meshes
    
    return camera
}

export const createPBRSkybox = () => {
  
  const environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
    'https://assets.babylonjs.com/environments/environmentSpecular.env',
    scene,
  )
  
  const skyboxMesh = scene.createDefaultSkybox(environmentTexture, true, 1000, 0.5, true)
  
  return skyboxMesh
}

export const createSpaceSkypox=()=>{
  //var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
	//var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	//skyboxMaterial.backFaceCulling = false;
	//skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/Skybox_1/", scene,[".png"],false,[Right_2K_TEX,Left_2K_TEX,Down_2K_TEX,Up_2K_TEX,Front_2K_TEX,Back_2K_TEX]);
	//skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	//skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	//skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	//skybox.material = skyboxMaterial;			
}
