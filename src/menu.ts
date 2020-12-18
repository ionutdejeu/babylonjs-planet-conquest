import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

 
export let menuCtrl:GUI.AdvancedDynamicTexture;
export let menuButtonPlay:GUI.Button;

export const createMenu = (scene:BABYLON.Scene)=>{

    menuCtrl = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI",true,scene);
    menuButtonPlay = GUI.Button.CreateSimpleButton("but", "Click Me");
    menuButtonPlay.width = 0.2;
    menuButtonPlay.height = "40px";
    menuButtonPlay.color = "white";
    menuButtonPlay.background = "green";
    menuCtrl.addControl(menuButtonPlay);    
}