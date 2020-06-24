import * as THREE from 'three';
import { MouseWork, KeyboardWork } from './../IOWorking/IOWork';
import { Vector3 } from 'three';

import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

import vertShaderStrPlane from './plane_vert.glsl';
import fragShaderStrPlane from './plane_frag.glsl';
import txtSchoolMarking from '../../bin/minimap/school_marking.txt';


function _setForEach (array, properties) {
  for (const item of array) {
    for (const prop in properties) {
      if (prop in item) {
        item[prop] = properties[prop];
      }
    }
  }
}


function _getCoef(isUp, isDouble, x, power) {
  if (x >= 1) { return 1 };
  if (x <= 0) { return 0 };

  if (isUp) {
    if (isDouble) {
      return Math.abs(2 * x - 1) ** power;
    } else {
      return Math.abs(x) ** power;
    }
  } else {
    if (isDouble) {
      return 1 - Math.abs(2 * x - 1) ** power;
    } else {
      return 1 - Math.abs(x - 1) ** power;
    }
  }
}



/* Minimap clas */
export default class Minimap {
  constructor (canvas, renderer, isSaveProportion,
               windowOffsetXRatio, windowOffsetYRatio,
               windowWidthRatio, windowHeightRatio) {

    /* Tmp objects */
    this._tmpOperV3 = new THREE.Vector3();
    this._tmpMemV3 = new THREE.Vector3();
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

    /* School marking object */
    this._schoolMarking = JSON.parse(txtSchoolMarking);
  }

