import * as THREE from 'three';
import {OrbitControls} from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';

/* Minimap clas */
export default class Minimap {
  constructor (renderer, 
              windowWestSide, windowSouthSide, 
              windowWidth, windowHeight) {

    /* Render objects */
    this._renderer = renderer;
        
    this._clearColor = 0x4B0082;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera( 45, windowWidth / windowHeight, 0.1, 1000 );

    this.controls = new OrbitControls(this._camera, this._renderer.domElement);

    /* Window params */
    this._windowWestSide = windowWestSide;
    this._windowSouthSide = windowSouthSide; 
    this._windowWidth = windowWidth; 
    this._windowHeight = windowHeight;

    /* Main group */
    this._group = new THREE.Group();
  }

  /* Initialization method */
  init (mapWidth, mapHeight, texFloors=[]) {
    /* Location params */
    this._currentFloor = -1;

    /* Animation params */
    this._isAnimation = false;
    this._currentAnimation = undefined;

    /* Create primitive */
    const geometry = new THREE.PlaneGeometry( mapWidth, mapHeight, 5, 5 );
    const material = new THREE.MeshBasicMaterial( {color: 0xA9A9A9, 
                                                   side: THREE.DoubleSide} );
    this._primitive = new THREE.Mesh( geometry, material );
    
    this._primitive.add(new THREE.AxesHelper( 5 ));
    
    /* Create axes */
    this._axesHelper = new THREE.AxesHelper( 5 );
       
    /* Set camera params */
    this._camera.position.set(0, 0, -20);
    this._camera.lookAt(0, 0, 0);
    
    /* Handling group */
    this._group.add( this._primitive );
    //this._group.add( this._axesHelper );


    this._group.position.set( 0, 0, 0 );
    this._scene.add( this._group );
  }

  /* Drawing method */
  draw () {
    /* Memory current params */
    const oldClearColor = new THREE.Color();
    oldClearColor.copy( this._renderer.getClearColor() );
    const oldViewport = new THREE.Vector4();
    this._renderer.getCurrentViewport(oldViewport);

    /* Render set new params */
    this._renderer.setClearColor( this._clearColor );
    this._renderer.clearDepth();
    this._renderer.setScissorTest( true );
    this._renderer.setScissor( this._windowWestSide, this._windowSouthSide,
                               this._windowWidth, this._windowHeight );
    this._renderer.setViewport( this._windowWestSide, this._windowSouthSide, 
                                this._windowWidth, this._windowHeight );

    /* Draw */
    this._renderer.render( this._scene, this._camera );

    /* Render restore params */
    this._renderer.setClearColor( oldClearColor );
    this._renderer.setScissorTest( false );
    this._renderer.setViewport( oldViewport );
  }

  /* Response method */
  response () {
  

    /* Check animation */
    if (this._isAnimation) {
      /* Check animation progress */
      

    } else {
      /* Mouse response */


      /* Movement */

    }
  }

  /* Set floor method */
  setFloor (floor) {

    /* Set animation */
    if (floor != this._currentFloor) {
      /* Changing floor animation */
      this._isAnimation = true;
      //this._currentAnimation = ...
    }

    /* Set current floor */
    this._currentFloor = floor;
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