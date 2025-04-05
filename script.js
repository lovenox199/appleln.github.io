document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const mainMenu = document.getElementById('main-menu');
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const timerDisplay = document.getElementById('timer');
    const gameOverMenu = document.getElementById('game-over-menu');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const gameInfoDisplay = document.getElementById('game-info');
    const explanationButton = document.getElementById('explanation-button');
    const explanationOverlay = document.getElementById('explanation-overlay');
    const closeExplanationButton = document.getElementById('close-explanation-button');
    const muteButton = document.getElementById('mute-button');
    const muteButtonIcon = muteButton ? muteButton.querySelector('img') : null;
    const bgmAudio = document.getElementById('bgm-audio');

    // --- Game Constants ---
    const rows = 10;
    const cols = 17;
    const targetSum = 10;
    const GAME_DURATION = 120;

    // --- Game State Variables ---
    let score = 0;
    let isSelecting = false;
    let startCellInfo = null;
    let currentSelection = { cells: [], fruits: [], sum: 0 };
    let cellMap = {};
    let timerInterval = null;
    let timeLeft = GAME_DURATION;
    let isGameOver = false;

    // --- Audio State ---
    let isMuted = false;

    // --- Initialization (Called when Start Button is clicked) ---
    function initGame() { /* ... unchanged ... */
        console.log("Initializing game board...");
        isGameOver = false;
        gameBoard.innerHTML = '';
        cellMap = {};
        score = 0;
        updateScore();
        createGridCells();
        populateAllCells();
        addBoardListeners();
        startTimer();
    }

    // --- Initial Page Load Setup ---
    function setupMainMenu() {
        if (startButton) { startButton.addEventListener('click', startGame); }
         else { console.error("Start button not found!"); }
        if (resetButton) { resetButton.addEventListener('click', showMainMenu); }
         else { console.error("Reset button not found!"); }
         if (restartButton) { restartButton.addEventListener('click', showMainMenu); }
         else { console.error("Restart button not found!"); }
        if (explanationButton) { explanationButton.addEventListener('click', showExplanation); }
         else { console.error("Explanation button not found!"); }
        if (closeExplanationButton) { closeExplanationButton.addEventListener('click', hideExplanation); }
         else { console.error("Close explanation button not found!"); }
        if (muteButton) { muteButton.addEventListener('click', toggleMute); }
         else { console.error("Mute button not found!"); }

        // Set initial visibility: Show menu, reset button, mute button, board, info
        mainMenu.classList.remove('hidden');
        resetButton.classList.remove('hidden');
        muteButton.classList.remove('hidden'); // <<<< Show Mute Button initially
        gameBoard.classList.remove('hidden');
        gameInfoDisplay.classList.remove('hidden');

        // Hide game over screen and explanation
        gameOverMenu.classList.add('hidden');
        explanationOverlay.classList.add('hidden');

        // Ensure audio is stopped and reset initially
        stopMusic();
        // Apply initial mute state visually
        updateMuteButtonIcon();
    }

    // --- Start Game Function ---
    function startGame() {
        console.log("Starting game...");

        // Hide menus
        mainMenu.classList.add('hidden');
        gameOverMenu.classList.add('hidden');
        explanationOverlay.classList.add('hidden');

        // Show game elements (board and info should already be visible)
        gameBoard.classList.remove('hidden');
        gameInfoDisplay.classList.remove('hidden');
        resetButton.classList.remove('hidden');
        muteButton.classList.remove('hidden'); // Ensure visible

        initGame();
        playMusic();
    }

    // --- Function to Show Main Menu (Reset/Restart) ---
    function showMainMenu() {
        console.log("Returning to main menu...");
        isGameOver = true;
        clearTimer();
        removeBoardListeners();
        stopMusic();

        // Show main menu, reset button, mute button
        mainMenu.classList.remove('hidden');
        resetButton.classList.remove('hidden');
        muteButton.classList.remove('hidden'); // <<<< Show Mute Button

        // Hide other elements
        gameOverMenu.classList.add('hidden');
        explanationOverlay.classList.add('hidden');
        // Keep board and info visible behind
        gameBoard.classList.remove('hidden');
        gameInfoDisplay.classList.remove('hidden');


        gameBoard.innerHTML = '';
        cellMap = {};
    }

    // --- Timer Functions ---
    function startTimer() { /* ... unchanged ... */ clearTimer(); timeLeft = GAME_DURATION; updateTimerDisplay(); timerInterval = setInterval(() => { timeLeft--; updateTimerDisplay(); if (timeLeft <= 0) { endGame(); } }, 1000); }
    function updateTimerDisplay() { /* ... unchanged ... */ if (timerDisplay) { timerDisplay.textContent = `Time: ${timeLeft}`; } }
    function clearTimer() { /* ... unchanged ... */ if (timerInterval) { clearInterval(timerInterval); timerInterval = null; } }

    // --- End Game Function ---
    function endGame() {
        console.log("Game Over!");
        isGameOver = true;
        clearTimer();
        removeBoardListeners();
        stopMusic();

        // Hide reset and mute buttons
        resetButton.classList.add('hidden');
        muteButton.classList.add('hidden');

        // Keep board and info visible behind
        gameBoard.classList.remove('hidden');
        gameInfoDisplay.classList.remove('hidden');

        // Show Game Over Menu
        if (finalScoreDisplay) { finalScoreDisplay.textContent = score; }
        gameOverMenu.classList.remove('hidden');
    }

    // --- Explanation Panel Functions ---
    function showExplanation() { /* ... unchanged ... */ if (explanationOverlay) { explanationOverlay.classList.remove('hidden'); } }
    function hideExplanation() { /* ... unchanged ... */ if (explanationOverlay) { explanationOverlay.classList.add('hidden'); } }

    // --- Audio Functions ---
    function playMusic() { /* ... unchanged ... */
        if (bgmAudio) {
            bgmAudio.muted = isMuted;
            const playPromise = bgmAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => { console.log("Music playing..."); }).catch(error => { console.error("Music play failed:", error); });
            }
        } else { console.error("Audio element not found."); }
    }
    function stopMusic() { /* ... unchanged ... */
        if (bgmAudio) { bgmAudio.pause(); bgmAudio.currentTime = 0; console.log("Music stopped and reset."); }
    }
    function toggleMute() { /* ... unchanged ... */
        isMuted = !isMuted; console.log("Mute toggled:", isMuted);
        if (bgmAudio) { bgmAudio.muted = isMuted; }
        updateMuteButtonIcon(); // Call helper function
    }
    // Helper function to update icon based on isMuted state
    function updateMuteButtonIcon() {
         if (muteButtonIcon) {
            const iconName = isMuted ? 'volume-x' : 'volume-2';
            muteButtonIcon.src = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${iconName}.svg`;
            muteButtonIcon.alt = isMuted ? "Unmute" : "Mute";
        }
    }


    // --- Game Logic Functions ---
    // (Functions createGridCells, populateAllCells, createFruitInCell,
    // addBoardListeners, removeBoardListeners, preventDefault, handleMouseDown, handleMouseMove, handleMouseUp,
    // updateSelection, calculateRectangleSelection, getCellElement, getCellInfo,
    // clearSelectionVisuals, resetSelectionState, flashSelectionError,
    // calculateScore, updateScore remain unchanged)
    function createGridCells() { for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { const cell = document.createElement('div'); cell.classList.add('cell'); cell.dataset.row = r; cell.dataset.col = c; gameBoard.appendChild(cell); cellMap[`${r}-${c}`] = cell; } } }
    function populateAllCells() { for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { const cell = getCellElement(r, c); if (cell) { createFruitInCell(cell); } } } }
    function createFruitInCell(cell) { const existingFruit = cell.querySelector('.fruit'); if (existingFruit) existingFruit.remove(); const number = Math.floor(Math.random() * 9) + 1; const fruit = document.createElement('div'); fruit.classList.add('fruit'); fruit.textContent = number; fruit.dataset.value = number; cell.appendChild(fruit); return fruit; }
    function addBoardListeners() { removeBoardListeners(); gameBoard.addEventListener('mousedown', handleMouseDown); window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); gameBoard.addEventListener('dragstart', preventDefault); gameBoard.addEventListener('contextmenu', preventDefault); }
    function removeBoardListeners() { gameBoard.removeEventListener('mousedown', handleMouseDown); window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); gameBoard.removeEventListener('dragstart', preventDefault); gameBoard.removeEventListener('contextmenu', preventDefault); }
    function preventDefault(e) { e.preventDefault(); }
    function handleMouseDown(event) { if (isGameOver || event.button !== 0) return; const targetCell = event.target.closest('.cell'); if (!targetCell || !targetCell.querySelector('.fruit')) return; isSelecting = true; startCellInfo = getCellInfo(targetCell); gameBoard.classList.add('selecting'); updateSelection(targetCell); event.preventDefault(); }
    function handleMouseMove(event) { if (isGameOver || !isSelecting) return; const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY); const targetCell = elementUnderMouse ? elementUnderMouse.closest('.cell') : null; if (targetCell) { updateSelection(targetCell); } event.preventDefault(); }
    function handleMouseUp(event) { if (isGameOver || !isSelecting || event.button !== 0) return; isSelecting = false; gameBoard.classList.remove('selecting'); if (currentSelection.sum === targetSum && currentSelection.fruits.length > 1) { currentSelection.fruits.forEach(fruitInfo => { fruitInfo.element.remove(); }); score += calculateScore(currentSelection.fruits.length); updateScore(); } else { if (currentSelection.fruits.length > 0) { flashSelectionError(); } } clearSelectionVisuals(); resetSelectionState(); event.preventDefault(); }
    function updateSelection(endCellElement) { if (!startCellInfo) return; const endCellInfo = getCellInfo(endCellElement); if (!endCellInfo) return; const lastSelectedCell = currentSelection.cells[currentSelection.cells.length - 1]; if (lastSelectedCell === endCellElement && currentSelection.cells.length > 0) { return; } clearSelectionVisuals(); currentSelection.cells = []; currentSelection.fruits = []; currentSelection.sum = 0; const rectCellsInfo = calculateRectangleSelection(startCellInfo, endCellInfo); let currentSum = 0; rectCellsInfo.forEach(cellInfo => { const cell = cellInfo.element; const fruit = cell.querySelector('.fruit'); if (fruit) { const value = parseInt(fruit.dataset.value); currentSelection.cells.push(cell); currentSelection.fruits.push({ element: fruit, value: value }); currentSum += value; cell.classList.add('selected'); } }); currentSelection.sum = currentSum; }
    function calculateRectangleSelection(start, end) { const selection = []; if (!start || !end) return selection; const minRow = Math.min(start.row, end.row); const maxRow = Math.max(start.row, end.row); const minCol = Math.min(start.col, end.col); const maxCol = Math.max(start.col, end.col); for (let r = minRow; r <= maxRow; r++) { for (let c = minCol; c <= maxCol; c++) { const cell = getCellElement(r, c); if (cell) { selection.push({ row: r, col: c, element: cell }); } } } return selection; }
    function getCellElement(row, col) { return cellMap[`${row}-${col}`]; }
    function getCellInfo(cellElement) { if (!cellElement || !cellElement.dataset || cellElement.dataset.row === undefined || cellElement.dataset.col === undefined) { return null; } return { row: parseInt(cellElement.dataset.row), col: parseInt(cellElement.dataset.col), element: cellElement }; }
    function clearSelectionVisuals() { gameBoard.querySelectorAll('.cell.selected').forEach(cell => { cell.classList.remove('selected'); }); }
    function resetSelectionState() { currentSelection.cells = []; currentSelection.fruits = []; currentSelection.sum = 0; startCellInfo = null; }
    function flashSelectionError() { if (!currentSelection || !currentSelection.cells || currentSelection.cells.length === 0) return; currentSelection.cells.forEach(cell => { if (cell && cell.style) { cell.style.transition = 'background-color 0.1s ease'; cell.style.backgroundColor = '#ffcccc'; setTimeout(() => { if (cell && cell.style) { cell.style.backgroundColor = ''; } }, 200); } }); }
    function calculateScore(numFruits) { return 10 + Math.max(0, numFruits - 2) * 5; }
    function updateScore() { if(scoreDisplay) { scoreDisplay.textContent = `Score: ${score}`; } }


    // --- Initialize Menu on Page Load ---
    setupMainMenu();

});
