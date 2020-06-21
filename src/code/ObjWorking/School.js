import * as THREE from 'three';
import ModelManager from './MdlMgr.mjs';

/* School event handler */
export default class School {
  constructor (src, scene) {
    this._scene = scene;
    this._selectMtl = new THREE.MeshPhongMaterial({ color: 0xFF1111 });
    this._deselectMtl = new THREE.MeshPhongMaterial({ color: 0xBBBBBB });
    this._getModel = this._getModel.bind(this);
    ModelManager.get(src).then(this._getModel);
  }

  _getModel (glbScene) {
    this.school = glbScene;
    this.school.traverse((obj) => {
      obj.material = this._deselectMtl;
    });
    const model = glbScene.getObjectByName('CSRoom_000');
    // model.material.color.setHex(0xff0000);
    model.material = this._selectMtl;
    this._scene.add(this.school);
  }
}
