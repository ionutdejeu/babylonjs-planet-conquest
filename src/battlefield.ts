import * as BABYLON from '@babylonjs/core';
import {GameEvent, OnAttackTargetChosen} from './combat_events';
import { start } from 'repl';
import grid_png from './textures/grid-png.png'


let dragStarted:boolean = false;
let startingPoint:BABYLON.Vector3|undefined; 
let startingMesh:BABYLON.Mesh;

let light1:BABYLON.PointLight,light2:BABYLON.PointLight,light3:BABYLON.PointLight;
let planets:Array<BABYLON.Mesh> = [];
let ground:BABYLON.Mesh,groundMaterial:BABYLON.StandardMaterial;
let directionIndicator:BABYLON.Mesh;
let directionIndicators = [];
let directionIndicatorsPaths:Array<Array<BABYLON.Vector3>>= [];


const planetPrepareActions =(mesh:BABYLON.Mesh,scene:BABYLON.Scene)=>{
    // for now only inlitialize the prepare actions 
    mesh.actionManager = new BABYLON.ActionManager(scene);
}

export const createCombatAssets=(scene:BABYLON.Scene,camera:BABYLON.ArcRotateCamera)=>{

    directionIndicatorsPaths.push([BABYLON.Vector3.Zero(),BABYLON.Vector3.Zero()]);
    directionIndicator = BABYLON.MeshBuilder.CreateLines("directionIndicatorSingleton", {points: directionIndicatorsPaths[0],updatable:true}, scene);
    directionIndicator.isVisible = false;
    //directionIndicators.push(BABYLON.MeshBuilder.CreateLines("directionIndicatorLine", {points: dirIndicator,updatable:true}, scene));
}

export const updateDirectionalIndicators=(scene:BABYLON.Scene,origin:BABYLON.Vector3,target:BABYLON.Vector3)=>{
    let vertData = directionIndicator.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if(vertData!==null) {
        vertData[0] = origin.x;
        vertData[1] = origin.y;
        vertData[2] = origin.z;
        vertData[3] = target.x;
        vertData[4] = target.y;
        vertData[5] = target.z;
        directionIndicator.updateVerticesData(BABYLON.VertexBuffer.PositionKind, vertData);
    }
}



const planetHightlightAction =(mesh:BABYLON.Mesh)=>{
    mesh.actionManager?.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh.material, "emissiveColor", ((mesh.material) as BABYLON.StandardMaterial).emissiveColor));
    mesh.actionManager?.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh.material, "emissiveColor", BABYLON.Color3.White()));
    mesh.actionManager?.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, "scaling", new BABYLON.Vector3(1, 1, 1), 150));
    mesh.actionManager?.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, "scaling", new BABYLON.Vector3(1.1, 1.1, 1.1), 150));
}

const getGroundPostion=(scene:BABYLON.Scene):BABYLON.PickingInfo|null=>{
    let pickInfo = scene.pick(scene.pointerX,scene.pointerY,(mesh:BABYLON.AbstractMesh)=>{
        return mesh.id === ground.id
    });
    if(pickInfo) return pickInfo;
    return null;
}

const onCanvasPointerDown=(scene:BABYLON.Scene,camera:BABYLON.ArcRotateCamera,evt:PointerEvent, pickInfo:BABYLON.PickingInfo)=>{  
    if(evt.button!==0){
        return;
    }
    if(pickInfo.pickedMesh?.id !== ground.id){
        let groundPos = getGroundPostion(scene);
        
        
        if(groundPos?.hit){
            dragStarted = true;
            directionIndicator.isVisible = true;
            startingPoint = groundPos.pickedPoint?.clone();
            if(pickInfo.pickedMesh !== null){
                startingMesh = pickInfo.pickedMesh as BABYLON.Mesh;
            }
            let ctrl = scene.getEngine().getInputElement();
            if (ctrl !== null) camera.detachControl(ctrl);
        }
        else{
            startingPoint = undefined;
        }
    }
}

const onCanvasPointerUp=(scene:BABYLON.Scene,camera:BABYLON.ArcRotateCamera,
    evt:PointerEvent, 
    pickInfo:BABYLON.Nullable<BABYLON.PickingInfo>)=>{
    if(dragStarted === true && startingPoint!==undefined){
        let ctrl = scene.getEngine().getInputElement();
        if (ctrl !== null) camera.attachControl(ctrl);
        dragStarted = false;
        directionIndicator.isVisible = false;
        if(pickInfo!=null && 
            pickInfo.pickedMesh?.id !== ground.id && 
            pickInfo.pickedMesh!=null){
            OnAttackTargetChosen.notifyObservers(new GameEvent(scene,camera,startingMesh,(pickInfo.pickedMesh as BABYLON.Mesh)));
        }
         
    }
}

