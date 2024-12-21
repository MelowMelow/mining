async function handleAuthentication() {
  try {
    console.log("Authentication started...");

    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ /* optional data to send */ }),
    });

    console.log("Received response from server:", response);

    // Check if response is successful
    if (!response.ok) {
      console.error('Response not OK:', response);
      return;
    }

    const data = await response.json();
    console.log("Response data:", data);

    if (data.success) {
      const telegramId = data.telegram_id;
      console.log("Authentication successful, Telegram ID:", telegramId);

      // Save the telegramId in localStorage
      localStorage.setItem('telegramId', telegramId);
      console.log('Telegram ID saved to localStorage:', telegramId);

      // Additional actions if needed after successful authentication
      console.log('User authenticated successfully!');
    } else {
      console.error("Authentication failed:", data);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
  }
}