  /* Initialization method */
  init (mapWidth, mapHeight, pathTex, nameTexFloors=[]) {

    /* Textures */
    this._texFloors = [];
    for (let i = 0; i < nameTexFloors.length; i++) {
      this._texFloors.push( (new THREE.TextureLoader().setPath(pathTex).load(nameTexFloors[i])) );
    }

    /* School params */
    this._curFloor = 0;
    this._curRoom = 0;

    /* Animation params */
    this._animation = undefined;

    /* Create primitives */
    let geometry;
    let material;

    /* Create plane */
    this._planeWidth = mapWidth;
    this._planeHeight = mapHeight;

    geometry = new THREE.PlaneGeometry(mapWidth, mapHeight, 1, 1);
    material = new THREE.ShaderMaterial( {
      defines: {
        NUM_OF_FLOORS: Object.keys(this._schoolMarking).length,
        FLOOR_NUMBER: 0 
      },
      //side: THREE.DoubleSide,
      uniforms: {
        uTexFloors: {value: this._texFloors},
        uCurFloor: {value: this._editorCurFloor},
        uAnim: { 
          value: {
            mode: -1,
            progress: 0,
            numStep: 0,
            texture_01: this._texFloors[0],
            texture_02: this._texFloors[0],
            color_01: new THREE.Vector3(0, 0, 0),
            color_02: new THREE.Vector3(0, 0, 0),
            coefBlend: 0
          }
        }
      },
      vertexShader: vertShaderStrPlane,
      fragmentShader: fragShaderStrPlane
    } );

    this._plane = new THREE.Mesh(geometry, material);
    this._plane.position.z = 0;
    this._group.add(this._plane);

    /* Create rooms */
    material = new THREE.MeshBasicMaterial({color: 0x00FF00, transparent: true, opacity: 0.8});

    this._floors = new THREE.Group();
    this._floors.name = 'floors';
    this._floors.position.z = 0.2;
    this._group.add(this._floors);

    this._numOfFloors = Object.keys(this._schoolMarking).length;
    for (let i = 0; i < this._numOfFloors; i++ ) {
      let floor = new THREE.Group();
      floor.position.z = 0;
      floor.name = `floor_${i}`;
      this._floors.add(floor);

      for (let j = 0; j < Object.keys(this._schoolMarking[`floor_${i}`]).length; j++) {
        
        let shape = new THREE.Shape();
        const room = this._schoolMarking[`floor_${i}`][`room_${j}`];
        let startPoint = {};
        startPoint.x = room[room.length - 1].x * this._planeWidth * 0.5;
        startPoint.y = room[room.length - 1].y * this._planeHeight * 0.5;

        shape.moveTo(startPoint.x, startPoint.y);
        for (const coord of room) {
          shape.lineTo(coord.x * this._planeWidth * 0.5, coord.y *= this._planeHeight * 0.5);
        }

        geometry = new THREE.ShapeGeometry(shape);
        let primitive = new THREE.Mesh(geometry, material);
        primitive.visible = false;
        primitive.name = `room_${j}`;
        floor.add(primitive);
      }
    }
        
    /* Create surface */
    geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
    material = new THREE.MeshBasicMaterial();
    this._surface = new THREE.Mesh(geometry, material);
    this._surface.visible = false;
    this._group.add(this._surface);

    /* Create pointer */
    //geometry = new THREE.SphereGeometry(0.2, 20, 20);
    geometry = new THREE.TorusGeometry(0.4, 0.06, 20, 20);
    material = new THREE.MeshBasicMaterial({color: 0xFF0000});
    this._pointer = new THREE.Mesh(geometry, material);
    this._pointer.position.z = 0.5;
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
  

    /* Check animation progress */
    if (this._animation !== undefined && this._animation.isInProgress) {
      /* Animation response */
      this._animation.response();
      

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
        const coords = this._getMouseNormWindowCoords(this._mouseWork.getMouseX, this._mouseWork.getMouseY);

        mouse.set(coords.x, coords.y);
        raycaster.setFromCamera(mouse, this._camera);
        
        const intersects = raycaster.intersectObjects([this._group], true);

        /* Intersections response */
        for (let i = 0; i < intersects.length; i++) {
          if (intersects[i].object.id === this._surface.id) {
            /* Surface */
            this._tmpMemV3.copy(intersects[i].point);
          } else if (intersects[i].object.parent.name === `floor_${this._curFloor}` &&
                     this._isFirstMouseResponse) {
            /* Rooms */
            this._roomSelecter(intersects[i].object);
          }

        }

        /* Movement */
        if (!this._isFirstMouseResponse) {
          this._movement(this._lastMousePoint, this._tmpMemV3);
        }

        /* Update last mouse point */
        this._lastMousePoint.copy(this._tmpMemV3);

        /* Response first mouse response flag */
        this._isFirstMouseResponse = false;

      }

      this._pointer.position.copy(this._lastMousePoint);

      /* Keyboard upadte */
      this._keyboardWork.update();

      /* Shaders uniforms update */
      this._plane.material.uniforms.uCurFloor.value = this._editorCurFloor;

    }
  }
  
  /* Room selector method */
  _roomSelecter (selectedRoom) {
    //return;
    _setForEach( this._floors.getObjectByName(`floor_${this._curFloor}`).children, 
                 {visible: false});

    selectedRoom.visible = true;
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
    floor--;
    //!!!!!!!!!!!!!!!!!!!!!!
    if (floor === undefined || floor === this._curFloor ||
        floor < 0 || floor >= 4 /*this._numOfFloors*/) { return };

    /* Rooms */
    _setForEach( this._floors.getObjectByName(`floor_${this._curFloor}`).children,
                 {visible: false} );

                 /* Set animation */
    if (this._animation !== undefined && this._animation.isInProgress) {
      this._animation._end();
    }

    this._animation = new AnimChangeFloor(this, 2.5, this._curFloor, floor);

    /* Set current floor */
    this._curFloor = floor;
  }

  /* Make movement method */
  _movement (startPoint, endPoint) {
    if (this._isMoveable) {
    this._group.position.add(this._tmpOperV3.subVectors(endPoint, startPoint));
    }

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

        this._curFloor += 1; 
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
        this._plane.worldToLocal(this._tmpMemV3.copy(this._lastMousePoint));

        let coord = {};
        coord.x = this._tmpMemV3.x / this._planeWidth * 2;
        coord.y = this._tmpMemV3.y / this._planeHeight * 2;

        this._editorSchoolMarking[`floor_${this._editorCurFloor}`][`room_${this._editorCurRoom}`].push(coord);
        console.log(`Added coord ${JSON.stringify(coord)}`);
        break;
      case 'KeyC':
        this._isKeysLock = true;
        console.log(JSON.stringify(this._editorSchoolMarking));
        break;
      case 'KeyV':
          this._isKeysLock = true;
          // !!!!!!!!!!!!!!!!!s
          this.setFloor((this._curFloor + 1) % 4);
          break;
    } 
  }

}


