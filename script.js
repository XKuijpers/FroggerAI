// Variables
const gameBoard = document.getElementById('game-board');
const frog = document.getElementById('frog');
const gameWidth = 400;
const gameHeight = 900; // Increased height for a bigger map
const laneHeight = 60;
const frogSize = 40;
const objectWidth = 80; // Width of cars and logs
const objectHeight = 40; // Height of cars and logs
const winY = 0; // The Y position where the player wins

let lives = 3; // Initial number of lives
let score = 0; // We'll add scoring later if needed
let frogX = gameWidth / 2 - frogSize / 2;
let frogY = gameHeight - frogSize;
let previousFrogY = frogY;
let lanes = [];
let cars = [];
let logs = [];
let onLog = false; // Track if the frog is on a log
let logOffsetX = 0; // Offset of the frog relative to the log's center
let currentLogSpeed = 0; // Speed of the log the frog is currently on

// Function to snap the position to the nearest grid
function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

// Frog movement
document.addEventListener('keydown', (e) => {
    let newFrogX = frogX;
    let newFrogY = frogY;

    if (e.key === 'w' && frogY > 0) {
        newFrogY -= laneHeight;
    } else if (e.key === 's' && frogY < gameHeight - frogSize) {
        newFrogY += laneHeight;
    } else if (e.key === 'a' && frogX > 0) {
        newFrogX -= laneHeight;
    } else if (e.key === 'd' && frogX < gameWidth - frogSize) {
        newFrogX += laneHeight;
    }

    // Snap frog position to the nearest lane grid
    frogX = snapToGrid(newFrogX, laneHeight);
    frogY = snapToGrid(newFrogY, laneHeight);

    updateFrogPosition();

    // Award points for crossing a lane
    if (frogY < previousFrogY) { // Moving upwards
        const currentLane = lanes.find(lane => lane.yPosition === frogY);
        if (currentLane && (currentLane.type === 'road' || currentLane.type === 'river')) {
            score += 10; // Award 10 points for crossing a road or river
            updateScore(); // Update the score display
        }
    }

    previousFrogY = frogY; // Update the previous position

    // Check for win condition
    if (frogY === winY) {
        score += 100; // Award 100 points for reaching the finish line
        updateScore();
        setTimeout(() => {
            showMessage("Congratulations! You reached the end!", true);
            resetFrog(); // Reset the game after winning
        }, 100);
    }
});

function updateFrogPosition() {
    frog.style.left = `${frogX}px`;
    frog.style.top = `${frogY}px`;
}

// Update the score display function
function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

// Create lanes
function createLane(type, yPosition, speed) {
    let lane = document.createElement('div');
    lane.className = `lane ${type}`;
    lane.style.top = `${yPosition}px`;
    gameBoard.appendChild(lane);
    lanes.push({ type, yPosition, speed });
    return lane;
}

// Create cars and logs
function createObject(type, lane, speed) {
    let obj = document.createElement('div');
    obj.className = type;
    obj.style.left = `${Math.floor(Math.random() * (gameWidth / objectWidth)) * objectWidth}px`; // Align with grid
    obj.style.top = `${lane.yPosition}px`;
    gameBoard.appendChild(obj);

    if (type === 'car') {
        cars.push({ element: obj, speed });
    } else if (type === 'log') {
        logs.push({ element: obj, speed });
    }
}

// Move cars and logs
function moveObjects(objects, widthLimit) {
    objects.forEach((obj) => {
        let objLeft = parseFloat(obj.element.style.left);
        objLeft += obj.speed;
        obj.element.style.left = `${(objLeft + widthLimit) % widthLimit}px`; // Wrap around the screen
    });
}

function createEffect(type, x, y) {
    let effect = document.createElement('div');
    effect.className = type;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    gameBoard.appendChild(effect);

    // Remove effect after animation completes
    effect.addEventListener('animationend', () => {
        effect.remove();
    });
}

// Function to show the message overlay
function showMessage(message, gameOver) {
    const overlay = document.getElementById('message-overlay');
    const messageText = document.getElementById('message-text');
    const restartButton = document.getElementById('restart-button');

    messageText.textContent = message; // Set the message text
    overlay.classList.remove('hidden'); // Make sure overlay is visible
    overlay.style.display = 'flex'; // Ensure overlay is displayed as flex

    // Show restart button only if it's a game over
    restartButton.style.display = gameOver ? 'inline-block' : 'none';

    // Restart game when the restart button is clicked
    restartButton.onclick = () => {
        overlay.classList.add('hidden'); // Hide overlay when restart button is clicked
        overlay.style.display = 'none'; // Ensure overlay is hidden
    };
}

