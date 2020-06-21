import * as THREE from 'three';
import { OrbitControls } from '../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { MouseWork } from './../IOWorking/IOWork';



function windowToCanvas(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();
  return { x: x - bbox.left * (canvas.width / bbox.width),
      y: y - bbox.top * (canvas.height / bbox.height)
  };
}


/* Minimap clas */
export default class Minimap {
  constructor ( canvas, renderer, 
                windowWestSideRatio, windowSouthSideRatio, 
                windowWidthRatio, windowHeightRatio ) {

    /* Render objects */
    this._canvas = canvas;
    this._renderer = renderer;
    //this._canvas.addEventListener('mousemove', (event) => console.log(event.pageX));
    /*this._canvas.addEventListener('mouseup', function (e) {
      console.log(e.pageX - e.target.offsetLeft)});*/

    /*canvas.onmousemove = (e) => {
      let loc = windowToCanvas(canvas, e.clientX, e.clientY);
      console.log(loc.x / this._canvas.width);
    };*/
      
        
    this._clearColor = 0x4B0082;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera( 45, windowWidthRatio / windowHeightRatio, 
                                                0.1, 1000 );
    
    /* Window params */
    this._windowWestSideRatio = windowWestSideRatio;
    this._windowSouthSideRatio = windowSouthSideRatio; 
    this._windowWidthRatio = windowWidthRatio; 
    this._windowHeightRatio = windowHeightRatio;

    /* Main group */
    this._group = new THREE.Group();

    /* Controls */
    this._mouseWork = new MouseWork();
    this.controls = new OrbitControls(this._camera, this._renderer.domElement);
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
    this._renderer.setScissor( (this._canvas.width * this._windowWestSideRatio),
                               (this._canvas.height * this._windowSouthSideRatio),
                               (this._canvas.width * this._windowWidthRatio),
                               (this._canvas.height * this._windowHeightRatio) );
    this._renderer.setViewport( (this._canvas.width * this._windowWestSideRatio),
                                (this._canvas.height * this._windowSouthSideRatio),
                                (this._canvas.width * this._windowWidthRatio),
                                (this._canvas.height * this._windowHeightRatio) );

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
    if ( this._isAnimation ) {
      /* Check animation progress */
      

    } else {
      /* Mouse response */
      //console.log(this._mouseWork.mouseX / document.documentElement.clientWidth);
      /* Check mouse location */
      if ( this._mouseWork.mouseX / document.documentElement.clientWidth > this._windowWestSideRatio && 
        this._mouseWork.mouseX / document.documentElement.clientWidth < this._windowWestSideRatio + this._windowWidthRatio) {

        this._clearColor = 0xFF0000;
      } else {
        this._clearColor = 0x00FF00;
      }



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