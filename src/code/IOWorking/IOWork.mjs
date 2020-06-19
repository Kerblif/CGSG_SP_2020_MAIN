export default class KeyboardWork {
  constructor (inputfunc) {
    this.arr = new Set();
    this.inputfunc = inputfunc;

    const add = (e) => { this.arr.add(e.key); };

    let func = add.bind(this);

    document.addEventListener('keydown', func);

    const remove = (e) => { this.arr.delete(e.key); };

    func = remove.bind(this);

    document.addEventListener('keyup', func);
  }

  update () {
    for (const i of this.arr) {
      this.inputfunc(i);
    }
  }
}

export class MouseWork {
  constructor () {
    this.transX = 0.0; this.transY = 0.0; this.transZ = 10.0;
    this.mouseX = 0.0; this.mouseY = 0.0;
    this.mouseXChange = 0.0; this.mouseYChange = 0.0;

    let func = this.onWheel.bind(this);

    document.addEventListener('wheel', func);

    func = this.onMouseChangePos.bind(this);

    document.addEventListener('mousemove', func);

    func = this.onMouseMove.bind(this);

    document.onmousedown = (event) => {
      this.startPosX = event.pageX;
      this.startPosY = event.pageY;
      document.addEventListener('mousemove', func);
    };

    window.onmouseup = () => {
      document.removeEventListener('mousemove', func);
    };
  }

  onWheel (event) {
    if (this.transZ > -event.deltaY * 3 / 10000) {
      this.transZ += event.deltaY * 3 / 10000;
    }
  }

  onMouseMove (event) {
    this.mouseXChange = this.startPosX - event.pageX;
    this.transX += this.mouseXChange;
    this.startPosX = event.pageX;

    this.mouseYChange = this.startPosY - event.pageY;
    this.transY += this.mouseYChange;
    this.startPosY = event.pageY;
  }

  onMouseChangePos (event) {
    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;
  }

  get getTransX () {
    return this.transX;
  }

  get getTransY () {
    return this.transY;
  }

  get getXChange () {
    const change = this.mouseXChange;
    this.mouseXChange = 0;
    return change;
  }

  get getYChange () {
    const change = this.mouseYChange;
    this.mouseYChange = 0;
    return change;
  }

  get getTransZ () {
    return this.transZ;
  }
}
