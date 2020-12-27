import * as BABYLON from 'babylonjs';

export const GameEvents = {
    LEVEL_LOADED_COMPLETED: "LEVEL_LOADED_COMPLETED",
    START_ATTACK: "START ATTACK"
}

export class GameEvent{
    scene:BABYLON.Scene
    camera:BABYLON.ArcRotateCamera
    source:BABYLON.Mesh
    target:BABYLON.Mesh
    constructor(
        scene:BABYLON.Scene,
        camera:BABYLON.ArcRotateCamera,
        source:BABYLON.Mesh
        ,target:BABYLON.Mesh){
        this.source = source;
        this.target = target;
        this.scene = scene;
        this.camera = camera;
    }
}  
let OnAttackTargetChosen:BABYLON.Observable<GameEvent>;
export const CombatEventsDispatcher = ()=>{
    if(OnAttackTargetChosen === undefined || OnAttackTargetChosen === null ){
        OnAttackTargetChosen = new BABYLON.Observable<GameEvent>();
    }
    return OnAttackTargetChosen
} 
