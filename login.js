async function handleAuthentication() {
  try {
    console.log("Authentication started...");

    // Optional data to send in the request body (e.g., user credentials)
    const requestData = {
      // Add any data you need to send here, such as a username or password
    };

    // Send the authentication request
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),  // send any necessary data here
    });

    console.log("Received response from server:", response);

    // Check if response is successful
    if (!response.ok) {
      console.error(`Error: Response status ${response.status} - Response not OK`, response);
      return; // Exit if the response status is not okay
    }

    const data = await response.json();
    console.log("Response data:", data);

    // Handle success response
    if (data.success) {
      const telegramId = data.telegram_id;  // Extract telegram_id
      console.log("Authentication successful, Telegram ID:", telegramId);

      // Save the telegramId in localStorage
      localStorage.setItem('telegramId', telegramId);
      console.log('Telegram ID saved to localStorage:', telegramId);

      // Optionally you can perform an action after saving the ID
      // e.g., update the UI or notify the user
    } else {
      console.error("Authentication failed:", data);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
}
