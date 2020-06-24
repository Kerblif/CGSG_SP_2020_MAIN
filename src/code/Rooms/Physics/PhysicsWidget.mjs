import Matter from 'matter-js';
import { MouseWork } from './../../IOWorking/IOWork';
import img from './../../../bin/textures/PhysButton.png';

export class PhisicsWork {
  constructor (id, w = 400) {
    this._engine = Matter.Engine.create();
    this._runner = Matter.Runner.create();

    this._physPanel = document.getElementById(id);
    this._physPanel.style.right = -(w) + 'px';
    this._physPanel.style.width = w + 'px';
    this._physPanel.style.transition = 'right .5s ease-out';
    this._physPanel.style.height = window.innerHeight + 'px';

    this._flag = document.createElement('div');
    this._flag.classList.add('physFlag');
    this._flag.style.top = '15px';
    this._flag.style.right = w + 'px';
    this._physPanel.appendChild(this._flag);

    this._menu = document.createElement('li');
    this._menu.classList.add('physMenu');
    this._menu.textContent = 'Box';
    this._physPanel.appendChild(this._menu);

    this._menuUL = document.createElement('ul');
    this._menuUL.classList.add('physMenuButtons');
    this._menu.appendChild(this._menuUL);

    this._selectedType = 0;

    this._boxButton = document.createElement('li');
    this._boxButton.classList.add('physMenuButton');
    this._boxButton.textContent = 'Box';
    this._menuUL.appendChild(this._boxButton);
    this._boxButton.onclick = (ev) => {
      this._selectedType = 0;
      this._menu.textContent = 'Box';
      this._menu.appendChild(this._menuUL);
    };

    this._triangleButton = document.createElement('li');
    this._triangleButton.classList.add('physMenuButton');
    this._triangleButton.textContent = 'Triangle';
    this._menuUL.appendChild(this._triangleButton);
    this._triangleButton.onclick = (ev) => {
      this._selectedType = 1;
      this._menu.textContent = 'Triangle';
      this._menu.appendChild(this._menuUL);
    };

    this._circleButton = document.createElement('li');
    this._circleButton.classList.add('physMenuButton');
    this._circleButton.textContent = 'Circle';
    this._menuUL.appendChild(this._circleButton);
    this._circleButton.onclick = (ev) => {
      this._selectedType = 2;
      this._menu.textContent = 'Circle';
      this._menu.appendChild(this._menuUL);
    };

    //
    this.b = document.createElement('button');
    this.b.textContent = 'stop';
    this.b.classList.add('physButton');
    this._physPanel.appendChild(this.b);
    this.b.onclick = (ev) => { this._stop(); };

    this.b1 = document.createElement('button');
    this.b1.textContent = 'start';
    this.b1.classList.add('physButton');
    this._physPanel.appendChild(this.b1);
    this.b1.onclick = (ev) => { this._start(); };
    //

    this._image = document.createElement('img');
    this._image.src = img;
    this._flag.appendChild(this._image);

    this._flag.onclick = (e) => {
      if (this._physPanel.style.right !== '0px') {
        this._physPanel.style.right = '0px';
      } else {
        this._physPanel.style.right = -(w) + 'px';
      }
    };

    this._canvas = document.createElement('canvas');
    this._canvas.classList.add('physCanvas');

    this._physPanel.appendChild(this._canvas);

    this._render = Matter.Render.create({
      canvas: this._canvas,
      engine: this._engine,
      options: {
        width: w - 20,
        height: window.innerHeight / 2,
        wireframes: false
      }
    });
    const Bodies = Matter.Bodies;
    this._bodys = [];
    this._bodys.push(Bodies.rectangle(400, 200, 90, 90));
    this._bodys.push(Bodies.circle(380, 100, 45, 10));
    this._bodys.push(Bodies.circle(460, 10, 45, 10));
    this._bodys.push(Bodies.rectangle(400, 380, 810, 60, { isStatic: true }));

    Matter.World.add(this._engine.world, this._bodys);

    Matter.Render.run(this._render);
    // this.disable();

    this._mouseWork = new MouseWork(() => {
      let newBody;

      switch (this._selectedType) {
        case 0:
          newBody = Bodies.rectangle(this._mouseWork.getMouseX, this._mouseWork.getMouseY, 90, 90);
          break;
        case 1:
          newBody = Bodies.polygon(this._mouseWork.getMouseX, this._mouseWork.getMouseY, 3, 60);
          break;
        case 2:
          newBody = Bodies.circle(this._mouseWork.getMouseX, this._mouseWork.getMouseY, 45, 10);
      }

      this._bodys.push(newBody);
      Matter.World.add(this._engine.world, newBody);

      return true;
    }, this._canvas);
  }

  _stop () {
    Matter.Runner.stop(this._runner);
  }

  _start () {
    Matter.Runner.run(this._runner, this._engine);
  }

  /**
   * @param {boolean} value
   */
  set visible (value) {
    if (value) {
      this._start();
      this._physPanel.style.visibility = 'visible';
    } else {
      this._stop();
      this._physPanel.style.visibility = 'hidden';
    }
  }

  enable () {
    this._start();
    this._physPanel.style.visibility = 'visible';
  }

  disable () {
    this._stop();
    this._physPanel.style.visibility = 'hidden';
  }
}
