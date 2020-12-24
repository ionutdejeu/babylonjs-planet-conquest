import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

 
export let menuCtrl:GUI.AdvancedDynamicTexture;
export let menuButtonPlay:GUI.Button;
export let menuOptionsBtn:GUI.Button;
let uiGrid;



export const createMenu = (scene:BABYLON.Scene)=>{

    uiGrid = new GUI.Grid();   
    uiGrid.addColumnDefinition(0.2);
    uiGrid.addColumnDefinition(0.8);
    uiGrid.addRowDefinition(0.2);
    uiGrid.addRowDefinition(0.2);
    uiGrid.addRowDefinition(0.6);
    
    
    menuCtrl = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI",true,scene);
    
    menuButtonPlay = createButton("startGameButton", "Start Game");
    menuOptionsBtn = createButton("optionsBtn", "Options");


    menuCtrl.addControl(uiGrid);
    uiGrid.addControl(menuOptionsBtn,0,0);
    uiGrid.addControl(menuButtonPlay,1,0);    
}

const createButton=(controlName:string,controlTitle:string)=>{
    let btn = GUI.Button.CreateSimpleButton(controlName, controlTitle);
    btn.width =1;
    btn.height =1;
    btn.color = "white";
    btn.background = "blue";
    btn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    btn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    return btn
}