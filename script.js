document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let player;
    let playerDirection = 0;
    let projectiles = [];
    let spacePressed = false;

    const projectileSpeed = 8; // Adjust projectile speed here

    function init() {
        player = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 100,
            height: 200,
            speed: 30,
            color: 'white'
        };
    }

    function createProjectile() {
        const projectile = {
            x: player.x + player.width / 2,
            y: player.y,
            width: 20,
            height: 100,
            color: 'white'
        };
        projectiles.push(projectile);
    }

    function updateProjectiles() {
        for (let i = 0; i < projectiles.length; i++) {
            projectiles[i].y -= projectileSpeed;

            // Remove projectile if it goes outside the screen
            if (projectiles[i].y < -projectiles[i].height) {
                projectiles.splice(i, 1);
                i--;
            }
        }
    }

    function drawProjectiles() {
        for (const projectile of projectiles) {
            ctx.fillStyle = projectile.color;
            ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);
        }
    }

    function update() {
        player.x += playerDirection * player.speed;

        if (player.x < 0) {
            player.x = 0;
        } else if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }

        updateProjectiles();
    }

    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawProjectiles();
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            playerDirection = -1;
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            playerDirection = 1;
        } else if (e.code === 'Space' && !spacePressed) {
            spacePressed = true;
            createProjectile();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
            playerDirection = 0;
        } else if (e.code === 'Space') {
            spacePressed = false;
        }
    });

    init();
    gameLoop();
});
