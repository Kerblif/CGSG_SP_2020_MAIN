import * as THREE from 'three';
import ModelManager from './MdlMgr.mjs';
import osFloor_1 from '../../bin/models/school/1_Floor.glb';
import osFloor_2 from '../../bin/models/school/2_Floor.glb';
import osFloor_3 from '../../bin/models/school/3_Floor.glb';
import osFloor_4 from '../../bin/models/school/4_Floor.glb';
import osSchool from '../../bin/models/school/MainModel.glb';
// import osSchool from '../../bin/models/school/pml30light.glb';

/**
 * Error of not exist (undefined) properties.
 * @constructor
 * @param {string} message - error message.
 */
function NExist (message) {
  this.name = 'NExist';
  this.message = (message || '');
}

/* School event handler */
export default class School {
  /**
   * @constructor
   * @param  {THREE.Scene} scene - scene to add school model/floors
   * @param  {THREE.Camera} camera - camera for mouse selector.
   */
  constructor (scene, camera) {
    this._raycaster = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();
    this._roomsMeta = new RoomsMeta(this);

    this._camera = camera;
    this._scene = scene;
    this._hoverMtl = new THREE.MeshPhongMaterial({ color: 0xEEEEEE });
    this._deselectMtl = new THREE.MeshPhongMaterial({ color: 0xBBBBBB });
    this._selectMtl = new THREE.MeshPhongMaterial({ color: 0xFF3333 });
    document.addEventListener('mousemove', this._onMouseMove.bind(this), false);
    document.addEventListener('dblclick', this._onMouseClick.bind(this), false);
    // document.addEventListener('wheel', this._onMouseWheel.bind(this));

    let tmp = (obj) => {
      this._school = obj.obj;
      this._school.traverse((obj) => {
        obj.material = this._deselectMtl;
      });
    };
    tmp = tmp.bind(this);
    ModelManager.get({ src: osSchool }).then(tmp);
    this._floors = {};
    tmp = (val) => {
      this._floors[val.args.name] = val.obj;
      this._floors[val.args.name].traverse((obj) => {
        obj.material = this._deselectMtl;
      });
    };
    tmp = tmp.bind(this);
    ModelManager.get({ src: osFloor_1, args: { name: 1 } }).then(tmp);
    ModelManager.get({ src: osFloor_2, args: { name: 2 } }).then(tmp);
    ModelManager.get({ src: osFloor_3, args: { name: 3 } }).then(tmp);
    ModelManager.get({ src: osFloor_4, args: { name: 4 } }).then(tmp);
    this._cur = new THREE.Object3D();
    this._hoverObj = {};
    this._selectObj = {};
  }

  /**
   * Set the floor.
   * @throws NExist error.
   * @param {number} num - number of floor for set.
   * @returns {THREE.Object3D} - the model;
   */
  setFloor (num) {
    const model = this._floors[num];
    if (model === undefined) { throw new NExist('Not exist: floor.'); }
    this._scene.remove(this._cur);
    model.material = this._selectMtl;
    this._scene.add(this._cur = model);
    this.EventChangeFloor(num);
    return model;
  }

  /**
   * Called when floor changed.
   * @param {number} num - the floor number: 1..4.
   */
  EventChangeFloor (num) {}

  /**
   * Set the room.
   * @throws NExist error.
   * @param {string} name - name of room.
   * @returns {THREE.Object3D} - the model;
   */
  setRoom (name) {
    const obj = this._cur.getObjectById(name);
    if (obj === undefined) { throw new NExist('Not exist: room.'); }
    const delTmp = this._deselectMtl;
    this._cur.traverse((o) => { o.material = delTmp; });
    obj.material = this._selectMtl;
    this.EventChangeRoom(name);
    return obj;
  }

  /**
   * Called when room changed.
   * @param {string} name - the room name.
   */
  EventChangeRoom (name) {}

  /**
   * Set the whole model.
   * @throws NExist  error.
   * @returns {THREE.Object3D} the model.
   */
  setStreetView () {
    this._scene.remove(this._cur);
    if (this._school === undefined) { throw new NExist('Model onload.'); }
    this._scene.add(this._cur = this._school);
    this.EventStreetView();
    return this._school;
  }

  /**
   * Called when set the street view.
   */
  EventStreetView () {}

  /** 1..4 - Floors, 0 - Street view.
   * @param  {Boolean} value - set the keys for switch models.
   */
  set _debugKeysSwitcher (value) {
    if (value === true) {
      document.addEventListener('keydown', this._keyDebugSwitcher.bind(this));
    } else {
      document.removeEventListener('keydown', this._keyDebugSwitcher.bind(this));
    }
  }

  /**
   * Called, when new object select.
   * @param  {Object} obj - selected object.
   */
  EventSelect (obj) {}

  get selectObj () {
    return this._selectObj;
  }

  _onMouseMove (e) {
    e.preventDefault();

    this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);

    const select = this._raycaster.intersectObjects(this._cur.children);
    if (this._selectObj !== this._hoverObj) { this._hoverObj.material = this._deselectMtl; }
    if (select.length > 0) {
      if (select[0].object === this._selectObj) { return; }
      select[0].object.material = this._hoverMtl;
      this._hoverObj = select[0].object;
    }
  }

  _onMouseClick (e) {
    e.preventDefault();

    this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mouse, this._camera);

    const select = this._raycaster.intersectObjects(this._cur.children);
    if (select.length > 0) {
      this._selectObj.material = this._deselectMtl;
      select[0].object.material = this._selectMtl;
      this._selectObj = select[0].object;
      this.EventSelect(this._selectObj);
    } else {
      this._selectObj.material = this._deselectMtl;
    }
  }

  _keyDebugSwitcher (e) {
    switch (e.code) {
      case 'Digit0': this.setStreetView(); break;
      case 'Digit1': this.setFloor(1); break;
      case 'Digit2': this.setFloor(2); break;
      case 'Digit3': this.setFloor(3); break;
      case 'Digit4': this.setFloor(4); break;
    }
  }
}

const jsonMETA = {};

class RoomsMeta {
  /**
   * @param  {School} school - School class representation.
   */
  constructor (school) {
    this._school = school;
    const lRoomName = document.getElementById('lRoomName');
    const iRoomNumber = document.getElementById('iRoomNumber');
    const iRoomLessons = document.getElementById('iRoomLessons');
    const iRoomInfo = document.getElementById('iRoomInfo');
    this._school.EventSelect = (obj) => {
      lRoomName.innerText = obj.name;
      (jsonMETA[obj.name] !== undefined) || ((function () {
        jsonMETA[obj.name] = {};
        jsonMETA[obj.name].num = 0;
        jsonMETA[obj.name].lessons = 'math,physics'.split(',');
        jsonMETA[obj.name].info = 'classroom in 30';
      })());
      iRoomNumber.value = jsonMETA[obj.name].num;
      iRoomLessons.value = String(jsonMETA[obj.name].lessons);
      iRoomInfo.value = jsonMETA[obj.name].info;
    };
    const iRoomSubmit = document.getElementById('iRoomSubmit');
    iRoomSubmit.onclick = () => {
      if (jsonMETA[lRoomName.innerText] !== undefined) {
        jsonMETA[lRoomName.innerText].num = iRoomNumber.value;
        jsonMETA[lRoomName.innerText].lessons = iRoomLessons.value.split(',');
        jsonMETA[lRoomName.innerText].info = iRoomInfo.value;
      }
    };
  }
}
