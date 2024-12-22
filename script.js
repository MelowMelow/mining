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

function finishMining() {
  console.log("finishMining called");
  const popup = document.getElementById("popup-resource");
  const resourceType = generateResource();
  resources[resourceType].count++;
  updateStats();
  updateInventory();

  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;

  setTimeout(() => (popup.className = ""), 1000);
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

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Extract user data from the request body
  const user = req.body;

  if (!user || !user.id || !user.username) {
    return res.status(400).json({ error: 'Missing user information' });
  }

  // Try to register the user in the database
  const { data, error } = await supabase.from('users').upsert([
    {
      telegram_id: user.id,
      username: user.username,
      first_name: user.first_name || null,
      last_name: user.last_name || null,
    },
  ], { onConflict: ['telegram_id'] });

  if (error) {
    return res.status(500).json({ error: 'Error registering user: ' + error.message });
  }

  // Respond with success
  return res.status(200).json({ success: true, user: data });
}

