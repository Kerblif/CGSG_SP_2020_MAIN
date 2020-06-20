import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const modelCash = new Map();
const gltfLoader = new GLTFLoader();

export default class ModelManager {
  static get (source) {
    if (modelCash.has(source)) {
      return new Promise(function (resolve, reject) {
        resolve(modelCash.get(source).clone());
      });
    }
    return new Promise(function (resolve, reject) {
      gltfLoader.load(source, (gltf) => {
        modelCash.set(source, gltf.scene);
        resolve(gltf.scene.clone());
      });
    });
  }
}
