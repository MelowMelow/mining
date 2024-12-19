let energy = 1000;
let isMining = false;
let resources = {
  gold: { count: 0, rarity: "rare" },
  silver: { count: 0, rarity: "uncommon" },
  copper: { count: 0, rarity: "common" },
};

const MINING_COST = 30;
const GOLD_CHANCE = 5;
const SILVER_CHANCE = 35;

document.getElementById("mine-button").addEventListener("click", startMining);
document.getElementById("inventory-button").addEventListener("click", toggleInventory);
document.getElementById("close-inventory").addEventListener("click", toggleInventory);
document.getElementById("leaderboard-button").addEventListener("click", toggleLeaderboard);



async function startMining() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    console.error("User ID not found in localStorage. Cannot mine resources.");
    alert("Login required to mine resources.");
    return;
  }

  if (isMining || energy < MINING_COST) {
    alert("Not enough energy to mine!");
    return;
  }

  isMining = true;
  energy -= MINING_COST;
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

async function finishMining() {
  const popup = document.getElementById("popup-resource");
  const resourceType = generateResource();

  if (!["gold", "silver", "copper"].includes(resourceType)) {
    console.error("Invalid resource type:", resourceType);
    return;
  }

  resources[resourceType].count++;
  updateStats();
  updateInventory();

  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;
  setTimeout(() => (popup.className = ""), 1000);

  try {
    const response = await fetch("/api/updateResources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceType, id: userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      alert("Failed to update resources on server. Try again.");
      console.error("Server error:", error);
      return;
    }

    console.log("Resource updated successfully.");
  } catch (error) {
    console.error("Error updating resource on server:", error);
    alert("Unable to connect to server. Try again.");
  }
}
