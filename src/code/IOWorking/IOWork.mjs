export class KeyboardWork {
  constructor (inputfunc, elemet = document) {
    this._arr = new Set();
    this._inputfunc = inputfunc;

    elemet.addEventListener('keydown', (e) => { this._arr.add(e.code); });

    document.addEventListener('keyup', (e) => { this._arr.delete(e.code); });
  }

  update () {
    for (const i of this._arr) {
      this._inputfunc(i);
    }
  }
}

export class MouseWork {
  constructor (elemet = document) {
    this._transZ = 10.0;
    this._mouseX = 0.0; this._mouseY = 0.0;
    this._mouseXChange = 0.0; this._mouseYChange = 0.0;
    this._isPressed = false;

    elemet.addEventListener('wheel', (event) => {
      if (this._transZ > -event.deltaY * 3 / 10000) {
        this._transZ += event.deltaY * 3 / 10000;
      }
    });

    document.addEventListener('mousemove', (event) => {
      if (this._startPosX === undefined) {
        this._startPosX = event.pageX;
      }

      if (this._startPosY === undefined) {
        this._startPosY = event.pageY;
      }

      this._mouseXChange = this._startPosX - event.pageX;
      this._startPosX = event.pageX;

      this._mouseYChange = this._startPosY - event.pageY;
      this._startPosY = event.pageY;

      this._mouseX = event.offsetX;
      this._mouseY = event.offsetY;
    });

    elemet.addEventListener('mousedown', (event) => {
      this._pressX = event.pageX;
      this._pressY = event.pageY;
      this._isPressed = true;
    });

    window.addEventListener('mouseup', () => { this._isPressed = false; });
  }

  get getXChange () {
    const change = this._mouseXChange;
    this._mouseXChange = 0;
    return change;
  }

  get getYChange () {
    const change = this._mouseYChange;
    this._mouseYChange = 0;
    return change;
  }

  get getTransZ () {
    return this._transZ;
  }

  get getIsPressed () {
    return this._isPressed;
  }

  get getPressX () {
    return this._pressX;
  }

  get getPressY () {
    return this._pressY;
  }

  update () {
    this._mouseXChange = 0;
    this._mouseYChange = 0;
  }
}
