// Use dynamic URL for Vercel deployment
const backendUrl = window.location.origin;



// Fetch and pass Telegram data to backend
async function authenticateUser(authData) {
    try {
        console.log('Sending auth data to backend:', authData); // Log data sent to the backend
        const response = await fetch(`${backendUrl}/api/authenticate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authData),
        });

        const result = await response.json();
        console.log('Authentication response:', result); // Log the server's response

        if (result.success) {
            console.log("User authenticated successfully!", result.user);
            fetchUserResources(result.user[0].id);
        } else {
            console.error("Authentication error:", result.error);
        }
    } catch (error) {
        console.error('Error during authentication request:', error);
    }
}

// Function to fetch user resources
async function fetchUserResources(userId) {
    try {
        console.log('Fetching user resources for ID:', userId); // Log the user ID used to fetch resources
        const response = await fetch(`${backendUrl}/api/resources/${userId}`);
        const resources = await response.json();
        console.log('User resources:', resources);
        updateStats(resources);
    } catch (error) {
        console.error('Error fetching user resources:', error);
    }
}

// Mining function with API integration
async function finishMining(userId) {
    const resourceType = generateResource(); 
    const amount = 1; 

    try {
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
    } catch (error) {
        console.error("Error finishing mining:", error);
    }
}

// Utility function to generate a resource
function generateResource() {
    const random = Math.random() * 100;
    if (random < 5) return "gold"; 
    if (random < 35) return "silver"; 
    return "copper"; 
}

// Additional utility functions for updating stats, inventory, etc.
