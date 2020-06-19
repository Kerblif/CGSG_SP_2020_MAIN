import * as THREE from 'three';
import ModelManager from './mdlmgr';

/* School event handler */
export default class School {
  constructor (src, scene) {
    let getModel = function (model) {
      this.school = model;
      scene.add(this.school);
    };
    getModel = getModel.bind(this);
    ModelManager.get(src).then(getModel);
  }
}
