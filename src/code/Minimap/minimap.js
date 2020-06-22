import * as THREE from 'three';
import { MouseWork, KeyboardWork } from './../IOWorking/IOWork';
import { Vector3 } from 'three';

import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

import vertShaderStrMinimap from './minimap_vert.glsl';
import fragShaderStrMinimap from './minimap_frag.glsl';

/* Minimap clas */
export default class Minimap {
  constructor (canvas, renderer, isSaveProportion,
               windowOffsetXRatio, windowOffsetYRatio,
               windowWidthRatio, windowHeightRatio) {

    /* Tmp objects */
    this._tmpOperationV3 = new THREE.Vector3();
    this._tmpMemoryV3 = new THREE.Vector3();
    this._tmpM4 = new THREE.Matrix4();
    
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
    this._keyboardWork = new KeyboardWork(this._responseKeyboard.bind(this));
    this._isKeysLock = true;
    this._isMoveable = true;
    this._isMouseHandling = false;
    this._isFirstMouseResponse = false;
    this._lastMousePoint = new Vector3();

    //this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);

    /* Editor */
    this._editorSchoolMarking = {};
    this._editorCurFloor = -1;
    this._editorCurRoom = -1;

    
  }

  /* Initialization method */
  init (mapWidth, mapHeight, pathTex, nameTexFloors=[]) {

    /* Textures */
    this._texFloors = [];
    for (let i = 0; i < nameTexFloors.length; i++) {
      this._texFloors.push( (new THREE.TextureLoader().setPath(pathTex).load(nameTexFloors[i])) );
    }

    /* Floor params */
    this._curFloor = 0;

    /* Animation params */
    this._isAnimation = false;
    this._currentAnimation = undefined;

    /* Create primitives */
    let geometry;
    let material;

    /* Create plane */
    this._planeWidth = mapWidth;
    this._planeHeight = mapHeight;

    geometry = new THREE.PlaneGeometry(mapWidth, mapHeight, 1, 1);
    material = new THREE.ShaderMaterial( {
      //side: THREE.DoubleSide,
      uniforms: {
        uTexFloors: {value: this._texFloors},
      },
      vertexShader: vertShaderStrMinimap,
      fragmentShader: fragShaderStrMinimap
    } );


    /*
    material = new THREE.MeshBasicMaterial({color: 0xA9A9A9, 
                                            side: THREE.DoubleSide,
                                            map: this._texFloors[this._curFloor]});
    */
    this._plane = new THREE.Mesh(geometry, material);
    this._group.add(this._plane);
        
    /* Create surface */
    geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    material = new THREE.MeshBasicMaterial();
    this._surface = new THREE.Mesh(geometry, material);
    this._surface.visible = false;
    this._group.add(this._surface);

    /* Create sphere */
    //geometry = new THREE.SphereGeometry(0.2, 20, 20);
    geometry = new THREE.TorusGeometry(0.4, 0.06, 20, 20);
    material = new THREE.MeshBasicMaterial({color: 0xFF0000});
    this._pointer = new THREE.Mesh(geometry, material);
    this._scene.add(this._pointer);
    
    /* Create axes */
    this._axesHelper = new THREE.AxesHelper(5);
    this._group.add(this._axesHelper);
       
    /* Set camera params */
    this._camera.position.set(0, 0, 50);
    this._camera.lookAt(0, 0, 0);
    
    /* Handling group */
    this._group.position.set(0, 0, 0);
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
      if ( !this._isMouseHandling && this._mouseWork.getIsPressed &&
           this._isMouseCoordsInWindow(this._mouseWork.getPressX, this._mouseWork.getPressY) ) {
        this._isFirstMouseResponse = true;
        this._isMouseHandling = true;
      }
      if (!this._mouseWork.getIsPressed) {
        this._isMouseHandling = false;
      }

             
      if (this._isMouseHandling) {
        /* Get intersections */
        const raycaster = new THREE.Raycaster();
        let mouse = new THREE.Vector2();
        const coords = this._getMouseNormWindowCoords(this._mouseWork.mouseX, this._mouseWork.mouseY );
        mouse.set(coords.x, coords.y);
        raycaster.setFromCamera(mouse, this._camera);
        
        const intersects = raycaster.intersectObjects(this._group.children);



        /* Intersections response */
        for (let i = 0; i < intersects.length; i++) {
          if (intersects[i].object.id === this._surface.id) {
            this._tmpMemoryV3.copy(intersects[i].point);
          }
        }

        /* Movement */
        if (!this._isFirstMouseResponse) {
        this._movement(this._lastMousePoint, this._tmpMemoryV3);
        }

        /* Update last mouse point */
        this._lastMousePoint.copy(this._tmpMemoryV3);

        /* Response first mouse response flag */
        this._isFirstMouseResponse = false;

      }

      this._pointer.position.copy(this._lastMousePoint);
      this._keyboardWork.update();

    }
  }

  /* Get normalize mouse coords in minimap window */
  _getMouseNormWindowCoords (x, y) {
    const pixelRatio = window.devicePixelRatio;
    const resX = (x * pixelRatio - this._curWindowOffsetX) / this._curWindowWidth * 2 - 1;
    const resY = ((this._canvas.height - y * pixelRatio) - this._curWindowOffsetY) / this._curWindowHeight * 2 - 1;
    return {x: resX, y: resY};
  }

  /* Check mouse coords are in minimap window */
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
  _movement (startPoint, endPoint) {
    if (this._isMoveable) {
    this._group.position.add(this._tmpOperationV3.subVectors(endPoint, startPoint));
    }

  }

  /* Handle mouse click  method */
  _responseClick () {


  }

  /* Handle keyboard */
  _responseKeyboard (key) {
    /* Unlockable keys */
    switch (key) {
      case 'KeyL':
        this._isKeysLock = false;
        break;
      case 'KeyZ':
        this._isMoveable = true;
        break;
      case 'KeyX':
        this._isMoveable = false;
        break;
        
    }

    if (this._isKeysLock) {
      return;
    }

    /* Lockable keys */
    switch (key) {
      case 'KeyF':
        this._isKeysLock = true;
        this._editorCurFloor += 1;
        this._editorSchoolMarking[`floor_${this._editorCurFloor}`] = {};
        console.log(`Added floor #${this._editorCurFloor}`);
        break;
      case 'KeyR':
        if (this._editorSchoolMarking[`floor_${this._editorCurFloor}`] === undefined) { break };
        this._isKeysLock = true;
        this._editorCurRoom += 1;
        this._editorSchoolMarking[`floor_${this._editorCurFloor}`][`room_${this._editorCurRoom}`] = [];
        console.log(`Added room #${this._editorCurRoom}`);
        break;
      case 'KeyP':
        if (this._editorSchoolMarking[`floor_${this._editorCurFloor}`] === undefined ||
            this._editorSchoolMarking[`floor_${this._editorCurFloor}`][`room_${this._editorCurRoom}`] === undefined) {
          break
        };
        this._isKeysLock = true;
        this._plane.worldToLocal(this._tmpMemoryV3.copy(this._lastMousePoint));

        let coord = {};
        coord.x = this._tmpMemoryV3.x / this._planeWidth * 2;
        coord.y = this._tmpMemoryV3.y / this._planeHeight * 2;

        this._editorSchoolMarking[`floor_${this._editorCurFloor}`][`room_${this._editorCurRoom}`].push(coord);
        console.log(`Added coord ${JSON.stringify(coord)}`);
        break;
      case 'KeyC':
        this._isKeysLock = true;
        console.log(JSON.stringify(this._editorSchoolMarking));
        break;
    } 
  }

}


class MinimapAnimation {
  constructor () {


  }

  /* Response animation method */
  response () {

  }

}


