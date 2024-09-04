// Variables
const gameBoard = document.getElementById('game-board');
const frog = document.getElementById('frog');
const gameWidth = 400;
const gameHeight = 500;
const laneHeight = 60;
const frogSize = 40;
const objectWidth = 80; // Width of cars and logs
const objectHeight = 40; // Height of cars and logs

let frogX = gameWidth / 2 - frogSize / 2;
let frogY = gameHeight - frogSize;
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
});

function updateFrogPosition() {
    frog.style.left = `${frogX}px`;
    frog.style.top = `${frogY}px`;
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
            alert("You got hit by a car! Game Over.");
            resetFrog();
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
        alert("You fell into the water! Game Over.");
        resetFrog();
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

// Setup game
function setupGame() {
    // Roads and Rivers (Y positions start from top to bottom)
    createLane('road', 60, 2);
    createLane('road', 120, 3);
    createLane('river', 180, 1);
    createLane('river', 240, 2);

    // Cars
    createObject('car', lanes[0], 2);
    createObject('car', lanes[1], 3);

    // Logs
    createObject('log', lanes[2], 1);
    createObject('log', lanes[3], 2);

    // Start game loop
    gameLoop();
}

// Start the game
setupGame();
