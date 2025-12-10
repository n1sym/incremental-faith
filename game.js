// Game State
let gameState = {
    offerings: 0,
    faith: 0,
    worshippers: 0
};

// Game Configuration
const CONFIG = {
    faithPerClick: 1,
    worshippersPerFaith: 0.1, // 10 faith = 1 worshipper
    offeringsPerWorshipper: 0.5, // 1 worshipper = 0.5 offerings per second
    autoSaveInterval: 5000, // 5 seconds
    gameTickInterval: 1000 // 1 second for auto-generation
};

// DOM Elements
const offeringValueEl = document.getElementById('offeringValue');
const faithValueEl = document.getElementById('faithValue');
const worshipperValueEl = document.getElementById('worshipperValue');
const prayButton = document.getElementById('prayButton');

// Initialize game
function init() {
    loadGame();
    updateUI();
    startGameLoop();
    startAutoSave();
    
    // Add click event to pray button
    prayButton.addEventListener('click', pray);
}

// Pray action - increases faith
function pray() {
    gameState.faith += CONFIG.faithPerClick;
    updateUI();
    animateStat('faithStat');
}

// Game loop - handles automatic resource generation
function gameLoop() {
    // Calculate worshippers based on faith
    const targetWorshippers = Math.floor(gameState.faith * CONFIG.worshippersPerFaith);
    
    // Gradually increase worshippers towards target
    if (gameState.worshippers < targetWorshippers) {
        gameState.worshippers = targetWorshippers;
        animateStat('worshipperStat');
    }
    
    // Generate offerings based on worshippers
    if (gameState.worshippers > 0) {
        const offeringsGenerated = gameState.worshippers * CONFIG.offeringsPerWorshipper * (CONFIG.gameTickInterval / 1000);
        gameState.offerings += offeringsGenerated;
        animateStat('offeringStat');
    }
    
    updateUI();
}

// Update UI with current game state
function updateUI() {
    offeringValueEl.textContent = formatNumber(gameState.offerings);
    faithValueEl.textContent = formatNumber(gameState.faith);
    worshipperValueEl.textContent = formatNumber(gameState.worshippers);
}

// Format numbers for display
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    } else {
        return Math.floor(num).toString();
    }
}

// Animate stat update
function animateStat(statId) {
    const statEl = document.getElementById(statId);
    statEl.classList.add('updated');
    setTimeout(() => {
        statEl.classList.remove('updated');
    }, 300);
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
            gameState.offerings = parsedData.offerings || 0;
            gameState.faith = parsedData.faith || 0;
            gameState.worshippers = parsedData.worshippers || 0;
            
            // Calculate offline progress
            if (parsedData.timestamp) {
                const timeDiff = Date.now() - parsedData.timestamp;
                const secondsOffline = timeDiff / 1000;
                
                // Generate offerings for offline time
                const offlineOfferings = gameState.worshippers * CONFIG.offeringsPerWorshipper * secondsOffline;
                if (offlineOfferings > 0) {
                    gameState.offerings += offlineOfferings;
                    console.log(`Offline progress: +${offlineOfferings.toFixed(2)} offerings`);
                }
            }
            
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
