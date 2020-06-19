import ModelManager from './mdlmgr';

/* School event handler */
export default class School {
  constructor (src, scene) {
    let getModel = function (model) { scene.add(model); this.model = model; };
    getModel = getModel.bind(this);
    ModelManager.get(src).then(getModel);
  }
}
