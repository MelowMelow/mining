import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Extract the Telegram ID, resource type, and quantity from the request body
        const { telegram_id, resourceType, quantity } = req.body;

        // Ensure a Telegram ID is provided
        if (!telegram_id) {
            return res.status(400).json({ success: false, message: 'Telegram ID is required' });
        }

        try {
            // Fetch user from the 'users' table using the Telegram ID
            const { data: existingUser, error: existError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegram_id)
                .single();

            if (existError || !existingUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const userId = existingUser.id;  // Use the user ID fetched from the database

            // Update or insert the user's resource record in the database
            const { data, error } = await supabase
                .from('resources')
                .upsert([
                    { user_id: userId, [resourceType]: quantity }
                ], 
                { onConflict: ['user_id'] });

            if (error) {
                return res.status(500).json({ success: false, message: error.message });
            }

            // Respond with the updated resource data
            res.status(200).json({ success: true, resources: data[0] });

        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating resources.' });
        }
    } else {
        // Handle non-POST methods
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
