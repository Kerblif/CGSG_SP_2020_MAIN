import Matter from 'matter-js';

export class PhisicsWork {
  constructor (canvas, x, y, w, h, isXInverted = false, isYInverted = false) {
    const engine = Matter.Engine.create();

    x = String(x);
    y = String(y);
    w = String(w);
    h = String(h);

    canvas.style.position = 'absolute';
    if (!isXInverted) {
      canvas.style.left = x;
      if (x.slice(-1) !== '%' && x.slice(-2) !== 'px') { canvas.style.left += 'px'; }
    } else {
      canvas.style.right = x;
      if (x.slice(-1) !== '%' && x.slice(-2) !== 'px') { canvas.style.right += 'px'; }
    }

    if (!isYInverted) {
      canvas.style.top = y;
      if (y.slice(-1) !== '%' && y.slice(-2) !== 'px') { canvas.style.top += 'px'; }
    } else {
      canvas.style.bottom = y;
      if (y.slice(-1) !== '%' && y.slice(-2) !== 'px') { canvas.style.bottom += 'px'; }
    }

    canvas.style.width = w;
    canvas.style.height = h;
    if (w.slice(-1) !== '%' && w.slice(-2) !== 'px') { canvas.style.width += 'px'; }
    if (h.slice(-1) !== '%' && h.slice(-2) !== 'px') { canvas.style.height += 'px'; }

    const render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: w,
        height: h,
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
