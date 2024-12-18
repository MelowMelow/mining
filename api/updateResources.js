import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { telegram_id, resourceType, quantity } = req.body;

    if (!telegram_id || !resourceType || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters',
      });
    }

    try {
      // Find user by Telegram ID
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', telegram_id)
        .single();

      if (userError) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching user',
        });
      }

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const userId = user.id; // Use the user's database ID

      // Update the resources for this user
      const { data, error } = await supabase
        .from('resources')
        .upsert(
          [
            {
              user_id: userId,
              [resourceType]: quantity,
            },
          ],
          { onConflict: ['user_id'] }
        );

      if (error) {
        return res.status(500).json({
          success: false,
          message: 'Error updating resources',
        });
      }

      // Respond back with updated resources data
      res.status(200).json({
        success: true,
        resources: data[0],  // Returns the resource data for the user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error while updating resources',
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }
}
