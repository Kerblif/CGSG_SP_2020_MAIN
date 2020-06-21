import ModelManager from './MdlMgr.mjs';

import Sidebar from '../Sidebar/Sidebar.js';
import CloseImg from '../../bin/textures/Close.png';

/* School event handler */
export default class School {
  constructor (src, scene, THREE, camera) {
    this._scene = scene;
    this._getModel = this._getModel.bind(this);
    ModelManager.get(src).then(this._getModel);

    this.Sidebar = new Sidebar(512, 'info', CloseImg);

    this.Sidebar.setText('Text sample');
    this.Sidebar.setHeader('Welcome to school #30!!!');

    const raycaster = new THREE.Raycaster();
    let intersect = null;

    this.SchoolMtl = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.3,
      color: 0x808080,
      emissive: 0x1010ff,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.DefaultMtl = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.3,
      color: 0x808080,
      emissive: 0x101010,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.SelectedMtl = new THREE.MeshStandardMaterial({
      color: 0x808080,
      emissive: 0xffff00,
      side: THREE.DoubleSide
    });
    document.addEventListener('click', (ev) => {
      if (this.school == null) {
        return;
      }

      // ev.preventDefault();
      const mouse = new THREE.Vector2(
        (ev.clientX / window.innerWidth) * 2 - 1,
        -(ev.clientY / window.innerHeight) * 2 + 1);

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(this.school.children);

      if (intersects.length > 0 && intersects[0] !== intersect) {
        if (intersect != null) {
          intersect.object.material = this.DefaultMtl;
        }
        intersect = intersects[0];
        intersect.object.material = this.SelectedMtl;
      }
    }, false);

    this.school = null;
  }

  _getModel (glbScene) {
    this.school = glbScene;

    for (let i = 0; i < this.school.children.length; i++) {
      this.school.children[i].material = this.DefaultMtl;
    }

    this._scene.add(this.school);
  }
}
