document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game variables
    let player;
    let playerDirection = 0; // -1 for left, 0 for no movement, 1 for right

    function init() {
        player = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 50,
            height: 20,
            speed: 20, // Adjust the speed value as desired
            color: 'white'
        };
    }

    function update() {
        player.x += playerDirection * player.speed;

        if (player.x < 0) {
            player.x = 0;
        } else if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
    }

    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Event listeners for arrow keys
    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') {
            playerDirection = -1;
        } else if (e.code === 'ArrowRight') {
            playerDirection = 1;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            playerDirection = 0;
        }
    });

    init();
    gameLoop();
});
