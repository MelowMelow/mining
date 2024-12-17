// Import necessary libraries
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request at /api/authenticate", req.query);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const tgWebAppDataString = req.query.tgWebAppData;
        const signature = req.query.hash; // The hash from Telegram to verify integrity
        const tgWebAppData = JSON.parse(decodeURIComponent(tgWebAppDataString));
        
        console.log("Parsed User Data from URL:", tgWebAppData);

        // Validate the signature using the Telegram Bot Token
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        const checkString = Object.keys(tgWebAppData.user)
            .sort()
            .map((key) => `${key}=${tgWebAppData.user[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
        
        console.log("Calculated Hash:", calculatedHash);
        
        if (calculatedHash !== signature) {
            console.log("Hash mismatch");
            return res.status(400).json({ error: 'Invalid hash' });
        }

        const authData = tgWebAppData.user;
        const { id, username, first_name, last_name, photo_url, language_code } = authData;

        // Check if the user exists in the database
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', id)
            .single();

        if (data) {
            console.log("User already exists:", data);
            return res.status(200).json({ success: true, user: data });
        }

        // If not found, insert the user into the database
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    telegram_id: id,
                    username: username || null,
                    first_name: first_name || null,
                    last_name: last_name || null,
                    photo_url: photo_url || null,
                    language_code: language_code || null
                }
            ]);
        
        if (insertError) {
            console.error('Error inserting new user:', insertError.message);
            return res.status(500).json({ error: insertError.message });
        }

        console.log("New user registered:", newUser);
        
        return res.status(200).json({ success: true, user: newUser });
        
    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
