import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const handler = async (req, res) => {
    console.log("Received authentication request");

    // Ensure only POST requests are allowed
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { initData } = req.body;

        // Ensure initData exists in the body
        if (!initData) {
            return res.status(400).json({ error: 'No Telegram init data provided' });
        }

        const params = new URLSearchParams(initData);
        const userData = Object.fromEntries(params.entries());

        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        if (!TELEGRAM_BOT_TOKEN) {
            console.error('Telegram Bot Token is not set');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const user = JSON.parse(userData.user || '{}');
        const { id, username, first_name, last_name, photo_url, language_code } = user;

        if (!id) {
            return res.status(400).json({ error: 'Invalid user data' });
        }

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

        // Check if the user exists in the database using Telegram ID
        const { data: existingUser, error: existError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', id)
            .single();

        if (existingUser) {
            console.log(`User with Telegram ID: ${id} found in the database.`);
            return res.status(200).json({
                success: true,
                user: existingUser,
                isNewUser: false
            });
        } else {
            console.log(`No user found with Telegram ID: ${id}. Registering new user.`);
        }

        // Insert a new user record if not found
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

        // Insert resources for the new user
        const { data: resourceSetup, error: resourceError } = await supabase
            .from('resources')
            .insert([{
				telegram_id: id,
                user_id: newUser[0].id,
                gold: 0,
                silver: 0,
                copper: 0
            }]);

        if (resourceError) {
            console.error('Resource setup error:', resourceError);
            return res.status(500).json({ error: resourceError.message });
        }

        console.log(`New user with Telegram ID: ${id} successfully registered.`);

        return res.status(200).json({
            success: true,
            user: newUser[0],
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

// Export the handler function to be used in serverless
export default handler;
