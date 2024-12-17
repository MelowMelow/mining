import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request to /api/authenticate");

    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { tgWebAppData } = req.body;
        
        if (!tgWebAppData) {
            return res.status(400).json({ error: 'No Telegram Web App data provided' });
        }

        // Parse the data
        const parsedData = JSON.parse(decodeURIComponent(tgWebAppData));
        console.log('Telegram user data:', parsedData);

        const { id, username, first_name, last_name, photo_url, language_code } = parsedData.user;

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', id)
            .single();

        if (existingUser) {
            return res.status(200).json({ success: true, user: [existingUser] });
        }

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{
                telegram_id: id,
                username: username || null,
                first_name: first_name || null,
                last_name: last_name || null,
                photo_url: photo_url || null,
                language_code: language_code || null
            }])
            .select();

        if (insertError) {
            console.error('Error inserting user:', insertError);
            return res.status(500).json({ error: insertError.message });
        }

        return res.status(200).json({ success: true, user: newUser });

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ error: error.message });
    }
}