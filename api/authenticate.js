async function authenticateUser() {
  try {
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData: telegramInitData })
    });

    const data = await response.json();

    if (data.success) {
      const existingUser = data.user;

      if (existingUser) {
        userId = existingUser.id;
        console.log("Authenticated user:", userId);

        // Save the user ID in localStorage
        localStorage.setItem('userId', userId); // Store the userId in localStorage
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

// Function to show "AUTHENTICATION FAILED" message on the page
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

  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}
