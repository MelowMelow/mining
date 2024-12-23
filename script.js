let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  iron: { count: 0, rarity: "common" },
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("mine-button").addEventListener("click", startMining);
    document.getElementById("inventory-button").addEventListener("click", toggleInventory);
    document.getElementById("close-inventory").addEventListener("click", toggleInventory);
    document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);
    
    // Load existing resources if user is authenticated
    loadExistingResources();
});

async function loadExistingResources() {
    const data = await response.json();
            if (data.success && data.telegram_id) {
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                if (data.user?.resources?.[0]) {
                    resources.gold.count = Number(data.user.resources[0].gold) || 0;
                    resources.silver.count = Number(data.user.resources[0].silver) || 0;
                    resources.iron.count = Number(data.user.resources[0].iron) || 0;
                    updateStats();
                    updateInventory();
                }
            }
    updateEnergy();
}

// ... rest of the code remains unchanged ...

async function startMining() {
    console.log("Mining button clicked!");
    
    // Check for existing authentication
    const telegramId = localStorage.getItem("telegramId");
    
    // If not authenticated, try to authenticate
    if (!telegramId) {
        // Check if Telegram WebApp is available
        if (window.Telegram?.WebApp) {
            const tgWebApp = window.Telegram.WebApp;
            const initData = tgWebApp.initData;

            try {
                const response = await fetch('/api/authenticate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ initData })
                });

                const data = await response.json();
                if (data.success && data.telegram_id) {
                    localStorage.setItem('telegramId', data.telegram_id.toString());
                    localStorage.setItem('userData', JSON.stringify(data.user[0]));
                    console.log('Authentication successful');
                } else {
                    console.error('Authentication failed:', data.error);
                    return;
                }
            } catch (error) {
                console.error('Authentication error:', error);
                return;
            }
        } else {
            console.error('Telegram WebApp not available');
            return;
        }
    }

    if (isMining || energy < 30) {
        console.log("Not enough energy to mine.");
        return;
    }

    isMining = true;
    energy -= 30;
    updateEnergy();

    const miningTimer = document.getElementById("mining-timer");
    const timerCountdown = document.getElementById("timer-countdown");
    if (!miningTimer || !timerCountdown) {
        console.error("Required UI elements not found");
        return;
    }
    
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

function finishMining() {
    const popup = document.getElementById("popup-resource");
    if (!popup) {
        console.error("Popup element not found");
        return;
    }

    const resourceType = generateResource();

    if (!resources[resourceType]) {
        console.error("Invalid resource type:", resourceType);
        return;
    }

    resources[resourceType].count++;

    updateStats();
    updateInventory();

    popup.innerText = `+1 ${resourceType.toUpperCase()}`;
    popup.className = `active ${resources[resourceType].rarity}`;
    setTimeout(() => (popup.className = ""), 1000);

    updateResourcesOnServer(resourceType);
}

async function updateResourcesOnServer(resourceType) {
    console.log('Starting updateResourcesOnServer with resourceType:', resourceType);
    const telegramId = localStorage.getItem("telegramId");
    console.log('Retrieved telegramId from localStorage:', telegramId);

    if (!telegramId) {
        console.error("Authentication failed: telegramId not found");
        alert("Authentication failed. Please log in first.");
        return;
    }

    if (!resourceType || !["gold", "silver", "iron"].includes(resourceType)) {
        console.error("Invalid resource type:", resourceType);
        return;
    }

    const requestBody = {
        telegramId: telegramId,
        resourceType: resourceType,
        amount: 1
    };
    console.log('Preparing to send request with body:', requestBody);

    try {
        // First, log the full URL we're trying to reach
        const baseUrl = window.location.origin; // Gets the base URL of your application
        const fullUrl = `${baseUrl}/api/updateresources`;
        console.log('Attempting to send request to:', fullUrl);

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        console.log('Received response with status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response body:', errorText);
            throw new Error(`Request failed with status: ${response.status}. Body: ${errorText}`);
        }

        const data = await response.json();
        console.log('Successfully parsed response data:', data);

        if (data.success) {
            console.log(`Resource ${resourceType} updated successfully:`, data);
            // Update local state
            resources[resourceType].count++;
            updateStats();
            updateInventory();
        } else {
            console.error(`Error updating resource:`, data.error);
            throw new Error(data.error || 'Unknown error occurred');
        }

    } catch (error) {
        console.error('Detailed error in updateResourcesOnServer:', {
            message: error.message,
            stack: error.stack,
            type: error.name
        });
    }
}

function updateStats() {
    for (let resource in resources) {
        const element = document.getElementById(`${resource}-count`);
        if (element) {
            element.innerText = resources[resource].count;
        }
    }
}

function updateEnergy() {
    const energyBar = document.getElementById("energy-fill");
    const energyCount = document.getElementById("energy-count");
    if (energyBar && energyCount) {
        energyBar.style.width = `${(energy / 1000) * 100}%`;
        energyCount.innerText = energy;
    }
}

function updateInventory() {
    const inventoryList = document.getElementById("inventory-list");
    if (!inventoryList) {
        console.error("Inventory list element not found");
        return;
    }

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
    return "iron";
}

function toggleInventory() {
    const inventoryFrame = document.getElementById("inventory-frame");
    if (inventoryFrame) {
        inventoryFrame.classList.toggle("hidden");
    }
}

function toggleLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    const elements = document.querySelectorAll("#stats, #energy-bar, #inventory-button");
	alert("Soon");
    
    if (leaderboard) {
        leaderboard.classList.toggle("hidden");
        elements.forEach(el => el.classList.toggle("hidden"));
    }
}