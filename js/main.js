let game;
let lastTime = 0;

function gameLoop(currentTime) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    game.tick(deltaTime);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', async () => {
    game = new Game();
    await game.init();

    requestAnimationFrame(gameLoop);
});
