

let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  iron: { count: 0, rarity: "common" },
};

let playerStats = {
  exp: 0,
  level: 0,
  expToNextLevel: 200
};


// Set initial state





document.addEventListener("DOMContentLoaded", () => {
  // Show the preloader until the page is fully loaded
    const preloader = document.getElementById('preloader');
    const progressBar = document.querySelector('.loading-bar .progress');

    let progress = 0; // Initialize progress

    // Simulate progress updates
    const interval = setInterval(() => {
        progress += 10; // Increment progress
        progressBar.style.width = `${progress}%`;

        // Stop animation when progress is complete
        if (progress >= 100) {
            clearInterval(interval);
            // Hide preloader after completing animation
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    }, 300); // Update every 300ms
  document.getElementById("mine-button").addEventListener("click", startMining);
  document.getElementById("inventory-button").addEventListener("click", toggleInventory);
  document.getElementById("close-inventory").addEventListener("click", toggleInventory);
  document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);
  
  
  
  // Authenticate and load resources immediately when the page loads
  authenticateAndLoadResources();
});



async function authenticateAndLoadResources() {
  if (window.Telegram?.WebApp) {
    const tgWebApp = window.Telegram.WebApp;
    const initData = tgWebApp.initData;

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });

      const data = await response.json(); // Add this line to parse the JSON response
      
      if (data.success && data.telegram_id) {
        localStorage.setItem("telegramId", data.telegram_id.toString());
        localStorage.setItem("userData", JSON.stringify(data.user));
        console.log("Authentication successful", data);

        // Update resources from the authentication response
        if (data.resources) { // Remove length check since it's not an array
          const userResources = data.resources; // Remove [0] since it's already an object
          
          // Update resource counts
          resources.gold.count = Number(userResources.gold) || 0;
          resources.silver.count = Number(userResources.silver) || 0;
          resources.iron.count = Number(userResources.iron) || 0;
          
          // Update player stats
          playerStats.exp = Number(userResources.exp) || 0;
          playerStats.level = Number(userResources.level) || 0;
          playerStats.expToNextLevel = 200 * Math.pow(2, playerStats.level);
          
          // Update UI elements
          const goldCount = document.getElementById('gold-count');
          const silverCount = document.getElementById('silver-count');
          const ironCount = document.getElementById('iron-count');
          
          if (goldCount) goldCount.textContent = resources.gold.count;
          if (silverCount) silverCount.textContent = resources.silver.count;
          if (ironCount) ironCount.textContent = resources.iron.count;
          
          // Update level UI and inventory
          updateLevelUI();
          updateInventory();
        }
      } else {
        console.error("Authentication failed:", data.error);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  }
}

async function startMining() {
  console.log("Mining button clicked!");

  const telegramId = localStorage.getItem("telegramId");
  if (!telegramId) {
    console.error("Not authenticated");
	alert('Please Log in via Telegram App');
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

  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;
  setTimeout(() => (popup.className = ""), 1000);

  updateResourcesOnServer(resourceType);
}

async function updateResourcesOnServer(resourceType) {
  const telegramId = localStorage.getItem("telegramId");

  if (!telegramId) {
    console.error("Authentication failed: telegramId not found");
    return;
  }

  const requestBody = {
    telegramId: telegramId,
    resourceType: resourceType,
    amount: 1,
  };

  try {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/updateresources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      resources[resourceType].count++;
      // Update the specific resource count in UI
      const countElement = document.getElementById(`${resourceType}-count`);
      if (countElement) {
        countElement.textContent = resources[resourceType].count;
      }
      updateInventory();
      if (data.stats) {
        const oldLevel = playerStats.level;
        playerStats.exp = data.stats.exp;
        playerStats.level = data.stats.level;
        playerStats.expToNextLevel = data.stats.expToNextLevel;
        updateLevelUI();
        
        // Show level up notification if leveled up
        if (data.levelUp) {
          showLevelUpNotification();
        }
      }	  
    } else {
      throw new Error(data.error || "Unknown error occurred");
    }
  } catch (error) {
    console.error("Error updating resources:", error);
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
      
      // Create resource info div (left side)
      const resourceInfo = document.createElement("div");
      resourceInfo.className = "resource-info";
      resourceInfo.innerHTML = `<img src="${resource}.png" alt="${resource}">${item.count}`;
      
      // Create trade button
      const tradeButton = document.createElement("button");
      tradeButton.className = "trade-button";
      tradeButton.textContent = "Trade";
      tradeButton.onclick = () => {
        alert("Trading system coming soon!");
      };
      
      // Add both elements to list item
      listItem.appendChild(resourceInfo);
      listItem.appendChild(tradeButton);
      
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
    elements.forEach((el) => el.classList.toggle("hidden"));
  }
}

function updateLevelUI() {
  const levelText = document.getElementById('level-text');
  const levelBarFill = document.getElementById('level-bar-fill');
  
  if (levelText && levelBarFill) {
    levelText.textContent = `Level ${playerStats.level} (${playerStats.exp}/${playerStats.expToNextLevel} XP)`;
    const progress = (playerStats.exp / playerStats.expToNextLevel) * 100;
    levelBarFill.style.width = `${progress}%`;
  }
}

function showLevelUpNotification() {
  const popup = document.createElement('div');
  popup.className = 'level-up-popup';
  popup.textContent = `Level Up! You are now level ${playerStats.level}`;
  document.body.appendChild(popup);
  
  setTimeout(() => {
    popup.remove();
  }, 3000);
}