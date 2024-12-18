import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient("your-supabase-url", "your-supabase-key");

let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  copper: { count: 0, rarity: "common" },
};

// Example: Replace with your actual method to retrieve user ID
function getUserId() {
  return 1; // Placeholder user ID
}

// Function to update user stats in the database
async function updateUserStatsInDB(userId, resourceType, increment) {
  try {
    // Fetch the current stats for the user
    const { data: currentStats, error: fetchError } = await supabase
      .from("resources")
      .select(resourceType)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error(`Error fetching ${resourceType} stats:`, fetchError);
      return;
    }

    // Calculate new count
    const currentCount = currentStats?.[resourceType] || 0;
    const newCount = currentCount + increment;

    // Update the database with the new count
    const { error: updateError } = await supabase
      .from("resources")
      .update({ [resourceType]: newCount })
      .eq("user_id", userId);

    if (updateError) {
      console.error(`Error updating ${resourceType}:`, updateError);
    } else {
      console.log(`${resourceType} successfully updated to ${newCount}`);
    }
  } catch (error) {
    console.error("Error during resource update:", error);
  }
}

// DOM Event Listeners
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
  const resourceType = generateResource();

  // Increment resource count locally
  resources[resourceType].count++;
  updateStats();
  updateInventory();

  // Show the popup notification
  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;
  setTimeout(() => (popup.className = ""), 1000);

  // Update resource stats in the database
  const userId = getUserId(); // Replace with actual method to get user ID
  updateUserStatsInDB(userId, resourceType, 1);
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
