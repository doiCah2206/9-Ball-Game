import * as RAPIER from "@dimforge/rapier2d";
import { Ball, CueBall, ObjectBall } from './utils/Ball';
import { drawTable } from './utils/Table';

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const world = new RAPIER.World({ x: 0, y: 0 });
const balls: Ball[] = [
  new CueBall(world, 100, 100),
  new ObjectBall(world, 180, 100, "yellow"),
  new ObjectBall(world, 220, 120, "blue"),
];

function loop() {
  world.step();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTable(ctx);
  for (const ball of balls) {
    ball.draw(ctx);
  }

  requestAnimationFrame(loop);
}

loop();