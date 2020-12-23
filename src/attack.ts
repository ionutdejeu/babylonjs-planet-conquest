import {OnAttackTargetChosen,GameEvent} from './combat_events';
import * as BABYLON from '@babylonjs/core';
import { time, timeStamp } from 'console';
import { scene } from './babylon';
 
let battleShipModel:BABYLON.Mesh;
let plannetsAttacks:Array<PlanetAttackEvent>  = []
const attackDurationInMs:number = 10000;
const intervalBetweenShipSpawn:number = 1200;
const battleShipFlightTime:number = 100;
export class PlanetAttackEvent
{
    event:GameEvent
    trajectory:BABYLON.Curve3
    trajectoryAnimKeysPosition:Array<BABYLON.IAnimationKey> = []; 
    trajectoryAnimkeysRotation:Array<BABYLON.IAnimationKey> = [];
    animationPosition:BABYLON.Animation;
    animationRotation:BABYLON.Animation;
    animGroup:BABYLON.AnimationGroup;
    totalCount:number
    interval:number=0;
    progress:number;
    spawnPerSec:number;
    nextShipSpawnTimestamp:number = 0;
    startTimeStamp:number=0;
    shipTimestamps:Array<number>=[];
    shipMeshes:Array<BABYLON.InstancedMesh> = []
    sceneRenderCallback:any;
    trajectoryDebug:BABYLON.LinesMesh|undefined;
    constructor(gEvt:GameEvent,curve:BABYLON.Curve3,count:number,showDebug:boolean=false){
        this.event = gEvt;
        this.trajectory = curve;
        this.animationPosition = new BABYLON.Animation("animPos", "position", 10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        this.animationRotation = new BABYLON.Animation("animRot", "rotation", 10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);	
    
        let path3d = new BABYLON.Path3D(this.trajectory.getPoints());
        for(let p = 0; p < this.trajectory.getPoints().length; p++) {
            this.trajectoryAnimKeysPosition.push({
                frame: p,
                value: this.trajectory.getPoints()[p]
            });
    
            this.trajectoryAnimkeysRotation.push({
                frame: p,
                value: BABYLON.Vector3.RotationFromAxis(path3d.getNormals()[p], path3d.getBinormals()[p], path3d.getTangents()[p])
            });
        }
        this.animationPosition.setKeys(this.trajectoryAnimKeysPosition);
        this.animationRotation.setKeys(this.trajectoryAnimkeysRotation);
        // Create the animation group
        this.animGroup = new BABYLON.AnimationGroup("Attack");
        this.animGroup.play(true);
        this.totalCount = count;
        this.progress = 0;
        this.spawnPerSec = Math.floor(attackDurationInMs/this.totalCount);
        // spawn one ship every x miliseconds 
        this.interval = window.setTimeout(() => {
            this.event.scene.onBeforeRenderObservable.remove(this.sceneRenderCallback);
            console.log('Attack completed');
            //this.animGroup.stop();
            if(showDebug){
                this.trajectoryDebug?.dispose();
            }
            this.animGroup.stop();
            this.animGroup.dispose()
            for(let i=0;i<this.shipMeshes.length;i++){
                this.shipMeshes[i].dispose();
            }
        }, attackDurationInMs);
        this.sceneRenderCallback = this.event.scene.onBeforeRenderObservable.add((scene:BABYLON.Scene,evtState:BABYLON.EventState)=>this.update(scene,evtState));
        this.startTimeStamp = Date.now();
        this.nextShipSpawnTimestamp = Date.now() + intervalBetweenShipSpawn;
        
        if(showDebug){
            this.trajectoryDebug = BABYLON.Mesh.CreateLines("trajectorAttack_"+gEvt.source.name+"_to_"+gEvt.target.name, this.trajectory.getPoints(), scene);
            this.trajectoryDebug.color = new BABYLON.Color3(1, 1, 0.5);
        }
    }
    
    update(scene:BABYLON.Scene,evtState:BABYLON.EventState){
        let currStamp = Date.now();
        if(this.nextShipSpawnTimestamp<currStamp){
            let newShip = battleShipModel.createInstance('clone'+currStamp.toString())
            newShip.isVisible = true;
            newShip.position = this.event.source.position.clone();
            this.shipTimestamps.push(currStamp);
            this.shipMeshes.push(newShip);
            this.animGroup.addTargetedAnimation(this.animationPosition.clone(), newShip);
            this.animGroup.addTargetedAnimation(this.animationRotation.clone(), newShip);
            this.animGroup.play(true);
            this.nextShipSpawnTimestamp += intervalBetweenShipSpawn;
        }
    }
    
}

const onAttackTargetChosenCallback=(evt:GameEvent,evtState:BABYLON.EventState)=>{
    let middlePoint = BABYLON.Vector3.Lerp(evt.source.position,evt.target.position,0.5);
    //evt.scene.onBeforeRenderObservable.add
    middlePoint=middlePoint.add(BABYLON.Axis.Y.scale(BABYLON.Vector3.Distance(evt.source.position,evt.target.position)/2));
    //let handlepointMesh=BABYLON.Mesh.CreateBox("curverHandlePoint"+evt.source.name, 5, scene);
    //handlepointMesh.position = middlePoint;
    let newPlannetAttack = new PlanetAttackEvent( evt,
    BABYLON.Curve3.CreateQuadraticBezier(evt.source.position,middlePoint, evt.target.position,10),
    1,
    true);
  
   
}

export const SetupAttackBehavior = (scene:BABYLON.Scene)=>{
    OnAttackTargetChosen.add(onAttackTargetChosenCallback);
    var redMat = new BABYLON.StandardMaterial("ground", scene);
    redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    redMat.emissiveColor = BABYLON.Color3.Red();
    

    battleShipModel = BABYLON.Mesh.CreateBox("battleship", 5, scene);
    battleShipModel.material = redMat;
    battleShipModel.isVisible = true;
}