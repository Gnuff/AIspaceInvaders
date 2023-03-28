document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game variables
    let player;
    let aliens;
    let projectiles;
    let defenses;

    function init() {
        // Initialize game objects
    }

    function update() {
        // Update game objects
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw game objects
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    init();
    gameLoop();
});
