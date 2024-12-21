let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  copper: { count: 0, rarity: "common" },
};

let userId; // To store the authenticated user ID

document.getElementById("mine-button").addEventListener("click", startMining);
document.getElementById("inventory-button").addEventListener("click", toggleInventory);
document.getElementById("close-inventory").addEventListener("click", toggleInventory);
document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);




// Start mining process when the user clicks the mine button
function startMining() {
  
     
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
// Check and ensure telegramId is available
async function authenticateUser() {
    const telegramInitData = new URLSearchParams(window.location.search).get("initData");

    if (!telegramInitData) {
        alert("Authentication required. Please open this app via Telegram.");
        window.location.href = `https://t.me/${process.env.TELEGRAM_BOT_NAME}`;
        return null;
    }

    try {
        const response = await fetch("/api/authenticate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: telegramInitData }), // Send initData
        });

        const result = await response.json();

        if (result.success && result.telegram_id) {
            // Store telegram_id in localStorage
            localStorage.setItem("userId", result.telegram_id);
            console.log("Telegram ID saved to localStorage:", result.telegram_id);
            return result.telegram_id;
        } else {
            throw new Error(result.error || "Authentication failed.");
        }
    } catch (error) {
        console.error("Authentication error:", error.message);
        alert("Unable to authenticate. Please try again.");
        return null;
    }
}


// Adjust mining logic to fetch `telegramId` when necessary
async function updateResourcesOnServer(resourceType) {
    const telegramId = await authenticateUser();

    if (!telegramId) return; // Terminate if authentication fails

    try {
        const response = await fetch('/api/updateresources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                telegramId, // Use the token reliably stored after authentication
                resourceType,
                amount: 1,
            }),
        });

        const data = await response.json();
        if (data.success) {
            console.log(`Resource ${resourceType} updated successfully.`);
        } else {
            console.error(`Error updating resource: ${data.error}`);
        }
    } catch (error) {
        console.error('Network or server error while updating resource:', error);
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