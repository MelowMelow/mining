import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Supabase Configuration
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    console.log("Received request at /api/authenticate", req.body);

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extract the tgWebAppData (user details) and the signature and validate the signature
        const tgWebAppDataString = req.query.tgWebAppData;
        const hash = req.query.hash;

        const tgWebAppData = JSON.parse(decodeURIComponent(tgWebAppDataString));
        console.log("Parsed User Data from URL:", tgWebAppData);

        // Step 1: Validate incoming data using the provided hash
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const authData = tgWebAppData.user;
        
        const checkString = Object.keys(authData)
            .sort()
            .map((key) => `${key}=${authData[key]}`)
            .join('\n');

        // Create a validation hash from the secret key
        const secretKey = crypto.createHash('sha256').update(TELEGRAM_BOT_TOKEN).digest();
        const validationHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

        console.log("Validation hash:", validationHash, "Received hash:", hash);  // Log hashes for comparison
        
        if (validationHash !== hash) {
            return res.status(400).json({ error: 'Invalid hash. Data verification failed.' });
        }

        // Step 2: Check if the user exists in the database
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', authData.id)
            .single(); // Fetch one user
        
        if (data) {
            console.log("User already exists:", data);
            // If the user exists, generate a session token (JWT)
            const token = jwt.sign({ telegram_id: authData.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            return res.status(200).json({ success: true, user: data, token });
        }

        // Step 3: Register the user in the database if they do not exist
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    telegram_id: authData.id,
                    username: authData.username || null,
                    first_name: authData.first_name || null,
                    last_name: authData.last_name || null,
                    photo_url: authData.photo_url || null, // Optional field
                    language_code: authData.language_code || null, // Optional field
                },
            ]);
        
        if (insertError) {
            console.log('Error inserting new user:', insertError.message);
            return res.status(500).json({ error: insertError.message });
        }

        console.log('New user registered:', newUser);
        
        // Step 4: Create a session token for the new user and return the data
        const token = jwt.sign({ telegram_id: authData.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        return res.status(200).json({ success: true, user: newUser, token });
    
    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}
