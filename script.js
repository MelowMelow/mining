
async function registerUser(telegram_id, username, first_name, last_name) {
    const response = await fetch("https://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_id, username, first_name, last_name }),
    });

    const result = await response.json();
    if (result.success) {
        console.log("User registered successfully!", result.data);
        // Optionally, save user data in a variable or local storage
        // Proceed to get user resources
        fetchUserResources(result.data[0].id);  // Use the returned user ID
    } else {
        console.error("Error registering user:", result.error);
    }
}
async function fetchUserResources(userId) {
    const response = await fetch(`https://localhost:3000/api/resources/${userId}`);
    const resources = await response.json();
    console.log("User resources:", resources);

    // Update your frontend with user resources (e.g., gold, silver)
    updateStats(resources);
}

function updateStats(resources) {
    // Assume you have HTML elements to show resources:
    document.getElementById("gold-count").innerText = resources[0].gold;
    document.getElementById("silver-count").innerText = resources[0].silver;
    document.getElementById("copper-count").innerText = resources[0].copper;
    document.getElementById("energy-count").innerText = resources[0].energy;
}

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
  if (isMining || energy < 30) return;

  isMining = true;
  energy -= 30;
  updateEnergy();

  const miningTimer = document.getElementById("mining-timer");
  const timerCountdown = document.getElementById("timer-countdown");

  miningTimer.classList.remove("hidden");
  let secondsLeft = 10;
  timerCountdown.innerText = secondsLeft;

  const interval = setInterval(() => {
    secondsLeft -= 1;
    timerCountdown.innerText = secondsLeft;

    if (secondsLeft <= 0) {
      clearInterval(interval);
      miningTimer.classList.add("hidden");
      isMining = false;
      finishMining();
    }
  }, 1000);
}

async function finishMining(userId) {
    const resourceType = generateResource(); // Assuming this is your random generator for resource
    const amount = 1; // Assuming each mining event collects 1 resource

    // Send the mined resource data to the backend to update
    const response = await fetch("https://localhost:3000/api/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, resource_type: resourceType, amount }),
    });

    const result = await response.json();
    if (result.success) {
        console.log(`${resourceType} successfully updated!`);
        // After mining, update resources on the frontend
        fetchUserResources(userId);  // Fetch the updated resources
    } else {
        console.error("Error updating resources:", result.error);
    }
}

function generateResource() {
    const random = Math.random() * 100;
    if (random < 5) return "gold";
    if (random < 35) return "silver";
    return "copper";
}


function updateStats() {
  for (let resource in resources) {
    document.getElementById(`${resource}-count`).innerText = resources[resource].count;
  }
}

function updateEnergy() {
  const energyCount = document.getElementById("energy-count");
  const energyBar = document.getElementById("energy-fill");
  energyCount.innerText = energy;

  const percent = (energy / 1000) * 100;
  energyBar.style.width = `${percent}%`;
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
  if (random < 5) return "gold"; // Rare
  if (random < 35) return "silver"; // Uncommon
  return "copper"; // Common
}

function toggleInventory() {
  const inventoryFrame = document.getElementById("inventory-frame");
  inventoryFrame.classList.toggle("hidden");
}

function toggleLeaderboard() {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.classList.toggle("hidden");

  const uiElements = ["stats", "energy-bar", "inventory-button"];
  uiElements.forEach((id) => document.getElementById(id).classList.toggle("hidden"));
}
