import Matter from 'matter-js';
import img from './../../../bin/textures/PhysButton.png';

export class PhisicsWork {
  constructor (id, w = 400) {
    const engine = Matter.Engine.create();

    this.physPanel = document.getElementById(id);
    this.physPanel.style.right = -(w) + 'px';
    this.physPanel.style.width = w + 'px';
    this.physPanel.style.transition = 'right .5s ease-out';
    this.physPanel.style.height = window.innerHeight + 'px';

    this.flag = document.createElement('div');
    this.flag.id = 'physflag';
    this.flag.style.position = 'absolute';
    this.flag.style.top = '15px';
    this.flag.style.right = w + 'px';
    console.log(this.flag.style);
    this.physPanel.appendChild(this.flag);

    this.image = document.createElement('img');
    this.image.src = img;
    this.flag.appendChild(this.image);

    this.flag.onclick = (ev) => {
      if (this.physPanel.style.right !== '0px') {
        this.physPanel.style.right = '0px';
      } else {
        this.physPanel.style.right = -(w) + 'px';
      }
    };

    this.canvas = document.createElement('canvas');

    this.canvas.style.position = 'absolute';

    this.canvas.style.marginLeft = 10;
    this.canvas.style.bottom = 10;

    this.physPanel.appendChild(this.canvas);

    const render = Matter.Render.create({
      canvas: this.canvas,
      engine: engine,
      options: {
        width: w - 20,
        height: window.innerHeight / 2,
        wireframes: false
      }
    });
    const Bodies = Matter.Bodies;
    const boxA = Bodies.rectangle(400, 200, 80, 80);
    const ballA = Bodies.circle(380, 100, 40, 10);
    const ballB = Bodies.circle(460, 10, 40, 10);
    const ground = Bodies.rectangle(400, 380, 810, 60, { isStatic: true });

    Matter.World.add(engine.world, [boxA, ballA, ballB, ground]);

    Matter.Engine.run(engine);
    Matter.Render.run(render);
  }
}
