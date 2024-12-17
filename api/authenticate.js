const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Deconstruct incoming request body
  const { hash, ...authData } = req.body;

  console.log("Incoming data:", authData);

  // Ensure required fields are present
  if (!authData.id || !authData.username) {
    console.log("Missing fields:", authData);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Telegram Bot Token for verification
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // Prepare check string to verify data
  const checkString = Object.keys(authData)
    .sort()
    .map((key) => `${key}=${authData[key]}`)
    .join("\n");

  // Hash validation
  const secretKey = crypto.createHmac("sha256", TELEGRAM_BOT_TOKEN).digest();
  const validationHash = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex');

  // Verify the hash matches the one sent by Telegram
  console.log('Validation hash:', validationHash, 'Received hash:', hash);
  if (validationHash !== hash) {
    console.log("Hash mismatch. Invalid data.");
    return res.status(400).json({ error: 'Invalid hash. Data verification failed.' });
  }

  console.log('Hash verification successful!');

  // Data is valid; Proceed with storing or updating user information
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        [{
          telegram_id: authData.id,
          username: authData.username,
          first_name: authData.first_name || null,
          last_name: authData.last_name || null,
        }],
        { onConflict: ['telegram_id'] } // Ensures no duplicates based on telegram_id
      );

    if (error) {
      console.error('Database Error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    // Respond back successfully after registering the user
    console.log("User registered successfully:", data);
    return res.status(200).json({ success: true, user: data });
  } catch (error) {
    console.error('Error while processing:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
