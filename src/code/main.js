import './style.css';
import * as THREE from 'three';
import Camera from './Camera/CameraWork.js';

import osSchool from '../bin/models/school/MainModel.glb';
import School from './objworking/school';

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
    // const geom = new THREE.BoxGeometry(1, 1, 1);
    // const mtl = new THREE.MeshBasicMaterial({ color: 0xFFffFF });
    // this._box = new THREE.Mesh(geom, mtl);
    this._scene.add(new THREE.DirectionalLight(0xFFFFFF, 1));
    this.createCamera();
  }

  createCamera () {
    this._camera = new Camera(75, 0.1, 1000, true);
    this._camera.set({ x: 10, y: 30, z: 10 });
    this._camera.targetSet({ x: 0, y: 0, z: 30 });
  }

  _resizeCanvas () {
    const pixelRatio = window.devicePixelRatio;
    const w = this._canvas.clientWidth | 0; const h = this._canvas.clientHeight | 0;

    if (this._canvas.width === w && this._canvas.height === h) {
      return;
    }

    this._renderer.setSize(w * pixelRatio, h * pixelRatio, false);
    this._camera.aspect = w / h;
  }

  render () {
    this._resizeCanvas();
    this._drawScene();
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
