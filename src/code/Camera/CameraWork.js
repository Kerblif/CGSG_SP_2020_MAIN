import * as THREE from 'three';
import { KeyboardWork, MouseWork } from './../IOWorking/IOWork';

export default class Camera {
  constructor (fov, near, far, hasControl = false, elemet = document) {
    this._camera = new THREE.PerspectiveCamera(fov, 1, near, far);
    this._camera.position.set(0, 0, 0);
    this._camera.lookAt(0, 0, -1);
    this._target = { x: 0, y: 0, z: -1 };
    this._xAngle = 0;
    this._yAngle = 0;
    this._lastxAngle = 0;
    this._lastYAngle = 0;

    this._hasControl = hasControl;

    if (this._hasControl) {
      this._mouseWork = new MouseWork(elemet);
      this._keyboardWork = new KeyboardWork(this._keyboardMove.bind(this), elemet);
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

    this._targetSetWithoutAngle({
      x: this._camera.position.x - Math.sin(this._xAngle) * Math.cos(this._yAngle),
      y: this._camera.position.y + Math.sin(this._yAngle),
      z: this._camera.position.z - Math.cos(this._xAngle) * Math.cos(this._yAngle)
    });
  }

  targetSet (value) {
    this._targetSetWithoutAngle(value);

    if (this._hasControl) {
      const camDirX = this._target.x - this._camera.position.x;
      const camDirY = this._target.y - this._camera.position.y;
      const camDirZ = this._target.z - this._camera.position.z;

      this._xAngle = 0;
      if (camDirZ !== 0 || camDirX !== 0) {
        this._xAngle = -Math.acos(camDirZ / Math.sqrt(camDirZ ** 2 + camDirX ** 2)) * Math.sign(camDirX);
      }
      this._yAngle = Math.asin(camDirY / Math.sqrt(camDirZ ** 2 + camDirX ** 2 + camDirY ** 2));
    }
  }

  _targetSetWithoutAngle (value) {
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

  _keyboardMove (key, keys) {
    switch (key) {
      case 'KeyW':
        this.set({
          x: this._camera.position.x - Math.sin(this._xAngle) / 2,
          z: this._camera.position.z - Math.cos(this._xAngle) / 2
        });
        break;
      case 'KeyS':
        this.set({
          x: this._camera.position.x + Math.sin(this._xAngle) / 2,
          z: this._camera.position.z + Math.cos(this._xAngle) / 2
        });
        break;
      case 'KeyD':
        this.set({
          x: this._camera.position.x + Math.cos(this._xAngle) / 2,
          z: this._camera.position.z - Math.sin(this._xAngle) / 2
        });
        break;
      case 'KeyA':
        this.set({
          x: this._camera.position.x - Math.cos(this._xAngle) / 2,
          z: this._camera.position.z + Math.sin(this._xAngle) / 2
        });
        break;
      case 'Space':
        this.set({
          y: this._camera.position.y + 0.5
        });
        break;
      case 'ShiftLeft':
        this.set({
          y: this._camera.position.y - 0.5
        });
    }
  }

  update () {
    if (this._hasControl) {
      if (this._mouseWork.getIsPressed) {
        this._yAngle += this._mouseWork.getYChange / 500;
        this._xAngle += this._mouseWork.getXChange / 500;
      }

      if (this._xAngle !== this._lastXAngle || this._yAngle !== this._lastYAngle) {
        this._targetSetWithoutAngle({
          x: this._camera.position.x - Math.sin(this._xAngle) * Math.cos(this._yAngle),
          y: this._camera.position.y + Math.sin(this._yAngle),
          z: this._camera.position.z - Math.cos(this._xAngle) * Math.cos(this._yAngle)
        });

        this._lastYAngle = this._yAngle;
        this._lastXAngle = this._xAngle;
      }

      this._keyboardWork.update();
      this._mouseWork.update();
    }
  }
}
