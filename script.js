document.addEventListener("DOMContentLoaded", () => {
console.log("DOMContentLoaded event fired");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const desiredFPS = 60; // Set your desired frame rate (e.g., 60)
const velocityScaleFactor = 60 / desiredFPS; // Replace desiredFPS with the target frame rate (e.g., 60)


const STARTING_SCREEN = 0;
const IN_GAME = 1;
const WIN_SCREEN = 2;
const LOST_SCREEN = 3;

let gameState = STARTING_SCREEN;

// const menuMusic = new Audio('audio/backgroundMusic/menu.wav');
// menuMusic.loop = true;
// 
// const stage1Music = new Audio('audio/backgroundMusic/stage1.wav');
// stage1Music.loop = true;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

let menuMusicBuffer;
let stage1MusicBuffer;
let youWonMusicBuffer;


// Create the button element
const startGameButton = document.createElement('button');
startGameButton.innerHTML = 'Start Game';
startGameButton.id = 'startGameButton';
startGameButton.style.display = 'none';
startGameButton.style.fontSize = '34px';
startGameButton.style.backgroundColor = '#91BD9A'; // Hide the button initially

// Append the button element to the body
document.body.appendChild(startGameButton);

// Add the event listener for the button
startGameButton.addEventListener('click', () => {
    buttonPushSound(); 
    gameState = IN_GAME;
    startGameButton.style.display = 'none'; // Hide the button when the game starts
});

// Load player image
const playerImage = new Image();
playerImage.src = 'graphics/zipBagEmpty.png';

// Load drugCounterBox image
const drugCounterBoxImage = new Image();
drugCounterBoxImage.src = 'graphics/zipBagFull.png';

function setCanvasDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

setCanvasDimensions();
window.addEventListener("resize", setCanvasDimensions);

let lastTimestamp = 0;

let player;
let playerDirection = 0;
let projectiles = [];
let spacePressed = false;
let noses = [];
const nosesPerRow = 6; // Set the number of noses per row
const totalNoses = 1; // Set the total number of noses

const projectileSpeed = 4; // Adjust projectile speed here
const totalProjectilesAllowed = 40; // Set the total number of projectiles allowed

let projectilesRemaining = totalProjectilesAllowed;

let noseGroupDirection = 1; // 1 for right, -1 for left
const noseGroupSpeed = 0.05;
const noseGroupVerticalStep = 20;
const noseGroupHorizontalPadding = 50;

const sniffSound = new Audio('audio/sniff.mp3');

const buttonSound = new Audio('audio/buttonPush.wav');

let snots = [];

const backgroundImage = new Image();
backgroundImage.src = 'graphics/background.png';

const logoImage = new Image();
logoImage.src = 'graphics/logo.png';
// logoImage.width = 100; // Set the width of the image to 200 pixels
// logoImage.height = 100; 
logoImage.onload = function() {
  console.log('Logo image loaded');
}

function loadAudioFile(url, callback) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
        audioContext.decodeAudioData(request.response, (buffer) => {
            callback(buffer);
        });
    };
    request.send();
}

loadAudioFile('audio/backgroundMusic/menu.wav', (buffer) => {
    menuMusicBuffer = buffer;
});

loadAudioFile('audio/backgroundMusic/stage1.wav', (buffer) => {
    stage1MusicBuffer = buffer;
});

loadAudioFile('audio/backgroundMusic/youWon.wav', (buffer) => {
    youWonMusicBuffer = buffer;
    // if (gameState === WIN_SCREEN && youWonMusicBuffer) {
    //     playBuffer(youWonMusicBuffer);
    // }
});

let currentSource = null;

