import Matter from 'matter-js';

export class PhisicsWork {
  constructor () {
    const engine = Matter.Engine.create();
    const render = Matter.Render.create({
      engine: engine,
      options: {
        width: 800,
        height: 400,
        wireframes: true
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
