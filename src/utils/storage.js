export function getHighScore() {
  const highScore = localStorage.getItem("highScore");
  return highScore ? parseInt(highScore, 10) : 0;
}

export function saveHighScore(score) {
  const highScore = getHighScore();
  if (score > highScore) {
    localStorage.setItem("highScore", score.toString());
  }
}
