// Wait for the DOM content to load before running the script
document.addEventListener("DOMContentLoaded", () => {
    // Get the canvas element and its 2D drawing context
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Set the canvas dimensions to fill the entire window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Declare game variables
    let player;

    // Initialize game objects and settings
    function init() {
        // Create the player object with position, dimensions, speed, and color properties
        player = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 50,
            height: 20,
            speed: 500,
            color: 'white'
        };
    }

    // Update game objects and handle game logic
    function update() {
        // Constrain the player's movement within the canvas boundaries
        if (player.x < 0) {
            player.x = 0;
        } else if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }
    }

    // Draw the player on the canvas
    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Clear the canvas and draw game objects
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
    }

    // The main game loop function that updates and redraws the game
    function gameLoop() {
        update();
        draw();
        // Use requestAnimationFrame to keep the game loop running smoothly
        requestAnimationFrame(gameLoop);
    }

    // Add event listeners for arrow keys to control player movement
    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft') {
            // Move the player to the left
            player.x -= player.speed;
        } else if (e.code === 'ArrowRight') {
            // Move the player to the right
            player.x += player.speed;
        }
    });

    // Initialize the game and start the game loop
    init();
    gameLoop();
});
