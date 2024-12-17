// Use dynamic URL for Vercel deployment
const backendUrl = window.location.origin;

// Fetch and pass Telegram data to backend
async function authenticateUser(authData) {
    const response = await fetch(`${backendUrl}/api/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
    });

    const result = await response.json();
    if (result.success) {
        console.log("User authenticated successfully!", result.user);
        fetchUserResources(result.user[0].id);
    } else {
        console.error("Authentication error:", result.error);
    }
}


// Function to fetch user resources
async function fetchUserResources(userId) {
    const response = await fetch(`${backendUrl}/api/resources/${userId}`);
    const resources = await response.json();
    console.log("User resources:", resources);
    updateStats(resources);
}

// Mining function with API integration
async function finishMining(userId) {
    const resourceType = generateResource(); 
    const amount = 1; 

    const response = await fetch(`${backendUrl}/api/mine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, resource_type: resourceType, amount }),
    });

    const result = await response.json();
    if (result.success) {
        console.log(`${resourceType} successfully updated!`);
        fetchUserResources(userId);
    } else {
        console.error("Error updating resources:", result.error);
    }
}

// Utility function to generate a resource
function generateResource() {
    const random = Math.random() * 100;
    if (random < 5) return "gold"; 
    if (random < 35) return "silver"; 
    return "copper"; 
}

// Other utility functions remain unchanged
// (updateStats, updateEnergy, updateInventory, etc.)
