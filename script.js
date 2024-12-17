// Attach event listeners to buttons
function attachGameEventListeners() {
  document.getElementById('mine-button').addEventListener('click', startMining);
  document.getElementById('inventory-button').addEventListener('click', openInventory);
  document.getElementById('close-inventory').addEventListener('click', closeInventory);

  console.log('Game event listeners attached.');
}

// Function to handle Start Mining button
function startMining() {
  const timerCountdown = document.getElementById('timer-countdown');
  const miningTimer = document.getElementById('mining-timer');

  console.log('Mining started...');

  let timeLeft = 10;
  timerCountdown.textContent = timeLeft;
  miningTimer.classList.remove('hidden');

  const timer = setInterval(() => {
    timeLeft--;
    timerCountdown.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      miningTimer.classList.add('hidden');
      console.log('Mining complete! Resources gained.');
    }
  }, 1000);
}

// Function to open Inventory
function openInventory() {
  document.getElementById('inventory-frame').classList.remove('hidden');
  console.log('Inventory opened.');
}

// Function to close Inventory
function closeInventory() {
  document.getElementById('inventory-frame').classList.add('hidden');
  console.log('Inventory closed.');
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
  attachGameEventListeners();
  console.log("Game initialized.");
});