// Check collision
function checkCollision() {
    onLog = false;
    currentLogSpeed = 0;

    // Check for car collisions
    cars.forEach(car => {
        const carLeft = parseFloat(car.element.style.left);
        const carTop = parseFloat(car.element.style.top);
        if (frogX < carLeft + objectWidth &&
            frogX + frogSize > carLeft &&
            frogY < carTop + objectHeight &&
            frogY + frogSize > carTop) {
            lives--; // Lose a life
            updateLives(); // Update the UI
            if (lives === 0) {
                setTimeout(() => {
                    alert("Game Over! You ran out of lives.");
                    resetGame(); // Call the reset game function
                }, 100);
            } else {
                showMessage("You got hit by a car!", true);
                createEffect('blood-effect', frogX, frogY); // Create blood effect
                resetFrog(); // Reset the frog position
            }
            return;
        }
    });

    // Check if frog is on a log
    logs.forEach(log => {
        const logLeft = parseFloat(log.element.style.left);
        const logTop = parseFloat(log.element.style.top);
        if (frogX < logLeft + objectWidth &&
            frogX + frogSize > logLeft &&
            frogY < logTop + objectHeight &&
            frogY + frogSize > logTop) {
            onLog = true;
            currentLogSpeed = log.speed;
            logOffsetX = (frogX + frogSize / 2) - (logLeft + objectWidth / 2); // Center frog on the log
        }
    });

    // Check if frog is on a river lane without being on a log
    const currentLane = lanes.find(lane => lane.yPosition === frogY);
    if (currentLane && currentLane.type === 'river' && !onLog) {
        lives--; // Lose a life
        updateLives(); // Update the UI
        if (lives === 0) {
            setTimeout(() => {
                alert("Game Over! You ran out of lives.");
                resetGame(); // Call the reset game function
            }, 100);
        } else {
            showMessage("You fell into the water!", true);
            createEffect('sploosh-effect', frogX, frogY); // Create sploosh effect
            resetFrog(); // Reset the frog position
        }
    }
}

// Reset frog position
function resetFrog() {
    frogX = snapToGrid(gameWidth / 2 - frogSize / 2, laneHeight);
    frogY = snapToGrid(gameHeight - frogSize, laneHeight);
    onLog = false;
    currentLogSpeed = 0;
    logOffsetX = 0; // Reset log offset
    updateFrogPosition();
}

function updateLives() {
    document.getElementById('lives').innerText = `Lives: ${lives}`;
}

// Game loop
function gameLoop() {
    moveObjects(cars, gameWidth);
    moveObjects(logs, gameWidth);

    if (onLog) {
        frogX += currentLogSpeed; // Move the frog along with the log
        frogX = snapToGrid(frogX, laneHeight); // Snap to grid after moving
        frogX = Math.max(0, Math.min(gameWidth - frogSize, frogX)); // Ensure frog stays within bounds
        updateFrogPosition(); // Update the frog's position to reflect log movement

        // Recalculate frog position to stay centered on the log
        frogX = Math.max(0, Math.min(gameWidth - frogSize, frogX - logOffsetX));
    }

    checkCollision();
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    lives = 3; // Reset lives back to 3
    score = 0; // Reset score back to 0
    updateLives(); // Update the lives display
    updateScore(); // Update the score display
    resetFrog(); // Reset frog's position
}

// Setup game
function setupGame() {
    updateLives(); // Initialize the life counter display
    updateScore(); // Initialize the score display

    // Roads, Grass, and Rivers (Y positions start from top to bottom)
    createLane('road', 60, 2);
    createLane('road', 120, 3);
    createLane('grass', 180, 0);
    createLane('river', 240, 1);
    createLane('river', 300, 2);
    createLane('grass', 360, 0);
    createLane('road', 420, 3);
    createLane('road', 480, 2);
    createLane('grass', 540, 0);
    createLane('river', 600, 1);
    createLane('river', 660, 2);
    createLane('grass', 720, 0);

    // Cars and Logs for each road and river
    createObject('car', lanes[0], 2);
    createObject('car', lanes[1], 3);
    createObject('car', lanes[6], 3);
    createObject('car', lanes[7], 2);

    createObject('log', lanes[3], 1);
    createObject('log', lanes[4], 2);
    createObject('log', lanes[9], 1);
    createObject('log', lanes[10], 2);

    // Start game loop
    gameLoop();
}

// Start the game
setupGame();
