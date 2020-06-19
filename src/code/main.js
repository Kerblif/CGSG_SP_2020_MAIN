import './style.css';
import * as THREE from 'three';

class Animate {
  constructor (canvas) {
    //    const context = canvas.getContext('webgl2', { alpha: false });
    this._renderer = new THREE.WebGLRenderer({ canvas: canvas });
    this._renderer.outputEncoding = THREE.sRGBEncoding;

    this._canvas = canvas;
    this._scene = new THREE.Scene();
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
  }

  init () {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mtl = new THREE.MeshBasicMaterial({ color: 0xFFffFF });
    this._box = new THREE.Mesh(geom, mtl);
    this._scene.add(this._box);
    this.createCamera();
  }

  createCamera () {
    this._camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this._camera.position.set(2, 2, 2);
    this._camera.lookAt(0, 0, 0);
  }

  _resizeCanvas () {
    const pixelRatio = window.devicePixelRatio;
    const w = this._canvas.clientWidth | 0; const h = this._canvas.clientHeight | 0;

    if (this._canvas.width === w && this._canvas.height === h) {
      return;
    }

    this._camera.aspect = w / h;
    this._renderer.setSize(w * pixelRatio, h * pixelRatio, false);
    this._camera.updateProjectionMatrix();
  }

  render () {
    this._resizeCanvas();
    this._drawScene();
    window.requestAnimationFrame(this.render);
  }

  _drawScene () {
    this._renderer.render(this._scene, this._camera);
  }
}

const canvas = document.querySelector('#cWebGL');
const anim = new Animate(canvas);
anim.init();
anim.render();
