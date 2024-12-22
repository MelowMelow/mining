
let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  copper: { count: 0, rarity: "common" },
};





document.getElementById("mine-button").addEventListener("click", startMining);
document.getElementById("inventory-button").addEventListener("click", toggleInventory);
document.getElementById("close-inventory").addEventListener("click", toggleInventory);
document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);




// Start mining process when the user clicks the mine button
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
                if (data.success && data.telegram_id) {  // Make sure telegram_id exists
                    // Properly store both items with key and value
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

    // Continue with mining if energy is sufficient
    if (isMining || energy < 30) {
        console.log("Not enough energy to mine.");
        return;
    }

    isMining = true;
    energy -= 30;
    updateEnergy();

    // Rest of your mining logic...
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


// Finish mining process: add the resource and update UI and backend
function finishMining() {
  const popup = document.getElementById("popup-resource");
  const resourceType = generateResource();

  // Validate resourceType before proceeding
  if (!['gold', 'silver', 'copper'].includes(resourceType)) {
    console.error("Invalid resource type:", resourceType);
    return;
  }

  // Increment resource count
  resources[resourceType].count++;

  // Update stats and inventory (you may want to update UI accordingly)
  updateStats();
  updateInventory();

  // Show mining popup with the updated resource
  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;
  setTimeout(() => (popup.className = ""), 1000);

  // At the end of the mining process, update the resource on the server
  console.log("Calling updateResourcesOnServer with resource:", resourceType);
  updateResourcesOnServer(resourceType);  // THIS is where we call the backend function
}
            



async function updateResourcesOnServer(resourceType) {
    const telegramId = localStorage.getItem("telegramId");

    if (!telegramId) {
        console.error("Authentication failed: telegramId not found");
        alert("Authentication failed. Please log in first.");
        return;
    }

    if (!resourceType || !["gold", "silver", "copper"].includes(resourceType)) {
        console.error("Invalid resource type:", resourceType);
        return;
    }

    try {
        const response = await fetch('/api/updateresources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId,
                resourceType,
                amount: 1,
            }),
        });

        // Check for successful status
        if (!response.ok) {
            // Throw error if status is not okay (any 4xx or 5xx status code)
            throw new Error(`Request failed with status: ${response.status}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();  // Fallback to get raw response text
            throw new Error(`Expected JSON, but got: ${text}`);
        }

        // If it's JSON, parse it
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







// Update the displayed stats for the user
function updateStats() {
  for (let resource in resources) {
    document.getElementById(`${resource}-count`).innerText = `${resource.charAt(0).toUpperCase() + resource.slice(1)}: ${resources[resource].count}`;
  }
}

// Update the energy bar based on remaining energy
function updateEnergy() {
  const energyBar = document.getElementById("energy-fill");
  energyBar.style.width = `${(energy / 1000) * 100}%`;
  document.getElementById("energy-count").innerText = energy;
}

// Update inventory UI with current resources
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

// Generate a random resource type for mining
function generateResource() {
  const random = Math.random() * 100;
  if (random < 5) return "gold";
  if (random < 35) return "silver";
  return "copper";
}

// Toggle visibility of the inventory
function toggleInventory() {
  document.getElementById("inventory-frame").classList.toggle("hidden");
}

// Toggle visibility of the leaderboard
function toggleLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.classList.toggle("hidden");
  document.querySelectorAll("#stats, #energy-bar, #inventory-button").forEach(el => el.classList.toggle("hidden"));
}