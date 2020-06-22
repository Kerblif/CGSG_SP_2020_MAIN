import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const modelCash = new Map();
const gltfLoader = new GLTFLoader();

export default class ModelManager {
  /**
   * Returns promise with obj: o field is the THREE.Object3D, other - the args from called function.
   *
   * @param {object} obj with field src, and args - will translate to then func for promise.
   * @return {Promise} new Promise - param of that - object with properties: o - clone of model THREE.Object3D and a - args from called function.
   */
  static get (obj) {
    if (modelCash.has(obj.src)) {
      return new Promise(function (resolve, reject) {
        resolve({ o: modelCash.get(obj.src).clone(), a: obj.args });
      });
    }
    return new Promise(function (resolve, reject) {
      gltfLoader.load(obj.src, (gltf) => {
        modelCash.set(obj.src, gltf.scene);
        resolve({ o: gltf.scene.clone(), a: obj.args });
      });
    });
  }
}
