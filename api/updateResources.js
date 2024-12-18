import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Extract the resource type and quantity from the request body
        const { resourceType, quantity } = req.body;

        // Extract the token from the Authorization header (Bearer token)
        const token = req.headers.authorization?.split(' ')[1];  // Token is expected like 'Bearer <TOKEN>'

        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        // Set the Supabase auth token for the client
        supabase.auth.setAuth(token);

        // Get the current authenticated user
        const user = supabase.auth.user();

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or missing token' });
        }

        const userId = user.id;  // Get the user's ID from the token

        try {
            // Update or insert the user's resource record in the database
            const { data, error } = await supabase
                .from('resources') // Using the 'resources' table
                .upsert([{ user_id: userId, [resourceType]: quantity }], { onConflict: ['user_id'] });

            if (error) {
                return res.status(500).json({ success: false, message: error.message });
            }

            // Respond with the updated resource data
            res.status(200).json({ success: true, resources: data[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating resources.' });
        }
    } else {
        // Handle method not allowed for non-POST requests
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
