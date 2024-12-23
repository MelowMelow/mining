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
    
    // Initialize UI
    updateEnergy();
    updateStats();
});

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
    const telegramId = localStorage.getItem("telegramId");

    if (!telegramId) {
        console.error("Authentication failed: telegramId not found");
        alert("Authentication failed. Please log in first.");
        return;
    }

    if (!resourceType || !["gold", "silver", "iron"].includes(resourceType)) {
        console.error("Invalid resource type:", resourceType);
        return;
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

        if (!response.ok) {
            throw new Error(`Request failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log(`Resource ${resourceType} updated successfully.`);
        } else {
            console.error(`Error updating resource: ${data.error}`);
        }

    } catch (error) {
        console.error('Network or server error while updating resource:', error);
        alert("There was an error while updating your resources. Please try again later.");
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
    
    if (leaderboard) {
        leaderboard.classList.toggle("hidden");
        elements.forEach(el => el.classList.toggle("hidden"));
    }
}