class MinimapAnimation {
  constructor (minimap, duration) {
    this._minimap = minimap;
    this._duration = duration;

    this.isInProgress = true;
    this._startTime = Date.now();
    this._progress = 0;
    this._step = 0;
  }

  /* Response animation method */
  response () {
    this._progress = ((Date.now() - this._startTime) / 1000.0) / this._duration;
  }

  _end() {
    this.isInProgress = false;
  }
  

}


class AnimChangeFloor extends MinimapAnimation {
  constructor (minimap, duration, startFloor, endFloor) {
    super(minimap, duration);
    /* This tmp variables */
    this._tmpOperV3 = new THREE.Vector3();
    this._tmpMemV3 = new THREE.Vector3();
    
    this._startFloor = startFloor;
    this._endFloor = endFloor;

    this._startPlaneZ = this._minimap._plane.position.z;
    this._startFloorsZ = this._minimap._floors.position.z;
    this._deltaPlaneZ = this._minimap._camera.position.z * 0.5;
    this._deltaFloorsZ = this._minimap._camera.position.z * 1.2;
    this._startGroupPos = (new THREE.Vector3()).copy(this._minimap._group.position);
    this._transCenterVec = (new THREE.Vector3()).subVectors( this._tmpMemV3.set(0, 0, 0),
                            this._startGroupPos );

    _setForEach( this._minimap._floors.getObjectByName(`floor_${this._startFloor}`).children,
                 {visible: true} );

    /* Constant uniforms */
    this._minimap._plane.material.uniforms.uAnim.value.mode = 0;
    this._minimap._plane.material.uniforms.uAnim.value.texture_01 = this._minimap._texFloors[this._startFloor];
    this._minimap._plane.material.uniforms.uAnim.value.texture_02 = this._minimap._texFloors[this._endFloor];
    this._minimap._plane.material.uniforms.uAnim.value.color_01 = (new THREE.Color()).set(0x191970);
    this._minimap._plane.material.uniforms.uAnim.value.color_02 = (new THREE.Color()).set(0xFFFAFA);
  }

  response () {
    super.response();

    if (this._progress >= 1.0) {
      this._end();
      return;
    }

    /* Movement */

    /* Plane */
    this._minimap._plane.position.z = this._startPlaneZ -
        this._deltaPlaneZ * _getCoef(false, true, this._progress, 3);

    /* Group */
    this._minimap._group.position.copy( this._tmpMemV3.addVectors(this._startGroupPos, this._tmpMemV3.copy(
                                        this._transCenterVec).multiplyScalar( _getCoef(false, false, this._progress, 2) ) ) );

    /* Floors */
    this._minimap._floors.position.z = this._startFloorsZ + this._deltaFloorsZ * _getCoef(false, false, this._progress * 2 - 1, 2);

    
    
   
    switch (this._step) {
      case 0:
        if (this._progress > 0.3) {
          this._step++;
          break;
        };

        /* Uniforms */
        this._minimap._plane.material.uniforms.uAnim.value.numStep = this._step;
        this._minimap._plane.material.uniforms.uAnim.value.coefBlend = this._progress / 0.3;
        break;

      case 1:
        if (this._progress > 0.7) {
          this._step++;
          break;
        };

        /* Uniforms */
        this._minimap._plane.material.uniforms.uAnim.value.numStep = this._step;
        this._minimap._plane.material.uniforms.uAnim.value.coefBlend = 1;
        break;

      case 2:
        /* Uniforms */
        this._minimap._plane.material.uniforms.uAnim.value.numStep = this._step;
        this._minimap._plane.material.uniforms.uAnim.value.coefBlend = (this._progress - 0.7) / 0.3;
        break;
    }
  }

  _end() {
    super._end();
    this._minimap._plane.position.z = this._startPlaneZ;
    this._minimap._plane.material.uniforms.uAnim.value.numStep = -1;
    this._minimap._group.position.set(0, 0, 0);

    _setForEach( this._minimap._floors.getObjectByName(`floor_${this._startFloor}`).children,
                 {visible: false} );
    this._minimap._floors.position.z = this._startFloorsZ;
  }
}


