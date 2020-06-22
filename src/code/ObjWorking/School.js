import * as THREE from 'three';
import ModelManager from './MdlMgr.mjs';
import osFloor_1 from '../../bin/models/school/1_Floor.glb';
import osFloor_2 from '../../bin/models/school/2_Floor.glb';
import osFloor_3 from '../../bin/models/school/3_Floor.glb';
import osFloor_4 from '../../bin/models/school/4_Floor.glb';
import osSchool from '../../bin/models/school/MainModel.glb';

/**
 * Error of not exist (undefined) properties.
 * @constructor
 * @param  {string} message - error message.
 */
class NExist {
  constructor (message) {
    this.name = 'NExist';
    this.message = (message || '');
  }
}

/* School event handler */
export default class School {
  constructor (scene) {
    this._scene = scene;
    this._selectMtl = new THREE.MeshPhongMaterial({ color: 0xEE1111 });
    this._deselectMtl = new THREE.MeshPhongMaterial({ color: 0xBBBBBB });
    let tmp = (obj) => {
      this._school = obj.o;
      this._school.traverse((obj) => {
        obj.material = this._deselectMtl;
      });
    };
    tmp = tmp.bind(this);
    ModelManager.get({ src: osSchool }).then(tmp);
    this._floors = {};
    tmp = (val) => {
      this._floors[val.a.name] = val.o;
      this._floors[val.a.name].traverse((obj) => {
        obj.material = this._deselectMtl;
      });
    };
    tmp = tmp.bind(this);
    ModelManager.get({ src: osFloor_1, args: { name: 1 } }).then(tmp);
    ModelManager.get({ src: osFloor_2, args: { name: 2 } }).then(tmp);
    ModelManager.get({ src: osFloor_3, args: { name: 3 } }).then(tmp);
    ModelManager.get({ src: osFloor_4, args: { name: 4 } }).then(tmp);
    this._cur = new THREE.Object3D();
  }

  /**
   * Set the floor.
   * @throws NExist error.
   * @param {Number} num - number of floor for set.
   * @returns (THREE.Object3D) - the model;
   */
  setFloor (num) {
    const model = this._floors[num];
    if (model === undefined) {
      throw new NExist('Not exist: floor.');
    }
    this._scene.remove(this._cur);
    model.material = this._selectMtl;
    this._scene.add(model);
    return model;
  }

  /**
   * Set the room.
   * @throws NExist error.
   * @param {string} name - name of room.
   */
  setRoom (name) {
    const obj = this._cur.getObjectById(name);
    if (obj === undefined) {
      throw new NExist('Not exist: room.');
    }
    const delTmp = this._deselectMtl;
    this._cur.traverse((o) => {
      o.material = delTmp;
    });
    obj.material = this._selectMtl;
  }

  /**
   * Set the whole model.
   * @throws NExist  error.
   * @returns (THREE.Object3D) - the model;
   */
  setStreetView () {
    this._scene.remove(this._cur);
    if (this._school === undefined) {
      throw new NExist('Model onload.');
    }
    this._scene.add(this._school);
    return this._school;
  }
}
