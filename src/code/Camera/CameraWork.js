import * as THREE from 'three';
import MouseWork from './../IOWorking/IOWork';

export default class Camera {
  constructor (fov, near, far, haveMouseWork = false) {
    this._camera = new THREE.PerspectiveCamera(fov, 1, near, far);
    this._camera.position.set(2, 2, 2);
    this._camera.lookAt(0, 0, 0);
    this._target = { x: 0, y: 0, z: 0 };

    this._hasMouseWork = haveMouseWork;

    if (this._hasMouseWork) {
      this._mouseWork = new MouseWork();
    }
  }

  /**
     * @param {any} value
     */
  set fov (value) {
    this._camera.fov = value;
  }

  set (value) {
    if (value.x !== undefined) { this._camera.position.x = value.x; }
    if (value.y !== undefined) { this._camera.position.y = value.y; }
    if (value.z !== undefined) { this._camera.position.z = value.z; }
  }

  targetSet (value) {
    this._camera.lookAt(value.x !== undefined ? value.x : this._target.x, value.y !== undefined ? value.y : this._target.y, value.z !== undefined ? value.z : this._target.z);
    if (value.x !== undefined) { this._target.x = value.x; }
    if (value.y !== undefined) { this._target.y = value.y; }
    if (value.z !== undefined) { this._target.z = value.z; }
  }

  /**
     * @param {number} value
     */
  set aspect (value) {
    this._camera.aspect = value;
    this._camera.updateProjectionMatrix();
  }

  get camera () {
    return this._camera;
  }

  update () {
    if (this._hasMouseWork) {
      this._mouseWork.update();
    }
  }
}
