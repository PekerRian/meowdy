export function checkCollision(birdY, pipes) {
  const birdTop = birdY;
  const birdBottom = birdY + 40;

  for (const pipe of pipes) {
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + 60;
    const pipeTop = pipe.isTop ? pipe.height : undefined;
    const pipeBottom = pipe.isTop ? undefined : 600 - pipe.height;

    if (
      pipeLeft < 140 && pipeRight > 100 &&
      ((pipe.isTop && birdTop < pipeTop) ||
        (!pipe.isTop && birdBottom > pipeBottom))
    ) {
      return true;
    }
  }

  if (birdBottom >= 600) {
    return true;
  }

  return false;
}