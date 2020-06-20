import ModelManager from './mdlmgr';

/* School event handler */
export default class School {
  constructor (src, scene) {
    let getModel = function (glbScene) {
      this.school = glbScene;
      scene.add(this.school);
    };
    getModel = getModel.bind(this);
    ModelManager.get(src).then(getModel);
  }
}
