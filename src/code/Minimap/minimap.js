import * as THREE from 'three';
import { OrbitControls } from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { MouseWork } from './../IOWorking/IOWork';
import { Template } from 'webpack';



/* Minimap clas */
export default class Minimap {
  constructor (canvas, renderer, isSaveProportion,
               windowOffsetXRatio, windowOffsetYRatio,
               windowWidthRatio, windowHeightRatio) {

    
    /* Render objects */
    this._canvas = canvas;
    this._renderer = renderer;
        
    this._clearColor = 0x4B0082;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, 1, 
                                               0.1, 1000);
    
    /* Window params */
    this._isSaveProportion = isSaveProportion;
    this._offsetProportion = (canvas.width * windowOffsetXRatio) / (canvas.height *  windowOffsetYRatio);
    this._sizeProportion = (canvas.width * windowWidthRatio) / (canvas.height *  windowHeightRatio);

    this._windowOffsetXRatio = windowOffsetXRatio;
    this._windowOffsetYRatio = windowOffsetYRatio; 
    this._windowWidthRatio = windowWidthRatio; 
    this._windowHeightRatio = windowHeightRatio;

    this._curWindowOffsetX;
    this._curWindowOffsetY;
    this._curWindowWidth;
    this._curWindowHeight;
    this.resize();

    /* Main group */
    this._group = new THREE.Group();

    /* Controls */
    this._mouseWork = new MouseWork();
    this._isMouseHandling = true;
    
    /*document.onmousedown = (event) => {
      if (this._isMouseCoordsInWindow(event.x, event.y)) {
        this._isMouseHandling = true;
      } 
    }
    document.onmouseup = (event) => {
      this._isMouseHandling = false;
    }*/

    this.controls = new OrbitControls(this._camera, this._renderer.domElement);
  }

  /* Initialization method */
  init (mapWidth, mapHeight, pathTex, nameTexFloors=[]) {

    /* Textures */
    this._texFloors = [];
    for (let i = 0; i < nameTexFloors.length; i++) {
      this._texFloors.push( (new THREE.TextureLoader().setPath(pathTex).load(nameTexFloors[i])) );
    }

    /* Location params */
    this._curFloor = 0;

    /* Animation params */
    this._isAnimation = false;
    this._currentAnimation = undefined;

    /* Create primitive */
    const geometry = new THREE.PlaneGeometry(mapWidth, mapHeight, 5, 5);
    const material = new THREE.MeshBasicMaterial({color: 0xA9A9A9, 
                                                  side: THREE.DoubleSide,
                                                  map: this._texFloors[this._curFloor]});
    this._primitive = new THREE.Mesh(geometry, material);
    
    //this._primitive.add(new THREE.AxesHelper( 5 ));
    
    /* Create axes */
    this._axesHelper = new THREE.AxesHelper(5);
       
    /* Set camera params */
    this._camera.position.set(0, 0, 0);
    this._camera.lookAt(0, 0, -10);
    
    
    /* Handling group */
    this._group.add(this._primitive);
    this._group.add(this._axesHelper);

    this._group.position.set(0, 0, -100);
    this._scene.add(this._group);

    
  }

  resize () {
    /* Compute current window params */
    if (this._isSaveProportion) {
      if (this._canvas.width < this._canvas.height) {
        this._curWindowOffsetX = this._windowOffsetXRatio * this._canvas.width;
        this._curWindowOffsetY = this._curWindowOffsetX / this._offsetProportion;
        this._curWindowWidth = this._windowWidthRatio * this._canvas.width;
        this._curWindowHeight = this._curWindowWidth / this._sizeProportion;
      } else {
        this._curWindowOffsetY = this._windowOffsetYRatio * this._canvas.height;
        this._curWindowOffsetX = this._curWindowOffsetY * this._offsetProportion;
        this._curWindowHeight = this._windowHeightRatio * this._canvas.height;
        this._curWindowWidth = this._curWindowHeight * this._sizeProportion;
      }
    } else {
      this._curWindowOffsetX = this._windowOffsetXRatio * this._canvas.width;
      this._curWindowOffsetY = this._windowOffsetYRatio * this._canvas.height;
      this._curWindowWidth = this._windowWidthRatio * this._canvas.width;
      this._curWindowHeight = this._windowHeightRatio * this._canvas.height;
    }

    /* Set new camera projection */
    this._camera.aspect = this._curWindowWidth / this._curWindowHeight;
    this._camera.updateProjectionMatrix();
  }

  /* Drawing method */
  draw () {
    /* Memory current params */
    const oldClearColor = new THREE.Color();
    oldClearColor.copy( this._renderer.getClearColor() );
    const oldViewport = new THREE.Vector4();
    this._renderer.getCurrentViewport(oldViewport);
    
    /* Render set new params */
    this._renderer.setClearColor(this._clearColor);
    this._renderer.clearDepth();
    this._renderer.setScissorTest(true);

    this._renderer.setScissor(this._curWindowOffsetX, this._curWindowOffsetY,
                              this._curWindowWidth, this._curWindowHeight);
    this._renderer.setViewport(this._curWindowOffsetX, this._curWindowOffsetY,
                               this._curWindowWidth, this._curWindowHeight);

    /* Draw */
    this._renderer.render(this._scene, this._camera);

    /* Render restore params */
    this._renderer.setClearColor(oldClearColor);
    this._renderer.setScissorTest(false);
    this._renderer.setViewport(oldViewport);
  }

  /* Response method */
  response () {
  

    /* Check animation */
    if (this._isAnimation) {
      /* Check animation progress */
      

    } else {
      /* Mouse response */

      /* Check mouse status */
      if ( this._mouseWork.getIsPressed &&
           this._isMouseCoordsInWindow(this._mouseWork.getPressX, this._mouseWork.getPressY) ) {
        

        this._group.applyMatrix4( (new THREE.Matrix4()).makeTranslation(-this._mouseWork.getXChange, this._mouseWork.getYChange, 0) );

        this._clearColor = 0x00FF00;
      } else {
        this._clearColor = 0xFF0000;
      }



    }
  }


  _isMouseCoordsInWindow(x, y) {
    const pixelRatio = window.devicePixelRatio;
    return (x * pixelRatio > this._curWindowOffsetX && 
            x * pixelRatio < this._curWindowOffsetX + this._curWindowWidth &&
            this._canvas.height - y * pixelRatio > this._curWindowOffsetY && 
            this._canvas.height - y * pixelRatio < this._curWindowOffsetY + this._curWindowHeight)
    }

  /* Set floor method */
  setFloor (floor) {

    /* Set animation */
    if (floor != this._curFloor) {
      /* Changing floor animation */
      this._isAnimation = true;
      //this._currentAnimation = ...
    }

    /* Set current floor */
    this._curFloor = floor;
  }

  /* Make movement method */
  _movement () {

  }

  /* Handle mouse click  method */
  _handleClick() {


  }

}


class MinimapAnimation {
  constructor () {


  }

  /* Response animation method */
  response () {

  }

}