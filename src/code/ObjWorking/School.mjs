import * as THREE from 'three';
import ModelManager from './MdlMgr.mjs';

/* School event handler */
export default class School {
  constructor (src, scene) {
    this._scene = scene;
    this._getModel = this._getModel.bind(this);
    ModelManager.get(src).then(this._getModel);
  }

  _getModel (glbScene) {
    this.school = glbScene;
    const model = glbScene.getObjectByName('CSRoom_001');
    model.material.color.setHex(0xff0000);
    this._scene.add(this.school);
  }
}
