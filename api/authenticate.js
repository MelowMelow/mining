import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request to /api/authenticate");
    console.log("Full request body:", JSON.stringify(req.body, null, 2));
    console.log("Environment variables:", {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extract Telegram Web App data from request body
        const { tgWebAppData } = req.body;
        
        if (!tgWebAppData) {
            return res.status(400).json({ error: 'No Telegram Web App data provided' });
        }

        // Directly parse the data
        const parsedData = JSON.parse(decodeURIComponent(tgWebAppData));
        console.log('Telegram user data:', JSON.stringify(parsedData, null, 2));

        // Validate signature 
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (!TELEGRAM_BOT_TOKEN) {
            console.error('Telegram Bot Token is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const checkString = Object.keys(parsedData.user)
            .sort()
            .map((key) => `${key}=${parsedData.user[key]}`)
            .join('\n');

        const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

        const { id, username, first_name, last_name, photo_url, language_code } = parsedData.user;

        // Check if the user already exists in the database
        const { data: existingUser, error: existError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', id)
            .single();

        if (existingUser) {
            console.log("User already exists:", existingUser);
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
            console.error('Error inserting new user:', insertError);
            return res.status(500).json({ error: insertError.message });
        }

        console.log("User registered successfully:", newUser);
        return res.status(200).json({ success: true, user: newUser });

    } catch (error) {
        console.error("Error during verification or registration:", error.message);
        return res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
}