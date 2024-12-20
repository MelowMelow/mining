// Initialize variables
let energy = 1000;
let isMining = false;
let userId = localStorage.getItem('userId'); // Try to get userId from localStorage on load
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  copper: { count: 0, rarity: "common" },
};

// Add event listeners
document.getElementById("mine-button").addEventListener("click", startMining);
document.getElementById("inventory-button").addEventListener("click", toggleInventory);
document.getElementById("close-inventory").addEventListener("click", toggleInventory);
document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);

// Authentication function
async function authenticateUser(initData) {
    try {
        const response = await fetch('/api/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData }),
        });

        const data = await response.json();
        if (data.success) {
            userId = data.telegram_id; // Set the global userId variable
            localStorage.setItem('userId', data.telegram_id); // Store in localStorage
            console.log(`User authenticated and ID stored: ${data.telegram_id}`);
            return true;
        } else {
            console.error('Authentication failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        return false;
    }
}

// Start mining process
function startMining() {
    // Check if user is authenticated
    if (!userId) {
        console.error("User not authenticated");
		alert.('User Could not Found in DB');
        return;
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

// Finish mining process
function finishMining() {
    const popup = document.getElementById("popup-resource");
    const resourceType = generateResource();

    if (!['gold', 'silver', 'copper'].includes(resourceType)) {
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

// Update resources on server
async function updateResourcesOnServer(resourceType) {
    if (!userId) {
        console.error('No user ID found. Cannot update resources.');
		alert.('no user id found to update DB');
        return;
    }

    try {
        console.log('Updating resources for user:', userId);
        const response = await fetch('/api/updateResources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                resourceType: resourceType,
            }),
        });

        const data = await response.json();
        if (data.success) {
            console.log(`Resource ${resourceType} updated successfully`);
        } else {
            console.error('Error updating resource:', data.error);
        }
    } catch (error) {
        console.error('Error during resource update:', error);
    }
}

// Update stats display
function updateStats() {
    for (let resource in resources) {
        document.getElementById(`${resource}-count`).innerText = resources[resource].count;
    }
}

// Update energy display
function updateEnergy() {
    const energyBar = document.getElementById("energy-fill");
    energyBar.style.width = `${(energy / 1000) * 100}%`;
    document.getElementById("energy-count").innerText = energy;
}

// Update inventory display
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

// Generate random resource
function generateResource() {
    const random = Math.random() * 100;
    if (random < 5) return "gold";
    if (random < 35) return "silver";
    return "copper";
}

// Toggle inventory visibility
function toggleInventory() {
    document.getElementById("inventory-frame").classList.toggle("hidden");
}

// Toggle leaderboard visibility
function toggleLeaderboard() {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.classList.toggle("hidden");
    document.querySelectorAll("#stats, #energy-bar, #inventory-button").forEach(el => el.classList.toggle("hidden"));
}