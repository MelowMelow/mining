import { createClient } from "@supabase/supabase-js"; 
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received authentication request");
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { initData } = req.body;
        
        if (!initData) {
            return res.status(400).json({ error: 'No Telegram init data provided' });
        }

        // Parse the query string
        const params = new URLSearchParams(initData);
        const userData = Object.fromEntries(params.entries());

        // Validate signature
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (!TELEGRAM_BOT_TOKEN) {
            console.error('Telegram Bot Token is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Extract user data
        const user = JSON.parse(userData.user || '{}');
        const { id, username, first_name, last_name, photo_url, language_code } = user;

        if (!id) {
            return res.status(400).json({ error: 'Invalid user data' });
        }

        // Signature verification
        const dataCheckString = Object.entries(userData)
            .filter(([key]) => key !== 'hash')
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(TELEGRAM_BOT_TOKEN)
            .digest();

        const calculatedHash = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');

        if (calculatedHash !== userData.hash) {
            return res.status(403).json({ error: 'Invalid signature' });
        }

        // Check if user exists or create new
        const { data: existingUser, error: existError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', id)
            .single();

        if (existingUser) {
            return res.status(200).json({ 
                success: true, 
                user: [existingUser],
                isNewUser: false 
            });
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
            console.error('User registration error:', insertError);
            return res.status(500).json({ error: insertError.message });
        }

        // Set up initial stats in the resources table
        const { data: resourceSetup, error: resourceError } = await supabase
            .from('resources')
            .insert([
                {
                    user_id: newUser[0].id,
                    gold: 0,    // Default gold value
                    silver: 0,  // Default silver value
                    copper: 0   // Default copper value
                }
            ]);

        if (resourceError) {
            console.error('Resource setup error:', resourceError);
            return res.status(500).json({ error: resourceError.message });
        }

        return res.status(200).json({ 
            success: true, 
            user: newUser,
            isNewUser: true 
        });

    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
}

