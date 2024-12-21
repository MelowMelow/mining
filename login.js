export async function handleAuthentication() {
  try {
    console.log("Authentication started...");

    // Check if localStorage already has the telegramId, otherwise proceed
    const telegramId = localStorage.getItem('telegramId');
    if (telegramId) {
      console.log(`Found saved Telegram ID: ${telegramId}`);
      return; // Skip if already authenticated
    }

    // Optional: Add data if required (e.g., Telegram init data)
    const initData = {};  // You can pass any required user data for authentication

    console.log('Sending request with initData:', initData); 

    // Send POST request to authenticate
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),  // Send the required data
    });

    console.log("Received response from server:", response);

    if (!response.ok) {
      const errorBody = await response.text(); // Retrieve error response
      console.error(`Error ${response.status}:`, errorBody);
      return; // Return in case of error
    }

    const data = await response.json();
    console.log("Authentication response data:", data);

    if (data.success) {
      const telegramId = data.telegram_id; // Extract telegram ID from response
      console.log("Authentication successful, Telegram ID:", telegramId);

      // Save the Telegram ID in localStorage for later use
      localStorage.setItem('telegramId', telegramId);
      console.log('Telegram ID saved to localStorage:', telegramId);

      // Perform any further action based on success, such as displaying UI elements
    } else {
      console.error("Authentication failed:", data.error);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
}
