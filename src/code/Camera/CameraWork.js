import * as THREE from 'three';
import { KeyboardWork, MouseWork } from './../IOWorking/IOWork';

export default class Camera {
  constructor (fov, near, far, hasControl = false, elemet = document) {
    this._camera = new THREE.PerspectiveCamera(fov, 1, near, far);
    this._xAngle = 0;
    this._yAngle = 0;
    this._lastxAngle = 0;
    this._lastYAngle = 0;
    this._orbitControl = false;
    this._lenght = 1;
    this._centerPoint = { x: 0, y: 0, z: 0 };
    this._radiusPoint = { x: 0, y: 0, z: -1 };
    this._updatecamera();

    this._hasControl = hasControl;

    if (this._hasControl) {
      this._mouseWork = new MouseWork(() => {}, elemet);
      this._keyboardWork = new KeyboardWork(this._keyboardMove.bind(this));
    }
  }

  cameraSet (value) {
    if (this._orbitControl) {
      this._radiusPointSet(value);
    } else {
      this._centerPointSet(value);
    }
  }

  targetSet (value) {
    if (!this._orbitControl) {
      this._radiusPointSet(value);
    } else {
      this._centerPointSet(value);
    }
  }

  _centerPointSet (value) {
    if (value.x !== undefined) {
      this._radiusPoint.x += value.x - this._centerPoint.x;
      this._centerPoint.x = value.x;
    }

    if (value.y !== undefined) {
      this._radiusPoint.y += value.y - this._centerPoint.y;
      this._centerPoint.y = value.y;
    }

    if (value.z !== undefined) {
      this._radiusPoint.z += value.z - this._centerPoint.z;
      this._centerPoint.z = value.z;
    }

    this._updatecamera();
  }

  _radiusPointSet (value, needToUpdateAngle = true) {
    if (value.x !== undefined) { this._radiusPoint.x = value.x; }
    if (value.y !== undefined) { this._radiusPoint.y = value.y; }
    if (value.z !== undefined) { this._radiusPoint.z = value.z; }

    if (this._hasControl && needToUpdateAngle) {
      const DirX = this._radiusPoint.x - this._centerPoint.x;
      const DirY = this._radiusPoint.y - this._centerPoint.y;
      const DirZ = this._radiusPoint.z - this._centerPoint.z;

      this._lenght = Math.sqrt(DirZ ** 2 + DirX ** 2 + DirY ** 2);

      this._xAngle = 0;
      if (DirZ !== 0 || DirX !== 0) {
        this._xAngle = Math.acos(DirZ / Math.sqrt(DirZ ** 2 + DirX ** 2));
        if (DirX !== 0) { this._xAngle *= Math.sign(DirX); }
      }
      this._yAngle = Math.asin(DirY / this._lenght);
    }

    this._updatecamera();
  }

  _updatecamera () {
    if (this._orbitControl) {
      this._camera.position.set(this._radiusPoint.x, this._radiusPoint.y, this._radiusPoint.z);
      this._camera.lookAt(this._centerPoint.x, this._centerPoint.y, this._centerPoint.z);
    } else {
      this._camera.position.set(this._centerPoint.x, this._centerPoint.y, this._centerPoint.z);
      this._camera.lookAt(this._radiusPoint.x, this._radiusPoint.y, this._radiusPoint.z);
    }
  }

  set orbitControl (value) {
    if (this._orbitControl === value) { return; }

    this._orbitControl = value;

    this._radiusPointSet({
      x: this._centerPoint.x * 2 - this._radiusPoint.x,
      y: this._centerPoint.y * 2 - this._radiusPoint.y,
      z: this._centerPoint.z * 2 - this._radiusPoint.z
    });
  }

  /**
     * @param {any} value
     */
  set fov (value) {
    this._camera.fov = value;
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

  _keyboardMove (key) {
    const mul = this._orbitControl ? -1 : 1;

    switch (key) {
      case 'KeyW':
        this._centerPointSet({
          x: this._centerPoint.x + Math.sin(this._xAngle) / 2 * mul,
          z: this._centerPoint.z + Math.cos(this._xAngle) / 2 * mul
        });
        break;
      case 'KeyS':
        this._centerPointSet({
          x: this._centerPoint.x - Math.sin(this._xAngle) / 2 * mul,
          z: this._centerPoint.z - Math.cos(this._xAngle) / 2 * mul
        });
        break;
      case 'KeyD':
        this._centerPointSet({
          x: this._centerPoint.x - Math.cos(this._xAngle) / 2 * mul,
          z: this._centerPoint.z + Math.sin(this._xAngle) / 2 * mul
        });
        break;
      case 'KeyA':
        this._centerPointSet({
          x: this._centerPoint.x + Math.cos(this._xAngle) / 2 * mul,
          z: this._centerPoint.z - Math.sin(this._xAngle) / 2 * mul
        });
        break;
      case 'Space':
        this._centerPointSet({
          y: this._centerPoint.y + 0.5
        });
        break;
      case 'ShiftLeft':
        this._centerPointSet({
          y: this._centerPoint.y - 0.5
        });
        break;
      case 'KeyK':
        this.orbitControl = true;
        break;
      case 'KeyL':
        this.orbitControl = false;
    }
  }

  update () {
    if (this._hasControl) {
      if (this._mouseWork.getIsPressed) {
        const mul = this._orbitControl ? -1 : 1;

        this._yAngle += this._mouseWork.getYChange / 500 * mul;
        this._xAngle += this._mouseWork.getXChange / 500;
      }

      if (this._xAngle !== this._lastXAngle || this._yAngle !== this._lastYAngle) {
        this._radiusPointSet({
          x: this._centerPoint.x + Math.sin(this._xAngle) * Math.cos(this._yAngle) * this._lenght,
          y: this._centerPoint.y + Math.sin(this._yAngle) * this._lenght,
          z: this._centerPoint.z + Math.cos(this._xAngle) * Math.cos(this._yAngle) * this._lenght
        }, false);

        this._lastYAngle = this._yAngle;
        this._lastXAngle = this._xAngle;
      }

      this._keyboardWork.update();
      this._mouseWork.update();
    }
  }
}
