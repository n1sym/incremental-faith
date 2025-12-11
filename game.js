// Game State
let gameState = {
    coins: 0,
    faith: 0,
    worshippers: 0,
    faithUpgradeLevel: 0,
    faithPerSecond: 1
};

// Game Configuration
const CONFIG = {
    worshippersPerFaith: 0.1, // 10 faith = 1 worshipper
    coinsPerWorshipper: 0.5, // 1 worshipper = 0.5 coins per second
    autoSaveInterval: 5000, // 5 seconds
    gameTickInterval: 100, // 100ms for smooth updates
    faithUpgradeBaseCost: 10,
    faithUpgradeCostMultiplier: 1.5,
    faithUpgradeIncrement: 0.5
};

// DOM Elements
const coinValueEl = document.getElementById('coinValue');
const coinRateEl = document.getElementById('coinRate');
const faithValueEl = document.getElementById('faithValue');
const faithRateEl = document.getElementById('faithRate');
const worshipperValueEl = document.getElementById('worshipperValue');
const prayButton = document.getElementById('prayButton');
const upgradeCostEl = document.getElementById('upgradeCost');

// Initialize game
function init() {
    loadGame();
    updateUI();
    startGameLoop();
    startAutoSave();
    
    // Add click event to pray button for upgrades
    prayButton.addEventListener('click', upgradeFaith);
}

// Calculate upgrade cost
function getUpgradeCost() {
    return Math.floor(CONFIG.faithUpgradeBaseCost * Math.pow(CONFIG.faithUpgradeCostMultiplier, gameState.faithUpgradeLevel));
}

// Upgrade faith generation
function upgradeFaith() {
    const cost = getUpgradeCost();
    if (gameState.faith >= cost) {
        gameState.faith -= cost;
        gameState.faithUpgradeLevel++;
        gameState.faithPerSecond += CONFIG.faithUpgradeIncrement;
        updateUI();
    }
}

// Pray action - no longer used, but keeping for compatibility
function pray() {
    // Deprecated - faith now auto-generates
}

// Game loop - handles automatic resource generation
function gameLoop() {
    const deltaTime = CONFIG.gameTickInterval / 1000; // Convert to seconds
    
    // Auto-generate faith
    gameState.faith += gameState.faithPerSecond * deltaTime;
    
    // Calculate worshippers based on faith
    const targetWorshippers = Math.floor(gameState.faith * CONFIG.worshippersPerFaith);
    
    // Update worshippers towards target (can increase or decrease)
    gameState.worshippers = targetWorshippers;
    
    // Generate coins based on worshippers
    if (gameState.worshippers > 0) {
        const coinsGenerated = gameState.worshippers * CONFIG.coinsPerWorshipper * deltaTime;
        gameState.coins += coinsGenerated;
    }
    
    updateUI();
}

// Update UI with current game state
function updateUI() {
    // Update coin display
    coinValueEl.textContent = formatNumber(gameState.coins);
    const coinsPerSec = gameState.worshippers * CONFIG.coinsPerWorshipper;
    coinRateEl.textContent = formatNumber(coinsPerSec, 1) + '/sec';
    
    // Update faith display
    faithValueEl.textContent = formatNumber(gameState.faith);
    faithRateEl.textContent = formatNumber(gameState.faithPerSecond, 1) + '/sec';
    
    // Update worshipper display
    worshipperValueEl.textContent = formatNumber(gameState.worshippers);
    
    // Update upgrade button
    const upgradeCost = getUpgradeCost();
    upgradeCostEl.textContent = formatNumber(upgradeCost);
    
    // Disable button if can't afford
    if (gameState.faith >= upgradeCost) {
        prayButton.disabled = false;
    } else {
        prayButton.disabled = true;
    }
}

// Format numbers for display
function formatNumber(num, decimals = 0) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(decimals) + 'K';
    } else {
        return num.toFixed(decimals);
    }
}

// Animate stat update - deprecated, keeping for compatibility
function animateStat(statId) {
    // Animations removed per requirements
}

// Start game loop
function startGameLoop() {
    setInterval(gameLoop, CONFIG.gameTickInterval);
}

// Auto-save functionality
function startAutoSave() {
    setInterval(() => {
        saveGame();
    }, CONFIG.autoSaveInterval);
}

// Save game to localStorage
function saveGame() {
    try {
        const saveData = {
            ...gameState,
            timestamp: Date.now()
        };
        localStorage.setItem('incrementalFaithSave', JSON.stringify(saveData));
        console.log('Game saved:', saveData);
    } catch (error) {
        console.error('Failed to save game:', error);
    }
}

// Load game from localStorage
function loadGame() {
    try {
        const savedData = localStorage.getItem('incrementalFaithSave');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // Restore game state
            gameState.coins = parsedData.coins ?? parsedData.offerings ?? 0; // Support old saves
            gameState.faith = parsedData.faith || 0;
            gameState.worshippers = parsedData.worshippers || 0;
            gameState.faithUpgradeLevel = parsedData.faithUpgradeLevel || 0;
            gameState.faithPerSecond = parsedData.faithPerSecond || 1;
            
            // No offline progress per requirements
            
            console.log('Game loaded:', gameState);
        } else {
            console.log('No save data found, starting new game');
        }
    } catch (error) {
        console.error('Failed to load game:', error);
    }
}

// Window beforeunload - save game when leaving
window.addEventListener('beforeunload', () => {
    saveGame();
});

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
