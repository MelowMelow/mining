// login.js
export async function handleAuthentication() {
  try {
    // Check for existing authentication
    const existingTelegramId = localStorage.getItem('telegramId');
    if (existingTelegramId) {
      console.log('Already authenticated with ID:', existingTelegramId);
      return true;
    }

    // Check for Telegram WebApp
    if (!window.Telegram?.WebApp) {
      console.error('Telegram WebApp is not available');
      return false;
    }

    const tgWebApp = window.Telegram.WebApp;
    const initData = tgWebApp.initData;

    console.log('Init data available:', !!initData);
    
    if (!initData) {
      console.error('No init data available');
      return false;
    }

    console.log('Sending authentication request...');
    
    const response = await fetch('/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ initData })
    });

    console.log('Response status:', response.status);

    const text = await response.text();
    console.log('Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return false;
    }

    if (data.success && data.telegram_id) {
      localStorage.setItem('telegramId', data.telegram_id);
      console.log('Successfully authenticated with ID:', data.telegram_id);
      return true;
    } else {
      console.error('Authentication failed:', data.error || 'Unknown error');
      return false;
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}