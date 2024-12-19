import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resourceType, id } = req.body; // `id` from the users table

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!['gold', 'silver', 'copper'].includes(resourceType)) {
    return res.status(400).json({ error: 'Invalid resource type' });
  }

  console.log("Received request to update resource:", { id, resourceType });

  try {
    // Attempt to update the database using `user_id` matching `id`
    const { data, error } = await supabase
      .from('resources')
      .update({ [resourceType]: supabase.raw(`${resourceType} + 1`) })
      .eq('user_id', id);

    console.log("Update operation result:", { data, error });

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
