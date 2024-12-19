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

async function authenticateUser() {
  try {
    // Make the API request to authenticate the user with the provided Telegram data
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: telegramInitData }),
    });

    const data = await response.json();

    // Check if authentication was successful and handle response accordingly
    if (data.success) {
      // Attempt to get the existing user from the database
      const existingUser = data.user; // Assuming user is already fetched from the API in `data.user`
      
      if (existingUser) {
        userId = existingUser.id; // Store the authenticated user's ID
        console.log("Authenticated user:", userId);
      } else {
        console.log("User does not exist in the database. Registering as new user.");
        // Optionally, add logic for registering the user if they're not in the database.
        // Example: You may want to send another request to create a new user in the database
      }

    } else {
      console.error("Authentication failed:", data.error);
      showAuthenticationFailedMessage();
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    showAuthenticationFailedMessage();
  }
}

// Function to show the "AUTHENTICATION FAILED" message in the middle of the screen
function showAuthenticationFailedMessage() {
  const messageElement = document.createElement('div');
  messageElement.innerText = "AUTHENTICATION FAILED";
  messageElement.style.position = 'fixed';
  messageElement.style.top = '50%';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translate(-50%, -50%)';
  messageElement.style.fontSize = '50px';
  messageElement.style.color = 'red';
  messageElement.style.fontWeight = 'bold';
  messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  messageElement.style.padding = '20px';
  messageElement.style.borderRadius = '10px';
  messageElement.style.zIndex = '1000';

  document.body.appendChild(messageElement);

  // Automatically remove the message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}



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

// Handle the update of user resources on the server
async function updateResourcesOnServer(resource) {
  if (!userId) {
    console.error('User ID is not set!');
    return;
  }

  try {
    const response = await fetch('/api/updateResources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resourceType: resource, id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update resources on the server');
    }

    const data = await response.json();
    console.log("Server updated successfully:", data);
  } catch (error) {
    console.error("Error updating resources on server:", error);
  }
}

// Finish mining process: add the resource and update UI and backend
function finishMining() {
  const popup = document.getElementById("popup-resource");
  const resourceType = generateResource();

  resources[resourceType].count++;
  updateStats();
  updateInventory();

  // Update the resource on the server
  console.log("Calling updateResourcesOnServer with resource:", resourceType);
  updateResourcesOnServer(resourceType);

  // Show mining popup with the updated resource
  popup.innerText = `+1 ${resourceType.toUpperCase()}`;
  popup.className = `active ${resources[resourceType].rarity}`;
  setTimeout(() => (popup.className = ""), 1000);
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

