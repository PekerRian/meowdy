export default function useCollision(MeowY, pipes, onCollision) {
  const Meow_WIDTH = 40;
  const Meow_HEIGHT = 40;

  pipes.forEach(pipe => {
    const pipeTop = {
      x: pipe.x,
      y: 0,
      width: 60,
      height: pipe.height
    };

    const pipeBottom = {
      x: pipe.x,
      y: pipe.height + 150,
      width: 60,
      height: 600 - (pipe.height + 150)
    };

    const Meow = {
      x: 100,
      y: MeowY,
      width: Meow_WIDTH,
      height: Meow_HEIGHT
    };

    drawDebug(Meow, pipeTop, pipeBottom);

    if (isBorderOverlap(Meow, pipeTop)) {
      onCollision();
    }

    if (isBorderOverlap(Meow, pipeBottom)) {
      onCollision();
    }
  });
}

function isBorderOverlap(Meow, pipe) {
  const MeowLeft = Meow.x;
  const MeowRight = Meow.x + Meow.width;
  const MeowTop = Meow.y;
  const MeowBottom = Meow.y + Meow.height;

  const pipeLeft = pipe.x;
  const pipeRight = pipe.x + pipe.width;
  const pipeTop = pipe.y;
  const pipeBottom = pipe.y + pipe.height;

  const isColliding =
    (MeowRight >= pipeLeft && MeowLeft <= pipeLeft) ||
    (MeowLeft <= pipeRight && MeowRight >= pipeRight) ||
    (MeowBottom >= pipeTop && MeowTop <= pipeTop) ||
    (MeowTop <= pipeBottom && MeowBottom >= pipeBottom);

  return isColliding;
}