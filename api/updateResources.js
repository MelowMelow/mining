import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { resourceType, quantity } = req.body;
        const userId = req.user.id; // assuming you have authentication in place

        try {
            // Update or insert the user's resource record in the database
            const { data, error } = await supabase
                .from('resources')
                .upsert([{ user_id: userId, [resourceType]: quantity }], { onConflict: ['user_id'] });

            if (error) {
                return res.status(500).json({ success: false, message: error.message });
            }

            res.status(200).json({ success: true, resources: data[0] });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating resources.' });
        }
    } else {
        res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}
