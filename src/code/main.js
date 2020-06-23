import './style.css';
import * as THREE from 'three';
import Camera from './Camera/CameraWork.js';
import Minimap from './Minimap/minimap.js';

import Sidebar from './Sidebar/Sidebar.js';

// import osSchool from '../bin/models/school/MainModel.glb';
import osSchool from '../bin/models/school/School30Floors.glb';
import School from './ObjWorking/School.js';
import CloseImg from '../bin/textures/Close.png';
//fs.writeFileSync("txt.txt", "my text",  "ascii")


class Animate {
  constructor (canvas) {
    const context = canvas.getContext('webgl2', { alpha: false });
    this._renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
    this._renderer.outputEncoding = THREE.sRGBEncoding;

    this._canvas = canvas;
    this._scene = new THREE.Scene();
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
  }

  init () {
    this.school = new School(osSchool, this._scene);
    const lamp = new THREE.DirectionalLight(0xFFFFFF, 1);
    lamp.position.set(1, 1, 1);
    this._scene.add(lamp);
    this.createCamera();

    this._minimap = new Minimap(this._canvas, this._renderer, true,
                                0.01, 0.01, 0.6, 0.6);
    this._minimap.init(100, 100, "./src/bin/minimap/",
                        [
                          "floor_01.jpg",
                          "floor_02.jpg",
                          "floor_03.jpg",
                          "floor_04.jpg",
                        ]);
 
    this._resizeCanvas();

    this.Sidebar = new Sidebar(512, 'info', CloseImg);

    this.Sidebar.setText('Text sample');
    this.Sidebar.setHeader('Welcome to school #30!!!');

    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this.Sidebar.resize();
    }, false);
  }

  createCamera () {
    this._camera = new Camera(45, 0.1, 1000, true);
    this._camera.set({ x: 100, y: 30, z: 10 });
    this._camera.targetSet({ x: 0, y: 0, z: 30 });
  }

  _resizeCanvas () {
    const pixelRatio = window.devicePixelRatio;
    const w = this._canvas.clientWidth | 0;
    const h = this._canvas.clientHeight | 0;

    if (this._canvas.width === w && this._canvas.height === h) {
      return;
    }

    this._renderer.setSize(w * pixelRatio, h * pixelRatio, false);
    this._camera.aspect = w / h;

    this._minimap.resize();
  }

  render () {
    this._camera.update();
    this._minimap.response();

    this._drawScene();
    this._minimap.draw();
    window.requestAnimationFrame(this.render);
  }

  _drawScene () {
    this._renderer.render(this._scene, this._camera.camera);
  }
}

const canvas = document.querySelector('#cWebGL');
const anim = new Animate(canvas);
anim.init();
anim.render();
