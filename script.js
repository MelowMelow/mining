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

function startMining() {
  // If the user is already mining or doesn't have enough energy, don't start mining
  if (isMining || energy < 30) return;

  isMining = true;
  energy -= 30;
  updateEnergy();

  // Set the Telegram ID to localStorage as soon as mining starts
  const telegramId = getTelegramId(); // Assuming getTelegramId fetches from localStorage
  if (!telegramId) {
    console.error("Telegram ID is not available.");
    return;
  }
  localStorage.setItem('telegram_id', telegramId); // Store Telegram ID in localStorage

  // Show the timer and countdown
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

      // After the 10 seconds, finish mining and update resources
      finishMining();
    }
  }, 1000);
}

async function finishMining() {
  // Generate a random resource from the mining process
  const resourceType = generateResource();

  // Update the resource count in the frontend
  resources[resourceType].count++;
  updateStats();
  updateInventory();

  // Show a popup indicating the mined resource
  const popup = document.getElementById("popup-resource");
  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;
  setTimeout(() => {
    popup.className = "";  // Remove the popup class after a brief moment
  }, 1000);

  // Fetch the Telegram ID from localStorage (it was set when mining started)
  const telegramId = localStorage.getItem('telegram_id');
  
  if (!telegramId) {
    console.error("Telegram ID is not available.");
    return;
  }

  // Send the mined resource data and the user's Telegram ID to the backend
  try {
    await sendMiningResult(resourceType, telegramId);
  } catch (error) {
    console.error("Error sending mining results:", error);
  }
}

async function sendMiningResult(resourceType, telegramId) {
  try {
    const response = await fetch('/api/updateResources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramId,  // Send the user's Telegram ID
        resourceType: resourceType,  // Resource being mined (gold, silver, etc.)
        quantity: 1, // Amount of resources mined (adjust as necessary)
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('Resources updated successfully:', result.resources);
    } else {
      console.error('Error updating resources:', result.message);
    }
  } catch (error) {
    console.error('Error sending mining results:', error);
  }
}

function updateStats() {
  for (let resource in resources) {
    document.getElementById(`${resource}-count`).innerText = `${resource.charAt(0).toUpperCase() + resource.slice(1)}: ${resources[resource].count}`;
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
  document.querySelectorAll("#stats, #energy-bar, #inventory-button").forEach(el => el.classList.toggle("hidden"));
}
