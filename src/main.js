import * as THREE from 'three';

class Animate {
  constructor (canvas) {
    const context = canvas.getContext('webgl2', { alpha: false });
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, context: context });
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
  }

  init () {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mtl = new THREE.MeshBasicMaterial({ color: 0xFFffFF });
    this.box = new THREE.Mesh(geom, mtl);
    this.scene.add(this.box);
    this.createCamera();
  }

  createCamera () {
    this.camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
    this.camera.position.set(2, 2, 2);
    this.camera.lookAt(0, 0, 0);
  }

  _resizeCanvas (renderer) {
    const pixelRatio = window.devicePixelRatio;
    const w = this.canvas.clientWidth | 0;
    const h = this.canvas.clientHeight | 0;

    if (this.canvas.width === w || this.canvas.height === h) {
      return;
    }

    this.renderer.setSize(w * pixelRatio, h * pixelRatio, false);

    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
  }

  render () {
    window.requestAnimationFrame(this.render);
    this._resizeCanvas();
    this.drawScene();
  }

  drawScene () {
    this.renderer.render(this.scene, this.camera);
  }
}

const canvas = document.getElementById('cWebGL');
const anim = new Animate(canvas);
anim.init();
anim.render();
