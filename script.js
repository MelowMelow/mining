let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  copper: { count: 0, rarity: "common" },
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("mine-button").addEventListener("click", startMining);
    document.getElementById("inventory-button").addEventListener("click", toggleInventory);
    document.getElementById("close-inventory").addEventListener("click", toggleInventory);
    document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);
    
    // Try to initialize user data
    initializeUserData();
});

// Initialize user data from localStorage or server
async function initializeUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsedData = JSON.parse(userData);
            // Update resources with saved data if available
            if (parsedData.resources) {
                resources = parsedData.resources;
                updateStats();
                updateInventory();
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

// Start mining process
async function startMining() {
    console.log("Mining button clicked!");
    
    // Authenticate if needed
    if (!await ensureAuthenticated()) {
        console.log("Authentication failed");
        return;
    }

    // Check energy
    if (isMining || energy < 30) {
        alert("Not enough energy to mine.");
        return;
    }

    // Start mining process
    isMining = true;
    energy -= 30;
    updateEnergy();

    // Show mining timer
    const miningTimer = document.getElementById("mining-timer");
    const timerCountdown = document.getElementById("timer-countdown");
    miningTimer.classList.remove("hidden");

    let secondsLeft = 10;
    timerCountdown.innerText = secondsLeft;

    const interval = setInterval(() => {
        secondsLeft--;
        timerCountdown.innerText = secondsLeft;

        if (secondsLeft <= 0) {
            clearInterval(interval);
            miningTimer.classList.add("hidden");
            isMining = false;
            finishMining();
        }
    }, 1000);
}

// Ensure user is authenticated
async function ensureAuthenticated() {
    const telegramId = localStorage.getItem("telegramId");
    
    if (!telegramId && window.Telegram?.WebApp) {
        try {
            const tgWebApp = window.Telegram.WebApp;
            const initData = tgWebApp.initData;

            const response = await fetch('/api/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });

            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.telegram_id) {
                localStorage.setItem('telegramId', data.telegram_id.toString());
                localStorage.setItem('userData', JSON.stringify(data.user[0]));
                console.log('Authentication successful');
                return true;
            } else {
                throw new Error(data.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('Failed to authenticate. Please try again.');
            return false;
        }
    }
    return !!telegramId;
}

// Finish mining and update resources
async function finishMining() {
    const popup = document.getElementById("popup-resource");
    const resourceType = generateResource();

    try {
        // Try to update server first
        const updateSuccess = await updateResourcesOnServer(resourceType);
        
        if (updateSuccess) {
            // Only update local state if server update succeeded
            resources[resourceType].count++;
            updateStats();
            updateInventory();

            // Show success popup
            popup.innerText = `+1 ${resourceType.toUpperCase()}`;
            popup.className = `active ${resources[resourceType].rarity}`;
        } else {
            // Show error popup
            popup.innerText = 'Mining Failed';
            popup.className = 'active error';
        }
    } catch (error) {
        console.error('Mining process failed:', error);
        popup.innerText = 'Error';
        popup.className = 'active error';
    } finally {
        setTimeout(() => (popup.className = ""), 1000);
    }
}

// Update resources on server
async function updateResourcesOnServer(resourceType) {
    const telegramId = localStorage.getItem("telegramId");

    if (!telegramId) {
        console.error("Authentication failed: telegramId not found");
        alert("Authentication required");
        return false;
    }

    try {
        const response = await fetch('https://mining-pink.vercel.app/api/updateresources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId,
                resourceType,
                amount: 1,
            }),
        });

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Received non-JSON response:', text);
            return false;
        }

        const data = await response.json();
        if (data.success) {
            console.log(`Resource ${resourceType} updated successfully:`, data);
            return true;
        } else {
            console.error('Server returned error:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Network or server error:', error);
        return false;
    }
}

// Helper functions remain the same
function updateStats() {
    for (let resource in resources) {
        document.getElementById(`${resource}-count`).innerText = 
            `${resource.charAt(0).toUpperCase() + resource.slice(1)}: ${resources[resource].count}`;
    }
}

function updateEnergy() {
    const energyBar = document.getElementById("energy-fill");
    energyBar.style.width = `${(energy / 1000) * 100}%`;
    document.getElementById("energy-count").innerText = energy;
}

function updateInventory() {
    const inventoryList = document.getElementById("inventory-list");
    inventoryList.innerHTML = "";

    for (let resource in resources) {
        const item = resources[resource];
        if (item.count > 0) {
            const listItem = document.createElement("li");
            listItem.className = `slot ${item.rarity}`;
            listItem.innerHTML = `<img src="${resource}.png" alt="${resource}">${item.count}`;
            inventoryList.appendChild(listItem);
        }
    }
}

function generateResource() {
    const random = Math.random() * 100;
    if (random < 5) return "gold";
    if (random < 35) return "silver";
    return "copper";
}

function toggleInventory() {
    document.getElementById("inventory-frame").classList.toggle("hidden");
}

function toggleLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.classList.toggle("hidden");
    document.querySelectorAll("#stats, #energy-bar, #inventory-button")
        .forEach(el => el.classList.toggle("hidden"));
}