const onCanvasPointerMove = (scene:BABYLON.Scene,camera:BABYLON.ArcRotateCamera,evt:PointerEvent, pickInfo:BABYLON.PickingInfo)=>{
    if(dragStarted===true && startingPoint!==undefined){
        let groundPos = getGroundPostion(scene);
        
        if(groundPos?.pickedPoint!==null && groundPos?.pickedPoint!==undefined)
            updateDirectionalIndicators(scene,startingPoint,groundPos?.pickedPoint)
    }
}


export const createLevel = function (scene:BABYLON.Scene,camera:BABYLON.ArcRotateCamera) {
    
    light1 =  new BABYLON.PointLight("omni", new BABYLON.Vector3(0, 50, 0), scene);
    light2 = new BABYLON.PointLight("omni", new BABYLON.Vector3(0, 50, 0), scene);
    light3 = new BABYLON.PointLight("omni", new BABYLON.Vector3(0, 50, 0), scene);

    light1.diffuse = BABYLON.Color3.Red();
    light2.diffuse = BABYLON.Color3.Green();
    light3.diffuse = BABYLON.Color3.Blue();

    // Define states
    light1.state = "on";
    light2.state = "on";
    light3.state = "on";

    // Ground
    ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
    let groundTexture = new BABYLON.Texture(grid_png, scene);
    groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    //groundMaterial.specularColor = BABYLON.Color3.Black();
    groundTexture.hasAlpha = true;
    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.alpha = 0.5;
    groundMaterial.useAlphaFromDiffuseTexture = true;
    ground.material = groundMaterial;
    

    ground.freezeWorldMatrix();
    ground.freezeNormals();

    // Boxes
    var redBox = BABYLON.Mesh.CreateBox("red", 15, scene);
    var redMat = new BABYLON.StandardMaterial("red_material", scene);
    redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    redMat.emissiveColor = BABYLON.Color3.Red();
    redBox.material = redMat;
    redBox.position.x -= 100;
    planets.push(redBox);

    var greenBox = BABYLON.Mesh.CreateBox("green", 15, scene);
    var greenMat = new BABYLON.StandardMaterial("green_material", scene);
    greenMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    greenMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    greenMat.emissiveColor = BABYLON.Color3.Green();
    greenBox.material = greenMat;
    greenBox.position.z -= 100;
    planets.push(greenBox);

    var blueBox = BABYLON.Mesh.CreateBox("blue", 15, scene);
    var blueMat = new BABYLON.StandardMaterial("blue_material", scene);
    blueMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    blueMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    blueMat.emissiveColor = BABYLON.Color3.Blue();
    blueBox.material = blueMat;
    blueBox.position.x += 100;
    planets.push(blueBox);

    // Sphere
    var sphere = BABYLON.Mesh.CreateSphere("sphere", 6, 5, scene);
    var sphereMat = new BABYLON.StandardMaterial("sphere_material", scene);
    sphereMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    sphereMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    sphereMat.emissiveColor = BABYLON.Color3.Purple();
    sphere.material = sphereMat;
    sphere.position.z += 100;
    planets.push(sphere);


    createCombatAssets(scene,camera);
    for (let i = 0; i < planets.length; i++) {
        const p = planets[i];
        planetPrepareActions(p,scene);
        planetHightlightAction(p);
    }

    scene.onPointerDown = (evt:PointerEvent,pickInfo:BABYLON.PickingInfo,type:BABYLON.PointerEventTypes)=>{
        onCanvasPointerDown(scene,camera,evt,pickInfo);
    };
    scene.onPointerUp = (evt:PointerEvent,pickInfo:BABYLON.Nullable<BABYLON.PickingInfo>)=>{
        onCanvasPointerUp(scene,camera,evt,pickInfo);
    };
    scene.onPointerMove = (evt:PointerEvent,pickInfo:BABYLON.PickingInfo,type:BABYLON.PointerEventTypes)=>{
        onCanvasPointerMove(scene,camera,evt,pickInfo);
    };
}