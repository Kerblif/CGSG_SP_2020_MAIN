import * as THREE from 'three';

function _resizeRendererToDisplaySize (renderer) {
  const canvas = renderer.domElement;
  const pixelRatio = window.devicePixelRatio;
  const width = canvas.clientWidth * pixelRatio | 0;
  const height = canvas.clientHeight * pixelRatio | 0;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

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

  render () {
    window.requestAnimationFrame(this.render);
    if (_resizeRendererToDisplaySize(this.renderer)) {
      this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
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
