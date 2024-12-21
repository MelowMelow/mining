// Example function to process the successful authentication response
async function handleAuthentication() {
  try {
    const response = await fetch('/api/authenticate'); // Replace with your endpoint
    const data = await response.json();

    if (data.success) {
      const telegramId = data.telegram_id;
      console.log('Telegram ID:', telegramId);

      // Save it in localStorage for later use
      localStorage.setItem('telegramId', telegramId);

      // Optionally update the UI or perform further actions
      console.log('User authenticated successfully!');
    } else {
      console.error('Authentication failed:', data);
    }
  } catch (error) {
    console.error('Error during authentication:', error);
  }
}
