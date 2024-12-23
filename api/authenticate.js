import { createClient } from "@supabase/supabase-js";
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const handler = async (req, res) => {
    console.log("Received authentication request");

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { initData } = req.body;

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

        // Check if the user exists and get their resources in a single query
        const { data: existingUser, error: existError } = await supabase
            .from('users')
            .select(`
                *,
                resources:resources(
                    gold,
                    silver,
                    iron
                )
            `)
            .eq('telegram_id', id)
            .single();

        if (existingUser) {
            console.log(`User with Telegram ID: ${id} found in the database with resources:`, existingUser.resources);
            return res.status(200).json({
                success: true,
                user: existingUser,
                telegram_id: id,
                resources: existingUser.resources[0] || { gold: 0, silver: 0, iron: 0 },
                isNewUser: false
            });
        }

        // If user doesn't exist, create new user and resources
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
                user_id: newUser[0].id,
                gold: 0,
                silver: 0,
                iron: 0
            }])
            .select();

        if (resourceError) {
            console.error('Resource setup error:', resourceError);
            return res.status(500).json({ error: resourceError.message });
        }

        console.log(`New user with Telegram ID: ${id} successfully registered.`);

        return res.status(200).json({
            success: true,
            user: newUser[0],
            telegram_id: id,
            resources: resourceSetup[0],
            isNewUser: true
        });
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ 
            error: error.message,
            stack: error.stack 
        });
    }
	// Add this to your authentication success handler
	if (data.success && data.telegram_id) {
		localStorage.setItem('telegramId', data.telegram_id.toString());
		localStorage.setItem('userData', JSON.stringify(data.user));
		
		// Load saved resources if they exist
		if (data.resources) {
			resources = {
				gold: { count: data.resources.gold || 0, rarity: "rare" },
				silver: { count: data.resources.silver || 0, rarity: "uncommon" },
				iron: { count: data.resources.iron || 0, rarity: "common" }
			};
			
			// Update UI with loaded resources
			updateStats();
			updateInventory();
		}
		
		console.log('Authentication successful, resources loaded:', resources);
}

export default handler;