import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resourceType } = req.body;

  if (!['gold', 'silver', 'copper'].includes(resourceType)) {
    return res.status(400).json({ error: 'Invalid resource type' });
  }

  try {
    // Assuming user is authenticated and their `user_id` is stored in session/cookies
    const userId = req.user.id; // Replace with your actual user identification mechanism

    // Update resources table
    const { data, error } = await supabase
      .from('resources')
      .update({ [resourceType]: supabase.raw(`${resourceType} + 1`) })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating resources:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error handling resource update:', error);
    return res.status(500).json({ error: error.message });
  }
}