function playBuffer(buffer, callback) {
    if (currentSource) {
        currentSource.stop();
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(audioContext.destination);

    // Wait for the buffer to load before playing it
    source.onended = function() {
        if (callback) {
            callback();
        }
    };

    source.start(0);
    currentSource = source;
}


function init() {
    console.log("init function called");
    player = {
        x: canvas.width / 2,
        y: canvas.height - 180,
        width: 130,
        height: 180,
        speed: 0.3, // Apply the scaling factor to the player's speed
        color: 'white'
    };
    
    noseImage = new Image();
    noseImage.src = 'graphics/noseSniffer.png';
    noseImage.addEventListener('load', () => {
        console.log('Nose image loaded');
    });
    
    noseImageLeft = new Image();
    noseImageLeft.src = 'graphics/noseSnifferLeft.png';
    noseImageLeft.addEventListener('load', () => {
        console.log('Nose image left loaded');
    });
    
    noseImageRight = new Image();
    noseImageRight.src = 'graphics/noseSnifferRight.png';
    noseImageRight.addEventListener('load', () => {
        console.log('Nose image right loaded');
    });
    
    projectileCounterBox = createProjectileCounterBox();
    noses = createNoses();
    // gameLoop();
    requestAnimationFrame(update);
    requestAnimationFrame(draw);
    setInterval(spawnSnot, 5000);
    
}

function randomNostrilColors() {
    const colors = [
        { left: 'rgba(255, 0, 0, 0.5)', right: 'rgba(0, 255, 0, 0.5)' }, // Red - Green
        { left: 'rgba(0, 255, 0, 0.5)', right: 'rgba(255, 0, 0, 0.5)' }, // Green - Red
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createNoses() {
    const noseWidth = 150;
    const noseHeight = 150;
    const numberOfRows = Math.ceil(totalNoses / nosesPerRow);

    const topPadding = 0; // Set the top padding for the group of noses
    const leftPadding = 100; // Set the left padding for the group of noses
    const verticalPadding = 60; // Set the vertical padding between rows of noses

    // Calculate the total width of the noses group including padding
    const groupWidth = canvas.width - leftPadding * 2;
    // Calculate the padding based on the group width and the number of noses per row
    const horizontalPadding = (groupWidth - noseWidth * nosesPerRow) / (nosesPerRow - 1);

    const nosesArray = [];

    for (let row = 0; row < numberOfRows; row++) {
        for (let col = 0; col < nosesPerRow; col++) {
            const index = row * nosesPerRow + col;
            if (index < totalNoses) {
                const nostrilSize = 40;
                const nostrilColors = randomNostrilColors();
                const nostrilL = {
                    x: 5,
                    y: 60,
                    width: nostrilSize,
                    height: nostrilSize,
                    color: nostrilColors.left
                };
                const nostrilR = {
                    x: 105,
                    y: 60,
                    width: nostrilSize,
                    height: nostrilSize,
                    color: nostrilColors.right
                };
    
                const nose = {
                    x: leftPadding + col * (noseWidth + horizontalPadding),
                    y: topPadding + row * (noseHeight + verticalPadding),
                    width: noseWidth,
                    height: noseHeight,
                    color: 'rgba(255, 165, 0, 0.0)',
                    nostrilL: nostrilL,
                    nostrilR: nostrilR
                };
                nosesArray.push(nose);
            }
        }
    }

    return nosesArray;
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function createProjectile() {
    // Check if there are any projectiles remaining
    if (projectilesRemaining > 0) {
        const projectile = {
            x: player.x + player.width / 2,
            y: player.y,
            width: 20,
            height: 150,
            color: 'white'
        };
        projectiles.push(projectile);

        // Decrease the remaining projectiles
        projectilesRemaining--;

        // Update the height of the projectile counter box
        projectileCounterBox.height = (projectilesRemaining / totalProjectilesAllowed) * player.height;
    }
}

class Snot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.speed = 0.5;
        this.color = 'green';
    }
}
function spawnSnot() {
    let closestNose = null;
    let minDistance = Infinity;

    for (const nose of noses) {
        const distance = Math.abs(player.x + player.width / 2 - nose.x - nose.width / 2);
        if (distance < minDistance) {
            minDistance = distance;
            closestNose = nose;
        }
    }

    if (closestNose) {
        const snotX = closestNose.x + closestNose.nostrilR.x + closestNose.nostrilR.width / 2;
        const snotY = closestNose.y + closestNose.nostrilR.y + closestNose.nostrilR.height;
        const snot = new Snot(snotX, snotY);
        snots.push(snot);
    }
}


function createProjectileCounterBox() {
    return {
        x: 20, // Set the x position of the counter box
        y: canvas.height - player.height - 20, // Set the y position of the counter box
        width: player.width,
        height: player.height,
        color: 'rgba(255, 0, 0, 0.5)' // Red color with opacity
    };
}

function playSniffSound() {
    const sniffSoundInstance = new Audio('audio/sniff.mp3');
    sniffSoundInstance.currentTime = 0; // Reset the audio playback position
    sniffSoundInstance.play(); // Play the audio
}

function buttonPushSound() {
    const buttonPushSoundInstance = new Audio('audio/buttonPush.wav');
    buttonPushSoundInstance.currentTime = 0; // Reset the audio playback position
    buttonPushSoundInstance.play(); // Play the audio
}

function drawProjectileCounterBox() {
    const sourceY = drugCounterBoxImage.height * (1 - projectilesRemaining / totalProjectilesAllowed);
    const sourceHeight = drugCounterBoxImage.height - sourceY;

    ctx.drawImage(
        drugCounterBoxImage,
        0, sourceY,
        drugCounterBoxImage.width, sourceHeight,
        projectileCounterBox.x, projectileCounterBox.y,
        projectileCounterBox.width, projectileCounterBox.height
    );
}

function updateProjectileCounterBox() {
    const usedHeight = (1 - projectilesRemaining / totalProjectilesAllowed) * player.height;
    projectileCounterBox.height = player.height - usedHeight;
    projectileCounterBox.y = canvas.height - player.height - 0 + usedHeight;
}

function updateProjectiles() {
    for (let i = 0; i < projectiles.length; i++) {
        projectiles[i].y -= projectileSpeed;

        // Check for collisions with nostrils
        for (let j = 0; j < noses.length; j++) {
            if (
                checkCollision(projectiles[i], {
                    x: noses[j].x + noses[j].nostrilL.x,
                    y: noses[j].y + noses[j].nostrilL.y,
                    width: noses[j].nostrilL.width,
                    height: noses[j].nostrilL.height,
                }) ||
                checkCollision(projectiles[i], {
                    x: noses[j].x + noses[j].nostrilR.x,
                    y: noses[j].y + noses[j].nostrilR.y,
                    width: noses[j].nostrilR.width,
                    height: noses[j].nostrilR.height,
                })
            ) {
                noses[j].hit = true; // Add a hit property to the nose object
                noses[j].timeHit = Date.now(); // Add a timestamp for when the nose was hit
                projectiles.splice(i, 1);
                i--;
                
                playSniffSound();
                
                break;
            }
        }

        // Remove projectile if it goes outside the screen
        if (projectiles[i] && projectiles[i].y < -projectiles[i].height) {
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

let showWin = false;

// // Call this function to start the periodic update of noseGroupSpeed
// function startNoseGroupSpeedUpdate() {
//   setInterval(function() {
//     noseGroupSpeed += 1.01;
//   }, 1000);
// }

function update(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    let nextState = null;
    switch (gameState) {
        case STARTING_SCREEN:
            // Handle starting screen logic here
            break;
        case IN_GAME:
            // Handle in-game logic here (your current update() content)
            player.x += playerDirection * player.speed * deltaTime;
            
            if (player.x < 0) {
                player.x = 0;
            } else if (player.x + player.width > canvas.width) {
                player.x = canvas.width - player.width;
            }
            
            // Update the projectileCounterBox's x position to follow the player
            projectileCounterBox.x = player.x;
            
            // Move the group of noses horizontally
            for (const nose of noses) {
                nose.x += noseGroupSpeed * noseGroupDirection * deltaTime;
            }
            
            // Check if any nose has reached the screen edges
            let reachedEdge = false;
            for (const nose of noses) {
                if (
                    (noseGroupDirection === 1 && nose.x + nose.width > canvas.width - noseGroupHorizontalPadding) ||
                    (noseGroupDirection === -1 && nose.x < noseGroupHorizontalPadding)
                ) {
                    reachedEdge = true;
                    break;
                }
            }
            
            // If the group of noses reached the edge, move them down and change direction
            if (reachedEdge) {
                noseGroupDirection *= -1;
                for (const nose of noses) {
                    nose.y += noseGroupVerticalStep;
                }
            }
            
            // Check if any nostril has collided with the player or gone outside the screen
            for (const nose of noses) {
                const nostrilL = {
                    x: nose.x + nose.nostrilL.x,
                    y: nose.y + nose.nostrilL.y,
                    width: nose.nostrilL.width,
                    height: nose.nostrilL.height,
                };
                const nostrilR = {
                    x: nose.x + nose.nostrilR.x,
                    y: nose.y + nose.nostrilR.y,
                    width: nose.nostrilR.width,
                    height: nose.nostrilR.height,
                };
            
                if (
                    checkCollision(nostrilL, player) ||
                    checkCollision(nostrilR, player) ||
                    nostrilL.y + nostrilL.height > canvas.height ||
                    nostrilR.y + nostrilR.height > canvas.height
                ) {
                    // Handle game over logic here
                    console.log("Game Over");
                    gameState = LOST_SCREEN
                    break;
                }
                if (allNosesDestroyed()) {
                    gameState = WIN_SCREEN;
                }
            }
            
            updateProjectiles();
            updateProjectileCounterBox();
            
            // Update the noses' hit state
            for (let i = 0; i < noses.length; i++) {
                const nose = noses[i];
                if (nose.hit) {
                    const elapsedTime = Date.now() - nose.timeHit;
                    if (elapsedTime >= 2000) {
                        noses.splice(i, 1);
                        i--;
                    }
                }
            }
            
            // Move the snots
            for (const snot of snots) {
                snot.y += snot.speed * deltaTime;
            }
            
            // Check if any snot has collided with the player
            for (let i = 0; i < snots.length; i++) {
                const snot = snots[i];
                if (checkCollision(snot, player)) {
                    console.log("Snot collision detected");
                    projectilesRemaining -= 4;
                    snots.splice(i, 1);
                    i--;
                }
            }
            
            if (allNosesDestroyed()) {
                nextState = WIN_SCREEN;
            }
            break;
        case WIN_SCREEN:
            // Handle win screen logic here
            console.log("Switched to WIN_SCREEN");
            if (youWonMusicBuffer && (!currentSource || currentSource.buffer !== youWonMusicBuffer)) {
                playBuffer(youWonMusicBuffer);
            }
            break;
        case LOST_SCREEN:
            // Handle lost screen logic here
            break;
    }
    switch (gameState) {
        case STARTING_SCREEN:
        // if (youWonMusicBuffer && (!currentSource || currentSource.buffer !== youWonMusicBuffer)) {
        //     playBuffer(youWonMusicBuffer);
        // }
            if (menuMusicBuffer && (!currentSource || currentSource.buffer !== menuMusicBuffer)) {
                playBuffer(menuMusicBuffer);
            }
            break;
        case IN_GAME:
            if (stage1MusicBuffer && (!currentSource || currentSource.buffer !== stage1MusicBuffer)) {
                playBuffer(stage1MusicBuffer);
            }
            break;
        case WIN_SCREEN:
            // console.log("Switched to WIN_SCREEN");
            // if (youWonMusicBuffer && (!currentSource || currentSource.buffer !== youWonMusicBuffer)) {
            //     playBuffer(youWonMusicBuffer);
            // }
          break;
        default:
            if (currentSource) {
                currentSource.stop();
                currentSource = null;
            }
            break;
    }
    if (nextState) {
        gameState = nextState;
    }
    
    requestAnimationFrame(update);
    
}



function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Create a temporary canvas and context for the nose image outside the draw loop
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d');

function drawNoses() {
    for (const nose of noses) {
        // Draw nostrils with their fill colors
        ctx.fillStyle = nose.nostrilL.color;
        ctx.fillRect(nose.x + nose.nostrilL.x, nose.y + nose.nostrilL.y, nose.nostrilL.width, nose.nostrilL.height);

        ctx.fillStyle = nose.nostrilR.color;
        ctx.fillRect(nose.x + nose.nostrilR.x, nose.y + nose.nostrilR.y, nose.nostrilR.width, nose.nostrilR.height);

        // Choose the correct nose image based on the green nostril and hit state
        let chosenNoseImage;
        if (nose.hit) {
            chosenNoseImage = noseImage;
        } else {
            chosenNoseImage = nose.nostrilL.color === 'rgba(0, 255, 0, 0.5)' ? noseImageLeft : noseImageRight;
        }

        // Set the temporary canvas size for the current nose
        tempCanvas.width = nose.width;
        tempCanvas.height = nose.height;

        // Draw the nose image with rounded corners on the temporary canvas
        const cornerRadius = 40; // Adjust this value to change the rounded corner radius
        tempCtx.beginPath();
        tempCtx.moveTo(cornerRadius, 0);
        tempCtx.lineTo(nose.width - cornerRadius, 0);
        tempCtx.quadraticCurveTo(nose.width, 0, nose.width, cornerRadius);
        tempCtx.lineTo(nose.width, nose.height - cornerRadius);
        tempCtx.quadraticCurveTo(nose.width, nose.height, nose.width - cornerRadius, nose.height);
        tempCtx.lineTo(cornerRadius, nose.height);
        tempCtx.quadraticCurveTo(0, nose.height, 0, nose.height - cornerRadius);
        tempCtx.lineTo(0, cornerRadius);
        tempCtx.quadraticCurveTo(0, 0, cornerRadius, 0);
        tempCtx.closePath();
        tempCtx.clip();

        tempCtx.globalAlpha = 1; // Adjust the opacity value as needed
        tempCtx.drawImage(chosenNoseImage, 0, 0, nose.width, nose.height);

        // Draw the temporary canvas with the nose image on the main canvas
        ctx.globalAlpha = 1.0; // Reset the globalAlpha to 1 for other drawings
        ctx.drawImage(tempCanvas, nose.x, nose.y, nose.width, nose.height);
    }
}


function allNosesDestroyed() {
    return noses.length === 0;
}

function showWinScreen() {
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.fillText("You Win!", canvas.width / 2 - 100, canvas.height / 2 - 50);
    // console.log("Switched to WIN_SCREEN");
}

const backgroundCanvas = document.createElement('canvas');
const backgroundCtx = backgroundCanvas.getContext('2d');


function drawBackground() {
    const imgAspectRatio = backgroundImage.width / backgroundImage.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let destWidth, destHeight, offsetX = 0, offsetY = 0;

    if (canvasAspectRatio > imgAspectRatio) {
        destWidth = canvas.width;
        destHeight = canvas.width / imgAspectRatio;
        offsetY = (canvas.height - destHeight) / 2;
    } else {
        destWidth = canvas.height * imgAspectRatio;
        destHeight = canvas.height;
        offsetX = (canvas.width - destWidth) / 2;
    }

    ctx.drawImage(backgroundImage, offsetX, offsetY, destWidth, destHeight);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    switch (gameState) {
        case STARTING_SCREEN:
          // Draw starting screen content here
            // ctx.fillStyle = "#91BD9A";
            // ctx.font = "68px sans-serif";
          
            // Get the width and height of the logo image
            const logoWidth = logoImage.width;
            const logoHeight = logoImage.height;
          
            // Draw the logo image at twice the size
            const scaleFactor = 0.5;
            ctx.drawImage(logoImage, canvas.width / 2 - logoWidth / 2 * scaleFactor, canvas.height / 2 - logoHeight / 2 * scaleFactor - 100, logoWidth * scaleFactor, logoHeight * scaleFactor);
          
            // Draw the "NOSE INVADERS" text below the logo, centered
            // const textWidth = ctx.measureText("NOSE INVADERS").width;
            // const textX = canvas.width / 2 - textWidth / 2;
            // const textY = canvas.height / 2 + logoHeight / 2 * scaleFactor + 50;
            // ctx.fillText("NOSE INVADERS", textX, textY);
          
            startGameButton.style.display = 'block'; // Show the button
            startGameButton.style.position = 'absolute';
            startGameButton.style.left = (canvas.width / 2 - startGameButton.clientWidth / 2) + 'px';
            startGameButton.style.top = (canvas.height / 2 + logoHeight / 3 * scaleFactor + 120-60) + 'px';
            // startNoseGroupSpeedUpdate();
          break;
        case IN_GAME:
            // Draw in-game content here (your current draw() content)
            startGameButton.style.display = 'none'; // Hide the button
            if (showWin) {
                showWinScreen();
            } else {
                drawPlayer();
                drawNoses();
                drawProjectiles();
                drawProjectileCounterBox();
                // Draw snots
                ctx.fillStyle = 'green';
                for (const snot of snots) {
                    ctx.fillRect(snot.x, snot.y, snot.width, snot.height);
                }

            }// Add this line to draw the projectile counter box
            break;
        case WIN_SCREEN:
            // Draw win screen content here
            showWinScreen();
            // console.log("Switched to WIN_SCREEN2");
            break;
        case LOST_SCREEN:
            // Draw lost screen content here
            break;
    }
    // setTimeout(draw, 1000 / 60);
    requestAnimationFrame(draw);
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
});
